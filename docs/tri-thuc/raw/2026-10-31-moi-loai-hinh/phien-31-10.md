# Phiên 31/10/2026 — thiết kế mọi loại hình bất động sản

Phiên thiết kế do phiên giám sát đợt dau-chu-dong-vao giao (Claude Code, MacBook Pro), 31/10/2026. Chỉ tài liệu, không
mã. Kết quả: ADR-0016, `docs/plan/pham-vi-moi-loai-hinh.md`, hàng 72–80 và ba mục chờ điều kiện của lộ trình.

## Lời chủ kho (nguyên văn, Cổng Phạm vi hàng 24, 31/10)

- «những hiểu đây là phần nợ cần giải quyết các loại hình bất động sản khác, vì nếu không giải thì sẽ không thể triển
  khai được. Báo với Giám sát đưa phần này vào hạng mục và lập lộ trình bổ sung cho nó.»
- Cùng ngày (giám sát chuyển): bỏ chữ «dự án», gọi theo RESO DD 2.1 — khu chứa căn `SubdivisionName`, toà
  `BuildingName`, căn `UnitNumber`, loại hình `PropertyType`/`PropertySubType`.

## Đã kiểm trên mã (main 5e20a48)

- Danh mục lõi (`packages/core/src/catalog/types.ts`) chỉ có một hình: dự án (`projectKey`, `projectName`,
  `complexName`) → toà (`buildingKey`, `buildingName`) → căn (`upi`, `unitNumber`, `stack`, `floor`, `livingArea`,
  `bedroomsTotal`, `directionFaces`). Không có loại hình, không có địa chỉ, không có diện tích đất.
- Cách đọc mã (`code-rule.ts`) chỉ có dạng toà · tầng · trục (`A-12.06`); một dòng cho dự án mẫu.
- Khuôn cấp vào của Invest (`packages/connect/src/catalog-feed.ts`) cùng hình, phiên bản 0, `.strict()`.
- Sự kiện `created` của hàng bắt buộc `buildingName` (`packages/core/src/listing/events.ts`), cột
  `listings.building_name text not null` (migration 004): **nhà không có toà không tạo được hàng**.
- Tra mã căn và đo tỉ lệ tự điền (`packages/api/src/catalog/`) đọc danh mục mẫu trong bộ nhớ; chưa có bảng danh mục.
- Hàng 24 (ô nhận lead, vùng `packages/core/src/dedupe/**`) và hàng 10 (nhận danh mục Invest) chưa có nhánh mã; hàng 63
  (căn trùng mã hai toà) ở PR #42 sửa `lookup.ts`.
- Ghi chép 28/10 (`docs/product/ghi-chep/2026-10-28-ghi-nho.md`): bảng hàng thật của hai sàn — một bảng căn hộ thứ cấp,
  một bảng thấp tầng; «Mã căn là toạ độ, mỗi dự án một dạng. Căn hộ: toà · tầng · trục. Thấp tầng: phân khu · dãy · lô»;
  «Loại hình quyết định cách xem vị trí và bộ trường… Thấp tầng: bản đồ phân lô, mức hoàn thiện, thang máy».
- Tham chiếu §1: người dùng đầu tiên là chính đội, một dự án căn hộ thứ cấp; bản đầu xong khi một đội bỏ hẳn Sheet cho
  một dự án trong hai tuần.

## Đã kiểm trên trang RESO (31/10)

- dd.reso.org DD 2.1, tài nguyên Property: có đủ `SubdivisionName`, `BuildingName`, `UnitNumber`, `UnparsedAddress`,
  `StreetNumber`, `StreetName`, `StreetSuffix`, `City`, `StateOrProvince`, `PostalCode`, `Country`, `CountyOrParish`,
  `ParcelNumber`, `LivingArea`, `StoriesTotal`, `Levels`, `PropertyType`, `PropertySubType`, `Latitude`, `Longitude`,
  `DirectionFaces`, `BedroomsTotal`, `MLSAreaMajor`, `UniversalPropertyId`, `LotSizeArea`, `LotSizeUnits`,
  `LotSizeSquareFeet`, `FrontageLength`.
- Định nghĩa (DD 2.1): SubdivisionName — khu dân cư, cộng đồng, khu phức hợp hay dự án của chủ đầu tư; BuildingName — tên
  toà nhà hay khu văn phòng; UnitNumber — số căn hay phần của một toà hay khu lớn hơn, đứng sau tên đường; UnparsedAddress
  — địa chỉ đầy đủ viết một dòng; ParcelNumber — số định danh thửa đất, thường do cơ quan địa phương cấp; StreetNumber —
  phần số nhà, có nơi gồm cả chữ.
- Bảng giá trị (trang DD 2.0): PropertyType có 9 giá trị — Business Opportunity, Commercial Lease, Commercial Sale, Farm,
  Land, Manufactured In Park, Residential, Residential Income, Residential Lease. PropertySubType có 31 giá trị, trong đó
  Condominium, Townhouse, Single Family Residence, Unimproved Land, Apartment, Mixed Use, Office, Retail. Chưa đọc bảng
  giá trị ở trang DD 2.1 — đối chiếu lại khi viết lõi.

## Đã kiểm về địa giới (31/10, báo chí và trang pháp luật — chưa đọc văn bản gốc)

- Từ 1/7/2025 chính quyền địa phương hai cấp: cấp huyện chấm dứt; 34 đơn vị cấp tỉnh (28 tỉnh, 6 thành phố trực thuộc
  trung ương); cấp xã còn 3.321 đơn vị gồm xã, phường, đặc khu.
- Hệ quả cho địa chỉ: bảng hàng cũ và lời chủ nhà còn viết quận/huyện và tên phường cũ; phải đọc được cả hai.

## Nguồn

- https://dd.reso.org/DD2.1/Property/
- https://dd.reso.org/DD2.0/lookups/PropertySubType/
- https://dd.reso.org/DD2.0/lookups/PropertyType/
- https://hatinh.gov.vn/vi/bai-viet/cap-huyen-ket-thuc-hoat-dong-tu-17
- https://luatvietnam.vn/hanh-chinh/52-thi-xa-dung-hoat-dong-tu-01-07-2025-khi-bo-cap-huyen-570-101982-article.html
