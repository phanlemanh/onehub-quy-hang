# Kế hoạch thi công — bang-hang-danh-sach-chi-tiet (hàng 105)

Hợp đồng: `_acceptance/bang-hang-danh-sach-chi-tiet/contract.md` (10 AC, duyệt 05/11). Thiết kế:
`docs/superpowers/specs/2026-11-05-bang-hang-danh-sach-chi-tiet-design.md`. Không chạm `inventory/bulk/**`.

## Task 1 — Nhánh danh sách – chi tiết của BoCuc thành cột kéo chia (phục vụ E5) · independent: false

Files: `apps/web/src/components/bo-cuc/bo-cuc.tsx`, `bo-cuc.test.ts`, `app/mau/he-bo-cuc/man-mau.tsx` (trang mẫu dùng `chiTiet`).
`BoCuc kieu="danh-sach-chi-tiet"` có `cotPhu`: trên máy tính dựng `ResizablePanelGroup` ngang — panel thân (`minSize` 35%),
`ResizableHandle withHandle`, panel `data-vung="cot-phu"` `defaultSize` 38 `minSize` 28 `maxSize` 50 (khối nguồn
`app-shell-11`); không mở `NganNoi`. Nhóm panel luôn dựng (cột phụ có hay không) để thân không dựng lại. Gốc của kiểu này cao
bằng vùng làm việc (không cuộn trang). Ngăn báo, lọc điện thoại, luồng nhiều bước giữ `NganNoi`. Test: ca «danh-sach-chi-tiet:
cột phụ là cột kéo chia», ba ca đối chứng ngăn nổi, chiều đỏ.
Verify: `npm test -w @quy-hang/web`, `npm run typecheck`.

## Task 2 — Bảng hàng vào bố cục, hồ sơ là cột phụ (phục vụ E1–E4, E6, E10) · independent: false

Files: `app/(app)/inventory/page.tsx`, `khung.tsx`, `units/ho-so/bang-co-ho-so.tsx`, `units/ho-so/khung.tsx`.
`/inventory` dựng `BoCuc kieu="danh-sach-chi-tiet"`: thân là Frame Bảng hàng (hết chiều cao còn lại, lưới cuộn trong khung),
`cotPhu` là `CotHoSo` khi URL có `unit`. Cột cao từ đỉnh vùng làm việc tới đáy khung nhìn; thanh trên của vỏ không đổi. Bỏ
`h-[calc(100svh-10.5rem)]` của `KhungHoSoCan cot`. Điện thoại giữ `HoSoDienThoai` và bảng thẻ. Chờ tải và lỗi của hồ sơ nằm
trong cột (`ChoTai`, `TrangThai` + «Thử lại»).
Verify: typecheck, lint, `npm test -w @quy-hang/web`, nhìn màn 1440 và 1280 trên chỗ thử dãy D.

## Task 3 — Cột «Đầu chủ» (phục vụ E7a, E7b) · independent: true

Files: `app/(app)/inventory/cot.ts`, `bang-hang.tsx`, tệp test mới `app/(app)/inventory/dau-chu.test.ts`.
Cột id `dau-chu`, nhãn «Đầu chủ», chỉ đọc: tên thành viên theo `listAgentKey` của dòng trong kho trên máy đối với danh sách
thành viên của sàn; `null` → «—»; khoá trỏ người không còn trong sàn → «Đã rời sàn» (Hỏi-3). Hiện mặc định (Hỏi-1), ẩn được ở
trình đơn Cột. Test ma trận ba ca viết tay, chiều đỏ.
Verify: `npm test -w @quy-hang/web`, typecheck.

## Task 4 — Tài liệu và khuôn (phục vụ E8, E9a, E9b, E9c) · independent: true

Files: `docs/adr/0024-he-bo-cuc.md` (mục «Sửa đổi 05/11»), `docs/product/tham-chieu.md` §12, `docs/design/vo-va-ia.md`,
`design/patterns/ho-so-can.md`, `design/patterns/bang-hang.md`, `docs/architecture/so-diem-bien-thien.md` (dòng điều khoá
kiểu mở chi tiết, Hỏi-2), `.agents/skills/quy-hang-ui/catalog.md` (dòng `@reui/app-shell-11`), bảng đếm khuôn ui-lint nếu
đổi; `_acceptance/bang-hang-danh-sach-chi-tiet/thu/tai-lieu.test.mjs` (E8, E9c, cặp hai chiều).
Verify: `npm test -w @quy-hang/ui-lint`, `node --test _acceptance/bang-hang-danh-sach-chi-tiet/thu/*.test.mjs`, chấm khuôn.

## Task 5 — Chỗ thử dãy D và phép nhìn màn (phục vụ E1–E4, E6, E7b, E10) · independent: false

Files: `_acceptance/bang-hang-danh-sach-chi-tiet/thu/dung-d.mjs`, `chay-ui.mjs` (cổng 3477, harness CDP
`_acceptance/bang-hang-kieu-sheet/thu/cdp.mjs`, chặn service worker như hàng 92). Mỗi ca in một dòng JSON đúng khoá evals đòi.
Verify: chạy từng ca, tắt máy dev bằng `--tat`.
