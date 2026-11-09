# Ma trận kiểm kê hệ design và tác động tới Claude Code — 09/11/2026

Trạng thái: **Audit**, chỉ đọc và đo, chưa sửa code, chưa ghi lộ trình. Mã ở `main` @ `e77c8fdc`. Đối chiếu với các tầng của
[bản kiến trúc design nhiều repo](kien-truc-he-design-da-repo.md).

**Chưa xác minh:**
- Phép đo ba tác tử chỉ có một màn giả định, mới ở mức lập phương án, chưa dựng thật. Màn đó có màn mẫu rất gần, nên độ lệch ở màn không có
  mẫu có thể cao hơn.
- Phân loại lý do làm lại do một tác tử làm từ văn bản bản ghi. Tôi đọc lại mẫu ngẫu nhiên 16 bản ghi: 8 thuần về bài kiểm và hạ tầng, 3 lẫn
  cả hai, 5 thuần về sản phẩm, khớp với tỉ lệ 55 %. Sửa ở bước dựng và vòng thiết kế trước Cổng 1 không được đếm, nên lỗi hình thức có thể
  bị đếm thiếu.
- Con số «phòng được» là phán đoán. Mức giảm chi phí khi có danh mục máy đọc chưa được đo.
- Nhiều số đếm là tìm chữ trên mã.

## Kết luận

1. **Trong 49 thành phần: 15 đủ, 15 một phần, 19 thiếu.** Phần đủ dồn ở chỗ tĩnh: màu, khung trang, luật lint, lớp nạp ngữ cảnh cho AI. Phần thiếu dồn
   ở hành vi, chữ và số, và vòng học lại từ lỗi.
2. **Claude Code không đoán lung tung, mà chép màn gần nhất.** Ba tác tử độc lập giống nhau ở 16 trong 21 quyết định. Nhưng 6 trong 16 điểm
   giống đó là chép luôn lỗi của màn mẫu. Hệ quả: một lỗi ở màn mẫu thành lỗi của mọi màn sau.
3. **Mỗi màn mới, Claude Code tự đoán 17–22 quyết định.** Khoảng 70 % trong số đó đáng ra hệ phải trả lời sẵn; còn lại là việc sản phẩm thật sự cần
   người quyết.
4. **Nguồn làm lại lớn nhất không phải thành phần giao diện.** 55 % số lần làm lại đã ghi nhận là do bài kiểm viết sai, môi trường, ghim, gộp. Có khối đóng sẵn thì
   phòng được khoảng 19 % tổng số, hay 31 % số lần làm lại có đổi sản phẩm. Bản kiến trúc hiện chưa có tầng cho phần lớn nhất này.
5. **Thứ tự nên đổi:** làm sạch màn mẫu trước, vì rẻ nhất và lan nhanh nhất; rồi bộ mẫu bài kiểm giao diện; rồi mới tới mẫu hành vi và Lưới.

## 1. Ma trận kiểm kê

Bậc máy giữ theo thang của bản kiến trúc: **1** không thể viết sai · **2** lint, kiểm kiểu · **3** đo trên màn chạy · **4** chấm · **5** chỉ là chữ · **—** chưa có.

