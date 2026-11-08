# Vá khuôn xác nhận: UPI ở báo sai, quét rò rỉ đỏ được, quét cả lớp chuỗi — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mọi sự kiện hàm dựng nhận đều qua được khuôn; phép quét rò rỉ đỏ được khi hàm dựng làm rò; mọi chuỗi của khuôn và của hàm dựng chặn chữ tự do và dãy số dáng điện thoại.

**Architecture:** Hai hằng mới ở `dang-dong.ts` là nguồn duy nhất của luật dáng số điện thoại; hàm dựng kiểm dạng trước khi tra danh mục, khuôn dựng regex phủ định từ chính hằng ấy. Phép quét rò rỉ là một hàm nhận ba hàm dựng làm tham số, nên cùng hàm đó chạy trên mã thật và trên bản sao bị cấy lỗi ở thư mục tạm.

**Tech Stack:** TypeScript chặt, zod 3, `node:test` + tsx.

**Spec:** `docs/superpowers/specs/2026-11-08-va-khuon-xac-nhan-bao-sai-quet-ro-ri-design.md` · hợp đồng `_acceptance/va-khuon-xac-nhan-bao-sai-quet-ro-ri/contract.md` + `evals.yaml`.

## Global Constraints

- Không đổi hình khuôn v1: chỉ thêm giá trị bị từ chối; `catalog-confirmation.example.json` giữ nguyên từng byte (`.gitleaksignore` ghim theo dòng).
- Không chạm `catalog-feed.ts`, không migration, không màn hình.
- Không số điện thoại thật: mồi dùng `0900 000 0xx`.
- Tên ca kiểm đúng nguyên văn `evals.yaml`.
- Ma trận viết trước, số lần so đếm bằng biến và so với độ dài ma trận.
- Không ghi tệp nào trong cây khi chạy test; bản cấy ở `os.tmpdir()`.

## Review Focus

1. Số toàn chiều rộng (`０９００００００７１`) ở mã căn: `normalizeCode` NFKC đưa về số thường, phải bị chặn — ca ở Task 1.
2. Khoá toà không phải chuỗi (`123`, `null`): trả lỗi dạng, không ném — ca ở Task 1.
3. Khoá đúng dạng mà không có trong danh mục: vẫn là lỗi «không có trong danh mục», không bị nhập vào lỗi dạng — ca ở Task 1.
4. Đoạn số 12 chữ số trở lên ở khoá máy cấp: ngoài luật 9–11, phải qua (không từ chối oan ULID toàn số) — ca ở Task 2.
5. `upi: null` của thuộc tính căn: vẫn dựng được và qua khuôn — ca ở Task 2.

---

### Task 1: Luật dạng ở lõi và hàm dựng

Phục vụ E1, E6. `independent: false` (Task 2 nhập hằng của task này).

**Files:**
- Modify: `packages/core/src/confirmation/dang-dong.ts`, `packages/core/src/confirmation/dung.ts`
- Create: `packages/core/src/confirmation/quet-ca-lop.test.ts`

**Interfaces — Produces:**
- `MAU_DANG_SDT = /\+?\d(?:[.\-_/]?\d){8}/`
- `MAU_DOAN_SDT = /(?:^|[:_])\+?\d(?:[.\-_/]?\d){8,10}(?:[:_]|$)/`
- `laMaToa(s: unknown): s is string` (`MAU_MA_TOA` và không `MAU_DOAN_SDT`), `laUpi(s: unknown): s is string` (`MAU_UPI` và không `MAU_DOAN_SDT`)
- `MOI_SO_VA_CHU: readonly string[]` — tám mồi của E5/E6, trong `nen-thu.fixture.ts`, đúng thứ tự: `"gọi chủ nhà nhé"`, `"0900000071"`, `"090.000.0071"`, `"0900-000-071"`, `"090_000_0071"`, `"090/000/0071"`, `"0900 000 071"`, `"+84900000071"`.

- [ ] **Step 1: Viết ca đỏ** trong `quet-ca-lop.test.ts`:
  - `báo sai: UPI ngoài dạng bị từ chối` — ba UPI của E1 cấy vào căn A-01.01 của danh mục mẫu; `ok === false`, có lỗi `truong === "upi"`; đối chứng căn UPI đúng dạng `ok === true`; đếm bằng 3.
  - `quét cả lớp: hàm dựng chặn mồi ở mọi chuỗi đầu vào` — chín trường của E6 × `MOI_SO_VA_CHU`; đếm bằng 72; với `buildingKey`, `upi` mồi được cấy vào danh mục (UPI bọc `urn:onehub:upi:`) và `thongDiep` chứa «dạng», không chứa «không có trong danh mục»; đối chứng dương từng trường.
  - `mã căn: 8 số có dấu nối qua, 9 số bị chặn` — `12.34.56.78` qua, `12.34.56.789` chặn; đếm bằng 2.
  - Ba ca Review Focus 1–3.
