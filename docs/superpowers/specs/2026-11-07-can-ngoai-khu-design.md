# Căn ngoài khu và hàng trên lô — thiết kế (hàng 76 can-ngoai-khu)

Hàng 76 của lộ trình, mã `LH5` của bản phạm vi mọi loại hình. Gốc quyết định: ADR-0016 quyết định 3, 4, 5 và mục «Hệ
quả» («ADR-0008 đổi hai chỗ khi hàng 76 làm: sự kiện `created` nhận căn ngoài khu… Sự kiện đã ghi không đổi»). Hạng T3
(migration, bảng mới của công ty, luật cách ly).

## Lỗi hôm nay

- Sự kiện `created` bắt buộc `buildingName` (`packages/core/src/listing/events.ts`, khuôn `KHUON.created`), cột
  `listings.building_name` là `not null` (migration 004): nhà phố, biệt thự, đất — trong khu thấp tầng hay ngoài khu —
  không tạo được hàng.
- Không có chỗ giữ căn ngoài khu: danh mục chung chỉ nhận căn từ bên cung cấp qua thoả thuận (ADR-0016 quyết định 4).
- Lõi đã đọc được địa chỉ ra khoá (`docDiaChi`, hàng 75) và lô ra thuộc tính (`lookupLot`, hàng 74), nhưng hàng chưa
  dùng hai thứ ấy.

## Ba cách định danh căn của một hàng

ADR-0016 quyết định 3: một khái niệm «Căn», ba cách định danh. Sự kiện `created` nhận đúng **một** trong ba dạng:

| Dạng | Payload `created` | Ví dụ |
| --- | --- | --- |
| Trong khu, có toà (như nay) | `buildingName` (bắt buộc), `unitNumber` (tuỳ) | căn hộ `[Toà A]` · `A-12.05` |
| Trong khu, không toà — lô | `subdivisionName`, `blockName`, `unitNumber` (cả ba bắt buộc) | khu `[Khu mẫu]` · dãy `LK1` · lô `02` |
| Ngoài khu | `offCompoundUnitId` (mã căn ngoài khu của sàn) | nhà mặt «Đường Mẫu 3» |

- Trộn hai dạng (ví dụ `buildingName` cùng `blockName`), hay thiếu khoá bắt buộc của dạng đã chọn → từ chối, nêu khoá.
- Khuôn vẫn chặt: khoá lạ bị từ chối; khoá lớp `source` (`ownerName`, `ownerPhone`, `floorPrice`, `titleDeedPhoto`) bị từ
  chối với lý do «thông tin chủ nhà không vào hàng» — ở cả ba dạng.
- Dãy không nhét vào `buildingName`: RESO `BuildingName` là toà nhà (ADR-0016 quyết định 3).
- Sự kiện đã ghi không đổi: sự kiện cũ chỉ mang `buildingName` gấp ra đúng bản tính cũ; ba cột mới là `null`.

## Căn ngoài khu là bản ghi của sàn

Bảng mới `off_compound_units` (migration mới, số kế tiếp):

| Cột | Nghĩa |
| --- | --- |
| `id uuid`, `company_id` | căn của sàn nào — luật theo dòng `app.current_company_id()`, `enable` + `force` |
| `property_sub_type` | `Townhouse` · `Single Family Residence` · `Unimproved Land` (RESO nguyên văn; Hỏi-3) |
| `state_or_province_code`, `ward_code` | mã tỉnh, mã xã của danh mục đơn vị hành chính |
| `street_name`, `street_number` | tên đường và số nhà như lõi đọc ra (`streetNumber` có thể trống — Hỏi-2) |
| `unparsed_address` | chữ người gõ |
| `address_key` | khoá địa chỉ của lõi (`maTinh|maXa|tenDuong|soNha`); `null` khi không có số nhà (Hỏi-2) |
| `created_at`, `created_by` | ai tạo, lúc nào |

- **Cùng khoá trong một sàn là một căn**: chỉ mục duy nhất `(company_id, address_key)` khi `address_key` khác `null`. Hai
  sàn cùng địa chỉ là hai căn, không sàn nào thấy căn của sàn kia (ADR-0016 quyết định 4: lộ việc kinh doanh qua ranh giới
  công ty).
