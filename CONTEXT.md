# Từ vựng Quỹ hàng

Nhãn trên màn bằng tiếng Việt; tên trong code bằng tiếng Anh, theo RESO khi có. Tên code đánh dấu *(đề xuất)* chưa
dùng trong code — chốt khi viết phần đó. Khái niệm mới: thêm dòng ở đây cùng commit với nhãn mới.

| Nhãn trên màn | Code | Nghĩa | Không dùng |
|---|---|---|---|
| Quỹ hàng | — | Tên ứng dụng | Tên một nhà trong app |
| Sàn | `company` | Công ty dùng Quỹ hàng; mỗi sàn một vùng dữ liệu riêng | — |
| Bảng hàng | `inventory` *(đề xuất)* | Tập hàng của sàn; nhà trên máy tính, tab trên điện thoại | «Quỹ hàng» cho nhà này |
| Hàng | `listing` *(đề xuất, RESO `Property`)* | Một lần chào bán của sàn trên một căn | «Tin» (tin là của Invest) |
| Căn | `unit` *(đề xuất)* | Vật thể trong danh mục: dự án → toà → trục → căn | — |
| Lead | `lead` *(đề xuất)* | Hàng ở nấc đầu, từ telesales hoặc đầu chủ tự nhập | — |
| Đầu chủ | `listing_agent` *(đề xuất, RESO `ListAgent`)* | Người giữ nguồn chủ nhà của căn | «Người giữ» |
| Đầu khách | `buyer_agent` *(đề xuất, RESO `BuyerAgent`)* | Người đem căn đi bán cho khách | — |
| Bao phí / Không bao phí | *(đề xuất)* | Giá đã / chưa gồm thuế TNCN, lệ phí trước bạ, phí môi giới theo định nghĩa của sàn | Trên trang khách: «đã / chưa gồm phí chuyển nhượng» |
| Giá về tay | *(đề xuất)* | Số chủ nhà nhận sau thuế phí | — |
| Giá đáy | *(đề xuất)* | Mức thấp nhất chủ từng nói; thuộc lớp `source` | — |
| Sẵn sàng bán | *(đề xuất)* | Nút đưa hàng lên bảng sau khi máy kiểm đủ điều kiện | «Duyệt» |
| Trang khách · Link sống | *(đề xuất)* | Trang công khai từ link; giá và trạng thái theo bảng hàng | — |
| Thoả thuận | `agreement` | Cho phép một loại kết nối chảy theo một chiều, cho các lớp dữ liệu, trong một thời hạn | «Tích hợp» |
| Kết nối | `connection_kind` | Loại đường nối: nguồn danh mục, kênh đăng, nguồn lead, bảng tính, hợp tác giữa công ty, API của công ty | — |
| Lớp dữ liệu | `data_class` | Nhóm trường cùng một trần; thoả thuận chỉ mở tới trần | — |
| Thành viên sàn | `company_member` | Một người thuộc một sàn; một người thuộc được nhiều sàn | — |
| Sàn đang làm | `active company` (cookie `qh_san`) | Sàn mà mọi lời gọi của người đang chạy trong đó; người nhiều sàn chọn ở màn Chọn sàn | — |
| Mã đăng nhập | `otp` | Mã 6 số gửi qua email để đăng nhập | «Mật khẩu» |
