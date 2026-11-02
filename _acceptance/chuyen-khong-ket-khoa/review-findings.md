## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bài chấm E1 vẫn mô tả ba lần chụp và một phép so cả mảng, nhưng ca kiểm sau lượt sửa đã chụp sáu lần và chỉ so bốn lần**
  Người dùng thấy gì: Lời mô tả trong hồ sơ nghiệm thu về cách bài kiểm chụp khoá đã cũ so với bài kiểm thật. Người đọc hồ sơ có thể thấy chỗ lệch, nhưng bài kiểm vẫn chạy và vẫn bắt lỗi kẹt khoá như đã định.
  Căn cứ: Hậu quả nhẹ: không ảnh hưởng người dùng cuối hay dữ liệu, chỉ làm hồ sơ đọc lệch với bài kiểm. Ghi lại là đủ, và hồ sơ viết lại sau được rẻ.
  file: `_acceptance/chuyen-khong-ket-khoa/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Bằng chứng PASS đã cũ: chấm ở mã 02bd061 với một ca kiểm không còn tồn tại (r2)**
  Người dùng thấy gì: Trang bằng chứng đang trình để ký ghi kết quả của một lượt chấm trên mã cũ, nên người ký có thể ký trên số liệu không còn khớp với bản hiện tại.
  Căn cứ: Không mất dữ liệu và không ảnh hưởng người dùng cuối, chỉ là hồ sơ ký lệch bản; chấm lại là rẻ và làm được bất cứ lúc nào trước khi ký.
  file: `_acceptance/chuyen-khong-ket-khoa/evidence-page.html`
  severity: high
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
