---
schema_version: 1
feature: Đầu chủ gõ mã căn trùng ở hai toà cùng dự án thì thấy cả hai căn kèm tên toà để chọn, không bị điền lặng lẽ thuộc tính của căn toà khác
slug: can-trung-ma-hai-toa
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api]
status: implemented
design_doc: docs/superpowers/specs/2026-10-31-can-trung-ma-hai-toa-design.md
approved_by: Manh Phan
approved_at: 2026-10-31T14:21:09Z
---

# Acceptance Contract: can-trung-ma-hai-toa

## Context

Hàng 63 của lộ trình (dãy D, đợt dau-chu-dong-vao), đứng trên hàng 9. Mở từ Ngoài-4 của hồ sơ `danh-muc-go-ma-can`: hai
toà cùng dự án có căn trùng mã thì tra hiện ra căn của toà nạp sau mà không báo. Danh mục mẫu không có ca này; danh mục
thật (hàng 10) có thể có. Hàng sửa lõi tra ở `packages/core/src/catalog/` và đường `GET /api/v1/catalog/units/{code}` ở
`packages/api/src/catalog/`. Hạng: máy suy **T2** (không tệp nào thuộc `t3_paths`), trùng hạng hàng lộ trình.

Source input: `docs/plan/lo-trinh.json` hàng 63 · `_acceptance/can-trung-ma-hai-toa/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-10-31-can-trung-ma-hai-toa-design.md` · `_acceptance/danh-muc-go-ma-can/contract.md` Ngoài-4

## Criteria

- AC-1: Given danh mục thử có một dự án không có dòng cách đọc, hai toà «[Mẫu] Toà A1» và «[Mẫu] Toà A2» cùng có căn mã
  `1206` (UPI, diện tích, hướng khác nhau), When tra `1206` (và `  1206 `) có hay không chọn dự án, Then ra `ambiguous`
  với đúng hai ứng viên — mỗi ứng viên mang `buildingName` và thuộc tính của chính căn toà mình — không ra `found`, và
  thứ tự hai ứng viên không đổi khi đảo thứ tự nạp hai toà.
- AC-2: Given dự án có dòng cách đọc mà danh mục ghi trùng mã chuẩn `A-12.06` ở hai toà (dữ liệu nạp lỗi), When tra
  `A-12.06` hay một biến thể viết (`a1206`), Then ra `ambiguous` với hai ứng viên của hai toà — căn nạp sau không đè căn
  nạp trước.
- AC-3: Given danh mục của AC-1, When tra `1206` kèm toà — theo tên toà (`[Mẫu] Toà A1`, cả viết thường hay thừa khoảng)
  hoặc theo khoá toà (`A1`) — Then ra `found` đúng căn của toà ấy (UPI của toà ấy); toà kia ra căn của toà kia; mã chỉ có
  ở toà A1 mà chọn toà A2 (toà có thật) thì ra `not_in_catalog` kèm dự án và mã đã chuẩn hoá — không căn nào của toà A1,
  không báo toà lạ.
- AC-4: Given toà không có trong các dự án đang xét (tên lạ, hay toà có thật nhưng thuộc dự án khác với dự án đã chọn),
  When tra kèm toà ấy, Then lõi ra kết cục toà lạ, không thuộc tính căn nào; API trả 404 `not-found` cho cả hai vế (toà
  lạ, và `?project=` cùng `?building=` của toà thuộc dự án khác), còn cùng toà ấy không chọn dự án thì 200. (cross-layer)
- AC-5: Given đường `GET /api/v1/catalog/units/{code}` trên danh mục của AC-1, When thành viên sàn gọi không kèm toà, kèm
  `?building=` đúng tên toà, và kèm toà lạ, Then lần lượt 200 `ambiguous` hai ứng viên kèm `buildingName`, 200 `found`
  đúng căn, 404 `not-found`; thân 200 chỉ mang khoá bao của kết cục cộng mười trường của `UNIT_ATTRIBUTE_FIELDS`; tham số
  `building` có trong OpenAPI. (cross-layer)
