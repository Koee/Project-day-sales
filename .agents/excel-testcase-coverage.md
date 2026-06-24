# Day Sales Excel Test Case Coverage

Nguon: `E:\Bug_View\TestCases_Full_DaySales.xlsx` ngay 2026-06-24.

Trang thai:
- `Covered`: da co automated test gan dung hanh vi chinh.
- `Partial`: da co test lien quan nhung chua tach dung case, chua kiem het expected result, hoac can DOM/staging data de xac nhan.
- `Missing`: chua thay automated coverage ro trong bo test hien tai.

Luu y:
- Excel co 124 TC theo cac sheet nghiep vu.
- Bo hien tai co coverage manh o login, register validation, forgot password co ban, store, cart, checkout co ban.
- Co trung ma `TC-TK-*` giua module Tim Kiem va Tai Khoan. Nen doi prefix mot trong hai nhom khi them code moi, vi ID trung se gay kho traceability.
- Cac luong account, order history, wishlist, coupon, shipping, payment method, inventory boundary can inspect staging DOM/data truoc khi viet locator on dinh.

## Tong Quan

| Module | Tong TC | Covered | Partial | Missing | Ghi chu |
|---|---:|---:|---:|---:|---|
| Dang nhap | 12 | 5 | 3 | 4 | Login co ban da tot, con remember/logout/rate-limit/boundary. |
| Dang ky | 14 | 4 | 4 | 6 | Chu yeu da cover validation, chua cover UI/link/phone/name indicator day du. |
| Quen mat khau | 10 | 3 | 3 | 4 | Email reset co ban da co, flow set password can data/mail. |
| Trang chu | 12 | 2 | 6 | 4 | Header/layout da co, con footer/perf/notification/lazy loading. |
| Tim kiem | 14 | 2 | 1 | 11 | Moi co keyword co/khong ket qua. |
| San pham | 10 | 1 | 2 | 7 | Moi co detail/product card co ban. |
| Gio hang | 14 | 7 | 2 | 5 | CRUD cart co ban da co, con coupon/inventory/shipping boundary. |
| Dat hang | 14 | 4 | 4 | 6 | Checkout co ban da co, con address/payment/coupon/carrier/out-of-stock/status. |
| Tai khoan | 10 | 0 | 1 | 9 | Gan nhu chua co account management. |
| Lich su don hang | 8 | 0 | 0 | 8 | Chua co spec ro. |
| Wishlist | 6 | 0 | 0 | 6 | Chua co spec ro. |

## Dang Nhap

| Excel TC | Ten TC | Trang thai | Mapping / viec can lam |
|---|---|---|---|
| TC-DL-001 | Dang nhap thanh cong voi email va mat khau hop le | Covered | `tests/oauth/oauth-login.spec.ts` `TC-AUTH-003`; login order cung dung auth state. |
| TC-DL-002 | Dang nhap voi email khong ton tai | Covered | `TC-AUTH-007`. |
| TC-DL-003 | Dang nhap voi mat khau sai | Covered | `TC-AUTH-004`. |
| TC-DL-004 | Dang nhap voi email de trong | Covered | Added `TC-DL-004` in `tests/oauth/oauth-login.spec.ts`. |
| TC-DL-005 | Dang nhap voi mat khau de trong | Covered | `TC-AUTH-006`. |
| TC-DL-006 | Dang nhap voi email khong dung dinh dang | Covered | Added `TC-DL-006` in `tests/oauth/oauth-login.spec.ts`. |
| TC-DL-007 | Kiem tra chuc nang Nho mat khau | Missing | Can xac nhan UI remember-me tren Keycloak. |
| TC-DL-008 | Hien thi/An mat khau | Covered | `TC-AUTH-008`. |
| TC-DL-009 | Dang xuat thanh cong | Partial | Added skipped spec `TC-DL-009`; needs Playwright MCP DOM inspect because visible logout text is hidden/non-clickable in current profile layout. |
| TC-DL-010 | Dang nhap voi nhieu lan sai lien tiep | Missing | Security/rate-limit; can chot so lan va expected tren staging. |
| TC-DL-011 | Kiem tra UI man hinh dang nhap | Partial | `TC-AUTH-001`, `TC-AUTH-002` cover form/labels, chua cover UI day du. |
| TC-DL-012 | Dang nhap voi email co khoang trang thua | Covered | Added `TC-DL-012`; staging trims/accepts surrounding whitespace and login succeeds. |

