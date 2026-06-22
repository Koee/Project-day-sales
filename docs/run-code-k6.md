# Run code k6

## Chay k6 smoke performance

Neu chua chac may da cai k6, kiem tra truoc:

```bash
npm run perf:check
```

Neu gap loi `'k6' is not recognized as an internal or external command`, nghia la Windows chua tim thay lenh `k6` trong PATH.

Kich ban xu ly tren Windows:

1. Cai k6 bang winget:

```powershell
winget install --id GrafanaLabs.k6 -e
```

2. Dong terminal hien tai, mo terminal moi tai thu muc project.

3. Kiem tra lai:

```powershell
k6 version
npm run perf:check
```

Neu may khong dung winget, co the cai bang Chocolatey:

```powershell
choco install k6
```

Hoac tai ban Windows tu trang k6, giai nen, roi them thu muc chua `k6.exe` vao bien moi truong `PATH`.

Neu `winget` bao k6 da duoc cai nhung PowerShell van bao khong nhan lenh `k6`, kiem tra file k6:

```powershell
& 'C:\Program Files\k6\k6.exe' version
```

Neu lenh tren chay duoc, them `C:\Program Files\k6` vao User PATH:

```powershell
$k6Path = 'C:\Program Files\k6'
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')

if (($userPath -split ';') -notcontains $k6Path) {
  [Environment]::SetEnvironmentVariable('Path', ($userPath.TrimEnd(';') + ';' + $k6Path), 'User')
}
```

Sau do dong terminal hien tai, mo terminal moi va kiem tra lai `k6 version`.

Neu dang dung terminal trong VS Code ma van loi, restart VS Code roi mo terminal lai. VS Code co the giu PATH cu tu luc app duoc mo.

Neu can chay ngay trong terminal hien tai, nap PATH tam thoi cho phien dang mo:

```powershell
$env:Path = $env:Path + ';C:\Program Files\k6'
k6 version
npm run perf:check
```

Sau khi `npm run perf:check` chay duoc moi chay k6.

## Chay k6 load khong phat sinh don

Dung smoke khi chi muon kiem tra chiu tai page, khong tao don that tren he thong.

Vi du 100 users ao trong 10 phut:

```powershell
$env:K6_SMOKE_VUS = '100'
$env:K6_SMOKE_DURATION = '10m'

npm run perf:smoke
```

Kiem tra env da set trong terminal hien tai:

```powershell
echo $env:K6_SMOKE_VUS
echo $env:K6_SMOKE_DURATION
```

Xoa env trong terminal hien tai de quay ve default config:

```powershell
Remove-Item Env:K6_SMOKE_VUS
Remove-Item Env:K6_SMOKE_DURATION
```

Note:

- `perf:smoke` goi GET page home, product detail, cart, checkout va API checkout products.
- Kich ban nay khong bam checkout va khong goi API tao don.
- Tang `K6_SMOKE_VUS` va `K6_SMOKE_DURATION` de tang ap luc tai page.
- Report JSON sau khi chay nam tai `performance/k6/reports/smoke-summary.json`.
- Report uu tien hien thi `status`, `virtualUsers`, `duration`, `cases`, `thresholds` va `http`.

API checkout products dang duoc cau hinh trong `performance/k6/src/config.ts`:

```text
/api/public/products/for-checkout?ids=7658&seller_entity_id=4225
```

Neu API can cookie/session giong request tren browser, set cookie bang env truoc khi chay. Khong luu cookie that vao code hoac docs:

```powershell
$env:K6_CHECKOUT_COOKIE = '<COOKIE_TU_DEVTOOLS_NETWORK>'
npm run perf:smoke
```

Xoa cookie env sau khi chay:

```powershell
Remove-Item Env:K6_CHECKOUT_COOKIE
```

Lenh smoke nhanh voi default config:

```bash
npm run perf:smoke
```

## Chay k6 load co phat sinh don that

Dung order request khi muon ban API tao don that tren he thong.

Vi du tong 1000 request tao don, moi thoi diem co 100 users ao cung chay:

```powershell
$env:K6_ORDER_REQUEST_COUNT = '1000'
$env:K6_ORDER_REQUEST_VUS = '100'
$env:K6_ORDER_REQUEST_ENDPOINT = '<API_DAT_HANG_THAT>'
$env:K6_ORDER_REQUEST_PAYLOAD = '<BODY_DAT_HANG_THAT>'

npm run perf:orders
```

Note:

- `K6_ORDER_REQUEST_COUNT` la tong so request tao don.
- `K6_ORDER_REQUEST_VUS` la so users ao chay song song.
- `K6_ORDER_REQUEST_ENDPOINT` va `K6_ORDER_REQUEST_PAYLOAD` phai lay tu request that trong DevTools Network luc bam "Dat hang".
- Payload mau ben duoi chi la vi du format, chua du dam bao tao don that.
- Neu API can cookie, token, cart id, shipping id hoac du lieu unique cho tung don thi can bo sung vao k6 script truoc khi chay 1000 don.
- Report JSON sau khi chay nam tai `performance/k6/reports/orders-summary.json`.
- Report uu tien hien thi `status`, `virtualUsers`, `duration`, `cases`, `thresholds` va `http`.

Vi du format de dien endpoint va payload:

```powershell
$env:K6_ORDER_REQUEST_ENDPOINT = '/actual/order/api/path'
$env:K6_ORDER_REQUEST_PAYLOAD = '{"cartId":"...","addressId":"...","shippingServiceId":"...","paymentMethod":"COD","items":[...]}'

npm run perf:orders
```

## Cach doc report JSON k6

Report k6 duoc rut gon de doc nhanh cac thong tin quan trong:

```json
{
  "status": "PASSED",
  "virtualUsers": {
    "configured": 100,
    "observed": 100,
    "max": 100
  },
  "duration": {
    "configured": "10m",
    "actualMs": 600000
  },
  "cases": {
    "passed": 200,
    "failed": 0,
    "total": 200
  }
}
```

Y nghia:

- `status`: trang thai tong hop, `FAILED` neu co check fail, request fail hoac threshold bi vuot.
- `virtualUsers.configured`: so users ao da set bang env.
- `duration.configured`: thoi gian da set bang env, vi du `1m`, `10m`.
- `cases.passed` va `cases.failed`: tong so check pass/fail cua k6.
- `thresholds.status`: trang thai nguong performance, vi du `http_req_duration p(95)<3000`.
- `http.durationMs.p95`: 95% request co thoi gian nho hon hoac bang gia tri nay, don vi ms.

## Neu loi proxy 127.0.0.1:9 khi chay k6

```powershell
$env:HTTP_PROXY = ''
$env:HTTPS_PROXY = ''
$env:ALL_PROXY = ''
```
