import http from 'k6/http';
import { check } from 'k6';
import getData from '../../utilities/getdata.js';

const mainUser = getData.userData('main-user');
const mainProject = getData.projectData('main-project');
const record = '684046a6-2c63-4605-9973-86c45a9307b0';

export function loadGet () {
  const res = http.get(
    `https://services.mockapi.io.vn/mock-api/get/${mainProject.projectId}/${mainProject.version}/${mainProject.endpoints[0]}`,
    {
      headers: {
        'X-API-Key': mainProject.key,
        'X-Test-Source': 'k6-load-test',
      },
      cookies: {
        token: mainUser.token,
      },
    }
  );

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 3000ms': (r) => r.timings.duration < 3000,
  });
}

export function loadPatch () {
  const res = http.patch(
    `https://services.mockapi.io.vn/mock-api/patch/${mainProject.projectId}/${mainProject.version}/${mainProject.endpoints[0]}`,
    {
      headers: {
        'X-API-Key': '', // manual input x-api-key
        'X-Test-Source':'k6-load-test'
      },
      cookies: {
        token: '' // manual input cookies token value
      },
    }
  );

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 3000ms': (r) => r.timings.duration < 3000,
  });
}

export function loadPut () {
  const res = http.put(
    `https://services.mockapi.io.vn/mock-api/put/${mainProject.projectId}/${mainProject.version}/${mainProject.endpoints[0]}/${record}`,
    {
      headers: {
        'X-API-Key': '', // manual input x-api-key
        'X-Test-Source':'k6-load-test'
      },
      cookies: {
        token: '' // manual input cookies token value
      },
    }
  );

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 3000ms': (r) => r.timings.duration < 3000,
  });
}

export function loadPost () {
  const res = http.post(
    `https://services.mockapi.io.vn/mock-api/post/${mainProject.projectId}/${mainProject.version}/${mainProject.endpoints[0]}`,
    {
      headers: {
        'X-API-Key': '', // manual input x-api-key
        'X-Test-Source':'k6-load-test'
      },
      cookies: {
        token: '' // manual input cookies token value
      },
    }
  );

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 3000ms': (r) => r.timings.duration < 3000,
  });
}