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

export const guestDeliveryAddress: DeliveryAddress = {
  recipientName: 'Thạch Lý',
  phone: '0989346826',
  province: 'Hồ Chí Minh',
  district: 'Quận 1',
  ward: 'Phường Bến Nghé',
  address: '327/5 Lê Thánh Tôn'
};
