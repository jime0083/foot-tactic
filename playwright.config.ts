import { defineConfig, devices } from '@playwright/test';

/** JavaへのPATH(Firebase Emulator実行に必要) */
const JAVA_PATH = '/opt/homebrew/opt/openjdk/bin';

/**
 * E2Eテスト設定。
 * Firebase Emulator(Auth+Firestore)と、Emulator接続した開発サーバーを
 * webServerとして起動し、実ブラウザで主要フローを検証する。
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  expect: { timeout: 10000 },
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: `PATH="${JAVA_PATH}:$PATH" firebase emulators:start --only auth,firestore --project foot-tactic`,
      port: 9099,
      reuseExistingServer: !process.env.CI,
      timeout: 90000,
    },
    {
      command: 'VITE_USE_EMULATOR=true npm run dev -- --port 5173 --strictPort',
      port: 5173,
      reuseExistingServer: !process.env.CI,
      timeout: 90000,
    },
  ],
});
