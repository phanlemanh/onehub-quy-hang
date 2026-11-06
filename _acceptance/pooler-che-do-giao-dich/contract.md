---
schema_version: 1
feature: "Quỹ hàng chạy được qua pooler chế độ giao dịch, nên số người dùng đồng thời không còn bị trần 15 kết nối của chế độ phiên: bể danh tính không còn dựa vào tham số khởi động search_path, better-auth và các truy vấn tay ghi rõ lược đồ danh tính, cách ly theo dòng giữ nguyên; đo trên pooler giao dịch tại máy và trên bản xem trước cổng 6543 trước khi chủ kho quyết đổi bản thật."
slug: pooler-che-do-giao-dich
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api]
status: verified
design_doc: docs/superpowers/specs/2026-11-06-pooler-che-do-giao-dich-design.md
approved_by: Manh Phan
approved_at: 2026-11-06
---

# Acceptance Contract: pooler-che-do-giao-dich

## Context

Gốc lâu dài của sự cố bản thật 06/11 (`EMAXCONNSESSION` ở pooler Supabase chế độ phiên, trần 15 kết nối). PR #155 thu nhỏ
bể, PR #158 cho bể nghe lỗi; known-limits của hồ sơ `va-pool-ket-noi`: hàm serverless tự nhân bản khi tải tăng vẫn cạn
được 15 kết nối. Chế độ giao dịch (6543) không giữ trạng thái phiên — bể danh tính hiện dựa vào tham số khởi động
`-c search_path=identity`. Gốc, soi mã và cách làm: design doc.

Source input: hàng `pooler-che-do-giao-dich` của `docs/plan/lo-trinh.json` · ô cơ hội
`_acceptance/pooler-che-do-giao-dich/opportunity.md` (Cổng Đáng «build», giám sát đợt dau-khach-nhap).

## Criteria

- AC-1: Given `dungPools` dựng bộ bể ở nơi chạy «trang» và «chan-dau», When đọc cấu hình bể danh tính, Then không bể nào
  mang tham số khởi động `options`, mỗi lần dựng bể ghi đúng một dòng nhật ký nêu cổng của chuỗi kết nối (không mật khẩu,
  không máy chủ); công tắc cổng `DATABASE_POOLER_PORT` (biến thường, không bí mật) đổi cổng của chuỗi kết nối sang 5432
  hoặc 6543, vắng thì giữ nguyên, giá trị khác thì máy chủ không khởi động và lỗi không lộ chuỗi (sửa đổi S3 06/11, chủ
  kho chọn); cỡ bể và trình nghe lỗi của hai hồ sơ trước giữ nguyên.
- AC-2 (cross-layer): Given Postgres sạch đã áp mọi migration và bộ kiểm db dựng bể danh tính KHÔNG tham số khởi động
  (search_path mặc định, không chứa `identity`), When chạy bộ kiểm cách ly và bộ kiểm API trên Postgres
  (`npm run db:migrate && npm run db:test`), Then cả hai xanh và đầu ra không có dòng «Could not validate the database
  schema» hay lỗi lệch lược đồ của better-auth.
- AC-3 (cross-layer): Given bàn thử pooler chế độ giao dịch tại máy (PgBouncer `pool_mode = transaction`,
  `default_pool_size = 1`) trước Postgres đã nạp mẫu, và một tiến trình nạp `getApi` THẬT của `apps/web` với
  `DATABASE_URL` trỏ pooler, When đầu chủ mẫu xin mã, nhập mã, rồi đọc `/api/v1/me`, Hôm nay và Bảng hàng — trên kết nối thường
  và trên kết nối mang search_path sai (`public`) — Then mọi bước trả 2xx với đúng người và sàn, và nhật ký tiến trình
  không có lỗi kiểm lược đồ; đối chứng: câu trần `"user"` trên kết nối search_path sai qua cùng pooler thì hỏng (sửa đổi
  S3 06/11: PgBouncer giữ search_path của từng khách nên cấu hình cũ không hỏng ở bàn thử — sổ quyết định).
