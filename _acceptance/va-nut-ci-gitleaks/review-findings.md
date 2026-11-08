# Review findings: va-nut-ci-gitleaks (round 1)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Thẻ Cổng Phạm vi báo hợp đồng thiếu «Đường đo», nhưng hợp đồng có mục này từ lần commit đầu**
  Người dùng thấy gì: Thẻ người ký đã xem có một cờ cảnh báo sai và một con số ca phá lệch với hợp đồng. Hợp đồng và kết quả kiểm thật không bị ảnh hưởng, chỉ tấm thẻ đã dùng để duyệt hơi sai.
  Căn cứ: Hậu quả nhẹ: chỉ là thẻ đọc lệch, không mất hay lộ dữ liệu, hợp đồng đã ký vẫn đúng; vẽ lại thẻ cũ sau khi đã duyệt không đem lại giá trị đáng kể.
  file: `_acceptance/va-nut-ci-gitleaks/card.html`
  severity: low
  Đề xuất: wont-fix

- **Phép đo --hooks bỏ khỏi PATH cả thư mục chứa gitleaks, kéo theo node, git và jq nếu chúng nằm chung thư mục**
  Người dùng thấy gì: Trên một số máy chấm, bài kiểm có thể báo đỏ oan vì mất luôn các công cụ khác nằm cùng chỗ với gitleaks. Không bao giờ báo xanh giả, và trên máy hiện tại vẫn chạy đúng.
  Căn cứ: Hậu quả nhẹ: chỉ có thể làm kết quả đỏ oan, không bao giờ xanh giả, không mất dữ liệu, và người chạy lại trên máy khác là tự gỡ được.
  file: `_acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5: tuyên quét LỚP «env hiệu lực» (3 nguồn) nhưng ma trận phá thử chỉ có điểm-case cho 2 nguồn**
  Người dùng thấy gì: Nếu sau này có người cho bước trước ghi bí mật vào môi trường chung của luồng nút, bài kiểm hiện tại có thể không bắt được. Hiện luồng thật không làm vậy nên không có rủi ro ngay.
  Căn cứ: Hậu quả hiện chưa xảy ra vì luồng thật sạch; chỉ là lỗ hổng phủ kiểm tra cho thay đổi tương lai, và bổ sung ca thử sau này rẻ, không mất dữ liệu.
  file: `_acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
