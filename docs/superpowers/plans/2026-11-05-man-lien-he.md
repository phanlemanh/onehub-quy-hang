# 103 · Màn Liên hệ — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đầu chủ và trưởng nhóm tìm một người bằng tên hay số, xem cơ hội, căn, dòng thời gian, mở số và gọi trong ba chạm.

**Architecture:**

- **Lõi:** giữ bảng pha và nhãn (`co-hoi.ts`), cùng luật nhà theo vai (`navigation.ts`).
- **Cơ sở dữ liệu:** thêm một bảng sự kiện mở số và hai hàm `security definer` (migration 036).
- **API:** đường đọc mới ở `contacts/read/**`, đăng ký trong `app.ts` bằng một dòng thêm.
- **Web:** màn `/contacts` trong bố cục Danh sách – chi tiết, hồ sơ theo khuôn nhóm mới `lien-he`, dùng lại mảnh của
  solution-crm-4.

**Tech Stack:** TypeScript chặt, Hono + zod-openapi, Postgres 16 với luật cách ly theo dòng, Next.js, ReUI base-nova.

**Spec:** `docs/superpowers/specs/2026-11-05-man-lien-he-design.md` · hợp đồng `_acceptance/man-lien-he/contract.md` · phép kiểm
`_acceptance/man-lien-he/evals.yaml`.

## Global Constraints

- Không sửa `packages/api/src/contacts/routes.ts`, `store.ts`, `prospects.ts` (hàng 89), cũng không sửa
  `apps/web/src/components/bo-cuc/**` (hàng 105).
- Tệp dùng chung chỉ thêm dòng: `packages/api/src/app.ts`, `packages/core/src/index.ts`, `docs/product/tham-chieu.md`,
  `CONTEXT.md`, `.agents/skills/quy-hang-ui/catalog.md`, `docs/design/vo-va-ia.md`.
- `isolation.test.mjs` chỉ thêm ca ở cuối tệp.
- Số và giá đáy không bao giờ vào thân danh sách, hồ sơ hay dòng thời gian. Số rõ chỉ trả ở đường mở số, kèm
  `Cache-Control: no-store`.
- Dữ liệu thử: `[Tên]`, `0900 000 0xx`.
- Migration số `036`, tên tệp `036_man_lien_he.sql`.
- Phân trang 50 dòng. Dòng thời gian tối đa 50 sự kiện. Số che chỉ lộ ba số cuối.
- Nhãn pha: `{cultivate:"Mới", appointment:"Đã gọi", active:"Đang chào", under_contract:"Đang giao dịch",
  closed:"Đã chốt", closed_out:"Đã đóng"}`.

## Review Focus

1. **Người giữ mất vai Đầu chủ:** cả ba đường (hồ sơ, dò số, mở số) phải từ chối. Ma trận chín dòng ở E3, E5.
2. **Hàm `security definer` gọi với liên hệ hay dấu vết số của sàn khác:** trả như không có, không ghi sự kiện (E9).
3. **Tìm theo số viết nhiều dạng** (`+84…`, có khoảng trắng): dùng `normalizePhone` của lõi trước khi băm (E3).
4. **«Số cơ hội mở» ở danh sách:** bằng số cơ hội mở ở hồ sơ của cùng người xem. Đầu chủ không đếm phía khách (E6b, E7).
5. **Hồ sơ không có số:** khối Số hiện «Chưa có số», không lỗi (E10).

---

### Task 1: Migration 036 — sự kiện mở số và hai hàm

**independent: true** · phục vụ E3, E5, E9

**Files:** Create `packages/db/migrations/036_man_lien_he.sql` · Modify `packages/db/tests/isolation.test.mjs` (thêm ca cuối tệp)

**Interfaces:**

