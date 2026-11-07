# Vá thước CI của hai hồ sơ đã ký theo bước triển khai mới

Ngày 07/11/2026 · hàng `va-thuoc-ci-ho-so-moi-truong-that` (T2) · dãy Q · Nối: Ngoài-3 của hàng `va-deploy-csdl-tam`
(PR #176), hồ sơ đã ký `moi-truong-that`, `bat-rang-buoc-ban-ma`.

## Vì sao

PR #176 bỏ bộ kiểm cách ly khỏi job `deploy` (bản thật chỉ `db:migrate` rồi kiểm nhanh chỉ đọc). Ba thước đã ký còn đo
bước cũ:

| Thước | Hồ sơ | Đang đòi | Hệ quả |
|---|---|---|---|
| `_acceptance/moi-truong-that/thu/kiem-ci.mjs` (E7, executor `kiem_ci`) | moi-truong-that | `needs: [check, isolation, secrets, gate]` đúng nguyên chuỗi; thứ tự migrate → test:isolation → hook | HỎNG hai vế từ khi `ro-ri` vào needs và từ PR #176 |
| `moi-truong-that/E3` (executor `cach_ly_that`) | moi-truong-that | chạy bộ cách ly với DATABASE_URL bản thật | chính việc PR #176 cấm |
| `bat-rang-buoc-ban-ma/E4` (executor `kiem_ci`) | bat-rang-buoc-ban-ma | expected «db:migrate trước test:isolation trước hook» | chữ kỳ vọng tả bước cũ |

## Thiết kế

1. `kiem-ci.mjs` của moi-truong-that đo bước mới: deploy chờ (ít nhất) check, isolation, secrets, gate; thứ tự
   `npm run db:migrate` → `npm run kiem-nhanh -w @quy-hang/db` → bước có `VERCEL_DEPLOY_HOOK`; không bước nào chạy
   `test:isolation`, `db:test`, `test:db`; giữ ba vế cũ còn đúng (chỉ push main, không trong ci-ok, vercel.json tắt tự
   deploy và ghim sin1). Đối chứng đỏ chạy trước trên bản sao sửa trong bộ nhớ, mỗi bản đỏ đúng tên vế.
2. `moi-truong-that/E3` khai `status: not-run` + `superseded_by: va-deploy-csdl-tam#AC-2` (bộ cách ly chạy trọn trên cơ
   sở dữ liệu tạm và vẫn chặn). `bat-rang-buoc-ban-ma/E4` khai `status: not-run` + `superseded_by:
   kiem-nhanh-rang-buoc-ban-ma#AC-1` (bảng sạch mà ràng buộc chưa bật thì deploy đỏ trước Vercel).
3. Hồ sơ thay nhận việc thay: thiết kế của `va-deploy-csdl-tam` ghi thẻ `moi-truong-that/E3`, thiết kế của
   `kiem-nhanh-rang-buoc-ban-ma` ghi thẻ `bat-rang-buoc-ban-ma/E4` (luật eval thay bởi, kit 2.24).
4. Vế AC-7 của moi-truong-that «chạy bộ kiểm cách ly trên cơ sở dữ liệu thật» không còn đúng; hợp đồng đã ký không sửa —
   ghi ở Notes của hồ sơ này rằng vế ấy thay bởi `va-deploy-csdl-tam#AC-1`, `#AC-3`. E7 vẫn chạy để giữ đo các vế còn đúng.

## Phạm vi

Không làm: sửa `_acceptance/config.yaml` (executor `cach_ly_that` còn tả bản thật — ô E3 không chạy nữa nên không ai gọi
nó); sửa hợp đồng đã ký; sửa ADR-0009, Tham chiếu (hàng adr-0009-csdl-tam); chú thích đầu bat-rang-buoc.test.mjs.
