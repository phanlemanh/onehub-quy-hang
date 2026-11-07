---
schema_version: 1
feature: "Bài kiểm ca «Tân Định, Tỉnh Bắc Ninh» của bộ đọc địa chỉ ghim kết quả dương và có phá thử riêng chứng nó đỏ khi bộ đọc lui về so bỏ dấu, trả rỗng hay trả sai xã — thay phép kiểm âm tính đứng một mình"
slug: kiem-tan-dinh-bac-ninh
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [sdk]
status: machine-cleared
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-11-07T08:10:00Z
design_doc: docs/superpowers/specs/2026-11-07-kiem-tan-dinh-bac-ninh-design.md
---

# Acceptance Contract: kiem-tan-dinh-bac-ninh

## Context

Ngoài-1 của doc-xa-thieu-mot-phan-dau: bài kiểm có tên «12 Lê Lợi, Phường Tân Định, Tỉnh Bắc Ninh» chỉ khẳng định kết quả
không phải Tân Dĩnh, nên bộ đọc trả rỗng hay trả sai xã khác vẫn xanh. Chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng
07/11. Không đổi bộ đọc. Bất biến chạm: không.

Source input: `docs/plan/lo-trinh.json` hàng kiem-tan-dinh-bac-ninh · `_acceptance/kiem-tan-dinh-bac-ninh/opportunity.md` ·
`_acceptance/doc-xa-thieu-mot-phan-dau/review-findings.md` (Ngoài-1) · `_acceptance/doc-xa-thieu-mot-phan-dau/decisions.jsonl`
(d-20261107T011616Z-10).

## Criteria

- AC-1: Given bộ đọc hiện tại, When đọc «12 Lê Lợi, Phường Tân Định, Tỉnh Bắc Ninh», Then tập trường của kết quả bằng
  tập ghim và kết quả trùng từng trường với kết quả ghim viết trước (tên tỉnh và việc tỉnh 24 không có xã Tân Định theo
  danh mục đã đối chiếu nguồn ở hàng danh-muc-xa-day-du): tỉnh 24 «Thành phố Bắc Ninh», không xã, «Tân Định» trong «chưa có trong danh mục», thiếu đúng
  «wardName», trạng thái «thieu», không khoá, số nhà «12», tên đường «Lê Lợi».
- AC-2: Given cùng hàm kiểm của AC-1, When chạy với bộ đọc lui về so bỏ dấu, bộ đọc trả rỗng (không xã, danh sách «chưa
  có» rỗng) và bộ đọc trả sai sang một xã khác của tỉnh 24, Then mỗi bộ đọc lỗi ra đúng dòng lỗi ghim gọi tên trường lệch.
- AC-3: Given dạng không có «Phường» đứng trước «12 Lê Lợi, Tân Định, Tỉnh Bắc Ninh», When đọc, Then không ra xã nào,
  «wardName» nằm trong danh sách thiếu, trạng thái «thieu»; và lối lui về so bỏ dấu ra Tân Dĩnh làm phép kiểm đỏ.
- AC-4: Given ca mới đứng trong tệp kiểm riêng (tệp kiểm của hồ sơ doc-xa-thieu-mot-phan-dau đã ký giữ nguyên để bằng chứng
  của hồ sơ ấy không hoá cũ), When chạy bộ kiểm lõi, Then ca mới và mọi bộ kiểm lõi cũ cùng xanh trong một lượt.

## Coverage

Bỏ quét không gian: bài toán một ca, không dạng liệt-kê-đủ (sổ `bỏ coverage-scan`). Phủ: dạng có tiền tố ở AC-1/AC-2,
dạng không tiền tố ở AC-3, chỗ gọi cũ ở AC-4. Later: tách đoạn không tiền tố không gộp tên xã lạ vào tên đường (hàng 75).

## Đường đo

- Thước: ca «Tân Định, Tỉnh Bắc Ninh» đỏ khi bộ đọc trả rỗng, trả sai xã hay lui về so bỏ dấu · số từ: ba bộ đọc lỗi chạy
  qua cùng hàm kiểm · bảo đảm bởi: AC-2, AC-3
- Thước: xanh trên bộ đọc hiện tại với kết quả dương ghim tường minh · số từ: so từng trường với kết quả ghim · bảo đảm
  bởi: AC-1, AC-4

## Out of scope

- Đổi bộ đọc địa chỉ — vòng này chỉ siết phép đo.
- Cách tách đoạn không có «Phường/Xã» đứng trước (gộp tên xã lạ vào tên đường) — hành vi của hàng 75.

## Notes
