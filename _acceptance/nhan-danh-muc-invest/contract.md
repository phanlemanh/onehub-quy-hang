---
schema_version: 1
feature: Gói danh mục Invest đẩy sang theo khuôn phiên bản 1 được nhận vào vùng danh mục dùng chung khi thoả thuận đang bật; gói sai khuôn hay thoả thuận tắt bị từ chối
slug: nhan-danh-muc-invest
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, db]
status: approved
design_doc: docs/superpowers/specs/2026-10-31-nhan-danh-muc-invest-design.md
approved_by: Manh Phan
approved_at: 2026-11-01T00:45:00Z
---

# Acceptance Contract: nhan-danh-muc-invest

## Context

Hàng 10 của lộ trình (dãy D, đợt dau-chu-dong-vao), đứng trên hàng 9. ADR-0017 §5 (kho onehub-invest): Invest đẩy gói
danh mục theo khuôn của loại kết nối «nguồn danh mục», khuôn nằm ở kho này, thoả thuận tắt là dừng chảy ngay. Hạng
**T3** (chạm `packages/connect/**` và `packages/db/**`), trùng hạng hàng lộ trình. Bất biến chạm: (1) cách ly, (2) chủ
nhà không rời công ty.

Source input: `docs/plan/lo-trinh.json` hàng 10 · `_acceptance/nhan-danh-muc-invest/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-10-31-nhan-danh-muc-invest-design.md` · luật đợt 22, 24

## Criteria

- AC-1: Given một gói danh mục mẫu viết theo khuôn phiên bản 1 (khu `subdivisionKey`/`subdivisionName`, toà
  `buildingKey`/`buildingName`, căn `unitNumber`, loại hình `propertyType`/`propertySubType`, UPI `urn:onehub:upi:…`,
  có cả một căn hộ và một nhà phố mang `lotSizeArea`, `storiesTotal`), When đọc gói bằng khuôn, Then gói hợp lệ và đọc
  ra đúng số khu, toà, căn cùng mọi trường đã viết; số phiên bản khuôn là 1; danh mục mẫu của lõi bọc thành gói v1 cũng
  hợp lệ; gói có cặp loại hình không có trong bảng của lõi hoặc căn mang trường loại hình không dùng bị chính khuôn từ
  chối, nêu đường tới căn và tên trường.
- AC-2: Given gói đúng khuôn mà thêm một khoá lạ ở một cấp (gốc, khu, toà, căn — kể cả khoá mang tên chủ nhà như
  `ownerPhone`), When đọc gói, Then gói bị từ chối, lỗi nêu đúng đường khoá ở đúng cấp ấy; cùng gói bỏ khoá lạ thì hợp lệ.
- AC-3: Given gói mang `schemaVersion` khác 1 (0, 2, vắng) hoặc có hai căn trùng UPI, When đọc gói, Then gói bị từ chối
  với lỗi nêu phiên bản nhận được hoặc UPI trùng.
- AC-4: Given sàn nằm trong danh sách công ty được nền tin ghi danh mục và có thoả thuận `catalog_source` chiều vào, đang bật, trong hiệu lực, có lớp `catalog`, When quản trị
  sàn gửi gói đúng khuôn tới `POST /api/v1/catalog/feeds`, Then API trả 200 với số khu, toà, căn đã nhận, và vùng danh
  mục dùng chung có đúng các căn ấy với đúng thuộc tính. (cross-layer)
- AC-5: Given gói của AC-4 đã nhận, When gửi lại đúng gói ấy, Then số dòng của vùng dùng chung không đổi (không nhân
  đôi) và API báo 0 căn mới; gửi gói đổi diện tích một căn thì API báo 1 căn cập nhật, 0 căn mới, đúng căn ấy cập nhật,
  các căn khác giữ nguyên. (cross-layer)
