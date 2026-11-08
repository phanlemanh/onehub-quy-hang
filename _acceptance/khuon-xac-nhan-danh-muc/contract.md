---
schema_version: 1
feature: Sự kiện «xác nhận danh mục» chỉ dựng được từ lõi theo khuôn phiên bản 1 — khung toà, thuộc tính căn, báo sai, biểu mẫu đóng, kèm mã công ty và mã người mờ — và thoả thuận loại «xác nhận danh mục» chiều ra không mang được lớp nào ngoài danh mục
slug: khuon-xac-nhan-danh-muc
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, db]
status: signed-off
design_doc: docs/superpowers/specs/2026-11-08-khuon-xac-nhan-danh-muc-design.md
approved_by: Manh Phan
approved_at: 2026-11-08T07:17:24Z
---

# Acceptance Contract: khuon-xac-nhan-danh-muc

## Context

Hàng 95 của lộ trình (XN2, đợt xac-nhan-danh-muc-0311), dãy G của đợt dau-khach-nhap. Issue #94 việc 2; ADR-0017 §6
sửa đổi 03/11 (kho onehub-invest): mở một loại kết nối chiều ngược «xác nhận danh mục», chỉ lớp danh mục, kèm mã công ty
và mã người mờ; máy thu Invest kéo về. DN6 của Invest đợi khuôn này. Trần hiện tại chỉ chặn lớp nguồn; giá chốt vẫn mở
được bằng điều khoản riêng — loại kết nối này cần trần riêng.

Hạng **T3** (chạm `packages/connect/**`, `packages/core/src/agreements.ts`, `packages/db/**`), trùng hạng hàng lộ trình.
Bất biến chạm: (2) chủ nhà không rời công ty — khuôn không có chỗ cho lớp nguồn, loại mới không mang được lớp nào ngoài
danh mục; (4) phần nội bộ không ra ngoài — sự kiện dựng từ bảng lớp của luật ẩn ở lõi; (1) cách ly — không bảng mới,
ràng buộc mới trên bảng đã có luật theo dòng.

Hàng này dựng khuôn, hàm dựng và trần; chưa có đường chảy (hộp thư đi hàng 97, token máy hàng 96, bật / tắt theo sàn
hàng 98, sinh sự kiện từ công việc hàng 101).

Source input: `docs/plan/lo-trinh.json` hàng 95 · `_acceptance/khuon-xac-nhan-danh-muc/opportunity.md` ·
`docs/plan/pham-vi-xac-nhan-danh-muc.md` mục «Hàng 95» · `docs/tri-thuc/wiki/dot/xac-nhan-danh-muc-0311.md` · thiết kế
`docs/superpowers/specs/2026-11-08-khuon-xac-nhan-danh-muc-design.md` · luật đợt 1, 3, 25, 74

## Criteria

- AC-1: Given một thoả thuận loại `catalog_confirmation`, When kiểm cấu trúc (`agreementErrors`) và hỏi luồng
  (`mayFlow`) cho từng lớp trong bảy lớp dữ liệu, Then thoả thuận chiều ra chỉ có lớp `catalog`, không điều khoản riêng,
  thì không lỗi và chỉ `catalog` chảy; thoả thuận liệt thêm bất kỳ lớp nào khác, chiều vào, hay `specialTerms: true` thì
  `agreementErrors` nêu lý do; và `mayFlow` từ chối mọi lớp ngoài `catalog` — kể cả `transaction` khi `specialTerms: true`
  và lớp có trong thoả thuận — với lý do nêu loại kết nối; sáu loại cũ và `ai_processing` giữ hành vi cũ.