| # | Thành phần | Hiện trạng đo được | Claude Code biết bằng gì | Bậc | Mức |
|---|---|---|---|---|---|
| | **Foundations** | | | | |
| 1 | Token màu | 142 biến, cấm màu cứng và lớp màu thô | Luật lint báo ngay | 2 | Đủ |
| 2 | Token bố cục | Lề trang, khung, bề rộng đọc | Lint cấm tự đặt | 2 | Đủ |
| 3 | Vai trò chữ | Chỉ cấm cỡ lạ; 41 thẻ tiêu đề ra 13 tổ hợp thẻ và cỡ | Tự suy từ màn mẫu | 2 phần cỡ, 5 phần vai trò | Một phần |
| 4 | Tệp token máy đọc | Chưa có, nguồn là CSS | Đọc CSS | — | Thiếu, chưa cần |
| | **Core components** | | | | |
| 5 | Linh kiện nền | 42 `ui`, 21 ReUI, danh mục khớp 52 | Danh mục | 2 | Đủ |
| 6 | Khối đã chuyển thể | 22 tệp, bảng khối đích 24 dòng | Bảng khối đích | 4 | Đủ |
| 7 | Trạng thái (trống, lỗi, báo) | 74 tệp, 176 chỗ đi qua một thành phần, 0 ngoại lệ | Bản đồ khuôn | 2 | Đủ |
| 8 | Chờ tải | 12 tệp; danh sách cứng 4 cột, 3/3 tác tử phải nhận lệch | Đọc mã | 2 | Một phần |
| 9 | Ngăn và cột hồ sơ | Một cửa, cấm nhập thẳng ngăn | Lint | 2 | Đủ |
| 10 | Đầu màn | Có thành phần, nhiều màn dùng; tiêu đề thật lại nằm ở khung | Đọc mã | 4 | Một phần |
| 11 | Đầu vùng | Chưa có; ba kiểu trên một trang | Chép | — | Thiếu |
| 12 | Lưới dày chung | 3 chỗ, 3 bộ cấu hình tự viết | Chép | — | Thiếu |
| 13 | Danh sách dòng, bảng phụ | Đã duyệt, 0 trong mã; 9–11 tệp đang dùng bảng thường | ADR | 5 | Thiếu |
| 14 | Kiểu cột (số, tiền, ngày, người) | Canh và định dạng viết tay từng cột | Chép | — | Thiếu |
| 15 | Biểu mẫu | Trường nhập có ở 13 tệp; thanh lưu chưa có | Chép | 2 | Một phần |
| | **Templates** | | | | |
| 16 | Bảy bố cục | Danh sách đóng, 19 tệp | Luật và kiểu | 1–2 | Đủ |
| 17 | Bản đồ khuôn | 19 nhóm, 0 lệch, dừng ở khe nội dung | Tệp khai báo | 2 | Đủ ở cấp trang |
| 18 | Một vùng chính, một tiêu đề cấp một | 5 tệp có `h1` trên 39 trang | Không có | — | Thiếu |
| 19 | Tạo khuôn nhóm mới | Kit có lệnh sinh; cả ba tác tử không nhắc tới lệnh này | Chép | 4 | Một phần |
| | **Interaction patterns** | | | | |
| 20 | Ma trận trạng thái | 5 trạng thái; thiếu một phần hỏng, chữ dài, không đủ quyền, xung đột, người đủ vai | Trang mẫu | 3 | Một phần |
| 21 | Ghi | Luật đã duyệt, thanh lưu 0 trong mã | ADR | 5 | Thiếu |
| 22 | Báo | Toast tự đặt ở 7 tệp | ADR | 5 | Một phần |
| 23 | Lỗi vùng | Khối báo lỗi vùng 0 trong mã | Chép | 5 | Thiếu |
| 24 | Trống có lối thoát | Lối thoát là tuỳ chọn; 3/3 không có «Xoá lọc» khi tìm không ra | Chép | 5 | Một phần |
| 25 | Mở hồ sơ cạnh bảng | Hai cách: có và không có địa chỉ riêng; Esc khác nhau | Chép | — | Thiếu |
| 26 | Tìm, lọc, chia trang | Không có luật; tác tử chia hai phe | Tự đoán | — | Thiếu |
| 27 | Xoá và đổi ý, hướng dẫn lần đầu | Chưa có | Không có | — | Thiếu |
| 28 | Canh cửa theo vai | Đã có mẫu, mỗi trang vẫn tự kiểm | ADR | 4 | Một phần |
| | **Content** | | | | |
| 29 | Từ vựng | Tốt: 3/3 tác tử phát hiện chữ bị cấm | Tệp từ vựng | 4–5 | Đủ |
| 30 | Định dạng tiền | Hai hàm trùng tên; 3/3 nhập chéo từ một màn | Tìm kiếm | — | Thiếu |
| 31 | Định dạng ngày | Không có hàm chung; 3/3 tự viết; 23 tệp ở app gọi thẳng | Chép | — | Thiếu |
| 32 | Nhãn nút, câu lỗi | Không có luật | Chép | — | Thiếu |
| | **Lớp nạp cho Claude Code** | | | | |
| 33 | Luật kho, luật theo đường dẫn | Có, nạp đúng lúc | Tự động | — | Đủ |
| 34 | Skill và danh mục | Có, khoảng 58 KB | Nạp khi gọi | — | Đủ, nặng |
| 35 | Danh mục thành phần có API | Danh mục chỉ ghi tên, nguồn, công dụng; không có tuỳ chọn | Đọc mã | — | Thiếu |
| 36 | Màn mẫu chuẩn | Khuôn có khai màn mẫu, nhưng màn mẫu còn lỗi | Khai trong khuôn | — | Một phần |
| 37 | Kết nối kho khối | Có ReUI và shadcn | Công cụ | — | Đủ |
| 38 | Kiểm khi kết thúc lượt | Kiểm kiểu và lint tệp vừa đổi | Hook | 2 | Đủ |
| | **Conformance** | | | | |
| 39 | Luật lint giao diện | 14 luật, trần nợ 0 | Báo lúc viết | 2 | Đủ |
| 40 | Kiểm chuẩn | Cấu trúc hệ, báo «đạt» | Lệnh | 2 | Đủ |
| 41 | Lưới của kit | Nối 2 trong 4 | Lúc chấm | 2 | Một phần |
| 42 | Kiểm truy cập tự động | 0 | Không có | — | Thiếu |
| 43 | So ảnh, đo căn lề | Có ảnh chuẩn, gần như không dùng để so | Lúc chấm | 4 | Một phần |
| 44 | Bộ mẫu bài kiểm giao diện | Mỗi hồ sơ tự viết; đo được nhiều bài không thể đỏ | Tự viết | — | Thiếu |
| 45 | Ghim và vẽ lại sau gộp | 302 trong 2.302 commit từ 02/11 (13 %) | Lệnh | 2 | Một phần |
| | **Vòng phản hồi** | | | | |
| 46 | Sổ lệch lọt | Có sổ, 0 dòng dù nhiều audit | Không dùng tới | 5 | Một phần |
| 47 | Audit sinh luật | Không có đường | Không có | — | Thiếu |
| 48 | Đo mức dùng hệ | Có trần nợ, chưa có tỉ lệ dùng | Lệnh | 2 | Một phần |
| 49 | Thử với người dùng | 0 buổi | Không có | — | Thiếu |

