# Thiết kế — Gõ mã lô thấp tầng (hàng 74)

Ngày 05/11/2026 · dãy X đợt dau-khach-nhap · hạng T2 (vùng `packages/core/src/catalog/**`, `packages/api/src/catalog/**`)
· Cổng Đáng: chủ kho «Build tất cả.» 05/11.

## Vấn đề

ADR-0016 quyết định 3: khu thấp tầng không có toà — danh mục là khu → dãy → lô, mã lô ở `UnitNumber`, cấp hai mang
`blockName`. Bộ tra mã hiện có (hàng 9) chỉ biết khu → toà → căn. Đầu chủ gõ «lk1 02», «LK1.04» hay «lô 6 dãy BT1» phải ra
đúng lô và tự điền khu, dãy, loại hình, diện tích đất, số tầng, mặt tiền như gõ mã căn hộ; mã đọc được mà danh mục chưa
có thì báo rõ, không đoán.

## Vật sinh ra

| Chỗ | Là gì |
| --- | --- |
| `packages/core/src/catalog/types.ts` | Khu có thêm `blocks?` — dãy (`blockKey`, `blockName`, nhãn sàn tuỳ chọn `nhanSan`) chứa lô; `buildings` không đổi |
| `packages/core/src/catalog/lot-code.ts` | Cách đọc mã lô là dữ liệu (`LOT_CODE_RULES`), hàm `readLotCode`, `checkLotRuleAgainstSubdivision` |
| `packages/core/src/catalog/lot-lookup.ts` | `buildLotIndex`, `lookupLot` — năm kết cục như tra căn hộ; `LOT_ATTRIBUTE_FIELDS` và lớp dữ liệu từng trường |
| `packages/api/src/catalog/lots.ts` | `registerLotRoutes(api, deps, danhMucLo)` — đường `GET /api/v1/catalog/lots/{code}`, cùng hàm vào cửa (đăng nhập, sàn đang làm) với đường tra căn; `registerCatalogRoutes` gọi nó nên `app.ts` không đổi |

Bộ tra căn hộ (`lookupUnit`, `UnitAttributes`, đường `/catalog/units`) **không đổi một byte**: mười bốn tệp ở
`apps/web` và nhiều gói đọc khuôn căn hộ; đổi `buildingName` thành có-thể-rỗng hay thêm kết cục mới vào khuôn ấy là đổi
mặt ngoài vùng của hàng.

### Cách đọc mã lô

Cách đọc là dữ liệu như `UNIT_CODE_RULES` của hàng 9: mỗi khu một dòng `{ subdivisionKey, example, blockPattern,
lotWidth, template }`. Khu mẫu: `blockPattern` `[A-Z]{2}\d`, `lotWidth` 2, `template` `{d}-{l}` → `LK1-01`.

`readLotCode(rule, chữ)`:
1. Chuẩn hoá: NFKC, bỏ dấu, chữ hoa, gọn khoảng trắng; bỏ chữ «LÔ»/«LO», «DÃY»/«DAY», «MÃ».
2. Dãy rồi lô: `dãy SEP* lô` khi có dấu phân cách (`-` `.` `/` `_` khoảng trắng) thì lô được thiếu số 0 đầu (`LK1-1`);
   viết liền thì lô đúng `lotWidth` chữ số (`LK101`).
3. Lô rồi dãy (sau khi bỏ chữ «lô», «dãy»): «lô 6 dãy BT1» → `BT1-06`.
4. Không khớp → `null`.

Khu chưa có cách đọc → chỉ khớp đúng mã danh mục sau chuẩn hoá (không đoán cách tách), như căn hộ.

### Kết cục tra

`lookupLot(index, chữ, subdivisionKey?)`:

| Kết cục | Khi | Trả |
| --- | --- | --- |
| `found` | đúng một lô | thuộc tính lô |
| `not_in_catalog` | đọc được, danh mục không có lô ấy | khu, dãy, mã chuẩn đã đọc, và dãy có trong danh mục hay không |
| `unreadable` | không cách đọc nào đọc được | mẫu mã từng khu |
| `ambiguous` | mã khớp lô ở hơn một khu | mọi ứng viên, không chọn hộ |
| `unknown_subdivision` | khu được chọn không có | — |

