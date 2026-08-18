import { defineConfig } from '@playwright/test';
import { config } from './config';

process.env.NODE_ENV = config.nodeEnv;

export default defineConfig({
  testDir: 'tests',
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  globalSetup: require.resolve('./global-setup.ts'),

  timeout: 30_000,
  expect: { timeout: 5_000 },
  retries: 1,

  webServer: {
    command: 'cross-env VITE_COVERAGE=true vite --port 5173',
    port: 5173,
    reuseExistingServer: !config.ci,
    timeout: 120_000,
  },

  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html' }],
  ],

  use: {
    storageState: 'testing/auth.json',
    headless: config.ci ? true : false,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10_000,
    ignoreHTTPSErrors: true,
    video: config.ci ? 'retain-on-failure' : 'on',
    screenshot: 'only-on-failure',
    baseURL: config.baseUrl,
    launchOptions: { env: { VITE_COVERAGE: 'true' } },
  },

  projects: [{ name: 'chromium', use: { channel: 'chrome' } }],
});
