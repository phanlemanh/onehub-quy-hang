# Kế hoạch thi công — Ô nhận lead (hàng 24, T3)

Hợp đồng `_acceptance/o-nhan-lead/contract.md` (duyệt 31/10, Manh Phan) · thiết kế
`docs/superpowers/specs/2026-10-31-o-nhan-lead-design.md` · evals `_acceptance/o-nhan-lead/evals.yaml`.
Postgres dãy L 5563, dev 3483. Migration 007 và ADR-0012 do giám sát giữ chỗ.

Số chủ của lead: hàng 62 (mã hoá số chủ, PR #40) chưa có mã trên main. Theo thoả với dãy G: 24 vào trước thì 007 tạo
`leads.owner_phone text` (vai API không được đọc) và gom phép so số vào một hàm; 62 chuyển cột và đổi thân hàm. 62 vào
trước thì 24 đổi số migration lên sau 008 và so `owner_phone_hash`.

## T1 — Lõi kiểm trùng (đã viết ở S1)

- Files: `packages/core/src/dedupe/index.ts`, `packages/core/src/dedupe/dedupe.test.ts`, `packages/core/package.json` (lối nhập `./dedupe`)
- Verify: `npm test -w @quy-hang/core` (8 ca dedupe xanh; đã phá thử hai chiều đỏ đúng tên ca)
- Phục vụ: E1, E2, E7
- independent: true

## T2 — Bảng lead và hàm dữ kiện (migration 007)

- Files: `packages/db/migrations/007_o_nhan_lead.sql`, `packages/db/tests/isolation.test.mjs` (thêm ca)
- Nội dung: bảng `leads` (năm mục, `owner_phone`, `outcome`, `matched_agent_user_id`, `matched_listing_id`, `created_by`,
  `created_at`, `discarded_by`, `discarded_at`), `enable` + `force row level security`; đọc: cùng sàn và (người nhập, đầu
  chủ được khớp, hay trưởng nhóm); thêm: cùng sàn, `created_by` là người đang làm; grant đọc mọi cột trừ `owner_phone`, không
  grant sửa/xoá. `app.unit_key(text)` chuẩn hoá mã căn (bỏ ký tự không phải chữ số, viết hoa). `app.lead_dedupe_facts(p_phone,
  p_building, p_unit, p_open_statuses)` security definer trong sàn đang làm → (hàng mở trên căn + đầu chủ của hàng, đầu chủ của
  chủ nhà từ `listing_owners` hay lead trước đã về đầu chủ chưa bỏ). `app.discard_lead(p_lead)` security definer: đúng người
  nhập, đúng căn trùng, chưa bỏ — mã lỗi riêng cho từng ca. Ràng buộc kiểm: số `^0[0-9]{9}$`, kết quả một trong ba, căn trùng
  thì có hàng khớp.
- Verify: `npm run db:migrate && npm run db:test` trên Postgres dãy L; phá thử: bỏ điều kiện sàn trong hàm → ca cách ly đỏ
- Phục vụ: E3, E4, E5, E6, E7b, E8
- independent: false (T3 cần)

## T3 — Lối API `/api/v1/leads`

- Files: `packages/api/src/leads/routes.ts`, `packages/api/src/leads/store.ts`, `packages/api/src/app.ts` (một dòng đăng ký),
  `packages/api/test-db/leads.test.ts`
- Nội dung: `POST /leads` (vai theo bảng nút `new_lead` của lõi → 403; khuôn lõi → 400 `details`; một giao dịch: dữ kiện → lõi
  quyết → ghi → bản của telesales qua `leadResultView`, tên đầu chủ từ thành viên sàn); `GET /leads/{id}` (chỉ người nhập, khác
  → 404); `POST /leads/{id}/discard` (400 / 404 / 409); `GET /leads/buildings` (tên toà của danh mục mẫu). Bộ kiểm nạp hàng,
  chủ nhà, đầu chủ của bộ mẫu hàng 5 (`packages/db/seed/mau/du-lieu-mau.json`) vào sàn thử qua đường ghi thật (tạo hàng, đổi
  trạng thái, gán đầu chủ, đặt chủ nhà) — không chèn tay đúng khuôn bên đọc.
- Verify: `npm run db:test`; phá thử: đảo ưu tiên lõi → ca căn trùng đỏ; grant đọc `owner_phone` → ca rò số đỏ
- Phục vụ: E3, E4, E5, E6, E7b, E8, E9
- independent: false (cần T2)

## T4 — Màn thật và đồ dựng cho bài chấm màn

- Files: `apps/web/src/app/(app)/leads/new/*` (đã dựng ở S1, nối API thật), `_acceptance/o-nhan-lead/thu/dung-mau.mjs`
  (nạp sàn mẫu + hàng + chủ nhà của bộ mẫu vào Postgres dãy L, in bảng email ↔ vai và ba ca)
- Verify: `npm run typecheck && npm run lint`; chạy màn trên 3483 với dữ liệu thật của dung-mau, bấm đủ ba kết quả
- Phục vụ: E10, E11
- independent: false (cần T3)

## T5 — Tài liệu đi cùng

- Files: `docs/adr/0012-o-nhan-lead.md`; `docs/product/tham-chieu.md` (thêm dòng §12; §4 sửa câu «Lead là hàng ở nấc đầu» theo
  Hỏi-4 — đã xin chạm tệp L-1); `docs/design/vo-va-ia.md` (bảng khối đã chuyển thể: form-2 → Ô nhận lead qua `KhungLead` +
  `TrangThai`)
- Verify: đọc lại; `npm run lint` (kiểm chuẩn)
- Phục vụ: (tài liệu — luật 6 của đợt)
- independent: true

## Sau cùng

Hợp đồng sang `implemented`, chạy sàn thiết kế S3, rồi lượt chấm S4 (xin khoá `s4`).
