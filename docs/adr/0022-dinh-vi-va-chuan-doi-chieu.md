# ADR-0022: Định vị và chuẩn đối chiếu — Quỹ hàng là gì, so với ai, theo luật nào

Ngày: 2026-11-01 · Trạng thái: **đề xuất** (bản nháp phiên thiết kế; chủ kho duyệt hướng rồi mới mở PR, accepted khi PR
gộp) · Liên quan: ADR-0017 của onehub-invest (gốc); ADR-0008 (lõi hàng, sự kiện chỉ thêm), ADR-0017 (chia lead), ADR-0018
(cấu hình theo sàn), ADR-0019 (cổng chọn khối), ADR-0020 (lead bốn nấc), ADR-0021 (liên hệ); Tham chiếu §1, §5, §7, §8,
§15; Kiến trúc §0; [Sổ điểm biến thiên](../architecture/so-diem-bien-thien.md) · chi tiết đối chiếu:
[Đối chiếu ngành](../product/doi-chieu-nganh.md) · luật cho bản thiết kế:
[`.claude/rules/thiet-ke-doi-chieu.md`](../../.claude/rules/thiet-ke-doi-chieu.md)

## Bối cảnh

Ngày 01/11 có hai lần thiết kế dựng cứng theo câu giao, trong khi phần mềm cùng ngành để người dùng tự cấu hình:

| | Lần 1: chủ nhà và lead (hàng 11, 24, 25, 27 → vá ở 85) | Lần 2: Hôm nay của đầu chủ (hàng 22) |
| --- | --- | --- |
| Đã dựng | Chủ nhà của hàng và lead mang số riêng, mỗi thứ một bản ghi; không bản ghi nào biết đó là cùng một người | Năm hàng đợi, điều kiện và thứ tự viết trong mã; sàn chỉ chỉnh được hai ngưỡng ngày |
| Ngành làm | RESO `Contacts`: một người có nhiều số, nhiều loại liên hệ, một người giữ | Follow Up Boss (Smart Lists), KW Command (SmartViews), Lofty (Segments): danh sách là bộ lọc lưu được, có bộ mặc định, sàn và người dùng tự tạo |
| Ai thấy | Đo được ở hàng 24, 25, 27: chủ trùng phải so trên hai bảng, «Lên bảng» phải đoán. Dãy L đề nghị vá | Chủ kho, ở Cổng Phạm vi, khi hỏi «CRM gọi tính năng này là gì» |
| Giá phải trả | Một hàng T3 để vá (85), kèm chuyển dữ liệu | Chưa viết mã, bắt kịp ở cổng |

Hai lần có chung một gốc (ghi chép của dãy G, 01/11):

1. Bước thiết kế lấy câu giao và Tham chiếu làm **trần**. Câu giao liệt năm nhóm thì máy dựng đúng năm nhóm, không ai hỏi
   sàn thứ hai làm khác thì sao.
2. Luật «đối chiếu ngành ở S1» (01/11 sáng) chỉ đòi so với RESO. RESO định nghĩa **dữ liệu**, không định nghĩa **cách làm
   việc**: hàng đợi, kịch bản gọi, lý do, nấc. Phần «sản phẩm cùng loại làm thế nào» chưa có luật nào đòi.
3. Nguyên tắc «mọi kết nối là một thoả thuận» và ADR-0018 «cấu hình theo sàn» đã có. Nhưng ở bước thiết kế không có câu
   hỏi bắt buộc nào kiểm chỗ ta đang viết chết trong khi ngành để sàn tự định nghĩa.

Giám sát đợt `dau-chu-dong-vao` đã thêm hai luật thường trực vào luật của đợt (01/11). Luật của đợt hết hiệu lực khi đợt
đóng. Chủ kho hỏi thêm ba câu: Quỹ hàng là gì, luật thiết kế kiến trúc là gì, và nhóm sản phẩm tương đồng là những ai.
Chủ kho bổ sung REDX và BoomTown vào nhóm tương đồng.

