# Run code

## Cai dat lan dau

```bash
npm install
npm run install:browsers
```

## Cau hinh env

File:

```text
config/.env
```

Mau:

```dotenv
BASE_URL=https://day-sales-staging.timdaythay.com
TEST_SPEC=
TEST_GREP=
KEYCLOAK_LOGIN_URL=
KEYCLOAK_REGISTER_URL=
KEYCLOAK_FORGOT_PASSWORD_URL=
```

Chay theo env:

```dotenv
TEST_SPEC=checkout/guest-order.spec.ts
TEST_GREP=mua hang khong login
```

```bash
npm test
```

## Chay tat ca testcase

```bash
npm test
```

## Chay mot file spec

```bash
npx playwright test checkout/guest-order.spec.ts
```

## Chay mot testcase theo ten

```bash
npx playwright test --grep "mua hang khong login"
```

## Chay mot testcase trong mot file

```bash
npx playwright test checkout/guest-order.spec.ts --grep "mua hang khong login"
```

## Xem danh sach testcase

```bash
npx playwright test --list
```

## Xem danh sach testcase trong mot file

```bash
npx playwright test checkout/guest-order.spec.ts --list
```

## Chay guest order bang script co san

```bash
npm run test:guest-order
```

## Chay co mo browser

```bash
npm run test:headed
```

## Chay debug

```bash
npm run test:debug
```

## Mo report

```bash
npm run report
```

## Typecheck

```bash
npm run typecheck
```

## Chay k6 performance

Xem huong dan rieng tai `docs/run-code-k6.md`.
