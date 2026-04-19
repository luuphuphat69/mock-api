# AGENTS.md

## Goal

Generate robust, maintainable **Playwright E2E test scripts** using **TypeScript** following Page Object Model (POM) architecture.

### Testing Environment

* Base URL: `https://previewmockapi.io.vn`

---

## Project Structure Rules

### 1. Page Object Model (POM)

* Location:

  ```
  /test-resources/e2e/page-model/
  ```

* Structure:

  ```
  /page-model/<page-name>/
  ```

* Components:

  ```
  /page-model/<page-name>/components/
  ```

#### Rules

* Each page must have a main class (e.g., `LoginPage.ts`)
* Components must be reusable and separated
* Do NOT put test logic inside page models
* Only include:

  * locators
  * actions

---

### 2. Test Scripts (Features)

* Location:

  ```
  /test-resources/e2e/tests/feats/
  ```

* Structure:

  ```
  /tests/feats/<page-name>/<feature>.spec.ts
  ```

#### Rules

* Each folder represents a page
* Each file represents a feature or scenario

---

### 3. Utilities

* Location:

  ```
  /test-resources/e2e/utilities/
  ```

#### Examples

* API helpers
* custom wait functions
* data generators

---

## Test Writing Rules

### General

* Use **Playwright Test**
* Use **TypeScript**
* Always use:

  * `test.describe`
  * `test.beforeEach`
* Use `test.afterEach` only when necessary

---

### Selector Strategy

Priority:

1. `data-testid`
2. `getByRole`
3. `getByText`

Avoid:

* `nth-child`
* brittle CSS selectors

---

### Test Structure

#### Rules

* Initialize page objects in `beforeEach`
* Always navigate using base URL
* Keep tests independent

#### Example

```ts
test.describe('Login Page', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should login successfully', async () => {
    await loginPage.login('user', 'password');
    await expect(loginPage.dashboard).toBeVisible();
  });
});
```

---

## Environment Variables

* Load all sensitive data from `.env`

Do NOT hardcode:

* username
* password
* projectId

#### Example

```ts
const username = process.env.TEST_USERNAME!;
const password = process.env.TEST_PASSWORD!;
const projectId = process.env.TEST_PROJECT_ID!;
```

---

## Base URL Handling

* Always use:

```ts
await page.goto('/');
```

* Base URL is configured in Playwright config:

```
https://previewmockapi.io.vn
```

---

## Page Object Rules

#### Requirements

* Accept `Page` in constructor
* Define locators
* Define actions

#### Example

```ts
export class LoginPage {
  constructor(private page: Page) {}

  usernameInput = this.page.getByTestId('username');
  passwordInput = this.page.getByTestId('password');
  loginButton = this.page.getByRole('button', { name: 'Login' });

  async goto() {
    await this.page.goto('/login');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
```

---

## Best Practices

* Prefer reusable methods over duplication
* Keep tests short and readable
* Use meaningful test names
* ❌ Avoid `waitForTimeout`
* ✅ Use `expect` for assertions

---

## MCP (Playwright) Usage

* Use MCP tools to:

  * inspect UI
  * generate selectors
  * validate flows

* Always refine selectors to match project rules

---

## Anti-Patterns (Do NOT do)

* ❌ Write selectors inside test files
* ❌ Mix test logic in page models
* ❌ Hardcode credentials or IDs
* ❌ Use flaky waits
* ❌ Ignore POM structure

---

## Feature Grouping Rules

* Each feature MUST be grouped using `test.describe`
* Group related actions (CRUD, flows, variations)

---

### Structure Convention

```ts
test.describe('<Feature Name>', () => {
  test('<scenario>', async ({ page }) => {
    // test logic
  });
});
```

---

### Example: Project CRUD

```ts
test.describe('Project CRUD', () => {
  test('create project successfully', async ({ page }) => {
    // create logic
  });

  test('update project successfully', async ({ page }) => {
    // update logic
  });

  test('delete project successfully', async ({ page }) => {
    // delete logic
  });
});
```

---

### Nested Describe (Optional)

Use only for complex features:

```ts
test.describe('Project Management', () => {
  test.describe('CRUD', () => {
    test('create project', async ({ page }) => {});
    test('update project', async ({ page }) => {});
  });

  test.describe('Permissions', () => {
    test('should restrict access', async ({ page }) => {});
  });
});
```

---

### Rules

* Use clear feature names
* Keep `describe` focused on ONE feature
* Avoid deep nesting (> 2 levels)
* Each `test()` = ONE scenario

---

### Naming Convention

* `describe` → Feature name
* `test` → action + expected result

Example:

* `"Project CRUD"`
* `"create project successfully"`

---

## Output Expectations

When generating code:

* Follow folder structure strictly
* Generate:

  * page model (if not exists)
  * component (if needed)
  * test file
* Use clean TypeScript
* Ensure code is runnable

---

## Summary

* POM-first architecture
* Strict folder structure
* Env-driven data
* Clean, reusable, scalable test code