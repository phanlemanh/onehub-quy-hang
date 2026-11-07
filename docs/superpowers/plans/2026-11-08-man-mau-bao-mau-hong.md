# Màn Mẫu báo mẫu hỏng — kế hoạch thi công

> Thực thi: tại phiên (native), tuần tự — ba task cùng một thư mục màn.

**Goal:** Tab Mẫu bảng hàng và Mẫu bài hiện khối báo chỗ hỏng của mẫu đã lưu, nói trước lần lưu kế sẽ bỏ chúng.

**Architecture:** `page.tsx` giữ `errors` của hai đáp GET qua `trangThaiTuDap`; `loiMauHong` đổi dòng lỗi lõi thành câu
cho người; `BaoHong` (TrangThai notice) đứng đầu hai tab. API, lõi không đổi (Hỏi-2).

**Spec:** `docs/superpowers/specs/2026-11-07-man-mau-bao-mau-hong-design.md` · `_acceptance/man-mau-bao-mau-hong/contract.md`.

## Global Constraints
- Không câu nào mang khoá kỹ thuật; cột nêu bằng nhãn `COT_BANG_HANG`.
- Khối qua `TrangThai kind="notice"` (khuôn `trang-thai`).

## Review Focus
- Dạng lỗi lõi mới chưa có câu → E3 đếm `loi.push(` trong mã nguồn lõi.
- Thân PUT mẫu bài khi có kênh lạ — E5c.

### Task 1: Hàm thuần (E1–E5b) — `settings/templates/mau-san.ts`
- `loiMauHong(errors: readonly string[]): string[]`, `trangThaiTuDap<T>(dap: { ok: boolean; body: unknown } | null): TrangThaiMauSan<T>`,
  `TrangThaiMauSan` thêm `baoHong?: string[]`; chữ trong `CHU_MAU`.
- Bài `bao-hong.test.ts` (E1–E5b, E6b), fixture lỗi sinh bằng `docMauBang`/`docMauBai`.

### Task 2: Màn (E1, E2, E4, E6, E6c) — `bao-hong.tsx`, `vung-mau-bang.tsx`, `vung-mau-bai.tsx`, `page.tsx`, `mau-san.ro-ri.test.ts`.

### Task 3: DB và lượt nhìn (E5, E5c, E7) — `packages/api/test-db/man-mau-bao-mau-hong/bao-hong.test.ts`,
`_acceptance/man-mau-bao-mau-hong/thu/nap-mau-hong.mjs`; Tham chiếu §12 một dòng; `/verify`.
