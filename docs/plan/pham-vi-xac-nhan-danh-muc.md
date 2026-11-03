# Bản phạm vi — xác nhận danh mục và tra căn (03/11)

Nguồn: lời giao issue #94 của phiên phía Invest; căn cứ bên kho invest là PR phanlemanh/onehub-invest#296 (đã gộp 03/11):
ROADMAP §3 mục 28, ADR-0017 §6 sửa đổi 03/11, bản thiết kế `2026-11-03-danh-ba-xac-nhan-toan-quoc-design.md`. Trang tri
thức của đợt: `docs/tri-thuc/wiki/dot/xac-nhan-danh-muc-0311.md`. Việc của người không nằm ở đây — xem «Ra khỏi kho» ở mô
tả PR cắt lượt.

<!-- <<<PHAM-VI-MA -->
```
dot: xac-nhan-danh-muc-0311
dang: chuoi
nguon: wiki/dot/xac-nhan-danh-muc-0311.md#fb1540377172027dcbc7535b3c822e1c65f72e8b

- `XN1` — khuôn «nguồn danh mục và thị trường» phiên bản 2: danh mục kèm độ chắc từng giá trị, số thị trường theo toà và loại căn có mốc đo, tin rao công khai đã khớp căn; v1 còn nhận trong thời gian chuyển
- `XN2` — khuôn sự kiện «xác nhận danh mục» phiên bản 1 (khung toà, thuộc tính căn, báo sai; biểu mẫu đóng; mã công ty và mã người mờ) dựng từ luật ẩn ở lõi; loại kết nối chiều ra chỉ mở được lớp danh mục
- `XN3` — người của sàn khai khung toà (số tầng, tầng bị bỏ, danh sách trục) trong lúc làm việc
- `XN4` — token máy gắn với một thoả thuận: bên kia đẩy gói vào và kéo sự kiện ra mà không cần phiên người
- `XN5` — hộp thư đi sự kiện xác nhận có API kéo theo số thứ tự; cơ sở dữ liệu chỉ nhận cột lớp danh mục
- `XN6` — thoả thuận «xác nhận danh mục» từng sàn: quản trị sàn bật, tắt, có nhật ký; chỉ sàn vận hành đã mở mới bật được
- `XN7` — thuộc tính căn do sàn nhập, sửa hay báo sai, giữ là lời của sàn; giá trị danh mục chưa chắc không điền sẵn
- `XN8` — sinh sự kiện xác nhận từ công việc khi sàn bật thoả thuận; giá trị nhận nguyên từ danh mục không sinh sự kiện
- `XN9` — gõ mã căn, bảng hàng và hồ sơ căn đọc vùng danh mục dùng chung thay gói mẫu cố định
- `XN10` — tra căn: hồ sơ căn hiện số thị trường của toà và loại căn, tin rao công khai đã khớp căn
- `XN11` — nhập bảng hàng sinh sự kiện thuộc tính căn cho phần lớp danh mục
```
<!-- PHAM-VI-MA>>> -->

## Hàng

Thứ tự đặt khuôn 1 (94) và khuôn 2 (95) lên đầu, cùng đứng trên hàng 10 đã giao, để DN5 và DN6 của Invest bắt đầu sớm:
hai hàng chạy song song được, mỗi hàng một tệp khuôn riêng.

| Mã | Hàng | Câu giao (tóm) | Hạng | Đứng trên |
| --- | --- | --- | --- | --- |
| XN1 | 94 `khuon-nguon-danh-muc-v2` | Gói v2 (danh mục có độ chắc, số thị trường, tin rao đã khớp căn) nhận được khi thoả thuận bật; v1 vẫn nhận | T3 | 10 |
| XN2 | 95 `khuon-xac-nhan-danh-muc` | Sự kiện xác nhận chỉ dựng được từ lõi theo khuôn v1; mọi trường ngoài lớp danh mục bị từ chối | T3 | 10 |
| XN4 | 96 `token-may-ket-noi` | Bên kia gọi API bằng token máy gắn đúng một thoả thuận; tắt hay thu hồi thì lời gọi kế bị từ chối | T3 | 10 |
| XN5 | 97 `hop-thu-xac-nhan` | Máy thu kéo sự kiện theo số thứ tự, không trùng, không sót; máy thu tắt thì sự kiện nằm chờ | T3 | 95, 96 |
| XN6 | 98 `thoa-thuan-xac-nhan-theo-san` | Quản trị sàn bật, tắt thoả thuận và thấy nhật ký; tắt thì hộp thư ngừng nhận ngay | T3 | 97 |
| XN9 | 99 `doc-vung-danh-muc` | Gõ mã căn, bảng hàng, hồ sơ căn đọc vùng dùng chung thay gói mẫu | T2 | 10 |
| XN7 | 100 `thuoc-tinh-can-cua-san` | Đầu chủ nhập, sửa, báo sai thuộc tính căn; giá trị chưa chắc không điền sẵn | T3 | 94, 99 |
| XN8 | 101 `sinh-xac-nhan-tu-cong-viec` | Giá trị người nhập hay sửa thành sự kiện ở hộp thư đi khi thoả thuận bật | T3 | 97, 100 |
| XN10 | 102 `tra-can-thi-truong` | Hồ sơ căn hiện số thị trường và tin rao đã khớp căn, trên gói mẫu sinh từ khuôn | T2 | 94, 99 |

