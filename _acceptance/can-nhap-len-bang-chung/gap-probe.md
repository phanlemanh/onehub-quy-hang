---
slug: can-nhap-len-bang-chung
at: 2026-11-07T23:52:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Không AC đo việc điền tiếp mục thiếu sau lần nhập | Lệnh điền pháp lý bị từ chối hay đẩy căn về Chưa đủ để rao, mọi eval vẫn xanh | AC cross-layer: ba lệnh sau lần nhập 200, căn vẫn Active, mức đủ bớt dần | fixed: thêm AC-10 và E10, trục «Sau lần nhập» ở Coverage |
| P1 | contract | Ngưỡng «lead giữ điều kiện» không có ca chạm lối lead | Lối lead lọt cửa vào nhập, E5 vẫn xanh | Căn tạo từ lead qua lối chuyển thật rồi lên Active: 400 legalStatus | fixed: AC-5 và E5 thêm căn tạo từ lead qua POST leads/{id}/listing; trục Cửa lên thêm «căn tạo từ lead» |
| P1 | evals | E7 lắp dữ kiện Hôm nay bằng tay | Bộ nạp thật lọc khác, căn của B không hiện, E7 vẫn xanh | Dựng Hôm nay bằng đường màn dùng, phiên A và B | fixed: E7 chuyển sang bộ kiểm web trên API thật, dùng canHomNay của màn Hôm nay + chiaNhom; E9 thêm khung đầu chủ B |
| P2 | evals | E9 không đo tóm tắt và tông dòng | Dòng Đang bán có lý do bị tô lỗi, đầu chủ tưởng chưa lên bảng | Tóm tắt 2 lên Đang bán, 0 Chưa đủ; tông dòng không lỗi | fixed: E9 và AC-9 thêm tóm tắt lần nhập và tông dòng |
| P2 | contract | Sửa ca E2c của hồ sơ đã ký mà không eval nào chạy lại | Ca bị xoá hẳn, lời hứa «lý do không nêu ảnh» mất đo | Eval chạy đích danh ca E2c | fixed: E2 chạy lại ca E2c của lan-nhap.test.ts (lý do không nêu ảnh, căn Active); Notes của hợp đồng nêu việc sửa trên thẻ |