- **Tạo căn qua lối riêng**: `POST /api/v1/off-compound-units` nhận `{ address: <chữ địa chỉ>, propertySubType }`. Máy
  chủ đọc địa chỉ bằng `docDiaChi` của lõi; đọc chắc thì tìm căn cùng khoá của sàn, có thì trả căn ấy (200), chưa có thì
  tạo (201); đọc chưa chắc (cần người chọn xã, thiếu tỉnh, xã hay đường, tên chưa có trong danh mục) → 400 nêu phần thiếu
  — không đoán (ADR-0016 quyết định 5). `GET /api/v1/off-compound-units/:id` đọc một căn của sàn.
- **Hàng trỏ căn bằng mã**: `created { offCompoundUnitId }`. Máy chủ kiểm mã là căn của sàn đang làm (luật theo dòng làm
  căn của sàn khác «không có»): mã của sàn khác và mã không tồn tại nhận **cùng một** phản hồi, để sàn không dò được căn
  của sàn khác. Tách căn và lần rao (Tham chiếu §4): địa chỉ là thuộc tính căn, không chép vào sự kiện. Lối tạo căn riêng
  hay gộp vào lệnh tạo hàng: Hỏi-4.
- Loại hình là thuộc tính căn (ADR-0016 quyết định 1): căn ngoài khu mang loại hình ở bảng căn; lô mang loại hình ở danh
  mục; căn hộ là `Condominium` như nay.
- Quyền: tạo và đọc căn ngoài khu theo đúng người có Bảng hàng (`lamViecVoiHang`), như tạo hàng; luật theo dòng của bảng
  đọc `app.works_listings()` như bảng `listings` từ migration 046.
- Lớp dữ liệu: tỉnh, xã, đường, loại hình, số nhà của căn ngoài khu là `shareable_listing` (ADR-0016 «Chỗ chạm bất
  biến»); vòng này không đưa trường nào ra trang khách — luật ẩn số nhà là hàng 80. Không cột nào thuộc lớp `source`.

## Bảng hàng

Ba cột mới trên `listings`: `subdivision_name`, `block_name`, `off_compound_unit_id`. Khoá ngoại **ghép**
`(company_id, off_compound_unit_id) → off_compound_units (company_id, id)`: Postgres kiểm khoá ngoại không qua luật theo
dòng, nên chỉ khoá ghép mới chặn ở tầng dữ liệu một hàng của sàn A trỏ căn của sàn B (mọi lối ghi, không riêng API).
Hàng lô không đối chiếu với danh mục ở vòng này — như hàng có toà hôm nay (`createListing` không tra danh mục); loại hình
của hàng lô đọc từ danh mục khi màn cần (hàng 79). `building_name` thôi `not null`. Ràng buộc kiểm: hàng mang đúng một dạng — có toà; hoặc khu + dãy + lô; hoặc mã căn
ngoài khu. `ListingState` thêm ba khoá tương ứng; `buildingName` thành `string | null`. `STATE_COLUMNS` thêm ba cột, nên
bộ kiểm «xoá trắng bảng rồi gấp lại» (`packages/api/test-db/listings.test.ts`) tự phủ chúng.

Chỗ đọc `buildingName` mà gặp `null` (theo khảo sát mã): ảnh căn, kiểm hàng mở cùng căn khi gắn mã, nhập file, kiểm trùng
lead, trang khách, Đã gửi, bảng hàng trên web. Vòng này chỉ làm chúng **không gãy** với hàng không toà: các phép so theo
toà tự không khớp (`null` không bằng toà nào); chỗ in tên hàng in khu · dãy · lô hay «căn ngoài khu». Hiện đúng theo loại
hình là hàng 79; kiểm trùng theo khoá là hàng 77; luật ẩn là hàng 80.

## Không làm ở vòng này

- **Lên Đang bán cho lô và căn ngoài khu** (Hỏi-1): ảnh căn khoá theo toà + mã (`unit_photos`, migration 012), mà Đang
  bán cần đủ ảnh thật (hàng 23). Hàng không toà dừng ở «Chưa đủ để rao».
- Kiểm trùng lead và hàng mở theo khoá địa chỉ (hàng 77), màn theo loại hình (hàng 79), luật ẩn theo loại hình (hàng 80),
  nhập file thấp tầng (hàng 78).
- Nạp phần thấp tầng của dữ liệu mẫu vào cơ sở dữ liệu (dữ liệu-mẫu-thấp-tầng d-…-9 ghi «chờ hàng 76»): bộ nạp ở
  `packages/db/seed`, cần cả lô trong danh mục cơ sở dữ liệu (bảng `catalog_units` chưa có cột dãy) — đề nghị một hàng
  riêng trước hàng 79.
