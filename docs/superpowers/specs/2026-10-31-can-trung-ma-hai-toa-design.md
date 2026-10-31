# Căn trùng mã ở hai toà cùng dự án — thiết kế

Hàng 63 của lộ trình (dãy D, đợt dau-chu-dong-vao), đứng trên hàng 9 (`danh-muc-go-ma-can`). Mở từ Ngoài-4 của hàng 9:
chủ kho chọn «mở hợp đồng mới», xử cùng lúc nạp danh mục thật (hàng 10). Hồ sơ: `_acceptance/can-trung-ma-hai-toa/`.

## Ý định

Đầu chủ gõ mã căn. Danh mục thật có dự án mà hai toà cùng có căn mã `1206` (mã danh mục không mang toà). Hôm nay lõi tra
dựng chỉ mục một-mã-một-căn theo từng dự án (`buildCatalogIndex`, `Map<mã, căn>`), nên căn của toà nạp sau đè căn toà
nạp trước: tra `1206` ra `found` với thuộc tính căn toà B dù người đang nói về căn toà A — điền lặng lẽ sai. Đó là hỏng
nặng nhất của «gõ mã căn là đủ thông tin» (Tham chiếu §1): ô tự điền sai mà không báo.

Thành công: mã trùng ở hai toà cho ra «nhiều căn» kèm tên từng toà để người chọn; mã kèm toà đã chọn cho ra đúng một
căn; mọi ca của hàng 9 vẫn xanh.

## Mục tiêu / không làm / phản mục tiêu

- Làm: chỉ mục giữ MỌI căn cùng mã; tra trùng trong một dự án ra `ambiguous` (cùng kết cục với trùng giữa hai dự án của
  hàng 9) với ứng viên mang `buildingName` của toà mình; tham số chọn toà ở lõi và ở đường API; toà lạ báo riêng (404);
  lệnh đo tỉ lệ tự điền không coi «nhiều căn» là điền đoán.
- Không làm: màn chọn toà (hàng có màn); đọc tên toà từ chuỗi gõ (`A1 1206`); bảng danh mục, nạp danh mục thật, gói
  Invest (hàng 10); gợi ý mã gần đúng.
- Phản mục tiêu: một lần tra trả `found` khi danh mục có hơn một căn khớp; thêm khoá mới vào thân trả về (hàng 9 AC-9
  khoá đúng tập mười trường).

## Cách làm (căn cứ ở sổ quyết định; Hỏi-1 và Hỏi-2 soạn theo khuyến nghị, chờ chủ kho)

1. **Chỉ mục nhiều căn mỗi mã.** `ProjectIndex.units` đổi thành `Map<mã chuẩn hoá, UnitAttributes[]>`; dựng chỉ mục chỉ
   nối thêm, không đè. Tra gom mọi căn khớp ở mọi dự án (đã lọc) và mọi toà.
2. **Kết cục.** Một căn → `found`. Hơn một → `ambiguous`, ứng viên sắp theo `projectKey` rồi `buildingName` (tất định).
   Không thêm kết cục «nhiều căn trong toà» riêng: `ambiguous` của hàng 9 đã nghĩa là «không chọn hộ» và đã có trong
   OpenAPI; tách kết cục là đổi khuôn API mà không thêm nghĩa. Nhãn sản phẩm của `ambiguous` là «nhiều căn».
3. **Chọn toà.** `lookupUnit(index, input, projectKey?, building?)`; đường API nhận `?building=`. Khớp `buildingName`
   hoặc `buildingKey` sau chuẩn hoá (`normalizeCode`: NFKC, bỏ khoảng hai đầu, chữ hoa) — ứng viên mang `buildingName`
   nên giao diện gửi lại đúng chữ ấy; mã danh mục dùng `buildingKey` (`A` trong `A-12.06`) nên khớp cả khoá. Lọc toà áp
   sau lọc dự án; không chọn dự án mà tên toà có ở hai dự án thì vẫn có thể ra `ambiguous` giữa hai dự án — đúng nghĩa.
4. **Toà có thật, mã không có ở toà ấy.** Dự án có cách đọc: như hôm nay, `not_in_catalog` kèm mã chuẩn đã đọc. Dự án
   không cách đọc mà có chọn toà: `not_in_catalog` kèm dự án và chuỗi đã chuẩn hoá — người đã nói rõ toà, nên báo
   «chưa có trong danh mục», không báo «không đọc được». Không chọn toà thì giữ đúng hành vi hàng 9.
5. **Toà lạ.** `building` không khớp toà nào trong các dự án đang xét → kết cục `unknown_building` (lõi), API 404
   `not-found` — cùng khuôn với `unknown_project` của hàng 9.
6. **Thân trả về không đổi khuôn.** Mười trường của `UNIT_ATTRIBUTE_FIELDS`; ứng viên phân biệt bằng `buildingName` và
   `upi`. Không thêm `buildingKey`.
7. **Lệnh đo tỉ lệ** (`do-ti-le.ts`): `ambiguous` là hụt (không đúng) nhưng không phải điền đoán — kết quả liệt ứng viên
   để người chọn, không điền. Dòng in thêm « · nhiều căn N» chỉ khi N > 0, nên trên dữ liệu mẫu dòng in giữ nguyên chữ.

## Ràng buộc

- Bất biến (AGENTS.md): (1) cách ly — không bảng mới, đường vẫn qua `resolveCompany`; (2) chủ nhà — thân chỉ lớp
  `catalog` (hàng 9 AC-9 giữ xanh); (3), (4) không chạm.
- Vùng của hàng: `packages/core/src/catalog/**`, `packages/api/src/catalog/**`, hồ sơ; thêm (yêu cầu D-1 đã duyệt) một
  tệp kiểm mới ở `packages/api/test-db/catalog/` và một dòng sổ quyết định ở `docs/product/tham-chieu.md` §12.
- Danh mục mẫu của hàng 5 không có ca trùng: ca kiểm dựng danh mục thử viết tay trong tệp kiểm (nhãn `[Mẫu]`).

## Để lại cho người dựng

Tên ca kiểm, cách viết fixture, chỗ đặt hàm lọc toà.

## Đặc tả UX

Bỏ — hàng này không có màn (entry `descope` «bỏ đặc-tả-UX» trong sổ). Màn chọn toà dùng ứng viên `ambiguous` khi hàng có
màn nối ô «Gõ mã căn».
