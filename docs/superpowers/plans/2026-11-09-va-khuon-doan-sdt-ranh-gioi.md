# Khoá máy cấp: số điện thoại dính dấu tách — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Số điện thoại dính dấu tách trong khoá toà hay UPI bị cả hàm dựng và khuôn từ chối; khoá dạng thật của Invest vẫn qua.

**Architecture:** Một hằng `MAU_DOAN_SDT` ở `dang-dong.ts` đổi luật; hàm dựng và khuôn đã nhập từ đó. Hai tầng báo thông điệp riêng cho lỗi dáng số điện thoại để phép đo phân biệt được với lỗi hình khoá.

**Tech Stack:** TypeScript chặt, zod 3, `node:test` + tsx.

**Spec:** `docs/superpowers/specs/2026-11-09-va-khuon-doan-sdt-ranh-gioi-design.md` · hợp đồng `_acceptance/va-khuon-doan-sdt-ranh-gioi/contract.md` + `evals.yaml`.

## Global Constraints

- Không đổi hình khuôn v1; `catalog-confirmation.example.json` giữ nguyên.
- Không sửa dòng cũ của `catalog-confirmation.test.ts`: `.gitleaksignore` ghim theo số dòng. Ca mới ở tệp mới.
- Không số điện thoại thật: mồi dùng `0900 000 0xx`.
- Tên ca kiểm đúng nguyên văn `evals.yaml`. Ma trận viết trước, số lần so đếm bằng biến và so với độ dài ma trận.
- Không chạm `catalog-feed.ts`, không migration, không màn hình.

## Review Focus

1. Khoá không phải chuỗi (`123`, `null`) ở hàm dựng: lỗi dạng, không ném — đã có ca ở `quet-ca-lop.test.ts`, phải vẫn xanh.
2. Mồi cũ của phép quét cả lớp (`090/000/0071`, `0900 000 071`): vẫn bị chặn vì hình khoá sau khi bỏ `/` khỏi biểu thức — ca cũ, phải vẫn xanh.
3. `upi: null` của thuộc tính căn vẫn dựng được — ca cũ.
4. `bld_0900000071`, `urn:onehub:upi:0900000071` của hàng trước vẫn bị chặn — ca cũ.
5. Khoá đúng dạng không có trong danh mục vẫn báo «không có trong danh mục», không lẫn lỗi dạng — ca cũ.

---

### Task 1: Luật mới ở lõi và hàm dựng

Phục vụ E2. `independent: false` (Task 2 cần hằng và fixture của task này).

**Files:**
- Modify: `packages/core/src/confirmation/dang-dong.ts`, `packages/core/src/confirmation/dung.ts`, `packages/core/src/confirmation/nen-thu.fixture.ts`
- Create: `packages/core/src/confirmation/khoa-sdt.test.ts`

**Interfaces — Produces:**
- `MAU_DOAN_SDT = /(?<![A-Za-z0-9])\d(?:[.\-_:]*\d){8,10}(?![A-Za-z0-9])|(?<!\d)(?=\d+[.\-_:]+\d)\d(?:[.\-_:]*\d){8,10}(?!\d)/`
- `coDangSdt(s: unknown): boolean` ở `dang-dong.ts`
- Fixture: `DAU_NOI_SDT`, `DAU_NOI_DOI_CHUNG` (7 phần tử ghép cặp theo chỉ số, nguyên văn E1), `TRUOC_KHOA`, `SAU_KHOA` (5 phần tử mỗi cái), `maTranKhoa(dau: readonly string[]): string[]` (tích 175 khoá, thứ tự cố định), `bocUpi(k: string): string`, và `DUONG_DUNG_TOA`, `DUONG_DUNG_UPI`: `{ ten; dung(khoa, danhMuc): KetQua<unknown> }[]` gồm 3 và 2 đường, dùng `danhMucDoiKhoaToa`, `danhMucDoiUpi`.

