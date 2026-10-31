# Từ vựng Quỹ hàng

Nhãn trên màn bằng tiếng Việt; tên trong code bằng tiếng Anh, theo RESO khi có. Tên code đánh dấu *(đề xuất)* chưa
dùng trong code — chốt khi viết phần đó. Khái niệm mới: thêm dòng ở đây cùng commit với nhãn mới.

| Nhãn trên màn | Code | Nghĩa | Không dùng |
|---|---|---|---|
| Quỹ hàng | — | Tên ứng dụng | Tên một nhà trong app |
| Sàn | `company` | Công ty dùng Quỹ hàng; mỗi sàn một vùng dữ liệu riêng | — |
| Bảng hàng | `inventory` *(đề xuất)* | Tập hàng của sàn; nhà trên máy tính, tab trên điện thoại | «Quỹ hàng» cho nhà này |
| Hàng | `listing` *(RESO `Property`)* | Một lần chào bán của sàn trên một căn | «Tin» (tin là của Invest) |
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
| Vai | `role` | Một trong năm: Telesales `telesales`, Đầu chủ `listing_agent`, Đầu khách `buyer_agent`, Trưởng nhóm `team_lead`, Quản trị sàn `company_admin`; một người giữ được nhiều vai | — |
| Quản trị sàn | `company_admin` | Vai cấu hình sàn và quản người; không tự thấy chủ nhà | — |
| Khu | `zone` | Toà hay phân khu do sàn tự đặt tên; gắn danh mục sau | — |
| Khu phụ trách | `member_zone` | Khu một người trong sàn phụ trách | — |
| Sự kiện của hàng | `listing_event` | Một lần thay đổi của hàng: tạo, đổi phần lần rao, đổi giá, đổi trạng thái, xác nhận với chủ nhà; chỉ thêm, ghi người và vai lúc làm (ADR-0008) | — |
| Trạng thái chuẩn | `StandardStatus` (RESO) | Một trong sáu: Chưa đủ để rao `Incomplete`, Đang bán `Active`, Đang giao dịch `Pending`, Đã bán `Closed`, Tạm ngừng `Hold`, Ngừng hẳn `Withdrawn`; nhãn riêng của sàn neo vào đây | Trạng thái thứ bảy |
| Độ tươi | `freshness` | Tuổi của lần xác nhận gần nhất với chủ nhà, tính từ sự kiện | — |
| Mức đủ thông tin | `completeness` | Phần đã có trên năm mục của danh sách hỏi: giá kèm điều kiện phí, nội thất, pháp lý, tài chính, tình trạng sử dụng | — |
| Giá chốt · Ngày bán | `ClosePrice` · `CloseDate` (RESO) | Giá và ngày sàn mình bán; bắt buộc khi vào Đã bán, giữ lại sau đó | — |
| Lý do ngừng | `withdrawn_reason` | Chủ đã bán nơi khác · chủ đổi ý · không liên lạc được; bắt buộc khi vào Ngừng hẳn | — |
| Phiên bản (của hàng) | `version` | Số sự kiện đã ghi của hàng; lệnh mang phiên bản cũ bị báo «đã có người sửa trước» | — |
| Nhà | `Home` (`packages/core` navigation) | Một chỗ làm việc trả lời một câu (Tham chiếu §9); cột biểu tượng trên máy tính, tab dưới trên điện thoại | — |
| Hôm nay | `today` | Nhà mở đầu: giờ làm gì | — |
| Đã gửi · Gửi | `shares` | Link đã gửi và lịch xem; trên điện thoại là tab Gửi, gồm cả nút gửi mới | — |
| Đội | `team` | Nhà của trưởng nhóm: đội đang chạy thế nào | — |
| Cài đặt sàn | `settings` | Nhà của quản trị sàn: sàn gọi tên và chạy theo luật nào | — |
| Tôi | `me` | Tab tài khoản trên điện thoại | — |
| Gõ mã căn | `unitJump` | Ô mở thẳng hồ sơ căn hoặc nhảy tới nhà bằng bàn phím; chỉ vai có Bảng hàng | — |
| Hồ sơ căn | `/units/<mã>` | Toàn bộ thông tin của một căn; trên máy tính mở thành cột phải cạnh Bảng hàng | — |
| Kho trên máy | `LocalStore` | Bản hàng, lịch sử căn đã mở và thay đổi chờ gửi giữ trên thiết bị của một người, theo từng sàn; đăng xuất là xoá | «Bộ nhớ đệm» |
| Thay đổi chờ gửi | `PendingOp` | Một lần sửa đã ghi trên máy, chưa được máy chủ nhận | «Bản nháp» |
| Cần xem | `needsReview` | Căn có thay đổi chờ mà máy chủ không nhận (hai người cùng sửa, căn đã cọc/đã bán, bị từ chối); người chọn lối | «Xung đột» trên màn |
| Chỉ báo đồng bộ | `SyncIndicator` | Chữ trên thanh trên nói đang ở đâu: Đã đồng bộ, Đang gửi, Mất mạng, Cần xem | Chỉ màu không chữ |
| Nhập Excel | `import` | Nút đưa hàng vào từ bảng tính | — |
| Phát hàng | `export` | Nút đưa hàng ra ngoài sàn | — |
| Chủ nhà (của hàng) | `listing_owner` | Tên, số, giá đáy của chủ nhà một hàng; lớp `source`, chỉ đầu chủ giữ căn và trưởng nhóm thấy (ADR-0010) | «Người bán» |
| Mở số chủ | `owner_phone_reveal` | Lần bấm xem số đầy đủ của chủ nhà; mỗi lần là một sự kiện ghi người, vai, lúc | «Xem số» |
| Lần nhập | `imports` (bảng) | Một lần đưa file bảng hàng vào: kế hoạch, kết quả từng dòng, hoàn tác được cả lần (ADR-0011) | — |
| Mẫu file nhập | `import_template` *(đề xuất)* | Cách ghép cột và đọc giá trị sàn đã dùng cho một kiểu file; nhập lại cùng kiểu thì máy ghép sẵn | — |
| Từ điển giá trị | `company_value_aliases` *(đề xuất)* | Cách viết riêng của sàn neo vào giá trị chuẩn («BP» → Bao phí); học từ lựa chọn của người, quản trị sàn duyệt | — |
| Xử lý bằng AI | `ai_processing` *(đề xuất)* | Loại kết nối: gửi hồ sơ cột đã che cho nhà cung cấp AI lập kế hoạch nhập; sàn bật / tắt; không bao giờ mở lớp nguồn | «Tích hợp AI» |
| Cấu hình sàn | `company_settings` *(đề xuất)* | Giá trị sàn đặt cho một điểm sàn chỉnh được; sàn chưa đặt thì nhận mặc định dựng sẵn; mỗi lần đổi là một sự kiện ghi người và vai (ADR-0018) | «Tuỳ biến» |
| Điểm sàn chỉnh được | `config key` *(đề xuất)* | Một dòng của sổ điểm biến thiên: khoá, kiểu, mặc định, khoảng, ai đổi, hiệu lực, lớp dữ liệu (`docs/architecture/so-diem-bien-thien.md`) | — |
