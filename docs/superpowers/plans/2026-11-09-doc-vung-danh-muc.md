# Đọc vùng danh mục dùng chung — kế hoạch thi công

> Thực thi tuần tự trong phiên (làn T2, feature-loop S3).

**Goal:** bốn nơi đọc danh mục lấy dữ liệu từ vùng dùng chung qua một nguồn duy nhất; vùng rỗng dùng gói mẫu.

**Architecture:** `packages/api/src/catalog/nguon.ts` giữ một bản đã dựng theo dấu phiên bản đọc từ hai bảng. `createApi` tạo một nguồn, bốn
đường đọc dùng chung. Tham số danh mục cố định của bài kiểm giữ nguyên.

**Tech Stack:** Hono, pg, node:test.

**Spec:** `docs/superpowers/specs/2026-11-09-doc-vung-danh-muc-design.md`

## Global Constraints

- Không migration, không sửa `packages/db/**`.
- Khuôn trả của các đường giữ nguyên; thêm duy nhất 500 `catalog-unavailable`.
- Lỗi đọc không bao giờ trả gói mẫu; bản giữ chỉ là bản thật.
- `SAMPLE_CATALOG` chỉ còn ở `catalog/sample.ts`, `catalog/nguon.ts`.

## Review Focus

- Hai lần nạp chồng nhau, lần bắt đầu trước xong sau: `max(updated_at)` không đổi. Dấu thêm tổng mốc thời gian; ca kiểm trong `nguon.test.ts`.
- Vùng rỗng đang dùng gói mẫu rồi đọc lỗi: phải lỗi, không trả mẫu. Ca kiểm trong `nguon.test.ts`.
- Vùng từng có bản thật, sau đó rỗng (xoá bằng quyền chủ bảng): không còn giữ bản cũ. Ca kiểm trong `nguon.test.ts`.
- `living_area` kiểu numeric ra chuỗi: phải là số trong thân trả. Ca E1 so số.
- Bài nhìn màn nạp gói trên cùng cơ sở dữ liệu với bộ kiểm chạy song song: tắt gói mẫu giữa chừng. `nap-goi-thu.mjs` chép cơ sở dữ liệu riêng cho máy dev.

---

### Task 1: Nguồn danh mục

**Files:** Create `packages/api/src/catalog/nguon.ts`, `packages/api/src/catalog/nguon.test.ts`. **independent: false.** Phục vụ E5, E9.

**Produces:** `BanDanhMuc { catalog, index }`, `NguonDanhMuc { doc(): Promise<BanDanhMuc>; soLanDung(): number }`, `BoDocVung`, `taoNguon(bo)`,
`taoNguonDanhMuc(pool)`, `nguonCoDinh(catalog)`, `nguonCua(deps, catalog?)`, `tenToa(catalog)`, `LOI_DOC_DANH_MUC`.

- [ ] Viết ca đỏ: rỗng ra mẫu; có khu thì mã mẫu `not_in_catalog`; lỗi có bản giữ; lỗi không bản giữ ném; rỗng rồi lỗi ném; dấu không đổi không dựng lại; bản giữ bị bỏ khi vùng rỗng; route thật với nguồn ném trả 500.
- [ ] `npm test -w @quy-hang/api` đỏ vì chưa có tệp; viết nguồn; xanh.

### Task 2: Nối bốn nơi đọc

**Files:** Modify `catalog/routes.ts`, `catalog/doc-ca-danh-muc.ts`, `imports/routes.ts`, `leads/routes.ts`, `app.ts`. **independent: false.** Phục vụ E1–E6, E7.

- [ ] `createApi` tạo một nguồn và đặt vào `deps.nguonDanhMuc`.
- [ ] Bốn đường nhận `nguonCua(deps, catalog)`; đọc trước khi mở giao dịch; lỗi trả 500 `catalog-unavailable`.
- [ ] `npm run typecheck && npm test -w @quy-hang/api` xanh.

### Task 3: Bài kiểm trên Postgres và tệp kiểm

**Files:** Create `packages/api/test-db/catalog/doc-vung.test.ts`, `_acceptance/doc-vung-danh-muc/thu/kiem-mot-cho-goi-mau.mjs`, `_acceptance/doc-vung-danh-muc/thu/nap-goi-thu.mjs`. **independent: false.** Phục vụ E1–E8, E10.

- [ ] Viết các ca theo `evals.yaml`, chạy `npm run test:db -w @quy-hang/api` trên Postgres dãy D.
- [ ] Phép quét E7 có chiều đỏ; chạy cả hai chiều.
- [ ] `nap-goi-thu.mjs` chép cơ sở dữ liệu riêng, khởi động lại máy dev, nạp qua cửa nhận thật, tạo căn Đang bán.