- AC-6: Given dữ liệu mẫu của hàng 5 và danh mục của AC-1, When chạy lệnh đo tỉ lệ tự điền, Then trên dữ liệu mẫu vẫn in
  đúng `tự điền đúng 282/282 (100%) · chưa có 4/4 · điền đoán 0`; trên danh mục thử mã trùng được đếm là hụt và là «nhiều
  căn», không là điền đoán, và dòng in mang ` · nhiều căn 1`; mọi ca kiểm của hàng 9 (lõi, API, đường có Postgres) vẫn
  xanh.

## Coverage

Quét theo khuôn entity-feature của morphological-scan cho thực thể «một lần tra khi danh mục có hơn một căn khớp», làm
tại chỗ trên hợp đồng hàng 9 (trục đã có) [SUY-TỪ-REPO: _acceptance/danh-muc-go-ma-can/contract.md].

- Trục nguồn trùng: hai toà một dự án, dự án không cách đọc (AC-1) | hai toà một dự án, dự án có cách đọc, dữ liệu lỗi
  (AC-2) | hai dự án (hàng 9 AC-7, giữ — AC-6) [thước CE: khuôn `CatalogFeed` không ràng mã căn duy nhất trong dự án]
- Trục chọn: không chọn gì (AC-1, AC-2) | chọn dự án (AC-1) | chọn toà theo tên, theo khoá, viết khác (AC-3) | toà lạ,
  toà khác dự án (AC-4)
- Trục lớp: lõi (AC-1…AC-4) | API có đăng nhập (AC-5) | lệnh đo (AC-6)
- Trục hồi quy: mọi ca hàng 9 (AC-6)
- Later: màn chọn toà; đọc tên toà từ chuỗi gõ (`A1 1206`); ba toà trở lên (cùng đường mã với hai — không ca riêng).
- Never: chọn hộ một căn khi có nhiều căn khớp.

## Đường đo

- Ngưỡng ô cơ hội «tra trả «nhiều căn» kèm cả hai toà, không trả một căn; mã kèm tên toà ra đúng một căn; mọi ca của hàng
  9 vẫn xanh» — số từ lệnh `packages/api/src/catalog/do-ti-le.ts` (thêm đếm «nhiều căn») và các ca kiểm · AC-1, AC-3,
  AC-6 bảo đảm.

## Out of scope

- Màn: hộp chọn toà khi tra ra «nhiều căn», nối ô «Gõ mã căn» — hàng có màn.
- Đọc tên toà từ chính chuỗi gõ (`A1 1206`, `1206 toà A1`) — cần cách đọc theo dự án, chờ mã thật của hàng 10.
- Bảng danh mục dùng chung, nạp danh mục thật, gói Invest — hàng 10.
- Kiểm mã căn duy nhất khi nạp danh mục (báo lỗi dữ liệu nạp) — việc nhận gói của hàng 10.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Bất biến chạm: (1) cách ly — không bảng mới, đường vẫn qua `resolveCompany`; (2) chủ nhà — thân chỉ lớp `catalog`
  (AC-5, hàng 9 AC-9); (3), (4) không chạm.
- Dãy D chạy dev ở cổng 3485, Postgres 5565 (`quy-hang-db-D`).
- Phản biện context sạch: hai lựa chọn máy ghi «đã quyết» thành Hỏi-1 (kết cục chung hay riêng) và Hỏi-2 (cách đếm
  «nhiều căn» trong tỉ lệ §11) — chờ chủ kho ở Cổng Phạm vi; hợp đồng soạn theo khuyến nghị.
- Yêu cầu D-1 (máy duyệt): thêm tệp `packages/api/test-db/catalog/trung-ma-hai-toa.test.ts` và một dòng §12 ở
  `docs/product/tham-chieu.md`.
