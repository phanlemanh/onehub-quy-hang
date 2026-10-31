# ADR-0016: Mọi loại hình bất động sản — loại hình RESO, khu, địa chỉ chuẩn, kiểm trùng theo địa chỉ

Ngày: 2026-10-31 · Trạng thái: **đề xuất** (chờ chủ kho duyệt ở Cổng Phạm vi của hàng 72; Hỏi-1..4 cuối tệp) · Liên
quan: Tham chiếu §1, §3, §4, §6, §7, luật 19–20, 24; bất biến 1, 2, 4; ADR-0006 (khu phụ trách), ADR-0007 (đổi tên API),
ADR-0008 (sự kiện của hàng), ADR-0010 (lớp nguồn), ADR-0011 (nhập dữ liệu); hàng 9, 10, 14, 17, 24, 31, 35, 63, 64, 65
của lộ trình · đề xuất hàng: [Bản phạm vi mọi loại hình](../plan/pham-vi-moi-loai-hinh.md)

## Bối cảnh

Chủ kho, Cổng Phạm vi hàng 24, 31/10: «đây là phần nợ cần giải quyết các loại hình bất động sản khác, vì nếu không giải
thì sẽ không thể triển khai được». Cùng ngày chủ kho bỏ chữ «dự án», gọi theo RESO DD 2.1: khu chứa căn
`SubdivisionName`, toà `BuildingName`, căn `UnitNumber`, loại hình `PropertyType` / `PropertySubType`.

Đã kiểm ngày 31/10 trên mã ở `main` (5e20a48) và trên trang RESO (nguồn ở trang tri thức của đợt):

- **Lõi chỉ biết một hình**: dự án → toà → căn (`packages/core/src/catalog/types.ts`), mã toà · tầng · trục
  (`code-rule.ts`). Không loại hình, không địa chỉ, không diện tích đất. Khuôn Invest (`packages/connect`) cùng hình,
  phiên bản 0 (nháp).
- **Nhà không có toà không tạo được hàng**: sự kiện `created` bắt buộc `buildingName` (ADR-0008 quyết định 3), cột
  `listings.building_name` là `not null` (migration 004).
- **Sàn thật có thấp tầng**: ghi chép 28/10 rút từ bảng hàng thật của hai sàn — một bảng căn hộ thứ cấp, một bảng thấp
  tầng: «Căn hộ: toà · tầng · trục. Thấp tầng: phân khu · dãy · lô».
- **Hai tuần thử là một khu căn hộ** (Tham chiếu §1: người dùng đầu tiên là chính đội, một dự án căn hộ thứ cấp).
- **RESO DD 2.1** có đủ các trường cần: `SubdivisionName` («khu dân cư, cộng đồng, khu phức hợp hay dự án của chủ đầu
  tư»), `BuildingName`, `UnitNumber` («số căn hay phần của một toà hay khu lớn hơn»), `UnparsedAddress`, `StreetNumber`,
  `StreetName`, `StateOrProvince`, `ParcelNumber`, `LotSizeArea`, `FrontageLength`, `StoriesTotal`, `Latitude` /
  `Longitude`. `PropertyType` có 9 giá trị (có `Residential`, `Land`); `PropertySubType` có 31 (có `Condominium`,
  `Townhouse`, `Single Family Residence`, `Unimproved Land`) — bảng giá trị đọc ở trang DD 2.0, đối chiếu lại DD 2.1 khi
  viết lõi.
- **Địa giới hai cấp từ 1/7/2025**: cấp huyện chấm dứt; 34 tỉnh, thành; 3.321 xã, phường, đặc khu (báo chí và trang
  pháp luật, chưa đọc văn bản gốc). Bảng hàng cũ và lời chủ nhà còn viết quận và tên phường cũ.
