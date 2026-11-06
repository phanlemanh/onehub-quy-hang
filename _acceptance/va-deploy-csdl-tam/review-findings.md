# Review findings: va-deploy-csdl-tam (round 1)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **evals.yaml không parse được: E6 có thêm một dấu nháy kép ở cuối chuỗi expected**
  Người dùng thấy gì: Tệp mô tả các phép thử nghiệm thu của việc này bị hỏng cú pháp nên công cụ chấm không đọc được. Bản thân bước triển khai và bước kiểm nhanh vẫn chạy bình thường, nhưng hồ sơ nghiệm thu chưa thể được chấm.
  Căn cứ: Hậu quả ở mức hồ sơ chứ không chạm dữ liệu hay người dùng cuối, người dùng không tự gỡ được nhưng sửa rất rẻ và nên làm thành một việc riêng ngay.
  file: `_acceptance/va-deploy-csdl-tam/evals.yaml`
  severity: high
  Đề xuất: new-contract

- **evals.yaml không parse được: E6 expected thừa một dấu ngoặc kép ở cuối**
  Người dùng thấy gì: Tệp mô tả các phép thử nghiệm thu bị thừa một dấu nên không đọc được, khiến cổng nghiệm thu không nạp được phép thử nào. Việc triển khai thật không bị ảnh hưởng, nhưng hồ sơ không qua cổng được.
  Căn cứ: Không mất hay lộ dữ liệu, chỉ chặn việc chấm hồ sơ; sửa rất rẻ và nên gộp xử lý cùng t1 trong một việc riêng.
  file: `_acceptance/va-deploy-csdl-tam/evals.yaml`
  severity: high
  Đề xuất: new-contract

## Chưa adversarial-verify (refuter chết)

⚠ Cụm ngoài vùng phủ: 2/2 lỗi rơi vào file không bộ đo nào phủ (_acceptance/va-deploy-csdl-tam/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
