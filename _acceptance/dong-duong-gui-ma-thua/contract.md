---
schema_version: 1
feature: Mọi đường gửi mã đăng nhập đi qua cùng giới hạn 5 lần xin mã trong 15 phút cho mỗi email; đường quên mật khẩu của plugin không còn phục vụ
slug: dong-duong-gui-ma-thua
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api]
status: implemented
design_doc: docs/superpowers/specs/2026-10-31-dong-duong-gui-ma-thua-design.md
approved_by: Manh Phan
approved_at: 2026-10-31
---

# Acceptance Contract: dong-duong-gui-ma-thua

## Context

Hàng 55 của lộ trình (nền, dãy X, đợt nen-2), đứng trên hàng 6 (đăng nhập theo sàn, ADR-0005). Mở từ Cổng Bằng chứng
hàng 6, mục Ngoài-6 và Ngoài-10 — chủ kho chọn «mở hợp đồng mới» ngày 30/10: giới hạn xin mã chỉ gác một đường, hai
đường quên mật khẩu của plugin gửi mã không giới hạn, người lạ dội mã vào hộp thư thành viên sàn.

Hạng: hàng lộ trình ghi **T3**; máy suy T2 theo `t3_paths` (không tệp nào thuộc), giữ T3 theo hàng vì chạm đăng nhập.

Source input: `docs/plan/lo-trinh.json` hàng 55 · `_acceptance/dong-duong-gui-ma-thua/opportunity.md` ·
`_acceptance/dang-nhap-theo-san/decisions.jsonl` (Ngoài-6, Ngoài-10) · ADR-0005 · thiết kế
`docs/superpowers/specs/2026-10-31-dong-duong-gui-ma-thua-design.md`

## Criteria

- AC-1: Given một email có tài khoản đã xin 5 mã trong 15 phút ở đường xin mã đăng nhập, When xin mã lần thứ sáu ở bất
  kỳ đường gửi mã nào còn phục vụ của plugin, Then trả 429 `too-many-code-requests` và bộ gửi không nhận mã nào thêm;
  đối chứng: lần thứ năm vẫn nhận mã. (cross-layer)
- AC-2: Given email có tài khoản, When xin mã ở đường xin mã chính với kiểu mã «xác minh email» hay «quên mật khẩu»,
  Then trả 400 `code-type-not-allowed`, bộ gửi không nhận mã và không dòng xin mã nào được ghi; đối chứng trên cùng
  email ngay sau đó: kiểu «đăng nhập» vẫn nhận mã, và vẫn đủ 5 lần xin trước khi bị 429. (cross-layer)
- AC-3: Given email có tài khoản, When gọi từng đường nhãn «đã tắt» — ba đường quên / đặt lại mật khẩu
  (`/email-otp/request-password-reset`, `/forget-password/email-otp`, `/email-otp/reset-password`) và hai đường đổi email
  (`/email-otp/request-email-change`, `/email-otp/change-email`), Then mỗi đường trả 404, bộ gửi không nhận mã nào và
  không dòng xin mã nào được ghi — gọi 10 lần liền cũng vậy. (cross-layer)
- AC-4: Given danh sách mọi đường của plugin mã email đọc từ chính bản better-auth đang cài, When đối chiếu với bảng
  phân loại viết tay («gửi mã, có giới hạn» · «đã tắt» · «không gửi mã»), Then mỗi đường có đúng một nhãn, mỗi đường
  «gửi mã, có giới hạn» nằm trong tập đường mà giới hạn gác, mỗi đường «đã tắt» nằm trong danh sách tắt của cấu hình;
  một đường mới chưa phân loại làm bài kiểm đỏ và gọi tên đường; cùng bài kiểm ghim hai lối gửi mã không qua đường —
  số hook của plugin và cấu hình xác minh email lõi (gửi mã khi đăng ký, đổi xác minh email sang mã) đều tắt.
- AC-5: Given thành viên sàn đăng nhập như hôm nay, When xin mã ở đường đăng nhập rồi nhập đúng mã, Then vẫn mở phiên;
  email lạ vẫn không nhận mã và trả lời giống email có tài khoản. (cross-layer)

## Coverage

Quét theo khuôn morphological-scan, preset risk-premortem, cho «mọi đường plugin có thể gửi mã». Chân sản phẩm: ADR-0005
mục 1 và 4 [SUY-TỪ-REPO: docs/adr/0005-dang-nhap-theo-san.md], mục Ngoài-6/Ngoài-10 của hàng 6 [SUY-TỪ-REPO:
_acceptance/dang-nhap-theo-san/decisions.jsonl]. Chân ngành: danh sách đường của plugin emailOTP better-auth 1.7.14
[SUY-TỪ-REPO: packages/api/node_modules/better-auth/dist/plugins/email-otp/routes.mjs]; OWASP — giới hạn tần suất cho mọi
đường phát mã, không riêng đường chính [NGÀNH: OWASP Authentication Cheat Sheet].

- Trục đường: xin mã chính (AC-1, AC-2, AC-5) | quên mật khẩu hai đường + đặt lại mật khẩu (AC-3) | đổi email (AC-3,
  AC-4) | đường tương lai khi nâng thư viện (AC-4) [thước CE: endpoints của plugin trong bản cài]
- Trục kiểu mã: sign-in nhận (AC-1, AC-5) | email-verification, forget-password bị chặn 400 (AC-2)
- Trục kết cục: gửi mã | 429 không gửi | 400 không gửi, không đếm | 404 không gửi, không đếm (AC-1, AC-2, AC-3) [thước CE: bộ gửi bắt mã + bảng
  `identity.otp_requests`]
- Later: giới hạn theo địa chỉ IP.
- Never: chặn ở bộ gửi (sổ quyết định — lối loại).

## Out of scope

- Không đổi số 5 lần / 15 phút hay cách đếm theo email.
- Không bật đổi email bằng mã (hai đường đổi email bị tắt, trả 404).
- Không giới hạn theo địa chỉ IP.
- Không đổi màn đăng nhập.

## Notes

- Vùng của hàng: `packages/api/src/auth/**` (vùng gốc) cộng `packages/api/test-db/dong-duong-gui-ma/**` (kiểm trên
  Postgres thật) và hai tệp thiết kế, kế hoạch — khai thêm ở Cổng Phạm vi.
