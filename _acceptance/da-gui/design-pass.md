---
slug: da-gui
at: 2026-11-04T10:00:00Z
route: http://localhost:3491/proto/da-gui
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (ghim — trang ba lối đi kèm thẻ Cổng Phạm vi; bản chạy mở được ở cổng 3491 của dãy L khi đăng nhập Đầu khách mẫu, ?loi=trong-kho|reui|ve-moi, &chi=1 mở chi tiết ở lối ReUI)
options: [trong-kho, reui, ve-moi]
divergence: opened — ADR-0019, màn đầu của nhóm Đã gửi; khuyên reui
ds_skill: quy-hang-ui
states: [danh-sach, da-tat, chi-tiet]
breakpoints: [desktop-1440, mobile-375]
themes: [light]
patched: 1
deferred: 0
---
# design-pass — da-gui

Bản mẫu dựng bằng thành phần đã cài (`Item`, `Badge` ReUI, `Button`, `Separator`, `Table`) trong vỏ thật (đăng nhập Đầu
khách mẫu của bộ mẫu hàng 5, Postgres dãy L), dữ liệu mẫu ba Lần gửi (`apps/web/src/app/(app)/proto/da-gui/mau.ts`, nhãn mẫu):
một khách riêng ba căn có lượt mở, quan tâm, một căn đổi giá và một căn đã cọc kèm «Gợi ý căn thay»; một nhóm môi giới chưa
mở; một link đã tắt. Ba lối: Trong kho (dòng `Item`) · ReUI `wishlist-4` (thẻ bìa bốn ảnh, tải bằng khoá Pro qua registry
`https://reui.io/r/base-nova/wishlist-4.json`) · Vẽ mới (bảng `list-11`).

## Ma trận capture

| Lối | 1440 | 375 |
|---|---|---|
| Trong kho | `ba-loi/trong-kho-1440.png` | `ba-loi/trong-kho-375.png` |
| ReUI | `ba-loi/reui-1440.png` | `ba-loi/reui-375.png` · chi tiết `ba-loi/reui-chi-tiet-375.png` |
| Vẽ mới | `ba-loi/ve-moi-1440.png` | `ba-loi/ve-moi-375.png` |

Không khung nào cuộn ngang.

## Findings

1. (đã vá) Lề `p-4` ở gốc trang bị lint quy-hang-ui chặn (lề thuộc bố cục) — dời vào khối trong; màn thật dựng bằng khuôn.
2. Lối ReUI: link một căn có bìa thưa (ba ô trống) — S3 cân nhắc ảnh bìa đầy khi chỉ một căn.
3. Lối ReUI: «Gợi ý căn thay» đang là liên kết chữ — S3 dùng dòng `Item` nhỏ có ảnh để nhất quán với dòng căn.
