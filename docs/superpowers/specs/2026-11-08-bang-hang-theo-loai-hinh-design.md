# Bảng hàng theo loại hình — thiết kế (hàng 79)

Hàng 79 của lộ trình, dãy X, đợt `dau-khach-nhap`; mã đợt LH9 (`docs/tri-thuc/wiki/dot/moi-loai-hinh-3110.md`). Đứng trên
14 (Bảng hàng), 17 (hồ sơ căn), 72–76 (loại hình RESO, bảng trường theo loại hình, khu thấp tầng, căn ngoài khu) và 105 (bố
cục danh sách – chi tiết). Ô cơ hội: `_acceptance/bang-hang-theo-loai-hinh/opportunity.md` (Cổng Đáng: build, 05/11).

## Vấn đề

Bảng hàng và hồ sơ căn chỉ biết căn hộ: cột Toà · Mã căn · Loại căn · Diện tích · Tầng · Hướng (`inventory/cot.ts`), thuộc
tính ghép từ danh mục toà theo toà + mã căn (`ghep-danh-muc.ts`), hồ sơ tìm căn theo toà + mã (`units/ho-so/ho-so.ts` —
chú thích «hồ sơ theo loại hình là hàng 79»). Từ hàng 76, sàn tạo được hàng trên lô của khu thấp tầng và trên căn ngoài
khu; các hàng ấy lên bảng với loại căn «Chưa rõ», cột tầng trống, và bấm vào không mở được hồ sơ. Lõi đã có bảng trường
theo loại hình (`PROPERTY_SUBTYPE_FIELDS`, ADR-0016 quyết định 2): «Trường không dùng của loại hình là không có, không
phải ô trống: bảng hàng không hiện cột "tầng" cho đất».

## Dữ liệu: loại hình của từng dạng hàng

| Dạng hàng | Loại hình và trường đọc từ | Máy khách có hôm nay? |
|---|---|---|
| Căn hộ trong toà | danh mục toà (`GET /api/v1/catalog`) | có |
| Lô của khu thấp tầng | danh mục dãy — cùng nguồn với đường tra mã lô (`catalog/lots.ts`) | không — `/catalog` chưa mang dãy |
| Căn ngoài khu | bảng `off_compound_units` của sàn (loại hình, địa chỉ) | không — chỉ có đường đọc một căn |

Thiết kế: `/api/v1/catalog` trả thêm `blocks` của mỗi khu (lô kèm trường thấp tầng, chỉ lớp danh mục, khuôn chép chặt
như toà), nguồn là đúng danh mục lô mà đường tra mã lô dùng (mặc định rỗng — Hỏi-1 hàng 74, bản thật chưa phục vụ khu thấp
tầng mẫu). Thêm `GET /api/v1/off-compound-units` trả các căn ngoài khu của sàn đang làm (mã, loại hình, địa chỉ đã gõ),
dưới luật theo dòng sẵn có của bảng (bất biến 1), cùng cửa vào với đường đọc một căn. Bảng hàng tải hai thứ này cạnh danh
mục, giữ bản cuối trên máy theo sàn như danh mục — mất mạng vẫn ra loại hình (KH-bh-tren-may). Căn ngoài khu hôm nay chỉ
lưu loại hình và địa chỉ: trường thấp tầng của nó chưa có chỗ lưu, nên ô của nó «—» (chưa rõ), không phải «không có».

Lối bị loại: sự kiện tạo hàng mang loại hình — loại hình là thuộc tính căn (ADR-0016 quyết định 1, luật 6), chép vào lần
rao là hai nguồn sự thật và đổi khuôn sự kiện của lõi.

## Màn

- **Cột theo loại hình.** Bộ cột hiện = cột chung + hợp các trường của mọi loại hình có trong dòng đã lọc, theo
  `PROPERTY_SUBTYPE_FIELDS`. Sàn chỉ có căn hộ thấy đúng bộ cột hôm nay. Lọc còn toàn đất → không cột Tầng, Hướng, Loại căn,
  Diện tích sàn. Cột người đã tắt ở menu Cột vẫn tắt; cột không thuộc loại hình nào đang có thì không hiện dù đang bật.
  Cột mới: Loại hình (chọn), Diện tích đất (`lotSizeArea`), Số tầng (`storiesTotal`), Mặt tiền (`frontageLength`), Lộ giới
  (`accessRoadWidth`).
- **Ô không dùng khác ô chưa rõ.** Bảng trộn loại hình: ô của trường mà loại hình của dòng không dùng để trống (chép ra
  chuỗi rỗng, lọc số không khớp); ô của trường dùng mà chưa có số hiện «—» như nay.
