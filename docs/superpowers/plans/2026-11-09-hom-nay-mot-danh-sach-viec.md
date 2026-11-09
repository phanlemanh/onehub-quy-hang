# Hôm nay là một danh sách việc — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/today` thành một danh sách việc cho mọi vai; phần theo dõi về Đội, Lead đã nhập, Đã gửi.

**Architecture:** Một hàm thuần `gopViec` gộp năm nguồn đọc đang có thành nhóm và dòng. Màn đầu chủ hiện tại nới thành màn của mọi vai, giữ lưới và thẻ điện thoại. Cột thứ hai đọc cùng số qua một kho nhỏ trên trình duyệt.

**Tech Stack:** Next.js, Hono API, `data-grid` ReUI, node --test.

**Spec:** `docs/superpowers/specs/2026-11-09-hom-nay-mot-danh-sach-viec-design.md`, hợp đồng `_acceptance/hom-nay-mot-danh-sach-viec/contract.md`.

## Global Constraints

- Không migration, không lối đọc API mới, không đổi luật nhóm căn hay luật chia.
- Dòng việc không mang trường lớp `source`, không số khách.
- Mốc tự hết của việc đầu khách: 48 giờ.
- Nhãn nút nhóm Thiếu thông tin: «Mở hồ sơ».
- Nhãn mặc định: Lead quá hạn · Chưa chia được · Lead bị trả lại · Khách phản ứng · Vừa đổi · Căn mới khớp.
- Mọi Frame, không Card; lint `quy-hang-ui` nợ 0.

## Review Focus

- Nguồn trả 200 nhưng thân hỏng: coi là lỗi của nguồn, không phải rỗng (Task 3).
- Người có vai Trưởng nhóm mà không có vai Đầu chủ: không có căn, vẫn ra hai nhóm của mình (Task 2).
- Tin `new_match` có `at` lúc căn lên bảng, không phải lúc khách phản ứng: mốc 48 giờ tính từ `at` (Task 2).
- Hai nguồn lỗi cùng lúc: hai dòng báo, không phải một câu gộp (Task 2).
- `?nhom=` lạ hay của vai khác: «Tất cả việc» sáng, không có dòng báo (Task 7).

---

### Task 1: Nhóm của vai khác ở lõi

**Files:** Create `packages/core/src/today/nhom-vai.ts`, `packages/core/src/today/nhom-vai.test.ts` · Modify `packages/core/src/today/index.ts`, `packages/core/src/labels/index.ts` · phục vụ E8 · `independent: false`

**Produces:** `NHOM_VAI: readonly { code: MaNhomVai; label: string; vai: "team_lead"|"telesales"|"buyer_agent"; coHan: boolean }[]`, `MOC_VIEC_DAU_KHACH_GIO = 48`, `TAP_DONG.nhomViec`.

- [ ] Test: sáu mã đúng, nhãn đúng Global Constraints, mã không trùng bộ nhóm mặc định; `TAP_DONG.nhomViec` có đủ sáu neo.
- [ ] Viết `nhom-vai.ts`; thêm tập đóng vào `TAP_DONG` để màn Cách gọi đổi được tên.
- [ ] `npm test -w @quy-hang/core` xanh.

### Task 2: `gopViec`

**Files:** Create `apps/web/src/app/(app)/today/viec/gop-viec.ts`, `gop-viec.test.ts` · phục vụ E2, E4, E5, E9 · `independent: false`

**Produces:**

```ts
export type Nguon<T> = { trang: "dang" | "ok" | "loi"; ds: readonly T[] };
export type VaoGop = { vai: readonly string[]; bayGio: string; tv: TuVung | null;
  dauChu: NhomDauChu[]; hangDoi: Nguon<DongLeadTruongNhom>; leadCuaToi: Nguon<MyLeadView>; tin: Nguon<TinDauKhach> };
export type RaGop = { nhom: NhomViec[]; so: number; quaHan: number; loi: { nguon: MaNguon; chu: string }[] };
export function gopViec(v: VaoGop): RaGop;
```

- [ ] Test các ca: «gộp việc: năm nguồn, nhóm quá hạn trước», «gộp việc: số đầu màn bằng số dòng», «gộp việc: bộ nhóm sàn có nhóm không hạn đứng trước giữ thứ tự», «gộp việc: chỉ lead bị trả lại thành việc của telesales» (ma trận tám nấc), «gộp việc: tin đầu khách tự hết sau 48 giờ» (47:59, 48:01), «dòng đầu khách không có khoá lớp nguồn», «gộp việc: nguồn lỗi không thành rỗng», hai nguồn lỗi ra hai dòng, trưởng nhóm thuần.
- [ ] Viết hàm; nguồn `loi` đẩy một mục vào `loi`, không đẻ nhóm; thứ tự: nhóm có dòng quá hạn, rồi nhóm có hạn, rồi bộ đầu chủ giữ nguyên thứ tự, rồi còn lại.
- [ ] `npm test -w @quy-hang/web` xanh.

### Task 3: Đọc nguồn có thử lại

**Files:** Create `today/viec/doc-nguon.ts`, `doc-nguon.test.ts` · Modify `today/nguon.ts` · phục vụ E9 · `independent: false`