## Quyết định

### 1. Định vị: Quỹ hàng là phần mềm phía cung cho sàn môi giới

Quỹ hàng là **phần mềm phía cung (phía chủ nhà, phía hàng) cho một sàn môi giới**. Ba khối, một dây chuyền:

| Khối | Là gì | Gần nhất trong ngành |
| --- | --- | --- |
| **Quỹ hàng nội bộ** | Một kiểu MLS thu nhỏ bên trong một sàn: mỗi căn một hàng, trạng thái chuẩn, giá kèm điều kiện phí, độ tươi, ảnh, ai thấy gì | Hệ MLS theo chuẩn RESO, nhưng chỉ trong một sàn. Ở CRM Mỹ đây chỉ là tính năng phụ: Internal Listing của KW, Manual Listing của Lofty và BoldTrail |
| **Khai thác và CRM phía chủ nhà** | Lead chủ nhà, liên hệ, chia lead, hàng đợi gọi, chế độ cuộc gọi, gọi ép giá, giữ tươi | REDX (khai thác chủ nhà, gọi theo danh sách); Follow Up Boss, KW Command, Lofty, BoldTrail (CRM) |
| **Phát hàng** | Gửi căn cho đầu khách, khách và môi giới sàn khác bằng link sống; người luôn bấm gửi | Collection của KW; RESO `ContactListings`; chế độ Concierge và Preview của MLS (máy soạn, môi giới duyệt) |

Không sản phẩm nào trong nhóm tương đồng phủ cả ba khối, nên chuẩn đối chiếu đi **theo năng lực**, không theo một đối thủ
(mục 2).

**Quỹ hàng không phải là:**

- **Cổng đăng tin.** Quỹ hàng không mở cho công chúng tìm nhà. Đăng Platform là một cửa ra theo thoả thuận (Tham chiếu §3).
- **MLS liên sàn.** Mỗi sàn một vùng cách ly (bất biến 1). Hợp tác giữa hai sàn là một loại kết nối có thoả thuận, không
  phải một kho chung.
- **Chưa phải CRM phía người mua.** Liên hệ khách (hàng 86) chỉ gắn khách với Lần gửi và lịch xem. Nuôi khách mua, chấm
  điểm hành vi, chiến dịch tự động chưa nằm trong phạm vi.
- **Không phải phần mềm giao dịch.** Không quản lý hợp đồng, chữ ký hay hồ sơ đóng giao dịch. «Đã bán» chỉ ghi giá chốt và
  ngày bán.
- **Không phải công cụ gửi tin tự động.** Không quay nhiều số cùng lúc, không chiến dịch thư hay tin nhắn tự động, không
  tự gửi căn theo lịch, không đăng nhóm, không tự trả lời (bất biến 3). Chỗ này Quỹ hàng **cố ý khác** ngành: REDX quay
  ba line cùng lúc; BoomTown, Lofty, BoldTrail chạy chiến dịch nuôi tự động; RESO `Prospecting` gửi căn theo lịch.
- **Không phải nền tảng ngang.** Kiến trúc §0 đã chốt: SaaS dọc theo ngành, không ngang như Salesforce. Linh hoạt nằm ở cấu
  hình và kết nối, không ở đối tượng tự tạo.

### 2. Nhóm sản phẩm tương đồng, chia theo năng lực

Đối chiếu đi theo **năng lực**, mỗi năng lực có ít nhất hai sản phẩm có tên. Chi tiết về cách họ làm, chỗ cấu hình và
đường dẫn nguồn của từng khẳng định nằm ở trang sống [Đối chiếu ngành](../product/doi-chieu-nganh.md), tra ngày 01/11. ADR
chỉ giữ nhóm tương đồng và điều rút ra.

