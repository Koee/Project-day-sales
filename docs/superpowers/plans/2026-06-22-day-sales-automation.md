# Day Sales Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a TypeScript Playwright Test automation repo for Day Sales staging with MCP, CI, POM, steps, fixtures and the first guest checkout test.

**Architecture:** The repo uses Playwright Test as the runner, Page Object Model for UI interaction, step files for business flows, fixtures for test data and config modules for URLs/env. MCP is configured through VS Code so an agent can inspect the live app and refine locators.

**Tech Stack:** TypeScript, Playwright Test, `@playwright/mcp`, GitHub Actions.

---

### Task 1: Scaffold Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `playwright.config.ts`
- Create: `config/.env`

- [x] Add Playwright Test, TypeScript, dotenv and official Playwright MCP dependencies.
- [x] Configure chromium, baseURL, list/html reporters, staging timeouts and failure artifacts.

### Task 2: Add Automation Structure

**Files:**
- Create: `config/urls.ts`
- Create: `config/env.ts`
- Create: `fixtures/test-data.ts`
- Create: `utils/wait.helper.ts`

- [x] Centralize URLs and env.
- [x] Keep guest order data outside specs.
- [x] Add minimal reusable wait helper.

### Task 3: Add POM and First Test

**Files:**
- Create: `pages/BasePage.ts`
- Create: `pages/StorePage.ts`
- Create: `pages/CartPage.ts`
- Create: `pages/CheckoutPage.ts`
- Create: `steps/checkout.steps.ts`
- Create: `tests/checkout/guest-order.spec.ts`

- [x] Implement guest checkout flow through page objects.
- [x] Keep spec short and delegate flow to `checkout.steps.ts`.
- [x] Add TODO comments where live DOM inspection is needed.

### Task 4: Add MCP, CI and Agent Docs

**Files:**
- Create: `.vscode/mcp.json`
- Create: `.github/workflows/playwright.yml`
- Create: `.agents/agent-roles.md`
- Create: `README.md`

- [x] Configure `@playwright/mcp`.
- [x] Add GitHub Actions workflow that runs Playwright and uploads HTML report.
- [x] Document setup, commands, MCP usage and next expansion paths.
