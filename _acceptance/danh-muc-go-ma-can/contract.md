---
schema_version: 1
feature: Đầu chủ gõ mã căn và thấy thuộc tính căn tự điền theo cách đọc mã của dự án; mã chưa có trong danh mục thì báo rõ
slug: danh-muc-go-ma-can
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api]
status: draft
design_doc: docs/superpowers/specs/2026-10-31-danh-muc-go-ma-can-design.md
---

# Acceptance Contract: danh-muc-go-ma-can

## Context

Hàng 9 của lộ trình (nền, dãy D, đợt nen-2), đứng trên hàng 5 (dữ liệu mẫu) và hàng 8 (lõi hàng). Tham chiếu §1 «gõ mã
căn là đủ thông tin», §4 dòng «Danh mục», §11 «Tỉ lệ mã căn tự điền được». Hàng này dựng lõi đọc mã căn ở
`packages/core/src/catalog/` và một đường đọc `GET /api/v1/catalog/units/{code}` ở `packages/api/src/catalog/`, chạy trên
danh mục mẫu của hàng 5. Chưa có màn, chưa có bảng danh mục.

Hạng: máy suy **T2** (không tệp nào thuộc `t3_paths`); hàng lộ trình ghi **T3** — khác vì thiết kế không đụng cơ sở dữ
liệu (bảng danh mục dùng chung để cho hàng 10). Chọn hạng là câu **Hỏi-4** cho chủ kho ở Cổng Phạm vi.

Source input: `docs/plan/lo-trinh.json` hàng 9 · `_acceptance/danh-muc-go-ma-can/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-10-31-danh-muc-go-ma-can-design.md`

## Criteria

- AC-1: Given danh mục mẫu và mã chuẩn của một căn có trong danh mục (vd `A-12.06`), When tra mã, Then ra `found` với
  đúng mười thuộc tính của căn ấy theo danh mục — dự án (khoá, tên), toà, mã căn chuẩn, UPI, tầng, trục, diện tích, số
  phòng ngủ, hướng.
- AC-2: Given cùng căn, When gõ các biến thể viết đúng cách đọc của dự án — chữ thường, khoảng trắng hai đầu, dấu phân
  cách `-` `.` `/` `_` hay khoảng trắng, viết liền (`A1206`), thiếu số 0 đầu khi có dấu phân cách (`a 12 6`) — Then mọi
  biến thể ra cùng căn và cùng mã chuẩn `A-12.06`.
- AC-3: Given mã đọc được theo cách đọc của dự án mà danh mục không có (toà lạ `C-01.01`, tầng ngoài dải `A-16.01`, trục
  ngoài dải `A-01.07`), When tra, Then ra `not_in_catalog` kèm mã chuẩn đã đọc và không một thuộc tính căn nào — không
  điền đoán.
- AC-4: Given chuỗi không đọc được theo cách đọc của dự án nào (rỗng, `XYZ`, `A-12`, `A-12.06.01`, `12.06`), When tra,
  Then ra `unreadable` kèm mẫu mã của từng dự án (`A-12.06` cho dự án mẫu), không thuộc tính nào.
- AC-5: Given cách đọc mã của dự án mẫu (một dòng dữ liệu trong bảng cách đọc), When đối chiếu với từng căn trong danh
  mục mẫu, Then cả 180/180 căn: mã danh mục đọc được, mã chuẩn đọc ra trùng mã danh mục, toà/tầng/trục đọc ra trùng
  toà/tầng/trục danh mục ghi; thêm một dự án thứ hai chỉ bằng một dòng cách đọc mới thì tra được căn của dự án ấy mà
  không sửa hàm đọc.
- AC-6: Given một căn mà danh mục để trống một trường (diện tích, phòng ngủ, hướng, trục hay tầng là `null`), When tra
  ra `found`, Then trường ấy trả `null`, không lấy từ căn khác (cùng trục, cùng toà).
- AC-7: Given mã khớp căn ở hai dự án, When tra không chọn dự án, Then ra `ambiguous` với đủ hai ứng viên và không chọn
  hộ; chọn một dự án thì chỉ ra căn của dự án ấy; chọn dự án không có trong danh mục thì API trả 404 `not-found`.
- AC-8: Given đường `GET /api/v1/catalog/units/{code}`, When gọi chưa đăng nhập, chưa thuộc sàn, thuộc nhiều sàn chưa
  chọn, Then lần lượt 401 `unauthenticated`, 403 `no-company`, 409 `select-company`; thành viên sàn ở mọi vai (Telesales,
  Đầu chủ, Đầu khách, Trưởng nhóm, Quản trị sàn) nhận 200 với kết quả tra như lõi; đường có trong OpenAPI. (cross-layer)
- AC-9: Given cả bốn kết cục tra qua API (found, not_in_catalog, unreadable, ambiguous), When đọc thân trả về, Then
  tập mọi khoá ở mọi cấp bằng đúng tập cho phép viết trước — khoá bao của từng kết cục cộng mười trường khai trong
  `UNIT_ATTRIBUTE_FIELDS`, mỗi trường thuộc lớp `catalog` (trần `external`); không khoá nào khác — kể cả khi gói mẫu nạp
  vào có phần chủ nhà mẫu. (cross-layer)
