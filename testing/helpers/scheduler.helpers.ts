import { Page } from '@playwright/test';
import { schedulerSelectors,appointmentSelectors } from '../selectors';
import { AppointmentHelpers } from './appointment.helpers';
import { ConfirmationHelpers } from './confirmation.helpers';
import { roundTimeToInterval, timeToTotalMinutes, formatTime } from '@testing/utils/time';

export class SchedulerHelpers {
  static async goto(page: Page) {
    await page.goto('/admin/scheduler');
    await page.locator(schedulerSelectors.timelineGrid).waitFor();
    await page.waitForLoadState('networkidle');
  }

  static async expandEmployees(page: Page) {
    const expandButton = page.locator(schedulerSelectors.expandEmployeesButton).first();
    
    // Check if the span has plus icon before attempting to expand
    if (await expandButton.isVisible()) {
      await expandButton.click();
    }
  }

  static async expandEmployeeGroup(page: Page) {
    const expanderButton = page.locator(schedulerSelectors.employeeGroupExpander);
    
    // Check if the expander has plus icon before attempting to expand
    const plusIcon = expanderButton.locator('.fc-icon-plus-square');
    if (await plusIcon.isVisible()) {
      await expanderButton.click({delay: 1000});
    }
  }

  static async getEventCount(page: Page): Promise<number> {
    return await page.locator(schedulerSelectors.calendarEvent).filter({ has: page.locator(':visible') }).count();
  }

  static async getFirstEvent(page: Page) {
    return page.locator(schedulerSelectors.calendarEvent).first();
  }

  static async clickTimeline(page: Page) {
    await page.locator(schedulerSelectors.timelineGrid).click();
  }

  static async doubleClickTimeline(page: Page) {
    await page.locator(schedulerSelectors.timelineGrid).dblclick();
  }

  static async waitForFirstEvent(page: Page) {
    await page.locator(schedulerSelectors.calendarEvent).first().waitFor({ state: 'visible', timeout: 10000 });
  }

  static async clickFirstEvent(page: Page) {
    await page.locator(schedulerSelectors.calendarEvent).first().click({ delay: 500 });
  }

  static async clickSpecificEvent(page: Page, startTime: string, endTime: string, activity: string) {
    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endTime);
    const targetEvent = page.locator(`[data-qa="calendar-event"][data-activity="${activity}"][data-start-time="${formattedStartTime}"][data-end-time="${formattedEndTime}"]`).last();
    
    await targetEvent.waitFor({ state: 'visible', timeout: 5000 });
    const box = await targetEvent.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 5 });
      await page.waitForTimeout(500);
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { delay: 1000 });
    }
  }

  static async hoverAndVerifyEvent(page: Page, startTime: string, endTime: string, activity: string): Promise<boolean> {
    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endTime);
    const targetEvent = page.locator(`[data-qa="calendar-event"][data-activity="${activity}"][data-start-time="${formattedStartTime}"][data-end-time="${formattedEndTime}"]`).last();
    
    if (await targetEvent.count() > 0) {
      await targetEvent.hover();
      return true;
    }
    return false;
  }

  static async verifyEventNotVisible(page: Page, startTime: string, endTime: string, activity: string): Promise<boolean> {
    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endTime);
    const targetEvent = page.locator(
      `[data-qa="calendar-event"][data-activity="${activity}"][data-start-time="${formattedStartTime}"][data-end-time="${formattedEndTime}"]`
    );
    
    return await targetEvent.count() === 0;
  }

  static async countEventsWithSpecifications(page: Page, startTime: string, endTime: string, activity: string): Promise<number> {
    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endTime);
    const targetEvents = page.locator(
      `[data-qa="calendar-event"][data-activity="${activity}"][data-start-time="${formattedStartTime}"][data-end-time="${formattedEndTime}"]`
    );
    
    return await targetEvents.count();
  }

  static async measurePerformance(page: Page, action: () => Promise<void>): Promise<number> {
    const start = Date.now();
    await action();
    return Date.now() - start;
  }

  static async waitForEventCountChange(page: Page, originalCount: number, shouldIncrease: boolean = true): Promise<void> {
   await page.waitForTimeout(1000);
    await page.waitForFunction((args) => {
      
      const events = document.querySelectorAll('[data-qa="calendar-event"]');
      return args.shouldIncrease ? events.length > args.originalCount : events.length < args.originalCount;
    }, { originalCount, shouldIncrease }, { timeout: 10000 });
  }

  static async createAppointmentByDrag(page: Page, startTime: string, endTime: string, activity: string, isRecurring: boolean = false): Promise<void> {
    const nearestStart = roundTimeToInterval(startTime);
    const nearestEnd = roundTimeToInterval(endTime, 'previous');

    const employeeRow = page.locator(schedulerSelectors.employeeRow).first();
    const startSlot = page.locator(schedulerSelectors.timeSlotLane(nearestStart));
    const endSlot = page.locator(schedulerSelectors.timeSlotLane(nearestEnd));

    const employeeRowBox = await employeeRow.boundingBox();
    const startBox = await startSlot.boundingBox();
    const endBox = await endSlot.boundingBox();

    if (employeeRowBox && startBox && endBox) {
      const startClickFactor =
        timeToTotalMinutes(startTime) < timeToTotalMinutes(nearestStart) + 15 ? 0.25 : 0.75;
      const endClickFactor =
        timeToTotalMinutes(endTime) <= timeToTotalMinutes(nearestEnd) + 15 ? 0.25 : 0.75;

      const startX = startBox.x + startBox.width * startClickFactor;
      const startY = employeeRowBox.y + employeeRowBox.height / 2;
      const endX = endBox.x + endBox.width * endClickFactor;
      const endY = employeeRowBox.y + employeeRowBox.height / 2;

      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(endX, endY);
      await page.mouse.up();
    }

    // Complete the appointment creation by choosing the specified activity and submitting
    await AppointmentHelpers.chooseActivity(page, activity);
    if(isRecurring)
    {
      await page.getByRole('button', { name: appointmentSelectors.dateRangeButton, exact: true }).click();
      await page.getByRole('button', { name: appointmentSelectors.firstDayButton, exact: true }).first().click();
      await page.getByRole('button', { name: appointmentSelectors.lastDayButton }).nth(2).click();
      await page.getByRole('button', { name: appointmentSelectors.applyButton }).click();
    }
    await AppointmentHelpers.addEvent(page);
  }

  static async dragEventAndVerifyChange(page: Page): Promise<boolean> {
    const beforeSnapshot = await page.screenshot();
    const event = await this.getFirstEvent(page);
    const box = await event.boundingBox();
    
    if (!box) throw new Error('Could not get bounding box for the event');
    
    // Use mouse actions for more reliable dragging
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    const endX = startX + 50;
    const endY = startY;
    
    // Use hover to position mouse, then drag to a specific coordinate
    await event.hover();
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 10 });
    await page.mouse.up();
    // Confirm the update if a confirmation dialog appears
    await ConfirmationHelpers.update(page);
    await page.waitForLoadState('networkidle');
    
    const afterSnapshot = await page.screenshot();
    return !beforeSnapshot.equals(afterSnapshot);
  }
}