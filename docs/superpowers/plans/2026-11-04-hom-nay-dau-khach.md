# Hôm nay của đầu khách (hàng 37) — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vùng «Đầu khách» của Hôm nay liệt tin 7 ngày về link của chính người xem — Khách phản ứng · Vừa đổi · Căn mới —
chạm tin mở đúng chỗ làm tiếp; kèm vá ngăn chi tiết Đã gửi (Ngoài-3 hàng 36).

**Architecture:** Lõi thuần `packages/core/src/today/dau-khach.ts` dựng tin từ sự kiện đã lọc (dùng lại `giaLucGui`, `vuaDoi`,
`LUAT_GOI_Y` của hàng 36). API `GET /api/v1/today/buyer` (`packages/api/src/today-buyer/`) đọc trong phiên người xem
(`withCompany`) rồi gọi lõi. Màn ở `apps/web/src/app/(app)/today/buyer/` dựng khuôn `KhungHomNayDauKhach`, bố cục lối ReUI
`solution-crm-5` (Hỏi-1). Phần nối vào `/today` chờ hàng 92.

**Tech Stack:** TypeScript chặt, Hono + OpenAPI, pg, Next.js 16, ReUI `base-nova`, node:test.

**Spec:** `docs/superpowers/specs/2026-11-04-hom-nay-dau-khach-design.md` · hợp đồng `_acceptance/hom-nay-dau-khach/contract.md`
(đã duyệt 04/11) · evals `_acceptance/hom-nay-dau-khach/evals.yaml`.

## Global Constraints

- Không đọc bảng chủ nhà, không số khách, không trường lớp `source` (bất biến 2). Thân API không có khoá `phone`, `contactId`,
  `ownerName`, `ownerPhone`, `floorPrice`.
- Máy không gửi gì: tin chỉ mở `/shares?lan=<id>` hay `/shares/new?can=<id>` (bất biến 3).
- Cửa sổ 7 ngày, nhóm theo ngày giờ Việt Nam (UTC+7) — hằng ở `packages/core` (Hỏi-3).
- Luật khớp «Căn mới»: cùng `buildingName`, cùng `bedroomsTotal`, `|giá − giá lúc gửi| ≤ 15%` giá lúc gửi của một căn trong bộ;
  căn gốc không có giá lúc gửi không làm gốc; căn đã trong bộ không khớp; chỉ căn lên Active SAU lúc gửi (Hỏi-2).
- Ba loại tin cố định `reaction` · `changed` · `new_match`; nhãn ở một chỗ có tên trong lõi (Hỏi-4).
- Chữ UI: «Khách phản ứng», «Vừa đổi», «Căn mới», «Chưa có gì mới trong 7 ngày», «Gửi căn», «Chưa tải được — thử lại», «Thử lại».
- Dữ liệu test: `[Tên]`, `0900 000 0xx`. Không sửa migration đã commit; vòng này không thêm migration.
- `npm run lint` (gồm ui-lint quy-hang-ui) xanh; 375 px không cuộn ngang.

## Review Focus

1. Lượt mở rơi sát nửa đêm Việt Nam (23:30 UTC) — phải vào ngày Việt Nam hôm sau → ca trong E1 (Task 2) và «dựng tin» (Task 1).
2. Một căn vừa đổi giá vừa đổi trạng thái sau lúc gửi — một tin, trạng thái thắng (đúng `vuaDoi`) → dòng bảng ở Task 1.
3. Link đã tắt: tin phản ứng trước lúc tắt vẫn hiện, «Vừa đổi»/«Căn mới» không → Task 1 bảng «dựng tin» + E3/E4b (Task 2).
4. `?lan=` sai dạng hay id không có → ngăn chi tiết báo lỗi, không trống → Task 4.
5. Người nhiều vai (team_lead + buyer_agent) nhận tin của chính mình, không của cả sàn → ca 200 ở E1 (Task 2) lọc theo người gửi.

---

### Task 1: Lõi dựng tin — `packages/core/src/today/dau-khach.ts`

Phục vụ E4 (và là nền của E2, E3, E4b). `independent: false` (Task 2, 3 dùng kiểu).

**Files:**
- Create: `packages/core/src/today/dau-khach.ts`, `packages/core/src/today/dau-khach.test.ts`
- Modify: `packages/core/src/today/index.ts` (xuất lại)

