---
schema_version: 1
feature: Nút chính «Ghi cuộc gọi» của hồ sơ căn điện thoại chỉ hiện cho người vào được màn ghi cuộc gọi
slug: va-nut-ghi-cuoc-goi-truong-nhom
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
design_doc: docs/superpowers/specs/2026-11-08-va-nut-ghi-cuoc-goi-truong-nhom-design.md
---

# Acceptance Contract: va-nut-ghi-cuoc-goi-truong-nhom

## Context

Hàng vá của dãy H (đợt dau-khach-nhap), mở từ Ngoài-1/2 của hàng `ho-so-dien-thoai-product-detail-5`: chủ kho chọn «mở
hợp đồng mới» ở Cổng Bằng chứng 05/11. Nút chính dính đáy của hồ sơ căn điện thoại suy từ cờ `hoiDauChu`, nên trưởng nhóm
thuần (thấy nguồn, không có vai Đầu chủ) thấy «Ghi cuộc gọi», trong khi màn ghi cuộc gọi chặn người không có vai Đầu chủ
(quyết định goi-ep-gia-dot-hai Hỏi-7). T2: không migration; đổi nhỏ ở lõi quyền (`packages/core/src/access`, không phải
trần lớp dữ liệu).

## Criteria

- AC-1: Given lớp phủ hồ sơ của lõi, When tính cho từng ô của «Bảng người xem» viết trước (section dưới Criteria), Then cờ `ghiCuocGoi` đúng khi
  và chỉ khi người ấy thấy nguồn VÀ vào được màn ghi cuộc gọi theo luật `vaoManCuocGoi` của lõi (người mang vai Đầu chủ);
  bốn cờ cũ không đổi. «Giữ căn» là có vai Đầu chủ và là người được gán căn; ở cột «chưa ai giữ» người có vai Đầu chủ
  không giữ ai cả.

- AC-2: Given hồ sơ căn trên điện thoại (dưới 768 px), When dựng nút chính dính đáy, Then nút đúng cột «nút» của «Bảng
  người xem» (thấy nguồn mà không `ghiCuocGoi` → không nút chính, theo Hỏi-1); căn chưa có mã → không nút. Màn đọc cờ, không rẽ
  theo tên vai — mã nguồn phần hồ sơ không đọc danh sách vai.
- AC-3 (cross-layer): Given màn ghi cuộc gọi `/units/call`, When một người mở nó, Then trang cho vào hay trả không tìm thấy
  theo CÙNG luật `vaoManCuocGoi` của lõi mà nút đọc; với mọi người xem trong «Bảng người xem», hễ hồ sơ hiện «Ghi cuộc gọi» thì
  trang cho người ấy vào — không còn nút dẫn tới trang không có.
- AC-4: Given bản đang chạy với dữ liệu mẫu ở 375×812, When trưởng nhóm thuần, đầu chủ giữ căn, đầu khách và trưởng nhóm
  có vai Đầu chủ mở cùng hồ sơ căn mẫu, Then ảnh thấy: trưởng nhóm thuần thấy phần nguồn của hồ sơ mà không có nút chính
  dính đáy; đầu chủ có «Ghi cuộc gọi», bấm vào mở màn ghi cuộc gọi (không phải trang không tìm thấy); trưởng nhóm có vai
  Đầu chủ cũng vậy với căn người khác giữ; đầu khách có «Hỏi đầu chủ»; trưởng nhóm thuần gõ thẳng đường màn ghi cuộc gọi
  vẫn bị chặn.
- AC-5: Given mã của hàng, When chạy lint, kiểm kiểu và chấm khuôn nhóm `ho-so-can`, Then không lỗi, không lệch khuôn mới.

## Bảng người xem

| Người xem (vai) | Căn có người giữ: thấy nguồn · ghiCuocGoi · nút | Căn chưa ai giữ: thấy nguồn · ghiCuocGoi · nút |
|---|---|---|
| Đầu khách (buyer_agent) | không · không · Hỏi đầu chủ | không · không · Hỏi đầu chủ |
| Đầu chủ giữ căn (listing_agent) | có · có · Ghi cuộc gọi | không · không · Hỏi đầu chủ |
| Đầu chủ không giữ (listing_agent) | không · không · Hỏi đầu chủ | không · không · Hỏi đầu chủ |
| Trưởng nhóm thuần (team_lead) | có · không · không nút | có · không · không nút |
| Trưởng nhóm có vai Đầu chủ (team_lead + listing_agent) | có · có · Ghi cuộc gọi | có · có · Ghi cuộc gọi |
| Quản trị sàn (company_admin) | không · không · Hỏi đầu chủ | không · không · Hỏi đầu chủ |

Chỉ hai ô của trưởng nhóm thuần đổi so với trước hàng này (trước: «Ghi cuộc gọi»).

## Out of scope

- Cấp cho trưởng nhóm màn ghi cuộc gọi — đã chốt ở goi-ep-gia-dot-hai Hỏi-7 (cần vai Đầu chủ).
- Nút chính thay thế cho trưởng nhóm thuần (vd «Gán đầu chủ») — việc riêng nếu chủ kho muốn.
- Cách B «quản trị sàn mang đủ bốn vai» (Tham chiếu 06/11, hàng `chu-san-du-vai`) chưa dựng: bảng AC-1 theo vai hôm nay.
- Thân cột trên máy tính — không có nút «Ghi cuộc gọi», không đổi.

## Coverage

Quét bằng bảng vai × giữ căn × có mã (preset entity-feature, rút gọn vì hàng vá một cờ):
- Vai người xem: đầu khách · đầu chủ giữ · đầu chủ không giữ · trưởng nhóm thuần · trưởng nhóm có vai Đầu chủ · quản trị
  sàn → AC-1, AC-2, AC-3.
- Căn: có người giữ · chưa ai giữ · chưa có mã → AC-1, AC-2.
- Lớp: lõi · nút trên màn · trang ghi cuộc gọi · bản đang chạy → AC-1, AC-2, AC-3, AC-4.
Thước đủ: mỗi ô vai × giữ căn là một ô ma trận viết trước. Later: nút thay thế cho trưởng nhóm thuần → Out of scope.

## Notes

- Hỏi-1 (Cổng Phạm vi): trưởng nhóm thuần — ẩn hẳn nút chính (khuyến nghị) hay nút mờ kèm lý do. Hợp đồng viết
  theo khuyến nghị.

- Đổi điều đang đúng: không — luật quyền giữ nguyên, chỉ nút thôi lệch với trang.
