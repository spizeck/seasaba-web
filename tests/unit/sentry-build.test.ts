import { afterEach, describe, expect, it, vi } from "vitest";
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { NextConfig } from "next";
import {
  assertSentryProductionBuildConfig,
  resolveSentryReleaseName,
  sentryBuildOptions,
  sentryProductionBuildEnabled,
} from "@/lib/sentry-build";

/**
 * #130: release identity + production-only source-map upload policy.
 *
 * The build-time gate is deliberately separate from the runtime event gate
 * (lib/sentry.ts): VERCEL_ENV === "production" during `next build` is the
 * only context allowed to create Sentry releases or upload source maps.
 */

const PROD_ENV = {
  VERCEL_ENV: "production",
  SENTRY_AUTH_TOKEN: "test-token",
  SENTRY_ORG: "test-org",
  VERCEL_GIT_COMMIT_SHA: "abc123def456",
};

describe("sentryProductionBuildEnabled", () => {
  it("is true only inside a Vercel Production build", () => {
    expect(sentryProductionBuildEnabled({ VERCEL_ENV: "production" })).toBe(true);
  });

  it.each([
    ["preview", { VERCEL_ENV: "preview" }],
    ["development", { VERCEL_ENV: "development" }],
    ["unset (local/test/CI)", {}],
    ["empty", { VERCEL_ENV: "" }],
  ])("is false when VERCEL_ENV is %s", (_label, env) => {
    expect(sentryProductionBuildEnabled(env)).toBe(false);
  });
});

describe("resolveSentryReleaseName", () => {
  it("prefers an explicit SENTRY_RELEASE override", () => {
    expect(
      resolveSentryReleaseName({
        SENTRY_RELEASE: "explicit-release",
        VERCEL_GIT_COMMIT_SHA: "vercel-sha",
      })
    ).toBe("explicit-release");
  });

  it("uses the Vercel git commit SHA — the identity production events already carry", () => {
    expect(
      resolveSentryReleaseName({ VERCEL_GIT_COMMIT_SHA: "d26e83a760ab2fd6c503a8e10da2333b46649f65" })
    ).toBe("d26e83a760ab2fd6c503a8e10da2333b46649f65");
    expect(
      resolveSentryReleaseName({ VERCEL_GITHUB_COMMIT_SHA: "gh-sha" })
    ).toBe("gh-sha");
  });

  it("falls back to `git rev-parse HEAD`, matching the SDK's own fallback", () => {
    expect(resolveSentryReleaseName({}, () => "git-head-sha")).toBe("git-head-sha");
  });

  it("is undefined when no env identity and git fail", () => {
    expect(resolveSentryReleaseName({}, () => undefined)).toBeUndefined();
  });
});

describe("assertSentryProductionBuildConfig", () => {
  it("passes with token, org and a resolvable release", () => {
    expect(() => assertSentryProductionBuildConfig(PROD_ENV)).not.toThrow();
  });

  it("fails loudly when the auth token is missing", () => {
    expect(() =>
      assertSentryProductionBuildConfig({
        ...PROD_ENV,
        SENTRY_AUTH_TOKEN: "",
      })
    ).toThrow(/SENTRY_AUTH_TOKEN/);
  });

  it("fails loudly when the org slug is missing for a classic token", () => {
    expect(() =>
      assertSentryProductionBuildConfig({ ...PROD_ENV, SENTRY_ORG: "" })
    ).toThrow(/SENTRY_ORG/);
  });

  it("does not require SENTRY_ORG for org-scoped sntrys_ tokens", () => {
    expect(() =>
      assertSentryProductionBuildConfig({
        ...PROD_ENV,
        SENTRY_ORG: "",
        SENTRY_AUTH_TOKEN: "sntrys_abc",
      })
    ).not.toThrow();
  });

  it("fails loudly when no release identity can be resolved", () => {
    expect(() =>
      assertSentryProductionBuildConfig(
        { SENTRY_AUTH_TOKEN: "t", SENTRY_ORG: "o" },
        () => undefined
      )
    ).toThrow(/release identity/);
  });

  it("accepts the git HEAD fallback when no env identity exists", () => {
    expect(() =>
      assertSentryProductionBuildConfig(
        { SENTRY_AUTH_TOKEN: "t", SENTRY_ORG: "o" },
        () => "git-head-sha"
      )
    ).not.toThrow();
  });
});

