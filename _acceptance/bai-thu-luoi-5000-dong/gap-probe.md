---
slug: bai-thu-luoi-5000-dong
at: 2026-10-30T08:15:00Z
verdict: findings
p0: 3
p1: 2
p2: 0
---

# Phản biện context sạch — bai-thu-luoi-5000-dong

Tác tử tươi (`feature-loop:cham-doc`) đọc đúng năm tệp: design.md, contract.md, evals.yaml, decisions.jsonl,
opportunity.md. Kho chưa có bài học xuyên hồ sơ nên không có input thứ năm.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Ngưỡng số (khung hình, giảm tốc CPU, độ trễ gõ) là ngưỡng sản phẩm mà sổ ghi máy quyết | ReUI đạt 30 khung/giây ở 4×, ADR chọn ReUI, máy văn phòng thật giật ở hai tuần thử trên một ngưỡng không ai ký | Một dòng sổ nguồn người + khối Ngưỡng cần ký trong hợp đồng | human-gate1: thành Hỏi-1 (khối «Ngưỡng cần ký» trong hợp đồng); kho_dao giữ false vì không chạm ship, xoá dữ liệu hay cam kết ngoài kho — nhưng lựa chọn lên người |
| P0 | design | Lối chết của chỗ đặt mã thử nêu không chặt; nhánh không gộp có thể bị dọn | Nhánh bị xoá, commit bị dọn, lệnh đo lại đỏ vĩnh viễn | Ghim bằng tag, lệnh đo lại báo lỗi gọi tên tag | fixed: ghim bằng tag thu/bai-thu-luoi-5000-dong-v1, do-lai thoát 2 gọi tên tag; dòng sổ mới nêu lối chết thật (ứng dụng tự đứng đo đường dựng khác sản phẩm) |
| P0 | contract | Hợp đồng đặt sẵn đáp án ReUI đạt; nhánh Glide không có AC | ReUI trượt, E2–E6 đỏ dù bài thử đã trả lời câu hỏi; Glide đo mà không eval | Hai nhánh kết quả, AC cho Glide, tách E2 khỏi ngưỡng | fixed: AC-6 thoát 0 khi bản chậm trượt và (ReUI đạt hoặc ReUI trượt và Glide đã đo); AC-9 + E10 cho Glide; E2 dùng lệnh riêng chỉ kiểm cỡ dữ liệu và sha; E3–E5 đo lưới được chọn |
| P1 | design | Mốc đầu của gõ/dán chưa định nghĩa; ô cuối khi dán có thể ngoài khung nhìn; E8 thiếu dán | Phím xếp hàng, mốc lúc hàm chạy cho số đẹp giả; đối chứng đỏ vẫn trượt nên không lộ | Mốc event.timeStamp, ô đang hiện, đối chứng đỏ riêng cho mốc đầu, thêm bước dán | fixed: mốc đầu event.timeStamp; mốc cuối dán là khung có mọi ô đang hiện mang giá trị mới, góc cuối kiểm sau khi cuộn tới; chế độ ?cham=phim; E8 thêm bước dán |
| P1 | design | Số đo thời gian không tách nhiễu máy khỏi lưới | Máy bận, E3 đỏ hoặc ADR đổi stack vì nhiễu | Hiệu chuẩn mỗi lượt, loại lượt không hợp lệ | fixed: hiệu chuẩn trang rỗng p95 ≤ 17,5 ms và bài đo JS ≤ 1,2× mốc, ghi loadavg, lượt không hợp lệ đo lại tối đa ba lần; E3–E5 đòi may.hieu_chuan_hop_le |
