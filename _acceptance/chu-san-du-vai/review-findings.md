# Review findings: chu-san-du-vai (round 2)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Khoá của chỗ thử chỉ che bước dựng: bài nhìn màn xong trước tắt máy dev của bài còn đang chạy**
  Người dùng thấy gì: Khi kiểm nghiệm hai bài nhìn màn cùng lúc, bài xong trước có thể tắt máy thử của bài kia và làm bài đó báo đỏ oan. Người dùng cuối không bị ảnh hưởng, chỉ người chạy nghiệm thu phải chạy lại.
  Căn cứ: Chỉ gây đỏ oan khi kiểm nghiệm, không mất hay lộ dữ liệu của ai, chạy lại là qua.
  file: `_acceptance/chu-san-du-vai/thu/dung-q.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 — Assertion âm-tính-một-mình: «bảng hợp lệ» không có đối chứng cho vế «thiếu một vai kéo theo» mà E1 khai**
  Người dùng thấy gì: Nếu ai đó vô tình bỏ bớt một vai khỏi bảng vai đi kèm, phép kiểm này không báo lỗi. Người mở sàn mới có thể thiếu vài vai mà không ai biết sớm.
  Căn cứ: Chỉ xảy ra khi có người sửa bảng sai, và một ca kiểm khác đã bắt việc mất vai nên rủi ro thấp; vá sau rẻ.
  file: `packages/core/src/access/goi-vai.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 — Assertion âm-tính-một-mình: `vaiLech` rỗng so với kỳ vọng rút từ chính nguồn bên ghi, đối chứng «bảng thiếu vai» không chạy điều E2 khai**
  Người dùng thấy gì: Nếu bảng vai mất một vai, phép kiểm mở sàn vẫn xanh vì so với chính bảng đã co lại. Người mở sàn mới có thể nhận thiếu vai mà kiểm nghiệm không báo.
  Căn cứ: Cần bảng bị sửa sai mới xảy ra, người dùng tự thêm vai lại được, và mất vai còn bị ca khác bắt.
  file: `packages/db/tests/mo-san.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 — Assert «có mặt» trong khi lời hứa là quan hệ: phép đọc nhà của E5b lấy mọi link trong cả trang thay vì cột nhà của người đó**
  Người dùng thấy gì: Phép kiểm màn hình có thể xanh dù người chỉ mang Quản trị sàn thiếu mục Cài đặt ở cột bên trái, vì nó đếm cả đường dẫn nằm trong nội dung trang. Lỗi hiển thị thật có thể lọt qua.
  Căn cứ: Chỉ làm kiểm nghiệm kém nhạy, sản phẩm hiện chạy đúng; vá bộ đo sau không tốn kém và không mất dữ liệu.
  file: `_acceptance/chu-san-du-vai/thu/chay-ui.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình 5 — Tuyên quét lớp nhưng chỉ có điểm-case: «Tham chiếu không còn ‹chưa dựng› cho Quản trị sàn» không quét §9 mà AC-7 nêu**
  Người dùng thấy gì: Nếu sau này tài liệu sản phẩm ở phần quy tắc vẫn ghi việc này là chưa dựng, phép kiểm sẽ không bắt được. Người đọc tài liệu có thể thấy thông tin lỗi thời.
  Căn cứ: Hiện tài liệu đúng, hậu quả chỉ là sót lỗi chữ trong tương lai, tự sửa được và không ảnh hưởng dữ liệu.
  file: `_acceptance/chu-san-du-vai/thu/kiem-tai-lieu.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình 2 — Fixture viết tay đúng khuôn bên đọc: `bam` chép lại logic phát mảng của ChoiceChecks thay vì lấy từ bên ghi thật**
  Người dùng thấy gì: Nếu ô chọn vai đổi cách phát dữ liệu, hai bộ kiểm nhỏ vẫn xanh. Lỗi ở hộp chọn vai chỉ lộ ở bài nhìn màn.
  Căn cứ: Có bài nhìn màn thật làm lưới thứ hai nên lọt lỗi khó xảy ra; sửa fixture là việc nhỏ.
  file: `apps/web/src/app/(app)/settings/users/vai-trong-hop.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình 2 — Fixture viết tay đúng khuôn bên đọc: ca «mở hộp Sửa, không bấm ô nào» dùng đầu vào mà hộp thật không bao giờ phát**
  Người dùng thấy gì: Phép kiểm không thật sự đo việc mở hộp Sửa mà không bấm gì thì vai giữ nguyên. Nếu có lỗi ở đó, kiểm nghiệm có thể không báo.
  Căn cứ: Chỉ là ca kiểm yếu, đã được ghi nhận trước đó, người dùng tự thấy và sửa lại được vai trên màn.
  file: `apps/web/src/app/(app)/settings/users/vai-trong-hop.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
