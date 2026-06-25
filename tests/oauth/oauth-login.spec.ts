import { test } from '@playwright/test';
import { oauthInvalidCredentials } from '../../fixtures/test-data';
import {
  expectAuthenticatedHeader,
  expectLoginFieldLabels,
  expectKeycloakLoginForm,
  expectPasswordToggleWorks,
  loginAndOpenKeycloakLoginAgain,
  loginWithConfiguredAccount,
  loginWithCredentials,
  loginWithCredentialsAndExpectAuthenticated,
  logoutConfiguredAccount,
  openKeycloakLogin,
  openLoginRegistration,
  openProtectedCheckoutWithoutLogin
} from '../../steps/oauth.steps';
import { saveTestResultReport } from '../../utils/test-report.helper';

test.describe.configure({ mode: 'serial' });

test.describe('OAuth Login', () => {
  test.afterEach(async ({ page }, testInfo) => {
    await saveTestResultReport(page, testInfo);
  });

  test('TC-AUTH-001 should show Keycloak login form @oauth @auth @login', async ({ page }) => {
    await openKeycloakLogin(page);
    await expectKeycloakLoginForm(page);
  });

  test('TC-AUTH-002 should show readable labels for login fields @oauth @auth @login', async ({ page }) => {
    await openKeycloakLogin(page);
    await expectLoginFieldLabels(page);
  });

  test('TC-AUTH-003 should login successfully with configured env account @oauth @auth @login @smoke', async ({ page }) => {
    await loginWithConfiguredAccount(page);
  });

  test('TC-AUTH-004 should show error when password is invalid @oauth @auth @login @negative', async ({ page }) => {
    await openKeycloakLogin(page);
    await loginWithCredentials(page, {
      username: oauthInvalidCredentials.configuredUserWrongPassword.username,
      password: oauthInvalidCredentials.configuredUserWrongPassword.password
    });
  });

  test('TC-AUTH-005 should keep user on login when required fields are empty @oauth @auth @login @negative', async ({ page }) => {
    await openKeycloakLogin(page);
    await loginWithCredentials(page, {
      username: '',
      password: ''
    });
  });

  test('TC-AUTH-006 should keep user on login when password is empty @oauth @auth @login @negative', async ({ page }) => {
    await openKeycloakLogin(page);
    await loginWithCredentials(page, oauthInvalidCredentials.emptyPassword);
  });

  test('TC-DL-004 should keep user on login when email is empty @oauth @auth @login @negative', async ({ page }) => {
    await openKeycloakLogin(page);
    await loginWithCredentials(page, oauthInvalidCredentials.emptyEmail);
  });

  test('TC-DL-006 should reject an invalid email format @oauth @auth @login @negative', async ({ page }) => {
    await openKeycloakLogin(page);
    await loginWithCredentials(page, oauthInvalidCredentials.invalidEmailFormat);
  });

  test('TC-AUTH-007 should reject an unknown username without exposing account existence @oauth @auth @login @negative', async ({ page }) => {
    await openKeycloakLogin(page);
    await loginWithCredentials(page, oauthInvalidCredentials.unknownUser);
  });

  test('TC-AUTH-008 should toggle password visibility when supported @oauth @auth @login', async ({ page }) => {
    await openKeycloakLogin(page);
    await expectPasswordToggleWorks(page);
  });

  test('TC-AUTH-009 should open registration from login page @oauth @auth @login', async ({ page }) => {
    await openKeycloakLogin(page);
    await openLoginRegistration(page);
  });

  test('TC-AUTH-L01 should show authenticated header after login @oauth @auth @login', async ({ page }) => {
    await loginWithConfiguredAccount(page);
    await expectAuthenticatedHeader(page);
  });

  test('TC-DL-009 should logout successfully after a configured account session @oauth @auth @login @auth-state', async ({ page }) => {
    await logoutConfiguredAccount(page);
  });

  test('TC-DL-012 should login successfully when email has surrounding whitespace @oauth @auth @login @boundary', async ({ page }) => {
    await openKeycloakLogin(page);
    await loginWithCredentialsAndExpectAuthenticated(page, oauthInvalidCredentials.emailWithSurroundingWhitespace);
  });

  test('TC-AUTH-L03 should show cart page when anonymous user opens checkout without products @oauth @auth @guard', async ({ page }) => {
    await openProtectedCheckoutWithoutLogin(page);
  });

  test('TC-AUTH-L04 should redirect or recover when opening login with an existing session @oauth @auth @session', async ({ page }) => {
    await loginAndOpenKeycloakLoginAgain(page);
  });

  test('TC-NEG-003 should redirect or recover when logged-in user opens login URL directly @oauth @auth @negative', async ({ page }) => {
    await loginAndOpenKeycloakLoginAgain(page);
  });

  test('TC-NEG-006 should reject SQL injection payload in username @oauth @auth @negative', async ({ page }) => {
    await openKeycloakLogin(page);
    await loginWithCredentials(page, oauthInvalidCredentials.sqlInjection);
  });

  test('TC-NEG-007 should reject XSS payload in username without alerting @oauth @auth @negative', async ({ page }) => {
    await openKeycloakLogin(page);
    await loginWithCredentials(page, oauthInvalidCredentials.xss);
  });
});
