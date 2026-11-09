# Thiết kế: hom-nay-chiu-loi-tung-phan — khi một phần đọc lỗi, màn vẫn nói đúng

Ngày 09/11/2026 · dãy L · hạng T2 · R1 của audit màn Hôm nay, phạm vi đã thu sau khi `hom-nay-mot-danh-sach-viec` gộp (#230,
5d55d0cc). Đặt trong hồ sơ như các hàng vá của đợt. Kết quả đo từng vấn đề: bảng trong `opportunity.md`.

## 1. Mục tiêu và điều không làm

Mục tiêu: những chỗ còn lại, đo được trên bản mới, hết nói sai và tự hồi. Bốn nguồn việc của Hôm nay đã đúng từ #230 thì giữ
nguyên. Đây cũng là chỗ dựng khối của mẫu «Lỗi» (ADR-0024 sửa đổi 09/11): một vùng một báo lỗi, luôn có «Thử lại», không lộ
mã thô, mất mạng thì tự đọc lại.

Không làm: gộp lỗi nhiều nguồn của Hôm nay thành một câu (điều kiện bật của hàng: mỗi nguồn một câu); đổi API đội (A7 đã hết
ở màn, chuỗi rỗng được thay chữ); thêm lối đọc mới; áp mẫu Lỗi cho nhà khác (ADR: nhà khác áp khi có hàng chạm tới).

## 2. Thiết kế theo chỗ

**Khối chung.** Thêm `BaoLoiVung` vào `components/trang-thai.tsx`, dựng trên `TrangThai kind="error"`, nhận câu, mô tả và
`onThuLai`; nút «Thử lại» viền, cỡ nhỏ, biểu tượng xoay, đặt ở chỗ hành động của `TrangThai` (cạnh câu), đúng như Hôm nay đang có. Đội và Lead đã nhập đang đặt nút dưới câu nên về chỗ này. Hôm nay, Đội, tin ở Đã gửi và Lead đã nhập
dùng khối này; không chỗ nào tự ghép nút nữa.

**Đọc có thử lại, đọc lại khi có mạng.** Dùng lại `docCoThuLai` và `nguonCanDocLai` (`today/viec/doc-nguon.ts`), thêm
`docKetQuaCoThuLai` nhận kết quả dạng `{ ok, items }` của `nguon.ts`. Tệp `today/viec/mang.ts` giữ `useNgoaiTuyen` (đang chép
ở hai màn) và `useKhiCoMangLai`.

**Hôm nay.**
- Câu về bộ nhóm chỉ áp cho người có vai Đầu chủ: luật thuần `nguonBoNhom` trả `khong-ap` cho vai khác.
- Bộ nhóm đọc qua `docCoThuLai`; mạng trở lại thì nguồn «lead giao» cần đọc lại khi bộ nhóm hoặc lead lỗi.
- Nguồn cần đọc lại khi có mạng tính bằng luật thuần `trangNguonCanDoc` (mỗi nguồn một dòng, gồm bộ nhóm và danh sách đầu chủ), không viết tại màn.
- Danh sách đầu chủ thành nguồn riêng `dau-chu-san`, có trạng thái, tự thử lại, tự đọc lại. `gopViec` báo «Chưa tải được danh
  sách đầu chủ» khi người xem là trưởng nhóm, nguồn này lỗi, và hàng đợi đọc được có ít nhất một dòng; hàng đợi đã lỗi thì chỉ
  câu của hàng đợi, không có dòng thì không có gì cần tên.
- Nút «Giao lại» theo luật `trangNutGiao`: đang đọc hay đọc lỗi thì tắt, không kèm câu; đọc xong mà rỗng mới nói «Sàn chưa có
  đầu chủ nào».
- Dòng việc của trưởng nhóm hiện lỗi giao tại chỗ trên máy tính, cùng kiểu với dòng của đầu chủ; điện thoại đã có.
- Cột thứ hai: «Tất cả việc» không có số khi tổng bằng 0 mà có nguồn lỗi; nhóm tự đặt của sàn thuộc nguồn lead theo `subject`.
- Mở lúc mất mạng, chưa có việc nào và có nguồn chưa đọc được: thân có một câu «Chưa đọc được việc của bạn» + «Máy sẽ tự đọc
  lại khi có mạng.» (luật `canBaoChuaDoc`).

**Đội.** Một vùng một báo lỗi: `baoLoiDoi` trả câu theo nguồn hỏng (hàng đợi thắng), một `BaoLoiVung`, «Thử lại» đọc lại cả
hai. Hai nguồn đọc có thử lại. Mất mạng chỉ theo trình duyệt, cùng luật với Hôm nay: bỏ cờ `mang` dính từ lời gọi. Trạng thái mất mạng không có «Thử lại», và sự kiện có mạng không bắn khi trình duyệt chưa từng báo mất; giữ cờ thì phải thêm nút vào trạng thái ấy, khi đó chỉ còn khác nhau ở câu chữ. Trình duyệt còn mạng mà lời gọi không tới là lỗi đọc có «Thử lại». Mạng trở lại thì đọc lại nguồn lỗi. Câu mất mạng: có số thì «Số là lần đọc cuối.», chưa
có số thì «Máy sẽ tự đọc lại khi có mạng.»; không còn nói «giao lại» vì nút đó đã về Hôm nay. Ô tròn của «Chưa rõ tên» là «—».

