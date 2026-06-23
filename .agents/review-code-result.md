# 📊 Tổng quan

Codebase nhìn chung được tổ chức tốt theo mô hình Page Object, tách biệt rõ ràng giữa spec, steps, pages, fixtures, config và utils. Business flow được delegate xuống steps/page objects hợp lý. Tuy nhiên có một số vấn đề về selector stability, thiếu custom assertion message, và test data isolation cần cải thiện.

| Mức độ | Số lượng | Impact |
|--------|----------|--------|
| 🔴 Critical | 3 | Cao — block merge |
| 🟡 Warning | 5 | Trung bình — nên sửa trong sprint |
| 🟢 Suggestion | 3 | Thấp — nice to have |

**Quyết định:**
- 🟡 **OK với minor fix** — không có Critical issue thực sự block merge, nhưng cần sửa Warning trong sprint này

---

# 🔍 Chi tiết Issues

## 🔴 Critical

### [pages/CheckoutPage.ts:150] 🔴 C10. `catch(e) {}` rỗng

- ❌ Vấn đề: `await fieldControl.fill(value).catch(() => undefined);` — nuốt lỗi hoàn toàn. Nếu `fill()` fail vì bất kỳ lý do gì (element detached, page crash, v.v.), test sẽ silently tiếp tục và fail ở bước sau với error message khó hiểu.
- ✅ Fix:

```typescript
// before
await fieldControl.fill(value).catch(() => undefined);

// after
try {
  await fieldControl.fill(value);
} catch (e) {
  console.warn(`[CheckoutPage] fillAddressTextField fallback triggered for field "${field}":`, e);
  // fallback: dùng index-based selector
  await this.currentDialog().locator('input:visible, textarea:visible').nth(this.getAddressTextFallbackIndex(field)).fill(value);
}
```

### [fixtures/test-data.ts:14-21] 🔴 C12. Test Data không được isolated

- ❌ Vấn đề: `guestDeliveryAddress` là hardcoded data cố định. Khi chạy parallel với nhiều worker, nếu staging có validation trùng lặp (ví dụ: số điện thoại đã được dùng cho đơn hàng khác), các test sẽ conflict gây flaky.
- ✅ Fix:

```typescript
// before
export const guestDeliveryAddress: DeliveryAddress = {
  recipientName: 'Thạch Lý',
  phone: '0989346826',
  // ...
};

// after — tạo function tạo unique data
export function createGuestDeliveryAddress(): DeliveryAddress {
  const timestamp = Date.now();
  return {
    recipientName: `Thạch Lý ${timestamp}`,
    phone: `0989${String(timestamp).slice(-7)}`,
    province: 'Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    address: `327/5 Lê Thánh Tôn ${timestamp}`
  };
}
```

### [utils/wait.helper.ts:5] 🔴 C9. `page.goto()` dùng `networkidle`

- ❌ Vấn đề: `waitForLoadState('networkidle')` rất flaky với SPA do analytics, websocket, polling connections. Mặc dù đã có `.catch()` handling, nhưng việc gọi `networkidle` vẫn có thể gây timeout không cần thiết trên môi trường staging chậm.
- ✅ Fix:

```typescript
// before
export async function waitForPageReady(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle').catch(() => {
    // Staging may keep long-polling connections open; DOM readiness is enough for interaction.
  });
}

// after
export async function waitForPageReady(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  // Chỉ chờ networkidle với timeout ngắn, không bắt buộc
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {
    // Staging may keep long-polling connections open; DOM readiness is enough for interaction.
  });
}
```

---

## 🟡 Warning

### [tests/checkout/guest-order.spec.ts:10] 🟡 W1. Test name mơ hồ

- ❌ Vấn đề: `'mua hàng không login'` — tên test không theo pattern "should [kết quả] when [điều kiện]". Khó biết chính xác behavior đang được verify.
- ✅ Fix:

```typescript
// before
test('mua hàng không login', async ({ page }) => {

// after
test('should place order successfully when guest user completes checkout flow', async ({ page }) => {
```

### [tests/checkout/guest-order.spec.ts:10] 🟡 W5. Thiếu tag để filter

- ❌ Vấn đề: Không có tag, không thể chạy subset trên CI theo nhóm (smoke, regression, checkout).
- ✅ Fix:

```typescript
test('should place order successfully when guest user completes checkout flow @smoke @checkout', async ({ page }) => {
```

### [pages/StorePage.ts:37,48,58] 🟡 C4. Thiếu custom message trong assertion

