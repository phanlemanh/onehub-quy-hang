## Trong hợp đồng

- **Trang thử xoá sự kiện mạng khi máy chủ hay đường hầm trả lỗi HTTP**
  file: `_acceptance/bai-thu-dong-bo-mat-mang/thu/trang-thu.html:48`
  severity: high
  AC: AC-7
  source: bugs
  detail: guiSuKien() gọi `await fetch('/ghi', ...)` rồi `ds.shift()` và ghi lại localStorage mà không kiểm `r.ok`. fetch chỉ ném lỗi khi hỏng ở tầng mạng. Khi đường hầm cloudflared chết hoặc máy chủ đóng, trycloudflare vẫn trả một phản hồi HTTP (502/530), nên sự kiện «tat»/«bat» bị xoá vĩnh viễn trên máy trong khi máy chủ không nhận được gì. Ngay sau đó hd.day() có kiểm r.ok và ném lỗi, nên thao tác vẫn nằm trong hàng đợi, còn bằng chứng khoảng mất mạng thì đã mất. Vế 2 vì thế không bao giờ ghép được khoảng mất mạng. Đây đúng là kịch bản của phiên thật (đường hầm rớt). Cần `if (!r.ok) throw ...` trước `ds.shift()`.

- **Vế 2 chấm «mọi thao tác lên đúng thứ tự» mà chỉ nhìn các thao tác đã áp**
  file: `_acceptance/bai-thu-dong-bo-mat-mang/thu/tom-tat.mjs:62`
  severity: medium
  AC: AC-9
  source: bugs
  detail: thaoTacTrong() lọc theo `o.tao_luc`, mà apLo trong may-chu.mjs chỉ gắn tao_luc cho kết quả 'da-ap'. Các kết quả 'bi-tu-choi', 'loi', 'da-ap-truoc' không có tao_luc nên bị loại trước khi vào dungThuTu. Hệ quả là phép kiểm `da.length !== ops.length` trong dungThuTu không bao giờ đúng (mã chết). Thao tác cuối dải bị từ chối hoặc lỗi, và các thao tác chưa từng được đẩy lên (ví dụ lô bị cắt, phần còn lại kẹt trên máy), đều vô hình: vế 2 vẫn 'đạt' chỉ với phần đã áp. Contract AC-9 đòi «mọi thao tác ấy lên máy chủ đúng thứ tự». Số chờ so_cho có ghi kèm sự kiện «tat»/«bat» nhưng không được dùng để đối chiếu.

- **Vế 1 bỏ qua các lần kéo không đặt sàn hoặc mang người lạ**
  file: `_acceptance/bai-thu-dong-bo-mat-mang/thu/tom-tat.mjs:76`
  severity: medium
  AC: AC-9
  source: bugs
  detail: ketLuan() lọc trước `keo.filter(d => d.loai === 'keo' && NGUOI[d.nguoi])`, nên lần kéo của phiên không đặt sàn (nguoi null hoặc lạ) không bao giờ vào `ban.every(b => b.sach)`. Nhánh 'phiên không đặt sàn' của keoSach vì thế là mã chết với kết luận. Nếu một lần kéo như vậy làm lộ dòng hay số chủ, bảng «Các lần kéo về» sẽ hiện «không — …» nhưng Vế 1 vẫn 'đạt'. Contract AC-9 nói «mọi lần kéo về trong phiên thật».

- **Lô vẫn áp tiếp sau khi một thao tác lỗi, phá thứ tự khi gửi lại**
  file: `_acceptance/bai-thu-dong-bo-mat-mang/thu/may-chu.mjs:127`
  severity: medium
  AC: AC-4
  source: bugs
  detail: Trong apLo, khi một op ném lỗi thì catch lùi savepoint, ghi 'loi' rồi `continue`. Các op có client_seq lớn hơn vẫn được áp. hang-doi.mjs không coi 'loi' là xong (XONG không có 'loi'), nên op lỗi được gửi lại ở lần đẩy sau và được áp SAU các op mới hơn. Kết quả: giá cuối là giá của op cũ, và seq máy chủ không còn tăng theo client_seq. Lỗi bị nuốt thành trạng thái mà trang không báo (trang chỉ hiện 'bi-tu-choi'). kiemThuTu chỉ kiểm từng lô nên không bắt được trường hợp này. Muốn giữ thứ tự thì phải dừng lô ở op lỗi đầu tiên.

