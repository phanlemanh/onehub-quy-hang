# Review findings: va-dinh-nghia-doc-lai

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Phản hồi 200 có thân hỏng bị coi là kết quả cuối «không có dấu», nên dòng định nghĩa không bao giờ được đọc lại**
  Người dùng thấy gì: Khi mạng yếu làm nội dung trả về bị đứt dù máy chủ báo thành công, dòng định nghĩa ngày có thể vắng mặt cho tới khi giá hoặc điều kiện phí đổi. Không có thông báo lỗi nào hiện ra.
  Căn cứ: Hậu quả nhẹ vì chỉ thiếu một dòng phụ, không mất hay lộ dữ liệu, và người dùng tự gỡ được bằng cách tải lại trang; ca này hiếm hơn ca mất mạng hẳn.
  file: `apps/web/src/app/(app)/units/ho-so/doc-dau.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert giá trị có mặt, lời hứa là quan hệ): hai ô «200 null» và «404» của ma trận E5b trên API thật không đo mã trả về**
  Người dùng thấy gì: Bài kiểm trên máy chủ thật chưa phân biệt được máy chủ trả «không có dấu» với trả «không tìm thấy». Người dùng hiện không thấy khác biệt nào.
  Căn cứ: Không ảnh hưởng người dùng hôm nay, chỉ làm bài kiểm kém nhạy nếu sau này máy chủ đổi cách trả lời; bổ sung sau rẻ.
  file: `apps/web/src/lib/sync/test-db/dinh-nghia-doc-lai.db-test.mts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): E6 «không đọc lại, dòng giữ nguyên» không ghim tiền đề hàng đợi có thao tác**
  Người dùng thấy gì: Bài kiểm chưa chắc chắn rằng lúc kiểm có thao tác khác đang chờ gửi. Người dùng vẫn thấy dòng định nghĩa giữ nguyên đúng như mong đợi.
  Căn cứ: Hành vi thật đang đúng, rủi ro chỉ là bài kiểm xanh oan trong tương lai; không gây mất dữ liệu và dễ siết lại sau.
  file: `apps/web/src/app/(app)/units/ho-so/dinh-nghia-doc-lai.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp, chỉ có điểm-case): E6 chỉ quét `giaChoGui` theo EVENT_TYPES, «không lời đọc mới, dòng giữ nguyên» chỉ đo một loại**
  Người dùng thấy gì: Bài kiểm mới thử một loại thao tác khác để chắc dòng định nghĩa không bị đụng tới, chưa thử hết các loại. Người dùng chưa gặp lỗi nào.
  Căn cứ: Rủi ro thấp vì việc quyết định có đọc lại hay không đã được kiểm theo từng loại thao tác; chỉ thiếu phần xác nhận chữ dòng.
  file: `apps/web/src/app/(app)/units/ho-so/dinh-nghia-doc-lai.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): ca «đổi đi đổi về» của E2 lắp tay `giaChoGui`, không đi từ bộ đồng bộ thật**
  Người dùng thấy gì: Ca đổi giá đi rồi đổi về chưa được kiểm trọn qua bộ đồng bộ thật. Hiện tại dòng vẫn đổi đúng khi giá lên máy chủ.
  Căn cứ: Hành vi hiện đúng, nếu sau này bộ đồng bộ đổi cách gộp lệnh thì dòng có thể giữ dấu cũ nhưng người dùng tải lại là hết; bổ sung bài kiểm sau tốn ít.
  file: `apps/web/src/app/(app)/units/ho-so/dinh-nghia-doc-lai.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp, thiếu ô): ô «đang đọc dở × còn kẹt» của trục B không có ca, phản hồi về trong lúc còn chờ gửi không được đo**
  Người dùng thấy gì: Chưa có bài kiểm cho tình huống phản hồi cũ về đúng lúc giá còn chờ gửi. Người dùng chưa gặp lỗi, nhưng tình huống này hiếm và chưa được xác nhận.
  Căn cứ: Hiếm gặp, hậu quả tối đa là dòng phụ giữ dấu cũ tới lần tải lại, không mất dữ liệu; thêm ca kiểm sau khá rẻ.
  file: `apps/web/src/app/(app)/units/ho-so/dinh-nghia-doc-lai.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
