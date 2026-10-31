---
loai: dot
ma: [LH1, LH2, LH3, LH4, LH5, LH6, LH7, LH8, LH9, LH10, LH11, LH12, LH13]
nguon: [raw/2026-10-31-moi-loai-hinh/phien-31-10.md]
cap_nhat: 2026-10-31
---
# Đợt moi-loai-hinh-3110 — mọi loại hình bất động sản

Chủ kho, Cổng Phạm vi hàng 24 (31/10): các loại hình ngoài căn hộ là nợ phải giải, không giải thì không triển khai
được. Cùng ngày chủ kho bỏ chữ «dự án», gọi theo RESO: khu `SubdivisionName`, toà `BuildingName`, căn `UnitNumber`,
loại hình `PropertyType` / `PropertySubType`. Thiết kế đề xuất ở ADR-0016.

## Điều rút ra

- Lõi hiện chỉ biết căn hộ trong toà thuộc một dự án có danh mục; sự kiện tạo hàng bắt buộc tên toà, nên nhà phố, biệt
  thự, đất không tạo được hàng nào.
- Sàn thật có bảng hàng thấp tầng (ghi chép 28/10): mã lô theo khu · dãy · lô; thuộc tính là diện tích đất, số tầng,
  mặt tiền, đường trước nhà.
- RESO DD 2.1 có đủ trường; bốn giá trị loại hình dùng ở bản đầu đều có trong bảng giá trị RESO. Nhãn riêng của sàn
  («Shophouse», «Liền kề») neo vào giá trị chuẩn bằng cách gọi riêng — không thêm giá trị vào lõi.
- Nhà ngoài khu không có danh mục: định danh bằng địa chỉ chuẩn; căn ngoài khu thuộc sàn, không vào danh mục chung, vì
  danh mục chung dựng từ lead sẽ lộ cho sàn khác biết ai đang giữ nhà nào.
- Địa giới đổi từ 1/7/2025 (bỏ cấp huyện, gộp phường): bảng hàng cũ còn tên phường cũ, nên bộ đọc địa chỉ phải đổi tên
  cũ ra tên mới và hỏi người khi một phường cũ tách vào nhiều phường mới.
- Hai tuần thử là một khu căn hộ (Tham chiếu §1) — các hàng của đợt không chặn hai tuần thử, chặn việc mở cho sàn có
  bảng hàng thấp tầng. Đổi tên «dự án» nên đi trước hàng 10 và 24 để không dựng thêm trên tên cũ.

## Mã

- LH1 — đổi «dự án» thành khu ở lõi, API, tài liệu; căn mang loại hình
- LH2 — bộ trường theo loại hình là dữ liệu của lõi
- LH3 — khu thấp tầng: khu → dãy → lô, đọc và tra mã lô
- LH4 — địa chỉ chuẩn hoá và khoá địa chỉ, tên phường cũ ra phường mới
- LH5 — hàng trên căn ngoài khu của sàn; sự kiện tạo hàng không còn bắt buộc toà
- LH6 — kiểm trùng theo khoá địa chỉ
- LH7 — ô nhận lead nhận loại hình, mã lô, địa chỉ
- LH8 — nhập file bảng hàng thấp tầng
- LH9 — bảng hàng và hồ sơ hiện đúng trường theo loại hình
- LH10 — luật ẩn theo loại hình trên trang khách
- LH11 — danh mục Invest mang khu thấp tầng (chờ)
- LH12 — số thửa làm khoá trùng thứ hai (chờ)
- LH13 — hàng thương mại và cho thuê (chờ)
