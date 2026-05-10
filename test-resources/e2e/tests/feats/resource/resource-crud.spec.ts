import { expect, test, type APIRequestContext } from "@playwright/test";
import ResourcePage from "../../../page-model/resource/ResourcePage";
import ResourceCard from "../../../page-model/resource/components/ResourceCard";
import ResourceFormModal from "../../../page-model/resource/components/ResourceFormModal";
import type { ResourceSchemaFieldInput } from "../../../utilities/resource-test-data";

const RESOURCE_CRUD_PREFIX = "e2e-resource-crud";

interface ResourceCrudData {
  resourceName: string;
  fields: ResourceSchemaFieldInput[];
  recordCount: number;
}

function buildResourceData(nameSuffix: string): ResourceCrudData {
  return {
    resourceName: `${RESOURCE_CRUD_PREFIX}-${nameSuffix}-${Date.now()}`,
    fields: [
      { name: "status", dataType: "boolean" },
      { name: "title", dataType: "string" },
      { name: "owner", dataType: "fake", fakeType: "person.fullName" },
    ],
    recordCount: 3,
  };
}

async function cleanupCrudResources(
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
    if (resource.name.startsWith(RESOURCE_CRUD_PREFIX)) {
      await request.delete(`/api/resources/${userId}/${projectId}/${resource._id}`);
    }
  }
}

test.describe("Resource CRUD", () => {
  let resourcePage: ResourcePage;
  let resourceCard: ResourceCard;
  let resourceFormModal: ResourceFormModal;
  let projectId: string;
  let userId: string;

  test.beforeEach(async ({ page }) => {
    if (!process.env.TEST_PROJECT_ID || !process.env.TEST_USER_ID) {
      throw new Error("Missing TEST_PROJECT_ID or TEST_USER_ID");
    }

    projectId = process.env.TEST_PROJECT_ID;
    userId = process.env.TEST_USER_ID;

    resourcePage = new ResourcePage(page);
    resourceCard = new ResourceCard(page);
    resourceFormModal = new ResourceFormModal(page);

    await cleanupCrudResources(page.request, userId, projectId);
    await resourcePage.goto(projectId);
  });

  test.afterEach(async ({ page }) => {
    if (!process.env.TEST_PROJECT_ID || !process.env.TEST_USER_ID) {
      return;
    }

    await cleanupCrudResources(page.request, userId, projectId);
  });

  test("create resource successfully", async () => {
    const resourceData = buildResourceData("create");

    await createResource(resourceData);

    await expect(resourcePage.resourceCardByName(resourceData.resourceName)).toBeVisible();
  });

  test("update resource successfully", async () => {
    const resourceData = buildResourceData("update");
    const updatedData: ResourceCrudData = {
      resourceName: `${resourceData.resourceName}-updated`,
      fields: [
        { name: "isActive", dataType: "boolean" },
        { name: "fullName", dataType: "fake", fakeType: "person.fullName" },
        { name: "score", dataType: "number" },
      ],
      recordCount: 5,
    };

    await createResource(resourceData);
    await expect(resourcePage.resourceCardByName(resourceData.resourceName)).toBeVisible();

    await resourceCard.edit(resourceData.resourceName);
    await expect(resourceFormModal.popup).toBeVisible();

    await resourceFormModal.fillResourceName(updatedData.resourceName);

    for (let index = 0; index < updatedData.fields.length; index += 1) {
      await resourceFormModal.fillSchemaField(index + 1, updatedData.fields[index]);
    }

    await resourceFormModal.fillRecordCount(updatedData.recordCount);
    await resourceFormModal.submit();
    await expect(resourceFormModal.popup).toBeHidden();

    await expect(resourcePage.resourceCardByName(updatedData.resourceName)).toBeVisible();
    await expect(resourcePage.resourceCardByName(resourceData.resourceName)).toBeHidden();
  });

  test("delete resource successfully", async () => {
    const resourceData = buildResourceData("delete");

    await createResource(resourceData);
    await expect(resourcePage.resourceCardByName(resourceData.resourceName)).toBeVisible();

    await resourceCard.delete(resourceData.resourceName);

    await expect(resourcePage.resourceCardByName(resourceData.resourceName)).toBeHidden();
  });

  async function createResource(resourceData: ResourceCrudData): Promise<void> {
    await resourcePage.clickAddNewResourceButton();
    await expect(resourceFormModal.popup).toBeVisible();

    await resourceFormModal.fillResourceName(resourceData.resourceName);

    for (let index = 0; index < resourceData.fields.length; index += 1) {
      await resourceFormModal.addSchemaField(index + 1, resourceData.fields[index]);
    }

    await resourceFormModal.fillRecordCount(resourceData.recordCount);
    await resourceFormModal.submit();
    await expect(resourceFormModal.popup).toBeHidden();
  }
});
