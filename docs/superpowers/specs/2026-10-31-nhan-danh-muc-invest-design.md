# Nhận danh mục Invest — thiết kế

Hàng 10 của lộ trình (dãy D, đợt dau-chu-dong-vao), T3, đứng trên hàng 9. Gốc: ADR-0017 §5 của kho `onehub-invest`
(«Invest đẩy, không ai chọc vào Invest»; «khuôn do loại kết nối định nghĩa, nằm ở kho Quỹ hàng»; «tắt là dừng chảy
ngay»). Hồ sơ: `_acceptance/nhan-danh-muc-invest/`.

## Ý định

Danh mục căn (khu → toà → trục → căn) là thứ duy nhất dùng chung giữa các sàn (Tham chiếu §4, §12 dòng 28/10). Hôm nay
nó chỉ là một gói mẫu nạp vào bộ nhớ; khuôn cấp vào ở phiên bản 0 (nháp, chưa ai ghim; hàng 72 đã đổi tên khoá của nó
sang khu `subdivisions` mà chưa nâng số phiên bản — hàng 72 Ngoài-4, Ngoài-5). Hàng này dựng **cửa nhận**:
gói danh mục theo khuôn phiên bản 1 đi vào một **vùng danh mục dùng chung** trong cơ sở dữ liệu, chỉ khi có thoả thuận
«nguồn danh mục» đang bật; gói sai khuôn hay thoả thuận tắt bị từ chối và không một dòng nào được ghi.

## Mục tiêu / không làm / phản mục tiêu

- Làm:
  1. Khuôn v1 ở `packages/connect`: tên theo RESO DD 2.1 như chủ kho chốt 31/10 và lõi đã dùng sau hàng 72 — khu chứa
     căn `subdivisionKey`/`subdivisionName` (RESO SubdivisionName), toà `buildingKey`/`buildingName`, căn `unitNumber`,
     loại hình `propertyType` / `propertySubType`, cùng bốn trường của nhà thấp tầng và đất mà bảng loại hình của lõi đã
     khai (`lotSizeArea`, `storiesTotal`, `frontageLength`, `accessRoadWidth`); giữ `.strict()` ở mọi cấp; **nâng
     `schemaVersion` từ 0 lên 1** — khuôn v0 đã đổi tên khoá ở hàng 72 mà chưa nâng số (hàng 72 Ngoài-4). Bỏ v0 (chưa
     phát hành, chưa ai ghim). Ghi ADR-0015.
  2. Vùng danh mục dùng chung: migration 010 — bảng khu và bảng căn, khoá căn là UPI; bật và ép luật theo dòng trong
     cùng migration: mọi sàn đọc được; ghi chỉ khi công ty đang đặt nằm trong danh sách công ty được nền tin ghi danh mục
     (bảng `catalog_trusted_companies`, vai app chỉ đọc — Hỏi-1) VÀ có thoả thuận **loại `catalog_source`**, chiều vào,
     đang bật, trong hiệu lực, có lớp `catalog` — chặn ở cơ sở dữ liệu, không chỉ ở API. Vì sao cần danh sách: luật theo dòng của
     `agreements` cho mọi sàn tự tạo thoả thuận của mình, nên «có thoả thuận» một mình để một sàn ghi đè danh mục của
     mọi sàn.
  3. Cửa nhận: `POST /api/v1/catalog/feeds` — quản trị sàn của công ty giữ thoả thuận gửi gói; API kiểm khuôn, kiểm
     loại hình từng căn bằng bảng loại hình của lõi (`catalogFieldErrors`), chọn thoả thuận **đúng loại `catalog_source`
     và chiều `inbound`** rồi mới hỏi `mayFlow(agreement, "catalog")` — `mayFlow` không xét loại, và với chiều vào nó
     trả ok cho mọi loại có lớp `catalog`, nên một thoả thuận `lead_source` hay `company_api` có lớp ấy sẽ lọt nếu chỉ
     hỏi `mayFlow` (phản biện P0). Rồi ghi một giao dịch, upsert theo UPI và khoá khu.
  4. Chạy lại cùng gói không nhân đôi; gói đổi thuộc tính một căn thì căn ấy cập nhật.
- Không làm: đổi đường tra (`GET /catalog/units`) sang đọc vùng dùng chung (Hỏi-3); khoá máy cho Invest tự đẩy (Hỏi-2); số thị trường,
  tin rao (khuôn v1 chỉ mang danh mục); phía Invest đẩy gói thật (luật đợt 22: ngoài kho).
