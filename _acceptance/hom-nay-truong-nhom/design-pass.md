---
slug: hom-nay-truong-nhom
at: 2026-11-04T05:10:00Z
route: http://localhost:3476/proto/hom-nay-truong-nhom
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (ghim — trang ba lối gửi kèm thẻ Cổng Phạm vi; máy dev tạm dãy D cổng 3476 đã tắt sau khi chụp, luật đợt 43)
options: [trong-kho, reui, ve-moi]
divergence: opened — ADR-0019, màn đầu của nhóm khuôn hom-nay-truong-nhom; khuyên reui (dashboard-6 bỏ biểu đồ, khối đích của vo-va-ia.md)
ds_skill: quy-hang-ui
states: [mac-dinh]
breakpoints: [desktop-1440, mobile-375]
themes: [dark]
patched: 0
deferred: 0
---
# design-pass — hom-nay-truong-nhom

Bản mẫu dựng bằng khối và thành phần đã cài, cùng một bộ dữ liệu mẫu (`apps/web/src/app/(app)/proto/hom-nay-truong-nhom/`,
nhãn mẫu, không người thật). Ba cách dựng:

- **Trong kho** — `stats-7` và `data-grid` đã cài, ba khối xếp chồng.
- **ReUI** — `dashboard-6` chuyển thể ở `components/khoi/dashboard-6/`, bỏ biểu đồ, bộ chọn ngày, xuất file.
- **Vẽ mới** — mỗi khối một Frame xếp chồng.

Khổ 375 chỉ để chủ kho thấy bố cục co lại; màn thật trên điện thoại hiện một dòng «mở trên máy tính» (ADR-0024).

## Ma trận capture

| lối | state | breakpoint | file |
|---|---|---|---|
| trong-kho | mac-dinh | 1440 | ba-loi/trong-kho-1440.png |
| trong-kho | mac-dinh | 375 | ba-loi/trong-kho-375.png |
| reui | mac-dinh | 1440 | ba-loi/reui-1440.png |
| reui | mac-dinh | 375 | ba-loi/reui-375.png |
| ve-moi | mac-dinh | 1440 | ba-loi/ve-moi-1440.png |
| ve-moi | mac-dinh | 375 | ba-loi/ve-moi-375.png |

## Findings

- Lối Trong kho: thanh «Lối:» dính mép trái (trang mẫu, không phải màn thật) — không sửa.
