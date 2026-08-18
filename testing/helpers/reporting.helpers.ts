import { Page } from '@playwright/test';
import { reportingSelectors } from '../selectors';

export class ReportingHelpers {
  static async goto(page: Page) {
    await page.goto('/admin/statistics');
  }

  static async waitForLoad(page: Page) {
    await page.locator(reportingSelectors.chartContainer).waitFor({ state: 'visible' });
  }
}