# Review findings: va-thuoc-ci-ho-so-moi-truong-that (round 3)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Ghi chép ghim lại lần 2 của bat-rang-buoc-ban-ma còn ghi E4 thay bởi kiem-nhanh-rang-buoc-ban-ma#AC-1, trong khi evals.yaml đã đổi con trỏ sang va-deploy-csdl-tam#AC-3**
  Người dùng thấy gì: Báo cáo của hồ sơ đã ký vẫn ghi tiêu chí thay thế cũ, trong khi cấu hình đã trỏ sang tiêu chí mới. Người đọc hồ sơ có thể hiểu sai tiêu chí nào đang đo thay, dù kết quả kiểm vẫn xanh.
  Căn cứ: Chỉ là ghi chép lệch trong hồ sơ, không mất dữ liệu và không ảnh hưởng người dùng cuối; ghim lại hoặc thêm một dòng ghi chú sau này là rẻ.
  file: `_acceptance/bat-rang-buoc-ban-ma/evidence-report.md`
  severity: medium
  Đề xuất: known-limits

- **Re-pin lần 2 của bat-rang-buoc-ban-ma ghi con trỏ thay cũ (kiem-nhanh-rang-buoc-ban-ma#AC-1), lệch với evals.yaml hiện tại (va-deploy-csdl-tam#AC-3)**
  Người dùng thấy gì: Hồ sơ đã ký tả một lần thay thế khác với lần thay thật, nên người duyệt sau này có thể theo con trỏ cũ đã hỏng. Công cụ kiểm không bắt được chỗ lệch này.
  Căn cứ: Hậu quả nhẹ, chỉ gây nhầm khi đọc hồ sơ, không mất dữ liệu; có thể sửa sau bằng một lần ghim lại.
  file: `_acceptance/bat-rang-buoc-ban-ma/evidence-report.md`
  severity: medium
  Đề xuất: known-limits

- **Thẻ đã duyệt (card.html, card-plain.json) tả phạm vi và đánh số AC khác hẳn hợp đồng hiện hành**
  Người dùng thấy gì: Thẻ người ký đọc còn mô tả phạm vi rộng hơn và con trỏ cũ, nên người duyệt có thể ký dựa trên một bức tranh không còn đúng.
  Căn cứ: Hợp đồng thật đã được chủ kho ký nên không có hành vi sai ra ngoài; chỉ là thẻ cũ, vẽ lại thẻ là việc rẻ.
  file: `_acceptance/va-thuoc-ci-ho-so-moi-truong-that/card-plain.json`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (assert «có mặt» thay vì QUAN HỆ): con trỏ thay thế ghi ở báo cáo đã ghim lệch với con trỏ trong evals.yaml, và E1 không bắt**
  Người dùng thấy gì: Phép kiểm tự động chỉ xác nhận có con trỏ thay thế, không xác nhận nó trùng với con trỏ lần ghim đã chứng, nên lệch kiểu này vẫn lọt và hồ sơ vẫn xanh.
  Căn cứ: Là khoảng hở của công cụ kiểm hồ sơ, không chạm người dùng cuối hay dữ liệu; lấp nó là một việc riêng, không gấp.
  file: `_acceptance/bat-rang-buoc-ban-ma/evidence-report.md`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP nhưng chỉ có điểm-case): chú thích hứa lưới trước gộp cho bốn hồ sơ, vòng lặp chỉ chạy hai**
  Người dùng thấy gì: Một dòng chú thích trong công cụ thử nói rộng hơn phần nó thật sự kiểm. Không ảnh hưởng người dùng, chỉ có thể làm người đọc tưởng kiểm nhiều hồ sơ hơn.
  Căn cứ: Hậu quả gần như không có và phép đo thật khớp hợp đồng; chi phí sửa còn lớn hơn lợi ích.
  file: `_acceptance/va-thuoc-ci-ho-so-moi-truong-that/thu/kiem-thay.mjs`
  severity: low
  Đề xuất: wont-fix

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
