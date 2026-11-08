# Khuôn sự kiện «xác nhận danh mục» v1 và trần theo loại kết nối — thiết kế

Ngày: 2026-11-08 · Hàng 95 `khuon-xac-nhan-danh-muc` (XN2, đợt xac-nhan-danh-muc-0311) · Dãy G · Hạng **T3**
(`packages/connect/**`, `packages/core/src/agreements.ts`, `packages/db/**`).

Nguồn: issue #94 việc 2 · ADR-0017 §6 sửa đổi 03/11 (kho onehub-invest) · bản thiết kế phía Invest
`docs/superpowers/specs/2026-11-03-danh-ba-xac-nhan-toan-quoc-design.md` §6 · `docs/plan/pham-vi-xac-nhan-danh-muc.md`
mục «Hàng 95» · Tham chiếu §3 dòng «Chiều ngược «xác nhận danh mục»», §12 dòng 03/11 · ô cơ hội
`_acceptance/khuon-xac-nhan-danh-muc/opportunity.md` (Cổng Đáng: build, 05/11).

## 1. Vấn đề

Invest (DN6) cần một khuôn có số phiên bản để kéo lời xác nhận căn của môi giới các sàn. Hôm nay kho chỉ có khuôn chiều
vào (`catalog-feed.ts`, hàng 10). Trần lớp dữ liệu chỉ chặn lớp nguồn ở mọi thoả thuận; lớp giao dịch (giá chốt) vẫn mở
được bằng điều khoản riêng, và chưa có loại kết nối nào ràng «chỉ lớp danh mục». Một sự kiện phát từ công việc của sàn còn
mang tín hiệu «sàn này đang làm hàng căn này» — phải giảm ngay ở khuôn.

Hàng này dựng **khuôn và luật**, chưa dựng đường chảy: hộp thư đi và API kéo là hàng 97, token máy hàng 96, bật / tắt theo
sàn hàng 98, sinh sự kiện từ công việc hàng 101. Không màn hình nào đổi.

## 2. Bất biến chạm

- **Bất biến 2 (chủ nhà không rời công ty)**: khuôn không có chỗ cho chủ nhà, số, giá đáy, ảnh sổ; thoả thuận loại mới
  không mang được lớp nguồn (đã chặn) và nay cũng không mang được mọi lớp ngoài danh mục.
- **Bất biến 4 (phần nội bộ không ra ngoài)**: sự kiện chỉ dựng được bằng hàm của lõi, từ bảng lớp của luật ẩn
  (`LOP_TRUONG`), không ẩn ở chỗ gọi.
- **Bất biến 1 (cách ly)**: không bảng mới. Ràng buộc mới đặt trên bảng `agreements` đã bật luật theo dòng.
- Bất biến 3 không chạm (máy với máy theo thoả thuận, không phải kênh nhắn tin — trang tri thức của đợt).

## 3. Thiết kế

### 3.1 Loại kết nối `catalog_confirmation` — «Xác nhận danh mục»

- Thêm vào `CONNECTION_KINDS` (`packages/core/src/agreements.ts`).
- **Trần theo loại** — bảng `KIND_LIMITS` cạnh `CONNECTION_KINDS`: loại nào khai trong bảng thì chỉ được một chiều và một
  tập lớp. `catalog_confirmation`: chiều `outbound`, lớp đúng `["catalog"]`, không điều khoản riêng.
  - `agreementErrors`: thoả thuận loại này chiều vào, có lớp ngoài danh mục, hay `specialTerms: true` → lỗi nêu lý do.
  - `mayFlow(a, lop)`: thoả thuận loại này → mọi lớp ngoài `catalog` bị từ chối **trước** bước điều khoản riêng, kể cả
    khi hàng trong cơ sở dữ liệu lệch (bảng lệch bị ràng buộc chặn, đây là lưới thứ hai). Lớp `catalog` vẫn theo luật cũ
    (đang bật, trong hiệu lực, có trong thoả thuận). Kiểm theo từng lớp, không đóng cả thoả thuận — để bài kiểm chung
    «trường riêng không vào thoả thuận» của hàng 47 (lặp mọi loại, đối chứng `catalog` chảy) giữ nguyên nghĩa.
  - Sáu loại cũ và `ai_processing` không đổi hành vi (bài kiểm cũ chạy nguyên).
