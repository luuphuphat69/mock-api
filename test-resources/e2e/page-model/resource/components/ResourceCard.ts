import { Locator, Page } from "@playwright/test";

export default class ResourceCard {
  constructor(private readonly page: Page) {}

  cardByName(resourceName: string): Locator {
    return this.page.getByTestId("resource-card").filter({
      has: this.page.getByRole("heading", { name: resourceName, exact: true }),
    });
  }

  editButton(resourceName: string): Locator {
    return this.cardByName(resourceName).getByTestId("edit-resource-button");
  }

  deleteButton(resourceName: string): Locator {
    return this.cardByName(resourceName).getByTestId("delete-resource-button");
  }

  async edit(resourceName: string): Promise<void> {
    await this.editButton(resourceName).click();
  }

  async delete(resourceName: string): Promise<void> {
    await this.deleteButton(resourceName).click();
  }
}
