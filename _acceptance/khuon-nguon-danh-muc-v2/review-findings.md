## Trong hợp đồng

- **Lưới giá trị cấm để lọt số điện thoại dính liền chữ trong các trường chữ tự do**
  file: `packages/connect/src/catalog-feed.ts:174`
  severity: medium
  AC: AC-7
  source: bugs
  detail: Cả hai mẫu số điện thoại ở DANG_CAM đều không bắt dãy số liền, không dấu tách, dính ngay sau chữ Latin. Mẫu dòng 174 có `(?<![A-Za-z0-9])`; nhánh hai của MAU_DOAN_SDT đòi phải có dấu tách. Ranh giới này được ADR-0027 chấp nhận cho khoá máy cấp (`buildingKey`, `upi`) vì ULID, và ADR ấy cũng ghi riêng rằng mã người gõ cấm mọi dãy từ 9 chữ số. soatChuoi lại áp một luật cho mọi lá chuỗi, kể cả chữ tự do như buildingName, subdivisionName, complexName, unitNumber, provider. Đã chạy parseCatalogFeed trên gói mẫu với buildingName lần lượt là `SĐT0900000012`, `Zalo0900000012`, `[Mẫu] Toà A LH0900000012`, `(090) 000 0012`: cả bốn đều được nhận, trong khi `Toà A 0900000012` bị từ chối. AC-7 hứa từ chối cả gói khi có dáng số điện thoại ở mọi lá chuỗi. Bài test chỉ thay cả lá bằng `0900 000 012` nên không thấy lỗ này. Hướng sửa: tách luật theo nguồn chuỗi như ADR-0027, với trường chữ tự do thì cấm mọi dãy 9–11 chữ số kể cả dính chữ.
  rationale: AC-7 hứa từ chối cả gói khi có dáng số điện thoại ở mọi lá chuỗi; số dính chữ vẫn lọt.

- **Mốc đo qua được khuôn nhưng Postgres từ chối, gói sai khuôn thành 500 thay vì 422**
  file: `packages/connect/src/catalog-feed.ts:130`
  severity: low
  AC: AC-4
  source: bugs
  detail: MocDo là `z.string().datetime({ offset: true })` của zod 3.25.76, nhận độ lệch múi giờ và năm mà timestamptz không nhận. Đã chạy parseCatalogFeed: `marketStats[0].measuredAt` bằng `2026-11-09T08:00:00+99:00`, `...+16:00` hay `0000-01-01T00:00:00Z` đều qua khuôn. Ép kiểu cùng các giá trị đó trên Postgres cục bộ báo 22009 (time zone displacement out of range) và 22008 (date/time field value out of range). ghiAnhChup ép `$3::timestamptz`, nên giao dịch hỏng ở bước ghi. Đường token (feeds-token.ts) rơi vào nhánh cuối: ghi nhật ký `server_error` thay vì `invalid_payload`, trả 500. Đường phiên (feeds.ts) `throw e`. Bên đẩy nhận lỗi máy chủ không có đường khoá, trái với hợp đồng «sai khuôn 422» (AC-4 «mốc đo sai dạng» phải bị từ chối đúng đường khoá); dữ liệu không bị ghi dở vì giao dịch rollback. `measuredAt` ở đầu gói có cùng lỗ (v1 đã có sẵn, v2 lặp lại). Hướng sửa: thêm refine giới hạn độ lệch trong ±15:59 và năm ≥ 0001 cho MocDo, dùng chung cho đầu gói.
  rationale: AC-4 đòi mốc đo sai dạng bị từ chối đúng đường khoá; mốc có độ lệch hoặc năm không hợp lệ lại qua khuôn rồi thành 500.

- **Hình 4 (âm tính một mình, không ghim thông điệp): ca «cấm: cả gói không vào» bị từ chối vì luật khác, không phải vì giá trị cấm**
  file: `packages/api/test-db/khuon-v2/nhan-goi-v2.test.ts:139`
  severity: high
  AC: AC-7
  source: measurement
  detail: Dòng 139 đặt `cuoi.upi = upi + ':0900000012'` chỉ ở tin rao, không đổi căn tương ứng. Sau đó dòng 141-142 chỉ assert 422 và mã invalid-feed. Chạy thử parseCatalogFeed với gói này ra hai lỗi cùng đường publicListings/0/listings/1/upi: «UPI ... không có trong khu» và «Giá trị có dáng số điện thoại». Đối chứng bằng hậu tố sạch `:khac` vẫn bị từ chối bởi luật UPI-không-trong-khu. Vậy tắt hẳn lưới giá trị cấm thì nhánh này vẫn 422 và vẫn 0 dòng, tức E9/AC-7 phần «giá trị cấm» không đo gì. Đối chứng dương ở dòng 150 (gửi lại g gốc) gỡ cả hai nguyên nhân cùng lúc nên không tách được. Thân 422 có danh sách lỗi nhưng ca không đọc thông điệp nào.
  rationale: Ca đo AC-7 phần giá trị cấm nhưng vẫn xanh khi tắt lưới, nên AC-7 không được chứng minh.