| Năng lực | Sản phẩm đối chiếu chính | Họ để cấu hình ở đâu | Quỹ hàng hôm nay |
| --- | --- | --- | --- |
| Tìm và khai thác chủ nhà, gọi theo danh sách | REDX, Lofty, Follow Up Boss | Danh sách gọi là bộ lọc hay thư mục **người dùng dựng**; chỉ nguồn dữ liệu chủ nhà là cố định (REDX bán) | Chưa có danh sách nguồn; gọi từ máy tính ở hàng 30 |
| Liên hệ | RESO `Contacts`, KW Command, Follow Up Boss, Lofty | Loại liên hệ thường cố định; tag, trường riêng, vai gán do sàn hay người đặt | Đúng hướng (ADR-0021) |
| Chia lead | Follow Up Boss, KW Command, Lofty, BoldTrail, BoomTown | **Sàn**, ở cả năm sản phẩm kiểm được; bốn sản phẩm cho luật có thứ tự theo điều kiện | Đúng hướng (ADR-0017); luật theo điều kiện là ứng viên #30 |
| Hàng đợi và danh sách việc | Follow Up Boss (Smart Lists), KW (SmartViews), Lofty (Segments), BoomTown | **Bộ lọc lưu được**, có bộ mặc định; sàn hay người luôn thêm được; một bản ghi thuộc nhiều danh sách. Chỉ ba ngăn theo ngày là cố định | **Lệch**: năm hàng đợi viết chết, mỗi căn đúng một hàng đợi (hàng 22, sổ K8) |
| Đường ống | KW (Phase cố định, Stage tự đặt), Follow Up Boss, Lofty; BoomTown và BoldTrail cố định | **Hai tầng**: mốc cố định để so số, bước giữa do sàn đặt | Bốn nấc cố định (ADR-0020) |
| Quản lý listing và trạng thái | RESO (`StandardStatus` ↔ `MlsStatus`), KW Internal Listing, Lofty | Chuẩn cố định, nhãn của MLS hay sàn **neo vào** chuẩn | Đúng hướng (§5, hàng 46); ba lý do Ngừng hẳn cố định (K12) |
| Ảnh | RESO `Media` (`Permission`: Public, IDX, VOW, Agent Only) | Quyền hiển thị gắn từng ảnh | Đúng hướng; ba ngăn đứng trên bất biến |
| Phát hàng và trang khách | RESO `Prospecting` và `ContactListings`, KW Collection, Flexmls, Lofty | Người gửi đặt từng lần; MLS có chế độ môi giới duyệt trước | Cố ý không tự gửi; link sống ≈ Collection + `ContactListings` |
| Cấu hình theo sàn | Lofty, BoldTrail (ba cấp), KW (quyền theo ứng dụng), Follow Up Boss (dồn về chủ tài khoản) | Hãng dựng sẵn → sàn đặt → người tự thêm | Hãng → sàn (ADR-0018); cấp người ở góc nhìn; chưa có cấp đội |
| Chế độ cuộc gọi: kịch bản, kết quả gọi, lý do mất | Lofty (kịch bản người viết), REDX (kịch bản hãng soạn), KW (lý do mất gõ tự do, checklist theo stage), Follow Up Boss (mất là stage do sàn đặt) | Không hãng nào dùng **một** lý do mất cố định. Phần lớn còn **chưa kiểm** | Bốn kết quả gọi cố định (§5); một lý do trả lead (ADR-0020); danh sách hỏi = năm mục mức đủ (K6) |

**Sản phẩm Việt Nam** có trang chính thức: Meey CRM, Rocker, Landsoft Agency, BEE LAND, DIGINET, OneHousing Pro Agent.
Trang của họ chỉ ở mức tiếp thị, không công bố các năng lực trên. Điều đáng ghi: BEE LAND và DIGINET cho doanh nghiệp chọn
màu trạng thái căn; OneHousing kiểm duyệt căn trước khi đăng (Quỹ hàng chọn máy kiểm, không người duyệt — luật 17). Chưa
thấy sản phẩm Việt Nam nào giữ kín nguồn chủ nhà ngay trong sàn hay phát hàng bằng link sống. Đó là chỗ khác biệt.

