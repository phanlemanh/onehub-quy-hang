DÒNG ĐẦU: review-findings.md — cai-dat-hop-nhat, round 2

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Đăng xuất bỏ qua lỗi máy chủ: phiên vẫn còn hiệu lực nhưng người dùng vẫn bị đưa về màn đăng nhập**
  Người dùng thấy gì: Nếu máy chủ gặp lỗi lúc đăng xuất, người dùng vẫn thấy mình đã ra màn đăng nhập nhưng tài khoản có thể vẫn còn mở. Trên máy dùng chung, người kế tiếp có thể vào thẳng tài khoản cũ.
  Căn cứ: Hậu quả có thể nặng trên máy dùng chung nhưng chỉ xảy ra khi máy chủ lỗi, vốn hiếm; hành vi này có từ hàng trước chứ không do việc này gây ra, nên ghi lại và xử lý ở một việc riêng.
  file: `apps/web/src/components/shell/dang-xuat-tren-may.ts`
  severity: medium
  Đề xuất: known-limits

- **Báo mất máy thành công nhưng đọc lại danh sách máy hỏng thì vẫn hiện danh sách cũ, không báo gì**
  Người dùng thấy gì: Sau khi báo mất máy, nếu việc tải lại danh sách máy bị lỗi thì màn vẫn hiện danh sách cũ. Người dùng có thể tưởng các máy kia chưa bị đăng xuất.
  Căn cứ: Việc báo mất vẫn thành công thật, chỉ phần hiển thị có thể cũ; người dùng tải lại trang là thấy đúng, và lỗi chỉ xuất hiện khi mạng chập chờn đúng lúc đó.
  file: `apps/web/src/app/(app)/me/toi-that.tsx`
  severity: low
  Đề xuất: known-limits

- **Tuyên quét LỚP nhưng chỉ có điểm-case: ma trận E5 «vai × đường» không đo chiều đường**
  Người dùng thấy gì: Bài kiểm phân quyền mục sàn chưa thật sự thử từng đường vào và thiếu một tổ hợp vai. Nếu sau này có lỗi riêng ở một đường, bài kiểm có thể không bắt được.
  Căn cứ: Người dùng hiện chưa gặp lỗi nào; đây là lỗ hổng trong lưới kiểm nên nên ghi lại, và bổ sung bài kiểm sau khá rẻ.
  file: `apps/web/src/app/(app)/settings/cai-dat.test.ts`
  severity: high
  Đề xuất: known-limits

- **Assert «chuỗi có mặt» trong khi lời hứa là QUAN HỆ: có tham số chi-quan-tri=1 thì có câu báo, không có thì không**
  Người dùng thấy gì: Bài kiểm chưa chứng minh được câu báo «Mục này chỉ quản trị sàn mở được» hiện đúng lúc và ẩn đúng lúc. Nếu có lỗi đọc nhầm điều kiện, người dùng có thể thấy câu báo sai chỗ mà bài kiểm vẫn xanh.
  Căn cứ: Câu báo sai chỉ gây khó hiểu nhẹ, không mất dữ liệu và không lộ quyền; sửa bài kiểm sau là rẻ.
  file: `apps/web/src/app/(app)/settings/cai-dat.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình: bài quét NHAN_NHOM ngoài me/ không có đối chứng dương**
  Người dùng thấy gì: Bài kiểm chống việc chép lại nhãn sáu nhóm ở nhiều nơi có thể không bắt được vi phạm thật. Về sau nhãn có thể lệch nhau giữa các màn mà không ai hay.
  Căn cứ: Hiện chưa có lệch nhãn nào xuất hiện; rủi ro chỉ là chữ không đồng nhất, người dùng không mất gì, sửa bài kiểm rẻ.
  file: `apps/web/src/app/(app)/settings/cai-dat.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình, kèm đo mã nguồn thay vì đầu ra: dòng hồ sơ và máy «không có Trên máy này»**
  Người dùng thấy gì: Bài kiểm chưa chắc bắt được trường hợp dòng hồ sơ hay dòng máy bị ghi nhầm «trên máy này». Nếu có, người dùng sẽ đọc nhầm phạm vi của cài đặt đó.
  Căn cứ: Chỉ là chữ ghi phạm vi sai, người dùng không mất dữ liệu; mô tả phạm vi vẫn đo được ở bước nghiệm thu trên màn thật.
  file: `apps/web/src/app/(app)/settings/cai-dat.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình: đối chứng đỏ E7 chạy trên bản chép lại logic, không trên bài thật**
  Người dùng thấy gì: Bài kiểm bề rộng khối đọc có thể không báo đỏ nếu sau này có người thêm căn giữa nhầm vào kiểu đọc. Người dùng khi đó sẽ thấy nội dung lệch bố cục.
  Căn cứ: Hậu quả chỉ là thẩm mỹ, người dùng tải lại không mất gì, và bề rộng vẫn được đo riêng trên màn thật nên sửa thêm ít giá trị.
  file: `apps/web/src/components/bo-cuc/bo-cuc.test.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
