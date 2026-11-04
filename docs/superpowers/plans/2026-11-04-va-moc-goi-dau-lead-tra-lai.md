# Vá mốc gọi đầu của lead trả lại — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Lead đã trả lại không ghi được gọi đầu; số đo lõi đếm chuỗi gửi lại một lần như `app.lead_board_metric`; ca số
đo chập chờn lấy mốc từ đồng hồ cơ sở dữ liệu.

**Architecture:** Migration `023_va_moc_goi_dau.sql` định nghĩa lại `app.mark_first_call`. Lõi: `LeadVao.resubmittedLeadId`
và bước nối chuỗi trong `thoiLuongLead`. Bài kiểm cơ sở dữ liệu ở `packages/api/test-db/va-moc-goi-dau-lead-tra-lai/`.

**Tech Stack:** PostgreSQL 16 (plpgsql), TypeScript, `node:test`, Hono API.

**Spec:** `docs/superpowers/specs/2026-11-04-va-moc-goi-dau-lead-tra-lai-design.md` · hợp đồng
`_acceptance/va-moc-goi-dau-lead-tra-lai/` (Cổng Phạm vi Manh Phan 04/11).

## Global Constraints

- Không sửa migration đã commit; số migration 023 (luật 25). Lỗi lead đã trả lại: `P0002` «không có lead này của người gọi».
- Định nghĩa chuỗi (luật 37): một chủ nhà một lần, kỳ theo lead đầu, gọi đầu = cuộc gọi sớm nhất trong chuỗi, Sẵn sàng bán
  = lead cuối lên bảng, xét tại `den`.
- Bài kiểm cơ sở dữ liệu chạy trên Postgres dãy B (5572); không dữ liệu thật (`0900 000 0xx`).

## Review Focus

1. Lead trả lại rồi gửi lại: lead mới (của người giữ mới) vẫn ghi gọi đầu được — điều kiện chỉ chặn lead cũ.
2. Gọi first-call hai lần đồng thời trên lead đang giữ: một 200, một 409 (khoá dòng `for update` giữ như 011).
3. Chuỗi có vòng hay trỏ lead của sàn khác: nối chuỗi chỉ theo lead có trong dữ liệu vào, không lặp vô hạn.
4. Lead gửi lại đã bỏ (discarded) ở cuối chuỗi: chuỗi không vào nhóm «cần gọi».
5. `resubmittedLeadId` trỏ lead nhập sau `den`: tại `den` chuỗi dừng ở lead trước.

---

### Task 1: Migration 023 và bài kiểm gọi đầu — phục vụ E1, E3 · independent: false
- Tạo `packages/db/migrations/023_va_moc_goi_dau.sql`; `packages/api/test-db/va-moc-goi-dau-lead-tra-lai/goi-dau.test.ts`
  (bảng năm trạng thái). Phá thử: bản không có `returned_at is null` → nhật ký `evidence/E1-pha-thu.log`.
- Verify: `npm run db:migrate && npm run db:test`.

### Task 2: Ca chập chờn và bài kiểm tĩnh — phục vụ E2, E6 · independent: false
- `leads-mine.test.ts`: `tu` từ `select clock_timestamp()`. `_acceptance/va-moc-goi-dau-lead-tra-lai/thu/*.test.mjs`.
- Verify: `node --test "_acceptance/va-moc-goi-dau-lead-tra-lai/thu/*.test.mjs"`.

### Task 3: Chuỗi gửi lại ở lõi — phục vụ E4 · independent: false
- `kieu.ts` (`resubmittedLeadId`), `lead.ts` (nối chuỗi), `mau.fixture.ts`, `chuoi-gui-lai.test.ts` (sáu hình).
- Verify: `npm test -w @quy-hang/core`; phá thử bỏ nối chuỗi.

### Task 4: So lõi với `app.lead_board_metric` — phục vụ E5 · independent: false
- `packages/api/test-db/va-moc-goi-dau-lead-tra-lai/so-do-chung.test.ts`.
- Verify: `npm run db:test`.

### Task 5: Tham chiếu và kiểm trọn — phục vụ E7–E9 · independent: false
- Một dòng §12 `docs/product/tham-chieu.md`; `/verify`; commit; `implemented`.
