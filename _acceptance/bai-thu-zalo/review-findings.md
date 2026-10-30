# Review findings: bai-thu-zalo (round 2)

## Trong hợp đồng

- **Lý do thật khi đường hầm thoát sớm bị nuốt, và thông báo đổ lỗi cho hết 45 giây**
  file: `_acceptance/bai-thu-zalo/thu/chay.mjs:134`
  severity: low
  AC: AC-7
  source: bugs
  detail: Trong moHam, stdout và stderr của cloudflared/ssh chỉ được đưa vào bộ đọc taoBoDocHam rồi bỏ đi. Khi tiến trình thoát ngay (ví dụ ssh báo Permission denied hoặc lỗi khoá máy chủ, hay cloudflared lỗi lúc khởi động), tt.on('exit') gọi ok(null) mà không ghi lại mã thoát hay dòng lỗi. Sau đó chay() in câu «không mở được đường hầm qua ${loai} trong 45 giây (mạng có thể chặn)… thử mạng khác». Câu này mới được thêm trong lượt sửa này. Kết quả: lỗi trả về tức thì bị báo thành hết giờ hoặc mạng chặn, và người chạy không có thông tin nào để sửa. Cách sửa: gom vài dòng stderr cuối cùng cùng mã thoát, rồi phân biệt «tiến trình thoát với mã X: <stderr>» với «hết 45 giây».
  Lý do thuộc hợp đồng: AC-7 đòi khi không mở được đường hầm thì «báo rõ vì sao không mở»; phát hiện cho thấy lỗi thoát tức thì bị báo thành hết giờ hoặc mạng chặn, tức lý do báo sai.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hết 45 giây vẫn để đường hầm chạy; nếu nối muộn thì sau đó in sai «link công khai không còn sống»**
  Người dùng thấy gì: Khi mạng chậm quá 45 giây rồi đường hầm mới nối được, người chạy bài thử đã được báo là chạy trên máy. Sau đó có thể thấy một dòng báo link công khai đã đóng, dù họ chưa từng nhận link công khai đó. Dòng này gây khó hiểu chứ không làm sai số đo.
  Căn cứ: Hậu quả nhẹ: chỉ là một dòng thông báo gây nhầm trong công cụ thử nội bộ, không mất hay lộ dữ liệu, chạy lại là hết, và hiếm xảy ra.
  file: `_acceptance/bai-thu-zalo/thu/chay.mjs`
  severity: low
  Đề xuất: known-limits

