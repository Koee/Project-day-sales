# Repository Agent Rules

This repository uses project-local agent rules. Before reading code, editing files, running tests, or reviewing changes, agents must apply this guide.

Default operating mode:

- Use Vietnamese for direct user-facing conversation by default unless the user asks for another language.
- Ask first when the goal, scope, verification command, credentials, environment, or forbidden actions are unclear.
- Start from the smallest reasonable scope.
- Expand only through direct imports, errors, logs, config dependency, type dependency, or Playwright trace/report evidence.
- Explain why scope is expanding before reading or editing outside the original scope.
- Do not refactor outside the requested scope.
- Do not commit or push unless the user explicitly asks.
- Do not create a new brand, rename the product, or change Day Sales staging URLs unless the user explicitly asks.

## Project Context

This is a TypeScript + Playwright Test automation repository for Day Sales staging.

Primary staging base URL:

```text
https://day-sales-staging.timdaythay.com
```

Core structure:

- `tests/`: Playwright specs.
- `pages/`: Page Object Model classes.
- `steps/`: business flows composed from page objects.
- `fixtures/`: reusable test data.
- `config/`: URLs and environment values.
- `utils/`: reusable helpers.
- `.agents/agent-roles.md`: compact role prompts for QA, test writer, review, brainstorm, and scale agents.
- `.vscode/mcp.json`: official Playwright MCP config using `@playwright/mcp`.
- `.github/workflows/playwright.yml`: GitHub Actions workflow.

Agent roles:

- Use `.agents/agent-roles.md#qa-agent` for risk analysis and test strategy.
- Use `.agents/agent-roles.md#test-writer-agent` when adding Playwright specs or page objects.
- Use `.agents/agent-roles.md#review-agent` when reviewing automation changes.
- Use `.agents/agent-roles.md#brainstorm-agent` only when test strategy or coverage is still unclear.
- Use `.agents/agent-roles.md#scale-agent` when changing framework structure, CI, reporting, fixtures, or suite organization.

## Scope Guard

Use Scope Guard when reading or editing code:

```text
Scope Guard:
- Start only from the user-provided files or the smallest likely entry point.
- Expand scope only through direct imports, error logs, stack traces, config dependency, type dependency, or Playwright report evidence.
- Explain the reason before reading or editing outside the original scope.
- Ask the user before broad expansion across multiple folders.
```

Quota guidance:

- For a small task, read at most 3-5 files unless direct evidence proves more are needed.
- If more than 5 files are needed for a small task, explain why before continuing.
- If more than 8 files are needed, stop and ask the user before expanding further.
- Do not read long docs, traces, reports, or logs end to end when only one section is relevant.
- Do not read `.agents/agent-workflow-scope-guide.md` end to end by default.
- Use `rg` to open only the relevant section of `.agents/agent-workflow-scope-guide.md` when workflow, quota, review, or planning detail is explicitly needed.
- Start from failing test title, error message, stack trace, locator snapshot, and directly related page object code.

Quota optimization:

- Keep progress updates to one short sentence unless the task is broad or blocked.
- Do not repeat long process announcements such as re-stating this file, Scope Guard, or Test Selector in every turn.
- Prefer targeted `rg -n` snippets over full-file reads for docs, reports, traces, role files, and generated artifacts.
- Do not read skill, role, workflow, or reference files unless they are directly required by the current task.
- For Playwright failures, start with the stack trace and the smallest relevant screenshot or `error-context.md` excerpt; avoid full trace expansion unless the stack trace or snapshot is insufficient.
- Use `max_output_tokens` or focused commands for logs and diffs that may be large.
- Summarize verification output instead of pasting full logs.

## Test Selector

Use Test Selector when verifying changes:

```text
Test Selector:
- Choose the smallest meaningful verification command.
- Prefer typecheck for TypeScript-only, config-only, Markdown, fixture, and helper changes that do not require browser behavior.
- Prefer one related spec over the full Playwright suite.
- For a known failing test title, run the focused `--grep` case first.
- Run the whole related spec only after the focused case passes or broader risk requires it.
- Ask before running full test suites, headed mode, debug mode, or commands with large output.
```

