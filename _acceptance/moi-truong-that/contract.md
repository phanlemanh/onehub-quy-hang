---
schema_version: 1
feature: Môi trường chạy thật — Supabase dự án riêng và Vercel vùng Singapore, migration áp qua CI trước khi deploy, mã đăng nhập gửi qua Resend
slug: moi-truong-that
owner: omre.cnsp4@onemount.com
risk_tier: T3
surfaces: [api, ci, config, docs]
status: signed-off
approved_by: Manh Phan
approved_at: 2026-10-31T01:16:33Z
---

# Acceptance Contract: moi-truong-that

## Context

Dựng nơi chạy thật cho Quỹ hàng theo Kiến trúc §5 và ADR-0001 «chưa tạo dự án»: cần cho đo lại vế mất mạng trên tên
miền thật (ADR-0006), gửi mã đăng nhập bằng email thật (ADR-0005) và hai tuần thử với đội (Kiến trúc §9 bước 7). Hạ tầng
đã dựng theo kế hoạch chủ kho duyệt 31/10 («tạo»; «domain mua trong vercel nên bạn tự setup luôn») — **làm trước, hợp
đồng viết sau** từ đúng điều đã dựng và đo; Cổng 1 duyệt hợp đồng này cùng lúc với Cổng 2. Quyết định: ADR-0009.

Source input: giao việc của phiên giám sát đợt nen-dau (31/10) · kế hoạch hạ tầng ở thư mục ghi chú chung · ADR-0009

## Criteria

- AC-1: Given dự án Supabase `quy-hang`, When kết nối bằng chuỗi của môi trường thật, Then máy chủ ở vùng ap-southeast-1
  và là dự án riêng — không phải dự án `one-invest`.
- AC-2: Given kho ở commit này, When so sổ migration của môi trường thật với `packages/db/migrations/`, Then mọi tệp đã
  ghi sổ, trừ đúng tệp 005 mà job deploy ghi sau khi gộp; vật của 005 (hai hàm khoá search_path, một luật đọc của
  `companies`) đã có mặt.
- AC-3: Given cơ sở dữ liệu thật, When chạy bộ kiểm cách ly `packages/db/tests/isolation.test.mjs` trên nó, Then mọi ca
  xanh và không để lại dòng nào.
- AC-4: Given khoá công khai của dự án Supabase, When gọi REST trên mọi bảng của Quỹ hàng và gọi GraphQL, Then mọi lời gọi
  bị từ chối và không trả dòng nào; ba vai anon, authenticated, service_role không có quyền trên bảng nào của `public`,
  `app`, `identity`.
- AC-5: Given cơ sở dữ liệu thật, When đọc vai và bảng, Then `quy_hang_app` không superuser, không bypassrls; mọi bảng của
  công ty bật và ép luật theo dòng; chỉ có sàn mẫu (hay chưa có sàn nào).
- AC-6: Given bộ gửi Resend, When gửi mã đăng nhập, Then gửi đúng một thư tới đúng người với mã và hạn 5 phút; lỗi gửi
  ném ra mà thông báo không chứa mã; bản thật thiếu khoá vẫn không khởi động.
- AC-7: Given CI, When push lên main, Then job `deploy` chờ check, isolation, secrets, gate xanh, áp migration rồi chạy bộ
  kiểm cách ly trên cơ sở dữ liệu thật, xanh mới gọi deploy hook; job không nằm trong ci-ok; main tắt tự deploy, hàm
  ghim sin1.
- AC-8: Given bản deploy của nhánh này trên Vercel (bản xem trước, cùng biến môi trường với bản thật, có khoá Resend), When gọi
  `/api/v1/health`, Then trả 200 — bản thật sau khi gộp do job deploy kiểm.
- AC-9: Given kho ở commit này, When quét bí mật trên toàn lịch sử, Then không có chuỗi kết nối, mật khẩu hay khoá nào;
  `.env.example` chỉ có tên biến.
- AC-10: Given ADR-0009, Kiến trúc §10 và Tham chiếu §12, When đọc cùng điều đã dựng, Then ba chỗ nói cùng một điều về
  nơi chạy, vùng, cách áp migration, cách giữ khoá và giới hạn còn lại. (judgment)

## Coverage

Quét theo bốn trục của một môi trường: nơi chạy (cơ sở dữ liệu AC-1, app AC-7/AC-8) · cửa vào dữ liệu (đường app AC-3/AC-5,
đường công khai AC-4) · đường thay đổi (migration AC-2, deploy AC-7) · bí mật và tài liệu (AC-6, AC-9, AC-10). Ca
không-được-xảy-ra: khoá công khai đọc bảng (AC-4), vai API vượt luật (AC-5), code mới chạy trên schema cũ (AC-7), bản
thật in mã ra nhật ký (AC-6), bí mật vào kho (AC-9).

## Out of scope

- Xác minh tên miền gửi ở Resend và tạo khoá `RESEND_API_KEY` — việc của chủ kho trên tài khoản Resend; AC-8 chờ việc này.
- Khoá mã hoá số chủ nhà — chưa sinh vì chưa có mã dùng (ADR-0009 §9).
- Tách cơ sở dữ liệu cho bản xem trước; nâng gói Vercel; ghim chứng chỉ Supabase — ghi ở Hệ quả của ADR-0009.
- Dữ liệu cá nhân thật — không vào môi trường này tới khi pháp lý rà (Kiến trúc §8).
- Đo lại vế mất mạng của ADR-0006 — hàng dựng phần đồng bộ làm trên tên miền này.

## Notes

- Bằng chứng AC-1–AC-5 và AC-8 đọc môi trường thật nên cần biến môi trường của người chấm (khai ở `_acceptance/config.yaml`,
  executors `moi_truong_that`, `cach_ly_that`, `suc_khoe_that`); giá trị bí mật không vào hồ sơ.
