## Trong hợp đồng

- **Hình dạng 3: kiểm «có mặt» hai mã căn, trong khi lời hứa là trọn tập căn mỗi người thấy**
  file: `apps/web/src/lib/sync/test-db/dong-bo.db-test.mts:50`
  severity: medium
  AC: AC-1
  detail: E1 hứa so trọn tập mã căn trong kho với một tập viết tay bằng deepEqual: X = {chỉ tôi, toàn sàn}, Y = {toàn sàn}, Z = {} (không căn nào của sàn A). Dòng 49-52 chỉ kiểm hai mã chiToi/toanSan có hay không trong danhSach(): `co(bd, id) => bd.danhSach().some(l => l.id === id)`. Như vậy kho của Z có thể chứa căn của bất kỳ sàn nào khác (kể cả căn khác của sàn A) và kho của Y có thể chứa căn «Chỉ tôi» khác mà ca vẫn xanh, miễn là hai mã kia đúng. Lời hứa «mỗi người đúng phần được thấy» là quan hệ bằng nhau giữa hai tập, không phải hai lần kiểm có mặt. AC-1 đòi kho của Y «chỉ có» căn Toàn sàn và kho của Z «không có căn nào» của sàn A; kiểm chỉ hai mã không chứng minh được điều đó.
  source: measurement

- **Hình dạng 3: «Lấy bản mới» hứa bản trên máy bằng trọn bản máy chủ, ca chỉ so một trường giá**
  file: `apps/web/src/lib/sync/test-db/dong-bo.db-test.mts:207`
  severity: low
  AC: AC-6
  detail: E6 hứa sau «Lấy bản mới» thì «bản trên máy deepEqual bản máy chủ». Dòng 207 chỉ so `bd.danhSach().find(l => l.id === h2)!.listPrice` với `giaHienTai(X, h2)`. Các trường khác như phiên bản, feeInclusion, lastConfirmedAt có thể lệch so với máy chủ mà ca vẫn xanh. Lời hứa là quan hệ bằng nhau trên cả bản ghi, phép đo chỉ chạm một giá trị. AC-6 đòi sau «Lấy bản mới» bản trên máy bằng máy chủ; ca chỉ so giá nên chưa chứng minh được trọn bản.
  source: measurement

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Đường gửi ghi thân trả về của máy chủ vào kho trên máy mà không qua lưới chặn thông tin nguồn (bất biến 2)**
  Người dùng thấy gì: Máy chủ vốn không trả thông tin chủ nhà; nếu một ngày nó lỡ trả, đường gửi sẽ không có lớp chặn thứ hai như đường tải về. Hiện chưa thấy người dùng gặp gì.
  Căn cứ: Hiện chưa có dữ liệu chủ nhà nào lọt ra, lớp chặn chính ở máy chủ vẫn giữ, chỉ thiếu lớp dự phòng thứ hai nên mức nguy hại thấp.
  file: `apps/web/src/lib/sync/gui.ts`
  severity: medium
  Đề xuất: known-limits

- **Bảng Cần xem trong vỏ thật hiện mã trạng thái tiếng Anh thay cho nhãn tiếng Việt ở CONTEXT.md**
  Người dùng thấy gì: Trong bảng Cần xem, người dùng thấy tên trạng thái bằng tiếng Anh như «Pending» hay «Closed» thay vì «Đang giao dịch», «Đã bán».
  Căn cứ: Chỉ là sai chữ hiển thị, không mất dữ liệu và người dùng vẫn hiểu, xử lý được; sửa rẻ và có thể gộp vào lúc làm màn thật.
  file: `apps/web/src/components/sync/bang-can-xem.tsx`
  severity: low
  Đề xuất: known-limits

- **Lỗi tạm thời của máy chủ (5xx, 401 hết phiên) bị coi là «máy chủ từ chối»: thao tác chờ rời hàng đợi, nằm ở «cần xem» thay vì được gửi lại**
  Người dùng thấy gì: Khi máy chủ trục trặc ngắn hoặc phiên hết hạn, thay đổi hợp lệ của người dùng bị đẩy sang mục Cần xem thay vì tự gửi lại; khi hết phiên người dùng chỉ còn cách bỏ thay đổi.
  Căn cứ: Không mất thay đổi âm thầm vì căn vẫn hiện ở Cần xem, nhưng người dùng phải xử lý tay và có thể buộc bỏ việc đã sửa; cần định nghĩa hành vi mới nên làm riêng.
  file: `apps/web/src/lib/sync/gui.ts`
  severity: medium
  Đề xuất: new-contract

