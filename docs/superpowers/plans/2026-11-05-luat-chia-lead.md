# Kế hoạch — luat-chia-lead (hàng 48)

Thiết kế: `docs/superpowers/specs/2026-11-05-luat-chia-lead-design.md` · hợp đồng: `_acceptance/luat-chia-lead/contract.md`.
Thứ tự tuần tự trong một phiên (các việc chạm chung `apps/web` nên không tách nhánh song song). Mỗi phép đo mới đi kèm cặp
hai chiều trên cùng dữ liệu: vật lành → xanh, phá bản sao → đỏ với thông điệp ghim.

## T1 — Nhãn cách chia và người đọc lời báo ở lõi
- Files: `packages/core/src/routing/nhan.ts`, `packages/core/src/routing/nhan.test.ts`, `packages/core/src/routing/index.ts`
- Việc: `ROUTING_STRATEGY_NHAN: Record<RoutingStrategyKey, { nhan, giaiThich }>`, `ALERT_AUDIENCE_NHAN: Record<AlertAudience, string>`;
  xuất qua `@quy-hang/core/routing`.
- Verify: `npm test -w @quy-hang/core` (ca «nhãn cách chia và người đọc lời báo», phá thử: bỏ một khoá → assert nêu khoá).
- Phục vụ: E8. independent: true

## T2 — Phần thuần của màn
- Files: `apps/web/src/app/(app)/settings/lead-routing/luat.ts`, `luat.test.ts`
- Việc: `DONG` (sáu khoá theo thứ tự, đoạn), `cauHieuLuc(diem)` từ `hieuLuc`, `kiemBan(ban)` dùng `kiemGiaTri` của lõi (lỗi theo
  khoá, khoá đã đổi), `ganLyDo(reason)` (400 → khoá), `trangThaiMan(cauHinh, boNhom)` (khoá ngưỡng, báo dòng hỏng, lỗi tải),
  `quetChuCam(tep, noiDung)`.
- Verify: `npm test -w @quy-hang/web` — ca E4, E5a, E7a, E8b kèm phá thử.
- Phục vụ: E4, E5a, E7a, E8b. independent: false (sau T1)

## T3 — Màn Luật chia lead
- Files: `apps/web/src/app/(app)/settings/lead-routing/page.tsx`, `luat-chia-lead.tsx`
- Việc: trang máy chủ (chặn vai, đọc `/company/settings`, `/company/settings/queue`, `/company/member-names`) → `MucCaiDat khoi`
  → khối client: `MucCaiDatKhoi` + `SettingField` × 6, `Select`, `NumberField`, `Badge`, chân Hoàn lại · Lưu, `FieldError`,
  toast, `TrangThai` cho lỗi tải và báo. Sửa `packages/ui-lint/tests/ban-do-khuon.test.mjs` dòng nhóm cai-dat-san (thêm trang).
- Verify: `npm run typecheck && npm run lint`, `npm test -w @quy-hang/ui-lint`; nhìn màn trên chỗ thử 3477.
- Phục vụ: E1, E2a, E5b, E6a, E7b, E11, E12. independent: false (sau T2)

## T4 — Danh bạ: Ngoài-9, Ngoài-10
- Files: `apps/web/src/app/(app)/inventory/danh-ba.ts`, `danh-ba.test.ts`, `cot.ts`, `ghep-danh-muc.ts`, `bang-hang.tsx`, `dau-chu.test.ts`
- Việc: danh bạ `{ ten, moi }`; `chuDauChu` chỉ «Đã rời sàn» khi `moi`; phần đọc thuần `docDanhBa(fetch)` trả `xong|loi`; hook trả
  `{ danhBa, loi, thuLai }`; Bảng hàng hiện báo kèm Thử lại.
- Verify: `npm test -w @quy-hang/web` — ca E9, E10a kèm phá thử; `npm run typecheck`.
- Phục vụ: E9, E10a, E10b. independent: true

## T5 — Bộ kiểm API trên Postgres dãy D
- Files: `packages/api/test-db/luat-chia-lead.test.ts`
- Việc: ba ca — lưu sáu điểm nguyên khối + chiều đỏ 400; đổi qua lối màn chỉ áp cho lead mới; vai khác 403 với từng khoá.
- Verify: `DATABASE_URL=…5575 npm run test:db -w @quy-hang/api -- --test-name-pattern "luật chia lead"`.
- Phục vụ: E2b, E3, E6b. independent: true

## T6 — Chỗ thử và lượt nhìn
- Files: `_acceptance/luat-chia-lead/thu/dung-d.mjs`, `_acceptance/luat-chia-lead/thu/chay-ui.mjs`
- Việc: Postgres 5575 nạp sàn mẫu, máy dev 3477, phiên quan-tri, truong-nhom, dau-chu-1; các ca --e1 --e2 --e5 --e6 --e7 --e10 ghi
  dòng quan sát JSON và ảnh vào thư mục --ra.
- Verify: chạy từng ca một lần trên máy, đọc dòng quan sát.
- Phục vụ: E1, E2a, E5b, E6a, E7b, E10b. independent: false (sau T3, T4)

## T7 — Tham chiếu
- Files: `docs/product/tham-chieu.md` — thêm một dòng §12 (05/11) cho màn Luật chia lead và hai mục danh bạ (chỉ thêm dòng).
- Verify: `npm run lint`.
