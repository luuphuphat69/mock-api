import { test, expect } from "@playwright/test";
import ResourcePage from "../../../page-model/resource/resource";
import ResourcePopup from "../../../page-model/resource/components-model/popup";
import ResourceCard from "../../../page-model/resource/components-model/resource-card";

const date = new Date();
const testData = (isEdit: boolean) => {
    return {
        resourceName: !isEdit ? `test-resource ${date.toString()}` : `updated-test-resource ${date.toString()}`,
        schema: [
            !isEdit ? { name: 'test-field-1', type: 'number' } : {name: 'updated-test-field-1', type: 'boolean'},
            !isEdit ? { name: 'test-field-2', type: 'string' } : {name: 'updated-test-field-2', type: 'Fake',  module: 'person.fullName'},
            !isEdit ? { name: 'test-field-3', type: 'Fake', module: 'person.firstName' }:
            { name: 'updated-test-field-3', type: 'string'}
        ],
        numberOfRecord: !isEdit ? 20 : 10
    }
}

test.describe('Resource CRUD', () => {
    test('Add new resource', async ({ page }) => {
        if(!process.env.TEST_PROJECT_ID || !process.env.TEST_USER_ID){
            throw new Error('Missing TEST_PROJECT_ID or TEST_USER_ID');
        }

        const resourcePage = new ResourcePage(page);
        const resourcePopup = new ResourcePopup(page);

        resourcePopup.setIsEdit(false)
        const data = testData(false);

        // Go to resource page -> click 'Add New Resource' button -> Wait for pop up shown up
        await resourcePage.goTo(process.env.TEST_PROJECT_ID);
        await resourcePage.clickAddNewResourceBtn();
        await expect(resourcePopup.popup).toBeVisible();
        await expect(resourcePopup.resourceNameInput).toBeEnabled();


        // After popup shown up -> Input resource name
        await resourcePopup.setResourceNameInputValue(data.resourceName);

        // loop at schema test data (except default id) -> select options
        for (let i = 1; i <= data.schema.length; i++) {
            // set (i)th schema line
            resourcePopup.setSelectedSchemaPosition(i);
            await resourcePopup.addFieldButton.click();

            //After click 'Add field' button -> Wait for input to shown up
            await expect(resourcePopup.schemaInput).toBeVisible();

            // Set values
            await resourcePopup.setSchemaInputValue(data.schema[i - 1].name)
            await resourcePopup.dataTypeOption.selectOption(data.schema[i - 1].type);

            if (
                data.schema[i - 1].type === 'Fake' &&
                data.schema[i - 1].module !== undefined &&
                data.schema[i - 1].module !== null
            ) {
                // Wait for fake module dropdown shown up
                await expect(resourcePopup.fakerModuleButton).toBeVisible();
                await resourcePopup.fakerModuleButton.click();

                // After click the dropdown -> Wait for the container, which store all the options to shown up
                await expect(resourcePopup.fakerModuleOptionContainer).toBeVisible();

                // Select option
                const option = resourcePopup.getFakerModuleOption(data.schema[i - 1].module!);
                await option.click();
            }
        }
        await resourcePopup.numberOfRecorsInput.fill(data.numberOfRecord.toString());
        await resourcePopup.submitButton.click();
        await expect(resourcePopup.popup).toBeHidden();

        await resourcePage.goTo(process.env.TEST_PROJECT_ID);
        const addedResource = resourcePage.resourceContainer.getByText(data.resourceName);
        await expect(addedResource).toBeVisible();
    }),

    test('Update resource', async ({page}) => {
        if(!process.env.TEST_PROJECT_ID || !process.env.TEST_USER_ID){
            throw new Error('Missing TEST_PROJECT_ID or TEST_USER_ID');
        }

        const resourcePage = new ResourcePage(page);
        const resourcePopup = new ResourcePopup(page);
        const resourceCard = new ResourceCard(page);

        resourcePopup.setIsEdit(true)
        const data = testData(true)
        
        await resourcePage.goTo(process.env.TEST_PROJECT_ID);
        await expect(resourceCard.card).toBeVisible();
        await resourceCard.editButton.click();
        await expect(resourcePopup.popup).toBeVisible();
        await resourcePopup.setResourceNameInputValue(data.resourceName);
        
        for(let i = 1; i <= data.schema.length; i++){
            resourcePopup.setSelectedSchemaPosition(i);
            await resourcePopup.setSchemaInputValue(data.schema[i - 1].name)
            await resourcePopup.dataTypeOption.selectOption(data.schema[i - 1].type);

            if (
                data.schema[i - 1].type === 'Fake' &&
                data.schema[i - 1].module !== undefined &&
                data.schema[i - 1].module !== null
            ) {
                // Wait for fake module dropdown shown up
                await expect(resourcePopup.fakerModuleButton).toBeVisible();
                await resourcePopup.fakerModuleButton.click();

                // After click the dropdown -> Wait for the container, which store all the options to shown up
                await expect(resourcePopup.fakerModuleOptionContainer).toBeVisible();

                // Select option
                const option = resourcePopup.getFakerModuleOption(data.schema[i - 1].module!);
                await option.click();
            }
        }
        await resourcePopup.numberOfRecorsInput.fill(data.numberOfRecord.toString());
        await resourcePopup.submitButton.click();
        await expect(resourcePopup.popup).toBeHidden();

        const updatedResource = resourcePage.resourceContainer.getByText(data.resourceName);
        await expect(updatedResource).toBeVisible();
    })

    test('Delete resource', async ({ page }) => {
        if (!process.env.TEST_PROJECT_ID || !process.env.TEST_USER_ID) {
            throw new Error('Missing TEST_PROJECT_ID or TEST_USER_ID');
        }

        const resourcePage = new ResourcePage(page);
        const resourceCard = new ResourceCard(page);

        await resourcePage.goTo(process.env.TEST_PROJECT_ID);
        const resources =  resourcePage.resourceContainer.getByTestId('resource-card')
        // wait until resources are rendered
        await expect(resources.first()).toBeVisible({ timeout: 10_000 });
        let total = await resources.count();

        resourceCard.setSelectedCardPosition(0);
        await resourceCard.deleteButton.click();

        await expect(resources).toHaveCount(total - 1)
    })
})