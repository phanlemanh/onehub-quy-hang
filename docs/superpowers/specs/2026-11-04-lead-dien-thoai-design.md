# Thiết kế — lead-dien-thoai (hàng 51)

Hàng 51 của lộ trình (dãy D, đợt `dau-khach-nhap`), mã phạm vi L9; màn P1 L4, L5. Câu giao: «Telesales nhập lead trên điện
thoại: thiếu một mục thì chưa gửi được, gửi xong theo dõi được bốn nấc». Đứng trên hàng 24 (Ô nhận lead, `/leads/new`,
khuôn `KhungLead`) và 27 (Lead đã nhập với bốn nấc, `/leads/mine`, khuôn `KhungLeadCuaToi`). T2 — chỉ giao diện, không
đổi API hay cơ sở dữ liệu. Luật đợt 16, 18, 30, 45; dặn của giám sát 04/11: đặt tiêu chí cho trạng thái mất mạng ngay ở
S1, không lặp Ngoài-5/6 của hàng 42 (kẹt «Đang mất mạng» khi có mạng lại; mất mạng lúc mở báo nhầm «không có gì»).

## Hiện trạng đã kiểm (04/11, `origin/main`)

- Tab dưới của telesales trên điện thoại: Hôm nay · Lead · Tôi (`packages/core/src/navigation.ts`); tab Lead mở
  `/leads/new`. Hôm nay của telesales hiện cùng vùng «Lead đã nhập» (khuôn `KhungLeadCuaToi`).
- `/leads/new`: một `Frame` `max-w-3xl` (khuôn `KhungLead`), năm mục, kiểm trước khi gửi bằng `validateLeadInput` của lõi
  (thiếu mục → lỗi dưới đúng ô, không gọi API), mất mạng lúc gửi → báo lỗi mạng (`mang: true`), các ô giữ nguyên.
- `/leads/mine`: bảng ba cột (cột thứ ba ẩn dưới `@md`), trạng thái đang tải / lỗi kèm «Thử lại» / trống. Lỗi tải không
  hiện thành «Chưa có lead nào».
- Hai trang chưa đi qua hệ bố cục (ADR-0024): khuôn `o-nhan-lead.md` và `lead-cua-toi.md` mang `ngoai_le_han` hạn
  `lead-dien-thoai`. Trang ba lối `proto/o-nhan-lead` còn trên cây (lint báo «ngoại lệ có hạn → hàng 51»). Dòng «Chỗ hở»
  Ô nhận lead ở `docs/design/vo-va-ia.md` §3 hạn «khi hàng 51 gộp»; khuôn còn câu «ghép theo khối đích form-2» (luật 30).

## Phương án

1. **Cùng đường, đáp ứng theo khổ** — không mở đường `/leads/mobile`. Tab Lead và nút «+ Lead» đã trỏ `/leads/new`; một
   đường cho hai khổ giữ một luật kiểm, một khuôn. (Vùng `leads/mobile/**` của `hang-viec.json` khai lại ở Cổng Phạm vi.)
2. **Hai trang vào hệ bố cục**: `/leads/new` dùng `BoCuc kieu="doc"` (khuôn đã định «chuyển sang bố cục Đọc ở hàng 51»),
   `/leads/mine` dùng `BoCuc kieu="danh-sach-chi-tiet"` (bố cục đã khai ở khuôn `lead-cua-toi`). Khuôn `KhungLead`,
   `KhungLeadCuaToi` giữ Frame của vùng; gỡ `ngoai_le_han` ở hai khuôn. Dải mất mạng của bố cục (`DaiNgoaiTuyen`) đọc sự
   kiện `online`/`offline` của trình duyệt nên tự tắt khi có mạng lại.
