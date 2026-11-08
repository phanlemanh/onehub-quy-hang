# Review findings: va-nut-ci-ag-root

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Thẻ duyệt Cổng Phạm vi xếp AC-1 vào mục «Sẽ KHÔNG làm / sẽ chặn»**
  Người dùng thấy gì: Thẻ người ký xem ở bước duyệt phạm vi ghi nhầm việc sửa chính là việc «sẽ không làm». Người ký có thể đã ký dựa trên một thẻ trình lệch, dù nội dung hợp đồng vẫn đúng.
  Căn cứ: Hợp đồng và phần sửa không bị ảnh hưởng, chỉ thẻ đọc sai; ghi lại để lần duyệt sau soi kỹ hơn là đủ, không mất dữ liệu và sửa lại thẻ thì rẻ.
  file: `_acceptance/va-nut-ci-ag-root/card.html`
  severity: medium
  Đề xuất: known-limits

- **Thẻ báo hợp đồng thiếu «Đường đo», trong khi hợp đồng đã có mục này**
  Người dùng thấy gì: Người ký thấy một cảnh báo nói thiếu mục đo lường, trong khi mục này đã có. Chỉ gây hoang mang chứ không làm sai kết quả.
  Căn cứ: Hậu quả nhẹ, chỉ là một dòng cảnh báo thừa, không mất hay lộ dữ liệu; chi phí lần theo nguồn lỗi dựng thẻ vượt xa lợi ích.
  file: `_acceptance/va-nut-ci-ag-root/card.html`
  severity: low
  Đề xuất: wont-fix

- **Ca phá thử thứ tư gọi .replace trên null khi luồng lệch, nên không tới được nhánh báo «lệch luồng»**
  Người dùng thấy gì: Khi luồng bị sửa lệch, phép kiểm vẫn báo đỏ nhưng chỉ in ra một đoạn lỗi khó đọc thay vì câu giải thích rõ ràng.
  Căn cứ: Lỗi vẫn bị bắt nên không có gì lọt qua; người xem chỉ mất thêm chút công đọc thông báo, và sửa chỉ để câu chữ đẹp hơn.
  file: `_acceptance/va-nut-ci-ag-root/thu/kiem-ag-root.mjs`
  severity: low
  Đề xuất: wont-fix

⚠ Cụm ngoài vùng phủ: 2/3 lỗi rơi vào file không bộ đo nào phủ (_acceptance/va-nut-ci-ag-root/card.html) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
