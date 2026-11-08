# chu-san-du-vai Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> Trong vòng feature-loop của kho này: thực thi TUẦN TỰ trong phiên chính (S3), rồi chấm bằng Workflow S4.

**Goal:** Trao Quản trị sàn là trao luôn bốn vai làm việc, Trưởng nhóm kéo theo Đầu chủ và Đầu khách; gỡ bớt được; không đổi luật theo dòng.

**Architecture:** Một bảng JSON và một hàm thuần ở `packages/core/src/access`. Công cụ mở sàn đọc bảng ấy. Hộp Mời, Sửa gọi hàm khi một ô vai đổi. Máy chủ giữ nguyên hành vi lưu đúng mảng được gửi. Không migration.

**Tech Stack:** TypeScript, Node test runner với tsx, Hono API, Next.js, Postgres dãy Q (cổng 5577).

**Spec:** `docs/superpowers/specs/2026-11-08-chu-san-du-vai-design.md` · hợp đồng `_acceptance/chu-san-du-vai/contract.md`

## Global Constraints

- `company_admin` kéo theo đúng `telesales, listing_agent, buyer_agent, team_lead`; `team_lead` kéo theo đúng `listing_agent, buyer_agent` (Hỏi-1).
- Không tệp mới trong `packages/db/migrations/`. Không sửa `packages/api/src/thanh-vien.ts` trừ khi bộ đo chỉ ra lỗi.
- Chữ dòng mô tả đúng nguyên văn: «Tích Quản trị sàn hay Trưởng nhóm là tích sẵn các vai đi kèm; bỏ tích vai nào không cần.»
- Chỉ chạm vùng đã khai của hàng (`hang vung`). Dữ liệu thử dùng email `…@example.test`, không tên hay số thật.
- Kiểm thử cũ đổi kỳ vọng phải được liệt từng dòng ở Cổng Bằng chứng.

## Review Focus

- Kéo theo không được lan khi mở hộp Sửa: chỉ chạy ở ô chuyển từ trống sang tích; ca «mở hộp, không tích gì» phải giữ nguyên mảng (E3b).
- Người đã có sẵn vai kéo theo: không tạo phần tử trùng trong mảng vai (E1).
- Bộ nạp mẫu `packages/db/seed/nap.mjs` gọi `moSan`: người đầu tiên của sàn mẫu cũng thành năm vai; các bài `seed` đếm theo vai phải được chạy lại ở Task 2.
- Import JSON xuyên gói trong `mo-san.mjs` phải chạy được cả từ `npm run van-hanh:mo-san` lẫn bộ nạp mẫu.
- Mảng vai gửi lên giữ thứ tự ổn định để so sánh, nhưng API và cơ sở dữ liệu không phụ thuộc thứ tự: các bài đọc lại so theo tập.

---

### Task 1: Bảng và hàm «vai kéo theo vai» ở lõi

**Files:** Create `packages/core/src/access/goi-vai.json`, `packages/core/src/access/goi-vai.ts`, `packages/core/src/access/goi-vai.test.ts`, `packages/core/src/access/nguoi-du-vai.test.ts`; Modify `packages/core/src/access/index.ts` (xuất thêm).
**Phục vụ:** E1, E5. **independent:** false.

**Interfaces — Produces:** `VAI_KEO_THEO: Partial<Record<Role, readonly Role[]>>`; `doiVaiKhiTich(hienTai: readonly string[], vai: string, bat: boolean): string[]`; `DU_NAM_VAI: readonly Role[]`.

- [ ] Viết ma trận năm vai × bật, tắt × đã có, chưa có vai kéo theo; ca «bảng hợp lệ» kiểm mã vai nằm trong `ROLES`, có đối chứng đỏ trên bản sao bảng lỗi với thông điệp nêu mã.
- [ ] Chạy `node --import tsx --test packages/core/src/access/goi-vai.test.ts`, thấy đỏ.
- [ ] Viết bảng và hàm; chạy lại, thấy xanh.
- [ ] Viết `nguoi-du-vai.test.ts` trên hàm bảng nhà, nút của `navigation.ts`: đủ năm vai có sáu nhà, ba nút; chỉ `company_admin` có Cài đặt, không nút. Chạy xanh.
- [ ] Commit `feat(core): bảng vai kéo theo vai`.

### Task 2: Công cụ mở sàn trao đủ năm vai

**Files:** Modify `packages/db/scripts/mo-san.mjs`, `packages/db/tests/mo-san.test.mjs`; Create `_acceptance/chu-san-du-vai/thu/chay-db.mjs`.
**Phục vụ:** E2. **independent:** false (sau Task 1).

