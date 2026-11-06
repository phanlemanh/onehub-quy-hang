# Tác tử lập kế hoạch nhập (hàng 68) — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sàn bật «Xử lý bằng AI» thì cột chưa ghép của một bảng hàng được gửi (đã che) tới Claude, đề xuất trả về được kiểm,
hiện «Máy đề xuất» kèm lý do, người duyệt rồi mới ghi; tắt, hết trần hay lỗi thì nhập như hàng 65.

**Architecture:** Lõi (`packages/core/src/import/ai/`) giữ mọi luật thuần — dựng gói, quét dữ liệu cá nhân, khuôn đề xuất,
kiểm và gộp, lời nhắc cố định — dùng chung trình duyệt, máy chủ và bài đo. API (`packages/api/src/imports/ai/`) giữ cửa:
vai, thoả thuận, trần, quét lại, gọi Claude bằng `fetch`, sổ `ai_usage`. Màn chỉ gọi và trình bày.

**Tech Stack:** TypeScript chặt, Hono + zod-openapi, Postgres (migration 035, RLS), Next.js + ReUI, node:test + tsx.

**Spec:** `_acceptance/nhap-tac-tu-ke-hoach/design.md` · hợp đồng `contract.md` (11 AC, đã duyệt 05/11) · `evals.yaml` (20 eval).

## Global Constraints

- Mô hình `claude-opus-5-5`; `POST https://api.anthropic.com/v1/messages`; header `x-api-key: $ANTHROPIC_API_KEY`,
  `anthropic-version: 2026-10-21`, `anthropic-beta: server-side-fallback-2026-07-01`; thân `thinking: {type: "adaptive"}`,
  `output_config: {effort: "medium", format: {type: "json_schema", schema: KHUON_DE_XUAT}}`, `fallbacks: "default"`,
  `max_tokens: 16000`, `system: [{type: "text", text: LOI_NHAC, cache_control: {type: "ephemeral"}}]`. Không `temperature`.
  `stop_reason: "refusal"` → kết quả `provider_error`.
- Tiền (USD): vào 4e-6, ra 20e-6, đọc đệm 0,2e-6, ghi đệm 5e-6 mỗi token. Trần một lần gọi 240 000 ms (AbortController).
- Không thêm gói npm, không chạm `package-lock.json` (gọi bằng `fetch`, khách tiêm qua `ApiDeps.khachAi`).
- Trần tháng: khoá `ai.monthly_budget_usd` (mặc định 10), tổng `ai_usage.cost_usd` từ đầu tháng giờ `Asia/Ho_Chi_Minh`.
- Câu chữ màn (nguyên văn): «Máy đang đề xuất cách ghép…» · «Máy đề xuất» · «Đã đồng ý» · «Đồng ý» · «Đồng ý mọi đề xuất (N)»
  · «Còn N cột máy đề xuất chưa duyệt» · «Chưa dùng được AI: <lý do> — ghép tay các cột còn lại» · «Xử lý bằng AI» ·
  «Tháng này đã dùng X / Y USD» · «Đã hết trần tháng này — nhập đang chạy không AI» · «Chưa đọc được trạng thái AI».
- Lý do tất định (nguyên văn, `lyDo` của API): chưa bật «Sàn chưa bật Xử lý bằng AI» · tạm ngừng «Xử lý bằng AI đang tạm
  ngừng» · thiếu khoá «AI chưa sẵn sàng trên máy chủ» · hết trần «Hết trần AI tháng này» · lỗi «AI đang lỗi, thử lại sau» ·
  quá giờ «AI trả lời quá lâu» · sai khuôn «AI trả lời sai khuôn» · chặn «Gói có dữ liệu cá nhân — không gửi».
- Tiền tố lý do của cột máy đề xuất: `LY_DO_MAY_DE_XUAT = "Máy đề xuất"`, lý do đầy đủ `"Máy đề xuất: <lý do của Claude>"`.
- Dữ liệu mẫu chỉ `[Tên]`, `0900 000 0xx`; không khoá thật nào trong kho.
- Postgres dãy G: `DATABASE_URL=postgres://postgres:quyhang@localhost:5573/postgres` trên dòng lệnh (giám sát G-0511-2).

