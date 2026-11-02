# Review findings: he-bo-cuc (round 2)

## Trong hợp đồng

Không có finding nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Đóng ngăn toàn màn của Luồng nhiều bước có thể không làm gì, hoặc đưa người ra khỏi trang bao ngoài**
  Người dùng thấy gì: Nếu người dùng mở thẳng một luồng nhiều bước từ đường dẫn chia sẻ hoặc tab mới trên điện thoại, bấm Đóng có thể không có tác dụng và họ chỉ thoát được bằng đường dẫn trong ngăn. Hiện chưa có màn thật nào dùng bố cục này nên chưa ai gặp.
  Căn cứ: Hậu quả nhẹ vì chưa có màn thật nào dùng luồng này, không mất dữ liệu, người dùng thoát được bằng đường dẫn trong ngăn; sửa sau rẻ, nên làm khi màn đầu tiên chuyển sang bố cục này.
  file: `apps/web/src/components/bo-cuc/luong-toan-man.tsx`
  severity: medium
  Đề xuất: known-limits

- **Tuỳ chọn toanMan của NganNoi cũng phủ toàn màn trên máy tính, trái với lời mô tả «chỉ điện thoại»**
  Người dùng thấy gì: Một màn sau này dùng tuỳ chọn ngăn toàn màn theo đúng lời mô tả có thể bị phủ kín cả màn hình máy tính thay vì ngăn bên phải. Hiện không màn nào gặp tình huống này.
  Căn cứ: Chưa ảnh hưởng người dùng nào vì chỉ có một chỗ dùng và chỗ đó đã tự chặn; không mất dữ liệu, sửa rất rẻ khi có màn thứ hai dùng tuỳ chọn này.
  file: `apps/web/src/components/bo-cuc/ngan-noi.tsx`
  severity: low
  Đề xuất: known-limits

- **LuongToanMan: on a phone, closing the flow does nothing when there is no earlier page (direct link or new tab)**
  Người dùng thấy gì: Trên điện thoại, nếu mở luồng nhiều bước đầu tiên trong tab, nút X, phím Esc và chạm ra ngoài đều không đóng được ngăn và không báo gì. Ngăn che cả thanh tab nên người dùng chỉ thoát được qua đường dẫn trong ngăn.
  Căn cứ: Gây bực nhưng không mất dữ liệu và có lối thoát qua đường dẫn trong ngăn; hiện chỉ trang mẫu dùng luồng này, sửa sau rẻ khi màn thật đầu tiên chuyển sang.
  file: `apps/web/src/components/bo-cuc/luong-toan-man.tsx`
  severity: medium
  Đề xuất: known-limits

- **Live sample page: closing the multi-step flow in the 375 frame sends the parent page back**
  Người dùng thấy gì: Khi người kiểm tra giao diện bấm Đóng ngăn luồng nhiều bước trong khung điện thoại của trang mẫu tổng, trang bao ngoài lùi về tổ hợp trước thay vì chỉ đóng ngăn. Chỉ người làm giao diện thấy, người dùng sản phẩm không gặp.
  Căn cứ: Chỉ ảnh hưởng người xem trang mẫu nội bộ, không mất dữ liệu, mở lại tổ hợp là xong; sửa riêng cho trang mẫu không đáng, nó mất đi khi lỗi gốc ở luồng toàn màn được xử lý.
  file: `apps/web/src/app/mau/he-bo-cuc/trang-mau.tsx`
  severity: low
  Đề xuất: wont-fix

- **Màn mẫu Dòng tin và ảnh chuẩn dong-tin-*.png vẫn mang dữ liệu demo tiếng Anh của khối, trong khi TIN_MAU (dữ liệu mẫu tiếng Việt) bỏ không dùng (r1)**
  Người dùng thấy gì: Trang mẫu và ảnh chuẩn Dòng tin hiện chữ tiếng Anh và tên người nước ngoài, nên người so màn mới với ảnh chuẩn sẽ thấy chữ lạ so với giao diện tiếng Việt thật.
  Căn cứ: Chỉ ảnh dùng để đối chiếu nội bộ bị lệch ngôn ngữ, người dùng cuối không thấy, không mất dữ liệu; thay dữ liệu và chụp lại ảnh sau này rẻ.
  file: `apps/web/src/components/khoi/solution-crm-5/data.tsx`
  severity: medium
  Đề xuất: known-limits

- **The five new Today links in the second column go nowhere (r1)**
  Người dùng thấy gì: Ở trang Hôm nay, cột bên trái có năm mục mà bấm vào không cuộn, không lọc, không mở gì; mục cũng không bao giờ sáng lên là đang chọn. Người dùng sẽ tưởng nút hỏng.
  Căn cứ: Mọi vai có cột này đều thấy nút bấm không phản hồi, gây khó chịu nhưng không mất dữ liệu; làm chúng chạy đúng thuộc việc chuyển màn Hôm nay ở hàng riêng.
  file: `apps/web/src/components/shell/second-column.tsx`
  severity: medium
  Đề xuất: new-contract

