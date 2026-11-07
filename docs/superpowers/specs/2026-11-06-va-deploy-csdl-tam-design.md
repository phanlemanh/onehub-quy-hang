# Vá deploy: bộ kiểm cách ly chạy trên cơ sở dữ liệu tạm, bản thật chỉ kiểm nhanh chỉ đọc

Ngày 06/11/2026 · hàng `va-deploy-csdl-tam` (T3, khẩn — sự cố bản thật) · dãy Q, đợt `dau-khach-nhap` · Nối: ADR-0009 §7,
luật đợt 77.

## Vì sao

Job `deploy` của CI (ADR-0009 §7) hiện áp migration lên cơ sở dữ liệu bản thật rồi chạy **cả bộ kiểm cách ly**
(`npm run test:isolation -w @quy-hang/db`) ngay trên đó. Bộ kiểm dựng sàn, người và hàng thử trong giao dịch rồi rollback,
mở nhiều kết nối, và giả định cơ sở dữ liệu sạch. Trên bản thật đã có sàn mẫu, nên từ 05/11 08:41Z bài AC-9 đỏ liên tục:
bản thật đứng 22 giờ, bản vá sự cố #155 không lên, chủ kho phải duyệt một lần triển khai tay (luật đợt 77). Bộ kiểm còn
mở hàng chục kết nối vào pooler chế độ phiên có trần 15 (hàng `va-pool-ket-noi`).

Bộ kiểm cách ly kiểm **luật**, không kiểm **dữ liệu**: luật nằm trong migration. Cùng một commit trên main, job
`isolation` đã dựng Postgres tạm từ đúng các migration ấy và chạy trọn bộ kiểm; job `deploy` chờ nó. Chạy lại bộ kiểm trên
bản thật chỉ thêm rủi ro (ghi vào bản thật, đụng dữ liệu có sẵn, cạn kết nối) mà không thêm bảo đảm về luật.

Thứ bản thật có mà Postgres tạm không có là **trạng thái thật**: bảng do ai sở hữu, luật theo dòng có thật đang bật không
(ai đó sửa tay, migration áp lệch). Phần này kiểm được bằng vài câu đọc danh mục hệ thống.

## Thiết kế

1. **Job `deploy`** (`.github/workflows/ci.yml`): bỏ bước `test:isolation`; `DATABASE_URL` của bản thật dời từ mức job
   xuống đúng hai bước cần nó (`db:migrate`, kiểm nhanh) — `npm ci` và bước gọi Vercel không thấy chuỗi kết nối. Thứ tự còn lại: `npm ci` → `npm run db:migrate`
   (bản thật) → `npm run kiem-nhanh -w @quy-hang/db` (bản thật, chỉ đọc) → gọi deploy hook của Vercel. `needs` giữ
   `isolation`: bộ cách ly trên cơ sở dữ liệu tạm của đúng commit ấy vẫn chặn triển khai khi đỏ.
2. **Job `isolation`** giữ nguyên: Postgres 16 dịch vụ tạm, `db:migrate` từ đầu, `db:test` trọn bộ (gồm bài mới của kiểm
   nhanh). Chạy ở cả PR lẫn push main.
3. **Kiểm nhanh** `packages/db/scripts/kiem-nhanh.mjs` — một kết nối, một giao dịch `begin read only`, `statement_timeout`
   15 giây, ba câu đọc danh mục:
   - bảng thường của schema `public` (trừ `schema_migrations`) chưa bật **hoặc** chưa ép luật theo dòng (cùng truy vấn
     với bài «mọi bảng dữ liệu đều bật và ép luật theo dòng» của bộ cách ly);
   - bảng của `public` do vai `quy_hang_app` sở hữu (vai chủ bỏ qua luật theo dòng; API phải chạy bằng vai không là chủ);
   - vai `quy_hang_app` có `bypassrls` hay là superuser.
   Có dòng nào → in từng bảng hay thuộc tính sai, thoát 1, deploy dừng trước khi gọi Vercel. Không dòng nào → in một dòng
   tổng kết (số bảng đã soi), thoát 0. Phần xét thuần (`xet`) tách khỏi phần đọc để bài kiểm chạy hai chiều.
4. **Kết nối bản thật**: `db:migrate` một kết nối, đóng; kiểm nhanh một kết nối, đóng — tuần tự, không bao giờ quá 2.
5. **Tài liệu**: hàng này không sửa ADR-0009 hay Tham chiếu (giám sát bỏ hai tệp khỏi vùng 06/11). Hai dòng cần ghi nằm ở
   mục «Việc theo sau» của hồ sơ.

## Việc theo sau (ngoài vùng của hàng)

- ADR-0009 §7: thêm mục «Sửa đổi 06/11» — bộ kiểm cách ly chạy trên Postgres tạm của job `isolation` cùng commit; bản thật
  chỉ `db:migrate` rồi kiểm nhanh chỉ đọc (`npm run kiem-nhanh -w @quy-hang/db`). Không viết đè §7.
- Tham chiếu §12: dòng 06/11 cho thay đổi trên.
- Bài `kiem-ci.mjs` của hồ sơ đã ký `moi-truong-that` (eval `kiem_ci`) đòi `test:isolation` trong job deploy và đã lệch từ
  khi `ro-ri` vào `needs`; cần hồ sơ ấy sửa lại thước theo thiết kế này.

## Đối chiếu ngành (ADR-0022)

Không phải đối tượng nghiệp vụ hay danh sách của sàn — là quy trình phát hành, không có cột RESO, không có chỗ «ta cứng
— họ cấu hình». Nếp phát hành thường gặp: kiểm thử ghi chạy trên cơ sở dữ liệu dựng tạm (service container của GitHub
Actions — kho đã dùng ở job `isolation`); bản thật chỉ nhận migration rồi kiểm nhanh chỉ đọc. Khuyến nghị cụ thể của
Supabase cho kiểm sau migration: chưa kiểm.

## Phạm vi

Làm: job deploy, job isolation giữ nguyên, kiểm nhanh. CSDL tạm là service container `postgres:16` trong job (giám sát
chọn 06/11: không dùng nhánh Supabase vì tốn tiền). Không làm: đổi `KIT_TAG`; chạy gì lên bản thật từ máy; sửa ADR,
Tham chiếu hay bài kiểm của hồ sơ khác (mục «Việc theo sau»); kiểm nhanh schema `identity`; chạy advisors của Supabase
trong CI.

## Thay eval của hồ sơ đã ký (ghi 07/11, hàng va-thuoc-ci-ho-so-moi-truong-that)

| Eval cũ | Tiêu chí của hồ sơ này đo lại |
|---|---|
| bat-rang-buoc-ban-ma/E4 | AC-3 — thứ tự trên bản thật: db:migrate → kiểm nhanh → deploy hook; kiểm nhanh đỏ thì không gọi Vercel |
| moi-truong-that/E3 | AC-2 — bộ kiểm cách ly chạy trọn trên cơ sở dữ liệu tạm của đúng commit và vẫn chặn triển khai (thay việc chạy bộ ấy trên bản thật; ghi 07/11, hàng va-thuoc-ci-moi-truong-that-ban-that) |
