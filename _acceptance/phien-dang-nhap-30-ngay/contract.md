---
schema_version: 1
feature: Phiên đăng nhập giữ 30 ngày thay vì 7, vẫn trượt theo ngày dùng
slug: phien-dang-nhap-30-ngay
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api]
status: verified
design_doc: docs/superpowers/specs/2026-10-31-phien-dang-nhap-30-ngay-design.md
approved_by: Manh Phan
approved_at: 2026-10-31T09:30:00Z
---

# Acceptance Contract: phien-dang-nhap-30-ngay

## Context

Chủ kho 31/10 nguyên văn «phiên đăng nhập: 30 ngày»; giám sát đợt nen-2 giao cho dãy A: đổi thời hạn phiên better-auth
từ mặc định 7 ngày lên 30 ngày, vẫn trượt theo ngày dùng (làm mới tối đa một lần mỗi ngày), ghi một dòng ADR-0005 và
Tham chiếu §12. Việc coi như đã qua Cổng Đáng bằng chữ chủ kho. Hạn phiên nằm ở hai nơi — dòng phiên trong cơ sở dữ liệu
và cookie trình duyệt — nên trượt phải đúng ở cả hai (thiết kế §1).

Source input: lời giao của giám sát 31/10 · thiết kế `docs/superpowers/specs/2026-10-31-phien-dang-nhap-30-ngay-design.md`

## Criteria

- AC-1: Given một tài khoản đã mở sàn, When nhập đúng mã đăng nhập, Then phản hồi đặt cookie `qh.session_token` với
  `Max-Age=2592000` (30 ngày) và dòng phiên trong cơ sở dữ liệu hết hạn sau 30 ngày kể từ lúc đăng nhập (lệch không quá
  2 phút). (cross-layer)
- AC-2: Given một phiên lần làm mới cuối đã hơn 1 ngày (hạn còn 30 ngày trừ 25 giờ), When gọi
  `GET /api/v1/auth/get-session` bằng cookie ấy, Then phản hồi đặt lại cookie phiên với `Max-Age=2592000` và hạn của dòng
  phiên dời về 30 ngày kể từ bây giờ (lệch không quá 2 phút). (cross-layer)
- AC-3: Given một phiên vừa làm mới chưa tới 1 ngày (hạn còn 30 ngày trừ 1 giờ), When gọi
  `GET /api/v1/auth/get-session`, Then phiên đọc được, phản hồi không đặt cookie phiên nào và hạn của dòng phiên không
  đổi — không ghi cơ sở dữ liệu ở mỗi lần gọi. (cross-layer)
- AC-4: Given một phiên đã quá hạn (không dùng 30 ngày), When gọi `GET /api/v1/me` bằng cookie ấy, Then API trả 401 như
  chưa đăng nhập, và `get-session` trả không có phiên. (cross-layer)
- AC-5: Given một phiên lần làm mới cuối đã hơn 1 ngày, When mở một trang của bàn làm việc (bước chặn đầu
  `apps/web/src/proxy.ts`) bằng cookie ấy, Then phản hồi trang mang `Set-Cookie` cho cookie phiên — đúng tên cookie ở cả
  bản http (`qh.session_token`) lẫn bản https (`__Secure-qh.session_token`) — với cùng giá trị token, `Max-Age=2592000`,
  `HttpOnly`, `SameSite=Lax`, `Path=/` (bản https thêm `Secure`), và hạn dòng phiên dời về 30 ngày kể từ bây giờ; với
  phiên vừa làm mới, phản hồi trang không mang `Set-Cookie` phiên; không có cookie phiên thì vẫn chuyển về `/login`.
  (cross-layer)
- AC-6: Given mã nguồn của `createAuth`, When dựng auth với cấu hình thường, Then cấu hình phiên của better-auth là
  `expiresIn = 2592000` và `updateAge = 86400`, lấy từ hằng `SESSION_EXPIRES_SEC`, `SESSION_UPDATE_AGE_SEC` — không dựa
  vào mặc định thư viện.
- AC-7: Given ADR-0005 và Tham chiếu §12, When đọc, Then ADR-0005 ghi thời hạn phiên 30 ngày, làm mới mỗi ngày dùng, và
  Tham chiếu §12 có một dòng 31/10 cho quyết định này — số trong tài liệu khớp hằng ở mã.

## Coverage

Bỏ quét hình thái — sổ quyết định, dòng «bỏ coverage-scan». Trục tay vẫn liệt cho người duyệt:

- Nơi giữ hạn: dòng phiên (AC-1, AC-2, AC-3, AC-5) | cookie trình duyệt (AC-1, AC-2, AC-5)
- Tuổi phiên khi dùng lại: chưa tới 1 ngày (AC-3, AC-5) | hơn 1 ngày (AC-2, AC-5) | quá 30 ngày (AC-4)
- Lối vào: đăng nhập (AC-1) | đọc phiên qua API (AC-2, AC-3, AC-4) | mở trang (AC-5) | gọi API từ trình duyệt không mở
  trang — Out of scope

## Out of scope

- Lựa chọn «ghi nhớ đăng nhập» hay thời hạn khác nhau theo thiết bị.
- Trần tuyệt đối bắt đăng nhập lại sau N ngày dù dùng hằng ngày — better-auth không có sẵn, câu giao không đòi.
- Đăng xuất mọi thiết bị, danh sách phiên đang mở.
- Đặt lại cookie khi chỉ gọi API từ trình duyệt mà không mở trang nào.

## Notes

- Bất biến chạm: không bất biến nào — danh tính ở schema `identity`, không bảng công ty, không lớp `source`.
- Dãy A chạy Postgres 5552 (`quy-hang-db-A`).
- Ngoài-1 (máy định tuyến 2026-10-31, đề xuất S4 known-limits): Người dùng không thấy gì khác: đăng nhập 30 ngày vẫn chạy đúng. Chỉ là phần kiểm thử của lớp API đang dựa vào phần giao diện web, nên về sau dễ vỡ hoặc rối khi dựng lại môi trường. — `packages/api/test-db/session.test.ts`
