# Kế hoạch thi công — so-diem-bien-thien (hàng 81)

Hợp đồng: `_acceptance/so-diem-bien-thien/contract.md` (duyệt 04/11, Hỏi-1 theo khuyến nghị). Thiết kế:
`docs/superpowers/specs/2026-11-04-so-diem-bien-thien-design.md`. T2 — không Gate 1.5. Mọi task chạm cùng gói lõi và
nối tiếp nhau (task sau nhập vật của task trước) → `independent: false`, làm tuần tự trong vòng chính.

## Task 1 — Sổ ở mã, khuôn, bộ kiểm sổ (phục vụ E1, E3, E4)

- Files: `packages/core/src/config/{so.ts, khuon.ts, index.ts, so.test.ts, khuon.test.ts}`, `packages/core/package.json`
  (`zod`, export `./config`), `package-lock.json`.
- `SO_DIEM`: 30 dòng phần A (#1–#27, #3a, #33, #36). `kiemSo(so)`, `kiemGiaTri(khoa, giaTri, cauHinh?)`, `timDiem(khoa)`.
- Verify: `npm test -w @quy-hang/core`, `npm run typecheck -w @quy-hang/core`; phá-thử: bản sao sổ khoá trùng / vai lạ /
  lớp `source` / mặc định ngoài khoảng → đúng một lỗi nêu khoá.
- independent: false

## Task 2 — Sổ tài liệu và bộ kiểm khớp (phục vụ E2, E3)

- Files: `docs/architecture/so-diem-bien-thien.md` (dòng #36 `queue.groups`; bốn ô Hỏi-1 ghi bằng số),
  `packages/core/src/config/{so-khop.ts, so-khop.test.ts}`.
- `docSoTaiLieu(md)`, `soKhop(md, so)`: so khoá hai chiều, `#`, kiểu, lớp, tình trạng, hiệu lực, vai, mặc định int, khoảng
  `a–b`.
- Verify: test lõi; phá-thử mười ca đỏ trên chữ tài liệu và bản sao sổ.
- independent: false (đọc `SO_DIEM` của task 1)

## Task 3 — Giải cấu hình (phục vụ E5)

- Files: `packages/core/src/config/{giai.ts, giai.test.ts}`.
- `CAU_HINH_MAC_DINH`, `giaiCauHinh(dong)` → `{ cauHinh, loi }`, `layGiaTri(cauHinh, khoa)`.
- Verify: test lõi; phá-thử dòng hỏng, khoá lạ.
- independent: false

## Task 4 — Luật nhận cấu hình, hằng số lấy từ sổ (phục vụ E6–E9, E9b–E9d)

- Files: `packages/core/src/listing/{freshness.ts, status.ts, san-sang.ts}`, `pricing/{hoi-lai.ts, ve-tay.ts}`,
  `routing/index.ts`, `today/mac-dinh.ts`, `redaction/ban-ra.ts`; tests `config/{luat-nhan-cau-hinh.test.ts,
  hang-so.ts, hang-so.test.ts}`.
- `freshness(..., cauHinh?)`, `canHoiLai(..., cauHinh?)`; routing lỗi mở đầu bằng khoá, giữ chữ cũ; mười hằng lấy số từ
  sổ; `soHangSo(so)` so hằng với sổ.
- Verify: `npm test -w @quy-hang/core`, `-w @quy-hang/api`, `-w @quy-hang/connect`, `npm run typecheck`; phá-thử: bản sao
  sổ đổi mặc định `price.change_confirm_pct` → `soHangSo` một lệch nêu hằng và khoá.
- independent: false
