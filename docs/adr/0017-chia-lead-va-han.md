# ADR-0017: Chia lead và hạn — cách chia là cấu hình của sàn

Ngày: 2026-11-01 · Trạng thái: **accepted** (Manh Phan duyệt Cổng Phạm vi hồ sơ `chia-lead-va-han` 01/11, Hỏi-1..7 theo
khuyến nghị; duyệt kế hoạch 01/11) · Liên quan: Tham chiếu §2, §4, §8 luật 20; ADR-0012 (ô nhận lead), ADR-0013 (mã hoá
số chủ), ADR-0018 (sổ điểm biến thiên); hàng 25 của lộ trình; hàng 26 (thông báo), 42 (Hôm nay của trưởng nhóm),
48 (màn cấu hình)

## Bối cảnh

Luật 20: lead không trùng chia theo luật của sàn; hạn nhận 15 phút, hạn gọi lần đầu 30 phút; quá hạn thì báo trưởng nhóm;
cả hai là mặc định, sàn chỉnh ở Cài đặt sàn. Chủ kho 01/11: phân phối lead là chuẩn của nhiều CRM và chủ sàn chưa chắc
cách nào tốt nhất — cứng một luật thì không triển khai được.

## Quyết định

1. **Cách chia là cấu hình của sàn, chọn từ thực đơn cố định của lõi** (`packages/core/src/routing`, không kịch bản):
   theo vùng phụ trách lần lượt (`zone_round_robin`, mặc định — Hỏi-5), lần lượt toàn sàn (`company_round_robin`), theo
   vùng ai ít lead đang mở nhất (`zone_least_open`), kho chung — đầu chủ tự nhận (`open_pool`), trưởng nhóm chia tay
   (`manual`). Mỗi mục là một chiến lược của lõi có bảng ca riêng; thêm cách chia là thêm một mục.
2. **Luật chủ trùng đứng trước mọi cách chia**: lead cùng số về đầu chủ đang giữ chủ nhà ấy (trên hàng, hay lead trước
   đã về người) nếu người ấy còn vai đầu chủ và không nghỉ. Trưởng nhóm luôn giao lại được. Hai điều này không tắt được.
3. **Lead đang mở** (để chia theo tải) = đã về người, chưa bỏ, chưa ghi gọi lần đầu (Hỏi-7); nới khi có trạng thái đóng
   lead. **Kho chung** chỉ hiện và cho nhận với đầu chủ không nghỉ phụ trách toà của lead (Hỏi-7).
4. **Hạn nhận, hạn gọi, người đọc báo** cũng là cấu hình (mặc định 15 phút, 30 phút, trưởng nhóm; lựa chọn khác: trưởng
   nhóm và quản trị sàn). Hạn là số phút nguyên 1–1440, hạn gọi không ngắn hơn hạn nhận.
5. **Đổi chỉ áp cho lead mới**: lead mang dấu cách chia và hai hạn từ nhịp đầu tiên nó vào; người đọc báo đổi ngay.
6. **Lưu ở `company_settings`** (một dòng một khoá «<nhóm>.<khoá>»): `lead_routing.strategy`,
   `lead_routing.accept_minutes`, `lead_routing.first_call_minutes`, `lead_routing.alert_to`. Khoá vắng là mặc định khai
   một chỗ ở lõi (`DEFAULT_LEAD_ROUTING`); SQL không chép con số. Quản trị sàn đọc và đổi qua
   `GET`/`PUT /api/v1/company/settings/lead-routing`; màn là hàng 48.
7. **Chia trong nhịp, không lúc nhập**: lối việc nền `POST /api/v1/jobs/lead-tick` (khoá `JOB_SECRET`) mỗi phút đóng
   dấu, chia, ghi lời báo cho từng sàn trong giao dịch riêng của sàn ấy; một sàn lỗi không chặn sàn khác. Người nhận ghi
   vào `matched_agent_user_id` (nghĩa: «đầu chủ lead đã về») để kiểm trùng của hàng 24 tự đúng.
8. **Không ai nhận được** (toà không ai phụ trách, mọi người nghỉ, sàn chia tay): lead chờ, người đọc báo được báo «chưa
   chia được» một lần (Hỏi-2); kho chung báo khi chưa ai nhận đủ hạn nhận. Lead khớp chủ trùng lúc nhập cũng tính hạn
   (Hỏi-3). Chính người đó, trưởng nhóm hay quản trị sàn đánh dấu nghỉ (Hỏi-4).
9. **Lời báo nằm trong app và API** (`GET /api/v1/lead-alerts`); đẩy lên điện thoại trưởng nhóm là phần đề nghị nới
   hàng 26 (Hỏi-6), màn là hàng 42.

## Hệ quả

- Số đo «lead → cuộc gọi đầu» loại lead có `reassign_count` lớn hơn 0 (giao lại xoá mốc gọi của người trước).
- Hàng 48 chỉ còn phần màn; sổ điểm biến thiên (ADR-0018) gom bốn khoá `lead_routing.*` mà không đổi khoá.
- Lối việc nền chỉ chạy khi có bên gọi mỗi phút — chưa bật thì không lead nào được chia trên bản thật.

## Bật nhịp mỗi phút trên bản thật — bước của chủ kho (Hỏi-1)

Máy và giám sát không đặt khoá. Dự án Supabase `quy-hang` (tổ chức gói Pro) có sẵn `pg_cron` 1.6.4 và `pg_net` 0.20.4,
chưa bật (đọc 31/10); tài liệu: https://supabase.com/docs/guides/cron.

1. Sinh khoá: `openssl rand -base64 32`.
2. Vercel → dự án Quỹ hàng → Settings → Environment Variables: thêm `JOB_SECRET` (Production) bằng khoá ấy; triển khai
   lại.
3. Supabase → dự án `quy-hang` → Database → Extensions: bật `pg_cron` và `pg_net`.
4. Supabase → Project Settings → Vault: thêm bí mật tên `job_secret` bằng cùng khoá.
5. Supabase → SQL Editor, chạy một lần (thay `<tên miền>`):

   ```sql
   select cron.schedule('lead-tick', '* * * * *', $$
     select net.http_post(
       url := 'https://<tên miền>/api/v1/jobs/lead-tick',
       headers := jsonb_build_object('Authorization', 'Bearer ' ||
         (select decrypted_secret from vault.decrypted_secrets where name = 'job_secret'))
     )
   $$);
   ```

6. Kiểm: sau vài phút, `select status_code from net._http_response order by created desc limit 5` ra 200; mười lead
   thử có `routed_at − created_at ≤ 60 giây`. Ra 401 là khoá hai bên lệch; 503 là Vercel chưa có `JOB_SECRET`.
7. Đổi khoá: làm lại bước 1, 2, 4. Tắt: `select cron.unschedule('lead-tick')`.