- AC-4 (cross-layer): Given cùng bàn thử và HAI sàn, mỗi sàn có người đã đăng nhập và ít nhất một căn, When 10 tiến trình
  (mỗi tiến trình một bộ bể như một phiên bản hàm) cùng bắn 40 yêu cầu đồng thời xen kẽ người hai sàn, Then cả 40 trả 2xx,
  mỗi phản hồi Bảng hàng chứa đúng tập căn của sàn người hỏi, và sau loạt một kết nối trần qua pooler thấy vai chủ và
  `app.company_id` rỗng; đối chứng: một khách đặt `app.company_id` mức phiên qua pooler thì khách khác đọc được giá trị ấy.
- AC-5: Given mã chạy của `apps/web/src` và `packages/api/src` (trừ bài kiểm), When quét câu SQL và cấu hình bể, Then không
  có trạng thái phiên — `SET` không `LOCAL`, `set_config(…, false)`, `LISTEN`, khoá tư vấn mức phiên, `PREPARE`, bảng tạm,
  câu lệnh có tên, tham số khởi động `options` — và mọi câu nhắc bảng danh tính đều ghi `identity.`; đối chứng: tệp mồi
  mang từng mẫu bị gọi tên đúng đường, còn `set local` và `set_config(…, true)` không bị gọi tên.
- AC-6 (cross-layer): Given PR đã gộp, bản thật đã chạy mã có dòng dựng bể, và chủ kho duyệt đổi ở Cổng Bằng chứng, When
  máy đặt công tắc `DATABASE_POOLER_PORT=6543` cho Production (Supavisor chế độ giao dịch) vào giờ vắng và triển khai lại,
  Then nhật ký bản thật có dòng dựng bể nêu cổng 6543 trong 2 phút, và 30 phút theo dõi không có `EMAXCONNSESSION`, lỗi
  bể, lỗi lược đồ hay lỗi câu lệnh chuẩn bị; có lỗi thì máy tự xoá công tắc, triển khai lại và thấy dòng cổng 5432 (sửa
  đổi S3 06/11: chủ kho chọn «Đo trên bản thật» — bản xem trước không dựng được API vì thiếu khoá mã hoá số chủ nhà).
- AC-7 (judgment): Given ADR-0009, tài liệu kiến trúc và Tham chiếu sau bản vá, When người đọc tìm cách bản thật kết nối
  cơ sở dữ liệu, Then thấy mục sửa đổi 06/11 nêu chế độ giao dịch, lược đồ danh tính đặt ở adapter, job migrate giữ chuỗi
  riêng, các bước đổi `DATABASE_URL` bản thật và cách lùi; so với điểm rẽ khỏi nhánh chính, ADR-0009 chỉ có dòng thêm.
- AC-8: Given cây sau bản vá, When so với điểm rẽ khỏi nhánh chính, Then mọi tệp đổi nằm trong danh sách cho phép đích danh
  (Notes) — không migration, không `packages/api/src/db.ts`, không rào của kho — và `_acceptance/config.yaml` chỉ thêm khoá
  executor của hồ sơ; khi nhánh đã nằm trong nhánh chính thì ca cây thật tự bỏ qua có ghi lý do.
- AC-9: Given cây sau bản vá, When chạy kiểm kiểu, lint, build và bộ kiểm đơn vị của `@quy-hang/api`, `@quy-hang/web`, Then
  đều xanh.

## Coverage

Liệt kê tay bốn trục (descope «bỏ coverage-scan» trong sổ quyết định):

- Trục A — đường tới bảng danh tính: better-auth qua adapter Kysely · truy vấn tay của Quỹ hàng trên bể danh tính (bốn câu
  trần + các câu đã ghi `identity.`) · bộ kiểm db [thước CE: quét `identityPool.query` và `from|join|into|update` trên chín
  bảng của lược đồ `identity` ở migration]
- Trục B — trạng thái phiên: tham số khởi động · `SET` phiên · `set_config(…, false)` · `LISTEN` · khoá tư vấn mức phiên ·
  `PREPARE`/câu có tên · bảng tạm; được phép: `set local`, `set_config(…, true)`, khoá tư vấn mức giao dịch [thước CE:
  danh sách «không hỗ trợ ở chế độ giao dịch» của PgBouncer và Supavisor — CE chưa kiểm chứng cho Supavisor]
- Trục C — chế độ kết nối: Postgres trực tiếp (máy, CI) · pooler chế độ phiên 5432 (bản thật hiện nay) · pooler chế độ
  giao dịch tại máy (PgBouncer) · Supavisor chế độ giao dịch 6543 (bản xem trước)
