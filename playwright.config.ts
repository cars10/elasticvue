import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 16,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html', { open: 'never' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: '**/PredefinedClusters.spec.ts'
    },
    {
      name: 'chromium-docker',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:5176' },
      testMatch: '**/PredefinedClusters.spec.ts'
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: '**/PredefinedClusters.spec.ts'
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: '**/PredefinedClusters.spec.ts'
    }

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'npm run dev -- --port=5175',
      url: 'http://localhost:5175',
      reuseExistingServer: !process.env.CI
    },
    {
      command: 'npx cross-env VITE_APP_BUILD_MODE=docker npm run dev -- --port=5176',
      url: 'http://localhost:5176',
      reuseExistingServer: !process.env.CI
    }
  ]
})
