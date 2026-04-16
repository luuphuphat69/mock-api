import testLogin from "./auth/login.js";
import testRegister from "./auth/register.js";
import { testCreateProject, testReadProjects, testEditProject, testRemoveProject} from "./project/crud.js";
import { testCreateResource, testEditResource, testReadResources, testRemoveResource} from "./resource/crud.js";
export default function () {

  //testLogin("", "");
  //testRegister();

  const newProject = testCreateProject('test', '/v0');
  testReadProjects();
  testEditProject(newProject, JSON.stringify({
        "name": "test-resource",
        "prefix": "/v1"
  }))

  const createResourcePayload = JSON.stringify({
    "name": "land",
    "schemaFields": [
      { "name": "id", "dataType": "string", "fakeType": "" }
    ],
    "records": [
      { "id": "089645b2-4566-4af0-8ec1-32682e9f64cd" },
      { "id": "f83fff9d-6c5d-4e43-ac73-d032c47aac38" }
    ]
  });
  const newResource = testCreateResource(newProject, createResourcePayload);

  if (newResource) {
    testEditResource(newProject, newResource, JSON.stringify({
      "name": "land1",
      "schemaFields": [
        { "name": "id", "dataType": "string", "fakeType": "" },
        { "name": "newField", "dataType": "fake", "fakeType": "person.firstName" }
      ],
      "records": [
        { "id": "6951b727-8d63-48c4-b4e6-5b91afa52b4a", "newField": "Noah" },
        { "id": "c59194d6-6a41-46f3-aaad-9319d0d98852", "newField": "Johanna" }
      ]
    }));
    testReadResources(newProject);
    testRemoveResource(newProject, newResource);
  }
  testRemoveProject(newProject);
}
