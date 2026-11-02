---
slug: va-ma-can-lead
at: 2026-11-02T16:33:25Z
verdict: findings
p0: 1
p1: 1
p2: 2
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Sổ ghi máy tự quyết «bỏ mã rác, không từ chối» (d-…-3, -4) với nguồn một-lối, trong khi «từ chối gọn có lời báo trước khi ghi» cũng đạt câu giao; chọn giữa hai lối là đánh đổi của sàn | Chủ kho ký AC-3, AC-4 tưởng chỉ có một cách; sau ship hàng chưa mã hiện ra không lời giải thích, sàn muốn chặn dữ liệu rác phát hiện muộn | Dòng sổ Hỏi nguồn chỉ-người thay -3 và -4, AC-3, AC-4, E3, E4 rẽ theo lối người chọn | human-gate1: Hỏi-1 (d-…-9 thay -3; -10 thay -4 theo cùng lối); AC-3, AC-4 ghi «theo khuyến nghị Hỏi-1» |
| P1 | contract | Màn chế độ cuộc gọi tự tạo hàng từ lead không có AC hay eval đi qua | Lối của màn dựng hàng bằng lời gọi riêng, vẫn ném lỗi với lead mã rác trong khi E3 xanh | Ca E3b đi qua lối của màn | rejected: màn gọi đúng POST /api/v1/leads/{id}/listing (apps/web/src/app/(app)/units/call/ho-so-lead.ts:17) — cùng đường E3 đo; đã ghi vào Coverage |
| P2 | evals | E1 chỉ so mười chuỗi cố định, không đo quan hệ «luật lead là luật của lõi hàng» | Thợ chép regex riêng khớp mười mã mà lệch ở mã biên Unicode, E1 vẫn xanh | Assert validateLeadInput.ok === (kiemMaCan === null) trên ma trận + mã biên | fixed: E1 thêm quan hệ hai luật trên ma trận cộng 'Ａ1', '1⁄2', '٣' |
| P2 | evals | Fixture «lead trước luật» dựng bằng UPDATE không kiểm khuôn bản ghi rác thật | Bảng leads có cột dẫn xuất từ unit_number thì bản giả giữ khoá cũ, E3, E4 xanh mà dữ liệu thật vẫn hỏng | SELECT sau UPDATE xác nhận khuôn | fixed: E3, E4 thêm SELECT unit_number = '---' và app.unit_key IS NULL; đã soi migration — leads không có cột dẫn xuất từ unit_number |
