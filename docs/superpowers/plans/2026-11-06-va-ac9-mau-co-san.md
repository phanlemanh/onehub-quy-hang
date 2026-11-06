# Kế hoạch: va-ac9-mau-co-san — AC-9 chỉ đếm dòng do chính bài nạp

Hợp đồng: `_acceptance/va-ac9-mau-co-san/contract.md` (T3, duyệt 06/11). Thiết kế: `_acceptance/va-ac9-mau-co-san/design.md`.
Một tệp mã: `packages/db/tests/du-lieu-mau-thap-tang.test.mjs`. Hai task chạy tuần tự (task 2 đo kết quả task 1).

## Task 1 — Hai phép đếm theo tập mốc trong ca AC-9

- **Files:** `packages/db/tests/du-lieu-mau-thap-tang.test.mjs`
- **Làm:**
  1. Thêm `async function mocMau(c)`: trả `{ san: Set<id>, nguoi: Set<id> }` các sàn tên `[Mẫu] Sàn%` và người miền mẫu
     đang có — gọi ngay sau `const s0 = await anhChup(c)` của AC-9, lưu vào `goc`.
  2. Thêm `async function dongMauMoi(c, goc)` (thay vai của `conDongMau` trong AC-9): đếm sàn `[Mẫu] Sàn%` và người miền
     mẫu mà mã không có trong `goc`.
  3. Thêm `async function sanMauMoi(c, goc)`: đếm sàn tên `[Mẫu] Sàn thử%` mà mã không có trong `goc`.
  4. Trong AC-9: hai chỗ `assert.equal(await conDongMau(c), 0, …)` → `dongMauMoi(c, goc)`; phá thử «xoá thiếu» dựng `loi`
     từ `dongMauMoi`; phá thử «nạp sàn thứ hai» dựng `loi` từ `sanMauMoi`. Giữ nguyên hai lời khẳng định
     `coLoi(loi, "còn dòng mẫu sau xoá")` và `coLoi(loi, "hai sàn mẫu")`.
  5. `conDongMau` còn dùng chỗ nào khác thì để nguyên; không còn chỗ nào thì gỡ.
- **Verify:** `node _acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs --ca sach --ca san-khac --ca san-thu-trung` xanh; eslint tệp.
- **Phục vụ:** E1, E2, E3, E4. `independent: false`.

## Task 2 — Chạy đủ bộ đo và phép phá tại máy

- **Files:** không đổi tệp (chỉ chạy).
- **Làm:** chạy E1–E5 đúng lệnh trong `evals.yaml` trên Postgres dãy D (5575): `--ca san-khac --ca san-thu-trung --ca
  deploy-san-khac`, `--ca san-khac`, `--ca pha-dem --ca pha-hai-san`, `--ca sach --ca cach-ly`, `--doi-chung-do 1d682ade…`.
  Phép phá E3 là lượt phá-thử của task 1 (đòi đỏ đúng thông điệp ghim).
- **Verify:** cả năm lệnh thoát 0; `npm run typecheck && npm run lint` xanh.
- **Phục vụ:** E1–E5. `independent: false`.

## Không làm trong kế hoạch này

Không sửa `CAU_XOA`, `xoaMau`, bộ nạp, `ci.yml`; không chạm cơ sở dữ liệu bản thật; không dọn cơ sở dữ liệu tạm ngoài
những cái bài đo tự tạo.
