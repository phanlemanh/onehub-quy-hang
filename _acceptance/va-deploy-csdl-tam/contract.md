---
schema_version: 1
feature: "Bước triển khai trên nhánh chính không còn chạy bộ kiểm cách ly trên cơ sở dữ liệu bản thật: bộ kiểm chạy trên cơ sở dữ liệu tạm dựng từ migration của đúng lần gộp; bản thật chỉ cập nhật cấu trúc dữ liệu rồi kiểm nhanh chỉ đọc rằng mọi bảng công ty bật và ép luật theo dòng và vai của API không là chủ bảng; không quá hai kết nối bản thật"
slug: va-deploy-csdl-tam
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ci, config]
status: implemented
approved_by: "Manh Phan"
approved_at: 2026-11-06
design_doc: docs/superpowers/specs/2026-11-06-va-deploy-csdl-tam-design.md
---

# Acceptance Contract: va-deploy-csdl-tam

## Context

Hàng khẩn của đợt `dau-khach-nhap` (dãy Q), chủ kho duyệt 06/11 ~08:20Z (câu h-20261106T081703Z-15). Sự cố: job `deploy`
chạy bộ kiểm cách ly trên cơ sở dữ liệu bản thật ~25 phút mỗi lần gộp, làm cạn kết nối bản thật (EMAXCONNSESSION 08:03Z)
và đỏ từ 05/11 08:41Z vì AC-9 gặp sàn mẫu có sẵn — bản thật đứng 22 giờ (luật đợt 77). T3: chạm `packages/db/**` và rào CI.
Bất biến chạm: **1 — cách ly giữa công ty** (bộ kiểm cách ly vẫn là check bắt buộc trước phát hành, nay chạy trên cơ sở dữ
liệu tạm; bản thật thêm kiểm nhanh luật theo dòng). Không chạm bất biến 2, 3, 4.

Source input: `docs/plan/lo-trinh.json` hàng va-deploy-csdl-tam · `_acceptance/va-deploy-csdl-tam/opportunity.md` ·
ADR-0009 §7 · thiết kế `docs/superpowers/specs/2026-11-06-va-deploy-csdl-tam-design.md`

## Criteria

- **AC-1** — Job triển khai không chạy bài kiểm nào ghi trên bản thật; chuỗi kết nối bản thật chỉ tới hai bước.
  Given tệp `.github/workflows/ci.yml` của nhánh,
  When đọc job `deploy`,
  Then job không có bước nào chạy `test:isolation`, `db:test`, `test:db` hay `npm test`; `secrets.PROD_DATABASE_URL` không
  đặt ở mức job, và tập bước thấy nó đúng bằng hai bước `npm run db:migrate` và `npm run kiem-nhanh -w @quy-hang/db`.

- **AC-2** — Bộ kiểm cách ly vẫn chạy trọn trên cơ sở dữ liệu tạm của đúng commit và vẫn chặn triển khai.
  Given cùng tệp,
  When đọc job `isolation` và `needs` của job `deploy`,
  Then job `isolation` chạy cả ở PR lẫn push main, trên dịch vụ `postgres:16` trong job (không bí mật bản thật), dựng bằng
  `npm run db:migrate` từ đầu rồi `npm run db:test`; `deploy` có `isolation` trong `needs`, nên isolation đỏ thì không
  triển khai.

- **AC-3** — Thứ tự trên bản thật: cập nhật cấu trúc → kiểm nhanh → mới gọi Vercel; kiểm nhanh đỏ thì không gọi Vercel.
  Given job `deploy`,
  When đọc thứ tự bước,
  Then `db:migrate` đứng trước `kiem-nhanh`, `kiem-nhanh` đứng trước bước gọi `VERCEL_DEPLOY_HOOK`; không bước nào của job
  đặt `continue-on-error`; bước kiểm nhanh và bước gọi Vercel không có khoá `if` nào khác `success()`; dòng `run` của kiểm
  nhanh đúng bằng `npm run kiem-nhanh -w @quy-hang/db` (không nối `||`, `;`, `set +e`).

