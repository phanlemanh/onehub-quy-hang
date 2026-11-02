---
schema_version: 1
slug: doi-dau-chu-hang-loat
feature: "Trưởng nhóm tích nhiều căn trên Bảng hàng rồi đổi đầu chủ một lần: chọn từ danh sách thành viên mang vai Đầu chủ của sàn, hộp hỏi kể đủ căn và người giữ cũ, đổi đầu chủ của hàng thì đổi luôn người giữ liên hệ chủ nhà theo luật một chủ một đầu chủ, hoàn tác được"
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-02T09:55:25Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 89
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 89 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Trưởng nhóm tích nhiều căn trên Bảng hàng rồi đổi đầu chủ một lần: chọn từ danh sách thành viên mang vai Đầu chủ của sàn, hộp hỏi kể đủ căn và người giữ cũ, đổi đầu chủ của hàng thì đổi luôn người giữ liên hệ chủ nhà theo luật một chủ một đầu chủ, hoàn tác được

Vì sao: Chủ kho duyệt tách ở Cổng Phạm vi hàng 16 (Hỏi-1): đổi đầu chủ hàng loạt cần API mới — hàng chưa mang đầu chủ, trưởng nhóm chưa lấy được danh sách thành viên, web chưa biết vai; đứng sau 85 vì đổi đầu chủ phải đổi người giữ liên hệ chủ nhà (Hỏi-3 hàng 85)

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Trưởng nhóm đổi đầu chủ cho 5 căn của 2 chủ nhà: mọi hàng của 2 chủ ấy và 2 liên hệ cùng sang đầu chủ mới; đầu chủ không phải trưởng nhóm không thấy lệnh; hoàn tác trả đủ người giữ cũ; bộ kiểm cách ly xanh» chưa?
- Kết quả nào là SỐNG: [đề xuất] Trưởng nhóm đổi đầu chủ cho 5 căn của 2 chủ nhà: mọi hàng của 2 chủ ấy và 2 liên hệ cùng sang đầu chủ mới; đầu chủ không phải trưởng nhóm không thấy lệnh; hoàn tác trả đủ người giữ cũ; bộ kiểm cách ly xanh
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Trưởng nhóm đổi đầu chủ cho 5 căn của 2 chủ nhà: mọi hàng của 2 chủ ấy và 2 liên hệ cùng sang đầu chủ mới; đầu chủ không phải trưởng nhóm không thấy lệnh; hoàn tác trả đủ người giữ cũ; bộ kiểm cách ly xanh» khi hết timebox
- Timebox: …
