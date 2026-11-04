# Kế hoạch thi công — man-nhap-excel (65b)

Hợp đồng: `_acceptance/man-nhap-excel/contract.md` (duyệt 04/11, Manh Phan). Thiết kế:
`docs/superpowers/specs/2026-11-04-man-nhap-excel-design.md`. Hạng T2 — không có Cổng Kế hoạch.

Nguyên tắc: phần máy là hàm thuần ở `apps/web/src/lib/nhap/` (đo bằng node:test); màn React chỉ nối trạng thái với khối
`components/khoi/solution-crm-6/`. Mọi luật nhập là lõi `@quy-hang/core/import`; màn không viết luật riêng.

| # | Việc | Tệp | Kiểm từng việc | Phục vụ | Độc lập |
|---|---|---|---|---|---|
| T1 | Bộ đọc tệp: xlsx bằng exceljs (nạp lười, chọn trang, bảy dạng ô → `Cell`), csv bằng `decodeText`+`parseCsv`, chặn .xls, hỏng, > 10 MB, > 5.000 dòng | `lib/nhap/doc-tep.ts`, `doc-tep.test.ts` | `npm test -w @quy-hang/web` | E1 | có |
| T2 | Đường ống: `readTable` → `classifyColumns` → `planFromDictionary` → `applyPlan`; trạng thái ghép (đích từng cột, `validatePlan`, mẫu cột lớp nguồn chỉ hình dạng); đếm theo dấu | `lib/nhap/duong-ong.ts`, `ghep.ts`, test | như T1 | E2, E3 | có |
| T3 | Trạng thái năm bước: sửa ô (đổi giá trị thô, áp lại dòng), bỏ dòng, `coTheTiep`, `coTheGhi` (xoá kết quả xem thử khi đổi), quyền theo vai, Trưởng nhóm chọn đầu chủ | `lib/nhap/trang-thai.ts`, test | như T1 | E4, E8b | sau T2 |
| T4 | Gọi API: mở lần nhập (kế hoạch, tiêu đề, toà + mã căn mọi dòng; không giá trị nguồn), xem thử từng gói 200, ghi tuần tự, thử lại đúng gói lỗi; `fetch` truyền vào để kiểm | `lib/nhap/goi-api.ts`, test (fetch giả) | như T1 | E6 | sau T2 |
| T5 | Route đọc đầu chủ của sàn cho vai nhập: `GET /api/v1/imports/agents` → `[{userId, name}]` | `packages/api/src/imports/routes.ts`, `store.ts`, `test-db/imports/dau-chu.test.ts` | `npm run db:migrate && npm run db:test` (Postgres dãy G) | E8 | có |
| T6 | Bài web trên Postgres thật: xem thử bằng ghi 450 dòng (ma trận trùng vắt gói), lỗi mạng giữa gói, Trưởng nhóm nhập hộ; mở `test:db` của web cho `src/lib/nhap/test-db` | `lib/nhap/test-db/*.db-test.mts`, `apps/web/package.json` | `npm run test:db -w @quy-hang/web` | E5, E7, E8c | sau T4, T5 |
| T7 | Màn `/imports/new`: trang máy chủ đọc vai (`navigationFor`), màn client năm bước trong `KhungNhap` + `KhungBuoc`; bước tải (ô chọn tệp, trang tính, đầu chủ), ghép (`BangGhepCot`), xem trước (data-grid, dấu, sửa ô, lọc), trùng (bảng hành động + lý do), tóm tắt + ghi + kết quả; trạng thái rỗng, lỗi, không quyền qua `TrangThai`; hỏi khi rời trang; nhóm khuôn nhận `imports/new` | `app/(app)/imports/new/*`, `design/patterns/nhap-excel.md`, `trang-tam.md` | `npm run typecheck && npm run lint` | E9, E10, E10b | sau T3, T4 |
| T8 | Tham chiếu (một dòng §12), CONTEXT (nhãn mới nếu có), chụp E9 | `docs/product/tham-chieu.md`, `CONTEXT.md`, `_acceptance/man-nhap-excel/thu/chup-e9.mjs` | đọc lại | E9 | sau T7 |

Thứ tự: T1, T2, T5 song song được; T3, T4 sau T2; T6 sau T4, T5; T7 sau T3, T4; T8 cuối. Làm tuần tự trong vòng chính
(các việc chạm chung `lib/nhap/` nên không chia worktree).
