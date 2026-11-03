---
loai: dot
ma: [XN1, XN2, XN3, XN4, XN5, XN6, XN7, XN8, XN9, XN10, XN11]
nguon: [raw/2026-11-03-xac-nhan-danh-muc/issue-94.md]
cap_nhat: 2026-11-03
---
# Đợt xac-nhan-danh-muc-0311 — xác nhận danh mục và tra căn

Phía Invest chốt 03/11 rằng mạng lưới xác nhận căn toàn quốc là môi giới của các sàn, và lời xác nhận sinh ra ngay trong
công việc hằng ngày ở Quỹ hàng; đội OneHub dùng Quỹ hàng như mọi công ty. Invest sửa ADR-0017 §6 để mở một loại kết nối
chiều ngược, «xác nhận danh mục», chỉ lớp danh mục, máy thu Invest kéo về bằng token máy. Lời giao sang kho này là issue
#94: năm việc — khuôn nguồn danh mục và thị trường, khuôn sự kiện xác nhận, hộp thư đi có API kéo, sinh sự kiện từ công
việc kèm thoả thuận từng sàn, tra căn.

## Điều rút ra

- Khuôn danh mục v1 đã có (hàng 10) nhưng chỉ chở danh mục. «Nguồn danh mục và thị trường» còn thiếu số thị trường theo
  toà và loại căn, tin rao đã khớp căn, và độ chắc của từng giá trị. Thiếu độ chắc thì Quỹ hàng không biết giá trị nào
  không được điền sẵn — luật «không mớm lời xác nhận» của Invest phụ thuộc vào khuôn 1.
- Cửa nhận hiện chỉ nhận gói từ phiên đăng nhập của quản trị sàn; ADR-0015 để sau «khoá máy cho Invest tự đẩy». Cả
  chiều vào (Invest đẩy) lẫn chiều ra (Invest kéo) đều cần token máy gắn với một thoả thuận — một hàng nền riêng vì chạm
  lớp đăng nhập.
- Lời ghi ở AGENTS «không mở cửa cho Invest gọi vào» đọc theo chữ thì trái với cả cửa nhận đang có lẫn API kéo mới. Ý
  gốc của ADR-0017 là Invest không có cửa vào; Quỹ hàng mở API có thoả thuận. Sửa lời cho khớp.
- Danh sách «không bao giờ có» của sự kiện gồm lớp nguồn (chủ nhà, số, giá đáy, ảnh sổ), lớp giao dịch (giá chốt) và
  trạng thái hàng. Trần hiện tại chỉ chặn lớp nguồn ở mọi thoả thuận; giá chốt vẫn mở được bằng điều khoản riêng. Loại
  kết nối «xác nhận danh mục» cần trần riêng theo loại: chỉ lớp danh mục, chặn ở lõi và ở ràng buộc cơ sở dữ liệu của
  cả bảng thoả thuận lẫn bảng hộp thư đi.
- Bản thân việc một sàn phát sự kiện trên một căn vào một lúc đã gần với «sàn này đang làm hàng căn này». Giảm bằng: mã
  công ty và mã người mờ theo từng bên nhận, không trỏ tới hàng, không sinh sự kiện chỉ vì tạo hàng, mốc thời gian thô.
  Chốt ở Cổng Phạm vi của hàng khuôn sự kiện.
- Bảng hàng của sàn không có chỗ giữ thuộc tính căn do sàn nhập (diện tích, phòng, hướng chỉ lấy từ danh mục), và mọi
  chỗ đọc danh mục vẫn đọc gói mẫu, chưa đọc vùng dùng chung. Hai việc nền này phải có trước sinh sự kiện và tra căn.
- Sửa thuộc tính khác danh mục chính là báo sai: một chỗ nhập lời của sàn phục vụ cả «căn chưa có», «giá trị chưa chắc»
  và «Báo sai thông tin căn» (hàng 17 hiện soạn tin qua bảng chia sẻ).
- Người vẫn là người bấm: thoả thuận do người có thẩm quyền bật, lời xác nhận là giá trị người nhập; bất biến 3 nói về
  kênh nhắn tin, không về dữ liệu máy với máy theo thoả thuận. Nên cho người thấy lời của họ đi vào danh bạ chung.
- Rà pháp lý theo Luật Bảo vệ dữ liệu cá nhân trước sàn đầu tiên ngoài đội là việc của chủ kho; mã người mờ vẫn là dữ
  liệu cá nhân. Máy chỉ dựng chỗ chặn: sàn ngoài danh sách vận hành mở thì không bật được thoả thuận.
- RESO: hộp thư đi kéo theo số thứ tự giống tài nguyên EntityEvent của RESO Web API; tên trường căn giữ như khuôn v1;
  tầng bị bỏ, độ chắc, số thị trường là đặc trưng riêng.

## Mã

- XN1 — khuôn nguồn danh mục và thị trường phiên bản 2: độ chắc, số thị trường, tin rao đã khớp căn
- XN2 — khuôn sự kiện xác nhận danh mục và luật ẩn ở lõi, loại kết nối chiều ra chỉ lớp danh mục
- XN3 — người của sàn khai khung toà khi làm việc (chờ)
- XN4 — token máy gắn thoả thuận cho bên kia đẩy vào và kéo ra
- XN5 — hộp thư đi sự kiện xác nhận có API kéo theo số thứ tự
- XN6 — thoả thuận xác nhận danh mục từng sàn bật tắt có nhật ký
- XN7 — thuộc tính căn do sàn nhập, sửa, báo sai; không điền sẵn giá trị chưa chắc
- XN8 — sinh sự kiện xác nhận từ công việc
- XN9 — mọi chỗ đọc danh mục đọc vùng dùng chung
- XN10 — tra căn: số thị trường và tin rao đã khớp căn
- XN11 — nhập bảng hàng sinh sự kiện thuộc tính căn (chờ)
