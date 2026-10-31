---
slug: nang-kit-2-36-0
at: 2026-10-31T01:26:00Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Ranh giới «T3 vẫn của người» của máy tự định tuyến không được đo; máy suy T2 cho việc đổi rào; chiều xanh của E7 chỉ là «không in chữ tắt» | Việc đổi rào bị suy T2, máy tự ghi giới hạn mà chủ kho không được hỏi; lệnh lỗi mà E7 vẫn xanh | Ghim mã thoát và dòng nguyên văn; ca ranh giới trên hồ sơ T3 | fixed: AC-7 thêm vế hồ sơ T3 không được định tuyến và đường rào vào t3_paths; E7 ghim mã thoát, dòng tắt nguyên văn, ca «không chạm hồ sơ T3» |
| P1 | evals | Không ca nào ghim bản kit dùng để đo là 2.36.0 | Biến môi trường hay sổ cài trỏ 2.35.0, bài đo chấm bằng kit cũ | Ca đọc số phiên bản của gốc kit, đối chứng gốc giả 2.35.0; nhật ký job gate trên PR | fixed: AC-1 thêm vế; E1 ca «kit dùng để đo là 2.36.0»; E1b đòi dòng lấy kit trong nhật ký CI |
| P2 | design | Lời «gói nen-2 không vướng luật chặn» chưa đo | PR #15 bị chặn ngay lúc mở đợt nen-2 | Gộp thử nhánh PR #15 vào bản sao, chạy luật chặn và lưới | deferred: chạy một lần ở bước thực thi, ghi vào thiết kế §6 |
| P2 | evals | E9 thiếu tệp workflow trong inputs; vế tiếng sản phẩm không có trong AC-9 | Tài liệu lệch workflow mà hội đồng không thấy | Thêm ci.yml, bỏ vế thừa | fixed: inputs thêm .github/workflows/ci.yml, bỏ vế tiếng sản phẩm |
| P2 | contract | Ba mục Out of scope không có dòng sổ descope | Cổng 1 không thấy lý do và giá của ba mục bỏ | Mỗi mục một dòng descope | fixed: thêm ba dòng descope |
