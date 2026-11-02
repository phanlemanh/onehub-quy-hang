# Gọi ép giá đợt hai (hàng 29) — kế hoạch thi công

Hợp đồng `_acceptance/goi-ep-gia-dot-hai/contract.md` (duyệt 02/11, Manh Phan, tám Hỏi theo khuyến nghị) · thiết kế
`docs/superpowers/specs/2026-11-02-goi-ep-gia-dot-hai-design.md`.

Ràng buộc đợt (dãy D): vùng là 17 tệp hiện có ở tầng trên `units/call` cộng `units/call/push/**`; tệp mới chỉ đặt dưới
`push/`; không đụng `units/call/dial/**` (hàng 30, dãy L). `today/hom-nay-dau-chu.tsx`: chỉ thêm nút của dòng căn và đổi
nhãn nút của hàng 28. Không migration, không API mới. Các task chạy tuần tự trong phiên chính.

## T1 · Phần thuần của chế độ ép giá

- Files: `units/call/push/{dau-man,lich-su,ket-qua,ha-gia,gia-day}.ts` + `*.test.ts`
- Làm: `dau-man` (chế độ theo tham số, số ngày lên bảng và từ lần đổi giá), `lich-su` (sự kiện → dòng), `ket-qua` (phím H G
  B K, ba lối → lệnh trạng thái theo bảng chuyển), `ha-gia` (dùng `dungGhiGia` của hàng 28, thêm «trước … · −x%»),
  `gia-day` (đọc `/owner`, không lưu trên máy).
- Verify: `npm test -w @quy-hang/web` · evals: E1, E2, E3a, E4, E5, E7 · independent: false

## T2 · Bài kiểm API

- Files: `packages/api/test-db/goi-ep-gia-dot-hai.test.ts`
- Làm: ma trận năm người xem giá đáy; tập khoá của `/owner`; thân hồ sơ qua `findSourceLeaks`.
- Verify: `npm run db:test` (Postgres D) · evals: E3, E10 · independent: false

## T3 · Màn: bố cục Hồ sơ và chế độ ép giá

- Files: `units/call/{khung,page,cuoc-goi,khoi,nguon}.tsx|ts`, `units/call/push/{ep-gia,khoi-ep-gia}.tsx`
- Làm: `KhungCuocGoi` dựng `BoCuc kieu="ho-so"` (đầu màn + thân một cột); `BaCot` thành cột dọc; trang nhận `?hang=`; chế
  độ ép giá dùng `useHoSoHang`, `useSuaHang`, khối của hàng 28. Gỡ trang thử `proto/goi-ep-gia-dot-hai`; bỏ `ngoai_le_han`
  của `cuoc-goi.md`.
- Verify: typecheck + lint + test ui-lint + mở trên máy dev 3485 · evals: E1b, E2b, E3b, E5b, E5c, E6, E7b, E8, E9, E9a, E9b, E10b · independent: false

## T4 · Hôm nay: nút «Ghi cuộc gọi»

- Files: `today/hom-nay-dau-chu.tsx`
- Làm: dòng căn ở nhóm `price_adjustment` thêm «Ghi cuộc gọi» → `/units/call?hang=<id>`; nút «Gọi» của hàng 28 trên dòng lead đổi nhãn
  thành «Ghi cuộc gọi» (Hỏi-8).
- Verify: lint + màn · evals: E1b, E6 · independent: false

## T5 · Dữ liệu thử, tài liệu

- Files: `_acceptance/goi-ep-gia-dot-hai/thu/dung-d.mjs`, `docs/product/tham-chieu.md` (§12), `design/patterns/cuoc-goi.md`,
  `design/patterns/trang-tam.md`, `packages/ui-lint/tests/ban-do-khuon.test.mjs`
- Làm: dựng P1–P9, lùi mốc trên Postgres thử bằng phiên chủ, in mốc; cờ `--ban`; dòng §12.
- Verify: `npm run typecheck && npm run lint && npm test && npm run test:hooks` · evals: E9 · independent: false
