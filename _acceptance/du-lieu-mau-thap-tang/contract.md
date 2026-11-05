---
schema_version: 1
feature: Bộ dữ liệu mẫu thứ hai — một khu thấp tầng có dãy và lô nhà phố, biệt thự, đất; nhà và đất ngoài khu ở vài phường; một file bảng hàng thấp tầng bẩn có đáp án; lead và chủ nhà giả — sinh từ khuôn, mọi bản ghi mang nhãn mẫu
slug: du-lieu-mau-thap-tang
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [cli, db]
status: draft
approved_by:
approved_at:
design_doc: _acceptance/du-lieu-mau-thap-tang/design.md
---

# Acceptance Contract: du-lieu-mau-thap-tang

## Context

Hàng 73 của lộ trình: bộ dữ liệu mẫu thứ hai cho căn thấp tầng trong khu (khu → dãy → lô) và nhà, đất ngoài khu (định
danh bằng địa chỉ), để các hàng 74–80 đo trên dữ liệu giả có nhãn và có đáp án. Sinh tất định từ một hạt giống; phần ghi
được vào bảng hiện có (người, vùng phụ trách) nạp vào «[Mẫu] Sàn thử»; lô, căn ngoài khu, hàng, chủ nhà, lead nằm trong
tệp chờ hàng 76. Bất biến chạm: 2 (chủ nhà là dữ liệu giả, số dạng mẫu) — không nới gì; không bảng mới, không migration.

Source input: `docs/plan/lo-trinh.json` hàng 73 · `_acceptance/du-lieu-mau-thap-tang/opportunity.md` · ADR-0016
quyết định 1, 3, 5.

## Criteria

- AC-1: Given cùng hạt giống, When lệnh sinh thấp tầng chạy hai lần trong hai tiến trình riêng, Then bộ dữ liệu, file
  bẩn và đáp án trùng nhau từng byte và trùng tệp đã commit; `--kiem` trên bản sao bị sửa một byte thoát 1; hạt giống
  khác thì bộ dữ liệu khác.
- AC-2: Given danh mục đơn vị hành chính trích, When đọc, Then nó ghi nguồn (số nghị quyết) và ngày đọc; có một tỉnh,
  bốn phường mới, mười phường cũ, trong đó ít nhất một phường cũ gộp trọn vào một phường mới và ba phường cũ bị tách vào
  hai phường mới; mọi tên tỉnh, phường xuất hiện trong bộ dữ liệu, file bẩn và địa chỉ thử đều có trong danh mục ấy.
- AC-3: Given khu thấp tầng mẫu, When đọc danh mục khu → dãy → lô, Then mỗi lô qua khuôn `CatalogUnit` và bảng loại hình
  của lõi không báo lỗi; có đủ ba loại hình thấp tầng (`Townhouse`, `Single Family Residence`, `Unimproved Land`); mã lô
  duy nhất và tách ra đúng dãy chứa nó.
- AC-4: Given căn ngoài khu mẫu, When đọc địa chỉ chuẩn, Then tên đường luôn là «Đường Mẫu N», số nhà sinh có cả mặt
  đường lẫn hẻm hai, ba cấp; căn trải ít nhất ba phường mới; có đủ ba loại hình thấp tầng; không hai căn cùng địa chỉ chuẩn.
- AC-5: Given bộ địa chỉ thử, When so mỗi cách viết với đáp án, Then có đủ mọi kiểu viết của ma trận viết trước (phường
  mới · phường cũ gộp trọn · phường cũ bị tách · ba kiểu hẻm · viết tắt và không dấu · thiếu số nhà); mọi cách viết của
  cùng một căn có cùng căn đích; phường cũ bị tách có đáp án «cần người chọn» kèm đúng các phường mới nhận nó; thiếu số
  nhà có đáp án nói thiếu số nhà; các cặp gần trùng có căn đích khác nhau; số nhà, số đường và phường đọc từ chữ của mỗi
  cách viết khớp đúng căn đích của nó.
- AC-6: Given file bẩn đọc lại bằng bộ đọc độc lập, When so với đáp án, Then dòng tiêu đề đúng, mọi cột có đích, mọi ô có
  giá trị đúng bằng trường tương ứng của bộ dữ liệu (căn hộ: của danh mục hàng 5); mỗi lỗi trong danh sách lỗi cấy viết
  trước xuất hiện ít nhất một lần và mỗi lỗi cấy có nhãn; mỗi ô thật của file giải theo nhãn của nó ra đúng giá trị đúng
  của đáp án (ô sạch bằng thẳng); file có đủ bốn loại hình.
- AC-7: Given hàng, chủ nhà, lead mẫu, When kiểm luật Tham chiếu, Then hàng phủ sáu trạng thái và bốn loại hình; không căn
  nào có hai hàng mở, kể cả tính chung với hàng của bộ hàng 5; mọi căn của một chủ nhà cùng một đầu chủ; có đủ bảy ca lead
  viết trước (biết lô · chỉ biết dãy · ngoài khu đủ địa chỉ · ngoài khu thiếu số nhà · trùng lô đang có hàng mở · trùng nhà
  ngoài khu đang có hàng mở viết lệch · trùng số chủ nhà đã có), mỗi ca kèm đáp án.
- AC-8: Given bộ dữ liệu, file bẩn, đáp án và các dòng đã nạp, When quét toàn văn, Then mọi số điện thoại (kể cả dạng chấm,
  liền, «+84» của file bẩn) quy về dạng `0900 000 0xx`; số của bộ này không trùng số của bộ hàng 5 trừ ca trùng cố ý; mọi
  email thuộc miền mẫu; mọi tên người mở đầu «[Mẫu]»; mọi chuỗi địa chỉ chỉ gồm số nhà, «Đường Mẫu N» và tên
  trong danh mục trích; mọi bản ghi mang nhãn mẫu. Chèn
  một số, email, tên người hay tên đường khác dạng vào bản sao thì bài quét đỏ đúng loại.
