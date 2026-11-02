---
schema_version: 1
feature: Bài kiểm chuyển dữ liệu cũ của hàng 85 không kẹt khoá với các bài kiểm gỡ ràng buộc chạy song song
slug: chuyen-khong-ket-khoa
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [db]
status: draft
design_doc: docs/superpowers/specs/2026-11-01-chuyen-khong-ket-khoa-design.md
approved_by:
approved_at:
veto_state: da-veto
veto_opened_at: 2026-11-01T15:25:00Z
---

# Acceptance Contract: chuyen-khong-ket-khoa

## Context

Giám sát giao cho dãy L (01/11): ghim lại PR #66 của dãy H đỏ vì ca «liên hệ: chuyển dữ liệu cũ» kẹt khoá với bài kiểm khác
chạy song song. Chỉ chạm tệp bài kiểm `packages/api/test-db/lien-he-chuyen.test.ts` nên hạng T2. Không màn, không mã sản phẩm.

Source input: nhật ký đỏ của dãy H (`deadlock detected` ở `veTruoc016`, chờ khoá bảng chủ nhà / bảng lead) · tin giám sát ·
thiết kế `docs/superpowers/specs/2026-11-01-chuyen-khong-ket-khoa-design.md`

## Criteria

- AC-1: Given bài chuyển dữ liệu cũ đưa sàn về trạng thái trước 016 rồi chạy hàm chuyển, When nó mở giao dịch, Then trước câu
  ghi đầu tiên kết nối của nó đã giữ khoá bảng chủ nhà và bảng lead (đọc từ khoá của chính kết nối ấy) — cùng thứ tự với các
  bài gỡ ràng buộc chạy song song; ca kiểm không giữ khoá độc quyền trên bảng dùng chung nào; bài chuyển chạy trọn (mọi lead
  của sàn gắn liên hệ, liên hệ là bản dựng mới).
- AC-2: Given bộ kiểm cơ sở dữ liệu cả kho, When chạy, Then hai ca chuyển dữ liệu sẵn có của hàng 85 vẫn có mặt và xanh.

## Coverage

Bỏ quét coverage — một lỗi đã gọi tên, một thế kẹt (dòng `descope` «bỏ coverage-scan»).

## Out of scope

- Hàm chuyển của migration 016 — chạy một lần lúc áp migration, không có bài gỡ ràng buộc song song.
- Chạy cả bộ kiểm tuần tự, hay sửa hai bài gỡ ràng buộc của hồ sơ khác.

## Notes

- Làm lại phạm vi sau lượt 1 (chủ kho 02/11, Ngoài-3: nâng phạm vi sửa ngay): ca dựng thế kẹt bằng khoá độc quyền bị thay
  bằng ca đọc khoá của chính kết nối bài chuyển — không còn giữ khoá độc quyền bảng chung; Ngoài-3 (ca giữ khoá độc quyền bảng
  chung) đóng nhờ ca mới đo thứ tự khoá và đếm khoá mạnh của chính kết nối; Ngoài-1, 2, 4, 5, 6 của lượt 1 nói về ca cũ nên
  hết theo. Sáu dòng máy định tuyến của lượt 1 đã gỡ khỏi Notes — lịch sử ở sổ, dòng veto `d-20261102T022651Z-20`.
- Thế kẹt thật đã tái hiện tất định ở S3 lượt 1 (giữ khoá độc quyền bảng chủ nhà → xoá liên hệ → xin bảng lead: «deadlock
  detected»); ca mới không dựng lại thế kẹt, chỉ chứng thứ tự khoá — bài gỡ ràng buộc nào sau này khoá theo thứ tự khác thì
  ca này không thấy.
- Known limits — chọn ở Cổng Bằng chứng 2026-11-02 (lượt 1, áp cho ca cũ đã thay):
  - Ngoài-1: Ca cũ có thể xanh dù lỗi kẹt khoá quay lại.
  - Ngoài-2: Ca cũ khi đỏ có thể làm bài kiểm khác treo.
  - Ngoài-4: Ca cũ có thể xanh mà chưa dựng được thế kẹt.
  - Ngoài-5: Ca cũ khi đỏ có thể che lỗi gốc.
  - Ngoài-6: Ca cũ chưa chứng được thế kẹt đã xảy ra.
- Việc giám sát giao: mở PR nhỏ «fix(lien-he): bài chuyển dữ liệu cũ không kẹt khoá», gộp qua `gop`, báo giám sát khi gộp.
