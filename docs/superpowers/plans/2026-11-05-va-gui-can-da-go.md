# Căn đã gỡ không vào Lần gửi, không nhận «Quan tâm» — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Hai hàm `app.create_share` và `app.record_share_event` từ chối căn `voided`, giữ chữ ký, quyền và mã lỗi.

**Architecture:** Migration `037_gui_can_da_go.sql` thay hai hàm bằng `create or replace` (chép thân 021/031, thêm điều kiện
`voided`). Không đổi API hay màn.

**Tech Stack:** Postgres 16, node:test (bộ kiểm cách ly `packages/db/tests`, bộ kiểm API `packages/api/test-db`).

**Spec:** `docs/superpowers/specs/2026-11-05-va-gui-can-da-go-design.md` · hợp đồng `_acceptance/va-gui-can-da-go/contract.md`.

## Global Constraints

- Số migration **037**; không sửa 021, 031. Giữ `security definer`, `set search_path = ''`, `revoke … from public`,
  `grant execute … to quy_hang_app`.
- Mã lỗi: `create_share` → `22023` (thông điệp «căn chưa lên bảng»); `record_share_event` interest → `23514`.

## Review Focus

1. Lần gửi trộn căn đã gỡ và chưa gỡ: cả lần bị từ chối, không ghi một nửa (Task 1, E1).
2. `link_opened` trên link có căn đã gỡ vẫn ghi (Task 2, E2).

---

### Task 1: Migration 037 + bộ kiểm cách ly

**independent:** false · **phục vụ:** E3, E4

**Files:** Create `packages/db/migrations/037_gui_can_da_go.sql`; Modify `packages/db/tests/isolation.test.mjs`

- [ ] **Step 1:** hai ca test của E3 («gửi căn đã gỡ (037): hàm chặn ở tầng dữ liệu») và E4 («… hàm giữ chữ ký và quyền») → FAIL.
- [ ] **Step 2:** `create_share`: trong điều kiện căn, thêm `or exists (select 1 from public.listings x where x.company_id = san
  and x.id = l.id and x.voided)`; `record_share_event`: thêm `and not l.voided` vào điều kiện interest. → `npm run db:migrate`
  hai lần, `npm run db:test` PASS; chiều đỏ (bỏ điều kiện voided) đỏ nêu «22023». Commit.

### Task 2: Bộ kiểm API

**independent:** false (Task 1) · **phục vụ:** E1, E2

**Files:** Create `packages/api/test-db/va-gui-can-da-go/gui-can-da-go.test.ts`

- [ ] **Step 1:** hai ca «gửi căn đã gỡ: Lần gửi mới bị từ chối», «gửi căn đã gỡ: khách không quan tâm được» như evals E1, E2;
  căn gỡ qua `voidListing` của store hàng. → PASS trên Postgres dãy; chiều đỏ. Commit.

### Task 3: Tài liệu

**Files:** `docs/product/tham-chieu.md` §12 (một dòng). Commit.
