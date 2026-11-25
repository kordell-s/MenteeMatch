import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  use: { baseURL: "http://localhost:3100", viewport: { width: 1440, height: 900 } },
  webServer: {
    command: "npx next dev -p 3100",
    url: "http://localhost:3100/demo/ncba",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
