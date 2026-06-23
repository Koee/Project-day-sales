import { expect, type Locator, type Page } from '@playwright/test';
import type { DeliveryAddress } from '../fixtures/test-data';
import { BasePage } from './BasePage';

type AddressField = 'recipientName' | 'phone' | 'province' | 'district' | 'ward' | 'address';

const addressFieldPatterns: Record<AddressField, RegExp> = {
  recipientName: /tên người giao\/nhận hàng|họ và tên|tên/i,
  phone: /số điện thoại giao\/nhận hàng|số điện thoại|phone/i,
  province: /tỉnh|thành phố|province/i,
  district: /quận\/huyện|quận|huyện|district/i,
  ward: /phường\/xã\/thị trấn|phường|xã|ward/i,
  address: /địa chỉ|số nhà|address/i
};

export class CheckoutPage extends BasePage {
  // Khởi tạo trang thanh toán với Playwright page hiện tại.
  constructor(page: Page) {
    super(page);
  }

  // Mở form nhập địa chỉ nhận hàng.
  async openAddressForm(): Promise<void> {
    await this.addressFormOpenControl().click();
  }

  // Điền đầy đủ thông tin địa chỉ nhận hàng.
  async fillDeliveryAddress(address: DeliveryAddress): Promise<void> {
    await this.fillAddressTextField('recipientName', address.recipientName);
    await this.fillAddressTextField('phone', address.phone);
    await this.selectAddressOption('province', address.province);
    await this.selectAddressOption('district', address.district);
    await this.selectAddressOption('ward', address.ward);
    await this.fillAddressTextField('address', address.address);
  }

  // Hoàn tất form địa chỉ và chờ dialog đóng lại.
  async completeAddressForm(): Promise<void> {
    const dialog = this.currentDialog();
    const doneButton = this.doneButton(dialog);

    await expect(doneButton, 'Done button should be enabled before completing address form').toBeEnabled();
    await doneButton.click();
    await expect(dialog, 'Address dialog should close/hide after clicking done').toBeHidden();
  }

  // Xử lý kiểm tra đã có địa chỉ nhận hàng, nếu chưa có thì chọn hoặc nhập mới.
  async ensureDeliveryAddress(address: DeliveryAddress): Promise<void> {
    if (await this.hasBuyerAccountInfo()) {
      return;
    }

    const openControl = this.addressFormOpenControl();

    if (!(await openControl.isVisible().catch(() => false))) {
      return;
    }

    await openControl.click();

    const dialog = this.currentDialog();
    await expect(dialog, 'Address dialog should be visible after clicking delivery address input').toBeVisible();

    if (await this.selectFirstSavedAddress(dialog)) {
      await this.completeAddressForm();
      return;
    }

    await this.fillDeliveryAddress(address);
    await this.completeAddressForm();
  }

  // Thay đổi đơn vị vận chuyển trong dialog chọn vận chuyển.
  async changeShippingUnit(): Promise<void> {
    const shippingSummary = this.shippingSummary();

    await this.changeShippingUnitControl().click();

    const dialog = this.currentDialog();
    await expect(dialog, 'Shipping unit dialog should be visible after clicking change shipping unit').toBeVisible();

    const shopShipping = this.shopShippingOption(dialog);
    const selectedShopShipping = await shopShipping.isVisible().catch(() => false);
    if (selectedShopShipping) {
      await this.selectShippingOption(shopShipping);
    } else {
      await this.selectShippingOption(this.shippingServiceItems(dialog).first());
    }

    const doneButton = this.doneButton(dialog);
    await expect(doneButton, 'Done button should be enabled before completing shipping unit change').toBeEnabled();
    await doneButton.click();
    await expect(dialog, 'Shipping dialog should close/hide after clicking done').toBeHidden();

    if (selectedShopShipping) {
      await expect(
        shippingSummary,
        'Shipping summary should show shop shipping after selecting shop shipping option'
      ).toContainText(/shop( vận chuyển)?/i);
    } else {
      await expect(shippingSummary, 'Shipping summary should remain visible after changing shipping unit').toBeVisible();
    }
  }

