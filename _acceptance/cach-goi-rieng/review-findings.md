# Review findings: cach-goi-rieng (round 2)

## Trong hợp đồng

Không có phát hiện nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Kiểm 'hai giá trị cùng tên' bỏ sót trường hợp trùng với tên mặc định của giá trị anh em trong cùng tập đóng**
  Người dùng thấy gì: Quản trị có thể đặt cho một giá trị cái tên trùng với tên của giá trị còn lại. Khi đó bảng hàng, ô lọc và trang khách hiện hai lựa chọn khác nghĩa mà cùng một chữ, khách dễ hiểu nhầm.
  Căn cứ: Gây nhầm lẫn thật cho khách và đội nhưng không mất dữ liệu, quản trị tự đổi lại tên được ngay; kiểm thêm ở lúc lưu là việc nhỏ nhưng nằm ngoài các tiêu chí đã duyệt.
  file: `packages/core/src/labels/index.ts`
  severity: medium
  Đề xuất: new-contract

- **Nhãn khai lớp company_internal (trần company_only) nhưng được đưa ra trang khách công khai và bản phát hàng**
  Người dùng thấy gì: Tên riêng của sàn được khai là thông tin nội bộ nhưng vẫn hiện cho khách xem theo đúng thiết kế. Khách không thấy thêm dữ liệu nhạy cảm nào, chỉ là cách ghi nhãn phân loại chưa khớp với thực tế.
  Căn cứ: Không lộ thông tin chủ nhà hay dữ liệu ngoài ý muốn, kiểm rò rỉ vẫn xanh; chỉ là sai lệch ghi chép nên ghi lại như hạn chế đã biết.
  file: `packages/core/src/sharing/trang-khach.ts`
  severity: low
  Đề xuất: known-limits

- **Kiểm trùng tên giá trị riêng bỏ sót tên mặc định của giá trị chưa đổi: hai giá trị chuẩn có thể hiện cùng một chữ**
  Người dùng thấy gì: Nếu quản trị đổi tên một giá trị thành đúng chữ của giá trị kia, cả hai cùng hiện một chữ. Khách có thể thấy căn không bao phí mà ghi là bao phí.
  Căn cứ: Có thể làm khách hiểu sai thông tin phí, nhưng không mất dữ liệu và quản trị sửa lại được ngay; nên gộp xử lý cùng lỗi trùng tên liên quan.
  file: `packages/core/src/labels/index.ts`
  severity: medium
  Đề xuất: new-contract

- **Lỗi đọc dòng nhãn hỏng bị nuốt lặng ở mọi nơi gọi boTuVung**
  Người dùng thấy gì: Nếu một tên riêng đã lưu sau này không còn hợp lệ, hệ thống lặng lẽ quay về chữ mặc định mà không báo cho ai. Quản trị không biết tên riêng của sàn đã biến mất.
  Căn cứ: Hiếm xảy ra, không mất dữ liệu chủ nhà và căn vẫn hiện đúng bằng chữ mặc định; quản trị đặt lại tên được nên ghi hạn chế đã biết.
  file: `packages/api/src/labels/store.ts`
  severity: low
  Đề xuất: known-limits

- **Hình 5: tên ca nói «mọi trang» nhưng danh sách trang viết tay hai điểm, không liệt kê lớp**
  Người dùng thấy gì: Một trang Bảng hàng mới thêm sau này có thể quên dùng tên riêng của sàn mà bài kiểm vẫn xanh. Người dùng sẽ thấy chữ mặc định ở trang đó.
  Căn cứ: Chưa gây hại gì hôm nay; rủi ro chỉ có khi thêm trang mới và chỉ làm hiện chữ mặc định, không lộ hay mất dữ liệu.
  file: `apps/web/src/app/(app)/inventory/tu-vung.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 3: hứa «đổi từ vựng không đổi các dòng được giữ» nhưng phép đo không truyền từ vựng vào (luôn đúng)**
  Người dùng thấy gì: Một dòng trong bài kiểm không thật sự thử việc đổi tên riêng rồi lọc lại. Người dùng không thấy ảnh hưởng nào, chỉ là bài kiểm yếu hơn vẻ ngoài.
  Căn cứ: Bộ lọc vốn không nhận tên riêng nên kết quả không thể đổi; sửa chỉ làm bài kiểm gọn hơn, không đổi trải nghiệm.
  file: `apps/web/src/app/(app)/inventory/tu-vung.test.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình 3: chỉ kiểm chuỗi chanMucSan( đứng trước đường API, không kiểm việc chặn (redirect)**
  Người dùng thấy gì: Bài kiểm không chắc chắn bắt được trường hợp trang quên chuyển người không phải quản trị đi chỗ khác. Hiện trang vẫn chuyển đúng.
  Căn cứ: Phía máy chủ vẫn từ chối ghi, nên người không phải quản trị không sửa được gì; nhiều nhất là họ nhìn thấy màn trống.
  file: `apps/web/src/app/(app)/settings/labels/cach-goi.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình 1: đo mã nguồn hộp thoại thay vì đầu ra; khâu Bảng hàng → mo.tuVung không được đo**
  Người dùng thấy gì: Nếu sau này ai đó làm đứt khâu truyền tên riêng vào hộp thoại phát hàng, bản xuất sẽ ra chữ mặc định mà bài kiểm tự động không báo. Hiện bản xuất vẫn hiện đúng tên riêng.
  Căn cứ: Chưa có lỗi thật, chỉ là lưới an toàn mỏng; nếu hỏng thì chỉ ra chữ mặc định chứ không lộ hay mất dữ liệu, và đã có bước nhìn màn bù lại.
  file: `apps/web/src/app/(app)/inventory/phat-hang/tu-vung.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
