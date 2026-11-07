# Mẫu bảng hàng và mẫu bài theo kênh — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Quản trị sàn giữ mẫu bảng hàng (#26) và mẫu bài theo kênh (#27) ở màn Mẫu; hộp Xuất bảng hàng và màn Gửi dùng
bản mới từ lần mở kế tiếp.

**Architecture:** Khuôn và cách bọc bài nằm ở lõi (`packages/core/src/export/mau-san.ts`). API đọc, ghi hai khoá
`company_settings` theo nếp bộ nhãn hàng 45. Màn đọc mẫu lúc mở và đưa vào `xuatBang`, `soanTin` — bảng và bài vẫn dựng
từ `banRaNgoai`.

**Tech Stack:** TypeScript chặt, Hono + zod-openapi, Postgres (company_settings, migration 026), Next.js app router,
shadcn base-nova, node:test.

**Spec:** `docs/superpowers/specs/2026-11-06-mau-bang-hang-va-bai-design.md` · hợp đồng
`_acceptance/mau-bang-hang-va-bai/contract.md` · bộ đo `evals.yaml`.

## Global Constraints

- Không migration (hạng T2). Hai khoá `company_settings`: `export.templates`, `share.post_templates`, `data_class = 'company_internal'`.
- Trần: tối đa 20 mẫu bảng; tên 1–60 ký tự, không trùng (so sau `trim`, không phân biệt hoa thường theo `vi`); 1–15 cột,
  không trùng; lời mở đầu, lời kết 0–500 ký tự mỗi ô; kênh chỉ `zalo`, `facebook`.