- Phản mục tiêu: gói hỏng ghi được một phần; thoả thuận tắt mà vẫn ghi; một trường của lớp khác `catalog` vào vùng
  dùng chung; một sàn ghi thẳng vào vùng dùng chung không qua thoả thuận.

## Cách làm

- **Khuôn v1** (`catalog-feed.ts`): `{ schemaVersion: 1, provider, measuredAt, subdivisions: [{ subdivisionKey,
  subdivisionName, complexName, buildings: [{ buildingKey, buildingName, units: [{ upi, unitNumber, stack, floor,
  livingArea, bedroomsTotal, directionFaces, propertyType, propertySubType, lotSizeArea?, storiesTotal?,
  frontageLength?, accessRoadWidth? }] }] }] }` — đúng hình `CatalogData` của lõi sau hàng 72. Hàm
  `parseCatalogFeed(raw)` trả `{ ok, feed }` hoặc `{ ok: false, errors: [{ path, message }] }` — đường khoá chỉ đúng
  chỗ hỏng. UPI trùng trong một gói là lỗi khuôn (không đoán căn nào thắng). `packages/connect` không phụ thuộc lõi
  (thêm phụ thuộc là đổi `package-lock.json`), nên cặp loại hình và trường theo loại do API kiểm bằng lõi ngay sau khuôn,
  cùng một lỗi 422 với đường khoá của căn.
- **Bảng** (`010_danh_muc_dung_chung.sql`): `catalog_subdivisions (subdivision_key pk, subdivision_name, provider,
  complex_name, measured_at, agreement_id, updated_at)`, `catalog_units (upi pk, subdivision_key fk, building_key,
  building_name, unit_number, stack, floor, living_area, bedrooms_total, direction_faces, property_type,
  property_sub_type, lot_size_area, stories_total, frontage_length, access_road_width, provider, measured_at,
  agreement_id, updated_at)`. Không cột nào của lớp khác; giữ `building_key` để hàng kế tách hai toà trùng tên (hàng
  63 Ngoài-1). Luật theo dòng: `select using (true)` cho
  `quy_hang_app`; `insert`/`update` với `check` qua hàm `app.catalog_source_active(agreement_id)` (công ty đang đặt có
  trong `catalog_trusted_companies`; thoả thuận thuộc công ty ấy, đúng loại `catalog_source`, `inbound`, `active`,
  trong hiệu lực, có `catalog`). Không cấp `delete`. `catalog_trusted_companies (company_id pk)` bật luật theo dòng, vai app chỉ
  `select`; thêm công ty là việc của chủ bảng (vận hành), không qua API.
- **Đường** (`packages/api/src/catalog/feeds.ts`): vào như mọi đường (phiên → sàn đang làm), vai quản trị sàn (Hỏi-2);
  sàn không có trong danh sách tin hoặc không có thoả thuận đang bật → 403 `agreement-inactive`; khuôn sai → 422 `invalid-feed` kèm danh sách đường
  khoá; ghi trong một giao dịch dưới `withCompany`; trả số khu, toà, căn đã nhận và số căn mới / cập nhật.
- **Không sửa `agreements.ts`**: `mayFlow` đã cho chiều vào khi thoả thuận còn hiệu lực và có lớp; phần loại và chiều
  do API và hàm của cơ sở dữ liệu kiểm thêm.
- **Mặc định của sàn**: hàng này không đặt con số mặc định nào của sàn (hiệu lực và lớp do thoả thuận mang). Nếu lúc
  dựng cần một trần (vd cỡ gói tối đa), khai một hằng có tên trong lõi với chú thích «mặc định của sàn», không rải
  trong thân hàm hay SQL (luật thường trực của giám sát, 31/10).

## Ràng buộc

- Bất biến chạm: (1) cách ly — bảng mới bật và ép luật theo dòng cùng migration; vùng dùng chung đọc chung là chủ ý
  (Tham chiếu: «chỉ danh mục là dùng chung»), ghi qua thoả thuận; (2) chủ nhà — khuôn và bảng chỉ có lớp `catalog`;
  (3), (4) không chạm.
- Luật đợt 22: khuôn `.strict()`, nâng phiên bản ghi ADR, nhận qua một thoả thuận, không đọc cơ sở dữ liệu của Invest.
- Migration 010 và ADR-0015 do giám sát giữ chỗ (luật 24).

## Để lại cho người dựng

Tên ca kiểm, cách chia hàm trong `feeds.ts`, chỉ mục phụ của bảng.

## Đặc tả UX

Bỏ — hàng này không có màn (sổ: «bỏ đặc-tả-UX»).
