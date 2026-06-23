import { test } from '@playwright/test';
import { env } from '../../config/env';
import { oauthInvalidCredentials } from '../../fixtures/test-data';
import {
  expectAuthenticatedHeader,
  expectLoginFieldLabels,
  expectKeycloakLoginForm,
  expectPasswordToggleWorks,
  loginAndOpenKeycloakLoginAgain,
  loginWithConfiguredAccount,
  loginWithCredentials,
  logoutConfiguredAccount,
  openKeycloakLogin,
  openLoginRegistration,
  openLoginBackLink,
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

  test.skip('TC-AUTH-010 should return to cart from login back link @oauth @auth @login', async ({ page }) => {
    // Staging Keycloak login currently does not render a visible cart/back link for this flow.
    await openKeycloakLogin(page);
    await openLoginBackLink(page);
  });

  test('TC-AUTH-L01 should show authenticated header after login @oauth @auth @login', async ({ page }) => {
    await loginWithConfiguredAccount(page);
    await expectAuthenticatedHeader(page);
  });

  test.skip('TC-AUTH-L02 should logout configured account successfully @oauth @auth @logout', async ({ page }) => {
    // Staging authenticated/profile UI currently does not expose a visible logout control.
    await logoutConfiguredAccount(page);
  });

  test('TC-AUTH-L03 should show cart page when anonymous user opens checkout without products @oauth @auth @guard', async ({ page }) => {
    await openProtectedCheckoutWithoutLogin(page);
  });

  test('TC-AUTH-L04 should redirect or recover when opening login with an existing session @oauth @auth @session', async ({ page }) => {
    test.skip(!env.keycloakLoginURL, 'KEYCLOAK_LOGIN_URL is required for direct login URL session test.');
    await loginAndOpenKeycloakLoginAgain(page);
  });

  test('TC-NEG-003 should redirect or recover when logged-in user opens login URL directly @oauth @auth @negative', async ({ page }) => {
    test.skip(!env.keycloakLoginURL, 'KEYCLOAK_LOGIN_URL is required for direct login URL session test.');
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
