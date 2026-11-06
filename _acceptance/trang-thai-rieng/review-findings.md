# Review findings: trang-thai-rieng (round 4)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Đổi nhãn tại chỗ trong Đang giao dịch / Đã bán bỏ qua phép so phiên bản (luật «thắng ngay»)**
  Người dùng thấy gì: Hai người cùng đổi nhãn của một căn đang giao dịch hoặc đã bán: lần đổi đến sau, dựa trên bản cũ, âm thầm đè lần trước mà không báo «Cần xem».
  Căn cứ: Chỉ đổi chữ nhãn, không mất dữ liệu quan trọng và người dùng đổi lại được; nhưng hành vi lệch với Đang bán nên đáng xử lý cùng lỗi liên quan trong một việc riêng.
  file: `packages/api/src/listings/store.ts`
  severity: medium
  Đề xuất: new-contract

- **Tham số `nhan` của apTrenMay không nơi nào truyền — kiểm mã nhãn trên máy là mã chết**
  Người dùng thấy gì: Khi dùng nhãn đã bị gỡ ở chế độ ngoại tuyến, máy hiện đổi nhãn trước rồi mới bị máy chủ từ chối và lùi lại.
  Căn cứ: Chỉ là một nháy hiển thị sai rồi tự lùi, không mất dữ liệu và máy chủ vẫn chặn đúng, nên ghi lại là đủ.
  file: `apps/web/src/lib/sync/ap-tren-may.ts`
  severity: low
  Đề xuất: known-limits

- **Đổi nhãn tại chỗ trong Đang giao dịch bỏ qua phép so phiên bản, nên một lệnh cũ âm thầm kéo căn về Đang giao dịch**
  Người dùng thấy gì: Nếu căn vừa được đưa về Đang bán (ví dụ khách bỏ cọc) mà một máy cũ còn gửi lệnh đổi nhãn, căn bị kéo ngược về Đang giao dịch mà không ai được báo.
  Căn cứ: Làm sai trạng thái thật của căn và hiện sai ra Bảng hàng và trang khách, tuy hiếm gặp và sửa lại bằng tay được; nên mở việc riêng để sửa kỹ.
  file: `packages/api/src/listings/store.ts`
  severity: high
  Đề xuất: new-contract

- **Màn Trạng thái cho Lưu dù nhãn thay đã chọn đã bị gỡ trong cùng lượt, máy chủ trả 400**
  Người dùng thấy gì: Quản trị sàn gỡ một nhãn rồi chọn nhãn thay, sau đó gỡ luôn nhãn thay ấy, thì nút Lưu vẫn bật nhưng lưu bị từ chối và màn không chỉ cách sửa.
  Căn cứ: Chỉ gặp ở thao tác hiếm, không mất dữ liệu và người dùng tự gỡ rồi chọn lại được.
  file: `apps/web/src/app/(app)/settings/statuses/trang-thai-thuan.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5: tuyên quét LỚP «mọi chỗ đọc payload ->> 'to'» nhưng toàn bộ migration gộp thành một dòng, chỉ đo một điểm**
  Người dùng thấy gì: Người dùng không thấy gì ngay; chỉ là bài kiểm tự động có thể không báo đỏ nếu sau này có thêm luật cơ sở dữ liệu đọc trạng thái đích mà quên tính đến nhãn.
  Căn cứ: Rủi ro nằm ở khâu kiểm thử về sau, không ảnh hưởng người dùng hôm nay và bổ sung sau rẻ.
  file: `packages/api/test-db/trang-thai-rieng/nhan.test.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