## Review Focus

- Bảng không có cột chưa ghép (mẫu khớp trọn) → không gọi đường đề xuất lần nào — ca ở Task 5.
- Claude trả đề xuất cho chỉ số cột vượt độ dài bảng hay số âm → bỏ cột ấy, không ném — ca ở Task 3.
- Người đổi file khác giữa lúc đang chờ đề xuất → kết quả của file cũ bị bỏ, không gộp vào file mới — ca ở Task 5.
- Tiêu đề trống hay trùng nhau trong một file → gói vẫn dựng theo chỉ số cột, kiểm theo chỉ số — ca ở Task 3.
- Sàn vừa tắt AI trong lúc một Đầu chủ đang chờ → lời gọi kế đọc thoả thuận mới, trả tất định — ca ở Task 4 (đọc thoả thuận
  trong cùng giao dịch mỗi lời gọi).

---

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Việc gửi sang AI là một thoả thuận của sàn, chặn thông tin chủ nhà | `packages/core/src/agreements.ts` | AC-4 (thoả thuận AI) |
| Cơ sở dữ liệu nhận thoả thuận AI và giữ sổ chi phí riêng từng sàn | `packages/db/migrations/035_*.sql` | AC-4, AC-9 (trần chi phí) |
| Máy dựng gói đã che, kiểm và gộp đề xuất bằng một bộ luật dùng chung | `packages/core/src/import/ai/**` | AC-2, AC-3, AC-6 |
| Máy chủ có cửa đề xuất, công tắc bật tắt và sổ chi phí | `packages/api/src/imports/ai/**` | AC-3, AC-5, AC-8, AC-9, AC-11 |
| Màn ghép cột hỏi máy, giữ đề xuất chờ duyệt | `apps/web/src/lib/nhap/**` | AC-7, AC-8, AC-10 |
| Người thấy huy hiệu, lý do, nút đồng ý; Quản trị sàn thấy công tắc | màn Nhập, `settings/ai` | AC-5, AC-7, AC-8 |
| Số đo ghép cột trên bảng kiểu lạ có tác tử | `_acceptance/…/thu/**` | AC-1 |

### Task 1: Loại kết nối «Xử lý bằng AI» ở lõi

`independent: true` · phục vụ E4

**Files:** Modify `packages/core/src/agreements.ts` (thêm `"ai_processing"` vào `CONNECTION_KINDS`, chỉ thêm) · Test
`packages/core/src/agreements.test.ts`.

**Interfaces:** Produces `ConnectionKind` gồm `"ai_processing"`; `mayFlow`, `agreementErrors` không đổi chữ ký.

- [ ] **Step 1: Viết ca «ai_processing: chỉ catalog và shareable_listing ra Anthropic»** — assert theo E4: `CONNECTION_KINDS`
  chứa `ai_processing`; thoả thuận `{kind ai_processing, outbound, counterparty "anthropic", dataClasses [catalog,
  shareable_listing], status active}` → `agreementErrors` rỗng; `mayFlow` ok cho hai lớp với `{kind: "ai_processing",
  direction: "outbound"}`; năm lớp còn lại (ma trận viết tay) từ chối; `source` từ chối cả khi liệt kê; thêm `source` vào
  `dataClasses` → `agreementErrors` có lỗi; `paused` → từ chối.
- [ ] **Step 2:** `npm test -w @quy-hang/core` → đỏ ở assert `CONNECTION_KINDS chứa ai_processing`.
- [ ] **Step 3:** thêm phần tử vào `CONNECTION_KINDS`.
- [ ] **Step 4:** chạy lại → xanh; phá thử: bỏ dòng chặn `source` đầu `mayFlow` trên bản sao → hai assert source đỏ, hoàn lại.
- [ ] **Step 5:** commit `feat(core): loại kết nối ai_processing (hàng 68)`.

### Task 2: Migration 035 — thoả thuận AI và sổ `ai_usage`

`independent: true` · phục vụ E4b, E9, E9b