Thuộc tính lô (`LOT_ATTRIBUTE_FIELDS`, đều lớp `catalog`, trần `external`): `subdivisionKey`, `subdivisionName`,
`blockKey`, `blockName`, `blockLabel` (nhãn sàn của dãy, như «Shophouse»), `unitNumber`, `upi`, `propertyType`,
`propertySubType`, `lotSizeArea`, `storiesTotal`, `frontageLength`, `accessRoadWidth`, `livingArea`, `bedroomsTotal`,
`directionFaces`. Không giá, không chủ nhà, không ghi chú. Trường loại hình không dùng là `null` (bảng loại hình hàng 72).

### Danh mục lô ở API

Danh mục thật chưa có dãy (Invest chưa cấp — mục chờ LH11; lô của sàn — hàng 76). **Hỏi-1** (việc người dùng thật thấy):
- **Máy khuyên:** đường lô mặc định KHÔNG phục vụ lô mẫu — danh mục lô mặc định rỗng, tra trả `unreadable` với danh sách khu
  rỗng («danh mục chưa có khu thấp tầng»). Bộ kiểm truyền khu thấp tầng mẫu của hàng 73 tường minh qua `registerLotRoutes`.
- **Lối khác:** phục vụ khu thấp tầng mẫu ở mọi môi trường như danh mục căn hộ mẫu (Hỏi-3 hàng 9) — thử được ngay trên bản
  thật, đổi lại người dùng thật thấy lô [Mẫu] và có thể tự điền thuộc tính của một lô không tồn tại.
API chưa có biến phân biệt môi trường thật/thử, nên lối «mẫu chỉ ở môi trường thử» đòi thêm cấu hình ngoài vùng hàng.

### Khu chưa có cách đọc

Khu không có dòng cách đọc vẫn tham gia tra: chữ gõ khớp mã danh mục sau chuẩn hoá, HOẶC khớp một mã chuẩn mà cách đọc của
khu khác đọc ra từ chữ ấy. Nhờ vậy hai khu cùng có `LK1-02` ra «nhiều lô» với mọi kiểu viết, không chọn hộ khu có cách đọc.

### Mã gần trúng

Mẫu đọc neo hai đầu: «LK1-02A», «LK1-020», «LK1-102», «LK12-01», «LK1-02-1», «LK1-02 xyz» không bao giờ ra lô LK1-02 —
chúng ra `unreadable` (hay `not_in_catalog` khi đọc được trọn thành một mã khác).

## Đối chiếu ngành (ADR-0022)

| | Quỹ hàng (hàng 74) | RESO DD 2.1 | Bảng hàng Excel của sàn | Cổng tin đăng trong nước |
| --- | --- | --- | --- | --- |
| Định danh lô | khu · dãy · lô (`SubdivisionName`, `blockName`, `UnitNumber`) | `SubdivisionName`, `UnitNumber`; không có cấp dãy | cột «Mã lô» tự do | ô mã căn tự do |
| Cách viết mã | mọi kiểu, cách đọc là dữ liệu của khu | — | mỗi người một kiểu | không đọc |
| Mã chưa có | báo «chưa có trong danh mục», nói dãy có hay không | — | — | — |
| Tự điền | khu, dãy, loại hình, diện tích đất, số tầng, mặt tiền | `LotSizeArea`, `StoriesTotal`, `FrontageLength` | tay | chọn dự án → phân khu |

Tên trường theo RESO (`LotSizeArea`, `StoriesTotal`, `FrontageLength`); dãy là đặc trưng Việt Nam (ADR-0016).

## Kiểm

Bộ thử của hàng 73: 24 ô mã lô của file bảng hàng bẩn (đọc bằng `doc-xlsx.py`, đáp án ở `dap-an-thap-tang.json`) và 42 lô
của khu thấp tầng mẫu, cộng ma trận kiểu viết viết trước. Bộ kiểm lõi ở `packages/core/src/catalog/*.test.ts`, bộ kiểm
đường API ở `packages/api/src/catalog/*.test.ts` với bộ đăng nhập và kho giả (không cần Postgres) — như ca 401 sẵn có.
Mỗi phép đo có đối chứng dương và phá thử trên bản sao với thông điệp ghim.

## Không làm

Ô gõ mã lô trên màn (ô nhận lead, hồ sơ căn — hàng 77, LH7); lô của sàn trong cơ sở dữ liệu (hàng 76); khuôn
`CatalogFeed` có cấp dãy (LH11, `packages/connect`); đổi bộ tra căn hộ hay đường `/catalog/units`.