- AC-6: Given thoả thuận của sàn tạm dừng, đã kết thúc, hết hạn, chưa tới ngày hiệu lực, thiếu lớp `catalog`, khác loại
  (`lead_source` đang bật có lớp `catalog`), chiều ra (`catalog_source` `outbound`), hoặc sàn không có thoả thuận nào,
  hoặc sàn có thoả thuận đang bật mà không nằm trong danh sách tin, When gửi gói đúng khuôn, Then API trả 403 `agreement-inactive` và không một dòng nào của vùng
  dùng chung (bảng khu lẫn bảng căn) được ghi — kể cả khi thoả thuận đổi trạng thái giữa lúc cửa nhận kiểm và lúc ghi;
  bật lại thoả thuận thì cùng gói được nhận. (cross-layer)
- AC-7: Given gói sai khuôn (AC-2, AC-3) hoặc sai loại hình (cặp `Residential/Land` không có trong bảng loại hình của
  lõi, căn hộ mang `lotSizeArea`), When gửi tới cửa nhận dù thoả thuận đang bật, Then API trả 422 `invalid-feed` kèm
  danh sách đường khoá lỗi (với lỗi loại hình: đường tới căn và tên trường) và không một dòng nào được ghi — kể cả khi
  lỗi nằm ở căn cuối gói. (cross-layer)
- AC-8: Given vai `quy_hang_app` dưới luật theo dòng, When một sàn ghi thẳng vào vùng dùng chung mà thoả thuận nó
  trỏ tới không hợp lệ (không có, tạm dừng, đã kết thúc, hết hạn, chưa tới ngày hiệu lực, thiếu lớp `catalog`, khác
  loại, chiều ra, thuộc một công ty khác),
  hoặc có thoả thuận tự tạo đang bật mà không nằm trong danh sách tin, hoặc xoá một dòng, hay tự thêm mình vào danh
  sách tin, Then cơ sở dữ liệu từ chối bằng lỗi quyền (SQLSTATE `42501`), còn cùng câu lệnh với sàn được tin có thoả
  thuận hợp lệ thì thành công; mọi sàn (và lời gọi chưa đặt sàn) đọc được vùng dùng chung; ba bảng mới bật và ép luật
  theo dòng (đọc thẳng cờ của từng bảng, không chỉ qua ca quét chung).
- AC-9: Given đường nhận, When gọi chưa đăng nhập, chưa thuộc sàn, hoặc bằng vai không phải quản trị sàn, Then lần lượt
  401 `unauthenticated`, 403 `no-company`, 403 `admin-required`; đường có trong OpenAPI; mọi ca của hàng 9, hàng 63 và
  hàng 72 (lõi, API, Postgres) vẫn xanh.
- AC-10: Given vùng dùng chung sau migration, When đọc tập cột của bảng khu và bảng căn, Then đúng bằng danh sách
  viết trước trong ca kiểm — không cột nào của lớp khác `catalog` (không chủ nhà, giá, số điện thoại, ảnh).
- AC-11: Given hai sàn đều nằm trong danh sách được tin và mỗi sàn đã nạp một gói, When một sàn — hoặc lời gọi chưa
  đặt sàn — đọc danh sách tin và đọc mã thoả thuận trên dòng khu, căn của vùng dùng chung bằng vai `quy_hang_app`,
  Then sàn ấy chỉ thấy đúng một dòng danh sách tin là của chính mình (lời gọi chưa đặt sàn thấy 0 dòng), không đọc
  được mã thoả thuận của bất kỳ dòng khu, căn nào (lỗi quyền 42501), vẫn đọc được mọi cột danh mục của mọi dòng; cửa
  nhận vẫn nhận gói của sàn được tin như AC-4. (Ngoài-1 hàng 10, chủ kho «trả 10 sửa» 01/11 — bất biến 1.)

## Coverage

Quét theo khuôn entity-feature của morphological-scan cho thực thể «một gói danh mục đi qua cửa nhận», làm tại chỗ trên
ADR-0017 §5 và khuôn v0 [SUY-TỪ-REPO: packages/connect/src/catalog-feed.ts].

