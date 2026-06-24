import { expect, type BrowserContext, type Page } from '@playwright/test';
import { env } from '../config/env';
import { urls } from '../config/urls';
import { oauthForgotPasswordData, oauthRegistrationData } from '../fixtures/test-data';
import { KeycloakForgotPasswordPage } from '../pages/KeycloakForgotPasswordPage';
import { KeycloakLoginPage, type OAuthCredentials } from '../pages/KeycloakLoginPage';
import { KeycloakRegisterPage } from '../pages/KeycloakRegisterPage';
import { LoginPage } from '../pages/LoginPage';
import { SandboxMailPage } from '../pages/SandboxMailPage';

export async function openKeycloakLogin(page: Page): Promise<void> {
  const loginPage = new LoginPage(page);

  await loginPage.openKeycloakLoginFromStore();
}

export async function expectKeycloakLoginForm(page: Page): Promise<void> {
  const keycloakLoginPage = new KeycloakLoginPage(page);

  await keycloakLoginPage.expectLoginFormVisible();
}

export async function expectLoginFieldLabels(page: Page): Promise<void> {
  const keycloakLoginPage = new KeycloakLoginPage(page);

  await keycloakLoginPage.expectFieldLabelsVisible();
}

export async function loginWithConfiguredAccount(page: Page): Promise<void> {
  const loginPage = new LoginPage(page);

  await loginPage.loginWithConfiguredAccount();
}

export async function loginWithCredentials(page: Page, credentials: OAuthCredentials): Promise<void> {
  const keycloakLoginPage = new KeycloakLoginPage(page);
  let unexpectedDialog = '';
  const rejectUnexpectedDialog = async (dialog: { message(): string; dismiss(): Promise<void> }) => {
    unexpectedDialog = dialog.message();
    await dialog.dismiss();
  };

  page.on('dialog', rejectUnexpectedDialog);
  try {
    await keycloakLoginPage.login(credentials);
    await keycloakLoginPage.expectRejectedOrStillOnLogin();
    expect(unexpectedDialog, 'OAuth login should not open browser dialogs for invalid input').toBe('');
  } finally {
    page.off('dialog', rejectUnexpectedDialog);
  }
}

export async function loginWithCredentialsAndExpectAuthenticated(page: Page, credentials: OAuthCredentials): Promise<void> {
  const keycloakLoginPage = new KeycloakLoginPage(page);

  await keycloakLoginPage.login(credentials);
  await expect(
    page,
    'OAuth login with accepted credentials should leave Keycloak and return to Day Sales'
  ).not.toHaveURL(/keycloak-staging\.timdaythay\.com/i);
  await expectAuthenticatedHeader(page);
}

export async function openProtectedCheckoutWithoutLogin(page: Page): Promise<void> {
  await page.goto(urls.checkout);
  await expect(page, 'Direct checkout without products should open the cart page').toHaveURL(new RegExp(urls.cart, 'i'));

  const cartItem = page.locator('.cart__item').first();
  const emptyCart = page.getByText(/chưa có sản phẩm nào trong giỏ hàng/i).first();

  await expect(
    cartItem.or(emptyCart),
    'Cart should show either the empty-cart state or the list of added products'
  ).toBeVisible();
}

export async function expectPasswordToggleWorks(page: Page): Promise<void> {
  const keycloakLoginPage = new KeycloakLoginPage(page);

  await keycloakLoginPage.togglePasswordVisibilityIfSupported();
}

export async function openLoginRegistration(page: Page): Promise<void> {
  const keycloakLoginPage = new KeycloakLoginPage(page);

  await keycloakLoginPage.openRegistration();
  await keycloakLoginPage.expectRegistrationOpened();
}

export async function openLoginBackLink(page: Page): Promise<void> {
  const keycloakLoginPage = new KeycloakLoginPage(page);

  await keycloakLoginPage.openBackLinkToCart();
}

export async function expectAuthenticatedHeader(page: Page): Promise<void> {
  const loginPage = new LoginPage(page);

  await loginPage.expectAuthenticatedHeaderVisible();
}

export async function logoutConfiguredAccount(page: Page): Promise<void> {
  const loginPage = new LoginPage(page);

  await loginPage.logoutConfiguredAccount();
}

export async function loginAndOpenKeycloakLoginAgain(page: Page): Promise<void> {
  const keycloakLoginURL = env.keycloakLoginURL || await captureKeycloakLoginURL(page);

  await loginWithConfiguredAccount(page);
  await page.goto(keycloakLoginURL);
  await expect(
    page,
    'Opening login URL with an existing session should redirect/recover instead of asking for credentials again'
  ).not.toHaveURL(/login-actions\/authenticate/i);
}

async function captureKeycloakLoginURL(page: Page): Promise<string> {
  await openKeycloakLogin(page);
  await expect(page, 'Generated login URL should open Keycloak before session reuse check').toHaveURL(/keycloak-staging\.timdaythay\.com/i);

  return page.url();
}

export async function openKeycloakRegistration(page: Page): Promise<void> {
  if (env.keycloakRegisterURL) {
    await page.goto(env.keycloakRegisterURL);
    return;
  }

  await openKeycloakLogin(page);
  await new KeycloakLoginPage(page).openRegistration();
}