Mục chờ: **H18** (XN3) — khung toà cần một màn nhìn toà theo trục × tầng; Quỹ hàng chưa có màn nào như vậy, và lát đầu
không làm màn đi đếm. Khuôn 95 vẫn chở loại sự kiện khung toà để Invest dựng cửa kiểm một lần. **H19** (XN11) — nhập bảng
hàng (hàng 64–67) còn trong đợt dau-khach-nhap; mở lại khi hai đầu đã giao và số sự kiện từ công việc cho thấy cỡ lô.

## Chi tiết cho vòng mở sau

- **Hàng 94 giữ 11 tiêu chí.** Invest ghim một số phiên bản; tách v2 làm hai hàng thì Invest phải ghim hai lần (v2 rồi
  v3) cho DN5. Độ chắc dùng ba nhãn của Invest: «Suy ra» `inferred` · «Một nguồn xác nhận» `single_source` · «Đã xác
  minh» `verified`. Số thị trường là ảnh chụp theo mốc đo: gói sau thay gói trước cho cùng khu. Tin rao không mang
  đường dẫn bài gốc, tên nguồn, tên miền, ảnh (ADR-0017 §5). Hàng sinh gói mẫu có nhãn từ chính khuôn cho hàng 102.
- **Hàng 95 — trần theo loại kết nối.** Hôm nay trần chỉ chặn lớp nguồn ở mọi thoả thuận; giá chốt vẫn mở được bằng điều
  khoản riêng. Loại `catalog_confirmation` chiều `outbound` chỉ được mang lớp `catalog`: chặn ở `agreementErrors`/`mayFlow`
  và ở ràng buộc của bảng `agreements` (migration mới). Danh sách «không bao giờ có» của issue (chủ nhà, số, giá đáy, ảnh
  sổ, giá chốt, trạng thái hàng) là ca kiểm đỏ của luật ẩn. Cổng Phạm vi trình cách giảm tín hiệu «sàn đang làm hàng
  căn này»: mã công ty, mã người mờ theo từng bên nhận; không trỏ hàng; không sinh sự kiện chỉ vì tạo hàng; mốc thời gian
  thô. Khuôn chở cả ba loại sự kiện kể cả khung toà. Đề xuất trình cùng Cổng Phạm vi: ô «sàn đã xác minh chủ với sổ»
  (có / không, ngày xác minh; không tên, không số) để Invest biết căn có chủ thật mà chủ nhà vẫn ở lại sàn — chủ kho chốt
  03/11 không làm công tắc theo trường cho lớp nguồn.
- **Hàng 96** là lớp đăng nhập máy, tách khỏi hộp thư (luật 3). Token hiện một lần, lưu dạng băm, phạm vi là loại kết nối
  và chiều của thoả thuận; mỗi lời gọi một dòng nhật ký. Áp cho cửa nhận `POST /api/v1/catalog/feeds` (bỏ «để sau» của
  ADR-0015) và cho API kéo của hàng 97.
- **Hàng 97 — cách ly khi một bên kéo từ nhiều sàn.** Đề xuất: token gắn thoả thuận của một sàn, luật theo dòng làm việc
  cách ly như mọi bảng; không hàm vượt luật. Con trỏ kéo theo mẫu EntityEvent của RESO Web API (`EntityEventSequence`).
  Bảng hộp thư chỉ có cột lớp danh mục, không cột jsonb tự do; ca cách ly «sàn này không kéo được sự kiện sàn kia».
- **Hàng 98** chặn việc pháp lý ở mức máy: danh sách sàn được bật do vận hành thêm (như `catalog_trusted_companies`); sàn
  ngoài đội chỉ vào danh sách sau khi chủ kho rà xong.
- **Hàng 99** thay `SAMPLE_CATALOG` ở mọi chỗ đọc; danh mục Invest lúc đầu thưa, căn không có vẫn đi đường mã ngoài danh
  mục như hiện nay.
- **Hàng 100** một chỗ cho ba ca: căn chưa có trong danh mục, giá trị danh mục chưa chắc, giá trị danh mục sai (thay bảng
  soạn tin của «Báo sai thông tin căn» ở hàng 17 khi sàn bật thoả thuận; tắt thì giữ bảng chia sẻ). Hồ sơ căn cho người
  thấy lời của họ đi vào danh bạ chung theo thoả thuận của sàn. Bước thiết kế chạy `design-pass`.
- **Hàng 102**: tin rao chỉ đầu chủ và trưởng nhóm thấy (Tham chiếu §4); số thị trường mọi vai có Bảng hàng thấy. Gánh
  luôn ý của mục chờ H2 (tin rao trên thẻ lead) khi hàng ấy mở lại.
- RESO: tên căn giữ như khuôn v1 (`unitNumber`, `livingArea`, `bedroomsTotal`, `directionFaces`, `floor`, `stack`); toà
  `storiesTotal`; tầng bị bỏ, độ chắc, số thị trường đặt tên riêng; mã công ty, mã người theo khoá `OfficeKey`,
  `MemberKey` của RESO nhưng giá trị là mã mờ. Mỗi hàng đối chiếu thêm ở S1 theo ADR-0022.
