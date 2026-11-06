# Kế hoạch thi công — va-duong-so-n

Một task, không task song song.

- **T1 — vá bộ tách và chuẩn hoá tên đường** · independent: false · phục vụ E1–E5
  - Files: `packages/core/src/address/chuan-hoa.ts` (thêm `laTienToDuong`, `tachSoNhaVoi`; chặn «số» sau tiền tố; gộp
    «số5»/«số 05» thành «so 5»), `packages/core/src/address/duong-so.test.ts` (ca AC-1…AC-5 kèm phá thử),
    `packages/core/src/address/anh-truoc-va.json` (ảnh khoá trước vá, commit riêng 00a88e58 trên 01f7cc3a).
  - Verify: `npm test -w @quy-hang/core` (mọi ca hàng 75 và vòng này xanh) · `npx tsc --noEmit -p packages/core` · eslint
    hai tệp đổi. Phá vật thật đã chạy tay ở S1: tắt chặn tiền tố → năm ca dương của tệp đỏ.