export async function expectKeycloakRegistrationForm(page: Page): Promise<void> {
  const keycloakRegisterPage = new KeycloakRegisterPage(page);

  await keycloakRegisterPage.expectRegistrationFormVisible();
}

export async function expectRegistrationRecaptchaVisible(page: Page): Promise<void> {
  const keycloakRegisterPage = new KeycloakRegisterPage(page);

  await keycloakRegisterPage.expectRecaptchaVisible();
}

export async function checkRegistrationRecaptchaIfPossible(page: Page): Promise<void> {
  const keycloakRegisterPage = new KeycloakRegisterPage(page);

  await keycloakRegisterPage.checkRecaptchaIfPossible();
}

export async function registerWithValidDataThroughCaptcha(page: Page): Promise<void> {
  const keycloakRegisterPage = new KeycloakRegisterPage(page);
  const suffix = `${Date.now()}${Math.random().toString(36).slice(2, 8)}`;

  await keycloakRegisterPage.fillValidRegistrationData({
    username: `valid_${suffix}`.slice(0, 50),
    email: `valid_${suffix}@example.test`,
    password: 'Test@1234',
    confirmPassword: 'Test@1234'
  });
  await keycloakRegisterPage.expectCaptchaGateVisible();
}

export async function submitEmptyRegistrationForm(page: Page): Promise<void> {
  const keycloakRegisterPage = new KeycloakRegisterPage(page);

  await keycloakRegisterPage.submitEmpty();
}

export async function registerWithDuplicateEmail(page: Page): Promise<void> {
  const keycloakRegisterPage = new KeycloakRegisterPage(page);

  await keycloakRegisterPage.register(oauthRegistrationData.duplicateEmail);
  await keycloakRegisterPage.expectRegistrationValidation();
}

export async function registerWithMismatchedPasswordConfirmation(page: Page): Promise<void> {
  const keycloakRegisterPage = new KeycloakRegisterPage(page);

  await keycloakRegisterPage.register(oauthRegistrationData.mismatchedPassword);
  await keycloakRegisterPage.expectRegistrationValidation();
}

export async function registerWithInvalidEmailFormat(page: Page): Promise<void> {
  const keycloakRegisterPage = new KeycloakRegisterPage(page);

  await keycloakRegisterPage.register(oauthRegistrationData.invalidEmail);
  await keycloakRegisterPage.expectRegistrationValidation();
}

export async function registerWithWeakPassword(page: Page): Promise<void> {
  const keycloakRegisterPage = new KeycloakRegisterPage(page);

  await keycloakRegisterPage.register(oauthRegistrationData.weakPassword);
  await keycloakRegisterPage.expectRegistrationValidation();
}

export async function openKeycloakForgotPassword(page: Page): Promise<void> {
  if (env.keycloakForgotPasswordURL) {
    await page.goto(env.keycloakForgotPasswordURL);
    return;
  }

  await openKeycloakLogin(page);
  await new KeycloakLoginPage(page).openForgotPassword();
}

export async function openForgotPasswordFromLoginPage(page: Page): Promise<void> {
  await openKeycloakLogin(page);
  await new KeycloakLoginPage(page).openForgotPassword();
}

export async function expectKeycloakForgotPasswordForm(page: Page): Promise<void> {
  const forgotPasswordPage = new KeycloakForgotPasswordPage(page);

  await forgotPasswordPage.expectForgotPasswordFormVisible();
}

export async function submitEmptyForgotPasswordForm(page: Page): Promise<void> {
  const forgotPasswordPage = new KeycloakForgotPasswordPage(page);

  await forgotPasswordPage.submitEmpty();
}

export async function submitInvalidForgotPasswordEmail(page: Page): Promise<void> {
  const forgotPasswordPage = new KeycloakForgotPasswordPage(page);

  await forgotPasswordPage.submitInvalidEmail(oauthForgotPasswordData.invalidEmailFormat);
}

export async function requestPasswordResetForConfiguredAccount(page: Page): Promise<void> {
  if (!env.loginEmail) {
    throw new Error('LOGIN_EMAIL must be set in config/.env before running forgot password reset tests.');
  }

  const forgotPasswordPage = new KeycloakForgotPasswordPage(page);

  await forgotPasswordPage.submitEmail(env.loginEmail);
  await forgotPasswordPage.expectResetRequestAccepted();
}

export async function requestPasswordResetForUnknownAccount(page: Page): Promise<void> {
  const forgotPasswordPage = new KeycloakForgotPasswordPage(page);
  const suffix = `${Date.now()}${Math.random().toString(36).slice(2, 8)}`;

  await forgotPasswordPage.submitEmail(`unknown_${suffix}@example.test`);
  await forgotPasswordPage.expectResetRequestAccepted();
}

export async function resetConfiguredAccountPasswordFromSandboxMail(context: BrowserContext): Promise<void> {
  const sandboxMailPage = await SandboxMailPage.open(context);

  await sandboxMailPage.openPasswordResetMessage();

  const resetPage = await sandboxMailPage.confirmPasswordChange();
  const forgotPasswordPage = new KeycloakForgotPasswordPage(resetPage);

  await forgotPasswordPage.setNewPassword(env.oauthNewPassword);
}
