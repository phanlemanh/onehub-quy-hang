# Kế hoạch: logo OneHub cho Quỹ hàng

Hợp đồng: `_acceptance/logo-onehub/contract.md`. Hạng T2.

| Task | Tệp | Kiểm từng bước | Phục vụ | independent |
|---|---|---|---|---|
| 1. Chép năm tệp hình từ CRM | `apps/web/public/icons/*`, `apps/web/src/app/favicon.ico` | `npm test -w @quy-hang/web` | E1, E7, E9, E10 | false |
| 2. Thành phần dùng chung, thay ở cột nhà và đăng nhập | `apps/web/src/components/dau-hieu-onehub.tsx`, `home-rail.tsx`, `(auth)/khung.tsx` | `npm run typecheck && npm run lint` | E2, E5, E6, E8 | false |
| 3. Bài kiểm tệp hình và nguồn dùng chung, có ca phá thử | `apps/web/src/components/dau-hieu-onehub.test.ts` | `npm test -w @quy-hang/web` | E1, E2, E3 | false |
| 4. Tài liệu: danh mục khối, Tham chiếu | `.agents/skills/quy-hang-ui/catalog.md`, `docs/product/tham-chieu.md` | `npm run lint` | — | false |