- **Ràng buộc cơ sở dữ liệu** — migration `040_xac_nhan_danh_muc.sql` (số giữ chỗ cho hàng 95 ở luật đợt 74; bộ chạy
  ghi sổ theo tên nên 040 áp được sau 052 trên bản thật):
  - thay `agreements_kind_check` (035) bằng bản đủ tám loại;
  - thêm `agreements_xac_nhan_chi_danh_muc`: `kind <> 'catalog_confirmation' or (direction = 'outbound' and
    data_classes = array['catalog']::text[] and not special_terms)`.
  - Viết lặp lại được (`drop constraint if exists` rồi `add`): bản thật áp 040 **sau** 052, cơ sở dữ liệu mới áp 040
    trước 041–052; bài kiểm chạy lại thân 040 trên cơ sở dữ liệu đã đủ mọi migration để đo đúng thứ tự của bản thật, và
    một bài kiểm tĩnh đòi không migration nào sau 040 nhắc `agreements_kind_check` hay ràng buộc mới.
  - Danh sách loại trong ràng buộc khớp `CONNECTION_KINDS` của lõi — bài kiểm của lõi đọc thân 040 so từng phần tử.
  - Không bảng mới, không đổi luật theo dòng. Ai được tạo / bật thoả thuận loại này là hàng 98.

### 3.2 Khuôn sự kiện v1 — `packages/connect/src/catalog-confirmation.ts`

Ba loại sự kiện, mỗi sự kiện một đối tượng `.strict()` ở mọi cấp, phân biệt bằng `eventType`. Vỏ chung:

| Khoá | Kiểu | Nghĩa |
|---|---|---|
| `schemaVersion` | `1` | Số phiên bản khuôn (ADR-0017 §5) |
| `eventType` | `building_frame` · `unit_attributes` · `correction` | Loại sự kiện |
| `officeKey` | 43 ký tự base64url | Mã sàn mờ (RESO `OfficeKey`, giá trị mờ) |
| `memberKey` | 43 ký tự base64url | Mã người mờ (RESO `MemberKey`, giá trị mờ) |
| `observedOn` | `YYYY-MM-DD` | Ngày người nhập (mốc thô — Hỏi-1) |
| `buildingKey` | khoá toà của danh mục dùng chung | Toà được nói tới |

Phần riêng:

- **Khung toà** `building_frame`: `storiesTotal` (nguyên 1–120), `skippedFloors` (mảng nguyên, không trùng, tăng dần, mỗi
  số trong 1..`storiesTotal`), `stacks` (mảng mã trục `^[A-Z0-9]{1,6}$`, không trùng, 1–60 phần tử).
- **Thuộc tính căn** `unit_attributes`: `upi` (UPI danh mục hoặc `null` khi căn chưa có trong danh mục), `unitNumber`
  (mã căn dạng đóng — 3.4), và các giá trị sàn khai: `livingArea` (số dương), `bedroomsTotal` (nguyên ≥ 0),
  `directionFaces` (một trong tám giá trị lookup RESO `North`…`Southwest`), `floor` (nguyên), `stack` (mã trục). Khoá vắng
  = sàn không khai giá trị ấy; ít nhất một giá trị phải có.
- **Báo sai** `correction`: `upi` (bắt buộc — chỉ báo sai được căn đã có trong danh mục), `field` (một trong
  `unitNumber`, `livingArea`, `bedroomsTotal`, `directionFaces`, `floor`, `stack`), `correctValue` (kiểu theo `field`, cùng
  luật dạng đóng). Giá trị đúng trùng giá trị danh mục đang có thì không phải báo sai — lõi từ chối.

