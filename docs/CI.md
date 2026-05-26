# CI/CD Documentation

This document describes the Continuous Integration (CI) workflows for the SkinTwin Customer Portal.

## Overview

The project uses GitHub Actions for CI/CD with the following workflows:

1. **CI Workflow** (`ci.yml`) - Primary validation and testing pipeline
2. **E2E Nightly** (`e2e-nightly.yml`) - Scheduled exhaustive E2E testing

## CI Workflow (`ci.yml`)

### Triggers

- **push** to `main` branch
- **pull_request** targeting `main`
- **workflow_dispatch** for manual runs

### Jobs

#### 1. Validate

Runs on every push and PR to ensure code quality:

```yaml
Steps:
- Checkout code
- Setup Node.js with pnpm
- Install dependencies (frozen lockfile)
- Type check (tsc --noEmit)
- Unit tests (vitest)
- Build (vite + esbuild)
- Upload build artifacts
```

**Commands:**
```bash
corepack pnpm install --frozen-lockfile
corepack pnpm run check
corepack pnpm run test
corepack pnpm run build
```

#### 2. E2E Smoke Tests

Fast browser tests on Chromium only, runs after validation:

- Filters tests tagged with `@smoke`
- Single browser (Chromium)
- Uploads Playwright reports on failure

#### 3. E2E Full Tests

Comprehensive testing across browsers, runs on:
- Manual dispatch (`workflow_dispatch`)
- Push to `main` branch

**Matrix:**
- Browsers: Chromium, Firefox, WebKit
- Shards: 2 parallel shards per browser

#### 4. E2E Report Merge

Aggregates all shard results into a single merged report.

### Concurrency

Workflows use concurrency groups to cancel superseded runs:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true
```

## E2E Nightly Workflow (`e2e-nightly.yml`)

### Schedule

Runs daily at 2:00 AM UTC.

### Configuration

Manual dispatch allows customization:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `browsers` | `chromium,firefox,webkit` | Comma-separated browser list |
| `shards` | `4` | Number of parallel shards per browser |

### Jobs

1. **Setup** - Builds dynamic matrix from inputs
2. **Build** - Validates and builds the application
3. **E2E Tests** - Runs tests across matrix
4. **Report Merge** - Combines all results
5. **Notify** - Reports on failure

## Local Development

### Running CI Checks Locally

```bash
# Install dependencies
corepack pnpm install

# Run type checking
corepack pnpm run check

# Run unit tests
corepack pnpm run test

# Build the application
corepack pnpm run build

# Run E2E tests
corepack pnpm run e2e
```

### E2E Testing Locally

```bash
# Run all E2E tests
corepack pnpm run e2e

# Run with browser UI visible
corepack pnpm run e2e:headed

# Run with Playwright UI
corepack pnpm run e2e:ui

# Debug tests
corepack pnpm run e2e:debug

# Generate tests with codegen
corepack pnpm run e2e:codegen
```

### Running Specific Tests

```bash
# Run smoke tests only
corepack pnpm run e2e --grep "@smoke"

# Run specific file
corepack pnpm run e2e e2e/public.spec.ts

# Run specific browser
corepack pnpm run e2e --project=chromium
```

## Artifacts

### Build Artifacts

- **Name:** `build-output`
- **Contents:** `dist/` directory
- **Retention:** 7 days

### Test Reports

- **Playwright HTML Report:** `playwright-report/`
- **Test Results:** `test-results/`
- **Merged Report:** `playwright-report-merged/` (30 day retention)

## Environment Variables

### Required for E2E Tests

| Variable | Purpose |
|----------|---------|
| `E2E_TEST_MODE` | Enable test authentication (`true`) |
| `JWT_SECRET` | Session signing secret |
| `VITE_APP_ID` | Application identifier |

### CI-Only Variables

These are set automatically in GitHub Actions:

- `CI=true` - Indicates CI environment
- All secrets are masked and not printed to logs

## Security

### Permissions

Workflows use least-privilege permissions:

```yaml
permissions:
  contents: read
  pull-requests: read
```

### Secrets

- Secrets are stored in GitHub repository settings
- Never print secrets in workflow logs
- E2E tests use mock authentication, no external OAuth in CI

## Troubleshooting

### Common Issues

#### Build Failures

1. Check type errors: `corepack pnpm run check`
2. Check test failures: `corepack pnpm run test`
3. Review build logs in GitHub Actions

#### E2E Test Failures

1. Download Playwright report artifact
2. Open `playwright-report/index.html`
3. Review screenshots, videos, and traces
4. Run locally with `--debug` flag

#### Flaky Tests

Tests are configured with retries in CI:
- 2 retries on first failure
- Traces captured on retry

### Viewing Reports

1. Go to GitHub Actions run
2. Download `playwright-report-*` artifact
3. Extract and open `index.html` in browser

## Branch Protection

Recommended branch protection rules for `main`:

- [x] Require status checks: `validate`, `e2e-smoke`
- [x] Require branches to be up to date
- [x] Include administrators
- [ ] Require linear history (optional)

## Future Improvements

1. **Visual Regression Testing** - Add Percy or similar
2. **Performance Budgets** - Add Lighthouse CI
3. **Dependency Updates** - Add Renovate or Dependabot
4. **Code Coverage** - Add coverage reporting
