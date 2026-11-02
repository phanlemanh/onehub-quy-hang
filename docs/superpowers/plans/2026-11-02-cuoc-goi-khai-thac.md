# Chế độ cuộc gọi khai thác (hàng 28) — kế hoạch thi công

Hợp đồng `_acceptance/cuoc-goi-khai-thac/contract.md` (duyệt 02/11, Manh Phan) · thiết kế
`docs/superpowers/specs/2026-11-02-cuoc-goi-khai-thac-design.md` · sổ `decisions.jsonl` (Hỏi-1…6 theo khuyến nghị, lối Vẽ mới).

Thứ tự: lõi → API → màn → nút Hôm nay → tài liệu, công cụ dựng dữ liệu → gỡ trang ba lối. Các task chạy tuần tự trong
phiên chính: màn đọc lõi, công cụ dựng dữ liệu đọc API — không task nào độc lập đáng tách worktree.

Ràng buộc đợt (dãy D): `today/hom-nay-dau-chu.tsx` và `today/nguon.ts` chỉ THÊM (nút «Gọi», không sửa dòng có sẵn);
`docs/design/vo-va-ia.md` chỉ sửa dòng «Chỗ hở — Chế độ cuộc gọi»; không migration.

## T1 · Lõi: giá về tay

- Files: `packages/core/src/pricing/ve-tay.ts`, `ve-tay.test.ts`, `pricing/index.ts`
- Làm: `TI_LE_BAO_PHI_MAC_DINH` (phần vạn 200/50/100, mã `thue_tncn` · `le_phi_truoc_ba` · `moi_gioi`), `tinhVeTay`,
  `giaBaoPhiTuVeTay` (tìm nhỏ nhất bằng ước lượng rồi dò ±), số nguyên đồng.
- Verify: `npm test -w @quy-hang/core` · evals: E3 · independent: false

## T2 · Lõi: so giá toà

- Files: `packages/core/src/pricing/so-gia.ts`, `so-gia.test.ts`, `pricing/index.ts`
- Làm: `SO_GIA_NAC`, `soGiaToa({ can, cacCan, tiLe })` — đầu vào là căn đã kèm `bedroomsTotal` (null = chỉ biết toà → cả
  toà, `caToa: true`); trả `{ dai, dong, viTri, caToa }`, dải là min / trung vị / max của về tay.
- Verify: như T1 · evals: E5 · independent: false

## T3 · Lõi: danh sách hỏi

- Files: `packages/core/src/listing/danh-sach-hoi.ts`, `danh-sach-hoi.test.ts`, `listing/index.ts`
- Làm: `DANH_SACH_HOI` theo `COMPLETENESS_ITEMS` — mục `price` (nhãn «Giá và phí», không lựa chọn), bốn mục chi tiết với
  bộ lựa chọn mặc định (Hỏi-2) `{ nhan, reso? }`; giá trị ghi vào hồ sơ là nhãn (trường chữ tự do của lần rao).
- Verify: như T1 · evals: E6 · independent: false

## T4 · API: một lead của tôi

- Files: `packages/api/src/today/store.ts`, `routes.ts`, `packages/api/test-db/cuoc-goi-khai-thac.test.ts`
- Làm: `readAssignedLead(tx, id)` — cùng câu chọn với danh sách, thêm `where l.id = $1`, bỏ lọc nhóm, loại lead đã bỏ /
  đã trả lại (404); thêm `listPrice`, `feeInclusion`, `listingId` (từ `lead_listings`). Route `GET /api/v1/leads/assigned/{leadId}`
  (403 vai khác, 404 mã sai). Test: ma trận 6 ca E1, ca vai/nguồn E10.
- Verify: `npm run db:migrate && npm run db:test` (Postgres D cổng 5565) · evals: E1, E10 · independent: false

## T5 · Màn: phần thuần

- Files: `apps/web/src/app/(app)/units/call/{nguon,may-tinh,phim,gia,muc-du,ho-so-lead,goi-dau}.ts` + `*.test.ts`
- Làm: `nguon.ts` (đọc lead theo mã, `LeadCuocGoi`), `may-tinh.ts` (trạng thái máy tính hai chiều đọc lõi), `phim.ts`
  (bảng phím → lệnh), `gia.ts` (gợi giá, «Hiểu là», hỏi lại), `muc-du.ts` (dòng mức đủ từ `completeness` trên bản trên
  máy), `ho-so-lead.ts` (tạo hồ sơ một lần, giữ lời hứa đang bay, 409 đọc lại), `goi-dau.ts` (mốc gọi đầu một lần, 409 ra
  chữ).
- Verify: `npm test -w @quy-hang/web` · evals: E2b, E4, E6b, E7, E8, E9b · independent: false

## T6 · Màn: trang và ba cột

- Files: `apps/web/src/app/(app)/units/call/{page,cuoc-goi,the-lead,danh-sach-hoi,tinh-gia,so-gia}.tsx`
- Làm: trang chỉ vai Đầu chủ (`notFound`), ba cột KD1 trong `KhungCuocGoi`, khối dựng lại từ trang ba lối với dữ liệu
  thật; thử thành phần ReUI `questionnaire` trước khi ghép `ToggleGroup` (hoãn 1 của design-pass) — ghi kết quả ở
  `design-pass.md`. Trạng thái ST-cuoc-goi-* theo bảng của thiết kế.
- Verify: typecheck + lint + mở trên máy dev 3485 · evals: E1b, E1c, E2, E4b, E5b, E6c, E7b, E7c, E8b, E9, E10b · independent: false

## T7 · Hôm nay: nút «Gọi»

- Files: `apps/web/src/app/(app)/today/hom-nay-dau-chu.tsx` (chỉ thêm)
- Làm: dòng lead thêm nút «Gọi» (`Link` tới `/units/call?lead=<mã>`).
- Verify: lint + màn · evals: E1b · independent: false

## T8 · Tài liệu, dữ liệu thử, sàn thiết kế

- Files: `_acceptance/cuoc-goi-khai-thac/thu/dung-d.mjs`, `design/patterns/cuoc-goi.md`, `design/patterns/trang-tam.md`,
  `docs/design/vo-va-ia.md` (dòng Chỗ hở), `docs/product/tham-chieu.md` (§12 và bảng đường dẫn),
  `docs/architecture/so-diem-bien-thien.md` (điều khoá danh sách hỏi, ba tỉ lệ), gỡ `proto/cuoc-goi-khai-thac/**`.
- Làm: công cụ dựng dữ liệu in L1, L3, L5/H5, L6, L7, L8, L9, L11–L15 (cờ `--tra`, `--ban`); `nhan_dien` của nhóm
  `cuoc-goi` trỏ màn thật; chạy design-floor S3.
- Verify: `npm run typecheck && npm run lint && npm test && npm run test:hooks` · evals: E1c · independent: false
