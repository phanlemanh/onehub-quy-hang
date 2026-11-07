# Mẫu của sàn: tên trường tiếng Anh — kế hoạch thi công

> Thực thi: tại phiên (native), một người làm tuần tự — các task phụ thuộc kiểu đổi ở Task 1.

**Goal:** Khuôn mẫu lưu và API dùng `name`, `columns`, `opening`, `closing`; dạng cũ đã lưu vẫn đọc được.

**Architecture:** Đổi trường của `MauBang`, `LoiMauBai` ở lõi; ghi chặt (khoá lạ và tên cũ bị từ chối), đọc khoan dung hai
dạng. API, kho lưu, web đi theo kiểu. Không migration (Hỏi-1).

**Spec:** `docs/superpowers/specs/2026-11-07-mau-api-ten-truong-tieng-anh-design.md` · hợp đồng
`_acceptance/mau-api-ten-truong-tieng-anh/contract.md`.

## Global Constraints

- Không migration; không đổi khoá sổ điểm, đường API, khoá kênh.
- Dữ liệu mẫu `[Tên]`, `0900 000 0xx`.
- Lý do lỗi mở đầu bằng khoá theo tên mới: `export.templates[i].name`, `share.post_templates.<kênh>.opening`.

## Review Focus

- Dòng lưu lẫn cả hai tên: tên mới thắng khi đọc; khi ghi thì bị từ chối (E4, E5).
- Tab cũ gửi tên cũ: 400 với lý do nêu tên đúng (E4b) — giới hạn đã ghi ở Notes.
- Tệp tsx đọc trường cũ qua JSON lỏng: bài dựng màn E6c, E7c.
- Fixture dạng cũ phải rút từ bên ghi cũ thật (E5b).

---

### Task 1: Lõi — khuôn, ghi chặt, đọc hai dạng (E4, E5, E6b, E8b)

**Files:** `packages/core/src/export/mau-san.ts` (+ `mau-san.test.ts`), `export/bai.ts`, `export/index.ts`,
`sharing/tin.ts` (+ `tin.test.ts`), `redaction/mau-san.ro-ri.test.ts`; fixture `packages/core/src/export/mau-cu.fixture.json`
(đầu ra nguyên văn của `kiemMauBang`/`kiemMauBai` ở `9f7df527` cho một thân đã biết, ghi commit nguồn).

**Interfaces:** `MauBang = { id; name; columns: CotBangHang[] }`, `LoiMauBai = { opening; closing }`; tên hàm giữ nguyên.

- [ ] Viết ca E4 (6 dòng), E5 (dạng cũ, lẫn, sai khuôn), E6b; chạy `npm test -w @quy-hang/core` thấy đỏ.
- [ ] Đổi khuôn: `kiem*` từ chối khoá ngoài tập (tên cũ → «khoá lạ «ten» — dùng «name»»); `doc*` lấy tên mới, thiếu thì tên cũ.
- [ ] Ro-ri: ca dạng cũ mang mọi cột qua `docMauBang` rồi `xuatBang`. `npm run test:ro-ri` xanh.

### Task 2: API (E1, E1b, E2, E3, E4b, E5b, E7, E8)

**Files:** `packages/api/src/mau-san/routes.ts` (schema OpenAPI), `packages/api/src/app.test.ts` (E1b),
`packages/api/test-db/mau-bang-hang-va-bai/mau.test.ts` (đổi tên), `packages/api/test-db/mau-api-ten-truong-tieng-anh/ten-truong.test.ts`.

- [ ] Ca DB mới: đọc ra tên mới, lưu tên mới (duyệt khoá đệ quy), tên cũ 400 không ghi gì, dạng cũ ghi thẳng đọc được, lưu lại bằng `thanPutBang`/`thanPutBai` chuyển sang tên mới.
- [ ] `npm run db:migrate && npm run db:test` với `DATABASE_URL=…5571` xanh.

### Task 3: Web (E6, E6c, E7b, E7c, E8c)

**Files:** `apps/web/src/app/(app)/settings/templates/{mau-san.ts,vung-mau-bang.tsx,vung-mau-bai.tsx,mau-san.test.ts,mau-san.ro-ri.test.ts}`,
`apps/web/src/app/(app)/inventory/{mau-xuat-san.ts,phat-hang/mau.ts,phat-hang/mau.test.ts}`, `apps/web/src/app/(app)/shares/new/{gui.ts,man-gui.tsx,*.test.ts}`.

- [ ] Đổi trường theo kiểu; bài dựng màn so chữ giữa dữ liệu đọc từ dạng cũ và dạng mới.
- [ ] `npm run typecheck && npm run lint && npm test -w @quy-hang/web` xanh.

### Task 4: Tham chiếu và kiểm cuối

- [ ] Thêm dòng Sổ quyết định §12 `docs/product/tham-chieu.md` (07/11, tên trường tiếng Anh, Hỏi-1, Hỏi-2).
- [ ] `/verify` đủ bộ.
