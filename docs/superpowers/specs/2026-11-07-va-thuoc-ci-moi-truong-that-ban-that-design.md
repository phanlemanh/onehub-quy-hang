# Thước của hồ sơ moi-truong-that theo bước triển khai mới

Ngày 07/11/2026 · hàng `va-thuoc-ci-moi-truong-that-ban-that` (T2) · dãy Q, đợt `dau-khach-nhap` · Cổng Đáng: chủ kho «mở hợp
đồng mới» cho Ngoài-3 của va-deploy-csdl-tam (06/11); giám sát tách phần này khỏi hàng va-thuoc-ci-ho-so-moi-truong-that (07/11).

## Vì sao

Hồ sơ đã ký `moi-truong-that` có hai thước đo bước triển khai CŨ (ADR-0009 §7 trước 06/11):

- **E7** (`thu/kiem-ci.mjs`) đòi job `deploy` chờ đúng bốn job và chạy `test:isolation` sau migration — bước triển khai mới
  (PR #176, #181; ADR-0009 «Sửa đổi 06/11») chờ năm job, chạy kiểm nhanh chỉ đọc, không chạy bộ kiểm cách ly trên bản thật.
  Trên ci.yml hiện tại thước cũ HỎNG 2 vế.
- **E3** (`cach_ly_that`) chạy bộ kiểm cách ly TRÊN bản thật — đúng việc ADR sửa đổi đã bỏ.

Hồ sơ ấy chỉ ghim lại được bằng biến môi trường của bản thật, nên chủ kho chạy lệnh ghim lại ở máy mình.

## Thiết kế

1. **E7 — sửa thước, giữ tám vế** (`_acceptance/moi-truong-that/thu/kiem-ci.mjs`): chỉ push main · chờ
   `[check, isolation, secrets, gate, ro-ri]` · environment `production` và `PROD_DATABASE_URL` chỉ ở hai bước (migrate, kiểm
   nhanh), không ở mức job · thứ tự `db:migrate` → `kiem-nhanh` → `VERCEL_DEPLOY_HOOK` · không `test:isolation`, `test:db`,
   `db:test` trong job · deploy ngoài `ci-ok` · `vercel.json` tắt tự deploy main · vùng `sin1`. Thêm `--ci <tệp>` /
   `--vercel <tệp>` để phá thử trên bản sao, mặc định vẫn đọc tệp của kho.
2. **E3 — khai không chạy**: `status: not-run`, `superseded_by: va-deploy-csdl-tam#AC-2` (bộ kiểm cách ly chạy trọn trên cơ sở
   dữ liệu tạm của đúng commit và chặn triển khai). Bảng «Thay eval của hồ sơ đã ký» trong thiết kế va-deploy-csdl-tam thêm
   dòng `moi-truong-that/E3`.
3. **Ghim lại** moi-truong-that sau khi sửa: chủ kho chạy đúng một lệnh trong terminal riêng (biến đọc từ máy chủ kho, không
   dán vào chat) — lệnh ghi ở `vi_sao` của hàng lộ trình:
   `node /Users/manhphan/dev/acceptance-gate-kit-v2.37.0/feature-loop/scripts/repin-lane.mjs --root . --slug moi-truong-that --reason "thước CI theo bước triển khai mới" --write`
   (cần `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `APP_URL` của bản thật và `VERCEL_LINK_DIR`). Tới lúc ấy
   lưới trước gộp báo moi-truong-that cũ; PR của hàng chờ.

## Bộ đo của hàng (`thu/kiem-thuoc.mjs`)

- `--thuoc`: thước E7 trên ci.yml của cây — 8/8 ĐẠT.
- `--pha`: ma trận viết trước năm ca, mỗi ca sửa MỘT chỗ của bản sao ci.yml (deploy chạy `test:isolation`; deploy chạy
  `test:db`; bỏ `isolation` khỏi needs; bỏ kiểm nhanh; `DATABASE_URL` ở mức job) — thước đỏ đúng vế ghim; đối chứng dương:
  bản sao không sửa qua cùng đường `--ci` thì xanh.
- `--thay`: bộ đọc của kit nhận `moi-truong-that/E3 → va-deploy-csdl-tam#AC-2`, không xung đột với báo cáo đã ký; ba đối
  chứng trên bản sao tạm (AC không có, thẻ dính chữ, hồ sơ thay chưa ký) đỏ đúng điều kiện.

## Đối chiếu ngành (ADR-0022)

Không phải đối tượng nghiệp vụ hay danh sách của sàn — là thước đo quy trình phát hành. Không cột RESO, không chỗ «ta cứng —
họ cấu hình».

## Phạm vi

Làm: hai ô của moi-truong-that, một dòng bảng thay. Không làm: sửa chữ AC-3, AC-7 trong hợp đồng đã ký của moi-truong-that
(ADR sửa đổi là nơi nói bước mới); sửa executor `cach_ly_that` trong `_acceptance/config.yaml`; chạy gì lên bản thật từ máy.
