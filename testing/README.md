# Testing Structure - Selector & Helper Pattern

This testing framework has been refactored from Page Object Model (POM) to use a **Selector & Helper Pattern** for better maintainability and clarity.

## 🏗️ New Structure

```
testing/
├── selectors/          # Element selectors organized by page/feature
├── helpers/           # Action methods organized by functionality  
├── tests/             # Test specifications
└── Configuration files
```

## 📁 Selectors

Located in `/selectors/` - Contains element selectors organized by page or feature:

- `login.selectors.ts` - Login page selectors
- `dashboard.selectors.ts` - Dashboard selectors  
- `navbar.selectors.ts` - Navigation bar selectors
- `scheduler.selectors.ts` - Scheduler/calendar selectors
- `appointment.selectors.ts` - Appointment modal selectors
- `confirmation.selectors.ts` - Confirmation dialog selectors
- `filters.selectors.ts` - Sidebar filter selectors
- `tags.selectors.ts` - Tag filter selectors
- `reporting.selectors.ts` - Reporting page selectors

### Usage Example:
```typescript
import { loginSelectors, schedulerSelectors } from '../selectors';

// Use selectors directly with page.locator()
await page.locator(loginSelectors.emailInput).fill(email);
await page.locator(schedulerSelectors.timelineGrid).waitFor();
```

## 🔧 Helpers

Located in `/helpers/` - Contains static methods for common actions:

- `LoginHelpers` - Authentication actions
- `NavbarHelpers` - Navigation actions
- `SchedulerHelpers` - Scheduler interactions
- `AppointmentHelpers` - Appointment management
- `ConfirmationHelpers` - Dialog confirmations
- `ReportingHelpers` - Reporting page actions

### Usage Example:
```typescript
import { LoginHelpers, SchedulerHelpers, AppointmentHelpers } from '../helpers';

// Use helper methods for complex actions
await LoginHelpers.goto(page);
await LoginHelpers.login(page, email, password);
await SchedulerHelpers.expandEmployees(page);
await AppointmentHelpers.chooseActivity(page, "Direct 1:1");
```

## ⏱️ Timing & Reliability Strategy

### **Built-in Delays**
All helper methods include built-in delays to ensure reliable interactions:

```typescript
// Helper method with built-in delay
static async chooseActivity(page: Page, activityName: string) {
  await page.locator(appointmentSelectors.activityDropdown).click({ delay: 500 });
  const option = page.locator(appointmentSelectors.activityOption, { hasText: activityName });
  await option.first().click({ delay: 500 });
}
```

**Delay Distribution:**
- **500ms**: Standard interactions (clicks, form submissions)
- **750ms**: Important actions (save, update, toggle states)  
- **1000ms**: Complex operations (navigation, expansion, specific event targeting)

### **Test Retry Configuration**
Tests automatically retry up to **3 times** on failure for maximum reliability:

```typescript
// In playwright.config.ts
export default defineConfig({
  retries: 3,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  // ... other config
});
```

This combination of built-in delays and retry logic ensures tests are stable across different environments and network conditions.

## ✅ Benefits of New Structure

### **Separation of Concerns**
- **Selectors**: Pure element identification
- **Helpers**: Reusable action methods with built-in timing
- **Tests**: Business logic and assertions

### **Better Maintainability**
- Selectors are centralized and easy to update
- Helper methods can be reused across multiple tests
- No class instantiation overhead
- Timing logic is centralized in helpers

### **Improved Reliability**
- Built-in timing delays prevent interaction failures
- Automatic retry mechanism (3 attempts per test)
- Consistent behavior across different environments
- Reduced flaky test incidents

### **Improved Readability**
- Test intent is clearer with descriptive helper method names
- Selectors are organized by logical groupings
- Less boilerplate code in test files
- No timing-related code cluttering tests

### **Easier Updates**
- Selector changes only need updates in one place
- Helper methods can be enhanced without affecting tests
- New functionality is easier to add
- Timing adjustments centralized in helpers

## 🧪 Test Implementation

### Before (POM):
```typescript
test('Create appointment', async () => {
  const scheduler = new SchedulerPage(page);
  const modal = new AppointmentModalPage(page);
  
  await scheduler.goto();
  await scheduler.expandEmployees();
  await scheduler.timelineGrid.dblclick();
  await modal.chooseActivity("Direct 1:1");
  await modal.addEvent();
});
```

### After (Selector & Helper):
```typescript
test('Create appointment', async () => {
  await SchedulerHelpers.goto(page);
  await SchedulerHelpers.expandEmployees(page);
  await SchedulerHelpers.doubleClickTimeline(page);
  await AppointmentHelpers.chooseActivity(page, "Direct 1:1");
  await AppointmentHelpers.addEvent(page);
});
```

## 🔄 Migration Guide

### **Removed Dependencies**
- All `pages/*.ts` files (replaced by selectors + helpers)
- Class instantiation in `beforeEach` hooks
- Page object imports

### **New Imports**
```typescript
// Import specific helpers
import { LoginHelpers, SchedulerHelpers, AppointmentHelpers } from '../helpers';

// Import selectors when needed for direct access
import { loginSelectors, schedulerSelectors } from '../selectors';
```

### **Method Signature Changes**
- All helper methods now require `page` as first parameter
- Static methods instead of instance methods
- Consistent async/await patterns

## 🚀 Running Tests

The test execution remains the same:

```bash
npm run test:dev     # Development environment
npm run test:stage   # Staging environment  
npm run test:prod    # Production environment
npm run test:headed  # Run with browser UI
```

## 📊 Current Test Coverage

**Active Smoke Tests:**
- SMK-001: Login validation
- SMK-002: Scheduler timeline performance
- SMK-003: Drag-and-drop functionality
- SMK-004: Create appointments
- SMK-005: Edit appointment details
- SMK-006: Delete appointments
- SMK-007: Sandbox mode toggle
- SMK-015: Logout functionality
- SMK-016: Cancel delete operations
- SMK-018: Cancel single occurrence

All tests have been successfully migrated to the new structure.