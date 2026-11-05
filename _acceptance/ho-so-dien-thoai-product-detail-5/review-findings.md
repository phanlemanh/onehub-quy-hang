## Trong hợp đồng

- **Assertion âm-tính-một-mình (hình 4): E4 nói tên chủ, số chủ và giá đáy vắng mặt nhưng không có đối chứng dương nào cho ba mồi này**
  file: `apps/web/src/app/(app)/units/ho-so/dien-thoai/ho-so-dien-thoai.test.ts:330`
  severity: medium
  AC: AC-4
  source: measurement
  detail: Dòng 330 khẳng định `assert.deepEqual(moiLo(dungDT(m)), [])` trên MOI = [Nội bộ, lucide-lock, SO_CHU, SO_CHU bỏ cách, TEN_CHU, dinhDangGia(GIA_DAY), Giá đáy, giá đáy]. Đối chứng dương ở dòng 335 chỉ kiểm «Nội bộ» và «lucide-lock» cho người giữ căn. Chiều đỏ ở dòng 340 bật noiBo=true nhưng chỉ lộ ra [Nội bộ, lucide-lock, 0900000092], và chuỗi 0900000092 đến từ mã ảnh `anh-so-0900000092`, không phải từ ownerPhone. Tìm trong than-dien-thoai.tsx, than-chung.tsx, than-cot.tsx và mo-hinh.ts không thấy chỗ nào đọc ownerPhone, ownerName hay floorPrice. Nghĩa là các mồi «0900 000 092», TEN_CHU và giá đáy không bao giờ hiện ra, dù cờ đúng hay sai. Vì vậy phần kiểm «không tên chủ, không giá đáy, không số chủ» của E4 và AC-4 không thể đỏ, và không có ca dương nào chứng minh bộ dò bắt được ba mồi đó.
  rationale: AC-4 đòi không có số, tên chủ, giá đáy cho đầu khách; phép kiểm cho ba thứ này không thể đỏ nên không chứng minh được AC-4.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Trưởng nhóm không có vai đầu chủ được trao nút «Ghi cuộc gọi» dẫn tới trang 404**
  Người dùng thấy gì: Trưởng nhóm không giữ vai đầu chủ mở hồ sơ căn trên điện thoại sẽ thấy nút chính «Ghi cuộc gọi», bấm vào thì ra trang không tồn tại. Họ không mất dữ liệu nhưng nút chính của màn bị hỏng với nhóm người này.
  Căn cứ: Hậu quả nhẹ đến vừa: chỉ gặp ở một vai, không mất hay lộ dữ liệu, người dùng quay lại được; nhưng sửa phải chỉnh quyền ở lõi nên nên làm thành việc riêng.
  file: `apps/web/src/app/(app)/units/ho-so/mo-hinh.ts`
  severity: medium
  Đề xuất: new-contract

- **«Ghi cuộc gọi» dẫn Trưởng nhóm tới trang 404**
  Người dùng thấy gì: Trưởng nhóm mở hồ sơ căn trên điện thoại bấm «Ghi cuộc gọi» sẽ rơi vào trang không tìm thấy. Họ phải tự quay lại và không có cách nào ghi cuộc gọi từ đây.
  Căn cứ: Chỉ ảnh hưởng một vai, không mất hay lộ dữ liệu, người dùng tự quay lại được; sửa liên quan quyền truy cập nên đáng làm thành việc riêng có người duyệt.
  file: `apps/web/src/app/(app)/units/ho-so/mo-hinh.ts`
  severity: medium
  Đề xuất: new-contract

- **Ảnh lớn đầu hồ sơ không cập nhật khi sửa ảnh ở mục Ảnh cùng màn**
  Người dùng thấy gì: Sau khi tải lên, xoá hoặc đổi ngăn ảnh, khung ảnh lớn đầu hồ sơ vẫn hiện trạng thái cũ cho tới khi mở lại hồ sơ. Người dùng có thể tưởng ảnh chưa lên.
  Căn cứ: Hậu quả nhẹ: dữ liệu vẫn đúng và chỉ cần mở lại hồ sơ là thấy ảnh mới, không mất gì.
  file: `apps/web/src/app/(app)/units/ho-so/dien-thoai/anh-lon.tsx`
  severity: low
  Đề xuất: known-limits

- **Đo chỉ dẫn thay vì đầu ra (hình 1): E4 của san-sang dò mã nguồn để kiểm nút Sẵn sàng bán nằm trong mục «Lần rao đang mở», không dựng giao diện ra để kiểm**
  Người dùng thấy gì: Việc nút Sẵn sàng bán nằm đúng mục chỉ được kiểm bằng cách đọc chữ trong mã, chưa dựng màn thật. Nếu sau này bố cục lệch, bài kiểm có thể vẫn báo đạt.
  Căn cứ: Rủi ro nhẹ và gián tiếp: người dùng không bị ảnh hưởng ngay, chỉ giảm độ tin của bài kiểm; nâng cấp sau rẻ.
  file: `apps/web/src/app/(app)/units/ready/san-sang.test.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

