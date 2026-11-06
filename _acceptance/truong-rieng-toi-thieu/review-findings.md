## Trong hợp đồng

(không có finding)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Một lần lưu hỏng ở hồ sơ liên hệ có thể xoá trên màn giá trị trường khác vừa lưu thành công**
  Người dùng thấy gì: Khi đổi nhanh hai trường ở hồ sơ liên hệ mà lần lưu trước bị lỗi, màn hình có thể tạm không hiện giá trị của trường sau, dù hệ thống đã lưu. Tải lại trang là thấy đúng.
  Căn cứ: Hậu quả nhẹ, chỉ xảy ra khi hai lần chọn sát nhau và một lần lỗi, không mất dữ liệu thật và người dùng tự gỡ được bằng cách tải lại trang.
  file: `apps/web/src/app/(app)/contacts/muc-truong-rieng.tsx`
  severity: low
  Đề xuất: known-limits

- **PUT /api/v1/company/fields trả lỗi 500 thay vì 400 khi một phần tử của fields hay options là null hoặc không phải object (r1)**
  Người dùng thấy gì: Nếu một chương trình bên ngoài gửi danh sách trường có phần tử rỗng, nó nhận báo lỗi chung chứ không nhận câu nêu rõ chỗ sai. Dữ liệu không bị ghi và người dùng thao tác trên màn không gặp.
  Căn cứ: Chỉ ảnh hưởng người gọi trực tiếp bằng thân sai bất thường, không mất hay lộ dữ liệu, gửi lại thân đúng là xong.
  file: `packages/core/src/custom-fields/index.ts`
  severity: medium
  Đề xuất: known-limits

- **Lệnh import chen giữa tệp, cướp JSDoc của ghepDanhMuc (r1)**
  Người dùng thấy gì: Không ảnh hưởng gì tới người dùng; chỉ làm chú thích hướng dẫn trong mã bị gắn nhầm chỗ.
  Căn cứ: Không có hậu quả nào với người dùng, chỉ là chuyện gọn gàng của mã và sửa lúc nào cũng được.
  file: `apps/web/src/app/(app)/inventory/ghep-danh-muc.ts`
  severity: low
  Đề xuất: wont-fix

- **Lịch sử căn hiện sự kiện custom_changed thành «Xác nhận với chủ nhà» (r1)**
  Người dùng thấy gì: Mỗi lần đặt hay bỏ giá trị trường riêng, lịch sử căn ghi như thể đã xác nhận với chủ nhà. Người xem lịch sử có thể hiểu sai là căn vừa được xác nhận.
  Căn cứ: Dữ liệu thật vẫn đúng và không lộ, chỉ dòng chữ trong lịch sử gây hiểu nhầm; sửa rẻ nhưng không làm hỏng việc chính.
  file: `apps/web/src/app/(app)/units/ho-so/ho-so.ts`
  severity: medium
  Đề xuất: known-limits

- **Sắp theo cột trường riêng không đẩy ô trống xuống cuối (r1)**
  Người dùng thấy gì: Khi sắp theo cột trường riêng, các căn chưa có giá trị có thể đứng lẫn ở đầu danh sách thay vì xuống cuối.
  Căn cứ: Chỉ lệch thứ tự hiển thị, không mất hay lộ dữ liệu, người dùng đổi chiều sắp là thấy được.
  file: `apps/web/src/app/(app)/inventory/loc.ts`
  severity: low
  Đề xuất: known-limits

- **Đọc bộ trường hỏng thì mục Trường riêng ở hồ sơ liên hệ biến mất, không báo lỗi (r1)**
  Người dùng thấy gì: Khi tải bộ trường bị lỗi mạng, mục Trường riêng ở hồ sơ liên hệ biến mất mà không báo gì, người dùng tưởng sàn chưa có trường nào.
  Căn cứ: Tải lại trang là hiện lại, không mất dữ liệu; chỉ gây bối rối thoáng qua khi mạng lỗi.
  file: `apps/web/src/app/(app)/contacts/truong-rieng.ts`
  severity: low
  Đề xuất: known-limits

- **Hình 5 (tuyên quét lớp nhưng chỉ có điểm-case): ma trận lớp 'đủ 2 đối tượng × tập loại' chỉ có 8 trong 16 tổ hợp (r1)**
  Người dùng thấy gì: Bài kiểm lớp dữ liệu chỉ thử một nửa các tổ hợp loại liên hệ, nên một lỗi ở tổ hợp còn lại có thể lọt qua mà bài kiểm vẫn xanh.
  Căn cứ: Chưa có lỗi thật nào được chỉ ra, chỉ là lưới kiểm thưa; bổ sung sau không ảnh hưởng người dùng hiện tại.
  file: `packages/core/src/custom-fields/ma-tran-lop.json`
  severity: medium
  Đề xuất: known-limits

- **Hình 5 (tuyên quét lớp nhưng chỉ có điểm-case): bảng 'mọi đường đọc liên hệ' viết tay, không nối với phép đếm route (r1)**
  Người dùng thấy gì: Nếu sau này thêm đường đọc liên hệ mới, bài kiểm rò rỉ không tự báo là chưa được kiểm, nên có thể lọt một chỗ lộ thông tin chủ nhà.
  Căn cứ: Hiện chưa có chỗ lộ nào, rủi ro nằm ở thay đổi tương lai và có thể bổ sung khi thêm đường mới.
  file: `packages/api/test-db/truong-rieng/truong.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 (assertion âm tính một mình): từng ô đường × người chỉ kiểm 'không chứa mồi', không kiểm mã trạng thái (r1)**
  Người dùng thấy gì: Bài kiểm xanh có thể do đường đọc trả lỗi hay rỗng chứ không hẳn do dữ liệu được giấu đúng, nên bằng chứng không lộ thông tin yếu hơn vẻ ngoài.
  Căn cứ: Không có lộ dữ liệu thật được chỉ ra; chỉ là bằng chứng kiểm yếu, thêm đối chứng sau là rẻ.
  file: `packages/api/test-db/truong-rieng/truong.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 (assertion âm tính một mình): quét migration chỉ bắt hai mẫu hẹp, hẹp hơn lời hứa 'không select * hay c.*', không có đối chứng dương (r1)**
  Người dùng thấy gì: Phép quét chặn đọc thừa cột liên hệ chỉ bắt vài kiểu viết, nên một hàm mới viết kiểu khác có thể đọc thừa mà không bị báo.
  Căn cứ: Chưa có hàm nào lộ thật được chỉ ra; rủi ro chỉ ở thay đổi sau này và bổ sung mẫu quét không tốn nhiều.
  file: `packages/api/test-db/truong-rieng/truong.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình 1 (đo chỉ dẫn thay vì đầu ra): 'trang chặn người không phải quản trị' kiểm bằng grep mã nguồn `chanMucSan(` (r1)**
  Người dùng thấy gì: Bài kiểm chỉ xác nhận trang có gọi hàm chặn, chưa thử thật bằng người không phải quản trị, nên nếu chặn hỏng thì bài kiểm vẫn xanh.
  Căn cứ: Chưa thấy trang nào mở nhầm, chỉ là cách kiểm gián tiếp; thêm bài kiểm chạy thật sau không ảnh hưởng người dùng.
  file: `apps/web/src/app/(app)/settings/fields/truong-rieng.test.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
