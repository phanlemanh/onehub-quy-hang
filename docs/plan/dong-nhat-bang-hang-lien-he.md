# Đồng nhất Bảng hàng và Liên hệ — kiểm 09/11/2026

Bản này chỉ đọc, đo và chụp, không sửa mã, chưa ghi lộ trình. Mã đọc ở `main` @ `09724fe6`. Đo trên bản tại máy với sàn «[Mẫu] Sàn thử»,
nền sáng, khổ 1440×900 và 375×812; phần tốc độ đo trên bản build.

**Chưa đo được:** bản thật `quyhang.onehub.center` (số tốc độ dưới đây là so tương đối, máy chủ và cơ sở dữ liệu cùng ở máy nên không có
trễ mạng thật) · Bảng hàng 5.000 căn (sàn mẫu có 29 căn đang hiện) · điện thoại thật. Trạng thái «sàn chưa có hàng», vai Telesales và
Quản trị sàn, mở hồ sơ bằng bàn phím là đọc mã, chưa bấm. Vòng tròn chữ N ở góc ảnh là dấu của máy dev, không thuộc sản phẩm.

Đường dẫn rút gọn: `inventory/`, `contacts/`, `units/ho-so/` nằm dưới `apps/web/src/app/(app)/`; `bo-cuc/`, `shell/` nằm dưới
`apps/web/src/components/`.

## Trả lời ngắn

**Phần khung lớn đã là một; phần còn lệch nằm ở lớp ngay dưới.** Hai màn cùng bố cục Danh sách – chi tiết, cùng bề rộng, cùng cột hồ sơ kéo chia
38 % trong cùng một khung, cùng cỡ chữ và đầu cột. Hàng `khung-ho-so-lien-he` (08/11) đã gỡ 6 trong 9 lỗi của bản kiểm 06/11 và cả hai vá tốc độ.

Kiểm 43 chỗ khác nhau: **18 có lý do nghiệp vụ** đã chốt, nên giữ. **25 không có căn cứ**, trong đó 1 ảnh hưởng cao, 8 trung bình, 16 thấp.
Những chỗ người dùng thấy rõ nhất: Bảng hàng thiếu đường dẫn mà Tham chiếu §9 đòi; hồ sơ liên hệ không có địa chỉ riêng nên tải lại là mất và không gửi được link;
Esc đóng hồ sơ liên hệ nhưng không đóng hồ sơ căn; lọc không ra ai thì Liên hệ không có lối thoát.