**Ba điều rút ra:**

1. **Danh sách làm việc là dữ liệu.** Hàng đợi, danh sách gọi và kịch bản đều do sàn hay người dựng từ bộ lọc. Hãng chỉ
   cấp bộ mặc định.
2. **Danh sách có nghĩa chung là hai tầng.** Trạng thái, đường ống và loại liên hệ có một lõi cố định để số liệu so được,
   cộng nhãn hay bước của sàn **neo vào** lõi. Mẫu chuẩn là RESO `StandardStatus` ↔ `MlsStatus`; KW làm cùng mẫu (Phase ↔
   Stage).
3. **Không phải chỗ nào ngành cũng mở.** BoomTown và BoldTrail giữ cứng đường ống; KW giữ cứng nhãn số. Vì vậy mỗi chỗ là
   một câu hỏi có khuyến nghị, không phải một phản xạ «mở hết».

### 3. Luật thiết kế kiến trúc — một bảng

Một chỗ cho mọi luật. Cột «Giữ bằng» nói luật ấy có máy kiểm hay chỉ là luật chữ. Tầng theo Kiến trúc §0.

| # | Luật | Nội dung | Gốc | Giữ bằng |
| --- | --- | --- | --- | --- |
| B1 | Cách ly giữa công ty | Mọi bảng của công ty bật và ép luật theo dòng; API chạy bằng vai không phải chủ bảng | AGENTS bất biến 1; ADR-0005 | Bộ kiểm cách ly, bắt buộc trước mỗi lần phát hành; check `isolation` |
| B2 | Thông tin chủ nhà không rời công ty | Lớp `source` có trần `never_leaves_company`, chặn thêm ở cơ sở dữ liệu | Bất biến 2; ADR-0010, ADR-0013 | Ràng buộc cơ sở dữ liệu; bộ ca của lõi; ổ khoá T3 |
| B3 | Người luôn bấm gửi | Không gửi Zalo cá nhân, không đăng nhóm, không tự trả lời; chỉ mở bảng chia sẻ | Bất biến 3 | Không có đường tích hợp; luật chữ |
| B4 | Phần nội bộ không ra trang khách | Dữ liệu ra ngoài dựng từ luật ẩn ở lõi, không ẩn ở giao diện | Bất biến 4 | Bộ kiểm rò rỉ (hàng 31, chưa dựng); tới khi ấy là luật chữ |
| A1 | SaaS dọc theo ngành | Kiến trúc dựng cơ chế, vận hành chọn chính sách; không đối tượng tự tạo, không công thức | Kiến trúc §0; ADR-0017 của onehub-invest | Luật chữ |
| A2 | Mọi kết nối là một thoả thuận | Invest, Platform hay công ty khác đều là bên của một loại kết nối, mở tới trần của lớp dữ liệu | AGENTS; `agreements.ts` | Bộ ca của lõi; ổ khoá T3 |
| A3 | RESO trước | Tên trường và giá trị theo RESO Data Dictionary khi có; đặc trưng Việt Nam mới đặt tên riêng | AGENTS; ADR-0016; Tham chiếu §15 | Luật chữ; đối chiếu RESO ở bước thiết kế |
| A4 | Một đường ghi, qua API | Mọi thay đổi đi qua `/api/v1`; câu ghi chỉ nằm ở một chỗ | ADR-0008 quyết định 2 | Kiểm thử quét mã nguồn và hàm cơ sở dữ liệu |
| A5 | Hàng là chuỗi sự kiện chỉ thêm | Số trên màn tính lại được từ sự kiện; nấc và mốc suy từ dữ kiện | ADR-0008; ADR-0020, ADR-0021 | Trigger chặn sửa và xoá; bộ ca gấp lại |
| A6 | Cấu hình theo sàn, ba bậc | Tham số → chọn trong thực đơn → bảng quyết định khi có số đo; một sổ điểm biến thiên; lõi nhận cấu hình làm tham số | ADR-0018 | Bộ kiểm sổ ↔ mã (hàng 81, chưa dựng) |
| A7 | Schema chỉ đổi bằng migration mới | Không sửa migration đã commit; bảng mới đủ luật theo dòng | AGENTS | Hook chặn sửa; `/new-migration` |
| A8 | ReUI trước | Thang dùng lại bảy bậc; ô chưa có khuôn thì trình ba lối ở Cổng Phạm vi | ADR-0002, ADR-0019 | Lint quy-hang-ui, mức nợ 0; răng giữ khuôn |
| A9 | Dữ liệu cá nhân thật không vào kho | Dùng `[Tên]`, `0900 000 0xx` | AGENTS; luật `du-lieu-ca-nhan` | gitleaks ở hook `pre-commit` |
| **D1** | **Câu giao là điểm sàn, không phải trần** | Câu giao và Tham chiếu nói tối thiểu phải có gì; thiết kế hỏi sàn thứ hai làm khác thì sao | **Mới — ADR này** | Luật cho bản thiết kế; Cổng Phạm vi |
| **D2** | **Danh sách cố định trong câu giao mặc định là dữ liệu của sàn** | Áp cho nhóm, bước, nấc, hàng đợi, câu hỏi, lý do, mẫu, luật. Có bộ mặc định, sàn ghi đè theo A6. Danh sách có nghĩa chung đi hai tầng: chuẩn của lõi cộng nhãn của sàn neo vào. Giữ cứng phải có một trong bốn lý do (bất biến; nghĩa chuẩn để so giữa sàn; quyền và an toàn; nền tảng) và thành một điều khoá trong sổ | **Mới — ADR này** | Luật cho bản thiết kế; điều khoá ở sổ; Cổng Phạm vi |
| **D3** | **Một người là một liên hệ** | Chủ bán, chủ cho thuê, người mua, người thuê đều là loại của một liên hệ; không bảng người riêng cho từng vai | **Mới thành luật** — ADR-0021 | Bộ ca liên hệ; luật cho bản thiết kế |
| **D4** | **Thiết kế đối chiếu RESO và ít nhất hai sản phẩm** | Bảng đối chiếu có cột «ta viết cứng — họ cho cấu hình»; mỗi dòng ở cột này thành một Hỏi ở Cổng Phạm vi; khẳng định về sản phẩm khác kèm nguồn | **Mới** — mở rộng luật đợt 01/11 | Luật cho bản thiết kế; phản biện context sạch |

