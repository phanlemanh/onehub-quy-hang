---
schema_version: 1
feature: Vá mã căn của lead — lead nhập mã căn toàn dấu bị từ chối ngay lúc nhập với lời báo như hồ sơ hàng; tạo hàng và gửi lại từ lead cũ mang mã rác không còn hỏng
slug: va-ma-can-lead
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api]
status: implemented
approved_by: Manh Phan
approved_at: 2026-11-03
design_doc: docs/superpowers/specs/2026-11-02-va-ma-can-lead-design.md
---

# Acceptance Contract: va-ma-can-lead

## Context

Sinh từ Ngoài-1, Ngoài-2 của `va-dien-ma-can-cho-hang` (PR #89): khuôn tạo hàng đã đòi mã căn có chữ hay số, nhưng ô nhận
lead chưa — lead mang mã toàn dấu được nhận rồi không tạo được hàng. Bất biến chạm: 1 (cách ly — ca kiểm chạy theo sàn);
không chạm lớp `source` (số chủ nhà đi đường cũ).

## Criteria

### AC-1 — Ô nhận lead theo luật mã căn của lõi
Given khuôn nhận lead của lõi (`validateLeadInput`)
When `unitNumber` không có ký tự nào thuộc `0-9A-Za-z` (như «---», «.», «/ /», «Đ», «_»)
Then khuôn trả đúng một lỗi ở `unitNumber` mang câu «Mã căn cần ít nhất một chữ (A–Z) hoặc số (0–9)»; mã có chữ hay số
(như «A-12.05», «a 02.06», «12») vẫn nhận như cũ; lead không có mã căn vẫn hợp lệ.

### AC-2 — Máy chủ từ chối lead mã toàn dấu (cross-layer)
Given người có quyền nhập lead
When gửi `POST /api/v1/leads` với `unitNumber` «---»
Then 400 `invalid-payload` nêu trường `unitNumber` kèm câu báo ấy; không lead nào được ghi; cùng thân với «A-12.05» → 201.

### AC-3 — Tạo hàng từ lead cũ mang mã rác (cross-layer)
Given lead đã ghi từ trước luật, mang mã căn toàn dấu
When đầu chủ của lead gửi `POST /api/v1/leads/{id}/listing`
Then (theo khuyến nghị Hỏi-1) 201 và hàng mới mang toà của lead, **chưa có mã căn**, nối với lead như mọi hàng tạo từ lead; gắn mã «A-12.05» sau
đó qua `unit_number_assigned` thì 200. Lead mang mã hợp lệ → hàng mang đúng mã ấy (đối chứng cùng đường).

### AC-4 — Gửi lại lead cũ mang mã rác (cross-layer)
Given lead đã trả lại, mang mã căn toàn dấu từ trước luật
When telesales gửi lại qua `POST /api/v1/leads/{id}/resubmit` với số mới
Then (theo khuyến nghị Hỏi-1) 201 và lead mới mang toà của lead cũ, **không mang mã căn**; lead cũ ghi đã gửi lại. Lead đã trả mang mã hợp lệ → lead
mới mang đúng mã ấy (đối chứng cùng đường).

## Coverage

- Bỏ quét không gian tiêu chí — xem dòng sổ «bỏ coverage-scan»: bài toán là một luật khuôn đi qua ba đường ghi lead.
- Trục: đường (nhập lead · tạo hàng từ lead · gửi lại lead) × mã căn (hợp lệ · toàn dấu · vắng). Nhập: AC-1, AC-2. Tạo hàng:
  AC-3 (màn chế độ cuộc gọi tự tạo hàng cũng gọi đúng `POST /api/v1/leads/{id}/listing` — `apps/web/src/app/(app)/units/call/ho-so-lead.ts`). Gửi lại: AC-4. Mã vắng: AC-1 (lead chỉ toà); hai đường dựng lại với mã vắng đã có ca kiểm của hàng 85 và hàng 27.

## Out of scope

- Dọn bản ghi lead cũ đang mang mã rác (sửa cột `unit_number`) — đổi dữ liệu thật; hai đường dựng lại đã bỏ qua mã rác.
- Câu báo trên ô nhận lead của web — màn chỉ gửi mã đọc từ danh mục, không gõ tay mã toàn dấu được.
- Ràng buộc cơ sở dữ liệu cho `leads.unit_number` — chạm `packages/db` (T3); lõi chặn ở đường ghi duy nhất.

## Notes

- Vùng: `packages/core/src/dedupe/index.ts` và `dedupe.test.ts`, `packages/api/src/leads/store.ts`,
  `packages/api/test-db/va-ma-can-lead.test.ts`.
