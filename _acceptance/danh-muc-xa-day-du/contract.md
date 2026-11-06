---
schema_version: 1
feature: "Lõi địa chỉ biết đủ 3.321 xã, phường, đặc khu của 34 tỉnh theo danh mục chính thống, đổi được xã cũ, tỉnh cũ trước sắp xếp 2025 sang đơn vị mới, và mã hàng 75 đã đối chiếu với nguồn — trước khi hàng 76 lưu khoá"
slug: danh-muc-xa-day-du
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [sdk]
status: implemented
approved_by: Manh Phan
approved_at: 2026-11-06
design_doc: _acceptance/danh-muc-xa-day-du/design.md
---

# Acceptance Contract: danh-muc-xa-day-du

## Context

Hàng dữ liệu tách từ hàng 75 (`dia-chi-chuan`, Hỏi-1 duyệt 05/11). Hàng 75 mới biết 34 tỉnh và bốn phường TP.HCM.
Vòng này nạp danh mục cấp xã đầy đủ và bảng xã cũ → mới, tỉnh cũ → mới từ nguồn chủ kho chọn ở Cổng Phạm vi (Hỏi-1),
đối chiếu mã hàng 75, và sửa hai chỗ của bộ đọc để danh mục cả nước không làm đọc nhầm. Bất biến chạm: không (lõi thuần,
dữ liệu công, không dữ liệu chủ nhà).

Source input: `docs/plan/lo-trinh.json` hàng danh-muc-xa-day-du · `_acceptance/danh-muc-xa-day-du/opportunity.md` ·
`_acceptance/dia-chi-chuan/decisions.jsonl` (d-20261105T115755Z-6, d-20261105T122556Z-10) ·
`packages/core/src/address/danh-muc.ts`.

## Criteria

- AC-1: Given tệp danh mục xã của nguồn đã chép vào kho, When bộ sinh chạy trên tệp ấy, Then bảng xã của lõi trùng từng
  byte với bảng đã commit, có đúng 3.321 mã năm chữ số đôi một khác nhau, mỗi loại (xã, phường, đặc khu) đếm đúng như
  nguồn, mỗi xã trỏ một trong 34 tỉnh, mỗi tỉnh có số xã đúng như nguồn (TP.HCM 168).
- AC-2: Given tệp bảng chuyển đổi của nguồn, When bộ sinh chạy, Then bảng xã cũ trùng từng byte với bảng đã commit; mọi
  mã xã cũ của nguồn (sau làm sạch) có trong bảng; mọi xã mới nhận trỏ một mã có trong bảng xã; mã cũ vào từ hai xã mới
  trở lên đếm đúng như nguồn; mỗi dòng của bảng sửa nguồn (đệm số 0, nhãn tỉnh sai) được dùng ít nhất một lần.
- AC-3: Given tên của mọi tỉnh cũ trước sắp xếp trong bảng chuyển đổi mà không trùng tên một tỉnh mới, When đọc hai dạng
  địa chỉ trọn — «12 Đường Mẫu 1, <Loại> <xã mới mã nhỏ nhất của tỉnh mới nhận>, <Tỉnh|Thành phố> <tên tỉnh cũ>» và «12
  Đường Mẫu 1, <Loại cũ> <xã cũ mã cũ nhỏ nhất của tỉnh cũ có đúng một xã mới nhận>, <huyện cũ>, <Tỉnh|Thành phố> <tên
  tỉnh cũ>» — Then tỉnh đọc ra là tỉnh mới nhận tỉnh cũ đó, kết quả ghi tên tỉnh cũ đã đọc, trạng thái «chuan» với khoá
  `<mã tỉnh mới>|<mã xã mới>|…`; tỉnh cũ vào từ hai tỉnh mới trở lên ra «thiếu tỉnh», không khoá (đo trên danh mục bản sao
  khi nguồn không có ca nào).
- AC-4: Given danh mục 34 tỉnh và bốn phường TP.HCM của hàng 75, When đối chiếu với nguồn, Then mã và tên chính thức của
  34 tỉnh trùng nguồn (ba tên Quảng Ninh, Bắc Ninh, Đồng Nai thành «Thành phố …»), bốn phường trùng mã và tên, mười
  phường cũ Quận 1 trỏ đúng xã mới như bảng chuyển đổi, và bảng trích hàng 73 vẫn khớp danh mục lõi.
- AC-5: Given ma trận viết trước, mỗi tỉnh trong 34 tỉnh một xã mới (mã nhỏ nhất) và một xã cũ vào đúng một xã mới (mã cũ
  nhỏ nhất trong các xã cũ có huyện cũ dạng «Quận …» hay «Huyện …», kèm huyện cũ), When đọc «12 Đường Mẫu 1, <Loại> <tên>, [<huyện cũ>,] <tỉnh>», Then mọi dòng ra «chuan» với khoá
  `<mã tỉnh>|<mã xã mới>|…`; và xã cũ bị tách vào nhiều xã mới ra «cần người chọn» với đúng tập ứng viên của bảng.
- AC-6: Given địa chỉ có tỉnh mà một đoạn không có chữ «Phường», «Xã» đứng trước trùng tên một xã của tỉnh khác (ma trận
  rút từ danh mục), When đọc, Then đoạn ấy không bị đọc thành xã của tỉnh khác; còn đoạn trùng tên xã của chính tỉnh ấy
  vẫn đọc thành xã như hàng 75.
