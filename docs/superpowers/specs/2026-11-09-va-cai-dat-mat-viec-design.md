# Vá bốn lỗi làm mất việc ở Cài đặt (va-cai-dat-mat-viec)

Hàng A của `docs/plan/kiem-cai-dat.md` (bản kiểm 09/11). Chủ kho quyết «làm» ở Cổng Đáng 09/11. Chỉ vá hành vi trên ba màn
đã ký; thống nhất cách lưu, khung, tốc độ là các hàng B, C, D.

## Bốn chỗ sửa

**L1 · «Giữ nhãn» (Trạng thái).** Cờ `xacNhan` bật khi bấm «Gỡ và chuyển» với giả định nút ấy cũng gọi `onOpenChange`.
`AlertDialogAction` của base-nova chỉ là nút, không đóng hộp, nên `onOpenChange` không chạy và cờ không hạ; lần «Giữ nhãn»
kế bị coi là đã xác nhận. Bỏ hẳn cờ: `onOpenChange(false)` chỉ đến từ «Giữ nhãn» và Esc, cả hai đều là huỷ. «Gỡ và chuyển» tự đóng
hộp qua `setHoi(null)`.

**L2 · Xoá cột mẫu nhập.** `xacNhanXoa` bỏ qua kết quả. Thêm hàm thuần `sauKhiXoa` cạnh `sauKhiLuu`: 2xx đóng hộp rồi làm mới;
404 giữ hộp với câu «Cột này đã bị xoá trước đó» và làm mới bảng, để màn luôn nói điều đã xảy ra; 403 giữ hộp với câu về quyền;
còn lại (mạng, 5xx) giữ hộp với câu thử lại. Mở lại hộp thì câu lỗi cũ mất. Khi đang gửi: khoá hai nút và không cho Esc đóng hộp, để kết quả hỏng không rơi vào hộp đã đóng.
Đường sửa đã có `sauKhiLuu` và câu lỗi, giữ nguyên, chỉ thêm phép đo.

**L8 · Bảng Mẫu nhập ở điện thoại.** Dưới khổ `lg`, ba cột Ghép vào, Quy đổi, Nguồn ẩn và chữ của chúng xuống một dòng phụ cỡ
nhỏ trong ô đầu, viết «Ghép vào <trường> · <n giá trị> · <nguồn>»; còn hai cột: tiêu đề và Sửa, Xoá. Hàng
`cai-dat-bang-dung-khung` sẽ thay bảng này, nên ở đây chỉ đặt lại chữ trong ô, không đổi khối. Ô tiêu đề và tiêu đề hai hộp được ngắt giữa chữ (`wrap-anywhere`) vì khoá tiêu đề dài tới
200 ký tự, có thể không dấu cách. Từ `lg` trở lên giữ năm cột: ở `md` cột thứ hai của vỏ còn chiếm chỗ nên năm cột vẫn tràn (đo được ở 768).

**L13 · Ô tỉ lệ môi giới.** `aria-label` đang ở `NumberField` (gốc, là `div`) nên không tới ô nhập. Chuyển xuống
`NumberFieldInput`, nhãn «Tỉ lệ môi giới (%)».

## Phép đo

Kho không có bộ dựng DOM cho test đơn vị, và lỗi L1 nằm đúng ở chỗ nối thành phần, nên đo trên màn thật: Chrome không đầu
qua CDP (`bang-hang-kieu-sheet/thu/cdp.mjs`) trên chỗ thử dãy D, mỗi ca dựng dữ liệu riêng rồi trả lại. Một lệnh chạy mọi ca.
Chiều đỏ: chạy lệnh ấy trên mã trước khi sửa, nhật ký giữ ở `evidence/truoc-sua.log`; thêm đối chứng dương ngay trong
lệnh (axe phải bắt được ô không nhãn cài vào; thước tràn phải bắt được khối rộng cài vào; bỏ chặn thì xoá thành công).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Trạng thái → gỡ nhãn đang dùng → hộp hỏi nhãn thay → «Gỡ và chuyển» hoặc «Giữ nhãn» → Lưu.
- Suôn sẻ: Mẫu › Mẫu nhập → Xoá → hộp xác nhận → hộp đóng, dòng mất.
- Biên: tiêu đề cột 200 ký tự không dấu cách; dòng đã bị xoá ở chỗ khác (404).
- Lỗi & quay lại: xoá hỏng → câu lỗi trong hộp, hộp mở, dòng còn → bấm Xoá lần nữa hoặc Huỷ.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Cài đặt › Sàn › Trạng thái | Đặt nhãn riêng của sàn | mục lục Cài đặt / giữ tại chỗ |
| Cài đặt › Sàn › Mẫu, tab Mẫu nhập | Sửa, xoá cột file đã nhớ | mục lục Cài đặt / giữ tại chỗ |
| Cài đặt › Sàn › Thuế phí | Đặt tỉ lệ và cách tính vào giá | mục lục Cài đặt / giữ tại chỗ |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-trang-thai-giu | Trạng thái | Hộp đóng, nhãn hiện lại, Lưu theo luật cũ | Làm tiếp hoặc Lưu |
| ST-mau-xoa-dang-gui | Mẫu nhập | Hai nút trong hộp khoá | Chờ |
| ST-mau-xoa-loi | Mẫu nhập | «Chưa xoá được — dòng vẫn giữ nguyên, thử lại» trong hộp | Bấm Xoá lần nữa hoặc Huỷ |
| ST-mau-xoa-khong-quyen | Mẫu nhập | «Chỉ quản trị sàn xoá được cột đã nhớ» trong hộp | Huỷ |
| ST-mau-xoa-da-mat | Mẫu nhập | «Cột này đã bị xoá trước đó» trong hộp, dòng mất khỏi bảng | Huỷ |
| ST-mau-dien-thoai | Mẫu nhập | Hai cột, dòng phụ «Ghép vào <trường> · <n giá trị> · <nguồn>» | Sửa, Xoá trong màn |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Dưới `lg` (1024 px) xếp hai cột; không cuộn ngang kể cả với tiêu đề 200 ký tự.
- Esc trong hộp xoá: đóng khi không gửi, không đóng khi đang gửi. Esc trong hộp gỡ nhãn: như «Giữ nhãn».

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| AlertDialog, FieldError, NumberField | dùng | Đã có trên màn; chỉ đổi prop |
| Table | ghép | Giữ thành phần đang có; dòng phụ đặt lại chữ của ba cột trong ô đầu, tới khi hàng `cai-dat-bang-dung-khung` thay bảng |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: giữ nguyên khuôn `cai-dat-san` của các màn đã ký; hàng này không đổi bố cục màn.

### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Quản trị sàn |
| Việc chính | Chỉnh nhãn, mẫu nhập, thuế phí của sàn mà không mất việc đang sửa |
| Tần suất | hiếm |
| Số bản ghi | vài chục |
| Thiết bị | cả hai |
<!-- UX-SPEC-TEMPLATE>>> -->