| Tầng | Đủ | Một phần | Thiếu |
|---|---|---|---|
| Foundations | 2 | 1 | 1 |
| Core components | 4 | 3 | 4 |
| Templates | 2 | 1 | 1 |
| Interaction patterns | 0 | 4 | 5 |
| Content | 1 | 0 | 3 |
| Lớp nạp cho Claude Code | 4 | 1 | 1 |
| Conformance | 2 | 3 | 2 |
| Vòng phản hồi | 0 | 2 | 2 |
| **Tổng** | **15** | **15** | **19** |

## 2. Phép đo: ba tác tử cùng một việc

Ba tác tử mới, độc lập, nhận cùng một câu giao: lập phương án cho màn danh sách «Dự án», đọc đúng những gì kho yêu cầu.

| Quyết định | Tác tử 1 | Tác tử 2 | Tác tử 3 | Kết quả |
|---|---|---|---|---|
| Bố cục | Danh sách – chi tiết | như 1 | như 1 | Giống |
| Tạo khuôn mới | Có | Có | Có | Giống |
| Thành phần bảng | Khung + lưới, không cuộn ảo | như 1 | như 1 | Giống |
| Cấu hình bảng | Chép Liên hệ | như 1 | như 1 | Giống |
| Chiều cao dòng | khoảng 33 px | 37 px | 37 px | **Lệch** |
| Nạp dữ liệu | 50 dòng, «Xem thêm» | Tải hết | Tải hết | **Lệch** |
| Cột số | Phải | Phải | Phải | Giống |
| Cột ngày | Trái | Trái | Phải | **Lệch** |
| Bề rộng ba cột phải | 110/110/110 | 110/120/120 | 120/120/130 | **Lệch** |
| Đường dẫn, mô tả | Có | Có | Có | Giống |
| Tiêu đề trang | Không có `h1` | như 1 | như 1 | Giống, **mang lỗi** |
| Số đếm | Đầu khung | như 1 | như 1 | Giống, **trái ADR** |
| Chờ tải, chưa có | Như nhau | như 1 | như 1 | Giống |
| Tìm không ra | Không có lối thoát | như 1 | như 1 | Giống, **mang lỗi** |
| Lỗi tải | Câu lặp nút «Thử lại» | như 1 | như 1 | Giống, **mang lỗi** |
| Định dạng giá | Nhập chéo từ màn khác | như 1 | như 1 | Giống, **mang nợ** |
| Định dạng ngày | Tự viết | như 1 | như 1 | Giống, **mang nợ** |
| Địa chỉ hồ sơ | Có | Có | Có | Giống |
| Esc, bàn phím | Như nhau | như 1 | như 1 | Giống |
| Điện thoại | Thẻ và ngăn đáy | như 1 | như 1 | Giống |
| Nhãn màn (chữ bị cấm) | Đổi thành «Khu» | Giữ, có báo | Giữ, có báo | **Lệch** |

