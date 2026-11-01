# Kế hoạch thi công — Bảng hàng kiểu Sheet (hàng 14)

Hồ sơ `_acceptance/bang-hang-kieu-sheet/` (T2, duyệt Cổng Phạm vi 31/10). Phần lớn mã đã dựng trước Cổng Phạm vi để làm
bản bấm được cho design-pass; kế hoạch này ghi việc theo nhiệm vụ để lượt chấm đối chiếu.

| # | Việc | Tệp | Kiểm từng việc | Phục vụ | Độc lập |
|---|---|---|---|---|---|
| 1 | Tuyến đọc cả danh mục | `packages/api/src/catalog/doc-ca-danh-muc.ts` (+ test), một dòng `app.ts`, `app.test.ts` | `npm test -w @quy-hang/api` | E1 | true |
| 2 | Lõi thuần của bảng: cột, ghép danh mục, lọc, luật số, nhóm, góc nhìn | `apps/web/src/app/(app)/inventory/{cot,ghep-danh-muc,loc,bieu-thuc-so,nhom,goc-nhin}.ts` (+ test) | `npm test -w @quy-hang/web` | E2, E3b, E4, E7 | true |
| 3 | Cài `data-grid-editing-6`, chuyển thể chỉ đọc; thanh công cụ, hàng lọc, hộp góc nhìn | `inventory/{bang-hang,hang-loc,thanh-cong-cu,danh-muc,goc-nhin-react}.tsx`, `components/reui/data-grid/` | `npm run typecheck && npm run lint` | E3, E5, E6, E8, E9 | false (sau 2) |
| 4 | Khuôn và nhóm màn mới, rời trang tạm, cột góc nhìn của vỏ | `inventory/khung.tsx`, `inventory/page.tsx`, `inventory/views/[id]/page.tsx`, `design/patterns/{bang-hang,trang-tam}.md`, `components/shell/{placeholder,second-column}.tsx`, bài kiểm chụp cây của `packages/ui-lint` | `node packages/ui-lint/ban-do-khuon.mjs --base origin/main` | E10, E13 | false (sau 3) |
| 5 | Chỗ thử dãy B và máy đo cuộn | `_acceptance/bang-hang-kieu-sheet/thu/{dung-b,cdp,chup-doi-chieu,do-cuon}.mjs` | `node …/do-cuon.mjs` trên bản build | E11 | false (sau 3) |
| 6 | Tài liệu | `docs/product/tham-chieu.md` §12, `docs/design/vo-va-ia.md`, `.agents/skills/quy-hang-ui/catalog.md` | đọc lại | E15 | true |

Thứ tự đã chạy: 1 → 2 → 3 → 4 → 5 → 6, tuần tự trong phiên (các việc «độc lập» nhỏ, không đáng tách lượt song song).
Kiểm cuối: `npm run typecheck && npm run lint && npm test && npm run build`.
