# Khu và loại hình RESO — thiết kế

Hàng 72 của lộ trình (dãy D, đợt dau-chu-dong-vao), T3, đứng trên hàng 9 và 63, đi trước hàng 10 và 24. Gốc:
ADR-0016 quyết định 1 (loại hình theo RESO ở căn), 2 (bộ trường theo loại hình là dữ liệu của lõi), 8 (đổi tên «dự án»
thành khu, một lần). Hồ sơ: `_acceptance/khu-va-loai-hinh/`.

## Ý định

Chủ kho 31/10 bỏ chữ «dự án», gọi theo RESO DD 2.1. Danh mục hiện gọi khu chứa căn là `projectKey`/`projectName` ở 12
tệp mã và dữ liệu mẫu, và chưa biết căn thuộc loại hình nào. Hàng 10 (khuôn Invest v1) và hàng 24 sắp dựng trên danh
mục; đổi bây giờ thì không ai phải đổi lại. Sau hàng này: khu là `subdivisionKey`/`subdivisionName` ở lõi, API, dữ
liệu mẫu, Tham chiếu, CONTEXT; mỗi căn mang `propertyType`/`propertySubType` giá trị RESO nguyên văn; một bảng dữ liệu
của lõi nói loại hình nào dùng trường nào, và lõi từ chối trường không thuộc loại hình của căn.

## Mục tiêu / không làm / phản mục tiêu

- Làm: đổi tên trọn ở lõi tra, đường API (`?project=` → `?subdivision=`, tên cũ bị từ chối 400), lệnh đo tỉ lệ, dữ
  liệu mẫu (sinh lại tất định), ca kiểm của hàng 9 và 63 (giữ tên ca, đổi khoá); thêm hai trường loại hình vào căn danh
  mục và vào kết quả tra (mười hai trường, lớp `catalog`); bảng `PROPERTY_SUBTYPE_FIELDS` bốn loại; hàm
  `unitFieldErrors` và `catalogFieldErrors`; sửa dòng «Căn», «Khu» của CONTEXT và các dòng của Tham chiếu.
- Không làm: khuôn Invest (`packages/connect`) — hàng 10 dựng v1 thẳng tên mới; dãy · lô (`blockName`), địa chỉ chuẩn,
  căn ngoài khu, kiểm trùng theo địa chỉ (hàng 73–80); mức đủ theo loại hình (hàng 76, Hỏi-2 chỉ ghi quyết); luật ẩn
  theo loại hình (hàng 80, Hỏi-3 chỉ ghi quyết); cột cơ sở dữ liệu (danh mục chưa có bảng — hàng 10).
- Phản mục tiêu: hai bộ tên cho một khái niệm; một căn mẫu không có loại hình; lõi nhận im một trường sai loại hình.

## Cách làm (căn cứ ở sổ quyết định)

1. **Đổi tên** (quyết định 8): `CatalogProjectData` → `CatalogSubdivisionData` (`subdivisionKey`, `subdivisionName`,
   `complexName` giữ, `buildings`), `CatalogData.projects` → `subdivisions`; `UnitCodeRule.projectKey` →
   `subdivisionKey`; `UnitAttributes.projectKey/projectName` → `subdivisionKey/subdivisionName`; tham số
   `lookupUnit(index, input, subdivisionKey?, building?)`; kết cục `unknown_project` → `unknown_subdivision`. Query của
   đường tra khai `.strict()`: khoá lạ (gồm `project`) → 400.
2. **Loại hình ở căn** (quyết định 1): `CatalogUnitData` thêm `propertyType`, `propertySubType` (bắt buộc). Bốn cặp RESO:
   `Residential/Condominium`, `Residential/Townhouse`, `Residential/Single Family Residence`, `Land/Unimproved Land`.
   Dữ liệu mẫu: 180 căn `Residential/Condominium`. Kết quả tra mang hai trường (`UNIT_ATTRIBUTE_FIELDS` thành 12, đều lớp
   `catalog`).
3. **Bảng trường theo loại hình** (quyết định 2): `PROPERTY_SUBTYPE_FIELDS: Record<subType, { propertyType, fields }>` —
   Condominium: `buildingName, floor, stack, livingArea, bedroomsTotal, directionFaces`; Townhouse và Single Family
   Residence: `lotSizeArea, livingArea, storiesTotal, frontageLength, bedroomsTotal, directionFaces, accessRoadWidth`;
   Unimproved Land: `lotSizeArea, frontageLength, accessRoadWidth`. Trường bắt buộc khi Sẵn sàng bán và mục của mức đủ để
   hàng 76 (bảng mở thêm khoá, không đổi hình).
4. **Lõi từ chối trường sai loại hình**: `unitFieldErrors(unit)` trả danh sách `{ field, subType }` cho mỗi trường có
   giá trị (khác `null`) mà loại hình không dùng, và lỗi khi cặp `propertyType/propertySubType` không có trong bảng.
   `catalogFieldErrors(catalog)` gom cho cả danh mục; `buildCatalogIndex` ném lỗi gọi tên căn và trường khi danh mục có
   lỗi — danh mục sai không lên được, không lặng lẽ.

## Chỗ khác đang dùng tên cũ (giám sát nhắc, kiểm 31/10)

- `main` (27b5964): 12 tệp trong vùng hàng này (lõi tra, đường API, lệnh đo, ca kiểm, dữ liệu mẫu) + khuôn v0 ở
  `packages/connect` (hàng 10).
- Nhánh dãy B `claude/dcdv-b-0f1aee` (hàng 14): `packages/api/src/catalog/doc-ca-danh-muc.ts` và tệp kiểm của nó — đường
  `GET /api/v1/catalog` trả cây dự án → toà → căn. Dãy B gộp sau thì tự đổi theo tên mới (giám sát đã báo).
- Nhánh dãy L `claude/dcdv-l-09d703` (hàng 24): chỉ sổ quyết định nhắc tên cũ, mã chưa dùng.

## Ràng buộc

- Bất biến chạm: (2) — kết quả tra vẫn chỉ lớp `catalog` (12 trường); (1), (3), (4) không chạm.
- Tên cũ không giữ (ADR-0007, khuôn v0 chưa ai ghim). Ca kiểm của hàng 9 và 63 giữ nguyên tên ca để hồ sơ đã ký đọc
  được; đổi khoá trong thân ca.

## Hỏi chủ kho (ADR-0016, Cổng Phạm vi hàng này)

- Hỏi-1 nhãn khu trên màn — khuyến nghị «Khu» cho `SubdivisionName`, «Vùng phụ trách» cho `member_zone`.
- Hỏi-2 mức đủ của đất — khuyến nghị bốn mục (ghi vào ADR, làm ở hàng 76).
- Hỏi-3 khách riêng thấy gì với nhà ngoài khu — khuyến nghị tên đường và xã (ghi vào ADR, làm ở hàng 80).

## Để lại cho người dựng

Tên hàm phụ, thứ tự sửa tệp, cách sinh lại dữ liệu mẫu.

## Đặc tả UX

Bỏ — hàng này không dựng màn; nhãn «Vùng phụ trách» (nếu Hỏi-1 theo khuyến nghị) là đổi chữ ở một màn có sẵn.
