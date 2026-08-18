import { Page, expect } from '@playwright/test';
import { loginSelectors, dashboardSelectors } from '../selectors';

export class LoginHelpers {
  static async goto(page: Page, fullUrl?: string) {
    if (fullUrl) {
      await page.goto(fullUrl);
    } else {
      await page.goto('/login');
    }
  }

  static async login(page: Page, email: string, password: string) {
    await page.locator(loginSelectors.emailInput).fill(email);
    await page.locator(loginSelectors.passwordInput).fill(password);
    await page.locator(loginSelectors.submitButton).click();
  }

  static async isLoggedIn(page: Page): Promise<boolean> {
    await page.locator(dashboardSelectors.notificationButton).waitFor({ state: 'visible' });
    return page.locator(dashboardSelectors.notificationButton).isVisible();
  }
}