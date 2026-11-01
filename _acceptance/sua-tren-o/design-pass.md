---
slug: sua-tren-o
at: 2026-11-01T01:05:00Z
route: http://localhost:3481/inventory
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (ghim — gói ảnh đi kèm thẻ Cổng Phạm vi; bản chạy mở được ở cổng 3481 của dãy B sau `node _acceptance/bang-hang-kieu-sheet/thu/dung-b.mjs`)
options:
divergence: skipped — khối đích data-grid-editing-6 đã có lớp sửa ô; trình sửa nổi ghép từ thành phần đã cài (Input, ToggleGroup, Popover, Select, Sonner)
ds_skill: quy-hang-ui
states: [sua-gia, chua-hieu, hoi-lai, da-doi, sua-trang-thai, dien-thoai]
breakpoints: [desktop-1440, mobile-375]
themes: [dark]
patched: 2
deferred: 2
---
# design-pass — sua-tren-o

Bản bấm được là màn thật trong vỏ (Bảng hàng của hàng 14 đã bật sửa ba cột), không trang mẫu riêng: trình sửa dựng
bằng chính mã sẽ ship, chạy trên 40 hàng mẫu ở Postgres dãy B. Chụp bằng Chrome không đầu qua `thu/cdp.mjs` của hàng 14.
Trang mẫu `proto/sua-tren-o` (đã xin ở B-9) không cần: màn thật đã bấm được.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-bang-hang-sua-gia — ô gõ, Bao phí / Không bao phí, «Hiểu là: 5,55 tỷ, không bao phí», «Tính là vừa xác nhận…» | desktop-1440 | dark | evidence/design-pass/sua-gia--1440.png |
| ST-bang-hang-chua-hieu — «Chưa hiểu «abc» — gõ như 4,65 tỷ hoặc 950 triệu» ngay khi gõ | desktop-1440 | dark | evidence/design-pass/chua-hieu--1440.png |
| ST-bang-hang-hoi-lai — «5,55 tỷ, Không bao phí → 9 tỷ, Không bao phí · Đổi +62% so với giá cũ», Thôi / Đổi | desktop-1440 | dark | evidence/design-pass/hoi-lai--1440.png |
| ST-bang-hang-da-doi — ô 5,8 tỷ, thông báo «Đã đổi giá A-06.03 · Tính là vừa xác nhận với chủ nhà · Hoàn tác» | desktop-1440 | dark | evidence/design-pass/da-doi--1440.png |
| ST-bang-hang-sua-trang-thai — Đang giao dịch · Đã bán · Tạm ngừng · Ngừng hẳn (nấc của Đang bán) | desktop-1440 | dark | evidence/design-pass/sua-trang-thai--1440.png |
| điện thoại — «Bảng hàng dạng thẻ trên điện thoại dựng ở mục 32», không ô nào sửa | mobile-375 | dark | evidence/design-pass/bang-hang--375.png |

## Findings

1. Câu đọc lại ghi «chưa bao phí» trong khi cột Phí và nút ghi «Không bao phí» — **đã sửa**: đọc lại dùng đúng chữ của cột.
2. Gõ chữ chưa hiểu chỉ báo sau Enter — **đã sửa**: báo ngay khi gõ, Enter không ghi.
3. ST-bang-hang-thieu-dieu-kien và hộp «Không hoàn tác được» chưa chụp — **hoãn** sang bài nhìn E6u, E8u của lượt chấm
   (logic đã có ở `lenh.ts`, `hoan-tac.ts`, kiểm ở E6, E8).
4. Giao diện sáng chưa chụp — **hoãn**: trình sửa chỉ dùng thành phần đã cài và token màu; sàn thiết kế M1 chấm ở E12.

## Nấc

- Ngữ cảnh: host-embedded — trình sửa nổi trong Bảng hàng thật, giữa vỏ.
- Phản ứng: nac-1 — gói ảnh kèm thẻ Cổng Phạm vi, không cần ngồi cùng.
