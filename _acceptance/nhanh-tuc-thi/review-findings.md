# Review findings: nhanh-tuc-thi (round 2)

## Trong hợp đồng

- **Đăng xuất ở màn chọn sàn và màn chưa có sàn không xoá kho trên máy**
  AC: AC-10
  file: `apps/web/src/app/(auth)/dang-xuat.tsx:13`
  severity: medium
  source: conventions
  detail: Thay đổi này gắn việc xoá kho vào AccountMenu (dangXuat → bd.dongHan → kho.wipe) và ghi vào Tham chiếu §12 câu «đăng xuất hỏi khi còn thay đổi chờ và luôn xoá kho trên máy» (luật 32). Nhưng nút DangXuat ở (auth)/select-company và (auth)/no-company vẫn chỉ POST /auth/sign-out. Người có nhiều sàn đã có kho IndexedDB `quy-hang-sync:<userId>` (hàng, lịch sử, thay đổi chờ) có thể vào màn chọn sàn, ví dụ khi cookie sàn hết hoặc không hợp lệ, rồi đăng xuất từ đó. Kho trên máy vẫn còn, trái luật 32. Hai nút này nằm ngoài BoDongBoProvider nên cần một đường xoá theo userId, ví dụ indexedDB.deleteDatabase(tenCoSo(userId)), không đi qua hook.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Gửi hàng đợi ghi vào kho trên máy mà không qua lớp chặn thông tin chủ nhà**
  Người dùng thấy gì: Khi máy chủ trả về dữ liệu sau lúc gửi thay đổi, máy không quét lại lần nữa xem có lẫn thông tin chủ nhà hay không. Hiện máy chủ không trả thông tin đó, nên người dùng chưa gặp gì.
  Căn cứ: Chỉ là lớp bảo vệ dự phòng thứ hai, lớp chính ở phía máy chủ vẫn giữ nên chưa lộ dữ liệu; thêm sau rẻ và không cần gấp.
  file: `apps/web/src/lib/sync/gui.ts`
  severity: medium
  Đề xuất: known-limits

- **Bảng Cần xem hiện mã trạng thái RESO thô cho người dùng, không dùng nhãn trong CONTEXT.md**
  Người dùng thấy gì: Trong bảng Cần xem, người dùng thấy trạng thái căn bằng chữ tiếng Anh như Active hay Pending thay vì nhãn tiếng Việt quen thuộc.
  Căn cứ: Chỉ sai chữ hiển thị, không mất hay lộ dữ liệu, người dùng vẫn hiểu và thao tác được; sửa sau rất rẻ.
  file: `apps/web/src/components/sync/bang-can-xem.tsx`
  severity: low
  Đề xuất: known-limits

- **Lỗi tạm thời của máy chủ (401 hết phiên, 5xx) đẩy thao tác chờ ra khỏi hàng đợi thành «cần xem», và chỉ còn lối «Bỏ thay đổi»**
  Người dùng thấy gì: Khi phiên hết hạn hoặc máy chủ trục trặc chốc lát, các thay đổi đang chờ gửi bị đẩy sang danh sách Cần xem và không tự gửi lại. Có căn chỉ còn cách bỏ thay đổi, người dùng mất công sửa lại.
  Căn cứ: Gặp được trong lúc triển khai hay hết phiên và có thể làm người dùng bỏ mất thay đổi đã nhập, nên đáng làm thành việc riêng; nhưng không mất dữ liệu ngầm vì vẫn được báo.
  file: `apps/web/src/lib/sync/gui.ts`
  severity: high
  Đề xuất: new-contract

- **Kéo về thất bại vì 401/5xx hay vì bắt được dữ liệu nguồn bị nuốt và báo «Mất mạng»**
  Người dùng thấy gì: Khi phiên hết hạn hoặc máy chủ lỗi, thanh trên vẫn ghi Mất mạng nên người dùng không biết nguyên nhân thật là phải đăng nhập lại.
  Căn cứ: Chỉ báo sai nguyên nhân, người dùng tải lại hoặc đăng nhập lại là xử lý được và không mất dữ liệu; sửa cần thêm trạng thái mới nên để sau.
  file: `apps/web/src/lib/sync/dong-bo.ts`
  severity: medium
  Đề xuất: known-limits

