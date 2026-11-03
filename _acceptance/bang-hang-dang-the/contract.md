---
schema_version: 1
feature: "Đầu khách mở Bảng hàng trên điện thoại, lọc theo nhu cầu khách thành thẻ, giữ lâu một thẻ để chọn nhiều căn"
slug: bang-hang-dang-the
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, docs]
status: approved
approved_by: Manh Phan
approved_at: 2026-11-03
design_doc: _acceptance/bang-hang-dang-the/design.md
---

# Acceptance Contract: bang-hang-dang-the

## Context

Hàng 32 của lộ trình, màn P0 M4 (phủ K2). Bảng hàng trên điện thoại là thẻ ở cùng địa chỉ `/inventory` (Tham chiếu §1
«Một địa chỉ cho một thứ»), thay khối báo «dựng ở mục 32» trong khe điện thoại của khuôn `KhungBangHang`. Khối đích
`product-grid-4` + ngăn lọc `filter-sidebar-5` (`docs/design/vo-va-ia.md` §2). Đọc từ kho trên máy của hàng 13; chỉ căn
trên bảng hàng chung (Tham chiếu §4). Gửi (34) và hồ sơ căn của đầu khách (33) là hàng khác.

Source input: hàng 32 của `docs/plan/lo-trinh.json` · ô cơ hội `_acceptance/bang-hang-dang-the/opportunity.md` (ký
`build` 02/11) · yêu cầu chạm tệp B-1 (hai `page.tsx` của nhóm Bảng hàng, chú thích, một câu ở bản đồ khuôn và vo-va-ia).

## Criteria

- AC-1: Given Đầu khách mẫu ở sàn thử có hàng ở đủ sáu trạng thái, khổ 375×812, When mở `/inventory`, Then thấy danh
  sách thẻ (không khối báo «dựng ở mục 32») chỉ gồm căn Đang bán và Đang giao dịch mà người ấy được thấy, nhóm theo toà
  — mỗi toà một dòng nhóm có tên toà và số căn — mỗi thẻ có ô ảnh bên trái, mã căn, giá dạng «4,65 tỷ» kèm điều kiện phí,
  và ba thông số Diện tích · Phòng ngủ · Hướng; trang không cuộn ngang; ở khổ 1440 vẫn là lưới của hàng 14.
- AC-2: Given danh sách ở AC-1, When nhìn một căn Đang giao dịch và giữ lâu nó, Then thẻ mang huy hiệu «Đang giao dịch»
  và không vào được chế độ chọn (không ô chọn bật được); căn Đang bán chọn được.
- AC-3: Given danh sách ở AC-1, When mở «Lọc» và đặt nhu cầu theo từng mục — Giá từ–đến (tỷ), Phòng ngủ (nhiều), Toà
  (nhiều), Diện tích từ–đến (m²), Hướng (nhiều) (tập mục theo Hỏi-1) — Then «Xem n căn» và danh sách chỉ còn căn khớp
  mọi mục đã đặt (giao của các mục), đếm khớp đáp án đếm độc lập; căn thiếu giá trị của một mục đang lọc (chưa có giá,
  diện tích, hướng) không khớp mục ấy, riêng Phòng ngủ có lựa chọn «Chưa rõ»; lọc không phát sinh yêu cầu mạng nào.
- AC-4: Given bộ lọc đang chạy, When nhìn đầu danh sách, Then mỗi mục đang lọc là một thẻ lọc có chữ đọc được («2–5
  tỷ», «2PN», «Toà A»…); chạm × trên một thẻ lọc chỉ bỏ mục ấy; «Xoá lọc» bỏ hết; lọc không ra căn nào hiện «Không căn
  nào khớp nhu cầu» kèm «Xoá lọc».
- AC-5: Given danh sách thẻ, When giữ một thẻ Đang bán ≥ 500 ms, Then vào chế độ chọn với thẻ ấy đã tích và thanh đầu
  ghi «1 căn đã chọn»; chạm thẻ khác tích/bỏ nó và số đổi theo; «Bỏ chọn» ra khỏi chế độ chọn; giữ rồi dời ngón > 10 px
  hay thả trước 500 ms thì không vào chế độ chọn; giữ lâu trên ảnh hay chữ của thẻ không bật menu, xem trước link hay
  bôi chữ của máy; nút «Chọn» vào chế độ chọn không cần giữ lâu.
- AC-6: Given ngoài chế độ chọn, When chạm một thẻ, Then hồ sơ căn mở toàn màn với địa chỉ
  `?unit=<mã>&toa=<toà>&lan=<lần rao>`; lùi lại thì về bảng thẻ với bộ lọc và vị trí cuộn như trước; trong chế
  độ chọn chạm thẻ không mở hồ sơ, và lần nhả tay ngay sau giữ lâu không mở hồ sơ. Hồ sơ đang có (trước hàng 33) không
  chở trường nào của lớp `source` — đầu khách không thấy tên, số chủ nhà, giá đáy hay ảnh ngăn Nội bộ.
- AC-7: Given căn có ảnh ở ngăn Gửi được (có ảnh bìa), căn chỉ có ảnh Nội bộ, căn không ảnh và căn chưa có mã căn, When
  thẻ của chúng tới màn, Then thẻ thứ nhất hiện ảnh bìa (`…/photos/<id>/thumb`), ba thẻ kia hiện ô ảnh trống — không bao
  giờ là ảnh Nội bộ; căn chưa mã không gọi API ảnh; mất mạng thì ô ảnh trống, thẻ vẫn dùng được. (cross-layer)
