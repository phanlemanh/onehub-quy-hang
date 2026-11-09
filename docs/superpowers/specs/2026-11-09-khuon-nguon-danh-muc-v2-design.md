# Khuôn «nguồn danh mục và thị trường» phiên bản 2 — thiết kế

Ngày: 2026-11-09 · Hàng 94 `khuon-nguon-danh-muc-v2` · Dãy G · Hạng **T3** (`packages/connect/**`, `packages/db/**`).
Nguồn: câu giao và `bat_khi` của hàng 94 ở `docs/plan/lo-trinh.json` · ADR-0017 §5 của Invest · ADR-0015 ·
`docs/plan/pham-vi-xac-nhan-danh-muc.md` · phanlemanh/onehub-quy-hang#94 việc 1.

Không màn hình. Hàng này chỉ nhận và cất; đọc và hiện là hàng 100, 102.

## 1. Việc làm được sau hàng này

Invest đẩy một gói v2 vào cửa nhận đang có (`POST /api/v1/catalog/feeds`, phiên quản trị hay token máy). Gói gồm danh mục kèm độ
chắc từng giá trị, số thị trường theo toà và loại căn có mốc đo, và tin rao công khai đã khớp căn. Gói v1 vẫn nhận như cũ. Invest
ghim một số phiên bản, nên v2 làm trọn trong một hàng.

## 2. Khuôn

`schemaVersion: 2`, `.strict()` mọi cấp, cả ba phần bắt buộc có mặt (mảng rỗng được).

```
{ schemaVersion, provider, measuredAt,
  subdivisions: [ … như v1, mỗi căn thêm fieldConfidence: { livingArea: "verified", floor: "inferred", … } ],
  marketStats:  [ { subdivisionKey, measuredAt,
                    segments: [ { buildingKey, propertyType, propertySubType, bedroomsTotal,
                                  listPriceLow, listPriceHigh, listPriceMedian, listingCount } ] } ],
  publicListings: [ { subdivisionKey, measuredAt,
                      listings: [ { listingKey, upi, listPrice, feeInclusion, onMarketDate } ] } ] }
```

- **Độ chắc.** Ba nhãn của Invest: `inferred` «Suy ra» · `single_source` «Một nguồn xác nhận» · `verified` «Đã xác minh». Chín trường có
  thể vắng của căn mang nhãn: `stack`, `floor`, `livingArea`, `bedroomsTotal`, `directionFaces`, `lotSizeArea`, `storiesTotal`,
  `frontageLength`, `accessRoadWidth`. Giá trị khác `null` phải có nhãn; giá trị `null` hay vắng không được có nhãn.
- **Số thị trường.** Giá đang rao, không phải giá chốt. `listPriceLow ≤ listPriceMedian ≤ listPriceHigh`, đều là số nguyên dương (đồng).
  `listingCount` số nguyên dương. Khu, toà phải có trong chính gói; thấp tầng dùng khoá dãy của chính nó như danh mục, nên `buildingKey` luôn có. Cặp loại hình phải có trong bảng loại hình của lõi. `bedroomsTotal` là số nguyên ≥ 0 khi loại hình dùng trường này, phải `null` khi không dùng (đất). Khoá đoạn `(buildingKey, propertyType, propertySubType, bedroomsTotal)` không trùng trong một khu, `null` trùng `null` tính là trùng.
- **Tin rao.** `listingKey` mã mờ `^[A-Za-z0-9_-]{8,64}$`, không có đoạn dáng số điện thoại, `upi` phải có trong đúng khu đó của gói, `listPrice` nguyên dương, `feeInclusion`
  `included | excluded | null` (cùng tập với `listings.fee_inclusion`), `onMarketDate` ngày ISO.
- **Không vào được.** Khuôn không có khoá nào cho đường dẫn, tên nguồn, tên miền, ảnh, nên `.strict()` từ chối. Lưới thứ hai: mọi chuỗi của
  gói v2 (kể cả `provider`, tên khu, tên toà) có dáng URL, tên miền hay số điện thoại làm cả gói 422, dùng lại `MAU_DANG_SDT`, `MAU_DOAN_SDT`
  của khuôn xác nhận. Lưới này không áp cho v1.

Sinh gói mẫu bằng hàm trong khuôn (`goiMauV2()`), ghi ra `packages/connect/src/catalog-feed-v2.example.json`; hàng 102 dùng tệp này.