- **Làm tròn giây khiến khoảng mất mạng dưới 5 phút vẫn qua ngưỡng**
  file: `_acceptance/bai-thu-dong-bo-mat-mang/thu/tom-tat.mjs:48`
  severity: low
  AC: AC-9
  source: bugs
  detail: `giay: Math.round((den - tu) / 1000)` rồi ở dòng 87 so `k.giay * 1000 >= NAM_PHUT_MS`. Một khoảng 299,5 giây được làm tròn thành 300 và tính là ≥ 5 phút. Nên so trên số mili giây gốc.

- **Ca AC-2 «A1 đổi giá rồi A2 kéo» không kiểm lần ghi có được áp**
  file: `_acceptance/bai-thu-dong-bo-mat-mang/thu/dong-bo.test.mjs:80`
  severity: low
  AC: AC-2
  source: bugs
  detail: `await day('a1', [opMoi(1, 'A-01', 3300)])` không assert ket_qua là 'da-ap'. Nếu lần ghi bị từ chối hoặc lỗi thì ca vẫn xanh mà không thử đúng điều nó mô tả: dòng thay đổi trên căn có số chủ.

- **Hình dạng 1, đo lời nhắn thay vì đầu ra: ca «AC-8 một lệnh» chỉ dò câu in ra, không đếm bảng mẫu thật**
  file: `_acceptance/bai-thu-dong-bo-mat-mang/thu/dong-bo.test.mjs:254`
  severity: medium
  AC: AC-8
  source: measurement
  detail: E8 hứa «bảng mẫu có 2 sàn, 4 người». Assert `assert.match(ra, /2 sàn, 4 người, 6 căn/)` lại khớp một chuỗi viết cứng ở chay.mjs:97 (`... đã áp dữ liệu mẫu: 2 sàn, 4 người, 6 căn`). Chuỗi này không lấy từ cơ sở dữ liệu hay từ du-lieu-mau.mjs. Nếu apDuLieuMau áp thiếu sàn, thiếu người hay thiếu căn, dòng in vẫn y nguyên và ca vẫn xanh. Phép đo đang đọc lời báo của lệnh chứ không đọc dữ liệu lệnh tạo ra.

- **Hình dạng 2, fixture viết tay: bản ghi kéo bị lộ ở AC-9 nặn sẵn theo khuôn của tom-tat.mjs**
  file: `_acceptance/bai-thu-dong-bo-mat-mang/thu/dong-bo.test.mjs:226`
  severity: low
  AC: AC-9
  source: measurement
  detail: Ca «một lần kéo chứa dòng sàn khác → vế 1 không đạt» đẩy vào nhật ký một dòng viết tay `{ loai: 'keo', nguoi: 'b1', current_user: 'quy_hang_app', cong_ty_nhan: [SAN_B, SAN_A], so_chu_nhan: [...] }`. Dòng này dùng đúng tên khoá mà keoSach/ketLuan đọc. Nó không được lấy từ dòng `keo` thật máy chủ ghi (taoMayChu ghi `cong_ty_nhan`/`so_chu_nhan`) rồi sửa giá trị. Vì vậy ca này không ghim được việc khuôn bên ghi và bên đọc khớp nhau ở nhánh lộ. Làm khác đi thì rẻ: lấy bản sao một dòng keo trong `dong` rồi thêm SAN_A vào cong_ty_nhan.

- **Hình dạng 5, tuyên một lớp nhưng chỉ có một điểm: AC-9 thiếu ca «số chủ ngoài ma trận vai»**
  file: `_acceptance/bai-thu-dong-bo-mat-mang/thu/dong-bo.test.mjs:225`
  severity: medium
  AC: AC-9
  source: measurement
  detail: E9 liệt kê trước ca «một lần kéo về chứa dòng sàn khác HOẶC số chủ ngoài ma trận vai → vế cách ly không đạt với «lộ trong phiên thật»». Khối AC-9 chỉ có một ca lộ, là ca dòng sàn khác (cong_ty_nhan có SAN_A). Không ca nào cho so_chu_nhan lệch ma trận, nên nhánh ở tom-tat.mjs:29 (`lộ trong phiên thật: số chủ ngoài ma trận vai`) chưa từng chạy. Nếu nhánh này hỏng, ví dụ chỉ so size hoặc bị bỏ đi, bộ kiểm vẫn xanh trong khi evals tuyên đã phủ.

