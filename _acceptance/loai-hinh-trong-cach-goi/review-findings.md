# Review findings: loai-hinh-trong-cach-goi (round 2)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình 3 (assert chuỗi có mặt trong khi lời hứa là quan hệ): đầu cột chỉ đo includes(tên loại hình), không đo đúng chuỗi Khu · toà · loại hình**
  Người dùng thấy gì: Đầu cột trong hồ sơ căn vẫn hiện đúng tên riêng của loại hình. Nhưng bài kiểm tự động chưa bắt được nếu phần tên khu trong đầu cột sai hay lặp, nên lỗi kiểu đó sau này có thể lọt qua.
  Căn cứ: Người dùng không thấy hậu quả nào hôm nay, chỉ là lưới kiểm lỏng hơn; không mất dữ liệu và làm chặt bài kiểm sau này rẻ, nên ghi lại là đủ.
  file: `apps/web/src/app/(app)/units/ho-so/loai-hinh-cach-goi.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 5 (tuyên quét lớp nhưng chỉ có điểm-case): bảng trùng tiêu đề có 6 dòng trên lớp 16 tiêu đề, không có ma trận toàn phần và không ghim số phần tử**
  Người dùng thấy gì: Bài kiểm chỉ thử một số tiêu đề của hồ sơ căn chứ không thử hết. Nếu sau này thêm dòng thuộc tính mới, có thể không ai nhắc cần thêm ca kiểm cho nó.
  Căn cứ: Hiện tại màn hình đúng và người dùng không bị ảnh hưởng; rủi ro chỉ nằm ở việc thêm trường mới sau này, có thể bổ sung lúc đó mà không mất gì.
  file: `apps/web/src/app/(app)/units/ho-so/loai-hinh-cach-goi.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình 3 (assert chuỗi có mặt trong khi lời hứa là quan hệ): phép đo cột cạnh bảng chỉ khớp tên biến tuVung, không đo giá trị đó đọc từ docTuVung**
  Người dùng thấy gì: Hồ sơ cạnh Bảng hàng hiện đúng tên riêng hôm nay. Nhưng bài kiểm tự động chưa bắt được trường hợp ai đó đổi nguồn tên mà vẫn giữ tên biến, nên lỗi kiểu đó chỉ được phát hiện khi kiểm tay trên màn.
  Căn cứ: Không ảnh hưởng người dùng hiện tại và lỗi nếu xảy ra sẽ hiện ra ngay trên màn, tải lại là thấy; cùng lỗ hổng đã được ghi sổ ở vòng trước nên cứ ghi nhận.
  file: `apps/web/src/app/(app)/units/ho-so/loai-hinh-cach-goi.test.ts`
  severity: low
  Đề xuất: known-limits

- **Tên riêng của sàn lọt vào lời «Báo sai thông tin căn» gửi ra ngoài công ty, đi vòng cửa tuVungRaNgoai (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi nhân viên bấm báo sai thông tin một căn, lời báo có thể mang tên riêng của sàn (ví dụ «Liền kề») thay vì tên chuẩn. Người bên nhận sửa danh mục có thể không hiểu tên đó.
  Căn cứ: Nhẹ: người vẫn là người bấm gửi, lời báo không chứa số điện thoại hay thông tin chủ nhà, và chỉ lộ chữ gọi loại hình; nhưng sửa cần đổi cách dựng lời báo nên không rẻ.
  file: `apps/web/src/app/(app)/units/ho-so/ho-so.ts`
  severity: medium
  Đề xuất: known-limits

- **Lời «Báo sai thông tin căn» chở tên riêng loại hình của sàn thay cho tên chuẩn (r1 · tệp đã đổi)**
  Người dùng thấy gì: Lời báo sai thông tin căn có thể ghi tên riêng loại hình của sàn thay cho tên chuẩn, nên bên nhận khó đối chiếu.
  Căn cứ: Nhẹ: chỉ lộ một chữ gọi loại hình, người dùng tự bấm gửi và có thể sửa lời báo trước khi gửi.
  file: `apps/web/src/app/(app)/units/ho-so/ho-so.ts`
  severity: low
  Đề xuất: known-limits

- **Hình 3 (assert chuỗi có mặt trong khi lời hứa là quan hệ): bộ quét E6 chỉ tìm chữ docTuVung( trong tệp, không đo TuVungProvider nhận giá trị đó (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bộ kiểm tự động có thể bỏ sót trường hợp một trang mở hồ sơ nhận nhầm bộ tên mặc định, khiến sàn thấy tên mặc định thay vì tên riêng mà không ai báo lỗi.
  Căn cứ: Không ảnh hưởng người dùng hiện tại vì màn đang chạy đúng; chỉ là lưới an toàn cho thay đổi sau còn thưa, và có thể siết sau với chi phí thấp.
  file: `apps/web/src/app/(app)/units/ho-so/loai-hinh-cach-goi.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 (assertion âm tính không ghim thông điệp): chiều đỏ của coTuVung đỏ nhờ mệnh đề docTuVung, không chứng minh trongBoc (r1)**
  Người dùng thấy gì: Một ca kiểm tự động của Bảng hàng có thể vẫn xanh dù luật bắt buộc bảng nằm trong khung tên riêng bị hỏng. Người dùng không gặp lỗi ngay.
  Căn cứ: Không có hậu quả trực tiếp cho người dùng; chỉ làm lưới kiểm cho thay đổi tương lai kém chắc, sửa sau rẻ.
  file: `apps/web/src/app/(app)/inventory/tu-vung.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 (assert chuỗi có mặt trong khi lời hứa là quan hệ): lựa chọn ô lọc chỉ đo nhãn, không đo nhãn «Liền kề» gắn với giá trị Townhouse (r1)**
  Người dùng thấy gì: Bộ kiểm tự động chưa chứng minh chọn tên riêng trong ô lọc ra đúng các căn. Nếu sau này hỏng, người dùng có thể lọc ra 0 căn mà kiểm tự động không báo.
  Căn cứ: Hiện chưa có bằng chứng lọc sai và người dùng tự thử lại được; sửa chỉ là bổ sung ca kiểm, rẻ và làm sau được.
  file: `apps/web/src/app/(app)/inventory/loai-hinh-cach-goi.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 5 (tuyên quét lớp nhưng phép quét không phủ cả lớp): «thêm chỗ thứ năm thì đỏ» chỉ bắt <CotHoSo có dấu cách trên cùng dòng, và chiều đỏ là mệnh đề hằng đúng (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu có người thêm chỗ mở hồ sơ thứ năm viết xuống dòng, bộ kiểm tự động có thể không phát hiện và chỗ đó có thể hiện tên mặc định thay vì tên riêng của sàn.
  Căn cứ: Chỉ xảy ra khi có thay đổi sau này; người dùng hiện tại không bị ảnh hưởng và sửa là siết lại phép đếm, rẻ.
  file: `apps/web/src/app/(app)/units/ho-so/loai-hinh-cach-goi.test.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