- AC-8: Given kho trên máy ở các trạng thái, When mở bảng thẻ, Then đang tải là khung chờ hình thẻ; sàn không có căn Đang
  bán/Đang giao dịch hiện «Chưa có căn nào trên bảng hàng chung»; chưa từng tải và mất mạng hiện «Chưa tải được bảng
  hàng» kèm «Thử lại»; với sàn 5.000 hàng số thẻ đang dựng trong trang (phần tử mang `data-the-can`) nằm trong 1–40 lúc đầu
  và lúc cuối trong khi các dòng nhóm cộng đủ số căn Đang bán + Đang giao dịch của sàn, và cuộn tới được thẻ cuối; sáng và tối đều đọc được.
- AC-9: Given cây sau hàng này, When chạy kiểm kiểu, lint (luật `quy-hang-ui`, mức nợ 0, kiểm chuẩn danh mục, bài quét
  khuôn) và sàn thiết kế M1, Then đều xanh; và khi người duyệt đọc `design/patterns/bang-hang.md`, `docs/design/vo-va-ia.md`,
  `.agents/skills/quy-hang-ui/catalog.md`, `docs/product/tham-chieu.md`, thấy khe điện thoại trình bảng thẻ, hai khối đã
  chuyển thể kèm đổi gì, và §12 có dòng của hàng này. (judgment)

## Đường đo

Ngưỡng của ô cơ hội (đề xuất, chưa có số): «Thời gian khách hỏi → gửi được căn» (Tham chiếu §11) — đo ở hai tuần thử
khi có Gửi (34). Hàng này giao nửa đầu: hỏi → chọn được căn.

- Thước: lọc theo nhu cầu đúng · số từ: E1, E6, E8, E9 · bảo đảm bởi: AC-3, AC-4
- Thước: chọn nhiều bằng giữ lâu · số từ: E3, E4, E10 · bảo đảm bởi: AC-2, AC-5
- Thước: đúng căn trên bảng hàng chung · số từ: E2, E7 · bảo đảm bởi: AC-1, AC-2
- Thước: nhanh trên điện thoại (5.000 hàng, không mạng) · số từ: E8, E13 · bảo đảm bởi: AC-3, AC-8

## Coverage

Quét bằng morphological-scan (preset entity-feature), bốn trục — chi tiết ở `design.md` mục «Quét không gian»:

- Trục A — nấc hàng: Đang bán · Đang giao dịch · bốn nấc không lên bảng chung [thước CE: Tham chiếu §4, cột «Trên bảng
  hàng chung»]
- Trục B — mục lọc: Giá · Phòng ngủ · Toà · Diện tích · Hướng · (Nội thất, Pháp lý, Tầng, Tình trạng sử dụng) [thước CE:
  ngành batdongsan.com.vn — Mức giá, Diện tích, Số phòng ngủ, Hướng nhà, Dự án; RESO `SavedSearch`]
- Trục C — cử chỉ: chạm · giữ lâu · giữ rồi dời/cuộn · bàn phím [thước CE: ngành Material Design 3 — giữ lâu vào chế độ
  chọn]
- Trục D — mạng và ảnh: ảnh bìa · chỉ Nội bộ · không ảnh · chưa mã · mất mạng có kho · chưa tải [thước CE: hàng 18
  (ngăn Gửi được / Nội bộ), hàng 13]
- Core: A ở AC-1, AC-2; B năm mục đầu ở AC-3, AC-4; C ở AC-5, AC-6; D ở AC-7, AC-8; rào và tài liệu AC-9.
- Later: Nội thất, Pháp lý, Tầng, Tình trạng sử dụng làm mục lọc · lưu nhu cầu theo khách (liên hệ khách, hàng 86) ·
  sắp xếp thẻ · tuyến ảnh bìa hàng loạt ở API · góc nhìn đã lưu trên điện thoại.
- Never: thẻ cho căn Chưa đủ để rao, Đã bán, Tạm ngừng, Ngừng hẳn (không thuộc bảng hàng chung).

## Out of scope

- Thanh «n căn · Xem trước · Gửi», xem trước trang khách và mở bảng chia sẻ — hàng 34.
- Hồ sơ căn của đầu khách (phần chủ nhà thay bằng «Liên hệ đầu chủ») — hàng 33; hàng này mở hồ sơ toàn màn đang có.
- Lưu nhu cầu theo khách, góc nhìn đã lưu trên điện thoại.
- Tuyến API trả ảnh bìa hàng loạt (vùng `packages/api` ngoài hàng này).
- Sửa dữ liệu trên điện thoại.

## Notes

- Chạm ngoài vùng: yêu cầu B-1 (hai `page.tsx` của nhóm Bảng hàng — mỗi tệp một dòng; chú thích ở `khung.tsx`,
  `bang-co-ho-so.tsx`; một câu ở `design/patterns/bang-hang.md` — không đụng `nhan_dien`, `ngoai_le`; một dòng và một đoạn
  ở `docs/design/vo-va-ia.md`). `tham-chieu.md`, `catalog.md` chỉ thêm dòng (luật 12 của đợt).
- Luật 33 của đợt: lưới khuôn của kit 2.37.0 có thể báo oan tệp thuộc hai nhóm ở vùng inventory — ghi «báo oan — giới hạn
  kit 2.37.0» trong báo cáo bằng chứng, không sửa bản đồ khuôn để lưới im.
