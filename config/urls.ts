import { env } from './env';

export const urls = {
  home: '/',
  store11: '/store/11',
  productWithoutSalesChannel: '/viant-330ml-sr-6539.html?package_query',
  productWithSalesChannel: '/store/11/product/cha-ca-kg-6568.html?package_query=',
  cart: '/shoppingCart',
  checkout: '/shoppingCheckout',
  loginStart: env.loginStartPath,
  keycloakLogin: env.keycloakLoginURL,
  keycloakRegister: env.keycloakRegisterURL,
  keycloakForgotPassword: env.keycloakForgotPasswordURL
} as const;
