# Vá Bảng hàng: đọc căn ngoài khu lỗi — kế hoạch

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Hàng nhỏ, một mạch, chạy trong phiên dãy X.

**Goal:** Đọc danh sách căn ngoài khu lỗi mà máy chưa có bản giữ thì Bảng hàng báo và có nút Thử lại.

**Architecture:** Theo đúng nếp đọc danh bạ: phần đọc thuần trả `xong` hoặc `loi`, hook trả thêm `loi` và `thuLai`, khối báo chung một chỗ với danh bạ.

**Tech Stack:** React, node:test, Chrome không đầu qua CDP.

**Spec:** `docs/superpowers/specs/2026-11-09-va-loi-doc-can-ngoai-khu-design.md`

## Global Constraints

- Câu báo đúng nguyên văn ở AC-1 và AC-5 của hợp đồng.
- Khối báo qua `TrangThai` lỗi có `hanhDong`, không khối mới.
- Không tự đọc lại theo nhịp.

## Review Focus

- Thân 200 không phải JSON hay phần tử sai khuôn: báo, không sập bảng (E1).
- Bản giữ chuỗi hỏng: báo, không ném lỗi (E3).
- Đang đọc lại: khối báo còn (E6 `giuaChung`).
- Tải lại khi có bản giữ và ngắt mạng: không báo, hàng đúng (E6 `taiLai`).
- Danh bạ và căn ngoài khu cùng lỗi: một khối (E5, E6 `ca2`).

---

### Task 1: Phần đọc và điều kiện báo

**Files:** Modify `apps/web/src/app/(app)/inventory/danh-muc.ts`; Test `apps/web/src/app/(app)/inventory/loi-doc-can-ngoai-khu.test.ts`. independent: false. Phục vụ E1–E5.

**Produces:** `docCanNgoaiKhu(goi: typeof fetch): Promise<KetQuaDocNgoaiKhu>` · `canBaoNgoaiKhu(loi, ds, hang): boolean` · `cauBaoLoiDoc(danhBaLoi, ngoaiKhuLoi): string | null` · `useCanNgoaiKhu(san): { ds, loi, thuLai }`.

- [x] Viết bài kiểm, chạy thấy đỏ vì thiếu hàm.
- [x] Dựng bốn hàm, `npm test -w @quy-hang/web` xanh.

### Task 2: Nối vào Bảng hàng

**Files:** Modify `apps/web/src/app/(app)/inventory/bang-hang.tsx`, `apps/web/src/app/(app)/units/ho-so/cot-ho-so.tsx`, `docs/product/tham-chieu.md`. independent: false. Phục vụ E6–E9.

- [x] Khối báo dùng `cauBaoLoiDoc`, nút đọc lại phần đang hỏng; cột hồ sơ lấy `.ds`.
- [x] Thêm dòng §12 của Tham chiếu.
- [x] `npm run typecheck`, eslint tệp vừa đổi xanh.

### Task 3: Kịch bản màn thật

**Files:** Create `_acceptance/va-loi-doc-can-ngoai-khu/thu/dung.mjs`, `thu/chay-ui.mjs`. independent: false. Phục vụ E6.

- [ ] Chạy trên chỗ thử dãy X, đối chiếu dòng JSON với `expected` của E6.
