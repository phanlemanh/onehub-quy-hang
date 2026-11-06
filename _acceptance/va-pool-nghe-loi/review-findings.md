# Review findings: va-pool-nghe-loi (round 1)

## Trong hợp đồng

Không có finding nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình 4: đối chứng pool trần ở ca kết nối đã mượn chỉ kiểm âm, không ghim thông điệp**
  Người dùng thấy gì: Bài thử chứng minh phép đo phân biệt được lỗi chỉ kiểm rằng tiến trình đối chứng chết, chưa kiểm nó chết đúng vì kết nối bị cắt. Người dùng cuối không bị ảnh hưởng, chỉ là bằng chứng kiểm thử yếu hơn một chút.
  Căn cứ: Hậu quả nhẹ vì không ảnh hưởng người dùng hay dữ liệu, chỉ làm bài thử kém chặt, và có thể siết lại sau với chi phí rẻ.
  file: `_acceptance/va-pool-nghe-loi/thu/cat-ket-noi.test.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình 5: máy quét tìm bốn dạng dựng nhưng chiều đỏ chỉ mồi hai dạng**
  Người dùng thấy gì: Máy quét chặn việc tạo kết nối ngoài chỗ cho phép có thể bỏ sót một cách viết nếu sau này ai đó sửa nó nhầm, và bài thử sẽ không báo. Hiện tại không có kết nối nào nằm ngoài lưới nghe lỗi.
  Căn cứ: Hậu quả chỉ xảy ra nếu có sửa nhầm về sau, hiện không mất dữ liệu hay lỗi cho người dùng, và bổ sung mồi sau này rẻ.
  file: `_acceptance/va-pool-nghe-loi/thu/noi-dung-pool.test.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình 2: lỗi giả viết tay đúng các trường bên đọc dùng, còn bài thử cắt thật không kiểm nội dung dòng nhật ký**
  Người dùng thấy gì: Với một số lỗi thật khi nhà cung cấp cắt kết nối, dòng nhật ký có thể hiện dấu hỏi thay cho mã lỗi, khiến người vận hành khó đọc nguyên nhân hơn. Người dùng trang không thấy khác biệt, máy chủ vẫn không sập.
  Căn cứ: Hậu quả chỉ là dòng nhật ký kém rõ ở một số lỗi, không mất dữ liệu và không ảnh hưởng người dùng, nên ghi lại là đủ.
  file: `apps/web/src/lib/api.test.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
