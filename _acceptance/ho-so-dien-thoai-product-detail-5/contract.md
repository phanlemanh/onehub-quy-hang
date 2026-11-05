---
schema_version: 1
feature: Hồ sơ căn trên điện thoại dựng theo khối product-detail-5 — ảnh lớn đầu màn, tên và thông số, hộp giá, một nút chính dính đáy theo vai
slug: ho-so-dien-thoai-product-detail-5
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
design_doc: _acceptance/ho-so-dien-thoai-product-detail-5/design.md
approved_by: Manh Phan
approved_at: 2026-11-05
---

# Acceptance Contract: ho-so-dien-thoai-product-detail-5

## Context

Hàng `ho-so-dien-thoai-product-detail-5` của lộ trình (dãy H, đợt `dau-khach-nhap`), T2. Đứng trên hàng 33 (lớp phủ quyền
của hồ sơ) và là nền cho hàng 40 (đổi giá nhanh) và 41 (chụp ảnh). Ô cơ hội: `opportunity.md` (chủ kho «Ghi build» 05/11).
Khối đích: `docs/design/vo-va-ia.md` §2 dòng «Hồ sơ căn, điện thoại» — `product-detail-5`. Lối dựng chốt ở Cổng Phạm vi
theo trang ba lối (ADR-0019, `ba-loi/index.html`).

## Criteria

- AC-1: Given một người mở hồ sơ một căn, When màn rộng dưới 768 px (toàn màn `/units/<mã>` hay trong Bảng hàng thẻ), Then
  hồ sơ dựng bằng thân điện thoại mới; When màn rộng từ 768 px, Then cột cạnh Bảng hàng, cột phải của Hôm nay và toàn màn
  giữ nguyên như hôm nay. Mốc khổ là đúng hàm mà Hôm nay điện thoại dùng.
- AC-2: Given thân điện thoại, When căn có dữ liệu, Then các khối đứng đúng thứ tự: ảnh lớn (lướt ngang có điểm dừng) → mã
  căn · toà kèm trạng thái và hàng thông số Diện tích · Phòng ngủ · Hướng → hộp giá (giá rao, phí, «xác nhận X ngày trước»)
  → các mục còn lại. Ở 375×812 ảnh, tên và giá nằm trong màn đầu tiên không cần cuộn.
- AC-3: Given cùng một người và cùng một căn, When so thân điện thoại với thân cột hôm nay, Then mọi mục và mọi nút thân cột
  trình cho người ấy vẫn có trên thân điện thoại: mức đủ, Thuộc tính căn (chữ khoá, «Báo sai»), lần rao đang xem/đang mở,
  Các lần rao (chọn được), Lịch sử, mục Ảnh, ô gắn mã cho căn chưa có mã, «Mở toàn màn»/«Đóng hồ sơ» nơi thân cột có.
- AC-4 (cross-layer): Given người không thấy phần nguồn (đầu khách), When mở thân điện thoại, Then không có ngăn Nội bộ, không ổ khoá,
  không số hay tên chủ nhà, không giá đáy; quyết định ẩn đọc từ cờ của lõi (`lopPhuHoSo`) và dữ liệu API trả — giao diện
  không tự lọc trường (bất biến 2, 4); dữ liệu trình duyệt nhận cho người ấy cũng không chứa các trường nguồn.
- AC-5: Given thân điện thoại, When người cuộn, Then đúng một nút chính dính đáy khung nhìn, kín bề ngang, vùng chạm từ 44
  px: người không thấy nguồn → nút hỏi đầu chủ (chỉ mở bảng chia sẻ của máy, bất biến 3); người thấy nguồn → «Ghi cuộc gọi»
  tới `/units/call?hang=<id>`; căn chưa có mã → không nút chính.
- AC-6: Given thân điện thoại, When đang tải / không thấy căn / tải lỗi / mất mạng / căn chưa có ảnh, Then lần lượt: khung
  chờ đúng dáng ảnh + tên + hộp giá; «Không thấy căn» kèm đường về Bảng hàng; lời lỗi kèm «Thử lại»; bản đã có trong kho trên máy (bộ đồng bộ, luật KH-hs-tren-may);
  khung ảnh trống có lời — không khối nào trống trơn.
- AC-7: Given mã của thân điện thoại, When chạy lint, bộ kiểm giao diện và lưới khuôn, Then thân đi qua khuôn `KhungHoSoCan`
  của nhóm `ho-so-can` (một Frame, không Card, không Frame lồng Frame), không mã màu thô, và nhóm khuôn ghi nhận tệp mới.
- AC-8: Given bản đang chạy với căn mẫu, When mở ở 375×812 cho đầu khách và cho đầu chủ giữ căn, rồi ở 1440×900, Then ảnh
  thấy: ảnh lớn đầu màn, tên + thông số + giá trong màn đầu, nút chính dính đáy đúng vai, đầu khách không có Nội bộ, máy
  tính vẫn là cột hôm nay; mỗi cảnh một ảnh.

## Out of scope

- Đổi giá hay trạng thái nhanh trên điện thoại (hàng 40) — chỉ chừa chỗ, không dựng.
- Chụp ảnh khi đi xem nhà và tải lên ở nền (hàng 41).
- Đổi bố cục hồ sơ trên máy tính (cột cạnh Bảng hàng, cột phải Hôm nay, toàn màn từ 768 px).
- Cài khối ReUI Pro mới — theo Hỏi-1b (máy khuyên dùng lại bản chuyển thể `product-detail-5` của trang khách).
- Đổi lớp phủ quyền hay luật ẩn ở lõi (hàng 33, 31).

## Coverage

Quét không gian tiêu chí bốn trục (skill `morphological-scan`, preset entity-feature):
- Khổ: dưới 768 · từ 768 → AC-1, AC-8.
- Vai theo lớp phủ: không thấy nguồn · thấy nguồn giữ căn · thấy nguồn không giữ (trưởng nhóm) → AC-3, AC-4, AC-5.
- Trạng thái dữ liệu: có đủ · đang tải · không thấy · lỗi · mất mạng · chưa ảnh · chưa mã → AC-2, AC-6, AC-5.
- Khối của màn: ảnh · tên + thông số · giá · mục còn lại · nút chính → AC-2, AC-3, AC-5.
- Khuôn và luật giao diện → AC-7.
Thước đủ (CE): mỗi ô vai × mục của AC-3 là một ô ma trận viết trước trong bài kiểm; mỗi trạng thái của AC-6 một ô.
Later/Never: đổi giá nhanh (40), chụp ảnh (41) → Out of scope.

## Notes

- Lựa chọn máy đã quyết: `design.md` §4; sổ quyết định dòng S1.