  // Đặt hàng và chờ thông báo đặt hàng thành công.
  async placeOrderAndWaitForSuccess(): Promise<void> {
    await this.placeOrderButton().click();

    await expect(
      this.orderSuccessMessage(),
      'Order success message should appear after placing order'
    ).toBeVisible();
  }

  // Lấy control dùng để mở form địa chỉ nhận hàng.
  private addressFormOpenControl(): Locator {
    return this.page
      .getByRole('button', { name: /nhập địa chỉ giao\/ nhận hàng|nhập địa chỉ/i })
      .or(this.page.getByText(/nhập địa chỉ giao\/ nhận hàng|nhập địa chỉ/i))
      .first();
  }

  // Lấy dialog đang hiển thị gần nhất trên trang.
  private currentDialog(): Locator {
    return this.page.getByRole('dialog').last();
  }

  // Lấy nút hoàn tất hoặc xác nhận trong dialog.
  private doneButton(dialog: Locator): Locator {
    return dialog.getByRole('button', { name: /hoàn tất|xác nhận/i }).first();
  }

  // Kiểm tra checkout đã có thông tin tài khoản mua hàng hay chưa.
  private async hasBuyerAccountInfo(): Promise<boolean> {
    return await this.page.getByText(/tài khoản mua hàng/i).first().isVisible().catch(() => false);
  }

  // Lấy control thay đổi đơn vị vận chuyển.
  private changeShippingUnitControl(): Locator {
    // TODO: Replace this CSS fallback with an accessible locator/data-testid after DOM inspection.
    return this.page
      .locator('.content__middle-row_left .color-primary.cursor-pointer')
      .filter({ hasText: /thay đổi đơn vị vận chuyển|thay đổi/i })
      .first();
  }

  // Lấy vùng tóm tắt đơn vị vận chuyển đã chọn.
  private shippingSummary(): Locator {
    return this.page.locator('.content__middle-right--shipping').first();
  }

  // Lấy danh sách đơn vị vận chuyển trong dialog.
  private shippingServiceItems(dialog: Locator): Locator {
    // TODO: Replace this CSS fallback with an accessible locator/data-testid after DOM inspection.
    return dialog.locator('.services-list__item');
  }

  // Lấy tùy chọn Shop vận chuyển trong danh sách đơn vị vận chuyển.
  private shopShippingOption(dialog: Locator): Locator {
    return this.shippingServiceItems(dialog).filter({ hasText: /shop vận chuyển/i }).first();
  }

  // Lấy nút đồng ý đặt hàng.
  private placeOrderButton(): Locator {
    return this.page.getByRole('button', { name: /đồng ý.*đặt hàng|đặt hàng/i }).first();
  }

  // Lấy thông báo đặt hàng thành công.
  private orderSuccessMessage(): Locator {
    return this.page.getByText(/đặt hàng.*thành công|thành công/i).first();
  }

  // Lấy ô nhập text của từng trường địa chỉ theo locator ưu tiên.
  private addressTextField(field: AddressField): Locator {
    const pattern = addressFieldPatterns[field];

    return this.page
      .getByLabel(pattern)
      .or(this.page.getByRole('textbox', { name: pattern }))
      .or(this.page.getByPlaceholder(pattern))
      .first();
  }

  // Điền text cho trường địa chỉ, có fallback theo thứ tự input khi locator chưa ổn định.
  private async fillAddressTextField(field: AddressField, value: string): Promise<void> {
    const textField = this.addressTextField(field);
    if (await textField.isVisible().catch(() => false)) {
      try {
        await textField.fill(value);
      } catch (e) {
        console.warn(
          `[CheckoutPage] fillAddressTextField: fill() failed for "${field}" with accessible locator, using fallback index:`,
          e
        );
        await this.currentDialog().locator('input:visible, textarea:visible').nth(this.getAddressTextFallbackIndex(field)).fill(value);
      }
      return;
    }

    // TODO: Replace this fallback with data-testid or accessible labels after DOM inspection.
    await this.currentDialog().locator('input:visible, textarea:visible').nth(this.getAddressTextFallbackIndex(field)).fill(value);
  }

