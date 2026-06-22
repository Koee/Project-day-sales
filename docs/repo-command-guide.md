# Repo Command Guide

## Playwright Functional Tests

Purpose: run UI automation for Day Sales staging.

Setup:
- Install dependencies with `npm install`.
- Install browser with `npm run install:browsers`.
- Put real local environment values in `config/.env` when needed.

Commands:

```bash
npm test
npm run test:headed
npm run test:debug
npm run report
```

Artifacts:
- HTML report: `playwright-report/`.
- Test artifacts: `test-results/`.

## K6 Performance Tests

Purpose: run lightweight performance smoke/load checks for public Day Sales staging pages.

Setup:
- Install dependencies with `npm install`.
- Install k6 CLI locally from https://grafana.com/docs/k6/latest/set-up/install-k6/ or run the built script with Docker.
- On Windows with Windows Package Manager, run `winget install k6 --source winget`, then verify with `k6 version`.
- If Windows cannot find `k6` after installation, reopen the terminal or add `C:\Program Files\k6` to `PATH`.
- Optional environment variables:
  - `BASE_URL`: target site, default `https://day-sales-staging.timdaythay.com`.
  - `K6_SMOKE_VUS`: virtual users, default `1`.
  - `K6_SMOKE_DURATION`: duration, default `30s`.
  - `K6_THINK_TIME_SECONDS`: delay between page requests, default `1`.
  - `K6_ORDER_REQUEST_COUNT`: exact number of order requests, default `1`.
  - `K6_ORDER_REQUEST_VUS`: virtual users for order requests, default `1`.
  - `K6_ORDER_REQUEST_ENDPOINT`: order API path, required for `npm run perf:orders`.
  - `K6_ORDER_REQUEST_PAYLOAD`: order JSON payload, required for `npm run perf:orders`.

Commands:

```bash
npm run perf:check
npm run perf:typecheck
npm run perf:build
npm run perf:smoke
npm run perf:orders
```

Docker alternative after build:

```bash
docker run --rm -i -e BASE_URL=https://day-sales-staging.timdaythay.com -v "$PWD/performance/k6/dist:/scripts" grafana/k6 run /scripts/smoke-pages.js
```

Artifacts:
- Built k6 scripts: `performance/k6/dist/`.
- k6 summary is printed to stdout.

Notes:
- Keep default thresholds conservative for staging.
- Add new k6 scripts under `performance/k6/src/`.
- Do not mix Playwright UI flows and k6 performance scripts in the same runner.
- If k6 fails with `proxyconnect tcp: dial tcp 127.0.0.1:9`, clear `HTTP_PROXY`, `HTTPS_PROXY`, and `ALL_PROXY` in the current shell before running.
