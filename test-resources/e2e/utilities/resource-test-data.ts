import { FAKER_MODULES } from "../../../mock-api/app/enum/fakermodules";

export const RESOURCE_NAME_PREFIX = "e2e-resource-all-fake-modules";

export interface ResourceSchemaFieldInput {
  name: string;
  dataType: "string" | "number" | "boolean" | "fake";
  fakeType?: string;
}

export interface ResourceCreateTestData {
  resourceName: string;
  fields: ResourceSchemaFieldInput[];
  recordCount: number;
  expectedColumns: string[];
}

export function buildCreateResourceWithAllFakeModulesData(): ResourceCreateTestData {
  const resourceName = `${RESOURCE_NAME_PREFIX}-${Date.now()}`;
  const fields = FAKER_MODULES.map((moduleName) => ({
    name: moduleName,
    dataType: "fake" as const,
    fakeType: moduleName,
  }));

  return {
    resourceName,
    fields,
    recordCount: 1,
    expectedColumns: ["id", ...fields.map((field) => field.name)],
  };
}
