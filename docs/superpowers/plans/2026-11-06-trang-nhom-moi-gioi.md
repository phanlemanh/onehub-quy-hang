# Kế hoạch thi công — trang-nhom-moi-gioi (hàng 44)

Hợp đồng: `_acceptance/trang-nhom-moi-gioi/contract.md` (đã duyệt 06/11). Thiết kế: `docs/superpowers/specs/2026-11-06-trang-nhom-moi-gioi-design.md`.
Verify của kho thắng mặc định của skill: `npm run typecheck`, `npm run lint`, test của gói bị chạm; bài cơ sở dữ liệu cần
`DATABASE_URL=postgres://postgres:quyhang@localhost:5571/postgres`. Mỗi phép đo mới kèm cặp hai chiều (phá thử trên bản sao).

## T1 — Migration 048: mức chia và định nghĩa phí trên Lần gửi
- Files: `packages/db/migrations/048_trang_nhom_moi_gioi.sql`, `packages/db/tests/isolation.test.mjs`
- Việc: thêm `shares.commission_split_pct numeric(5,2) null` (check 0–100; check `audience='client'` → null) và
  `shares.fee_inclusion text[] null` (check ⊆ {personalIncomeTax, registrationFee, brokerageFee}, khác rỗng khi có); hàm
  `app.create_share` bản mới thêm hai tham số (giữ chữ ký cũ gọi sang bản mới với null), grant execute cho `quy_hang_app`.
  Ca cách ly «shares (048): mức chia» theo E9.
- Verify: `npm run db:migrate` hai lần + `npm run db:test` (ca 048).
- Phục vụ: E9. independent: false (T3, T4 cần cột).

## T2 — Lõi: thân trang môi giới
- Files: `packages/core/src/sharing/trang-khach.ts` (hoặc `trang-moi-gioi.ts` cạnh nó), `packages/core/src/sharing/*.test.ts`,
  `packages/core/src/export/cot.ts` (chỉ đọc `cotRa`)
- Việc: `thanTrangKhach` nhận thêm `luuTrenLanGui: { mucChia: number|null; feeInclusion: string[]|null }` và `cauHinhSan`
  (hide, fee.inclusion hiện tại); với `nhom_moi_gioi` thêm `cot` (nhãn + khoá từ `cotRa`, theo cách gọi riêng), `dinhNghiaPhi`
  (tên chuẩn + khoản: bản chụp, vắng thì cấu hình hiện tại), `mucChia` (vắng hẳn khi ẩn hay null). Khách riêng không thêm
  khoá nào. Bảng ca E2, E4.
- Verify: `npm test -w @quy-hang/core`.
- Phục vụ: E2, E4, E1 (nguồn cột). independent: true.

## T3 — API: tạo Lần gửi mang mức chia, route công khai trả thân môi giới
- Files: `packages/core/src/sharing/index.ts` (validateShareInput thêm `commissionSplitPct` tuỳ chọn, 0–100, cấm với khách
  riêng), `packages/api/src/contacts/prospects.ts`, `packages/api/src/public/store.ts`, `packages/api/src/public/routes.ts`
  (schema thân), `packages/api/test-db/trang-nhom-moi-gioi/*.test.ts`
- Việc: `createShare` chụp `fee.inclusion` hiện tại của sàn và gọi `create_share` mới; `timLanGui`/`docTrangKhach` đọc hai cột
  + cấu hình sàn (`broker_page.hide_commission_split`, `fee.inclusion`) trong phiên người gửi; route trả thân mới.
- Verify: `npm test -w @quy-hang/api`, `npm run db:test` (ca E1, E2b, E3, E4b, E8).
- Phục vụ: E1, E2b, E3, E4b, E8. independent: false (cần T1, T2).

## T4 — Bài rò rỉ cho trang môi giới
- Files: `packages/api/src/public/doc.ro-ri.test.ts`, `apps/web/src/app/s/broker/trang.ro-ri.test.ts`
- Việc: căn mồi đủ sáu loại qua route thật cho người nhận nhóm môi giới; quét thân, mô hình Excel, mô hình ảnh, mã nguồn
  trang. Đối chứng dương mồi có trong đầu vào.
- Verify: `npm run test:ro-ri`.
- Phục vụ: E7. independent: false (cần T3, T5).

## T5 — Web: bảng môi giới, tải Excel, tải ảnh
- Files: `apps/web/src/app/s/broker/{bang.tsx,tai.ts,ve-anh.ts,trang-thai.ts,*.test.ts}`, `apps/web/src/app/s/[code]/page.tsx`
  (rẽ theo `than.nguoiNhan`), `apps/web/src/app/s/[code]/doc.ts` (kiểu thân)
- Việc: lưới Bảng hàng chỉ đọc theo `than.cot` trong `KhungTrangKhach`; đầu trang định nghĩa phí, mức chia; nút Tải Excel
  (`ghiXlsx`) và Tải ảnh (bộ vẽ canvas của Xuất bảng hàng, cột từ `than.cot`); chữ trạng thái theo bảng thiết kế; điện thoại
  cuộn ngang. Bài E1b, E5, E6, E10c.
- Verify: `npm test -w @quy-hang/web`, typecheck, lint (luật quy-hang-ui).
- Phục vụ: E1b, E5, E6, E10c. independent: false (cần kiểu thân từ T2).

## T6 — Web: ô Mức chia ở luồng Gửi
- Files: `apps/web/src/app/(app)/shares/new/{gui.ts,man-gui.tsx,gui.test.ts}`
- Việc: người nhận nhóm môi giới → ô «Mức chia (%)» điền sẵn mặc định sàn (đọc `GET /api/v1/company/settings`), sửa / để
  trống; thân POST theo E3b.
- Verify: `npm test -w @quy-hang/web`.
- Phục vụ: E3b. independent: true (với T5).

## T7 — Web: mục Cài đặt › Sàn › Trang môi giới
- Files: `apps/web/src/app/(app)/settings/broker-page/{page.tsx,vung.tsx,*.test.ts}`, `apps/web/src/app/(app)/settings/cai-dat.ts`,
  `packages/ui-lint/tests/{ban-do-khuon,rang-bo-cuc}.test.mjs` (thêm dòng, luật 51), `design/patterns/trang-tam.md` nếu khuôn đòi
- Việc: trang theo khuôn `MucCaiDat`, `chanMucSan`; ô mức chia + công tắc ẩn, lưu qua `PATCH /api/v1/company/settings`;
  400 hiện lý do dưới ô.
- Verify: `npm test -w @quy-hang/web`, `npm test -w @quy-hang/ui-lint`.
- Phục vụ: E8b, E10. independent: true (với T5, T6).

## T8 — Tham chiếu và hoàn tất
- Files: `docs/product/tham-chieu.md` (dòng 270 → «Đã dựng (hàng 44)», sổ §12 dòng 06/11), `docs/architecture/so-diem-bien-thien.md`
  (#15 có số mặc định trống, màn 44 đã dựng)
- Verify: `npm run typecheck && npm run lint && npm test`.
- Phục vụ: hồ sơ. independent: false (cuối).

Thứ tự: T1 → T2 → T3 → (T5 ∥ T6 ∥ T7) → T4 → T8. Chạy tuần tự trong phiên chính (các task web chung bộ test web, gộp
song song không rẻ hơn).
