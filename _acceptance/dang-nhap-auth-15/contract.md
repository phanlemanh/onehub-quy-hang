---
schema_version: 1
feature: "Người trong sàn đăng nhập trên một thẻ theo khối auth-15: chỉ mã một lần qua email, không nút Google, Apple hay GitHub, giữ chân điều khoản; chọn sàn và chưa gắn sàn đi cùng khuôn; luồng đăng nhập, phiên và luật vào đúng sàn của hàng 6 giữ nguyên"
slug: dang-nhap-auth-15
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
design_doc: docs/superpowers/specs/2026-11-04-dang-nhap-auth-15-design.md
approved_by: Manh Phan
approved_at: 2026-11-04
---

# Acceptance Contract: dang-nhap-auth-15

## Context

Hàng 93 của lộ trình. Ba màn xác thực (đăng nhập, chọn sàn, chưa gắn sàn) đang là bản ghép tạm bậc 6 của hàng 6; chủ kho
chọn khối `@reui/auth-15` bỏ nút OAuth ngày 02/11 (`docs/design/vo-va-ia.md` §2). Khối chuyển thể vào chính khuôn `Khung`
của nhóm `xac-thuc`.

Source input: hàng 93 của `docs/plan/lo-trinh.json` · ô cơ hội `_acceptance/dang-nhap-auth-15/opportunity.md` (ký
`build` 02/11) · `design/patterns/xac-thuc.md` · ADR-0005.

## Criteria

- AC-1: Given người chưa đăng nhập mở `/login` trên máy tính 1440 và điện thoại 375, When màn hiện, Then màn là một cột giữa
  trang theo auth-15: dấu hiệu ở đầu trang theo Hỏi-2 cạnh chữ «Quỹ hàng», tiêu đề «Đăng nhập Quỹ hàng», ô Email có biểu
  tượng thư và lời dặn «Quỹ hàng gửi mã 6 số tới email này.» dưới ô, nút «Gửi mã» rộng trọn cột, chân trang đúng câu chốt
  ở Hỏi-1; không có nút Google, Apple, GitHub, không có dải «tiếp tục với», không khung viền bao quanh form.
- AC-2: Given người mẫu một sàn ở màn đăng nhập, When gõ email, bấm «Gửi mã», gõ mã sai rồi mã đúng, Then mã sai hiện
  «Mã không đúng. Thử lại.» dưới ô mã (lời dặn «Đã gửi mã tới <email>» vẫn còn), mã đúng đưa vào `/` của sàn; «Đổi email»
  về bước một — luồng, chữ lỗi và đường API như hàng 6.
- AC-3: Given người mẫu thuộc hai sàn và người mẫu chưa thuộc sàn nào, When mỗi người vào sau khi đăng nhập, Then người
  hai sàn thấy «Chọn sàn làm việc» trên cùng khung (dấu hiệu, tiêu đề lớn, chân điều khoản), mỗi sàn một nút, bấm một sàn
  thì vào `/` của đúng sàn ấy; người chưa thuộc sàn thấy «Chưa thuộc sàn nào» với câu nhờ quản trị mời, cùng khung; nút
  Đăng xuất ở cả hai màn đưa về `/login`.
- AC-4: Given mã nguồn sau hàng này, When đọc màn đăng nhập và khuôn, Then màn đăng nhập vẫn dựng khối «Máy bị báo mất»
  (hàng 38) trước form, form vẫn gọi đúng hai đường `/api/v1/auth/email-otp/send-verification-otp` và
  `/api/v1/auth/sign-in/email-otp`, các trạng thái của hàng 6 còn đủ (ô mã chỉ nhận số, tối đa 6, `autocomplete`
  `one-time-code`; nút «Đang gửi…» khoá khi đang gửi; mã hết hạn thì nút «Gửi lại mã»; lỗi «quá nhiều lần» gắn dưới ô
  Email; ô Email tự focus), `Khung` không dựng `Frame` hay `Card`, và không tệp nào dưới `apps/web/src/app/(auth)` mang chữ
  Google, Apple, GitHub.
- AC-5: Given nhánh của hàng này so với nhánh chính, When liệt tệp đổi, Then không tệp nào dưới `packages/api/src/auth` đổi.
- AC-6: Given cây sau hàng này, When chạy kiểm kiểu, lint (luật `quy-hang-ui`, mức nợ 0, kiểm chuẩn), quét khuôn nhóm
  `xac-thuc` và sàn thiết kế M1, Then đều xanh, không dòng «lệch:» nào cho ba màn.
