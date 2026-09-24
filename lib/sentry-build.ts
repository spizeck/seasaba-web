import { execSync } from "node:child_process";
import type { SentryBuildOptions } from "@sentry/nextjs";

/**
 * Build-time Sentry release + source-map policy (#130).
 *
 * This module is imported ONLY by next.config.ts (and unit tests) — it is
 * Node-only build tooling, never bundled. The runtime event gate stays in
 * lib/sentry.ts; this file decides whether the *build* produces and uploads
 * source maps and creates a Sentry release.
 *
 * Release identity is NOT configured here on purpose: `withSentryConfig`
 * resolves the release name itself via SENTRY_RELEASE → CI commit env vars
 * (on Vercel: VERCEL_GIT_COMMIT_SHA) → `git rev-parse HEAD`, then injects it
 * into both bundles as `_sentryRelease`. That is the mechanism that already
 * tagged #129 production events with the deploy SHA, so the runtime release,
 * the uploaded source maps and the Git commit all stay the same value.
 */

type EnvLike = Record<string, string | undefined>;

/**
 * Source-map generation+upload and release creation run ONLY inside real
 * Vercel Production builds. VERCEL_ENV is set by Vercel during the build
 * step ("production" | "preview" | "development") and is absent everywhere
 * else, so Preview deploys, local builds and test/CI builds all fail closed
 * — no uploads, and no useless Sentry releases per PR.
 */
export function sentryProductionBuildEnabled(env: EnvLike = process.env): boolean {
  return env.VERCEL_ENV === "production";
}

function gitRevParseHead(): string | undefined {
  try {
    return execSync("git rev-parse HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return undefined;
  }
}

/**
 * Mirror of the subset of the SDK's release auto-detection that can ever
 * resolve in this project's builds: SENTRY_RELEASE, the Vercel git-commit
 * variables, then `git rev-parse HEAD` (the same terminal fallback
 * `withSentryConfig` uses). Used only to prove a production build WILL have
 * a release identity before the upload step runs — the actual value used is
 * still resolved by the SDK, so the two can never disagree.
 */
export function resolveSentryReleaseName(
  env: EnvLike = process.env,
  gitHead: () => string | undefined = gitRevParseHead
): string | undefined {
  return (
    env.SENTRY_RELEASE ||
    env.VERCEL_GIT_COMMIT_SHA ||
    env.VERCEL_GITHUB_COMMIT_SHA ||
    env.VERCEL_GITLAB_COMMIT_SHA ||
    env.VERCEL_BITBUCKET_COMMIT_SHA ||
    gitHead() ||
    undefined
  );
}

/**
 * Fail-fast prerequisites for a production build. Anything missing here
 * would otherwise surface as a silent skip inside the bundler plugin
 * (missing token/org only log warnings, and a missing release name orphans
 * the uploaded maps), leaving production deployed but unsymbolicated — the
 * exact failure #130 exists to prevent. A failed Vercel build keeps the
 * previous deployment live, so failing loudly is safe.
 */
export function assertSentryProductionBuildConfig(
  env: EnvLike = process.env,
  gitHead: () => string | undefined = gitRevParseHead
): void {
  const missing: string[] = [];
  const token = env.SENTRY_AUTH_TOKEN?.trim();
  if (!token) missing.push("SENTRY_AUTH_TOKEN");
  // Org tokens (sntrys_*) embed the org id; classic tokens need SENTRY_ORG.
  if (!env.SENTRY_ORG?.trim() && !token?.startsWith("sntrys_")) {
    missing.push("SENTRY_ORG");
  }
  if (!resolveSentryReleaseName(env, gitHead)) {
    missing.push(
      "release identity (VERCEL_GIT_COMMIT_SHA / SENTRY_RELEASE / git HEAD)"
    );
  }
  if (missing.length) {
    throw new Error(
      `Sentry production build misconfigured — missing: ${missing.join(", ")}. ` +
        "Source-map upload is mandatory on Vercel Production builds; set the " +
        "variable(s) in the Vercel Production environment and redeploy. See docs/SENTRY.md."
    );
  }
}

/**
 * The policy portion of the `withSentryConfig` options. `org`/`authToken`
 * are wired explicitly in next.config.ts so the env reads stay visible at
 * the config top level (and so check-env-vars can see them).
 *
 * On non-production builds everything is disabled: the SDK's Turbopack
 * runAfterProductionCompile hook still runs but release creation, debug-id
 * injection and upload all no-op, and browser source maps are not even
 * generated.
 *
 * `errorHandler` rethrows: by default the bundler plugin only *logs* upload/
 * release errors, which would silently ship an unsymbolicated production
 * deploy. Failing the build keeps the previous deployment live and makes the
 * problem impossible to miss. Deliberate tradeoff: a Sentry outage can block
 * a deploy until retry — it can never take the site down. See docs/SENTRY.md.
 */
export function sentryBuildOptions(
  env: EnvLike = process.env,
  gitHead: () => string | undefined = gitRevParseHead
): SentryBuildOptions {
  const enabled = sentryProductionBuildEnabled(env);
  if (enabled) assertSentryProductionBuildConfig(env, gitHead);

  return {
    project: "sea-saba-web",
    silent: !env.CI,
    telemetry: false,
    release: { create: enabled, finalize: enabled },
    sourcemaps: enabled
      ? // Upload then delete the public client maps and strip
        // sourceMappingURL comments so .map files are never served. Server
        // maps under .next/server stay in the deploy bundle — they are not
        // publicly reachable and feed runtime error reporting.
        { deleteSourcemapsAfterUpload: true }
      : { disable: true },
    errorHandler(err) {
      console.error("[sentry] release/source-map upload failed:", err);
      throw err;
    },
  };
}
