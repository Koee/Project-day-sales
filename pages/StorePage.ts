import { expect, type Locator, type Page } from '@playwright/test';
import { urls } from '../config/urls';
import { BasePage } from './BasePage';

export class StorePage extends BasePage {
  // Khởi tạo trang cửa hàng với Playwright page hiện tại.
  constructor(page: Page) {
    super(page);
  }

  // Mở trang cửa hàng 11.
  async openStore11(): Promise<void> {
    await this.goto(urls.store11);
  }

  // Mở trang chi tiết sản phẩm có sales channel.
  async openProductWithSalesChannel(): Promise<void> {
    await this.goto(urls.productWithSalesChannel);
  }

  // Tìm kiếm sản phẩm theo tên nếu ô tìm kiếm hiển thị.
  async searchProduct(productName: string): Promise<void> {
    const searchInput = this.page
      .getByPlaceholder(/tìm kiếm|search|nhập tên sản phẩm/i)
      .first();

    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill(productName);
      await searchInput.press('Enter');
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  // Thêm sản phẩm vào giỏ từ trang chi tiết hoặc card sản phẩm.
  async addProductToCart(productName: string): Promise<void> {
    const detailAddButton = this.page
      .getByRole('button', { name: /thêm vào giỏ hàng|add to cart/i })
      .first();

    if (await detailAddButton.isVisible().catch(() => false)) {
      await detailAddButton.click();
      await expect(
        this.page.locator('a.btn-cart:visible').first(),
        'Cart count should show at least 1 item after adding product from detail page'
      ).toContainText(/[1-9]/);
      return;
    }

    const productCard = await this.findProductCard(productName);
    const addButton = productCard
      .getByRole('button', { name: /thêm.*giỏ|add.*cart|mua/i })
      .first();

    if (await addButton.isVisible().catch(() => false)) {
      await addButton.click();
      await expect(
        this.page.locator('a.btn-cart:visible').first(),
        'Cart count should show at least 1 item after adding product from product card'
      ).toContainText(/[1-9]/);
      return;
    }

    // Day Sales currently renders add-to-cart as an icon-only custom control.
    await productCard
      .locator('.btn-qty .qty-right:has(.icon-add-circle), .btn-qty .icon-add-circle')
      .first()
      .click();

    await expect(
      this.page.locator('a.btn-cart:visible').first(),
      'Cart count should show at least 1 item after clicking icon add-to-cart'
    ).toContainText(/[1-9]/);
  }

  // Điều hướng sang trang giỏ hàng.
  async goToCart(): Promise<void> {
    const cartLink = this.page
      .getByRole('link', { name: /giỏ hàng|cart/i })
      .or(this.page.getByRole('button', { name: /giỏ hàng|cart/i }))
      .first();

    if (await cartLink.isVisible().catch(() => false)) {
      await cartLink.click();
    } else {
      await this.page.goto(urls.cart);
    }

    await expect(this.page, 'Page URL should match cart URL after navigating to cart').toHaveURL(new RegExp(urls.cart, 'i'));
  }

  // Tìm card sản phẩm theo tên, có fallback khi DOM chưa có locator ổn định.
  private async findProductCard(productName: string): Promise<Locator> {
    const namedProduct = this.page
      .getByText(productName, { exact: false })
      .locator(
        'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " product-item ")][1]'
      );

    if (await namedProduct.first().isVisible().catch(() => false)) {
      return namedProduct.first();
    }

    // TODO: Replace this fallback after inspecting the product list DOM with Playwright MCP.
    return this.page
      .locator('[data-testid*="product"], .product-item, .product-card, article, li')
      .first();
  }
}
