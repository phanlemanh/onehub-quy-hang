# Review findings: va-san-sang-ban (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **bamSanSang nuốt mọi lỗi ném từ hàm gửi thành lỗi «kho», không ghi lại, che mất cả lỗi lập trình mà bộ đồng bộ cố ý ném lại**
  Người dùng thấy gì: Nếu có lỗi bất ngờ khi bấm Sẵn sàng bán, người dùng vẫn thấy lời báo «Máy chưa lưu được lần sửa — thử lại» và bấm lại được. Nhưng lỗi thật không để lại dấu vết nên đội kỹ thuật khó biết và khó tìm nguyên nhân.
  Căn cứ: Người dùng không mất dữ liệu và vẫn thử lại được, chỉ khó chẩn đoán lỗi hiếm về sau; sửa có thể làm ở đợt khác khi cần.
  file: `apps/web/src/app/(app)/units/ready/san-sang.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — fixture viết tay đúng khuôn bên đọc: VSSB-E2 tự dựng trạng thái mà hàm dọn lẽ ra phải sinh ra**
  Người dùng thấy gì: Một bài kiểm tra về việc dấu «Chưa có» biến mất khi chuyển căn không thật sự chạy bước dọn dấu. Nếu sau này ai đó làm hỏng bước ấy, bài kiểm tra vẫn xanh và dấu cũ có thể lại hiện ở căn khác.
  Căn cứ: Không ảnh hưởng người dùng hiện tại, chỉ giảm khả năng bắt lỗi quay lại về sau; người dùng chỉ gặp nếu có thay đổi sai trong tương lai, và sửa test rẻ.
  file: `apps/web/src/app/(app)/units/ready/san-sang.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên ma trận viết trước nhưng câu đếm assert là hằng đúng: VSSB-E3 so bộ đếm vòng lặp với độ dài chính mảng ấy**
  Người dùng thấy gì: Bài kiểm tra không phát hiện được nếu ai đó bớt đi một số tình huống đã hứa kiểm. Người dùng không thấy gì khác hôm nay.
  Căn cứ: Không có hậu quả trực tiếp cho người dùng, mức độ thấp, chỉ làm lưới kiểm thử lỏng hơn đã khai; sửa sau rất rẻ.
  file: `apps/web/src/app/(app)/units/ready/san-sang.test.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

