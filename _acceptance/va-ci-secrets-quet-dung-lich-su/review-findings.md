# Review findings: va-ci-secrets-quet-dung-lich-su

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Chú thích lệnh kiểm trong config ghi sai số ca: «mười ca», trong khi ma trận có mười một ca**
  Người dùng thấy gì: Một dòng ghi chú trong cấu hình nghiệm thu đếm thiếu một ca thử. Người dùng cuối không thấy gì; chỉ người bảo trì có thể hiểu nhầm phạm vi bộ kiểm.
  Căn cứ: Hậu quả rất nhẹ, không mất hay lộ dữ liệu, không đổi kết quả kiểm; sửa lúc nào cũng rẻ nên ghi lại rồi sửa khi tiện.
  file: `_acceptance/config.yaml`
  severity: low
  Đề xuất: known-limits

- **Hàm dat() trả giá trị truthy khi HỎNG, nên các lệnh dừng sớm của bộ đo không bao giờ chạy**
  Người dùng thấy gì: Khi máy chấm thiếu công cụ quét đúng bản, bộ đo vẫn chạy tiếp và in nhiều dòng lỗi gây rối, thay vì dừng với một lỗi gốc. Kết quả cuối vẫn báo hỏng, nên không có chuyện lọt lỗi.
  Căn cứ: Chỉ gây nhiễu và tốn thời gian chạy khi môi trường sai, không bao giờ báo đạt nhầm; người chạy tự thấy và thử lại được.
  file: `_acceptance/va-ci-secrets-quet-dung-lich-su/thu/kiem-secrets.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 — Tuyên quét LỚP nhưng chỉ có điểm-case: vế V5 «không cờ nuốt lỗi» chỉ bắt đúng hai cách viết**
  Người dùng thấy gì: Rào kiểm xem ai đó có tắt cơ chế báo đỏ khi lộ khoá hay không chỉ nhận ra hai cách viết quen thuộc. Một cách viết khác về lý thuyết có thể lọt ở phần kiểm văn bản, nhưng phần chạy thử thật vẫn báo đỏ.
  Căn cứ: Rủi ro thấp vì có lớp kiểm thứ hai chạy thật chặn lại; thêm cách viết vào bộ kiểm sau này rẻ và không ảnh hưởng người dùng.
  file: `_acceptance/va-ci-secrets-quet-dung-lich-su/thu/kiem-secrets.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 — Đo CHỈ DẪN thay vì ĐẦU RA: lời hứa «hook pre-commit vẫn gọi gitleaks» chỉ được grep trên văn bản hook**
  Người dùng thấy gì: Bước kiểm lúc commit có quét khoá chỉ được xác nhận bằng cách đọc chữ trong tệp, nên nếu dòng quét bị biến thành chú thích thì bộ kiểm này vẫn báo đạt. Bài chạy hook thật ở bộ kiểm khác của kho sẽ bắt trường hợp đó.
  Căn cứ: Không mất dữ liệu và có lưới bắt thứ hai trong CI; chỉ là bằng chứng của hồ sơ này yếu hơn mức lý tưởng, nên ghi lại là đủ.
  file: `_acceptance/va-ci-secrets-quet-dung-lich-su/thu/kiem-secrets.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
