# Kế hoạch thi công — va-he-bo-cuc

Hồ sơ `_acceptance/va-he-bo-cuc/` (T2, Cổng Phạm vi duyệt 2026-11-02, Manh Phan; Hỏi-1 = báo rõ). Thiết kế:
`docs/superpowers/specs/2026-11-02-va-he-bo-cuc-design.md`. Ba task tuần tự — task sau dùng mô-đun của task đầu.

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Luật mở nhóm, chữ báo và mục đang chọn nằm một chỗ, có bài kiểm | `today/mo-nhom.ts` (mới), `mo-nhom.test.ts` (mới) | AC-1…AC-6 (E1–E5, E11) |
| Mục Hôm nay ở cột trỏ đúng nhóm và sáng khi đang chọn | `components/shell/second-column.tsx` | AC-2 (E2, E6u) |
| Hôm nay mở nhóm, cuộn tới, báo một dòng khi nhóm vắng | `today/hom-nay-dau-chu.tsx`, `today/page.tsx` | AC-1, AC-3, AC-4, AC-5 (E6u, E7u, E10u) |

## T1 — Mô-đun mở nhóm

- Files: `apps/web/src/app/(app)/today/mo-nhom.ts`, `apps/web/src/app/(app)/today/mo-nhom.test.ts`.
- Làm: `docNhomThamSo(qs)` (khuôn mã của lõi, có `lead` thì null); `timNhom({ bo, dangHien, ma })` → dòng nhóm hay chữ
  báo, `dangHien = null` khi đang tải; `baoNgoaiDauChu(ma, bo)`; `mucHomNay(bo)` → mục cột; `mucDangChon(items, path, qs)`.
- Verify: `npm test -w @quy-hang/web` — mỗi ca mới có cặp phá-thử ghim thông điệp.
- Phục vụ: E1, E2, E3, E4, E5, E11. `independent: false`.

## T2 — Cột thứ hai

- Files: `apps/web/src/components/shell/second-column.tsx`.
- Làm: mục Hôm nay lấy từ `mucHomNay(BO_NHOM_MAC_DINH)`; `NavList` tính mục sáng bằng `mucDangChon` với `useSearchParams`.
- Verify: `npm run typecheck`, `npm test -w @quy-hang/web`.
- Phục vụ: E2, E6u. `independent: false`.

## T3 — Hôm nay mở nhóm và báo

- Files: `apps/web/src/app/(app)/today/hom-nay-dau-chu.tsx`, `apps/web/src/app/(app)/today/page.tsx`.
- Làm: đọc `?nhom` như `?lead`; tải xong thì `timNhom` → mở nhóm (`moNhom`), chọn dòng `nhom:<mã>`, cuộn (giảm chuyển động
  thì tức thì); chữ báo hiện bằng `TrangThai` notice. `page.tsx`: người không có vai Đầu chủ mà có `?nhom` → dòng báo
  `baoNgoaiDauChu` ở đầu khung.
- Verify: `npm run typecheck && npm run lint`; nhìn màn thật trên máy dev dãy H (cổng 3482).
- Phục vụ: E6u, E7u, E10u, E8, E9. `independent: false`.

## Thứ tự

T1 → T2 → T3, rồi `npm run typecheck && npm run lint`, rồi hồ sơ sang `implemented` và vào chấm.
