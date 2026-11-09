# Review findings: logo-onehub (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Eval E9 đòi ảnh chụp nhưng các bước chỉ sinh tệp .txt, nên không thể có bằng chứng hợp lệ**
  Người dùng thấy gì: Hồ sơ nghiệm thu sẽ hiện cờ đỏ hoặc báo thiếu ảnh ở bài so sánh tệp hình với bản gốc, dù các tệp hình thật vẫn đúng. Người dùng cuối không thấy gì khác.
  Căn cứ: Chỉ làm hồ sơ kiểm trông thiếu ảnh, không ảnh hưởng người dùng, không mất dữ liệu; người ký đọc ghi chú là hiểu, sửa sau cũng rẻ.
  file: `_acceptance/logo-onehub/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 — Assert «chuỗi có mặt» trong khi lời hứa là QUAN HỆ: AC-5 «cả hai gọi cùng một thành phần» chỉ đo tên thẻ có trong mã**
  Người dùng thấy gì: Bài kiểm giữ cho hai chỗ hiện logo dùng chung một thành phần còn lỏng, nên sau này ai đó tự vẽ logo riêng ở một chỗ thì có thể lọt. Hôm nay người dùng vẫn thấy logo đúng.
  Căn cứ: Không ảnh hưởng người dùng hiện tại, chỉ là lưới an toàn cho tương lai còn lỏng; lỗi nếu xảy ra chỉ là logo lệch, tự thấy và sửa được.
  file: `apps/web/src/components/dau-hieu-onehub.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — Assertion âm-tính-một-mình: E10 kiểm «không có hình sáu lục giác» trên trạng thái không dựng đầu trang, thiếu đối chứng dương cho «đầu trang vẫn là tên sàn»**
  Người dùng thấy gì: Bài kiểm trang khách mới thử trên một đường dẫn không tồn tại, nên chưa tự chứng minh được đầu trang thật của khách vẫn hiện tên sàn không kèm logo. Khách mở link hợp lệ có thể vẫn thấy đúng.
  Căn cứ: Là khoảng trống bằng chứng chứ chưa thấy lỗi thật; nếu sai thì khách chỉ thấy thêm logo ở đầu trang, nhẹ và dễ chỉnh.
  file: `_acceptance/logo-onehub/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 — Đích hardcode, đo checkout khác thay vì cây đang kiểm: các bài nhìn màn dùng lại bất kỳ máy chủ nào đang giữ cổng 3460**
  Người dùng thấy gì: Ảnh chụp màn hình nghiệm thu có thể vô tình lấy từ một bản khác của ứng dụng đang chạy trên máy, nên bằng chứng có thể không đúng bản đang xét. Lần này đã kiểm và đúng bản.
  Căn cứ: Chỉ ảnh hưởng độ tin cậy hồ sơ trong trường hợp hiếm, không chạm người dùng; lần này đã xác nhận đúng nên chấp nhận và ghi lại.
  file: `_acceptance/logo-onehub/evals.yaml`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

⚠ Cụm ngoài vùng phủ: 3/4 lỗi rơi vào file không bộ đo nào phủ (_acceptance/logo-onehub/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
