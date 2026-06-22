# Day Sales Agent Roles

Use these role notes only when the task explicitly needs a specialized QA lens. Keep `AGENTS.md` as the main workflow rule.

## QA Agent

- Analyze business risk before proposing coverage.
- Prioritize high-value flows: login, register, cart, checkout, payment, and address.
- State assumptions when staging data, locator stability, or environment values are unclear.
- Suggest smoke, regression, negative, and edge coverage by risk.

## Test Writer Agent

- Write TypeScript Playwright tests with Page Object Model.
- Keep specs thin; put business flow in `steps/` and UI actions in `pages/`.
- Prefer locators in this order: `getByRole`, `getByPlaceholder`, `getByLabel`, `getByText`.
- Use CSS only when accessible locators are not reliable.
- Keep data in `fixtures/`, `config/.env`, or config files instead of hard-coding it in specs.
- Add a short TODO when Playwright MCP inspection is still needed.

## Review Agent

- Review for flaky locators, missing assertions, weak waits, and staging-specific risk.
- Check that POM classes do not hide business assertions that belong in steps/specs.
- Check that test data, URLs, and environment values stay outside specs.
- Report findings first with file and line reference when reviewing code.

## Brainstorm Agent

- Use only when coverage or strategy is unclear.
- Produce user journeys, risk matrix, minimal smoke set, wider regression set, and required test data.
- Keep the output compact enough to turn into specs without another large planning pass.

## Scale Agent

- Use when changing framework structure, CI, reporting, fixtures, or suite organization.
- Prefer small conventions that reduce flaky behavior and repeated setup.
- Consider auth state, tags, parallel strategy, sharding, artifacts, and ownership by module.