**Interfaces — Produces:**
- `CUA_SO_NGAY = 7`, `LECH_GIO_VN = 7` (giờ), `NHAN_TIN: Record<KieuTin, string>` = `{ reaction: "Khách phản ứng", changed: "Vừa đổi", new_match: "Căn mới" }`.
- `type KieuTin = "reaction" | "changed" | "new_match"`.
- `type TinDauKhach = { kind: KieuTin; at: string /*ISO*/; day: string /*YYYY-MM-DD giờ VN*/; share: { id: string; recipient: string } | null; shares?: { id: string; recipient: string }[]; listing: { id: string; name: string } | null; opens?: number; interested?: { id: string; name: string }[]; changed?: VuaDoi; listPrice?: number | null }`.
  - `reaction`: `share`, `opens`, `interested`, `listing: null`. `changed`: `share`, `listing`, `changed`. `new_match`: `share: null`, `shares` (mọi bộ khớp, theo thứ tự gửi), `listing`, `listPrice`.
- `ngayVN(iso: string): string`.
- `khopBoDaGui(ung: CanSoSanh, bo: { id: string; gia: number | null; bedroomsTotal: number | null; buildingName: string }[], daTrongBo: ReadonlySet<string>, luat = LUAT_GOI_Y): boolean`.
- `dungTin(vao: VaoDungTin, bay: Date): TinDauKhach[]` — sắp `at` giảm dần, bỏ tin cũ hơn `CUA_SO_NGAY` ngày tính từ `bay`.
  `VaoDungTin = { shares: { id; recipient; createdAt; disabledAt: string | null; listings: { id; name; buildingName; bedroomsTotal; giaLucGui: number | null; suSau: SuKienDoi[]; suSauAt: string | null }[] }[]; events: { shareId; type: "link_opened" | "interest"; listingId: string | null; createdAt }[]; activeSau: { id; name; buildingName; bedroomsTotal; listPrice: number | null; activeAt: string }[] }`.
  - Phản ứng gom theo (shareId × `ngayVN(createdAt)`): `opens` = số `link_opened`, `interested` = căn có `interest` theo thứ tự trong link, `at` = `createdAt` lớn nhất.
  - «Vừa đổi»: mỗi căn của link CÒN MỞ có `vuaDoi(giaLucGui, suSau) != null` → một tin, `at = suSauAt`.
  - «Căn mới»: mỗi căn `activeSau` với `activeAt > share.createdAt` của ít nhất một link còn mở mà `khopBoDaGui` đúng → MỘT tin, `shares` = mọi link khớp.

- [ ] **Step 1: Viết test trước** `dau-khach.test.ts`, hai `describe`:
  - «khớp bộ đã gửi» — bảng viết trước, gốc toà A 2 PN 3,0 tỷ (3_000_000_000): toà A 2 PN 3,2 tỷ → true; toà A 2 PN 3,6 tỷ → false; toà A 3 PN 3,0 tỷ → false; toà B 2 PN 3,0 tỷ → false; căn đã trong bộ → false; gốc `gia: null` → false. Mỗi dòng một `assert.equal`.
  - «dựng tin» — đầu vào viết trước cho ra danh sách deepEqual: hai lượt mở + quan tâm căn 1, 3 cùng ngày → một reaction `opens: 2`, `interested` [căn 1, căn 3]; lượt mở `2026-11-03T23:30:00Z` → `day: "2026-11-04"`; căn đổi giá và đổi trạng thái → một changed `{status:{to:"Pending"}}`; link đã tắt có căn đổi giá → không changed nhưng reaction trước lúc tắt vẫn có; căn Active trước lúc gửi → không new_match; căn khớp hai bộ → một new_match, `shares` 2 phần tử; căn Pending rồi Active sau lúc gửi (activeAt sau) → new_match; sự kiện cũ hơn 7 ngày → không tin.
- [ ] **Step 2:** `npm test -w @quy-hang/core` → đỏ (chưa có module).
- [ ] **Step 3:** Viết `dau-khach.ts` theo Interfaces; xuất qua `today/index.ts`.
- [ ] **Step 4:** `npm test -w @quy-hang/core` xanh; phá thử: bỏ điều kiện `bedroomsTotal` → dòng 3 PN đỏ, hoàn lại.
- [ ] **Step 5:** Commit `feat(core): dựng tin Hôm nay đầu khách (hàng 37)`.

### Task 2: API `GET /api/v1/today/buyer`

Phục vụ E1, E2, E3, E4b. `independent: false` (cần Task 1).

**Files:**
- Create: `packages/api/src/today-buyer/routes.ts`, `packages/api/src/today-buyer/store.ts`, `packages/api/test-db/hom-nay-dau-khach.test.ts`
- Modify: `packages/api/src/app.ts` (đăng ký `registerTodayBuyerRoutes` cạnh `registerDaGuiRoutes`)

