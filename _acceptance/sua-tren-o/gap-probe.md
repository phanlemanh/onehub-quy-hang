---
slug: sua-tren-o
at: 2026-11-01T01:00:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Sổ chưa trả lời hoàn tác có tính là «vừa xác nhận với chủ nhà» không — sự kiện bù mặc định mang confirmedWithOwner true; lựa chọn chỉ người có; E8, E8u không đo xác nhận sau hoàn tác | Gõ nhầm giá ở căn 20 ngày chưa xác nhận rồi Hoàn tác — giá về cũ nhưng Xác nhận thành «Hôm nay», số «tỉ lệ căn xác nhận trong N ngày» đếm thừa | Một dòng Hỏi có khuyến nghị; Đường đo, E8, E8u theo câu trả lời | human-gate1: Hỏi-2 (sổ d-20261101T010737Z-8), nháp theo khuyến nghị «không tính»; E8, E8u, Đường đo sửa sau câu trả lời |
| P0 | design | Dòng d-3 «đổi điều kiện phí luôn hỏi lại» ghi căn cứ mục tiêu mà câu trích luật 12 không quyết; lối «ghi thẳng» vẫn sống — đánh đổi chỉ người có [o-nhan-lead#F1] | Chủ kho ký tưởng luật 12 đã chốt; đổi phí hằng loạt gặp hộp hỏi lại ở mỗi ô; muốn ghi thẳng thì AC-5, E4u, E5 viết lại | Thay d-3 bằng dòng Hỏi có khuyến nghị | human-gate1: Hỏi-1 (sổ d-20261101T010737Z-7, supersedes d-3), nháp theo khuyến nghị «luôn hỏi» |
| P1 | evals | Bài nhìn chọn hàng theo «thứ k» trên tập mà chính các bài song song làm đổi | Bài trước đổi trạng thái làm «thứ k» trượt sang hàng bài khác đang ghi — đếm sự kiện sai, trượt chập chờn | Chốt mã căn từng bài; ghi sự kiện có tác giả lạ | fixed: mỗi bài chốt mã căn riêng (E2 B-03.04 · E4u B-08.02 · E6u B-13.02, B-14.04 · E7 B-14.05, A-13.01 · E8u B-14.06 · E9 B-15.01, B-15.05), đầu evals.yaml thêm vế «tác giả lạ» |
| P1 | contract | Vế «không tệp nào ngoài ranh giới (B-9)» của AC-10 không có đường đo; E13 mục (3) hỏi điều không nằm trong inputs | Một lần sửa chạm lib/sync vẫn qua — typecheck, lint xanh, judgment so contract với chính nó | Eval script so tệp đổi với danh sách cho phép viết trước, đối chứng đỏ lib/sync | fixed: thêm E14 (`thu/ranh-gioi.mjs`, đối chứng đỏ trong lệnh); bỏ mục (3) khỏi E13 |
| P1 | evals | AC-9 nói 13 cột, E9 nói 16; danh sách cột không viết trước trong expected | Người chấm không biết đạt hay trượt; bỏ sót một cột lỡ bật sửa thì luật 6 thủng | Thống nhất số cột, ma trận 19 cột viết trước, ca test tập cột sửa được | fixed: AC-9 sửa thành mười sáu cột (13 hiện + 3 ẩn); E9 liệt đủ 19 cột mở/không mở; thêm E15 (`cell-edit/cot-sua.test.ts`, đối chứng đỏ Diện tích) |
