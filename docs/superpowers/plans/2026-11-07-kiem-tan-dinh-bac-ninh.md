# Kế hoạch — kiem-tan-dinh-bac-ninh

## Task 1 — Ca kiểm ghim kết quả

- Files: `packages/core/src/address/kiem-tan-dinh.test.ts` (mới); không sửa bộ đọc, không sửa `doc-xa-thieu-dau.test.ts`.
- Việc: hàm kiểm thuần so tập khoá rồi 8 trường với kết quả ghim; phá thử khoá lạ, lối lui về so bỏ dấu, bộ đọc trả rỗng,
  bộ đọc trả sai xã; dạng không tiền tố với phá thử lối lui.
- Verify: `npm test -w @quy-hang/core && npm run typecheck`.
- Phục vụ: E1–E4. independent: false.