- [ ] **Step 1: Viết ca đỏ** `khoá máy cấp: ma trận số điện thoại bị hàm dựng chặn` trong `khoa-sdt.test.ts`: 175 × 3 đường toà + 175 × 2 đường UPI, đếm chặn bằng 875, `ok === false`, có lỗi đúng `truong`, `thongDiep` chứa «dáng số điện thoại»; đối chứng cùng vị trí ở ma trận 8 chữ số `ok === true`, đếm bằng 875. Thông điệp lỗi nêu tên đường và khoá.
- [ ] **Step 2: Chạy, xác nhận đỏ.** `npm test -w @quy-hang/core`.
- [ ] **Step 3: Viết luật.** `MAU_DOAN_SDT` mới, `coDangSdt`. `kiemChung`: lỗi `buildingKey` là «Khoá toà sai dạng: có đoạn dáng số điện thoại.» khi `coDangSdt`, còn lại «Khoá toà sai dạng.». `dungThuocTinhCan`, `dungBaoSai`: lỗi `upi` tương ứng «UPI ngoài dạng khuôn: có đoạn dáng số điện thoại.».
- [ ] **Step 4: Chạy, xác nhận xanh.** `npm test -w @quy-hang/core` — ca mới «ok», các ca cũ không đỏ.
- [ ] **Step 5: Phá thử** rồi hoàn lại: gỡ `MAU_DOAN_SDT` khỏi `laMaToa` → ca đỏ nêu `buildingKey` và tên hàm; gỡ `laUpi` ở `dungThuocTinhCan` → ca đỏ nêu hàm ấy.
- [ ] **Step 6: Commit** `fix(confirmation): chặn số điện thoại dính dấu tách trong khoá máy cấp`.

### Task 2: Khuôn và năm phép đo còn lại

Phục vụ E1, E3, E4, E5, E6. `independent: false`.

**Files:**
- Modify: `packages/connect/src/catalog-confirmation.ts`
- Create: `packages/connect/src/catalog-confirmation.khoa.test.ts`

**Interfaces — Consumes:** fixture của Task 1.

- [ ] **Step 1: Viết ca đỏ** đúng tên và số lần so của E1, E3, E4, E5, E6. Danh sách bị từ chối gom đủ rồi so rỗng ở E3. Nút khuôn đo qua `parseCatalogConfirmation` trên sự kiện mẫu đổi đúng một khoá.
- [ ] **Step 2: Chạy, xác nhận đỏ.** `npm test -w @quy-hang/connect`.
- [ ] **Step 3: Sửa khuôn.** Thông điệp phủ định của `MaToa`, `Upi` chứa «dáng số điện thoại» (đã có, đối chiếu).
- [ ] **Step 4: Chạy, xác nhận xanh** và tệp ví dụ không đổi: `npm test -w @quy-hang/connect && git diff --exit-code packages/connect/src/catalog-confirmation.example.json`.
- [ ] **Step 5: Phá thử** rồi hoàn lại, mỗi chiều đỏ của E1, E3, E4, E5, E6 ghi trong `evals.yaml`: ranh giới chỉ `:` `_`; dấu lặp thành một dấu; bỏ vế sau, vế trước của nhánh đứng riêng; xét cả dãy; trần 12; bỏ nhánh có dấu tách. Mỗi phép đỏ đúng khoá nêu trong `expected`.
- [ ] **Step 6: Commit** `test(connect): ma trận khoá máy cấp ở khuôn và hai tầng`.

### Task 3: Kiểm toàn kho, ghi điều đang đúng

Không eval riêng. `independent: false`.

**Files:** Modify: `docs/adr/0027-khuon-xac-nhan-danh-muc.md` (mục sửa đổi 09/11: luật mới của khoá máy cấp), `docs/product/tham-chieu.md` §12 (một dòng).

- [ ] **Step 1:** Viết hai đoạn tài liệu.
- [ ] **Step 2:** `npm run typecheck && npm run lint && npm test` → không đỏ.
- [ ] **Step 3: Commit** `docs: ghi luật khoá máy cấp mới vào ADR-0027, Tham chiếu`.
