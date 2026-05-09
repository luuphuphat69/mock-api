import { loadGet, loadPost, loadPatch, loadPut } from './http.js';

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
      executor: 'constant-vus',
      vus: 50,
      duration: '5m',
      startTime: '6m',
      exec: 'loadPost',
    },

    put_test: {
      executor: 'constant-vus',
      vus: 50,
      duration: '5m',
      startTime: '12m',
      exec: 'loadPut',
    },

    patch_test: {
      executor: 'constant-vus',
      vus: 50,
      duration: '5m',
      startTime: '18m',
      exec: 'loadPatch',
    },
  },

  thresholds: {
    'http_req_failed{scenario:get_test}': ['rate<0.01'],
    'http_req_failed{scenario:post_test}': ['rate<0.01'],
    'http_req_failed{scenario:put_test}': ['rate<0.01'],
    'http_req_failed{scenario:patch_test}': ['rate<0.01'],

    'http_req_duration{scenario:get_test}': ['p(95)<3000'],
    'http_req_duration{scenario:post_test}': ['p(95)<3000'],
    'http_req_duration{scenario:put_test}': ['p(95)<3000'],
    'http_req_duration{scenario:patch_test}': ['p(95)<3000'],
  },
};