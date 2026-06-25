import { test } from '@playwright/test';
import {
  expectKeycloakRegistrationForm,
  openKeycloakRegistration,
  registerWithInvalidEmailFormat,
  registerWithMismatchedPasswordConfirmation,
  registerWithValidDataThroughCaptcha,
  registerWithWeakPassword,
  submitEmptyRegistrationForm
} from '../../steps/oauth.steps';
import { saveTestResultReport } from '../../utils/test-report.helper';

test.describe.configure({ mode: 'serial' });

test.describe('OAuth Registration', () => {
  test.afterEach(async ({ page }, testInfo) => {
    await saveTestResultReport(page, testInfo);
  });

  test('TC-REG-001 should show Keycloak registration form @oauth @auth @registration', async ({ page }) => {
    await openKeycloakRegistration(page);
    await expectKeycloakRegistrationForm(page);
  });

  test('TC-REG-002 should show CAPTCHA gate when registering with valid data @oauth @auth @registration', async ({ page }) => {
    await openKeycloakRegistration(page);
    await registerWithValidDataThroughCaptcha(page);
  });

  test('TC-REG-004 should show validation when password confirmation does not match @oauth @auth @registration @negative', async ({ page }) => {
    await openKeycloakRegistration(page);
    await registerWithMismatchedPasswordConfirmation(page);
  });

  test('TC-REG-005 should show validation when email format is invalid @oauth @auth @registration @negative', async ({ page }) => {
    await openKeycloakRegistration(page);
    await registerWithInvalidEmailFormat(page);
  });

  test('TC-REG-006 should keep user on registration when required fields are empty @oauth @auth @registration @negative', async ({ page }) => {
    await openKeycloakRegistration(page);
    await submitEmptyRegistrationForm(page);
  });

  test('TC-REG-007 should show validation when password is too weak @oauth @auth @registration @negative', async ({ page }) => {
    await openKeycloakRegistration(page);
    await registerWithWeakPassword(page);
  });
});