- **Hình dạng 4, assert âm tính một mình: ca AC-3 «hàm kéo không lọc theo sàn» xanh cả khi kéo về rỗng**
  file: `_acceptance/bai-thu-dong-bo-mat-mang/thu/dong-bo.test.mjs:96`
  severity: low
  AC: AC-3
  source: measurement
  detail: Ca chỉ gọi `kiemKeoTheoSan('b1', kq)`. Hàm này chỉ ném lỗi khi gặp company_id lạ, nên kết quả rỗng (ví dụ set_config không ăn, luật theo dòng chặn hết) vẫn qua. Ca không có đối chứng dương kiểu `kq.listings.length >= 1`, như AC-1 làm cho đường qua máy chủ. Vì vậy lời hứa của E3, «chỉ trả dòng sàn của phiên», mới được đo nửa âm tính trên đường gọi thẳng hàm kéo.

- **Hình dạng 3, chỉ assert chuỗi có mặt: ca «bảng kết quả có hai vế và mọi lần kéo» không kiểm phần «mọi lần kéo»**
  file: `_acceptance/bai-thu-dong-bo-mat-mang/thu/dong-bo.test.mjs:231`
  severity: low
  AC: AC-9
  source: measurement
  detail: Ca chỉ có hai `assert.match(bang, /\| 1 \| .* \| đạt \|/)` và `/\| 2 \| .* \| đạt \|/`, tức là dò xem chuỗi «đạt» có trong hàng vế 1 và vế 2 hay không. Tên ca hứa thêm một quan hệ: bảng có một hàng cho mỗi lần kéo trong phiên (ba vai a1, tnA, b1). Không assert nào so số hàng ở mục «Các lần kéo về» với số dòng `keo` trong nhật ký, nên bảng bỏ sót lần kéo vẫn xanh.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bài kiểm tự lùi về Postgres cổng 5547 và xoá schema ở đó, trái với lời khai ở config và với chay.mjs**
  Người dùng thấy gì: Chạy bài kiểm mà quên khai cơ sở dữ liệu thì nó lặng lẽ xoá bảng mẫu trên máy nào đang nghe cổng thử. Chỉ ảnh hưởng dữ liệu mẫu của dãy thử.
  Căn cứ: Hậu quả nhẹ vì chỉ mất bảng mẫu thử, dựng lại bằng một lệnh, và không chạm dữ liệu thật của khách.
  file: `_acceptance/bai-thu-dong-bo-mat-mang/thu/dong-bo.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **/dem không cần xác thực nhưng trả nhật ký có số chủ của mọi vai, qua đường hầm công khai**
  Người dùng thấy gì: Ai có đường link của phiên thử đều xem được số chủ nhà mẫu đã cấp cho từng vai. Hiện chỉ là số giả nên chưa lộ gì thật.
  Căn cứ: Dữ liệu chỉ là số mẫu và đường link chỉ sống trong phiên thử ngắn, nên hại thật gần như bằng không; sửa sau cũng rẻ.
  file: `_acceptance/bai-thu-dong-bo-mat-mang/thu/may-chu.mjs`
  severity: low
  Đề xuất: known-limits

- **Mã thử của hồ sơ này import mã thử của hồ sơ bai-thu-zalo**
  Người dùng thấy gì: Nếu hồ sơ thử Zalo bị dọn, bài thử đồng bộ sẽ không chạy được nữa. Người dùng sản phẩm không bị ảnh hưởng.
  Căn cứ: Mã thử này vốn bỏ đi sau khi chốt quyết định kiến trúc, nên rủi ro hỏng về sau không đáng công sửa.
  file: `_acceptance/bai-thu-dong-bo-mat-mang/thu/chay.mjs`
  severity: low
  Đề xuất: wont-fix

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
