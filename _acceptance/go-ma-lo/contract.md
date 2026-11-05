---
schema_version: 1
feature: Đầu chủ gõ mã lô thấp tầng kiểu nào cũng được và thấy thuộc tính lô tự điền — khu, dãy, loại hình, diện tích đất, số tầng, mặt tiền — như gõ mã căn hộ; mã đọc được mà danh mục chưa có thì báo rõ
slug: go-ma-lo
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api]
status: machine-cleared
approved_by: Manh Phan
approved_at: 2026-11-05
design_doc: _acceptance/go-ma-lo/design.md
---

# Acceptance Contract: go-ma-lo

## Context

Hàng 74 của lộ trình: tra mã lô thấp tầng (khu → dãy → lô, ADR-0016 quyết định 3) ở lõi và qua đường
`GET /api/v1/catalog/lots/{code}`, như tra mã căn hộ của hàng 9. Cách đọc mã lô là dữ liệu của khu. Bộ tra căn hộ và đường
`/catalog/units` không đổi. Bất biến chạm: không (thuộc tính trả ra đều lớp `catalog`, không chủ nhà, không giá).

Source input: `docs/plan/lo-trinh.json` hàng 74 · `_acceptance/go-ma-lo/opportunity.md` · ADR-0016 quyết định 3 · bộ thử
hàng 73 (`packages/db/seed/mau-thap-tang/`).

## Criteria

- AC-1: Given 24 ô mã lô của file bảng hàng bẩn hàng 73 và đáp án của chúng, When tra từng ô, Then mỗi ô ra `found` đúng lô
  đáp án, và khu, dãy, loại hình, diện tích đất, số tầng, mặt tiền bằng đúng lô ấy trong danh mục thấp tầng mẫu.
- AC-2: Given ma trận kiểu viết viết trước (gạch, cách, chấm, gạch chéo, gạch dưới, viết liền, thiếu số 0 đầu, chữ thường,
  thừa khoảng trắng, «lô … dãy …», «dãy … lô …», «Lô <mã>») áp cho MỌI lô của khu mẫu, When tra, Then mọi cách viết ra đúng
  lô của nó.
- AC-3: Given mã đọc được mà danh mục không có (lô ngoài dãy như «LK1-15», dãy không có như «LK9-01»), When tra, Then ra
  `not_in_catalog` kèm khu, dãy, mã chuẩn đã đọc và dãy có trong danh mục hay không; không thuộc tính lô nào, không ra lô khác.
- AC-4: Given mọi lô của khu mẫu, When tra mọi cách viết của ma trận, Then hai lô khác nhau không bao giờ ra cùng một lô:
  không cách viết nào của lô A ra lô B, và mã chuẩn của các lô đôi một khác nhau.
- AC-5: Given chữ không đọc được (rỗng, «12», «ABC», mã căn hộ «A-12.06») và ma trận mã gần trúng viết trước («LK1-02A»,
  «LK1-020», «LK1-102», «LK12-01», «LK1-02-1», «LK1-02 xyz»), When tra trên danh mục lô, Then không dòng nào ra `found`; chữ
  không đọc được ra `unreadable` kèm mẫu mã của từng khu; không đoán lô.
- AC-6: Given mã trùng ở hai khu (khu thứ hai có hoặc không có cách đọc riêng), When tra mọi kiểu viết của ma trận AC-2 không
  chọn khu, Then mọi dòng ra `ambiguous` với đúng hai ứng viên, không chọn hộ; chọn khu thì ra `found` đúng lô của khu ấy; khu
  không có thì `unknown_subdivision`.
- AC-7: Given kết quả `found` và ứng viên `ambiguous`, When đọc các trường, Then tập trường bằng đúng danh sách thuộc tính lô
  đã khai, mỗi trường thuộc lớp `catalog`; không trường giá, chủ nhà, ghi chú; với mọi lô, trường loại hình không dùng (theo
  bảng loại hình hàng 72) là `null` và trường có dùng bằng đúng giá trị danh mục.
- AC-8: Given cách đọc mã lô của khu mẫu và danh mục của khu, When đối chiếu, Then mọi mã danh mục đọc được, mã chuẩn đọc ra
  bằng mã danh mục và dãy đọc ra bằng dãy chứa lô.
