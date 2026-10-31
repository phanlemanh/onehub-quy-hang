---
slug: o-nhan-lead
at: 2026-10-31T15:05:00Z
route: http://localhost:3483/proto/o-nhan-lead
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (ghim — gói ảnh đi kèm thẻ Cổng Phạm vi; bản chạy mở được ở cổng 3483 của dãy L khi đăng nhập người mẫu Telesales)
options:
divergence: skipped — khối đích form-2 đã chọn ở ADR-0002, một biểu mẫu năm ô một kết quả; không còn hướng bố cục nào mở, chỉ còn Hỏi-1..3 về giá trị của mục
ds_skill: quy-hang-ui
states: [trong, thieu, da-dien, dang-gui, khong-trung, co-dau-chu, can-trung, hoi-bo, da-bo, loi]
breakpoints: [desktop-1440, mobile-375]
themes: [dark, light]
patched: 4
deferred: 0
---
# design-pass — o-nhan-lead

Bản mẫu là mã thật của màn: biểu mẫu `apps/web/src/app/(app)/leads/new/o-lead.tsx` trong khuôn `KhungLead`, đặt dưới
`/proto/o-nhan-lead` (chỉ máy dev) với máy chủ giả theo bộ mẫu hàng 5 — căn A-02.06 có hàng mở của [Mẫu] Đầu chủ 1, số
0900 000 001 là chủ nhà của [Mẫu] Đầu chủ 2, số 0900 000 099 giả lỗi mạng. Luật quyết kết quả và bản trả là của lõi
(`packages/core/src/dedupe`), không viết riêng cho bản mẫu.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| trong | desktop-1440 | dark | evidence/design-pass/trong--desktop-1440--dark.jpg |
| trong | desktop-1440 | light | evidence/design-pass/trong--desktop-1440--light.png |
| trong | mobile-375 | light | evidence/design-pass/trong--mobile-375--light.jpg |
| thieu | desktop-1440 | dark | evidence/design-pass/thieu--desktop-1440--dark.jpg |
| da-dien («Hiểu là: 3,2 tỷ, đã bao phí», mã gõ «a 02.06» đọc ra A-02.06) | desktop-1440 | dark | evidence/design-pass/da-dien--desktop-1440--dark.png |
| dang-gui | desktop-1440 | dark | evidence/design-pass/dang-gui--desktop-1440--dark.jpg |
| khong-trung | desktop-1440 | dark | evidence/design-pass/khong-trung--desktop-1440--dark.png |
| co-dau-chu (số gõ +84) | desktop-1440 | dark | evidence/design-pass/co-dau-chu--desktop-1440--dark.png |
| can-trung | desktop-1440 | dark | evidence/design-pass/can-trung--desktop-1440--dark.png |
| hoi-bo | desktop-1440 | dark | evidence/design-pass/hoi-bo--desktop-1440--dark.jpg |
| da-bo | desktop-1440 | dark | evidence/design-pass/da-bo--desktop-1440--dark.jpg |
| loi (chữ đã gõ còn nguyên) | desktop-1440 | dark | evidence/design-pass/loi--desktop-1440--dark.png |

## Findings

| # | Thấy gì | Xử lý |
|---|---|---|
| 1 | Lỗi dưới ô không tắt khi người đã điền ô ấy — phải gửi lại mới hết | patched: sửa ô nào thì lỗi ô ấy tắt |
| 2 | Kết quả của lead trước còn hiện trong lúc gửi lead mới — người đọc nhầm kết quả cũ | patched: gửi là xoá kết quả cũ, chỉ còn «Đang kiểm trùng…» |
| 3 | Khổ 375: nhóm nút nhu cầu, điều kiện phí, thời gian và ô Toà tràn ngang | patched: nhóm nút xuống dòng, ô mã căn co lại (ảnh `trong--mobile-375--light-truoc-sua.jpg` là trước khi sửa) |
| 4 | Kết quả kiểm trùng dùng `Alert` có màu thẳng — bản đồ khuôn nhóm `trang-thai` cấm | patched: dựng qua `TrangThai kind="notice"` / `"error"`; mất màu theo loại kết quả, giữ chữ và biểu tượng của khuôn chung |

Khối đích của vo-va-ia ghi «Alert dưới ô»: khuôn `TrangThai` chính là Alert đã cài qua một cửa, nên không đổi khối đích.
Điện thoại (L4, L5) là P1 — màn không vỡ ở 375 nhưng không chăm.
