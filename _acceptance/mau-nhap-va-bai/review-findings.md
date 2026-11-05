## Trong hợp đồng

- **Hình dạng 3 (assert chuỗi có mặt trong khi lời hứa là quan hệ): E6b quét vị trí chuỗi trong mã nguồn page.tsx thay vì kiểm trang có chuyển hướng trước khi đọc API**
  file: `apps/web/src/app/(app)/settings/templates/mau-nhap.test.ts:56`
  severity: medium
  AC: AC-6
  source: measurement
  detail: Ca «trang chặn vai trước khi đọc API» đọc page.tsx bằng readFileSync rồi chỉ assert `nguon.indexOf("chanMucSan(me.activeCompany.roles)") < nguon.indexOf("/api/v1/company/import-templates")`. Lời hứa là một quan hệ hành vi: kết quả chặn phải dẫn tới redirect trước khi gọi API. Ca này chỉ đo thứ tự hai chuỗi xuất hiện. Nếu xoá dòng `if (chan) redirect(chan);`, hoặc gọi chanMucSan mà bỏ qua kết quả, ca vẫn xanh. Phần đối chứng `chanMucSan([...])` chỉ kiểm hàm thuần, không kiểm việc trang dùng kết quả của nó. AC-6 hứa vai khác mở /settings/templates bị chuyển về Cá nhân; ca kiểm này không chứng minh được lời hứa đó.

- **Hình dạng 3 (assert chuỗi có mặt trong khi lời hứa là quan hệ): E9b so chữ trạng thái với chính hằng CHU của bên viết, không so với bảng trạng thái của thiết kế**
  file: `apps/web/src/app/(app)/settings/templates/mau-nhap.test.ts:15`
  severity: medium
  AC: AC-9
  source: measurement
  detail: Bảng ca dùng `CHU.dangTai`, `CHU.trong`, `CHU.loi`, nhập từ ./mau-nhap, cùng module mà vung-mau-nhap.tsx dùng để dựng. Ca chỉ assert `ve(tt).includes(chu)`. evals.yaml E9b hứa chữ dựng ra phải đúng bảng trạng thái của thiết kế (design.md §3). Nếu đổi giá trị CHU.trong sang câu khác thì cả màn lẫn giá trị mong đợi cùng đổi, nên ca vẫn xanh. Giá trị mong đợi không được viết riêng từ bảng thiết kế nên phép đo tự khớp với chính nó. AC-9 hứa mỗi trạng thái có chữ như bảng trạng thái của thiết kế; ca kiểm tự so với chính hằng chữ nên không chứng minh được.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Xoá cột mẫu nuốt lỗi: hộp xác nhận đóng và bảng làm mới dù máy chủ từ chối hay mạng hỏng**
  Người dùng thấy gì: Nếu việc xoá một cột mẫu thất bại (mất mạng, hết phiên, mất quyền), màn vẫn đóng hộp xác nhận mà không báo gì. Người dùng chỉ thấy cột còn nguyên trong bảng và có thể tự bấm xoá lại.
  Căn cứ: Hậu quả nhẹ: không mất hay lộ dữ liệu, cột còn hiện trong bảng nên người dùng nhận ra và thử lại được; chỉ thiếu lời báo lỗi.
  file: `apps/web/src/app/(app)/settings/templates/vung-mau-nhap.tsx`
  severity: medium
  Đề xuất: known-limits

- **Kiểm bản sửa (kiemSuaMau) lỏng hơn validatePlan: thiếu tham số bắt buộc của price/date vẫn lưu được, rồi bị lặng lẽ bỏ ở lần nhập sau**
  Người dùng thấy gì: Ai gọi thẳng vào hệ thống với bản sửa thiếu thông tin về đơn vị giá hay thứ tự ngày sẽ được báo lưu thành công, nhưng lần nhập sau bản sửa đó bị bỏ qua. Màn hình thông thường luôn gửi đủ nên người dùng bình thường không gặp.
  Căn cứ: Chỉ xảy ra khi gọi hệ thống trực tiếp, không qua màn hình; không mất dữ liệu và cột tự về cách đoán mặc định nên người dùng sửa lại được.
  file: `packages/core/src/import/memory/sua-mau.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E4 kiểm plan đã lưu thay vì căn ghi ra khi xác nhận «lần đang mở ghi theo kế hoạch cũ»**
  Người dùng thấy gì: Bài kiểm tra chưa chứng minh được rằng lần nhập đang mở vẫn ghi cột Giá vào giá rao sau khi mẫu bị sửa. Nếu có lỗi ở chỗ này, bài kiểm tra sẽ không phát hiện.
  Căn cứ: Đây là lỗ hổng của bài kiểm tra chứ chưa phải lỗi người dùng đã gặp; sửa bài kiểm tra sau này rẻ và không ảnh hưởng dữ liệu hiện có.
  file: `packages/api/test-db/mau-nhap-va-bai/mau-nhap.test.ts`
  severity: high
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