- [ ] **Step 2: Chạy, xác nhận đỏ.** `npm test -w @quy-hang/core` → đỏ ở các ca trên.
- [ ] **Step 3: Viết hằng và hai hàm** ở `dang-dong.ts`; `chuanHoaMaCan` thêm `!MAU_DANG_SDT.test(n)`.
- [ ] **Step 4: Sửa hàm dựng.** `kiemChung`: `!laMaToa(buildingKey)` → lỗi `buildingKey` «Khoá toà sai dạng.», còn lại mới `timToa`. `dungBaoSai`, `dungThuocTinhCan`: `!laUpi(upi)` → lỗi `upi` «UPI ngoài dạng khuôn.» trước bước tra; thuộc tính căn vẫn cho `upi: null`.
- [ ] **Step 5: Chạy, xác nhận xanh.** `npm test -w @quy-hang/core` → ba tên ca «ok».
- [ ] **Step 6: Phá thử** (hai chiều trên cùng nền, hoàn lại bằng `git checkout -p` hoặc sửa tay):
  - Gỡ `laUpi` ở `dungBaoSai` → ca E1 đỏ, thông điệp nêu UPI đầu ma trận.
  - Gỡ `MAU_DOAN_SDT` khỏi `laUpi` → ca E6 đỏ, thông điệp nêu `upi` và mồi.
- [ ] **Step 7: Commit** `fix(confirmation): hàm dựng kiểm dạng UPI, khoá toà và dáng số điện thoại trước khi tra danh mục`.

### Task 2: Khuôn dùng chung luật dạng; quét cả lớp chuỗi

Phục vụ E2, E5, E7. `independent: false` (cần Task 1).

**Files:**
- Modify: `packages/connect/src/catalog-confirmation.ts`, `packages/connect/src/catalog-confirmation.test.ts`

**Interfaces — Consumes:** `MAU_DANG_SDT`, `MAU_DOAN_SDT`, `MOI_SO_VA_CHU` của Task 1.

- [ ] **Step 1: Viết ca đỏ:**
  - `quét cả lớp: mọi nút chuỗi chặn mồi` — `quetNutChuoi(schema, giaTriDung)` đi cây bằng `diCay`, mỗi `ZodString` chạy tám mồi (nút có `MAU_UPI` bọc `urn:onehub:upi:`) và một giá trị đúng dạng, trả `{ nut, lot: string[], tuChoiOan: string[] }`; số nút bằng 19; đếm bằng `19 × 8`; `lot` và `tuChoiOan` rỗng; đối chứng âm `z.object({ a: z.string().regex(/^.*$/) })` gọi tên đường `a`.
  - `mọi sự kiện hàm dựng nhận đều qua khuôn` — ma trận danh mục lạ của E2 × ba hàm dựng; mỗi `ok: true` qua `parseCatalogConfirmation`; đếm chạy bằng độ dài ma trận × 3; đếm `ok: true` lớn hơn 0.
  - `khoá dạng thật không bị từ chối oan` — ba khoá của E7, và mọi căn của `danhMuc` trong bộ mẫu dựng được thuộc tính căn rồi qua khuôn, biến đếm bằng tổng số căn đếm từ tệp.
  - `khoá máy cấp: đoạn số điện thoại bị chặn` — hai khoá chặn, `x0900000071` qua; đếm bằng 3.
  - Hai ca Review Focus 4–5.
- [ ] **Step 2: Chạy, xác nhận đỏ.** `npm test -w @quy-hang/connect`.
- [ ] **Step 3: Sửa khuôn.** `const khongKhop = (m: RegExp) => new RegExp(\`^(?!.*(?:${m.source}))\`)`; `MaCan` thêm `.regex(khongKhop(MAU_DANG_SDT), …)`; `MaToa`, `Upi` thêm `.regex(khongKhop(MAU_DOAN_SDT), …)`.
- [ ] **Step 4: Chạy, xác nhận xanh** và tệp ví dụ không đổi: `npm test -w @quy-hang/connect && git diff --exit-code packages/connect/src/catalog-confirmation.example.json`.
- [ ] **Step 5: Phá thử:**
  - Bỏ regex phủ định ở `MaCan` → ca E5 đỏ nêu đường `unitNumber`, mồi `090.000.0071`.
  - Áp `MAU_DANG_SDT` cho `MaToa` → ca E7 đỏ nêu khoá thứ hai.
  - Gỡ `laUpi` ở `dungBaoSai` → ca E2 đỏ nêu UPI và đường lỗi `upi`.
- [ ] **Step 6: Commit** `fix(connect): khuôn xác nhận chặn dáng số điện thoại theo nguồn chuỗi; quét cả lớp đo hành vi`.

### Task 3: Phép quét rò rỉ đỏ được

Phục vụ E3, E4. `independent: false` (chạy tuần tự sau Task 2; chỉ một task không phụ thuộc nên không tách luồng).

