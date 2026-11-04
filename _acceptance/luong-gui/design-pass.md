---
slug: luong-gui
at: 2026-11-03T15:35:00Z
route: http://localhost:3491/proto/luong-gui
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (ghim — trang ba lối đi kèm thẻ Cổng Phạm vi; bản chạy mở được ở cổng 3491 của dãy L khi đăng nhập Đầu khách hay Trưởng nhóm mẫu, ?loi=trong-kho|reui|ve-moi)
options: [trong-kho, reui, ve-moi]
divergence: opened — ADR-0019, màn đầu của nhóm Gửi; khuyên reui
ds_skill: quy-hang-ui
states: [mac-dinh, xem-truoc-khach-rieng]
breakpoints: [desktop-1440, mobile-375]
themes: [light]
patched: 3
deferred: 0
---
# design-pass — luong-gui

Bản mẫu dựng bằng thành phần đã cài (`BoCuc` «Luồng nhiều bước», `NganNoi`, `Frame`, `Item`, `ToggleGroup`,
`RadioGroup`, `Tabs`, `Textarea`, `Badge`, `Card` cho trang khách), cùng một bộ dữ liệu mẫu
(`apps/web/src/app/(app)/proto/luong-gui/mau.ts`, nhãn mẫu, không người thật). Bốn căn đã chọn, một căn quá 14 ngày chưa
xác nhận; ba khách đang mở + «Khách mới»; người nhận mặc định Khách riêng · [Tên khách 1]. Bản ra, tin soạn sẵn và ngăn
xem trước đều dựng từ `banRaNgoai(can, { cua: "gui_link", nguoiNhan, today })` của lõi — khách riêng không có mã căn,
chỉ toà và nấc tầng. Nút Gửi gọi `navigator.share` với tin (link trong thân tin); máy không có bảng chia sẻ thì chép tin.
Ba lối:

- **Trong kho** — khuôn «Luồng nhiều bước» của trang mẫu sống (settings-3 xếp chồng + cột phụ Xem trước) và thẻ
  `product-grid-4` của Bảng hàng thẻ (hàng 32) dùng nguyên.
- **ReUI** — `wishlist-1` (ReUI Pro, tải bằng khoá Pro qua registry `https://reui.io/r/base-nova/wishlist-1.json`; MCP
  `reui` chưa đăng nhập): dòng căn có ảnh nhỏ, toà, mã, thông số chấm ngăn, huy hiệu tín hiệu; thanh chọn của khối dời
  xuống đáy và dính — «n căn · người nhận · Xem trước · Gửi». Phần người nhận và tin ghép (khối không có).
- **Vẽ mới** — ghép Frame + Tabs: 1 Người nhận · 2 Căn · 3 Tin, chân khung là thanh gửi.

Đăng nhập: Đầu khách mẫu của `packages/db/seed` (hàng 5) trên Postgres dãy L (5571) — `db:migrate` + `seed/nap.mjs
--nap`, mã đăng nhập đọc ở nhật ký máy chủ dev (như `cot-ho-so-can/thu/dung-h.mjs`). Trang ba lối khai ngoại lệ ở
`design/patterns/trang-tam.md` tới khi màn thật `/shares/new` ra.

## Ma trận capture

| lối | state | breakpoint | file |
|---|---|---|---|
| trong-kho | mac-dinh | desktop-1440 | ba-loi/trong-kho-1440.png |
| trong-kho | mac-dinh | mobile-375 | ba-loi/trong-kho-375.png |
| reui | mac-dinh | desktop-1440 | ba-loi/reui-1440.png |
| reui | mac-dinh | mobile-375 | ba-loi/reui-375.png |
| ve-moi | mac-dinh | desktop-1440 | ba-loi/ve-moi-1440.png |
| ve-moi | mac-dinh | mobile-375 | ba-loi/ve-moi-375.png |
| (chung) | xem-truoc-khach-rieng | mobile-375 | ba-loi/xem-truoc-khach-rieng-375.png |
| (chung) | xem-truoc-khach-rieng | desktop-1440 | ba-loi/xem-truoc-khach-rieng-1440.png |

Trang so ba lối: `ba-loi/index.html`.

## Findings

- Sửa 1 — Ngăn xem trước: thân `NganNoi toanMan` không có lề, trang khách dính mép (lần chụp đầu); bọc `p-trang`.
- Sửa 2 — Trang khách: ô ảnh `Item` đặt thẳng trong `Card` với lề ngang tràn mép phải; chuyển vào `CardContent`.
- Sửa 3 — Danh sách khách: bỏ số điện thoại khách (nhu cầu khách của hàng 86 không chở số; đầu khách không thấy số
  khách ở màn Gửi). Chụp lại cả tám ảnh và dựng lại `ba-loi/index.html`; quét chữ trên màn, ngăn xem trước và tin soạn
  sẵn không còn số điện thoại nào. Lần chụp lại đăng nhập Trưởng nhóm mẫu (cũng có nhà Gửi) vì mã đăng nhập của Đầu
  khách mẫu chạm trần 15 phút; dữ liệu mẫu không đổi.
- Trong kho ở 375: Frame lồng (khung → panel → dòng cài đặt → thẻ) nên khung người nhận chiếm gần trọn màn đầu; thẻ
  128px đẩy tin soạn sẵn xuống sau bốn thẻ.
- ReUI: ở 1440 thấy người nhận và hai căn đầu cùng thanh gửi; nhắc «Gọi xác nhận trước» và «Khách thấy: Toà A · Tầng
  cao» nằm ngay trên dòng căn. Ở 375 thanh gửi giữ «4 căn · Khách riêng · [Tên khách 1]» cạnh hai nút.
- Vẽ mới gọn nhất nhưng căn và tin sau tab — nhắc xác nhận bị giấu ở tab 2.
- Ba lối dùng chung ngăn xem trước (`NganNoi toanMan`: phủ toàn màn trên điện thoại, ngăn phải trên máy tính) — luật
  `no-direct-sheet` cấm gọi `Drawer` thẳng.
- Chưa chụp nền tối: ba lối dùng cùng token, không mã màu thô (`npm run lint` đạt).