## 3. Dữ liệu (migration 042, số giám sát giữ cho hàng 94)

- `catalog_units.field_confidence jsonb`, có check chỉ gồm chín khoá và ba nhãn. Gói v1 ghi căn thì đặt lại `null`.
- `catalog_market_snapshots (subdivision_key pk, provider, measured_at, agreement_id, segments jsonb, updated_at)`.
- `catalog_public_listing_snapshots (subdivision_key pk, provider, measured_at, agreement_id, listings jsonb, updated_at)`.

Mỗi khu một dòng ảnh chụp, gói sau ghi đè cả dòng, nên không cần quyền xoá («không ai xoá», ADR-0015 §5). Thoả thuận mới được ghi đè ảnh do thoả thuận cũ ghi, cùng luật `using (true)` của `catalog_units`. Mốc đo cũ hơn dòng đang có thì
không ghi; phản hồi đếm số ảnh bỏ qua. Luật ghi giống `catalog_units`: `app.catalog_source_active(agreement_id)`.

Vai API chỉ đọc được `subdivision_key`, `measured_at` (đủ cho câu ghi có điều kiện), không đọc được `segments`, `listings`, `agreement_id`. Cột
`field_confidence` được cấp đọc như các cột danh mục khác. Hàng 102 mở phần đọc kèm luật vai (tin rao chỉ đầu chủ và trưởng nhóm, Tham chiếu §4).

Tệp 042 viết theo lưu ý của 040: bản thật áp sau 052, cơ sở dữ liệu mới áp trước 043–052, nên chỉ dựa vào đối tượng ≤ 041 và lặp lại được.

## 4. Cửa nhận

`parseCatalogFeed` đọc `schemaVersion` rồi chọn khuôn; phiên bản khác 1, 2 thì 422. `ghiGoi` một giao dịch, thêm hai bảng ảnh chụp khi là v2. Hai đường vào
dùng chung; kiểm thoả thuận và nhật ký token giữ nguyên. Phản hồi v1 không đổi. Phản hồi v2 thêm `marketSnapshots`, `publicListingSnapshots`, `staleSnapshotsSkipped`.
`field_confidence` đổi một mình cũng tính là cập nhật căn.

## 5. Đối chiếu ngành (ADR-0022)