- Trục D — luồng người dùng: xin mã · nhập mã · đọc phiên · Hôm nay · Bảng hàng · bước chặn đầu làm mới cookie · đăng nhập
  mật khẩu
- Core: A ở AC-2, AC-3, AC-5; B ở AC-4 (rò thật), AC-5 (quét); C trực tiếp ở AC-2, phiên giữ đường cũ (mã không đổi hành
  vi, không AC mới), giao dịch tại máy ở AC-3, AC-4, Supavisor ở AC-6; D xin/nhập mã, phiên, Hôm nay, Bảng hàng ở AC-3,
  bước chặn đầu và mật khẩu ở AC-2 (bộ kiểm db) và thử tay của chủ kho trên bản xem trước.
- Later: nâng cỡ bể khi đã ở chế độ giao dịch; số đo kết nối theo thời gian.
- Never: `SET` mức phiên để «sửa nhanh» search_path.

## Đường đo

- Ngưỡng «trên bản xem trước dùng pooler chế độ giao dịch: đăng nhập, Hôm nay, Bảng hàng chạy» · số từ: thử tay của chủ kho
  trên bản xem trước (mục kiểm tay của trang bằng chứng) + luồng cùng tên trên pooler giao dịch tại máy ở E3 · bảo đảm bởi:
  AC-3, AC-6
- Ngưỡng «bộ kiểm cách ly xanh» · số từ: mã thoát của `npm run db:migrate && npm run db:test` ở E2 · bảo đảm bởi: AC-2
- Ngưỡng «tải đồng thời 40 trang không còn EMAXCONNSESSION» · số từ: 40 mã trạng thái + nhật ký bản xem trước ở E7 (và
  loạt 40 yêu cầu trên pooler tại máy ở E4) · bảo đảm bởi: AC-4, AC-6

## Out of scope

- Đổi `DATABASE_URL` của bản thật — bước vận hành chủ kho quyết ở Cổng Bằng chứng, sau khi đã đo.
- Đổi cỡ bể (`NOI_TRANG`, `NOI_CHAN_DAU`) hay nâng `pool_size` của Supabase.
- Job migrate của CI (`PROD_DATABASE_URL`) và các lệnh của `packages/db` (migrate, nạp mẫu, bộ kiểm cách ly) — giữ chuỗi
  kết nối riêng.
- Đổi `withCompany` hay luật cách ly theo dòng.

## Notes

- Danh sách cho phép của AC-8: `.env.example`, `apps/web/src/lib/api.ts`, `apps/web/src/lib/api.test.ts`, `packages/api/src/auth/auth.ts`,
  `packages/api/src/app.ts` (chú thích), `packages/api/src/ten-hien-thi.ts`, `packages/api/src/leads/routes.ts`,
  `packages/api/src/owners/routes.ts`, `packages/api/src/routing/routes.ts`, `packages/api/package.json`,
  `package-lock.json`, `packages/api/test-db/helpers.ts`, `packages/api/test-db/owners.test.ts`,
  `packages/api/test-db/hom-nay-truong-nhom.test.ts`, `docs/adr/0009-moi-truong-that.md`,
  `docs/architecture/kien-truc-repo-va-stack.md`, `docs/product/tham-chieu.md`, `docs/plan/lo-trinh.json`, design doc và
  kế hoạch của hàng, `_acceptance/pooler-che-do-giao-dich/**`, `_acceptance/config.yaml`, `PRODUCT-MAP.md`, `LO-TRINH.html`.
- Bàn thử tại máy cần PgBouncer (Homebrew) và Docker; dùng lại chỗ thử Postgres của `va-pool-ket-noi` (chỉ đọc, không sửa).
- E7 chạy SAU khi gộp, do chủ kho duyệt đổi ở Cổng Bằng chứng: `doi-ban-that.mjs --doi` (đặt công tắc, triển khai lại,
  theo dõi, tự lùi) với thư mục `vercel link` ngoài kho (`VERCEL_LINK_DIR`). `DATABASE_URL` trên Vercel là bí mật kín —
  máy không đọc nó; công tắc là biến thường. Giờ vắng theo Hỏi-3.
- Thử tay của chủ kho (đăng nhập, Hôm nay, Bảng hàng) sau khi đổi là mục kiểm tay của trang bằng chứng — máy không tạo
  tài khoản thử trên dữ liệu thật.
