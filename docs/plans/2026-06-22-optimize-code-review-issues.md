# Kịch bản tối ưu code — dựa trên kết quả Review Code

## Mục tiêu
Fix toàn bộ issues từ code review: 3 Critical, 5 Warning, 3 Suggestion.

## Quy tắc làm việc

- **Mỗi task = 1 branch riêng**, tạo từ `main` / `develop`
- **Mỗi branch chỉ chứa 1-2 file thay đổi** — dễ review, dễ revert
- **Sau mỗi branch**: chạy `npm run typecheck` + `npx playwright test --list` để verify không lỗi
- **Không thay đổi business logic** — chỉ thay đổi test code

---

## 🗂️ Branch plan

### Branch 1: `fix/checkout-empty-catch`

**File thay đổi:** `pages/CheckoutPage.ts` (dòng 129-137, 148-152)

**Mục tiêu:** Fix 🔴 C10 — `catch(() => undefined)` đang nuốt lỗi.

**Thay đổi:**
```typescript
// === BEFORE (dòng 129-137) ===
private async fillAddressTextField(field: AddressField, value: string): Promise<void> {
    const textField = this.addressTextField(field);
    if (await textField.isVisible().catch(() => false)) {
      await textField.fill(value);
      return;
    }

    // TODO: Replace this fallback...
    await this.currentDialog().locator('input:visible, textarea:visible').nth(this.getAddressTextFallbackIndex(field)).fill(value);
  }

// === AFTER ===
private async fillAddressTextField(field: AddressField, value: string): Promise<void> {
    const textField = this.addressTextField(field);
    if (await textField.isVisible().catch(() => false)) {
      try {
        await textField.fill(value);
      } catch (e) {
        console.warn(`[CheckoutPage] fillAddressTextField: fill() failed for "${field}" with accessible locator, using fallback index:`, e);
        await this.currentDialog().locator('input:visible, textarea:visible').nth(this.getAddressTextFallbackIndex(field)).fill(value);
      }
      return;
    }

    // TODO: Replace this fallback...
    await this.currentDialog().locator('input:visible, textarea:visible').nth(this.getAddressTextFallbackIndex(field)).fill(value);
  }
```

```typescript
// === BEFORE (dòng 148-152) ===
    if (await fieldControl.isVisible().catch(() => false)) {
      await fieldControl.click();
      await fieldControl.fill(value).catch(() => undefined);  // <-- dòng này
      await this.page.getByRole('option', { name: new RegExp(value, 'i') }).or(this.page.getByText(value)).first().click();
      return;
    }

// === AFTER ===
    if (await fieldControl.isVisible().catch(() => false)) {
      await fieldControl.click();
      try {
        await fieldControl.fill(value);
      } catch (e) {
        console.warn(`[CheckoutPage] selectAddressOption: fill() failed for "${field}", proceeding to select option anyway:`, e);
      }
      await this.page.getByRole('option', { name: new RegExp(value, 'i') }).or(this.page.getByText(value)).first().click();
      return;
    }
```

**Verify:**
```bash
npm run typecheck
npx playwright test --list
```

---

### Branch 2: `fix/test-data-isolation`

**File thay đổi:** `fixtures/test-data.ts`

**Mục tiêu:** Fix 🔴 C12 — test data hardcoded, không unique.

**Thay đổi:**
```typescript
// === BEFORE ===
export const guestDeliveryAddress: DeliveryAddress = {
  recipientName: 'Thạch Lý',
  phone: '0989346826',
  province: 'Hồ Chí Minh',
  district: 'Quận 1',
  ward: 'Phường Bến Nghé',
  address: '327/5 Lê Thánh Tôn'
};

// === AFTER ===
export function createGuestDeliveryAddress(): DeliveryAddress {
  const ts = Date.now();
  return {
    recipientName: `Thạch Lý ${ts}`,
    phone: `0989${String(ts).slice(-7)}`,
    province: 'Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    address: `327/5 Lê Thánh Tôn ${ts}`
  };
}
```

**Cập nhật file sử dụng:** `steps/checkout.steps.ts`
```typescript
// === BEFORE ===
import { guestDeliveryAddress, products } from '../fixtures/test-data';

// === AFTER ===
import { createGuestDeliveryAddress, products } from '../fixtures/test-data';

// Trong function muaHangKhongLogin:
const guestDeliveryAddress = createGuestDeliveryAddress();
```

**Verify:**
```bash
npm run typecheck
```

---

### Branch 3: `fix/networkidle-timeout`

**File thay đổi:** `utils/wait.helper.ts`

**Mục tiêu:** Fix 🔴 C9 — `networkidle` không timeout.

**Thay đổi:**
```typescript
// === BEFORE ===
export async function waitForPageReady(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle').catch(() => {
    // Staging may keep long-polling connections open; DOM readiness is enough for interaction.
  });
}

// === AFTER ===
export async function waitForPageReady(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {
    // Staging may keep long-polling connections open; DOM readiness is enough for interaction.
  });
}
```

