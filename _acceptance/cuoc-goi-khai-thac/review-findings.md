# Review findings: cuoc-goi-khai-thac (round 2)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Byte ảnh đã ghi lên Storage bị bỏ sót nếu lệnh commit thất bại sau khi napBanThat trả về**
  Người dùng thấy gì: Nếu bước chốt dữ liệu lỗi đúng lúc nạp bản thật, ảnh đã tải lên kho ngoài có thể nằm lại mà không căn nào trỏ tới, và lời báo không cho biết. Chỉ gặp khi nạp dữ liệu thử, người dùng cuối không thấy.
  Căn cứ: Chỉ ảnh thừa trên kho khi nạp dữ liệu thử gặp lỗi hiếm, không mất dữ liệu thật, chạy nạp lại hoặc dọn tay được; sửa không gấp.
  file: `packages/db/seed/nap-ban-that.ts`
  severity: medium
  Đề xuất: known-limits

- **Kho Postgres: dọn sau lỗi luôn báo nhầm «không xoá được N/N ảnh»**
  Người dùng thấy gì: Khi nạp bản thật lỗi, máy báo sai là không xoá được hết ảnh dù thực tế đã được gỡ sạch. Người vận hành có thể lo có rác trong khi không có.
  Căn cứ: Chỉ là câu báo sai gây lo nhầm, dữ liệu vẫn sạch và không ảnh hưởng người dùng cuối; sửa rẻ nhưng không cấp bách.
  file: `packages/db/seed/nap-ban-that.ts`
  severity: low
  Đề xuất: known-limits

- **Hình 4 (âm tính một mình, không thể đỏ): ca «kho-storage» khẳng định bảng byte rỗng nhưng kho giả không bao giờ ghi bảng ấy**
  Người dùng thấy gì: Một bài kiểm cho việc nạp ảnh vào kho ngoài luôn xanh dù cách chọn kho có sai. Nếu sau này chọn nhầm kho, bài kiểm này sẽ không báo.
  Căn cứ: Chỉ làm bài kiểm yếu, người dùng không bị ảnh hưởng trực tiếp; thuộc hồ sơ nạp mẫu có ảnh nên nên xử lý ở việc riêng.
  file: `packages/db/seed/nap-ban-that.test.ts`
  severity: medium
  Đề xuất: new-contract