- AC-2: Given vai `quy_hang_app` dưới luật theo dòng trên Postgres đã chạy mọi migration, When thêm hay sửa một dòng
  `agreements` loại `catalog_confirmation` mang một lớp ngoài danh mục (từng lớp trong sáu lớp), chiều vào, hay
  `special_terms = true`, Then cơ sở dữ liệu từ chối với tên ràng buộc `agreements_xac_nhan_chi_danh_muc` (với lớp nguồn
  và nội bộ — nơi ràng buộc cũ báo trước — vẫn đúng tên ấy khi gỡ hai ràng buộc cũ trong ca); cùng câu lệnh với
  `data_classes = {catalog}`, chiều ra, không điều khoản riêng thì thành công; mọi loại trong `CONNECTION_KINDS` của lõi
  đều thêm được và danh sách loại của ràng buộc trùng `CONNECTION_KINDS`; và kết quả giữ nguyên khi thân migration 040
  được áp lại trên cơ sở dữ liệu đã có mọi migration tới 052 (thứ tự của bản thật), không migration nào sau 040 đổi lại
  hai ràng buộc ấy.
- AC-3: Given ba sự kiện dựng bằng hàm dựng của lõi — khung toà, thuộc tính căn, báo sai — trên danh mục mẫu, When đọc
  bằng khuôn `parseCatalogConfirmation`, Then cả ba hợp lệ, `schemaVersion` là 1 và đọc ra đúng mọi trường đã dựng; tệp
  ví dụ `catalog-confirmation.example.json` trùng từng byte với đầu ra hàm dựng; sự kiện mang `schemaVersion` 0, 2 hay
  vắng, hoặc `eventType` lạ, bị từ chối nêu đường khoá.
- AC-4: Given đầu vào hàm dựng mang một trường trong danh sách «không bao giờ có» (chủ nhà `ownerName`, số `ownerPhone`,
  giá đáy `floorPrice`, ảnh sổ `titleDeedPhoto`, giá chốt `closePrice`, trạng thái hàng `standardStatus`), When dựng
  từng loại sự kiện, Then hàm dựng từ chối, lỗi nêu tên trường ấy; và một sự kiện hợp lệ bị chèn thêm đúng khoá ấy ở bất
  kỳ cấp nào bị khuôn từ chối nêu đường khoá; quét bằng bộ kiểm rò rỉ trên mọi sự kiện dựng từ căn mồi không thấy giá trị
  nào của lớp ngoài danh mục.
- AC-5: Given một trường chuỗi của sự kiện mang chữ tự do (câu có khoảng trắng, số điện thoại dạng `0900000071` làm mã
  căn, hướng ngoài tập tám hướng, mã trục dài hay có dấu), When dựng hoặc đọc bằng khuôn, Then cả hàm dựng lẫn khuôn từ
  chối, nêu trường; và mọi trường chuỗi của khuôn (đi hết cây khuôn) đều có mẫu chính quy hoặc là tập đóng — không còn
  trường chuỗi tự do nào.
- AC-6: Given hàm dựng của lõi, When gọi với thoả thuận không đúng loại `catalog_confirmation`, không đang bật, ngoài
  hiệu lực, hay thiếu lớp `catalog`, Then không dựng, lỗi nêu thoả thuận; tập khoá phần riêng mà hàm dựng phát ra cho mỗi
  loại bằng đúng danh sách ghim trước, mỗi khoá mang lớp `catalog` — khoá cấp căn tra ở bảng lớp của luật ẩn
  (`LOP_TRUONG`), ba khoá cấp toà ở bảng lớp của khuôn, hai bảng không chung khoá nào (khoá vỏ là danh sách đóng riêng);
  và kiểu sự kiện mang dấu của lõi — một đối tượng tự viết không gán được vào kiểu ấy khi kiểm kiểu.
- AC-7: Given cùng một sàn và người, When dựng sự kiện với cùng khoá bên nhận hai lần, với khoá bên nhận khác, hay cho
  sàn khác, Then mã sàn và mã người mờ trùng nhau ở lần một, khác nhau ở lần hai và lần ba; mã dài 43 ký tự base64url,
  không chứa mã sàn hay mã người gốc; khoá bên nhận vắng hay ngắn hơn 32 byte thì hàm dựng từ chối.
