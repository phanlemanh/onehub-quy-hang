# Bảng quyền thao tác × vai (hàng) — kế hoạch thực thi

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (Native — phiên này tự làm tuần tự). Bước dùng `- [ ]`.

**Goal:** Một bảng quyền ở lõi quyết ai xem, tạo, sửa, đưa lên Đang bán một hàng; API, luật theo dòng, ô Trạng thái và trang
Bảng hàng cùng đọc bảng ấy.

**Architecture:** Bảng viết trước `packages/core/src/access/bang-quyen-hang.json` (14 ca × 4 thao tác). Hàm lõi
`duocLamVoiHang` là nguồn duy nhất của luật; `lopPhuHoSo().sanSang` gọi nó. API đặt lớp vai trước `canRead`; migration 046
thêm trục vai vào năm luật theo dòng; màn đọc cờ từ lõi.

**Tech Stack:** TypeScript (node:test qua tsx), Hono, Postgres 16 (luật theo dòng), Next.js.

**Spec:** `docs/superpowers/specs/2026-11-05-bang-quyen-theo-vai-design.md` · hợp đồng `_acceptance/bang-quyen-theo-vai/contract.md`
· phép thử `_acceptance/bang-quyen-theo-vai/evals.yaml`.

## Global Constraints

- `VAI_BANG_HANG = ["listing_agent", "buyer_agent", "team_lead"]`; người có Bảng hàng = có ít nhất một vai trong đó.
- Đưa lên Đang bán: `team_lead ∈ vai` HOẶC (`listing_agent ∈ vai` VÀ (người giữ mới nhất = người xem HOẶC chưa ai giữ)).
- Telesales, Quản trị sàn: mọi lời gọi hàng → `404 not-found`; không đủ cờ Đang bán → `403 listing-agent-required`, xét
  TRƯỚC phép so phiên bản.
- Migration mới `046_bang_quyen_hang.sql`; không sửa migration cũ. Hai hàm mới `security definer`, `search_path = ''`, chỉ
  `quy_hang_app` được gọi.
- Lệnh có DB: `DATABASE_URL=postgres://postgres:quyhang@localhost:5577/postgres` ngay trên dòng lệnh (không ghi `.env*`).
- Bài có sẵn ngoài vùng (Q-3): chỉ thêm vai `listing_agent` (bài đưa lên Đang bán) hay `buyer_agent` cho người tạo hàng;
  không thêm `team_lead`; dòng kỳ vọng «vai lúc làm» của `listings.test.ts` đổi theo. Trang `inventory/page.tsx` (Q-4): chỉ
  thêm một nhánh.
- Dữ liệu mẫu `[Tên]`, `0900 000 0xx`. Chữ UI tiếng Việt.

## Review Focus

1. Người kiêm vai (Quản trị kiêm Đầu chủ, Telesales kiêm Trưởng nhóm) — phải ra hợp quyền, không bị chặn oan → dòng của bảng (Task 1, 3).
2. Lệnh Đang bán mang phiên bản cũ của Đầu khách → 403, không 409 (Task 3, E5).
3. Đầu chủ từng giữ, căn đã đổi đầu chủ hàng loạt → không còn cờ (Task 1, 2, 3 — dựng bằng đổi đầu chủ thật).
4. Hàng «Chỉ tôi» của chính Đầu khách: vẫn đọc được (trục cũ giữ nguyên) — bộ kiểm hàng 12 có sẵn (Task 6).
5. Hàm `security definer` đọc hàng cho Telesales (kiểm trùng, mốc lên bảng) không gãy — bộ kiểm có sẵn (Task 6).

---

### Task 1: Lõi — bảng quyền và hàm quyền (independent: true)

**Files:** Create `packages/core/src/access/quyen-hang.ts`, `packages/core/src/access/quyen-hang.test.ts`; Modify
`packages/core/src/access/index.ts` (export), `packages/core/src/access/lop-phu-ho-so.ts` (`sanSang` gọi `duocLamVoiHang`).