- AC-9: Given đường `GET /api/v1/catalog/lots/{code}` trên khu thấp tầng mẫu truyền vào, When gọi chưa đăng nhập, chưa có
  sàn, và có sàn với «lk1 02», «LK1-15», «ABC», Then lần lượt 401, 403 (giống hệt đường tra căn), rồi 200 với `found` đúng lô
  LK1-02, `not_in_catalog`, `unreadable`; thân trả chỉ mang trường đã khai; danh mục lô mặc định theo Hỏi-1; đường
  `/catalog/units/A-12.06` vẫn trả như trước.

## Coverage

Quét không gian (skill morphological-scan, preset test-matrix). Chân sản phẩm: ADR-0016 quyết định 3, bộ tra căn hộ hàng
9, bộ thử hàng 73 [SUY-TỪ-REPO: docs/adr/0016-moi-loai-hinh.md, packages/core/src/catalog/lookup.ts,
packages/db/seed/mau-thap-tang/dap-an-thap-tang.json]. Chân ngành: RESO DD 2.1 (`SubdivisionName`, `UnitNumber`,
`LotSizeArea`, `StoriesTotal`, `FrontageLength`) [NGÀNH: design.md §Đối chiếu ngành].

- Trục A — chữ gõ: đúng mã | khác dấu phân cách | viết liền | thiếu số 0 | chữ thường, thừa khoảng trắng | có chữ «lô», «dãy» | đảo thứ tự. [thước CE: ma trận kiểu viết]
- Trục B — kết cục: found | not_in_catalog (lô không có · dãy không có) | unreadable | ambiguous | unknown_subdivision. [thước CE: bảng kết cục của design]
- Trục C — loại hình: Townhouse (liền kề, shophouse) | Single Family Residence | Unimproved Land. [thước CE: `PROPERTY_SUBTYPE_FIELDS`]
- Trục D — mặt: lõi | đường API (vào cửa, thân trả). [thước CE: vùng hàng]

Core: A×B(found)×C ở AC-1, AC-2 · B(not_in_catalog) ở AC-3 · tính đơn ánh ở AC-4 · B(unreadable) ở AC-5 · B(ambiguous,
unknown_subdivision) ở AC-6 · thân trả ở AC-7 · dữ liệu cách đọc ở AC-8 · D(API) ở AC-9. Later: ô gõ mã trên màn (hàng 77);
lô của sàn (hàng 76); dãy trong khuôn Invest (LH11). Never: đoán lô gần đúng (ADR-0016 «không đoán»).

## Đường đo

- Thước: gõ mã lô kiểu nào cũng ra đúng lô và tự điền · số từ: 24 ô mã lô của file bẩn hàng 73 so với đáp án và danh mục ·
  bảo đảm bởi: AC-1, AC-2
- Thước: mã đọc được mà danh mục chưa có thì báo rõ, không đoán · số từ: ma trận mã ngoài danh mục · bảo đảm bởi: AC-3, AC-5
- Thước: hai lô khác nhau không bao giờ ra cùng một lô · số từ: mọi cách viết × mọi lô, đếm cặp lệch · bảo đảm bởi: AC-4

## Out of scope

- Ô gõ mã lô trên màn (ô nhận lead, hồ sơ căn) — hàng 77 (LH7).
- Lô của sàn trong cơ sở dữ liệu, căn ngoài khu — hàng 76.
- Khuôn `CatalogFeed` có cấp dãy để Invest cấp khu thấp tầng — mục chờ LH11 (`packages/connect`).
- Đổi bộ tra căn hộ hay đường `/catalog/units`.

## Notes

- Ngoài-1 (máy định tuyến 2026-11-05, đề xuất S4 known-limits): Khi sau này thêm một khu mới mà cách đọc mã khai lệch với danh mục, đầu chủ gõ đúng mã vẫn bị báo lô chưa có, và không ai nhận ra lỗi cấu hình. Hiện chưa ai gặp vì chỉ có khu mẫu đã kiểm. — `packages/core/src/catalog/lot-lookup.ts`
