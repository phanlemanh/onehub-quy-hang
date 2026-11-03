# Xác nhận danh mục và tra căn: khuôn kết nối với Invest (Danh bạ nhà)

Issue phanlemanh/onehub-quy-hang#94 · tạo 2026-11-03T08:50:24Z · phanlemanh

Mạnh chốt ngày 03/11 ở kho invest: mạng lưới xác nhận căn trên toàn quốc là môi giới của sàn, và việc xác nhận nằm ở Quỹ hàng, ngay trong công việc hằng ngày. Đội OneHub đi cùng đường như một công ty bình thường. Tra căn khi giao dịch cũng ở đây; trang Ops của Invest chỉ để kiểm độ phủ và vận hành.

Căn cứ bên kho invest: phanlemanh/onehub-invest#296 (ROADMAP §3 mục 28, ADR-0017 §6 sửa đổi 03/11, `docs/superpowers/specs/2026-11-03-danh-ba-xac-nhan-toan-quoc-design.md`). PR đó có thể chưa gộp khi đọc issue này.

## Việc của kho này

Cắt theo lộ trình của kho này:

1. **Khuôn kết nối «nguồn danh mục và thị trường»** có số phiên bản (ADR-0017 §5). Invest cần khuôn này để làm DN5.
2. **Khuôn sự kiện «xác nhận danh mục»**:
   - Khung toà: số tầng, tầng bị bỏ, danh sách trục.
   - Thuộc tính căn: mã căn, diện tích, số phòng, hướng.
   - Báo sai: trường nào sai, giá trị đúng là gì.
   - Biểu mẫu đóng, không có chữ tự do. Kèm mã công ty và mã người mờ.
   - **Không bao giờ có**: chủ nhà, SĐT, giá đáy, ảnh sổ, giá chốt, trạng thái hàng.
3. **Hộp thư đi có API cho máy thu Invest kéo về** bằng token máy. Invest không nhận webhook và không có cửa vào.
4. **Sinh sự kiện từ công việc**: môi giới chọn hoặc tạo căn để làm việc thì sinh sự kiện. Không điền sẵn giá trị chưa chắc, để lời xác nhận không bị mớm. Không làm việc giao riêng hay màn đi đếm ở lát đầu. Thoả thuận từng sàn, bật tắt được, có nhật ký.
5. **Tra căn**: danh mục, số thị trường, tin rao đã khớp căn, lấy từ nguồn cấp của Invest.

## Điều đã chốt

- Không trả theo lượt: sàn dùng danh mục và số thị trường, xác nhận đi kèm công việc.
- Lát đầu phía Invest: Ocean Park 1 và Grand Park cao tầng, mở thêm bằng cấu hình.
- Hai môi giới cùng sàn không tính là độc lập; phía Invest lên lớp sự thật khi hai công ty cùng giá trị.
- Danh mục sang Quỹ hàng lúc đầu sẽ thưa: thứ chỉ có từ nguồn nội bộ không đi, kể cả tên toà. Vì vậy bảng hàng sàn nhập vẫn là hạt giống (ADR-0017 §5).

## Điều kiện

Rà pháp lý theo Luật Bảo vệ dữ liệu cá nhân trước sàn đầu tiên ngoài đội (ADR-0017 «Còn mở»); việc này của Mạnh.

## Phía Invest đợi gì

- DN5 (nguồn cấp) mở khi có khuôn 1 và DN4 của Invest đã giao.
- DN6 (kéo xác nhận) mở khi có khuôn 2 và DN5 đã giao.

Khi có khuôn, báo lại bằng một bình luận ở phanlemanh/onehub-invest#296 hoặc một issue mới bên kho invest.

