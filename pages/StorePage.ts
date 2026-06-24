import { expect, type Locator, type Page, type TestInfo } from '@playwright/test';
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
    await expect(this.productListSignal(), 'Store product list should be visible after navigation').toBeVisible();
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

  async expectFooterVisible(): Promise<void> {
    const footer = this.footer();

    await expect(footer, 'Store footer should be visible').toBeVisible();
    await expect(footer, 'Store footer should contain visible footer content').not.toHaveText(/^\s*$/);
  }

  async expectMobileLayout(): Promise<void> {
    await expect(this.header(), 'Mobile header should be visible').toBeVisible();
    await expect(this.productListSignal(), 'Mobile product content should be visible').toBeVisible();
    await this.page.locator('body').focus();
    await this.productListSignal().scrollIntoViewIfNeeded();
    await this.footer().scrollIntoViewIfNeeded().catch(() => undefined);

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
    await this.page.goto(`${urls.store11}/product?category_id=${encodeURIComponent(categoryId)}`, { waitUntil: 'domcontentloaded' });
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
    return await this.headerSearchInput().isVisible().catch(() => false);
  }

  async searchFromHeader(productName: string, testInfo?: TestInfo, searchboxAttachmentName?: string): Promise<void> {
    const searchInput = this.headerSearchInput();
    const productListUrl = productName.trim()
      ? `${urls.store11}/product?keyword=${encodeURIComponent(productName)}`
      : `${urls.store11}/product`;

    if (!(await searchInput.isVisible().catch(() => false))) {
      await this.page.goto(productListUrl, { waitUntil: 'domcontentloaded' });
      return;
    }

    await searchInput.click();
    await searchInput.fill(productName);
    if (testInfo && searchboxAttachmentName) {
      await testInfo.attach(searchboxAttachmentName, {
        body: await this.header().screenshot(),
        contentType: 'image/png'
      });
    }
    await searchInput.press('Enter');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async attachHeaderSearchScreenshot(testInfo: TestInfo | undefined, attachmentName: string): Promise<void> {
    if (!testInfo) {
      return;
    }

    await this.focusHeaderSearchForReport();
    await testInfo.attach(attachmentName, {
      body: await this.header().screenshot(),
      contentType: 'image/png'
    });
  }

  async focusHeaderSearchForReport(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await expect(this.header(), 'Header should be visible before capturing search report').toBeVisible();
    await expect(this.headerSearchInput(), 'Header searchbox should be visible before capturing search report').toBeVisible();
    await this.headerSearchInput().click();
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

    await this.page.goto(href);
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
      if (!(await detailAddButton.isEnabled().catch(() => true))) {
        await expect(
          this.cartBadgeWithItems(),
          'Cart badge should already show items when product detail add button is disabled'
        ).toBeVisible();
        return;
      }

      await detailAddButton.click();
      await expect(
        this.cartBadgeWithItems(),
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
        this.cartBadgeWithItems(),
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
      this.cartBadgeWithItems(),
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
      .getByRole('link', { name: /giỏ hàng|cart/i })
      .or(this.page.locator('a[href*="shoppingCart"], a.btn-cart'))
      .first();
  }

  private cartBadgeWithItems(): Locator {
    return this.page.locator('a.btn-cart:visible, a[href*="shoppingCart"]:visible').filter({ hasText: /[1-9]/ }).first();
  }

  private loginOrUserEntry(): Locator {
    return this.page
      .locator('a[href*="/user/profile"]:visible, #usercol:visible, #user-col:visible, .header-block--user:visible')
      .or(this.page.getByRole('link', { name: /đăng nhập|login|tôi|profile/i }))
      .or(this.page.getByRole('button', { name: /đăng nhập|login|tôi|profile/i }))
      .first();
  }

  private headerSearchInput(): Locator {
    return this.page
      .locator('header input[placeholder]:visible, nav input[placeholder]:visible, input[placeholder]:visible')
      .first();
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