**Verify:**
```bash
npm run typecheck
```

---

### Branch 4: `fix/assertion-messages`

**File thay đổi:** `pages/StorePage.ts`, `pages/CheckoutPage.ts`

**Mục tiêu:** Fix 🟡 C4 — thêm custom message cho tất cả assertion.

**StorePage.ts — các dòng cần sửa (37, 48, 58):**
```typescript
// BEFORE (dòng 37)
await expect(this.page.locator('a.btn-cart:visible').first()).toContainText(/[1-9]/);

// AFTER
await expect(
  this.page.locator('a.btn-cart:visible').first(),
  'Cart count should show at least 1 item after adding product from detail page'
).toContainText(/[1-9]/);
```

```typescript
// BEFORE (dòng 48)
await expect(this.page.locator('a.btn-cart:visible').first()).toContainText(/[1-9]/);

// AFTER
await expect(
  this.page.locator('a.btn-cart:visible').first(),
  'Cart count should show at least 1 item after adding product from product card'
).toContainText(/[1-9]/);
```

```typescript
// BEFORE (dòng 58)
await expect(this.page.locator('a.btn-cart:visible').first()).toContainText(/[1-9]/);

// AFTER
await expect(
  this.page.locator('a.btn-cart:visible').first(),
  'Cart count should show at least 1 item after clicking icon add-to-cart'
).toContainText(/[1-9]/);
```

**CheckoutPage.ts — các dòng cần sửa (38-41, 59-62, 74):**
```typescript
// BEFORE (dòng 38-41)
    await expect(doneButton).toBeEnabled();
    await doneButton.click();
    await expect(dialog).toBeHidden();

// AFTER
    await expect(doneButton, 'Done button should be enabled before completing address form').toBeEnabled();
    await doneButton.click();
    await expect(dialog, 'Address dialog should close/hide after clicking done').toBeHidden();
```

```typescript
// BEFORE (dòng 59-62)
    await expect(doneButton).toBeEnabled();
    await doneButton.click();
    await expect(dialog).toBeHidden();

// AFTER
    await expect(doneButton, 'Done button should be enabled before completing shipping unit change').toBeEnabled();
    await doneButton.click();
    await expect(dialog, 'Shipping dialog should close/hide after clicking done').toBeHidden();
```

```typescript
// BEFORE (dòng 74)
    await expect(this.orderSuccessMessage()).toBeVisible();

// AFTER
    await expect(
      this.orderSuccessMessage(),
      'Order success message should appear after placing order'
    ).toBeVisible();
```

**Verify:**
```bash
npm run typecheck
```

---

### Branch 5: `fix/test-name-and-tags`

**File thay đổi:** `tests/checkout/guest-order.spec.ts`

**Mục tiêu:** Fix 🟡 W1 + W5 — test name + thêm tags.

**Thay đổi:**
```typescript
// === BEFORE ===
  test('mua hàng không login', async ({ page }) => {

// === AFTER ===
  test('should place order successfully when guest user completes checkout flow @smoke @checkout', async ({ page }) => {
```

**Verify:**
```bash
npx playwright test --list
# Kiểm tra test title hiển thị đúng
npx playwright test --grep "@smoke" --list
# Kiểm tra filter hoạt động
```

---

### Branch 6: `chore/trace-config`

**File thay đổi:** `playwright.config.ts`

**Mục tiêu:** Fix 🟡 Warning — đổi trace từ `'retain-on-failure'` sang `'on-first-retry'`.

**Thay đổi:**
```typescript
// === BEFORE (dòng 26) ===
    trace: 'retain-on-failure'

// === AFTER ===
    trace: 'on-first-retry'
```

**Verify:**
```bash
npm run typecheck
npx playwright test --list
```

---

## 📊 Thứ tự ưu tiên thực hiện

| Thứ tự | Branch | Lý do |
|--------|--------|-------|
| 1 | `fix/checkout-empty-catch` | Nguy cơ silent failure cao nhất |
| 2 | `fix/test-data-isolation` | Gây flaky khi chạy parallel |
| 3 | `fix/networkidle-timeout` | Gây timeout treo trên staging |
| 4 | `fix/assertion-messages` | Debug trên CI khó khăn |
| 5 | `fix/test-name-and-tags` | Ảnh hưởng khả năng filter CI |
| 6 | `chore/trace-config` | Performance nhẹ, ưu tiên thấp |

---

## ✅ Checklist hoàn thành

- [ ] Branch 1: `fix/checkout-empty-catch` — merged
- [ ] Branch 2: `fix/test-data-isolation` — merged
- [ ] Branch 3: `fix/networkidle-timeout` — merged
- [ ] Branch 4: `fix/assertion-messages` — merged
- [ ] Branch 5: `fix/test-name-and-tags` — merged
- [ ] Branch 6: `chore/trace-config` — merged
- [ ] Chạy full test suite pass trên CI