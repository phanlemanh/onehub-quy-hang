# Review findings: he-bo-cuc (round 1)

## Trong hợp đồng

- **Nút «+» trên điện thoại mở cả Nhập Excel và Phát hàng, trái với Tham chiếu §9; Tham chiếu chưa được sửa**
  AC: AC-4
  file: `apps/web/src/components/shell/menu-tao.tsx:96`
  severity: high
  source: conventions
  detail: `MenuTaoDienThoai` nhận nguyên `nav.actions` (truyền từ app-shell.tsx: `<MobileHeader ... actions={nav.actions} />`), mà `navigationFor` trả `["new_lead","import","export"]` cho đầu chủ và trưởng nhóm, `["import"]` cho quản trị sàn. Vì vậy ở khổ dưới md, menu «+» hiện «Nhập Excel» (/imports/new) và «Phát hàng» (/exports/new). Điều này trái với điều đã chốt ở docs/product/tham-chieu.md dòng 191: «Điện thoại: thanh trên mảnh (tên nhà · gõ mã căn · chuông) … Không có Đội, Cài đặt sàn, Nhập Excel, Phát hàng». Bảng ở dòng 252 cũng ghi Nhập Excel là việc trên máy tính. docs/design/vo-va-ia.md §«Điện thoại» chưa có nút «+». Quyết định d-…-13 (Hỏi-2) nói «điện thoại: nút «+»» nhưng không nói bỏ luật «không Nhập Excel, Phát hàng trên điện thoại», và PR không sửa Tham chiếu trong cùng PR như AGENTS.md yêu cầu. Thêm nữa, nút theo vai phải đọc từ một bảng ở `packages/core` (giống cách `tabs` tách riêng cho điện thoại), không lọc ở vỏ: nếu điện thoại có menu Tạo thì tập việc tạo trên điện thoại cần là một trường của `Navigation` trong packages/core/src/navigation.ts, kèm test, rồi sửa Tham chiếu §9 và vo-va-ia.md. Nếu không, phải bỏ «import»/«export» khỏi menu trên điện thoại.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Màn mẫu Dòng tin và ảnh chuẩn dong-tin-*.png vẫn mang dữ liệu demo tiếng Anh của khối, trong khi TIN_MAU (dữ liệu mẫu tiếng Việt) bỏ không dùng**
  Người dùng thấy gì: Trang mẫu và ảnh chuẩn Dòng tin hiện chữ tiếng Anh và tên người nước ngoài, nên người so màn mới với ảnh chuẩn sẽ thấy chữ lạ so với giao diện tiếng Việt thật.
  Căn cứ: Chỉ ảnh dùng để đối chiếu nội bộ bị lệch ngôn ngữ, người dùng cuối không thấy, không mất dữ liệu; thay dữ liệu và chụp lại ảnh sau này rẻ.
  file: `apps/web/src/components/khoi/solution-crm-5/data.tsx`
  severity: medium
  Đề xuất: known-limits

- **The five new Today links in the second column go nowhere**
  Người dùng thấy gì: Ở trang Hôm nay, cột bên trái có năm mục mà bấm vào không cuộn, không lọc, không mở gì; mục cũng không bao giờ sáng lên là đang chọn. Người dùng sẽ tưởng nút hỏng.
  Căn cứ: Mọi vai có cột này đều thấy nút bấm không phản hồi, gây khó chịu nhưng không mất dữ liệu; làm chúng chạy đúng thuộc việc chuyển màn Hôm nay ở hàng riêng.
  file: `apps/web/src/components/shell/second-column.tsx`
  severity: medium
  Đề xuất: new-contract

- **BoCuc throws away the side column on the list–detail layout when no detail drawer is passed, with no warning**
  Người dùng thấy gì: Nếu người làm màn quên khai phần chi tiết, cột bên phải của màn Danh sách – chi tiết biến mất mà không có cảnh báo. Người dùng cuối chỉ gặp khi một màn được dựng sai.
  Căn cứ: Chỉ xảy ra khi dựng màn mới sai, các màn hiện có không bị; người làm màn thấy ngay khi xem thử, sửa rẻ lúc nào cũng được.
  file: `apps/web/src/components/bo-cuc/bo-cuc.tsx`
  severity: low
  Đề xuất: known-limits