- **taiLichSu ghi đè cả danh sách hàng bằng bản chụp cũ, đè mất kết quả kéo về hay gửi chạy song song**
  Người dùng thấy gì: Hiếm khi mở hồ sơ đúng lúc đang đồng bộ, danh sách có thể quay về bản cũ trong chốc lát, căn mới kéo về tạm biến mất cho tới lần kéo sau.
  Căn cứ: Chỉ hiển thị cũ tạm thời, lần đồng bộ kế sẽ tự khôi phục, không mất thay đổi chờ gửi.
  file: `apps/web/src/lib/sync/dong-bo.ts`
  severity: medium
  Đề xuất: known-limits

- **Sửa một căn đang «cần xem» tạo thao tác kẹt trong hàng đợi; «Lấy bản mới» hay «Bỏ thay đổi» không bỏ nó**
  Người dùng thấy gì: Nếu người dùng sửa tiếp một căn đang ở danh sách Cần xem, rồi chọn bỏ thay đổi hay lấy bản mới, thay đổi mới sửa vẫn còn trong hàng đợi và sẽ lại bị báo cần xem.
  Căn cứ: Chỉ xảy ra khi sửa căn đang bị báo xung đột và gây thêm một vòng xử lý, không mất dữ liệu; nên xử lý bằng việc riêng.
  file: `apps/web/src/lib/sync/ap-tren-may.ts`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 5 — tuyên quét bảng nhưng bộ đếm suy từ chính bảng (đếm vô nghĩa, không phải ma trận viết trước)**
  Người dùng thấy gì: Bài kiểm tự động chữ trên thanh trạng thái không bắt được trường hợp ai đó lỡ xoá một dòng trong bảng chữ; người dùng không thấy ngay.
  Căn cứ: Chỉ làm bài kiểm lỏng hơn mong muốn, sản phẩm đang chạy đúng; bổ sung sau rẻ.
  file: `apps/web/src/lib/sync/trang-thai.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — kiểm âm tính một mình: phần thấy của Z và lần quét nguồn trên kho của Z không có đối chứng dương**
  Người dùng thấy gì: Bài kiểm việc người ở sàn khác không thấy hàng của sàn này có thể vẫn xanh dù bộ đồng bộ của họ hỏng hẳn, nên bằng chứng yếu hơn mong muốn.
  Căn cứ: Không ảnh hưởng người dùng, chỉ làm bằng chứng nghiệm thu yếu đi; thêm đối chứng sau rẻ.
  file: `apps/web/src/lib/sync/test-db/dong-bo.db-test.mts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — lời hứa là đẳng thức tập (deepEqual tập mã) nhưng ca chỉ kiểm có mặt/vắng mặt của hai mã**
  Người dùng thấy gì: Bài kiểm ai thấy hàng nào chỉ xét hai căn mẫu, nên một căn lạ lọt vào kho sẽ không bị bắt tự động.
  Căn cứ: Chỉ là bài kiểm chưa chặt, không có lỗi thật nào được chỉ ra cho người dùng; siết lại sau rẻ.
  file: `apps/web/src/lib/sync/test-db/dong-bo.db-test.mts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 — eval tuyên cả lớp từ chối (404, 400) × «Bỏ thay đổi» nhưng ca chỉ có một điểm**
  Người dùng thấy gì: Việc bỏ thay đổi khi máy chủ từ chối vì dữ liệu sai chưa có bài kiểm tự động riêng, nên nếu hỏng sẽ khó bị phát hiện sớm.
  Căn cứ: Chỉ thiếu bằng chứng kiểm thử cho một lối ít gặp, không phải lỗi người dùng đã gặp; bổ sung sau rẻ.
  file: `apps/web/src/lib/sync/test-db/dong-bo.db-test.mts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — thao tác chờ viết tay cấy thẳng vào kho thay vì do bộ ghi sinh ra**
  Người dùng thấy gì: Bài kiểm trường hợp máy chủ từ chối dùng thay đổi chờ dựng sẵn thay vì sửa như người dùng thật, nên có thể bỏ sót lỗi ở đường sửa thật.
  Căn cứ: Không ảnh hưởng người dùng trực tiếp, bản kiểm thuần đã phủ đường sửa thật; làm lại bản trên máy chủ thật sau cũng được.
  file: `apps/web/src/lib/sync/test-db/dong-bo.db-test.mts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — kiểm xoá kho của B mà không có đối chứng dương rằng B từng có dữ liệu**
  Người dùng thấy gì: Bài kiểm xoá dữ liệu của người thứ hai chưa chứng minh người đó từng có dữ liệu trước khi xoá, nhưng người dùng không bị ảnh hưởng.
  Căn cứ: Người dùng không gặp gì, và phần xoá đã có đối chứng ở người khác trong cùng bài, nên không đáng mở việc.
  file: `apps/web/src/lib/sync/kho.test.ts`
  severity: low
  Đề xuất: wont-fix

- **Sending changes saves server data on the device without the owner-data check (r1 · tệp đã đổi)**
  Người dùng thấy gì: Lớp kiểm tra chống để lọt thông tin chủ nhà xuống máy chỉ chạy khi tải danh sách, chưa chạy ở bước gửi thay đổi. Hiện máy chủ không trả thông tin chủ nhà ở đường này nên chưa ai thấy hậu quả.
  Căn cứ: Chỉ là lớp bảo vệ thứ hai, chưa có dữ liệu nào lộ, và lớp thứ nhất ở máy chủ vẫn đang chặn.
  file: `apps/web/src/lib/sync/gui.ts`
  severity: medium
  Đề xuất: known-limits

- **Lỗi kéo về nào cũng bị nuốt và báo là «Mất mạng», kể cả khi bắt được nguồn rò ra (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi phiên hết hạn hoặc máy chủ lỗi, thanh trên vẫn ghi «Mất mạng» và người dùng không biết nguyên nhân thật. Ứng dụng cứ thử lại mãi.
  Căn cứ: Không mất dữ liệu, chỉ thông báo sai nguyên nhân; đăng nhập lại hoặc tải lại trang là gỡ được.
  file: `apps/web/src/lib/sync/dong-bo.ts`
  severity: medium
  Đề xuất: known-limits

- **Máy chủ trả 5xx hay 401 bị coi là từ chối: thao tác rời hàng đợi sang Cần xem (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi máy chủ đang lỗi tạm hoặc phiên hết hạn, thay đổi của người dùng bị đẩy sang «Cần xem» thay vì tự gửi lại sau. Có căn còn mất nút «Sửa lại».
  Căn cứ: Thay đổi không mất, người dùng vẫn giữ được ở Cần xem, nhưng phải xử lý tay một việc lẽ ra tự lành; sửa đụng tới cách phân loại lỗi nên nên tách việc riêng.
  file: `apps/web/src/lib/sync/gui.ts`
  severity: medium
  Đề xuất: new-contract

- **`sua` lấy phiên bản kỳ vọng và số thứ tự ngoài bước đọc-rồi-ghi: hai lần sửa sát nhau dựa cùng phiên bản (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bấm lưu hai ô rất sát nhau hoặc mở hai tab cùng lúc có thể khiến lần sửa thứ hai bị báo «đụng nhau» với chính mình. Người dùng phải xử lý ở bảng Cần xem.
  Căn cứ: Hiếm gặp, không mất dữ liệu vì thay đổi còn nằm ở Cần xem và người dùng chọn «Giữ của tôi» là xong.
  file: `apps/web/src/lib/sync/dong-bo.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