**Interfaces:**
- Consumes: `dungTin`, `TinDauKhach` (Task 1); mẫu `vao()`/`withCompany` của `packages/api/src/da-gui/routes.ts`.
- Produces: `GET /api/v1/today/buyer` → `200 { items: TinDauKhach[] }`; không phiên 401; vai không có `buyer_agent` → `API_ERRORS.buyerAgentRequired` (403). Lọc `s.sender_user_id = <người xem>` LUÔN (kể cả trưởng nhóm).
- `docVaoDungTin(tx: pg.PoolClient, me: string, tu: Date): Promise<VaoDungTin>` ở `store.ts`: shares của `me` (`created_at >= tu − 30 ngày` không cần — đọc mọi link của mình, sự kiện lọc `>= tu`), `share_events` `created_at >= tu`, `listing_events` `price_changed`/`status_changed` theo căn trong link (tách trước/sau `shares.created_at` như `readShare`), `activeSau` = `status_changed` với `payload->>'to' = 'Active'` và `occurred_at >= tu` kèm `catalog_units.bedrooms_total` (lateral như `readShare`). Không join `owners`, `contacts`.

- [ ] **Step 1: Viết test-db trước** `hom-nay-dau-khach.test.ts` theo mẫu `packages/api/test-db/da-gui.test.ts` (cùng bộ dựng sàn, người, lệnh thật). Năm ca, tên đúng chữ evals:
  «hôm nay đầu khách: tin theo người xem» (E1 — tập shareId deepEqual từng đầu khách; bảng mã HTTP: đầu chủ 403, telesales 403, trưởng nhóm không vai Đầu khách 403, không cookie 401, đầu khách + đầu chủ 200; ca 23:30 UTC; thân không khoá cấm, không số khách, không tên chủ — máy dò có đối chứng dương),
  «hôm nay đầu khách: một tin phản ứng mỗi Lần gửi mỗi ngày» (E2),
  «hôm nay đầu khách: căn đã gửi vừa đổi» (E3 — gồm đổi giá đáy qua PUT owner không sinh tin),
  «hôm nay đầu khách: căn mới khớp bộ đã gửi» (E4b).
- [ ] **Step 2:** Postgres dãy L 5571: `DATABASE_URL=postgres://postgres:quyhang@localhost:5571/postgres npm run db:migrate && npm run db:test` → các ca mới đỏ.
- [ ] **Step 3:** Viết `store.ts`, `routes.ts`, đăng ký ở `app.ts`. Bảng OpenAPI theo cách `da-gui` (route thường).
- [ ] **Step 4:** Lệnh ở Step 2 xanh; phá thử: bỏ lọc người gửi → E1 đỏ nêu shareId thừa; bỏ lọc link đã tắt → E3 đỏ; hoàn lại. `npm test -w @quy-hang/api` (one-door, ro-ri app) xanh.
- [ ] **Step 5:** Commit `feat(api): GET /api/v1/today/buyer (hàng 37)`.

### Task 3: Vùng «Đầu khách» — khuôn, trạng thái, đích chạm

Phục vụ E5 (nửa today), E6, E8, E8b. `independent: false` (kiểu từ Task 1).

**Files:**
- Create: `apps/web/src/app/(app)/today/buyer/khung.tsx` (`KhungHomNayDauKhach`), `.../buyer/vung.tsx` (vùng client: tải `GET /api/v1/today/buyer`, trạng thái, dòng tin theo lối `solution-crm-5` — cài khối ReUI theo `.claude/rules/giao-dien.md`, chuyển thể chỉ đổi dữ liệu/chữ/prop), `.../buyer/dau-khach.ts` (thuần: `hrefTin(t: TinDauKhach): string`, `nhomTheoNgay(ds, homNay: string): { nhan: string; day: string; tin: TinDauKhach[] }[]` nhãn «Hôm nay» · «Hôm qua» · «Thứ Hai 2/11»), `.../buyer/dau-khach.test.ts`, `design/patterns/hom-nay-dau-khach.md` (nhóm mới; khuôn, `nhan_dien` `vung.tsx`, `mau_dang_chay` trỏ `/today`, luật `KH-hndk-*`).
- Modify: `packages/ui-lint` bảng viết trước nhóm `hom-nay-dau-khach` và đếm khuôn — đếm lại từ cây bằng `node packages/ui-lint/ban-do-khuon.mjs --root .` (luật 51).

**Interfaces:**
- Produces: `export function VungDauKhach(): JSX.Element` (client, tự tải), `export function DongTinDauKhach({ trang }: { trang: TrangThaiVung })` (dựng được bằng createElement trong test), `type TrangThaiVung = { kieu: "dang-tai" } | { kieu: "loi" } | { kieu: "xong"; ds: TinDauKhach[] }`, `KhungHomNayDauKhach({ children })`.
- `hrefTin`: reaction/changed → `/shares?lan=${encodeURIComponent(share.id)}`; new_match → `/shares/new?can=${encodeURIComponent(listing.id)}`.