- AC-7: Given 86 cách viết của bộ thử hàng 73 và ảnh khoá `anh-truoc-va.json`, When đọc bằng lõi sau vòng này, Then mọi
  cách viết ra đúng số nhà, tên đường, khoá và trạng thái của ảnh; bộ kiểm của hàng 75 và hàng va-duong-so-n vẫn xanh
  trong cùng lượt.
- AC-8: Given danh mục lõi, When kiểm nguồn, Then mỗi phần (tỉnh, xã, xã cũ, tỉnh cũ) ghi văn bản, nơi đọc, ngày đọc, ngày
  tham chiếu và băm sha256 của tệp nguồn; băm trùng tệp trong kho; và lõi không gọi mạng (bộ kiểm không-mạng của hàng 75
  xanh với bộ sinh và bảng mới trong vùng quét).
- AC-9: Given xã cũ mà huyện cũ chứa nó là «Thành phố <tên>» hay «Thị xã <tên>» (mỗi tỉnh mới một xã cũ, mã cũ nhỏ nhất có
  huyện cũ dạng ấy và đúng một xã mới nhận), When đọc «12 Đường Mẫu 1, <Loại cũ> <tên>, <Thành phố|TP|Thị xã> <tên huyện
  cũ>, <tỉnh>», Then đoạn huyện cũ được đọc là huyện cũ (không phải tỉnh), xã ra đúng xã mới, trạng thái «chuan»; đoạn cuối
  «TP <tên tỉnh>» vẫn đọc là tỉnh; và đoạn «Thành phố <tên>» không có trong danh sách huyện cũ của tỉnh thì không bị lấy làm
  huyện cũ.

## Coverage

Quét không gian (skill morphological-scan, preset entity-feature). Chân sản phẩm: Hỏi-1 hàng 75 và bộ đọc hiện có
[SUY-TỪ-REPO: _acceptance/dia-chi-chuan/decisions.jsonl, packages/core/src/address/doc-dia-chi.ts]. Chân ngành: tệp
tham chiếu chính thức có phiên bản theo ngày như CASS (USPS) và PAF (Bưu điện Anh) [NGÀNH: design.md §Đối chiếu ngành].

- Trục A — phần danh mục: tỉnh | xã mới | xã cũ | tỉnh cũ. [thước CE: bốn phần của `nguon`]
- Trục B — mặt: bộ sinh (tệp nguồn → bảng) | khuôn bảng | bộ đọc. [thước CE: hai vật sinh và một hàm đọc]
- Trục C — cách người gõ đơn vị: tên mới có loại | tên mới không loại | tên cũ kèm huyện cũ (Quận, Huyện, Thị xã, Thành phố) | tên cũ bị tách | tỉnh cũ | tên cũ kèm tỉnh cũ. [thước CE: các nhánh của `docXa` và bước tỉnh]
- Trục D — rủi ro của danh mục cả nước: trùng tên giữa tỉnh | lỗi nguồn | khoá cũ đổi | mạng. [thước CE: luật đọc hàng 75 và bất biến khoá]

Core: A(xã)×B(sinh) ở AC-1 · A(xã cũ)×B(sinh) ở AC-2 · A(tỉnh cũ)×B(đọc) ở AC-3 · A(tỉnh, xã)×đối chiếu ở AC-4 · C×B(đọc)
ở AC-5, AC-9 · tỉnh cũ × xã cũ ở AC-3 · D(trùng tên) ở AC-6 · D(khoá cũ) ở AC-7 · D(lỗi nguồn, mạng) ở AC-8 và AC-2. Later: suy tỉnh từ tên phường;
kéo nguồn định kỳ (Hỏi-2). Never: đoán xã mới cho xã cũ bị tách.

## Đường đo

- Thước: đủ 3.321 đơn vị cấp xã theo nguồn · số từ: bảng xã sinh từ tệp nguồn, đếm mã và loại · bảo đảm bởi: AC-1
- Thước: địa chỉ ghi phường cũ hay tỉnh cũ ra đúng phường, tỉnh mới · số từ: ma trận 34 tỉnh × xã cũ, mọi tỉnh cũ × xã cũ ·
  bảo đảm bởi: AC-3, AC-5, AC-9
- Thước: mã hàng 75 khớp nguồn hoặc lệch được gọi tên và sửa · số từ: đối chiếu 34 tỉnh và bốn phường · bảo đảm bởi: AC-4

## Out of scope

- Suy tỉnh từ tên phường khi người không gõ tỉnh — giữ luật hàng 75 (d-20261105T122556Z-9): thiếu tỉnh thì «cần người
  chọn», không khoá.
- Đoán xã mới cho xã cũ bị tách vào nhiều xã mới.
- Tải danh mục lười ở bên gọi, xuất gói địa chỉ ra ngoài lõi — hàng 76.
- Kéo lại nguồn định kỳ khi danh mục đổi tiếp (theo Hỏi-2 của Cổng Phạm vi) — danh mục đứng ở ngày tham chiếu; ngày ấy ghi
  trong danh mục.
- Lưu khoá, kiểm trùng — hàng 76.

## Notes
