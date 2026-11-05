# Kế hoạch thi công — ho-so-dien-thoai-product-detail-5 (dãy H)

Hợp đồng: `_acceptance/ho-so-dien-thoai-product-detail-5/contract.md` (8 AC, duyệt 05/11). Thiết kế: `design.md` cùng
hồ sơ. Lối chốt ở Cổng Phạm vi: ReUI `product-detail-5`, dùng lại bản chuyển thể của trang khách (`app/s/[code]/chi-tiet.tsx`),
nút chính «Hỏi đầu chủ» / «Ghi cuộc gọi». Không chạm `packages/**` (trừ bài kiểm khuôn của `ui-lint`), không migration.
Đường dẫn dưới đây tính từ `apps/web/src/app/(app)/units/ho-so/` nếu không ghi khác.

## Task 1 — Mô hình thuần của hồ sơ và hàm chọn thân (phục vụ E1, E3, E4, E5) · independent: false

Files: `mo-hinh.ts` (mới).
`moHinhHoSo(vào)` — phần «tính dữ liệu» của `HoSoCan` tách khỏi hook: chờ tải · lỗi · không thấy · nhiều toà · có căn
(thuộc tính, lần rao, lịch sử, cờ `lopPhuHoSo`, mở toàn màn, đóng, thông số chính, bản trên máy). `chonThan(cửa sổ, chỗ)`
dùng `khoCuaSo` của `today/mobile/kho.ts` (một mốc 768 của kho). `nutChinh(...)` chọn nút dính đáy theo cờ.
Verify: `npm run typecheck`.

## Task 2 — Thân cột tách ra, giữ giao diện (phục vụ E3) · independent: false

Files: `than-cot.tsx` (mới), `than-chung.tsx` (mới: `Muc`, `CapGiaTri`, `doiUrl`, `luc`), `cot-ho-so.tsx` (còn hook + rẽ thân).
JSX thân cột chuyển nguyên sang `ThanCot` dựng từ mô hình; nút cần bộ đồng bộ (`NutSanSang`, `OMaCan`) đi qua khe. Thêm
`data-muc` cho mục và nút. Người gọi truyền `cho` (toàn màn, bảng thẻ, cạnh bảng, cột Hôm nay).
Verify: typecheck, lint, `npm test -w @quy-hang/web`.

## Task 3 — Thân điện thoại theo lối ReUI (phục vụ E2, E4, E5, E6) · independent: false

Files: `dien-thoai/than-dien-thoai.tsx`, `dien-thoai/anh-lon.tsx`, `dien-thoai/nut-chinh.tsx` (mới);
`components/bo-cuc/cho-tai.tsx` (dáng chờ của hồ sơ trên điện thoại).
Ảnh lớn lướt ngang có điểm dừng (dữ liệu từ `nguonApi` của `units/photos/`) → mã căn · toà + trạng thái + Diện tích ·
Phòng ngủ · Hướng → hộp giá → Thuộc tính căn, Lần rao, Các lần rao, Ảnh, Lịch sử gọn → nút chính dính đáy. Năm trạng thái.
Verify: typecheck, lint, `npm test -w @quy-hang/web`.

## Task 4 — Bài kiểm E1–E6 (phục vụ E1–E6) · independent: true

Files: `dien-thoai/ho-so-dien-thoai.test.ts` (mới). Mỗi phép đo một bộ so trả danh sách lệch, ma trận viết trước, cặp hai
chiều trên cùng dữ liệu (vật lành → `[]`, bản sao hỏng → lời lệch ghim bằng `deepEqual`). Dữ liệu `[Mẫu] Toà A`, `A-01.02`,
số `0900 000 092`.
Verify: `npm test -w @quy-hang/web`.

## Task 5 — Khuôn và bản đồ (phục vụ E7, E8) · independent: true

Files: `design/patterns/ho-so-can.md` (luật KH-hs-lop-phu, KH-hs-mot-khung nói thân điện thoại),
`packages/ui-lint/tests/ban-do-khuon.test.mjs` (đếm lại nhận diện và chỗ trạng thái theo cây).
Verify: `npm test -w @quy-hang/ui-lint`, `npm run lint`,
`R=$(node packages/ui-lint/tim-kit.mjs) && node "$R/scripts/design-floor-khuon.mjs" --kiem --root .` (không «lệch:» của
`ho-so-can`).

E9, E10 (ảnh chụp, mạng) là việc của bước chấm trên chỗ thử dãy H; trang ba lối `proto/ho-so-dien-thoai` giữ tới Cổng Bằng
chứng.