- AC-8: Given khuôn và hàm dựng, When soi các khoá và đối số, Then sự kiện không có khoá nào trỏ tới hàng (lần rao), liên
  hệ, lead, giá hay trạng thái; mốc thời gian là ngày `observedOn` dạng `YYYY-MM-DD` lấy từ ngày đưa vào, và khuôn từ
  chối mốc có giờ.
- AC-9: Given một căn có trong danh mục, When dựng báo sai cho từng trường trong sáu trường báo sai được, Then sự kiện
  hợp lệ mang đúng `field` và `correctValue` theo kiểu của trường; báo sai cho trường ngoài danh sách, giá trị sai kiểu,
  giá trị trùng giá trị danh mục đang có (ở từng trường trong sáu trường, kể cả khi hai bên viết khác dạng mà cùng nghĩa
  sau chuẩn hoá — mã căn chữ thường, hướng nhãn tiếng Việt), hay căn không có trong danh mục (UPI lạ, hoặc toà lạ) bị từ
  chối nêu lý do. Danh mục của ca kiểm là danh mục mẫu của lõi, đúng hình khuôn chiều vào v1 đổ vào.
- AC-10: Given một toà trong danh mục, When dựng khung toà, Then sự kiện hợp lệ khi số tầng nguyên 1–120, tầng bị bỏ
  không trùng, tăng dần, nằm trong 1..số tầng, danh sách trục không trùng và theo mẫu mã trục; tầng bị bỏ vượt số tầng,
  trùng, trục trùng hay toà không có trong danh mục bị từ chối nêu lý do.

## Coverage

Quét không gian bằng morphological-scan (dựng trục riêng từ preset test-matrix — trục mặt/mạng không áp cho khuôn thuần):

- Trục A — tầng chặn: hàm dựng ở lõi | khuôn ở `packages/connect` | trần thoả thuận ở lõi | ràng buộc cơ sở dữ liệu
  [thước CE: SUY-TỪ-REPO `docs/plan/pham-vi-xac-nhan-danh-muc.md` «chặn ở agreementErrors/mayFlow và ở ràng buộc của bảng
  agreements»; bảng hộp thư đi là tầng thứ năm, thuộc hàng 97]