## Dang Ky

| Excel TC | Ten TC | Trang thai | Mapping / viec can lam |
|---|---|---|---|
| TC-DK-001 | Dang ky tai khoan moi thanh cong | Partial | `TC-REG-002` den CAPTCHA gate, chua tao account thanh cong. |
| TC-DK-002 | Dang ky voi email da ton tai | Partial | Co flow duplicate email trong `steps/oauth.steps.ts`, can xac nhan spec title hien tai. |
| TC-DK-003 | Dang ky voi mat khau va xac nhan khong khop | Covered | `TC-REG-004`. |
| TC-DK-004 | Dang ky bo trong cac truong bat buoc | Covered | `TC-REG-006`. |
| TC-DK-005 | Dang ky voi mat khau qua ngan | Covered | `TC-REG-007`. |
| TC-DK-006 | Dang ky voi email khong dung dinh dang | Covered | `TC-REG-005`. |
| TC-DK-007 | Dang ky voi so dien thoai khong hop le | Missing | Can xac nhan registration form co phone field. |
| TC-DK-008 | Dang ky voi ho ten qua dai | Missing | Boundary name length. |
| TC-DK-009 | Kiem tra link dieu huong tren man hinh dang ky | Partial | `TC-AUTH-009` cover open registration tu login, chua cover all links. |
| TC-DK-010 | Dang ky voi ky tu dac biet trong ho ten | Missing | Boundary/sanitization. |
| TC-DK-011 | Kiem tra UI man hinh dang ky | Partial | `TC-REG-001` cover form visible, chua cover UI day du. |
| TC-DK-012 | Kiem tra mat khau manh/yeu indicator | Missing | Can inspect co indicator hay khong. |
| TC-DK-013 | Dang ky voi so dien thoai da ton tai | Missing | Can test data phone. |
| TC-DK-014 | Hien thi/An mat khau khi dang ky | Missing | Can inspect control tren form dang ky. |

## Quen Mat Khau

| Excel TC | Ten TC | Trang thai | Mapping / viec can lam |
|---|---|---|---|
| TC-QMK-001 | Gui email reset mat khau thanh cong | Covered | `TC-FP-002`. |
| TC-QMK-002 | Gui email reset voi email khong ton tai | Covered | `TC-FP-003`. |
| TC-QMK-003 | Gui email reset voi email de trong | Covered | `TC-FP-004`. |
| TC-QMK-004 | Gui email reset voi email sai dinh dang | Covered | Added `TC-QMK-004` in `tests/oauth/oauth-foget-password.spec.ts`. |
| TC-QMK-005 | Kiem tra link reset mat khau co han dung | Missing | Can mail inbox/reset token data. |
| TC-QMK-006 | Dat lai mat khau moi thanh cong | Partial | Co helper set new password, can spec/data xac nhan. |
| TC-QMK-007 | Dat lai mat khau moi va xac nhan khong khop | Missing | Can reset link hop le. |
| TC-QMK-008 | Kiem tra link quen mat khau tren man hinh dang nhap | Covered | Added `TC-QMK-008` to open forgot password from login page link. |
| TC-QMK-009 | Gui nhieu lan yeu cau reset mat khau | Missing | Security/rate-limit; can chot expected. |
| TC-QMK-010 | Kiem tra UI man hinh quen mat khau | Partial | `TC-FP-001` cover form visible, chua cover UI day du. |

## Trang Chu

