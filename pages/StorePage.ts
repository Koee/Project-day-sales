import { expect, type Locator, type Page, type TestInfo } from '@playwright/test';
import { CartBadgeComponent } from '../components/CartBadgeComponent';
import { FooterComponent } from '../components/FooterComponent';
import { HeaderComponent } from '../components/HeaderComponent';
import { urls } from '../config/urls';
import { gotoAndAssertPageAvailable } from '../utils/page-availability.helper';
import { BasePage } from './BasePage';

export class StorePage extends BasePage {
  // Khởi tạo trang cửa hàng với Playwright page hiện tại.
  constructor(page: Page) {
    super(page);
  }

  // Mở Store 11 và dừng TC nếu staging trả lỗi availability.
  async openStore11(testInfo?: TestInfo): Promise<void> {
    await gotoAndAssertPageAvailable(this.page, urls.store11, 'Store 11', testInfo);
  }

  // Mở home và dừng TC nếu staging trả lỗi availability.
  async openHome(testInfo?: TestInfo): Promise<void> {
    await gotoAndAssertPageAvailable(this.page, urls.home, 'Home page', testInfo);
  }

  async openStore11ProductList(): Promise<void> {
    await gotoAndAssertPageAvailable(this.page, `${urls.store11}/product`, 'Store product list');
    await expect(this.productListSignal(), 'Store product list should be visible after navigation').toBeVisible();
  }

  async expectStoreLayoutVisible(): Promise<void> {
    await expect(this.page, 'Store page should stay on store or product listing URL').toHaveURL(/\/store\/11|\/product/i);
    await this.headerComponent().expectRootVisible('Store header should be visible');
    await expect(this.productListSignal(), 'Store product content should be visible').toBeVisible();
    await this.footerComponent().expectRootVisible('Store footer should be visible');
  }

  async expectHeaderVisible(): Promise<void> {
    await this.headerComponent().expectVisible();
  }

  async expectFooterVisible(): Promise<void> {
    await this.footerComponent().expectVisible();
  }

  async expectHomeBannerSliderVisible(): Promise<void> {
    await expect(this.homeBannerSlider(), 'Home banner or slider should be visible').toBeVisible();
    await expect(this.homeBannerImage(), 'Home banner slider should show a visible image').toBeVisible();
    await expect(this.homeSliderNavigation(), 'Home banner slider should expose navigation controls').toBeVisible();
  }

  async expectHomeCategoriesVisible(): Promise<void> {
    await expect(this.homeCategoryNavigation(), 'Home page should show product category navigation').toBeVisible();
    expect(await this.visibleHomeCategoryCount(), 'Home page should show at least three product category entries').toBeGreaterThanOrEqual(3);
  }

  async expectHomePromotedProductsVisible(): Promise<void> {
    await expect(this.homePromotionSignal(), 'Home page should show promotion or featured product content').toBeVisible();
    await expect(this.productListSignal(), 'Home page should show promoted product cards').toBeVisible();
  }

  async expectMobileLayout(): Promise<void> {
    await this.headerComponent().expectRootVisible('Mobile header should be visible');
    await expect(this.productListSignal(), 'Mobile product content should be visible').toBeVisible();
    await this.page.locator('body').focus();
    await this.productListSignal().scrollIntoViewIfNeeded();
    await this.footerComponent().scrollIntoViewIfNeeded().catch(() => undefined);

    const overflowElements = await this.horizontalOverflowElements();
    expect(overflowElements, `Mobile store should not have horizontal overflow. Overflow elements: ${overflowElements.join(' | ')}`).toEqual([]);
  }

