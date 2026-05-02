import { loadGet, loadPost, loadPatch, loadPut } from './mock/http.js';

export { loadGet, loadPost, loadPatch, loadPut };
export const options = {
  scenarios: {
    get_test: {
      executor: 'constant-vus',
      vus: 100,
      duration: '5m',
      exec: 'loadGet',
    },
    post_test: {
      executor: 'constant-arrival-rate',
      rate: 60,
      timeUnit: '1m',
      duration: '5m',
      preAllocatedVUs: 5,
      maxVUs: 20,
      startTime: '6m',
      exec: 'loadPost',
    },
    put_test: {
      executor: 'constant-arrival-rate',
      rate: 60,
      timeUnit: '1m',
      duration: '5m',
      preAllocatedVUs: 5,
      maxVUs: 20,
      startTime: '12m',
      exec: 'loadPut',
    },
    patch_test: {
      executor: 'constant-arrival-rate',
      rate: 60,
      timeUnit: '1m',
      duration: '5m',
      preAllocatedVUs: 5,
      maxVUs: 20,
      startTime: '18m',
      exec: 'loadPatch',
    },
  },

  thresholds: {
    // 🔹 Scenario-based
    'http_req_failed{scenario:get_test}': ['rate<0.01'],
    'http_req_failed{scenario:post_test}': ['rate<0.01'],
    'http_req_failed{scenario:put_test}': ['rate<0.01'],
    'http_req_failed{scenario:patch_test}': ['rate<0.01'],

    'http_req_duration{scenario:get_test}': ['p(95)<3000'],
    'http_req_duration{scenario:post_test}': ['p(95)<3000'],
    'http_req_duration{scenario:put_test}': ['p(95)<3000'],
    'http_req_duration{scenario:patch_test}': ['p(95)<3000'],

    // 🔹 Endpoint-based (custom tags)
    'http_req_failed{endpoint:GET}': ['rate<0.01'],
    'http_req_failed{endpoint:POST}': ['rate<0.01'],
    'http_req_failed{endpoint:PUT}': ['rate<0.01'],
    'http_req_failed{endpoint:PATCH}': ['rate<0.01'],
  },
};