**Interfaces — Consumes:** `goi-vai.json`. **Produces:** `chay-db.mjs <mo-san|api>` đặt `DATABASE_URL` tới cổng 5577 khi chưa có, chạy migrate rồi đúng bộ kiểm.

- [ ] Sửa kỳ vọng trong `mo-san.test.mjs` sang đúng năm vai lấy từ `goi-vai.json`, thêm ca «người của sàn đang chạy giữ nguyên»; chạy `node _acceptance/chu-san-du-vai/thu/chay-db.mjs mo-san`, thấy đỏ.
- [ ] `mo-san.mjs` nhập bảng bằng `import … with { type: "json" }` và chèn mảng năm vai; nhánh `on conflict` không đổi. Chạy lại, thấy xanh.
- [ ] Chạy `node --env-file-if-exists=.env.local --import tsx --test "packages/db/seed/*.test.mjs"` với `DATABASE_URL` cổng 5577; sửa kỳ vọng của bài đếm vai nếu có, ghi lại để liệt ở Cổng Bằng chứng.
- [ ] Commit `feat(db): công cụ mở sàn trao đủ năm vai`.

### Task 3: Màn Người dùng tích sẵn và cho gỡ bớt

**Files:** Create `apps/web/src/app/(app)/settings/users/vai-trong-hop.ts`, `vai-trong-hop.test.ts`; Modify `quan-nguoi.tsx`, `apps/web/src/components/khoi/solution-users-8/member-dialog.tsx`.
**Phục vụ:** E3, E3b, E8, E9. **independent:** false (sau Task 1).

**Interfaces — Produces:** `apDoiVai(truoc: string[], sau: string[]): string[]` so hai mảng do ô Checkbox trả về, tìm đúng một vai vừa bật hay tắt rồi gọi `doiVaiKhiTich`; prop mới `roles.description?: string` của `MemberDialog`.

- [ ] Viết test chuỗi thao tác: tích Quản trị → đủ năm; bỏ Telesales → bốn; mở hộp không tích gì → không đổi. Chạy, thấy đỏ.
- [ ] Viết `apDoiVai`; nối vào `setVai` và `setSuaVai` ở `quan-nguoi.tsx`; thêm khe mô tả bằng `FieldDescription` đã cài. Chạy test, thấy xanh; `npm run typecheck && npm run lint`.
- [ ] Commit `feat(web): màn Người dùng tích sẵn vai đi kèm`.

### Task 4: Bộ đo máy chủ, quyền và tài liệu

**Files:** Create `packages/api/test-db/chu-san-du-vai/du-vai.test.ts`, `_acceptance/chu-san-du-vai/thu/doc-vai.mjs`, `_acceptance/chu-san-du-vai/thu/kiem-tai-lieu.mjs`; Modify `docs/product/tham-chieu.md`, `docs/adr/0010-lop-truong-nguon.md`, `docs/adr/0011-nhap-du-lieu-tac-tu.md`.
**Phục vụ:** E3c, E4, E5c, E6, E7. **independent:** false (sau Task 2, 3).

- [ ] Viết `du-vai.test.ts` bốn nhóm ca: lưu đúng mảng (POST, PATCH từ năm xuống một, đối chứng đỏ gộp mảng và tự thêm vai); chuỗi thao tác của hộp qua API thật; mở sàn rồi đọc `/me`; đủ vai đọc chủ nhà, mỗi lần mở số một vết, người chỉ cấu hình nhận từ chối với mã ghim, cùng phiên đọc được danh sách thành viên. Đọc mã từ chối thật rồi ghim vào assert.
- [ ] Chạy `node _acceptance/chu-san-du-vai/thu/chay-db.mjs api`, thấy xanh.
- [ ] Sửa Tham chiếu §2, §6, §9, thêm dòng §12 ngày dựng; thêm mục sửa đổi cách B vào hai ADR. Viết `kiem-tai-lieu.mjs` có đối chứng đỏ trên bản sao tài liệu cũ và diff giả có migration. Chạy xanh.
- [ ] Commit `docs: Tham chiếu và ADR theo cách B; bộ đo chu-san-du-vai`.

### Sau S3 (theo vòng feature-loop)

S4 chấm E1–E9, có dev server cổng 3497 và Postgres dãy Q cho hai bài nhìn màn. Môi trường dev server truyền qua biến của lệnh chạy; worktree này chưa có `.env.local`.
