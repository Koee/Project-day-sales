import { expect, type Locator, type Page } from '@playwright/test';
import { urls } from '../config/urls';
import { BasePage } from './BasePage';

export class StorePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async openStore11(): Promise<void> {
    await this.goto(urls.store11);
  }

  async openProductWithSalesChannel(): Promise<void> {
    await this.goto(urls.productWithSalesChannel);
  }

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

  async addProductToCart(productName: string): Promise<void> {
    const detailAddButton = this.page
      .getByRole('button', { name: /thêm vào giỏ hàng|add to cart/i })
      .first();

    if (await detailAddButton.isVisible().catch(() => false)) {
      await detailAddButton.click();
      await expect(this.page.locator('a.btn-cart:visible').first()).toContainText(/[1-9]/);
      return;
    }

    const productCard = await this.findProductCard(productName);
    const addButton = productCard
      .getByRole('button', { name: /thêm.*giỏ|add.*cart|mua/i })
      .first();

    if (await addButton.isVisible().catch(() => false)) {
      await addButton.click();
      await expect(this.page.locator('a.btn-cart:visible').first()).toContainText(/[1-9]/);
      return;
    }

    // Day Sales currently renders add-to-cart as an icon-only custom control.
    await productCard
      .locator('.btn-qty .qty-right:has(.icon-add-circle), .btn-qty .icon-add-circle')
      .first()
      .click();

    await expect(this.page.locator('a.btn-cart:visible').first()).toContainText(/[1-9]/);
  }

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

    await expect(this.page).toHaveURL(new RegExp(urls.cart, 'i'));
  }

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
