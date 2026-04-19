import { Locator, Page } from "@playwright/test";

export default class ResourceDataModal {
  constructor(private readonly page: Page) {}

  heading(resourceName: string, recordCount: number): Locator {
    return this.page.getByRole("heading", {
      name: `${resourceName} - ${recordCount} Data Records`,
      exact: true,
    });
  }

  get table(): Locator {
    return this.page.locator("table");
  }

  columnHeader(columnName: string): Locator {
    return this.table.getByRole("columnheader", { name: columnName, exact: true });
  }

  firstRowCell(columnIndex: number): Locator {
    return this.table.locator("tbody tr").first().locator("td").nth(columnIndex);
  }
}
