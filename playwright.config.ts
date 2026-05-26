import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for E2E testing.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",
  
  /* Run tests in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry failed tests in CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Reporter configuration */
  reporter: process.env.CI
    ? [
        ["html", { open: "never" }],
        ["json", { outputFile: "test-results/results.json" }],
        ["github"],
      ]
    : [["html", { open: "on-failure" }]],
  
  /* Shared settings for all projects */
  use: {
    /* Base URL for navigation */
    baseURL: "http://localhost:3000",
    
    /* Collect trace on failure */
    trace: "on-first-retry",
    
    /* Capture screenshot on failure */
    screenshot: "only-on-failure",
    
    /* Record video on failure */
    video: "on-first-retry",
    
    /* Default timeout for actions */
    actionTimeout: 10_000,
    
    /* Default navigation timeout */
    navigationTimeout: 30_000,
  },
  
  /* Global timeout for each test */
  timeout: 60_000,
  
  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    /* Mobile viewports */
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
  
  /* Run local dev server before starting tests */
  webServer: {
    command: "NODE_ENV=production node dist/index.js",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      PORT: "3000",
      NODE_ENV: "production",
      E2E_TEST_MODE: "true",
      JWT_SECRET: process.env.JWT_SECRET || "test-secret-for-e2e-testing",
      VITE_APP_ID: process.env.VITE_APP_ID || "test-app-id",
    },
  },
  
  /* Output directory for test artifacts */
  outputDir: "test-results/",
  
  /* Expect configuration */
  expect: {
    timeout: 5_000,
  },
});
