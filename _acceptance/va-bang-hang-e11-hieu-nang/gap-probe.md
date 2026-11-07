---
slug: va-bang-hang-e11-hieu-nang
at: 2026-11-07T15:25:26Z
verdict: findings
p0: 1
p1: 2
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Căn cứ dòng sổ chọn «memo trước, tách kho sau» trích sổ vòng trước — câu ấy chỉ liên quan, không quyết lựa chọn; câu chốt của giám sát không có tệp nguồn | Cổng Phạm vi tưởng hướng sửa có căn cứ đã ký trong khi máy tự chọn; nếu «giữ ô tích» chưa chốt thì đó là lựa chọn sản phẩm bị ghi là máy quyết | Trỏ đúng nguồn hoặc đổi thành câu hỏi | fixed: dòng sổ mới d-20261107T152741Z-6 supersedes d-20261107T152444Z-2, nguồn một-lối — bỏ ô tích là gỡ tính năng sửa hàng loạt đã ký (hàng 16), sửa lưới ReUI là sửa bản cài nguyên bản bị cấm; thứ tự memo rồi tách kho là rẻ đến đắt, đo bằng E1 |
| P1 | evals | E1 thiếu đối chứng A/A; ngưỡng 1,2 trên trung vị 3 cặp nằm trong vùng nhiễu; vế 1% tuyệt đối không so trong cặp | Memo đúng mà E1 đỏ vì nhiễu, vòng nhảy sang lối đắt; E1 lúc xanh lúc đỏ | Thêm E1-AA; luật đo thêm khai trước; in tỷ lệ bản tốt từng cặp | fixed: thêm E2b (bản tốt so với chính nó phải đạt); kiem-e11.sh đo thêm 2 cặp khi trung vị 3 cặp trong 1,1–1,3 (khai trước khi thấy số) và in tỷ lệ bản tốt cùng cặp; vế 1% giữ vì giám sát chốt, nay đọc được cạnh số bản tốt |
| P1 | evals | AC-3 gắn cross-layer nhưng E3b chỉ chạy bài gom lô không bị vòng chạm; không bài máy nào đo điều vòng đổi | Memo hỏng việc tích mà E3b vẫn xanh; AC-3 đọc «đạt hai lớp» trong khi lớp dưới không đo gì | Bài dựng màn đếm số lần vẽ lại | fixed (một phần): bỏ nhãn cross-layer (tích là trạng thái trên máy, không có tác động xuống máy chủ); thêm AC-5 + E3b bài máy kiểm OTich là React.memo có chiều đỏ ghim thông điệp; hành vi tích sau cuộn đo ở E3 năm bước. deferred: bài đếm số lần vẽ lại cần môi trường DOM mà bộ test web (node --test thuần) chưa có — thêm phụ thuộc là ngoài phạm vi hàng vá; E2 là thước bản chậm/bản nhanh trên bản chạy thật |
| P2 | contract | «Chọn hết tích mọi dòng đang hiện» mơ hồ trên lưới cuộn ảo; thiếu ô chọn hết rồi cuộn | Hai người chấm phán khác nhau, hoặc chọn hết chỉ tích dòng đang dựng mà vẫn đạt | Ghi rõ N sau lọc, thêm bước cuộn sau chọn hết | fixed: AC-3 và E3 ghi «Chọn hết» chọn đủ N căn sau lọc (N đọc ở ô đếm), thêm bước cuộn tới dòng thứ vài trăm sau khi chọn hết |