Common commands:

```bash
npm run typecheck
npx playwright test --list
npx playwright test tests/checkout/guest-order.spec.ts
npx playwright test --grep "mua hàng không login"
npm run report
```

## Playwright Rules

- Use TypeScript and Playwright Test APIs.
- Keep specs short; specs should call business steps from `steps/`.
- Keep UI interaction in `pages/`.
- Keep reusable test data in `fixtures/`.
- Keep URLs and environment values in `config/`.
- Keep shared utility logic in `utils/`.
- Do not hard-code secrets, tokens, or local credentials in code.
- Load local environment values from `config/.env`; keep real secrets out of git.

Locator priority:

1. `getByRole`
2. `getByPlaceholder`
3. `getByLabel`
4. `getByText`
5. CSS locator only when accessible locators are not available

When locator confidence is low:

- Add a short TODO comment.
- Use Playwright MCP to inspect the live DOM.
- Replace fallback locators with stable accessible locators when confirmed.

Avoid flaky behavior:

- Do not use arbitrary waits unless there is no better condition.
- Prefer URL assertions, visible state, enabled state, response-driven state, or business-visible UI signals.
- Keep staging timeout changes in `playwright.config.ts`, not scattered inside tests.
- Do not run full tests against staging unless the user asks or the change clearly affects shared behavior.

## Playwright MCP

The official MCP server is configured in `.vscode/mcp.json` with `@playwright/mcp`.

Use MCP when:

- A locator is uncertain.
- A custom dropdown, checkbox, modal, or icon-only control needs inspection.
- A generated test needs accessible locator refinement.
- A Playwright failure suggests DOM changed on staging.

Do not use MCP as a replacement for clean page object design. Inspect first, then update page objects or steps with stable code.

## Planning And Docs

- Do not create plans, scenarios, verification notes, or extra docs for analysis-only tasks or edits touching only 1-2 files unless the user asks.
- Store temporary agent scenarios, review notes, and verification notes under `.agents/` only when a saved note is truly needed.
- Store formal project implementation plans under `docs/plans/YYYY-MM-DD-<feature-name>.md` when a plan is truly needed.
- Keep any live task tracker concise if created.
- Do not create new files under `docs/superpowers/` unless the user explicitly asks for that location.
- When adding a reusable test command, update `README.md` with command, setup, report/artifact output, and purpose.

## Superpowers Usage Override

Project-local rules in this file are the default workflow for this repository.

- Do not use full `superpowers:brainstorming` for small tasks, bugfixes, reviews, explanations, config/data edits, locator tweaks, or extensions to an existing flow.
- For small tasks, use only Question-First behavior, Scope Guard, and Test Selector.
- Do not read long Superpowers skill files for small tasks unless the active platform instructions require it or the task truly depends on that skill's detailed procedure.
- Use full brainstorming only for large new work that needs design discovery, such as a new cross-file framework workflow, a new major test suite area, or when the user explicitly asks for brainstorming/design.
- Do not let Superpowers defaults create files under `docs/superpowers/*`, commit specs/plans, or add review gates unless the user explicitly asks.

## Review Checklist

Before claiming completion, verify the smallest meaningful command and report the result.

Check:

- Does the change match the requested scope?
- Are locators using the preferred priority?
- Are specs short and readable?
- Is business flow placed in `steps/`?
- Is UI behavior placed in `pages/`?
- Are data and URLs separated from specs?
- Did verification run, and what was the exact result?
- What risk remains, especially around staging data or uninspected DOM?

For ambiguous requests, first establish:

```text
Goal:
Scope:
Do not:
Verify:
Output:
```

Recommended prompt shape:

```text
Apply AGENTS.md.
Use Scope Guard + Test Selector.

Goal:
Scope:
Do not:
Verify:
Output: files changed, verification result, and remaining risk.
```
