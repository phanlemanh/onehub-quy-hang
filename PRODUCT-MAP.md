# Bản đồ sản phẩm

> Bản đồ vẽ lại từ hồ sơ của xưởng mỗi lần một người ký một cổng — đừng sửa tay.
> (đọc từ thư mục `_acceptance/` và `.out-of-scope/`)
> Lộ trình: [LO-TRINH.html](LO-TRINH.html)

```mermaid
flowchart TD
  A["Đang cân nhắc cơ hội<br/>chưa có"] --> GD{"Cổng Đáng"}
  GD --> B["Sắp mở vòng<br/>4 việc"]
  GD --> XL["Xếp lại sau<br/>1 việc"]
  GD --> DB["Đã bác từ khám phá<br/>chưa có"]
  B --> CD["Chờ duyệt phạm vi<br/>chưa có"] --> GP{"Cổng Phạm vi"}
  GP --> DL["Đang làm<br/>chưa có"] --> GB{"Cổng Bằng chứng"}
  GB --> DG["Đã giao<br/>4 việc"]
  GB --> CN["Chờ phiên nghiệm thu<br/>15 việc"] --> GG{"Cổng Giá trị"}
  GG --> NT["Đã nghiệm thu giá trị<br/>chưa có"]
```

> **Bốn cổng người** — mỗi cổng là một câu hỏi chỉ người trả lời được:
> **Cổng Đáng** việc này có đáng làm không · **Cổng Phạm vi** bộ tiêu chí
> đã đủ và đúng chưa · **Cổng Bằng chứng** đã làm đúng thứ đã hứa chưa ·
> **Cổng Giá trị** thứ đã giao có ăn thua không.

## Sắp mở vòng

- Mọi đường gửi mã đăng nhập đi qua cùng giới hạn 5 lần xin mã trong 15 phút cho mỗi email; đường quên mật khẩu của plugin không còn phục vụ (`dong-duong-gui-ma-thua`)
- Mở sàn cho công ty mới trùng tên với sàn đang chạy thì được một sàn riêng; người của sàn mới không thấy dữ liệu sàn cũ (`mo-san-trung-ten`)
- Một màn của nhóm dựng ngoài khuôn làm bài kiểm của kho đỏ và gọi đúng tên tệp cùng khối cấm; chỉ sửa tài liệu hay hồ sơ thì bài kiểm im (`rang-giu-khuon`)
- Chủ sản phẩm duyệt một vòng giao diện và thấy màn mới đặt cạnh màn mẫu của nhóm, cùng khổ và cùng trạng thái; nhóm chưa có trong bản đồ thì chính vòng ấy tạo mục bản đồ và khuôn (`vong-giao-dien-qua-ban-do`)

## Đã giao — chờ phiên nghiệm thu

- Bộ đồng bộ đưa đúng phần mỗi người được thấy xuống máy, rút mạng năm phút rồi nối lại không mất thay đổi nào (`bai-thu-dong-bo-mat-mang`)
- Lưới bảng hàng 5.000 dòng × 20 cột cuộn, sửa trên ô và dán 500 ô từ Excel mà không giật trên máy tính văn phòng (`bai-thu-luoi-5000-dong`)
- Link trang khách dán vào Zalo hiện ảnh xem trước, và lượt Zalo tự lấy ảnh không bị tính là khách mở (`bai-thu-zalo`)
- Kho có bản đồ khuôn cho các nhóm màn đã có — Cài đặt sàn, Xác thực, trang tạm, trạng thái trống · lỗi · báo — và mỗi nhóm một khuôn có khe mà mọi màn của nhóm dựng qua (`ban-do-khuon-nhom-da-co`)
- Lệnh chốt bán với ngày bán không có thật (như 30 tháng 2) bị từ chối với lỗi nêu đúng trường ngày bán, không phải lỗi hệ thống (`bao-ro-ngay-ban-sai`)
- Người trong sàn đăng nhập và vào đúng vùng dữ liệu của sàn mình; chưa gắn sàn thì không thấy gì (`dang-nhap-theo-san`)
- Đầu chủ gõ mã căn và thấy thuộc tính căn tự điền theo cách đọc mã của dự án; mã chưa có trong danh mục thì báo rõ (`danh-muc-go-ma-can`)
- Bộ dữ liệu mẫu của một sàn thử — một dự án căn hộ, hai mẫu file bảng hàng Excel, lead và chủ nhà giả — sinh từ khuôn của bảng hàng thật, mọi bản ghi mang nhãn mẫu (`du-lieu-mau-san-thu`)
- Mọi thay đổi của hàng đi qua một lệnh API và thành sự kiện chỉ thêm; sáu trạng thái chuẩn, độ tươi và mức đủ thông tin tính ra từ sự kiện (`loi-hang-va-su-kien`)
- Đầu chủ giữ căn thấy chủ nhà, số điện thoại và giá đáy của căn mình; người khác trong sàn mở cùng hồ sơ thì không thấy, và mỗi lần mở số chủ thành một sự kiện (`lop-truong-nguon`)
- Quản trị sàn mời người vào sàn, đặt vai và khu phụ trách; một người giữ được nhiều vai (`moi-nguoi-vai-khu`)
- Bảng hàng và hồ sơ đọc từ kho trên máy nên lọc, cuộn, mở hồ sơ không chờ mạng; sửa ghi trên máy trước, rớt mạng vài phút không mất thay đổi (`nhanh-tuc-thi`)
- Kho có bộ chuẩn giao diện trước màn sản phẩm đầu tiên: thành phần ReUI, skill giao diện của kho, lint giao diện có mức nợ, sàn thiết kế M1 (`tang-5-giao-dien`)
- Đầu chủ để lead và hàng chưa khoá nguồn ở «Chỉ tôi»; hàng lên «Toàn sàn» thì cả sàn mới thấy (`truc-ai-thay-hang`)
- Người trong sàn mở Quỹ hàng và thấy đúng vỏ theo thiết bị và vai: trên máy tính thanh trên, cột nhà và cột góc nhìn; trên điện thoại bốn tab dưới; telesales chỉ Hôm nay và «+ Lead» (`vo-ung-dung`)

## Đã giao

- Đổi đường API, mã lỗi và đường màn đăng nhập sang tiếng Anh, giữ nguyên hành vi và chữ trên màn (`doi-ten-api-tieng-anh`)
- Môi trường chạy thật — Supabase dự án riêng và Vercel vùng Singapore, migration áp qua CI trước khi deploy, mã đăng nhập gửi qua Resend (`moi-truong-that`)
- Nâng kit nghiệm thu lên 2.36.0 và bật các nấc có căn cứ — gộp không dừng ở tệp sinh, phản biện bắt buộc, chặn việc ngoài lộ trình, máy tự định tuyến mục ngoài hợp đồng (`nang-kit-2-36-0`)
- Phiên đăng nhập giữ 30 ngày thay vì 7, vẫn trượt theo ngày dùng (`phien-dang-nhap-30-ngay`)

## Xếp lại sau

- Gói danh mục Invest đẩy sang theo khuôn phiên bản 1 được nhận vào vùng danh mục dùng chung khi thoả thuận đang bật; gói sai khuôn hay thoả thuận tắt bị từ chối (`nhan-danh-muc-invest`)