- **Hình 4 (âm tính một mình, không ghim thông điệp): ca «cấm: giá trị trong mọi chuỗi» chỉ khớp đường khoá, 12/28 lá xanh nhờ luật khác**
  file: `packages/connect/src/catalog-feed-v2.test.ts:215`
  severity: medium
  AC: AC-7
  source: measurement
  detail: Dòng 214-215 chỉ cần `!r.ok` và `r.errors.some(path === p)`, không ghim thông điệp «Giá trị có dáng ...». Chạy thử cho thấy 11 lá có lỗi cùng đường từ luật khác: 3 upi của căn và 2 upi của tin (luật Upi), 2 marketStats.subdivisionKey và 1 publicListings.subdivisionKey («Khu không có trong gói»), 2 segments.buildingKey («Toà không thuộc khu»). Thêm 2 listingKey bị chặn bởi regex mã tin, và lưới giá trị vốn miễn khoá này (KHOA_KHONG_SOAT). Tổng 12/28 lá × 4 dáng = 48/112 ô vẫn xanh nếu lưới bị tắt hoặc miễn cho các khoá đó. Ca vẫn đỏ toàn cục nhờ các lá còn lại như provider, nhưng không đo được phủ từng lá như E8 nêu. Câu «Chiều đỏ: tắt lưới giá trị trong bản sao hàm kiểm thì ca đỏ nêu đường lá» của E8 không có mã tương ứng trong tệp kiểm thử (khác E1, E12 và E11 có đối chứng thật), và ca cũng không gọi lanh().
  rationale: Ma trận giá trị của AC-7 phủ mọi lá chuỗi, nhưng ca không phân biệt được lá nào thật sự do lưới giá trị chặn.

- **Hình 4 (âm tính không đối chứng dương): «khu thứ hai không đổi» trên bảng tin rao là so [] với []**
  file: `packages/api/test-db/khuon-v2/anh-chup.test.ts:33`
  severity: medium
  AC: AC-5
  source: measurement
  detail: Dòng 33 chỉ đối chứng `truocKhu2.thiTruong.length === 1`. goiMauV2() chỉ có một phần tử publicListings (khu căn hộ), nên khu thứ hai không có dòng nào ở catalog_public_listing_snapshots. Ở dòng 43, `deepEqual(await chup([khu2]), truocKhu2)` với phần tin luôn là [] bằng []. Một câu ghi tin rao đè nhầm sang khu khác sẽ không bị bắt, trong khi E6 nêu đọc cả hai bảng, «khu thứ hai không đổi ở mọi ô (đối chứng: khu ấy có dữ liệu)». goiSau cũng chỉ giữ khu đầu, nên ca không tạo ra dòng tin nào cho khu 2.
  rationale: AC-5 đòi khu khác không đổi, mà phần tin rao của khu thứ hai không có dữ liệu để chứng minh.

- **Hình 5 (tuyên quét lớp, thiếu ma trận viết trước): «độ chắc: chín trường» duyệt chính hằng số của mã đang kiểm**
  file: `packages/connect/src/catalog-feed-v2.test.ts:71`
  severity: medium
  AC: AC-3
  source: measurement
  detail: Dòng 71 chỉ ghim `CATALOG_CONFIDENCE_FIELDS.length === 9`, dòng 73 lặp trên chính hằng đó, dòng 83 so soLan với độ dài của chính nó. E4 hứa «duyệt đúng danh sách chín trường», nhưng không có danh sách tên viết trước trong tệp kiểm thử (grep: hằng này chỉ xuất hiện ở confidence.ts, catalog-feed.ts và tệp test này). Đổi một tên trường trong hằng, ví dụ thay storiesTotal bằng trường khác, thì độ dài vẫn 9 và vòng lặp vẫn xanh. Khác với CATALOG_CONFIDENCE_LEVELS ở dòng 70 đã được deepEqual với danh sách viết tay.
  rationale: AC-3 có ô «trường ngoài chín trường» cần danh sách chín trường viết trước, mà test chỉ dùng chính hằng của mã.

