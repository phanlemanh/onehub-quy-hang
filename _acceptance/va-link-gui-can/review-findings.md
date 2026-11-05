# Review findings: va-link-gui-can (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Script dựng chỗ thử lặng lẽ dùng lại máy chủ dev lạ ở cổng 3460, nối với cơ sở dữ liệu khác**
  Người dùng thấy gì: Khi người chấm dựng chỗ thử mà trên máy đã có một bản chạy thử khác, công cụ vẫn báo sẵn sàng nhưng thực ra nhìn vào bản kia. Kết quả kiểm có thể xanh hoặc đỏ oan, còn người dùng sản phẩm không bị ảnh hưởng.
  Căn cứ: Chỉ ảnh hưởng độ tin của lần chấm trên máy dev, không đụng người dùng thật, người chấm tắt bản chạy kia rồi chạy lại là hết, sửa sau cũng rẻ.
  file: `_acceptance/va-link-gui-can/thu/dung.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 (đo cây khác thay vì cây đang kiểm): chỗ thử dùng lại bất kỳ máy chủ nào đang giữ cổng 3460**
  Người dùng thấy gì: Chỗ thử có thể vô tình đo nhầm bản phần mềm khác đang chạy trên máy, nên bằng chứng bấm «Gửi căn» có thể không phải của bản đang kiểm. Người dùng sản phẩm không bị ảnh hưởng.
  Căn cứ: Hậu quả chỉ là bằng chứng kiểm có thể sai khi trên máy có bản khác đang chạy, tự phát hiện và chạy lại được, không mất dữ liệu của ai.
  file: `_acceptance/va-link-gui-can/thu/dung.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert «chuỗi có mặt» trong khi lời hứa là quan hệ): bài Đã gửi không gắn href với nút «Gửi căn»**
  Người dùng thấy gì: Bài kiểm ở màn Đã gửi chỉ xác nhận đường dẫn tới Bảng hàng có xuất hiện đâu đó, chưa chắc là ở đúng nút «Gửi căn». Nếu sau này nút bị đổi đích, một bài kiểm khác vẫn bắt được.
  Căn cứ: Nhẹ vì nút hiện đúng đích và đã có bài kiểm khác che; chỉ là lưới an toàn hơi lỏng, siết lại sau rất rẻ.
  file: `apps/web/src/app/(app)/shares/da-gui.test.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/3 lỗi rơi vào file không bộ đo nào phủ (_acceptance/va-link-gui-can/thu/dung.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
