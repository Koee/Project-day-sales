import { defineConfig } from '@playwright/test';
import { env } from './config/env';

const chromiumUse = {
  browserName: 'chromium' as const,
  viewport: null,
  launchOptions: {
    args: ['--start-maximized']
  }
};

const hasAuthCredentials = Boolean(env.loginEmail && env.loginPassword);

export default defineConfig({
  testDir: './tests',
  testMatch: env.testSpec ? [env.testSpec] : undefined,
  grep: env.testGrep ? new RegExp(env.testGrep, 'i') : undefined,
  globalSetup: hasAuthCredentials ? './global-setup.ts' : undefined,
  timeout: 30_000,
  expect: {
    timeout: 10_000
  },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : 1,
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  use: {
    baseURL: env.baseURL,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      grepInvert: /@auth-state/,
      use: {
        ...chromiumUse
      }
    },
    ...(hasAuthCredentials
      ? [
          {
            name: 'chromium-auth',
            grep: /@auth-state/,
            use: {
              ...chromiumUse,
              storageState: env.authStorageState
            }
          }
        ]
      : [])
  ]
});