- **Lọc theo loại hình.** Cột Loại hình là ô lọc chọn một giá trị theo giá trị RESO; chữ hiện là cách gọi riêng của sàn
  (hàng 45) khi có, vắng thì Căn hộ · Nhà phố · Biệt thự · Đất; dòng chưa biết loại hình là «Chưa rõ».
- **Nhóm theo loại hình.** Thêm «Loại hình» và «Loại hình → Toà»; mặc định giữ Toà → Loại căn (Tham chiếu §9). Ở cấp
  Loại căn, dòng không dùng phòng ngủ (đất) đọc nhãn loại hình thay «Chưa rõ». Góc nhìn đã lưu nhận cách nhóm mới; góc
  nhìn cũ đọc như cũ.
- **Cột vị trí** (Hỏi-1). Cột đầu hôm nay là «Toà» với hàng lô hiện «Khu · Dãy», hàng ngoài khu hiện «Căn ngoài khu».
  Khuyến nghị: giữ một cột, tiêu đề «Toà» khi mọi dòng đã lọc là căn hộ, «Vị trí» khi có loại khác; hàng ngoài khu hiện
  địa chỉ đã gõ.
- **Hồ sơ căn theo loại hình.** Hàng lô và hàng ngoài khu mở hồ sơ theo hàng (`?hang=`), không tìm theo toà; mục thuộc
  tính hiện Loại hình và đúng bộ trường của loại hình — đất: Diện tích đất · Mặt tiền · Lộ giới, không Tầng, Trục; căn
  hộ giữ nguyên. Thuộc tính khoá, không sửa (như nay).
- **Trang thử nhanh-tuc-thi** (Hỏi-2). Bản đồ khuôn ghi ngoại lệ có hạn «gỡ hay chuyển ở hàng 79»; hàng này gộp mà ngoại
  lệ còn thì lint đỏ «hạn đã tới». Khuyến nghị chuyển: giữ trang ở chỗ cũ, bỏ ngoại lệ, trang chịu luật bố cục như mọi
  màn; gỡ thì hai hồ sơ đã ký (nhanh-tuc-thi, dong-bo-tu-lanh) mất chỗ chấm lại phần nhìn. Đã thử trên nhánh chính
  08/11: bỏ dòng ngoại lệ thì trang qua ESLint và kiểm chuẩn giao diện không sửa dòng nào — «chuyển» chỉ là bỏ ngoại lệ và
  sửa hai bài kiểm của `packages/ui-lint` đang ghim nó.

## Đối chiếu ngành (ADR-0022)

