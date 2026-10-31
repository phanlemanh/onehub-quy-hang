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
- Đội Vercel đang ở gói Hobby: lịch chạy chỉ một lần mỗi ngày và điều khoản là dùng phi thương mại. Việc nền mỗi phút
  (Kiến trúc §5) cần quyết nâng gói trước hàng dựng việc nền.
- Đăng nhập trên bản xem trước dùng `BETTER_AUTH_URL` của tên miền chính — chỉ kiểm được API, chưa đăng nhập được.
- Ghim chứng chỉ của Supabase (`sslrootcert`) và cân chế độ giao dịch của pooler khi tải tăng.
- Môi trường mới (staging, sàn riêng) dựng theo cùng thứ tự: `nen-du-an.sql` → migration → bộ kiểm cách ly → advisors.
