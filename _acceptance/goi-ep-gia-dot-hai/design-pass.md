---
slug: goi-ep-gia-dot-hai
at: 2026-11-02T10:50:00Z
route: http://localhost:3485/proto/goi-ep-gia-dot-hai
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (ghim — ảnh hai cách xếp gửi kèm thẻ Cổng Phạm vi; bản chạy mở được ở cổng 3485 của dãy D khi đăng nhập dau-chu-1, ?bo-cuc=ho-so|ba-cot)
options: _acceptance/goi-ep-gia-dot-hai/design-pass/
divergence: skipped — màn đi khuôn sẵn của nhóm cuoc-goi (hàng 28) và bố cục đã đặt ở vo-va-ia §2 («Hồ sơ», ADR-0024); câu còn mở là cách xếp, trình hai lối ở Hỏi-1
ds_skill: quy-hang-ui
states: [mac-dinh, ha-gia]
breakpoints: [desktop-1440, mobile-375]
themes: [dark]
patched: 0
deferred: 0
---
# design-pass — goi-ep-gia-dot-hai

Chế độ ép giá là chế độ thứ hai của màn cuộc gọi (nhóm `cuoc-goi`, khuôn `KhungCuocGoi`), nên bước phân kỳ không mở: khối
đích đã có ở `docs/design/vo-va-ia.md` §2 (bố cục «Hồ sơ») và dòng «Chỗ hở — Chế độ cuộc gọi». Câu duy nhất còn mở là cách
xếp — Hồ sơ một cột theo ADR-0024 hay giữ ba cột như hàng 28 — đưa thành Hỏi-1 với hai lối dựng cạnh nhau trên cùng dữ
liệu mẫu (`proto/goi-ep-gia-dot-hai/mau.ts`, mã căn mẫu, không số).

**Lối máy khuyên: Hồ sơ một cột** — theo ADR-0024 (chủ kho 02/11); kết quả gọi và căn cứ trả giá đứng trên cùng, đúng thứ
tự đầu chủ dùng khi gọi ép giá.

## Ma trận capture

| lối | state | breakpoint | file |
|---|---|---|---|
| ho-so | mac-dinh | desktop-1440 | design-pass/ho-so-1440.png |
| ho-so | mac-dinh | mobile-375 | design-pass/ho-so-375.png |
| ba-cot | mac-dinh | desktop-1440 | design-pass/ba-cot-1440.png |
| ba-cot | mac-dinh | mobile-375 | design-pass/ba-cot-375.png |
| ho-so | ha-gia | desktop-1440 | design-pass/ho-so-ha-gia-1440.png |

Chụp bằng `_acceptance/goi-ep-gia-dot-hai/thu/chup-thu.mjs` trên máy dev dãy D.

## Findings

- Hồ sơ một cột ở 1440: đầu căn, kết quả gọi, lịch sử trả giá và giá đáy hiện trong màn đầu; danh sách hỏi, tính giá, so
  giá dưới nếp gấp — đầu chủ cuộn xuống khi cần.
- Ba cột ở 1440: mọi vùng cùng hiện; cột trái dài vì lịch sử, cột giữa có kết quả gọi trên danh sách hỏi.
- Cả hai ở 375 xếp một cột — bản điện thoại là K1–K4, không chấm ở vòng này.
- Phím H mở ô giá mới kèm «Hiểu là … · trước … · −x%»; phím số của danh sách hỏi không đụng phím chữ của kết quả gọi.
- Chụp ở nền tối; dùng token, không mã màu thô.
