---
slug: man-nhap-excel
at: 2026-11-04T04:10:00Z
route: http://localhost:3493/proto/man-nhap-excel
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (ghim — trang ba lối gửi kèm thẻ Cổng Phạm vi; bản chạy mở được ở cổng 3493 của dãy G, ?loi=trong-kho|reui|ve-moi)
options: [trong-kho, reui, ve-moi]
divergence: opened — ADR-0019, màn đầu của nhóm khuôn mới nhap-excel; khuyên reui (solution-crm-6, khối đích của vo-va-ia.md)
ds_skill: quy-hang-ui
states: [mac-dinh]
breakpoints: [desktop-1440, mobile-375]
themes: [dark]
patched: 0
deferred: 0
---
# design-pass — man-nhap-excel

Bản mẫu dựng bằng khối và thành phần đã cài, cùng một bộ dữ liệu mẫu (`apps/web/src/app/(app)/proto/man-nhap-excel/ba-loi.tsx`,
nhãn mẫu, không người thật), đều ở bước «Ghép cột» — bước có quyết định nhiều nhất (đích của từng cột, cột lớp nguồn chỉ
hiện hình dạng, lỗi dưới đúng cột). Cả ba nằm trong khuôn `KhungNhap` (bố cục Luồng nhiều bước):

- **Trong kho** — khung settings-3 đã chuyển thể (mục cài đặt), mỗi cột một dòng.
- **ReUI** — solution-crm-6 chuyển thể ở `components/khoi/solution-crm-6/`: dải năm bước, bảng ghép có ô chọn trường.
- **Vẽ mới** — một trang không chia bước: bảng ghép, đếm theo dấu, nút «Xem thử rồi ghi».

Đổi đích cột «SĐT chủ» sang trường khác ra chữ đỏ dưới cột và khoá Tiếp ở cả ba lối (bản mẫu giả luật; luật thật là
`validatePlan` của lõi ở bước thi công).

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

- 375: bảng ghép của lối ReUI cuộn ngang (cột «Trường của căn» ra ngoài khổ) — giữ như khối gốc (`min-w-[640px]`); ở bước
  thi công đổi thành một cột xếp dòng trên điện thoại nếu chủ kho chọn lối này. Lối Trong kho không cuộn ngang nhưng
  không có chỗ chọn trường trên dòng.
- Lối Vẽ mới dài: ở 1440 đếm theo dấu đã trôi xuống đáy khung trước khi có lưới xem trước.
- Chỉ báo bước: bỏ vòng nét đứt quay của khối (chuyển động trang trí, luật no-banned-motion).
