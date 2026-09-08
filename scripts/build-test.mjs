import { spawnSync } from "node:child_process";

// Use a demo project and empty analytics IDs; never build the test server with
// production credentials inherited from the developer's shell or .env.local.
const result = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build"], {
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_PUBLIC_FIREBASE_API_KEY: "test-only-api-key",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "demo-seasaba-tests.firebaseapp.com",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo-seasaba-tests",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "demo-seasaba-tests.appspot.com",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123456789",
    NEXT_PUBLIC_FIREBASE_APP_ID: "1:123456789:web:test",
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: "",
    NEXT_PUBLIC_GTM_ID: "",
    NEXT_PUBLIC_COOKIEBOT_CBID: "",
    NEXT_TELEMETRY_DISABLED: "1",
  },
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