**Không bao giờ có** (issue #94): chủ nhà, số điện thoại, giá đáy, ảnh sổ, giá chốt, trạng thái hàng — không khoá nào
trong khuôn mang chúng; khoá lạ bị `.strict()` từ chối ở mọi cấp. **Không chữ tự do**: mọi trường chuỗi của khuôn có
mẫu chính quy hoặc là tập đóng — một bài kiểm đi khắp khuôn chứng điều đó.

**Không trỏ hàng**: không khoá nào là mã hàng (lần rao), mã liên hệ, mã lead, giá hay trạng thái. Hàm dựng không nhận
đầu vào nào như vậy.

### 3.3 Hàm dựng ở lõi — `packages/core/src/confirmation/**`

`@quy-hang/core/confirmation` (đường xuất riêng, vì mã mờ dùng `node:crypto` mà lõi gốc còn chạy trong trình duyệt —
như ghi chú ở `export/mau.ts`):

- `dungKhungToa`, `dungThuocTinhCan`, `dungBaoSai`: nhận lời sàn khai + ngữ cảnh `{ thoaThuan, danhMuc, khoaBenNhan,
  companyId, userId, today }`; trả `{ ok: true, suKien }` hoặc `{ ok: false, loi: [{ truong, thongDiep }] }` — không ném.
- **Từ chối, không lọc lặng**: đầu vào mang khoá ngoài danh sách khai của loại sự kiện (kể cả `ownerPhone`,
  `closePrice`, `standardStatus`…) → lỗi nêu tên khoá; chuỗi sai dạng đóng → lỗi nêu trường.
- **Luật ẩn là nguồn**: danh sách khoá phần riêng của mỗi loại sự kiện trỏ về khoá của `LOP_TRUONG` (bảng lớp của luật
  ẩn, hàng 31) — `storiesTotal` trỏ `buildingFloorsTotal`, các khoá căn trỏ đúng tên; ba khoá cấp toà chưa có ở đó
  (`buildingKey`, `skippedFloors`, `stacks`) nằm ở bảng lớp của khuôn. Không đưa ba khoá ấy vào `LOP_TRUONG`: bảng ấy
  khoá theo `CanNoiBo` (một căn như cửa ra cầm), thêm khoá cấp toà là đổi kiểu của mọi cửa ra (`canMoi`, `banRaNgoai`,
  `redaction/**` ngoài vùng) và đặt khoá toà vào hình một căn. Chống tự chứng nhận: bài kiểm ghim trước danh sách đủ khoá
  phần riêng của từng loại (thêm khoá là đỏ, buộc người đọc lại), đòi bảng của khuôn rời `LOP_TRUONG` (không khoá nào hai
  nơi), và mọi khoá tra được lớp ra `catalog`. Khoá vỏ (`schemaVersion`, `eventType`, `officeKey`, `memberKey`,
  `observedOn`) là danh sách đóng riêng — ADR-0017 §6 cho phép đúng hai mã mờ.
- **Chỉ với thoả thuận đúng loại**: `thoaThuan` phải là `catalog_confirmation` mà `mayFlow(thoaThuan, "catalog", { at,
  kind: "catalog_confirmation", direction: "outbound" })` cho phép — không thì không dựng.
- **Trỏ danh mục, không nhận tên tự do**: `buildingKey` phải có trong danh mục dùng chung đưa vào (`danhMuc`, kiểu
  `CatalogData` của lõi — đúng hình khuôn chiều vào v1 đổ vào); `upi` khác `null` phải là căn của toà ấy. Toà ngoài danh
  mục không phát được ở v1 (Hỏi-3). Báo sai so giá trị đúng với giá trị danh mục **sau cùng một phép chuẩn hoá** (mã căn
  `normalizeCode`, hướng về giá trị RESO) — «a-12.06» với «A-12.06», «Đông Nam» với `Southeast` là trùng.
- **Dấu của lõi**: kiểu `SuKienXacNhan` mang một dấu kiểu chỉ lõi đặt; một dòng `@ts-expect-error` trong bài kiểm chứng
  đối tượng tự viết không mang được kiểu ấy — bỏ dấu là `tsc` đỏ.

### 3.4 Dạng đóng của chuỗi

- `unitNumber`: chuẩn hoá như ô Gõ mã căn (`normalizeCode`), khớp `^[A-Z0-9]+([.\-_/][A-Z0-9]+)*$`, dài tối đa 12, và
  không chứa chuỗi từ 8 chữ số liền (dáng số điện thoại).
- `stack`, phần tử `stacks`: `^[A-Z0-9]{1,6}$`.
- `directionFaces`: nhận nhãn tiếng Việt của từ điển nhập (`DIRECTIONS`) hoặc giá trị RESO; ra luôn giá trị RESO.
- `buildingKey`, `upi`: phải trỏ được vào danh mục đưa vào (khuôn kiểm thêm mẫu `^[A-Za-z0-9][A-Za-z0-9_.:-]{0,79}$` và
  `urn:onehub:upi:` như khuôn v1).

### 3.5 Mã sàn và mã người mờ

`HMAC-SHA256(khoaBenNhan, "quy-hang/xac-nhan/v1/office:" + companyId)` (và `…/member:` + `userId`), base64url 43 ký tự.
Khoá bên nhận ≥ 32 byte — ngắn hơn hay vắng thì không dựng. Cùng sàn, cùng bên nhận → cùng mã (Invest «rút một công ty,
một người» được, «hai môi giới cùng sàn» nhận ra được); khác bên nhận → khác mã; không giải ngược được khi không có khoá.
Khoá bên nhận nằm ở đâu là việc của hàng 97 (hộp thư) — hàng này chỉ nhận khoá làm đối số. **Hệ quả cần biết:** xoay
khoá bên nhận là đổi mọi mã của bên ấy — Invest mất nối lịch sử (không «rút một công ty» qua hai khoá được); nên khoá là
khoá sống lâu, xoay chỉ khi lộ, và cách sinh mã thuộc khuôn v1 mà Invest ghim (Hỏi-5).

### 3.6 Ví dụ cho Invest

`packages/connect/src/catalog-confirmation.example.json`: ba sự kiện mẫu (nhãn `[Mẫu]`, khoá bên nhận thử cố định) do
chính hàm dựng của lõi sinh; bài kiểm so tệp với đầu ra hàm dựng, nên ví dụ không lệch khuôn. Báo lại Invest ở
onehub-invest#296 là việc của người (cam kết ra ngoài kho) — ghi ở mục «Ra khỏi kho» của PR.

## 4. Đối chiếu ngành (ADR-0022)

| Nguồn | Làm thế nào | Ta lấy gì |
|---|---|---|
| RESO Web API — EntityEvent (RCP-27) | Nhật ký chỉ thêm, mỗi dòng `EntityEventSequence` (int64 dương, tăng đơn điệu), `ResourceName`, `ResourceRecordKey`; bên nhận kéo bằng `$filter=EntityEventSequence ge n` | Mô hình hộp thư kéo cho hàng 97; ở khuôn này: sự kiện bất biến, có số phiên bản — [RCP-27](https://transport.reso.org/proposals/entity-events.html) |
| RESO Data Dictionary | `UnitNumber`, `LivingArea`, `BedroomsTotal`, `DirectionFaces` (lookup tiếng Anh), `StoriesTotal`, `OfficeKey`, `MemberKey` | Tên trường như khuôn v1; `directionFaces` dùng lookup RESO; mã sàn / người theo khoá RESO nhưng giá trị mờ |
| Google Maps — «Đề xuất chỉnh sửa» | Người dùng sửa trên biểu mẫu theo trường; một người chưa đủ, người khác xác nhận rồi mới lên | Biểu mẫu đóng theo trường cho «báo sai»; độ tin để Invest tính (hai công ty độc lập) — [TechCrunch 2016](https://techcrunch.com/2016/07/21/google-maps-is-turning-its-over-a-billion-users-into-editors/), [Android Police](https://www.androidpolice.com/2016/06/14/google-maps-starts-using-crowd-sourcing-verify-suggested-edits/) |
| Waze Map Editor — Suggest an edit | Đề xuất sửa bản đồ đi qua người biên tập trước khi lên | Lời của sàn là phát biểu, không ghi thẳng vào danh bạ (ADR-0017 §6 phía Invest) — [Waze help](https://support.google.com/waze/answer/14324943) |

**Ta viết cứng — họ cho cấu hình:** danh sách trường báo sai được (sáu trường căn) và ba loại sự kiện. Google Maps và
Waze đổi biểu mẫu theo loại địa điểm mà không cần ai ghim phiên bản. Máy khuyến giữ cứng với lý do **nghĩa chuẩn để so
giữa các sàn** (luật thiết kế đối chiếu): Invest so lời của hai công ty độc lập trên cùng trường, và khuôn là hợp đồng có
phiên bản mà Invest ghim — đổi danh sách là lên phiên bản khuôn, không phải cấu hình của sàn (Hỏi-4). Dòng «điều khoá»
vào Sổ điểm biến thiên sau khi người chốt.

## 5. Ngoài phạm vi

- Hộp thư đi, API kéo, số thứ tự sự kiện, gom lô để làm mờ giờ — hàng 97.
- Token máy — hàng 96. Bật / tắt thoả thuận theo sàn, nhật ký, danh sách sàn được bật — hàng 98.
- Sinh sự kiện từ công việc, «không sinh sự kiện chỉ vì tạo hàng», không điền sẵn giá trị chưa chắc — hàng 101 / 100.
- Toà ngoài danh mục, tầng có tên chữ (12A, tầng kỹ thuật) — phiên bản khuôn sau (Hỏi-3).
- Ô «sàn đã xác minh chủ với sổ» — Hỏi-2.

## 6. Câu hỏi cho Cổng Phạm vi

- **Hỏi-1 — mốc thời gian thô.** Khuyến: `observedOn` là **ngày** (`YYYY-MM-DD`). Lối khác: tuần (ngày đầu tuần ISO) —
  giảm thêm tín hiệu «sàn đang làm căn này», giá: Invest mất độ tươi theo ngày. Ghi chú: thứ tự sự kiện trong hộp thư và
  giờ kéo vẫn lộ giờ thật; làm mờ thật sự cần gom lô ở hàng 97.
- **Hỏi-2 — ô «sàn đã xác minh chủ với sổ».** Khuyến: **không** vào v1. Lối khác: thêm ô có / không + ngày xác minh
  (không tên, không số) — giá: một trường suy từ lớp nguồn đi ra, cần xếp lớp mới, và tín hiệu «sàn đang giữ chủ căn
  này» mạnh hơn mọi trường khác của khuôn.
- **Hỏi-3 — toà ngoài danh mục.** Khuyến: v1 chỉ trỏ toà bằng `buildingKey` có trong danh mục dùng chung; toà Invest chưa
  gửi thì chưa phát được. Lối khác: cho tên toà dạng chuẩn hoá — giá: một kênh chữ gần tự do, nơi số hay tên người có thể
  lọt vào.
- **Hỏi-4 — danh sách trường báo sai và loại sự kiện.** Khuyến: **giữ cứng** trong khuôn (lý do: nghĩa chuẩn để so giữa
  các sàn; đổi là lên phiên bản khuôn), ghi dòng «điều khoá» ở Sổ điểm biến thiên. Lối khác: sàn chọn tập con trường được
  báo sai — giá: Invest nhận lời không đồng đều giữa các sàn, khó tính «hai công ty độc lập cùng giá trị».
- **Hỏi-5 — cách sinh mã sàn, mã người mờ (khó đảo: thuộc khuôn Invest ghim).** Khuyến: **HMAC theo khoá riêng từng bên
  nhận** — hai bên nhận không nối được cùng một sàn với nhau; giá: xoay khoá của một bên là đổi mọi mã của bên ấy, Invest
  mất nối lịch sử. Lối khác (a): một khoá HMAC chung của Quỹ hàng cho mọi bên nhận — mã ổn định, xoay khoá một lần cho
  tất cả, nhưng hai bên nhận cùng thấy một mã cho một sàn và nối được với nhau. Lối khác (b): bảng ánh xạ mã ngẫu nhiên
  lưu ở Quỹ hàng — xoay không đổi mã, nhưng thêm một bảng giữ nối mã ↔ sàn (hàng 97 dựng, cách ly như mọi bảng).
