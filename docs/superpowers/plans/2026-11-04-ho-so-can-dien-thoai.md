# Hồ sơ căn của Đầu khách trên điện thoại — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Đầu khách mở đúng hồ sơ căn đang có; phần chỉ người giữ căn vắng, thay bằng nút «Hỏi đầu chủ» mở bảng chia sẻ
của máy.

**Architecture:** Một hàm thuần ở lõi (`lopPhuHoSo`) trả bốn cờ hiển thị từ luật quyền; màn đọc cờ, không rẽ theo tên vai.
Tin hỏi dựng ở lõi (`tinHoiDauChu`), không chở lớp `source`. API `GET /listings/{id}/owner` thêm `listingAgentName` ở nhánh
`visible: false` (tên từ `identity.user` qua `identityPool`). Hồ sơ toàn màn dựng qua `<BoCuc kieu="ho-so">`.

**Tech Stack:** TypeScript, Next.js, Hono + zod-openapi, `node:test`, Postgres (test:db).

**Spec:** `docs/superpowers/specs/2026-11-03-ho-so-can-dien-thoai-design.md` · hợp đồng `_acceptance/ho-so-can-dien-thoai/`
(duyệt 04/11, nhận bốn khuyến nghị: share sheet · nhãn «Hỏi đầu chủ» · lớp phủ trên màn đang có · bỏ thẻ Nội bộ cho mọi người
không giữ căn).

## Global Constraints

- Nhãn nút: `Hỏi đầu chủ`; căn chưa ai giữ: `Căn chưa có đầu chủ giữ`; không có bảng chia sẻ: toast `Đã chép tin hỏi`.
- Tin: `Hỏi về căn <mã> · <toà>` + đường `/inventory?unit=<mã>&toa=<toà>` tuyệt đối theo `location.origin`.
- Người luôn là người bấm gửi: chỉ `navigator.share` / clipboard, không POST nào khi chạm.
- Không khoá lớp `source`, email hay số đầu chủ trong thân trả về của người không thấy nguồn.

## Review Focus

1. Mất mạng: tên đầu chủ không tải được → nút «Hỏi đầu chủ» không tên vẫn mở chia sẻ (test web: `nhanNutHoi(null)`).
2. Người huỷ bảng chia sẻ (`AbortError`) → không toast lỗi, không chép (test web: `moHoi` nuốt AbortError).
3. Quản trị sàn không vai khác → cờ như Đầu khách (ô của ma trận E1).
4. Căn chưa ai giữ với Đầu chủ → nút hỏi mờ, Sẵn sàng bán còn (ô ma trận).
5. Cột phải Bảng hàng trên máy tính (Đầu khách) → cùng cờ, nút trong đầu hồ sơ (không dính đáy).

---

### Task 1: Lõi — lớp phủ và tin hỏi

**Files:** Create `packages/core/src/access/lop-phu-ho-so.ts`, test `packages/core/src/access/lop-phu-ho-so.test.ts`;
Modify `packages/core/src/access/index.ts`, `owner-view.ts` (kiểu nhánh false thêm `listingAgentName: string | null`).

**Interfaces — Produces:**
- `type CoHoSo = { noiBo: boolean; sanSang: boolean; suaAnh: boolean; hoiDauChu: boolean }`
- `lopPhuHoSo(viewer: Viewer, listingAgentUserId: string | null): CoHoSo` — thấy nguồn (`canSeeSource`) → noiBo, suaAnh,
  sanSang true, hoiDauChu false; không thấy → noiBo, suaAnh false, hoiDauChu true, sanSang chỉ khi căn chưa ai giữ và người
  có vai `listing_agent` (đầu chủ nhận căn như trước).
- `tinHoiDauChu(can: { unitNumber: string; buildingName: string }, goc: string): { text: string; url: string }`

- [ ] Ca «lớp phủ hồ sơ: ma trận người xem» (bảng 5 × 2, deepEqual bốn cờ, assert 10 ô) → đỏ → viết → xanh.
- [ ] Ca «tin hỏi đầu chủ: chữ và đường», «tin hỏi đầu chủ: không chở nguồn» (đối chứng dương) → đỏ → viết → xanh.
- [ ] Sửa `access.test.ts` ca visible false theo kiểu mới.

### Task 2: API — tên đầu chủ giữ căn

**Files:** Modify `packages/api/src/owners/store.ts` (getOwner trả `listingAgentName: null` để route điền),
`routes.ts` (schema + tra tên bằng `identityPool`), test `packages/api/test-db/owners.test.ts`.

- [ ] Ca «chủ nhà: người không thấy nguồn nhận tên đầu chủ», «chủ nhà: căn chưa ai giữ», «chủ nhà: người thấy nguồn như
  trước»; sửa ca cũ deepEqual thêm `listingAgentName`.
- [ ] Ca «đầu khách: kéo bảng hàng và hồ sơ không chở nguồn» (4 đường: danh sách hàng, lịch sử, ảnh, chủ nhà).

### Task 3: Web — cờ, nút hỏi, ảnh

**Files:** `apps/web/src/lib/sync/react.tsx` (Ctx thêm `vai`), Create `apps/web/src/app/(app)/units/ho-so/hoi-dau-chu.ts`
(+ `.test.ts`) và `nut-hoi-dau-chu.tsx`; Modify `cot-ho-so.tsx`, `photos/muc-anh.tsx` (noiBo «an» → không thẻ).

**Interfaces:** `NHAN_HOI = "Hỏi đầu chủ"`, `CHU_CHUA_GIU`, `cachMo(may: { share?, canShare?, clipboard? }): "chia-se" | "chep" | "khong"`,
`nhanNutHoi(ten: string | null): string`, `docTenDauChu(listingId) → Promise<string | null>`.

- [ ] Ca «hỏi đầu chủ: chọn cách mở», «hỏi đầu chủ: căn chưa ai giữ», «hỏi đầu chủ: nhãn».
- [ ] Hồ sơ đọc `lopPhuHoSo({userId, roles: vai}, can.listAgentKey)`: ẩn Sẵn sàng bán theo cờ; nút dính đáy dưới `md`, đầu
  hồ sơ từ `md`.

### Task 4: Bố cục Hồ sơ và tài liệu

**Files:** `units/ho-so/khung.tsx` (`<BoCuc kieu="ho-so">` cho toàn màn; biến thể `trongBang` cho điện thoại trong Bảng
hàng), `design/patterns/ho-so-can.md` (rời ba `ngoai_le_han`, câu lớp phủ), `docs/product/tham-chieu.md` (§4, §12, §13),
`CONTEXT.md` (dòng Liên hệ).

- [ ] `npm run lint` — quét khuôn 0 lệch, mức nợ 0.
- [ ] `/verify`, commit, đánh dấu `implemented`.
