import { Page } from '@playwright/test';
import { userSelectors } from '../selectors';

export class UserHelpers {
  static async createEmployee(page: Page, firstName: string, lastName: string, email: string,role : string, permissions : string) {
    await page.locator('[data-testid="MenuRoundedIcon"]').first().click({ delay: 500 });
    await page.getByRole(userSelectors.navigation.employeeLink.role, { name: userSelectors.navigation.employeeLink.name }).click({ delay: 500 });
    await page.getByRole(userSelectors.navigation.dataLink.role, { name: userSelectors.navigation.dataLink.name }).click({ delay: 500 });
    await page.getByRole(userSelectors.buttons.new.role, { name: userSelectors.buttons.new.name }).click({ delay: 500 });
    
    await page.locator(userSelectors.form.firstNameInput).click({ delay: 500 });
    await page.locator(userSelectors.form.firstNameInput).fill(firstName);
    
    await page.locator(userSelectors.form.lastNameInput).fill(lastName);
    
    await page.locator(userSelectors.form.emailInput).click({ delay: 500 });
    await page.locator(userSelectors.form.emailInput).fill(email);
    
    await page.getByRole(userSelectors.buttons.generatePassword.role, { name: userSelectors.buttons.generatePassword.name }).click({ delay: 500 });
    
    // Select Admin role
    await page.locator(userSelectors.form.roleSelect).first().click({ delay: 500 });
    await page.locator(userSelectors.form.roleSelect).first().pressSequentially(role);
    await page.getByRole("option").first().click({ delay: 500 });
    
    // Select all permissions
    await page.locator(userSelectors.form.permissionsSelect).first().click({ delay: 500 });
    if(permissions !== "Select All")
    {
    await page.locator(userSelectors.form.permissionsSelect).first().pressSequentially(permissions);
    }
    await page.getByRole("option").first().click({ delay: 500 });
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: userSelectors.buttons.save.name }).click({ delay: 500 });
    // Wait for success message
    await page.getByText(userSelectors.messages.success.text).waitFor();
  }
  static async createLocation(page: Page, firstName: string,role : string,branch :string) {
    await page.locator('[data-testid="MenuRoundedIcon"]').first().click({ delay: 500 });
    await page.getByRole(userSelectors.navigation.locationLink.role, { name: userSelectors.navigation.locationLink.name }).click({ delay: 500 });
    await page.getByRole(userSelectors.navigation.dataLink.role, { name: userSelectors.navigation.dataLink.name }).click({ delay: 500 });
    await page.getByRole(userSelectors.buttons.new.role, { name: userSelectors.buttons.new.name }).click({ delay: 500 });
    
    await page.locator(userSelectors.form.firstNameInput).click({ delay: 500 });
    await page.locator(userSelectors.form.firstNameInput).fill(firstName);
    
    
    await page.locator(userSelectors.form.roleSelect).nth(2).click({ delay: 500 });
    await page.locator(userSelectors.form.roleSelect).nth(2).pressSequentially(role);
    await page.getByRole("option").first().click({ delay: 500 });
    await page.locator(userSelectors.form.roleSelect).nth(3).click({ delay: 500 });
    await page.locator(userSelectors.form.roleSelect).nth(3).pressSequentially(branch);
    await page.getByRole("option").first().click({ delay: 500 });
 
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: userSelectors.buttons.save.name }).click({ delay: 500 });
    // Wait for success message
    await page.getByText(userSelectors.messages.success.text).waitFor();
  }

  static async createClient(page: Page, firstName: string, lastName: string, email: string,role : string, branch : string) {
    await page.locator('[data-testid="MenuRoundedIcon"]').first().click({ delay: 500 });
    await page.getByRole(userSelectors.navigation.clientLink.role, { name: userSelectors.navigation.clientLink.name }).click({ delay: 500 });
    await page.getByRole(userSelectors.navigation.dataLink.role, { name: userSelectors.navigation.dataLink.name }).click({ delay: 500 });
    await page.getByRole(userSelectors.buttons.new.role, { name: userSelectors.buttons.new.name }).click({ delay: 500 });
    
    await page.locator(userSelectors.form.firstNameInput).click({ delay: 500 });
    await page.locator(userSelectors.form.firstNameInput).fill(firstName);
    
    await page.locator(userSelectors.form.lastNameInput).fill(lastName);
    
    await page.locator(userSelectors.form.emailInput).click({ delay: 500 });
    await page.locator(userSelectors.form.emailInput).fill(email);
    
    await page.getByRole(userSelectors.buttons.generatePassword.role, { name: userSelectors.buttons.generatePassword.name }).click({ delay: 500 });
    
    await page.locator(userSelectors.form.roleSelect).first().click({ delay: 500 });
    await page.locator(userSelectors.form.roleSelect).first().pressSequentially(role);
    await page.getByRole("option").first().click({ delay: 500 });
    await page.locator(userSelectors.form.roleSelect).nth(1).click({ delay: 500 });
    await page.locator(userSelectors.form.roleSelect).nth(1).pressSequentially(branch);
    await page.getByRole("option").first().click({ delay: 500 });

    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: userSelectors.buttons.save.name }).click({ delay: 500 });
    // Wait for success message
    await page.getByText(userSelectors.messages.success.text).waitFor();
  }
  static async createActivity(page: Page, name: string) {
    await page.locator('[data-testid="MenuRoundedIcon"]').first().click({ delay: 500 });
    await page.getByRole(userSelectors.navigation.activityLink.role, { name: userSelectors.navigation.activityLink.name }).click({ delay: 500 });
    await page.getByRole(userSelectors.navigation.dataLink.role, { name: userSelectors.navigation.dataLink.name }).click({ delay: 500 });
    await page.getByRole(userSelectors.buttons.new.role, { name: userSelectors.buttons.new.name }).click({ delay: 500 });
    await page.locator(userSelectors.form.firstNameInput).click({ delay: 500 });
    await page.locator(userSelectors.form.firstNameInput).fill(name);
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: userSelectors.buttons.save.name }).click({ delay: 500 });
  }
}