- ❌ Vấn đề: Các assertion `expect(...).toContainText(/[1-9]/)` không có custom message. Khi fail trên CI, không biết context là đang ở bước nào.
- ✅ Fix:

```typescript
// before
await expect(this.page.locator('a.btn-cart:visible').first()).toContainText(/[1-9]/);

// after
await expect(
  this.page.locator('a.btn-cart:visible').first(),
  'Cart count should show at least 1 item after adding product'
).toContainText(/[1-9]/);
```

### [pages/CheckoutPage.ts:38-41,59-62,74] 🟡 C4. Thiếu custom message trong assertion

- ❌ Vấn đề: Nhiều assertion trong `completeAddressForm()`, `changeShippingUnit()`, `placeOrderAndWaitForSuccess()` thiếu custom message.
- ✅ Fix:

```typescript
// before
await expect(doneButton).toBeEnabled();
await doneButton.click();
await expect(dialog).toBeHidden();

// after
await expect(doneButton, 'Done button should be enabled before completing address').toBeEnabled();
await doneButton.click();
await expect(dialog, 'Address dialog should close after completing').toBeHidden();
```

### [playwright.config.ts:26] 🟡 Config: `trace: 'retain-on-failure'` nặng hơn khuyến nghị

- ❌ Vấn đề: Rule khuyến nghị `'on-first-retry'` để cân bằng giữa debug capability và performance. `'retain-on-failure'` lưu trace ngay cả khi không retry, tốn disk và thời gian.
- ✅ Fix:

```typescript
// before
trace: 'retain-on-failure'

// after
trace: 'on-first-retry'
```

---

## 🟢 Suggestion

### [pages/StorePage.ts:54-56] 🟢 S2. Selector có thể cải thiện

- 💡 `productCard.locator('.btn-qty .qty-right:has(.icon-add-circle), .btn-qty .icon-add-circle')` — dùng CSS class deep selector. Nếu có `data-testid` trên element này, nên ưu tiên dùng.
- Nếu chưa có, có thể suggest dev thêm `data-testid` cho add-to-cart icon control.

### [pages/CheckoutPage.ts:199-222] 🟢 S2. `selectShippingOption` dùng `evaluate` để set checkbox

- 💡 `nativeControl.evaluate(...)` với `input.checked = true; input.click(); dispatchEvent(...)` — đây là workaround cho custom control. Nên suggest dev team expose accessible locator (data-testid) để tránh phải dùng evaluate.

### [playwright.config.ts:15] 🟢 Config: `workers: CI ? 1 : undefined`

- 💡 CI chỉ dùng 1 worker là an toàn nhưng chậm. Có thể tăng lên 2 để cân bằng giữa speed và stability.

---

# 🎯 Top 3 ưu tiên làm ngay

1. **CheckoutPage.ts:150** — `catch(() => undefined)` nuốt lỗi → cần ít nhất log warning + fallback rõ ràng
2. **fixtures/test-data.ts:14-21** — Test data hardcoded, không unique → gây flaky khi parallel
3. **wait.helper.ts:5** — `networkidle` không timeout → có thể gây timeout treo trên staging

---

# ⚠️ Cần xác nhận

- `fixtures/test-data.ts:16` — Số điện thoại `0989346826` có phải là số thật không? Nếu là số thật, cần chuyển thành fake data hoặc env variable để tránh risk.
- `pages/CheckoutPage.ts:202-208` — Việc dùng `evaluate` để set `input.checked = true` và dispatch event — đây là workaround cho custom UI. Cần confirm rằng không có cách nào dùng Playwright accessible locator để click trực tiếp.

---

# 📎 Cross-file Notes

1. **Selector pattern inconsistency**: `StorePage` dùng `getByRole`/`getByPlaceholder` (tốt), nhưng `CartPage` và `CheckoutPage` dùng nhiều CSS class selector (`.cart__item`, `.content__middle-row_left`, `.services-list__item`). Nên chuẩn hóa về accessible selectors khi có thể.

2. **Test data flow tốt**: Fixture được định nghĩa tập trung trong `fixtures/test-data.ts` và dùng qua import — đúng pattern. Chỉ cần thêm unique generation.

3. **Page Object structure tốt**: BasePage → StorePage/CartPage/CheckoutPage, kế thừa hợp lý. Các page object có kích thước vừa phải, không quá lớn.

4. **Business flow tách biệt tốt**: `steps/checkout.steps.ts` gọi các page object method theo đúng thứ tự business flow — đúng pattern.

5. **Config/URLs separation tốt**: URL được định nghĩa trong `config/urls.ts`, env variables trong `config/env.ts` — đúng pattern.