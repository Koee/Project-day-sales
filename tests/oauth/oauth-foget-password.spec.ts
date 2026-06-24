import { test } from '@playwright/test';
import {
  expectKeycloakForgotPasswordForm,
  openForgotPasswordFromLoginPage,
  openKeycloakForgotPassword,
  requestPasswordResetForConfiguredAccount,
  requestPasswordResetForUnknownAccount,
  submitInvalidForgotPasswordEmail,
  submitEmptyForgotPasswordForm
} from '../../steps/oauth.steps';
import { saveTestResultReport } from '../../utils/test-report.helper';

test.describe.configure({ mode: 'serial' });

test.describe('OAuth Forgot Password', () => {
  test.afterEach(async ({ page }, testInfo) => {
    await saveTestResultReport(page, testInfo);
  });

  test('TC-FP-001 should show Keycloak forgot password form @oauth @auth @forgot-password', async ({ page }) => {
    await openKeycloakForgotPassword(page);
    await expectKeycloakForgotPasswordForm(page);
  });

  test('TC-FP-002 should send reset email for an existing account @oauth @auth @forgot-password', async ({ page }) => {
    await openKeycloakForgotPassword(page);
    await requestPasswordResetForConfiguredAccount(page);
  });

  test('TC-FP-003 should send generic reset response for an unknown account @oauth @auth @forgot-password @negative', async ({ page }) => {
    await openKeycloakForgotPassword(page);
    await requestPasswordResetForUnknownAccount(page);
  });

  test('TC-FP-004 should keep user on forgot password form when email is empty @oauth @auth @forgot-password @negative', async ({ page }) => {
    await openKeycloakForgotPassword(page);
    await submitEmptyForgotPasswordForm(page);
  });

  test('TC-QMK-004 should keep user on forgot password form when email format is invalid @oauth @auth @forgot-password @negative', async ({ page }) => {
    await openKeycloakForgotPassword(page);
    await submitInvalidForgotPasswordEmail(page);
  });

  test('TC-QMK-008 should open forgot password form from login page link @oauth @auth @forgot-password', async ({ page }) => {
    await openForgotPasswordFromLoginPage(page);
    await expectKeycloakForgotPasswordForm(page);
  });
});
