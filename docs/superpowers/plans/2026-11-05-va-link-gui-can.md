# Vá nút «Gửi căn» — kế hoạch

**Spec:** `docs/superpowers/specs/2026-11-05-va-link-gui-can-design.md` · hồ sơ `_acceptance/va-link-gui-can/`.

### Task 1: Đổi đích hai nút và hai bài kiểm cũ (independent: false)

- Files: sửa `apps/web/src/app/(app)/shares/danh-sach.tsx` và `apps/web/src/app/(app)/today/buyer/dong-tin.tsx`
  (`/inventory/cards` → `/inventory`); sửa kỳ vọng ở `apps/web/src/app/(app)/shares/da-gui.test.ts` và
  `apps/web/src/app/(app)/today/buyer/dau-khach.test.ts`.
- Phục vụ: E1, E2 (và E4, E5 trên màn chạy).
- Verify: `npm test -w @quy-hang/web` xanh; lượt phá-thử: trả hai nút về `/inventory/cards` → «trống mà thiếu lối đi
  gửi» và «trống thiếu nút «Gửi căn»» đỏ.

### Task 2: Bài kiểm link nội bộ (independent: false — dùng đích của Task 1)

- Files: tạo `apps/web/src/app/link-noi-bo.test.ts` (tập đường từ `page.tsx`/`route.ts`, bộ trích đường, sáu ca).
- Phục vụ: E1, E2, E3.
- Verify: trên cây trước Task 1, ca «không link nào trỏ tới đường không có trang» đỏ liệt đúng `danh-sach.tsx:68` và
  `dong-tin.tsx:86`; sau Task 1 xanh. Phá-thử: bỏ dạng router template → «bộ quét phải thấy đúng 11 link, thấy 9»; cho
  `[[...x]]` đòi một đoạn → «cây mẫu, đường /help: mong có trang». `npm run typecheck && npm run lint` xanh.

### Task 3: Chỗ thử và design-pass (independent: true)

- Files: tạo `_acceptance/va-link-gui-can/thu/dung.mjs` (Postgres riêng 5581, máy dev 3460, phiên người mẫu); ảnh
  `_acceptance/va-link-gui-can/evidence/design-pass/`, sổ `design-pass.md`.
- Phục vụ: E4, E5.
- Verify: `node _acceptance/va-link-gui-can/thu/dung.mjs` in «chỗ thử sẵn sàng»; hai nút trên khổ 375 mở `/inventory`
  với bảng thẻ.
