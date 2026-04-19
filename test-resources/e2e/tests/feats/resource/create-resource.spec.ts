import { expect, test, type APIRequestContext } from "@playwright/test";
import ResourcePage from "../../../page-model/resource/ResourcePage";
import ResourceFormModal from "../../../page-model/resource/components/ResourceFormModal";
import ResourceDataModal from "../../../page-model/resource/components/ResourceDataModal";
import {
  buildCreateResourceWithAllFakeModulesData,
  RESOURCE_NAME_PREFIX,
  type ResourceCreateTestData,
} from "../../../utilities/resource-test-data";

async function cleanupGeneratedResources(
  request: APIRequestContext,
  userId: string,
  projectId: string,
): Promise<void> {
  const response = await request.get(`/api/resources/${userId}/${projectId}`);

  if (!response.ok()) {
    return;
  }

  const resources = (await response.json()) as Array<{ _id: string; name: string }>;

  for (const resource of resources) {
    if (!resource.name.startsWith(RESOURCE_NAME_PREFIX)) {
      continue;
    }

    await request.delete(`/api/resources/${userId}/${projectId}/${resource._id}`);
  }
}

test.describe("Resource Create", () => {
  let resourcePage: ResourcePage;
  let resourceFormModal: ResourceFormModal;
  let resourceDataModal: ResourceDataModal;
  let projectId: string;
  let userId: string;
  let testData: ResourceCreateTestData;

  test.beforeEach(async ({ page }) => {
    if (!process.env.TEST_PROJECT_ID || !process.env.TEST_USER_ID) {
      throw new Error("Missing TEST_PROJECT_ID or TEST_USER_ID");
    }

    projectId = process.env.TEST_PROJECT_ID;
    userId = process.env.TEST_USER_ID;
    testData = buildCreateResourceWithAllFakeModulesData();

    resourcePage = new ResourcePage(page);
    resourceFormModal = new ResourceFormModal(page);
    resourceDataModal = new ResourceDataModal(page);

    await cleanupGeneratedResources(page.request, userId, projectId);
    await resourcePage.goto(projectId);
  });

  test.afterEach(async ({ page }) => {
    if (!process.env.TEST_PROJECT_ID || !process.env.TEST_USER_ID) {
      return;
    }

    await cleanupGeneratedResources(
      page.request,
      process.env.TEST_USER_ID,
      process.env.TEST_PROJECT_ID,
    );
  });

   test("create new resource with all fake modules and show data in every column", async () => {
    test.slow();
    test.setTimeout(180_000);

    await resourcePage.clickAddNewResourceButton();
    await expect(resourceFormModal.popup).toBeVisible();

    await resourceFormModal.fillResourceName(testData.resourceName);

    for (let index = 0; index < testData.fields.length; index += 1) {
      await resourceFormModal.addSchemaField(index + 1, testData.fields[index]);
    }

    await resourceFormModal.fillRecordCount(testData.recordCount);
    await resourceFormModal.submit();
    await expect(resourceFormModal.popup).toBeHidden();

    const createdResourceCard = resourcePage.resourceCardByName(testData.resourceName);
    await expect(createdResourceCard).toBeVisible();

    await resourcePage.openResourceCard(testData.resourceName);
    await expect(
      resourceDataModal.heading(testData.resourceName, testData.recordCount),
    ).toBeVisible();

    for (let columnIndex = 0; columnIndex < testData.expectedColumns.length; columnIndex += 1) {
      await expect(
        resourceDataModal.columnHeader(testData.expectedColumns[columnIndex]),
      ).toBeVisible();
      await expect(resourceDataModal.firstRowCell(columnIndex)).toHaveText(/\S+/);
    }
  });
});
