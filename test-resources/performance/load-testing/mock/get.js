import http from 'k6/http';
import { check, sleep } from 'k6';
import getData from '../../utilities/getdata.js';

const mainUser = getData.userData('main-user');

export const options = {
  vus: 100,
  duration: '5m',
};

export default function () {
  const res = http.get(
    'https://services.mockapi.io.vn/mock-api/get/e135ac48-3825-4f7f-bb6e-4b520f13dd1c/v1/sea',
    {
      headers: {
        'X-API-Key': '',
        'X-Test-Source':'k6-load-test'
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