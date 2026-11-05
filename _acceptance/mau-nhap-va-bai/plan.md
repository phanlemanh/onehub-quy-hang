# Kế hoạch thi công — mau-nhap-va-bai (hàng 50, T3)

Hợp đồng: `contract.md` (đã duyệt 05/11). Thiết kế: `design.md`. Đặt trong hồ sơ vì `docs/**` ngoài vùng. Mọi phép đo mới
đi kèm cặp hai chiều trên cùng fixture (xanh trên vật lành, đỏ với thông điệp ghim khi phá vật trong bản sao).

| # | Việc | Tệp | Kiểm từng việc | Phục vụ | Độc lập |
|---|---|---|---|---|---|
| 1 | Migration 045: bảng `import_templates` chỉ thêm — RLS enable + force, chính sách đọc theo sàn, chèn chỉ khi `app.member_has_role(…, 'company_admin')`, ràng buộc `delete` không mang đích, `set` có đích, quy đổi chỉ ở năm trường đóng; `grant select, insert` cho `quy_hang_app` | `packages/db/migrations/045_mau_nhap.sql` | `npm run db:migrate` hai lần trên Postgres dãy L; phá thử: bỏ `force` → ca cách ly đỏ | E5, E7, E8 | không (nền) |
| 2 | Ca cách ly và ràng buộc: «import_templates (045): cách ly», «chặn ở bảng» (bảng chèn thẳng bốn ca + đối chứng), «bảng chỉ thêm, quyền hẹp» | `packages/db/tests/isolation.test.mjs` (chỉ thêm ca) | `npm run test:isolation -w @quy-hang/db`; phá thử từng ràng buộc | E5, E7, E8 | sau 1 |
| 3 | Lõi: `apSuaMau(mauDanXuat, soSua)` (mục mới nhất thắng, mốc lần nhập = lúc mở, xoá → vắng), `kiemSuaMau(sua)` (đích hợp lệ, quy đổi chỉ ở trường đóng, xoá không đích) + bảng ca viết trước | `packages/core/src/import/memory/sua-mau.ts`, `sua-mau.test.ts`, chỉ mục xuất | `npm test -w @quy-hang/core`; phá thử: sổ luôn thắng → ca «lần nhập mới hơn lần xoá» đỏ | E1b, E5 | có (với 1–2) |
| 4 | Đường đọc của màn nhập gộp sổ sửa: `mauCuaSan` đọc thêm `import_templates`, gọi `apSuaMau` | `packages/api/src/imports/store.ts` | ca E2 «màn nhập thấy bản sửa»; phá thử: bỏ gộp → đỏ | E2, E3 | sau 1, 3 |
| 5 | API mẫu của sàn: GET / PUT / DELETE `/api/v1/company/import-templates[/{headerKey}]`, chỉ `company_admin`, khoá đi dạng mã hoá URL, 400 kèm lý do, 404 khoá không có; đăng ký một dòng ở `app.ts` (chờ L-34) | `packages/api/src/templates/routes.ts`, `store.ts`; `packages/api/src/app.ts` (+1 dòng) | test-db mục 6 | E1–E7 | sau 1, 3 |
| 6 | Bộ kiểm API trên Postgres: xem, sửa (năm dạng tiêu đề, ca xen kẽ), xoá rồi học lại, lần nhập đã xong không đổi, sai luật, ma trận vai 6×3, sàn khác; lần nhập dựng qua đường nhập thật (mở → gói → ghi) như `test-db/imports/lan-nhap.test.ts`; `migrate-hai-lan.test.ts` trên cơ sở dữ liệu tạm | `packages/api/test-db/mau-nhap-va-bai/*.test.ts` | `npm run db:test` trên Postgres dãy L; phá thử từng ca theo chiều đỏ của evals | E1–E8 | sau 4, 5 |
| 7 | Màn Mẫu nhập: `page.tsx` (máy chủ: `readMe`, `chanMucSan`, đọc API, `MucCaiDat`), vùng client (bảng, hộp sửa, hộp xác nhận xoá, trạng thái), phần thuần (chữ, luật ô Quy đổi, luật hộp sửa theo kết quả lưu) + bài thuần | `apps/web/src/app/(app)/settings/templates/{page.tsx,mau-nhap.tsx,mau-nhap.ts,mau-nhap.test.ts}` | `npm test -w @quy-hang/web`, lint, khuôn cai-dat-san; phá thử: bỏ `chanMucSan` → E6b đỏ | E6b, E9, E9b, E10, E11 | sau 5 (khuôn API) |
| 8 | Tham chiếu: một dòng Sổ quyết định 05/11 cho màn Mẫu nhập (chờ L-34) | `docs/product/tham-chieu.md` (+1 dòng) | đọc lại | — | có |

Thứ tự: 1 → 2, 3 (song song được) → 4, 5 → 6 → 7 → 8. Thi công tuần tự trong phiên (các việc chạm chung lõi và API nên
không tách worktree). Lượt S4 chạy `test.isolation`, `test.core`, `test.web`, `design.khuon`, `script.design_floor` và
lượt nhìn màn E9 (máy chủ dev bật chỉ trong lượt, luật đợt 43).
