# Review findings: va-cai-dat-mat-viec (round 2)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Năm ảnh của E10 không mang tiền tố E10, trang bằng chứng ở Cổng 2 không tự nhận**
  Người dùng thấy gì: Người ký ở Cổng 2 có thể không thấy đủ chuỗi năm ảnh chụp màn hình trên trang bằng chứng, chỉ thấy ảnh được khai riêng. Màn hình thật của người dùng không bị ảnh hưởng.
  Căn cứ: Chỉ ảnh hưởng người ký khi xem hồ sơ, không ảnh hưởng người dùng cuối; ảnh vẫn nằm trong thư mục và đổi tên sau rất rẻ.
  file: `_acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs`
  severity: medium
  Đề xuất: known-limits

- **E10-network.txt ghi sai công cụ chạy: kho không dùng Playwright**
  Người dùng thấy gì: Một dòng ghi chú trong hồ sơ nghiệm thu nêu sai công cụ đã dùng để chụp. Người dùng không thấy và không bị ảnh hưởng gì.
  Căn cứ: Chỉ là chữ ghi chú trong hồ sơ, không làm mất dữ liệu hay sai màn hình, nên tốn công sửa nhiều hơn hậu quả.
  file: `_acceptance/va-cai-dat-mat-viec/evidence/E10-network.txt`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4: assertion âm-tính-một-mình cho «chưa chọn sẵn» ở lần gỡ lại (hoiMoi)**
  Người dùng thấy gì: Bài kiểm tra chưa chứng minh chắc rằng hộp hỏi mới không chọn sẵn lựa chọn nào nếu giao diện đổi sau này. Hiện tại người dùng vẫn thấy hộp hỏi đúng, chưa chọn sẵn.
  Căn cứ: Chưa có lỗi nào xảy ra với người dùng, chỉ là bài kiểm tra có thể bỏ sót nếu giao diện đổi sau này; ghi lại là đủ.
  file: `_acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs`
  severity: low
  Đề xuất: known-limits

- **Bước cuối E10 tắt máy dev chung mà không qua khoá, phá luật chạy lần lượt của lệnh đo (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi hai bên cùng chấm, máy thử có thể bị tắt giữa chừng và vài ca đo báo trượt oan dù màn đúng. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ làm bài chấm báo sai thỉnh thoảng, không đụng dữ liệu hay màn thật, chạy lại là qua.
  file: `_acceptance/va-cai-dat-mat-viec/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **E10 ghi lệnh --dung-man để nguyên dữ liệu, nhưng khối finally dọn hết (r1 · tệp đã đổi)**
  Người dùng thấy gì: Người chấm mở màn thật sau lệnh chụp sẽ thấy dữ liệu thử đã bị dọn, khác với mô tả. Màn của người dùng không đổi.
  Căn cứ: Chỉ gây nhầm lẫn nhỏ cho người chấm, sửa một dòng mô tả là xong, không mất dữ liệu thật.
  file: `_acceptance/va-cai-dat-mat-viec/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **404 ở dòng cuối cùng: câu «Cột này đã bị xoá trước đó» biến mất, hộp bị tháo (r1)**
  Người dùng thấy gì: Khi xoá một cột mẫu nhập mà cột đó là dòng cuối và đã bị người khác xoá trước, người dùng chỉ thấy màn trống chứ không thấy câu giải thích. Hộp xoá cũ còn có thể tự bật lại nếu bảng có dòng lại.
  Căn cứ: Hiếm gặp (đúng dòng cuối, đúng lúc bị xoá trước), không mất dữ liệu, người dùng tải lại là ổn; nhưng gây khó hiểu nên nên có việc sửa riêng.
  file: `apps/web/src/app/(app)/settings/templates/vung-mau-nhap.tsx`
  severity: low
  Đề xuất: new-contract

- **--dung-man vẫn xoá dữ liệu mẫu dù bước E10 ghi «để nguyên dữ liệu» (r1 · tệp đã đổi)**
  Người dùng thấy gì: Sau lệnh chụp màn, dữ liệu thử bị dọn nên người chấm đối chiếu màn thật sẽ thấy khác ảnh. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ ảnh hưởng người chấm, ảnh đã chụp đúng, không mất dữ liệu thật và chạy lại là có dữ liệu thử.
  file: `_acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4: chiều đỏ của E7 không ghim thông điệp, lỗi dừng giữa kịch bản cũng được tính là đỏ (r1)**
  Người dùng thấy gì: Bằng chứng cho thấy bài đo từng đỏ trước khi sửa chưa chỉ rõ đỏ đúng vì lỗi nào. Màn người dùng thấy không đổi.
  Căn cứ: Chỉ làm bằng chứng lịch sử kém sắc nét, không ảnh hưởng người dùng; các phép đo hiện tại vẫn chạy được.
  file: `_acceptance/va-cai-dat-mat-viec/evidence/truoc-sua.log`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
