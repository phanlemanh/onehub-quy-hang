# Thiết kế — Ghim kết quả ca «Tân Định, Tỉnh Bắc Ninh» (hàng kiem-tan-dinh-bac-ninh)

Ngày 07/11/2026 · dãy X · T2 · chỉ bộ kiểm lõi (`packages/core/src/address/`), không đổi bộ đọc.

## Vấn đề

Ngoài-1 của doc-xa-thieu-mot-phan-dau: bài kiểm có tên cho «12 Lê Lợi, Phường Tân Định, Tỉnh Bắc Ninh» chỉ khẳng định
kết quả KHÔNG phải xã Tân Dĩnh (07432, Bắc Ninh). Bộ đọc trả rỗng, trả sai sang xã khác hay hỏng hẳn thì bài vẫn xanh.
Chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 07/11 (`d-20261107T011616Z-10`).

## Cách làm

Một hàm kiểm thuần `kiemTanDinhBacNinh(doc)` trả danh sách lỗi, so TRỌN kết quả của bộ đọc — tập khoá của kết quả
bằng đúng tập khoá ghim, rồi từng trường — với kết quả ghim viết trước (đo 07/11 trên bộ đọc hiện tại). Kết quả ghim
không chỉ là bản chụp hành vi: tên tỉnh 24 «Thành phố Bắc Ninh» và việc tỉnh 24 không có xã Tân Định (chỉ có xã Tân
Dĩnh 07432) là của danh mục đã đối chiếu nguồn ở hàng danh-muc-xa-day-du (AC-4: «ba tên Quảng Ninh, Bắc Ninh, Đồng Nai
thành «Thành phố …»»); «unparsedAddress» là chữ người gõ.

| Trường | Ghim |
|---|---|
| stateOrProvince | `{ ma: "24", ten: "Thành phố Bắc Ninh" }` |
| wardName | `null` |
| chuaCoTrongDanhMuc | `[{ phan: "wardName", chu: "Tân Định" }]` |
| thieu | `["wardName"]` |
| trangThai | `"thieu"` |
| khoa | `null` |
| streetNumber, streetName | `"12"`, `"Lê Lợi"` |

Mỗi trường lệch là một dòng lỗi `lệch kết quả ghim: <trường>`. Phá thử chạy CÙNG hàm với ba bộ đọc lỗi: lối lui về so
bỏ dấu (`soDau: "lui-bo-dau"`, ra Tân Dĩnh), bộ đọc trả rỗng (wardName null, danh sách «chưa có» rỗng), bộ đọc trả sai
sang một xã khác của tỉnh 24. Ca mới đứng trong tệp kiểm riêng `kiem-tan-dinh.test.ts`; tệp kiểm của hồ sơ
doc-xa-thieu-mot-phan-dau (đã ký) giữ nguyên để bằng chứng của hồ sơ ấy không hoá cũ — bài âm tính cũ còn đó, ca mới
chặt hơn nó.

Dạng không có «Phường» đứng trước («12 Lê Lợi, Tân Định, Tỉnh Bắc Ninh») hôm nay gộp «Tân Định» vào tên đường — hành vi
tách đoạn của hàng 75, không thuộc hàng này. Vòng này chỉ ghim phần chắc chắn của dạng ấy: không ra xã nào, `wardName`
nằm trong `thieu`, trạng thái «thieu»; không ghim tên đường. Đo 07/11: cùng dạng chạy lối lui về so bỏ dấu
(`soDau: "lui-bo-dau"`) ra 07432 Tân Dĩnh, trạng thái «chuan» — phá thử của dạng này đỏ được thật.

## Đối chiếu ngành

Không có năng lực mới, không danh sách cố định mới — chỉ siết phép đo của luật đọc đã có (RESO không có cấp xã).

## Vùng và việc không làm

- Vùng: `packages/core/src/address/**` (chỉ tệp kiểm) và hồ sơ.
- Không đổi bộ đọc; không đổi cách tách đoạn không tiền tố (hàng 75).

## Đặc tả UX

Bỏ — lõi thuần, không màn.