  // Chọn giá trị tỉnh, huyện hoặc xã trong form địa chỉ.
  private async selectAddressOption(field: AddressField, value: string): Promise<void> {
    const pattern = addressFieldPatterns[field];
    const fieldControl = this.page
      .getByRole('combobox', { name: pattern })
      .or(this.page.getByLabel(pattern))
      .or(this.page.getByPlaceholder(pattern))
      .first();

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

    const dialog = this.currentDialog();
    const labelText = dialog.getByText(pattern).first();
    if (await labelText.isVisible().catch(() => false)) {
      await labelText.click();
      await this.selectVisibleDropdownOption(value);
      return;
    }

    const customSelect = dialog.locator('.select-box:visible').nth(this.getAddressSelectFallbackIndex(field));
    await expect(customSelect, `Address custom select fallback should be visible for "${field}"`).toBeVisible();
    await customSelect.click();
    await this.selectVisibleDropdownOption(value);
  }

  // Chọn option đang hiển thị trong dropdown theo text truyền vào.
  private async selectVisibleDropdownOption(value: string): Promise<void> {
    const option = this.page
      .getByRole('option', { name: new RegExp(value, 'i') })
      .or(this.page.locator('.select-box__item:visible', { hasText: value }))
      .first();

    await expect(option, `Dropdown option "${value}" should be visible before selection`).toBeVisible();
    await option.click();
  }

  // Lấy index fallback cho các ô nhập text của địa chỉ.
  private getAddressTextFallbackIndex(field: AddressField): number {
    const textFieldIndexes: Partial<Record<AddressField, number>> = {
      recipientName: 0,
      phone: 1,
      address: 2
    };

    return textFieldIndexes[field] ?? 0;
  }

  // Lấy index fallback cho các dropdown địa chỉ.
  private getAddressSelectFallbackIndex(field: AddressField): number {
    const selectIndexes: Partial<Record<AddressField, number>> = {
      province: 1,
      district: 2,
      ward: 3
    };

    return selectIndexes[field] ?? 0;
  }

  // Chọn một tùy chọn đơn vị vận chuyển, hỗ trợ cả native input và custom control.
  private async selectShippingOption(option: Locator): Promise<void> {
    const nativeControl = option.locator('input[type="checkbox"], input[type="radio"]').first();
    if (await nativeControl.count()) {
      // TODO: Replace evaluate workaround after the shipping option exposes a stable accessible control.
      await nativeControl.evaluate((element) => {
        const input = element as HTMLInputElement;
        input.checked = true;
        input.click();
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      return;
    }

    const selectableControl = option
      .locator('.checkbox-container .label-checkbox, .mvp-radio label, label, input[type="checkbox"], input[type="radio"]')
      .first();

    if (await selectableControl.isVisible().catch(() => false)) {
      await selectableControl.click();
      return;
    }

    await option.click();
  }

  // Chọn địa chỉ đã lưu đầu tiên nếu dialog có sẵn danh sách địa chỉ.
  private async selectFirstSavedAddress(dialog: Locator): Promise<boolean> {
    const nativeControl = dialog.locator('input[type="checkbox"], input[type="radio"]').first();
    if (!(await nativeControl.count())) {
      return false;
    }

    if (await nativeControl.isVisible().catch(() => false)) {
      await nativeControl.check().catch(async () => {
        await nativeControl.click();
      });
      return true;
    }

    const visibleSelectableControl = dialog
      .locator('.checkbox-container .label-checkbox, .mvp-radio label, label')
      .first();

    if (await visibleSelectableControl.isVisible().catch(() => false)) {
      await visibleSelectableControl.click();
      return true;
    }

    // TODO: Replace evaluate workaround after saved address options expose stable accessible controls.
    await nativeControl.evaluate((element) => {
      const input = element as HTMLInputElement;
      input.checked = true;
      input.click();
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    return true;
  }
}