| Excel TC | Ten TC | Trang thai | Mapping / viec can lam |
|---|---|---|---|
| TC-TH-001 | Hien thi banner/slider trang chu | Partial | `TC-UI-001` cover layout, chua assert banner/slider rieng. |
| TC-TH-002 | Hien thi danh muc san pham tren trang chu | Partial | `TC-UI-001`/store layout lien quan, chua assert category. |
| TC-TH-003 | Hien thi san pham noi bat/khuyen mai | Partial | `TC-UI-004` cover product card, chua cover featured/promo. |
| TC-TH-004 | Kiem tra navigation menu header | Covered | `TC-UI-002`. |
| TC-TH-005 | Kiem tra footer | Missing | Them UI footer. |
| TC-TH-006 | Kiem tra responsive tren mobile | Covered | `TC-UI-003`, `TC-CB-002`. |
| TC-TH-007 | Kiem tra toc do tai trang chu | Missing | Nen dua sang k6/perf hoac Playwright timing nhe. |
| TC-TH-008 | Kiem tra gio hang icon tren header | Partial | `TC-UI-002`, `TC-FN-002` cover header/cart behavior, chua assert icon state rieng. |
| TC-TH-009 | Kiem tra thanh tim kiem tren header | Partial | Search tests cover behavior, chua assert header search UI rieng. |
| TC-TH-010 | Kiem tra trang thai da dang nhap tren header | Covered | `TC-AUTH-L01`, `TC-FN-003`. |
| TC-TH-011 | Kiem tra notification bell | Missing | Can inspect feature co ton tai. |
| TC-TH-012 | Kiem tra lazy loading hinh anh | Partial | `TC-UI-005` cover broken image, chua cover lazy loading. |

## Tim Kiem

| Excel TC | Ten TC | Trang thai | Mapping / viec can lam |
|---|---|---|---|
| TC-TK-001 | Tim kiem voi tu khoa co ket qua | Covered | `TC-TK-001`. |
| TC-TK-002 | Tim kiem voi tu khoa khong co ket qua | Covered | `TC-TK-002`. |
| TC-TK-003 | Tim kiem voi o trong | Missing | Them negative empty search. |
| TC-TK-004 | Tim kiem voi ky tu dac biet | Missing | Them boundary. |
| TC-TK-005 | Tim kiem voi tu khoa tieng Viet co dau | Missing | Them test data product tieng Viet. |
| TC-TK-006 | Tim kiem voi tu khoa tieng Viet khong dau | Missing | Them test data product khong dau. |
| TC-TK-007 | Autocomplete/goi y khi tim kiem | Missing | Can inspect autocomplete behavior. |
| TC-TK-008 | Tim kiem voi chuoi rat dai | Missing | Them boundary. |
| TC-TK-009 | Sap xep ket qua tim kiem | Missing | Can inspect sort control. |
| TC-TK-010 | Loc ket qua tim kiem theo khoang gia | Missing | Can inspect price filter. |
| TC-TK-011 | Phan trang ket qua tim kiem | Missing | Can staging data du nhieu ket qua. |
| TC-TK-012 | Lich su tim kiem | Missing | Can xac nhan feature. |
| TC-TK-013 | Tim kiem theo ten thuong hieu | Missing | Can test data brand. |
| TC-TK-014 | Tim kiem voi so ma san pham | Missing | Can test data product code. |

## San Pham

| Excel TC | Ten TC | Trang thai | Mapping / viec can lam |
|---|---|---|---|
| TC-SP-001 | Xem danh sach san pham theo danh muc | Partial | Store layout co list product, chua category-specific. |
| TC-SP-002 | Xem chi tiet san pham | Covered | `TC-FN-001`. |
| TC-SP-003 | Loc san pham theo gia | Missing | Can inspect filter. |
| TC-SP-004 | Loc san pham theo thuong hieu | Missing | Can inspect filter/data. |
| TC-SP-005 | Sap xep san pham | Missing | Can inspect sort. |
| TC-SP-006 | Xem anh san pham gallery | Missing | Can inspect gallery. |
| TC-SP-007 | San pham het hang | Missing | Can staging data out-of-stock. |
| TC-SP-008 | SP lien quan/goi y o trang chi tiet | Missing | Can inspect detail page. |
| TC-SP-009 | Doc danh gia san pham | Missing | Can review data. |
| TC-SP-010 | Chia se san pham | Missing | Can inspect share control. |

