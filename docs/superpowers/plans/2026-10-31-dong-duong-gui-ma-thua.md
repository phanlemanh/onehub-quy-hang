# Kế hoạch — dong-duong-gui-ma-thua (hàng 55)

Thiết kế: `docs/superpowers/specs/2026-10-31-dong-duong-gui-ma-thua-design.md` · hợp đồng:
`_acceptance/dong-duong-gui-ma-thua/contract.md` (đã duyệt 31/10, Hỏi-1 = chặn hẳn).

## Task 1 — Cấu hình đăng nhập: đường tắt, tập đường gửi mã, chặn kiểu mã

- Files: `packages/api/src/auth/constants.ts`, `packages/api/src/auth/auth.ts`
- Việc: thêm `AUTH_DISABLED_PATHS` (5 đường), `OTP_SEND_PATHS` (đường xin mã chính), `OTP_TYPE_NOT_ALLOWED`
  (`code-type-not-allowed`); `createAuth` đặt `disabledPaths`; hook `before` gác theo `OTP_SEND_PATHS`, từ chối
  `type` khác `sign-in` bằng 400 TRƯỚC khi đếm.
- Verify: `npm run typecheck -w @quy-hang/api`; `npm test -w @quy-hang/api`.
- Phục vụ E1, E2, E3. `independent: false`.

## Task 2 — Lưới đường và lối gửi mã (không Postgres)

- Files: `packages/api/src/auth/duong-gui-ma.test.ts` (mới)
- Việc: bảng phân loại viết tay đối chiếu endpoints bản cài; ca «hook gác theo OTP_SEND_PATHS» gọi thẳng hook với
  bộ đếm thay thế; ca «không lối gửi mã ngoài đường».
- Verify: `npm test -w @quy-hang/api`; phá thử — xoá một dòng bảng, hook so một đường cứng → đỏ gọi tên.
- Phục vụ E4. `independent: false`.

## Task 3 — Đo trên Postgres thật

- Files: `packages/api/test-db/dong-duong-gui-ma/dong-duong-gui-ma.test.ts` (mới)
- Việc: ba ca E1 (429 theo tập), E2 (400 kiểu khác, đối chứng 5 lần đăng nhập), E3 (404 năm đường, không gửi, không đếm).
- Verify: `npm run db:migrate && npm run db:test` (Postgres dãy X, 5554); phá thử — bỏ `disabledPaths`, bỏ vế chặn
  kiểu, bỏ hook → mỗi ca đỏ đúng thông điệp.
- Phục vụ E1, E2, E3, E5. `independent: false`.

## Task 4 — Điều đang đúng của sản phẩm

- Files: `docs/adr/0005-dang-nhap-theo-san.md` (mục «Bổ sung»), `docs/product/tham-chieu.md` (một dòng sổ quyết định)
- Việc: ghi đường xin mã chỉ phát mã đăng nhập, năm đường của plugin bị tắt, một giới hạn cho mọi đường gửi mã.
- Verify: `npm run lint`.
- `independent: false`.
