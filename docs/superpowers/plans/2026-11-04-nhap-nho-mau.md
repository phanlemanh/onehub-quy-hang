# Kế hoạch thi công — nhap-nho-mau (hàng 67)

Hợp đồng: `_acceptance/nhap-nho-mau/contract.md` (duyệt 04/11, Manh Phan). Thiết kế:
`docs/superpowers/specs/2026-11-04-nhap-nho-mau-design.md`. Làm tuần tự trong vòng chính (các task dùng chung kiểu `Mau`).

| # | Việc | Tệp | Kiểm từng task | Phục vụ | independent |
| --- | --- | --- | --- | --- | --- |
| 1 | Lõi bộ nhớ: kiểu `CotMau`, `taoMau(plan, table, lop)` (bỏ valueMap ở nguồn, tên người, chữ tự do, chưa rõ), `apMau(table, plan, mau[])` (theo `headerKey`, mới nhất thắng, `validatePlan` từng cột → về từ điển kèm lý do), `doMau(plan)`; xuất qua `@quy-hang/core/import` | `packages/core/src/import/memory/{mau.ts,mau.test.ts}`, `packages/core/src/import/index.ts` | `npm test -w @quy-hang/core` (ca E1, E2, E3, E11 kèm lượt phá-thử) | E1 E2 E3 E11 | false |
| 2 | API đọc mẫu: `mauCuaSan(tx)` đọc `imports` đã ghi, mới nhất theo khoá, lọc khoá bằng lõi; route `GET /api/v1/imports/templates` vai nhập | `packages/api/src/imports/{store.ts,routes.ts}`, `packages/api/src/app.test.ts`, `packages/api/test-db/imports/mau.test.ts` | `npm run db:test` trên Postgres dãy G (ca E4) | E4 | false |
| 3 | Màn — lib: `docMau(fetch)`; `chayOng(grid, ctx, mau)`; `suaO` gấp cặp quy đổi ở cột danh mục / chia sẻ được, đếm ô đổi theo; `coTheChonBuoc`; `goi` đổi `error` không phải chuỗi thành chữ | `apps/web/src/lib/nhap/{goi-api.ts,duong-ong.ts,trang-thai.ts}` + test | `npm test -w @quy-hang/web` (ca E6, E8, E9) | E5 E6 E8 E9 | false |
| 4 | Màn — React: đọc mẫu khi mở tệp, dải báo «Ghép theo mẫu đã nhớ — N/M cột» qua `TrangThai`, nhãn «theo mẫu», báo «Đã đổi theo K ô cùng chữ», `onChonBuoc` qua `coTheChonBuoc` | `apps/web/src/app/(app)/imports/new/{man-nhap.tsx,bang.tsx}` | `npm run typecheck && npm run lint` | E7 E8 E10 E10b | false |
| 5 | Vòng trọn trên Postgres: ghi tệp 1 có đổi đích + sửa ô, tệp 2 ghép sẵn; đối chứng chỉ xem thử | `apps/web/src/lib/nhap/test-db/nho-mau.db-test.mts` | `npm run test:db -w @quy-hang/web` (ca E5) | E5 | false |
| 6 | Bàn đo và chụp: `thu/do-mau.mjs` (ba số mỗi lần nhập đã ghi của một sàn), `thu/chup-mau.mjs` (sàn mới mỗi lần, bốn ca, hai khổ) | `_acceptance/nhap-nho-mau/thu/**` | chạy tay hai lệnh trên chỗ thử dãy G | E7 E11 | false |
| 7 | Tham chiếu §12 thêm một dòng 04/11 | `docs/product/tham-chieu.md` | — | — | false |

Mỗi phép đo mới đi cặp hai chiều trên cùng fixture (khối MEASURE-BIRTH-CLAUSE): ca xanh trên vật lành, phá vật trong bản
sao ra đỏ với thông điệp ghim như `expected` của evals.yaml khai.
