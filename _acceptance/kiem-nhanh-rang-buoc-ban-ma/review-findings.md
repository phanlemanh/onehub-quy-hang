# Review findings: kiem-nhanh-rang-buoc-ban-ma (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Tra ràng buộc bản mã chỉ theo tên, không gắn với bảng như migration 013**
  Người dùng thấy gì: Nếu một bảng khác có ràng buộc trùng tên, bước kiểm nhanh trước khi triển khai có thể đọc nhầm trạng thái ràng buộc chặn số điện thoại rõ của chủ nhà. Hiện chưa có bảng nào trùng tên nên chưa ai gặp.
  Căn cứ: Rủi ro chỉ xảy ra khi có bảng trùng tên, hiện không có; nếu xảy ra thì chỉ là báo sai ở bước kiểm trước triển khai, không mất hay lộ dữ liệu, và sửa sau rẻ.
  file: `packages/db/scripts/kiem-nhanh.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 — đối chứng đỏ viết tay theo đúng khuôn bộ lọc, nên câu đọc số không ghi 'public.' lọt qua mà bài vẫn xanh**
  Người dùng thấy gì: Bài kiểm bảo đảm kiểm nhanh không đọc số điện thoại chủ nhà chỉ bắt được cách viết câu truy vấn hiện có. Sau này nếu ai đổi cách viết, bài kiểm có thể vẫn xanh dù câu đã đọc số điện thoại.
  Căn cứ: Hiện không có số điện thoại nào bị đọc ra, nên người dùng chưa chịu hậu quả; chỗ yếu chỉ lộ khi có người sửa mã sau này và vá bài kiểm sau rẻ.
  file: `packages/db/tests/kiem-nhanh.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — chỉ kiểm có mặt tên lỗi, chưa kiểm lỗi gọi đúng tên vai đang kết nối**
  Người dùng thấy gì: Khi kiểm nhanh chạy bằng một vai bị luật theo dòng chặn, nó báo lỗi thay vì đếm sai. Bài kiểm chưa chứng minh tên vai trong thông báo đúng với vai đang kết nối, nên thông báo có thể ghi sai tên mà không ai biết.
  Căn cứ: Việc báo lỗi vẫn chặn đúng, chỉ có thể sai tên vai trong dòng chữ; không mất hay lộ dữ liệu, người vận hành tự tra ra được, và bổ sung kiểm sau rẻ.
  file: `packages/db/tests/kiem-nhanh.test.mjs`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(không có)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
