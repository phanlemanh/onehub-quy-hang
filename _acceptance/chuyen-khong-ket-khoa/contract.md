---
schema_version: 1
feature: Bài kiểm chuyển dữ liệu cũ của hàng 85 không kẹt khoá với các bài kiểm gỡ ràng buộc chạy song song
slug: chuyen-khong-ket-khoa
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [db]
status: approved
design_doc: docs/superpowers/specs/2026-11-01-chuyen-khong-ket-khoa-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-11-01T15:25:00Z
---

# Acceptance Contract: chuyen-khong-ket-khoa

## Context

Giám sát giao cho dãy L (01/11): ghim lại PR #66 của dãy H đỏ vì ca «liên hệ: chuyển dữ liệu cũ» kẹt khoá với bài kiểm khác
chạy song song. Chỉ chạm tệp bài kiểm `packages/api/test-db/lien-he-chuyen.test.ts` nên hạng T2. Không màn, không mã sản phẩm.

Source input: nhật ký đỏ của dãy H (`deadlock detected` ở `veTruoc016`, chờ khoá bảng chủ nhà / bảng lead) · tin giám sát ·
thiết kế `docs/superpowers/specs/2026-11-01-chuyen-khong-ket-khoa-design.md`

## Criteria

- AC-1: Given một giao dịch khác đang giữ khoá độc quyền bảng chủ nhà và sắp xin khoá độc quyền bảng lead (như bài gỡ ràng
  buộc), When bài chuyển dữ liệu cũ đưa sàn về trạng thái trước 016 rồi chạy hàm chuyển, Then không bên nào kẹt khoá: giao
  dịch kia lấy được khoá bảng lead, và bài chuyển chạy trọn sau khi nó nhả khoá (mọi lead của sàn gắn liên hệ).
- AC-2: Given bộ kiểm cơ sở dữ liệu cả kho, When chạy, Then hai ca chuyển dữ liệu sẵn có của hàng 85 vẫn có mặt và xanh.

## Coverage

Bỏ quét coverage — một lỗi đã gọi tên, một thế kẹt (dòng `descope` «bỏ coverage-scan»).

## Out of scope

- Hàm chuyển của migration 016 — chạy một lần lúc áp migration, không có bài gỡ ràng buộc song song.
- Chạy cả bộ kiểm tuần tự, hay sửa hai bài gỡ ràng buộc của hồ sơ khác.

## Notes

- Ca của AC-1 dựng lại thế kẹt bằng khoá tường minh (như hai bài gỡ ràng buộc khoá chủ nhà rồi lead), không chạy cùng hai
  bài thật; bài gỡ ràng buộc nào sau này khoá theo thứ tự khác thì ca này không thấy.
- Việc giám sát giao: mở PR nhỏ «fix(lien-he): bài chuyển dữ liệu cũ không kẹt khoá», gộp qua `gop`, báo giám sát khi gộp.