**Interfaces — Produces:**
- `THAO_TAC_HANG = ["xem", "tao", "sua", "dua_len_dang_ban"] as const`, `type ThaoTacHang`.
- `VAI_BANG_HANG`, `lamViecVoiHang(viewer: { roles: readonly string[] }): boolean`.
- `duocLamVoiHang(viewer: Viewer, thaoTac: ThaoTacHang, listingAgentUserId: string | null): boolean`.
- `soBangQuyenHang(bang: DongBangQuyen[], f = duocLamVoiHang): string[]` — trả danh sách lệch dạng `«<ca>» × <thao tác>: mong …, được …`.
- `type DongBangQuyen = { o: string; vai: string[]; giu: "minh" | "chua" | "khac" | "tung"; xem: boolean; tao: boolean; sua: boolean; dua_len_dang_ban: boolean }`.

- [ ] Viết bài (đỏ): «bảng quyền hàng: lõi khớp từng ô» (14 dòng, 56 assert), «… cờ Sẵn sàng bán của hồ sơ căn đọc cùng luật» (14),
  «… đổi một ô thì đỏ» (bản sao đảo «Đầu khách × dua_len_dang_ban» → thông điệp nêu cả hai). `giu: "tung"` dựng như «khac» ở lõi
  (lõi chỉ biết người giữ mới nhất).
- [ ] Chạy `npm test -w @quy-hang/core` → đỏ vì chưa có hàm.
- [ ] Viết `quyen-hang.ts`; `lopPhuHoSo.sanSang = duocLamVoiHang(viewer, "dua_len_dang_ban", listingAgentUserId)`.
- [ ] Phá thử: cho `buyer_agent` đưa lên Đang bán → bài đỏ nêu «Đầu khách»; hoàn lại.
- [ ] `npm test -w @quy-hang/core && npm run typecheck` xanh. Commit `feat(core): bảng quyền thao tác × vai cho hàng`.
- Phục vụ: E1.

### Task 2: Migration 046 và bộ kiểm cách ly (independent: true)

**Files:** Create `packages/db/migrations/046_bang_quyen_hang.sql`; Modify `packages/db/tests/isolation.test.mjs`.

- [ ] Sửa fixture của ba bài cách ly đỏ ở lượt đo (người ghi hàng của sàn A, B thêm vai Bảng hàng phù hợp), chạy để thấy xanh trên bản cũ.
- [ ] Viết bài (đỏ): «bảng quyền hàng (046): luật theo dòng xét vai» (E7), «… đếm khớp từng ô» (E8b — đọc JSON của lõi, 56 câu SQL
  thật; dòng «tung» dựng bằng `app.reassign_listing_agents` của 027), «… hàm giữ khoá» (E10: prosecdef, proconfig, proacl).
- [ ] Viết 046: `app.works_listings()`, `app.can_activate_listing(uuid)` (ngoặc như Global Constraints), thay `listings_read/insert/update`,
  `listing_events_read/insert`; grant/revoke như 006.
- [ ] `DATABASE_URL=… npm run db:migrate && DATABASE_URL=… npm run test:isolation -w @quy-hang/db` xanh (container dựng lại sạch trước).
- [ ] Phá thử: bỏ `app.works_listings()` khỏi `listings_read` trong bản sao → bài đỏ nêu «Telesales đọc listings»; hoàn lại.
- [ ] Commit `feat(db): 046 luật theo dòng của hàng xét vai`.
- Phục vụ: E7, E8b, E10.

### Task 3: API — lớp vai ở hàng (independent: false — cần Task 1, 2)

**Files:** Modify `packages/api/src/listings/routes.ts`, `packages/api/src/listings/store.ts`; Create
`packages/api/test-db/bang-quyen-theo-vai/bang-quyen.test.ts`, `packages/api/test-db/bang-quyen-theo-vai/bai-cu.test.ts`; Modify (Q-3)
năm tệp bài API có sẵn.

**Interfaces — Consumes:** `lamViecVoiHang`, `duocLamVoiHang` (Task 1). `createListing(tx, payload, cach, viewer?)` nhận người
đang làm; nơi gọi trong `leads/store.ts`, `imports/store.ts` không phải sửa nếu `createListing` tự đọc vai bằng `viewerOf`.

- [ ] Viết bài (đỏ) E2, E3 (lặp `EVENT_TYPES` trừ `created`), E4 (lặp trừ `created`, `voided`), E5, E8a (56 ô), E9c (diff sáu tệp so
  merge-base; bỏ qua có thông báo khi không có merge-base).