- **BoCuc throws away the side column on the list–detail layout when no detail drawer is passed, with no warning (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu người làm màn quên khai phần chi tiết, cột bên phải của màn Danh sách – chi tiết biến mất mà không có cảnh báo. Người dùng cuối chỉ gặp khi một màn được dựng sai.
  Căn cứ: Chỉ xảy ra khi dựng màn mới sai, các màn hiện có không bị; người làm màn thấy ngay khi xem thử, sửa rẻ lúc nào cũng được.
  file: `apps/web/src/components/bo-cuc/bo-cuc.tsx`
  severity: low
  Đề xuất: known-limits

- **Fixture viết tay đúng khuôn bên đọc (hình 2): dấu data-vung="dau-man" trong ca «bố cục: ma trận vùng» do chính test tự gắn (r1)**
  Người dùng thấy gì: Bài kiểm tự động coi vùng đầu màn là có mặt dù do chính bài kiểm tự gắn nhãn, nên nếu bố cục làm hỏng vùng này thì bài kiểm vẫn báo xanh. Người dùng không thấy trực tiếp.
  Căn cứ: Chỉ làm bài kiểm yếu hơn mức hứa, không làm màn nào hỏng ngay; có thể siết lại sau mà không ảnh hưởng người dùng.
  file: `apps/web/src/components/bo-cuc/bo-cuc.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Tuyên quét cả lớp nhưng chỉ bắt vài dạng cụ thể (hình 5): bộ quét «không nút tạo trùng» chỉ nhận dạng href= (r1)**
  Người dùng thấy gì: Bộ kiểm tra «không còn nút tạo trùng» bỏ sót các nút dẫn tới tạo bằng cách khác, nên ở Bảng hàng vẫn còn một nút Nhập Excel mà kiểm tra không bắt. Người dùng có thể thấy hai chỗ cùng làm một việc.
  Căn cứ: Chỉ là một nút dư ở một màn chưa chuyển, không mất dữ liệu và không gây sai thao tác; sẽ được dọn khi Bảng hàng chuyển sang bố cục mới.
  file: `apps/web/src/components/shell/menu-tao.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Assertion âm tính đứng một mình (hình 4): ca «bố cục: không dựng Frame» không có đối chứng dương (r1)**
  Người dùng thấy gì: Bài kiểm «bố cục không tự dựng khung» có thể vẫn xanh dù tên khung đổi, nên về sau có thể bỏ sót việc bố cục dựng khung trở lại. Người dùng không thấy gì ngay.
  Căn cứ: Không có lỗi hiển thị hiện tại, chỉ là lưới an toàn yếu; thêm ca đối chứng sau rẻ và không ảnh hưởng người dùng.
  file: `apps/web/src/components/bo-cuc/bo-cuc.test.ts`
  severity: low
  Đề xuất: known-limits

- **Assertion âm tính đứng một mình / đo chuỗi có mặt (hình 4): phần «dựng qua TrangThai/ChoTai» của ca tuyến chỉ là regex nhập, và không có ca đỏ (r1)**
  Người dùng thấy gì: Bài kiểm các màn lỗi và chờ tải chỉ xác nhận tệp có nhập khối chung chứ chưa kiểm khối đó có hiện ra. Nếu có tuyến nhập mà không dùng, người dùng có thể gặp màn lỗi trống.
  Căn cứ: Hiện chưa thấy tuyến nào hỏng, chỉ là kiểm chưa đủ sâu; người dùng tải lại được và bổ sung kiểm sau rẻ.
  file: `apps/web/src/components/trang-thai.test.ts`
  severity: low
  Đề xuất: known-limits

- **Đường dẫn và nguồn cứng: đo checkout của tác giả thay vì cây đang kiểm (hình 6): ke.json đóng dấu commit của cwd trong khi chụp từ máy chủ cứng localhost:3484 (r1)**
  Người dùng thấy gì: Ghi chú commit đi kèm bộ ảnh chuẩn có thể không đúng với phiên bản giao diện đã thực sự được chụp, làm người sau khó tin ảnh ứng với mã nào.
  Căn cứ: Chỉ ảnh hưởng độ tin cậy của ghi chú nội bộ, không ảnh hưởng người dùng cuối; chụp lại bộ ảnh chuẩn từ cây sạch là việc nhẹ.
  file: `_acceptance/he-bo-cuc/thu/chup-anh-chuan.cjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
