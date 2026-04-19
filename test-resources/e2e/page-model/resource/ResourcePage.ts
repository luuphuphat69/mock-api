import { Locator, Page } from "@playwright/test";

export default class ResourcePage {
  constructor(private readonly page: Page) {}

  get addNewResourceButton(): Locator {
    return this.page.getByRole("button", { name: "Add New Resource" });
  }

  get resourceGridContainer(): Locator {
    return this.page.getByTestId("resource-grid-container");
  }

  get resourceCards(): Locator {
    return this.page.getByTestId("resource-card");
  }

  resourceCardByName(resourceName: string): Locator {
    return this.resourceCards.filter({
      has: this.page.getByRole("heading", { name: resourceName, exact: true }),
    });
  }

  async goto(projectId: string): Promise<void> {
    const targetPath = `/projects/${projectId}/resources`;

    if (!this.page.url().includes(targetPath)) {
      await this.page.goto(targetPath, { waitUntil: "domcontentloaded" });
    }

    await this.page.waitForURL(new RegExp(`${projectId}/resources`), {
      timeout: 10_000,
    });
  }

  async clickAddNewResourceButton(): Promise<void> {
    await this.addNewResourceButton.click();
  }

  async openResourceCard(resourceName: string): Promise<void> {
    await this.resourceCardByName(resourceName)
      .getByRole("heading", { name: resourceName, exact: true })
      .click();
  }
}
