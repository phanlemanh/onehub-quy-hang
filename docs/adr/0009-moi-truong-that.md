# ADR-0009: Môi trường chạy thật

Ngày: 2026-10-31 · Trạng thái: **accepted** (Manh Phan duyệt kế hoạch hạ tầng 31/10: «tạo»; «domain mua trong vercel nên bạn
tự setup luôn») · Nối: ADR-0001 mục «Chưa chốt» (nơi chạy: «chưa tạo dự án») · Liên quan: ADR-0005 §7 (bản thật thiếu bộ
gửi email thì không khởi động), ADR-0006 §3–§4 (một tên miền cố định; đo lại vế mất mạng trên tên miền thật), Kiến trúc
§5, §8, §10

## Bối cảnh

ADR-0001 để Vercel và Supabase vùng Singapore làm hướng khởi điểm, chưa tạo dự án. Ba việc cần chỗ chạy thật: đo lại vế
mất mạng trên tên miền thật (ADR-0006), gửi mã đăng nhập bằng email thật (ADR-0005), hai tuần thử với đội (Kiến trúc §9
bước 7).

## Quyết định

1. **Cơ sở dữ liệu**: dự án Supabase riêng `quy-hang` (mã `kcpiamqdangrapfmkiig`) trong tổ chức «OneHub's Org», vùng
   ap-southeast-1, Postgres 17, máy Micro (+10 USD/tháng). Không chung dự án với OneHub Invest.
2. **Vai chủ riêng `quy_hang_owner`** (đăng nhập, `createrole`, `bypassrls`) chạy migration và sở hữu mọi bảng; dựng một
   lần bằng `packages/db/supabase/nen-du-an.sql`. Lý do: trên Supabase `postgres` không phải superuser, không đổi được
   mật khẩu bằng SQL, và Postgres 16+ không cho người tạo vai SET ROLE sang vai mình tạo. `bypassrls` thay cho superuser
   ở local: vai chủ dựng sàn và dữ liệu thử; truy vấn bảng của công ty vẫn `set local role quy_hang_app`, vai không có
   `bypassrls` (ADR-0001 §3). Mật khẩu sinh ở máy người dựng; vào cơ sở dữ liệu chỉ bằng chuỗi băm SCRAM.
3. **Data API của Supabase không thấy gì**: bảng thuộc `quy_hang_owner` nên quyền mặc định Supabase cấp cho bảng của
   `postgres` (anon, authenticated, service_role) không áp. Đo 31/10: REST trả `42501` với khoá công khai trên mọi bảng,
   GraphQL tắt (`pg_graphql` không bật). App chỉ nói chuyện với cơ sở dữ liệu qua `/api/v1`.
4. **Kết nối**: pooler của Supabase chế độ phiên (cổng 5432, IPv4 — hàm Vercel không đi IPv6), thêm
   `sslmode=require&uselibpqcompat=true` (mã hoá, chưa ghim chứng chỉ của Supabase). Chế độ giao dịch (6543) chưa dùng:
   kết nối danh tính đặt `search_path` bằng tham số khởi động, chế độ giao dịch không bảo đảm giữ.
5. **Chạy app**: dự án Vercel `onehub-quy-hang` trong đội đang chạy onehub-invest và crm-onehub-*, nối kho, gốc
   `apps/web`, hàm ở sin1, Node 24. Cài đặt build ở `apps/web/vercel.json` (lệnh cài chạy ở gốc workspace — cài trong
   `apps/web` thiếu TypeScript của gốc kho).
6. **Tên miền cố định**: `quyhang.onehub.center` — tên miền con của onehub.center (mua và giữ DNS ở Vercel). Không mua
   tên miền mới. Tên miền trang khách vẫn là chỗ mở của Kiến trúc §10.
