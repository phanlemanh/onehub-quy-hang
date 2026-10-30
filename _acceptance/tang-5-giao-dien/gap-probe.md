---
slug: tang-5-giao-dien
at: 2026-10-30T02:28:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

# Phản biện context sạch — tang-5-giao-dien

Một tác tử tươi (`feature-loop:cham-doc`) đọc đúng năm tệp: design.md, contract.md, evals.yaml, decisions.jsonl,
opportunity.md. Kho chưa có bài học xuyên hồ sơ (claim-scan rỗng) nên không có input thứ năm.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Dòng sổ d-8 nói nối kiem-chuan.mjs vào CI phải sửa workflow, trong khi design nối muc-no.mjs qua npm run lint — lối khác còn sống | Người ký hoãn vì tin không có đường; hàng 53 thêm thành phần mà quên catalog.md, CI không bắt | Tách: kiem-chuan nối CI qua npm run lint; floor giữ hoãn với lối chết thật | fixed: kiem-chuan.mjs thêm vào npm run lint (design §3, AC-4); dòng sổ d-8 bị thay bởi dòng mới chỉ hoãn floor (cần CLAUDE_PLUGIN_ROOT mà job check không có) |
| P0 | design | Định nghĩa «mức nợ» (chỉ đếm suppressions) là đánh đổi giá trị mà sổ ghi máy quyết | eslint-disable có lý do lọt, lint in 0/0, ngưỡng báo SỐNG trong khi nợ thật tăng | Một dòng sổ cho định nghĩa (người ký) + ca hai chiều cho disable có lý do | human-gate1: thành Hỏi-1 trên thẻ Cổng Phạm vi (khuyến nghị: suppressions chặn, ngoại lệ có lý do in riêng không chặn); yêu cầu can-nguoi G-2 đã gửi; E6 có ca «ngoại lệ có lý do: 1» |
| P1 | evals | E9 gọi khoá san_m1 và tệp thu-san.mjs mà design không khai; kho thử chưa nói lấy config ở đâu, mốc diff, đường kit | E9 không giải được ở S4 hoặc đo trên config viết tay | Khai khoá + mô tả thu-san.mjs, config round-trip, commit mốc, kit qua CLAUDE_PLUGIN_ROOT | fixed: design §4 khai executors.script.san_m1 và bốn bước của thu-san.mjs; E9 expected ghi chép nguyên config thật, base main, thoát 2 có tên khi thiếu kit |
| P1 | evals | AC-7 hứa CI chặn mà không eval nào đọc job check; chưa có ca nhánh chính vắng tệp/ref vắng; fixture suppressions viết tay | Checkout nông của CI làm mọi PR đỏ oan hoặc trần không bao giờ bị so; khuôn suppressions đoán sai | Ca vắng tệp/ref, eval đọc job check, fixture sinh bằng eslint --suppress-rule | fixed: E11 mới (kiem-chuan đọc ci.yml, job check có npm run lint); E6 thêm ca vắng tệp trần, vắng ref (CI đỏ có tên, máy cảnh báo), tự fetch một lớp; fixture sinh bằng eslint --suppress-rule |
| P1 | evals | E4 đo «màu chữ khác màu nền» trên nền trong suốt của tiêu đề; chiều đỏ không có đối chứng | Nền rgba(0,0,0,0) cả hai chế độ làm vế «nền đổi» đỏ oan; chữ xám nhạt trên trắng vẫn đạt | Nền hiệu dụng tổ tiên, tương phản >= 4.5 hai chế độ, đối chứng tắt stylesheet | fixed: AC-3 và E4 đo nền hiệu dụng, tương phản >= 4.5, nền sáng khác tối; đối chứng đỏ tắt stylesheet |