- **Lần kéo về nuốt mọi lỗi và báo «Mất mạng», kể cả khi lưới chặn nguồn từ chối, hết phiên hay IndexedDB lỗi**
  Người dùng thấy gì: Khi hết phiên hoặc kho trên máy lỗi, thanh trên vẫn báo «Mất mạng» dù mạng bình thường, nên người dùng không biết nguyên nhân thật.
  Căn cứ: Không mất dữ liệu nhưng chỉ báo nói sai và người dùng không tự gỡ được nếu là hết phiên; cần thêm trạng thái mới nên là việc riêng.
  file: `apps/web/src/lib/sync/dong-bo.ts`
  severity: medium
  Đề xuất: new-contract

- **Đường gửi ghi bản căn và lịch sử máy chủ trả vào kho mà không qua lưới chặn nguồn**
  Người dùng thấy gì: Đường gửi thay đổi không có lớp kiểm tra thứ hai chống thông tin chủ nhà như đường tải về; hiện người dùng chưa gặp vấn đề.
  Căn cứ: Chưa có dữ liệu chủ nhà nào lọt ra và máy chủ đã chặn từ gốc, nên chỉ là thiếu lớp dự phòng, mức nguy hại thấp.
  file: `apps/web/src/lib/sync/gui.ts`
  severity: low
  Đề xuất: known-limits

- **Sửa căn đang «cần xem» rồi bấm «Giữ của tôi» đảo thứ tự thay đổi: sửa cũ đè sửa mới, hoặc căn lại rơi vào Cần xem**
  Người dùng thấy gì: Nếu người dùng sửa tiếp một căn đang ở Cần xem rồi bấm «Giữ của tôi», giá cuối có thể là lần sửa cũ thay vì lần sửa sau cùng, hoặc căn lại quay về Cần xem.
  Căn cứ: Chỉ xảy ra khi sửa thêm lúc căn đang chờ xử lý và có thể làm giá cuối sai ý người dùng, nhưng người dùng sửa lại được; cách xử lý cần được chốt thành luật riêng.
  file: `apps/web/src/lib/sync/xu-ly-can-xem.ts`
  severity: medium
  Đề xuất: new-contract

