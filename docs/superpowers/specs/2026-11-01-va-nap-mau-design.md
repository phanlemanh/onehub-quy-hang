# Vá nút nạp mẫu — thiết kế (hàng va-nap-mau)

Ngày 2026-11-01 · Dãy D, đợt dau-chu-dong-vao, ưu tiên 0 · Hạng T3 · Hồ sơ `_acceptance/va-nap-mau/`

## Vì sao

Hàng 87 (`nap-mau-ban-that`, PR #62) giao nút «Nạp dữ liệu mẫu». Lượt chấm của nó tìm ra bốn lỗi; chủ kho ký và chọn
tách thành việc riêng, giám sát gộp vào hàng này (D-18):

1. `NODE_ENV: production` đặt ở cấp job áp cả cho `npm ci` → npm bỏ devDependencies → `tsx` không được cài → bước chạy
   bộ nạp chết ngay. Nút trên bản thật hiện không chạy được.
2. Bước «Che email» ghi `EMAIL=<input>` vào `$GITHUB_ENV`. Input chứa ký tự xuống dòng thì thành biến môi trường mới
   (ví dụ `NODE_OPTIONS=--require …`) cho mọi bước sau — chạy mã tuỳ ý với `PROD_DATABASE_URL` và `OWNER_PHONE_KEY`,
   lách rào «chỉ nhánh main».
3. `packages/db` không có typecheck, nên `nap-ban-that.ts` và bộ kiểm của nó không được `tsc` kiểm (có một lỗi strict
   thật ở bộ kiểm).
4. Lệnh chấm `executors.script.du_lieu_mau` (không tsx) gãy từ hàng 10: bộ kiểm hàng 5 nhập `packages/connect` viết
   TypeScript.

## Cách làm

**Nút (`nap-mau.yml`).**
- `NODE_ENV: production` chuyển từ `env` của job xuống `env` của đúng bước «Chạy bộ nạp». `npm ci` chạy không có nó.
- Bước «Kiểm và che email» đọc email từ `$GITHUB_EVENT_PATH` bằng `jq` (không qua `env`, vì môi trường của bước hiện ở
  đầu log trước khi kịp che), kiểm bằng `[[ … =~ ^[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]` trên CẢ chuỗi —
  một ký tự xuống dòng, ký tự điều khiển hay khoảng trắng là sai; không nhận `%` vì runner giải mã `%0A`/`%25` trong lệnh workflow nên mặt nạ sẽ lệch email thật — sai thì thoát 1 khi `viec = nap` (gỡ không cần email); đúng thì
  `::add-mask::`. Không bước nào ghi vào `$GITHUB_ENV` hay `$GITHUB_OUTPUT` (luật giám sát D-18).
- Bước «Chạy bộ nạp» tự đọc lại email từ tệp sự kiện vào biến cục bộ của shell, truyền cho bộ nạp như đối số.
- Bộ nạp (`chuanHoaEmail`) từ chối thêm mọi ký tự điều khiển — lớp chặn thứ hai khi ai chạy lệnh ngoài nút.

**Bộ kiểm nút chạy thật các bước.** `nap-mau-yml.test.mjs` rút khối `run:` của từng bước và chạy bằng `bash -e` với
`GITHUB_EVENT_PATH`, `GITHUB_ENV`, `GITHUB_OUTPUT`, `GITHUB_REF` giả: đo quan hệ (thoát 0/1 đúng chiều, tệp môi trường
không đổi), không dò chuỗi. NODE_ENV đo bằng `npm config get omit` dưới đúng môi trường của bước `npm ci` (môi trường
job cộng môi trường bước): không được chứa `dev`. Việc này cũng đóng giới hạn Ngoài-5 của hàng 87 (bước chặn nhánh và
xác nhận gỡ chỉ được dò chuỗi).

**Kiểm kiểu gói db.** `packages/db/tsconfig.json` mở rộng `tsconfig.base.json`, `include: ["seed/**/*.ts"]`;
`packages/db/package.json` thêm `"typecheck": "tsc --noEmit -p ."` — `npm run typecheck` của gốc (chạy mọi workspace)
và job `check` của CI tự phủ nó. Sửa lỗi strict ở bộ kiểm.

**Lệnh chấm hàng 5.** Thêm `--import tsx` vào đúng dòng `executors.script.du_lieu_mau` (xin chạm tệp
`_acceptance/config.yaml`); không đổi hồ sơ hàng 5.

## Hỏi chủ kho

- **Hỏi-1** — NODE_ENV xuống bước chạy bộ nạp (khuyến nghị) hay giữ ở job và `npm ci --include=dev`.
- **Hỏi-2** — sửa dòng lệnh chấm `du_lieu_mau` (khuyến nghị; lệnh của hồ sơ hàng 5 đã ký đổi theo, kết quả như cũ) hay
  trỏ hồ sơ hàng 5 sang `du_lieu_mau_tsx`.

## Không làm

- Không đổi bộ nạp ngoài phần kiểm email; không đổi phạm vi dữ liệu.
- Không đặt secret, không bấm nút trên bản thật (việc của chủ kho).
- Không sửa các giới hạn Ngoài-4, 6, 7 của hàng 87 (thước của bộ kiểm bộ nạp) — chủ kho đã ghi Known limits.