- **Produces:**
  - bảng `contact_phone_reveals(company_id uuid, id uuid pk, contact_id uuid, phone_id uuid, revealed_by text, revealed_at timestamptz)`,
    bật `enable` + `force row level security`; select theo cùng điều kiện của `contacts_read`;
  - `app.contact_phone_for_reveal(p_contact uuid, p_phone uuid) returns table(phone_enc bytea, enc_context text)`:
    kiểm `company_id = app.current_company_id()`, kiểm người đọc theo đúng biểu thức của policy `contacts_read`, rồi insert
    một dòng `contact_phone_reveals`. Không đọc được thì trả rỗng, không insert;
  - `app.contact_lookup_by_phone_hash(p_hash bytea) returns table(contact_id uuid, readable boolean, holder_name text)`:
    chỉ trong sàn hiện tại; `readable` theo biểu thức policy; `holder_name` lấy từ `users.name` của người giữ;
  - grant execute cho `quy_hang_app`.

- [ ] Viết ca cách ly (E9): sàn A gọi hai hàm với dữ liệu sàn B ra rỗng và số dòng sự kiện không đổi; đối chứng dương trong
  sàn A; bảng mới có `force row level security`; select chéo sàn ra 0 dòng.
- [ ] Chạy `npm run db:migrate && npm run db:test` (DATABASE_URL 5571). Kỳ vọng: ca mới đỏ vì chưa có hàm.
- [ ] Viết migration.
- [ ] Chạy lại. Kỳ vọng: xanh. Phá thử: bỏ lọc `app.current_company_id()` thì ca sàn B đỏ. Trả lại.
- [ ] Commit `feat(db): 036 sự kiện mở số liên hệ và tìm theo dấu vết số`.

### Task 2: Lõi — bảng pha cơ hội và nhà Liên hệ

**independent: true** · phục vụ E1b, E6

**Files:**

- Create `packages/core/src/contacts/co-hoi.ts`, `co-hoi.test.ts`.
- Modify `packages/core/src/contacts/index.ts`: thêm dòng export.
- Modify `packages/core/src/navigation.ts`, `navigation.test.ts`.

**Interfaces:**

- **Produces:**
  - `type Pha = "cultivate"|"appointment"|"active"|"under_contract"|"closed"|"closed_out"`;
  - `PHA_NHAN: Record<Pha,string>`;
  - `phaLead(stage: LeadState, listingStatus: StandardStatus | null): Pha`;
  - `phaNhuCau(closed: boolean): Pha`;
  - `laMo(p: Pha): boolean` (khác `closed_out`);
  - `Home` thêm `"contacts"`, `HOME_PATH.contacts = "/contacts"`, nhà ấy có khi vai gồm `listing_agent` hay `team_lead`,
    đứng sau `shares`.

- [ ] Viết bảng E6 (mười hai dòng) và bảng E1b (sáu dòng).
- [ ] `npm test -w @quy-hang/core`. Kỳ vọng: đỏ.
- [ ] Làm `co-hoi.ts` và phần nhà trong `navigation.ts`.
- [ ] Chạy lại. Kỳ vọng: xanh. Phá thử: đọc pha từ lead khi đã Lên bảng thì dòng Pending đỏ.
- [ ] Commit `feat(core): pha cơ hội và nhà Liên hệ`.

### Task 3: API — đường đọc `contacts/read`

**independent: false** (cần Task 1, 2) · phục vụ E1, E2, E3, E4, E5, E6b, E7, E8

**Files:**

- Create `packages/api/src/contacts/read/routes.ts`, `store.ts`, `packages/api/test-db/man-lien-he.test.ts`.
- Modify `packages/api/src/app.ts` (thêm một dòng đăng ký).
- Modify `packages/api/src/errors.ts` nếu cần mã lỗi mới (thêm dòng).

**Interfaces:**

- **Consumes:** hai hàm của Task 1; `phaLead`, `phaNhuCau`, `laMo` của Task 2; `normalizePhone`; `dauVetSo`, `giaiMaSo`
  (`owners/ma-hoa.ts`); `withCompany`; `resolveCompany`.