- **Hình 2 (dữ liệu viết tay đúng khuôn bên đọc): dung-d.mjs tự chép tay số phòng ngủ thay vì đọc danh mục mà trang gọi đọc**
  Người dùng thấy gì: Kịch bản thử tự chép số phòng ngủ; nếu dữ liệu mẫu đổi, phép so với trang cuộc gọi có thể lệch mà không ai hay. Hiện hai bên vẫn khớp, người dùng không thấy gì.
  Căn cứ: Hiện đang khớp nên chưa có hậu quả với người dùng, chỉ rủi ro bảo trì sau này; ghi lại là đủ.
  file: `_acceptance/cuoc-goi-khai-thac/thu/dung-d.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình 5 (tuyên cả lớp nhưng chỉ đo vài điểm): anh-mau kiểm khuôn và tính riêng biệt trên {0, 1, 28}, trong khi bộ nạp vẽ ảnh cho thứ tự 0..39**
  Người dùng thấy gì: Bài kiểm ảnh mẫu chỉ thử vài thứ tự trong số 40 nên có thể bỏ sót một ảnh trùng hay sai khuôn ở thứ tự khác. Ảnh chỉ dùng cho dữ liệu thử.
  Căn cứ: Chỉ ảnh mẫu của dữ liệu thử, sai lệch nếu có cũng nhẹ và dễ thấy bằng mắt; không đáng mở việc mới.
  file: `packages/db/seed/anh-mau.test.mjs`
  severity: low
  Đề xuất: known-limits

- **Push subscription endpoint accepts any https URL, so the server will POST to hosts the user picks (r1)**
  Người dùng thấy gì: Một thành viên có thể khai địa chỉ nhận thông báo trỏ tới nơi bất kỳ, rồi hệ thống sẽ tự gửi yêu cầu tới địa chỉ đó mỗi khi có lead mới hay đổi người. Người ngoài có thể lợi dụng để khiến máy chủ gọi tới nơi họ chọn.
  Căn cứ: Lỗi bảo mật thật nhưng nằm ở tính năng thông báo đẩy chứ không phải chế độ cuộc gọi, nên nên mở việc riêng để sửa gọn thay vì lẫn vào lần ship này.
  file: `packages/api/src/push/routes.ts`
  severity: medium
  Đề xuất: new-contract

- **Chế độ cuộc gọi coi 409 «already-called» là lỗi, nên mốc gọi đầu không bao giờ được đánh dấu xong (r1)**
  Người dùng thấy gì: Nếu mốc gọi đầu đã được ghi từ máy khác sau khi mở thẻ, thẻ vẫn báo «Lead đã ghi gọi rồi» và không chuyển sang Đã gọi. Đầu chủ vẫn gọi và ghi câu trả lời bình thường, chỉ thấy dòng báo lỗi thừa.
  Căn cứ: Hậu quả nhẹ: không mất hay sai dữ liệu, chỉ là dòng báo lỗi gây khó hiểu, và tải lại màn là hết; ca hiếm vì cần hai thiết bị cùng gọi một lead.
  file: `apps/web/src/app/(app)/units/call/goi-dau.ts`
  severity: low
  Đề xuất: known-limits

- **Phím tắt toàn màn vẫn chạy khi con trỏ ở nút ngoài danh sách hỏi: Enter bị chặn, phím số và Delete ghi hay xoá câu trả lời (r1)**
  Người dùng thấy gì: Khi con trỏ đang ở một nút như «Đã gọi» hay nút bao phí, bấm Enter không kích hoạt nút đó, còn bấm phím số hoặc Delete có thể ghi hay xoá một câu trả lời ngoài ý muốn.
  Căn cứ: Có thể ghi nhầm hoặc xoá nhầm một câu trả lời, nhưng người dùng thấy ngay trên màn và chọn lại được; chỉ xảy ra khi đang dùng bàn phím trên nút ngoài danh sách.
  file: `apps/web/src/app/(app)/units/call/cuoc-goi.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 — fixture viết tay đúng khuôn bên đọc: ca 409 của mốc gọi đầu dùng mã lỗi mà đường first-call không bao giờ trả (r1)**
  Người dùng thấy gì: Bài kiểm cho tình huống máy chủ từ chối ghi mốc gọi dùng một lý do mà máy chủ thật không bao giờ trả, nên nó không bảo vệ được tình huống lead đã trả lại. Người dùng không gặp lỗi mới từ chỗ này.
  Căn cứ: Không ảnh hưởng người dùng hôm nay, chỉ làm lưới an toàn của đội yếu đi ở một ca hiếm; ghi lại để lần sau sửa bài kiểm.
  file: `apps/web/src/app/(app)/units/call/goi-dau.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — lời hứa «giữa là trung vị» chỉ thử bằng một điểm có hai căn, nơi trung vị trùng trung bình (r1)**
  Người dùng thấy gì: Bài kiểm dải giá thấp – giữa – cao chỉ thử trên hai căn, nên nếu cách tính «giữa» bị đổi thành trung bình thì bài kiểm vẫn xanh. Với toà có từ ba căn trở lên, mức «giữa» người dùng thấy có thể lệch mà không ai phát hiện.
  Căn cứ: Hiện chưa có dấu hiệu tính sai, chỉ là lưới kiểm thưa; sửa sau rẻ và không đụng dữ liệu người dùng.
  file: `packages/core/src/pricing/so-gia.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — assertion âm tính đứng một mình: dòng «dc1 tự nhận từ kho chung» ra 0 lần gửi trên sàn s2, không có đối chứng dương trên s2 (r1)**
  Người dùng thấy gì: Một bài kiểm về việc không gửi thông báo cho người tự nhận lead từ kho chung có thể vẫn xanh dù cả đường gửi thông báo hỏng. Người dùng sẽ không nhận ra cho tới khi thiếu thông báo thật.
  Căn cứ: Chỉ là độ chặt của bài kiểm ở tính năng khác, không làm sai hành vi hiện tại; chi phí chỉnh vượt lợi ích trong lần này.
  file: `packages/api/test-db/thong-bao-lead.test.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 — «bố cục: không dựng Frame» chỉ có chiều âm, không đối chứng dương (r1)**
  Người dùng thấy gì: Bài kiểm cấm bố cục bọc khung chỉ nhìn một chiều, nên nếu khung được đổi cách dựng thì bài kiểm không bắt được. Người dùng chỉ thấy khác biệt nếu giao diện bị bọc khung sai.
  Căn cứ: Là chuyện thẩm mỹ giao diện, tự thấy được bằng mắt và sửa lại dễ; không đáng mở việc riêng.
  file: `apps/web/src/components/bo-cuc/bo-cuc.test.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5 — ma trận vùng đếm 21 ô nhưng chỉ có 20 ô được kiểm trên HTML (r1)**
  Người dùng thấy gì: Một ô trong ma trận bố cục (cột phụ của Danh sách – chi tiết) chỉ được so với bảng khai chứ không được dựng thử. Nếu cột phụ đó hỏng thì không bài kiểm nào báo.
  Căn cứ: Chỉ một ô trong hệ bố cục dùng chung, lỗi nếu có sẽ hiện ra ngay khi mở màn và không mất dữ liệu.
  file: `apps/web/src/components/bo-cuc/bo-cuc.test.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 3 — «chờ tải theo bố cục» chỉ kiểm có chuỗi nhãn data-cho-tai, không kiểm hình (r1)**
  Người dùng thấy gì: Bài kiểm khung chờ tải chỉ xem nhãn tự khai chứ không xem hình thật, nên nếu mọi kiểu dùng chung một khung thì vẫn qua. Người dùng chỉ thấy khung chờ kém sát với trang thật lúc đang tải.
  Căn cứ: Ảnh hưởng chỉ ở vài giây chờ tải, không mất dữ liệu và không chặn việc nào; lỗi hiển thị thì nhìn thấy ngay.
  file: `apps/web/src/components/bo-cuc/cho-tai.test.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 3 — «tuyến … dựng qua TrangThai/ChoTai» chỉ kiểm có dòng import (r1)**
  Người dùng thấy gì: Bài kiểm chỉ xác nhận trang có nhập thành phần trạng thái chung chứ không kiểm trang có thật sự dùng nó. Một trang vẫn có thể hiện trạng thái trống hay lỗi theo kiểu riêng mà không ai bắt.
  Căn cứ: Chỉ làm giao diện kém đồng nhất giữa các trang, không ảnh hưởng dữ liệu hay thao tác; sửa lúc nào cũng được.
  file: `apps/web/src/components/trang-thai.test.ts`
  severity: low
  Đề xuất: wont-fix

⚠ Cụm ngoài vùng phủ: 5/5 lỗi rơi vào file không bộ đo nào phủ (packages/db/seed/nap-ban-that.ts, packages/db/seed/nap-ban-that.test.ts, _acceptance/cuoc-goi-khai-thac/thu/dung-d.mjs, packages/db/seed/anh-mau.test.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
