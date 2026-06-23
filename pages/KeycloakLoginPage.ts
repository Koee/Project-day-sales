import { expect, type Locator, type Page } from '@playwright/test';

export type OAuthCredentials = {
  username: string;
  password: string;
};

export class KeycloakLoginPage {
  constructor(private readonly page: Page) {}

  async expectLoginFormVisible(): Promise<void> {
    await expect(this.page, 'OAuth login should be on Keycloak staging').toHaveURL(/keycloak-staging\.timdaythay\.com/i);
    await expect(this.loginForm(), 'Keycloak login form should be visible').toBeVisible();
    await expect(this.usernameInput(), 'Username or email input should be visible').toBeVisible();
    await expect(this.passwordInput(), 'Password input should be visible').toBeVisible();
    await expect(this.submitButton(), 'Login submit button should be visible').toBeVisible();
  }

  async expectFieldLabelsVisible(): Promise<void> {
    await expect(this.usernameInput(), 'Username/email field should expose visible label or placeholder').toBeVisible();
    await expect(this.passwordInput(), 'Password field should expose visible label or placeholder').toBeVisible();
    await expect(this.usernameInput(), 'Username/email placeholder should not be empty').toHaveAttribute('placeholder', /.+/);
    await expect(this.passwordInput(), 'Password placeholder should not be empty').toHaveAttribute('placeholder', /.+/);
  }

  async login(credentials: OAuthCredentials): Promise<void> {
    if (credentials.username) {
      await this.usernameInput().fill(credentials.username);
    }

    if (credentials.password) {
      await this.passwordInput().fill(credentials.password);
    }

    await this.submitButton().click();
  }

  async expectRejectedOrStillOnLogin(): Promise<void> {
    await expect(this.page, 'Rejected OAuth login should stay on Keycloak').toHaveURL(/keycloak-staging\.timdaythay\.com/i);
    await expect(
      this.errorMessage().or(this.loginForm()).first(),
      'Login should show an error/validation or keep the login form visible'
    ).toBeVisible();
  }

  async openRegistration(): Promise<void> {
    const registerLink = this.page
      .getByRole('link', { name: /dang ky|register|create account/i })
      .or(this.page.locator('a[href*="registrations"], a[href*="registration"]'))
      .first();

    await expect(registerLink, 'Registration link should be visible on Keycloak login page').toBeVisible();
    await registerLink.click();
  }

  async expectRegistrationOpened(): Promise<void> {
    await expect(this.page, 'Registration link should open Keycloak registration').toHaveURL(/registrations|registration/i);
  }

  async openForgotPassword(): Promise<void> {
    const forgotPasswordLink = this.page
      .getByRole('link', { name: /quen mat khau|forgot password|reset password/i })
      .or(this.page.locator('a[href*="reset-credentials"]'))
      .first();

    await expect(forgotPasswordLink, 'Forgot password link should be visible on Keycloak login page').toBeVisible();
    await forgotPasswordLink.click();
  }

  async togglePasswordVisibilityIfSupported(): Promise<void> {
    await this.passwordInput().fill('Password@123');

    const passwordInput = this.passwordInput();
    const toggleButton = this.page
      .getByRole('checkbox', { name: /password|mat khau|show|hide|hien|an|thi/i })
      // TODO: Replace CSS fallback after inspecting the Keycloak password toggle DOM.
      .or(this.page.locator('input[type="checkbox"]').first())
      .or(this.page.getByRole('button', { name: /password|mat khau|show|hide|hien|an/i }))
      // TODO: Replace CSS fallback after inspecting the Keycloak password toggle DOM.
      .or(this.page.locator('button[aria-label*="password" i], button[class*="password" i], button[class*="eye" i]'))
      .first();

    await expect(toggleButton, 'Password visibility toggle should be available on Keycloak login page').toBeVisible();
    await expect(passwordInput, 'Password should be masked before toggling').toHaveAttribute('type', /password/i);

    await toggleButton.click();
    await expect(passwordInput, 'Password should be visible after toggling').toHaveAttribute('type', /text/i);

    await toggleButton.click();
    await expect(passwordInput, 'Password should be masked after toggling again').toHaveAttribute('type', /password/i);
  }

  async openBackLinkToCart(): Promise<void> {
    const backLink = this.page
      .getByRole('link', { name: /quay lai|back|shopping cart|gio hang/i })
      // TODO: Replace CSS fallback after inspecting the Keycloak back link DOM.
      .or(this.page.locator('a[href*="shoppingCart"], a[href*="back_uri"]'))
      .first();

    await expect(backLink, 'Back link to cart should be visible on Keycloak login page').toBeVisible();
    await backLink.click();
    await expect(this.page, 'Back link should return to shopping cart').toHaveURL(/\/shoppingCart/i);
  }

  private loginForm(): Locator {
    return this.page
      .locator('form#kc-form-login, form[action*="login-actions/authenticate"]')
      .or(this.page.getByRole('form'))
      .first();
  }

  private usernameInput(): Locator {
    return this.page
      .getByLabel(/email|e-mail|tai khoan|username|user name/i)
      .or(this.page.getByPlaceholder(/email|e-mail|tai khoan|username|user name/i))
      .or(this.page.locator('input[type="email"], input[name="username"], input#username'))
      .first();
  }

  private usernameLabel(): Locator {
    return this.page
      .getByText(/email|e-mail|tai khoan|username|user name/i)
      .or(this.page.locator('label[for="username"], label[for="email"]'))
      .first();
  }

  private passwordInput(): Locator {
    return this.page
      .getByLabel(/password|mat khau/i)
      .or(this.page.getByPlaceholder(/password|mat khau/i))
      .or(this.page.locator('input[type="password"], input[name="password"], input#password'))
      .first();
  }

  private passwordLabel(): Locator {
    return this.page
      .getByText(/password|mat khau/i)
      .or(this.page.locator('label[for="password"]'))
      .first();
  }

  private submitButton(): Locator {
    const loginButtonName = /đăng nhập|dang nhap|login|log in|sign in|continue/i;

    return this.page
      .locator('button.btn-submit, input.btn-submit')
      .or(this.page.getByRole('button', { name: loginButtonName }))
      .or(this.page.locator('button, input[type="submit"]').filter({ hasText: loginButtonName }))
      .first();
  }

  private errorMessage(): Locator {
    return this.page
      .locator('#input-error, .alert-error, .kc-feedback-text, [class*="error"], [role="alert"]')
      .filter({ hasText: /sai|khong dung|invalid|required|bat buoc|yeu cau/i })
      .first();
  }
}
