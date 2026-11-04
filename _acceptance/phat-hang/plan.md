# Kế hoạch thi công — phat-hang (hàng 43 · Xuất bảng hàng)

**Mục tiêu:** đầu chủ, trưởng nhóm xuất bảng hàng đang lọc ra bài Zalo, bài Facebook, Excel, ảnh, PDF qua hộp thoại bốn
bước trên bảng hàng; mọi đầu ra qua luật ẩn ở lõi; mỗi lần xuất ghi ở máy chủ và đếm vào «Số lần xuất bảng hàng».

**Duyệt:** Manh Phan 04/11/2026 (Gate 1.5).

**Căn cứ:** `contract.md` (duyệt 04/11), `evals.yaml`, `design.md`, sổ `decisions.jsonl` (Hỏi-1 … Hỏi-4 theo khuyến
nghị; tên «Xuất bảng hàng»). Migration số **030** (luật đợt 25). Tệp dùng chung đã đổi nhãn qua H-15.

## Ràng buộc chung

- TypeScript chặt; code tiếng Anh, chú thích nghiệp vụ và chữ giao diện tiếng Việt; dữ liệu mẫu `[Mẫu]`, `0900 000 0xx`.
- Không thêm thư viện, không sửa `package-lock.json` (Hỏi-3).
- Đầu ra chỉ dựng từ `banRaNgoai(can, { cua: "phat_hang", nguoiNhan, cauHinh, today })`; trang không đọc trường nội bộ.
- Mẫu: `post_zalo · post_facebook · xlsx · png · pdf`; người nhận mặc định `nhom_moi_gioi`; ngưỡng 30 bằng
  `MAX_SHARE_LISTINGS` của `packages/core/src/sharing`.
- Bảng `exports` chỉ thêm: không `update`, `delete` cho `quy_hang_app`; không cột nội dung, không danh sách căn.
- Giao diện: khối đích `dialog-5` (cài `@reui/dialog-5`, chuyển thể ở `components/khoi/dialog-5/`, thêm dòng `catalog.md`);
  chỉ máy tính (≥ md); trạng thái qua `TrangThai`.
- Mỗi phép đo mới có cặp chiều đỏ trên cùng fixture (MEASURE-BIRTH-CLAUSE).

## Tasks

### Task 1 — Lõi xuất bảng hàng · independent: true

- Files: `packages/core/src/export/{index,mau,cot,bai,xlsx,pdf}.ts` + `*.test.ts`; `packages/core/package.json`
  (đường xuất `./export`).
- `MAU_XUAT`, `mauBiKhoa(mau, n)`; `cotRa(cotGocNhin, nguoiNhan, cauHinh) → { ra, boQua }`;
  `xuatBang(can: CanNoiBo[], { mau, nguoiNhan, cauHinh, cot, today, tenSan }) → BanXuat` (gọi `banRaNgoai`);
  `baiZalo`, `baiFacebook`; `ghiXlsx(bang) → Uint8Array` (chuyển từ `packages/db/seed/xlsx.mjs`, crc32 tự tính);
  `ghiPdf(trangJpeg: Uint8Array[], kho) → Uint8Array`; `chiaTrang(n, 25)`; `tenTep(mau, ngay)`.
- Verify: `npm test -w @quy-hang/core`; E5 chạy thêm `python3 packages/db/seed/doc-xlsx.py`.
- Phục vụ: E2, E3, E4, E5, E6.

### Task 2 — Bảng lần xuất và API · independent: true

- Files: `packages/db/migrations/030_lan_xuat.sql`; `packages/db/tests/isolation.test.mjs` (thêm ca cuối tệp);
  `packages/api/src/exports/routes.ts`; `packages/api/src/app.ts` (đăng ký route, chỉ thêm); `packages/api/src/app.test.ts`
  (danh sách route); `packages/api/test-db/phat-hang/lan-xuat.test.ts`.
- Bảng `exports (id uuid pk, company_id, user_id, format text check in (…5 mã), recipient text check in (…2 mã),
  listing_count int check > 0, created_at timestamptz default now())`, RLS `enable` + `force` theo
  `app.current_company_id()`, `insert` chỉ khi `user_id = app.current_user_id()`; grant `select, insert`.
- `POST /api/v1/exports` khuôn `.strict()` `{ format, recipient, listingCount }`; vai `listing_agent`, `team_lead`;
  trả `201 { id }`.
- Verify: `npm run db:migrate && npm run db:test` trên Postgres dãy H (5574).
- Phục vụ: E8.

### Task 3 — Số đo «Số lần xuất bảng hàng» · independent: true

- Files: `packages/core/src/metrics/{kieu,so-do,danh-sach}.ts`, `packages/core/src/metrics/xuat.ts` + test.
- `DauVaoSoDo.lanXuat?: { createdAt: string }[]`; `soLanXuat(lanXuat, ky)` đếm `[tu, den)`; bỏ `thieu` của
  `sheet_publishes`; hằng loại sự kiện đặt theo `CONTEXT.md` («Xuất bảng hàng»), báo dãy D (hàng 52) đọc theo.
- Verify: `npm test -w @quy-hang/core`.
- Phục vụ: E9.

### Task 4 — Hộp thoại trên bảng hàng · independent: false (sau Task 1, 2)

- Files: `apps/web/src/app/(app)/inventory/phat-hang/{hop-thoai,tap-can,chuyen-dong,ve-anh,xong}.ts(x)` + tests;
  `apps/web/src/app/(app)/inventory/bang-hang.tsx` (nút trên thanh, chỉ thêm); `apps/web/src/app/(app)/exports/new/page.tsx`
  (chuyển về `/inventory?phat-hang=1`); `components/khoi/dialog-5/`; `.agents/skills/quy-hang-ui/catalog.md`.
- `tapCanXuat(dongHien, tich)`; `dongSangCan(dong) → CanNoiBo`; vẽ bảng lên canvas → PNG, chia trang JPEG → `ghiPdf`;
  `xongLanXuat({ chep|tai, ghi })` — chép, tải trước; ghi sau, hỏng thì «Chưa ghi được lần xuất».
- Bài kiểm rò rỉ `inventory/phat-hang/xuat.ro-ri.test.ts`: `canMoi` qua `dongSangCan` → `xuatBang` cho 5 × 2 × cấu hình,
  `timRoRi` trên mọi đầu ra; quét nguồn tệp hộp thoại.
- Verify: `npm run typecheck && npm run lint && npm test -w @quy-hang/web && npm run test:ro-ri`.
- Phục vụ: E1, E4, E7, E8b, E10.

### Task 5 — Chỗ thử và kiểm toàn kho · independent: false (sau Task 4)

- Files: `_acceptance/phat-hang/thu/{dung-h,chay-ui}.mjs` (máy dev 3494, Postgres 5574, người mẫu; chép từ hàng 38).
- Kịch bản cho E1b, E6b, E7b, E8c (đếm dòng `exports` trước, sau; số đo đọc từ bảng).
- Verify: `npm run typecheck && npm run lint && npm test && npm run build`, rồi hợp đồng sang `implemented` và lượt chấm S4.