describe("sentryBuildOptions", () => {
  it("enables release + source maps with delete-after-upload on production", () => {
    const opts = sentryBuildOptions(PROD_ENV);
    expect(opts.project).toBe("sea-saba-web");
    expect(opts.telemetry).toBe(false);
    expect(opts.release?.create).toBe(true);
    expect(opts.release?.finalize).toBe(true);
    expect(opts.sourcemaps?.disable).not.toBe(true);
    expect(opts.sourcemaps?.deleteSourcemapsAfterUpload).toBe(true);
  });

  it.each([
    ["preview", { VERCEL_ENV: "preview" }],
    ["development", { VERCEL_ENV: "development" }],
    ["local/test (unset)", {}],
  ])("disables release creation and all source-map work on %s", (_l, env) => {
    const opts = sentryBuildOptions(env);
    expect(opts.release?.create).toBe(false);
    expect(opts.release?.finalize).toBe(false);
    expect(opts.sourcemaps?.disable).toBe(true);
  });

  it("throws before any upload machinery runs on a misconfigured production build", () => {
    expect(() => sentryBuildOptions({ VERCEL_ENV: "production" }, () => "sha")).toThrow(
      /SENTRY_AUTH_TOKEN/
    );
  });

  it("does not throw on preview/local even with no token configured", () => {
    expect(() => sentryBuildOptions({ VERCEL_ENV: "preview" })).not.toThrow();
    expect(() => sentryBuildOptions({})).not.toThrow();
  });

  it("fails the build on any release/upload error instead of silently continuing", () => {
    const opts = sentryBuildOptions(PROD_ENV);
    const err = new Error("upload exploded");
    expect(() => opts.errorHandler!(err)).toThrow(err);
  });
});

/**
 * End-to-end through the real `withSentryConfig` wrapper: proves the options
 * actually produce the Next.js config surface the upload path depends on.
 * TURBOPACK is stubbed because Next 16 sets TURBOPACK=auto during `next
 * build`, which is how the SDK detects the bundler at config-load time.
 */
describe("withSentryConfig integration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function loadConfig(env: Record<string, string>): Promise<NextConfig> {
    for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
    // Neutralize every release-identity var the SDK checks before the Vercel
    // ones, so VERCEL_GIT_COMMIT_SHA is what wins (GitHub Actions sets
    // GITHUB_SHA / CI_COMMIT_SHA).
    for (const k of [
      "SENTRY_RELEASE",
      "GITHUB_SHA",
      "CI_MERGE_REQUEST_SOURCE_BRANCH_SHA",
      "CI_BUILD_REF",
      "CI_COMMIT_SHA",
      "BITBUCKET_COMMIT",
    ]) {
      vi.stubEnv(k, "");
    }
    vi.resetModules();
    return (await import("@/next.config")).default as NextConfig;
  }

  it("production: generates maps, injects the Git-SHA release and wires the upload hook", async () => {
    const sha = "d26e83a760ab2fd6c503a8e10da2333b46649f65";
    const config = await loadConfig({
      TURBOPACK: "auto",
      VERCEL_ENV: "production",
      SENTRY_AUTH_TOKEN: "test-token",
      SENTRY_ORG: "test-org",
      VERCEL_GIT_COMMIT_SHA: sha,
    });
    // Client maps get generated…
    expect(config.productionBrowserSourceMaps).toBe(true);
    // …the deployed commit SHA becomes the release in both bundles…
    expect(config.env?._sentryRelease).toBe(sha);
    // …Turbopack native debug IDs are on…
    expect(config.turbopack?.debugIds).toBe(true);
    // …and the post-compile hook that creates the release + uploads maps is wired.
    expect(typeof config.compiler?.runAfterProductionCompile).toBe("function");
  });

  it("preview: generates nothing, injects no release, creates no release", async () => {
    const config = await loadConfig({
      TURBOPACK: "auto",
      VERCEL_ENV: "preview",
      SENTRY_AUTH_TOKEN: "test-token",
      SENTRY_ORG: "test-org",
      VERCEL_GIT_COMMIT_SHA: "abc123",
    });
    expect(config.productionBrowserSourceMaps).toBeFalsy();
    expect(config.env?._sentryRelease).toBeUndefined();
    expect(config.turbopack?.debugIds).toBeFalsy();
  });

  it("local/test: identically inert", async () => {
    const config = await loadConfig({ TURBOPACK: "auto" });
    expect(config.productionBrowserSourceMaps).toBeFalsy();
    expect(config.env?._sentryRelease).toBeUndefined();
    expect(config.turbopack?.debugIds).toBeFalsy();
  });

  it("production without an auth token fails config eval before building", async () => {
    await expect(
      loadConfig({
        TURBOPACK: "auto",
        VERCEL_ENV: "production",
        SENTRY_AUTH_TOKEN: "",
        SENTRY_ORG: "",
        VERCEL_GIT_COMMIT_SHA: "abc123",
      })
    ).rejects.toThrow(/SENTRY_AUTH_TOKEN/);
  });
});

