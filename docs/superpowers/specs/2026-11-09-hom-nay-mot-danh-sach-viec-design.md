# Hôm nay là một danh sách việc

Ngày 09/11/2026 · Hồ sơ `_acceptance/hom-nay-mot-danh-sach-viec` · Căn cứ: `docs/plan/audit-man-hom-nay.md` mục «IA và UX/UI».

## Vì sao làm

`/today` hiện là bốn màn của bốn vai xếp vào một cột: bốn bố cục, bốn khối, bốn kiểu dòng, ba phạm vi. Từ 08/11 chủ sàn mới
mang đủ năm vai nên bốn vùng ấy là màn đầu tiên họ thấy. Nhà Hôm nay được định nghĩa là «giờ làm gì?», nhưng chỉ vùng đầu
chủ và hàng đợi của trưởng nhóm là việc.

## Mục tiêu

Mỗi người mở Hôm nay thấy một danh sách việc của mình, cùng một kiểu dòng, đếm được. Phần theo dõi về đúng nhà.

## Không làm

Sàn ẩn hay đổi thứ tự nhóm của vai khác đầu chủ · nút «Xong» ghi máy chủ cho việc đầu khách · gộp lời gọi đọc (R5 của audit) · bấm cả
dòng mở chi tiết · đổi luật nhóm căn, luật chia lead.

## Điều không được xảy ra

Lớp `source` không vào dòng việc của vai không được xem (bất biến 2). Số việc không được sai khi một nguồn lỗi. Trưởng nhóm
không mất đường giao lại lead. Telesales không mất đường xem lead mình nhập.

## Mô hình

**Việc** là một dòng cần một người làm một hành động, tự rời danh sách khi xong hay hết hạn. Năm nguồn, không bảng mới:

| Vai | Nhóm | Nguồn đọc đang có | Nút chính | Rời danh sách khi |
| --- | --- | --- | --- | --- |
| Trưởng nhóm | Lead quá hạn · Chưa chia được | `GET /api/v1/team/lead-queue` | Giao lại | Giao xong |
| Đầu chủ | Bộ nhóm của sàn, giữ nguyên | kho trên máy + `leads/assigned` | Như hàng 92 | Như hàng 92 |
| Telesales | Lead bị trả lại | `GET /api/v1/leads`, nấc `returned` | Sửa số | Gửi lại |
| Đầu khách | Khách phản ứng · Vừa đổi · Căn mới khớp | `GET /api/v1/today/buyer` | Mở đúng đích hiện có | Quá 48 giờ (Hỏi-3) |

Thứ tự nhóm: có hạn đã quá trước, rồi có hạn, rồi không hạn; trong bộ nhóm của đầu chủ giữ thứ tự của sàn. Một hàm thuần
`gopViec` ở `today/` gộp năm nguồn, mỗi nguồn báo `ok` hay `loi`; nguồn lỗi không đẻ nhóm rỗng hay câu «không có việc».

**Phần theo dõi:** bảng theo đầu chủ và ba ô số về `/team` (đang là trang tạm) bằng nguyên khối `dashboard-6`, đúng bố cục
Bảng điều khiển. Lead đã nhập đã có `/leads/mine`. Tin 7 ngày về `/shares/tin`, bố cục Dòng tin 48rem. Hôm nay của người
chỉ giữ vai Quản trị dẫn về Cài đặt sàn thay trang tạm.

**Cột thứ hai** liệt đúng nhóm của các vai người xem, nhãn theo bộ của sàn, có số đếm, luôn có một mục sáng («Tất cả việc»
khi không có `?nhom=`). Cột và thân đọc chung một nguồn.

## Đối chiếu ngành (ADR-0022)

Nguồn đầy đủ ở `docs/product/doi-chieu-nganh.md` mục 13.

| Năng lực | RESO | Keller Williams Command | Follow Up Boss | HubSpot | Ta định làm | Ta cứng — họ cấu hình |
| --- | --- | --- | --- | --- | --- | --- |
| Màn việc | Không có tài nguyên cho việc; `Queue` là nhật ký sự kiện | Một trang Tasks, chia theo đối tượng | Một trang Tasks: hôm nay, quá hạn | Một chỗ CRM › Tasks | Một danh sách | — |
| Người quản lý | — | Chưa kiểm | Cùng giao diện, đổi phạm vi nhìn | Hàng đợi chia sẻ | Cùng danh sách, thêm nhóm của trưởng nhóm | — |
| Nhóm việc | — | Chưa kiểm | Smart List tự đặt | Tối đa 20 hàng đợi, người tự tạo | Đầu chủ theo bộ của sàn; nhóm vai khác cố định | **Có → Hỏi-5** |
| Tin phản ứng thành việc | `InternetTracking` chỉ là sự kiện | Chưa kiểm | Chưa kiểm | Chưa kiểm | Thành việc, tự hết 48 giờ | **Có → Hỏi-5** |
| Báo cáo đội | `Teams` lưu đội | Chưa kiểm | Mục Reporting riêng | Dashboard riêng | Nhà Đội | — |

