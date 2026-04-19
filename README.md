
# MockApi

This website is built to generate mock APIs that support HTTP methods and return sample data for testing purposes.

## How does it work ?

When you submit a resource (including endpoint, data fields, and number of records), the server generates sample data based on the provided schema. After that, a mock API is created using the submitted information.

The mock api is structure in the following format:
`https://mockapi.io.vn/mockapi/<project id>/<version>/<endpoint>`

When a mock API is called:
1. The request is routed through a Cloudflare Worker.
2. It is redirected to a specific API gateway based on the HTTP method.
3. A serverless Lambda function is triggered to process the request.
4. The response is returned through Cloudflare and displayed in the API Tester modal.

\
The picture below shown how the process works

<img width="721" height="758" alt="Untitled Diagram drawio (2)" src="https://github.com/user-attachments/assets/f91b0f63-8cb5-486c-8cec-6e19c4198977" />



## How to use ?

All information about how to use it can be found at https://mockapi.io.vn/docs

## Testing

All the testing resources are located in `/test-resources` folder, which includes E2E, performance and security test.

To execute E2E testing, use Playwright

`npx playwright test`

To execute performance testing, navigate to the right folder `api` or `load-testing` and run the main file

`k6 run test.js`

Security issues are watched in Sonar Cloud, further scripts for security testing will be written soon.
