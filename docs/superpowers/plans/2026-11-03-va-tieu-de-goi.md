# Vá tiêu đề Cuộc gọi — kế hoạch

**Spec:** `docs/superpowers/specs/2026-11-03-va-tieu-de-goi-design.md` · hồ sơ `_acceptance/va-tieu-de-goi/`.

### Task 1: Hàm tiêu đề thuần và bài kiểm (independent: true)

- Files: tạo `apps/web/src/components/shell/tieu-de.ts` (`titleOf(pathname: string, home: Home | null): string`, bảng
  `PAGE_TITLE`), tạo `apps/web/src/components/shell/tieu-de.test.ts`; sửa `apps/web/src/components/shell/app-shell.tsx`
  (bỏ hàm và bảng, nhập từ `./tieu-de`).
- Phục vụ: E1, E2 (và E3, E4 trên màn chạy).
- Verify: `npm test -w @quy-hang/web` xanh; lượt phá-thử: bỏ nhánh `/units/call` → hai ca AC-1 đỏ nêu «Căn call»; đổi
  nhãn `/viewings` → ca «đường khác giữ như trước» đỏ nêu `/viewings`; `npm run typecheck && npm run lint` xanh.