D2 không nới A1. «Dữ liệu của sàn» là các dòng dựng từ tập điều kiện, giá trị hay chiến lược **đóng** của lõi, ví dụ một
hàng đợi là một bộ lọc trên các điều kiện lõi biết tính. Nó không phải đối tượng sàn tự tạo, công thức hay kịch bản.
Ranh giới «tới khi có số đo từ hai sàn thật» của ADR-0018 giữ nguyên cho bậc 3.

### 4. Gắn vào quy trình

1. **Tệp luật cố định** [`.claude/rules/thiet-ke-doi-chieu.md`](../../.claude/rules/thiet-ke-doi-chieu.md), áp cho
   `docs/superpowers/specs/**`. Đây là chỗ bản thiết kế được viết ở bước S1 của vòng tính năng. Luật đối chiếu của đợt
   `dau-chu-dong-vao` hết hiệu lực khi đóng đợt; tệp này giữ nó lại thường trực.
2. **Trang sống** [Đối chiếu ngành](../product/doi-chieu-nganh.md): bản thiết kế lấy sản phẩm đối chiếu từ đây, tra được
   gì mới thì bổ sung trong cùng PR. Thêm một dòng vào bảng «mỗi loại thông tin một chỗ» ở `docs/README.md`.
3. **Tham chiếu §1** có một dòng trỏ ADR này; §12 thêm một dòng quyết định; §15 trỏ trang Đối chiếu ngành cho phần «cách
   làm việc». `AGENTS.md` thêm một dòng ở «Luật làm việc».
