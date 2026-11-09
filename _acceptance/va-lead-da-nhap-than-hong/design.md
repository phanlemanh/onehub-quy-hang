# Thiết kế: va-lead-da-nhap-than-hong — Lead đã nhập không treo khi nội dung hỏng

Ngày 09/11/2026 · dãy L · hạng T2 · hàng vá từ Ngoài-3 của `hom-nay-chiu-loi-tung-phan`.

## 1. Mục tiêu và điều không làm

Lời đọc danh sách của Lead đã nhập trả 200 mà nội dung hỏng thì hiện đang ném lỗi, không ai bắt, màn đứng mãi ở khung chờ và không còn «Thử
lại»; nội dung là JSON nhưng không phải danh sách thì màn vỡ lúc dựng. Mục tiêu: mọi nội dung không dùng được đi đúng đường «đọc hỏng» đã có.

Không làm: tự thử lại sau 2 giây; đổi khối báo lỗi; đổi nút «Sửa số và gửi lại».

## 2. Thiết kế

`lay()` của `leads/mine/nguon-that.tsx` đọc qua `docMang<MyLeadView>("/api/v1/leads", chon)` (`today/viec/doc-nguon.ts`), hàm Hôm nay đã dùng cho
chính địa chỉ này: mã lỗi, mất mạng, thân hỏng, nội dung không phải mảng đều là `null`. `chon` thêm một điều kiện: mỗi phần tử phải là một lead
(có mã, tên toà và nấc bằng chữ); có phần tử sai khuôn thì cả lần đọc là hỏng, vì màn dựng từng dòng từ các trường ấy. Màn đã xử `null` bằng khối báo lỗi có «Thử lại» và tự đọc
lại khi có mạng (từ #238), nên không đổi tệp màn. Chỗ tự đọc lại khi có mạng cũng hết đường biến khối lỗi thành khung chờ vô hạn.

## 3. Rủi ro

- `docMang` gọi với `credentials: "same-origin"`, trùng mặc định của `fetch`: không đổi quyền đọc.

## Đặc tả UX
<!-- <<<UX-SPEC-TEMPLATE -->

### 1. Luồng

- Suôn sẻ: mở Lead đã nhập → đọc → thấy danh sách (điểm ra: sửa số hay đọc tiếp).
- Biên: danh sách rỗng thì trạng thái «Chưa có lead nào» như cũ.
- Lỗi & quay lại: nội dung hỏng → một khối báo lỗi và «Thử lại»; bấm khi máy chủ trả đúng thì danh sách hiện.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Lead đã nhập | Telesales xem lead mình nhập | Hôm nay, nhà Lead / sửa số |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-lead-da-nhap-noi-dung-hong | Lead đã nhập | Khối «Không tải được lead đã nhập» + «Thử lại», không khung chờ | Thử lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Không có hành vi mới: khối báo lỗi và đọc lại khi có mạng đã có từ #238.

### 5. Xuất xứ component

| Component | Nấc | Vì sao |
|---|---|---|
| Không thêm | — | Dùng lại `BaoLoiVung` đang có trên màn |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách giữ nguyên.
Căn cứ: hàng không đổi cấu trúc màn, chỉ đổi đường đọc dữ liệu; không tra mẫu.

### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Telesales |
| Việc chính | Biết chắc danh sách chưa đọc được và có lối thử lại |
| Tần suất | hiếm |
| Số bản ghi | vài chục |
| Thiết bị | cả hai |
<!-- UX-SPEC-TEMPLATE>>> -->