- **Số điện thoại thật thay vì placeholder 0900 000 0xx trong test và hồ sơ (r1)**
  Người dùng thấy gì: Trong hồ sơ và bài kiểm có một số điện thoại có dạng số thuê bao đang dùng, trái quy ước chỉ dùng số mẫu của kho. Bài kiểm vẫn chạy đúng, không có khách nào bị ảnh hưởng.
  Căn cứ: Nhẹ: chỉ là số dạng thật trong tài liệu nội bộ, không phải dữ liệu của người thật được xác nhận, và đổi sang số mẫu sau này không tốn gì.
  file: `_acceptance/bai-thu-zalo/thu/may-chu.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **POST /ghi không kiểm `ma` và cho giá trị object đi thẳng vào nhật ký sẽ commit (r1)**
  Người dùng thấy gì: Máy chủ thử mở ra mạng ngoài có một đường ghi nhận dữ liệu lỏng hơn các đường còn lại, người lạ có thể gửi dữ liệu lạ vào nhật ký rồi nhật ký đó được đưa vào kho. Chỉ ảnh hưởng bài thử tạm của chủ kho.
  Căn cứ: Nhẹ: máy chủ chỉ chạy trong buổi thử ngắn, dữ liệu lạ chỉ làm bẩn nhật ký chứ không chạm dữ liệu khách, và chủ kho xem lại được trước khi đưa vào kho.
  file: `_acceptance/bai-thu-zalo/thu/may-chu.mjs`
  severity: low
  Đề xuất: known-limits

- **Phần lời của ket-qua.md gán «Gửi link + tin» cho Safari iPhone, ngược với bảng máy tính ra (r1)**
  Người dùng thấy gì: Báo cáo kết quả kể hai lượt gửi link kèm tin là từ iPhone, trong khi nhật ký ghi chúng đến từ trình duyệt máy tính. Người đọc có thể hiểu sai thiết bị nào đã thử.
  Căn cứ: Trung bình: sai ở lời kể chứ không ở số đo, người ký đối chiếu bảng là thấy, nhưng quyết định chọn cách gửi trên iPhone đang dựa một phần vào câu này nên nên sửa câu.
  file: `_acceptance/bai-thu-zalo/ket-qua.md`
  severity: low
  Đề xuất: known-limits

- **ket-qua.md gán cho Safari iPhone hai lượt «Gửi link + tin» mà nhật ký ghi từ trình duyệt máy tính (r1)**
  Người dùng thấy gì: Báo cáo và ADR kể hai lượt gửi link kèm tin là từ iPhone, nhưng nhật ký cho thấy cả hai đến từ trình duyệt máy tính, nên không có lượt thử nào của iPhone cho cách gửi này. Người quyết định có thể tin rằng cách đó đã được thử trên iPhone.
  Căn cứ: Trung bình: không mất dữ liệu và bảng số vẫn đúng, nhưng nó làm lệch căn cứ chọn cách gửi trên iPhone; sửa lời hoặc thử lại trên iPhone đều rẻ.
  file: `_acceptance/bai-thu-zalo/ket-qua.md`
  severity: medium
  Đề xuất: known-limits

- **Câu trả lời trên /chia-se không gắn với lượt chia sẻ nào, nên đếm «Zalo nhận tin: có» bị trộn (r1)**
  Người dùng thấy gì: Số lần Zalo nhận được tin không tách được theo từng cách gửi, nên khó nói cách gửi nào làm mất tin. Chủ kho phải đọc kèm lời khai của người thử.
  Căn cứ: Nhẹ: chỉ làm số đo kém mịn trong một bài thử một lần, người thử vẫn tự nhớ được cách mình đã gửi và có thể thử lại.
  file: `_acceptance/bai-thu-zalo/thu/may-chu.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP, ma trận không viết trước): ma trận AC-4 rút từ chính MAU_MAY của mã, số assert luôn bằng số phần tử (r1)**
  Người dùng thấy gì: Bài kiểm việc loại lượt do máy tự lấy khỏi số khách mở sẽ không báo đỏ nếu ai đó vô tình bỏ bớt một loại máy khỏi danh sách. Hiện tại cách đếm vẫn đúng.
  Căn cứ: Trung bình: không sai ngay bây giờ nhưng nếu sau này danh sách bị cắt bớt, số khách mở sẽ bị thổi phồng mà không ai hay; chỉ là mã của bài thử nên sửa sau vẫn rẻ.
  file: `_acceptance/bai-thu-zalo/thu/may-chu.test.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 1 (đo cái khác thay vì ĐẦU RA): «bảng đếm của tom-tat.mjs bằng /dem» so demTheoMa với chính nó (r1)**
  Người dùng thấy gì: Bài kiểm xác nhận bảng đếm trong báo cáo khớp với số của máy chủ nhưng thực chất so một phép tính với chính nó, nên không bắt được lỗi ở bước lập bảng. Bảng hiện tại chưa thấy sai.
  Căn cứ: Nhẹ đến trung bình: chỉ làm bài kiểm yếu đi, bảng kết quả thật vẫn tính từ nhật ký và người ký có thể đối chiếu bằng tay.
  file: `_acceptance/bai-thu-zalo/thu/tom-tat.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo đối số của chính bài kiểm thay vì đầu ra): «nhật ký dưới .acceptance-runs/» kiểm thư mục do test tự truyền vào (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm không thật sự chứng minh nhật ký của lệnh chạy thật nằm đúng thư mục dành cho nó. Nếu lệch, nhật ký chỉ nằm sai chỗ.
  Căn cứ: Nhẹ: hậu quả tệ nhất là tìm nhật ký ở chỗ khác hoặc lỡ đưa nhầm vào kho, và chủ kho thấy ngay khi chạy một lần.
  file: `_acceptance/bai-thu-zalo/thu/chay.test.mjs`
  severity: medium
  Đề xuất: wont-fix

- **Hình dạng 2 (fixture VIẾT TAY theo khuôn bên đọc): dòng «mo» của K-1 tự gõ, không qua máy chủ (r1)**
  Người dùng thấy gì: Một ca kiểm dựng dòng nhật ký bằng tay thay vì cho máy chủ thật sinh ra, nên có thể lệch so với nhật ký thật. Kết luận thật chưa thấy sai.
  Căn cứ: Nhẹ: chỉ làm một ca kiểm kém sát thực tế, không đụng dữ liệu hay kết quả thật, và đổi sang cách sinh qua máy chủ sau này rẻ.
  file: `_acceptance/bai-thu-zalo/thu/tom-tat.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm-tính-một-mình): «không có ip_bam» không có đối chứng dương rằng bản thô có khoá đó (r1)**
  Người dùng thấy gì: Bài kiểm xác nhận nhật ký sạch không chứa mã băm IP nhưng sẽ vẫn xanh nếu khoá đó bị đổi tên, khi đó mã băm có thể lọt vào kho mà không ai báo. Nhật ký hiện tại chưa thấy có.
  Căn cứ: Trung bình: nếu xảy ra thì dấu vết IP dạng băm vào kho, nhưng cần ai đó đổi tên khoá trước và chủ kho xem được tệp trước khi đưa vào.
  file: `_acceptance/bai-thu-zalo/thu/tom-tat.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (điểm-case thay cho bảng từng vế): luật vế 3 chỉ có ca xanh, không ca đỏ nào (r1)**
  Người dùng thấy gì: Chưa có bài kiểm chứng minh kết luận về chia sẻ trên iPhone sẽ báo không đạt khi người thử gửi từ máy tính. Luật đang chạy đúng ở ca đạt.
  Căn cứ: Trung bình: nếu luật vế 3 lỏng thì báo cáo có thể ghi đạt oan cho chia sẻ iPhone, nhưng bảng gốc vẫn đủ để người ký đối chiếu.
  file: `_acceptance/bai-thu-zalo/thu/tom-tat.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo hàm chọn thay vì ĐẦU RA): lời báo «không mở được đường hầm» của E5 không được đo (r1 · tệp đã đổi)**
  Người dùng thấy gì: Không có bài kiểm nào xác nhận câu báo khi không mở được đường hầm thực sự hiện ra. Nếu câu này mất đi, người thử không biết vì sao chỉ chạy trên máy.
  Căn cứ: Nhẹ: chỉ là một câu báo trong lệnh chạy thử, thiếu thì người thử gặp rối chút và chạy lại là biết.
  file: `_acceptance/bai-thu-zalo/thu/chay.test.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