  async fullPageScreenshot(): Promise<Buffer> {
    return await this.page.screenshot({ fullPage: true });
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

  async openProductsByCategory(categoryId: string): Promise<void> {
    await gotoAndAssertPageAvailable(
      this.page,
      `${urls.store11}/product?category_id=${encodeURIComponent(categoryId)}`,
      'Category product list'
    );
    await expect(this.productListSignal(), 'Category product list should be visible').toBeVisible();
  }

  async expectProductListFilteredByCategory(categoryId: string): Promise<void> {
    await expect(this.page, 'Category product list should keep category_id in URL').toHaveURL(new RegExp(`category_id=${categoryId}`));
    await expect(this.productListSignal(), 'Category product list should show products').toBeVisible();
    expect(await this.visibleProductCount(), 'Category product list should include at least one product').toBeGreaterThan(0);
  }

  async filterByPrice(priceFrom: string, priceTo: string): Promise<void> {
    await this.priceFromInput().fill(priceFrom);
    await this.priceToInput().fill(priceTo);
    await this.applyPriceFilterButton().click();
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.productListSignal(), 'Price-filtered product list should be visible').toBeVisible();
  }

  async expectProductPricesWithinRange(priceFrom: number, priceTo: number): Promise<void> {
    await expect(this.page, 'Price filter should keep price_from in URL').toHaveURL(new RegExp(`price_from=${priceFrom}`));
    await expect(this.page, 'Price filter should keep price_to in URL').toHaveURL(new RegExp(`price_to=${priceTo}`));

    const prices = await this.visibleProductPrices();
    expect(prices.length, 'Price filter should return products with visible prices').toBeGreaterThan(0);
    for (const price of prices) {
      expect(price, `Product price ${price} should be >= ${priceFrom}`).toBeGreaterThanOrEqual(priceFrom);
      expect(price, `Product price ${price} should be <= ${priceTo}`).toBeLessThanOrEqual(priceTo);
    }
  }

