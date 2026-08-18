import { Page } from '@playwright/test';
import { navbarSelectors } from '../selectors';

export class NavbarHelpers {
  static async logout(page: Page) {
    await page.locator(navbarSelectors.avatarButton).click({ delay: 500 });
    await page.locator(navbarSelectors.logoutButton).click({ delay: 500 });
  }

  static async gotoReports(page: Page) {
    await page.locator(navbarSelectors.reportsLink).click({ delay: 500 });
  }

  static async toggleSandbox(page: Page, enabled: boolean) {
    const isChecked = await page.locator(navbarSelectors.sandboxToggle).isChecked();
    if (isChecked !== enabled) {
      await page.locator(navbarSelectors.sandboxToggle).click({ delay: 750 });
    }
  }

  static async isSandboxAlertVisible(page: Page): Promise<boolean> {
    return await page.locator(navbarSelectors.sandboxAlert).isVisible();
  }
}