**Produces:** `docCoThuLai<T>(doc: () => Promise<T | null>, cho?: (ms: number) => Promise<void>): Promise<T | null>`.

- [ ] Test «đọc lại: 500 rồi 200 tự hồi», «đọc lại: 500 hai lần báo một dòng», thân hỏng là lỗi, «đọc lại: có mạng trở lại đọc đúng nguồn lỗi».
- [ ] Viết hàm: thử lại một lần sau 2000 ms.

### Task 4: Màn Hôm nay

**Files:** Rename `today/hom-nay-dau-chu.tsx` → `today/hom-nay.tsx` · Modify `today/page.tsx`, `today/khung.tsx`, `today/viec-dong.ts`, `today/mobile/danh-sach.tsx`, `today/mobile/hanh-dong.ts` · Create `today/viec/giao-lai.tsx`, `today/viec/sua-so.tsx` · Delete `today/buyer/vung.tsx` (dời ở Task 6) · phục vụ E1, E1b, E2b, E3, E4b, E5b, E9b, E10, E11 · `independent: false`

- [ ] `page.tsx`: một `<HomNay>`; bỏ `vungTheoVai`, vùng telesales, đầu khách; người chỉ Quản trị `redirect(settingsLanding)`.
- [ ] `KhungHomNay` nhận `dauMan`: đường dẫn «Quỹ hàng › Hôm nay», mô tả «N việc · M quá hạn».
- [ ] Mở rộng `Viec` thêm loại `doi` (lead hàng đợi), `tra-lai`, `tin`; bốn cột giữ tên, cột ba đổi thành «Chi tiết».
- [ ] Giao lại: `Popover` trên máy tính, `NganNoi` trên điện thoại, dùng chung `giaoLaiLead`.
- [ ] Sửa số: `NganNoi` với form của `FormSuaSo` hiện có, gọi `guiLai`.
- [ ] Dòng «Lead đã nhập (N)» dưới Frame, chỉ người có vai Telesales.
- [ ] Đổi `NHAN_VIEC["doi-gia-trang-thai"]` thành «Mở hồ sơ».
- [ ] Bộ test của màn đầu chủ giữ xanh, chỉnh chỗ đổi nhãn.

### Task 5: Nhà Đội

**Files:** Modify `app/(app)/team/page.tsx` · Rename `today/truong-nhom.tsx` → `team/dashboard.tsx`, `today/truong-nhom-trang-thai.ts` → `team/trang-thai.ts` · Modify `components/khoi/dashboard-6/coverage-dashboard.tsx` (bỏ `main`, `h1`, đường dẫn, `max-w-7xl`) · phục vụ E6 · `independent: false`

- [ ] Dựng `BoCuc kieu="bang-dieu-khien"` kèm `DauMan` «Đội › Tổng quan»; bỏ hàng đợi khỏi khối, giữ ba ô số và bảng theo đầu chủ.
- [ ] Vai không có nhà Đội: `notFound()`.

### Task 6: Tin của khách

**Files:** Create `app/(app)/shares/tin/page.tsx`, `shares/tin/khung.tsx` · Move `today/buyer/{vung,dong-tin,dau-khach,khung}` → `shares/tin/` · Modify `components/shell/second-column.tsx` · phục vụ E7 · `independent: false`

- [ ] Trang bố cục `dong-tin`, đường dẫn «Đã gửi › Tin của khách»; thêm mục vào cột thứ hai của Đã gửi.

### Task 7: Cột thứ hai

**Files:** Create `today/viec/kho-so.ts`, `kho-so.test.ts` · Modify `components/shell/second-column.tsx`, `today/mo-nhom.ts` · phục vụ E8, E8b · `independent: false`

**Produces:** `datSoViec(s: SoViec)`, `useSoViec(): SoViec | null`, `mucCotHomNay(roles, soViec, boMacDinh)`.

- [ ] Test «cột hai: nhóm theo vai, nhãn theo sàn, số theo nhóm, một mục sáng» (sáu tổ hợp vai); `?nhom=la` về «Tất cả việc»; nguồn lỗi không có số.
- [ ] Mục đầu «Tất cả việc» `href="/today"`, sáng khi không có `?nhom=` hợp lệ.
- [ ] `HomNay` gọi `datSoViec` sau mỗi lần gộp.

### Task 8: Khuôn và tài liệu

**Files:** Modify `design/patterns/hom-nay-*.md`, `design/patterns/lead-cua-toi.md`, `docs/design/vo-va-ia.md`, `docs/product/tham-chieu.md`, `docs/architecture/so-diem-bien-thien.md`, `CONTEXT.md` · Delete `app/(app)/proto/hom-nay-mot-danh-sach-viec/` · phục vụ E8, E11 · `independent: false`

- [ ] Gỡ `ngoai_le` của `/today`; dời khuôn trưởng nhóm sang `/team`, đầu khách sang `/shares/tin`.
- [ ] Ghi điều khoá K33 (ẩn, thứ tự nhóm của vai khác; mốc 48 giờ); thêm ca «sổ điểm biến thiên có dòng điều khoá của nhóm và mốc 48 giờ».
- [ ] Tham chiếu §9, §10, §12; `npm run typecheck && npm run lint && npm test -w @quy-hang/web` xanh.
