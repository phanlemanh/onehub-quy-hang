---
schema_version: 1
feature: Vá Điền mã căn — mã căn phải có ít nhất một chữ hay số; mã toàn dấu bị từ chối với lời báo rõ, không khoá hàng
slug: va-dien-ma-can-cho-hang
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, web, api]
status: draft
design_doc: docs/superpowers/specs/2026-11-02-va-dien-ma-can-cho-hang-design.md
---

# Acceptance Contract: va-dien-ma-can-cho-hang

## Context

Ngoài-2 và Ngoài-4 của `dien-ma-can-cho-hang` (chủ kho chọn mở hợp đồng mới, 02/11): mã căn toàn dấu như «---» qua khuôn
của lõi nhưng `app.unit_key` ra NULL, nên kiểm trùng bị bỏ qua và hàng bị khoá với mã không dùng được. Bất biến chạm:
không.

## Criteria

### AC-1 — Lõi chặn mã căn không có chữ hay số
Given khuôn của sự kiện `unit_number_assigned` và `created` trong lõi
When `unitNumber` không có ký tự nào thuộc `0-9A-Za-z` (như «---», «.», «/ /», «Đ»)
Then khuôn trả đúng một lỗi ở trường `unitNumber` mang câu «Mã căn cần ít nhất một chữ (A–Z) hoặc số (0–9)»; mã có ít
nhất một chữ hay số (như «A-12.05», «a 02.06», «12») vẫn nhận như cũ.

### AC-2 — Máy chủ từ chối, hàng không bị khoá (cross-layer)
Given hàng chưa có mã căn
When gửi `unit_number_assigned` với mã «---» qua `POST /api/v1/listings/{id}/events`, hay tạo hàng với mã «---» qua
`POST /api/v1/listings`
Then 400 `invalid-payload` nêu trường `unitNumber`; không sự kiện, không hàng nào được ghi, hàng vẫn chưa có mã; gửi lại mã
«A-12.05» thì 200 (gắn) hay 201 (tạo) và hàng mang mã ấy. Luật của lõi khớp `app.unit_key`: mã bị lõi từ chối đúng khi
`app.unit_key` của nó là NULL.

### AC-3 — Ô «Mã căn» báo rõ tại chỗ
Given hồ sơ của hàng chưa có mã
When đầu chủ gõ mã toàn dấu và bấm «Lưu mã căn»
Then ô hiện câu «Mã căn cần ít nhất một chữ (A–Z) hoặc số (0–9)», không lệnh nào vào hàng đợi trên máy, hàng vẫn chưa có
mã và chữ đã gõ còn giữ.

## Coverage

- Bỏ quét không gian tiêu chí — xem dòng sổ «bỏ coverage-scan»: bài toán một chiều (một luật khuôn, ba lớp đi qua nó).
- Lớp: lõi AC-1 · máy chủ AC-2 · web AC-3. Hai đường mã căn vào hàng: tạo hàng và gắn mã — AC-1 phủ cả hai.

## Out of scope

- Dọn hàng đã mang mã rác — tính năng gắn mã vừa ra (PR #85), chưa có bản thật dùng.
- Mã căn ở lead — ô nhận lead đã chặn `app.unit_key` rỗng từ migration 007, 009.

## Notes

- Vùng: `packages/core/src/listing/` (events.ts, gan-ma-can.ts và test), `packages/api/test-db/dien-ma-can.test.ts`,
  `apps/web/src/app/(app)/units/ho-so/ho-so.ts` và test của nó.
