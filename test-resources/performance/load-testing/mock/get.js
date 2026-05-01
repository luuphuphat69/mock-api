import http from 'k6/http';
import { check } from 'k6';
import getData from '../../utilities/getdata.js';

const mainUser = getData.userData('main-user');
const mainProject = getData.projectData('main-project');

export const options = {
  vus: 100,
  duration: '30m',
};

export default function () {
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