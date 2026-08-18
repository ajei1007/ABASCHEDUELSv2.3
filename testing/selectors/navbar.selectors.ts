export const navbarSelectors = {
  avatarButton: '[data-qa="navbar-user-menu"]',
  logoutButton: '[data-qa="navbar-logout"]',
  reportsLink: 'a[href="/admin/statistics"]',
  supportIcon: '[aria-label="Support"]',
  sandboxToggle: '[data-qa="navbar-sandbox-toggle"] input[type="checkbox"]',
  sandboxAlert: '.MuiAlert-message:has-text("Sandbox Mode is activated!")',
} as const;