- Cột chọn được = khoá của `COT_BANG_HANG` có `khoa !== null` (đọc từ bảng, không viết tay).
- Lý do 400 mở đầu bằng khoá sai (`export.templates[1].ten: …`, `share.post_templates.zalo.dau: …`).
- Ghi nguyên khối: một mẫu sai thì không ghi gì. Đọc khoan dung: dòng hỏng bị lọc, lỗi vào `errors`.
- GET mọi vai của sàn; PUT chỉ vai có trong `aiDoi` của điểm (#26, #27 → Quản trị) — 403 vai khác.
- Chữ UI tiếng Việt, nhãn theo `CONTEXT.md`; dữ liệu mẫu trong test `[Tên]`, `0900 000 0xx`.
- Biểu tượng cảm xúc bị bỏ khỏi lời mẫu khi bọc bài (cùng biểu thức `BIEU_TUONG` của `bai.ts`).
- Câu báo vai khác ở màn Mẫu: theo trả lời L-44 (khuyến nghị câu chung `BAO_CHI_QUAN_TRI` qua `chanMucSan`).

## Review Focus

- Mẫu ghi thẳng vào cơ sở dữ liệu mang cột nội bộ hay khuôn hỏng → GET lọc, `errors` nêu khoá, xuất không lỗi (Task 3, E9b).
- Hai Quản trị lưu chồng nhau → bản lưu sau thắng nguyên khối, không trộn (Task 3: ca hai PUT liên tiếp, GET bằng bản sau).
- Mẫu có cột người nhận không được thấy (khách riêng: mã căn) → cột ấy thành nấc tầng hay bị bỏ, không ô rỗng lạ (Task 1, E5).
- Lời mẫu chỉ toàn khoảng trắng → coi như không có lời, bài như cũ (Task 1: ca `dau: "   "`).
- Đọc mẫu lỗi lúc mở hộp Xuất hay màn Gửi → vẫn xuất, vẫn gửi, kèm câu báo (Task 5, E5b, E7c).

---

### Task 1: Lõi — khuôn mẫu, bảng và bài theo mẫu

`independent: true` · phục vụ E2, E5, E6, E9

**Files:**
- Create: `packages/core/src/export/mau-san.ts`, `packages/core/src/export/mau-san.test.ts`, `packages/core/src/export/mau-san.ro-ri.test.ts`
- Modify: `packages/core/src/export/index.ts` (xuất mô-đun; `TuyChonXuat.mauBai?`), `packages/core/src/export/bai.ts` (bọc lời)

**Interfaces:**
- Produces:
  - `type MauBang = { id: string; ten: string; cot: CotBangHang[] }`
  - `type LoiMauBai = { dau: string; cuoi: string }` · `type MauBai = { zalo?: LoiMauBai; facebook?: LoiMauBai }` · `KENH_BAI = ["zalo", "facebook"] as const`
  - `TRAN_MAU = { soMau: 20, soCot: 15, ten: 60, loi: 500 } as const`
  - `COT_MAU_DUOC: readonly CotBangHang[]`
  - `kiemMauBang(v: unknown): { ok: true; giaTri: MauBang[] } | { ok: false; lyDo: string }` (id phải là uuid)
  - `kiemMauBai(v: unknown): { ok: true; giaTri: MauBai } | { ok: false; lyDo: string }`
  - `docMauBang(v: unknown): { ds: MauBang[]; loi: string[] }` · `docMauBai(v: unknown): { mau: MauBai; loi: string[] }`
  - `bocBai(bai: string, loi: LoiMauBai | undefined): string` — Zalo: `[dau]\n` + bài + `\n[cuoi]`, phần rỗng sau `sach` bị bỏ
  - `baiFacebook(bang, tenSan, loi?: LoiMauBai)` — dòng tên sàn, rồi `dau`, rồi các khối, rồi `cuoi`, cách nhau một dòng trống
  - `xuatBang(can, { …, mauBai?: MauBai })` — bài Zalo, Facebook mang lời của kênh tương ứng

- [ ] **Step 1: Viết bài lỗi** trong `mau-san.test.ts`:
  - `test("mẫu bảng: bảng luật khuôn")` — bảng viết trước: tên trống · 61 ký tự · trùng «[Tên] A» với « [tên] a » · không cột · 16 cột · cột trùng · cột lạ `"foo"` · mỗi cột trong `Object.keys(COT_BANG_HANG).filter(k => COT_BANG_HANG[k].khoa === null)` · 21 mẫu; mỗi dòng `assert.match(lyDo, /^export\.templates/)` và chứa phần khoá sai; `assert.equal(dem, BANG.length)`; đối chứng dương: 1 cột, 15 cột, tên 60 ký tự, 20 mẫu → `ok`.
  - `test("xuất theo mẫu: cột theo mẫu sau luật ẩn")` — mẫu `["unitNumber","listPrice","livingArea"]` × hai người nhận × `MAU_XUAT`: `ban.cot`, `ban.khoa` bằng `cotRa(mau.cot, nguoiNhan, CAU_HINH_MAC_DINH).ra` (nhãn, khoá); đếm 10; khách riêng `ban.khoa[0] === "floorBand"`.
  - `test("bài theo mẫu: hai kênh")` — (zalo · facebook) × (D và C · chỉ D · chỉ C · không mẫu · D có 🎉 · C có 🎉 · D chỉ khoảng trắng): so cả chuỗi với `baiZalo`/`baiFacebook` cũ cộng lời đã `sach`; đếm 14.
- [ ] **Step 2:** `npm test -w @quy-hang/core` → FAIL vì chưa có `./mau-san`.
- [ ] **Step 3: Cài đặt** `mau-san.ts` theo Interfaces; `bocBai` dùng lại `sach` của `bai.ts` (xuất nó ra khỏi `bai.ts`). `docMauBang` bỏ cột không thuộc `COT_MAU_DUOC`, bỏ mẫu không còn cột, mỗi chỗ bỏ một dòng `loi` mở đầu `export.templates`.
- [ ] **Step 4: Bài rò rỉ** `mau-san.ro-ri.test.ts` — căn mồi (`canMoi()` mang chủ nhà, số `0900 000 0xx`, giá đáy, người giữ) qua `xuatBang` với `cot = Object.keys(COT_BANG_HANG)` × hai người nhận × `MAU_XUAT`, `mauBai` có D, C → không chuỗi mồi nào trong `cot`, `dong`, `bai`. Chiều đỏ ghi ở comment: cho `holderName` qua thì ca đỏ.
- [ ] **Step 5:** `npm test -w @quy-hang/core && npm run test:ro-ri` → PASS; phá thử một lần (bỏ luật cột nội bộ) thấy đỏ đúng câu rồi hoàn lại.
- [ ] **Step 6: Commit** `feat(core): khuôn mẫu bảng hàng, mẫu bài và bài theo mẫu (mau-bang-hang-va-bai)`.

### Task 2: Lõi — tin màn Gửi mang mẫu Zalo

`independent: false` (cần `LoiMauBai` của Task 1) · phục vụ E7

**Files:** Modify `packages/core/src/sharing/tin.ts`; Test `packages/core/src/sharing/tin.test.ts`

**Interfaces:**
- Consumes: `LoiMauBai`, `bocBai` từ `../export/mau-san` (mô-đun không dùng `node:crypto`).
- Produces: `soanTin(o: { ban; nguoiNhan; tenKhach?; mauZalo?: LoiMauBai }): string` — thứ tự: lời chào · `dau` · «Em gửi N căn đang bán:» · dòng căn · «Xem ảnh và chi tiết: [link]» · `cuoi`.

- [ ] **Step 1:** `test("Gửi: tin theo mẫu Zalo")` — (nhóm môi giới · khách riêng) × (có mẫu · không mẫu): so cả chuỗi, đếm 4; không mẫu bằng chuỗi cũ; `ganLink(tin, "https://x/s/abc")` → đếm lần xuất hiện link bằng 1.
- [ ] **Step 2:** chạy → FAIL. **Step 3:** cài đặt. **Step 4:** PASS + phá thử (đặt `cuoi` trước dòng link → ca đỏ «lời kết đứng trước link»). **Step 5:** commit.

### Task 3: API — đọc, ghi mẫu

`independent: false` (cần Task 1) · phục vụ E1, E2b, E3, E4, E5d, E7b, E8, E9b

**Files:**
- Create: `packages/api/src/mau-san/store.ts`, `packages/api/src/mau-san/routes.ts`, `packages/api/test-db/mau-bang-hang-va-bai/mau.test.ts`
- Modify: `packages/api/src/app.ts` (gọi `registerMauSanRoutes(api, deps)` cạnh `registerLabelsRoutes`)

**Interfaces:**
- `GET /api/v1/company/templates/export` → 200 `{ templates: MauBang[]; errors: string[] }`; `PUT` thân `{ templates: MauBang[] }` → 200 cùng hình · 400 `{ error: "invalid_settings", reason }` · 403 `admin_required`.
- `GET /api/v1/company/templates/posts` → 200 `{ templates: MauBai; errors: string[] }`; `PUT` thân `{ templates: MauBai }` → như trên.
- `store.ts`: `readExportTemplates(tx)`, `writeExportTemplates(tx, body)`, `readPostTemplates(tx)`, `writePostTemplates(tx, body)` — ghi bằng `insert … on conflict (company_id, key) do update` như `labels/store.ts`; quyền theo `timDiem(khoa).aiDoi` giao `rolesOf(tx)`.
- Khung route chép nếp `labels/routes.ts` (`vao`, `tra`, `withCompany`, `API_ERRORS.invalidSettings`, `API_ERRORS.adminRequired`).

- [ ] **Step 1: Viết bài DB** `mau.test.ts`, mỗi ca đúng tên ở evals:
  - «mẫu bảng: thêm, sửa, xoá» (E1)
  - «mẫu bảng: sai khuôn bị từ chối» (E2b)
  - «mẫu bài: lưu và về mặc định» (E3)
  - «mẫu: quyền và cách ly» (E4, bảng năm vai × GET/PUT + sàn B)
  - «Xuất: Đầu chủ đọc mẫu của sàn» (E5d)
  - «Gửi: tin mang mẫu Zalo» (E7b)
  - «mẫu: hiệu lực lần sau» (E8: thân công khai của Lần gửi cũ và dòng `exports` cũ `deepEqual` trước, sau)
  - «mẫu ghi thẳng mang cột nội bộ» (E9b)
  - «hai lần lưu chồng nhau» (Review Focus)

  Dựng sàn, người bằng helper của `test-db/helpers.ts` như `trang-nhom-moi-gioi/trang-moi-gioi.test.ts`.
- [ ] **Step 2:** `DATABASE_URL=postgres://postgres:quyhang@localhost:5571/postgres npm run db:test` → FAIL (404).
- [ ] **Step 3:** cài `store.ts`, `routes.ts`, đăng ký ở `app.ts`.
- [ ] **Step 4:** PASS; phá thử (bỏ kiểm vai ở PUT → ca quyền đỏ nêu vai) rồi hoàn lại.
- [ ] **Step 5:** commit `feat(api): đọc, ghi mẫu bảng hàng và mẫu bài (mau-bang-hang-va-bai)`.

### Task 4: Màn Mẫu ba tab

`independent: false` (cần Task 1 và đường API của Task 3) · phục vụ E1b, E3b, E4b, E9 (phần màn), E10c

**Files:**
- Create: `apps/web/src/app/(app)/settings/templates/mau-san.ts` (chữ `CHU_MAU`, hàm thuần), `vung-mau-bang.tsx`, `vung-mau-bai.tsx`, `mau-san.test.ts`, `mau-san.ro-ri.test.ts`
- Modify: `apps/web/src/app/(app)/settings/templates/page.tsx` (Tabs: «Mẫu nhập» · «Mẫu bảng hàng» · «Mẫu bài»; đọc ba API), `apps/web/src/app/(app)/settings/cai-dat.ts` (nhãn «Mẫu nhập» → «Mẫu»), `apps/web/src/app/(app)/settings/cai-dat.test.ts`

**Interfaces:**
- `CHU_MAU`: «Đang tải mẫu…» · «Sàn chưa có mẫu bảng hàng — xuất đang theo góc nhìn đang mở.» · «Chưa đọc được mẫu — thử lại» · «Chưa lưu được — thử lại» · «Đã lưu mẫu» · «Thêm mẫu» · «Lời mở đầu» · «Lời kết» · «Về mặc định» · «Tối đa 500 ký tự».
- `doiCho(cot: CotBangHang[], i: number, huong: -1 | 1): CotBangHang[]`
- `thanPutBai(mau: MauBai, kenh: "zalo" | "facebook", loi: LoiMauBai | null): { templates: MauBai }` — `null` = về mặc định (bỏ khoá)
- `xemTruocBai(kenh, loi): string` — bọc bài của hai căn `[Tên]` bằng `bocBai`/`baiFacebook` của lõi
- `loiO(chu: string): string | null`

Hộp sửa mẫu ghép Dialog + Checkbox + Button (nút lên/xuống) như hộp sửa cột của `vung-mau-nhap.tsx`; xoá có hộp xác nhận.

- [ ] **Step 1:** bài thuần:
  - `doiCho`: lên đầu · xuống cuối · giữa, đếm 3;
  - `thanPutBai` về mặc định: không còn khoá `facebook`, `zalo` giữ nguyên;
  - `xemTruocBai` so chuỗi;
  - `loiO`: 500 → `null`, 501 → «Tối đa 500 ký tự»;
  - bảng tám trạng thái → chữ, đếm 8 (dựng `renderToStaticMarkup` của hai vùng);
  - menu có «Mẫu», không còn «Mẫu nhập»;
  - vai không quản trị → `chanMucSan` trả đường Cá nhân (bảng năm vai, đếm 5).

  `mau-san.ro-ri.test.ts` quét mồi trên mã nguồn ba tệp màn theo nếp `broker-page`.
- [ ] **Step 2:** `npm test -w @quy-hang/web` → FAIL. **Step 3:** cài đặt; tab «Mẫu nhập» giữ nguyên `VungMauNhap`. **Step 4:** PASS + `npm run lint` (nợ giao diện 0). **Step 5:** commit.

### Task 5: Hộp Xuất và màn Gửi dùng mẫu

`independent: false` (cần Task 1, 2, 3) · phục vụ E5b, E5c, E7c, E8b

**Files:**
- Modify: `apps/web/src/app/(app)/inventory/bang-hang.tsx` (`moHopXuat` đọc hai API lúc mở rồi `setMoXuat`), `apps/web/src/app/(app)/inventory/phat-hang/hop-thoai.tsx` (ô «Cột theo» ở bước Mẫu), `apps/web/src/app/(app)/inventory/phat-hang/chuyen-dong.ts` (truyền `mauBai`), `apps/web/src/app/(app)/shares/new/man-gui.tsx` (đọc mẫu bài lúc mở, `soanTin({ …, mauZalo })`)
- Test: `apps/web/src/app/(app)/inventory/phat-hang/mau.test.ts`, `apps/web/src/app/(app)/shares/new/mau.test.ts`

**Interfaces:**
- `MoXuat` thêm `mauBang: MauBang[] | null` (`null` = đọc lỗi) và `mauBai: MauBai`.
- `cotTheo(mo: MoXuat, chon: string | null): readonly CotId[]` — `null` = góc nhìn đang mở; id mẫu → `mau.cot`.
- `CAU_LOI_MAU = "Chưa đọc được mẫu của sàn — đang theo góc nhìn đang mở"`.
- Màn Gửi: hàm thuần `tinMacDinh(ban, nguoiNhan, tenKhach, mauZalo)` để bài kiểm gọi.

- [ ] **Step 1:** bài thuần:
  - hộp Xuất: thứ tự lựa chọn «Cột theo»; xem trước theo mẫu; năm kiểu xuất (Excel đọc lại hàng tiêu đề bằng `docTep`; PDF, ảnh so tiêu đề của mô hình vẽ; bài so cả chuỗi), đếm 5; đọc lỗi → chỉ «Góc nhìn đang mở» + `CAU_LOI_MAU`; hộp đang mở giữ bộ mẫu lúc mở;
  - màn Gửi: ma trận 3×2 đếm 6; đổi mẫu rồi dựng lại; ô tin sửa được.
- [ ] **Step 2:** FAIL. **Step 3:** cài đặt. **Step 4:** PASS + `npm run typecheck`. **Step 5:** commit.

### Task 6: Tài liệu và bước cuối

`independent: false` · phục vụ hồ sơ

- [ ] Thêm dòng sổ quyết định 07/11 vào `docs/product/tham-chieu.md` §12 (mẫu bảng hàng, mẫu bài, màn Mẫu ba tab, Hỏi-1..7).
- [ ] `npm run typecheck && npm run lint && npm test && npm run test:ro-ri`; `DATABASE_URL=… npm run db:migrate && npm run db:test`.
- [ ] Sàn thiết kế cuối S3 (`design-floor-s3.mjs`), rồi hợp đồng `status: implemented`, commit.
