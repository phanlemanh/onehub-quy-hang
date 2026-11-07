# Kế hoạch: va-ac8-uuid-nham-so — AC-8 không bắt nhầm số trong UUID

Hợp đồng: `_acceptance/va-ac8-uuid-nham-so/contract.md` (T3, duyệt 07/11). Thiết kế: `_acceptance/va-ac8-uuid-nham-so/design.md`.
Một tệp mã: `packages/db/tests/du-lieu-mau-thap-tang.test.mjs`. Hai task tuần tự (task 2 đo kết quả task 1).

Bản sửa đã viết trong lúc dò nguyên nhân (commit b7b038c0, a6752042) và đã chạy thử xanh trước Cổng Phạm vi; task 1 soát
lại đúng phạm vi đã duyệt chứ không viết mới.

## Task 1 — Phép dò số gỡ đoạn được phép trước khi dò, và ca «AC-8 dò số»

- **Files:** `packages/db/tests/du-lieu-mau-thap-tang.test.mjs`
- **Làm:**
  1. Trong `quetSo`: chuyển vòng `for (const re of CHO_PHEP) con = con.replace(re, " ")` lên TRƯỚC vòng dò `UNG_VIEN_SO`.
     `UNG_VIEN_SO`, `SO_MAU`, `CHO_PHEP` giữ nguyên (không chặn hai bên).
  2. Thêm ma trận `DO_SO_SACH` (6 chuỗi) và `DO_SO_BAN` (6 chuỗi) đúng như hợp đồng AC-2, AC-3.
  3. Thêm ca `AC-8 dò số` (không cần cơ sở dữ liệu): khẳng định độ dài 6 + 6; mỗi chuỗi sạch `quetSo(...).loi` rỗng (thông
     điệp «nhận nhầm số trong «…»»); mỗi chuỗi bẩn có «số không đúng dạng mẫu» («bỏ sót số thật trong «…»»); đối chứng
     dương `quetSo("Gọi 0900 000 012").dem === 1`.
  4. Ca «AC-8 không dữ liệu thật» và hai phép phá thử của nó giữ nguyên.
- **Verify:** `node --test --test-name-pattern "AC-8 dò số" packages/db/tests/du-lieu-mau-thap-tang.test.mjs` xanh; eslint tệp.
- **Phục vụ:** E2, E3, E4, E5. `independent: false`.

## Task 2 — Chạy đủ bộ đo tại máy

- **Files:** không đổi tệp (chỉ chạy).
- **Làm:** chạy E1–E5 đúng lệnh trong `evals.yaml` trên Postgres dãy D (localhost:5575): `--lap 25`, `--tron` (E2, E3),
  `--doi-chung-do a4122e9e…`, `--bat-bien a4122e9e…`.
- **Verify:** cả bốn lệnh thoát 0; `npm run typecheck && npm run lint` xanh.
- **Phục vụ:** E1–E5. `independent: false`.

## Không làm trong kế hoạch này

Không sửa bộ dữ liệu mẫu (`packages/db/seed/**`), `SO_MAU`, `CHO_PHEP`, tệp kiểm khác, `ci.yml`; không chạm cơ sở dữ
liệu ngoài máy cục bộ; không dọn cơ sở dữ liệu tạm ngoài những cái bài đo tự tạo.