- **AC-4** — Kiểm nhanh bắt bảng thiếu luật theo dòng.
  Given cơ sở dữ liệu đã áp đủ migration,
  When chạy kiểm nhanh,
  Then thoát 0 và in số bảng đã soi; còn khi một bảng của `public` chưa bật luật theo dòng, hoặc bật mà chưa ép
  (`force`), thì thoát 1 và dòng lỗi gọi đúng tên bảng ấy.

- **AC-5** — Kiểm nhanh bắt vai của API là chủ bảng hay bỏ qua luật.
  Given cơ sở dữ liệu đã áp đủ migration,
  When một bảng của `public` do `quy_hang_app` sở hữu, hoặc vai `quy_hang_app` có `bypassrls` hay là superuser,
  Then kiểm nhanh thoát 1 và dòng lỗi gọi tên bảng hay thuộc tính sai; cơ sở dữ liệu lành thì thoát 0.

- **AC-6** — Kiểm nhanh chỉ đọc và nhẹ.
  Given kiểm nhanh chạy trên một kết nối,
  When nó soi danh mục,
  Then mọi câu chạy trong một giao dịch `read only` (một câu ghi trong giao dịch ấy bị Postgres từ chối), có
  `statement_timeout`, mở đúng một kết nối và đóng nó trước khi thoát; cùng `db:migrate` (một kết nối, đóng trước) bước
  triển khai không giữ quá hai kết nối bản thật.

- **AC-7** — Lệnh chạy được bằng tên trong gói `@quy-hang/db`.
  Given `packages/db/package.json`,
  When chạy `npm run kiem-nhanh -w @quy-hang/db` với `DATABASE_URL`,
  Then lệnh gọi `scripts/kiem-nhanh.mjs` (nạp `.env.local` nếu có, như `migrate`); thiếu `DATABASE_URL` thì thoát khác 0 với
  câu báo, không kết nối.

## Coverage

Trục (quét entity-feature, thiết kế §Thiết kế): nơi chạy (Postgres tạm của job `isolation` · bản thật trong job `deploy`) ×
việc (dựng cấu trúc · bộ kiểm ghi · kiểm nhanh đọc · gọi Vercel) × kết cục (xanh · đỏ chặn bước sau). Thước CE: các bước
hiện có của `ci.yml` (job `isolation`, `deploy`) và ba vế của câu giao (bật luật theo dòng · vai không là chủ bảng · ≤ 2
kết nối). Lớp `bypassrls` và superuser là điểm thêm ngoài câu giao (vai bỏ qua luật cũng phá bất biến 1 như vai chủ bảng). Thời gian
dưới 5 phút và «xanh ở lần gộp đầu» chỉ đo được sau khi gộp — ở Đường đo, không phải AC.

## Đường đo

- Ngưỡng ở `opportunity.md` là câu `bat_khi` của hàng: «deploy trên main xanh ở lần gộp đầu sau hàng, dưới 5 phút» → đọc
  thời lượng và kết cục job `deploy` của lần chạy CI trên main đầu tiên sau khi gộp PR (giám sát xem theo luật đợt 77;
  AC-1, AC-3, AC-6 bảo đảm phần máy) · «không bài nào ghi trên bản thật» → AC-1, AC-6 · «bảng thiếu luật làm job đỏ trước
  Vercel» → AC-3, AC-4 · «bộ cách ly vẫn chạy đủ trên CSDL tạm và vẫn chặn» → AC-2. Timebox chưa khai — người khai ở Cổng
  Giá trị.

## Out of scope

- Sửa ADR-0009 §7 và Tham chiếu §12 — giám sát bỏ hai tệp khỏi vùng 06/11; ghi ở «Việc theo sau» của thiết kế.
- Sửa thước `kiem-ci.mjs` của hồ sơ đã ký `moi-truong-that` (đòi `test:isolation` trong job deploy) — việc của hồ sơ ấy.
- Dùng nhánh Supabase làm cơ sở dữ liệu tạm — giám sát chọn service container 06/11 (tốn tiền, phải hỏi chủ kho); Never
  ở hàng này.
- Kiểm nhanh schema `identity` và chạy advisors của Supabase trong CI; Later.
- Đổi `KIT_TAG`, chạy bất cứ gì lên bản thật từ máy — Never.

## Notes
