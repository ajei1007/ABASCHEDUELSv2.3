import { Page } from '@playwright/test';
import { confirmationSelectors } from '../selectors';

export class ConfirmationHelpers {
  static async confirm(page: Page) {
    const confirmButton = page.locator(confirmationSelectors.confirmButton);
    if (await confirmButton.isVisible()) {
      await confirmButton.click({ delay: 500 });
    }
  }
  static async update(page: Page) {
    const updateButton = page.locator(confirmationSelectors.updateButton);
    if (await updateButton.isVisible()) {
      await updateButton.click({delay:1000});
    }
  }

  static async cancel(page: Page) {
    const cancelButton = page.locator(confirmationSelectors.cancelButton);
    if (await cancelButton.isVisible()) {
      await cancelButton.click({ delay: 500 });
    }
  }
  static async delete(page: Page) {
    const deleteButton = page.locator(confirmationSelectors.confirmButton);
    if (await deleteButton.isVisible()) {
      await deleteButton.click({ delay: 500 });
    await page.waitForResponse(response => 
      response.url().includes('remove') && 
      response.status() === 200
    );
    }
  }
}