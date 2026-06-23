import { expect, type Locator, type Page } from '@playwright/test';

export class KeycloakForgotPasswordPage {
  constructor(private readonly page: Page) {}

  async expectForgotPasswordFormVisible(): Promise<void> {
    await expect(this.page, 'OAuth forgot password should be on Keycloak staging').toHaveURL(/keycloak-staging\.timdaythay\.com/i);
    await expect(this.forgotPasswordForm(), 'Keycloak forgot password form should be visible').toBeVisible();
    await expect(this.usernameInput(), 'Forgot password username/email input should be visible').toBeVisible();
    await expect(this.submitButton(), 'Forgot password submit button should be visible').toBeVisible();
  }

  async submitEmail(email: string): Promise<void> {
    await this.usernameInput().fill(email);
    await this.submitButton().click();
  }

  async submitEmpty(): Promise<void> {
    await this.submitButton().click();
    await expect(this.validationMessage(), 'Forgot password should show required-field validation').toBeVisible();
    await expect(this.forgotPasswordForm(), 'Forgot password form should stay visible when email is empty').toBeVisible();
  }

  async expectResetRequestAccepted(): Promise<void> {
    const acceptedMessage = this.page
      .locator('.alert-success, .kc-feedback-text, [role="alert"]')
      .or(this.page.getByText(/da gui|huong dan|email|sent|check your email/i))
      .first();

    await expect(acceptedMessage, 'Forgot password request should show a sent/accepted message').toBeVisible();
  }

  async setNewPassword(password: string): Promise<void> {
    await this.newPasswordInput().fill(password);
    await this.confirmPasswordInput().fill(password);
    await this.submitButton().click();

    const successMessage = this.page
      .locator('.alert-success, .kc-feedback-text, [role="alert"]')
      .or(this.page.getByText(/password.*changed|success|thanh cong/i))
      .first();

    await expect(successMessage, 'New password should be accepted after reset confirmation').toBeVisible();
  }

  private forgotPasswordForm(): Locator {
    return this.page
      .locator('form[action*="reset-credentials"], form#kc-reset-password-form')
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

  private newPasswordInput(): Locator {
    return this.page
      .getByLabel(/mat khau moi|new password|password/i)
      .or(this.page.getByPlaceholder(/mat khau moi|new password|password/i))
      .or(this.page.locator('input[type="password"], input[name="password"], input#password'))
      .first();
  }

  private confirmPasswordInput(): Locator {
    return this.page
      .getByLabel(/xac nhan mat khau|confirm password|password-confirm/i)
      .or(this.page.getByPlaceholder(/xac nhan mat khau|confirm password|password-confirm/i))
      .or(this.page.locator('input[type="password"], input[name="password-confirm"], input#password-confirm'))
      .last();
  }

  private submitButton(): Locator {
    const submitButtonName = /gửi|gui|xác nhận|xac nhan|đồng ý|dong y|submit|continue|reset|save/i;

    return this.page
      .locator('button.btn-submit, input.btn-submit')
      .or(this.page.getByRole('button', { name: submitButtonName }))
      .or(this.page.locator('button, input[type="submit"]').filter({ hasText: submitButtonName }))
      .first();
  }

  private validationMessage(): Locator {
    return this.page
      .locator('#input-error, .alert-error, .kc-feedback-text, [class*="error"], [role="alert"] strong, [role="alert"]')
      .filter({ hasText: /\S/ })
      .first();
  }
}