- Trục khuôn: đúng (AC-1) | khoá lạ từng cấp (AC-2) | phiên bản sai, UPI trùng (AC-3) | loại hình sai (AC-7) [thước CE: RESO DD 2.1 —
  SubdivisionName, BuildingName, UnitNumber, PropertyType, PropertySubType]
- Trục thoả thuận: đang bật và được tin (AC-4) | đang bật mà không được tin (AC-6, AC-8) | tạm dừng, kết thúc, hết hạn,
  chưa hiệu lực, thiếu lớp, khác loại, chiều ra, không có (AC-6, AC-8) | bật lại (AC-6) [thước CE: `mayFlow` của `packages/core/src/agreements.ts`]
- Trục lặp: gói lần đầu (AC-4) | gửi lại y nguyên (AC-5) | gửi lại có thay đổi (AC-5)
- Trục lớp chặn: lõi khuôn (AC-1…AC-3) | API (AC-4…AC-7, AC-9) | cơ sở dữ liệu (AC-8, AC-10, AC-11)
- Trục người gọi: chưa đăng nhập · chưa có sàn · không phải quản trị · quản trị (AC-9, AC-4)
- Later: khoá máy cho Invest tự đẩy; số thị trường và tin rao trong khuôn; đường tra đọc vùng dùng chung; gói cũ hơn
  gói đã nhận (theo mốc đo); xoá căn không còn trong gói.
- Never: nhận một phần gói hỏng; trường của lớp khác `catalog` trong vùng dùng chung.

## Đường đo

- Ngưỡng ô cơ hội «Gói đúng khuôn nạp được và chạy lại không nhân đôi; khoá lạ bị từ chối; tắt thoả thuận thì dừng
  nhận ngay» — số từ các ca kiểm của cửa nhận trên Postgres dãy (số dòng trước/sau, mã trả) · AC-4, AC-5, AC-2, AC-6
  bảo đảm.

## Out of scope

- Đường tra mã căn đọc vùng dùng chung thay danh mục mẫu (Hỏi-3) — hàng kế.
- Khoá máy cho Invest tự đẩy không qua phiên người (Hỏi-2).
- Số thị trường, tin rao công khai, mặt bằng theo trục trong khuôn.
- Phía Invest đẩy gói thật (luật đợt 22: việc ngoài kho).

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Dãy D chạy dev ở cổng 3485, Postgres 5565 (`quy-hang-db-D`). Migration 010 và ADR-0015 giữ chỗ (luật 24).
- Bất biến 1 (cách ly): vùng danh mục dùng chung không thuộc riêng công ty nào — Tham chiếu chốt «chỉ danh mục là dùng
  chung». Luật theo dòng vẫn bật và ép: đọc chung là chủ ý, ghi chỉ qua công ty được tin có thoả thuận đang bật, không
  ai xoá; dữ liệu của sàn (hàng, chủ nhà, lead) không có cột nào ở vùng này. Ca kiểm AC-8 chứng sàn thường không ghi
  được.
- AC-1 (vế luật loại hình trong khuôn) viết theo khuyến nghị của Hỏi-5; chủ kho chọn lối kia thì vế ấy chuyển sang
  AC-7 (cửa nhận kiểm), không thêm tiêu chí. Hỏi-4 không đổi tiêu chí nào — chỉ đổi chỗ đặt điều kiện loại.
- Hàng này nâng số phiên bản khuôn cấp vào 0 → 1, xử hàng 72 Ngoài-4 (đổi tên khoá chưa nâng số) và Ngoài-5 (khuôn
  chưa chở trường nhà thấp tầng, đất).
- Yêu cầu D-4: chạm tệp ngoài vùng của hàng (migration, đường API, ADR, Tham chiếu).
- Known limits — chọn ở Cổng Bằng chứng 2026-11-01 (trước lần trả lại; Ngoài-1 nâng thành AC-11):
  - Ngoài-2: Khi hạ tầng thiếu quyền do cấu hình sai, người gửi gói vẫn chỉ thấy «thoả thuận không hiệu lực», nên tìm nguyên nhân thật chậm hơn.
