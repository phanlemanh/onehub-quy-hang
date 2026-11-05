---
slug: man-lien-he
at: 2026-11-05T05:10:00Z
route: http://localhost:3491/proto/man-lien-he
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (ghim — trang ba lối đi kèm thẻ Cổng Phạm vi; bản chạy mở được ở cổng 3491 của dãy L khi đăng nhập mẫu, ?loi=trong-kho|reui|ve-moi)
options: [trong-kho, reui, ve-moi]
divergence: opened — ADR-0019, nhóm khuôn mới `lien-he`; khuyên trong-kho
ds_skill: quy-hang-ui
states: [co-du-lieu]
breakpoints: [desktop-1440, mobile-375]
themes: [dark]
patched: 0
deferred: 1
---
# design-pass — man-lien-he

Bản mẫu dựng bằng thành phần đã cài (`BoCuc kieu="danh-sach-chi-tiet"`, `DauHoSo` · `MucHoSo` · `CapGiaTri` của
solution-crm-4, `Timeline`, `Tabs`, `Table`, `Badge`) trong vỏ thật (đăng nhập mẫu, Postgres dãy L), dữ liệu mẫu bốn liên hệ,
hai số `0900 000 0xx`, ba cơ hội, hai căn, năm sự kiện (nhãn `[Tên]`). Ba lối chỉ khác cột hồ sơ; danh sách giống nhau. Bản
mẫu (`apps/web/src/app/(app)/proto/man-lien-he/`) không vào commit; màn thật dựng bằng khuôn `lien-he` ở S3.

## Ma trận capture

| Lối | 1440 | 375 |
|---|---|---|
| Trong kho | `ba-loi/trong-kho-1440.png` | `ba-loi/trong-kho-375.png` |
| ReUI | `ba-loi/reui-1440.png` | `ba-loi/reui-375.png` |
| Vẽ mới | `ba-loi/ve-moi-1440.png` | `ba-loi/ve-moi-375.png` |

Ảnh chụp ở khung trình duyệt của app (800 px ở khổ 1440, phóng lên 1440; 750 px ở khổ 375 hai lần mật độ, thu về 375). Cột
hồ sơ hiện bằng ngăn nổi của bố cục đang có; khi hàng 105 gộp, cột thành cột kéo chia cao hết vùng làm việc (lối C) mà ruột
không đổi.

## Findings

- Lối ReUI: nội dung tab sát mép trái (bản mẫu thiếu lề trong tab) — sửa khi dựng nếu chủ kho chọn lối này.
- Hoãn (1): trạng thái tải, trống, lỗi, người khác giữ chưa chụp ở trang ba lối — đo ở E10 (dựng chuỗi) và E10b (ảnh màn thật).

## Nấc

Ngữ cảnh: host-embedded (vỏ thật, đăng nhập mẫu). Phản ứng: nac-1 — không đồng bộ, trang ba lối đi kèm thẻ Cổng Phạm vi.
