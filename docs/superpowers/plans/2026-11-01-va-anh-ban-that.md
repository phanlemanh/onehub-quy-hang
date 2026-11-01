# Kế hoạch thi công — Vá ảnh bản thật

Hợp đồng `_acceptance/va-anh-ban-that/contract.md` (duyệt 01/11). Không migration.

1. **Kho S3** — `kho-s3.ts`: `kyLinkPut` (cùng hàm ký với GET, đổi phương thức), `docDau` (GET Range 0–63, đọc cỡ từ
   Content-Range). `kho.ts`: `kyLinkTaiLen`, `kiemBanGoc`, `xoaGoc` (bản Postgres không có). Verify: `npm test -w @quy-hang/api`.
   Phục vụ E1b. independent: true.
2. **API** — `routes.ts`, `store.ts`: `POST /units/photos/upload-url`; POST nhận `photoId` (kiểm bản gốc trên kho, xoá đối
   tượng sai trong tiền tố sàn, 409 khi mã đã có dòng); chuyển hướng `no-store`; `errors.ts` thêm `photo-already-confirmed`.
   Verify: `npm run db:test` (Postgres dãy H). Phục vụ E1, E2, E3, E4. independent: false.
3. **Web** — `nguon-api.ts` ba bước; `viec-anh.ts` (bảng năm việc, `lamViec` báo `toast.error`); `muc-anh.tsx` gọi mọi
   sửa/xoá qua `lamViec`. Verify: `npm test -w @quy-hang/web`, typecheck, lint. Phục vụ E1c, E5. independent: false.
4. **Thử khói** — `_acceptance/va-anh-ban-that/thu/khoi-storage.mjs` cho chủ kho (Hỏi-3). independent: true.
