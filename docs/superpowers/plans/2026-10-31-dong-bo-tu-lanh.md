# Kế hoạch: dong-bo-tu-lanh (hàng 61)

Thiết kế: `docs/superpowers/specs/2026-10-31-dong-bo-tu-lanh-design.md` · hợp đồng `_acceptance/dong-bo-tu-lanh/contract.md`.
Verify mỗi task: `npm test -w @quy-hang/web` (ca thuần) và `npm run typecheck`; task 5 thêm `npm run test:db -w @quy-hang/web`
trên Postgres dãy H (5562). Các task nối tiếp nhau (chung `lib/sync`), `independent: false`.

1. **Phân loại trả lời khi gửi và kéo** — `types.ts`, `gui.ts`, `keo.ts`: `LanThu`; 401 dừng cả lô, 5xx dừng chuỗi căn,
   đối chiếu gặp 5xx/401 giữ thao tác; `LoiKeo.lan`. Phục vụ E1–E4. `independent: false`.
2. **Bộ đồng bộ: lỗi kho, nguyên nhân kéo, nhịp** — `dong-bo.ts`, `kho-indexeddb.ts`, `ap-tren-may.ts` (`LoiTrenMay`
   thêm `kho`). Phục vụ E5, E6. `independent: false`.
3. **Chỉ báo** — `trang-thai.ts` (bảng chữ, thứ tự ưu tiên), `components/sync/chi-bao-dong-bo.tsx` (biểu tượng, Link
   «Hết phiên»). Phục vụ E5, E9b, E10. `independent: false`.
4. **Sửa căn đang Cần xem** — `xu-ly-can-xem.ts` (nối chuỗi lại thao tác giữ), `components/sync/bang-can-xem.tsx` (dòng
   «Sửa thêm sau đó»). Phục vụ E7, E8, E9b. `independent: false`.
5. **Ca kiểm** — `may-chu-gia.test-helpers.ts` (công tắc mã trả, ghi rồi 503, cấy nguồn), `tu-lanh.test.ts`,
   `trang-thai.test.ts`, `test-db/ha-tang.mts` (công tắc bỏ cookie, thay phản hồi bằng 503), `test-db/tu-lanh.db-test.mts`.
   Mỗi ca chạy chiều đỏ một lần (đảo về phân loại cũ trong bản sao) trước khi tính xong. Phục vụ E1–E9. `independent: false`.