- AC-10: Given dữ liệu mẫu của hàng 5, When chạy lệnh đo tỉ lệ tự điền, Then in và đạt: 47 mã căn sàn đã gõ (40 hàng,
  7 lead có mã) cộng năm kiểu viết lại của mỗi mã ra `found` đúng căn — «đúng căn» so với UPI gói ghi cho hàng, và với
  căn danh mục cùng toà và cùng mã căn cho lead — tỉ lệ 100%; mọi mã trong bộ ngoài danh mục ra `not_in_catalog`; số điền
  đoán = 0.

## Coverage

Quét morphological-scan, preset entity-feature, cho thực thể «căn trong danh mục qua mã gõ». Chân sản phẩm: Tham chiếu
§1, §4, §11 [SUY-TỪ-REPO: docs/product/tham-chieu.md], dữ liệu mẫu [SUY-TỪ-REPO: packages/db/seed/mau/du-lieu-mau.json].
Chân ngành: tên trường theo RESO Data Dictionary [NGÀNH: RESO DD 2.x — UnitNumber, BuildingName, LivingArea,
BedroomsTotal, DirectionFaces]; nhập tin tự điền từ hồ sơ có sẵn [NGÀNH cận kề: ô nhập tin MLS tự điền từ hồ sơ thuế] —
đủ-để-bắt-đầu, mã thật đầu tiên của dự án thử đưa ngược vào trục chuỗi gõ.

- Trục chuỗi gõ: mã chuẩn (AC-1) | biến thể viết đúng cách đọc (AC-2) | đọc được nhưng ngoài danh mục (AC-3) | không đọc
  được (AC-4) [thước CE: cột «Mã căn» của hai file Excel mẫu và mã trong lead mẫu; biến thể: [GIẢ ĐỊNH] các kiểu viết của
  AC-2 là đủ — chờ mã thật]
- Trục danh mục: một dự án có cách đọc (AC-1, AC-5) | nhiều dự án trùng mã (AC-7) | dự án không có dòng cách đọc — chỉ
  khớp đúng mã sau chuẩn hoá (AC-5 vế dự án thứ hai) | trường danh mục trống (AC-6) [thước CE: khuôn `CatalogFeed`
  (trường nullable)]
- Trục người gọi: chưa đăng nhập · chưa có sàn · nhiều sàn chưa chọn · thành viên năm vai (AC-8) [thước CE: CONTEXT.md
  dòng «Vai»]
- Trục dữ liệu ra: chỉ lớp `catalog` (AC-9) | tỉ lệ tự điền trên dữ liệu mẫu (AC-10) [thước CE: data-classes.ts,
  Tham chiếu §11]
- Later: gợi ý mã gần đúng; «Báo sai thông tin căn»; nối ô «Gõ mã căn» trên màn; gắn mã danh mục vào hàng; cách đọc mã
  nhà phố, lô thấp tầng; bảng danh mục dùng chung (hàng 10).
- Never: đoán thuộc tính khi danh mục thiếu — trái ngưỡng «không điền đoán».

## Đường đo

- Ngưỡng ô cơ hội «mọi mã căn có trong danh mục điền đúng …; mã chưa có thì báo rõ, không điền đoán» — số từ lệnh
  `packages/api/src/catalog/do-ti-le.ts` (tỉ lệ tự điền đúng, số «chưa có», số điền đoán) · AC-10 bảo đảm lệnh có và đạt.

## Out of scope

- Bảng danh mục dùng chung trong cơ sở dữ liệu, nhận gói Invest, nạp danh mục thật — hàng 10.
- Màn: nối ô «Gõ mã căn» của vỏ, hồ sơ căn, tự điền vào form lead hay hàng — hàng có màn.
- Gắn mã căn danh mục vào hàng (hàng hiện gắn bằng chữ toà + mã căn) — cần migration, hàng nạp danh mục.
- Gợi ý mã gần đúng, «Báo sai thông tin căn», cách đọc mã nhà phố và lô thấp tầng.
- Đo tỉ lệ tự điền trên mã thật của hai tuần thử (Tham chiếu §11) — lệnh đo hàng này chỉ đọc gói mẫu; nhận nguồn mã và
  danh mục khác làm việc cùng hàng 10.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Bất biến chạm: (1) cách ly — không bảng mới; đường đọc qua `resolveCompany` dưới luật theo dòng; (2) chủ nhà — kết quả
  chỉ mang lớp `catalog` (AC-9); (3), (4) không chạm.
- Hỏi-1 (dự án thử) và Hỏi-2 (nguồn danh mục) — giám sát đợt trả theo khuyến nghị (yêu cầu D-2, D-3); chủ kho đổi được ở
  Cổng Phạm vi. Hỏi-3 (bản thật phục vụ danh mục mẫu tới hàng 10) và Hỏi-4 (hạng T2 hay T3) — từ phản biện context sạch,
  chờ chủ kho.
- Dãy D chạy dev ở cổng 3473, Postgres 5553 (`quy-hang-db-D`).