7. **Áp migration trước, code sau**: `main` tắt tự deploy (`git.deploymentEnabled.main = false`). Sau khi gộp main, job
   `deploy` của CI chờ `check`, `isolation`, `secrets`, `gate` xanh, rồi áp migration lên cơ sở dữ liệu thật, chạy bộ
   kiểm cách ly ngay trên đó (mỗi ca rollback), xanh mới gọi deploy hook của Vercel. Bộ kiểm đỏ thì không deploy. Bí
   mật của job ở environment `production` của GitHub: `PROD_DATABASE_URL`, `VERCEL_DEPLOY_HOOK`. Nhánh khác vẫn có bản
   xem trước, dùng cùng cơ sở dữ liệu (chấp nhận khi chưa có dữ liệu thật — xem Hệ quả).
8. **Gửi mã đăng nhập**: Resend, từ `no-reply@onehub.center`; khoá `RESEND_API_KEY` chỉ ở Vercel. Bộ gửi ở
   `packages/api/src/auth/sender.ts`; có khoá thì gửi thật, bản thật thiếu khoá vẫn không khởi động (ADR-0005 §7).
9. **Giữ khoá**: mọi bí mật chỉ nằm ở Vercel (loại Sensitive — không đọc lại được) và secret của GitHub; không ở kho,
   không ở tin nhắn. Mật khẩu vai chủ đổi được bất cứ lúc nào bằng `alter role quy_hang_owner password '<SCRAM mới>'`
   rồi cập nhật hai chỗ trên. Khoá mã hoá số chủ nhà (Kiến trúc §8) **chưa sinh** vì chưa có mã dùng; tên giữ chỗ
   `OWNER_PHONE_KEY`, sinh ở hàng dựng bảng chủ nhà, cùng chỗ giữ như trên và một bản do chủ kho cất ngoài máy.
10. **Dữ liệu**: chỉ dữ liệu mẫu (`packages/db/seed`, nhãn «[Mẫu]», số `0900 000 0xx`). Không dữ liệu cá nhân thật tới
    khi người pháp lý rà (Kiến trúc §8, Luật Bảo vệ dữ liệu cá nhân hiệu lực 1/1/2026).

## Đã đo 31/10

- Migration 001–005 áp đủ bằng `npm run db:migrate` (004 của lõi hàng gộp main trước PR này; 005 áp trước khi gộp — chạy lại được). Bộ kiểm cách ly sau 004: 29/29 trên cơ sở dữ liệu thật.
- Bộ kiểm cách ly 24/24 và test API trên cơ sở dữ liệu 43/43 xanh **trên cơ sở dữ liệu thật**; sau chạy không còn dòng
  nào.
- Supabase advisors (sau 004 và 005): bảo mật 0 cảnh báo; hiệu năng còn hai mục INFO không thuộc luật theo dòng (`identity.otp_requests`
  không khoá chính; số kết nối của Supabase Auth — app không dùng Supabase Auth).
- Deploy `main` trên Vercel: build xanh; `/api/v1/health` trả 500 «thiếu bộ gửi mã đăng nhập» đúng ADR-0005 §7 tới khi
  bộ gửi Resend gộp và khoá có trong Vercel.

## Hệ quả

- Thư mã đăng nhập: Resend trả 403 tới khi tên miền gửi `onehub.center` xác minh ở Resend; người xin mã vẫn nhận câu trả lời thành công (ADR-0005 §4 — không lộ ai có tài khoản), lỗi chỉ ở nhật ký.
- Bản xem trước của nhánh dùng chung cơ sở dữ liệu thật. Trước khi có dữ liệu thật: tách cơ sở dữ liệu cho bản xem trước
  (nhánh Supabase hay dự án riêng) hoặc tắt bản xem trước.
- ~~Đội Vercel đang ở gói Hobby~~ — đính chính 02/11: đội `phanlemanh-8330's projects` ở gói **Pro**, đang hiệu lực
  (không phải dùng thử; kỳ 26/10–26/11, đọc bằng Vercel CLI). Điều khoản thương mại không còn chặn; lịch chạy của Vercel
  không còn trần một lần mỗi ngày. Việc nền mỗi phút (Kiến trúc §5) chọn nơi chạy theo thiết kế của từng hàng, không vì gói.
