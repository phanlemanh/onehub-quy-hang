# Chặn trùng tên giá trị — kế hoạch thi công

**Goal:** chặn tên riêng của giá trị trùng tên đang hiện hay tên mặc định của giá trị khác cùng tập, ở lõi, máy chủ và màn Cách gọi.
**Spec:** docs/superpowers/specs/2026-11-07-chan-trung-ten-gia-tri-design.md · hợp đồng `_acceptance/chan-trung-ten-gia-tri/contract.md`.

## Global Constraints
- So khớp: `trim` + gộp khoảng trắng + `toLocaleLowerCase("vi")` (như `chuSo` của statuses; viết lại trong labels để không vòng nhập).
- Câu lỗi: `labels.value.<trường>: Trùng tên của «<tên mặc định của giá trị kia>»` (màn bỏ tiền tố khoá).
- Không đổi schema, không đổi API route.

## Task 1 — Lõi (independent: false) · phục vụ E1, E1b, E1c, E1d, E1e, E6
Files: `packages/core/src/labels/index.ts`, `packages/core/src/labels/labels.test.ts`.
- `export function trungTenGiaTri(truong: TruongDong, tenRieng: Readonly<Record<string, string>>): Record<string, string>` — với mỗi giá trị có tên riêng (khác rỗng), trả `{ giá trị: giá trị anh em bị trùng }`: trùng khi chữ so khớp tên đang hiện của anh em (riêng ?? mặc định) hoặc tên mặc định của anh em.
- `dungDongNhan` gom tên riêng theo tập (kể cả tên bằng mặc định của chính nó — bỏ qua, coi như vắng), gọi `trungTenGiaTri`, lỗi đầu tiên → `{ ok:false, loi }`.
- Test: ma trận sinh từ TAP_DONG, riêng–riêng, hoa thường, đổi chéo, khác tập, đối chứng; sửa ca cũ «hai giá trị cùng tên».
Verify: `npm test -w @quy-hang/core`.

## Task 2 — Màn (independent: false, sau Task 1) · phục vụ E3, E4, E5, E7
Files: `apps/web/src/app/(app)/settings/labels/cach-goi-thuan.ts`, `cach-goi.tsx`, `cach-goi.test.ts`.
- `loiCuaO(bo: BoNhanMan, o: Record<string,string>, khoa: string): string | null` — lỗi chữ như cũ, rồi ô giá trị: dựng tên riêng của tập từ `o` (ô khác rỗng, khác tên mặc định của chính nó), gọi `trungTenGiaTri`, có thì «Trùng tên của «…»».
- `coTheLuu(bo, o)`. Màn gọi theo chữ ký mới — trạng thái nạp tự hiện lỗi vì `oBanDau` chép tên đã lưu.
- Test: bảng E3 (a)–(d), ca E5 so `coTheLuu` với `dungDongNhan(thanLuu(...)).ok`.
Verify: `npm test -w @quy-hang/web`, `npm run typecheck`, `npm run lint`.

## Task 3 — API trên Postgres (independent: true) · phục vụ E2, E2b
Files: `packages/api/test-db/chan-trung-ten-gia-tri/trung-ten.test.ts`.
- Sàn thử qua `sanMoi`; PUT trùng riêng–mặc định, đổi chéo, riêng–riêng → 400 và dòng `company_settings` không đổi; PUT không trùng → 200.
Verify: `DATABASE_URL=postgres://postgres:quyhang@localhost:5572/postgres npm run test:db -w @quy-hang/api -- test-db/chan-trung-ten-gia-tri`.

## Review Focus
- Dữ liệu đã lưu trùng: màn mở ra phải báo ngay (Task 2 ca d).
- Ô gõ đúng tên mặc định của chính nó không được tính là trùng với ai.
- Ô gõ khoảng trắng không lỗi.
