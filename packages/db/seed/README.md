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

# Chỉ trên Postgres của dãy hay của máy — kho chưa có môi trường thật.
DATABASE_URL=postgres://postgres:quyhang@localhost:5544/postgres node packages/db/seed/nap.mjs --nap
DATABASE_URL=postgres://postgres:quyhang@localhost:5544/postgres node packages/db/seed/nap.mjs --xoa
```

`--nap` ghi vào bảng đã có: sàn «[Mẫu] Sàn thử», tài khoản, vai, khu Toà A và Toà B, khu phụ trách của hai đầu chủ.
Chạy lại không đổi gì. `--xoa` xoá tài khoản email miền mẫu và sàn tên đúng «[Mẫu] Sàn thử» — không câu xoá nào thiếu
một trong hai điều kiện ấy.

Danh mục, hàng, chủ nhà, lead chưa có bảng: các hàng dựng bảng (8, 9–10, 11, 24) đọc `mau/du-lieu-mau.json` khi nạp.

## Kiểm

```bash
node --test "packages/db/seed/*.test.mjs"   # cần python3; vắng DATABASE_URL thì dùng Postgres dãy T (5547)
```