- AC-7: Given sổ thiết kế sau hàng này so với nhánh chính, When kiểm chuẩn đọc nó, Then dòng «Chỗ hở» «Đăng nhập, chọn
  sàn, chưa gắn sàn (tạm)» có ở nhánh chính và không còn ở nhánh này (bảng Chỗ hở bớt đúng một dòng, còn 11), kiểm chuẩn
  không còn cảnh báo hạn nào và không cảnh báo nào nhắc «Đăng nhập», bảng «Khối đã chuyển thể» của `catalog.md` có dòng
  `@reui/auth-15` đủ chín ô không rỗng với ảnh chuẩn có trong kho, và `khung.tsx` mang chú thích «chuyển thể … auth-15».
- AC-8: Given ba màn ở chế độ tối (1440 và 375) và bước mã ở khổ 375, When hiện, Then chữ, ô, nút và lỗi đọc được trên
  nền tối và không màn nào cuộn ngang.

## Coverage

Quét bằng morphological-scan (preset test-matrix), ba trục:

- Trục A — màn: đăng nhập (bước email · bước mã) · chọn sàn · chưa gắn sàn [thước CE: ba `page.tsx` của nhóm `xac-thuc`
  trong `design/patterns/xac-thuc.md`]
- Trục B — trạng thái: mặc định · đang gửi · lỗi gắn ô · máy bị báo [thước CE: bảng trạng thái của design doc, `CHU_LOI`
  của `login/form.tsx`]
- Trục C — khổ và nền: 1440 sáng · 1440 tối · 375 sáng · 375 tối [thước CE: `breakpoints`, `themes` của design-pass]
- Core: A × mặc định × 1440/375 ở AC-1, AC-3; bước mã × lỗi ở AC-2; đang gửi, hết hạn, quá nhiều lần, máy bị báo ở AC-4
  (mã nguồn); A × tối × 1440/375 và bước mã 375 ở AC-8.
- Later: trang điều khoản và chính sách có liên kết từ chân trang · danh sách chọn sàn kèm vai (dòng Chỗ hở «Chọn sàn sau
  đăng nhập» vẫn mở).
- Never: nút đăng nhập Google, Apple, GitHub (ADR-0005).

## Đường đo

Ngưỡng của ô cơ hội: «Ba màn đăng nhập, chọn sàn, chưa gắn sàn dựng trên khuôn Khung theo auth-15, không nút OAuth; không
đổi tệp nào dưới packages/api/src/auth; dòng «Chỗ hở» Đăng nhập rời §3 và bài kiem-chuan bớt đúng một cảnh báo hạn».

- Thước: ba màn trên khuôn Khung theo auth-15, không OAuth · số từ: E1, E3, E4, E6 · bảo đảm bởi: AC-1, AC-3, AC-4, AC-6
- Thước: không đổi tệp nào dưới packages/api/src/auth · số từ: E5 · bảo đảm bởi: AC-5
- Thước: Chỗ hở rời §3, bớt đúng một cảnh báo hạn · số từ: E9, E10, E13 · bảo đảm bởi: AC-7 (từ 04/11 hàng 34 đổi hạn
  dòng Đăng nhập sang điều kiện nên nó thôi cảnh báo trước hàng này; thước đo phần còn lại: dòng rời bảng, bảng bớt đúng
  một dòng, không cảnh báo nào nhắc Đăng nhập)

## Out of scope

- Trang điều khoản, chính sách bảo mật, liên kết hỗ trợ ở chân trang.
- Đổi luồng, phiên, giới hạn gửi mã hay đường API đăng nhập (hàng 6, ADR-0005).
- Danh sách chọn sàn dạng `Item` kèm vai (dòng Chỗ hở «Chọn sàn sau đăng nhập» giữ nguyên).

## Notes

- Vùng của hàng: `apps/web/src/app/(auth)/**`, `design/patterns/xac-thuc.md`, `.agents/skills/quy-hang-ui/catalog.md`,
  `docs/design/vo-va-ia.md`, `packages/ui-lint/tests/kiem-chuan.test.mjs`.