**Kết quả: 10 giống và ổn, 6 giống nhưng mang lỗi, 5 lệch.**

Điều này sửa một nhận định của bản kiến trúc. Chỗ bất định không phải là «mỗi lần một kiểu» ở mọi nơi. Có màn mẫu gần thì máy rất đồng nhất, kể cả đồng nhất về lỗi; chỉ khi các màn mẫu mâu thuẫn hoặc không nói gì thì máy mới lệch.

| Tác tử | Số quyết định tự đoán | Hệ đáng ra phải trả lời | Việc sản phẩm cần người quyết |
|---|---|---|---|
| 1 | 22 | 15 | 7 |
| 2 | 17 | 12 | 5 |
| 3 | 18 | 13 | 5 |
| **Tổng** | **57** | **40 (70 %)** | **17 (30 %)** |

Chia hai loại là phán đoán. Loại đầu gồm chiều cao, bề rộng, chia trang, địa chỉ riêng, đơn vị giá. Loại sau gồm nhãn, nguồn dữ liệu, vai được xem, nội dung hồ sơ.

**Chi phí chỉ để ra phương án:** 15–26 lượt gọi công cụ, 26–38 tệp, khoảng 2 phút, 180–196 nghìn token mỗi tác tử theo số tự báo (cộng dồn cả phần lặp lại). Riêng tài liệu nền phải đọc khoảng 100 KB.

## 3. Làm lại vì gì

Nguồn: 75 hồ sơ có đụng màn từ 02/11 (lọc khác thì ra 84), 199 đơn vị làm lại. Trung bình 2,2 vòng chấm, trung vị 2, nhiều nhất 7; khoảng 7 trên 10 hồ sơ cần hơn một vòng.

| Lý do | Số | Tỉ lệ | Trong phần có đổi sản phẩm |
|---|---|---|---|
| Bài kiểm, hạ tầng, ghim, gộp | 110 | 55 % | không tính |
| Trạng thái, hành vi | 30 | 15 % | 36 % |
| Dữ liệu, API | 17 | 9 % | 20 % |
| Nghiệp vụ | 11 | 6 % | 13 % |
| Chọn, cấu hình thành phần | 10 | 5 % | 12 % |
| Bố cục | 10 | 5 % | 12 % |
| Hợp đồng, yêu cầu | 5 | 3 % | không tính |
| Link sai | 4 | 2 % | 5 % |
| Chữ, định dạng số | 2 | 1 % | 2 % |
| Màu, token | 0 | 0 % | 0 % |
| Truy cập | 0 | 0 % | 0 % |

- Khoảng 45 % nhóm đầu là bài kiểm do chính AI viết mà không thể đỏ hoặc đo sai thứ; phần còn lại là môi trường, kit, ghim, gộp.
- Số 0 của màu có thể do lint đã chặn sớm, chưa chứng minh được là chưa từng sai.
- Số 0 của truy cập nghĩa ngược lại: **không có ai chấm**. Audit tay vẫn thấy ô không nhãn và tương phản kém. Chữ và định dạng cũng vậy.

**Khối đóng sẵn phòng được bao nhiêu (phán đoán):** thành phần 7/10, bố cục 5/10, hành vi 13/30, bài kiểm khoảng 11/110, link 1/4, còn lại 0. Tổng 37/199.

## 4. Tác động theo từng bước làm tính năng