| Năng lực | RESO | Vitki Data | BatchData | MLS Grid, Bridge | Ta định làm | Ta viết cứng — họ cấu hình |
|---|---|---|---|---|---|---|
| Độ chắc từng giá trị | Không có trường chuẩn; chưa kiểm phần mở rộng | Bậc độ chắc theo từng trường và vết nguồn ([nguồn](https://vitkidata-com.pages.dev/)) | Khuyên giữ độ chắc ở mức trường khi quy trình cần ([nguồn](https://batchdata.io/uncategorized/what-is-confidence-scoring)) | Chưa kiểm | Ba nhãn theo Invest | Có: ba nhãn cố định. Hỏi-7 |
| Giá đang rao theo nhóm | Không có tài nguyên thống kê; chưa kiểm | Chưa kiểm | Chưa kiểm | Chưa kiểm | Đoạn theo toà, loại hình, số phòng | Không rõ — chưa kiểm được sản phẩm cùng loại. Hỏi-1 |
| Tin rao: giá, ngày | `ListPrice` ([giải thích bên thứ ba](https://batchdata.io/?p=17660)), `OnMarketDate` ([RESO DD 2.0](https://ddwiki.reso.org/display/DDW20/OnMarketDate+Field)) | Chưa kiểm | Chưa kiểm | Chưa kiểm | `listPrice`, `onMarketDate` | Không |
| Người đăng | `ListAgentFullName` ([RESO DD 2.0](https://ddwiki.reso.org/display/DDW20/ListAgentFullName+Field)) | Chưa kiểm | Chưa kiểm | Chưa kiểm | Không chở | Hỏi-2 |

## 6. Ngoài phạm vi

Đọc và hiện số thị trường, tin rao (hàng 102) · không điền sẵn giá trị chưa chắc (hàng 100) · bỏ v1 · mặt bằng theo trục · đẩy từ phía Invest (DN5).

## 7. Câu hỏi cho Cổng Phạm vi

- **Hỏi-1 — «loại căn» của số thị trường (khó đảo: Invest ghim khuôn).** Khuyến: loại hình cộng số phòng ngủ, như hàng cuộc gọi đã so «cùng toà, cùng số phòng ngủ»; số phòng để
  `null` khi loại hình không dùng. Lối khác: chỉ số phòng ngủ (gọn hơn, lẫn nhà phố với căn hộ trong khu hỗn hợp) hay chỉ loại hình (không phân biệt 1PN với 3PN).
- **Hỏi-2 — tin rao có chở người đăng không (khó đảo).** Khuyến: không, vì hàng 102 chỉ hiện giá, điều kiện phí, ngày đăng, và tên người là dữ liệu cá nhân vào vùng mọi sàn dùng chung
  trước khi rà pháp lý. Lối khác: chở tên hiển thị như ADR-0017 §5 cho phép; sau này cần mà chưa chở thì phải lên v3.
- **Hỏi-3 — căn chỉ có gói v1 thì độ chắc thế nào.** Khuyến: để trống nhãn và hàng 100 coi là chưa chắc, gói v1 ghi lại căn thì xoá nhãn cũ vì nhãn không còn nói về giá trị mới. Lối khác: giữ
  nhãn cũ, giá trị đổi mà nhãn vẫn «Đã xác minh».
- **Hỏi-4 — ai đọc số thị trường và tin rao.** Khuyến: hàng này chưa cho ai đọc, hàng 102 mở kèm luật vai. Lối khác: mở đọc cho mọi sàn ngay như danh mục; tin rao lộ cho đầu khách nếu hàng 102 chưa kịp chặn.
- **Hỏi-5 — v1 nhận tới khi nào (khó đảo).** Khuyến: không đặt hạn trong khuôn, bỏ v1 bằng một hàng riêng khi Invest báo đã chuyển. Lối khác: đặt hạn ngày, Invest trễ thì gói bị từ chối.
- **Hỏi-6 — ảnh chụp đến muộn (mốc đo cũ hơn).** Khuyến: giữ số mới, gói vẫn 200 và đếm số ảnh bỏ qua, phần danh mục vẫn nhận. Lối khác: từ chối cả gói 409, Invest phải tự sắp lại.
- **Hỏi-7 — ba nhãn độ chắc (ta viết cứng, sàn không đổi; khó đảo).** Khuyến: giữ cứng, lý do «nghĩa chuẩn để so giữa các sàn», sàn chỉ đổi được tên hiển thị khi có sổ từ vựng. Lối khác: bậc do bên cấp khai,
  mỗi nguồn một thang, hàng 100 không còn luật chung cho «chưa chắc».
- **Hỏi-8 — nhãn bắt buộc tới đâu (khó đảo).** Khuyến: chín trường có thể vắng đều mang nhãn, giá trị có thì bắt buộc có nhãn. Lối khác: nhãn tuỳ chọn, thiếu nhãn coi là chưa chắc: Invest thiếu nhãn vẫn đẩy được, đổi lại không phân biệt được quên nhãn với chưa chắc.
- **Hỏi-9 — tin rao thay theo khu hay theo từng tin (khó đảo).** Khuyến: thay nguyên theo khu như số thị trường, tin vắng ở gói sau là hết. Lối khác: lưu từng tin theo mã, Invest phải gửi cả tín hiệu gỡ tin, không xoá được ở vùng dùng chung.
- **Hỏi-10 — chuỗi cấm thì từ chối tới đâu (khó đảo).** Khuyến: cả gói, như `bat_khi` của hàng. Lối khác: chỉ bỏ phần lỗi, gói vẫn vào phần sạch, đổi lại dữ liệu cấm lọt lưới khó thấy.
- **Hỏi-11 — gói có phải tự đủ không (khó đảo).** Khuyến: khu, toà, căn được trỏ tới phải có trong chính gói, bên đẩy tự kiểm được trước khi gửi. Lối khác: cho trỏ danh mục đã nhận, gói số thị trường nhẹ hơn, đổi lại kiểm phải đọc cơ sở dữ liệu lúc ghi.
- **Hỏi-12 — mặt bằng theo trục (khó đảo).** Khuyến: chưa chở, làm ở v3 khi có màn dùng. Lối khác: thêm vào v2 như ADR-0017 §5 có nêu, khỏi lên v3, đổi lại đặt khuôn cho thứ chưa ai đọc.
