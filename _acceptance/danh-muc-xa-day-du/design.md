# Thiết kế — Danh mục xã đầy đủ cho lõi địa chỉ (hàng danh-muc-xa-day-du)

Ngày 06/11/2026 · dãy X đợt dau-khach-nhap · hạng T2 (vùng `packages/core/src/address/**`) · Cổng Đáng: hàng lộ trình không
mã — chủ kho đã quyết ở Cổng Phạm vi hàng 75 (Hỏi-1, 05/11), giám sát xác nhận (X-9, 06/11).

## Vấn đề

Lõi địa chỉ của hàng 75 mới biết 34 tỉnh và bốn phường TP.HCM. Mọi địa chỉ ở xã, phường khác ra «thiếu» hoặc «chưa có
trong danh mục», nên không có khoá. Địa chỉ ghi phường, quận hay tỉnh trước sắp xếp 2025 (người dùng và chủ nhà còn gõ
như vậy nhiều năm nữa) cũng không đổi được sang đơn vị mới. Hàng 76 lưu khoá và kiểm trùng trên khoá, nên trước đó
danh mục phải đủ, và mã hàng 75 đã dùng phải được đối chiếu với nguồn chính thống.

Mã của hàng 75 chép từ trang thứ cấp và ghi «chưa đối chiếu Phụ lục II». Máy đã tra nguồn của Cục Thống kê: mã 34 tỉnh
và bốn phường TP.HCM khớp. Nhưng ba tên tỉnh đã cũ: từ năm 2026, Quảng Ninh (22), Bắc Ninh (24) và Đồng Nai (75) là
thành phố trực thuộc trung ương. 22 xã ở Bắc Ninh và Đồng Nai cũng đã thành phường, vẫn giữ mã cũ.

## Nguồn (Hỏi-1 — chủ kho chọn và cho phép tải)

Máy khuyên dùng nguồn của Cục Thống kê (`danhmuchanhchinh.nso.gov.vn`, tên miền gso.gov.vn cũ không còn phản hồi):

| Phần | Tệp | Cỡ | Ghi chú |
| --- | --- | --- | --- |
| 3.321 xã mới, mã năm chữ số | dịch vụ `DMDVHC.asmx`, thao tác `DanhMucPhuongXa`, cả nước, `DenNgay` = ngày tham chiếu | ≈ 0,97 MB XML | tại 01/07/2025: 2.621 xã · 687 phường · 13 đặc khu (đúng Phụ lục II QĐ 19/2025); tại 06/11/2026: cùng 3.321 mã, 2.599 xã · 709 phường · 13 đặc khu |
| Xã cũ → xã mới, tỉnh cũ → tỉnh mới | `TAPTIN/BangChuyendoiĐVHCmoi_cu_final.xlsx`, sheet «Tổng hợp_không merge» | 1,15 MB (sửa lần cuối 23/10/2025) | 10.571 dòng, đủ 3.321 mã mới, 10.034 mã xã cũ; cột ghi chú phân biệt nhập toàn bộ hay một phần; 442 mã cũ vào từ hai xã mới trở lên |

Giấy phép: trang không ghi điều khoản sử dụng. Dữ liệu do cơ quan nhà nước công bố. Luật Sở hữu trí tuệ, Điều 15, không
bảo hộ văn bản hành chính (khoản 2) và số liệu (khoản 3). Kho ghi rõ nguồn.

Lối khác:
- provinces.open-api.vn v2 (bên thứ ba): không khai giấy phép, mã lưu dạng số nên mất số 0 đầu, không có cờ nhập toàn bộ
  hay một phần, và cập nhật lệch (tỉnh đã lên thành phố mà xã vẫn ghi «Xã»).
- Văn bản gốc QĐ 19/2025 (PDF): máy chưa tìm được bản trên cổng chính phủ, và chép tay từ PDF là chép 3.321 dòng.

Ngày tham chiếu, máy khuyên **06/11/2026**, tức hiện hành: mã không đổi so với 01/07/2025, chỉ loại và tên đúng với hôm
nay. Chọn 01/07/2025 thì khớp từng chữ với Phụ lục II, nhưng 22 phường và ba thành phố bị ghi sai loại. Khoá dựng trên
mã nên ngày nào cũng ra cùng khoá.

Hai tệp nguồn được chép nguyên vào kho (`packages/core/src/address/nguon/`), có băm sha256 ghi trong danh mục. Bảng dữ
liệu của lõi sinh từ hai tệp ấy bằng một bộ sinh thuần Node, không thêm thư viện. Nhờ vậy bộ kiểm chạy lại được bộ sinh
trên tệp gốc và đòi kết quả trùng từng byte với bảng đã commit: bảng không thể bị sửa tay mà không ai biết.

## Cách làm

1. **Bộ sinh** `nguon/sinh-danh-muc.mjs` đọc XML của dịch vụ và sheet «không merge» của tệp xlsx. Tệp xlsx là tệp zip
   chứa XML; bộ sinh tự giải bằng `zlib` của Node, không cần thư viện. Kết quả ghi ba bảng JSON trong `du-lieu/`:
   - `xa.json`: mã, mã tỉnh, tên không kèm loại, loại;
   - `xa-cu.json`: tên cũ, loại cũ, mã cũ, huyện cũ, tỉnh cũ, và các xã mới nhận nó (kèm cách nhập: toàn bộ hay một phần);
   - `tinh-cu.json`: tên tỉnh cũ, mã cũ, các tỉnh mới nhận nó.

   Mỗi bảng được sắp theo mã nên luôn ra cùng một byte.
