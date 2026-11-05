# Review findings: mau-nhap-va-bai (round 3)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Xoá cột mẫu thất bại vẫn đóng hộp và không báo gì (lệch khuôn hộp xác nhận có sẵn)**
  Người dùng thấy gì: Khi xoá một cột mẫu mà gặp lỗi mạng hoặc máy chủ từ chối, hộp xác nhận vẫn đóng như thể đã xoá xong. Cột vẫn còn trong bảng và Quản trị sàn không biết vì sao.
  Căn cứ: Không mất dữ liệu và người dùng tự thử xoá lại được sau khi thấy cột còn đó, nhưng họ sẽ bối rối vì không có lời báo lỗi; sửa khá rẻ.
  file: `apps/web/src/app/(app)/settings/templates/vung-mau-nhap.tsx`
  severity: medium
  Đề xuất: known-limits

- **Xoá cột mẫu thất bại vẫn đóng hộp, không báo lỗi gì**
  Người dùng thấy gì: Xoá cột mẫu không thành công vẫn trông như đã xoá, vì hộp đóng và không có thông báo. Quản trị sàn thấy cột còn nguyên mà không hiểu lý do.
  Căn cứ: Hậu quả nhẹ vì không mất hay lộ dữ liệu và thử lại được, chỉ gây khó hiểu; nên ghi lại để sửa sau cùng finding trùng.
  file: `apps/web/src/app/(app)/settings/templates/vung-mau-nhap.tsx`
  severity: medium
  Đề xuất: known-limits

- **kiemSuaMau nhận phép price/date thiếu tham số bắt buộc; mẫu được lưu 200 nhưng lần nhập sau âm thầm quay về từ điển**
  Người dùng thấy gì: Một bên gọi trực tiếp API có thể lưu mẫu giá hoặc ngày thiếu quy đổi và vẫn được báo thành công. Lần nhập sau, mẫu đó bị bỏ qua mà không ai biết.
  Căn cứ: Màn hình thông thường không gây ra lỗi này, chỉ xảy ra khi gọi API trực tiếp; không rò rỉ hay mất dữ liệu nhưng bản sửa có thể bị bỏ lặng lẽ, và sửa tương đối rẻ.
  file: `packages/core/src/import/memory/sua-mau.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 1 (đo chỉ dẫn thay vì đầu ra): E4 «lần đang mở ghi theo kế hoạch cũ» đọc lại imports.plan đã lưu, không đo căn được ghi**
  Người dùng thấy gì: Bài kiểm chưa chứng minh lần nhập đang mở khi ghi sẽ tạo căn đúng theo kế hoạch cũ sau khi mẫu bị sửa. Nếu có lỗi ở đó, bài kiểm vẫn báo xanh.
  Căn cứ: Sản phẩm chưa thấy sai, chỉ là lưới kiểm lỏng hơn lời hứa; người dùng không bị ảnh hưởng ngay và bài kiểm bổ sung sau được.
  file: `packages/api/test-db/mau-nhap-va-bai/mau-nhap.test.ts`
  severity: high
  Đề xuất: known-limits

- **Shape 3 (assert có mặt thay vì quan hệ) và Shape 4 (âm tính rỗng không đối chứng): E4 hoàn tác chỉ kiểm tập con, rỗng thì cũng qua**
  Người dùng thấy gì: Bài kiểm hoàn tác chưa chắc bắt được trường hợp hoàn tác gỡ nhầm căn của lần nhập khác, và có thể xanh khi không có căn nào để gỡ. Chưa thấy lỗi thật ở sản phẩm.
  Căn cứ: Rủi ro là hoàn tác gỡ nhầm căn mà không bị phát hiện, nhưng chưa có bằng chứng xảy ra thật; thêm đối chiếu vào bài kiểm khá rẻ.
  file: `packages/api/test-db/mau-nhap-va-bai/mau-nhap.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 3 (assert có mặt thay vì quan hệ): E1 «tiêu đề trùng lấy đích + nguồn của lần sau» không đo đích**
  Người dùng thấy gì: Bài kiểm chưa xác nhận khi hai lần nhập có tiêu đề trùng thì màn hiện đúng trường đích của lần ghi sau. Nếu lỗi này có thật, bài kiểm vẫn xanh.
  Căn cứ: Chưa có bằng chứng sản phẩm sai, chỉ là lưới kiểm hở một vế; người dùng thấy sai sẽ tự phát hiện trên màn và sửa bài kiểm rẻ.
  file: `packages/api/test-db/mau-nhap-va-bai/mau-nhap.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 1 (đo chỉ dẫn thay vì đầu ra): E6b đo trang chặn vai bằng regex trên mã nguồn page.tsx**
  Người dùng thấy gì: Bài kiểm chặn vai ở màn Mẫu nhập chỉ đọc chữ trong mã, không thử mở màn bằng từng vai. Vì vậy có thể báo xanh sai hoặc đỏ oan khi mã được viết lại.
  Căn cứ: Chưa thấy ai mở được màn trái quyền; rủi ro là bài kiểm giòn và bỏ sót, không ảnh hưởng người dùng ngay, sửa vừa phải.
  file: `apps/web/src/app/(app)/settings/templates/mau-nhap.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 5 (tuyên lớp, chỉ có điểm-case): E3 «khoá khác còn đủ» chỉ kiểm một khoá**
  Người dùng thấy gì: Bài kiểm xoá cột chỉ xác nhận một cột khác còn nguyên, chưa soát hết các cột còn lại. Nếu việc xoá lỡ tay xoá cả cột khác thì có thể không bị bắt.
  Căn cứ: Mức thấp, lỗi xoá nhầm nhiều cột sẽ lộ ngay trên màn và ca xen kẽ ở bài khác đã phủ một phần; không đáng mở việc riêng.
  file: `packages/api/test-db/mau-nhap-va-bai/mau-nhap.test.ts`
  severity: low
  Đề xuất: wont-fix

- **Shape 2 (fixture viết tay đúng khuôn bên đọc): ca «mở TRƯỚC, ghi sau» của E1b trùng hệt ca «sửa mới hơn»**
  Người dùng thấy gì: Hai dòng trong bảng ca kiểm thực chất giống nhau nên số ca khác biệt ít hơn bảng khai. Không ảnh hưởng người dùng.
  Căn cứ: Không có hậu quả với người dùng và trục này đã được bài kiểm cơ sở dữ liệu đo thật; sửa không đáng công.
  file: `packages/core/src/import/memory/sua-mau.test.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
