# Thiết kế — Vá «Đường số N» trong bộ đọc địa chỉ (hàng va-duong-so-n)

Ngày 06/11/2026 · dãy X đợt dau-khach-nhap · hạng T2 (vùng `packages/core/src/address/**`) · Cổng Đáng: chủ kho
«build va-duong-so-n» 05/11 (22:10Z). Nguồn: Ngoài-2 ở Cổng Bằng chứng hàng 75 (`dia-chi-chuan`), chủ kho chọn «mở hợp
đồng mới».

## Vấn đề

Bộ tách số nhà của hàng 75 (`tachSoNha` trong `chuan-hoa.ts`) coi chữ «số» (hay «sn») đứng trước một con số là dấu số nhà,
bất kể chữ đó đứng ở đâu. Tên đường dạng «Đường số 5» — rất phổ biến ở khu đô thị mới TP.HCM — vì vậy bị cắt:

| Chữ gõ | Hôm nay | Đúng |
| --- | --- | --- |
| «12 Đường số 5» | số nhà 12, tên đường «Đường» | số nhà 12, tên đường «Đường số 5» |
| «12 Đường số 7» | số nhà 12, tên đường «Đường» → **cùng khoá** với dòng trên | khoá khác |
| «Số 10 Đường số 5» | số nhà **5**, tên đường «Đường» | số nhà 10, tên đường «Đường số 5» |
| «Đường số 5, Phường Bến Thành, TP.HCM» | số nhà **5**, báo «chuẩn», có khoá | thiếu số nhà, không khoá |

Khoá trùng mà vẫn báo «chuẩn» là lỗi im lặng: hàng 76 lưu khoá và kiểm trùng trên khoá, nên hai căn trên hai đường khác
nhau sẽ bị coi là một. Hàng này phải xong trước khi hàng 76 lưu khoá — lúc này khoá chưa lưu ở đâu nên đổi còn rẻ.

## Cách sửa

Hai chỗ, cùng tệp `chuan-hoa.ts`; không đổi `doc-dia-chi.ts`, danh mục hay khuôn kết quả.

1. **Bộ tách số nhà.** Chữ «số»/«sn» đứng NGAY SAU một tiền tố đường («đường», «đ», «đg», «phố» — đúng bộ tiền tố mà
   `tenDuongChuan` đã bỏ ở hàng 75) là một phần tên đường, không phải dấu số nhà. Mọi chỗ khác giữ nguyên: «số 12 Đường
   Mẫu 1», «số 3 hẻm 45/12 …», «số 3 ngách 12 ngõ 45 …» vẫn tách như cũ. Bộ tách nhận tiền tố qua một hàm kiểm
   (`tachSoNhaVoi(phan, laTienToDuong)`), `tachSoNha` là bản dùng bộ tiền tố thật — chỗ nối này cho phép bộ kiểm dựng lại
   đúng hành vi cũ (hàm kiểm luôn sai) để phá thử, không phải viết một bản sao bằng regex.
2. **Tên đường chuẩn hoá cho khoá.** Sau khi bỏ tiền tố: «số 5», «số5», «số 05» đều thành `so 5`. Nhờ vậy mọi cách viết
   của cùng một đường số ra cùng một khoá: `79|26743|so 5|12`. Tên đường trả cho người vẫn là chữ người gõ, đã gọn khoảng
   trắng (quyết định của hàng 75).

Tên không có chữ «số» giữ đúng luật hàng 75: «Đường 5» → `5`, «Đường 3 Tháng 2» → `3 thang 2`. Gộp «Đường 5» với «Đường số
5» là nghĩa sản phẩm (hai cách viết có chắc là một đường không) — để sau, khi có dữ liệu thật; lỗi theo chiều ấy là một
nhà ra hai khoá, không bao giờ hai nhà ra một khoá.

## Không đổi khoá cũ

Hàng 75 đã ký trên 86 cách viết của bộ thử hàng 73 (tên đường «Đường Mẫu 1…6»). Ảnh khoá trước khi vá được chụp bằng chính
`docDiaChi` ở commit `01f7cc3a` (trước mọi thay đổi mã của vòng) vào `packages/core/src/address/anh-truoc-va.json` — mỗi
cách viết một dòng: số nhà, tên đường, tên đường chuẩn hoá, khoá, trạng thái. Bộ kiểm của vòng đòi mã sau vá ra ĐÚNG ảnh ấy;
bộ kiểm AC-1…AC-7 của hàng 75 chạy trong cùng lượt và không sửa dòng nào.

Lệnh chụp (chạy một lần, trước commit sửa mã): một tệp tạm gọi `docDiaChi` và `tenDuongChuan` của cây hiện tại trên từng
`chu` của `dap-an-thap-tang.json`, ghi `sha` của cây vào tệp ảnh. Tệp ảnh là vật sinh từ bộ đọc thật, không viết tay.

## Đối chiếu ngành

RESO Data Dictionary tách `StreetNumber` khỏi `StreetName`; «số» trong «Đường số 5» thuộc `StreetName` (tên riêng của
đường), giống «Street 5» hay «5th Street» ở dữ liệu Mỹ — bộ chuẩn hoá địa chỉ USPS (Publication 28) giữ số thứ tự của đường
trong tên đường và chuẩn hoá cách viết («Fifth»/«5th» → «5TH») để cùng một đường ra cùng một khoá. Hàng này làm đúng hai việc
ấy cho dạng Việt Nam. Không thêm trường mới.

## Vùng và việc không làm

Chỉ `packages/core/src/address/**` và `_acceptance/va-duong-so-n/**`. Không bảng, không migration, không màn, không API.

Để sau (ghi ở Out of scope của hợp đồng): «Đường N» ≡ «Đường số N»; «Hẻm số N» và «Ngõ số N» (tên hẻm có chữ «số»); tên đường «Số N» không có tiền
tố đường; «Quốc lộ», «Tỉnh lộ», «Đường tỉnh» kèm số; ba giới hạn đã biết của hàng 75 (gõ liền không dấu phẩy với «Thành»,
chữ tổ hợp).

## Đặc tả UX

Không có — hàng là lõi thuần, không màn (sổ: dòng «bỏ đặc-tả-UX»).
