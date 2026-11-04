---
slug: hom-nay-dau-khach
at: 2026-11-04T15:50:00Z
route: http://localhost:3491/proto/hom-nay-dau-khach
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (ghim — trang ba lối đi kèm thẻ Cổng Phạm vi; bản chạy mở được ở cổng 3491 của dãy L khi đăng nhập mẫu, ?loi=trong-kho|reui|ve-moi, &trang=trong cho trạng thái trống)
options: [trong-kho, reui, ve-moi]
divergence: opened — ADR-0019, màn đầu của nhóm Hôm nay đầu khách; khuyên reui
ds_skill: quy-hang-ui
states: [co-tin, trong]
breakpoints: [desktop-1440, mobile-375]
themes: [light]
patched: 0
deferred: 0
---
# design-pass — hom-nay-dau-khach

Bản mẫu dựng bằng thành phần đã cài (`Item`, `Badge` ReUI, `Button`, `Separator`) trong vỏ thật (đăng nhập mẫu của bộ mẫu
hàng 5, Postgres dãy L), dữ liệu mẫu bảy tin trong ba ngày (`apps/web/src/app/(app)/proto/hom-nay-dau-khach/mau.ts`, nhãn
mẫu `[Tên]`): ba «Khách phản ứng», hai «Vừa đổi» (đổi giá, đã cọc), hai «Căn mới». Ba lối: Trong kho (dòng `Item`) · ReUI
`solution-crm-5` (dòng hoạt động theo ngày, mốc thời gian dọc) · Vẽ mới (thẻ tin mượn `sheet-7`). Bản mẫu không vào commit;
màn thật dựng bằng khuôn `KhungHomNayDauKhach` ở S3.

## Ma trận capture

| Lối | 1440 | 375 |
|---|---|---|
| Trong kho | `ba-loi/trong-kho-1440.png` | `ba-loi/trong-kho-375.png` |
| ReUI | `ba-loi/reui-1440.png` | `ba-loi/reui-375.png` |
| Vẽ mới | `ba-loi/ve-moi-1440.png` | `ba-loi/ve-moi-375.png` |

Không khung nào cuộn ngang (độ rộng trang 375 ở khổ điện thoại); không khung nào có số điện thoại. Ảnh chụp trong khung
trình duyệt của app: khung trả khổ 1440 ở 800 px nên ảnh 1440 là bản phóng lại về đúng bề rộng (chữ mờ hơn bản
chụp thẳng); khổ 375 chụp ở độ nét gấp đôi rồi thu về 375. Trang ba lối dựng bằng `doi-chieu.mjs --dung-ba-loi`. Chụp bằng Playwright trên Chrome treo ở lần mở trang đầu (máy đang
chịu áp lực bộ nhớ) nên đổi sang khung trình duyệt; vòng nạp lại ~75 ms ở 375 thấy lúc trước không lặp lại trong khung này.

## Findings

1. Lối Trong kho ở 375: dòng chi tiết bị cắt một dòng — tin «Vừa đổi» mất đúng phần giá mới («Giá 3,2 tỷ → …»). Lối ReUI và
   Vẽ mới hiện đủ.
2. Lối ReUI ở 375: mỗi tin cao, một màn thấy khoảng ba tin — S3 cân nhắc gộp dòng giờ vào đầu khung để thấp hơn.
3. Vòng nạp lại ở 375 của bản mẫu (thấy ở lượt chụp trước, không lặp lại khi chụp lại) — S3 soi lại trên màn thật, ui-check
   E6b đo ở khổ 375.
