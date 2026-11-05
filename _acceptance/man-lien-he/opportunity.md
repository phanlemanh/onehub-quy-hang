---
schema_version: 1
slug: man-lien-he
feature: "Người trong sàn mở màn «Liên hệ»: danh sách liên hệ lọc theo loại (Chủ bán · Chủ cho thuê · Người mua · Người thuê) và hồ sơ một người — các số theo luật lớp nguồn (số chủ nhà không hiện cho người không được đọc), các căn, lead, nhu cầu khách và Lần gửi gắn với người ấy — mỗi vai chỉ thấy phần quyền của mình."
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-05T03:49:58Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 103
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 103 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Người trong sàn mở màn «Liên hệ»: danh sách liên hệ lọc theo loại (Chủ bán · Chủ cho thuê · Người mua · Người thuê) và hồ sơ một người — các số theo luật lớp nguồn (số chủ nhà không hiện cho người không được đọc), các căn, lead, nhu cầu khách và Lần gửi gắn với người ấy — mỗi vai chỉ thấy phần quyền của mình.

Vì sao: Chủ kho 05/11 ở phiên giám sát, nguyên văn «Mở màn liên hệ», sau khi giám sát báo hàng 85 chỉ dựng phần dữ liệu và luật, chưa có màn «Liên hệ» riêng (luật đợt 58). Đọc mới đặt ở packages/api/src/contacts/read/**, không sửa tệp có sẵn của contacts (hàng 89 đang sửa).

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: đầu chủ và trưởng nhóm có dùng màn Liên hệ thay danh bạ và Excel để tìm một người và thấy đủ cơ hội của họ không?
- Kết quả nào là SỐNG: trong phiên nghiệm thu, mỗi người dự (ít nhất một đầu chủ, một trưởng nhóm) tìm ra một chủ bằng tên hay số và gọi được trong tối đa ba chạm; chủ có từ hai căn hiện đúng một hồ sơ đủ cơ hội.
- Kết quả nào là CHẾT: người dự phải quay lại danh bạ hay Excel để tìm số, hoặc vai không được đọc vẫn thấy số chủ, hoặc hồ sơ thiếu cơ hội hay hàng của người ấy.
- Timebox: một vòng, đo ở phiên nghiệm thu ngay sau khi gộp.
