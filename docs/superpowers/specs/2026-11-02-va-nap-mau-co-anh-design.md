# va-nap-mau-co-anh — ca kho Storage của bài kiểm Nạp mẫu có ảnh đo được và đỏ được

Hồ sơ `_acceptance/va-nap-mau-co-anh/` (T3 — chạm `packages/db/**`). Mở theo chữ «mở hợp đồng mới» của chủ kho ở Cổng
Bằng chứng hàng 28 (`cuoc-goi-khai-thac`, Ngoài-3, dòng sổ `d-20261102T091511Z-19`).

## Vấn đề

Ca «kho-storage» của `packages/db/seed/nap-ban-that.test.ts` (E5 hồ sơ `nap-mau-co-anh`) hứa: đủ ba khoá
`STORAGE_S3_*` thì byte ảnh mẫu đi vào kho Storage dưới mã sàn mẫu, bảng byte `unit_photo_files` không có dòng. Ca hiện
tại đưa thẳng một kho giả mang tên `s3` vào bộ nạp:

- Kho giả không bao giờ ghi `unit_photo_files`, nên câu «bảng byte rỗng» đúng sẵn — âm tính một mình, không thể đỏ.
- Kho không đi qua `chonKhoAnh(env)` — bước chọn kho theo môi trường mà dòng lệnh nạp thật dùng. Chọn nhầm kho thì ca
  vẫn xanh.

## Cách vá

Chỉ sửa tệp bài kiểm (ranh giới của hàng). Bộ nạp, `kho.ts`, `kho-s3.ts` không đổi.

1. **Kho do chính bước chọn kho dựng.** Ca gọi `chonKhoAnh(env, fetchGhi)` với env đủ ba khoá giả (endpoint không thật)
   và một `fetch` ghi lại mọi lời gọi, trả 200, không mạng. Kho trả về là kho Storage thật của API (`khoTuS3(khoS3(...))`);
   lời gọi đi qua bộ ký và dựng đường của nó.
2. **Một phép so, ba lần dùng.** Hàm `lechKhoStorage(ketQua, san)` trả danh sách lệch (rỗng = đạt) so kết quả một lần nạp
   với điều E5 hứa: tên kho `s3`; tập đường PUT BẰNG tập `<endpoint>/<bucket>/<mã sàn mẫu>/<mã ảnh>/{original,thumb}` dựng
   từ mã ảnh đọc lại trong `unit_photos` của sàn mẫu (đường rút bằng `duongDoiTuong` của API, không viết tay); không lời
   gọi nào ngoài PUT; `unit_photo_files` có 0 dòng của sàn mẫu. Thông điệp nêu đúng vế lệch và số đo.
3. **Đối chứng dương trên cùng gói mẫu.** Env ngoài bản thật không khoá → `chonKhoAnh` chọn kho Postgres; nạp cùng gói →
   bảng byte có 29 × 2 dòng của sàn mẫu, `fetch` không nhận lời gọi nào. Câu truy vấn bảng byte vì thế từng thấy dòng.
4. **Chiều đỏ trên cùng gói mẫu, thông điệp ghim.**
   - Chọn nhầm kho: chạy `lechKhoStorage` trên kết quả lần nạp kho Postgres ở bước 3 → lệch, thông điệp nêu «kho
     postgres», «bảng byte có 58 dòng» và «Storage nhận 0 lệnh ghi».
   - Byte rò vào bảng: kho Storage thật được bọc để mỗi lần ghi cũng ghi `unit_photo_files` (như một bộ nạp tự ghi bảng
     bên cạnh kho) → lệch, thông điệp nêu «bảng byte có 58 dòng của sàn mẫu».

5. **Trật tự trong ca** (phản biện context sạch): trước mỗi lần nạp assert sàn mẫu vắng; số đếm một lần nạp chụp ngay
   sau lần ấy rồi gỡ; gỡ ở `finally` để ném giữa chừng cũng không để sàn mẫu lại. `lechKhoStorage` thêm vế số đếm từ gói
   mẫu (29 ảnh, 58 PUT) và ca so tập bội (biến thể, sha256) của thân PUT với byte lần nạp Postgres — byte gửi đi khớp byte
   gói mẫu, không chỉ đường đúng.
6. **Ranh giới tệp** theo lệ kho: `_acceptance/va-nap-mau-co-anh/thu/ranh-gioi.mjs`, đối chứng đỏ trong cùng lệnh.

## Không làm

- Không đổi bộ nạp, bước chọn kho hay kho Storage của API.
- Không kiểm kho Storage thật trên mạng (cần khoá thật; CI không có).
- Không sửa ca «go-xoa-byte», «chon-kho», «khong-khoa-ngoai-ban-that» — ngoài mục chủ kho mở.

## Đối chiếu ngành

Không áp (ADR-0022): hàng chỉ sửa một bài kiểm, không thêm đối tượng nghiệp vụ, danh sách hay luật nào của sàn.