## Gio Hang

| Excel TC | Ten TC | Trang thai | Mapping / viec can lam |
|---|---|---|---|
| TC-GH-001 | Them san pham vao gio hang thanh cong | Covered | `TC-FN-002`, `TC-FN-003`. |
| TC-GH-002 | Them san pham vao gio khi chua dang nhap | Covered | `TC-FN-002`. |
| TC-GH-003 | Thay doi so luong san pham trong gio | Covered | `TC-CART-002`. |
| TC-GH-004 | Xoa san pham khoi gio hang | Covered | `TC-CART-003`. |
| TC-GH-005 | Gio hang trong | Covered | `TC-CART-001`. |
| TC-GH-006 | Them cung 1 san pham nhieu lan | Partial | Add-to-cart co ban co, chua assert merge/increase quantity. |
| TC-GH-007 | Nhap so luong vuot qua ton kho | Missing | Can inventory data. |
| TC-GH-008 | Nhap so luong la 0 hoac am | Missing | Boundary quantity. |
| TC-GH-009 | Ap dung ma giam gia coupon trong gio hang | Missing | Can coupon feature/test code. |
| TC-GH-010 | Kiem tra tinh toan tong tien | Covered | `TC-CART-004`. |
| TC-GH-011 | Hien thi thong tin san pham trong gio | Partial | Cart item visible, chua assert day du name/price/image/quantity. |
| TC-GH-012 | Phi van chuyen trong gio hang | Missing | Can xac nhan phi hien thi o cart hay checkout. |
| TC-GH-013 | Click Tien hanh dat hang tu gio hang | Covered | `TC-CART-005`, `TC-CART-006`. |
| TC-GH-014 | Gio hang duoc luu sau khi dang xuat va dang nhap lai | Covered | `TC-CART-007`. |

## Dat Hang

| Excel TC | Ten TC | Trang thai | Mapping / viec can lam |
|---|---|---|---|
| TC-DH-001 | Dat hang thanh cong | Covered | `TC-GUEST-ORDER-001`, `TC-LOGIN-ORDER-001`, `TC-CHKOUT-002`. |
| TC-DH-002 | Dat hang khong dien dia chi | Missing | Can checkout address required behavior. |
| TC-DH-003 | Kiem tra cac phuong thuc thanh toan | Missing | Can inspect payment methods. |
| TC-DH-004 | Thay doi dia chi giao hang | Missing | Can account/address data. |
| TC-DH-005 | Them dia chi moi khi checkout | Missing | Can inspect checkout address form. |
| TC-DH-006 | Kiem tra tom tat don hang truoc khi xac nhan | Covered | `TC-CHKOUT-004`. |
| TC-DH-007 | Ap dung ma giam gia khi checkout | Missing | Can coupon feature/test code. |
| TC-DH-008 | Ghi chu don hang | Missing | Can inspect note field. |
| TC-DH-009 | Dat hang voi so dien thoai khong hop le | Covered | `TC-NEG-008`, `TC-CHKOUT-003` covers phone validation area. |
| TC-DH-010 | Chon don vi van chuyen | Missing | Can inspect shipping carrier UI. |
| TC-DH-011 | Kiem tra trang xac nhan don hang | Partial | Order success asserted, chua verify confirmation page details. |
| TC-DH-012 | Quay lai gio hang tu trang checkout | Covered | `TC-CHKOUT-005`. |
| TC-DH-013 | Dat hang san pham het hang | Missing | Can out-of-stock product data. |
| TC-DH-014 | Kiem tra trang thai don hang sau khi dat | Partial | Order success exists, chua open order status/history. |

## Tai Khoan

