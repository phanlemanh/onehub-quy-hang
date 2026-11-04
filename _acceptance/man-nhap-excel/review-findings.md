# Review findings: man-nhap-excel (round 3)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Chú thích của writeBatch bị tách khỏi hàm: dauChuCuaSan chen vào giữa**
  Người dùng thấy gì: Người dùng không thấy gì khác đi; chỉ là một dòng chú thích nằm sai chỗ, người đọc mã có thể hiểu nhầm.
  Căn cứ: Không ảnh hưởng người dùng hay dữ liệu, sửa lúc nào cũng được nên không đáng mở việc riêng.
  file: `packages/api/src/imports/store.ts:142`
  severity: low
  Đề xuất: wont-fix

- **Route đọc thẳng bảng identity."user" thay vì đi qua hàm dùng chung ở auth/accounts.ts**
  Người dùng thấy gì: Với người được mời mà chưa đổi tên, danh sách Đầu chủ có thể hiện địa chỉ email ở chỗ ghi tên.
  Căn cứ: Chỉ là hiển thị hơi xấu cho một số tài khoản, không lộ dữ liệu ngoài công ty và không mất dữ liệu.
  file: `packages/api/src/imports/routes.ts:130`
  severity: low
  Đề xuất: known-limits

- **Clicking the step bar skips the lock that Back respects while the server is previewing or writing**
  Người dùng thấy gì: Trong lúc máy đang xem thử hoặc đang ghi, người dùng bấm quay lại một bước trước rồi sửa ô thì phần còn lại vẫn được ghi theo bản cũ, màn hình mất thanh tiến độ.
  Căn cứ: Có thể ghi vào hàng những dòng người dùng tưởng đã sửa hoặc bỏ, tuy chỉ xảy ra khi cố tình bấm giữa lúc ghi; sửa rẻ nhưng nên được xét như một việc riêng.
  file: `apps/web/src/app/(app)/imports/new/man-nhap.tsx:175`
  severity: medium
  Đề xuất: new-contract

- **Failure to load the listing agent list is swallowed: a team lead is stuck at step 1 with no message**
  Người dùng thấy gì: Nếu danh sách Đầu chủ không tải được, Trưởng nhóm kẹt ở bước đầu, nút Tiếp tắt mà không có lời giải thích hay nút thử lại.
  Căn cứ: Người dùng tự gỡ được bằng cách tải lại trang, không mất dữ liệu, và lỗi này hiếm gặp.
  file: `apps/web/src/app/(app)/imports/new/man-nhap.tsx:70`
  severity: medium
  Đề xuất: known-limits

- **An exception after a successful response leaves the spinner stuck and the write button locked for good**
  Người dùng thấy gì: Nếu máy chủ trả về dữ liệu lạ, màn có thể hiện mãi dòng đang hỏi máy chủ hoặc nút ghi bị khoá cho đến khi tải lại trang.
  Căn cứ: Hiếm xảy ra, tải lại trang là gỡ được và gửi lại không nhân đôi hàng nên không mất hay hỏng dữ liệu.
  file: `apps/web/src/lib/nhap/goi-api.ts:45`
  severity: low
  Đề xuất: known-limits

- **An outdated preview error still gets shown and hides the newer preview**
  Người dùng thấy gì: Khi bản xem thử cũ báo lỗi muộn, thông báo lỗi đó có thể che mất bản xem thử mới hợp lệ.
  Căn cứ: Chỉ gây nhầm lẫn tạm thời, người dùng bấm xem thử lại là được, không mất dữ liệu.
  file: `apps/web/src/app/(app)/imports/new/man-nhap.tsx:113`
  severity: low
  Đề xuất: known-limits

- **`laLoi` misses error bodies whose `error` is not a string, so they are treated as success**
  Người dùng thấy gì: Nếu máy chủ từ chối một gói vì dữ liệu sai khuôn, màn có thể coi như gói đã ghi xong và báo hoàn tất dù chưa ghi gì.
  Căn cứ: Có thể báo xong sai khiến người dùng tưởng đã nhập đủ, nhưng chỉ xảy ra khi gói gửi sai khuôn mà màn bình thường không tạo ra; sửa rẻ.
  file: `apps/web/src/lib/nhap/goi-api.ts:43`
  severity: low
  Đề xuất: new-contract

- **If the catalog fails to load, the screen silently runs without it, and the client-computed building/unit list can differ from the server's**
  Người dùng thấy gì: Khi không tải được danh mục toà nhà, màn vẫn chạy không báo gì và số liệu xem trước có thể lệch so với kết quả máy chủ.
  Căn cứ: Chỉ xảy ra khi mạng hay danh mục lỗi, bản ghi cuối vẫn do máy chủ quyết định nên không ghi sai dữ liệu; người dùng tải lại được.
  file: `apps/web/src/app/(app)/imports/new/man-nhap.tsx:68`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — assertion âm-tính-một-mình: ca «bỏ dòng gửi skip» không chứng dòng 3 có mặt trong gói**
  Người dùng thấy gì: Bài kiểm tự động cho việc bỏ dòng có thể vẫn xanh dù dòng bỏ không được gửi đúng, nên có thể lọt lỗi mà không ai biết.
  Căn cứ: Người dùng chưa gặp lỗi gì, chỉ là lưới an toàn mỏng hơn; thêm một dòng kiểm rất rẻ khi tiện.
  file: `apps/web/src/lib/nhap/trang-thai.test.ts:57`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