- **Produces:**
  - `GET /api/v1/contacts?type&status&q&cursor` trả
    `{items:[{id,name,contactTypes,status,holderName,phoneCount,openOpportunities,listingCount}], nextCursor}`;
  - `POST /api/v1/contacts/lookup-phone {phone}` trả `{contactId}` | `{held:true,holderName}` | `{found:false}`;
  - `GET /api/v1/contacts/{id}/profile` trả
    `{contact, phones:[{phoneId,label,isPrimary,tail}], opportunities:[{side,need,unit,phase,listingCode?,agentName?,shareCount?}], listings:[{code,status,listPrice}], timeline:[{kind,at,text}]}`;
  - `POST /api/v1/contacts/{id}/phones/{phoneId}/reveal` trả `{phone}`, kèm `no-store`; 404 một thân.
  - Vai không phải `listing_agent`/`team_lead` nhận 403; không phiên nhận 401.
  - Danh sách và hồ sơ đọc qua luật theo dòng của `contacts` (vai `quy_hang_app`).
  - Tìm tên không dấu bằng `unaccent` nếu có extension, không thì `lower()`.

- [ ] Viết `man-lien-he.test.ts`, đủ chín ca theo tên trong `evals.yaml` (E1–E8). Ma trận vai dùng chung cho E3, E5.
- [ ] Chạy test-db. Kỳ vọng: đỏ.
- [ ] Làm `store.ts`, `routes.ts`, đăng ký trong `app.ts`.
- [ ] Chạy lại. Kỳ vọng: xanh. Phá thử từng chiều đỏ nêu ở evals.
- [ ] `npm run test:ro-ri` vẫn xanh.
- [ ] Commit `feat(api): đọc liên hệ — danh sách, tìm số, hồ sơ, mở số`.

### Task 4: Web — màn Liên hệ và khuôn `lien-he`

**independent: false** (cần Task 2, 3) · phục vụ E10, E10b, E10c, E10d

**Files:**

- Create:
  - `apps/web/src/app/(app)/contacts/{page.tsx,vung.tsx,khung.tsx,lien-he.ts,ho-so.tsx,lien-he.test.ts}`;
  - `design/patterns/lien-he.md`.
- Modify bảng đếm ui-lint ở `packages/ui-lint/tests/*` (luật 51: lấy bản main, đếm lại từ cây).
- Thêm dòng ở `.agents/skills/quy-hang-ui/SKILL.md` và `docs/design/vo-va-ia.md` (khối đích dòng «Liên hệ»).
- Thêm dòng ở `docs/product/tham-chieu.md`: «Đã dựng (hàng 103)», §9 nhà thứ sáu, §12 dòng 05/11.
- Thêm dòng «điều khoá» quyền mở số ở `docs/architecture/so-diem-bien-thien.md`.

**Interfaces:**

- **Consumes:** bốn đường của Task 3; `PHA_NHAN`; `BoCuc`; `DauHoSo`, `MucHoSo`, `CapGiaTri`, `ThanHoSo` (solution-crm-4);
  `TrangThai`; `ChoTai`.
- **Produces:**
  - `luaTim(s: string): "so" | "ten"` (từ chín chữ số trở lên là `so`);
  - `KhungLienHe`;
  - `export default function VungLienHe`.

- [ ] Viết `lien-he.test.ts`: chín trạng thái và bảng `luaTim`.
- [ ] `npm test -w @quy-hang/web`. Kỳ vọng: đỏ.
- [ ] Dựng màn theo lối Trong kho (Hỏi-5).
- [ ] Điện thoại: mục «Liên hệ» trong Tôi / Cài đặt (Hỏi-1).
- [ ] Số rõ chỉ trong state, rời hồ sơ thì che lại.
- [ ] Chạy lại. Kỳ vọng: xanh. Chạy `npm run lint`, `npm test -w @quy-hang/ui-lint` và lưới khuôn.
- [ ] Chụp tay ở cổng 3491 để tự soát (không phải bằng chứng). Tắt dev server sau khi chụp.
- [ ] Commit `feat(web): màn Liên hệ`.
