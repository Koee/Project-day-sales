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

Copy `.env.example` to `.env` when Keycloak URLs are available:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

## Run Tests

```bash
npm test
npm run test:headed
npm run test:debug
```

Open HTML report:

```bash
npm run report
```

Type-check:

```bash
npm run typecheck
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
├── agents/
├── config/
├── fixtures/
├── pages/
├── steps/
├── tests/
├── utils/
├── playwright.config.ts
├── package.json
├── tsconfig.json
├── .env.example
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
- Add login tests with Keycloak URLs in `.env`.
- Add register and forgot password specs under `tests/auth/`.
- Add cart test coverage for quantity, remove item and selected checkout.
- Add checkout assertions for address summary, shipping fee, payment method and order confirmation.
