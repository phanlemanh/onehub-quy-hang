# Kế hoạch: va-bang-hang-cot-thap-tang-khi-loc-rong

Thiết kế: `docs/superpowers/specs/2026-11-09-va-bang-hang-cot-thap-tang-khi-loc-rong-design.md`. Mọi task `independent: false`, làm tuần tự.

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí | Kiểm từng task |
|---|---|---|---|
| Lọc ra rỗng, cột và ô đang gõ còn nguyên | `inventory/loai-hinh.ts`, `loc.ts`, `bang-hang.tsx` | AC-1, AC-2, AC-3 — E1, E2, E3 | `npm test -w @quy-hang/web` |
| Có dòng hay sàn chỉ căn hộ: như hôm nay | `inventory/cot-khi-loc-rong.test.ts` | AC-4 — E4 | `npm test -w @quy-hang/web` |
| Mở góc nhìn đã rỗng, bật tắt cột lúc rỗng | `bang-hang.tsx`, `loc.ts` | AC-6 — E4b | `npm test -w @quy-hang/web` |
| Chứng trên màn đang chạy | `_acceptance/va-bang-hang-cot-thap-tang-khi-loc-rong/thu` | AC-5 — E5 | `thu/dung.mjs`, `thu/chay-ui.mjs` |
| Tài liệu nói đúng điều đang đúng | `docs/product/tham-chieu.md` | AC-1 đến AC-6 | đọc diff |
