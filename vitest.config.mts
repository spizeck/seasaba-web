import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
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
      include: ["lib/analytics.ts", "lib/metadata.ts", "lib/firestore/dive-log.ts", "lib/dive-log-export.ts", "components/contact-form.tsx", "components/booking-widget.tsx", "components/dive-log-client.tsx"],
      thresholds: { statements: 85, lines: 85, functions: 80, branches: 75 },
    },
  },
});
