import { expect, type Locator, type Page } from '@playwright/test';

export type OAuthRegistrationDetails = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export class KeycloakRegisterPage {
  constructor(private readonly page: Page) {}

  async expectRegistrationFormVisible(): Promise<void> {
    await expect(this.page, 'OAuth registration should be on Keycloak staging').toHaveURL(/keycloak-staging\.timdaythay\.com/i);
    await expect(this.registrationForm(), 'Keycloak registration form should be visible').toBeVisible();
    await expect(this.emailInput(), 'Registration email input should be visible').toBeVisible();
    await expect(this.submitButton(), 'Registration submit button should be visible').toBeVisible();
  }

  async register(details: OAuthRegistrationDetails): Promise<void> {
    await this.usernameInput().fill(details.username);
    await this.emailInput().fill(details.email);
    await this.passwordInput().fill(details.password);
    await this.confirmPasswordInput().fill(details.confirmPassword);
    await this.checkAgreementIfPresent();
    await this.submitButton().click();
  }

  async registerThroughCaptcha(details: OAuthRegistrationDetails): Promise<void> {
    await this.usernameInput().fill(details.username);
    await this.emailInput().fill(details.email);
    await this.passwordInput().fill(details.password);
    await this.confirmPasswordInput().fill(details.confirmPassword);
    await this.checkRecaptchaIfPossible();
    await this.checkAgreementIfPresent();
    await this.submitButton().click();
  }

  async fillValidRegistrationData(details: OAuthRegistrationDetails): Promise<void> {
    await this.usernameInput().fill(details.username);
    await this.emailInput().fill(details.email);
    await this.passwordInput().fill(details.password);
    await this.confirmPasswordInput().fill(details.confirmPassword);
    await this.checkAgreementIfPresent();
  }

  async expectRegistrationSuccessPopup(): Promise<void> {
    await expect(this.registrationSuccessPopup(), 'Registration should show the congratulations popup').toBeVisible();
  }

  async submitEmpty(): Promise<void> {
    await expect(this.submitButton(), 'Registration submit should stay disabled when required fields are empty').toBeDisabled();
    await this.expectRejectedOrStillOnRegistration();
  }

  async expectRegistrationValidation(): Promise<void> {
    await expect(this.registrationValidationSignal(), 'Registration should show validation feedback').toBeVisible();
    await this.expectRejectedOrStillOnRegistration();
  }

  async expectRecaptchaVisible(): Promise<void> {
    await expect(this.recaptchaFrame(), 'Registration reCAPTCHA should be visible').toBeVisible();
  }

  async expectCaptchaGateVisible(): Promise<void> {
    await this.expectRecaptchaVisible();
    await expect(this.registrationForm(), 'Registration form should remain visible while CAPTCHA is unresolved').toBeVisible();
    await expect(this.submitButton(), 'Registration submit should stay visible behind CAPTCHA gate').toBeVisible();
  }

  async checkRecaptchaIfPossible(): Promise<void> {
    const checkbox = this.recaptchaCheckbox();

    await checkbox.click();
    await expect(checkbox, 'Registration reCAPTCHA should be checked before submit').toBeChecked();
  }

  async expectRejectedOrStillOnRegistration(): Promise<void> {
    await expect(this.page, 'Rejected registration should stay on Keycloak staging').toHaveURL(/keycloak-staging\.timdaythay\.com/i);
    await expect(
      this.errorMessage().or(this.registrationForm()).first(),
      'Registration should show an error/validation or keep the registration form visible'
    ).toBeVisible();
  }

  private registrationForm(): Locator {
    return this.page
      .locator('form#kc-register-form, form[action*="registration"], form[action*="registrations"]')
      .or(this.page.getByRole('form'))
      .first();
  }

  private usernameInput(): Locator {
    return this.page
      .getByLabel(/username|user name|tai khoan/i)
      .or(this.page.getByPlaceholder(/username|user name|tai khoan/i))
      .or(this.page.locator('input[name="username"], input#username'))
      .first();
  }

  private emailInput(): Locator {
    return this.page
      .getByLabel(/email|e-mail|phone|dien thoai/i)
      .or(this.page.getByPlaceholder(/email|e-mail|phone|dien thoai/i))
      .or(this.page.locator('input[type="email"], input[name="email"], input#email'))
      .first();
  }

  private passwordInput(): Locator {
    return this.page
      .getByLabel(/password|mat khau/i)
      .or(this.page.getByPlaceholder(/password|mat khau/i))
      .or(this.page.locator('input[name="password"], input#password'))
      .first();
  }

  private confirmPasswordInput(): Locator {
    return this.page
      .getByLabel(/confirm password|password-confirm|nhap lai mat khau|xac nhan mat khau/i)
      .or(this.page.getByPlaceholder(/confirm password|password-confirm|nhap lai mat khau|xac nhan mat khau/i))
      .or(this.page.locator('input[name="password-confirm"], input#password-confirm, input[name="passwordConfirm"]'))
      .last();
  }

  private submitButton(): Locator {
    const registerButtonName = /dang ky|register|create account|submit/i;

    return this.page
      .locator('button.btn-submit, input.btn-submit')
      .or(this.page.getByRole('button', { name: registerButtonName }))
      .or(this.page.locator('button, input[type="submit"]').filter({ hasText: registerButtonName }))
      .first();
  }

  private async checkAgreementIfPresent(): Promise<void> {
    const agreementCheckbox = this.page
      .getByLabel(/otp|agree|terms|policy|thong bao|dong y|chinh sach/i)
      .or(this.page.locator('input[type="checkbox"]').last())
      .first();

    if ((await agreementCheckbox.count()) > 0 && (await agreementCheckbox.isVisible())) {
      await agreementCheckbox.check();
    }
  }

  private recaptchaFrame(): Locator {
    return this.page.locator('iframe[title*="reCAPTCHA"][src*="api2/anchor"], iframe[src*="recaptcha/api2/anchor"]').first();
  }

  private recaptchaCheckbox(): Locator {
    return this.page
      .frameLocator('iframe[title*="reCAPTCHA"][src*="api2/anchor"], iframe[src*="recaptcha/api2/anchor"]')
      .getByRole('checkbox', { name: /I'm not a robot|Toi khong phai la nguoi may|Tôi không phải là người máy/i });
  }

  private registrationValidationSignal(): Locator {
    return this.errorMessage().or(this.page.locator('input:invalid, textarea:invalid, select:invalid')).first();
  }

  private errorMessage(): Locator {
    return this.page
      .locator('#input-error, .alert-error, .kc-feedback-text, [class*="error"], [role="alert"] strong, [role="alert"]')
      .filter({ hasText: /\S/ })
      .first();
  }

  private registrationSuccessPopup(): Locator {
    return this.page
      .locator('.modal-content:visible, .modal-dialog:visible, [role="dialog"]:visible, [class*="modal"]:visible')
      .filter({ hasText: /chuc mung|chúc mừng|congratulations/i })
      .first();
  }
}
