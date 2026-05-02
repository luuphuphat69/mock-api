import http from 'k6/http';
import { check } from 'k6';
import getData from '../../utilities/getdata.js';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const mainUser = getData.userData('main-user');
const mainProject = getData.projectData('main-project');
const params = {
  headers: {
    'X-API-Key': mainProject.key,
    'X-Test-Source': 'k6-load-test',
    'Content-Type': 'application/json',
  },
  cookies: {
    token: mainUser.token,
  },
}
const payloadObj = {
  id: "1b20838f-031e-4a1b-afcd-da8b5e602866",
  name: "test"
};
const payload = JSON.stringify(payloadObj);
const postPayload = JSON.stringify({
  id: uuidv4(),
  name: 'test'
});

export function loadGet () {
  const url = `https://services.mockapi.io.vn/mock-api/get/${mainProject.projectId}/${mainProject.version}/${mainProject.endpoints[0]}`;

  const res = http.get(url, {
    ...params,
    tags: { endpoint: 'GET' },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 3000ms': (r) => r.timings.duration < 3000,
  });
}

export function loadPatch () {
  const url = `https://services.mockapi.io.vn/mock-api/patch/${mainProject.projectId}/${mainProject.version}/${mainProject.endpoints[0]}/${payloadObj.id}`;
  const res = http.patch(url, payload, {
    ...params,
    tags: { endpoint: 'PATCH' },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 3000ms': (r) => r.timings.duration < 3000,
  });
}

export function loadPut () {
  const url = `https://services.mockapi.io.vn/mock-api/put/${mainProject.projectId}/${mainProject.version}/${mainProject.endpoints[0]}/${payloadObj.id}`;

  const res = http.put(url, payload, {
    ...params,
    tags: { endpoint: 'PUT' },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 3000ms': (r) => r.timings.duration < 3000,
  });
}

export function loadPost () {
  const postPayload = JSON.stringify({
    id: uuidv4(),
    name: 'test'
  });

  const url = `https://services.mockapi.io.vn/mock-api/post/${mainProject.projectId}/${mainProject.version}/${mainProject.endpoints[0]}`;

  const res = http.post(url, postPayload, {
    ...params,
    tags: { endpoint: 'POST' },
  });

  check(res, {
    'status is 201': (r) => r.status === 201,
    'response time < 3000ms': (r) => r.timings.duration < 3000,
  });
}