---
slug: tab-toi
at: 2026-11-03T16:20:00Z
route: http://localhost:3494/proto/tab-toi
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (ghim — trang ba lối gửi chủ kho sau Cổng Phạm vi vì nhóm mới chỉ lộ ra ở S3; bản chạy mở được ở cổng 3494 của dãy H, ?loi=trong-kho|reui|ve-moi, ?may=1 cho tài khoản một máy)
options: [trong-kho, reui, ve-moi]
divergence: opened — ADR-0019, màn đầu của nhóm Tôi; khuyên reui (settings-2, khối đích của vo-va-ia.md)
ds_skill: quy-hang-ui
states: [mac-dinh]
breakpoints: [desktop-1440, mobile-375]
themes: [dark]
patched: 0
deferred: 0
---
# design-pass — tab-toi

Bản mẫu dựng bằng khối và thành phần đã cài, cùng một bộ dữ liệu mẫu (`apps/web/src/app/(app)/proto/tab-toi/ba-loi.tsx`,
nhãn mẫu, không người thật). Cùng một mô hình dòng (`me/man-toi.tsx`), ba cách dựng:

- **Trong kho** — khung settings-3 đã chuyển thể (khuôn Cài đặt sàn).
- **ReUI** — settings-2 chuyển thể ở `components/khoi/settings-2/`.
- **Vẽ mới** — mỗi nhóm một Frame xếp chồng.

Ghi lệch quy trình: bước thiết kế (S1) bỏ design-pass vì khối đích đã chốt; tới S3 mới lộ ra màn Tôi là màn đầu của nhóm
khuôn mới, nên bước phân kỳ mở ở đây và chủ kho chọn lối trước khi màn thật hoàn tất.

## Ma trận capture

| lối | state | breakpoint | file |
|---|---|---|---|
| trong-kho | mac-dinh | 1440 | ba-loi/trong-kho-1440.png |
| trong-kho | mac-dinh | 375 | ba-loi/trong-kho-375.png |
| reui | mac-dinh | 1440 | ba-loi/reui-1440.png |
| reui | mac-dinh | 375 | ba-loi/reui-375.png |
| ve-moi | mac-dinh | 1440 | ba-loi/ve-moi-1440.png |
| ve-moi | mac-dinh | 375 | ba-loi/ve-moi-375.png |
