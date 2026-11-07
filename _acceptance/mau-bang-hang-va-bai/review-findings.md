# Review findings: mau-bang-hang-va-bai (round 2)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Public API /api/v1/company/templates/* and the stored data use Vietnamese field names, which breaks the rule that the API is in English**
  Người dùng thấy gì: Người dùng cuối không thấy gì khác. Nhưng bên ngoài đọc API sẽ gặp tên trường tiếng Việt, và đổi tên sau khi phát hành sẽ phải chuyển dữ liệu đã lưu.
  Căn cứ: Không ảnh hưởng người dùng hôm nay, nhưng sửa trước khi phát hành rẻ hơn nhiều so với đổi sau khi dữ liệu và bên ngoài đã dùng.
  file: `packages/api/src/mau-san/routes.ts`
  severity: medium
  Đề xuất: new-contract

- **The Templates settings page never shows the read errors, so the next save quietly deletes the template rows it skipped**
  Người dùng thấy gì: Nếu có mẫu trong kho bị hỏng nên không hiện ra, quản trị sàn không được báo gì. Lần lưu hoặc xoá kế tiếp sẽ xoá hẳn các mẫu đó mà không ai hay.
  Căn cứ: Có thể mất mẫu vĩnh viễn mà không báo, nhưng chỉ xảy ra khi dữ liệu mẫu đã hỏng từ trước nên hiếm gặp.
  file: `apps/web/src/app/(app)/settings/templates/page.tsx`
  severity: low
  Đề xuất: new-contract

- **If the post templates cannot be read, the export dialog falls back without saying so, unlike the table templates**
  Người dùng thấy gì: Khi không đọc được mẫu bài, bài Zalo hoặc Facebook được chép ra thiếu lời mở đầu và lời kết của sàn mà không có báo gì. Người gửi có thể gửi đi mà không biết.
  Căn cứ: Không mất dữ liệu và người dùng tải lại là đọc lại được; chỉ xảy ra khi đọc mẫu lỗi, và bài vẫn dùng được.
  file: `apps/web/src/app/(app)/inventory/mau-xuat-san.ts`
  severity: low
  Đề xuất: known-limits

- **Hình 4 + hình 1: E8b, câu hỏi "hộp đang mở có đọc lại mẫu không" chỉ do một phép grep phủ định trên mã nguồn trả lời, phần chạy thật thì luôn đúng**
  Người dùng thấy gì: Bài kiểm có thể không bắt được lỗi nếu hộp Xuất đang mở sau này đọc lại mẫu mới giữa chừng. Người dùng có thể thấy cột đổi khi đang xem.
  Căn cứ: Hiện chưa có lỗi thật cho người dùng, chỉ là lưới kiểm yếu; bổ sung bài kiểm sau rẻ và không ảnh hưởng người dùng.
  file: `apps/web/src/app/(app)/inventory/phat-hang/mau.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4: bài rò rỉ của màn Mẫu quét HTML vốn không có cửa nào để mồi lọt vào**
  Người dùng thấy gì: Bài kiểm chống lộ thông tin chủ nhà ở màn Mẫu có thể không bắt được lỗi nếu sau này có thông tin nội bộ lọt vào màn này.
  Căn cứ: Chưa có rò rỉ thật; lõi vẫn bỏ cột nội bộ, đây là lớp kiểm thêm nên mức nặng thấp và sửa sau rẻ.
  file: `apps/web/src/app/(app)/settings/templates/mau-san.ro-ri.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 5: bài rò rỉ nói quét "mã nguồn màn Mẫu" nhưng chỉ liệt kê tay 4 tệp, sót tệp có sẵn trong thư mục**
  Người dùng thấy gì: Bài kiểm chống lộ thông tin không quét hết các tệp của màn Mẫu, nên lỗi lộ thông tin ở phần bị sót hoặc tệp thêm sau có thể không bị phát hiện.
  Căn cứ: Chưa có rò rỉ thật và phần sót là tab cũ; chỉ là lưới kiểm chưa kín, sửa sau rẻ.
  file: `apps/web/src/app/(app)/settings/templates/mau-san.ro-ri.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
