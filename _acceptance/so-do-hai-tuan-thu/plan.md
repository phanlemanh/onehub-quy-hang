# Kế hoạch — so-do-hai-tuan-thu (hàng 52)

Thiết kế: `_acceptance/so-do-hai-tuan-thu/design.md`. Mọi task tuần tự (cùng thư mục, chung kiểu) — `independent: false`.
Verify mỗi task: `npm test -w @quy-hang/core` + `npm run typecheck -w @quy-hang/core` (quy ước kho: node --test, tsc chặt).

## T1 — Kiểu, danh sách số đo, khung tính (phục vụ E1, E8, E10)

- Files: `packages/core/src/metrics/kieu.ts`, `packages/core/src/metrics/danh-sach.ts`, `packages/core/src/metrics/so-do.ts`,
  `packages/core/src/metrics/index.ts`
- `DANH_SACH_SO_DO`: 13 mã theo thứ tự §11, mỗi mã `dongThamChieu` (mảnh chữ của ô §11), `traLoi`, `kieu` hay `thieu`.
- `tinhSoDo(dauVao)`: chia kỳ, gấp hàng tới `den`, gọi từng hàm đo, dòng chưa có sự kiện trả `{ trangThai, thieu }`.
- Ca: E1 (khớp §11 — đọc tham-chieu.md, đường suy từ `import.meta.url`), E8, E10 (không đồng hồ — `mock.timers`).

## T2 — Số đo trên hàng (phục vụ E2, E3, E4, E7, E10)

- Files: `packages/core/src/metrics/hang.ts`
- Gấp sự kiện trước `den` bằng `foldListing`; `confirmed_within_n_days` qua `freshness`; `top_completeness` qua
  `completeness`; `unit_code_autofill` qua `buildCatalogIndex` + `lookupUnit`; `price_adjustment_calls` qua `stepListing`
  từng sự kiện + `nhomCuaCan(boMacDinh(nguong))`.
- Ca: E2, E3, E4, E7, phần hàng của E10.

## T3 — Số đo trên lead (phục vụ E5, E6, E10)

- Files: `packages/core/src/metrics/lead.ts`
- `lead_to_first_call`, `lead_to_ready` (trung vị, dãy, chưa tới mốc), `duplicate_leads_blocked`.
- Ca: E5, E6, phần lead của E10.

## T4 — Bộ chuyển dữ liệu mẫu và số ghim (phục vụ E9, E8)

- Files: `packages/core/src/metrics/mau.fixture.ts`, ca trong `packages/core/src/metrics/so-do.test.ts`
- Đọc `packages/db/seed/mau/du-lieu-mau.json` (đường suy từ `import.meta.url`), chép chuỗi lệnh của `nap-ban-that.ts`,
  `validatePayload` mỗi sự kiện, kết quả kiểm trùng lead bằng `decideOutcome`.
- Ca: E9 (số ghim, hai lần bằng nhau, không khoá chủ nhà), E8 trên bộ mẫu.

Mỗi phép đo mới có cặp hai chiều: chiều đỏ ghi ở `expected` của evals — lượt phá thử chạy trên bản sao tạm của hàm, ghi kết
quả vào ghi chú cuối S3 (không commit bản phá).
