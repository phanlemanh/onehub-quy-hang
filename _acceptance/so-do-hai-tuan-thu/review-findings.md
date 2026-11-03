# Review findings: so-do-hai-tuan-thu (round 2)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **A lead reassigned after the period ends is miscounted as "not yet assigned" (chuaChia) for that period**
  Người dùng thấy gì: Nếu trưởng nhóm giao lại một lead sau khi kỳ đo đã kết thúc, số đo của kỳ đó có thể đếm lead ấy là chưa chia thay vì đã chia. Con số của kỳ cũ vì thế có thể đổi theo ngày xem, và hệ thống không báo lỗi.
  Căn cứ: Chỉ lệch phần tách chưa chia và đã chia của số lead chưa gọi, chỉ xảy ra với lead được giao lại sau kỳ, không mất dữ liệu; sửa đúng cần ghi thêm lịch sử giao lead nên đắt, và đường đọc số đo từ cơ sở dữ liệu vẫn chưa làm.
  file: `packages/core/src/metrics/lead.ts`
  severity: medium
  Đề xuất: known-limits

- **The 'daBo' case does not test the discarded-lead exclusion: it is also a duplicate-unit lead (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu sau này ai đó vô tình bỏ luật loại lead đã bỏ khỏi số đo, bài kiểm hiện tại vẫn báo xanh nên lỗi có thể lọt qua mà không ai biết.
  Căn cứ: Số đo hôm nay vẫn đúng, chỉ là lưới bảo vệ về sau yếu hơn; không mất dữ liệu và bổ sung ca kiểm sau này rất rẻ.
  file: `packages/core/src/metrics/so-do.test.ts`
  severity: medium
  Đề xuất: known-limits

- **E9 reads the real seed loader nap-ban-that.ts, but the eval's paths do not list that file (r1)**
  Người dùng thấy gì: Nếu bộ nạp dữ liệu mẫu đổi, cổng nghiệm thu có thể không nhận ra bằng chứng của ca kiểm này đã cũ.
  Căn cứ: Chỉ ảnh hưởng độ nhạy của cổng kiểm, người dùng cuối không thấy gì; sửa là thêm một dòng bất cứ lúc nào.
  file: `_acceptance/so-do-hai-tuan-thu/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **The test helper copies the owner-confirmation rule by hand instead of calling confirmsWithOwner (r1 · tệp đã đổi)**
  Người dùng thấy gì: Dữ liệu dựng tay trong bài kiểm có thể ghi nhận một lần xác nhận với chủ nhà mà hệ thống thật không bao giờ ghi, nên ca kiểm mới thêm sau này có thể ra ngày xác nhận sai.
  Căn cứ: Hiện không số nào sai và người dùng không bị ảnh hưởng; rủi ro chỉ nằm ở các ca kiểm thêm sau, sửa rẻ.
  file: `packages/core/src/metrics/so-do.test.ts`
  severity: low
  Đề xuất: known-limits

- **lead_to_ready (and lead_to_first_call) disagree with the existing §11 measure app.lead_board_metric for leads that were returned and resubmitted (r1 · tệp đã đổi)**
  Người dùng thấy gì: Một chủ nhà bị trả lại rồi nộp lại có thể bị đếm hai lần, và thời gian đến lúc sẵn sàng bán ngắn hơn con số mà bảng số đo cũ báo, nên hai nơi cho hai con số khác nhau cho cùng một việc.
  Căn cứ: Chỉ lệch số đo trong hai tuần thử với số ít lead nộp lại, không mất dữ liệu và tính lại được; nhưng cần quyết định định nghĩa chung nên đáng làm thành việc riêng.
  file: `packages/core/src/metrics/lead.ts`
  severity: medium
  Đề xuất: new-contract

- **Hình 2 (fixture viết tay đúng khuôn bên đọc): bộ chuyển chép tay hằng của bộ nạp, ca gác chỉ so thứ tự tên lệnh (r1)**
  Người dùng thấy gì: Nếu dữ liệu mẫu của bộ nạp đổi nội dung nhưng giữ thứ tự lệnh, các số ghim của hai tuần thử có thể vẫn báo xanh trong khi đo trên dữ liệu khác bản thật.
  Căn cứ: Không ảnh hưởng người dùng thật hay dữ liệu, chỉ làm lưới kiểm lỏng hơn; bộ nạp ít đổi và sửa sau không đắt.
  file: `packages/core/src/metrics/mau.fixture.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 (assert «có mặt/bằng số» thay cho quan hệ): đối chiếu freshness chỉ so tổng đếm, không so từng hàng (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu số đo đếm nhầm căn này thay căn kia nhưng tổng vẫn khớp, bài kiểm sẽ không phát hiện.
  Căn cứ: Số hiện đúng và các ca ranh 13/14 ngày đã được ghim riêng; chỉ là lưới yếu hơn lời hứa, không ảnh hưởng người dùng.
  file: `packages/core/src/metrics/so-do.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 5 (tuyên quét lớp nhưng chỉ có điểm-case): đối chiếu nhomCuaCan của E7 chỉ chạy cho một sự kiện (r1 · tệp đã đổi)**
  Người dùng thấy gì: Việc kiểm rằng căn nào được đếm là «nên gọi điều chỉnh giá» chỉ làm với một căn, nên khi ngưỡng đổi thì một căn khác có thể lọt mà không bị bắt.
  Căn cứ: Số đo hiện đúng theo các ca đã ghim; chỉ là lưới kiểm hẹp, người dùng không mất gì và mở rộng ca kiểm rẻ.
  file: `packages/core/src/metrics/so-do.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 5 (tuyên quét lớp nhưng chỉ có điểm-case): ca «sự kiện thêm qua khuôn chặt» chỉ kiểm hai sự kiện (r1 · tệp đã đổi)**
  Người dùng thấy gì: Phần lớn sự kiện dựng trong các ca kiểm không được soi xem có đúng khuôn sự kiện thật hay không, nên một ca kiểm có thể chạy trên dữ liệu mà hệ thống thật sẽ từ chối.
  Căn cứ: Chỉ ảnh hưởng độ tin cậy của bài kiểm, không động tới dữ liệu hay người dùng; bộ mẫu chính đã được quét toàn phần.
  file: `packages/core/src/metrics/so-do.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 (assertion âm tính một mình): kiểm khoá SOURCE_KEYS không có đối chứng dương (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm «không lộ thông tin chủ nhà» chưa được chứng minh là sẽ báo đỏ khi thông tin đó thật sự lọt ra, nên có thể yên tâm hơn mức nó đáng được.
  Căn cứ: Hiện đầu vào không chứa thông tin chủ nhà nên không có rò rỉ thật; thêm ca đối chứng sau là việc rẻ nhưng nên làm vì liên quan thông tin nhạy cảm.
  file: `packages/core/src/metrics/so-do.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 2 (fixture viết tay đúng khuôn bên đọc): helper `them` tự viết luật confirmedWithOwner, lệch confirmsWithOwner của lõi (r1 · tệp đã đổi)**
  Người dùng thấy gì: Một ca kiểm dựng tay ghi một lần xác nhận với chủ nhà mà hệ thống thật không bao giờ ghi, có thể làm ngày xác nhận trong ca kiểm đó sai.
  Căn cứ: Không số ghim nào bị ảnh hưởng và người dùng thật không gặp; chỉ là rủi ro cho ca kiểm viết thêm sau này, sửa rẻ.
  file: `packages/core/src/metrics/so-do.test.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
