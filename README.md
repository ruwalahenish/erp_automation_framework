# ERP Test Automation Framework

A production-quality, enterprise-grade Playwright UI & API automation framework built with TypeScript for ERP applications, adhering strictly to official Playwright best practices and FAANG-level QA engineering standards.

## 🌟 Architecture & Key Features

- **TypeScript First**: Strict typing (`strict: true`), ESLint, Prettier, zero `any` usage, and complete TSDoc annotations.
- **Official Setup Project Auth**: Authentication state (`.auth/user-storage.json`) is captured once via `tests/auth.setup.ts` before tests run, enabling all Chromium tests to start pre-authenticated without fragile UI login loops.
- **Slim Page Object Model**: Page Objects extend a minimal `BasePage`, exposing public `readonly page: Page` and constructor-initialized `readonly` Locators, eliminating artificial wrapper methods.
- **Component Object Model**: Reusable components (`DataGridComponent`, `ModalComponent`, `ToastComponent`, `SidebarComponent`) in `src/components/` encapsulate complex UI controls.
- **Modular Fixtures**: Clean separation between infrastructure fixtures (`src/fixtures/base.fixture.ts`) and page fixtures (`src/fixtures/pages.fixture.ts`), combined cleanly in `src/fixtures/index.ts`.
- **User-Facing Locators & Strategy**: Priority given to Playwright ARIA locators (`getByRole`, `getByLabel`, `getByText`) and explicit `data-testid` attributes.
- **Native Web Assertions**: Fully leverages Playwright auto-waiting web assertions (`expect(locator).toBeVisible()`) and native `expect.poll()`, avoiding manual polling loops.
- **Multi-Environment Support**: Environment configuration (`TEST_ENV=local|staging|production`) resolved dynamically via `.env` overrides.

## 📂 Project Structure

```text
erp-automation-framework/
├── .auth/                  // Storage state directory (.gitignored)
├── .github/
│   └── workflows/          // GitHub Actions CI pipeline (playwright.yml)
├── docs/                   // Persistent Business Context & Project Memory
│   └── BUSINESS_CONTEXT_MEMORY.md
├── src/
│   ├── components/         // Reusable UI Component Objects (DataGrid, Modal, Toast, Sidebar)
│   ├── config/             // Multi-env configuration manager
│   ├── data/               // Externalized test data (single testUser profile)
│   ├── fixtures/           // Composited Playwright custom fixtures (base & pages)
│   ├── helpers/            // Utility classes (ApiHelper, Date, String, withTimeout)
│   ├── pages/              // Page Object Model classes (BasePage, LoginPage)
│   └── types/              // Strongly-typed interfaces and types
├── tests/                  // Test spec files and auth.setup.ts
│   └── auth.setup.ts       // Authentication setup project script
├── global-setup.ts         // Global initialization & app connectivity check
├── global-teardown.ts      // Global cleanup hook
├── playwright.config.ts    // Playwright configuration with setup project
├── tsconfig.json           // TypeScript configuration with path aliases
├── .env                    // Local environment variable overrides
└── package.json            // Scripts and dependencies
```

## 🚀 Getting Started

### 1. Prerequisites

Node.js (`>=18.x`) is required.

### 2. Installation

Install node dependencies and Playwright browser binaries:

```bash
npm install
npx playwright install --with-deps chromium
```

### 3. Environment Setup

Copy `.env.example` to `.env` and set your application environment details:

```bash
cp .env.example .env
```

Configured `.env` variables:

```env
TEST_ENV=local
BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:3001/api
TEST_USERNAME=admin@example.com
TEST_PASSWORD=AdminPass123!
TIMEZONE=UTC
```

## 💻 Execution Commands

| Command | Description |
| :--- | :--- |
| `npm test` | Run all test suites in headless mode |
| `npm run test:ui` | Open Playwright interactive UI mode |
| `npm run test:headed` | Run tests in headed browser mode |
| `npm run test:debug` | Run tests with Playwright Inspector attached |
| `npm run test:smoke` | Run tests tagged `@smoke` |
| `npm run test:chromium` | Run tests specifically on Chromium |
| `npm run codegen` | Launch Playwright Codegen locator generator |
| `npm run report` | Open the generated HTML test report |
| `npm run lint` | Run ESLint static code analysis |
| `npm run format` | Format code with Prettier |

## 🏷️ Test Tagging & Filtering Conventions

Organize tests using standard tag annotations in test titles or describe blocks:

- `@smoke` — Critical path sanity tests run on every pull request
- `@regression` — Full regression test suite
- `@critical` — High-priority business flows
- `@fast` — Lightweight unit/API spec runs

Example:

```typescript
import { test, expect } from '../src/fixtures';

test('verify login form @smoke @critical', async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.expectLoginFormVisible();
});
```

Run tagged tests:

```bash
npx playwright test --grep @smoke
```

## 🎯 Locator Strategy Guide

Always prioritize user-visible ARIA locators in Page Objects and Component Objects:

1. `page.getByRole()` (e.g. `button`, `heading`, `link`, `checkbox`, `dialog`)
2. `page.getByLabel()` (for form inputs)
3. `page.getByText()` (for text nodes)
4. `page.getByTestId()` (for dynamic or non-semantic components, e.g. `data-testid="user-profile"`)

Avoid brittle CSS selectors (`div > span:nth-child(3)`) and XPath queries.