| Excel TC | Ten TC | Trang thai | Mapping / viec can lam |
|---|---|---|---|
| TC-TK-001 | Xem thong tin tai khoan | Partial | Auth header/profile entry co, chua account detail page. |
| TC-TK-002 | Cap nhat thong tin ca nhan | Missing | Can inspect account edit. |
| TC-TK-003 | Cap nhat thong tin voi du lieu khong hop le | Missing | Can validation rules. |
| TC-TK-004 | Doi mat khau thanh cong | Missing | Can account password flow/data. |
| TC-TK-005 | Doi mat khau voi MK hien tai sai | Missing | Can password flow. |
| TC-TK-006 | Quan ly dia chi giao hang | Missing | Can address management UI. |
| TC-TK-007 | Xoa dia chi giao hang | Missing | Can address data. |
| TC-TK-008 | Upload anh dai dien | Missing | Can upload constraints/test fixtures. |
| TC-TK-009 | Kiem tra UI trang tai khoan | Missing | Can inspect account page. |
| TC-TK-010 | Bao mat: Khong the truy cap tai khoan nguoi khac | Missing | Security/IDOR; can staging user ids and expected. |

## Lich Su Don Hang

| Excel TC | Ten TC | Trang thai | Mapping / viec can lam |
|---|---|---|---|
| TC-DH_LS-001 | Xem danh sach lich su don hang | Missing | Can locate order history page and data. |
| TC-DH_LS-002 | Xem chi tiet don hang | Missing | Can order data. |
| TC-DH_LS-003 | Huy don hang | Missing | Can cancellable order data. |
| TC-DH_LS-004 | Loc don hang theo trang thai | Missing | Can multiple order statuses. |
| TC-DH_LS-005 | Mua lai don hang | Missing | Can completed order data. |
| TC-DH_LS-006 | Danh gia san pham sau mua | Missing | Can completed order and review feature. |
| TC-DH_LS-007 | Khong co lich su don hang | Missing | Can new account/no-order data. |
| TC-DH_LS-008 | Phan trang danh sach don hang | Missing | Can account with many orders. |

## Wishlist

| Excel TC | Ten TC | Trang thai | Mapping / viec can lam |
|---|---|---|---|
| TC-WL-001 | Them san pham vao wishlist | Missing | Can inspect wishlist icon/page. |
| TC-WL-002 | Xoa san pham khoi wishlist | Missing | Can wishlist data. |
| TC-WL-003 | Them tu wishlist vao gio hang | Missing | Can wishlist page behavior. |
| TC-WL-004 | Them vao wishlist khi chua dang nhap | Missing | Can expected guest behavior. |
| TC-WL-005 | Wishlist trong | Missing | Can empty wishlist state. |
| TC-WL-006 | SP het hang trong wishlist | Missing | Can out-of-stock wishlist data. |

## De Xuat Thu Tu Viet Code

1. Phase 1 - High priority missing/partial auth:
   - `TC-DL-004`, `TC-DL-006`, `TC-DL-009`, `TC-DL-012`
   - `TC-DK-002`, `TC-DK-007`, `TC-DK-014`
   - `TC-QMK-004`, `TC-QMK-008`
2. Phase 2 - Store/search/product high value:
   - `TC-TH-005`, `TC-TK-003` den `TC-TK-006`, `TC-SP-001`, `TC-SP-003`, `TC-SP-005`
3. Phase 3 - Cart/checkout risk:
   - `TC-GH-006`, `TC-GH-007`, `TC-GH-008`, `TC-GH-009`, `TC-GH-011`, `TC-DH-002` den `TC-DH-005`, `TC-DH-007`, `TC-DH-010`, `TC-DH-011`, `TC-DH-014`
4. Phase 4 - Feature areas can inspect:
   - Account, order history, wishlist.

## Verification Plan Khi Bat Dau Implement

- Markdown/matrix only: verify file exists and content renders sanely.
- Auth-only changes: `npm run typecheck`, then focused `npx playwright test tests/oauth/oauth-login.spec.ts --grep "<TC title>"`.
- Cart/checkout changes: `npm run typecheck`, then focused related spec.
- DOM-uncertain features: inspect staging first with Playwright MCP, then update page objects/steps/specs.
