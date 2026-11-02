---
slug: hom-nay-dau-chu
at: 2026-11-01T13:55:00Z
route: http://localhost:3484/proto/hom-nay-dau-chu
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (ghim — trang ba lối ba-loi/index.html gửi kèm thẻ Cổng Phạm vi; bản chạy mở được ở cổng 3484 của dãy G khi đăng nhập dau-chu-1, ?loi=trong-kho|reui|ve-moi)
options: _acceptance/hom-nay-dau-chu/ba-loi/index.html
divergence: opened — ADR-0019, màn đầu của nhóm mới hom-nay-dau-chu; khuyên reui (data-grid-grouping-1)
ds_skill: quy-hang-ui
states: [mac-dinh]
breakpoints: [desktop-1440, mobile-375]
themes: [light]
patched: 1
deferred: 0
---
# design-pass — hom-nay-dau-chu

Màn đầu của nhóm mới nên bước phân kỳ mở (ADR-0019 quyết định 2). Ba lối tên cố định, cùng một bộ dữ liệu mẫu ca nhiều
việc (3 lead, 4 ép giá, 5 gọi lại, 3 thiếu thông tin, 2 mới đổi — `proto/hom-nay-dau-chu/mau.ts`, nhãn mẫu, không số):

- **Trong kho** — khuôn `KhungLeadCuaToi` (`list-11` đã có trong kho): Frame stacked, mỗi hàng đợi một khối danh sách.
- **ReUI** — `data-grid-grouping-1` (khối đích §2) dựng trên `data-grid` đã cài: bảng nhóm theo hàng đợi, gập được, cột
  Việc · Lý do · Giá · Hạn · nút.
- **Vẽ mới** — ghép `Tabs` + dòng hai tầng: một tab một hàng đợi kèm số.

**Lối máy khuyên: ReUI** — lời khuyên ghim đầu `ba-loi/index.html`.

## Ma trận capture

| lối | state | breakpoint | file |
|---|---|---|---|
| trong-kho | mac-dinh | desktop-1440 | ba-loi/trong-kho-1440.png |
| trong-kho | mac-dinh | mobile-375 | ba-loi/trong-kho-375.png |
| reui | mac-dinh | desktop-1440 | ba-loi/reui-1440.png |
| reui | mac-dinh | mobile-375 | ba-loi/reui-375.png |
| ve-moi | mac-dinh | desktop-1440 | ba-loi/ve-moi-1440.png |
| ve-moi | mac-dinh | mobile-375 | ba-loi/ve-moi-375.png |

Trang so ba lối: `ba-loi/index.html` (dựng bằng `doi-chieu.mjs --dung-ba-loi`).

## Findings

- Sửa 1 — ReUI ở 1440: tổng bề rộng cột vượt khung `max-w-6xl`, cột nút bị cắt («Trả lại», «Đổi giá, trạng thái…»);
  nới khung `max-w-7xl`, chia lại bề rộng cột, chụp lại.
- Trong kho thưa: năm việc một màn 1440, lý do ở dòng thứ ba.
- Vẽ mới che bốn hàng đợi sau tab — mở app chỉ thấy Lead mới.
- ReUI ở 375 xếp một cột; dòng lead cao (năm tầng) — chấp nhận cho bản máy tính, bản điện thoại là hàng M1.
- Chưa chụp nền tối: ba lối dùng cùng token, không mã màu thô.
