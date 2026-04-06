import { test as setup, expect } from '@playwright/test';
import path from 'path';
import LoginPage from '../page-model/auth/Login';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page, context }) => {
  if (!process.env.TEST_USER || !process.env.TEST_PASS) {
    throw new Error('Missing TEST_USER or TEST_PASS env vars');
  }

  const loginPage = new LoginPage(page);
  await loginPage.goTo();

  await loginPage.fillEmail(process.env.TEST_USER);
  await loginPage.fillPassword(process.env.TEST_PASS);

  await Promise.all([
    page.waitForURL('/'), // relies on baseURL
    loginPage.submitLoginBtn(),
  ]);

  const cookies = await context.cookies();
  const tokenCookie = cookies.find(c => c.name === 'token');

  expect(tokenCookie, 'Auth token cookie should exist').toBeTruthy();
  expect(tokenCookie?.value).not.toBe('');

  await context.storageState({ path: authFile });
});
