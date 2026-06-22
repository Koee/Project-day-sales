import { type Page } from '@playwright/test';
import type { DeliveryAddress } from '../fixtures/test-data';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  private textFieldFallbackIndex = 0;

  constructor(page: Page) {
    super(page);
  }

  async openAddressForm(): Promise<void> {
    await this.page
      .getByRole('button', { name: /nhập địa chỉ giao\/ nhận hàng|nhập địa chỉ/i })
      .or(this.page.getByText(/nhập địa chỉ giao\/ nhận hàng|nhập địa chỉ/i))
      .first()
      .click();
  }

  async fillDeliveryAddress(address: DeliveryAddress): Promise<void> {
    await this.fillTextField(/tên người giao\/nhận hàng|họ và tên|tên/i, address.recipientName);
    await this.fillTextField(/số điện thoại giao\/nhận hàng|số điện thoại|phone/i, address.phone);
    await this.selectOptionLike(/tỉnh|thành phố|province/i, address.province);
    await this.selectOptionLike(/quận\/huyện|quận|huyện|district/i, address.district);
    await this.selectOptionLike(/phường\/xã\/thị trấn|phường|xã|ward/i, address.ward);
    await this.fillTextField(/địa chỉ|số nhà|address/i, address.address);
  }

  private async fillTextField(labelOrPlaceholder: RegExp, value: string): Promise<void> {
    const byPlaceholder = this.page.getByPlaceholder(labelOrPlaceholder).first();
    if (await byPlaceholder.isVisible().catch(() => false)) {
      await byPlaceholder.fill(value);
      return;
    }

    const byLabel = this.page.getByLabel(labelOrPlaceholder).first();
    if (await byLabel.isVisible().catch(() => false)) {
      await byLabel.fill(value);
      return;
    }

    // TODO: Inspect exact form attributes with Playwright MCP if labels are not accessible.
    await this.page.locator('input, textarea').nth(this.textFieldFallbackIndex).fill(value);
    this.textFieldFallbackIndex += 1;
  }

  private async selectOptionLike(labelOrPlaceholder: RegExp, value: string): Promise<void> {
    const field = this.page
      .getByRole('combobox', { name: labelOrPlaceholder })
      .or(this.page.getByPlaceholder(labelOrPlaceholder))
      .or(this.page.getByLabel(labelOrPlaceholder))
      .first();

    if (await field.isVisible().catch(() => false)) {
      await field.click();
      await field.fill(value).catch(() => undefined);
      await this.page.getByRole('option', { name: new RegExp(value, 'i') }).or(this.page.getByText(value)).first().click();
      return;
    }

    // TODO: Inspect cascading location dropdowns with Playwright MCP if custom controls differ.
    await this.page.getByText(labelOrPlaceholder).first().click();
    await this.page.getByText(value, { exact: false }).first().click();
  }
}
