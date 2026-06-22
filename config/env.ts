import dotenv from 'dotenv';

dotenv.config();

export const env = {
  baseURL: process.env.BASE_URL ?? 'https://day-sales-staging.timdaythay.com',
  keycloakLoginURL: process.env.KEYCLOAK_LOGIN_URL ?? '',
  keycloakRegisterURL: process.env.KEYCLOAK_REGISTER_URL ?? '',
  keycloakForgotPasswordURL: process.env.KEYCLOAK_FORGOT_PASSWORD_URL ?? ''
} as const;
