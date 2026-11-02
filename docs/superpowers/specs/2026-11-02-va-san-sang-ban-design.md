# Vá «Sẵn sàng bán» — thiết kế

Hàng vá của hàng 23 (`_acceptance/san-sang-ban/`). Chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 02/11 cho ba mục:

- Ngoài-2 và Ngoài-5 (cùng một lỗi): danh sách «Còn thiếu» và dấu «Chưa có» của căn trước còn hiện khi chuyển sang căn khác, hay
  sau khi đầu chủ đã điền điều thiếu.
- Ngoài-4: nút báo đã gửi dù lệnh không vào hàng đợi — kết quả của lệnh sửa bị bỏ qua.

## Gốc lỗi

1. `NutSanSang` giữ kết quả lần bấm trong state của chính nó, còn `CotHoSo` giữ `dichThieu` (các ô cần dấu «Chưa có»). Cột hồ
   sơ không dựng lại khi đổi căn, nên cả hai giữ giá trị của căn trước; khi căn mới không có nút (đang bán), nút gỡ ra mà
   `dichThieu` vẫn còn.
2. Danh sách được chụp một lần lúc bấm. Hàng trên máy đổi (đầu chủ điền giá ở Bảng hàng) thì danh sách không đổi theo.
3. `bamSanSang` gọi `gui` rồi trả `da-gui` bất kể kết quả. `sua` của bộ đồng bộ trả `{ ok: false, loi }` khi luật trên máy
   từ chối hay kho trên máy lỗi — kết quả ấy bị bỏ.

## Cách vá

- **Danh sách suy từ hàng đang xem.** Lần bấm giữ số ảnh thật đã đếm (chứ không giữ danh sách); danh sách «Còn thiếu» và các
  dấu «Chưa có» tính lại mỗi lần vẽ từ hàng hiện tại trên máy bằng `kiemSanSang`. Điền xong một điều thì điều đó rời danh
  sách ngay. Đủ hết thì danh sách biến mất — máy KHÔNG tự gửi; đầu chủ bấm lại.
- **Kết quả gắn với lần rao.** Nút dựng mới theo mã lần rao (`key={can.id}` — hai lần rao của cùng căn khác mã), `CotHoSo`
  giữ `{ id, dich }` và chỉ dùng khi `id` bằng lần rao đang xem; nút gỡ ra thì báo danh sách rỗng.
- **Ảnh thật (Hỏi-2, theo khuyến nghị).** Dòng «Ảnh thật» dùng số ảnh đếm ở lần bấm; dưới danh sách ghi «Ảnh thật cập nhật
  khi bấm lại». Hàng chưa có mã căn lúc bấm: lõi không xét ảnh; điền mã căn xong thì «Ảnh thật» hiện nếu lần bấm đếm 0 ảnh.
- **Gửi theo kết quả thật (Hỏi-1, theo khuyến nghị).** `bamSanSang` đọc kết quả của `gui`: `ok` → «đã gửi»; `ok: false` → trạng thái `loi` với câu của
  trình sửa ô (`moTaLoi` ở `inventory/cell-edit/lenh.ts`, một đường lệnh); `gui` ném lỗi → câu lỗi kho. Nút vẫn bấm được.
- Lời báo lỗi dùng `TrangThai` kiểu `error` đã cài, đặt đúng chỗ của danh sách «Còn thiếu».

## Không làm

- «Ảnh thật» tự cập nhật khi thêm ảnh ở mục Ảnh (Hỏi-2): dòng ấy làm mới ở lần bấm sau.
- Đổi lời báo của máy chủ khi từ chối sau khi đã vào hàng đợi — đường «Cần xem» của hàng 23 giữ nguyên.

## Đối chiếu ngành

Không có dòng mới: vá hành vi của nút đã đối chiếu ở hàng 23 (`docs/product/doi-chieu-nganh.md` §7). Không thêm tập đóng,
danh sách hay nhãn nào; nhãn điều thiếu vẫn đọc từ `NHAN_DIEU_KIEN` của lõi. Không dòng «ta cứng — họ cấu hình».

## Đặc tả UX

Bỏ có tên (sổ quyết định): vá hành vi trên màn đã có của hàng 23, cấu trúc và khối không đổi.