**Điều cần biết nhất: tầng Mẫu hành vi sẽ không tự chạm tới hai màn này.** Sửa đổi 09/11 của ADR-0024 để các nhà khác «áp mẫu khi có hàng chạm tới». Nhưng trong các hàng
đang xếp không hàng nào áp mẫu cho hai màn này: PR [#224](https://github.com/phanlemanh/onehub-quy-hang/pull/224) đang mở chỉ giữ cột khi lọc rỗng. Hai hàng có giúp một phần (L28, L36), còn lại 23 chỗ chưa ai giữ.

**Khuyến nghị:** mở trước hàng `hai-bang-mot-nep` (mục «Đề xuất»): gỡ 10 chỗ trong một lượt, khoảng một ngày máy, không phải chờ thành phần Mẫu hành vi nào.

## Ảnh

| Ảnh | Nói gì |
| --- | --- |
| [Bảng hàng 1440](dong-nhat-bang-hang-lien-he/1-bang-hang-1440.png) · [Liên hệ 1440](dong-nhat-bang-hang-lien-he/2-lien-he-1440.png) | Đặt cạnh nhau: khung Bảng hàng bắt đầu cao hơn 60 px, dòng dày hơn, số canh phải |
| [Hồ sơ căn cạnh bảng](dong-nhat-bang-hang-lien-he/3-ho-so-can-canh-bang-1440.png) · [Hồ sơ liên hệ cạnh bảng](dong-nhat-bang-hang-lien-he/4-ho-so-lien-he-canh-bang-1440.png) | Cùng khung và bề rộng; hồ sơ căn có thêm nút mở toàn màn |
| [Liên hệ cuộn, Xem thêm](dong-nhat-bang-hang-lien-he/5-lien-he-cuon-xem-them-1440.png) | Tên cột dính đầu; đếm «100+ liên hệ» |
| [Liên hệ lọc rỗng](dong-nhat-bang-hang-lien-he/6-lien-he-loc-rong-1440.png) · [Bảng hàng lọc rỗng](dong-nhat-bang-hang-lien-he/7-bang-hang-loc-rong-1440.png) | Bảng hàng có «Xoá lọc», Liên hệ không có lối thoát |
| [Liên hệ lỗi](dong-nhat-bang-hang-lien-he/8-lien-he-loi-1440.png) · [Bảng hàng lỗi](dong-nhat-bang-hang-lien-he/9-bang-hang-loi-1440.png) | Hai hình khác nhau cho cùng một việc |
| [Bảng hàng chờ tải](dong-nhat-bang-hang-lien-he/10-bang-hang-cho-tai-1440.png) · [Liên hệ chờ tải](dong-nhat-bang-hang-lien-he/11-lien-he-cho-tai-1440.png) | Liên hệ vẽ thêm cột hồ sơ dù chưa mở, sát viền |
| [Bảng hàng 375](dong-nhat-bang-hang-lien-he/12-bang-hang-375.png) · [Liên hệ 375](dong-nhat-bang-hang-lien-he/13-lien-he-375.png) | Thẻ đầu của Liên hệ thấp hơn 99 px vì đường dẫn, mô tả, khung lồng |
| [Hồ sơ liên hệ 375](dong-nhat-bang-hang-lien-he/14-ho-so-lien-he-375.png) | Tên người hiện hai lần liền nhau |
| [Đầu khách mở Liên hệ](dong-nhat-bang-hang-lien-he/15-lien-he-dau-khach-1440.png) | Giữ địa chỉ và báo; Bảng hàng thì đưa về Hôm nay |

## Bảng so từng mặt

Loại lệch: **LD** có lý do nghiệp vụ, **VC** vô cớ. Tác động: cao = không làm được việc hoặc làm sai; trung bình = thấy rõ, có đường vòng; thấp = chỉ là nếp.
Chỉ dòng VC mới có tình trạng hàng giữ.

### 1. Khung và bố cục

Giống: cùng `danh-sach-chi-tiet`, cùng gốc 1167 px, khung thân 1135 px, trang không cuộn, bảng cuộn trong khung.

| # | Bảng hàng | Liên hệ | Loại | Căn cứ | Tác động | Tình trạng |
| --- | --- | --- | --- | --- | --- | --- |
| L1 | Không có đầu màn, không đường dẫn; khung bắt đầu ở y = 75 | Có đường dẫn và một dòng mô tả; khung ở y = 135 | VC. §9 chốt «mọi màn có đường dẫn»; không hồ sơ nào miễn cho Bảng hàng | `inventory/khung.tsx:39` · `contacts/khung.tsx:24` · kế hoạch thống nhất §1 đã ghi | Trung bình | Chưa có hàng |
| L2 | Tên màn nói một lần, ở đầu khung | Tên nói hai lần: đường dẫn và đầu khung | VC. ADR-0024 quyết định 3: tiêu đề trùng mục cuối đường dẫn, không thêm một lớp | `contacts/danh-sach.tsx:232` | Thấp | Chưa có hàng |
| L3 | Khung sát viền, đầu khung 57 px, dưới tên là câu «Có hàng gì, ở đâu?» | Khung có đệm nên thành khung lồng khung, đầu khung 50 px, dưới tên là số đếm | VC. Cùng bố cục, cùng họ khung | `inventory/khung.tsx:40,43` · `contacts/danh-sach.tsx:229,233` | Thấp | Chưa có hàng |

### 2. Cột thứ hai và góc nhìn

| # | Bảng hàng | Liên hệ | Loại | Căn cứ | Tác động | Tình trạng |
| --- | --- | --- | --- | --- | --- | --- |
| L4 | Góc nhìn đã lưu, thẻ độ tươi ở chân | Sáu bộ lọc cố định | LD. §9; §12 05/11, hàng 103 Hỏi-3 «bộ lọc cố định, danh sách lưu để hàng sau» | `shell/second-column.tsx:49,153` | — | Giữ |
| L5 | Mục chưa có số | Mục chưa có số | VC, cả hai. ADR-0024 quyết định 13 chọn «cột thứ hai có số» và hẹn «cùng hàng 52»; câu giao của hàng 52 là số đo hai tuần thử, không chở việc này | `shell/second-column.tsx:51` · `docs/adr/0024-he-bo-cuc.md:131` | Trung bình | Chưa có hàng, lời hẹn trỏ sai chỗ |
| L6 | Lọc theo cột giữ trong màn, lưu bằng Góc nhìn | Loại và Lead nằm trên địa chỉ | LD. Bộ lọc nhiều cột có Góc nhìn giữ; cột thứ hai của Liên hệ là đường dẫn | `inventory/bang-hang.tsx:277` · `contacts/vung.tsx:21` | — | Giữ |

### 3. Thanh công cụ, lọc, tìm, sắp xếp

| # | Bảng hàng | Liên hệ | Loại | Căn cứ | Tác động | Tình trạng |
| --- | --- | --- | --- | --- | --- | --- |
| L7 | Lọc từng cột, tìm căn qua ô «Gõ mã căn» | Một ô tìm tên hay số | LD. §11 «lọc mọi cột»; lối Lai bỏ Filters, tìm theo số đi lối riêng (KH-lh-mo-so) | `inventory/thanh-cong-cu.tsx` · `contacts/danh-sach.tsx:240` | — | Giữ |
| L8 | Đếm «29 / 29 căn» ở thanh và lặp ở chân bảng | «50+ liên hệ» ở đầu khung, không có chân | VC. ADR-0024 quyết định 3 ma trận vùng: chân đếm n/N. Liên hệ chưa biết tổng khi còn trang thì vẫn đếm được ở chân | `inventory/bang-hang.tsx:425,445` · `contacts/danh-sach.tsx:227` | Thấp | Chưa có hàng |
| L9 | Sắp mọi lúc | Tắt sắp tới khi tải hết trang | LD. KH-lh-danh-sach-chi-tiet: thứ tự không được lừa người xem khi còn trang chưa tải | `contacts/danh-sach.tsx:126-127` | — | Giữ |
| L10 | Nhóm, Cột, Xuất bảng hàng | Không có | LD. Bốn cột, không có xuất; §9 | `inventory/bang-hang.tsx:448-470` | — | Giữ |

### 4. Bảng

Giống: đầu cột 32 px, chữ ô 14 px, đệm ô 8/6 px, tên cột dính đầu khi cuộn, dòng đang mở được tô.

| # | Bảng hàng | Liên hệ | Loại | Căn cứ | Tác động | Tình trạng |
| --- | --- | --- | --- | --- | --- | --- |
| L11 | Dòng 37 px, có kẻ dọc, thấy khoảng 19 dòng | Dòng 49 px, có ảnh tròn và hai dòng chữ, không kẻ dọc, thấy khoảng 12 dòng | LD. Chủ kho chọn lối Lai 05/11 (`solution-crm-3`); ADR-0004 lưới kiểu Sheet | `inventory/bang-hang.tsx:67-76` · `contacts/danh-sach.tsx:37,52` | — | Giữ |
| L12 | Cột số canh phải | «Cơ hội mở», «Căn» canh trái | VC. Không chỗ nào chốt | `inventory/bang-hang.tsx:129` · `contacts/danh-sach.tsx:103,110` | Thấp | Chưa có hàng |
| L13 | Ô tích, chọn ô và chép | Không | LD. Lối Lai bỏ chọn hàng loạt, chưa có thao tác loạt trên liên hệ | `contacts/danh-sach.tsx:24-26` | — | Giữ |
| L14 | Cuộn ảo trên toàn bộ dữ liệu ở máy | Trang 50 dòng, nút «Xem thêm» dưới lưới | LD. Hàng ở kho trên máy; số chủ không được lưu trên máy (KH-bh-tren-may, KH-lh-mo-so) | `inventory/bang-hang.tsx:540` · `packages/api/src/contacts/read/store.ts:10` | — | Giữ |
| L15 | Mở hồ sơ thì còn thấy 5 trong 15 cột, Giá và Trạng thái phải cuộn ngang, thanh công cụ xuống hai dòng | Đủ 4 cột | LD. Bảng kiểu Sheet nhiều cột, §9 chốt cột 38 %. Đáng xét riêng vì Giá khuất, nhưng không phải lệch cần san | ảnh 3; lưới rộng 2292 px trong khung 691 px | — | Giữ |

### 5. Mở hồ sơ cạnh bảng

Giống: cột 38 % (425 px), khung cột phụ chung, nút Đóng, kéo chia, bảng vẫn bấm được.

| # | Bảng hàng | Liên hệ | Loại | Căn cứ | Tác động | Tình trạng |
| --- | --- | --- | --- | --- | --- | --- |
| L16 | Hồ sơ theo địa chỉ `?unit=`: chép link, tải lại, Lùi đều đúng | Địa chỉ không đổi: tải lại là mất, không gửi được link, Lùi rời màn | VC. §9 «một địa chỉ cho một thứ». Luật chỉ cấm số rõ trên địa chỉ, không cấm mã liên hệ. Là điều kiện của «đường vào từ hồ sơ căn, Lead đã nhập, Đã gửi» (Hỏi-4 hàng 103) | `units/ho-so/bang-co-ho-so.tsx:101` · `contacts/vung.tsx:37` | **Cao** | Chưa có hàng |
| L17 | Esc không đóng (đã thử) | Esc đóng | VC. Hàng `khung-ho-so-lien-he` Hỏi-2 chốt cho liên hệ, chưa mang sang hồ sơ căn | `contacts/vung.tsx:111` | Thấp | Chưa có hàng |
| L18 | Có nút mở toàn màn | Không; không có trang riêng | VC. ADR-0024 quyết định 2 xếp hồ sơ liên hệ vào bố cục Hồ sơ | `units/ho-so/than-cot.tsx:46` | Thấp | Chưa có hàng |
| L19 | Hồ sơ hỏng khi dựng thì chỉ cột báo lỗi, bảng vẫn dùng được | Không chặn: hỏng là cả màn về trang lỗi chung | VC. Nguyên tắc đã dựng ở hàng 105 AC-10 | `units/ho-so/bang-co-ho-so.tsx:63` · `contacts/vung.tsx:161` | Trung bình | Chưa có hàng |
| L20 | Lịch sử dùng khối dòng thời gian, căn trong hồ sơ dẫn đi được | Dòng thời gian chữ trơn; dòng «Căn» không bấm được | VC. Lỗi 8, 9 của bản kiểm 06/11 còn nguyên | `contacts/ho-so.tsx:177-193` | Thấp | Chưa có hàng |

### 6. Trạng thái tải, trống, lỗi

| # | Bảng hàng | Liên hệ | Loại | Căn cứ | Tác động | Tình trạng |
| --- | --- | --- | --- | --- | --- | --- |
| L21 | Khung chờ hình lưới, có đệm | Khung chờ vẽ thêm cột hồ sơ dù chưa mở, sát viền | VC. Mẫu Chờ: khung theo hình đang có | `inventory/bang-hang.tsx:235-241` · `contacts/danh-sach.tsx:193` · `bo-cuc/cho-tai.tsx:89` | Trung bình | Chưa có hàng |
| L22 | Khối đỏ có đệm, nút dưới câu, nút đặt trong phần mô tả | Dải sát viền, nút bên phải; câu «Chưa tải được — thử lại» lặp nút «Thử lại» | VC. Mẫu Lỗi: một khối cho mọi vùng | `inventory/bang-hang.tsx:489-502` · `contacts/danh-sach.tsx:194-205` | Thấp | Chưa có hàng; thành phần có thể đến từ hàng khác, không ai áp |
| L23 | Sàn trống: nút Nhập Excel | Sàn trống: câu nói liên hệ sinh ra từ đâu | LD. Mẫu Trống chấp nhận cả hai; liên hệ không có việc tạo tay | `inventory/bang-hang.tsx:505-518` · `contacts/lien-he.ts:33` | — | Giữ |
| L24 | «Không căn nào khớp bộ lọc» kèm «Xoá lọc» | «Không tìm thấy «Người thuê»», không có lối thoát, vẫn hiện «0 liên hệ». Lọc Lead mà rỗng thì báo sai «Chưa có liên hệ nào», vì bảng không biết bộ lọc Lead | VC. Mẫu Trống: luôn có một hành động. Phần Lead là lỗi | `inventory/bang-hang.tsx:557-568` · `contacts/danh-sach.tsx:208` · `contacts/vung.tsx:181` | Trung bình | Chưa có hàng |
| L25 | Mất mạng vẫn xem bản trên máy | Mất mạng thì báo lỗi | LD. §2 ngoại tuyến; số chủ không lưu trên máy | `contacts/lien-he.ts:2` | — | Giữ |

### 7. Ghi và báo đã lưu

| # | Bảng hàng | Liên hệ | Loại | Căn cứ | Tác động | Tình trạng |
| --- | --- | --- | --- | --- | --- | --- |
| L26 | Sửa trên ô, sửa hàng loạt | Chỉ ghi trường riêng | LD. Hàng 103 chỉ đọc và mở số; §12 | `contacts/ho-so.tsx:165` | — | Giữ |
| L27 | Lưu ngay, báo và có Hoàn tác | Chọn là lưu, không báo đã lưu, không hoàn tác; lỗi thì báo tại chỗ | VC. Mẫu Ghi: lưu ngay phải kèm hoàn tác. §3.3 kế hoạch không xếp Ghi cho Liên hệ | `contacts/muc-truong-rieng.tsx:28-45,75` | Trung bình | Chưa có hàng |
| L28 | Toast báo thành công không có Hoàn tác; màn tự đặt một chỗ hiện toast | — | VC. Mẫu Báo: toast chỉ khi có Hoàn tác, từ một chỗ trong vỏ | `inventory/cell-edit/tren-o.tsx:68,119` · `inventory/bulk/thanh.tsx:93` | Thấp | `luoi-mau-hanh-vi` chặn chỗ mới và ghi ngoại lệ có hạn; chưa có hàng gỡ chỗ cũ |

### 8. Phím tắt

Giống: ⌘K và «/» mở Gõ mã căn.

| # | Bảng hàng | Liên hệ | Loại | Căn cứ | Tác động | Tình trạng |
| --- | --- | --- | --- | --- | --- | --- |
| L29 | Di ô bằng mũi tên, Enter sửa, ⌘C, ⌘Z | Không | LD. Bảng kiểu Sheet | `inventory/cell-edit/tren-o.tsx:105` | — | Giữ |
| L30 | Không mở được hồ sơ bằng bàn phím: mở chỉ qua bấm chuột vào dòng, Enter dành cho sửa ô | Tab tới tên rồi Enter | VC. Bàn làm việc máy tính; có đường vòng là Gõ mã căn | `inventory/bang-hang.tsx:555` · `contacts/danh-sach.tsx:60` | Trung bình | Chưa có hàng |

### 9. Điện thoại 375

Giống: không tràn ngang (0 px), bốn tab dưới.

| # | Bảng hàng | Liên hệ | Loại | Căn cứ | Tác động | Tình trạng |
| --- | --- | --- | --- | --- | --- | --- |
| L31 | Có tab | Mục trong Tôi | LD. §12 05/11, hàng 103 Hỏi-1 | `contacts/tren-toi.tsx:19` | — | Giữ |
| L32 | Hồ sơ toàn màn | Hồ sơ ở ngăn từ đáy | LD. ADR-0024 sửa đổi 05/11 | `bo-cuc/cot-keo-chia.tsx:62` | — | Giữ |
| L33 | Vào thẳng danh sách, thẻ đầu ở y ≈ 160 | Lối về, đoạn mô tả hai dòng, khung lồng; thẻ đầu ở y = 259 | VC. Đầu máy tính đem nguyên xuống điện thoại | ảnh 12, 13 | Trung bình | Chưa có hàng |
| L34 | Không lặp | Tên người hiện hai lần trong ngăn | VC. Lỗi 7 của bản kiểm 06/11 còn nguyên | `contacts/vung.tsx:177` · `contacts/ho-so.tsx:120` | Thấp | Chưa có hàng |

### 10. Tốc độ mở màn

Bản build, máy tại chỗ, trung vị. Con số là so tương đối giữa hai màn.

| Việc | Bảng hàng | Liên hệ |
| --- | --- | --- |
| Máy mới, tới lúc dòng đầu hiện | 267 ms | 99 ms |
| Mở lại | 125 ms | 57 ms |
| Máy mới, 4G chậm và máy chậm 4 lần | **4.247 ms** | 1.235 ms |
| Mở lại, cùng điều kiện | 734 ms | 283 ms |
| Từ nhà kia bấm sang | 352 ms | 321 ms |
| Bấm dòng tới lúc hồ sơ hiện | 27–74 ms | 34–53 ms (bản thật 06/11: 220–340 ms) |
| Mã tải về | 538 KB | 422 KB |

| # | Bảng hàng | Liên hệ | Loại | Căn cứ | Tác động | Tình trạng |
| --- | --- | --- | --- | --- | --- | --- |
| L35 | Lần đầu chậm hơn vì kéo cả bảng và ba nguồn kèm về máy, sau đó lọc và mở hồ sơ tức thì | Trang đầu đọc sẵn ở máy chủ | LD. §12 31/10 bộ đồng bộ «nhanh tức thì». Lần đầu chỉ xảy ra một lần trên mỗi máy | `inventory/bang-hang.tsx:209` · `contacts/page.tsx:28` | — | Giữ |
| L36 | Vỏ và trang mỗi nơi đọc phiên riêng trong một lượt mở | Như vậy | VC. Mẫu Canh cửa: kiểm một lần ở cấp nhà | `shell/shell-layout.tsx:30` · `inventory/page.tsx:14` · `contacts/page.tsx:17` | Thấp | `cai-dat-tai-nhanh` có thể gỡ một phần (vùng có `lib/api.ts`); chưa có hàng cho cấp nhà |

### 11. Chữ và nhãn

| # | Bảng hàng | Liên hệ | Loại | Căn cứ | Tác động | Tình trạng |
| --- | --- | --- | --- | --- | --- | --- |
| L37 | Cột «Đầu chủ» | Cột «Người giữ» | LD. `CONTEXT.md` phân biệt: người giữ một liên hệ khác vai Đầu chủ | `CONTEXT.md:19-20,108` | — | Giữ |
| L38 | Ô trống hiện «—» | Người chưa tên hiện «[Chưa có tên]», trông như dữ liệu mẫu chưa điền | VC | `contacts/danh-sach.tsx:49` | Thấp | Chưa có hàng |
| L39 | §9 có đủ | §9 phần cột nhà và bảng «Nhà và nút» thiếu Liên hệ, dù §10, §12 có | VC. Tài liệu lệch sản phẩm | `docs/product/tham-chieu.md` §9 | Thấp | Chưa có hàng |

### 12. Quyền theo vai

| # | Bảng hàng | Liên hệ | Loại | Căn cứ | Tác động | Tình trạng |
| --- | --- | --- | --- | --- | --- | --- |
| L40 | Thấy hàng cả sàn | Đầu chủ thấy người mình giữ (đo: 18 người), trưởng nhóm cả sàn (111) | LD. ADR-0021 quyết định 3 | `contacts/page.tsx:13` | — | Giữ |
| L41 | Không có vai thì đưa về Hôm nay | Không có vai thì giữ địa chỉ và báo một câu | VC. Chỉ gặp khi gõ thẳng địa chỉ | `inventory/page.tsx:17` · `contacts/page.tsx:34-37` | Thấp | Chưa có hàng |
| L42 | Hỏi quyền ở lõi | So tên vai ngay trong trang | VC. §6 quyền một bảng ở lõi. API vẫn chặn nên không hở dữ liệu | `inventory/page.tsx:17` · `contacts/page.tsx:21` | Thấp | Chưa có hàng |
| L43 | Chưa chọn sàn thì về đăng nhập | Chưa chọn sàn thì về chọn sàn | VC. Mẫu Canh cửa | `inventory/page.tsx:15` · `contacts/page.tsx:19` | Thấp | Chưa có hàng |

## Đối chiếu tầng Mẫu hành vi

| Mẫu | Bảng hàng | Liên hệ | Hàng đã xếp có làm hộ không |
| --- | --- | --- | --- |
| Ghi | Đạt | Thiếu hoàn tác (L27) | Không. `cai-dat-mot-cach-luu` làm thanh lưu, hai màn này không dùng |
| Báo | Lệch (L28) | Thiếu báo (L27) | `luoi-mau-hanh-vi` chặn chỗ mới, không gỡ chỗ cũ |
| Chờ | Đạt trong màn; chờ cấp tuyến dùng chung một hình | Sai hình (L21) | Không. «Mỗi nhà một khung chờ» chưa hàng nào giữ ở hai nhà này |
| Lỗi | Thiếu chuẩn (L22) | Thiếu chuẩn (L22) | Khối lỗi vùng chưa có; `hom-nay-chiu-loi-tung-phan` chạm thành phần báo lỗi nhưng chỉ cho Hôm nay |
| Trống | Đạt | Thiếu lối thoát (L24) | Không |
| Bảng | Lưới dày đúng cỡ | Lưới dày đúng cỡ (hơn 50 dòng, có lọc) | Không cần ở lưới chính. Bảng phụ trong hộp Xuất còn dùng bảng trần, là ngoại lệ có hạn của `luoi-mau-hanh-vi` |
| Canh cửa | Lệch (L36, L43) | Lệch (L36, L41–43) | `cai-dat-mot-cach-luu` chỉ cho khu Cài đặt; `cai-dat-tai-nhanh` giúp phần đọc phiên |

**Các hàng đã gộp đã gỡ:** lỗi 1–6 của bản kiểm 06/11, bỏ chờ 0,25 giây khi mở màn, trang đầu đọc sẵn (`khung-ho-so-lien-he`), Xem thêm nối lặp (`va-xem-them-noi-lap-dong`). **Chưa gỡ:** lỗi 7 (L34), 8 và 9 (L20).

**Vì sao «lan theo hàng» không tới đây.** Kế hoạch §3.3 ghi Liên hệ «đợt dau-khach-nhap chạm tới thì làm luôn», Bảng hàng «khi hàng kế chạm vùng này». Trong số hàng còn mở lúc kiểm, `va-loi-doc-can-ngoai-khu`
(dãy X) chỉ chạm tệp danh mục, `tao-can-tay` chạm hồ sơ căn và vỏ, `va-bang-hang-cot-thap-tang-khi-loc-rong` (PR #224) sửa 14 dòng của Bảng hàng để giữ cột và ô lọc. Không hàng nào áp mẫu cho thân hai màn, nên chờ thì 23 chỗ sẽ nằm yên.

## Đề xuất hàng việc

Năm hàng phủ 22 trong 23 chỗ chưa có người giữ, L18 để lại như ghi ở hàng 2; L28, L36 được nhận thêm phần còn thiếu. Chưa ghi vào lộ trình. Hạng theo `_acceptance/config.yaml`: cả năm chỉ chạm giao diện và mức đọc, không chạm đường T3.

### 1. `hai-bang-mot-nep` — T2 · gỡ L1, L2, L3, L8, L12, L21, L24, L33, L38, L39

- **Câu giao:** Người dùng đi giữa Bảng hàng và Liên hệ thấy cùng một nếp màn: cùng đường dẫn ở đầu màn, tên màn nói một lần, cùng khung sát viền, số canh phải, đếm ở chân bảng; đang tải hiện đúng hình bảng; lọc không ra ai thì nói đúng bộ lọc và có «Xoá lọc».
- **`bat_khi`:** Ở 1440, mép trên khung của hai màn trùng nhau; cả hai có đường dẫn nhà › màn và tên màn chỉ một lần trong vùng làm việc; cột số của Liên hệ canh phải; hai màn đếm ở chân bảng; chờ tải của Liên hệ không vẽ cột hồ sơ khi cột chưa mở; lọc Lead rỗng không báo «Chưa có liên hệ nào» và có «Xoá lọc»; ở 375 thẻ đầu của Liên hệ cao không quá 40 px so với Bảng hàng; bài quét khuôn đỏ khi một trong hai màn bỏ đầu màn.
- **Vùng:** `apps/web/src/app/(app)/contacts/{khung,danh-sach,vung}.tsx`, `apps/web/src/app/(app)/inventory/{khung,bang-hang}.tsx`, `apps/web/src/components/bo-cuc/cho-tai.tsx`, `design/patterns/{bang-hang,lien-he}.md`, `docs/product/tham-chieu.md`, `_acceptance/hai-bang-mot-nep/**`.
- **Để ý:** đem đường dẫn vào Bảng hàng tốn khoảng 60 px; bỏ đầu khung lặp tên thì lấy lại gần đủ, nên không mất dòng nào đáng kể.

### 2. `ho-so-canh-bang-mot-cach-mo` — T2 · gỡ L16, L17, L19, L20, L30, L34

- **Câu giao:** Hồ sơ cạnh bảng mở và đóng theo một cách ở cả hai màn: có địa chỉ riêng để chép link, tải lại và Lùi đều đúng; Esc đóng; mở được bằng bàn phím; hồ sơ hỏng thì bảng vẫn dùng được; căn trong hồ sơ liên hệ bấm được, tên người không lặp trên điện thoại.
- **`bat_khi`:** Mở một liên hệ, chép địa chỉ sang tab khác thì đúng người ấy, số vẫn che; Lùi đóng hồ sơ, không rời màn; Esc đóng cả hai hồ sơ, trừ khi đang gõ hay hộp đang mở; chọn dòng bằng phím rồi mở được hồ sơ căn; giả hồ sơ liên hệ lỗi khi dựng thì bảng còn dùng được kèm «Thử lại»; địa chỉ không bao giờ mang số điện thoại.
- **Vùng:** `apps/web/src/app/(app)/contacts/**`, `apps/web/src/app/(app)/units/ho-so/bang-co-ho-so.tsx`, `apps/web/src/app/(app)/inventory/bang-hang.tsx`, `apps/web/src/components/khoi/solution-crm-4/**`, `design/patterns/{lien-he,ho-so-can}.md`, `docs/product/tham-chieu.md`, `_acceptance/ho-so-canh-bang-mot-cach-mo/**`.
- **Để ngoài:** trang toàn màn của hồ sơ liên hệ (L18). Nên làm cùng «đường vào Liên hệ từ hồ sơ căn», để Hỏi-4 của hàng 103 quyết.

### 3. `ghi-bao-loi-hai-bang` — T2 · gỡ L22, L27; gỡ chỗ cũ của L28 · **sau** `luoi-mau-hanh-vi`

- **Câu giao:** Liên hệ và Bảng hàng báo theo một mẫu: chọn trường riêng thì biết đã lưu và hoàn tác được; toast chỉ khi có Hoàn tác, từ một chỗ trong vỏ; lỗi vùng cùng một khối, câu không lặp nút.
- **`bat_khi`:** Đổi trường riêng hiện báo có «Hoàn tác», bấm là về giá trị cũ; không còn đặt chỗ hiện toast trong màn Bảng hàng và ngoại lệ có hạn của màn này được xoá; lỗi đọc của hai màn cùng khối, có «Thử lại», không lộ mã.
- **Vùng:** `apps/web/src/app/(app)/contacts/{muc-truong-rieng,danh-sach}.tsx`, `apps/web/src/app/(app)/inventory/{bang-hang.tsx,cell-edit/**,bulk/**}`, `apps/web/src/components/shell/**`, `design/patterns/**`, `_acceptance/ghi-bao-loi-hai-bang/**`.
- **Để ý:** chỉ hàng này là áp mẫu thuần, nên đụng luật 09/11 «không mở hàng dọn riêng». Mặc định: không mở riêng, gộp vào hàng kế chạm hai màn này.

### 4. `canh-cua-bang-hang-lien-he` — T2 · gỡ L41, L42, L43; phần cấp nhà của L36 · **sau** `cai-dat-mot-cach-luu`

- **Câu giao:** Bảng hàng và Liên hệ kiểm đăng nhập, sàn, vai một lần ở cấp nhà theo mẫu Canh cửa; người không đủ vai đi cùng một đường ở cả hai; quyền của Liên hệ đọc từ lõi.
- **`bat_khi`:** Chưa đăng nhập, chưa chọn sàn, không đủ vai cho ra đúng một kết quả như nhau ở hai nhà; mỗi lượt mở đọc phiên một lần; bài kiểm vai phủ cả hai nhà; Liên hệ không còn so tên vai trong trang.
- **Vùng:** `apps/web/src/app/(app)/inventory/{page,layout}.tsx`, `apps/web/src/app/(app)/contacts/{page,layout}.tsx`, `packages/core/src/access/**`, `design/patterns/**`, `_acceptance/canh-cua-bang-hang-lien-he/**`.

### 5. `cot-thu-hai-co-so` — T2 · gỡ L5 · **xếp sau**

- **Câu giao:** Mỗi mục ở cột thứ hai của Liên hệ có số đếm, như ADR-0024 quyết định 13 đã chọn; sửa lời hẹn «cùng hàng 52».
- **`bat_khi`:** Số trên mục bằng số dòng khi mở mục ấy, đúng theo phạm vi của vai; đọc số không làm màn chậm thêm quá 100 ms ở bản thật; ADR-0024 không còn trỏ hàng 52.
- **Vùng:** `apps/web/src/components/shell/second-column.tsx`, `packages/api/src/contacts/read/**`, `docs/adr/0024-he-bo-cuc.md`, `_acceptance/cot-thu-hai-co-so/**`.

L18 (toàn màn) để Hỏi-4 của hàng 103 quyết như đã ghi ở hàng 2.

## Khuyến nghị làm gì trước

**Mở `hai-bang-mot-nep` trước.** Căn cứ:

- Đây là phần người dùng thấy mỗi lần mở màn, và gỡ 10 trong 25 chỗ vô cớ, gồm chỗ trái Tham chiếu §9 (L1) và lỗi báo sai khi lọc Lead (L24).
- Không phải chờ thành phần nào của tầng Mẫu hành vi. Hàng 3 và 4 phải chờ.
- Không đụng luật «không mở hàng dọn riêng»: đó là luật cho Mẫu hành vi, còn hàng này sửa bố cục và trả màn về điều Tham chiếu đã chốt.
- Chỉ có một chỗ chờ: PR #224 cũng sửa `inventory/bang-hang.tsx`, nên mở sau khi PR ấy gộp. `va-loi-doc-can-ngoai-khu` và `tao-can-tay` không vào tệp thân hai màn. Khoảng một ngày máy.

Hàng 2 đi ngay sau: nó mang chỗ ảnh hưởng cao duy nhất (L16) và mở đường cho các lối vào Liên hệ đang để sau.
