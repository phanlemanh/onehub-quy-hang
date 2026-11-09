---
slug: hom-nay-mot-danh-sach-viec
at: 2026-11-09T01:40:00Z
route: http://localhost:3460/proto/hom-nay-mot-danh-sach-viec
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (ghim — trang ba lối gửi kèm thẻ Cổng Phạm vi)
options: [trong-kho, reui, ve-moi]
divergence: opened — ADR-0019, đổi khối đích ba dòng Hôm nay ở vo-va-ia.md; khuyên trong-kho
ds_skill: quy-hang-ui
states: [mac-dinh, loi-mot-phan, trong, dau-khach, telesales]
breakpoints: [desktop-1440, mobile-375]
themes: [dark]
patched: 2
deferred: 1
---
# design-pass — hom-nay-mot-danh-sach-viec

Bản mẫu trong vỏ thật, dựng bằng thành phần đã cài và một bộ dữ liệu mẫu (`apps/web/src/app/(app)/proto/hom-nay-mot-danh-sach-viec/`, nhãn mẫu). Địa chỉ thật mà bản mẫu đứng thay: `/today`. Vật thật đang có chụp ở `evidence/design-pass/hien-trang--desktop-1440--dark.png` để người duyệt veto được cả tiền đề.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| hiện trạng đủ vai | desktop-1440 | dark | evidence/design-pass/hien-trang--desktop-1440--dark.png |
| mac-dinh | desktop-1440 | dark | ba-loi/trong-kho-1440.png |
| mac-dinh | mobile-375 | dark | ba-loi/trong-kho-375.png |
| loi-mot-phan | desktop-1440 | dark | evidence/design-pass/loi-mot-phan--desktop-1440--dark.png |
| trong | desktop-1440 | dark | evidence/design-pass/trong--desktop-1440--dark.png |
| dau-khach | mobile-375 | dark | evidence/design-pass/dau-khach--mobile-375--dark.png |
| telesales | mobile-375 | dark | evidence/design-pass/telesales--mobile-375--dark.png |

## Cảnh ngữ-cảnh

- Không áp dụng: bản mẫu nằm trong vỏ thật.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Số đầu màn của trạng thái lỗi một phần đếm cả nhóm chưa đọc được: đổi sang chỉ đếm phần đọc được.
- Lối thẻ theo vai để hàng đợi rỗng cạnh chữ «3 lead»: thêm dòng mẫu để so công bằng.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Bản mẫu chưa hiện số đếm ở cột thứ hai vì cột thuộc vỏ thật: số đếm chỉ thấy khi dựng ở bước sau, không duyệt được bằng hình lần này.
