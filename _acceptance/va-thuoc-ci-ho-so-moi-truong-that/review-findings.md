# Review findings: va-thuoc-ci-ho-so-moi-truong-that (round 2)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hợp đồng được viết lại toàn bộ tiêu chí sau khi Cổng 1 đã niêm phong, nhưng vẫn giữ chữ duyệt cũ; thẻ Cổng 1 còn mô tả phạm vi cũ**
  Người dùng thấy gì: Chữ ký duyệt của chủ kho đang đứng tên cho một bộ tiêu chí đã đổi sau khi duyệt, nên người ký có thể chưa từng xem đúng nội dung này.
  Căn cứ: Không mất dữ liệu và không ảnh hưởng người dùng cuối, chỉ là sai lệch hồ sơ duyệt; chủ kho có thể duyệt lại bất cứ lúc nào với chi phí rất thấp.
  file: `_acceptance/va-thuoc-ci-ho-so-moi-truong-that/card-plain.json`
  severity: medium
  Đề xuất: known-limits

- **Con trỏ superseded_by của E4 trỏ sang tiêu chí không đo thứ tự triển khai mà E4 đo**
  Người dùng thấy gì: Bước kiểm thứ tự triển khai (chạy cập nhật cơ sở dữ liệu và kiểm cách ly trước khi gọi bản thật) có thể không còn phép đo nào canh giữ, dù hồ sơ báo là đã có tiêu chí thay thế.
  Căn cứ: Một thay đổi sai thứ tự triển khai có thể lọt qua mà không báo đỏ, nhưng hệ quả chỉ xảy ra khi có người sửa quy trình triển khai, và thứ tự này đã được đo ở một hồ sơ khác; nên xử lý ở một việc riêng.
  file: `_acceptance/bat-rang-buoc-ban-ma/evals.yaml`
  severity: medium
  Đề xuất: new-contract

- **Thẻ Cổng 1 (card.html, card-plain.json) mô tả phạm vi cũ, không khớp hợp đồng đã duyệt**
  Người dùng thấy gì: Thẻ người đã xem lúc duyệt còn tả phạm vi cũ và đánh số tiêu chí khác với hợp đồng hiện tại, dễ gây hiểu nhầm khi đối chiếu sau này.
  Căn cứ: Chỉ gây nhầm lẫn khi đọc hồ sơ, không ảnh hưởng người dùng hay dữ liệu; vẽ lại thẻ rẻ và làm sau được.
  file: `_acceptance/va-thuoc-ci-ho-so-moi-truong-that/card-plain.json`
  severity: medium
  Đề xuất: known-limits

- **kiem-thay --luoi bỏ qua mã thoát của pre-merge-check và mọi VIOLATION không mang tên slug**
  Người dùng thấy gì: Bài thử lưới trước gộp có thể báo đạt trong khi lưới thật đỏ vì một lỗi không gắn tên hồ sơ, nên người duyệt có thể tin nhầm là sạch.
  Căn cứ: Lưới thật của kho vẫn chạy ở bước gộp và sẽ chặn, nên rủi ro thấp; đây chỉ là công cụ thử cục bộ và sửa rẻ khi cần.
  file: `_acceptance/va-thuoc-ci-ho-so-moi-truong-that/thu/kiem-thay.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3: chỉ kiểm chuỗi có mặt, trong khi lời hứa là một quan hệ (tiêu chí AC-1 đo lại eval E4)**
  Người dùng thấy gì: Hệ thống chỉ kiểm con trỏ thay thế có hình thức hợp lệ, chứ không kiểm tiêu chí được trỏ tới có thật sự đo cùng điều đã bỏ.
  Căn cứ: Khoảng trống này chỉ làm lưới yếu đi về lâu dài, không gây mất dữ liệu hay lỗi người dùng ngay; cần một việc riêng nếu muốn kiểm nội dung.
  file: `_acceptance/va-thuoc-ci-ho-so-moi-truong-that/thu/kiem-thay.mjs`
  severity: medium
  Đề xuất: new-contract

## Chưa adversarial-verify (refuter chết)

⚠ Cụm ngoài vùng phủ: 2/5 lỗi rơi vào file không bộ đo nào phủ (_acceptance/va-thuoc-ci-ho-so-moi-truong-that/card-plain.json) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
