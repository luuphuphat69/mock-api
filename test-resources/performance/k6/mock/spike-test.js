import { loadGet, loadPost, loadPatch, loadPut } from './mock/http.js';

export { loadGet, loadPost, loadPatch, loadPut };

export const options = {
  scenarios: {

    get_spike_test: {
      executor: 'ramping-vus',
      stages: [
        { duration: '2m', target: 20 },
        { duration: '3m', target: 50 },
        { duration: '30s', target: 500 },
        { duration: '1m', target: 500 }, 
        { duration: '1m', target: 50 }, 
        { duration: '1m', target: 0 },  
      ],
      gracefulRampDown: '30s',
      exec: 'loadGet',
    },

    post_spike_test: {
      executor: 'ramping-vus',
      stages: [
        { duration: '2m', target: 10 },
        { duration: '2m', target: 30 },
        { duration: '20s', target: 300 },
        { duration: '1m', target: 300 },
        { duration: '1m', target: 30 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
      startTime: '1m',
      exec: 'loadPost',
    },

    put_spike_test: {
      executor: 'ramping-vus',
      stages: [
        { duration: '2m', target: 10 },
        { duration: '2m', target: 40 },
        { duration: '20s', target: 250 },
        { duration: '1m', target: 250 },
        { duration: '1m', target: 40 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
      startTime: '2m',
      exec: 'loadPut',
    },

    patch_spike_test: {
      executor: 'ramping-vus',

      stages: [
        { duration: '2m', target: 10 },
        { duration: '2m', target: 25 },
        { duration: '15s', target: 200 },
        { duration: '1m', target: 200 },
        { duration: '1m', target: 25 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
      startTime: '3m',
      exec: 'loadPatch',
    },
  },

  thresholds: {
    // GET
    'http_req_failed{scenario:get_spike_test}': ['rate<0.01'],
    'http_req_duration{scenario:get_spike_test}': ['p(95)<3000'],

    // POST
    'http_req_failed{scenario:post_spike_test}': ['rate<0.01'],
    'http_req_duration{scenario:post_spike_test}': ['p(95)<3000'],

    // PUT
    'http_req_failed{scenario:put_spike_test}': ['rate<0.01'],
    'http_req_duration{scenario:put_spike_test}': ['p(95)<3000'],

    // PATCH
    'http_req_failed{scenario:patch_spike_test}': ['rate<0.01'],
    'http_req_duration{scenario:patch_spike_test}': ['p(95)<3000'],
  },
};