describe("auth-token secrecy", () => {
  // Files whose SENTRY_AUTH_TOKEN mention is legitimate: the build-time
  // wiring (next.config.ts), the policy module, the test-build env scrubber,
  // this test, the env template and the docs.
  const TOKEN_ALLOWLIST = new Set([
    "next.config.ts",
    "lib/sentry-build.ts",
    "scripts/build-test.mjs",
    "tests/unit/sentry-build.test.ts",
    ".env.example",
    "docs/SENTRY.md",
  ]);

  function trackedFiles(): string[] {
    return execSync("git ls-files", { encoding: "utf8" })
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  }

  it("the public env-var form of the token name appears in no tracked file", () => {
    // Assembled so this file does not contain the forbidden name itself.
    const publicTokenName = "NEXT_PUBLIC_" + "SENTRY_AUTH_TOKEN";
    for (const file of trackedFiles()) {
      const text = readFileSync(join(process.cwd(), file), "utf8");
      expect(text, file).not.toContain(publicTokenName);
    }
  });

  it("the raw token name only appears in build-time/tooling files", () => {
    for (const file of trackedFiles()) {
      if (TOKEN_ALLOWLIST.has(file)) continue;
      const text = readFileSync(join(process.cwd(), file), "utf8");
      expect(text, file).not.toMatch(/\bSENTRY_AUTH_TOKEN\b/);
    }
  });

  it("browser-shipped init code never touches the token", () => {
    for (const file of ["instrumentation-client.ts", "lib/sentry.ts"]) {
      const text = readFileSync(join(process.cwd(), file), "utf8");
      expect(text, file).not.toContain("SENTRY_AUTH_TOKEN");
    }
  });
});

describe("test-build env scrubbing", () => {
  it("build-test.mjs forces the Sentry build path off even under polluted shells", () => {
    const text = readFileSync(
      join(process.cwd(), "scripts/build-test.mjs"),
      "utf8"
    );
    expect(text).toContain('VERCEL_ENV: ""');
    expect(text).toContain('SENTRY_AUTH_TOKEN: ""');
  });
});

describe("Turbopack patch from #162 remains applied", () => {
  const marker = 'script[src*="/_next/"]';

  it("patch-package still runs on install and the patch file exists", () => {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));
    expect(pkg.scripts.postinstall).toContain("patch-package");
    expect(existsSync(join(process.cwd(), "patches/next+16.3.5.patch"))).toBe(true);
  });

  it("the installed next build carries the document.currentScript fallback", () => {
    for (const file of [
      "node_modules/next/dist/client/asset-prefix.js",
      "node_modules/next/dist/esm/client/asset-prefix.js",
    ]) {
      const text = readFileSync(join(process.cwd(), file), "utf8");
      expect(text, file).toContain(marker);
    }
  });
});