  async sortByLowestPrice(): Promise<void> {
    await this.lowestPriceSortButton().click();
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.productListSignal(), 'Price-sorted product list should be visible').toBeVisible();
  }

  async expectProductPricesSortedAscending(): Promise<void> {
    await expect(this.page, 'Price sort should keep price order query in URL').toHaveURL(/order=price/);
    await expect(this.page, 'Price sort should request ascending sort').toHaveURL(/sort=asc/);

    const prices = await this.visibleProductPrices();
    expect(prices.length, 'Price sort should return at least two product prices').toBeGreaterThan(1);
    const sortedPrices = [...prices].sort((left, right) => left - right);
    expect(prices, `Visible product prices should be sorted ascending: ${prices.join(', ')}`).toEqual(sortedPrices);
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

  async hasHeaderSearchInput(): Promise<boolean> {
    return await this.headerComponent().hasSearchInput();
  }

  async searchFromHeader(productName: string, testInfo?: TestInfo, searchboxAttachmentName?: string): Promise<void> {
    const productListUrl = productName.trim()
      ? `${urls.store11}/product?keyword=${encodeURIComponent(productName)}`
      : `${urls.store11}/product`;

    await this.headerComponent().search(productName, productListUrl, testInfo, searchboxAttachmentName);
  }

  async attachHeaderSearchScreenshot(testInfo: TestInfo | undefined, attachmentName: string): Promise<void> {
    await this.headerComponent().attachSearchScreenshot(testInfo, attachmentName);
  }

  async focusHeaderSearchForReport(): Promise<void> {
    await this.headerComponent().focusSearchForReport();
  }

  async expectNoSearchResult(productName: string): Promise<void> {
    await expect(this.page.getByText(productName, { exact: false }).first(), 'Unknown search keyword should not show a matching product').toBeHidden();
  }

  async expectProductListVisibleAfterSearch(): Promise<void> {
    await expect(this.page, 'Search should keep the user on store product listing').toHaveURL(/\/store\/11\/product/i);
    await expect(this.productListSignal(), 'Product listing should remain visible after search').toBeVisible();
  }

  async expectNoProductNamed(productName: string): Promise<void> {
    await expect(this.page.getByText(productName, { exact: false }).first(), 'Search should not show this product as a match').toBeHidden();
  }

  async openFirstProductDetail(): Promise<void> {
    const productLink = this.firstProductLink();

    await expect(productLink, 'First product detail link should be visible').toBeVisible();
    const href = await productLink.getAttribute('href');
    if (!href) {
      throw new Error('First product detail link should have an href.');
    }

    await gotoAndAssertPageAvailable(this.page, href, 'Product detail page');
  }

  async expectProductDetailVisible(): Promise<void> {
    await expect(this.page, 'Product detail should open product URL').toHaveURL(/\.html|\/product\//i);
    await expect(this.page.locator('body'), 'Product detail should show product and price content').toContainText(/₫|cad|Ä‘iá»ƒm|giÃ¡|price/i);
  }

  async expectCartBadgeVisible(): Promise<void> {
    await this.cartBadgeComponent().expectHasItems();
  }

  async addProductToCart(productName: string): Promise<void> {
    const detailAddButton = this.page
      .getByRole('button', { name: /thêm vào giỏ hàng|add to cart/i })
      .first();

    if (await detailAddButton.isVisible().catch(() => false)) {
      if (!(await detailAddButton.isEnabled().catch(() => true))) {
        await this.cartBadgeComponent().expectHasItems('Cart badge should already show items when product detail add button is disabled');
        return;
      }

      await detailAddButton.click();
      await this.cartBadgeComponent().expectHasItems('Cart count should show at least 1 item after adding product from detail page');
      return;
    }

    const productCard = await this.findProductCard(productName);
    const addButton = productCard
      .getByRole('button', { name: /thêm.*giỏ|add.*cart|mua/i })
      .first();

    if (await addButton.isVisible().catch(() => false)) {
      await addButton.click();
      await this.cartBadgeComponent().expectHasItems('Cart count should show at least 1 item after adding product from product card');
      return;
    }

    // Day Sales currently renders add-to-cart as an icon-only custom control.
    await productCard
      .locator('.btn-qty .qty-right:has(.icon-add-circle), .btn-qty .icon-add-circle')
      .first()
      .click();

    await this.cartBadgeComponent().expectHasItems('Cart count should show at least 1 item after clicking icon add-to-cart');
  }

  // Điều hướng sang trang giỏ hàng.
  async goToCart(): Promise<void> {
    await this.cartBadgeComponent().openCart(urls.cart);
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

  private headerComponent(): HeaderComponent {
    return new HeaderComponent(this.page);
  }

  private footerComponent(): FooterComponent {
    return new FooterComponent(this.page);
  }

  private cartBadgeComponent(): CartBadgeComponent {
    return new CartBadgeComponent(this.page);
  }

  private priceFromInput(): Locator {
    return this.page.getByRole('textbox', { name: /₫ TỪ/i }).first();
  }

  private priceToInput(): Locator {
    return this.page.getByRole('textbox', { name: /₫ ĐẾN/i }).first();
  }

  private applyPriceFilterButton(): Locator {
    return this.page.getByRole('button', { name: /áp dụng/i }).first();
  }

  private lowestPriceSortButton(): Locator {
    return this.page.getByRole('button', { name: /^giá thấp$/i }).first();
  }

  private homeBannerSlider(): Locator {
    return this.page
      .locator('.slick-slider:visible, .swiper:visible, .carousel:visible, [class*="banner" i]:visible')
      .filter({ has: this.page.locator('img:visible') })
      .first();
  }

  private homeBannerImage(): Locator {
    return this.homeBannerSlider().locator('img:visible').first();
  }

  private homeSliderNavigation(): Locator {
    return this.page
      .getByRole('button', { name: /previous|next/i })
      .or(this.page.locator('.slick-prev:visible, .slick-next:visible, .swiper-button-prev:visible, .swiper-button-next:visible'))
      .first();
  }

  private homeCategoryNavigation(): Locator {
    return this.page
      .getByRole('button', { name: /nhãn hiệu|sản phẩm|khuyến mãi|mã ưu đãi|htpp/i })
      .or(this.page.getByRole('link', { name: /nhãn hiệu|sản phẩm|khuyến mãi|mã ưu đãi|htpp/i }))
      // TODO: Replace CSS fallback after inspecting stable category DOM on Day Sales.
      .or(this.page.locator('nav button:visible, header button:visible, .menu-category:visible'))
      .first();
  }

  private async visibleHomeCategoryCount(): Promise<number> {
    return await this.page
      .getByRole('button', { name: /nhãn hiệu|htpp|sản phẩm|khuyến mãi|mã ưu đãi/i })
      .or(this.page.getByRole('link', { name: /nhãn hiệu|htpp|sản phẩm|khuyến mãi|mã ưu đãi/i }))
      .or(this.page.locator('nav button:visible, header button:visible, .menu-category:visible'))
      .count();
  }

  private homePromotionSignal(): Locator {
    return this.page
      .getByRole('button', { name: /áp dụng/i })
      .or(this.page.getByText(/free ship|giảm|khuyến mãi|sale/i))
      .or(this.page.locator('.coupon:visible, .voucher:visible, [class*="promotion" i]:visible, [class*="coupon" i]:visible'))
      .first();
  }

  private productListSignal(): Locator {
    return this.page
      .locator('.product-item, .product-card, [data-testid*="product"], main a[href*=".html"], main a[href*="/product/"]')
      .first();
  }

  private productCards(): Locator {
    return this.page.locator('.product-item:visible, .product-card:visible');
  }

  private firstProductCard(): Locator {
    return this.page.locator('.product-item, .product-card, [data-testid*="product"], article, main li').first();
  }

  private firstProductName(): Locator {
    return this.page.locator('.product-item strong, .product-card strong, main a[href*=".html"] strong, main a[href*="/product/"] strong').first();
  }

  private firstProductLink(): Locator {
    return this.page
      .locator('a[href*="/store/11/product/"][href*=".html"]:visible, a[href*=".html"]:visible, a[href*="/product/"]:visible')
      .first();

    return this.page.locator('a[href*="/store/11/product/"][href*=".html"], a[href*=".html"], a[href*="/product/"]').first();
  }

  private async visibleProductCount(): Promise<number> {
    return await this.productCards().count();
  }

  private async visibleProductPrices(): Promise<number[]> {
    const productCards = this.productCards();
    const productCount = await productCards.count();
    const prices: number[] = [];

    for (let index = 0; index < Math.min(productCount, 10); index += 1) {
      const text = await productCards.nth(index).innerText();
      const price = this.extractVndPrice(text);
      if (price !== null) {
        prices.push(price);
      }
    }

    return prices;
  }

  private extractVndPrice(text: string): number | null {
    const priceMatch = text.match(/₫\s*([0-9.,]+)/);
    if (!priceMatch) {
      return null;
    }

    return Number(priceMatch[1].replace(/[.,]/g, ''));
  }

  private async horizontalOverflowElements(): Promise<string[]> {
    return await this.page.evaluate(() => {
      const viewportWidth = window.innerWidth;
      return Array.from(document.querySelectorAll('body *'))
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return { element, rect };
        })
        .filter(({ rect }) => rect.width > 0 && rect.right > viewportWidth + 1)
        .filter(({ element }) => {
          const htmlElement = element as HTMLElement;
          return !htmlElement.closest('.slick-track, .slick-slide');
        })
        .slice(0, 5)
        .map(({ element, rect }) => {
          const htmlElement = element as HTMLElement;
          const className = typeof htmlElement.className === 'string' ? htmlElement.className : '';
          const text = (htmlElement.innerText || htmlElement.getAttribute('aria-label') || '').trim().slice(0, 60);
          return `${htmlElement.tagName.toLowerCase()}#${htmlElement.id}.${className} right=${Math.round(rect.right)} text=${text}`;
        });
    });
  }
}