- Ràng buộc duy nhất «một hàng mở trên một căn» ở tầng dữ liệu — giữ ở ứng dụng như ADR-0026.
- Kiểm lô có trong danh mục khi tạo hàng lô — danh mục lô chỉ có ở dữ liệu mẫu tĩnh; cùng luật với toà hôm nay.

## Đối chiếu ngành

| Năng lực | RESO | KW Command | Lofty | Ta làm gì | Ta cứng — họ cấu hình |
| --- | --- | --- | --- | --- | --- |
| Định danh căn không có toà | `SubdivisionName`, `UnitNumber` («phần của một khu lớn hơn»), `UnparsedAddress`, `StreetNumber`, `StreetName`, `StateOrProvince` ([DD 2.1](https://dd.reso.org/DD2.0/Property/)) | Internal Listing nhập tay — cách nhập địa chỉ: chưa kiểm | Manual Listing — cách nhập địa chỉ: chưa kiểm | Ba dạng định danh; địa chỉ đọc ra khoá ở lõi | không |
| Một địa chỉ một căn | không quy định (listing là bản ghi, không có vật thể căn) | chưa kiểm | chưa kiểm | Một căn mỗi khoá trong một sàn; sàn khác không thấy | không |
| Loại hình được tạo ngoài khu | `PropertySubType` 31 giá trị | chưa kiểm | danh mục loại hình: chưa kiểm | Ba giá trị RESO: `Townhouse`, `Single Family Residence`, `Unimproved Land` | **ta cứng** — Hỏi-3 |

Nguồn KW Command, Lofty: `docs/product/doi-chieu-nganh.md` §6 (Internal Listing, Manual Listing) — phần địa chỉ chưa
tra, ghi «chưa kiểm».

## Hỏi chủ kho (Cổng Phạm vi)

- **Hỏi-1 — Hàng trên lô và căn ngoài khu có lên Đang bán ở vòng này không.** Khuyến nghị: **không** — vòng này tạo và giữ
  hàng ở «Chưa đủ để rao»; mở một hàng riêng «ảnh căn theo mọi loại hình» (ảnh khoá theo căn thay cho toà + mã). Lối khác:
  làm luôn ở vòng này — thêm một migration đổi khoá ảnh và sửa đường ảnh, trang khách, Đã gửi; vòng gấp đôi và chạm bất
  biến 4 (ảnh ra trang khách) trước khi có luật ẩn của hàng 80.
- **Hỏi-2 — Đất, nhà chưa có số nhà.** Khuyến nghị: **tạo được căn không khoá** — căn mang tỉnh, xã, đường, không số nhà;
  không gộp với căn nào theo địa chỉ, màn sau nói rõ «chưa có số nhà, không kiểm trùng theo địa chỉ» (như lead thiếu số
  nhà ở ADR-0016 quyết định 7). Lối khác: bắt buộc đủ số nhà — đất lẻ thường không có số nhà nên không tạo được hàng tới khi
  có số thửa (`LH12`).
- **Hỏi-3 — Tập loại hình tạo được ngoài khu là cứng hay dữ liệu của sàn.** Khuyến nghị: **giữ cứng** ba giá trị RESO,
  lý do «nghĩa chuẩn để so giữa các sàn» của ADR-0022; sàn đặt nhãn riêng neo vào ba giá trị ấy (cách gọi riêng, hàng 45).
  Lối khác: sàn tự chọn tập con — thêm một khoá cấu hình và một dòng ở sổ điểm biến thiên; chưa sàn nào cần.
- **Hỏi-4 — Tạo căn ngoài khu qua lối riêng hay ngay trong lệnh tạo hàng.** Khuyến nghị: **lối riêng** —
  `POST /api/v1/off-compound-units` tìm hay tạo căn theo khoá, rồi `POST /api/v1/listings { offCompoundUnitId }`. Lý do:
  thân lệnh tạo hàng hôm nay chính là payload sự kiện được ghi (khuôn chặt, ghi nguyên), căn dùng lại được cho lead ngoài
  khu (hàng 77) và nhiều lần rao. Lối khác: lệnh tạo hàng nhận chữ địa chỉ, máy chủ tìm hay tạo căn rồi ghi sự kiện chỉ mang
  mã — một lời gọi, nhưng thân lệnh khác payload sự kiện và lead phải có lối tạo căn riêng sau.
