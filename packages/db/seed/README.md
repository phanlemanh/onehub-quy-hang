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

Ảnh mẫu (hàng nap-mau-co-anh): luật lõi đòi một ảnh thật trước khi vào Đang bán, nên mỗi căn mẫu từng lên Đang bán (Đang
bán, Đã cọc, Đã bán, Tạm giữ) có đúng một ảnh vẽ bằng mã (`anh-mau.mjs`: khối màu theo thứ tự hàng, không chữ) — không
phải ảnh thật của ai. Ảnh thêm qua API ảnh, byte cất ở kho ảnh chọn như API: đủ ba khoá `STORAGE_S3_ACCESS_KEY`,
`STORAGE_S3_SECRET_KEY`, `STORAGE_S3_ENDPOINT` → Supabase Storage; không khoá nào ngoài bản thật → bảng
`unit_photo_files`; bản thật (`NODE_ENV=production`) thiếu khoá, hay ở đâu thiếu một phần khoá → dừng trước khi ghi, lời
báo nêu đúng biến thiếu. Gỡ xoá cả byte ảnh mẫu trên kho (chỉ ảnh của đúng sàn mẫu, dưới tiền tố mã sàn mẫu); lần nạp
hỏng giữa chừng xoá byte đã lên kho của chính lần ấy.

```bash
# Khoá thật bắt buộc (thiếu, sai dạng hay khoá dev thì thoát trước khi ghi). Không in email, số, khoá.
node --import tsx packages/db/seed/nap-ban-that.ts --nap --email <email chủ kho>   # chạy lại không đổi gì
node --import tsx packages/db/seed/nap-ban-that.ts --go                             # gỡ sàn mẫu + tài khoản miền mẫu
```

Trên bản thật chạy bằng nút, không chạy ở máy:

1. Một lần: GitHub → Settings → Environments → `production` → thêm secret `OWNER_PHONE_KEY` và ba secret kho ảnh
   `STORAGE_S3_ACCESS_KEY`, `STORAGE_S3_SECRET_KEY`, `STORAGE_S3_ENDPOINT` (cùng giá trị Vercel Production, chép từ trình
   quản lý mật khẩu), rồi đặt «Deployment branches» chỉ `main` (ADR-0013 §5). Thiếu secret kho ảnh thì nút dừng trước
   khi ghi với lời báo «kho ảnh: thiếu …».
2. Actions → «Nạp dữ liệu mẫu» → Run workflow trên `main`, `viec: nap`, `email: <email của chủ kho>`.
3. Đăng nhập bản thật, chọn «[Mẫu] Sàn thử».
4. Gỡ: cùng nút, `viec: go`, `xac_nhan: [Mẫu] Sàn thử`.

## Bộ mẫu thấp tầng (hàng 73)

Bộ thứ hai cho căn thấp tầng trong khu (khu → dãy → lô, ADR-0016 quyết định 3) và nhà, đất ngoài khu định danh bằng địa
chỉ chuẩn (quyết định 5). Tên đường luôn «Đường Mẫu N», số nhà sinh; tỉnh và phường lấy từ bảng trích
`don-vi-hanh-chinh-mau.mjs` (một tỉnh, bốn phường mới, mười phường cũ Quận 1 cũ — nguồn Nghị quyết 1685/NQ-UBTVQH15, chưa
đọc văn bản gốc; danh mục đầy đủ là việc hàng 75). Căn hộ của bộ này là căn của danh mục hàng 5: hàng 5 sinh lại thì sinh
lại bộ này.

| Tệp trong `mau-thap-tang/` | Là gì |
| --- | --- |
| `du-lieu-mau-thap-tang.json` | Khu «[Mẫu] Khu thấp tầng thử» năm dãy 42 lô (nhà phố, shophouse, biệt thự, đất nền), 14 căn ngoài khu ở bốn phường, 29 chủ nhà, 38 hàng phủ sáu trạng thái và bốn loại hình, 7 lead theo bảy ca, hai đầu chủ và hai vùng |
| `bang-hang-thap-tang.xlsx` | Bảng hàng thấp tầng ghi kiểu sàn, bẩn có chủ đích: tiêu đề ở dòng ba, nhãn loại hình của sàn, mã lô lệch dạng, «5x20», «1 trệt 3 lầu», «12,5 tỷ», «Thỏa thuận», số điện thoại chấm, liền, «+84», địa chỉ viết tên phường cũ |
| `dap-an-thap-tang.json` | Đáp án file bẩn (dòng tiêu đề · đích từng cột · giá trị đúng từng ô · lỗi cấy mang nhãn) và bộ địa chỉ thử tám kiểu viết, mỗi cách viết kèm căn đích và địa chỉ chuẩn |

```bash
node packages/db/seed/sinh-thap-tang.mjs            # sinh lại ba tệp (cùng hạt giống ra cùng từng byte)
node packages/db/seed/sinh-thap-tang.mjs --kiem     # so tệp trong kho với đầu ra sinh lại; lệch thì thoát 1
node packages/db/seed/nap-thap-tang.mjs --nap       # hai đầu chủ và hai vùng vào «[Mẫu] Sàn thử»; chạy lại không đổi
node packages/db/seed/nap.mjs --xoa                 # một lệnh gỡ cả hai bộ mẫu
```

Chung một sàn với bộ hàng 5 vì kiểm trùng và luật một hàng mở mỗi căn chỉ chạy trong một công ty — không gỡ riêng được
phần thấp tầng. Lô, căn ngoài khu, hàng, chủ nhà, lead nằm trong tệp, chờ hàng 76. Nút nạp bản thật không đổi.

## Kiểm

```bash
node --import tsx --test "packages/db/seed/*.test.mjs"   # cần python3; vắng DATABASE_URL thì dùng Postgres dãy T (5547)
node --import tsx --test "packages/db/seed/*.test.ts"    # bộ nạp bản thật — cần DATABASE_URL tới Postgres đã áp migration
node --test packages/db/tests/du-lieu-mau-thap-tang.test.mjs   # bộ mẫu thấp tầng (trong npm run db:test) — cần DATABASE_URL
```
