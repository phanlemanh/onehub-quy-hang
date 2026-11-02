# Thông báo lead Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đầu chủ (và trưởng nhóm, cho lời báo) nhận Web Push khi lead về mình; chạm mở đúng lead ở Hôm nay; iPhone được hướng dẫn cài.

**Architecture:** Lõi dựng nội dung không lớp nguồn (`packages/core/src/push`). Migration 018 thêm ba bảng: đăng ký thiết bị (theo người, sàn), hộp thư đi (theo sàn), khoá VAPID (hệ thống, một dòng, chỉ qua hàm). API (`packages/api/src/push`) giữ khoá không người cầm (tự sinh, mã hoá bằng khoá con HKDF của `OWNER_PHONE_KEY`), đường đăng ký, bộ gửi bơm vào `ApiDeps` (mặc định `web-push`, bài kiểm dùng bộ gửi giả), ghi hộp thư đi trong giao dịch giao lead và gửi sau khi ghi, nhịp chia gửi lại. Web: manifest, `public/sw.js`, dải bật trong `KhungHomNay`, mở `?lead=`.

**Tech Stack:** Postgres 16, Hono + node:test, Next.js 16, thư viện `web-push`.

**Spec:** `docs/superpowers/specs/2026-11-02-thong-bao-lead-design.md` · hợp đồng `_acceptance/thong-bao-lead/contract.md` (duyệt 02/11; Hỏi-1..4 theo khuyến nghị).

## Global Constraints

- Migration đúng số `018_thong_bao_lead.sql`; chạy `db:test` + `test:isolation` trước khi commit migration (luật giám sát).
- Không ai sinh, đọc, chép, chuyển khoá bí mật; không thêm biến môi trường.
- Nội dung thông báo: chỉ khoá `title`, `body`, `url`, `tag`; không số, tên chủ, giá, mã căn.
- Gửi chỉ sau khi giao dịch giao lead ghi xong; lỗi gửi không làm hỏng việc giao.
- Dải dùng khuôn `TrangThai` + `Button` có sẵn; không màu thô (lint quy-hang-ui).
- Dữ liệu giả `[Tên]`, `0900 000 0xx`.

## Review Focus

- Hai lần dùng đầu song song sinh đúng một cặp khoá (E9).
- Giao dịch giao lead quay lui ở cả ba lối không để lại dòng hộp thư đi (E3).
- Trưởng nhóm thấy dải bật dù đang ở trang giữ chỗ (E7).
- Đăng xuất gỡ đăng ký của thiết bị ấy, không gỡ thiết bị khác (E1).

---

### Task 1: Nội dung thông báo ở lõi

**independent:** true · **phục vụ:** E4, E9 (vế tài liệu)

**Files:** Create `packages/core/src/push/index.ts`, `packages/core/src/push/push.test.ts`; Modify `packages/core/package.json` (export `"./push"`).

- [ ] **Step 1:** Ca «nội dung thông báo lead» và «nội dung lời báo trưởng nhóm» (bảng ba nhu cầu, ba loại lời báo; khoá deepEqual `[title, body, url, tag]`; máy dò số, tên, giá, mã căn không bắt + đối chứng dương); ca «thông báo lead: tài liệu khớp» (đỏ tới Task 5).
- [ ] **Step 2:** `noiDungLead({leadId, buildingName, need}): PushPayload`, `noiDungLoiBao({kind, buildingName}): PushPayload` — `tag` = `lead:<id>` / `alert:<kind>:<lead>`.
- [ ] **Step 3:** `npm test -w @quy-hang/core` (trừ ca tài liệu); phá thử thêm mã căn → đỏ.
- [ ] **Step 4:** Commit.

### Task 2: Migration 018 và ca cách ly

**independent:** true · **phục vụ:** E2, E9 (vế bảng khoá)

**Files:** Create `packages/db/migrations/018_thong_bao_lead.sql`; Modify `packages/db/tests/isolation.test.mjs` (khối ca mới).

- [ ] **Step 1:** Bảng `push_subscriptions` (company_id, user_id → company_members, endpoint, p256dh, auth, created_at, failed_at; unique (company_id, user_id, endpoint)); luật đọc/thêm/xoá `user_id = app.current_user_id()` trong sàn; grant select, insert, delete.
- [ ] **Step 2:** Bảng `push_outbox` (company_id, id, user_id, payload jsonb, created_at, sent_at, attempts, last_error); luật: không đọc trực tiếp; thêm qua hàm; grant không.
- [ ] **Step 3:** Bảng `push_vapid` (id smallint primary key check id = 1, public_key text, private_enc bytea, created_at); force RLS, không policy, không grant.
- [ ] **Step 4:** Hàm `security definer`: `app.push_vapid_get()`, `app.push_vapid_init(pub, enc)` (on conflict do nothing, trả dòng hiện có), `app.push_outbox_add(user_id, payload)` (cùng sàn đang làm), `app.push_outbox_pending(limit)` (dòng chưa gửi, attempts < 3, tạo < 15 phút), `app.push_outbox_mark(id, ok, err)`, `app.push_targets(user_id)` (đăng ký của người trong sàn đang làm), `app.push_subscription_drop(endpoint)`.
- [ ] **Step 5:** Ca cách ly (E2) + ca bảng khoá vai API permission denied; `db:migrate`, `db:test`, `test:isolation` xanh; phá thử nới luật đọc → đỏ.
- [ ] **Step 6:** Commit.

