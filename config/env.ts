import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '.env') });

export const env = {
  baseURL: process.env.BASE_URL ?? 'https://day-sales-staging.timdaythay.com',
  testSpec: process.env.TEST_SPEC ?? '',
  testGrep: process.env.TEST_GREP ?? '',
  loginStartPath: process.env.LOGIN_START_PATH ?? '/product',
  loginEmail: process.env.LOGIN_EMAIL ?? '1@yo.co',
  loginPassword: process.env.LOGIN_PASSWORD ?? '',
  allowPasswordReset: process.env.ALLOW_PASSWORD_RESET === 'true',
  oauthNewPassword: process.env.OAUTH_NEW_PASSWORD ?? '1A345678',
  sandboxMailURL: process.env.SANDBOX_MAIL_URL ?? 'https://mail-staging.timdaythay.com/#',
  keycloakLoginURL: process.env.KEYCLOAK_LOGIN_URL ?? '',
  keycloakRegisterURL: process.env.KEYCLOAK_REGISTER_URL ?? '',
  keycloakForgotPasswordURL: process.env.KEYCLOAK_FORGOT_PASSWORD_URL ?? ''
} as const;
