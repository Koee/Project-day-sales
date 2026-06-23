# Day Sales Automation

Playwright Test automation project for Day Sales staging.

## Tech Stack

- TypeScript
- Playwright Test
- Official Playwright MCP package: `@playwright/mcp`

## Setup

```bash
npm install
npm run install:browsers
```

Local environment values are loaded from `config/.env`. Update that file when Keycloak URLs or focused test selectors are needed:

```dotenv
BASE_URL=https://day-sales-staging.timdaythay.com
TEST_SPEC=
TEST_GREP=
LOGIN_START_PATH=/product
KEYCLOAK_LOGIN_URL=
KEYCLOAK_REGISTER_URL=
KEYCLOAK_FORGOT_PASSWORD_URL=
```

## Run Tests

Chạy tất cả testcase:

```bash
npm test
```

Chạy một file spec:

```bash
npx playwright test checkout/guest-order.spec.ts
```

Chạy một testcase theo tên:

```bash
npx playwright test --grep "mua hàng không login"
```

Chạy một testcase trong một file spec:

```bash
npx playwright test checkout/guest-order.spec.ts --grep "mua hàng không login"
```

Xem danh sách testcase trong file:

```bash
npx playwright test checkout/guest-order.spec.ts --list
```

Chạy bằng script có sẵn:

```bash
npm run test:guest-order
npm run test:guest-order:list
```

Chạy mở browser hoặc debug:

```bash
npm run test:headed
npm run test:debug
```

Có thể cấu hình file/tên testcase qua `config/.env`:

```dotenv
TEST_SPEC=checkout/guest-order.spec.ts
TEST_GREP=mua hàng không login
```

Sau đó chạy:

```bash
npm test
```

Open HTML report:

```bash
npm run report
```

Clean JSON/PNG reports under `report/pass` and `report/false` before a new run:

```bash
npm run report:clean
```

Type-check:

```bash
npm run typecheck
```

## Performance Tests With K6

K6 scripts live in `performance/k6/src/` and are written in TypeScript. They are bundled to `performance/k6/dist/` before running.

Install k6 CLI first, or use Docker as described in `docs/repo-command-guide.md`.

On Windows with Windows Package Manager:

```powershell
winget install k6 --source winget
k6 version
```

If `k6` is installed but the command is not found, reopen the terminal or add `C:\Program Files\k6` to `PATH`.

Check local k6 CLI:

```bash
npm run perf:check
```

Build k6 scripts:

```bash
npm run perf:typecheck
npm run perf:build
```

Run lightweight staging smoke performance:

```bash
npm run perf:smoke
```

Optional env:

```bash
BASE_URL=https://day-sales-staging.timdaythay.com
K6_SMOKE_VUS=1
K6_SMOKE_DURATION=30s
K6_THINK_TIME_SECONDS=1
```

Run order request performance after confirming the real order API endpoint and JSON payload:

```powershell
$env:K6_ORDER_REQUEST_COUNT = '10'
$env:K6_ORDER_REQUEST_VUS = '2'
$env:K6_ORDER_REQUEST_ENDPOINT = '/api/orders'
$env:K6_ORDER_REQUEST_PAYLOAD = '{"recipientName":"Test","phone":"0989346826"}'

npm run perf:orders
```

`K6_ORDER_REQUEST_COUNT` is the exact number of order requests. `K6_ORDER_REQUEST_VUS` controls how many virtual users share those requests.

If k6 reports `proxyconnect tcp: dial tcp 127.0.0.1:9`, clear proxy variables in the current PowerShell session before running:

```powershell
$env:HTTP_PROXY = ''
$env:HTTPS_PROXY = ''
$env:ALL_PROXY = ''
```

## Playwright MCP

VS Code MCP config is stored in `.vscode/mcp.json`:

```json
{
  "servers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

Use the Playwright MCP server with Codex or VS Code to:

- Open Day Sales staging in a browser.
- Inspect accessible locators.
- Validate whether `getByRole`, `getByPlaceholder`, or `getByText` can target each element.
- Replace TODO fallback locators in page objects with stable locators.

## Project Structure

```text
.
├── .github/workflows/playwright.yml
├── .vscode/mcp.json
├── .agents/
├── config/
├── fixtures/
├── pages/
├── performance/k6/
├── steps/
├── tests/
├── utils/
├── playwright.config.ts
├── package.json
├── tsconfig.json
├── config/.env
└── README.md
```

## First Test

`tests/checkout/guest-order.spec.ts`

Scenario: `mua hàng không login`

Flow:

1. Open `/store/11`.
2. Search product `Chả cá KG`; if not found, use first product fallback.
3. Add product to cart.
4. Open cart.
5. Select product.
6. Checkout selected product.
7. Open delivery address form.
8. Fill recipient address data from `fixtures/test-data.ts`.

## Next Steps

- Use Playwright MCP to inspect exact locators for product card, add-to-cart, cart checkbox and checkout address form.
- Add login tests with Keycloak URLs in `config/.env`.
- Add register and forgot password specs under `tests/auth/`.
- Add cart test coverage for quantity, remove item and selected checkout.
- Add checkout assertions for address summary, shipping fee, payment method and order confirmation.