### Task 3: API — khoá, đăng ký, gửi, hộp thư đi

**independent:** false (sau Task 1, 2) · **phục vụ:** E1, E3, E5, E8, E9

**Files:** Create `packages/api/src/push/{khoa-vapid,store,routes,gui}.ts`, `packages/api/test-db/thong-bao-lead.test.ts`; Modify `packages/api/src/app.ts` (route, `pushSender` trong `ApiDeps`), `app.test.ts`, `errors.ts`, `errors.test.ts` (thêm dòng), `jobs/lead-tick.ts`, `routing/store.ts`, `routing/routes.ts`, `leads/store.ts`, `leads/routes.ts`, đường đăng xuất; `package.json` của api (`web-push`).

- [ ] **Step 1:** Bài kiểm test-db: bật/bật lại/gỡ/đăng xuất (E1), gửi theo ba lối + tự nhận + quay lui ba lối + lỗi tạm gửi lại + lỗi không làm hỏng giao (E3), đăng ký chết (E5), trưởng nhóm lời báo (E8), khoá tự sinh song song (E9) — chạy thấy đỏ.
- [ ] **Step 2:** `khoaVapid(tx, khoaGoc)`: đọc `app.push_vapid_get()`; vắng → `webpush.generateVAPIDKeys()`, mã hoá khoá riêng AES-256-GCM bằng khoá con HKDF nhãn `quy-hang/push-vapid/v1`, `app.push_vapid_init`, đọc lại.
- [ ] **Step 3:** Đường `GET /api/v1/push/public-key`, `POST|DELETE /api/v1/me/push-subscriptions`; đăng xuất nhận endpoint thiết bị và gỡ.
- [ ] **Step 4:** Ghi hộp thư đi trong giao dịch: nhịp chia (sau `route_lead` ok), `reassignLead`, `createLead` khi có `agentUserId` (kể cả gửi lại); lời báo mới của nhịp → mỗi trưởng nhóm một dòng.
- [ ] **Step 5:** `guiHopThu(pool, companyId, sender)` sau khi giao dịch ghi xong ở từng lối; nhịp chia gọi thêm cho dòng chưa gửi; 404/410 → gỡ đăng ký; lỗi khác → tăng attempts, ghi lỗi.
- [ ] **Step 6:** `npm run db:test` xanh; phá thử: gửi trong giao dịch → ca quay lui đỏ; coi 500 như 410 → đỏ; lưu khoá riêng rõ → đỏ.
- [ ] **Step 7:** Commit.

### Task 4: Web — manifest, service worker, dải bật, mở lead

**independent:** false (sau Task 3) · **phục vụ:** E6, E7, E10

**Files:** Create `apps/web/src/app/manifest.ts`, `apps/web/public/sw.js`, `apps/web/public/icons/*`, `apps/web/src/lib/push/{dang-ky,bam-thong-bao}.ts` (+ test), `apps/web/src/app/(app)/today/{dai-bat,mo-lead}.tsx|ts` (+ `mo-lead.test.ts`); Modify `today/khung.tsx` hoặc `page.tsx` (dải cho đầu chủ, trưởng nhóm), `today/hom-nay-dau-chu.tsx` (đọc `?lead=`, mở nhóm, chọn, cuộn), `layout.tsx` (manifest, appleWebApp).

- [ ] **Step 1:** `mo-lead.test.ts` (bảng bốn dạng tham số; chọn nhóm/dòng; «không còn»; bộ xử lý bấm thông báo hai dòng) — đỏ.
- [ ] **Step 2:** Mô-đun thuần + dải bật năm trạng thái + service worker gọi mô-đun bấm thông báo.
- [ ] **Step 3:** `npm test -w @quy-hang/web`, `typecheck`, `lint` xanh; chạy web-l, tự chụp ma trận E7 và E10 để soát trước S4.
- [ ] **Step 4:** Commit.

### Task 5: Tài liệu

**independent:** true · **phục vụ:** E9 (vế tài liệu)

**Files:** Create `docs/adr/0025-thong-bao-lead.md`; Modify `docs/product/tham-chieu.md` (§12 dòng mới; mục thông báo), `CONTEXT.md` (từ «thông báo lead», «hộp thư đi» nếu cần).

- [ ] **Step 1:** ADR-0025: Web Push, nội dung không lớp nguồn, khoá không ai cầm, hộp thư đi; Tham chiếu §12.
- [ ] **Step 2:** Ca tài liệu ở lõi xanh; phá thử bỏ «không ai cầm khoá» khỏi ADR → đỏ.
- [ ] **Step 3:** Commit.

### Task 6: Kiểm toàn kho

**independent:** false (cuối)

- [ ] `npm run typecheck && npm run lint && npm test && npm run test:hooks && npm run build`; `npm run db:migrate && npm run db:test` trên 5563 dựng mới; hợp đồng `implemented`; xin lượt S4.
