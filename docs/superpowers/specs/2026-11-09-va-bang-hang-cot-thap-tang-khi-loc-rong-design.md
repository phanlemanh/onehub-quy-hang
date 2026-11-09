# Vá Bảng hàng: cột thấp tầng còn nguyên khi lọc ra rỗng — thiết kế

Hàng vá từ Ngoài-4 của hàng 79 (`bang-hang-theo-loai-hinh`), chủ kho chọn «mở hợp đồng mới» 08/11. T2.

## Việc

Đang gõ dở một số vào ô lọc cột đất (Diện tích đất, Mặt tiền…) mà bảng ra rỗng, thì hôm nay cả cột và ô đang gõ biến mất, người
dùng chỉ còn cách xoá hết bộ lọc. Sau bản vá: bảng rỗng, bộ cột và ô lọc còn nguyên; xoá ký tự trong ô thì hàng hiện lại.

## Nguyên nhân

Bộ cột tính từ các dòng đã lọc. Tập rỗng đọc như căn hộ (hàng 79), nên cột riêng của thấp tầng bị ẩn đúng lúc người đang gõ vào nó.

## Cách làm

**Khi lọc ra rỗng, bộ cột và tiêu đề cột vị trí giữ như lần gần nhất còn có dòng.** Đây đúng nghĩa «ở nguyên»: gõ làm bảng rỗng ở ô nào, vì
cột nào, cũng không cột nào nhảy.

Tính lại từ dữ liệu không giữ được điều đó: Lọc Đất, ô Diện tích đất khớp, gõ Giá không khớp thì bỏ ô đất vẫn rỗng, bộ cột về căn hộ và cột
đất mất; bảng trộn đã co theo một ô Số tầng thì bỏ ô ấy lại bung ra mọi loại hình.

Một bước thuần ở `inventory/loai-hinh.ts` nhận bộ cột trước, số dòng và bộ cột tính mới; màn giữ kết quả trong trạng thái. Giữ cột **bị ẩn** chứ
không giữ cột hiện, nên bật tắt cột lúc bảng rỗng vẫn có tác dụng. Mở trang mà bảng đã rỗng (góc nhìn đã lưu) chưa có lần trước: tính từ các
dòng chỉ lọc theo Loại hình. Có dòng thì mọi thứ y hôm nay; sàn chỉ căn hộ y hôm nay.

## Đối chiếu ngành

| Năng lực | RESO | Sản phẩm khác | Ta làm | Ta cứng — họ cấu hình |
|---|---|---|---|---|
| Bộ cột theo loại hình khi lọc rỗng | Không định nghĩa cách hiện | Follow Up Boss, Lofty, BoldTrail: **chưa kiểm** | Giữ cột của ô đang lọc | Không có: đây là sửa hành vi, không phải chỗ sàn cấu hình |

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
### 1. Luồng

- Suôn sẻ: Bảng hàng → bật Lọc → gõ giá trị không khớp vào ô Diện tích đất → bảng báo không có dòng khớp, cột và ô lọc còn nguyên → xoá ký
  tự → hàng hiện lại (điểm ra: ở lại bảng).
- Biên: sàn chỉ căn hộ — y hôm nay; rỗng vì ô lọc cột chung — bộ cột vẫn như trước khi gõ; mở góc nhìn đã rỗng — theo bộ lọc Loại hình.
- Lỗi & quay lại: ô sai luật số vẫn báo lỗi dưới ô như hôm nay.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Bảng hàng | lọc hàng của sàn | nhà Bảng hàng / cột hồ sơ căn |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-bang-hang-loc-rong-cot-dat | Bảng hàng | khối lọc rỗng như hôm nay, tiêu đề cột và ô đang gõ còn nguyên | sửa ô lọc |
| ST-bang-hang-loc-rong-cot-chung | Bảng hàng | khối lọc rỗng, bộ cột như trước khi gõ | sửa ô lọc |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Bộ cột tính lại mỗi lần đổi lọc; con trỏ không rời ô đang gõ vì ô không bị dựng lại.

### 5. Xuất xứ component

| Component | Nấc | Vì sao (1 dòng) |
|---|---|---|
| Hàng lọc, lưới Bảng hàng | dùng | đổi tập cột hiện, không đổi khối |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: màn đã dựng, vòng không đổi bố cục (`design/patterns/bang-hang.md`).

### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Đầu chủ, Đầu khách |
| Việc chính | Lọc hàng thấp tầng theo số |
| Tần suất | mỗi ngày nhiều lần |
| Số bản ghi | hàng trăm trở lên |
| Thiết bị | máy tính |
<!-- UX-SPEC-TEMPLATE>>> -->
