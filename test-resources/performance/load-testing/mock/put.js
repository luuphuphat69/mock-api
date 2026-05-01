import http from 'k6/http';
import { check, sleep } from 'k6';
import getData from '../../utilities/getdata.js';

const mainUser = getData.userData('main-user');
const mainProject = getData.projectData('main-project');

export const options = {
  vus: 100,
  duration: '15m',
};

export default function () {
  const res = http.put(
    `https://services.mockapi.io.vn/mock-api/put/${mainProject.projectId}/${mainProject.version}/${mainProject.endpoints[0]}`,
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