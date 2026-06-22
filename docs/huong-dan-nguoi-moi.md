# Huong dan nguoi moi chua biet gi

Tai lieu nay giup ban biet nen doc code tu dau, flow chay nhu the nao, va khi them testcase moi thi them o dau.

## 1. Nen doc tu dau?

Bat dau tu file spec trong `tests/`.

Vi du testcase checkout hien tai:

```text
tests/checkout/guest-order.spec.ts
```

Trong file spec, testcase chi nen ngan gon:

```ts
test('mua hang khong login', async ({ page }) => {
  await muaHangKhongLogin(page);
});
```

Spec goi sang flow nghiep vu trong `steps/`.

## 2. Flow code dang chay nhu nao?

Flow hien tai:

```text
tests/checkout/guest-order.spec.ts
  -> steps/checkout.steps.ts
    -> pages/StorePage.ts
    -> pages/CartPage.ts
    -> pages/CheckoutPage.ts
    -> fixtures/test-data.ts
    -> config/urls.ts
```

Y nghia tung folder:

```text
tests/      noi khai bao testcase
steps/      noi gom cac buoc nghiep vu
pages/      noi viet thao tac UI, locator, click, fill form
fixtures/   noi de data test
config/     noi de URL va bien moi truong
utils/      helper dung chung, vi du report
```

## 3. Doc mot testcase nhu the nao?

Voi testcase `mua hang khong login`, doc theo thu tu:

1. Mo `tests/checkout/guest-order.spec.ts`
2. Thay testcase goi `muaHangKhongLogin(page)`
3. Mo `steps/checkout.steps.ts`
4. Doc tung buoc trong flow:

```text
openProductWithSalesChannel
addProductToCart
goToCart
selectProduct
checkoutSelected
openAddressForm
fillDeliveryAddress
completeAddressForm
changeShippingUnit
placeOrderAndWaitForSuccess
```

5. Muon biet buoc nao click/fill o dau thi mo page object tuong ung trong `pages/`
6. Muon doi data nguoi nhan/san pham thi mo `fixtures/test-data.ts`
7. Muon doi URL thi mo `config/urls.ts` hoac `config/.env`

## 4. Cau hinh env va config

File env local:

```text
config/.env
```

Vi du noi dung:

```dotenv
BASE_URL=https://day-sales-staging.timdaythay.com
TEST_SPEC=
TEST_GREP=
KEYCLOAK_LOGIN_URL=
KEYCLOAK_REGISTER_URL=
KEYCLOAK_FORGOT_PASSWORD_URL=
```

File doc env:

```text
config/env.ts
```

File khai bao URL dung trong test:

```text
config/urls.ts
```

Khi nao sua file nao:

```text
config/.env       doi base URL, grep, spec, URL login/register local
config/env.ts     them bien moi doc tu .env
config/urls.ts    them duong dan page moi
```

Luu y:

- Khong commit secret, token, account that.
- URL staging mac dinh la `https://day-sales-staging.timdaythay.com`.
- Neu them bien env moi, them vao `config/.env` va doc no trong `config/env.ts`.

## 5. Them testcase moi tu vi tri nao?

Neu them testcase checkout moi:

1. Them testcase trong:

```text
tests/checkout/guest-order.spec.ts
```

2. Neu flow moi dai hon 2-3 buoc, tao function moi trong:

```text
steps/checkout.steps.ts
```

3. Neu can click/fill/kiem tra UI moi, them method vao page object:

```text
pages/StorePage.ts
pages/CartPage.ts
pages/CheckoutPage.ts
```

4. Neu can data moi, them vao:

```text
fixtures/test-data.ts
```

5. Neu can URL moi, them vao:

```text
config/urls.ts
```

## 6. Vi du them testcase moi

Them testcase trong `tests/checkout/guest-order.spec.ts`:

```ts
test('mua hang khong login voi san pham khac', async ({ page }) => {
  await muaHangKhongLoginVoiSanPhamKhac(page);
});
```

Them flow trong `steps/checkout.steps.ts`:

```ts
export async function muaHangKhongLoginVoiSanPhamKhac(page: Page): Promise<void> {
  const storePage = new StorePage(page);

  await storePage.openProductWithSalesChannel();
  await storePage.addProductToCart('Ten san pham');
}
```

Neu method UI chua co, them vao file page object trong `pages/`.

## 7. Nguyen tac ngan gon

- Testcase trong `tests/` nen ngan, de doc.
- Flow nghiep vu dat trong `steps/`.
- Click, fill, locator dat trong `pages/`.
- Data test dat trong `fixtures/`.
- URL va bien moi truong dat trong `config/`.
- Khong hard-code secret, token, account that trong code.