- AC-9: Given Postgres đã áp migration, When nạp thấp tầng hai lần — trên cơ sở dữ liệu trống và sau khi đã nạp bộ hàng 5 —
  rồi chạy lệnh xoá mẫu một lần, Then chỉ có một sàn mẫu và hai bộ cùng có mặt; lần nạp hai không đổi dòng nào; mọi dòng lần nạp tạo mang nhãn mẫu; sau lệnh xoá không còn dòng nào của hai bộ mẫu; sàn và tài khoản đối
  chứng không mang nhãn còn nguyên.

## Coverage

Quét không gian (skill morphological-scan, preset test-matrix). Chân sản phẩm: ADR-0016, `property-type.ts`, bộ thử hàng
64 [SUY-TỪ-REPO: docs/adr/0016-moi-loai-hinh.md, packages/core/src/catalog/property-type.ts,
packages/core/test/import/sinh.ts]. Chân ngành: RESO Data Dictionary 2.1 (`PropertySubType`, `UnparsedAddress`,
`StreetNumber`) [NGÀNH: RESO DD 2.1, đọc ở ADR-0016]; địa giới hai cấp theo Nghị quyết 1685/NQ-UBTVQH15.

- Trục A — cách định danh căn: trong khu có toà (hàng 5) | trong khu dãy · lô | ngoài khu theo địa chỉ. [thước CE: ADR-0016 quyết định 3]
- Trục B — loại hình: `Condominium` | `Townhouse` | `Single Family Residence` | `Unimproved Land`. [thước CE: `PROPERTY_SUBTYPE_FIELDS`]
- Trục C — vật: danh mục và căn | hàng | chủ nhà | lead | file bẩn và đáp án | địa chỉ thử và đáp án | dòng cơ sở dữ liệu. [thước CE: câu giao hàng 73 + `bat_khi`]
- Trục D — kiểu lệch cần có đáp án: phường mới | phường cũ gộp trọn | phường cũ bị tách | kiểu hẻm | viết tắt, không dấu | thiếu phần | đơn vị, số kiểu sàn. [thước CE: ADR-0016 quyết định 5; khuôn đáp án hàng 64]

Core: A2×B(Townhouse, SFR, Land) ở AC-3 · A3×B(Townhouse, SFR, Land) ở AC-4 · C(địa chỉ thử)×D ở AC-5 · C(file)×B×D ở AC-6 ·
C(hàng, lead, chủ nhà)×A ở AC-7 · cắt ngang C ở AC-8, AC-9. A1×B(Condominium) chỉ ở file bẩn và hàng (dùng danh mục hàng 5).
Later: ô số thửa (LH12); căn hộ ngoài khu (chung cư mini) — ADR-0016 chưa có hình. Never: địa chỉ thật, toạ độ — bất biến 2,
quyết định 5 «toạ độ chỉ có khi người ghim».

## Đường đo

- Thước: sinh lại hai lần ra cùng dữ liệu · số từ: băm SHA-256 của ba tệp đầu ra qua hai tiến trình và so với tệp trong
  kho · bảo đảm bởi: AC-1
- Thước: tên đường «Đường Mẫu N», số nhà sinh, tên tỉnh và xã từ danh mục · số từ: bộ quét danh sách trắng trên mọi chuỗi
  địa chỉ và đối chiếu tên với bảng trích · bảo đảm bởi: AC-2, AC-4, AC-8
- Thước: không tên, số điện thoại hay địa chỉ thật · số từ: quét toàn văn bộ dữ liệu, đáp án, ô file bẩn và dòng đã nạp ·
  bảo đảm bởi: AC-8
- Thước: đủ bốn loại hình · số từ: tập loại hình của lô, căn ngoài khu, hàng và dòng file bẩn · bảo đảm bởi: AC-3, AC-4,
  AC-6, AC-7
- Thước: tên phường cũ và kiểu hẻm khác nhau kèm đáp án · số từ: ma trận kiểu viết của bộ địa chỉ thử và quan hệ chữ ↔
  căn đích · bảo đảm bởi: AC-5
- Thước: mọi bản ghi mang nhãn mẫu và xoá được một lần · số từ: đếm nhãn theo loại bản ghi; chênh lệch năm bảng trước,
  sau nạp và sau lệnh xoá trên Postgres dãy · bảo đảm bởi: AC-8, AC-9

## Out of scope

- Danh mục đơn vị hành chính đầy đủ (34 tỉnh, 3.321 xã, mã đơn vị) và bộ đọc địa chỉ ra khoá — hàng 75.
- Đọc mã lô kiểu nào cũng được — hàng 74.
- Hàng, lô, căn ngoài khu trong cơ sở dữ liệu — chờ hàng 76 (bảng căn ngoài khu, `listings.building_name` bỏ `not null`).
- Khuôn `CatalogFeed` có cấp dãy — mục chờ LH11; bộ mẫu không sửa `packages/connect`.
- Nạp thấp tầng lên bản thật (nút «Nạp dữ liệu mẫu», `nap-ban-that.ts`) — không đổi.
- Gỡ riêng phần thấp tầng khỏi sàn mẫu trên máy — lệnh xoá gỡ cả hai bộ cùng lúc (cùng một sàn mẫu).

## Notes

- Tên phường cũ → mới chép từ Nghị quyết 1685/NQ-UBTVQH15 qua trang Wikipedia tiếng Việt «Quận 1» (05/11/2026); chưa đọc
  văn bản gốc. Hàng 75 đối chiếu với danh mục có nguồn chính thức; lệch thì sửa bảng trích và sinh lại.
