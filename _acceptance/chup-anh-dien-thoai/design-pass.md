---
slug: chup-anh-dien-thoai
at: 2026-11-05T17:05:00Z
route: http://localhost:3494/units/A-01.04
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (ghim — ảnh 375×812 đi kèm thẻ Cổng Phạm vi; bản chạy mở được ở cổng 3494 của dãy H bằng dung-h.mjs, đăng nhập dau-chu-1)
options: []
divergence: skipped — màn đi khuôn sẵn ho-so-can (ADR-0019): khối đích product-detail-5 của «Hồ sơ căn, điện thoại» đã khai cho 40–41, danh sách ảnh chờ ghép theo ví dụ ReUI c-progress-5 (bậc 4), không thêm nhóm, không đổi khối đích, không thêm «Chỗ hở»
ds_skill: quy-hang-ui
states: [mac-dinh, chon-ngan, cho-mang, da-tai]
breakpoints: [mobile-375]
themes: [light]
patched: 1
deferred: 0
---
# design-pass — chup-anh-dien-thoai

Bản bấm được dựng thẳng trong hồ sơ căn điện thoại thật dưới `/units/<mã>` (nhà Bảng hàng, luật đợt 73 — không ở
`/proto/<slug>`), đủ vỏ điện thoại (thanh trên mảnh, tab dưới). Mã: `units/ho-so/dien-thoai/chup-anh.tsx` (nút + ngăn nổi qua
`NganNoi`), `units/photos/hang-cho-anh.ts` (hàng chờ trong bộ nhớ của trang, tải qua `nguonApi`). Màn chỉ có dưới 768 px nên
chỉ chụp 375. Kịch bản: `thu/chup-design-pass.mjs` (Chrome không đầu, chặn mạng bằng `Network.emulateNetworkConditions`, ảnh
PNG khối màu của `packages/db/seed/anh-mau.mjs`); dev server bật bằng `dung-h.mjs` của hồ sơ trước, tắt ngay bằng `--tat`.

## Ma trận chụp

| Trạng thái | Vai | Ảnh |
|---|---|---|
| Hồ sơ trước khi chụp — nút «Chụp ảnh» trên ảnh lớn | đầu chủ giữ căn | `design-pass/ho-so-truoc.png` |
| ST-chup-chon-ngan + ST-chup-trong | đầu chủ giữ căn | `design-pass/chon-ngan.png` |
| ST-chup-cho-mang (hai Gửi được, một Nội bộ) | đầu chủ giữ căn | `design-pass/cho-mang.png` |
| ST-chup-da-tai | đầu chủ giữ căn | `design-pass/da-tai.png` |
| Ảnh lớn có ảnh mới sau khi tải (1/3) | đầu chủ giữ căn | `design-pass/da-tai-anh-lon.png` |

## Phát hiện

- Vá 1: thân ngăn nổi dính mép trái (NganNoi không đệm thân trên điện thoại) → thêm `px-4 pb-4` cho thân ngăn chụp, chụp lại.
- Khi mất mạng, khối «Đang xem bản đã tải — mất mạng» của hồ sơ và khối «Mất mạng» của ngăn cùng hiện; ngăn che phần trên nên
  không thấy trùng — giữ.
- Nút «Chụp ảnh» mang số ảnh chờ (vòng vàng) khi đóng ngăn; trạng thái từng ảnh đọc được ở 375 không cần cuộn với ba ảnh.
- Ảnh lớn đọc lại danh sách sau mỗi ảnh tải xong — đóng Ngoài-3 của hồ sơ trước cho đường chụp.
- Chưa chụp: cảnh đầu khách không có nút (E12), tải lại trang khi còn ảnh chờ (cần kho trên máy — bước dựng).
- Bản bấm được mở ngăn với «Gửi được» đã chọn sẵn — đó là lối (a) của Hỏi-2; máy khuyên lối (b) không mặc định, dựng ở bước
  dựng sau khi chủ kho trả lời ở Cổng Phạm vi.
