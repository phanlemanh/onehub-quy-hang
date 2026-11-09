# Review findings: loai-hinh-trong-cach-goi (round 1)

## Trong hợp đồng

- **Lấy loại hình của đầu cột bằng cách so tiêu đề dòng, mà tiêu đề nay do sàn tự đặt và không được chặn trùng**
  file: `apps/web/src/app/(app)/units/ho-so/mo-hinh.ts:211`
  severity: medium
  AC: AC-5
  source: conventions
  detail: `tt.truong.find(([k]) => k === tieuDeLoaiHinh(v.tv))` dùng chữ hiện làm khoá logic, trái nguyên tắc của Cách gọi là tên riêng chỉ là chữ hiện. kiemNhanTruong chỉ kiểm chữ, không chặn tên trường trùng tiêu đề khác. Trong thuocTinh, sáu dòng cố định «Loại căn, Diện tích, Tầng, Hướng, Toà, Khu» đứng trước dòng loại hình. Nếu sàn đặt tên trường là «Loại căn» (tên hợp lý trong ngành) hoặc «Khu», find trúng dòng đầu và dauCot hiện «2PN» hoặc tên khu thay cho loại hình. Hai dòng cùng tiêu đề còn gây trùng React key ở CapGiaTri (than-chung.tsx:18) và ở SelectItem của NutBaoSai; ở NutBaoSai, nút chọn dòng loại hình sẽ lấy nhầm dòng đầu vì nut-bao-sai.tsx:30 cũng tìm theo k. Hướng sửa: thuocTinh trả riêng giá trị loại hình trong kết quả, thay vì dò lại theo tiêu đề; hoặc chặn tên trường trùng tiêu đề cố định ở lõi.

- **Đặt tên trường Loại hình trùng tiêu đề dòng khác làm đầu cột hồ sơ hiện sai giá trị**
  file: `apps/web/src/app/(app)/units/ho-so/mo-hinh.ts:211`
  severity: medium
  AC: AC-5
  source: bugs
  detail: Giá trị loại hình của đầu cột được tìm bằng tiêu đề hiển thị: `tt.truong.find(([k]) => k === tieuDeLoaiHinh(v.tv))`. Trước thay đổi này tiêu đề là hằng «Loại hình», nên không va chạm. Giờ tiêu đề là chữ sàn tự đặt, còn `kiemNhanTruong` chỉ kiểm chữ, không chặn trùng với các tiêu đề cố định của `thuocTinh` (Loại căn, Diện tích, Tầng, Hướng, Toà, Khu). Với căn có toà, dòng loại hình đứng cuối danh sách nên `find` trúng dòng trước đó. Đã chạy thử `thuocTinh` cùng đúng biểu thức `find` này: tên trường «Loại căn» cho loaiHinh = «2PN», tên trường «Khu» cho loaiHinh = «Khu mẫu», thay vì «Căn cao tầng». Hệ quả là `dauCot` hiện sai loại hình mà không báo lỗi, trái AC-5 và AC-6. Cùng va chạm này làm `truong` có hai khoá trùng: trong `nut-bao-sai.tsx` (`SelectItem key={k} value={k}` và `truong.find(([k]) => k === chon)`) dòng loại hình không chọn riêng được, và «Đang hiện» lấy giá trị của dòng đầu. Hướng sửa: lấy giá trị theo định danh hoặc vị trí của dòng (ví dụ `thuocTinh` trả riêng `loaiHinh`), không dò theo chữ hiển thị. Hàng không toà không bị, vì dòng loại hình đứng đầu.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Tên riêng của sàn lọt vào lời «Báo sai thông tin căn» gửi ra ngoài công ty, đi vòng cửa tuVungRaNgoai**
  Người dùng thấy gì: Khi nhân viên bấm báo sai thông tin một căn, lời báo có thể mang tên riêng của sàn (ví dụ «Liền kề») thay vì tên chuẩn. Người bên nhận sửa danh mục có thể không hiểu tên đó.
  Căn cứ: Nhẹ: người vẫn là người bấm gửi, lời báo không chứa số điện thoại hay thông tin chủ nhà, và chỉ lộ chữ gọi loại hình; nhưng sửa cần đổi cách dựng lời báo nên không rẻ.
  file: `apps/web/src/app/(app)/units/ho-so/ho-so.ts`
  severity: medium
  Đề xuất: known-limits

