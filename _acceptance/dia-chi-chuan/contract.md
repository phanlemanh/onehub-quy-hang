---
schema_version: 1
feature: Lõi đọc một địa chỉ Việt Nam gõ kiểu nào cũng được ra địa chỉ chuẩn và khoá địa chỉ, đổi tên phường cũ ra phường mới, và nói thiếu phần nào khi không đọc chắc — không gọi dịch vụ ngoài
slug: dia-chi-chuan
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [sdk]
status: draft
approved_by:
approved_at:
design_doc: _acceptance/dia-chi-chuan/design.md
---

# Acceptance Contract: dia-chi-chuan

## Context

Hàng 75 của lộ trình: bộ đọc địa chỉ ở lõi (`packages/core/src/address/`) cho nhà, đất ngoài khu (ADR-0016 quyết định 5).
Đọc chữ người gõ ra địa chỉ chuẩn (tỉnh, xã có mã chính thức, tên đường, số nhà kể cả hẻm) và khoá địa chỉ; tên phường cũ
ra xã mới, phường cũ bị tách thì cần người chọn; thiếu phần nào nói phần ấy. Thuần, tất định, không gọi mạng. Không bảng,
không màn. Bất biến chạm: không bất biến nào (địa chỉ chưa lưu ở đâu; hàng 76 lưu).

Source input: `docs/plan/lo-trinh.json` hàng 75 · `_acceptance/dia-chi-chuan/opportunity.md` · ADR-0016 quyết định 5 ·
bộ địa chỉ thử có đáp án của hàng 73 (`packages/db/seed/mau-thap-tang/dap-an-thap-tang.json`).

## Criteria

- AC-1: Given bộ địa chỉ thử của hàng 73, When đọc mọi cách viết đủ phần (không thiếu số nhà, phường không bị tách), Then
  mọi cách viết của cùng một căn ra cùng một khoá, và khoá ấy bằng khoá dựng từ địa chỉ chuẩn của căn trong bộ dữ liệu.
- AC-2: Given mọi căn ngoài khu và mọi cách viết của bộ thử, When dựng khoá, Then hai căn khác nhau không bao giờ cùng khoá —
  kể cả cặp gần trùng (khác một chữ cái hay một cấp hẻm) — và cách viết thiếu số nhà hay cần người chọn không có khoá.
- AC-3: Given mọi cách viết của bộ thử, When đọc, Then tỉnh, phường (hay «cần người chọn» kèm ứng viên), số nhà và danh sách
  phần thiếu bằng đúng đáp án; tên đường bằng đáp án sau chuẩn hoá; chữ người gõ giữ nguyên ở `unparsedAddress`.
- AC-4: Given tên phường cũ vào trọn một xã mới (Bến Nghé, Cầu Kho, Tân Định và Bến Thành viết kèm Quận 1), When đọc, Then ra
  xã mới kèm mã chính thức và tên cũ đã đọc; cùng tên ấy ở phường mới và không kèm quận cũ thì đọc là phường mới.
- AC-5: Given tên phường cũ bị tách vào nhiều xã mới (Đa Kao, Nguyễn Thái Bình, Cầu Ông Lãnh kèm Quận 1), When đọc, Then trả
  «cần người chọn» với ứng viên đúng bằng các xã mới nhận nó trong danh mục, không khoá, không chọn hộ một xã; phường cũ
  chỉ vào một xã mới thì KHÔNG hỏi.
- AC-6: Given ma trận viết trước bỏ từng phần (tỉnh, xã, đường, số nhà; hẻm không số nhà) và tên tỉnh hay xã không có trong
  danh mục, When đọc, Then `thieu` nêu đúng phần thiếu, tên lạ vào «chưa có trong danh mục» kèm chữ đã đọc, không khoá; thiếu
  tỉnh thì xã đọc được thành cần người chọn, ứng viên mang tỉnh của nó, không suy tỉnh; còn phần thiếu thì trạng thái là
  «thiếu» dù có việc cần người chọn. Tỉnh đọc được qua mọi tên gọi danh mục khai (TP.HCM, TPHCM, TP HCM, HCM, «TP <tên>»,
  tên bỏ «Tỉnh»/«Thành phố»), «Sài Gòn» không phải tên tỉnh, và xã chỉ tìm trong tỉnh đã đọc.
- AC-7: Given ma trận cách viết số nhà và tên đường viết trước (hẻm gạch, «số N hẻm», HXH, kiệt, ngõ · ngách kiểu Hà Nội,
  chữ cái thường, «Đường», «Phố», không dấu, thừa khoảng trắng), When chuẩn hoá, Then mỗi dòng ra đúng số nhà và tên đường
  chuẩn của nó, và khoá theo đúng công thức mã tỉnh | mã xã | tên đường chuẩn hoá | số nhà chuẩn hoá.
- AC-8: Given danh mục đơn vị hành chính của lõi, When đọc, Then nó ghi nguồn (số văn bản) và ngày đọc cho từng phần, khai
  phạm vi đã chép; có đủ 34 tỉnh, thành mã hai chữ số không trùng; mã xã năm chữ số không trùng; mọi phường cũ trỏ tới xã mới
  có trong danh mục; bảng trích của hàng 73 khớp danh mục lõi (tên, phần nhận của từng phường cũ).
