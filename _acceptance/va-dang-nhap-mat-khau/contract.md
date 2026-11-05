---
schema_version: 1
feature: "Vá hai kẽ an toàn của mật khẩu do sàn cấp: người vào sàn khác thì phiên cũ cũng bị thu khi mật khẩu gốc sàn cấp bị vô hiệu; đổi mật khẩu ở Cá nhân đếm lần sai mật khẩu hiện tại chung bộ đếm với đăng nhập"
slug: va-dang-nhap-mat-khau
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, db, ui]
status: implemented
approved_by: Manh Phan
approved_at: 2026-11-05
design_doc: docs/superpowers/specs/2026-11-05-va-dang-nhap-mat-khau-design.md
---

# Acceptance Contract: va-dang-nhap-mat-khau

## Context

Hàng vá của hàng 104 `dang-nhap-mat-khau` (luật 64): chủ kho chọn «mở hợp đồng mới» cho Ngoài-6 (vào sàn khác mà phiên cũ
còn sống, có thể đặt mật khẩu mới không cần mật khẩu cũ) và Ngoài-7 (đổi mật khẩu ở Cá nhân không giới hạn lần đoán) ở
Cổng Bằng chứng 05/11.

## Criteria

- AC-1 (cross-layer): Given người có mật khẩu gốc sàn cấp (mật khẩu tạm, hay đặt lần đầu từ mật khẩu tạm) ở sàn A và có
  phiên mở ở hai máy, When người ấy được thêm vào sàn B (qua API mời người hay chèn thẳng `company_members`), Then trong
  cùng giao dịch mật khẩu bị vô hiệu (`vao-san-khac`), mọi dòng `identity.session` của người ấy bị xoá, sự kiện
  `vo-hieu-san-khac` được ghi, lời mời vẫn thành công; phiên cũ gọi `GET /api/v1/me` ra 401 và
  `PUT /api/v1/me/password` ra 401.
- AC-2 (cross-layer): Given người có mật khẩu tự đổi ở Cá nhân (`tu-doi`), hay chưa có mật khẩu, hay được mời lại vào
  đúng sàn đã cấp, When được thêm vào sàn, Then mật khẩu và mọi phiên giữ nguyên.
- AC-3 (cross-layer): Given người đang đăng nhập có mật khẩu dùng được, When gọi `PUT /api/v1/me/password` với
  `currentPassword` sai, Then 403 `invalid-current-password`, một dòng `identity.password_failures` mang email của người
  được ghi và `failed_streak` tăng một; khi đã có 5 lần sai trong 15 phút theo email (đếm chung với đăng nhập), lời gọi
  kế ra 429 `password-rate-limited` kể cả với `currentPassword` đúng, và mật khẩu không đổi.
- AC-4 (cross-layer): Given chuỗi sai của tài khoản ở 19 (cộng cả đăng nhập lẫn đường đổi), When lần sai thứ 20 tới —
  qua `PUT /api/v1/me/password` hay qua `POST /api/v1/auth/sign-in/email` — Then mật khẩu bị vô hiệu (`khoa-20`), sự
  kiện `khoa-20` được ghi, mọi phiên của người — kể cả phiên vừa gọi — bị xoá; lời gọi kế bằng phiên cũ ra 401 và
  không đặt được mật khẩu mới.
- AC-5: Given `currentPassword` đúng sau vài lần sai, When đổi mật khẩu, Then 200, chuỗi sai về 0; thân yêu cầu không vào
  nhật ký ở mọi nhánh mới (403, 429, khoá).
- AC-6: Given hộp đổi mật khẩu ở Cá nhân, When máy chủ trả 429, Then câu «Thử lại sau ít phút» hiện dưới ô mật khẩu hiện
  tại; ánh xạ mã lỗi → câu được bộ test web giữ.
- AC-7: Given cây sau hàng này, When chạy kiểm kiểu, lint (kèm chuẩn giao diện), bộ test, bộ kiểm cơ sở dữ liệu của API,
  bộ kiểm cách ly và build, Then đều xanh; migration là tệp mới `038_*.sql`, không migration đã commit nào đổi; ADR-0005
  có dòng bổ sung cho hàng vá; Tham chiếu §12 có một dòng.

## Coverage

- Trục A — đường thêm người vào sàn: API mời người · chèn thẳng `company_members` (công cụ mở sàn, SQL) [thước CE: các
  đường ghi `company_members` hiện có trong kho] → AC-1.
- Trục B — loại mật khẩu khi vào sàn khác: tạm chưa dùng · đặt lần đầu từ tạm · tự đổi · chưa có · mời lại cùng sàn [thước
  CE: cột `kind`/`origin`/`issued_company_id` của migration 034] → AC-1, AC-2.
- Trục C — đường đếm sai: đăng nhập · đổi ở Cá nhân, chung một bộ đếm [thước CE: ADR-0005 bổ sung 04/11 luật 3] → AC-3,
  AC-4, AC-5.
- Core: A, B trọn ở AC-1, AC-2; C trọn ở AC-3–AC-5; chữ người thấy ở AC-6.

## Out of scope

- Gắn dấu cách tạo cho từng phiên để chỉ thu phiên tạo bằng mật khẩu (Hỏi-1, lối khác).
- Đổi luật giới hạn thử (5 / 15 phút, 20 liên tiếp) — giữ cứng theo ADR-0005, Sổ điểm biến thiên K24.
- Ảnh màn hộp đổi mật khẩu ở 375/1280 — Known limits của hàng 104 vẫn áp.

## Notes

- Vùng: `ranh_gioi` của hàng cộng phần khai ở Cổng Phạm vi (migration `packages/db/migrations/038_*.sql`, bộ kiểm cách ly
  `packages/db/tests/isolation.test.mjs`, đường đổi `packages/api/src/me/routes.ts`, bộ kiểm cơ sở dữ liệu
  `packages/api/test-db/va-dang-nhap-mat-khau/**`, tài liệu ADR-0005 và Tham chiếu).
