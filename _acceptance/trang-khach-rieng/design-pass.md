---
slug: trang-khach-rieng
at: 2026-11-04T06:10:00Z
route: http://localhost:3491/s/ba-loi
material: real-components
context: standalone
context_scenes: []
reaction: nac-1 (ghim — trang ba lối đi kèm thẻ Cổng Phạm vi; bản chạy mở được ở cổng 3491 của dãy L, không đăng nhập, ?loi=trong-kho|reui|ve-moi, &chi=0 mở chi tiết ở lối ReUI)
options: [trong-kho, reui, ve-moi]
divergence: opened — ADR-0019, màn đầu của nhóm trang khách; khuyên reui
ds_skill: quy-hang-ui
states: [bo-can, da-coc, tam-ngung, chi-tiet]
breakpoints: [desktop-1440, mobile-375]
themes: [light]
patched: 2
deferred: 0
---
# design-pass — trang-khach-rieng

Bản mẫu dựng bằng thành phần đã cài (`Card` của `TrangKhach`, `Item`, `Badge` ReUI, `Button`, `Separator`) với bốn căn
mẫu (`apps/web/src/app/s/ba-loi/mau.ts`, nhãn mẫu, không người thật): hai căn Đang bán, một Đang giao dịch, một Tạm
ngưng. Mọi căn đi qua `banRaNgoai(can, { cua: "gui_link", nguoiNhan: "khach_rieng", today })` của lõi — tên căn là toà +
nấc tầng, không mã căn; căn tạm ngưng không giá. Trang mở không đăng nhập (đường `/s/` mở công khai ở `proxy.ts`). Ba lối:

- **Trong kho** — `TrangKhach` của ngăn xem trước màn Gửi (hàng 34) dùng nguyên.
- **ReUI** — `wishlist-3` (bộ căn, lưới thẻ ảnh vuông + huy hiệu + nút chính) và `product-detail-5` (chi tiết), tải bằng
  khoá Pro qua registry `https://reui.io/r/base-nova/<khối>.json`; bỏ giỏ, đánh giá, carousel.
- **Vẽ mới** — danh sách dòng `Item` một cột, giá bên phải, nút tim.

## Ma trận capture

| Lối | 1440 | 375 |
|---|---|---|
| Trong kho | `ba-loi/trong-kho-1440.png` | `ba-loi/trong-kho-375.png` |
| ReUI | `ba-loi/reui-1440.png` | `ba-loi/reui-375.png` · chi tiết `ba-loi/reui-chi-tiet-375.png` |
| Vẽ mới | `ba-loi/ve-moi-1440.png` | `ba-loi/ve-moi-375.png` |

Không khung nào cuộn ngang (đo `scrollWidth` ≤ khổ).

## Findings

1. (đã vá) Trang `/s/…` bị bộ chặn đăng nhập đưa về `/login` — thêm `/s/` vào đường mở không phiên của `proxy.ts`; trang
   thật cũng cần điều này.
2. (đã vá) Cỡ chữ tuỳ ý `text-[15px]` của khối ReUI bị lint quy-hang-ui chặn — đổi sang `text-base`.
3. Lối ReUI: dòng toà nhắc lại trong tên căn khi khách riêng — S3 bỏ dòng toà hay đổi nó thành nấc tầng.
4. Lối ReUI: huy hiệu trạng thái mờ theo thẻ — S3 giữ huy hiệu rõ, chỉ làm mờ ảnh và giá.