4. **Danh sách xem lại.** Hàng đã gộp, hay luật Tham chiếu đã chốt, có cùng kiểu cứng. Không mở hàng mới cho việc xem lại.
   Mỗi mục thành một Hỏi ở Cổng Phạm vi của hàng **sắp chạm** chỗ ấy. Khuyến nghị dưới đây là của máy; người chọn ở cổng.

   | # | Chỗ cứng | Ở đâu | Ngành làm | Khuyến nghị | Hỏi ở hàng |
   | --- | --- | --- | --- | --- | --- |
   | X1 | Năm hàng đợi của Hôm nay viết chết; mỗi căn đúng một hàng đợi | Hàng 22 (chưa gộp); luật 18; sổ K8 | Bộ lọc lưu được, có mặc định; một bản ghi ở nhiều danh sách | Hàng đợi thành dữ liệu của sàn, năm nhóm làm bộ mặc định; xem lại K8 | 22 — **đang ở Cổng Phạm vi** |
   | X2 | Một lý do trả lead «Số không liên lạc được» | Hàng 27 (gộp); `RETURN_REASON_LABEL` | KW gõ tự do; Follow Up Boss dùng stage do sàn đặt | Lý do trả lại thành dữ liệu của sàn: lý do hiện có làm mặc định, sàn thêm, kèm ghi chú. Hỏi riêng: lý do khác số sai có đi «Sửa số và gửi lại» không | 22 (nút «Trả lại» ở màn của đầu chủ) |
   | X3 | Bốn nấc lead cố định | Hàng 27 (gộp); ADR-0020 | KW: năm Phase cố định, Stage tự đặt; Follow Up Boss, Lofty giữ mốc; BoomTown, BoldTrail cố định | **Giữ** bốn nấc làm mốc (lý do: nghĩa chuẩn, suy từ dữ kiện, so số giữa sàn); ghi điều khoá. Mở bước giữa khi có sàn xin | 42 (Hôm nay của trưởng nhóm đọc phễu) |
   | X4 | Danh sách hỏi của màn cuộc gọi = năm mục mức đủ cố định | Hàng 8 (gộp); luật 16; sổ K6 → hàng 28 | KW checklist theo stage; Lofty kịch bản người viết; REDX kịch bản hãng soạn | Giữ năm mục lõi (so được giữa sàn); sàn **thêm** câu hỏi, chỉ thêm không bớt. Câu thêm không vào mức đủ chuẩn | 28 |
   | X5 | Bốn kết quả gọi ở mọi màn | Tham chiếu §5 | Lofty có màn kết quả, danh mục chưa kiểm; Follow Up Boss: kết quả cuộc hẹn do chủ tài khoản đặt | Giữ bốn kết quả làm chuẩn (mỗi cái là một sự kiện của lõi); sàn thêm kết quả phụ neo vào một trong bốn | 22, 28 |
   | X6 | Ba lý do Ngừng hẳn | Hàng 8 (gộp); sổ K12 | RESO `MlsStatus` neo vào chuẩn; KW lý do gõ tự do | Sàn thêm lý do neo vào ba lý do chuẩn, cùng cơ chế nhãn trạng thái | 46 |
   | X7 | Năm mục lead; tập nhu cầu, thời gian ra hàng | Hàng 24 (gộp); luật 19; sổ K12 | Follow Up Boss, KW, Lofty: trường riêng trên liên hệ | Giữ năm mục làm tối thiểu (luật 19); sàn thêm mục qua trường riêng của liên hệ | 47 (mục chờ của ADR-0021) |
   | X8 | Năm vai cố định | Hàng 7 (gộp); `ROLES` | Follow Up Boss vai cố định; KW quyền theo ứng dụng; Lofty 3 vai cố định + 10 vai gán tự đặt | **Giữ** (lý do: quyền và an toàn); ghi điều khoá | 81 (sổ ở mã) |
   | X9 | Bốn nhãn số Home · Mobile · Work · Other | Hàng 85 (gộp) | KW cố định; Follow Up Boss cho gõ nhãn | **Giữ** theo KW và RESO; mức thấp | — |

   Đã khớp ngành, không cần xem lại: chia lead (hàng 25), góc nhìn lưu được (hàng 14), ảnh ba ngăn (hàng 18, cùng hình
   RESO `Permission`), nhãn trạng thái neo vào chuẩn (hàng 46). Các hàng chưa mở mà câu giao có danh sách (23, 26, 29,
   37, 42, 43, 50) nhận luật D1–D4 khi mở, không cần mục riêng.