| Năng lực | RESO | Sản phẩm khác | Ta làm | Ta cứng — họ cấu hình |
|---|---|---|---|---|
| Loại hình của căn | `PropertyType` 9 giá trị, `PropertySubType` 31 — bảng giá trị chuẩn ([PropertyType](https://dd.reso.org/DD2.0/Property/PropertyType/), [PropertySubType](https://dd.reso.org/DD2.0/Property/PropertySubType/)) | DIGINET: giỏ hàng phân cấp lô, tháp, dãy, mã ([diginet.com.vn](https://diginet.com.vn/giai-phap/phan-mem-quan-ly-bat-dong-san-dang-dau-tu-nhat-hien-nay)); Rocker: giỏ hàng nhà phố ([phanmemnhapho.vn](https://phanmemnhapho.vn/)) — loại hình có tự đặt được không **chưa kiểm** | bốn giá trị RESO ở lõi; nhãn của sàn neo vào (hàng 45) | Không: chuẩn giữ cứng vì nghĩa để so giữa sàn (ADR-0016 quyết định 1, đã chốt); tên gọi là dữ liệu sàn |
| Trường theo loại hình | Trường của `Property` dùng chung, mỗi MLS chọn trường bắt buộc theo `PropertyType` (cách từng MLS khai **chưa kiểm**) | Meey CRM: «lọc nhiều tiêu chí» ([meeycrm.com](https://meeycrm.com/)) — bộ cột theo loại hình **chưa kiểm** | bảng `PROPERTY_SUBTYPE_FIELDS` của lõi quyết cột và mục hồ sơ | Không mới: bảng là dữ liệu lõi đã chốt (ADR-0016 quyết định 2, Hỏi-2 đã duyệt ở hàng 72) |
| Cột đang hiện | — | KW Command: SmartView là cột cộng bộ lọc người tự lưu ([SmartViews](https://answers.kw.com/hc/en-us/articles/360016246693-Customize-Columns-Use-Filters-and-Create-SmartViews-in-Contacts)) | người bật tắt cột và lưu góc nhìn như nay; loại hình chỉ bớt cột không có nghĩa | Không: người vẫn cấu hình cột |

## Ngoài phạm vi

- Bảng thẻ trên điện thoại (`inventory/cards/`) theo loại hình — hàng sau (Hỏi-4, cùng chỗ lưu trường của căn ngoài khu).
- Duyệt phần nhìn ở Cổng Phạm vi bằng chữ và hình giả lập, ảnh màn thật ở Cổng Bằng chứng (Hỏi-3).
- Nạp phần thấp tầng của dữ liệu mẫu vào cơ sở dữ liệu (lô, căn ngoài khu, hàng) — đã đề nghị hàng riêng ở hàng 76; màn
  đo trên căn ngoài khu dựng tại chỗ thử; lô đo ở lớp ghép bằng danh mục lô mẫu.
- Chỗ lưu trường thấp tầng của căn ngoài khu; sửa thuộc tính trên ô; mức đủ và trường bắt buộc theo loại hình.
- Luật ẩn theo loại hình trên trang khách (hàng 80, LH10).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Bảng hàng (máy tính) → lọc Loại hình = Đất → bộ cột co về trường của đất → bấm một dòng → cột hồ sơ mở với
  thuộc tính của đất (điểm ra: đóng cột, bảng giữ lọc).
- Biên: sàn chỉ căn hộ — bảng y như hôm nay; dòng chưa biết loại hình — «Chưa rõ», cột theo căn hộ; lọc rỗng — `TrangThai`
  lọc rỗng như nay.
- Lỗi & quay lại: đọc danh sách căn ngoài khu lỗi → dùng bản giữ trên máy; chưa từng có bản giữ → loại hình «Chưa rõ»,
  bảng vẫn chạy.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Bảng hàng | xem và lọc hàng của sàn theo loại hình | nhà Bảng hàng / cột hồ sơ căn |
| Hồ sơ căn (cột, toàn màn) | đọc thuộc tính của căn theo đúng loại hình | dòng Bảng hàng, ô gõ mã căn / đóng cột |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-bang-hang-chi-can-ho | Bảng hàng | bộ cột như hôm nay, tiêu đề «Toà» | làm việc như cũ |
| ST-bang-hang-tron-loai-hinh | Bảng hàng | cột chung + cột của mọi loại hình có mặt; ô không dùng để trống; tiêu đề «Vị trí» | lọc hay nhóm theo loại hình |
| ST-bang-hang-chi-dat | Bảng hàng | không cột Tầng, Hướng, Loại căn, Diện tích sàn; có Diện tích đất, Mặt tiền, Lộ giới | mở hồ sơ một lô đất |
| ST-bang-hang-chua-ro-loai-hinh | Bảng hàng | ô Loại hình «Chưa rõ» | mở hồ sơ, báo sai thông tin căn |
| ST-ho-so-dat | Hồ sơ căn | mục thuộc tính: Loại hình Đất, Diện tích đất, Mặt tiền, Lộ giới | đóng cột |
| ST-ho-so-ngoai-khu | Hồ sơ căn | Loại hình + địa chỉ; trường của loại hình chưa có số «—» | đóng cột |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Bộ cột tính lại mỗi lần đổi lọc; cột ghim đầu (vị trí, mã căn) giữ ghim. Chép ô không dùng ra chuỗi rỗng.

### 5. Xuất xứ component

| Component | Nấc | Vì sao (1 dòng) |
|---|---|---|
| Lưới Bảng hàng (`data-grid-editing-6` đã chuyển thể) | dùng | thêm cột là thêm dòng vào bảng cột thuần |
| Ô lọc chọn, chọn cách nhóm | dùng | cùng ô của cột Trạng thái, cùng `Select` |
| Mục thuộc tính hồ sơ căn | dùng | đổi danh sách trường, không đổi khối |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: màn đã dựng trên bố cục này (hàng 105, `design/patterns/bang-hang.md` `bo_cuc: danh-sach-chi-tiet`); vòng không
đổi khuôn, chỉ đổi bộ cột và bộ trường.

### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Đầu chủ |
| Việc chính | xem hàng của sàn trộn căn hộ, nhà phố, đất, lọc và nhóm theo loại hình, mở hồ sơ đúng trường |
| Tần suất | mỗi ngày nhiều lần |
| Số bản ghi | hàng trăm trở lên |
| Thiết bị | máy tính |
<!-- UX-SPEC-TEMPLATE>>> -->