- **Fixture viết tay đúng khuôn bên đọc (hình 2): dấu data-vung="dau-man" trong ca «bố cục: ma trận vùng» do chính test tự gắn**
  Người dùng thấy gì: Bài kiểm tự động coi vùng đầu màn là có mặt dù do chính bài kiểm tự gắn nhãn, nên nếu bố cục làm hỏng vùng này thì bài kiểm vẫn báo xanh. Người dùng không thấy trực tiếp.
  Căn cứ: Chỉ làm bài kiểm yếu hơn mức hứa, không làm màn nào hỏng ngay; có thể siết lại sau mà không ảnh hưởng người dùng.
  file: `apps/web/src/components/bo-cuc/bo-cuc.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Tuyên quét cả lớp nhưng chỉ bắt vài dạng cụ thể (hình 5): bộ quét «không nút tạo trùng» chỉ nhận dạng href=**
  Người dùng thấy gì: Bộ kiểm tra «không còn nút tạo trùng» bỏ sót các nút dẫn tới tạo bằng cách khác, nên ở Bảng hàng vẫn còn một nút Nhập Excel mà kiểm tra không bắt. Người dùng có thể thấy hai chỗ cùng làm một việc.
  Căn cứ: Chỉ là một nút dư ở một màn chưa chuyển, không mất dữ liệu và không gây sai thao tác; sẽ được dọn khi Bảng hàng chuyển sang bố cục mới.
  file: `apps/web/src/components/shell/menu-tao.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Assertion âm tính đứng một mình (hình 4): ca «bố cục: không dựng Frame» không có đối chứng dương**
  Người dùng thấy gì: Bài kiểm «bố cục không tự dựng khung» có thể vẫn xanh dù tên khung đổi, nên về sau có thể bỏ sót việc bố cục dựng khung trở lại. Người dùng không thấy gì ngay.
  Căn cứ: Không có lỗi hiển thị hiện tại, chỉ là lưới an toàn yếu; thêm ca đối chứng sau rẻ và không ảnh hưởng người dùng.
  file: `apps/web/src/components/bo-cuc/bo-cuc.test.ts`
  severity: low
  Đề xuất: known-limits

- **Assertion âm tính đứng một mình / đo chuỗi có mặt (hình 4): phần «dựng qua TrangThai/ChoTai» của ca tuyến chỉ là regex nhập, và không có ca đỏ**
  Người dùng thấy gì: Bài kiểm các màn lỗi và chờ tải chỉ xác nhận tệp có nhập khối chung chứ chưa kiểm khối đó có hiện ra. Nếu có tuyến nhập mà không dùng, người dùng có thể gặp màn lỗi trống.
  Căn cứ: Hiện chưa thấy tuyến nào hỏng, chỉ là kiểm chưa đủ sâu; người dùng tải lại được và bổ sung kiểm sau rẻ.
  file: `apps/web/src/components/trang-thai.test.ts`
  severity: low
  Đề xuất: known-limits

- **Đường dẫn và nguồn cứng: đo checkout của tác giả thay vì cây đang kiểm (hình 6): ke.json đóng dấu commit của cwd trong khi chụp từ máy chủ cứng localhost:3484**
  Người dùng thấy gì: Ghi chú commit đi kèm bộ ảnh chuẩn có thể không đúng với phiên bản giao diện đã thực sự được chụp, làm người sau khó tin ảnh ứng với mã nào.
  Căn cứ: Chỉ ảnh hưởng độ tin cậy của ghi chú nội bộ, không ảnh hưởng người dùng cuối; chụp lại bộ ảnh chuẩn từ cây sạch là việc nhẹ.
  file: `_acceptance/he-bo-cuc/thu/chup-anh-chuan.cjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