- Trục B — lớp của giá trị đầu vào: `catalog` (đối chứng) | `shareable_listing` | `transaction` | `source` |
  `company_internal` | `custom_field` | `behavior` | chữ tự do | khoá lạ [thước CE: SUY-TỪ-REPO
  `packages/core/src/data-classes.ts` (bảy lớp) + danh sách «không bao giờ có» của issue #94]
- Trục C — loại sự kiện: khung toà | thuộc tính căn | báo sai [thước CE: SUY-TỪ-REPO
  `docs/tri-thuc/raw/2026-11-03-xac-nhan-danh-muc/issue-94.md`]
- Trục D — danh tính: cùng sàn cùng bên nhận | cùng sàn khác bên nhận | khác sàn | khoá bên nhận thiếu [thước CE: NGÀNH
  phía Invest `2026-11-03-danh-ba-xac-nhan-toan-quoc-design.md` §6.2 «rút một công ty hoặc một người», «hai môi giới cùng
  sàn không tính là độc lập»]

Core: A(trần lõi)×B(bảy lớp) → AC-1 · A(CSDL)×B(sáu lớp ngoài danh mục) → AC-2 · A(khuôn, hàm dựng)×B(nguồn, giao dịch,
trạng thái)×C → AC-4 · A(khuôn, hàm dựng)×B(chữ tự do) → AC-5 · A(hàm dựng)×thoả thuận → AC-6 · D → AC-7 · C hợp lệ →
AC-3, AC-9, AC-10 · không trỏ hàng, mốc thô → AC-8.
Later: tầng hộp thư đi (hàng 97) · gom lô làm mờ giờ (hàng 97) · khung toà thấp tầng không trục, tầng tên chữ (phiên bản
khuôn sau).
Never: lớp `behavior`, `custom_field` trong sự kiện — ADR-0017 §6 chỉ mở lớp danh mục; khoá lạ hay chữ tự do đi qua ở bất
kỳ tầng nào.

## Đường đo

Ô cơ hội khai ngưỡng sống/chết bằng chính câu «bật khi» của hàng (không ngưỡng số): đạt khi mỗi trường «không bao giờ
có» và mọi chữ tự do bị luật ẩn từ chối (AC-4, AC-5), thoả thuận loại này mang lớp khác bị lõi và cơ sở dữ liệu cùng từ
chối (AC-1, AC-2), mã mờ ổn định theo bên nhận và không giải ngược được (AC-7). Số đo là kết quả eval máy của các AC ấy —
không cần mã đo mới.

## Out of scope

- Hộp thư đi, API kéo theo số thứ tự, gom lô làm mờ giờ, nơi giữ và xoay khoá bên nhận — hàng 97 `hop-thu-xac-nhan`.
- Token máy — hàng 96. Ai được tạo / bật thoả thuận loại này, nhật ký, danh sách sàn được bật — hàng 98.
- Sinh sự kiện từ công việc, không sinh sự kiện chỉ vì tạo hàng, không điền sẵn giá trị chưa chắc — hàng 100, 101.
- Toà ngoài danh mục, tầng tên chữ (12A, tầng kỹ thuật), khung thấp tầng — phiên bản khuôn sau (Hỏi-3).
- Ô «sàn đã xác minh chủ với sổ» (Hỏi-2).
- Báo lại Invest ở onehub-invest#296 — việc của người, ra khỏi kho.

## Notes

- Migration `040_xac_nhan_danh_muc.sql` — số giữ chỗ cho hàng 95 ở luật đợt 74; bộ chạy ghi sổ theo tên nên áp được sau
  052 trên bản thật.
- Điều kiện của giám sát (trả lời G-0811-7/8, 08/11): 040 chạy SAU 052 trên bản thật nhưng TRƯỚC 041–052 trên cơ sở dữ
  liệu mới, nên chỉ dựa vào đối tượng có từ ≤ 039 (bảng `agreements` ở 001, ràng buộc `agreements_kind_check` ở 035) và
  phải giao hoán với 041–052. Phép đo: bộ cách ly trên cơ sở dữ liệu mới (E2 qua `nhap_tac_tu`) cộng một lần áp lại thân
  040 sau 052 và quét tĩnh migration > 040 (E2).
- Vùng khai thêm (giám sát duyệt G-0811-8): `packages/core/package.json`, `packages/core/src/agreements.test.ts`,
  `packages/connect/src/index.ts`, `packages/db/tests/xac-nhan-danh-muc.test.mjs`, tài liệu thiết kế / kế hoạch / ADR-0027,
  Tham chiếu + Đối chiếu ngành + Sổ điểm biến thiên (chỉ thêm dòng), vẽ lại `PRODUCT-MAP.md`, `LO-TRINH.html` (luật 27).
- Câu hỏi Cổng Phạm vi: Hỏi-1 mốc ngày hay tuần · Hỏi-2 ô xác minh chủ với sổ · Hỏi-3 toà ngoài danh mục · Hỏi-4 giữ cứng
  danh sách trường báo sai · Hỏi-5 cách sinh mã mờ (khó đảo) (thiết kế §6).
- Known limits — chọn ở Cổng Bằng chứng 2026-11-08:
  - Ngoài-1: Hàm dựng chưa kiểm thoả thuận có đúng là của sàn đang dựng hay không; chưa có đường chảy nên chưa ai bị ảnh hưởng, hàng 97 phải đóng chỗ này trước khi dữ liệu chảy thật.
  - Ngoài-2: Mẫu bên Invest chép lại vài giới hạn thay vì lấy chung từ lõi; đổi giới hạn thì phải đổi cả hai bên.
  - Ngoài-4: Tên «Xác nhận danh mục» chưa có trong bảng từ vựng chung.
  - Ngoài-6: Ngày không có thật (như 31/11) vẫn lọt qua hàm dựng nếu nơi gọi đưa sai; ngày do máy chủ cấp nên gần như không xảy ra.