- **Lời «Báo sai thông tin căn» chở tên riêng loại hình của sàn thay cho tên chuẩn**
  Người dùng thấy gì: Lời báo sai thông tin căn có thể ghi tên riêng loại hình của sàn thay cho tên chuẩn, nên bên nhận khó đối chiếu.
  Căn cứ: Nhẹ: chỉ lộ một chữ gọi loại hình, người dùng tự bấm gửi và có thể sửa lời báo trước khi gửi.
  file: `apps/web/src/app/(app)/units/ho-so/ho-so.ts`
  severity: low
  Đề xuất: known-limits

- **Hình 3 (assert chuỗi có mặt trong khi lời hứa là quan hệ): bộ quét E6 chỉ tìm chữ docTuVung( trong tệp, không đo TuVungProvider nhận giá trị đó**
  Người dùng thấy gì: Bộ kiểm tự động có thể bỏ sót trường hợp một trang mở hồ sơ nhận nhầm bộ tên mặc định, khiến sàn thấy tên mặc định thay vì tên riêng mà không ai báo lỗi.
  Căn cứ: Không ảnh hưởng người dùng hiện tại vì màn đang chạy đúng; chỉ là lưới an toàn cho thay đổi sau còn thưa, và có thể siết sau với chi phí thấp.
  file: `apps/web/src/app/(app)/units/ho-so/loai-hinh-cach-goi.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 (assertion âm tính không ghim thông điệp): chiều đỏ của coTuVung đỏ nhờ mệnh đề docTuVung, không chứng minh trongBoc**
  Người dùng thấy gì: Một ca kiểm tự động của Bảng hàng có thể vẫn xanh dù luật bắt buộc bảng nằm trong khung tên riêng bị hỏng. Người dùng không gặp lỗi ngay.
  Căn cứ: Không có hậu quả trực tiếp cho người dùng; chỉ làm lưới kiểm cho thay đổi tương lai kém chắc, sửa sau rẻ.
  file: `apps/web/src/app/(app)/inventory/tu-vung.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 (assert chuỗi có mặt trong khi lời hứa là quan hệ): lựa chọn ô lọc chỉ đo nhãn, không đo nhãn «Liền kề» gắn với giá trị Townhouse**
  Người dùng thấy gì: Bộ kiểm tự động chưa chứng minh chọn tên riêng trong ô lọc ra đúng các căn. Nếu sau này hỏng, người dùng có thể lọc ra 0 căn mà kiểm tự động không báo.
  Căn cứ: Hiện chưa có bằng chứng lọc sai và người dùng tự thử lại được; sửa chỉ là bổ sung ca kiểm, rẻ và làm sau được.
  file: `apps/web/src/app/(app)/inventory/loai-hinh-cach-goi.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 5 (tuyên quét lớp nhưng phép quét không phủ cả lớp): «thêm chỗ thứ năm thì đỏ» chỉ bắt <CotHoSo có dấu cách trên cùng dòng, và chiều đỏ là mệnh đề hằng đúng**
  Người dùng thấy gì: Nếu có người thêm chỗ mở hồ sơ thứ năm viết xuống dòng, bộ kiểm tự động có thể không phát hiện và chỗ đó có thể hiện tên mặc định thay vì tên riêng của sàn.
  Căn cứ: Chỉ xảy ra khi có thay đổi sau này; người dùng hiện tại không bị ảnh hưởng và sửa là siết lại phép đếm, rẻ.
  file: `apps/web/src/app/(app)/units/ho-so/loai-hinh-cach-goi.test.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
