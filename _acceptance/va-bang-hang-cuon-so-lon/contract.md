---
schema_version: 1
feature: "Bảng hàng của sàn có 5.000 căn mở và cuộn được tới «/ 5000 căn» mà không sập (React #185 — vòng resizeItem → measureElement → onChange của bộ cuộn ảo), ở 1366×768 và 1920×1080; một bài kiểm đơn vị khoá vòng ấy."
slug: va-bang-hang-cuon-so-lon
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
design_doc: _acceptance/va-bang-hang-cuon-so-lon/design.md
approved_by:
approved_at:
---

# Acceptance Contract: va-bang-hang-cuon-so-lon

## Context

Hàng vá khẩn dãy D (đợt `dau-khach-nhap`), giám sát mở 06/11 (D-23). Trên main, Bảng hàng của sàn 5.000 căn hiện «Không
mở được màn này» (React #185). Chia đôi chỉ ra `f5c7b81e`: bảng thẻ điện thoại được gắn cả trên máy tính (ẩn bằng CSS) và
dòng ẩn đo ra cao 0 làm bộ cuộn ảo dựng-đo-dựng không dừng. Vòng chỉ sửa cách bảng thẻ đo dòng (`inventory/cards/`).
«Sàn 5.000 căn» = sàn «[Mẫu] Sàn đo cuộn» của bộ thử dãy B (`bang-hang-kieu-sheet/thu/dung-b.mjs --nhan 5000`).

Source input: hàng `va-bang-hang-cuon-so-lon` (`docs/plan/lo-trinh.json`) · thiết kế `_acceptance/va-bang-hang-cuon-so-lon/design.md`

## Criteria

- **AC-1** — Bảng hàng sàn 5.000 căn mở được trên máy tính.
  Given bản build trên bộ thử dãy B, người do-cuon của sàn 5.000 căn,
  When mở `/inventory` ở 1366×768 và ở 1920×1080,
  Then trang hiện «/ 5000 căn», không hiện «Không mở được màn này», và console không có lỗi mang «#185» hay «Maximum update
  depth».

- **AC-2** — Cuộn Bảng hàng 5.000 căn vẫn đạt ngưỡng hiệu năng đã ký.
  Given cùng bản build và bộ thử,
  When chạy máy đo cuộn E11 của `bang-hang-kieu-sheet`,
  Then nó thoát 0 (p95 khoảng cách khung ≤ 33,4 ms, khung > 50 ms ≤ 1%, cuộn tới căn cuối, đối chứng bận trượt ngưỡng).

- **AC-3** — Vòng đo của bộ cuộn ảo bị khoá bằng một bài kiểm đơn vị.
  Given bộ cuộn ảo thật với 5.000 dòng, vùng cuộn đang hiện cao 700, mọi dòng nằm trong khe ẩn,
  When mỗi khung hình đo mọi dòng đang dựng bằng phép đo của bảng thẻ rồi báo về bộ cuộn,
  Then số dòng dựng không quá 25 và đứng yên qua các khung; với phép đo cũ (dòng ẩn cao 0) cùng bài thấy số dòng phình
  ≥ 100 và còn tăng — bài phân biệt được bản sửa.

- **AC-4** — Bảng thẻ trên điện thoại vẫn hiện và đo dòng thật.
  Given cùng bản build và bộ thử,
  When mở `/inventory` ở 375×812,
  Then bảng thẻ hiện «<N> căn» với N là số căn Đang bán và Đang giao dịch của sàn (đếm từ API cùng lượt), không màn lỗi,
  không lỗi «#185»; và phép đo trả chiều cao thật cho dòng đang hiển thị.

## Coverage

Bỏ quét không gian — xem dòng sổ «bỏ coverage-scan». Không gian là khổ màn (máy tính 1366×768 · 1920×1080, nơi khe ẩn;
điện thoại 375×812, nơi khe hiện) × trạng thái dòng (ẩn · hiện) × phép đo (sửa · cũ). Máy tính × ẩn × sửa là AC-1, AC-2;
điện thoại × hiện × sửa là AC-4; ẩn × sửa/cũ trên bộ cuộn thật là AC-3 (hai chiều trong một bài). Chiều đỏ trên trang
(máy tính × phép đo cũ) đo tay 06/11 và ghi trong thiết kế; trên máy nó là vế đối chứng của AC-3.

## Out of scope

- Không đổi `KhungBangHang` (bỏ gắn khe điện thoại trên máy tính) — ngoài vùng; phép đo đã chặn vòng.
- Không đổi `bang-hang.tsx`, data-grid hay phiên bản thư viện cuộn ảo — #175 đang giữ `bang-hang.tsx`.
- Bộ thử dãy B gieo ảnh thật (`dung-b.mjs`) — sửa ở #165.

## Notes

- Mọi phép đo trang chạy trên bộ thử dãy B đã dựng (Postgres 5561, phiên do-cuon giữ ở `.acceptance-runs/`); thiếu bộ thử
  thì bài đo thoát 2 «thiếu bộ thử dãy B», không ra xanh giả.
