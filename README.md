
# MockApi

This website is built to generate mock APIs that support HTTP methods and return sample data for testing purposes.

## How does it work ?

When you submit a resource (including endpoint, data fields, and number of records), the server generates sample data based on the provided schema. After that, a mock API is created using the submitted information.

The mock api is structure in the following format:
`https://mockapi.io.vn/mockapi/<project id>/<version>/<endpoint>`

When a mock API is called, the mock-api services will retrieve the data and processing the data before giving the result.

Base on the type of request, it will be route to the right server by a proxy server.

\
The picture below shown how the process works

<img width="521" height="451" alt="Untitled Diagram drawio (1)" src="https://github.com/user-attachments/assets/8f98c076-8972-4f60-bd8f-fa9bec092b50" />





## How to use ?

All information about how to use it can be found at https://mockapi.io.vn/docs

## Testing

All the testing resources are located in `/test-resources` folder, which includes E2E, performance and security test.

To execute E2E testing, use Playwright

`npx playwright test`

To execute performance testing, navigate to the right folder `api` or `load-testing` and run the main file

`k6 run test.js`

Security issues are watched in Sonar Cloud, further scripts for security testing will be written soon.