- [ ] Routes: `GET /listings` trả `[]`, ba đường còn lại trả `404` khi `!lamViecVoiHang`. Store: `applyCommand` xét vai đầu tiên
  (sau khoá hàng), `status_changed → Active` không đủ cờ → `listingAgentRequired` với `reason` «Chỉ đầu chủ giữ căn hay trưởng
  nhóm đưa lên Đang bán», trước phép so phiên bản; `createListing` từ chối người không có Bảng hàng.
- [ ] Sửa năm tệp bài có sẵn đúng luật Q-3.
- [ ] `DATABASE_URL=… npm run test:db -w @quy-hang/api` xanh trọn; `npm test -w @quy-hang/api` xanh.
- [ ] Phá thử: bỏ lớp vai ở `applyCommand` → E3 đỏ nêu «Telesales»; hoàn lại. Commit `feat(api): lớp vai ở hàng theo bảng quyền`.
- Phục vụ: E2, E3, E4, E5, E8a, E9, E9c.

### Task 4: Màn — ô Trạng thái và trang Bảng hàng (independent: false — cần Task 1)

**Files:** Modify `apps/web/src/app/(app)/inventory/cell-edit/lenh.ts`, `…/cell-edit/tren-o.tsx`, `…/cell-edit/trang-thai.test.ts`;
Modify (Q-4) `apps/web/src/app/(app)/inventory/page.tsx`; Modify (Q-3) `apps/web/src/lib/sync/test-db/doi-gia-da-ban.db-test.mts`.

**Interfaces:** `nacTrangThai(trangThai: StandardStatus, duaLenDangBan: boolean): StandardStatus[]`;
`dungLenhTrangThai(hang, to, them, duaLenDangBan: boolean)` — tham số cờ bắt buộc. `coDuaLenDangBan(me: Viewer, listAgentKey: string | null): boolean` trong `lenh.ts` gọi `duocLamVoiHang`.

- [ ] Bài (đỏ) E6: nấc từ Hold, Incomplete theo cờ; câu từ chối nguyên văn; `coDuaLenDangBan` khớp 14 dòng bảng.
- [ ] Sửa `lenh.ts`; `tren-o.tsx` lấy `bd.me()` từ `useBoDongBo()` và `hang.listAgentKey`. Trang: `if (!lamViecVoiHang({ roles: me.activeCompany.roles })) redirect("/today")`.
- [ ] Sửa bài đồng bộ (Q-3). `npm test -w @quy-hang/web && npm run typecheck && npm run lint` xanh; `DATABASE_URL=… npm run test:db -w @quy-hang/web` xanh.
- [ ] Phá thử E6b: bỏ đối số cờ ở `tren-o.tsx` → kiểm kiểu đỏ; hoàn lại. Commit `feat(web): ô Trạng thái và trang Bảng hàng theo bảng quyền`.
- Phục vụ: E2b, E6, E6b, E9b, E11.

### Task 5: Điều đang đúng (independent: true)

**Files:** Modify `docs/architecture/so-diem-bien-thien.md` (thêm K28, đếm 27 → 28 — Q-1), `docs/product/tham-chieu.md` (thêm
một dòng §6, một dòng §12 05/11); thêm bài «bảng quyền hàng: điều đang đúng đã ghi» vào `quyen-hang.test.ts`.

- [ ] Bài đỏ trước, rồi thêm dòng; phá thử xoá K28 trong bản sao → đỏ nêu «K28». Vẽ lại `PRODUCT-MAP.md`, `LO-TRINH.html` bằng máy (luật 27). Commit.
- Phục vụ: E10.

### Task 6: Kiểm trọn (cuối)

- [ ] Dựng lại container sạch (bỏ bản nháp đo S1): `docker rm -f quy-hang-db-dkn-Q` rồi chạy lại như AGENTS.md trên cổng 5577.
- [ ] `/verify` của kho với `DATABASE_URL` trên dòng lệnh; `npm run test:hooks` → `TỔNG: ĐẠT`.
- [ ] Hợp đồng sang `implemented`, vào S4.
