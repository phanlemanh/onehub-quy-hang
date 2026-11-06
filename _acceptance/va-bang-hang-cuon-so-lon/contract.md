---
schema_version: 1
feature: "Bảng hàng của sàn có 5.000 căn mở và cuộn được tới «/ 5000 căn» mà không sập (React #185 — vòng resizeItem → measureElement → onChange của bộ cuộn ảo), ở 1366×768 và 1920×1080; một bài kiểm đơn vị khoá vòng ấy."
slug: va-bang-hang-cuon-so-lon
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: approved
design_doc: _acceptance/va-bang-hang-cuon-so-lon/design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-11-06T14:07:07Z
---

# Acceptance Contract: va-bang-hang-cuon-so-lon

## Context

Hàng vá khẩn dãy D (đợt `dau-khach-nhap`), giám sát mở 06/11 (D-23). Trên main, Bảng hàng của sàn 5.000 căn hiện «Không
mở được màn này» (React #185). Chia đôi chỉ ra `f5c7b81e`: bảng thẻ điện thoại được gắn cả trên máy tính (ẩn bằng CSS) và
dòng ẩn đo ra cao 0 làm bộ cuộn ảo dựng-đo-dựng không dừng. Vòng sửa hai chỗ trong `inventory/cards/`: bảng thẻ không
gắn khi khe điện thoại bị ẩn (máy tính), và dòng ẩn đo bằng ước lượng thay vì 0 (khi bảng thẻ vẫn gắn mà bị ẩn — hồ sơ
đang mở trên điện thoại).
«Sàn 5.000 căn» = sàn «[Mẫu] Sàn đo cuộn» của bộ thử dãy B (`bang-hang-kieu-sheet/thu/dung-b.mjs --nhan 5000`).

Source input: hàng `va-bang-hang-cuon-so-lon` (`docs/plan/lo-trinh.json`) · thiết kế `_acceptance/va-bang-hang-cuon-so-lon/design.md`

## Criteria

- **AC-1** — Bảng hàng sàn 5.000 căn mở được trên máy tính.
  Given bản build trên bộ thử dãy B, người do-cuon của sàn 5.000 căn,
  When mở `/inventory` ở 1366×768 và ở 1920×1080,
  Then trang hiện «/ 5000 căn», không hiện «Không mở được màn này», console không có lỗi mang «#185» hay «Maximum update
  depth», và bảng thẻ điện thoại không được gắn (0 thẻ trong cây trang).

- **AC-2** — Cuộn Bảng hàng 5.000 căn tới căn cuối mà không sập.
  Given cùng bản build và bộ thử,
  When chạy máy đo cuộn E11 của `bang-hang-kieu-sheet` (ba lượt cuộn trọn bảng ở 1366×768, CPU chậm 4 lần),
  Then cả ba lượt thấy dòng thứ 5000 («dòng cuối thấy 5000»); số hiệu năng (p95, tỷ lệ khung > 50 ms) và tải máy được in
  ra làm thông tin, không quyết tiêu chí này — ngưỡng hiệu năng là của E11 đã ký, chấm ở lượt ghim lại của #165.

- **AC-3** — Vòng đo của bộ cuộn ảo bị khoá bằng một bài kiểm đơn vị.
  Given bộ cuộn ảo thật với 5.000 dòng, vùng cuộn đang hiện cao 700, mọi dòng nằm trong khe ẩn,
  When mỗi khung hình đo mọi dòng đang dựng bằng phép đo của bảng thẻ rồi báo về bộ cuộn,
  Then số dòng dựng không quá 25 và đứng yên qua các khung; với phép đo cũ (dòng ẩn cao 0) cùng bài thấy số dòng phình
  ≥ 100 và còn tăng — bài phân biệt được bản sửa.

- **AC-4** — Bảng thẻ trên điện thoại vẫn hiện và đo dòng thật.
  Given cùng bản build và bộ thử,
  When mở `/inventory` ở 375×812,
  Then bảng thẻ hiện «<N> căn» với N là số căn Đang bán và Đang giao dịch của sàn (đếm từ API cùng lượt), có thẻ trong cây
  trang, không màn lỗi, không lỗi «#185»; và phép đo trả chiều cao thật cho dòng đang hiển thị.
  Và khi trang mở ở 1366×768 rồi đổi khổ sang 375×812 trên chính trang ấy, bảng thẻ được gắn và hiện «<N> căn», không lỗi.

- **AC-5** — Điện thoại mở hồ sơ một căn trên sàn 5.000 căn không sập.
  Given cùng bản build và bộ thử, bảng thẻ đang hiện ở 375×812,
  When chạm một thẻ để mở hồ sơ (bảng thẻ còn gắn nhưng bị ẩn), rồi quay lại,
  Then trong lúc hồ sơ mở: không màn lỗi, không lỗi «#185», bảng thẻ vẫn còn trong cây trang (giữ lọc và vị trí cuộn); sau
  khi quay lại: bảng thẻ hiện «<N> căn», không lỗi.

## Coverage

Bỏ quét không gian — xem dòng sổ «bỏ coverage-scan». Không gian là khổ màn × trạng thái khe × phép đo:
- máy tính (1366×768 · 1920×1080) × khe ẩn → bảng thẻ không gắn: AC-1, AC-2;
- điện thoại (375×812) × khe hiện → bảng thẻ gắn, dòng đo thật: AC-4;
- điện thoại × khe hiện, bảng thẻ ẩn vì hồ sơ đang mở → dòng đo bằng ước lượng: AC-5;
- đổi khổ trên một trang (máy tính → điện thoại) → bảng thẻ gắn khi khe hiện ra: AC-4;
- dòng ẩn × phép đo sửa/cũ trên bộ cuộn thật: AC-3 (hai chiều trong một bài).
Chiều đỏ trên trang đo tay 06/11 (ghi ở thiết kế): máy tính × bản main sập; điện thoại × hồ sơ mở × bỏ lớp ước lượng sập.

## Out of scope

- Không đổi `KhungBangHang` — khe vẫn được khung gắn ở mọi khổ; bảng thẻ tự không gắn bên trong khe khi khe ẩn.
- Không đổi `bang-hang.tsx`, data-grid hay phiên bản thư viện cuộn ảo — #175 đang giữ `bang-hang.tsx`.
- Bộ thử dãy B gieo ảnh thật (`dung-b.mjs`) — sửa ở #165.

## Notes

- Mọi phép đo trang chạy trên bộ thử dãy B đã dựng (Postgres 5561, phiên do-cuon giữ ở `.acceptance-runs/`); thiếu bộ thử
  thì bài đo thoát 2 «thiếu bộ thử dãy B», không ra xanh giả.