**Files:**
- Create: `packages/core/src/confirmation/quet-ro-ri.fixture.ts`, `packages/core/src/confirmation/quet-ro-ri.test.ts`
- Modify: `packages/core/src/confirmation/dung.test.ts` (dời `moiNgoaiDanhMuc` sang fixture)

**Interfaces — Produces** (`quet-ro-ri.fixture.ts`):
- `KHOA_MOI: readonly KhoaCanNoiBo[]` — ghim 22 khoá: `standardStatus, listPrice, feeInclusion, furnished, legalStatus, financing, occupantType, lastConfirmedAt, companyName, senderName, photos, closePrice, closeDate, withdrawnReason, holderUserId, holderName, customFields, ownerName, ownerPhone, floorPrice, titleDeedPhoto, contacts`.
- `moiNgoaiDanhMuc(): GiaTriMoi[]`
- `type BaHam = { dungKhungToa; dungThuocTinhCan; dungBaoSai }`
- `quetRoRi(h: BaHam): { duong: "danh-muc" | "dau-vao"; loai: LoaiSuKien; truong: string }[]` — đường danh mục: gắn mọi khoá mồi lên mọi căn và toà, dựng được thì `timRoRi` trên JSON, không dựng được là một dòng `(không dựng được)`; đường đầu vào: mỗi khoá mồi thêm vào đầu vào, `ok: true` hoặc lỗi không nêu khoá ấy là một dòng tên khoá.
- `CAY: readonly { ten: string; thay: [neo: string, moi: string][]; mongDoi: string }[]` — bảy phép cấy.

Bảy phép cấy (neo đúng văn bản `dung.ts`; `thuTu(<loại>, suKien)` thay bằng `suKien` ở sáu phép đầu):

| # | Đường × hàm | Cấy | Tên mong đợi |
|---|---|---|---|
| 1 | danh mục × khung toà | trải `...toa` (lấy thêm `toa` từ `kiemChung`) | `floorPrice` |
| 2 | danh mục × thuộc tính căn | trải `...toa` | `floorPrice` |
| 3 | danh mục × báo sai | trải `...can` | `floorPrice` |
| 4–6 | đầu vào × ba hàm | trải `...dau`, `la` thành `[]` | `floorPrice` |
| 7 | danh mục × thuộc tính căn | gán `ownerPhone` của căn đầu toà vào `unitNumber` | `ownerPhone` |

- [ ] **Step 1: Viết ca đỏ** trong `quet-ro-ri.test.ts`:
  - `rò rỉ: mồi đi qua đường dựng` — đếm mồi có giá trị bằng `KHOA_MOI.length`; `quetRoRi` trên mã thật trả `[]`.
  - `rò rỉ: cấy lỗi vào bản sao hàm dựng thì phép quét đỏ` — `cay(nguon, phep)` ném `neo mất: <ten>` khi thiếu neo; mỗi phép: chép `dung.ts` sang `mkdtemp`, đổi đường nhập tương đối thành đường tuyệt đối `.ts` (không có tệp thì ném), nạp bằng `import(pathToFileURL(...))`, `quetRoRi(banCay)` có `mongDoi`; đếm bằng 7; bản sao không cấy trả `[]`; `git status --porcelain` trước và sau bằng nhau; `assert.throws(() => cay(nguon, phepNeoSai), /neo mất/)`.
- [ ] **Step 2: Chạy, xác nhận đỏ.** `npm test -w @quy-hang/core`.
- [ ] **Step 3: Viết fixture**, dời `moiNgoaiDanhMuc`, ca cũ của `dung.test.ts` giữ nguyên hành vi.
- [ ] **Step 4: Chạy, xác nhận xanh.** Hai tên ca «ok».
- [ ] **Step 5: Phá thử:** đổi tên một neo trong `CAY` → ca đỏ nêu «neo mất» và tên phép.
- [ ] **Step 6: Commit** `test(confirmation): phép quét rò rỉ đi qua đường dựng, đỏ được trên bản cấy lỗi`.

### Task 4: Kiểm toàn kho, ghi điều đang đúng

Không eval riêng; giữ lưới hồi quy. `independent: false`.

**Files:**
- Modify: `docs/adr/0027-*.md` (thêm mục sửa đổi ngày 09/11: hai luật theo nguồn chuỗi), `docs/product/tham-chieu.md` §12 (một dòng sổ quyết định: căn UPI lạ không báo sai được, Invest sửa nguồn).

- [ ] **Step 1:** Viết hai đoạn tài liệu.
- [ ] **Step 2:** `npm run typecheck && npm run lint && npm test` → không đỏ.
- [ ] **Step 3:** `npx gitleaks protect --staged` sạch sau khi `git add`.
- [ ] **Step 4: Commit** `docs: ghi luật khoá máy cấp và căn UPI lạ vào ADR-0027, Tham chiếu`.
