---
slug: ho-so-dien-thoai-product-detail-5
at: 2026-11-05T13:30:00Z
route: http://localhost:3494/proto/ho-so-dien-thoai
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (ghim — trang ba lối đi kèm thẻ Cổng Phạm vi; bản chạy mở được ở cổng 3494 của dãy H, ?loi=trong-kho|reui|ve-moi&vai=dau-khach|dau-chu)
options: [trong-kho, reui, ve-moi]
divergence: opened — ADR-0019, đổi khối đích của Hồ sơ căn trên điện thoại sang product-detail-5; khuyên reui (Hỏi-1)
ds_skill: quy-hang-ui
states: [mac-dinh]
breakpoints: [mobile-375]
themes: [light]
patched: 0
deferred: 0
---
# design-pass — ho-so-dien-thoai-product-detail-5

Trang ba lối bấm được ở `apps/web/src/app/(app)/proto/ho-so-dien-thoai/` (thành phần đã cài, dữ liệu mẫu), chọn lối bằng
`?loi=` và vai bằng `?vai=`. Màn chỉ có ở khổ dưới 768 px nên chỉ chụp 375 (máy tính giữ thân cột hôm nay).

## Ma trận chụp

| Lối | Vai | Ảnh |
|---|---|---|
| Trong kho | đầu khách | `ba-loi/trong-kho-375.png` (375×1812) |
| ReUI | đầu khách | `ba-loi/reui-375.png` (375×1499) |
| ReUI | đầu chủ | `ba-loi/reui-375-dau-chu.png` (375×1499) |
| Vẽ mới | đầu khách | `ba-loi/ve-moi-375.png` (375×1144) |

Trang so sánh: `ba-loi/index.html`.

## Phát hiện

- Trong kho dài nhất (~1.800 px), ảnh và thông số chính chìm dưới giá và mức đủ; đầu chủ không có nút chính dính đáy.
- ReUI: ảnh, tên, ba thông số và giá vào màn đầu 375×812; lịch sử thu về ba việc gần nhất kèm «Xem cả».
- Vẽ mới ngắn nhất nhưng ảnh và lịch sử sau một chạm, lệch dáng trang khách, phải ghi «Chỗ hở».
