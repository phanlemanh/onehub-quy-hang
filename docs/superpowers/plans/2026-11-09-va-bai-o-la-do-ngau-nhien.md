# Kế hoạch: va-bai-o-la-do-ngau-nhien

Một việc, tuần tự, một phiên.

## Task 1 — Phép kiểm sổ theo từng trường

- Files: `packages/api/test-db/imports/vet-so-trong-so.ts` (mới), `packages/api/test-db/imports/o-la.test.ts`.
- Làm: hàm `vetSoTrongSo`; thay phép tìm chuỗi ở ca «cửa máy chủ»; thêm ca đối chứng, ca ma trận mọi cột, ca hai vạn dòng
  do Postgres sinh; `sanMoi` trả thêm mã người của Đầu chủ.
- Verify: `npm run typecheck`; `config:executors.test.o_la_db`; `thu/pha-thu.mjs`.
- Phục vụ: E1–E7, E10. `independent: false`.

## Task 2 — Đo đỏ ngẫu nhiên và phạm vi

- Files: không đổi mã; chạy `thu/lap.mjs`, `thu/pham-vi.mjs`.
- Verify: 300 lần đỏ 0; phạm vi đạt.
- Phục vụ: E8, E9. `independent: false`.
