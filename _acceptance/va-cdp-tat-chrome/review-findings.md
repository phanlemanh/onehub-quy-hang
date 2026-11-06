## Trong hợp đồng

- **Bộ bắt tín hiệu của cdp.mjs đếm sai khi lời gọi dùng process.once, nên cắt ngang việc dọn dẹp riêng của lời gọi (lệch AC-3)**
  AC: AC-3
  file: `_acceptance/bang-hang-kieu-sheet/thu/cdp.mjs:145`
  severity: low
  source: conventions
  detail: caiBat() chỉ để Node tự thoát với mã 128 + số hiệu khi `process.listenerCount(tin) === 1`, tức nó đoán chỉ còn mỗi bộ bắt của mình. Nhưng EventEmitter gỡ bộ bắt `once` ra TRƯỚC khi gọi nó. Nếu lời gọi cài `process.once("SIGTERM", async () => { await donRieng(); process.exit(0) })` trước moChrome(), thì lúc bộ bắt của cdp.mjs chạy, số bộ bắt đã về 1. Kết quả là `process.exit(143)` chạy ngay, cắt ngang việc dọn dẹp bất đồng bộ của lời gọi và đè lên mã thoát lời gọi chọn. AC-3 hứa "có bộ bắt riêng thì bộ bắt riêng vẫn chạy và mã thoát là mã nó chọn". Ca bat-rieng của E3 chỉ thử `process.on` cài SAU moChrome(), nên không bắt được lối này. Hiện chưa chỗ thử nào trong _acceptance cài bộ bắt tín hiệu (đã grep), nên đây chưa phải lỗi đang chạy, chỉ là lỗ hổng so với hợp đồng. Hướng sửa: ghi số bộ bắt khác ngay lúc tín hiệu tới, hoặc chỉ tự thoát khi trước đó không có bộ bắt nào khác.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 4 (âm tính không ghim đúng thông điệp): E7 đỏ được ở mọi ca chỉ nhờ «hồ sơ tạm còn trên đĩa», nên chưa chứng minh phép đo «Chrome mồ côi» phân biệt được bản sửa**
  Người dùng thấy gì: Bộ kiểm tra có thể vẫn báo đạt dù phần phát hiện Chrome chạy ẩn bị hỏng, vì nó đã đỏ nhờ một dấu hiệu khác trên bản cũ. Sản phẩm vẫn tắt Chrome đúng, nhưng độ tin của phép đo thấp hơn lời hứa.
  Căn cứ: Không ảnh hưởng người dùng, chỉ làm bộ kiểm tra kém nhạy hơn; không mất dữ liệu và có thể siết lại sau với chi phí thấp.
  file: `_acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
