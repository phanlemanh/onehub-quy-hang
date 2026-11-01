# Dữ liệu mẫu của sàn thử

Bộ dữ liệu giả để dựng và thử tính năng trước khi có người dùng thật (hàng 5, hồ sơ
`_acceptance/du-lieu-mau-san-thu/`). Mọi bản ghi mang nhãn mẫu: tên «[Mẫu] …», số `0900 000 0xx`, email
`…@mau.quy-hang.test`.

| Tệp trong `mau/` | Là gì |
| --- | --- |
| `du-lieu-mau.json` | Sàn thử, sáu người mẫu đủ năm vai, danh mục một dự án hai toà 180 căn (khuôn `CatalogFeed`), 30 chủ nhà, 40 hàng phủ sáu trạng thái, 12 lead có ca trùng |
| `mau-a.xlsx` | Bảng hàng kiểu «Sheet đầu chủ»: tiêu đề viết tắt, giá tỷ, `BP`/`KBP` |
| `mau-b.xlsx` | Bảng hàng kiểu file đầy đủ: tiêu đề đủ chữ, giá đồng, «Đã gồm phí»/«Chưa gồm phí», cột khác thứ tự |

## Lệnh

```bash
node packages/db/seed/sinh.mjs            # sinh lại ba tệp trong mau/ (cùng hạt giống ra cùng từng byte)
node packages/db/seed/sinh.mjs --kiem     # so tệp trong kho với đầu ra sinh lại; lệch thì thoát 1

# Chỉ trên Postgres của dãy hay của máy — kho chưa có môi trường thật. Vắng DATABASE_URL thì lấy từ .env.local ở gốc kho.
DATABASE_URL=postgres://postgres:quyhang@localhost:5544/postgres node packages/db/seed/nap.mjs --nap
DATABASE_URL=postgres://postgres:quyhang@localhost:5544/postgres node packages/db/seed/nap.mjs --xoa
```

`--nap` ghi vào bảng đã có: sàn «[Mẫu] Sàn thử», tài khoản, vai, khu Toà A và Toà B, khu phụ trách của hai đầu chủ.
Chạy lại không đổi gì. `--xoa` xoá tài khoản email miền mẫu và sàn tên đúng «[Mẫu] Sàn thử» — không câu xoá nào thiếu
một trong hai điều kiện ấy.

`nap.mjs` chỉ dựng phần nền. Hàng, chủ nhà, lead mẫu đi qua bộ nạp bản thật dưới đây.

## Bản thật (hàng 87)

`nap-ban-that.ts` nạp vào «[Mẫu] Sàn thử» thêm 40 hàng đủ sáu trạng thái, chủ nhà (số mã hoá bằng `OWNER_PHONE_KEY`),
đầu chủ phụ trách, 12 lead (kết quả trùng do luật kiểm trùng tính) và tài khoản chủ kho với đủ mọi vai. Hàng, chủ nhà,
lead đi qua hàm ghi của API dưới vai `quy_hang_app` — cả lần chạy một giao dịch. Danh mục 180 căn không ghi vào cơ sở dữ
liệu: đường tra phục vụ danh mục mẫu ở mọi môi trường. Sàn mẫu = tên đúng CÙNG `quan-tri@mau.quy-hang.test` là thành
viên; sàn thật trùng tên không bị nạp vào hay gỡ.

```bash
# Khoá thật bắt buộc (thiếu, sai dạng hay khoá dev thì thoát trước khi ghi). Không in email, số, khoá.
node --import tsx packages/db/seed/nap-ban-that.ts --nap --email <email chủ kho>   # chạy lại không đổi gì
node --import tsx packages/db/seed/nap-ban-that.ts --go                             # gỡ sàn mẫu + tài khoản miền mẫu
```

Trên bản thật chạy bằng nút, không chạy ở máy:

1. Một lần: GitHub → Settings → Environments → `production` → thêm secret `OWNER_PHONE_KEY` (cùng giá trị Vercel
   Production, chép từ trình quản lý mật khẩu) và đặt «Deployment branches» chỉ `main` (ADR-0013 §5).
2. Actions → «Nạp dữ liệu mẫu» → Run workflow trên `main`, `viec: nap`, `email: <email của chủ kho>`.
3. Đăng nhập bản thật, chọn «[Mẫu] Sàn thử».
4. Gỡ: cùng nút, `viec: go`, `xac_nhan: [Mẫu] Sàn thử`.

## Kiểm

```bash
node --import tsx --test "packages/db/seed/*.test.mjs"   # cần python3; vắng DATABASE_URL thì dùng Postgres dãy T (5547)
node --import tsx --test "packages/db/seed/*.test.ts"    # bộ nạp bản thật — cần DATABASE_URL tới Postgres đã áp migration
```