- **Lỗi ngoài mất mạng trong một lượt gửi/kéo thành promise bị từ chối mà không ai bắt**
  Người dùng thấy gì: Khi có lỗi bất ngờ (kho trên máy lỗi, máy chủ trả dữ liệu sai khuôn), thanh trên có thể vẫn báo «Đã đồng bộ» và người dùng không thấy gì.
  Căn cứ: Là lỗi hiếm, dữ liệu trên máy vẫn còn và lượt sau thử lại được, nhưng người dùng không được báo; sửa nhỏ có thể gộp khi làm lỗi hiển thị.
  file: `apps/web/src/lib/sync/dong-bo.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5: số dòng đã so được đếm trên chính mảng đang lặp, nên phép đếm luôn đúng**
  Người dùng thấy gì: Nếu ai đó vô tình xoá một dòng của bảng chữ chỉ báo, bài kiểm vẫn xanh; người dùng có thể mất một dạng chữ báo mà không ai hay.
  Căn cứ: Chỉ là độ chặt của bài kiểm, không ảnh hưởng người dùng hiện tại và các dòng còn lại vẫn được so đúng; không đáng mở việc riêng.
  file: `apps/web/src/lib/sync/trang-thai.test.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4: «kho đã xoá không bị ghi lại» chỉ có kiểm âm tính, không có đối chứng dương**
  Người dùng thấy gì: Bài kiểm đăng xuất giữa lúc đang gửi có thể xanh dù không thật sự thử tình huống đó, nên chưa chắc kho không bị ghi lại sau khi xoá.
  Căn cứ: Chỉ là độ tin cậy của bài kiểm cho tình huống hiếm, người dùng chưa thấy lỗi; bổ sung đối chứng rẻ và có thể làm sau.
  file: `apps/web/src/lib/sync/dong-bo.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2: thao tác chờ của ca 404 được viết tay cấy thẳng vào kho, không đi qua bên ghi**
  Người dùng thấy gì: Bài kiểm trường hợp căn không còn đọc được dùng thao tác viết tay, nên chưa chứng minh đường sửa thật dẫn tới đúng kết quả đó.
  Căn cứ: Đường sửa thật đã được kiểm ở ca máy chủ giả, rủi ro còn lại nhỏ và người dùng chưa gặp lỗi; không đáng mở việc riêng.
  file: `apps/web/src/lib/sync/test-db/dong-bo.db-test.mts`
  severity: low
  Đề xuất: wont-fix

- **Gửi hàng đợi ghi vào kho trên máy mà không qua lớp chặn thông tin chủ nhà (r2)**
  Người dùng thấy gì: Khi máy chủ trả về dữ liệu sau lúc gửi thay đổi, máy không quét lại lần nữa xem có lẫn thông tin chủ nhà hay không. Hiện máy chủ không trả thông tin đó, nên người dùng chưa gặp gì.
  Căn cứ: Chỉ là lớp bảo vệ dự phòng thứ hai, lớp chính ở phía máy chủ vẫn giữ nên chưa lộ dữ liệu; thêm sau rẻ và không cần gấp.
  file: `apps/web/src/lib/sync/gui.ts`
  severity: medium
  Đề xuất: known-limits

- **Bảng Cần xem hiện mã trạng thái RESO thô cho người dùng, không dùng nhãn trong CONTEXT.md (r2)**
  Người dùng thấy gì: Trong bảng Cần xem, người dùng thấy trạng thái căn bằng chữ tiếng Anh như Active hay Pending thay vì nhãn tiếng Việt quen thuộc.
  Căn cứ: Chỉ sai chữ hiển thị, không mất hay lộ dữ liệu, người dùng vẫn hiểu và thao tác được; sửa sau rất rẻ.
  file: `apps/web/src/components/sync/bang-can-xem.tsx`
  severity: low
  Đề xuất: known-limits

- **Lỗi tạm thời của máy chủ (401 hết phiên, 5xx) đẩy thao tác chờ ra khỏi hàng đợi thành «cần xem», và chỉ còn lối «Bỏ thay đổi» (r2)**
  Người dùng thấy gì: Khi phiên hết hạn hoặc máy chủ trục trặc chốc lát, các thay đổi đang chờ gửi bị đẩy sang danh sách Cần xem và không tự gửi lại. Có căn chỉ còn cách bỏ thay đổi, người dùng mất công sửa lại.
  Căn cứ: Gặp được trong lúc triển khai hay hết phiên và có thể làm người dùng bỏ mất thay đổi đã nhập, nên đáng làm thành việc riêng; nhưng không mất dữ liệu ngầm vì vẫn được báo.
  file: `apps/web/src/lib/sync/gui.ts`
  severity: high
  Đề xuất: new-contract

- **Kéo về thất bại vì 401/5xx hay vì bắt được dữ liệu nguồn bị nuốt và báo «Mất mạng» (r2 · tệp đã đổi)**
  Người dùng thấy gì: Khi phiên hết hạn hoặc máy chủ lỗi, thanh trên vẫn ghi Mất mạng nên người dùng không biết nguyên nhân thật là phải đăng nhập lại.
  Căn cứ: Chỉ báo sai nguyên nhân, người dùng tải lại hoặc đăng nhập lại là xử lý được và không mất dữ liệu; sửa cần thêm trạng thái mới nên để sau.
  file: `apps/web/src/lib/sync/dong-bo.ts`
  severity: medium
  Đề xuất: known-limits

- **taiLichSu ghi đè cả danh sách hàng bằng bản chụp cũ, đè mất kết quả kéo về hay gửi chạy song song (r2 · tệp đã đổi)**
  Người dùng thấy gì: Hiếm khi mở hồ sơ đúng lúc đang đồng bộ, danh sách có thể quay về bản cũ trong chốc lát, căn mới kéo về tạm biến mất cho tới lần kéo sau.
  Căn cứ: Chỉ hiển thị cũ tạm thời, lần đồng bộ kế sẽ tự khôi phục, không mất thay đổi chờ gửi.
  file: `apps/web/src/lib/sync/dong-bo.ts`
  severity: medium
  Đề xuất: known-limits

- **Sửa một căn đang «cần xem» tạo thao tác kẹt trong hàng đợi; «Lấy bản mới» hay «Bỏ thay đổi» không bỏ nó (r2)**
  Người dùng thấy gì: Nếu người dùng sửa tiếp một căn đang ở danh sách Cần xem, rồi chọn bỏ thay đổi hay lấy bản mới, thay đổi mới sửa vẫn còn trong hàng đợi và sẽ lại bị báo cần xem.
  Căn cứ: Chỉ xảy ra khi sửa căn đang bị báo xung đột và gây thêm một vòng xử lý, không mất dữ liệu; nên xử lý bằng việc riêng.
  file: `apps/web/src/lib/sync/ap-tren-may.ts`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 5 — tuyên quét bảng nhưng bộ đếm suy từ chính bảng (đếm vô nghĩa, không phải ma trận viết trước) (r2)**
  Người dùng thấy gì: Bài kiểm tự động chữ trên thanh trạng thái không bắt được trường hợp ai đó lỡ xoá một dòng trong bảng chữ; người dùng không thấy ngay.
  Căn cứ: Chỉ làm bài kiểm lỏng hơn mong muốn, sản phẩm đang chạy đúng; bổ sung sau rẻ.
  file: `apps/web/src/lib/sync/trang-thai.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — kiểm âm tính một mình: phần thấy của Z và lần quét nguồn trên kho của Z không có đối chứng dương (r2)**
  Người dùng thấy gì: Bài kiểm việc người ở sàn khác không thấy hàng của sàn này có thể vẫn xanh dù bộ đồng bộ của họ hỏng hẳn, nên bằng chứng yếu hơn mong muốn.
  Căn cứ: Không ảnh hưởng người dùng, chỉ làm bằng chứng nghiệm thu yếu đi; thêm đối chứng sau rẻ.
  file: `apps/web/src/lib/sync/test-db/dong-bo.db-test.mts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — lời hứa là đẳng thức tập (deepEqual tập mã) nhưng ca chỉ kiểm có mặt/vắng mặt của hai mã (r2)**
  Người dùng thấy gì: Bài kiểm ai thấy hàng nào chỉ xét hai căn mẫu, nên một căn lạ lọt vào kho sẽ không bị bắt tự động.
  Căn cứ: Chỉ là bài kiểm chưa chặt, không có lỗi thật nào được chỉ ra cho người dùng; siết lại sau rẻ.
  file: `apps/web/src/lib/sync/test-db/dong-bo.db-test.mts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 — eval tuyên cả lớp từ chối (404, 400) × «Bỏ thay đổi» nhưng ca chỉ có một điểm (r2)**
  Người dùng thấy gì: Việc bỏ thay đổi khi máy chủ từ chối vì dữ liệu sai chưa có bài kiểm tự động riêng, nên nếu hỏng sẽ khó bị phát hiện sớm.
  Căn cứ: Chỉ thiếu bằng chứng kiểm thử cho một lối ít gặp, không phải lỗi người dùng đã gặp; bổ sung sau rẻ.
  file: `apps/web/src/lib/sync/test-db/dong-bo.db-test.mts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — thao tác chờ viết tay cấy thẳng vào kho thay vì do bộ ghi sinh ra (r2)**
  Người dùng thấy gì: Bài kiểm trường hợp máy chủ từ chối dùng thay đổi chờ dựng sẵn thay vì sửa như người dùng thật, nên có thể bỏ sót lỗi ở đường sửa thật.
  Căn cứ: Không ảnh hưởng người dùng trực tiếp, bản kiểm thuần đã phủ đường sửa thật; làm lại bản trên máy chủ thật sau cũng được.
  file: `apps/web/src/lib/sync/test-db/dong-bo.db-test.mts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — kiểm xoá kho của B mà không có đối chứng dương rằng B từng có dữ liệu (r2)**
  Người dùng thấy gì: Bài kiểm xoá dữ liệu của người thứ hai chưa chứng minh người đó từng có dữ liệu trước khi xoá, nhưng người dùng không bị ảnh hưởng.
  Căn cứ: Người dùng không gặp gì, và phần xoá đã có đối chứng ở người khác trong cùng bài, nên không đáng mở việc.
  file: `apps/web/src/lib/sync/kho.test.ts`
  severity: low
  Đề xuất: wont-fix

- **Sending changes saves server data on the device without the owner-data check (r1)**
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

- **Máy chủ trả 5xx hay 401 bị coi là từ chối: thao tác rời hàng đợi sang Cần xem (r1)**
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