| Bước | Claude Code cần | Đang thiếu | Hành vi thực tế | Tác động |
|---|---|---|---|---|
| **Nạp ngữ cảnh** | Biết có gì, được chọn gì | Danh mục có API (35) | Đọc 26–38 tệp, suy cấu hình từ mã | Vừa: tốn ở mọi màn, không gây sai |
| **Thiết kế** | Câu trả lời sẵn cho việc lặp lại | Patterns (21–27), Content (30–32) | Tự đoán 17–22 mục | Cao: chủ kho phải duyệt những việc lẽ ra đã xong |
| **Hợp đồng và bài kiểm** | Mẫu bài kiểm, ma trận trạng thái | 44, 20 | Tự viết từng hồ sơ, nhiều bài không đỏ được | **Rất cao** |
| **Dựng** | Thành phần đóng, màn mẫu sạch | 11, 12, 14, 36 | Chép màn gần nhất, chép cả lỗi | Cao: lỗi nhân bản theo số màn |
| **Chấm** | Đo thật trên màn, không nhiễu | 42, 43, 44 | Trung bình 2,2 vòng; hơn nửa số lần làm lại nằm ở bài kiểm và hạ tầng | **Rất cao** |
| **Gộp** | Ít tệp sinh và điểm ghim | 45 | 13 % commit là ghim lại và vẽ lại | Cao, thuộc kit và quy trình |
| **Sau gộp** | Lỗi thành luật | 46, 47, 49 | Audit tìm ra, không thành luật, màn sau lặp lại | Cao về lâu dài, không thấy ngay |

## 5. Xếp hạng thành phần còn thiếu

| Hạng | Thiếu | Tác động tới Claude Code | Bằng chứng | Công | Trong bản kiến trúc? |
|---|---|---|---|---|---|
| 1 | **Màn mẫu chuẩn sạch** (36) | Mọi màn mới chép theo | 6 lỗi nhân bản 3/3 | Thấp, khoảng một ngày máy | Đã thêm |
| 2 | **Bộ mẫu bài kiểm giao diện** (44, 45) | Bớt vòng chấm và bài kiểm vô dụng | 110/199, 13 % commit | Vừa, ở kit | Đã thêm |
| 3 | **Mẫu hành vi** (21, 23, 25, 26) | Bớt lỗi nặng nhất có đổi sản phẩm, bớt đoán | 30 đơn vị, phòng 13 | Vừa | Có |
| 4 | **Lưới, đầu vùng, kiểu cột** (11, 12, 14) | Khoá đúng chỗ đang lệch | 20 đơn vị, phòng 12; 5 lệch | Vừa | Có |
| 5 | **Bộ định dạng và luật chữ** (30–32) | Bớt tự viết, tránh sai im lặng | 3/3 tự viết, ít được chấm | Thấp | Có |
| 6 | **Ma trận trạng thái đủ ca** (20) | Bắt ca nặng từ lúc viết hợp đồng | Audit: màn nói sai khi đọc hỏng | Thấp | Có |
| 7 | **Kiểm truy cập** (18, 42) | Không làm chậm máy; rủi ro cho người dùng | 0 ai chấm, audit tay thấy lỗi | Thấp | Có |
| 8 | **Audit sinh luật** (46, 47) | Máy học từ lỗi đã gặp | Sổ 0 dòng | Vừa | Có |
| 9 | **Danh mục có API** (35) | Giảm chi phí đọc, chưa rõ giảm sai | Chưa đo | Vừa | Có |
| — | Tệp token máy đọc (4) | Không đáng kể ở một repo | 0 đơn vị | — | Chỉ khi có repo thứ hai dùng |

## 6. Đề xuất

1. **Làm sạch Liên hệ thành màn mẫu chuẩn**, tức hàng `hai-bang-mot-nep`, cộng tiêu đề cấp một và câu lỗi. Khai nó làm mẫu cho kiểu màn danh sách. Đây là thay đổi rẻ mà tác động lan
   sang mọi màn về sau.
2. **Làm bộ mẫu bài kiểm giao diện**: cách chờ màn sẵn sàng, bài phá thử bắt buộc để chứng minh bài kiểm đỏ được. Việc này thuộc kit.
3. **Làm mẫu hành vi và Lưới theo bản kiến trúc**, ưu tiên hồ sơ cạnh bảng và chia trang vì đang không có câu trả lời.
4. **Giữ ngoài:** tệp token máy đọc, cho tới khi repo thứ hai cần.

Bản kiến trúc đã được sửa theo kết quả này: thêm lớp **Verification kit**, thêm **reference implementation** (màn mẫu chuẩn) vào Source of truth, sửa §1 theo phát hiện «chép màn gần nhất», và đổi thứ tự lộ trình.
