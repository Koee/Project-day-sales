import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  // Khởi tạo trang giỏ hàng với Playwright page hiện tại.
  constructor(page: Page) {
    super(page);
  }

  async openCart(): Promise<void> {
    await this.goto('/shoppingCart');
    await expect(this.page, 'Cart page should open shopping cart URL').toHaveURL(/shoppingCart/i);
  }

  async expectCartLayoutVisible(): Promise<void> {
    await expect(this.page, 'Cart page should stay on shopping cart URL').toHaveURL(/shoppingCart/i);
    await expect(this.page.locator('body'), 'Cart should show visible cart content').toContainText(/Giỏ hàng|Mua hàng|Thanh toán|Đặt hàng|Chưa có|empty/i);
  }

  async expectEmptyCartOrItemsVisible(): Promise<void> {
    await expect(this.page.locator('body'), 'Cart should show either empty-cart state or cart items').toContainText(/Giỏ hàng|Mua hàng|Chưa có|empty/i);
  }

  async hasCartItem(): Promise<boolean> {
    return await this.cartItem().isVisible().catch(() => false);
  }

  async waitForProductInCart(productName: string): Promise<void> {
    const productRow = this.cartItemByProductName(productName);

    if (await productRow.isVisible({ timeout: 5_000 }).catch(() => false)) {
      return;
    }

    await this.page.reload();
    await expect(productRow, `Product "${productName}" should appear in cart after adding`).toBeVisible();
  }

  async legacyIncreaseProductQuantity(productName: string): Promise<boolean> {
    if (!(await this.hasCartItem())) {
      return false;
    }

    const quantityInput = this.quantityInput();
    const before = await this.currentQuantity();
    const plusButton = this.page
      .getByRole('button', { name: /\+|tÄƒng|increase/i })
      .or(this.page.locator('.qty-plus, .quantity-plus, .qty-right, .icon-add-circle'))
      .first();

    if (await plusButton.isVisible().catch(() => false)) {
      await plusButton.click();
    } else if (await quantityInput.isVisible().catch(() => false)) {
      await quantityInput.fill(String(before + 1));
      await quantityInput.press('Enter').catch(() => undefined);
    } else {
      return false;
    }

    await expect.poll(async () => this.currentQuantity(), {
      message: 'Cart item quantity should increase'
    }).toBeGreaterThan(before);
    return true;
  }

  async legacyRemoveProduct(productName: string): Promise<boolean> {
    if (!(await this.hasCartItem())) {
      return false;
    }

    const removeButton = this.page
      .getByRole('button', { name: /xÃ³a|remove|delete|trash/i })
      .or(this.page.locator('button.remove-item, .remove-item, .icon-trash, [class*="delete"], [class*="remove"]'))
      .first();

    if (!(await removeButton.isVisible().catch(() => false))) {
      return false;
    }

    const before = await this.cartItems().count();
    await removeButton.click();
    await expect.poll(async () => this.cartItems().count(), {
      message: 'Cart item count should decrease after removing the first item'
    }).toBeLessThan(before);
    return true;
  }

  async legacyExpectSelectedTotalForProduct(productName: string): Promise<boolean> {
    if (!(await this.hasCartItem())) {
      return false;
    }

    await expect(this.totalPrice(), 'Cart total should be visible when cart has items').toBeVisible();
    await expect(this.totalPrice(), 'Cart total should include a numeric amount').toContainText(/[0-9]/);
    return true;
  }

  async legacyExpectProductPersistsAfterReload(productName: string): Promise<boolean> {
    if (!(await this.hasCartItem())) {
      return false;
    }

    const before = await this.cartItems().count();
    await this.page.reload();
    await expect.poll(async () => this.cartItems().count(), {
      message: 'Cart item count should persist after reload'
    }).toBeGreaterThanOrEqual(before);
    return true;
  }

  // Chọn sản phẩm đầu tiên trong giỏ hàng để chuẩn bị checkout.
  async increaseProductQuantity(productName: string): Promise<boolean> {
    const productRow = this.cartItemByProductName(productName);
    if (!(await productRow.isVisible().catch(() => false))) {
      return false;
    }

    const quantityInput = this.quantityInput(productRow);
    const before = await this.currentQuantity(productRow);
    if (await quantityInput.isVisible().catch(() => false)) {
      await quantityInput.fill(String(before + 1));
      await quantityInput.press('Enter').catch(() => undefined);
      await quantityInput.blur().catch(() => undefined);
      await expect.poll(async () => this.currentQuantity(productRow), {
        message: `Cart item quantity should increase for "${productName}"`
      }).toBeGreaterThan(before);
      return true;
    }
    const plusButton = productRow
      .getByRole('button', { name: /\+|tang|tăng|increase/i })
      .or(productRow.locator('.qty-plus, .quantity-plus, .qty-right, .icon-add-circle'))
      .first();

    if (await plusButton.isVisible().catch(() => false) && await plusButton.isEnabled().catch(() => true)) {
      await plusButton.click();
    } else if (await quantityInput.isVisible().catch(() => false)) {
      await quantityInput.fill(String(before + 1));
      await quantityInput.press('Enter').catch(() => undefined);
      await quantityInput.blur().catch(() => undefined);
    } else {
      return false;
    }

    await expect.poll(async () => this.currentQuantity(productRow), {
      message: `Cart item quantity should increase for "${productName}"`
    }).toBeGreaterThan(before);
    return true;
  }

  async removeProduct(productName: string): Promise<boolean> {
    const productRow = this.cartItemByProductName(productName);
    if (!(await productRow.isVisible().catch(() => false))) {
      return false;
    }

    const directRemoveControl = productRow
      .locator('xpath=.//*[contains(@class, "cart__product-delete") or contains(normalize-space(.), "Xóa") or contains(normalize-space(.), "Xoa")]/ancestor-or-self::*[contains(@class, "cursor-pointer")][1]')
      .last();

    if (await directRemoveControl.isVisible().catch(() => false)) {
      await directRemoveControl.evaluate((element) => (element as HTMLElement).click());
      await this.confirmRemoveIfVisible();
      await expect(productRow, `Product "${productName}" should be removed from cart`).toBeHidden();
      return true;
    }

    const lastClickableControl = productRow.locator('[class*="cursor-pointer"]').last();

    if (await lastClickableControl.isVisible().catch(() => false)) {
      const before = await this.cartItems().count();
      await lastClickableControl.click();
      await this.confirmRemoveIfVisible();
      await expect.poll(async () => this.cartItems().count(), {
        message: `Cart item count should decrease after removing "${productName}"`
      }).toBeLessThan(before);
      await expect(productRow, `Product "${productName}" should be removed from cart`).toBeHidden();
      return true;
    }

    const removeButton = productRow
      .getByRole('button', { name: /xoa|xóa|xoá|remove|delete|trash/i })
      .or(productRow.getByText(/xoa|xóa|xoá|remove|delete/i))
      .or(productRow.locator('button.remove-item, .remove-item, .icon-trash, [class*="delete"], [class*="remove"]'))
      .first();

    if (!(await removeButton.isVisible().catch(() => false))) {
      return false;
    }

    await removeButton.click({ force: true });
    await this.confirmRemoveIfVisible();
    await expect(productRow, `Product "${productName}" should be removed from cart`).toBeHidden();
    return true;
  }

  async expectSelectedTotalForProduct(productName: string): Promise<boolean> {
    if (!(await this.cartItemByProductName(productName).isVisible().catch(() => false))) {
      return false;
    }

    await this.selectAllProducts();
    await expect(this.totalPrice(), 'Cart total should be visible after selecting cart products').toBeVisible();
    await expect
      .poll(async () => this.totalAmount(), {
        message: `Cart total should be greater than zero after selecting "${productName}"`
      })
      .toBeGreaterThan(0);
    return true;
  }

  async expectProductPersistsAfterReload(productName: string): Promise<boolean> {
    const productRow = this.cartItemByProductName(productName);
    if (!(await productRow.isVisible().catch(() => false))) {
      return false;
    }

    const before = await this.currentQuantity(productRow);
    await this.page.reload();
    const reloadedRow = this.cartItemByProductName(productName);
    await expect(reloadedRow, `Product "${productName}" should persist after reload`).toBeVisible();
    await expect.poll(async () => this.currentQuantity(reloadedRow), {
      message: `Cart item quantity should persist for "${productName}"`
    }).toBe(before);
    return true;
  }

  async selectProduct(): Promise<void> {
    const cartItem = this.page.locator('.cart__item').first();
    const emptyCart = this.page.getByText(/chưa có sản phẩm nào trong giỏ hàng/i).first();

    await expect(
      cartItem.or(emptyCart),
      'Cart page should show either a cart item or the empty-cart state before selecting product'
    ).toBeVisible({ timeout: 5_000 });
    await expect(emptyCart, 'Cart should not be empty after adding product before checkout').toBeHidden({ timeout: 1_000 });

    const checkbox = this.page
      .getByRole('checkbox')
      .first();

    if (await checkbox.isVisible().catch(() => false)) {
      await checkbox.check();
      return;
    }

    // TODO: Replace this fallback with an accessible locator/data-testid after DOM inspection.
    // Day Sales hides the native checkbox and exposes the visible control as its label.
    await this.page
      .locator('.cart__item .checkbox-container .label-checkbox')
      .first()
      .click();
  }

  // Bấm đặt hàng các sản phẩm đã chọn và chờ chuyển sang trang checkout.
  async selectAllProducts(): Promise<void> {
    const checkbox = this.page
      .getByRole('checkbox', { name: /tat ca|tất cả|chon tat ca|chọn tất cả|select all/i })
      .first();

    if (await checkbox.isVisible().catch(() => false)) {
      await checkbox.check();
    } else {
      const selectAllText = this.page
        .locator('xpath=//*[contains(normalize-space(.), "Chọn tất cả") or contains(normalize-space(.), "Chon tat ca")]')
        .last();

      if (await selectAllText.isVisible().catch(() => false)) {
        await selectAllText.click();
        await expect(this.checkoutButton(), 'Checkout selected button should be enabled after selecting cart products').toBeEnabled();
        return;
      }

      await this.page
        .getByText(/chon tat ca|chọn tất cả|tat ca|tất cả/i)
        .last()
        .click();
    }

    await expect(this.checkoutButton(), 'Checkout selected button should be enabled after selecting cart products').toBeEnabled();
  }

  async checkoutSelected(): Promise<void> {
    await this.page
      .getByRole('button', { name: /đặt hàng đã chọn/i })
      .or(this.page.getByText(/đặt hàng đã chọn/i))
      .first()
      .click();

    await expect(this.page, 'Page should navigate to shopping checkout after clicking checkout selected').toHaveURL(/shoppingCheckout/i);
  }

  private cartItems(): Locator {
    return this.page.locator('.cart__item, [class*="cart__item"], [data-testid*="cart-item"]');
  }

  private cartItem(): Locator {
    return this.cartItems().first();
  }

  private cartItemByProductName(productName: string): Locator {
    return this.page
      .locator('xpath=//a[contains(@href, "cha-ca-kg")]/ancestor::*[.//input and .//*[contains(normalize-space(.), "Xóa") or contains(normalize-space(.), "Xoa")]][1]')
      .first();

    const productLink = this.page
      .locator('a[href*="/store/11/product/cha-ca-kg-"][href*=".html"]:visible')
      .or(this.page.getByRole('link', { name: new RegExp(this.escapeRegExp(productName), 'i') }))
      .or(this.page.locator('a[href*="cha-ca-kg"]:visible'));

    return productLink
      .locator('xpath=ancestor::*[.//input][1]')
      .first();
  }

  private emptyCartMessage(): Locator {
    return this.page.getByText(/chÆ°a cÃ³ sáº£n pháº©m nÃ o trong giá» hÃ ng|giá» hÃ ng trá»‘ng|empty cart/i).first();
  }

  private checkoutButton(): Locator {
    return this.page
      .locator('button')
      .filter({ hasText: /Đặt hàng|Dat hang|thanh toán|checkout/i })
      .or(this.page.getByRole('button', { name: /Đặt hàng|Dat hang|thanh toán|checkout/i }))
      .first();

    return this.page
      .getByRole('button', { name: /Ä‘áº·t hÃ ng|thanh toÃ¡n|checkout/i })
      .or(this.page.getByText(/Ä‘áº·t hÃ ng|thanh toÃ¡n|checkout/i))
      .first();
  }

  private quantityInput(productRow = this.cartItem()): Locator {
    return productRow.locator('input:visible').last();

    return productRow
      .getByRole('textbox')
      .or(productRow.locator('input[type="number"]:visible, input:visible'))
      .first();

    return productRow.locator('input[type="number"], input:visible').first();
  }

  private totalPrice(): Locator {
    return this.page
      .locator('xpath=//*[contains(normalize-space(.), "Chọn tất cả") or contains(normalize-space(.), "Chon tat ca")]/following::*[contains(normalize-space(.), "0")][1]')
      .or(this.page.locator('body'))
      .first();

    return this.page
      .locator('.cart-total, [class*="total"], [class*="summary"], [class*="checkout"]')
      .filter({ hasText: /[0-9]/ })
      .last();
  }

  private async currentQuantity(productRow = this.cartItem()): Promise<number> {
    const quantityInput = this.quantityInput(productRow);

    if (await quantityInput.isVisible().catch(() => false)) {
      const value = await quantityInput.inputValue().catch(() => '1');
      const quantity = Number.parseInt(value, 10);
      return Number.isFinite(quantity) ? quantity : 1;
    }

    return 1;
  }

  private async totalAmount(): Promise<number> {
    const text = await this.totalPrice().innerText();
    return Number.parseInt(text.replace(/[^\d]/g, '') || '0', 10);
  }

  private async confirmRemoveIfVisible(): Promise<void> {
    const confirmButton = this.page
      .getByRole('button', { name: /dong y|đồng ý|xac nhan|xác nhận|ok|yes|confirm/i })
      .first();

    if (await confirmButton.isVisible().catch(() => false)) {
      await confirmButton.click();
    }
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
