import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
      // The server-only marker package throws outside RSC builds; stub it so
      // server modules are unit-testable under vitest.
      "server-only": fileURLToPath(
        new URL("./tests/stubs/server-only.ts", import.meta.url)
      ),
    },
  },
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.{ts,tsx}"],
    setupFiles: ["./tests/setup.ts"],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "json-summary"],
      include: ["lib/analytics.ts", "lib/metadata.ts", "lib/firestore/dive-log.ts", "lib/dive-log-export.ts", "lib/respond-io.ts", "data/operations.ts", "components/contact-form.tsx", "components/booking-widget.tsx", "components/dive-log-client.tsx", "components/respond-io-widget.tsx", "components/scroll-position-keeper.tsx"],
      thresholds: { statements: 85, lines: 85, functions: 80, branches: 75 },
    },
  },
});