## Hệ quả

- Bản thiết kế dài thêm một bảng, Cổng Phạm vi thêm Hỏi. Giữ tần suất gọi người: Hỏi gom vào thẻ Cổng Phạm vi sẵn có,
  không thêm cổng; mỗi Hỏi kèm khuyến nghị của máy để người trả lời một chạm.
- Sổ điểm biến thiên sẽ thêm điều khoá có lý do (X3, X8, X9), và có thể bớt K8, đổi K6, K12 tuỳ câu trả lời ở X1, X4–X7.
  Sổ đổi ở hàng chạm tới, không đổi trong PR này.
- D1–D4 là luật chữ, chưa có máy kiểm. Nếu lần thứ ba dựng cứng lọt qua S1 thì thêm một bài kiểm: bản thiết kế chạm đối
  tượng nghiệp vụ mà thiếu bảng đối chiếu thì đỏ.
- Trang Đối chiếu ngành sẽ cũ dần. Mục «chưa kiểm» là việc tra tiếp của chính hàng cần nó, không phải một đợt nghiên cứu
  riêng.
- Định vị ở mục 1 là căn cứ để từ chối việc ngoài phạm vi: CRM người mua đầy đủ, tự gửi theo lịch, quản lý giao dịch.

## Hỏi chủ kho

Một quyết định: **duyệt hướng của ADR này để mở PR.** Máy đã tự chốt bốn điểm dưới đây; chủ kho phủ quyết điểm nào thì
ghi số điểm.

1. **Định vị** ở mục 1: phần mềm phía cung, ba khối, sáu điều «không phải».
2. **D2 có mặc định nghiêng về dữ liệu của sàn.** Luật của đợt ghi «mỗi chỗ một Hỏi, giữ cứng hay làm dữ liệu». ADR này
   nghiêng thêm một bước: khuyến nghị mặc định là dữ liệu của sàn, giữ cứng phải nêu một trong bốn lý do. Người vẫn chọn ở
   từng Hỏi.
3. **Danh sách xem lại không mở hàng mới.** Mỗi mục X1–X9 thành Hỏi ở hàng sắp chạm; riêng X2 (hàng 27 đã gộp) đi qua nút
   «Trả lại» của hàng 22.
4. **Chỗ để:** chi tiết đối chiếu ở trang sống `docs/product/doi-chieu-nganh.md`; ADR giữ quyết định và nhóm tương đồng;
   luật cho bản thiết kế ở `.claude/rules/thiet-ke-doi-chieu.md`.

## Nguồn đã kiểm (01/11/2026)

Đường dẫn của từng khẳng định về sản phẩm khác nằm ở [Đối chiếu ngành](../product/doi-chieu-nganh.md). Nguồn trong kho:
ghi chép «thiết kế dựng cứng lặp lại» của dãy G (hàng 22, 01/11); luật thường trực 01/11 của đợt `dau-chu-dong-vao`; mã
`packages/core/src` trên `main` 594b3f3 (`dedupe/lead-stage.ts`, `dedupe/index.ts`, `listing/completeness.ts`,
`listing/status.ts`, `navigation.ts`); [Sổ điểm biến thiên](../architecture/so-diem-bien-thien.md) điều khoá K6, K8, K12.
