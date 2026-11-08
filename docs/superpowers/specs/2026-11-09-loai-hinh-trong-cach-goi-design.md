# Loại hình trong Cách gọi — thiết kế

Hàng `loai-hinh-trong-cach-goi`, dãy X, T2. Mở từ Known limits của hàng 79 (`bang-hang-theo-loai-hinh`): vế «chữ cột Loại
hình theo cách gọi riêng của sàn» của AC-4 không đo được vì tập đóng của Cách gọi chưa có loại hình. Chủ kho 08/11:
«Thu, mở hàng sau».

## Việc

Quản trị sàn đặt tên riêng cho loại hình ở Cài đặt › Sàn › Cách gọi. Cột Loại hình của Bảng hàng và hồ sơ căn hiện tên
ấy; xoá tên riêng thì về tên mặc định. Căn vẫn lưu giá trị RESO; lọc, đếm, luật đọc giá trị RESO.

## Cách làm

Loại hình trở thành một tập đóng của sổ từ vựng đang có (hàng 45), không dựng đường mới:

1. **Lõi.** `TAP_DONG.propertySubType` mang bốn giá trị RESO của `PROPERTY_SUBTYPE_FIELDS` với tên mặc định Căn hộ, Nhà
   phố, Biệt thự, Đất; `TRUONG_DAT_TEN.propertySubType` là «Loại hình». Nhãn mặc định về một chỗ trong lõi; hai bảng
   `LOAI_HINH` ở web đọc từ đó. Khớp kiểu với `PropertySubType`, thêm một bài kiểm hai chiều trên tập khoá.
2. **Đường ghi và đọc.** `GET/PUT /api/v1/company/labels` sinh từ `TAP_DONG` nên tự có; khoá `labels.value.propertySubType`
   hợp lệ với check của migration 039. Không migration.
3. **Bảng hàng.** Cột và ô lọc đã đọc qua `nhanGiaTri`. Thêm từ vựng vào nhóm (`nhomDong`): nhóm theo loại hình và cấp Loại
   căn của đất hiện tên riêng.
4. **Hồ sơ căn.** `moHinhHoSo` nhận từ vựng; dòng thuộc tính và đầu cột hiện tên riêng, tiêu đề dòng theo tên trường riêng.
5. **Mọi chỗ mở hồ sơ.** Toàn màn `/units/<mã>` và cột hồ sơ ở Hôm nay chưa có `TuVungProvider`; bọc thêm, đọc bằng
   `docTuVung` như Bảng hàng.
6. **Không ra ngoài công ty ở hàng này.** `tuVungRaNgoai` không chở tên riêng của loại hình: câu giao nói hai mặt là Bảng
   hàng và hồ sơ căn, trang khách và bản xuất hôm nay không hiện loại hình. Đây là phạm vi của hàng, không phải một bất biến:
   hàng sau muốn hiện loại hình ở trang khách thì gỡ chặn này.

Giá trị RESO có dấu cách («Single Family Residence»): khoá ô giữ nguyên, thuộc tính `id` của ô trên màn thay dấu cách để id
hợp lệ. Sắp theo cột Loại hình đi theo chữ đang hiện, như mọi cột chọn khác; tên các cách nhóm («Loại hình», «Loại hình → Toà»)
giữ chữ mặc định như cách nhóm theo Toà hôm nay.