- AC-9: Given vùng `packages/core/src/address`, When quét mã nguồn và chạy toàn bộ bộ thử với mọi đường ra mạng bị chặn, Then
  không tệp nào gọi hay nhập đường ra mạng, và mọi cách viết vẫn đọc ra đúng đáp án.

## Coverage

Quét không gian (skill morphological-scan, preset test-matrix). Chân sản phẩm: ADR-0016 quyết định 5, bộ địa chỉ thử hàng
73 [SUY-TỪ-REPO: docs/adr/0016-moi-loai-hinh.md, packages/db/seed/mau-thap-tang/dap-an-thap-tang.json,
packages/db/seed/don-vi-hanh-chinh-mau.mjs]. Chân ngành: RESO DD 2.1 (`UnparsedAddress`, `StateOrProvince`, `StreetName`,
`StreetNumber`); Google Address Validation (báo thiếu, không chắc theo từng phần) [NGÀNH: design.md §Đối chiếu ngành];
Quyết định 19/2025/QĐ-TTg (mã đơn vị hành chính), Nghị quyết 1685/NQ-UBTVQH15.

- Trục A — phần địa chỉ: tỉnh | xã | đường | số nhà. [thước CE: ADR-0016 quyết định 5]
- Trục B — tình trạng của phần: đủ, đúng tên mới | tên cũ vào trọn | tên cũ bị tách | thiếu | có mà ngoài danh mục. [thước CE: ADR-0016 quyết định 5 + `bat_khi`]
- Trục C — cách viết: dấu đủ | không dấu | viết tắt (P., Q.1, TP.HCM) | kiểu hẻm (gạch, «số N hẻm», HXH, kiệt, ngõ · ngách) | có quận cũ | thừa khoảng trắng. [thước CE: ma trận kiểu viết hàng 73]
- Trục D — đầu ra: các phần chuẩn | khoá | phần thiếu | ứng viên cần chọn | chữ gốc. [thước CE: design.md §Kết quả đọc]
- Trục E — điều kiện vận hành: danh mục (nguồn, ngày, phạm vi, khớp hàng 73) | không mạng. [thước CE: `bat_khi` «ghi nguồn và ngày; không lời gọi mạng nào»]

Core: A×B(đủ)×C ở AC-1, AC-3, AC-7 · D(khoá) ở AC-1, AC-2, AC-7 · B(tên cũ vào trọn) ở AC-4 · B(bị tách) ở AC-5 · B(thiếu,
ngoài danh mục) ở AC-6 · E ở AC-8, AC-9. Later: danh mục cấp xã đầy đủ và tên tỉnh cũ (Hỏi-1); danh mục đường theo xã (dựng
lại dấu, bắt sai chính tả). Never: dịch vụ tra địa chỉ, toạ độ tự tra (ADR-0016 quyết định 5).

## Đường đo

- Thước: mọi cách viết của cùng một nhà ra cùng một khoá · số từ: khoá của 86 cách viết so theo căn đích, so với khoá dựng
  từ địa chỉ chuẩn của căn · bảo đảm bởi: AC-1, AC-3
- Thước: hai nhà khác nhau không bao giờ cùng khoá · số từ: khoá của 14 căn và mọi cách viết, nhóm theo khoá, đếm căn mỗi
  nhóm · bảo đảm bởi: AC-2
- Thước: phường cũ tách vào nhiều phường mới thì «cần người chọn», không đoán · số từ: 14 cách viết kiểu phuong-cu-tach của
  bộ thử, so ứng viên với danh mục · bảo đảm bởi: AC-5
- Thước: danh mục ghi nguồn và ngày · số từ: trường nguồn, ngày, phạm vi của danh mục lõi và đối chiếu với bảng trích hàng 73
  · bảo đảm bởi: AC-8
- Thước: không lời gọi mạng nào · số từ: quét nguồn vùng address và lượt đọc trọn bộ thử khi mọi đường ra mạng ném lỗi ·
  bảo đảm bởi: AC-9

## Out of scope

- Danh mục cấp xã đầy đủ (3.321 xã) và bảng tên cũ → mới cả nước, tên tỉnh cũ (63 → 34) — chờ Hỏi-1; vòng này chép 34 tỉnh
  và phần trích TP.HCM.
- Danh mục đường theo xã: dựng lại dấu cho tên đường gõ không dấu, bắt sai chính tả tên đường.
- Lưu địa chỉ, khoá vào cơ sở dữ liệu và bảng căn ngoài khu — hàng 76.
- Kiểm trùng theo khoá (LH6); đọc địa chỉ trong ô nhận lead (hàng 77) và trong nhập file (hàng 78).
- Mở đường `@quy-hang/core/address` trong `package.json` của gói — hàng 76, khi có người dùng đầu tiên.
- Toạ độ và tra toạ độ.

## Notes

- Mã bốn phường TP.HCM đọc ở hộp thông tin Wikipedia tiếng Việt (trang dẫn danh mục Tổng cục Thống kê), chưa đối chiếu
  Phụ lục II Quyết định 19/2025 — nguồn mã là Hỏi-2 của Cổng Phạm vi; vòng này không lưu khoá ở đâu nên đổi mã còn rẻ tới
  khi hàng 76 lưu.