- 12 tệp mã và dữ liệu mẫu mang `projectKey` / `projectName`; hàng 10 và 24 chưa có nhánh mã; hàng 63 (PR #42) đang sửa
  `lookup.ts`.

## Quyết định đề xuất

1. **Loại hình theo RESO, ở căn, nhãn của sàn neo vào.** Mỗi căn mang `PropertyType` và `PropertySubType` với giá trị
   RESO nguyên văn. Bản đầu bốn loại: căn hộ `Residential` / `Condominium`; nhà phố, liền kề `Residential` / `Townhouse`;
   biệt thự, nhà riêng tách biệt `Residential` / `Single Family Residence`; đất `Land` / `Unimproved Land`. «Shophouse»,
   «Liền kề», «Đất thổ cư» là **giá trị riêng của sàn neo vào giá trị chuẩn** — đúng cơ chế cách gọi riêng (§7, hàng 45),
   không thêm giá trị vào lõi. Loại hình là thuộc tính căn (khoá, luật 6), không phải phần lần rao.
   - So: (B) bộ giá trị Việt Nam riêng (`can_ho`, `nha_pho`, `biet_thu`, `dat_nen`, `shophouse`) đổi sang RESO khi ra
     ngoài — thêm một bảng đổi phải giữ đúng mãi, trái luật RESO-first của kho, và trùng việc với cách gọi riêng.
     (C) một khu một loại hình — sai với khu thấp tầng thật, nơi liền kề, biệt thự, shophouse nằm chung một khu.
   - Khuyến nghị (A). Căn cứ: RESO DD 2.1 có đủ bốn giá trị; §7 đã chốt «giá trị riêng neo vào giá trị chuẩn».
2. **Bộ trường theo loại hình là dữ liệu của lõi**, như cách đọc mã căn (hàng 9): một bảng `subType → trường dùng được,
   trường bắt buộc khi Sẵn sàng bán, mục của mức đủ`. Căn hộ: toà, tầng, trục, `LivingArea`, `BedroomsTotal`,
   `DirectionFaces`. Nhà phố, biệt thự: `LotSizeArea` (m²), `LivingArea` (tổng sàn), `StoriesTotal`, `FrontageLength`,
   `BedroomsTotal`, `DirectionFaces`, và một trường đặc trưng Việt Nam — lộ giới, đường trước nhà rộng bao nhiêu
   (`accessRoadWidth`, m). Đất: `LotSizeArea`, `FrontageLength`, `accessRoadWidth`. Trường không dùng của loại hình là
   không có, không phải ô trống: bảng hàng không hiện cột «tầng» cho đất.
   - So: (B) mỗi loại hình một bảng và một kiểu riêng — thêm loại hình là thêm migration, sự kiện và màn; mọi màn phải rẽ
     nhánh. Khuyến nghị (A): một hình căn với trường có thể trống, ràng buộc theo loại hình ở lõi và ở cơ sở dữ liệu.
   - Mức đủ (ADR-0008 quyết định 5) đọc từ bảng này: căn hộ, nhà giữ năm mục; đất bỏ «nội thất» còn bốn (Hỏi-2).
3. **Ba cách định danh căn, một khái niệm «Căn».** Căn (`unit`) là vật thể cho mọi loại hình — căn hộ, căn nhà, lô đất;
   chữ trên màn đổi theo loại hình, code không tách khái niệm.
   - **Trong khu, có toà** — khu → toà → căn (`SubdivisionName` → `BuildingName` → `UnitNumber`, tầng, trục), như nay.
   - **Trong khu, không toà** — khu → dãy → lô: dãy là trường đặc trưng Việt Nam `blockName` (RESO không có cấp dãy, và
     `BuildingName` nghĩa là toà nhà — nhét dãy vào đó sai nghĩa); mã lô ở `UnitNumber` (RESO: «phần của một khu lớn
     hơn»). Cấp hai của danh mục mang đúng một trong `buildingName` hay `blockName`. Cách đọc mã thêm dạng dãy · lô
     (`BT05-12`, `LK3-08`) — vẫn là một dòng dữ liệu theo khu.
   - **Ngoài khu** — nhà mặt đường, nhà trong hẻm, đất lẻ: không có danh mục; định danh bằng **địa chỉ chuẩn** (quyết định
     5). Không có `SubdivisionName`, `BuildingName`.
4. **Căn ngoài khu thuộc sàn, không vào danh mục chung.** Căn ngoài khu là bản ghi của sàn, dưới luật theo dòng như mọi
   bảng của công ty; danh mục dùng chung chỉ nhận căn từ một bên cung cấp danh mục qua thoả thuận (như căn hộ, hàng 10).
   - So: (B) danh mục chung «một địa chỉ một căn», sàn nhập trước tạo — sàn sau gõ địa chỉ thấy «đã có trong danh mục»,
     tức là biết sàn khác đang giữ nhà này: lộ việc kinh doanh qua ranh giới công ty (bất biến 1). Danh mục căn hộ không
     có vấn đề này vì nó đến từ bản vẽ công khai của dự án, không từ lead. (C) không có vật thể, địa chỉ là cột của hàng —
     gãy «tách căn và lần rao» (§4) và gãy khoá «mỗi sàn một hàng đang mở trên một căn»: hàng Đã bán là nấc cuối, mở
     lại là hàng mới trên cùng căn (ADR-0008).
   - Khuyến nghị (A). Giá phải trả: «hệ thống biết hai sàn cùng giữ một căn» (§6) không đúng với căn ngoài khu; mở lại
     khi có bên cung cấp danh mục nhà lẻ.
5. **Địa chỉ chuẩn hoá ở lõi, không dịch vụ ngoài.** Địa chỉ gồm: tỉnh, thành (`StateOrProvince`), xã, phường, đặc khu
   (đặc trưng Việt Nam `wardName` kèm mã đơn vị hành chính — RESO `City` không khớp cấp nào của địa giới hai cấp), tên
   đường (`StreetName`), số nhà kể cả hẻm, ngõ, ngách, kiệt (`StreetNumber`); chữ người gõ giữ ở `UnparsedAddress`.
   Danh mục đơn vị hành chính (34 tỉnh, thành; 3.321 xã; bảng tên cũ → tên mới) là dữ liệu công, chép vào kho kèm nguồn
   và ngày. **Khoá địa chỉ** = mã tỉnh + mã xã + tên đường chuẩn hoá (bỏ dấu, chữ thường, bỏ «đường», «phố») + số nhà
   chuẩn hoá (đường hẻm viết thành dãy số từ đường chính vào). Tên phường cũ đọc ra phường mới; phường cũ tách vào nhiều
   xã mới thì không đoán — hỏi người chọn. Đọc không chắc phần nào thì nói thiếu phần nào, như «chưa có trong danh mục».
   Toạ độ chỉ có khi người ghim; không tự tra toạ độ.
   - So: (B) dịch vụ tra địa chỉ (Google, Mapbox, dịch vụ bản đồ trong nước) — tốn tiền theo lượt, thêm một bên ngoài
     nhận địa chỉ của lead (trùng câu hỏi pháp lý của ADR-0011 quyết định 2), và không biết tên phường cũ của bảng hàng
     sàn; (C) chữ tự do, kiểm trùng bằng so gần đúng — không có khoá thì không có kiểm trùng chắc.
   - Khuyến nghị (A). Đường cho (B) để mở: tra toạ độ là một loại kết nối, bật bằng thoả thuận khi cần bản đồ.
6. **Kiểm trùng ngoài khu theo khoá địa chỉ, không tự gộp.** Khoá khớp đúng → «căn đã có hàng mở» như căn hộ (luật 20:
   thành tin bổ sung, vẫn cho «Bỏ lead này»). Cùng xã, cùng đường, số nhà khác dạng viết → «có thể trùng», người chọn.
   Kiểm theo chủ nhà (số điện thoại) giữ nguyên, chạy song song.
   - So: (B) so gần đúng rồi tự gộp — gộp sai là ghi lead vào hàng của đầu chủ khác, khó đảo; (C) chỉ theo chủ nhà — hai
     người nhà cùng rao một căn thì lọt. Khuyến nghị (A).
   - Số thửa, tờ bản đồ (`ParcelNumber`) làm khoá thứ hai — để sau (mục chờ `LH12`). Khi thêm, nó thuộc lớp `source`:
     đọc từ sổ, như ảnh sổ.
7. **Ô nhận lead và nhập dữ liệu nhận mọi loại hình.**
   - Lead: mục bắt buộc «căn hoặc toà» (luật 19) đọc thành «căn, toà, lô hoặc địa chỉ». Lead ngoài khu được mới biết
     đường và phường (như lead căn hộ được mới biết toà, §4); thiếu số nhà thì kiểm trùng chỉ theo chủ nhà và nói rõ
     như vậy. Loại hình chọn một chạm; khu chỉ có một loại hình thì tự điền.
   - Nhập file (ADR-0011): từ điển tiêu đề thêm cột loại hình, địa chỉ, diện tích đất, mặt tiền, số tầng; thực đơn phép
     biến đổi thêm đọc địa chỉ (quyết định 5) và đọc mã lô. **Cột số nhà và cột địa chỉ đầy đủ chỉ gửi hình dạng cho nhà
     cung cấp AI, không gửi giá trị** — như cột tên người; tên đường, xã, tỉnh gửi được. Đây là một dòng thêm vào quyết
     định 2 của ADR-0011, không mở lớp nào mới.
8. **Đổi tên «dự án» thành khu, một lần, trước khi hàng 10 và 24 dựng trên tên cũ.** `projectKey` → `subdivisionKey`,
   `projectName` → `subdivisionName` ở lõi, API (`?project=` → `?subdivision=`), dữ liệu mẫu, Tham chiếu, CONTEXT, kiểm
   thử. Tên cũ không giữ: chưa bên ngoài nào gọi (khuôn Invest phiên bản 0, chưa ghim), như ADR-0007 bỏ đường cũ.
   `complexName` (phân khu) giữ tên — Invest đặt, hàng 10 quyết. Nhãn trên màn: Hỏi-1.
   - So: (B) đổi ở biên API, giữ tên trong lõi — hai bộ tên cho một khái niệm mãi; (C) đổi dần theo từng hàng — hàng 10
     và 24 sẽ dựng thêm mã trên tên cũ rồi phải đổi lại. Khuyến nghị (A), hàng 72.
9. **Khuôn Invest phiên bản 1 (hàng 10) — khuyến nghị cho thiết kế của hàng ấy, không đổi vùng của nó**: dựng bằng tên
   khu RESO từ đầu (đã giao dãy D 31/10); mỗi căn mang `propertySubType` bắt buộc (căn hộ là `Condominium`) để khuôn
   không phải lên phiên bản 2 khi Invest có thấp tầng; cấp hai cho phép `blockKey` / `blockName`. Invest chưa có danh bạ
   thấp tầng thì phần này chờ (mục `LH11`).

## Chỗ chạm bất biến

- **Bất biến 1 — cách ly.** Bảng căn ngoài khu là bảng của công ty: bật và ép luật theo dòng, có ca trong bộ kiểm cách
  ly (hàng 76). Danh mục chung không nhận căn từ lead (quyết định 4).
- **Bất biến 2 — chủ nhà không rời công ty.** Địa chỉ căn không phải thông tin chủ nhà, nhưng số nhà chỉ ra một ngôi nhà
  cụ thể: (i) không gửi giá trị cho nhà cung cấp AI (quyết định 7); (ii) số thửa, khi thêm, ở lớp `source`; (iii) địa
  chỉ liên lạc của chủ nhà, nếu khác địa chỉ căn, là thông tin chủ nhà ở `listing_owners` — không trộn vào địa chỉ căn.
- **Bất biến 4 — phần nội bộ không ra trang khách.** Bộ luật ẩn ở lõi (hàng 31) thêm luật theo loại hình, đặt ở lõi
  không ở giao diện (hàng 80): gửi khách riêng — căn hộ ẩn mã căn (luật 24, như nay); lô trong khu ẩn mã lô, hiện khu;
  căn ngoài khu ẩn số nhà và hẻm, hiện tên đường và xã; toạ độ không ra. Gửi nhóm môi giới hiện đủ, như luật 24 (Hỏi-3).
  Lớp dữ liệu: tỉnh, xã, đường, loại hình và trường theo loại hình thuộc `catalog` với căn trong danh mục chung,
  `shareable_listing` với căn ngoài khu; số nhà `shareable_listing` qua luật ẩn; toạ độ `company_internal` ở bản đầu.

## Ngoài quyết định này

Bản đồ lô (Tham chiếu §10, P2, «Sau»); hàng thương mại (văn phòng, mặt bằng) và cho thuê (`Commercial Sale`,
`Residential Lease` — mục chờ `LH13`); số thửa làm khoá trùng (`LH12`); danh mục Invest có thấp tầng (`LH11`); tra toạ
độ; mức hoàn thiện có cấu trúc (thô, cơ bản, hoàn thiện — bản đầu vẫn là chữ ở phần «nội thất» của lần rao).

## Hệ quả

- Chín hàng 72–80 và ba mục chờ `LH11`–`LH13` (bản phạm vi). **Không hàng nào chặn hai tuần thử** — hai tuần thử là
  một khu căn hộ (§1). Cả chín chặn việc mở cho sàn có bảng hàng thấp tầng hay nhà lẻ (Hỏi-4). Hàng 72 nên gộp trước
  khi hàng 10 và 24 mở Cổng Phạm vi, để không dựng thêm mã trên tên «dự án».
- ADR-0008 đổi hai chỗ khi hàng 76 làm: sự kiện `created` nhận căn ngoài khu (không còn bắt buộc `buildingName`), mức đủ
  đọc theo loại hình. Sự kiện đã ghi không đổi: hàng cũ gấp lại ra đúng như cũ.
- Tham chiếu §4 (dòng «Danh mục»), §9 («chọn dự án»), luật 19 và CONTEXT đổi khi hàng 72 và 76 gộp.

## Hỏi chủ kho (Cổng Phạm vi hàng 72)

- **Hỏi-1 — nhãn của khu trên màn.** Khuyến nghị: «Khu» cho `SubdivisionName`, và đổi nhãn khu phụ trách của ADR-0006
  thành «Vùng phụ trách» (code `zone` giữ nguyên) — khu chứa căn hiện ở mọi màn (thanh trên, bảng hàng nhóm theo khu, ô
  gõ mã), khu phụ trách chỉ ở Cài đặt sàn → Người dùng. Lối khác: «Khu đô thị» cho `SubdivisionName`, giữ «Khu» cho
  khu phụ trách — dài hơn và lạ khi khu chỉ có một toà.
- **Hỏi-2 — mức đủ của đất.** Khuyến nghị bốn mục (bỏ «nội thất»).
- **Hỏi-3 — khách riêng thấy gì với nhà ngoài khu.** Khuyến nghị tên đường và xã, không số nhà, không hẻm, không toạ độ;
  sàn chỉnh được như mọi mặc định (§7).
- **Hỏi-4 — hai tuần thử có cần loại hình khác không.** Khuyến nghị không: hai tuần thử giữ một khu căn hộ (§1); chín hàng
  này chặn sàn thứ hai. Nếu khu thử có cả thấp tầng, bảy hàng 72, 73, 74, 76, 77, 79, 80 thành điều kiện của hai tuần
  thử (75 và 78 chỉ cần cho nhà ngoài khu và file thấp tầng).
