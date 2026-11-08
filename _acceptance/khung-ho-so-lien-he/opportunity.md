---
schema_version: 1
slug: khung-ho-so-lien-he
feature: Hồ sơ liên hệ nằm trong cùng khung cột của hồ sơ căn (một khung có viền, cuộn riêng, có nút Đóng và Esc), bảng liên hệ giữ đủ cột và tên cột đứng yên khi hồ sơ mở, dòng đang mở được tô — và lưới khuôn bắt được khi cột phụ thiếu khung; mở màn liên hệ thì bảng hiện cùng lúc với màn — trang đầu lấy sẵn ở máy chủ, không chờ thêm trước khi hỏi danh sách.
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-06T00:00:00Z   # ISO UTC — chủ kho yêu cầu kiểm chi tiết liên hệ 06/11 (PR #167, docs/plan/kiem-chi-tiet-lien-he.md); hàng không mã, luật 74 của đợt ghi «đã quyết»
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: khung-ho-so-lien-he
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng khung-ho-so-lien-he của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Hồ sơ liên hệ nằm trong cùng khung cột của hồ sơ căn (một khung có viền, cuộn riêng, có nút Đóng và Esc), bảng liên hệ giữ đủ cột và tên cột đứng yên khi hồ sơ mở, dòng đang mở được tô — và lưới khuôn bắt được khi cột phụ thiếu khung; mở màn liên hệ thì bảng hiện cùng lúc với màn — trang đầu lấy sẵn ở máy chủ, không chờ thêm trước khi hỏi danh sách.

Vì sao: Kiểm chi tiết liên hệ 06/11 (docs/plan/kiem-chi-tiet-lien-he.md, PR #167): hồ sơ liên hệ dùng chung bố cục và ruột hồ sơ nhưng thiếu khung cột của hồ sơ căn (không viền, máy tính không đóng được), bảng mất hai cột khi mở hồ sơ, lint không bắt. Chủ kho yêu cầu kiểm; giám sát xếp hàng vá (việc kỹ thuật, giao diện). Làm trước hàng 86 để đỡ chụp lại. Hàng không mã: đã quyết. Chủ kho báo màn liên hệ chậm: phiên KT đo máy chủ ấm trả lời 0,16–0,24 s, chậm nằm ở trình duyệt (dựng màn xong chờ thêm 0,25 s mới hỏi danh sách; máy và mạng chậm thì bảng hiện sau 4,4 s) — hai vá tốc độ gộp vào hàng này.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: đã đạt «Mở hồ sơ một liên hệ ở 1440: khung có viền, cuộn riêng, Đóng và Esc đóng được; bảng giữ đủ cột, tên cột dính đầu, dòng đang mở tô; ảnh hồ sơ căn không đổi; lưới khuôn đỏ khi gỡ khung khỏi cột phụ; mở /contacts ở chế độ máy chậm và mạng chậm: dòng đầu của bảng có trong trang máy chủ trả về, không lượt hỏi danh sách nào chờ sau khi màn dựng xong» chưa?
- Kết quả nào là SỐNG: Mở hồ sơ một liên hệ ở 1440: khung có viền, cuộn riêng, Đóng và Esc đóng được; bảng giữ đủ cột, tên cột dính đầu, dòng đang mở tô; ảnh hồ sơ căn không đổi; lưới khuôn đỏ khi gỡ khung khỏi cột phụ; mở /contacts ở chế độ máy chậm và mạng chậm: dòng đầu của bảng có trong trang máy chủ trả về, không lượt hỏi danh sách nào chờ sau khi màn dựng xong
- Kết quả nào là CHẾT: chưa đạt «Mở hồ sơ một liên hệ ở 1440: khung có viền, cuộn riêng, Đóng và Esc đóng được; bảng giữ đủ cột, tên cột dính đầu, dòng đang mở tô; ảnh hồ sơ căn không đổi; lưới khuôn đỏ khi gỡ khung khỏi cột phụ; mở /contacts ở chế độ máy chậm và mạng chậm: dòng đầu của bảng có trong trang máy chủ trả về, không lượt hỏi danh sách nào chờ sau khi màn dựng xong» khi hết timebox
- Timebox: hết đợt dau-khach-nhap
