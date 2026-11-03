# Bảng hàng dạng thẻ (hàng 32) — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (feature-loop S3 chạy tuần tự trong phiên chính).

**Goal:** Dưới `md`, `/inventory` trình bảng thẻ đọc từ kho trên máy: nhóm theo toà, lọc năm mục nhu cầu, giữ lâu để chọn
nhiều, chạm mở hồ sơ.

**Architecture:** Phần thuần trong `apps/web/src/app/(app)/inventory/cards/` (`the.ts`, `giu-lau.ts`, `anh-bia.ts`) kiểm
bằng `node:test`; ba tệp React chuyển thể `@reui/product-grid-4` (thẻ) và `@reui/filter-sidebar-5` (ngăn lọc qua
`NganNoi`); hai `page.tsx` của nhóm Bảng hàng trao bảng thẻ cho khe `dienThoai` của `KhungBangHang`.

**Tech Stack:** Next.js (app router), React, `@tanstack/react-virtual`, Base UI (base-nova), lucide, `node:test` + tsx.

**Spec:** `_acceptance/bang-hang-dang-the/design.md` · hợp đồng `_acceptance/bang-hang-dang-the/contract.md` · evals
`_acceptance/bang-hang-dang-the/evals.yaml`.

## Global Constraints

- Chỉ StandardStatus `Active`, `Pending` lên thẻ; chỉ `Active` chọn được (Tham chiếu §4).
- Năm mục lọc theo thứ tự: Giá (tỷ, từ–đến) · Phòng ngủ (nhiều, có «Chưa rõ») · Toà (nhiều) · Diện tích (m², từ–đến) ·
  Hướng (nhiều) — Hỏi-1 đã duyệt. Căn thiếu giá trị của mục đang lọc thì không khớp mục ấy.
- Giữ lâu 500 ms, dời > 10 px huỷ; nhả sau giữ lâu không là chạm.
- Chữ thẻ lọc: «2–5 tỷ», «Từ 6 tỷ», «Đến 5 tỷ», «2PN», «Toà A», «50–80 m²», «Từ 50 m²», «Đến 60 m²», «Đông Nam».
- Chữ màn: «Lọc», «Chọn», «Bỏ chọn», «n căn», «n căn đã chọn», «Xem n căn», «Xoá lọc», «Không căn nào khớp nhu cầu»,
  «Chưa có căn nào trên bảng hàng chung», «Chưa tải được bảng hàng», «Thử lại», huy hiệu «Đang giao dịch».
- Chạm thẻ: `moHang` của `units/ho-so/ho-so.ts` + `history.pushState`.
- Ảnh bìa: `anhRaNgoai` của `@quy-hang/core/photos`, url `/api/v1/units/photos/<id>/thumb`.
- Luật lint `quy-hang-ui`: không `<button>/<input>` trần, Drawer chỉ qua `NganNoi`, Skeleton chỉ qua `ChoTai`/`TrangThai`
  loading, màu qua token, `render` thay `asChild`. Tệp chuyển thể mang chú thích «chuyển thể … <khối>».
- Không đụng `packages/**`, `package-lock.json`; ngoài vùng `cards/**` chỉ các tệp của yêu cầu B-1 (đã duyệt).

## Review Focus

1. Mã căn trùng ở hai toà — nhóm và khoá React theo `id` hàng, không theo mã (`nhomTheoToa` giữ đủ hai thẻ).
2. Gõ giá kiểu «2.5», «2,5», « 3 » hay chữ — `docSo` nhận cả dấu chấm và phẩy, chữ khác số ra `null` (mục bỏ qua).
3. Lọc tới khi căn đang chọn bị ẩn — chọn vẫn giữ id, số «n căn đã chọn» không đổi khi lọc.
4. Kho đổi trong lúc đang chọn (căn chuyển Pending) — `doiChon` không thêm Pending; căn đã chọn rồi chuyển Pending bị bỏ
   khỏi tập khi dựng lại.
5. Màn xoay hay rộng qua `md` khi đang mở ngăn lọc — ngăn đóng, lưới máy tính hiện bình thường.

---

### Task 1: Lõi thuần của bảng thẻ (`the.ts`)

**Files:** Create `apps/web/src/app/(app)/inventory/cards/the.ts`, Test `…/cards/the.test.ts`.