- [ ] **Step 1: Test trước** `dau-khach.test.ts`: «hôm nay đầu khách: đích chạm» (bảng ba dòng href) và «hôm nay đầu khách: trạng thái vùng» (`renderToStaticMarkup` từng trạng thái: trống có «Chưa có gì mới trong 7 ngày» và «Gửi căn»; lỗi có «Chưa tải được — thử lại» và «Thử lại»; đang tải dùng `ChoTai`; có tin có «Hôm nay» và ba nhãn).
- [ ] **Step 2:** `npm test -w @quy-hang/web` đỏ.
- [ ] **Step 3:** Viết các tệp; trạng thái qua `TrangThai`; không `Frame`/`Card` ngoài khuôn.
- [ ] **Step 4:** `npm test -w @quy-hang/web` xanh; `npm run lint` xanh; `npm test -w @quy-hang/ui-lint` xanh; phá thử: trống bỏ nút → ca đỏ.
- [ ] **Step 5:** Commit `feat(web): vùng Hôm nay đầu khách (hàng 37)`.

### Task 4: Đã gửi — mở thẳng `?lan=`, ngăn chi tiết đang tải/lỗi (AC-7)

Phục vụ E5 (nửa shares), E7. `independent: true` so với Task 1–3 (chỉ chạm `shares/**`).

**Files:**
- Modify: `apps/web/src/app/(app)/shares/da-gui.ts` (thêm `docLanTuThamSo(q: string | null): string | null` — chỉ uuid 36 ký tự; `taiChiTiet(goi: Goi, id: string): Promise<{ kieu: "xong"; ct: LanGuiChiTiet } | { kieu: "loi" }>` — 200 → xong, mọi mã khác và mạng ném → lỗi), `.../shares/man-da-gui.tsx` (đọc `?lan=` mở ngăn lúc vào; trạng thái chi tiết `dang-tai | loi | xong`; nút «Thử lại» tải lại), `.../shares/danh-sach.tsx` (`ChiTietLanGui` nhận trạng thái: đang tải → `ChoTai`; lỗi → `TrangThai kind="error" title="Chưa tải được — thử lại"` + nút «Thử lại»), `.../shares/da-gui.test.ts`.

- [ ] **Step 1: Test trước**: «đã gửi: mở thẳng một Lần gửi từ ?lan=» (uuid hợp lệ → id; `"abc"`, `""`, `null` → null) và «đã gửi: ngăn chi tiết khi đang tải và tải lỗi» (dựng hai trạng thái; bảng `taiChiTiet` 200/404/500/ném deepEqual).
- [ ] **Step 2:** `npm test -w @quy-hang/web` đỏ.
- [ ] **Step 3:** Sửa ba tệp.
- [ ] **Step 4:** Xanh; phá thử: `taiChiTiet` coi `!ok` là xong-null → ca đỏ; hoàn lại. `npm run lint` xanh.
- [ ] **Step 5:** Commit `fix(web): ngăn chi tiết Đã gửi có đang tải và lỗi, mở từ ?lan= (hàng 37, Ngoài-3 hàng 36)`.

### Task 5: Tham chiếu và bảng đối chiếu ngành

Phục vụ AC-8. `independent: false` (ghi «Đã dựng» sau khi Task 1–4 xong).

**Files:** Modify `docs/product/tham-chieu.md` («Hôm nay của đầu khách — Đã dựng (hàng 37)», phần nối chờ 92), `docs/product/doi-chieu-nganh.md` nếu có điều mới tra được (không có thì không sửa).

- [ ] **Step 1:** Sửa Tham chiếu; `npm run lint` xanh. Commit `docs: Tham chiếu ghi Hôm nay đầu khách (hàng 37)`.

### Task 6: Nối vào `/today` — CHỜ hàng 92 gộp

Phục vụ E1b, E6b. `independent: false`. Chặn tới khi `lam-lai-hom-nay-dau-chu` vào `origin/main` (gộp main bằng git, luật 51).

**Files:** Modify `apps/web/src/app/(app)/today/truong-nhom-trang-thai.ts` (`VungHomNay` thêm `"dau-khach"`; `buyer_agent` → đẩy `"dau-khach"` SAU các vùng khác), `.../today/page.tsx` (nhánh `v === "dau-khach"` → `<KhungHomNayDauKhach><VungDauKhach /></KhungHomNayDauKhach>`), `.../today/truong-nhom.test.ts` («hôm nay theo vai: vùng Đầu khách», năm dòng bảng của E1b).

- [ ] **Step 1:** Test E1b trước → đỏ. **Step 2:** sửa hai tệp → xanh, phá thử bỏ `dau-khach` → dòng `[buyer_agent]` đỏ. **Step 3:** `npm run typecheck && npm run lint && npm test` xanh. Commit `feat(web): nối vùng Đầu khách vào Hôm nay (hàng 37)`.

Cuối S3: chạy khối sàn thiết kế S3 (`design-floor-s3.mjs`), rồi hợp đồng `status: implemented`, rồi S4.
