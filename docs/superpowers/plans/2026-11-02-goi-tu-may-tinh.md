# Gọi từ máy tính — kế hoạch thi công (hàng 30)

Hồ sơ: `_acceptance/goi-tu-may-tinh/` (T2, đã duyệt Cổng Phạm vi 02/11, Hỏi-1 = thông báo). Thiết kế:
`docs/superpowers/specs/2026-11-02-goi-tu-may-tinh-design.md`. Không migration.

Các task chạy tuần tự trong vòng chính (mỗi task nhỏ, chung một nhánh; task 4 phụ thuộc 1–2).

## Task 1 — Nội dung thông báo quay số ở lõi

- Files: `packages/core/src/push/index.ts` (+ `PUSH_DIAL_TITLE`, `dialUrl`, `noiDungQuaySo`), `packages/core/src/push/push.test.ts`.
- `noiDungQuaySo({ leadId, buildingName, need })` → bốn khoá `PUSH_PAYLOAD_KEYS`: «Gọi chủ nhà» · «<Toà> · <nhu cầu>» ·
  `/units/call/dial?lead=<id>` · `quay-so:<id>`.
- Verify: `npm test -w @quy-hang/core`. Phục vụ E3. independent: true.

## Task 2 — Cửa `POST /api/v1/leads/{leadId}/phone-dial`

- Files: `packages/api/src/leads/store.ts` (+ `dialLeadPhone`), `packages/api/src/leads/routes.ts`, `packages/api/src/app.test.ts`.
- Một giao dịch: vai phải có Đầu chủ (403), lead cùng vị từ của `app.reveal_lead_phone` (người được giao, outcome
  `new`/`owner_has_agent`, chưa bỏ, chưa trả lại; 404), rồi `app.push_outbox_add(<chính người gọi>, noiDungQuaySo(...))` →
  `devices`; `otherDevices = devices − số đăng ký của chính người ấy trùng endpoint gửi kèm` (luật theo dòng cho đọc đăng ký
  của mình). Thân `{ endpoint? }` `.strict()`. Sau giao dịch `guiSauKhiGhi`. Không đổi lead, không ghi vết mở số.
- Verify: `npm run typecheck`, `npm test -w @quy-hang/api`. Phục vụ E1, E2, E4, E5. independent: false (sau task 1).

## Task 3 — Bài kiểm trên Postgres thật

- Files: `packages/api/test-db/goi-tu-may-tinh.test.ts`.
- Ca: «quay số: đầu chủ được giao» (E1), «quay số: người không được gọi» (E2, mười dòng), «quay số: không rò lớp nguồn»
  (E4), «quay số: chưa có thiết bị khác» (E5, ba dòng), «quay số: url thông báo dẫn tới trang quay số và mở số một vết» (E10).
- Mỗi ca có đối chứng dương; chiều đỏ thử phá bản sao rồi hoàn lại (ghi vào nhật ký vòng, không commit vật phá).
- Verify: `npm run db:migrate && npm run db:test` (Postgres dãy L). Phục vụ E1, E2, E4, E5, E10. independent: false.

## Task 4 — Web: lời gọi, trang quay số, nút máy tính

- Files: `apps/web/src/app/(app)/units/call/dial/{quay-so.ts, quay-so.test.ts, nut-quay-so.tsx, trang-quay-so.tsx, page.tsx}`,
  một chỗ cắm nút ở `units/call/cuoc-goi.tsx` (cham-tep L-22 / câu hỏi L-0211-9).
- `guiQuaySo(id, goi, endpoint?)` → câu báo theo `otherDevices`; `goiChuNha(id, goi, diToi)` → mở số (cửa `moSo` của
  `today/mo-so.ts`) rồi `diToi(telHref(so))`. Trang dựng trong `KhungCuocGoi`, chặn vai khác Đầu chủ (404), đọc lead bằng
  `docLeadCuocGoi`. Endpoint của máy này đọc từ `pushManager.getSubscription()` khi có.
- Verify: `npm test -w @quy-hang/web`, `npm run typecheck`, `npm run lint`. Phục vụ E6, E7, E8, E9, E11. independent: false.

## Task 5 — Tham chiếu §12 và tệp thử

- Files: `docs/product/tham-chieu.md` (dòng «Gọi từ máy tính»), `_acceptance/goi-tu-may-tinh/thu/dang-ky.mts`.
- Verify: ca E11 trong `quay-so.test.ts`. Phục vụ E8, E11. independent: true.

## Cuối S3

Sàn thiết kế (`design-floor-s3.mjs`), hợp đồng `status: implemented`, rồi S4.
