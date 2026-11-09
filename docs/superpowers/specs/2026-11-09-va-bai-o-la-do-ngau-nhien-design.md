# Vá bài ô lạ đỏ ngẫu nhiên — thiết kế

Ngày 2026-11-09 · hàng `va-bai-o-la-do-ngau-nhien` · T2 · không chạm giao diện.

## Vấn đề

Bài `packages/api/test-db/imports/o-la.test.ts` kiểm rằng số điện thoại mẫu `0900 000 011` không vào sổ chi phí AI bằng
cách tìm chuỗi `0900` và `011` trên `row_to_json(a)::text` của dòng sổ. Chuỗi đó gồm cả mã sàn, mã dòng, mã người và giờ
ghi tới phần triệu giây, nên khi các giá trị ngẫu nhiên tình cờ có `011`, bài đỏ dù sổ sạch. Đo trên Postgres riêng: 2
lần đỏ trong 200 lần chạy liên tiếp, cùng thông báo «sổ chứa chuỗi số». Ngày 08–09/11 bài này đã đỏ hai lần không liên
quan tới thay đổi nào, và một lần làm bước triển khai trên main bị bỏ qua.

## Cách làm

Phép kiểm chuyển thành hàm `vetSoTrongSo` ở `packages/api/test-db/imports/vet-so-trong-so.ts`, đọc dòng sổ theo từng
trường rồi quyết định theo loại trường:

| Trường | Điều kiện được bỏ qua | Nếu không đủ điều kiện |
|---|---|---|
| `id`, `company_id` | đúng dạng UUID | quét như trường chữ |
| `created_at` | đúng dạng giờ ghi của Postgres | quét như trường chữ |
| `user_id` | đúng bằng mã người đang đăng nhập | quét như trường chữ |
| trường số (`cost_usd`, `duration_ms`, số token) | không bỏ qua | chỉ so số đầy đủ, không so đầu số hay đuôi |
| mọi trường khác, kể cả cột thêm sau này | không bỏ qua | so số đầy đủ, đầu số và đuôi |

Mọi so sánh làm trên phần chữ số của giá trị, nên số có khoảng trắng, dấu chấm, gạch nối hay đầu `+84` đều trúng. Số đầy
đủ so bằng chín chữ số sau số 0 đầu.

Danh sách trường được bỏ qua là danh sách ngắn, không phải danh sách cho phép: cột mới của sổ tự động bị quét.

## Lựa chọn đã loại

- Chỉ bỏ phần kiểm đuôi `011`: hết đỏ nhưng số lọt ở dạng đuôi không còn bị bắt, làm yếu bất biến 2.
- Chỉ quét các cột chữ đang có (`model`, `result`, `blocked_kinds`): cột chữ thêm sau này sẽ không được quét mà không ai
  biết.
- Bỏ qua `user_id` theo dạng UUID: `user_id` là cột chữ tự do, một số điện thoại lọt vào đó sẽ qua được.
- Đọc danh sách cột chữ từ `information_schema`: tự phủ cột chữ mới, nhưng bỏ sót cột số và vẫn phải xử riêng `user_id`,
  nên không bớt được nhánh nào mà thêm một lượt truy vấn.
- Xoá giá trị máy của dòng khỏi chuỗi rồi so: tương đương bỏ qua trường nhưng mất kiểm tra dạng, nên cột máy mang giá trị
  lạ cũng được bỏ qua.
- So theo ranh giới số trên toàn văn (`011` không liền chữ số khác): mã UUID xen chữ cái hex nên `a011b` vẫn trúng, đỏ ngẫu
  nhiên còn nguyên.

## Giới hạn có chủ ý

Mã dòng, mã sàn và giờ ghi do cơ sở dữ liệu sinh; câu ghi sổ không truyền ba cột này, nên một giá trị đúng dạng ở đó không
thể mang dữ liệu người dùng. Phép kiểm không dò số bên trong chúng.

Dữ liệu lồng trong một cột (đối tượng, mảng chứa đối tượng, cả khoá) được đi đệ quy và so như trường chữ. Ở đó không có tên
cột để dựa, nên mã và giờ đúng dạng được nhận theo dạng rồi bỏ qua, để cột lồng sau này không đưa đỏ ngẫu nhiên trở lại.

## Bộ đo

Một ca đối chứng trên cơ sở dữ liệu thật chèn dòng sổ đã biết trước, đọc lại đúng biểu thức của bài kiểm: dòng có `011` ở
mọi trường máy phải xanh, mười hai dạng lọt số phải đỏ và gọi đúng tên trường. Một ca ma trận sinh từ khoá của dòng sổ thật
cộng một cột giả, đo mọi cột, kể cả trường máy sai dạng và mảng. Một ca để Postgres sinh hai vạn dòng qua mặc định của bảng,
đọc bằng đúng biểu thức, có giờ ghi đủ, thiếu và không phần lẻ, trong đó phép kiểm cũ đỏ nhiều lần còn phép kiểm mới không
đỏ lần nào. Một bản sao cây để phá thử: hàm luôn báo sạch, bỏ loại trường máy, chỉ quét ba cột, bỏ qua mã máy vô điều kiện,
và đường ghi sổ thật bị sửa cho lọt số. Chạy 300 lần đường ghi sổ thật để đo đỏ ngẫu nhiên còn lại.

«Đúng dạng giờ ghi» là dạng Postgres in timestamptz trong `row_to_json`: `YYYY-MM-DDTHH:MM:SS`, phần lẻ từ không tới sáu
chữ số, rồi múi giờ.
