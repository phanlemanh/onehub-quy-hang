# Review findings: doi-dau-chu-hang-loat (round 3)

## Trong hợp đồng

- **Hình 4 (âm tính một mình, không đối chứng): ô «khongTaiLai» của E9 không bao giờ ra sai**
  file: `_acceptance/doi-dau-chu-hang-loat/thu/chay-ui.mjs:121`
  severity: high
  AC: AC-4
  source: measurement
  detail: `khongTaiLai: (await tn.tinh("performance.getEntriesByType('navigation').length")) === 1`. Trang nào cũng chỉ có đúng MỘT mục navigation cho tài liệu đang mở. Nếu trang tải lại, tài liệu mới cũng có một mục, nên giá trị vẫn là true. Điều E9 hứa là trang không tải lại giữa lúc xác nhận và lúc chụp, nhưng phép đo này không thể ra false, và không có ca đối chứng nào (ví dụ tải lại thật rồi đọc lại phải ra false). Muốn bắt được việc tải lại, phải ghi một dấu (mốc thời gian hay biến trên window) trước khi bấm xác nhận rồi kiểm dấu ấy còn sau khi thông báo hiện.
  rationale: AC-4 hứa đầu chủ mới hiện sau đồng bộ không cần tải lại trang, và phép đo E9 cho điều đó không thể ra sai nên không chứng minh được.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hoàn tác trả liên hệ chủ nhà về người giữ cũ ngay cả khi căn của chủ ấy bị bỏ qua, nên một chủ có thể bị tách giữa hai đầu chủ**
  Người dùng thấy gì: Nếu đầu chủ cũ đã mất vai trước khi hoàn tác, liên hệ chủ nhà có thể quay về người này trong khi căn của chủ ấy vẫn ở đầu chủ mới. Chủ nhà đó bị tách giữa hai người.
  Căn cứ: Chỉ xảy ra khi người giữ cũ mất vai giữa lúc đổi và lúc hoàn tác, trong 10 giây hoàn tác, nên hiếm; không mất dữ liệu và trưởng nhóm gán lại được.
  file: `packages/db/migrations/027_doi_dau_chu.sql`
  severity: medium
  Đề xuất: known-limits

- **Hàm SECURITY DEFINER dùng bảng tạm `create temp table if not exists pg_temp.doi_tap`, một mẫu chưa có ở migration nào khác và để vai gọi chiếm trước được bảng**
  Người dùng thấy gì: Một lớp phòng thủ phụ của cơ sở dữ liệu còn hở về lý thuyết, nhưng hiện người dùng không có đường nào để lợi dụng.
  Căn cứ: Chưa có đường khai thác từ ứng dụng nên chưa ai bị ảnh hưởng; sửa là việc củng cố riêng, có thể làm sau mà không mất gì.
  file: `packages/db/migrations/027_doi_dau_chu.sql`
  severity: medium
  Đề xuất: known-limits

- **Hoàn tác trả liên hệ chủ nhà cho người đã mất vai Đầu chủ, trong khi căn của chính chủ đó bị bỏ qua**
  Người dùng thấy gì: Sau khi đầu chủ cũ rời vai, hoàn tác vẫn trả liên hệ cho người này nên liên hệ có thể không ai trong vai đầu chủ đọc được, còn thông báo vẫn báo là đã trả lại.
  Căn cứ: Hiếm gặp, không mất dữ liệu, trưởng nhóm gán lại được; nhưng thông báo đếm sai nên nên ghi vào các hạn chế đã biết.
  file: `packages/db/migrations/027_doi_dau_chu.sql`
  severity: medium
  Đề xuất: known-limits

- **Lỗi tải danh sách đầu chủ bị bỏ qua không báo, hộp hỏi chỉ hiện ô chọn trống**
  Người dùng thấy gì: Khi mạng chập chờn lúc mở hộp hỏi, ô chọn đầu chủ mới để trống và nút đổi tắt mà không có lời giải thích.
  Căn cứ: Chỉ làm người dùng bối rối, không mất dữ liệu; đóng mở lại hộp hỏi là khắc phục được và sửa rẻ.
  file: `apps/web/src/app/(app)/inventory/bulk/hop-doi-dau-chu.tsx`
  severity: low
  Đề xuất: known-limits

- **Mọi lỗi invalid-payload đều hiện là «Người nhận không phải đầu chủ của sàn»**
  Người dùng thấy gì: Một số lỗi gửi lệnh không liên quan người nhận vẫn hiện câu nói về người nhận, nên người dùng khó đoán nguyên nhân thật.
  Căn cứ: Các lỗi này khó xảy ra qua giao diện bình thường, chỉ sai chữ báo, không hại dữ liệu.
  file: `apps/web/src/app/(app)/inventory/bulk/doi-dau-chu.ts`
  severity: low
  Đề xuất: known-limits

- **Hình 4 (âm tính một mình): ô «không dòng gán nào» của hàng Chỉ tôi luôn đạt dù có lọt**
  Người dùng thấy gì: Bài kiểm tra việc trưởng nhóm không đổi được hàng Chỉ tôi của người khác chưa chứng minh chắc là bắt được lỗi nếu có.
  Căn cứ: Chỉ là độ chắc của bài kiểm tra, không phải lỗi người dùng đang gặp; bài so sánh thân trả về vẫn che phần nào.
  file: `packages/api/test-db/visibility.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 (âm tính một mình, không ghim kết quả): chiều đỏ của ô chọn người nhận chỉ là notEqual**
  Người dùng thấy gì: Bài kiểm tra ô chọn người nhận chỉ chứng minh ô không hiện một tên cụ thể, chưa nói rõ ô hiện gì khi hỏng.
  Căn cứ: Chỉ ảnh hưởng độ chặt của bài kiểm tra, người dùng không gặp gì; siết lại rất rẻ khi tiện tay.
  file: `apps/web/src/app/(app)/inventory/bulk/doi-dau-chu.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
