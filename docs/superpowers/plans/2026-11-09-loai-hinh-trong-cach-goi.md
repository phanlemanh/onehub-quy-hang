# Kế hoạch: loai-hinh-trong-cach-goi

Thiết kế: `docs/superpowers/specs/2026-11-09-loai-hinh-trong-cach-goi-design.md`. Mọi task `independent: false`, làm tuần tự.

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí | Kiểm từng task |
|---|---|---|---|
| Quản trị thấy mục Loại hình ở màn Cách gọi và đặt được tên | `packages/core/src/labels`, `settings/labels` | AC-1 (mục trên màn), AC-3 (chặn chữ sai), AC-8 (không ra ngoài) — E1, E1b, E3, E3b, E8 | `npm test -w @quy-hang/core`, `npm test -w @quy-hang/web` |
| Tên riêng lưu được qua máy chủ, sàn khác không thấy | `packages/api/test-db/loai-hinh-cach-goi` | AC-2 (lưu neo RESO), AC-3, AC-7 — E2, E3c, E7 | `npm run db:test` trên Postgres 5576 |
| Bảng hàng hiện tên riêng ở cột, ô lọc, nhóm, sắp | `inventory/loai-hinh.ts`, `nhom.ts`, `bang-hang.tsx` | AC-4 — E4, E7b | `npm test -w @quy-hang/web` |
| Hồ sơ căn hiện tên riêng ở mọi chỗ mở | `units/ho-so`, `units/[code]/page.tsx`, `today/page.tsx` | AC-5, AC-6 — E5, E6, E7b | `npm test -w @quy-hang/web` |
| Chứng trên màn đang chạy | `_acceptance/loai-hinh-trong-cach-goi/thu` | AC-9 — E9 | `thu/dung.mjs`, `thu/chay-ui.mjs` |
| Tài liệu nói đúng điều đang đúng | `docs/product/tham-chieu.md`, `doi-chieu-nganh.md`, `so-diem-bien-thien.md` | AC-1 đến AC-9 | đọc diff |
