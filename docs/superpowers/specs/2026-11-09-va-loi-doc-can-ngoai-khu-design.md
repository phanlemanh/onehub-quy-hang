# Vá Bảng hàng: đọc căn ngoài khu lỗi thì báo và cho thử lại — thiết kế

Hàng vá từ Ngoài-7 của hàng 79 (`bang-hang-theo-loai-hinh`), chủ kho chọn «mở hợp đồng mới» 08/11. T2.

## Việc

Lần đầu mở Bảng hàng trên máy mới mà mạng lỗi, các căn ngoài khu hiện «Chưa rõ» với vị trí chung chung và không có gì báo. Người dùng tưởng dữ
liệu sai. Sau bản vá: bảng báo chưa đọc được, có nút Thử lại; bấm khi mạng về thì căn ngoài khu hiện đúng loại hình và địa chỉ.

## Nguyên nhân

`useCanNgoaiKhu` gộp mọi lỗi (mất mạng, 5xx, thân sai) thành `null` rồi rơi về bản giữ trên máy. Máy chưa có bản giữ thì danh sách rỗng, và bảng
không có cách biết lần đọc đã hỏng.

## Cách làm

Theo đúng nếp đọc danh bạ của Bảng hàng (hàng 48): phần đọc thuần trả `xong` hoặc `loi`, hook trả thêm `loi` và `thuLai`, bảng báo qua `TrangThai`
ở chỗ đang báo lỗi danh bạ. Không tự đọc lại theo nhịp.

**Điều kiện báo: lần đọc gần nhất lỗi, máy không có bản giữ đọc được, và bảng có hàng ngoài khu.** Đúng câu giao. Bản giữ đọc được thì không báo, kể cả
bản rỗng hay cũ thiếu căn: ca đó hiếm, và một khối báo trên toàn lưới vì một căn thiếu thì nặng hơn lỗi nó báo. Sàn không có hàng ngoài khu thì không báo.

**Một vùng một báo lỗi** (ADR-0024 sửa đổi 09/11). Mất mạng thường làm cả danh bạ lẫn căn ngoài khu hỏng cùng lúc: hai khối chồng nhau là đúng lỗi đã
ghi ở bản kiểm Hôm nay. Khi cả hai cùng lỗi, bảng hiện một khối, một nút, nút đọc lại cả hai. Chỉ danh bạ lỗi thì chữ giữ nguyên như hôm nay.

Thân trả về không đúng khuôn đã khai (không phải JSON, không có mảng `units`, phần tử thiếu trường) cũng là lỗi đọc, vì đường đọc của máy chủ luôn trả đủ ba trường chữ.

Kế hoạch giao diện: màn vận hành · Danh sách – chi tiết · Frame · dày · thêm một báo ở vùng trên lưới · lỗi có Thử lại · không chuyển động.

## Đối chiếu ngành

| Năng lực | RESO | Sản phẩm khác | Ta làm | Ta cứng — họ cấu hình |
|---|---|---|---|---|
| Báo khi đọc dữ liệu phụ của bảng lỗi | Không định nghĩa cách hiện | Follow Up Boss, Lofty, BoldTrail: **chưa kiểm** | Báo một khối kèm Thử lại | Không có: đây là sửa hành vi, không phải chỗ sàn cấu hình |

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
### 1. Luồng

- Suôn sẻ: Bảng hàng → đọc được → hàng ngoài khu hiện đúng, không có báo (điểm ra: ở lại bảng).
- Biên: máy có bản giữ đủ — y hôm nay; sàn không có hàng ngoài khu — không báo; danh bạ cùng lỗi — một khối, một nút.
- Lỗi & quay lại: đọc lỗi → khối báo + Thử lại → bấm khi mạng về → báo mất, hàng hiện đúng; bấm khi vẫn lỗi → báo còn, bấm lại được.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Bảng hàng | xem hàng của sàn | nhà Bảng hàng / cột hồ sơ căn |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-bang-hang-loi-ngoai-khu | Bảng hàng | khối báo trên lưới «Chưa đọc được danh sách căn ngoài khu — loại hình và địa chỉ của các căn này có thể thiếu», nút Thử lại; hàng ngoài khu «Chưa rõ» | bấm Thử lại |
| ST-bang-hang-loi-doc-ca-hai | Bảng hàng | một khối báo «Chưa đọc được danh bạ thành viên và danh sách căn ngoài khu — cột Đầu chủ và các căn ngoài khu có thể thiếu thông tin», một nút Thử lại | bấm Thử lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Thử lại đọc lại một lần; không tự đọc theo nhịp. Đang đọc lại thì khối báo giữ nguyên tới khi có kết quả.

### 5. Xuất xứ component

| Component | Nấc | Vì sao (1 dòng) |
|---|---|---|
| `TrangThai` lỗi có `hanhDong` | dùng | đúng khối báo lỗi danh bạ đang dùng ở cùng vị trí |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: màn đã dựng, vòng không đổi bố cục (`design/patterns/bang-hang.md`).

### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Đầu chủ, Đầu khách |
| Việc chính | Xem đúng loại hình và địa chỉ căn ngoài khu |
| Tần suất | mỗi ngày nhiều lần; ca lỗi hiếm |
| Số bản ghi | hàng trăm trở lên |
| Thiết bị | máy tính |
<!-- UX-SPEC-TEMPLATE>>> -->