- **Hình 5 (tuyên quét lớp nhưng chỉ có điểm-case): ràng buộc DB field_confidence chỉ thử 3/9 khoá đúng, storiesTotal không ca nào chạm**
  file: `packages/db/tests/khuon-v2.test.mjs:112`
  severity: medium
  AC: AC-9
  source: measurement
  detail: AC-9 hứa «field_confidence chỉ nhận đúng khoá và nhãn», và migration 042 tự chép tay danh sách chín khoá với chú thích «trùng CATALOG_CONFIDENCE_FIELDS». Đối chứng dương ở dòng 112 chỉ có floor, livingArea, stack. Đi qua cửa nhận với gói mẫu thêm được 5 khoá nữa, nhưng storiesTotal không xuất hiện ở bất kỳ tệp test nào trong vùng hay trong goiMauV2 (grep rỗng). Không có ca nào duyệt đủ chín khoá của lõi qua ràng buộc SQL, nên danh sách TS và danh sách SQL lệch nhau ở storiesTotal thì bộ kiểm vẫn xanh, còn gói hợp lệ sẽ vỡ 23514 khi ghi.
  rationale: AC-9 hứa field_confidence chỉ nhận đúng khoá và nhãn, nhưng chưa duyệt đủ chín khoá.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Mốc đo ở tương lai lọt khuôn và khoá vĩnh viễn ảnh chụp của khu**
  Người dùng thấy gì: Một gói đẩy nhầm năm hoặc sai đồng hồ có thể làm số thị trường và tin rao của một khu đứng yên, mọi gói đúng sau đó bị bỏ qua mà bên đẩy vẫn thấy báo thành công. Chỉ chủ cơ sở dữ liệu sửa tay được.
  Căn cứ: Hậu quả nặng vì ảnh hưởng mọi sàn dùng chung khu đó và người dùng không tự gỡ được, nhưng cần sự cố nhập sai mới xảy ra và việc sửa nhỏ, nên đáng đăng thành việc riêng.
  file: `packages/connect/src/catalog-feed.ts`
  severity: medium
  Đề xuất: new-contract

- **Hình 5 (quét lớp thiếu phần tử): kiemGhiDu kiểm agreement_id ở 2/3 bảng, bỏ bảng tin rao**
  Người dùng thấy gì: Bộ kiểm chưa bắt được trường hợp tin rao công khai bị ghi gắn nhầm thoả thuận. Người dùng chưa thấy lỗi nào, chỉ là một lớp kiểm còn thiếu.
  Căn cứ: Nhẹ vì không có lỗi thật được chỉ ra, chỉ thiếu một lớp kiểm, và thêm sau rất rẻ nên có thể ghi nhận rồi ship.
  file: `packages/api/test-db/khuon-v2/nhan-goi-v2.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 2 (fixture viết tay đúng khuôn bên đọc): mọi phép đo dựng từ goiMauV2(), hồ sơ lại gọi đó là «round-trip qua bên viết thật»**
  Người dùng thấy gì: Chưa có gói thật từ bên đẩy nào để thử, nên mới chỉ chứng minh khuôn khớp với mẫu do chính nhóm viết. Hình dạng gói thật có thể khác khi bên kia bắt đầu đẩy.
  Căn cứ: Hợp đồng đã ghi rõ chưa có bên đẩy thật nên đây là giới hạn đã biết, và sẽ lộ ra ngay khi nối bên đẩy mà không làm mất dữ liệu nào.
  file: `_acceptance/khuon-nguon-danh-muc-v2/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình 4 (không đối chứng dương): «giá trị đúng theo v1» so trước và sau với cùng một giá trị**
  Người dùng thấy gì: Bộ kiểm chưa chứng minh được rằng khi gói cũ đẩy lại, giá trị căn được lấy đúng từ gói cũ. Chưa thấy lỗi thật nào.
  Căn cứ: Nhẹ vì chỉ là chỗ kiểm yếu ở đường gói cũ đang chuyển tiếp, không có dữ liệu bị hỏng được chỉ ra, và bổ sung sau rẻ.
  file: `packages/api/test-db/khuon-v2/nhan-goi-v2.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