**Files:** Create `packages/db/migrations/035_xu_ly_bang_ai.sql` · Modify `packages/db/tests/isolation.test.mjs` (thêm ca, chỉ
thêm dòng).

**Interfaces:** Produces bảng `public.ai_usage(id uuid pk default gen_random_uuid(), company_id uuid not null references
companies, user_id text not null, model text not null, input_tokens int not null, output_tokens int not null,
cache_read_tokens int not null default 0, cache_write_tokens int not null default 0, cost_usd numeric(10,6) not null,
duration_ms int not null, result text not null check (result in ('ok','blocked_pii','provider_error','timeout',
'invalid_output')), blocked_kinds text[] not null default '{}', created_at timestamptz not null default now())`; ràng buộc
`agreements.kind` thêm `ai_processing` (giữ sáu giá trị cũ); `unique (company_id) where kind = 'ai_processing'` để một sàn
một thoả thuận AI.

- [ ] **Step 1: Viết ca cách ly** «ai_usage: ép luật theo dòng, sàn B không đọc, không chèn dòng của sàn A» (E9b) theo nếp
  `asUser` của tệp.
- [ ] **Step 2:** `DATABASE_URL=…5573 npm run db:migrate && DATABASE_URL=…5573 npm run test:isolation -w @quy-hang/db` → đỏ (bảng chưa có).
- [ ] **Step 3: Viết migration** — tên ràng buộc cũ đọc bằng `select conname from pg_constraint where conrelid =
  'agreements'::regclass and contype = 'c' and pg_get_constraintdef(oid) like '%kind%'` trong khối `do $$`, drop rồi add
  `agreements_kind_check` mới; `ai_usage`: enable + force RLS, policy select/insert `company_id = app.current_company_id()`;
  `grant select, insert on ai_usage to quy_hang_app` (không update, delete — chỉ thêm); trigger chặn update/delete như nếp
  sổ chỉ thêm của kho.
- [ ] **Step 4:** migrate + isolation xanh; ca «mọi bảng dữ liệu đều bật và ép luật» vẫn xanh.
- [ ] **Step 5:** commit `feat(db): 035 thoả thuận Xử lý bằng AI và sổ ai_usage (hàng 68)`.

### Task 3: Lõi đề xuất — gói, quét, khuôn, kiểm, gộp, lời nhắc

`independent: true` · phục vụ E2 (phần lõi), E3, E6, E10 (phần lõi)

**Files:** Create `packages/core/src/import/ai/{goi.ts,quet.ts,khuon.ts,kiem.ts,loi-nhac.ts,index.ts,kiem.test.ts,goi.test.ts}`
· Modify `packages/core/src/import/index.ts` (một dòng `export * from "./ai"`).

**Interfaces (Produces):**
- `type CotGoi = { cot: number; tieuDe: string; lop: ColumnClass; hinhDang: ColumnShape; dich?: PlanTarget; giaTri?: string[] }`
- `type GoiDeXuat = { cot: CotGoi[] }` · `dungGoiDeXuat(profile: ColumnProfile[], plan: ImportPlan): GoiDeXuat` — cột
  `confidence === "low"` là chưa ghép; `giaTri` chỉ khi chưa ghép và `lop ∈ {catalog, shareable_listing}` (lấy `profile.values`).
- `cotChuaGhep(goi: GoiDeXuat): number[]` · `bamGoi(goi: GoiDeXuat): string` (sha-256 hex của JSON khoá xếp thứ tự).
- `quetGoi(goi: GoiDeXuat): { trung: PersonalHit | "person_name"; cho: "tieu_de" | "gia_tri" }[]` — tiêu đề: `detectPersonal`;
  giá trị: `detectPersonal` + `looksLikePersonName`.
- `kiemKhuonGoi(v: unknown): { goi: GoiDeXuat } | { loi: string }` — khuôn chặt cho máy chủ (khoá lạ, giá trị ở cột sai lớp).
- `KHUON_DE_XUAT` (JSON Schema: `{ de_xuat: [{ cot: integer, dich: string, phep?: {name, params}, quy_doi?: object, ly_do: string }] }`,
  `additionalProperties: false`) · `LOI_NHAC: string` (vai, trường chuẩn kèm nhãn `FIELD_LABEL`, thực đơn phép, luật «không
  bỏ mất cột», chỉ đề xuất cho cột chưa ghép; không ví dụ nào chứa dữ liệu thật) · `bamLoiNhac(): string`.
