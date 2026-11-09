---
schema_version: 1
slug: va-khuon-v2-moc-tuong-lai
feature: Gói danh mục có mốc đo ở tương lai bị từ chối thay vì đóng băng ảnh chụp của khu với mọi sàn; bộ chặn tên miền nhận đuôi bất kỳ (zalo.me, t.me, .land); mốc đo có phút múi giờ từ 60 trở lên báo sai khuôn thay vì lỗi máy chủ.
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-09T15:00:52Z   # ISO UTC — lúc ghi lệnh signoff khuon-nguon-danh-muc-v2, chủ kho gõ «Ngoài-1: mở hợp đồng mới» ở phiên dãy G (luật 64 của đợt)
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: va-khuon-v2-moc-tuong-lai
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng va-khuon-v2-moc-tuong-lai của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Gói danh mục có mốc đo ở tương lai bị từ chối thay vì đóng băng ảnh chụp của khu với mọi sàn; bộ chặn tên miền nhận đuôi bất kỳ (zalo.me, t.me, .land); mốc đo có phút múi giờ từ 60 trở lên báo sai khuôn thay vì lỗi máy chủ.

Vì sao: Ngoài của khuon-nguon-danh-muc-v2: Ngoài-1 và hai điểm trong hợp đồng còn lại ở lượt chấm 2, chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 09/11. Dãy G.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Gửi gói có mốc đo ở tương lai, tên miền có đuôi lạ, hay phút múi giờ từ 60 trở lên: gói bị từ chối đúng lỗi khuôn và ảnh chụp của khu không đổi» chưa?
- Kết quả nào là SỐNG: [đề xuất] Gửi gói có mốc đo ở tương lai, tên miền có đuôi lạ, hay phút múi giờ từ 60 trở lên: gói bị từ chối đúng lỗi khuôn và ảnh chụp của khu không đổi
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Gửi gói có mốc đo ở tương lai, tên miền có đuôi lạ, hay phút múi giờ từ 60 trở lên: gói bị từ chối đúng lỗi khuôn và ảnh chụp của khu không đổi» khi hết timebox
- Timebox: không áp dụng — hàng vá, đo bằng eval máy, không phiên nghiệm thu riêng