2. **Làm sạch có tên.** Lỗi đã biết của tệp xlsx được sửa bằng một bảng sửa nằm trong bộ sinh, mỗi dòng một lý do. Bộ
   sinh không đoán:
   - 342 mã xã mới mất số 0 đầu (Tuyên Quang, Cao Bằng) được đệm lại cho đủ năm chữ số;
   - 40 tên xã cũ ghi chữ tổ hợp (Khánh Hòa, Bình Định) được đưa về dạng dựng sẵn;
   - khoảng trắng và dấu xuống dòng thừa được cắt;
   - nhãn tỉnh cũ của Đặc khu Cồn Cỏ (19742) ghi «Quảng Trị (44)», đúng là 45;
   - nhãn tỉnh cũ của Phường 4, Tân An (27691) ghi «Tiền Giang (82)», đúng là Long An (80);
   - nhãn tỉnh cũ của Xã Tiên Hải, Hà Tiên (30781) ghi «An Giang (89)», đúng là Kiên Giang (91) (máy bắt lúc làm).

   Tên đơn vị mới lấy theo dịch vụ (nguồn mã), không lấy theo tệp xlsx.
3. **Danh mục lõi** (`danh-muc.ts`) nạp ba bảng thay cho phần trích. 34 tỉnh giữ trong mã TS, tên sửa theo nguồn: «Thành
   phố Quảng Ninh», «Thành phố Bắc Ninh», «Thành phố Đồng Nai». Danh mục ghi `nguon` cho từng phần: văn bản, nơi đọc, ngày
   đọc, ngày tham chiếu, băm tệp.
4. **Bộ đọc**, ba chỗ:
   - (a) Tỉnh: đoạn cuối không khớp tên tỉnh mới mà khớp một tên tỉnh cũ thì đọc ra tỉnh mới nhận nó. Kết quả ghi tên cũ
     đã đọc, giống cách phường cũ đã làm.
   - (b) Phường không có chữ «Phường», «Xã» đứng trước: khi đã biết tỉnh, chỉ so với xã của tỉnh đó. Có hơn 13 nghìn tên
     cả nước, nên một đoạn tên đường như «Nguyễn Trãi» rất dễ trùng tên một phường ở tỉnh khác. Không biết tỉnh thì giữ
     như hàng 75: ra «thiếu tỉnh» và «cần người chọn», không bao giờ có khoá.

   - (c) Huyện cũ dạng «Thành phố <tên>», «TP <tên>», «Thị xã <tên>»: đoạn không phải đoạn cuối, khớp tên một huyện cũ
     trong bảng xã cũ của tỉnh đã đọc, thì đọc là huyện cũ. Đoạn cuối vẫn so tên tỉnh trước, nên «TP Huế» ở cuối là tỉnh.
     Đây là cách viết phổ biến nhất của địa chỉ trước 2025 («Phường 1, TP Tân An, Long An»). Không khớp danh sách huyện cũ
     thì không lấy làm huyện cũ.

   Không đổi khuôn kết quả ngoài một trường tuỳ chọn mới, `stateOrProvince.tuTenCu`.

## Không đổi khoá cũ

Khoá dựng trên mã, và mã không đổi, nên mọi khoá hàng 75 đã ra vẫn đúng. Bộ kiểm đòi 86 cách viết của bộ thử hàng 73 ra
đúng ảnh `anh-truoc-va.json` đã chụp. Bộ kiểm của hàng 75 và hàng va-duong-so-n chạy trong cùng lượt, không sửa dòng nào.
Bảng trích hàng 73 vẫn phải khớp danh mục (`doiChieuBangTrich`).

## Đối chiếu ngành

- RESO Data Dictionary chỉ có `StateOrProvince` và `City`, không có cấp xã. Danh mục cấp xã của Việt Nam là đặc trưng
  riêng, nên giữ tên riêng (`wardName`, mã năm chữ số) như hàng 75.
- Bộ chuẩn hoá địa chỉ USPS (CASS, dữ liệu ZIP+4 của USPS) và Bưu điện Anh (PAF) có cùng cách làm: dùng tệp tham chiếu
  chính thức có phiên bản theo ngày, không tự dựng tay. Hàng này làm đúng như vậy: chép nguyên tệp nguồn, ghi ngày và
  băm, sinh bảng bằng máy.
- Cách xử lý tên cũ (đơn vị bị sắp xếp) giống bảng «ZIP code changes» của USPS: tên cũ trỏ tới đơn vị mới. Đơn vị bị
  tách vào nhiều nơi thì không đoán, đưa người chọn.

## Vùng và việc không làm

Chỉ `packages/core/src/address/**` và `_acceptance/danh-muc-xa-day-du/**`. Không bảng cơ sở dữ liệu, không migration,
không màn, không API.

Để sau (Out of scope của hợp đồng):
- Suy tỉnh từ tên phường khi người không gõ tỉnh (hàng 75 d-9, xét lại sau khi có dữ liệu thật).
- Tải danh mục lười ở bên gọi: lõi chưa xuất gói địa chỉ ra ngoài, hàng 76 quyết khi mở.
- Kéo lại nguồn định kỳ khi danh mục đổi tiếp (Hỏi-2): danh mục đứng ở ngày tham chiếu ghi trong danh mục.

## Đặc tả UX

Không có — hàng là lõi thuần, không màn (sổ: dòng «bỏ đặc-tả-UX»).