Mức sàn được chạm (ADR-0022): tên trường và tên giá trị — Đổi tên; tập bốn giá trị — Khoá (nghĩa chuẩn để so giữa các sàn, K11 và
#19 ở Sổ điểm biến thiên). Migration 039 mở khoá `labels.value.<trường RESO camelCase>`; lý do «chưa là cột» trong chú thích cũ đã
hết từ hàng 79 (cột Loại hình có trên Bảng hàng). Giá trị có dấu cách đo trên Postgres (E2).

## Đối chiếu ngành

| Năng lực | RESO | Sản phẩm khác | Ta làm | Ta cứng — họ cấu hình |
|---|---|---|---|---|
| Tên hiển thị riêng neo vào giá trị chuẩn | Lookup: `LookupValue` có thể là tên địa phương hoặc từ đồng nghĩa của một mục chuẩn, `StandardLookupValue` giữ mục chuẩn ([dd.reso.org Terms](https://dd.reso.org/DD2.1/about/terms/), [đề xuất Transport](https://transport.reso.org/proposals/data-dictionary.html)) | Veeva Vault tách tên giá trị máy khỏi nhãn; đổi nhãn không đổi tên máy ([API](https://general.veevavault.dev/vault-api/api-reference/26.1/picklists/update-picklist-value-label/)). Oracle CRM On Demand khuyên không đổi tên giá trị đang dùng ([tài liệu](https://docs.oracle.com/cd/G30551_01/books/OnDemOLH/changepicklistvaluehelp.html)) | Căn lưu giá trị RESO, sàn đặt nhãn neo vào | Nhiều tên cho một giá trị: RESO cho phép nhiều `LookupValue` trỏ một mục chuẩn; ta một tên — Hỏi-1 |
| CRM bất động sản đặt tên loại hình | — | BoldTrail, Lofty, Follow Up Boss: **chưa kiểm** (tra 09/11 không ra trang chính chủ) | — | — |

## Quét không gian

Sản phẩm: Quỹ hàng — chân sản phẩm: `CONTEXT.md`, `docs/product/tham-chieu.md`, mã màn đang có · chân ngành: RESO Lookup,
Veeva Vault (cận kề).

- Trục A — trạng thái tên: mặc định | tên riêng | đã trả về mặc định | bị từ chối (trùng, sai chữ, neo lạ). [thước CE: luồng
  của hàng 45 và `chan-trung-ten-gia-tri`]
- Trục B — mặt hiện: màn Cách gọi | Bảng hàng (cột, ô lọc, sắp, nhóm, cấp Loại căn) | hồ sơ căn | ngoài công ty. [thước CE: kết
  quả tìm mọi nơi đọc `nhanLoaiHinh`, `LOAI_HINH`, `tuVungRaNgoai`]
- Trục C — dạng hàng: căn hộ | hàng lô | căn ngoài khu | chưa rõ loại hình. [thước CE: ba dạng của khuôn hàng 76, ca «Chưa
  rõ» của hàng 79]
- Trục D — chỗ mở hồ sơ: cạnh bảng | bảng thẻ | toàn màn | Hôm nay. [thước CE: bốn lời gọi `CotHoSo` trong mã]

**Core:** tên riêng và trả về mặc định trên Bảng hàng và hồ sơ với ba dạng có loại hình; từ chối ở màn và máy chủ; đủ bốn chỗ
mở hồ sơ; không ra ngoài. **Later:** tên loại hình trên thẻ điện thoại của Bảng hàng (thẻ chưa có ô này); trang khách và bản
xuất hiện loại hình; nhập Excel nhận tên riêng làm giá trị loại hình. **Never:** thêm giá trị loại hình ngoài RESO (ADR-0016);
sàn tự tắt giá trị (can-ngoai-khu Hỏi-3 đã chốt tập cứng).

## Hỏi-1 — mỗi loại hình một tên hay nhiều tên

Một sàn có cả «Liền kề» và «Shophouse», cả hai đều là nhà phố theo RESO (`Townhouse`). Bản nháp theo chốt hàng 45 («mỗi giá
trị chuẩn đúng một tên riêng»): sàn chọn một tên cho nhà phố, hai dòng không tách được trên bảng.

Lối khác: nhiều tên neo một giá trị, như nhãn trạng thái hàng 46. Mỗi căn phải lưu mình mang tên nào, nên cần thêm dữ liệu trên
hàng và đường ghi (migration, hạng T3), và danh mục Invest chưa chở tên ấy. Máy khuyên một tên cho bản này; nhu cầu tách
Liền kề và Shophouse mở thành hàng riêng khi có sàn thật cần. Một tên không thuộc bốn lý do giữ cứng của ADR-0022: đây là hoãn vì giá làm, không phải khoá lại. Sản phẩm bất động sản cùng loại cho hai tên trên một giá trị hay không: **chưa kiểm**, chỉ RESO cho phép.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
### 1. Luồng

- Suôn sẻ: Cài đặt › Sàn › Cách gọi → gõ «Liền kề» ở dòng Loại hình · Nhà phố → Lưu → mở Bảng hàng thấy cột, ô lọc, nhóm hiện
  «Liền kề» → mở hồ sơ một nhà phố thấy dòng Loại hình «Liền kề» (điểm ra: đóng cột).
- Biên: sàn chưa đặt tên — y hôm nay; hàng chưa rõ loại hình — «Chưa rõ» ở bảng, «—» ở hồ sơ; đọc từ vựng hỏng — chữ mặc định.
- Lỗi & quay lại: trùng tên hay sai chữ → lỗi ngay dưới ô, «Lưu» khoá; máy chủ từ chối → `TrangThai` lỗi ở chân khung, ô giữ chữ.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Cách gọi | đặt tên của sàn cho trường và giá trị chuẩn | Cài đặt › Sàn / ở lại màn |
| Bảng hàng | xem, lọc, nhóm hàng theo tên của sàn | nhà Bảng hàng / cột hồ sơ căn |
| Hồ sơ căn | đọc thuộc tính căn bằng tên của sàn | dòng Bảng hàng, gõ mã căn, Hôm nay / đóng cột |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-cach-goi-chua-dat | Cách gọi | bốn dòng Loại hình, ô trống, gợi ý tên mặc định, «Đang dùng» như các dòng khác | gõ tên riêng |
| ST-cach-goi-trung-ten | Cách gọi | «Trùng tên của «Biệt thự»» dưới ô, «Lưu» khoá | sửa chữ |
| ST-cach-goi-da-luu | Cách gọi | báo «Đã lưu cách gọi» | mở Bảng hàng |
| ST-bang-hang-ten-rieng | Bảng hàng | cột, ô lọc, nhóm hiện tên riêng | lọc, nhóm như cũ |
| ST-ho-so-ten-rieng | Hồ sơ căn | dòng Loại hình và đầu cột hiện tên riêng | đóng cột |
| ST-ho-so-chua-ro | Hồ sơ căn | dòng Loại hình «—» | báo sai thông tin căn |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Chữ 1–40 ký tự, không số điện thoại, email, số giấy tờ; so trùng bỏ hoa thường và dấu cách thừa — như các tập đóng khác.
- Sàn dùng tên mới từ lần mở trang kế.

### 5. Xuất xứ component

| Component | Nấc | Vì sao (1 dòng) |
|---|---|---|
| Khung `MucCaiDatKhoi`, `SettingField`, `Input` | dùng | màn Cách gọi sinh dòng từ bảng nhãn; không đổi khối |
| Lưới Bảng hàng, ô lọc chọn | dùng | đổi chữ hiện |
| Mục thuộc tính hồ sơ căn | dùng | đổi chữ hiện |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail) ở Bảng hàng, một-cột-cuộn ở Cách gọi.
Căn cứ: màn đã dựng, vòng không đổi bố cục (`design/patterns/bang-hang.md`, `design/patterns/cai-dat-san.md`).

### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Quản trị sàn đặt tên; Đầu chủ, Đầu khách đọc |
| Việc chính | Đặt tên loại hình theo cách sàn vẫn gọi |
| Tần suất | hiếm (đặt tên) · mỗi ngày (đọc) |
| Số bản ghi | bốn giá trị |
| Thiết bị | máy tính (đặt tên) · cả hai (đọc) |
<!-- UX-SPEC-TEMPLATE>>> -->