3. **Điện thoại một cột** (vo-va-ia §2 «điện thoại (hàng 51) một cột, cột phải thành tab Lead»): ô số, mã căn + toà, nhu
   cầu, giá, bao phí, thời gian xếp dọc, chạm được (≥ 44 px), không cuộn ngang ở 390 px; ô số mở bàn phím số
   (`inputMode="tel"`), ô giá bàn phím số. Tab Lead trên điện thoại có hai phần «Nhập lead» · «Lead đã nhập» (Tham chiếu vai Telesales «nhập lead, theo dõi bốn nấc»);
   máy tính giữ như hôm nay.
4. **Gửi xong theo dõi được**: dưới kết quả kiểm trùng có lối «Xem ở Lead đã nhập»; dòng lead mới hiện ở nấc «Đã gửi» và
   đổi nấc khi đầu chủ nhận, gọi (dữ liệu từ lối `GET /api/v1/leads` của hàng 27).
5. **Mất mạng**: lúc gửi → báo «Chưa gửi được — mất mạng», giữ nguyên năm mục; mạng về người bấm Gửi lại; máy không tự gửi (Tham chiếu: ghi ngoại tuyến chỉ còn kết quả gọi và đổi giá). Lúc mở
   «Lead đã nhập» → báo lỗi tải kèm «Thử lại», không bao giờ «Chưa có lead nào». Mạng về → dải mất mạng biến mất không cần
   tải lại trang.
6. **Dọn theo luật đợt**: gỡ `proto/o-nhan-lead` (luật 45 — lối đã chọn ở hàng 24), sửa câu «form-2» ở khuôn thành «bản
   ghép là đích» và đóng dòng «Chỗ hở» Ô nhận lead kèm bài kiểm `kiem-chuan` (luật 30).
7. **Máy thật**: bước chủ kho cầm điện thoại thật (luật 16) gom một yêu cầu `can-nguoi`, không phải tiêu chí máy chấm.

## Đối chiếu ngành (ADR-0022)

| Năng lực | RESO | Sản phẩm khác ([Đối chiếu ngành](../../product/doi-chieu-nganh.md)) | Ta làm | Ta cứng — họ cấu hình |
| --- | --- | --- | --- | --- |
| Nhập lead trên điện thoại | Không có tài nguyên màn (RESO chỉ chuẩn dữ liệu) | Follow Up Boss, Lofty: có ứng dụng di động nhập lead — chưa kiểm chi tiết trường bắt buộc | Năm mục bắt buộc của lõi (hàng 24) | Không — năm mục là luật lõi đã chốt (Tham chiếu §8 luật 20), hàng này chỉ đổi khổ |
| Nhập khi mất mạng | — | chưa kiểm | Giữ nháp, người gửi lại | Không |

## Đặc tả UX

<!-- ux-spec:begin -->
### Người · việc · khổ
Telesales, trên điện thoại (390 × 844) là chính; máy tính giữ như hàng 24, 27.

### Khuôn IA đã chọn + căn cứ
Bố cục «Đọc» cho Ô nhận lead (khuôn `o-nhan-lead`, ADR-0024 bảng bố cục), «Danh sách – chi tiết» cho Lead đã nhập (khuôn
`lead-cua-toi`). Không tra mẫu ngoài: khuôn đã khai ở kho.

### Thẻ việc
nhan_viec: nhập một lead · theo dõi nấc lead đã nhập.

### Trạng thái × khổ
| Trạng thái | 390 | 1440 |
| --- | --- | --- |
| Mặc định (ô trống) | một cột, nút Gửi cuối | như hàng 24 |
| Thiếu mục | lỗi dưới đúng ô, không gọi API | như 390 |
| Gửi xong (không trùng / có đầu chủ / căn trùng) | kết quả + lối «Xem ở Lead đã nhập» | như 390 |
| Mất mạng lúc gửi | «Chưa gửi được — mất mạng», năm mục giữ | như 390 |
| Lead đã nhập: đang tải · trống · lỗi · có dòng | một cột, nấc là Badge | bảng ba cột |
| Mất mạng → có mạng lại | dải mất mạng hiện rồi tắt | như 390 |
| Vai không nhập được | khối báo của `KH-ol-khong-quyen` | như 390 |
<!-- ux-spec:end -->
