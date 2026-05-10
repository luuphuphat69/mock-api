import { Locator, Page } from "@playwright/test";
import type { ResourceSchemaFieldInput } from "../../../utilities/resource-test-data";

export default class ResourceFormModal {
  constructor(private readonly page: Page) {}

  get popup(): Locator {
    return this.page.getByTestId("resource-form-modal");
  }

  get resourceNameInput(): Locator {
    return this.popup.locator("#resource-name");
  }

  get addFieldButton(): Locator {
    return this.popup.getByRole("button", { name: "Add Field" });
  }

  get recordCountInput(): Locator {
    return this.popup.locator('input[type="number"]');
  }

  get submitButton(): Locator {
    return this.popup.getByRole("button", { name: /Create|Update/ });
  }

  get fakeModuleOptionsContainer(): Locator {
    return this.page.getByTestId("faker-modules-container");
  }

  private get fieldNameInputs(): Locator {
    return this.popup.getByPlaceholder("Field Name");
  }

  private schemaRow(index: number): Locator {
    return this.fieldNameInputs
      .nth(index)
      .locator("xpath=ancestor::div[contains(@class,'flex-col')][1]");
  }

  fieldNameInput(index: number): Locator {
    return this.fieldNameInputs.nth(index);
  }

  dataTypeSelect(index: number): Locator {
    return this.schemaRow(index).getByTestId("select-data-type");
  }

  fakeModuleButton(index: number): Locator {
    return this.schemaRow(index).getByTestId("select-module-button");
  }

  fakeModuleSearchInput(): Locator {
    return this.fakeModuleOptionsContainer.getByPlaceholder("Search modules...");
  }

  fakeModuleOption(moduleName: string): Locator {
    return this.fakeModuleOptionsContainer.getByRole("button", {
      name: moduleName,
      exact: true,
    });
  }

  async fillResourceName(resourceName: string): Promise<void> {
    await this.resourceNameInput.fill(resourceName);
  }

  async fillRecordCount(recordCount: number): Promise<void> {
    await this.recordCountInput.fill(recordCount.toString());
  }

  async addSchemaField(index: number, field: ResourceSchemaFieldInput): Promise<void> {
    await this.addFieldButton.click();
    await this.fillSchemaField(index, field);
  }

  async fillSchemaField(index: number, field: ResourceSchemaFieldInput): Promise<void> {
    await this.fieldNameInput(index).fill(field.name);
    await this.dataTypeSelect(index).selectOption(field.dataType);

    if (field.dataType === "fake") {
      if (!field.fakeType) {
        throw new Error("fakeType is required for fake schema fields");
      }

      await this.fakeModuleButton(index).click();
      await this.fakeModuleSearchInput().fill(field.fakeType);
      await this.fakeModuleOption(field.fakeType).click();
    }
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