**Interfaces — Produces:**
- `type NhuCau = { giaTu?: string; giaDen?: string; phongNgu: string[]; toa: string[]; dtTu?: string; dtDen?: string; huong: string[] }`; `NHU_CAU_RONG`.
- `lenThe(s: StandardStatus): boolean` · `chonDuoc(d: DongBang): boolean`.
- `docSo(s?: string): number | null`.
- `locNhuCau(dong: readonly DongBang[], nc: NhuCau, boQua?: Partial<Record<MucLoc, true>>): DongBang[]` — `boQua` là tham số thử cho đối chứng đỏ.
- `type NhomToa = { toa: string; dong: DongBang[] }` · `nhomTheoToa(dong): NhomToa[]` (toà theo lần gặp đầu, trong toà giữ thứ tự).
- `type DongDanhSach = { kind: "nhom"; toa: string; so: number } | { kind: "the"; d: DongBang }` · `phang(nhom: NhomToa[]): DongDanhSach[]`.
- `type TheLoc = { khoa: string; chu: string }` · `theLoc(nc): TheLoc[]` · `boTheLoc(nc, khoa): NhuCau`.
- `luaChonNhuCau(dong): { phongNgu: string[]; toa: string[]; huong: string[] }`.
- `doiChon(chon: ReadonlySet<string>, d: DongBang): Set<string>` · `batDauChon(d): Set<string> | null`.

- [ ] Viết `the.test.ts`: ca «căn lên thẻ», «nhóm theo toà», «chọn được», «lọc nhu cầu — ma trận năm mục» (10 assert, đáp án vòng for riêng; bốn assert rỗng; đổi chỗ từ/đến; «2,5»), «thẻ lọc» — dữ liệu: `packages/db/seed/mau/du-lieu-mau.json` (đường suy từ `import.meta.dirname`) ghép bằng `ghepDanhMuc`; đối chứng đỏ bằng `boQua: {huong: true}`, `lenThe` thêm Hold, `chonDuoc` cho Pending (bản thử trong tệp), `boTheLoc` bỏ cả mục.
- [ ] `npm test -w @quy-hang/web` → đỏ (chưa có module).
- [ ] Viết `the.ts`.
- [ ] `npm test -w @quy-hang/web` → xanh; phá thử một luật (vd bỏ lọc Hướng) → ca Hướng đỏ với thông điệp có «Hướng»; hoàn lại.
- [ ] Commit `feat(bang-the): lõi lọc nhu cầu, nhóm toà, chọn được`.

### Task 2: Máy giữ lâu (`giu-lau.ts`)

**Files:** Create `…/cards/giu-lau.ts`, Test `…/cards/giu-lau.test.ts`.

**Interfaces — Produces:** `type SuKien = { loai: "xuong" | "dich" | "len" | "cuon" | "huy"; t: number; x?: number; y?: number } | { loai: "dong-ho"; t: number }`; `type Ra = "cham" | "giu-lau" | "huy"`; `taoGiuLau(o?: { nguong?: number; dich?: number }): { buoc(e: SuKien): Ra[] }` (mặc định 500 ms, 10 px; «giu-lau» phát ở sự kiện đầu có `t - t0 ≥ nguong` — đồng hồ hay dịch/lên).

- [ ] Test sáu ca (a)–(f) của E4 + đối chứng `nguong: 300` làm (a) đỏ, thông điệp gọi tên ngưỡng.
- [ ] Đỏ → viết → xanh → commit `feat(bang-the): máy giữ lâu`.

### Task 3: Ảnh bìa (`anh-bia.ts`)

**Files:** Create `…/cards/anh-bia.ts`, Test `…/cards/anh-bia.test.ts`.

**Interfaces — Produces:** `taoNguonAnhBia(f?: typeof fetch, o?: { chon?: (ds: UnitPhoto[]) => UnitPhoto[] }): { anhBia(toa: string, ma: string | null): Promise<string | null> }` — `GET /api/v1/units/photos?toa=&ma=`, `chon` mặc định `anhRaNgoai`, nhớ theo `toa|ma` (cả kết quả null), lỗi hay `!ok` → null; `useAnhBia(toa, ma, gan: boolean): string | null` ở tệp React (Task 4).

- [ ] Test (a)–(g) của E5 với fetch giả đếm lời gọi, ảnh dựng theo `UnitPhoto`; đối chứng `chon: ds => ds` làm (c) đỏ gọi tên «Nội bộ».
- [ ] Đỏ → viết → xanh → commit `feat(bang-the): chọn ảnh bìa qua anhRaNgoai`.

### Task 4: Màn bảng thẻ (React) và nối vào Bảng hàng

