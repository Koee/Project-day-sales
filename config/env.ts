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
  keycloakLoginURL: process.env.KEYCLOAK_LOGIN_URL ?? '',
  keycloakRegisterURL: process.env.KEYCLOAK_REGISTER_URL ?? '',
  keycloakForgotPasswordURL: process.env.KEYCLOAK_FORGOT_PASSWORD_URL ?? ''
} as const;
