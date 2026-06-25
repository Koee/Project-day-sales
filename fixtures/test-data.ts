export type DeliveryAddress = {
  recipientName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  address: string;
};

export const products = {
  chaCaKg: 'Chả cá KG',
  chaCaKgWithoutAccents: 'Cha ca KG'
} as const;

export const searchKeywords = {
  specialCharacters: '!@#$%^&*()_+-=[]{}'
} as const;

export const storeFilters = {
  chaCaCategoryId: '2520',
  priceFrom: '1',
  priceTo: '100000'
} as const;

export const oauthInvalidCredentials = {
  configuredUserWrongPassword: {
    username: process.env.LOGIN_EMAIL ?? '1@yo.co',
    password: 'Wrong!@#123'
  },
  emptyEmail: {
    username: '',
    password: process.env.LOGIN_PASSWORD ?? '12345678'
  },
  emptyPassword: {
    username: process.env.LOGIN_EMAIL ?? '1@yo.co',
    password: ''
  },
  invalidEmailFormat: {
    username: 'not-an-email',
    password: 'P@ssw0rd!123'
  },
  emailWithSurroundingWhitespace: {
    username: ` ${process.env.LOGIN_EMAIL ?? '1@yo.co'} `,
    password: process.env.LOGIN_PASSWORD ?? '12345678'
  },
  unknownUser: {
    username: 'notexist@test.vn',
    password: 'P@ssw0rd!123'
  },
  sqlInjection: {
    username: "' OR 1=1 --",
    password: 'P@ssw0rd!123'
  },
  xss: {
    username: "<script>alert('xss')</script>",
    password: 'P@ssw0rd!123'
  }
} as const;

export const oauthForgotPasswordData = {
  invalidEmailFormat: 'not-an-email'
} as const;

const registrationSuffix = Date.now();

export const oauthRegistrationData = {
  duplicateEmail: {
    username: `duplicate_${registrationSuffix}`,
    email: process.env.LOGIN_EMAIL ?? '1@yo.co',
    password: 'Test@1234',
    confirmPassword: 'Test@1234'
  },
  mismatchedPassword: {
    username: `mismatch_${registrationSuffix}`,
    email: `mismatch_${registrationSuffix}@example.test`,
    password: 'Test@1234',
    confirmPassword: 'Test@5678'
  },
  invalidEmail: {
    username: `invalid_email_${registrationSuffix}`,
    email: 'notanemail',
    password: 'Test@1234',
    confirmPassword: 'Test@1234'
  },
  weakPassword: {
    username: `weak_${registrationSuffix}`,
    email: `weak_${registrationSuffix}@example.test`,
    password: '123',
    confirmPassword: '123'
  }
} as const;

// Tạo dữ liệu địa chỉ nhận hàng ngẫu nhiên cho guest checkout.
export function createGuestDeliveryAddress(): DeliveryAddress {
  const ts = Date.now();
  const suffix = `${ts}${Math.random().toString(36).slice(2, 8)}`;
  const randomDigits = Math.floor(Math.random() * 1_000).toString().padStart(3, '0');
  const phoneSuffix = `${String(ts).slice(-4)}${randomDigits}`;

  return {
    recipientName: `Thạch Lý ${suffix}`,
    phone: `098${phoneSuffix}`,
    province: 'Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    address: `327/5 Lê Thánh Tôn ${suffix}`
  };
}
