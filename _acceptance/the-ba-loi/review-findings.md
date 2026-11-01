# Review findings: the-ba-loi

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Phát hiện «ô chưa có khuôn» so thẳng với đầu nhánh chính, không so với điểm rẽ nhánh, nên có thể báo nhầm**
  Người dùng thấy gì: Khi nhánh chính đã đổi khối đích của một màn sau lúc vòng rẽ ra, bài chấm có thể báo nhầm vòng chạm ô chưa có khuôn và bắt làm trang ba lối dù vòng không đụng tới.
  Căn cứ: Chỉ báo đỏ nhầm trong lúc nhánh chính đi trước, người dùng tự gỡ được bằng cách gộp nhánh chính vào nhánh việc rồi chấm lại, không mất dữ liệu.
  file: `packages/ui-lint/lib/ba-loi.mjs`
  severity: medium
  Đề xuất: known-limits

- **Thư viện lib/ba-loi.mjs nhập ngược từ script kiem-chuan.mjs, tạo vòng import**
  Người dùng thấy gì: Người dùng không thấy gì khác lúc này; chỉ khi sau này sửa mã theo cách nhất định thì bộ kiểm có thể hỏng bất ngờ lúc khởi động.
  Căn cứ: Hiện không ảnh hưởng người dùng nào và nếu hỏng thì lộ ra ngay khi chạy, nên chi phí sửa sớm lớn hơn hậu quả.
  file: `packages/ui-lint/lib/ba-loi.mjs`
  severity: low
  Đề xuất: wont-fix

- **--kiem-ba-loi --den <ref> đọc design-pass.md và trang ba lối từ cây làm việc, không phải từ <ref>**
  Người dùng thấy gì: Khi chấm một bản cũ bằng tuỳ chọn chỉ định điểm đến, kết quả có thể xanh hoặc đỏ sai vì phần hồ sơ và trang lấy từ thư mục đang mở chứ không từ bản đó.
  Căn cứ: Đường chấm chính không dùng tuỳ chọn này nên ít người gặp, và người chấm có thể tự tránh bằng cách mở đúng bản cần chấm trước khi chạy.
  file: `packages/ui-lint/lib/ba-loi.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình 3: assert chuỗi có mặt thay vì quan hệ «cột khuyên = khuyen.loi», chỉ đo một điểm**
  Người dùng thấy gì: Nếu sau này trang ba lối đánh dấu nhầm cột được khuyên khi lời khuyên không phải ReUI, bộ kiểm hiện tại có thể không bắt được.
  Căn cứ: Trang dựng hiện đúng với ca đã kiểm và người ký xem trang bằng mắt trước khi duyệt, nên rủi ro thấp; thêm một ca thử sau này rẻ.
  file: `packages/ui-lint/tests/ba-loi.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình 2: fixture vật thử chép tay chữ của trang tay, không rút từ trang thật**
  Người dùng thấy gì: Chữ dùng để thử hai trang cũ là bản chép tay, nên nếu chép lệch khỏi trang đã ký thì bài thử vẫn xanh mà không ai biết.
  Căn cứ: Ảnh đã lấy từ hồ sơ thật và hai trang gốc đã được ký, nên lệch chữ chỉ làm bài thử kém chặt chứ không làm hỏng trang của ai.
  file: `packages/ui-lint/tests/ba-loi.test.mjs`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
