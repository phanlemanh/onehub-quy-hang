# Dòng định nghĩa bao phí đọc lại khi giá đồng bộ xong — thiết kế (hàng vá)

Ngoài-3 của hàng 49 `thue-phi`: chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 06/11.

## Vấn đề

`DongDinhNghia` đọc `GET /listings/{id}/fee-basis` theo khoá giá + phí của bản trên máy. Bản trên máy đổi ngay khi người sửa giá,
còn dấu định nghĩa chỉ được máy chủ đóng lúc giá lên. Hai đường gãy:

1. Giá còn chờ gửi mà lời đọc vẫn tới máy chủ: máy chủ trả dấu của giá cũ, dòng dựng số về tay của giá mới theo dấu cũ.
2. Giá lên máy chủ xong thì giá trên máy không đổi nữa, khoá không đổi, lời đọc không chạy lại. Dòng sai (hay dòng vắng, nếu lúc
   sửa mất mạng) đứng nguyên tới khi tải lại màn.

## Thiết kế

Mô hình hồ sơ thêm hai trường, đọc từ ngăn của bộ đồng bộ: `giaChoGui` (hàng đợi còn thao tác `price_changed` của căn đang xem)
và `keoLuc` (`lastPullAt`). Hai hàm thuần ở `dinh-nghia.ts` quyết định, thành phần chỉ nối:

- `khoaDoc`: khoá của lần đọc cần chạy, `null` là không đọc. Không đọc khi giá không bao phí, chưa có giá, hay giá còn chờ gửi.
  Lần đọc hỏng được thử lại khi `keoLuc` khác lúc hỏng.
- `chuDong`: chữ dòng phụ, `null` khi giá còn chờ gửi hay chưa có lần đọc thành công của đúng giá ấy.

Thứ tự đọc nằm trong một bộ đọc không dính React (`taoBoDocDau`): nhận trạng thái hiện tại, chạy tối đa một lời đọc, bỏ phản hồi muộn, bỏ
lần đọc đang giữ trong lúc giá chờ gửi, nên đổi giá đi rồi đổi về đúng giá cũ cũng đọc lại sau khi gửi xong. Lời đọc đi qua hàm gọi API của
bộ đồng bộ; mất mạng và 5xx là hỏng, 200 và 4xx là kết quả cuối. Thành phần chỉ nối bộ đọc với màn.

Lúc giá chờ gửi, dòng không hiện (Hỏi-1 ở Cổng Phạm vi, đây là khuyến nghị).

Thao tác chờ không phải đổi giá không ảnh hưởng: dấu chỉ đóng theo sự kiện giá.

Lối khác và lý do bỏ nằm trong sổ quyết định. Máy chủ và cơ sở dữ liệu không đổi.

Đối chiếu ngành (ADR-0022): không có đối tượng hay danh sách mới. Về kỹ thuật, đọc lại sau khi lệnh ghi xong là nếp vô hiệu hoá theo
lệnh ghi của TanStack Query; thử lại khi có mạng là nếp `revalidateOnReconnect` của SWR.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: đầu chủ sửa giá bao phí → máy gửi lên → dòng đổi sang dấu mới, không tải lại trang.
- Biên: mất mạng hay mạng yếu lúc sửa → giá mới hiện, dòng phụ vắng → có mạng, giá lên máy chủ → dòng hiện theo dấu mới.
- Lỗi & quay lại: giá bị từ chối, về «Cần xem» → dòng theo giá máy chủ. Đọc dấu hỏng → dòng vắng, thử lại ở lần kéo thành công kế.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hồ sơ căn | đọc một căn và giá của nó | dòng Bảng hàng / đóng cột |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-dinh-nghia-da-len | Hồ sơ căn | giá và dòng «Tính theo định nghĩa ngày …» theo dấu của giá hiện hành | đọc |
| ST-dinh-nghia-cho-gui | Hồ sơ căn | giá mới, không có dòng phụ | chờ, hoặc làm tiếp việc khác |
| ST-dinh-nghia-doc-hong | Hồ sơ căn | giá, không có dòng phụ | không cần làm gì, máy tự đọc lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Không thêm chữ, nút hay chỉ báo; chỉ báo đồng bộ chung của vỏ giữ nguyên.

### 5. Xuất xứ component

| Component | Nấc | Vì sao (1 dòng) |
|---|---|---|
| Dòng định nghĩa | dùng | giữ nguyên chữ và kiểu, chỉ đổi lúc đọc |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: màn đã dựng trên bố cục này; vòng không đổi bố cục.

### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Đầu chủ |
| Việc chính | sửa giá và xem số về tay theo định nghĩa của giá ấy |
| Tần suất | mỗi ngày |
| Số bản ghi | một căn mỗi lần |
| Thiết bị | máy tính |
<!-- UX-SPEC-TEMPLATE>>> -->