**Đã gửi · tin của khách.** Đọc qua `docMang` + `docCoThuLai` (`docTinDauKhach` trong `shares/tin/dau-khach.ts`): nội dung
hỏng là lỗi, không phải khung chờ. Mạng trở lại tự đọc khi đang lỗi. **Lead đã nhập:** khối chung và tự đọc lại.

## 3. Rủi ro

- Nguồn mới không được chặn «đang tải»: danh sách đầu chủ đọc chậm không được giữ khung chờ cả màn (`dangTai` không xét nó).
- Bộ nhóm thử lại làm lead chờ thêm 2 giây khi bộ nhóm lỗi, vì hai lời đọc cùng một `Promise.all`; chấp nhận, không tách
  (chỉ xảy ra lúc lỗi).
- Dev chạy hiệu ứng hai lần: bài nhìn màn giả lập lỗi cho hai lời gọi đầu, một lời gọi bị nuốt bởi lượt huỷ.

## Đặc tả UX
<!-- <<<UX-SPEC-TEMPLATE -->

### 1. Luồng

- Suôn sẻ: mở Hôm nay / Đội / Đã gửi → đọc → thấy việc, số, tin (điểm ra: làm việc như thường).
- Biên: người không có vai Đầu chủ thì bộ nhóm không áp; hàng đợi rỗng thì danh sách đầu chủ lỗi không cần báo.
- Lỗi & quay lại: một nguồn hỏng → máy thử lại sau 2 giây → còn hỏng thì một câu tại vùng và «Thử lại»; mất mạng → một câu,
  mạng về tự đọc, câu biến mất.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hôm nay | Làm việc của mình trong ngày | Mở app, cột thứ hai / từng việc |
| Đội | Trưởng nhóm xem số và độ tươi theo đầu chủ | Nhà Đội / Hôm nay để giao lại |
| Đã gửi · Tin của khách | Đọc phản ứng của khách | Nhà Đã gửi / lần gửi, luồng Gửi |
| Lead đã nhập | Telesales xem lead mình nhập | Hôm nay, nhà Lead / sửa số |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-homnay-bo-nhom-khong-ap | Hôm nay | Người không có vai Đầu chủ: không câu nào về bộ nhóm | Làm việc |
| ST-homnay-dau-chu-loi | Hôm nay | «Chưa tải được danh sách đầu chủ» + «Thử lại»; nút «Giao lại» tắt, không câu kèm | Thử lại hay chờ mạng |
| ST-homnay-giao-loi | Hôm nay | Câu lỗi dưới nút của dòng, dòng giữ nguyên | Giao lại lần nữa |
| ST-homnay-chua-doc | Hôm nay | Mất mạng, chưa có việc: «Chưa đọc được việc của bạn» · «Máy sẽ tự đọc lại khi có mạng.»; cột không số | Chờ |
| ST-doi-loi | Đội | Một khối: «Không tải được lead quá hạn» hay «Không tải được tên đầu chủ» + «Thử lại» | Thử lại |
| ST-doi-mat-mang | Đội | «Đang mất mạng» · «Số là lần đọc cuối.» hay «Máy sẽ tự đọc lại khi có mạng.» | Chờ, mạng về tự đọc |
| ST-tin-loi | Đã gửi · Tin | Khối lỗi có sẵn chữ + «Thử lại», không khung chờ | Thử lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Thử lại một lần sau 2 giây trước khi báo. Mạng trở lại chỉ đọc nguồn đang lỗi.

### 5. Xuất xứ component

| Component | Nấc | Vì sao |
|---|---|---|
| `BaoLoiVung` | ghép trên `TrangThai`, `Button` | ADR-0024 chỉ định khối mới trên `TrangThai`; không có bố cục mới, đúng hình Hôm nay đang có |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: bảng-điều-khiển (Đội) và danh-sách (Hôm nay) giữ nguyên.
Căn cứ: hàng không đổi cấu trúc màn nào, chỉ đổi trạng thái lỗi trong vùng; không tra mẫu.

### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Trưởng nhóm, Đầu chủ, Đầu khách, Telesales |
| Việc chính | Biết chắc phần nào đọc được, phần nào chưa, khi có lỗi |
| Tần suất | hiếm |
| Số bản ghi | vài chục |
| Thiết bị | cả hai |
<!-- UX-SPEC-TEMPLATE>>> -->
