import { test, expect, Page } from '@playwright/test';
import {
  LoginHelpers,
  NavbarHelpers,
  SchedulerHelpers,
  AppointmentHelpers,
  ConfirmationHelpers,
  ReportingHelpers,
  UserHelpers
} from '../helpers';
import {
  loginSelectors,
  schedulerSelectors,
  navbarSelectors,
  appointmentSelectors
} from '../selectors';
import { config } from '../config';
import { generateUniqueName, generateUniqueEmail } from '../utils/random';

const EMAIL = config.credentials.email;
const PASSWORD = config.credentials.password;

test.describe('Critical happy-path SMK-001 to SMK-020', () => {
  let page: Page;

  test.beforeEach(async ({ page: p }) => {
    page = p;
  });

test.use({ storageState: undefined });

  test('SMK-001: Login with valid user', async () => {
    await LoginHelpers.goto(page);
    await expect(LoginHelpers.isLoggedIn(page)).resolves.toBe(true);
  });

test.use({ storageState: 'testing/auth.json' });

  test('SMK-002: Load daily scheduler timeline', async () => {
    test.skip(); // Performance is not consistent
    const duration = await SchedulerHelpers.measurePerformance(page, async () => {
      await SchedulerHelpers.goto(page);
    });
    expect(duration).toBeLessThanOrEqual(10000);
  });

  test('SMK-003: Toggle Sandbox mode', async () => {
    await SchedulerHelpers.goto(page);
    await expect(NavbarHelpers.isSandboxAlertVisible(page)).resolves.toBe(false);
    await NavbarHelpers.toggleSandbox(page, true);
    await expect(NavbarHelpers.isSandboxAlertVisible(page)).resolves.toBe(true);
    await expect(page.locator(navbarSelectors.sandboxToggle)).toBeChecked();
  });

  test('SMK-004: Logout & session cleared', async () => {
    await SchedulerHelpers.goto(page);
    await LoginHelpers.isLoggedIn(page);
    await NavbarHelpers.logout(page);
    await expect(page.locator(loginSelectors.emailInput)).toBeVisible();
  });

  test('SMK-005: Create new appointment via drag on timeline', async () => {
    await SchedulerHelpers.goto(page);
    await SchedulerHelpers.expandEmployeeGroup(page);
    await page.waitForTimeout(2000);
    const beforeCount = await SchedulerHelpers.getEventCount(page);
    await SchedulerHelpers.createAppointmentByDrag(page, '9:00am', '10:00am', 'Admin');
    await SchedulerHelpers.waitForEventCountChange(page, beforeCount, true);
    const afterCount = await SchedulerHelpers.getEventCount(page);
    expect(afterCount).toBeGreaterThan(beforeCount);
  });

  test('SMK-006: Drag-and-drop existing appointment', async () => {
    await SchedulerHelpers.goto(page);
    await SchedulerHelpers.expandEmployeeGroup(page);
    await SchedulerHelpers.waitForFirstEvent(page);
    const hasChanged = await SchedulerHelpers.dragEventAndVerifyChange(page);
    expect(hasChanged).toBe(true);
  });

  test('SMK-007: Edit appointment details', async () => {
    await SchedulerHelpers.goto(page);
    await SchedulerHelpers.expandEmployeeGroup(page);
    await SchedulerHelpers.createAppointmentByDrag(page, '11:00am', '12:00pm', 'Direct 1:1');
    await SchedulerHelpers.waitForFirstEvent(page);
    await page.waitForTimeout(4000);
    await SchedulerHelpers.clickSpecificEvent(page, '11:00am', '12:00pm', 'Direct 1:1');
    await page.waitForTimeout(4000);
    await AppointmentHelpers.chooseActivity(page, "Admin");
    await AppointmentHelpers.updateEvent(page);
    await page.waitForTimeout(4000);
    await SchedulerHelpers.hoverAndVerifyEvent(page, '11:00am', '12:00pm', 'Admin');
  });

  test('SMK-008: Verify specific appointment exists', async () => {
    await SchedulerHelpers.goto(page);
    await SchedulerHelpers.expandEmployeeGroup(page);
    await SchedulerHelpers.waitForFirstEvent(page);
    await page.waitForTimeout(4000);
    const isEventUpdated = await SchedulerHelpers.hoverAndVerifyEvent(page, '11:00am', '12:00pm', 'Admin');
    expect(isEventUpdated).toBe(true);
  });

  test('SMK-009: Cancel this occurrence only - White X', async () => {
    await SchedulerHelpers.goto(page);
    await SchedulerHelpers.expandEmployeeGroup(page);
    await SchedulerHelpers.createAppointmentByDrag(page, '1:00pm', '2:00pm', 'Admin');
    await page.waitForTimeout(2000);
    await SchedulerHelpers.waitForFirstEvent(page);
    await page.waitForTimeout(4000);
    await SchedulerHelpers.clickSpecificEvent(page, '1:00pm', '2:00pm', 'Admin');
    await page.waitForTimeout(2000);
    await AppointmentHelpers.cancelSingle(page, '1:00pm', '2:00pm', 'Admin', 'PTO');
  });

  test('SMK-010: Verify cancelled event exists', async () => {
    await SchedulerHelpers.goto(page);
    await SchedulerHelpers.expandEmployeeGroup(page);
    await SchedulerHelpers.waitForFirstEvent(page);
    await page.waitForTimeout(2000);
    expect(await page.locator(appointmentSelectors.canceledStatusEvent("1pm", "2pm", "Admin")).first().isVisible()).toBe(true);
  });

  test('SMK-011: Delete appointment', async () => {
    await SchedulerHelpers.goto(page);
    await SchedulerHelpers.expandEmployeeGroup(page);
    await SchedulerHelpers.waitForFirstEvent(page);
    await SchedulerHelpers.createAppointmentByDrag(page, '8:00am', '9:00am', 'Direct 1:1');
    await SchedulerHelpers.waitForFirstEvent(page);
    await SchedulerHelpers.clickSpecificEvent(page, '8:00am', '9:00am', 'Direct 1:1');
    await page.waitForTimeout(2000);
    await AppointmentHelpers.deleteAppointment(page);
    await page.waitForTimeout(2000);
    await ConfirmationHelpers.delete(page);
    await page.waitForTimeout(4000);
    await SchedulerHelpers.waitForFirstEvent(page);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);
  });

  test('SMK-012: Cancel delete appointment (single)', async () => {
    await SchedulerHelpers.goto(page);
    await SchedulerHelpers.expandEmployeeGroup(page);
    await SchedulerHelpers.waitForFirstEvent(page);
    await SchedulerHelpers.createAppointmentByDrag(page, '10:00am', '11:00am', 'Admin');
    await SchedulerHelpers.waitForFirstEvent(page);
    await SchedulerHelpers.clickSpecificEvent(page, '10:00am', '11:00am', 'Admin');
    await page.waitForTimeout(2000);
    await AppointmentHelpers.deleteAppointment(page);
    await page.waitForTimeout(2000);
    await ConfirmationHelpers.cancel(page);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  });
  test('SMK-013:Create recurring appointment', async () => {
    await SchedulerHelpers.goto(page);
    await SchedulerHelpers.expandEmployeeGroup(page);
    await page.waitForTimeout(2000);
    await SchedulerHelpers.createAppointmentByDrag(page, '2:00pm', '3:00pm', 'Admin', true);
    await SchedulerHelpers.waitForFirstEvent(page);
    await page.waitForTimeout(2000);
  });
  test('SMK-014: Check Undo and Redo', async () => {
    await SchedulerHelpers.goto(page);
    await SchedulerHelpers.expandEmployeeGroup(page);
    await page.waitForTimeout(2000);
    const beforeCount = await SchedulerHelpers.getEventCount(page);
    await SchedulerHelpers.createAppointmentByDrag(page, '10:00am', '10:30am', 'Admin');
    await SchedulerHelpers.waitForEventCountChange(page, beforeCount, true);
    const afterCount = await SchedulerHelpers.getEventCount(page);
    expect(afterCount).toBeGreaterThan(beforeCount);
    await page.getByRole('button', schedulerSelectors.undoButton).click();
    await page.waitForTimeout(2000);
    const afterUndoCount = await SchedulerHelpers.getEventCount(page);
    expect(afterUndoCount).toBeLessThan(afterCount);
    await page.getByRole('button', schedulerSelectors.redoButton).click();
    await page.waitForTimeout(2000);
    const afterRedoCount = await SchedulerHelpers.getEventCount(page);
    expect(afterRedoCount).toBeGreaterThan(afterUndoCount);
  });

  test('SMK-015: Create new employee', async () => {
    await SchedulerHelpers.goto(page);
    await UserHelpers.createEmployee(
      page,
      generateUniqueName(),
      generateUniqueName(),
      generateUniqueEmail(),
      "Admin","Select All"
    );
  });
  test('SMK-016: Create new locator', async () => {
    await SchedulerHelpers.goto(page);
    await UserHelpers.createLocation(
      page,
      generateUniqueName(),
     
      "Room","Test Center"
    );
  });
  test('SMK-017: Create new client', async () => {
    await SchedulerHelpers.goto(page);
    await UserHelpers.createClient(
      page,
      generateUniqueName(),
      generateUniqueName(),
      generateUniqueEmail(),
      "ABA","Test Center"
    );
  });
  test('SMK-018: Create new activity', async () => {
    await SchedulerHelpers.goto(page);
    await UserHelpers.createActivity(
      page,
      generateUniqueName()
    );
  });
});