- Đăng nhập trên bản xem trước dùng `BETTER_AUTH_URL` của tên miền chính — chỉ kiểm được API, chưa đăng nhập được.
- Ghim chứng chỉ của Supabase (`sslrootcert`) và cân chế độ giao dịch của pooler khi tải tăng.
- Môi trường mới (staging, sàn riêng) dựng theo cùng thứ tự: `nen-du-an.sql` → migration → bộ kiểm cách ly → advisors.

## Sửa đổi 06/11 — chế độ giao dịch của pooler

Bối cảnh: sự cố bản thật 06/11 — pooler chế độ phiên (§4) cấp tổng 15 kết nối máy chủ cho cả dự án, mỗi kết nối khách giữ
một kết nối máy chủ suốt đời nó; hàm Vercel tự nhân bản khi tải tăng thì cạn trần ấy (`EMAXCONNSESSION`), đọc phiên hỏng,
người đã đăng nhập bị đưa về đăng nhập. Hồ sơ `va-pool-ket-noi` thu nhỏ bể; hồ sơ `pooler-che-do-giao-dich` gỡ điều chặn
chế độ giao dịch mà §4 nêu.

1. **Chế độ giao dịch (cổng 6543) là chế độ đích của `DATABASE_URL`**: kết nối máy chủ chỉ bị giữ trong một giao dịch rồi
   trả, nên nhiều kết nối khách dùng chung 15 kết nối máy chủ. Chế độ này không giữ trạng thái phiên (tham số khởi động,
   `SET` không `LOCAL`, `set_config(…, false)`, `LISTEN`, khoá tư vấn mức phiên, câu lệnh có tên, bảng tạm).
2. **Lược đồ danh tính đặt ở adapter, không ở kết nối**: better-auth nhận bể danh tính qua dialect Kysely với
   `schemaName: "identity"`; truy vấn tay trên bể danh tính ghi `identity.<bảng>`. Bể danh tính không còn tham số khởi động
   `-c search_path=identity`. Cách ly theo dòng không đổi: `withCompany` đặt vai và sàn bằng `set local` trong giao dịch.
   Bài quét của hồ sơ chặn trạng thái phiên quay lại mã máy chủ.
3. **Mã chạy được ở cả hai chế độ** (5432 phiên, 6543 giao dịch, kết nối trực tiếp): đổi chế độ là đổi `DATABASE_URL`,
   không đổi mã. Mỗi lần dựng bể, nhật ký ghi `[pool:ket-noi] cổng <cổng> · <nơi>` — chỉ cổng — để biết triển khai đang nối
   chế độ nào.
4. **Job migrate giữ chuỗi riêng**: `PROD_DATABASE_URL` của job `deploy` (§7) không chuyển sang chế độ giao dịch — migration
   chạy một lần sau mỗi lần gộp và có câu lệnh cần phiên. Hai chuỗi kết nối giữ riêng, không gộp.
5. **Đổi bản thật** (chủ kho quyết ở Cổng Bằng chứng của hồ sơ `pooler-che-do-giao-dich`, sau khi đã đo trên bàn thử tại
   máy và trên bản xem trước cổng 6543):
   1. Vercel → `DATABASE_URL` phạm vi Production: cùng chuỗi, đổi cổng 5432 → 6543 (giữ `sslmode=require&uselibpqcompat=true`).
   2. Triển khai lại bản thật; nhật ký phải có dòng `[pool:ket-noi] cổng 6543`.
   3. Theo dõi nhật ký 30 phút: không `EMAXCONNSESSION`, không dòng lỗi bể `[pool:`, không 5xx mới.
   4. Lùi: đặt lại chuỗi cổng 5432, triển khai lại — mã không cần đổi.