- `LY_DO_MAY_DE_XUAT = "Máy đề xuất"` · `kiemDeXuat(goi: GoiDeXuat, v: unknown): { deXuat: DeXuatCot[]; loi: { cot: number | null; lyDo: string }[] }`
  · `gopDeXuat(plan: ImportPlan, ketQua: { deXuat: DeXuatCot[] }): ImportPlan` (cột trùng đích hạ `keep_as_note`, `low`, thêm câu hỏi «Cột «X» trùng đích với …»).

- [ ] **Step 1: Viết `kiem.test.ts` ca «kiểm đề xuất từng cột»** đúng E6 (tám ca lỗi, đề xuất đúng giữ, trùng đích, qua
  `validatePlan`, tiền tố lý do, khoá lạ ở gốc); **`goi.test.ts`** ca «gói theo lớp» (ma trận `Record<ColumnClass, …>` sáu lớp ×
  hai tình trạng, 12 assert) và ca «chỉ số cột ngoài bảng bị bỏ», «tiêu đề trống, trùng» (Review Focus).
- [ ] **Step 2:** `npm test -w @quy-hang/core` → đỏ (module chưa có).
- [ ] **Step 3:** viết sáu tệp theo Interfaces.
- [ ] **Step 4:** xanh; phá thử: bỏ kiểm khoá `quy_doi` → ca quy đổi trái phép đỏ, hoàn lại.
- [ ] **Step 5:** commit `feat(core): gói, quét, kiểm, gộp đề xuất AI (hàng 68)`.

### Task 4: Cửa đề xuất ở máy chủ

`independent: false` (cần Task 1–3) · phục vụ E2, E3, E3b, E4b, E5, E8, E9, E11

**Files:** Create `packages/api/src/imports/ai/{claude.ts,store.ts,routes.ts,gia.ts,goi.ro-ri.test.ts,quet.ro-ri.test.ts}` ·
Modify `packages/api/src/imports/routes.ts` (một dòng `registerAiRoutes(api, deps, vao)`), `packages/api/src/app.ts` (một
khoá `khachAi?: KhachAi | null` trong `ApiDeps`) · Test `packages/api/test-db/imports/ai.test.ts`.

**Interfaces:**
- Consumes Task 3 (`kiemKhuonGoi`, `quetGoi`, `kiemDeXuat`, `LOI_NHAC`, `KHUON_DE_XUAT`), Task 1 (`mayFlow`).
- Produces `type KhachAi = (goi: GoiDeXuat, tin: AbortSignal) => Promise<{ json: unknown; model: string; usage: { input_tokens: number; output_tokens: number; cache_read_input_tokens?: number; cache_creation_input_tokens?: number } }>`;
  `khachClaude(env = process.env, f = fetch): KhachAi | null` (null khi vắng `ANTHROPIC_API_KEY`); `khachGia(thuMuc: string): KhachAi`
  (đọc `de-xuat/<băm gói>.json` — chỉ dùng khi `QH_AI_GIA` có và `NODE_ENV !== "production"`); `tinhTien(usage): number`.
- Routes: `POST /api/v1/imports/ai/plan` (thân `GoiDeXuat`, vai `listing_agent`/`team_lead`) → `200 {cheDo: "ai", deXuat, loi}`
  hay `200 {cheDo: "tat-dinh", lyDo}`, `400` khuôn; `GET /api/v1/imports/ai` → `{bat, tamNgung, conTran, tranThangUsd, daDungUsd, sanSang}`
  (mọi vai của sàn; `daDungUsd` chỉ quản trị); `PUT /api/v1/imports/ai/agreement` `{bat: boolean}` (chỉ `company_admin`).
