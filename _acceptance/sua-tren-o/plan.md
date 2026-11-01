# Kế hoạch thi công — sua-tren-o (hàng 15)

Hợp đồng: `_acceptance/sua-tren-o/contract.md` (duyệt 01/11). Phần lõi (bộ đọc giá, ngưỡng hỏi lại), trình sửa trên ô,
hoàn tác và nối vào Bảng hàng đã dựng ở bước thiết kế (bản bấm được của design-pass là mã sẽ ship). Hỏi-1: đổi điều kiện
phí luôn hỏi lại (đã có ở `hoi-lai.ts`). Hỏi-2: hoàn tác tính như mọi lần sửa — không chạm `lib/sync`; gỡ xác nhận của lần
sửa nhầm là hàng sau.

## Task 1 — Tài liệu: Bảng hàng thôi «chỉ đọc»

- Files: `docs/design/vo-va-ia.md` (dòng «chỉ đọc» ở mục Bảng hàng), `docs/product/tham-chieu.md` (một dòng §12)
- Verify: `node _acceptance/sua-tren-o/thu/ranh-gioi.mjs` (hai tệp trong danh sách cho phép)
- Phục vụ: E13, E14 (AC-10)
- independent: true

## Task 2 — Soát toàn cây trước khi chấm

- Files: không tệp mới; sửa chỗ đỏ nếu có
- Verify: `npm run typecheck && npm run lint && npm test`
- Phục vụ: E1–E8, E10, E11, E15
- independent: false (sau Task 1)
