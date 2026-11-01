---
slug: cot-ho-so-can
at: 2026-11-01T01:05:00Z
route: http://localhost:3482/proto/cot-ho-so-can
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (ghim — trang ba lối đi kèm thẻ Cổng Phạm vi; bản chạy mở được ở cổng 3482 của dãy H khi đăng nhập Đầu chủ mẫu, ?loi=trong-kho|reui|ve-moi)
options: [trong-kho, reui, ve-moi]
divergence: opened — ADR-0019, màn đầu của nhóm Hồ sơ căn; khuyên reui (Hỏi-2)
ds_skill: quy-hang-ui
states: [mac-dinh, bao-sai]
breakpoints: [desktop-1440, mobile-375]
themes: [light]
patched: 1
deferred: 0
---
# design-pass — cot-ho-so-can

Bản mẫu dựng tay bằng thành phần đã cài (`Frame`, `Badge`, `timeline`, `Progress`, `resizable`, `Tabs`, `Dialog`), cùng
một bộ dữ liệu mẫu (`apps/web/src/app/(app)/proto/cot-ho-so-can/mau.ts`, nhãn mẫu, không người thật). Bảng bên trái là
dòng giả để thấy cột phải đứng cạnh bảng. Ba lối:

- **Trong kho** — khuôn Cài đặt sàn (Frame xếp chồng, mỗi mục một FramePanel có tiêu đề).
- **ReUI** — `solution-crm-4` (ngăn phủ) chuyển thành cột chia đôi: giá + mức đủ đầu cột, trường chính, dòng thời gian.
- **Vẽ mới** — ghép Frame + Tabs: Căn · Lần rao · Lịch sử.

## Ma trận capture

| lối | state | breakpoint | file |
|---|---|---|---|
| trong-kho | mac-dinh | desktop-1440 | ba-loi/trong-kho-1440.png |
| trong-kho | mac-dinh | mobile-375 | ba-loi/trong-kho-375.png |
| reui | mac-dinh | desktop-1440 | ba-loi/reui-1440.png |
| reui | mac-dinh | mobile-375 | ba-loi/reui-375.png |
| ve-moi | mac-dinh | desktop-1440 | ba-loi/ve-moi-1440.png |
| ve-moi | mac-dinh | mobile-375 | ba-loi/ve-moi-375.png |
| (chung) | bao-sai | desktop-1440 | ba-loi/bao-sai-1440.png |

Trang so ba lối: `ba-loi/index.html`.

## Findings

- Sửa 1 — Trong kho: FramePanel co lại và cắt chữ khi cột thấp (lần chụp đầu); thêm `shrink-0` cho panel, cột cuộn.
- Trong kho ở 1440 đẩy «Lịch sử» xuống đáy — thấy một dòng rưỡi trước khi cuộn.
- Vẽ mới gọn nhất nhưng lịch sử nằm sau tab — đầu chủ gọi chủ nhà cần giá và lịch sử trả giá cùng lúc.
- ReUI: giá + mức đủ đầu cột; ở 375 đọc tốt một cột. Khối gốc là ngăn phủ (`Sheet`) — chuyển thể bỏ `Sheet`, giữ
  các mục và thứ tự.
- Chưa chụp nền tối: ba lối dùng cùng token, không mã màu thô.