Điểm khác ngành: việc của Quỹ hàng suy ra từ trạng thái, không do người tạo, nên không có màn «Thêm việc».

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: mở app → Hôm nay (đường dẫn, «N việc · M quá hạn») → bấm nút chính của dòng → dòng rời danh sách (điểm ra: hết việc, hay sang hồ sơ, Đã gửi, Gửi).
- Biên: người một vai chỉ thấy nhóm của mình · hết việc · một vai không có nguồn nào (Quản trị) · trưởng nhóm trên điện thoại giao lại ở ngăn đáy.
- Lỗi & quay lại: một nguồn lỗi → một dòng báo đúng nguồn ấy ở đầu khung kèm «Thử lại», máy tự thử lại trước khi báo; nhóm còn lại giữ nguyên, số chỉ đếm phần đọc được.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hôm nay `/today` | Biết và làm việc tiếp theo của mình | Mở app, cột nhà / hồ sơ, luồng Gửi, Đã gửi |
| Đội `/team` | Biết đội đang chạy thế nào | Cột nhà của trưởng nhóm / — |
| Tin của khách `/shares/tin` | Đọc lại phản ứng 7 ngày | Cột thứ hai của Đã gửi / Đã gửi, Gửi |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-homnay-dang-tai | Hôm nay | `ChoTai` kiểu Tràn | Chờ |
| ST-homnay-co-viec | Hôm nay | Nhóm + dòng, đầu màn «N việc · M quá hạn» | Bấm nút chính |
| ST-homnay-het-viec | Hôm nay | «Hôm nay không còn việc», một nút theo vai | Mở Bảng hàng hay nhập lead |
| ST-homnay-loi-mot-phan | Hôm nay | «Chưa tải được <nguồn>» + «Thử lại», nhóm khác giữ nguyên | Thử lại |
| ST-homnay-mat-mang | Hôm nay | Dải ngoại tuyến của bố cục; nhóm cần mạng ghi «cần mạng» | Chờ có mạng, tự đọc lại |
| ST-doi-trong | Đội | «Chưa có căn nào» | — |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Đúng một nút chính mỗi dòng; khổ 1440 nút bề rộng cố định, không nhãn nào cắt chữ; khổ 375 nút co theo chữ, tên căn đọc đủ.
- `?nhom=<mã>` cuộn tới nhóm và sáng mục cột hai; mã không thuộc vai người xem thì về «Tất cả việc».
- Mỗi lỗi đọc tự thử lại một lần sau 2 giây; có mạng trở lại thì đọc lại mọi nguồn lỗi.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `solution-agents-2` (`OHaiTang`, `OThaoTac`) | dùng | Dòng việc chủ kho đã duyệt ở 14A |
| `data-grid` nhóm gập | dùng | Lưới Hôm nay đang chạy, luật `no-raw-table` |
| `DanhSachDienThoai` | dùng | Thẻ hai tầng đã có |
| `dashboard-6` | dùng | Dời nguyên sang Đội, đúng bố cục của nó |
| `DongTinDauKhach` | dùng | Dời nguyên sang Tin của khách |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: đã tra help center Keller Williams, Follow Up Boss, HubSpot (`docs/product/doi-chieu-nganh.md` mục 13); rút: một trang việc, vai đổi phạm vi nhìn. Tìm khối ReUI theo «task queue»: gần nhất là `data-grid-grouping-1`, đã có trong kho.

### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Đầu chủ, Trưởng nhóm, Đầu khách, Telesales |
| Việc chính | Biết việc tiếp theo của mình và làm ngay |
| Tần suất | mỗi ngày nhiều lần |
| Số bản ghi | vài chục |
| Thiết bị | cả hai |
<!-- UX-SPEC-TEMPLATE>>> -->

## Câu chỉ chủ kho quyết

- **Hỏi-1, chọn lối:** khuyên Trong kho (một danh sách). Lối khác: thẻ theo vai, hai cột. Trang ba lối gửi kèm thẻ.
- **Hỏi-2, telesales thuần thấy gì:** khuyên việc «Lead bị trả lại» cộng một dòng «Lead đã nhập (N)» dẫn tới `/leads/mine`.
  Lối khác: giữ nguyên bảng Lead đã nhập ở Hôm nay cho telesales thuần — đổi ít nhưng còn một ngoại lệ.
- **Hỏi-3, việc đầu khách hết thế nào:** khuyên tự hết sau 48 giờ, không đổi cơ sở dữ liệu. Lối khác: nút «Xong» ghi máy
  chủ — chính xác hơn nhưng cần bảng mới, hạng T3.
- **Hỏi-4, nhãn nút nhóm Thiếu thông tin:** khuyên «Mở hồ sơ». Lối khác: giữ nhãn dài đã duyệt ở AC-3 của hàng 92, chữ tiếp
  tục bị cắt.

- **Hỏi-5, nhóm của vai khác và mốc 48 giờ giữ cứng hay là dữ liệu của sàn:** khuyên bản đầu sàn đổi được tên nhóm qua sổ
  từ vựng, còn ẩn nhóm, đổi thứ tự và đổi 48 giờ để dòng «điều khoá» ở sổ điểm biến thiên, lý do nền tảng, xem lại khi có sàn
  thứ hai hỏi. Lối khác: đưa cả nhóm mới và mốc giờ vào bộ nhóm của sàn ngay — đúng luật ADR-0022 hơn nhưng cần màn sửa bộ
  nhóm phần lớn hơn.

- **Hỏi-6, trưởng nhóm giao lại trên điện thoại:** khuyên có, qua ngăn đáy, đúng Tham chiếu §2 «điện thoại: báo lead quá hạn»
  và nối tiếp được ngay. Lối khác: điện thoại chỉ báo, muốn giao phải mở máy tính — ít việc hơn nhưng lead quá hạn nằm chờ.

## Để người dựng tự quyết

Cách chia tệp, tên hàm, cách cột hai đọc chung nguồn với thân, đích của nút hết việc theo từng vai.