- Thứ tự trong `POST plan`: khuôn → vai → thoả thuận (`kind ai_processing`, `status active`, mỗi cột có `giaTri` qua `mayFlow`)
  → khoá (`deps.khachAi ?? khachClaude()`) → trần → `quetGoi` (trúng → dòng `blocked_pii`) → gọi (240 s) → `kiemDeXuat` (lỗi gốc →
  `invalid_output`) → dòng `ai_usage` → trả.

- [ ] **Step 1: Viết hai bài rò** (`goi.ro-ri.test.ts`, `quet.ro-ri.test.ts`) đúng E2, E3 trên bộ thử 64 và bộ lạ; **`test-db/imports/ai.test.ts`**
  sáu ca đúng E3b, E4b, E5, E8 (ma trận sáu ca không AI, đồng hồ giả), E9 (công thức tiền, ranh tháng giờ VN, UPDATE/DELETE từ chối), E11 (ma trận vai).
- [ ] **Step 2:** `npm run test:ro-ri` và `DATABASE_URL=…5573 sh -c 'npm run db:migrate && npm run db:test'` → đỏ.
- [ ] **Step 3:** viết `gia.ts`, `claude.ts`, `store.ts`, `routes.ts`, hai dòng đăng ký.
- [ ] **Step 4:** cả hai lệnh xanh; phá thử: bỏ `quetGoi` ở route → E3b đỏ «khách AI bị gọi…»; bỏ kiểm vai → E11 đỏ; hoàn lại.
- [ ] **Step 5:** commit `feat(api): cửa đề xuất Xử lý bằng AI, trần, sổ chi phí (hàng 68)`.

### Task 5: Đường ống màn — gọi, gộp, chờ duyệt

`independent: false` (cần Task 3; gọi API theo khuôn Task 4) · phục vụ E7, E8b, E10

**Files:** Create `apps/web/src/lib/nhap/de-xuat.ts`, `apps/web/src/lib/nhap/de-xuat.test.ts` · Modify `apps/web/src/lib/nhap/goi-api.ts`
(thêm `deXuatGhep(f, goi)`, `docTrangThaiAi(f)`).

**Interfaces:** Produces `type TrangThaiDeXuat = { choDuyet: number[]; dangHoi: boolean; baoTatDinh: string | null; phien: number }`;
`hoiDeXuat(ong: Ong, goiApi, phien: number): Promise<{ ong: Ong; tt: TrangThaiDeXuat }>` (không cột chưa ghép → không gọi;
kết quả của `phien` cũ bị bỏ); `dongY(tt, cot)`, `dongYHet(tt)`, `khiDoiDich(tt, cot)`; `coTheTiepGhep(ong, tt)` (thêm điều
kiện `choDuyet` rỗng, thông điệp «Còn N cột máy đề xuất chưa duyệt»); `cauTatDinh(lyDo) = "Chưa dùng được AI: " + lyDo + " — ghép tay các cột còn lại"`.

- [ ] **Step 1: Viết `de-xuat.test.ts`** ba ca đúng E7, E8b, E10 + ca «đổi file giữa chừng bỏ kết quả cũ» (Review Focus).
- [ ] **Step 2:** `npm test -w @quy-hang/web` → đỏ.
- [ ] **Step 3:** viết `de-xuat.ts`, hai hàm gọi API.
- [ ] **Step 4:** xanh; phá thử: `coTheTiepGhep` bỏ kiểm `choDuyet` → E7 đỏ; hoàn lại.
- [ ] **Step 5:** commit `feat(web): đề xuất ghép chờ duyệt ở đường ống nhập (hàng 68)`.

### Task 6: Màn — huy hiệu, lý do, đồng ý; mục Cài đặt «Xử lý bằng AI»

`independent: false` (cần Task 4, 5) · phục vụ E5b, E7b, E8c, E12, E13

**Files:** Modify `apps/web/src/app/(app)/imports/new/man-nhap.tsx` (bước 2 gọi `hoiDeXuat`, dải chờ, dải tất định, nút đồng ý
hết), `apps/web/src/components/khoi/solution-crm-6/buoc.tsx` (prop `deXuat?: {lyDo: string; daDongY: boolean}` mỗi dòng, `Badge`
biến thể `-light`, nút «Đồng ý») · Create `apps/web/src/app/(app)/settings/ai/{page.tsx,cong-tac.tsx}` (dựng `MucCaiDat` như
`settings/users`; `Switch`, `Alert`) · Modify `apps/web/src/app/(app)/settings/cai-dat.ts` (thêm `{ label: "Xử lý bằng AI",
href: "/settings/ai" }` cuối `MUC_SAN`), `cai-dat.test.ts` (danh sách tám mục), `components/shell/second-column.tsx` (biểu tượng lucide `SparklesIcon`).

