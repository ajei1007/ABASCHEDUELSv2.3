import { Page } from '@playwright/test';
import { appointmentSelectors } from '../selectors';
import { formatTime } from '@testing/utils/time';

export class AppointmentHelpers {
  static async chooseActivity(page: Page, activityName: string) {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.locator(appointmentSelectors.activityDropdown).click({ delay: 500 });
    const option = page.locator(appointmentSelectors.activityOption, { hasText: activityName });
    await option.first().click({ delay: 500 });
  }
  static async selectRandomEmployee(page: Page) {
    // Click the employee dropdown to open options
    const dropdown = page.locator('#Employee > .select__control');
    await dropdown.click({ delay: 500 });

    // Wait for options to be visible
    const options = page.locator('#Employee .select__option');
    await options.first().waitFor({ state: 'visible' });

    // Pick a random index between 0 and 2 (for 1-3)
    const randomIndex = Math.floor(Math.random() * 3);

    // Select the random option
    await options.nth(randomIndex).click({ delay: 500 });
  }

  static async addEvent(page: Page) {
    await page.locator(appointmentSelectors.addEventSubmit).click({ delay: 750 });
  }

  static async updateEvent(page: Page) {
    await page.locator(appointmentSelectors.updateEventButton).click({ delay: 750 });
  }

  static async deleteAppointment(page: Page) {
    await page.locator(appointmentSelectors.deleteButton).click({ delay: 500 });
  }
  static async deleteRecurringAppointment(page: Page) {
    await page.locator(appointmentSelectors.deleteButton).click({ delay: 500 });
    await page.locator('.MuiStack-root.css-1ov46kg > .w-100 > .select__control > .select__indicators > .select__indicator').click({ delay: 500 });
    await page.getByRole('option', { name: 'All These Recurring Events' }).click({delay: 500});

  }

  static async cancelSingle(page: Page, startTime: string, endTime: string, activity: string, cancelReason: string = 'PTO') {
    // Click the cancel single button
    await page.locator(appointmentSelectors.cancelSingleButton).click({ delay: 500 });
    
    // Select cancel reason
    await page.locator(appointmentSelectors.cancelReasonDropdown).click();
    await page.locator(appointmentSelectors.cancelReasonOption(cancelReason)).click();
    
    // Update the event
    await this.updateEvent(page);
    
    // Return the canceled event locator for assertion in test
    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endTime);
    await page.waitForTimeout(2000);
    return page.locator(appointmentSelectors.canceledStatusEvent(formattedStartTime, formattedEndTime, activity)).isVisible();
  
  }

  static async cancelAll(page: Page) {
    await page.locator(appointmentSelectors.cancelAllButton).click({ delay: 500 });
  }

  static async markUnavailable(page: Page) {
    await page.locator(appointmentSelectors.markUnavailableButton).click({ delay: 500 });
  }

  static async fillNotes(page: Page, notes: string) {
    await page.locator(appointmentSelectors.notesField).fill(notes);
  }
}