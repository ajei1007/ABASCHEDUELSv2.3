import { chromium, FullConfig } from '@playwright/test';
import { LoginHelpers } from './helpers';
import { config } from './config';

async function globalSetup(_config: FullConfig) {

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await LoginHelpers.goto(page, `${config.baseUrl}/login`);
  await LoginHelpers.login(page, config.credentials.email, config.credentials.password);

  await page.waitForURL(`${config.baseUrl}/admin/scheduler`);
  await context.storageState({ path: 'testing/auth.json' });
  await browser.close();
}

export default globalSetup;