- [ ] **Step 1:** sửa ca E2 của `cai-dat.test.ts` sang tám mục → `npm test -w @quy-hang/web` đỏ.
- [ ] **Step 2:** dựng màn và mục theo khuôn `nhap-excel`, `cai-dat-san`; chạy skill `quy-hang-ui` (luật lint, khối ReUI).
- [ ] **Step 3:** `npm run typecheck && npm run lint && npm test -w @quy-hang/web && npm test -w @quy-hang/ui-lint` xanh; bài khuôn tay
  (`design-floor-khuon.mjs --kiem`) không «lệch:» cho hai nhóm.
- [ ] **Step 4:** commit `feat(web): huy hiệu Máy đề xuất và mục Xử lý bằng AI (hàng 68)`.

### Task 7: Số đo có tác tử trên bảng kiểu lạ

`independent: false` (cần Task 3) · phục vụ E1

**Files:** Create `_acceptance/nhap-tac-tu-ke-hoach/thu/{lap-de-xuat.ts,do-tac-tu.ts}`, `_acceptance/nhap-tac-tu-ke-hoach/de-xuat/<băm gói>.json`
(13 tệp), `_acceptance/nhap-tac-tu-ke-hoach/so-do-tac-tu.json`, `packages/core/src/import/ai/do-tac-tu.test.ts`.

**Interfaces:** Tệp đề xuất `{ ten: string; bamGoi: string; bamLoiNhac: string; lapBoi: "lập bởi tác tử context sạch"; ngay: string; dauRa: unknown }`.

- [ ] **Step 1:** `lap-de-xuat.ts` in cho từng file của bộ lạ (4) và bộ thử 64 (9) đúng hai thứ: `LOI_NHAC` và JSON gói; mỗi file
  một tác tử context sạch (Agent, không công cụ đọc kho) nhận đúng hai thứ ấy, trả JSON theo `KHUON_DE_XUAT`; ghi tệp đề xuất.
- [ ] **Step 2:** viết `do-tac-tu.test.ts` ba ca đúng E1 → đỏ (chưa có `so-do-tac-tu.json`).
- [ ] **Step 3:** `do-tac-tu.ts` tính số và ghi `so-do-tac-tu.json` (qua `quetGoi` → `kiemDeXuat` → `gopDeXuat` → `applyPlan` → `doTep`).
- [ ] **Step 4:** xanh và đạt ngưỡng; hụt ngưỡng → KHÔNG sửa đề xuất tay: ghi số thật, dừng, báo (dòng sổ `revisit` theo Out of scope 1).
- [ ] **Step 5:** commit `test(acceptance): số đo có tác tử trên bảng kiểu lạ (hàng 68)`.

### Task 8: Chỗ thử và lệnh chụp cho ba ca nhìn màn; Tham chiếu

`independent: false` (cần Task 6) · phục vụ E5b, E7b, E8c

**Files:** Create `_acceptance/nhap-tac-tu-ke-hoach/thu/chup.mjs` (các `--ca`, `--kho`; tự đăng nhập người mẫu; in JSON và
lời gọi mạng; chụp `evidence/E*-*.png`) và `thu/sinh-xlsx.ts` (ghi bốn file lạ thành xlsx) · Modify `docs/product/tham-chieu.md`
(§12 một dòng 05/11; §9 thêm mục «Xử lý bằng AI»).

- [ ] **Step 1:** chạy thử từng `--ca` trên dev dãy G (3493, khách giả `QH_AI_GIA`), tắt dev bằng `kill <PID>` ngay sau (luật 8, 43).
- [ ] **Step 2:** commit `test(acceptance): lệnh chụp và Tham chiếu (hàng 68)`.
