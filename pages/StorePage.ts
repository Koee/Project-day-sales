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

  async openStore11ProductList(): Promise<void> {
    await this.page.goto(`${urls.store11}/product`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {
      // Staging product listing may keep background requests open.
    });
  }

  async expectStoreLayoutVisible(): Promise<void> {
    await expect(this.page, 'Store page should stay on store or product listing URL').toHaveURL(/\/store\/11|\/product/i);
    await expect(this.header(), 'Store header should be visible').toBeVisible();
    await expect(this.productListSignal(), 'Store product content should be visible').toBeVisible();
    await expect(this.footer(), 'Store footer should be visible').toBeVisible();
  }

  async expectHeaderVisible(): Promise<void> {
    await expect(this.headerLogo(), 'Header logo should be visible').toBeVisible();
    await expect(this.cartEntry(), 'Cart entry should be visible in header').toBeVisible();
    await expect(this.loginOrUserEntry(), 'Header should show login or user entry').toBeVisible();
  }

  async expectMobileLayout(): Promise<void> {
    await expect(this.header(), 'Mobile header should be visible').toBeVisible();
    await expect(this.productListSignal(), 'Mobile product content should be visible').toBeVisible();

    const hasHorizontalOverflow = await this.page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(hasHorizontalOverflow, 'Mobile store should not have horizontal overflow').toBe(false);
  }

  async expectFirstProductCardVisible(): Promise<void> {
    const productCard = this.firstProductCard();

    await expect(productCard, 'First product card should be visible').toBeVisible();
    await expect(productCard.locator('img').first(), 'First product card image should be visible').toBeVisible();
    await expect(this.firstProductName(), 'First product name should be visible').toBeVisible();
    await expect(productCard, 'First product card should show a price or reward value').toContainText(/₫|cad|Ä‘iá»ƒm|[0-9][0-9.,]*/i);
  }

  async expectProductImagesLoaded(): Promise<void> {
    const images = this.page.locator('main img:visible, .product-item img:visible, img[alt*="Thumbnail"]:visible');
    const imageCount = await images.count();

    expect(imageCount, 'Store should render at least one visible product image').toBeGreaterThan(0);

    for (let index = 0; index < Math.min(imageCount, 10); index += 1) {
      const naturalWidth = await images.nth(index).evaluate((image) => (image as HTMLImageElement).naturalWidth);
      expect(naturalWidth, `Product image ${index + 1} should not be broken`).toBeGreaterThan(0);
    }
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
  async hasSearchInput(): Promise<boolean> {
    return await this.page
      .getByPlaceholder(/tÃ¬m kiáº¿m|search|nháº­p tÃªn sáº£n pháº©m|nháº­p/i)
      .first()
      .isVisible()
      .catch(() => false);
  }

  async expectSearchResult(productName: string): Promise<void> {
    await expect(this.page.getByText(productName, { exact: false }).first(), 'Search result should contain product name').toBeVisible();
  }

  async openFirstProductDetail(): Promise<void> {
    const productLink = this.firstProductLink();

    await expect(productLink, 'First product detail link should be visible').toBeVisible();
    await productLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectProductDetailVisible(): Promise<void> {
    await expect(this.page, 'Product detail should open product URL').toHaveURL(/\.html|\/product\//i);
    await expect(this.page.locator('body'), 'Product detail should show product and price content').toContainText(/₫|cad|Ä‘iá»ƒm|giÃ¡|price/i);
  }

  async expectCartBadgeVisible(): Promise<void> {
    await expect(this.page.locator('a.btn-cart:visible, a[href*="shoppingCart"]:visible').first(), 'Cart badge/link should be visible').toContainText(/[1-9]/);
  }

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

  private header(): Locator {
    return this.page.locator('header, nav, .header, #header, [role="banner"]').first();
  }

  private footer(): Locator {
    return this.page.locator('footer, .footer, [role="contentinfo"]').first();
  }

  private headerLogo(): Locator {
    return this.page
      .getByRole('link', { name: /brandLogo|logo/i })
      .or(this.page.locator('img[alt*="logo" i], header img, nav img').first())
      .first();
  }

  private cartEntry(): Locator {
    return this.page
      .getByRole('link', { name: /giá» hÃ ng|cart/i })
      .or(this.page.locator('a[href*="shoppingCart"], a.btn-cart'))
      .first();
  }

  private loginOrUserEntry(): Locator {
    return this.page
      .locator('a[href*="/user/profile"]:visible, #usercol:visible, #user-col:visible, .header-block--user:visible')
      .or(this.page.getByRole('link', { name: /Ä‘Äƒng nháº­p|đăng nhập|login|tÃ´i|tôi|profile/i }))
      .or(this.page.getByRole('button', { name: /Ä‘Äƒng nháº­p|đăng nhập|login|tÃ´i|tôi|profile/i }))
      .first();
  }

  private productListSignal(): Locator {
    return this.page
      .locator('.product-item, .product-card, [data-testid*="product"], main a[href*=".html"], main a[href*="/product/"]')
      .first();
  }

  private firstProductCard(): Locator {
    return this.page.locator('.product-item, .product-card, [data-testid*="product"], article, main li').first();
  }

  private firstProductName(): Locator {
    return this.page.locator('.product-item strong, .product-card strong, main a[href*=".html"] strong, main a[href*="/product/"] strong').first();
  }

  private firstProductLink(): Locator {
    return this.page.locator('main a[href*=".html"], main a[href*="/product/"]').first();
  }
}
