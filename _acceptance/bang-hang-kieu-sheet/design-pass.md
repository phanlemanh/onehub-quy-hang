---
slug: bang-hang-kieu-sheet
at: 2026-10-31T14:55:00Z
route: http://localhost:3481/inventory
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (ghim — gói ảnh đi kèm thẻ Cổng Phạm vi; bản chạy mở được ở cổng 3481 của dãy B sau `node _acceptance/bang-hang-kieu-sheet/thu/dung-b.mjs`)
options:
divergence: skipped — khối đích đã chốt ở vo-va-ia.md §2 (data-grid-editing-6) và đã đo ở ADR-0004; chuyển thể chỉ đổi dữ liệu, chữ, prop
ds_skill: quy-hang-ui
states: [mac-dinh, loc-rong, goc-nhin, goc-nhin-khong-co, toi, dien-thoai]
breakpoints: [desktop-1440, mobile-375]
themes: [dark]
patched: 2
deferred: 1
---
# design-pass — bang-hang-kieu-sheet

Bản bấm được là màn thật trong vỏ (không đường bản mẫu riêng): Bảng hàng đọc 40 hàng mẫu của hàng 5 nạp qua API trên
Postgres dãy B. Chụp bằng Chrome không đầu (`thu/chup-doi-chieu.mjs`) theo kế hoạch của `packages/ui-lint/doi-chieu.mjs`;
trang ghép ở `doi-chieu/index.html`.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| mặc định (Toà → Loại căn) | desktop-1440 | dark | doi-chieu/bang-hang--mac-dinh--1440--moi.png · evidence/design-pass/bang--1440--toi.png |
| lọc ra 0 căn | desktop-1440 | dark | doi-chieu/bang-hang--loc-rong--1440--moi.png |
| góc nhìn «2PN dưới 5 tỷ» (lọc 2, nhóm Toà, sắp Giá) | desktop-1440 | dark | evidence/design-pass/goc-nhin--1440--sang.png · doi-chieu/bang-hang--mac-dinh--1440--moi-2.png |
| góc nhìn không có trên máy | desktop-1440 | dark | evidence/design-pass/goc-nhin-khong-co--1440--sang.png |
| điện thoại | mobile-375 | dark | doi-chieu/bang-hang--mac-dinh--375--moi.png |

## Findings

- Đã vá: số dòng đếm lại từ 1 trong mỗi nhóm → đếm liền qua các nhóm như cột số dòng của Sheet.
- Đã vá: cột Toà và Mã căn trôi mất khi cuộn ngang → bật ghim cột của lưới (`columnsPinnable`), hai cột đứng yên.
- Để lại: tiêu đề cột ghim mang nút «bỏ ghim» của khối — là điều khiển có sẵn của lưới, giữ nguyên bản.
- Trình duyệt chụp đang ở giao diện tối; giao diện sáng chấm ở E10 của hợp đồng.
