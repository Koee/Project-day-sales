export type DeliveryAddress = {
  recipientName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  address: string;
};

export const products = {
  chaCaKg: 'Chả cá KG'
} as const;

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
