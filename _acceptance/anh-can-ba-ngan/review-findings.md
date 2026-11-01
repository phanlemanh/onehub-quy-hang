# Review findings: anh-can-ba-ngan (round 2)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Thả ảnh lên tên thẻ «Tự có từ mã» vẫn nhận ảnh vào ngăn đang mở, trái với luật nganChoTha mà test khẳng định**
  Người dùng thấy gì: Nếu thả ảnh lên tên thẻ «Tự có từ mã», ảnh vẫn được nhận vào ngăn đang mở thay vì bị từ chối. Ảnh không mất và không lọt sang ngăn nội bộ ngoài ý muốn nếu đang mở ngăn khác.
  Căn cứ: Hậu quả nhẹ: ảnh vào ngăn người dùng đang xem, không mất dữ liệu, và người dùng chuyển ngăn hoặc xoá lại được ngay.
  file: `apps/web/src/app/(app)/units/photos/muc-anh.tsx`
  severity: low
  Đề xuất: known-limits

- **«Đưa lên đầu» không làm gì khi căn đã có ảnh bìa được chọn**
  Người dùng thấy gì: Khi căn đã có ảnh bìa, bấm «Đưa lên đầu» ở ảnh khác không đưa ảnh đó lên đầu như nhãn nói, và không báo gì. Người dùng vẫn kéo thả hoặc đặt ảnh làm bìa được.
  Căn cứ: Mục menu gây nhầm nhưng không mất dữ liệu, có cách làm khác ngay trên màn hình, nên ghi lại là hạn chế đã biết.
  file: `apps/web/src/app/(app)/units/photos/muc-anh.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 — đo hàm phụ thay vì đầu ra: ca «thẻ Tự có từ mã không nhận ảnh» kiểm một đầu vào mà mục Ảnh không bao giờ truyền**
  Người dùng thấy gì: Bài kiểm tự động báo xanh cho việc thẻ «Tự có từ mã» không nhận ảnh, trong khi màn hình thật vẫn nhận. Người dùng không thấy lỗi trực tiếp, chỉ là bài kiểm này không bắt được hành vi đó.
  Căn cứ: Không ảnh hưởng dữ liệu hay người dùng trực tiếp; chỉ làm bài kiểm kém tin cậy ở một ca ngoài các tiêu chí đã chốt.
  file: `apps/web/src/app/(app)/units/photos/tai-len.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Đường ảnh không khai qua createRoute nên vắng khỏi OpenAPI, kiểm đầu vào tự viết thay vì zod (r1)**
  Người dùng thấy gì: Bên ngoài đọc tài liệu API sẽ không thấy các đường ảnh; chức năng ảnh trên màn vẫn chạy bình thường.
  Căn cứ: Không ảnh hưởng người dùng đầu chủ hiện tại, chỉ bất tiện cho bên tích hợp sau này; bổ sung về sau còn rẻ.
  file: `packages/api/src/photos/routes.ts`
  severity: medium
  Đề xuất: known-limits

- **Tên trong API là tiếng Việt (toa, ma, anh, noiBo «thay»/«an», suaDuoc), trái luật «API tiếng Anh» và RESO-first (r1)**
  Người dùng thấy gì: Người dùng không thấy gì khác; chỉ là tên trường kỹ thuật chưa theo chuẩn chung, sẽ đổi chung với đợt đổi tên API.
  Căn cứ: Không mất dữ liệu và không đổi hành vi nhìn thấy; đã có việc riêng lo đổi tên, nên ghi nhận là đủ.
  file: `packages/api/src/photos/routes.ts`
  severity: medium
  Đề xuất: known-limits

- **Gửi bản gốc tới 10 MB qua hàm Vercel sẽ vượt trần thân yêu cầu 4,5 MB ở bản thật (r1)**
  Người dùng thấy gì: Ở bản chạy thật, ảnh điện thoại nặng khoảng 4,5 đến 10 MB có thể không tải lên được và người dùng chỉ thấy «Không gửi được — thử lại».
  Căn cứ: Hậu quả khá nặng vì ảnh cỡ thường gặp bị hỏng lặp lại dù thử lại; không mất dữ liệu có sẵn, nhưng cách sửa đổi đường tải lên nên làm thành việc riêng.
  file: `packages/api/src/photos/routes.ts`
  severity: medium
  Đề xuất: new-contract

- **Byte ở Storage được ghi và xoá bên trong giao dịch Postgres chưa commit, nên dòng ảnh và byte có thể lệch nhau (r1)**
  Người dùng thấy gì: Hiếm khi lỗi xảy ra đúng lúc, có thể còn sót một ảnh không ai xem được trên kho lưu, hoặc một ảnh còn hiện nhưng mất nội dung.
  Căn cứ: Chỉ xảy ra khi hệ thống lỗi giữa lúc ghi, rất hiếm; người dùng có thể tải lại ảnh, nhưng ảnh sót không lộ ra ngoài vì kho riêng tư.
  file: `packages/api/src/photos/store.ts`
  severity: low
  Đề xuất: known-limits

- **Chuyển hướng 302 tới link ký 60 giây lại được cho phép giữ đệm 300 giây (r1)**
  Người dùng thấy gì: Ở bản chạy thật, mở lại hồ sơ sau hơn một phút có thể thấy ảnh bị vỡ cho tới khi hết thời gian giữ đệm.
  Căn cứ: Ảnh chỉ hiện vỡ tạm thời và tải lại sau vài phút là hết, không lộ hay mất dữ liệu; nhưng dễ gặp ở bản thật nên nên xếp việc sửa riêng.
  file: `packages/api/src/photos/routes.ts`
  severity: medium
  Đề xuất: new-contract

- **Ghi và xoá byte ở S3 nằm ngoài giao dịch: để lại byte mồ côi (kể cả giấy tờ nội bộ) hoặc dòng ảnh mất byte (r1)**
  Người dùng thấy gì: Khi lỗi giữa chừng ở bản thật, có thể còn sót file ảnh sổ trên kho lưu không còn dòng nào trỏ tới, hoặc một ảnh còn hiện mà mất nội dung.
  Căn cứ: Chỉ xảy ra khi lỗi hiếm và kho vẫn riêng tư nên không lộ ra ngoài; nên ghi vào danh sách hạn chế đã biết và dọn về sau.
  file: `packages/api/src/photos/store.ts`
  severity: medium
  Đề xuất: known-limits

- **Lỗi của mọi thao tác sửa hay xoá ảnh bị nuốt, người dùng không thấy báo gì (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi thao tác sửa hoặc xoá ảnh thất bại, người dùng không thấy lời báo nào và ảnh lặng lẽ trở về như cũ nên không biết vì sao.
  Căn cứ: Không mất dữ liệu và bấm lại được, nhưng người dùng dễ bối rối; sửa cần thiết kế thông báo nên làm riêng.
  file: `apps/web/src/app/(app)/units/photos/muc-anh.tsx`
  severity: low
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