**Files:** Create `…/cards/the-can.tsx` (chuyển thể `product-grid-4` ProductCard), `…/cards/ngan-loc.tsx` (chuyển thể `filter-sidebar-5`: `NganLoc` qua `NganNoi`, `HangTheLoc`), `…/cards/bang-the.tsx` (`BangTheDienThoai`, `useChonCan`); Modify `inventory/page.tsx`, `inventory/views/[id]/page.tsx` (khe `dienThoai={() => <BangTheDienThoai nguoi san />}`), chú thích `inventory/khung.tsx`, `units/ho-so/bang-co-ho-so.tsx`.

**Interfaces — Consumes:** Task 1–3; `useBoDongBo`, `useDanhMuc`, `chiMuc`, `ghepDanhMuc`, `moHang`, `docCot`, `HoSoDienThoai`, `NganNoi`, `TrangThai`, `ChoTai`. **Produces:** `BangTheDienThoai({ nguoi, san })`; `useChonCan(): { chon: ReadonlySet<string>; dangChon: boolean; … }` cho hàng 34.

- Thẻ: `data-the-can`, `select-none`, `[-webkit-touch-callout:none]`, `onContextMenu` preventDefault, ảnh `draggable={false}`, `role="button"`/`tabIndex=0` (Space/Enter: chạm hay tích), ô chọn `Checkbox` khi `dangChon` (disabled cho Pending), huy hiệu `Badge` `info-light` «Đang giao dịch».
- Danh sách: `useVirtualizer` trên vùng cuộn gần nhất của vỏ (`overflow-y:auto`), `scrollMargin` = offset danh sách; ước cao dòng nhóm 40, thẻ 128.
- Mở hồ sơ: lưu `scrollTop` trước `pushState`; bảng thẻ `hidden` khi `docCot` khác null; khi đóng thì trả `scrollTop`.
- Trạng thái: chưa kéo + chưa lỗi → khung chờ hình thẻ; `loiMang` và chưa kéo → lỗi + «Thử lại» (`bd.thuNgay`); không căn lên thẻ → trống; lọc rỗng → `TrangThai` tìm không ra + «Xoá lọc».
- [ ] Viết ba tệp, nối hai page, sửa hai chú thích.
- [ ] `npm run typecheck && npm run lint` xanh (mức nợ 0/0).
- [ ] Commit `feat(bang-the): bảng thẻ điện thoại trong khe của Bảng hàng`.

### Task 5: Tài liệu và danh mục

**Files:** Modify `design/patterns/bang-hang.md` (một câu «Dùng khi», không đụng khoá), `docs/design/vo-va-ia.md` (dòng 164 + đoạn «Đã chuyển thể (hàng 32)»), `.agents/skills/quy-hang-ui/catalog.md` (hai dòng khối, ảnh chuẩn `_acceptance/bang-hang-dang-the/evidence/E7-the.png`), `docs/product/tham-chieu.md` §12 (một dòng 03/11).

- [ ] Sửa bốn tệp; `npm run lint` (kiểm chuẩn danh mục) xanh — ảnh chuẩn chưa có thì tạm trỏ ảnh tự chụp ở Task 6 cùng đường.
- [ ] Commit `docs(bang-the): bản đồ khuôn, vo-va-ia, danh mục, Tham chiếu`.

### Task 6: Chỗ thử dãy B và tự xem

**Files:** Create `_acceptance/bang-hang-dang-the/thu/dung-b.mjs` (chép từ `bang-hang-kieu-sheet/thu/dung-b.mjs`: cổng 3492, Postgres 5572, container `quy-hang-db-dkn-B`; thêm ảnh Gửi được bìa cho một căn, ảnh chỉ Nội bộ cho một căn, một hàng chưa mã; in đáp án đếm bộ lọc «2–5 tỷ · 2PN · toà đầu» bằng vòng lặp riêng trên thân API; `--nhan`, `--tat`), `…/thu/phien.mts` (cookie phiên cho localhost:3492).

- [ ] Dựng, mở 375×812, tự xem bảng thẻ, ngăn lọc, giữ lâu, mở hồ sơ, sáng/tối; chụp `evidence/E7-the.png` làm ảnh chuẩn danh mục.
- [ ] Commit `test(bang-the): chỗ thử dãy B`.

### Task 7: Kiểm cuối S3

- [ ] `npm run typecheck && npm run lint && npm test -w @quy-hang/web` xanh; `design-floor-s3.mjs` của kit.
- [ ] Hợp đồng `status: implemented`, commit.
