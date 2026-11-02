## Trong hợp đồng

- **Hình dạng 4 (chỉ khẳng định âm, không có đối chứng dương): thân GET /leads/assigned được coi là sạch mà không chứng nó có chứa lead**
  AC: AC-4
  file: `packages/api/test-db/mo-so-lead.test.ts:205`
  severity: medium
  source: measurement
  detail: Dòng 204-205: `const ds = await (await send("GET", "/api/v1/leads/assigned", ...dc1.cookie)).text(); assert.equal(timDangSo(ds, ok.so), null, ...)`. Bài chỉ khẳng định số KHÔNG có trong thân trả. Không kiểm mã trả (200), cũng không kiểm thân có chứa lead `ok.id`. Nếu lời gọi ra 401/403/404/500, hoặc danh sách rỗng (ví dụ lead đã rời nhóm chờ gọi, hay phiên hay vai của dc1 lệch sau dòng «gỡ vai»), thân sẽ không mang số và bài vẫn xanh. Vế «danh sách lead giao» của AC-4/E4 vì thế có thể đạt suông. Đối chứng dương duy nhất của máy dò (timDangSo trên okBody) chứng máy dò chạy được, nhưng không chứng rằng thân của danh sách thực sự có dòng lead mang số đó.
  rationale: AC-4 đòi chứng số không xuất hiện trong danh sách lead giao cho đầu chủ; bài chỉ khẳng định âm trên một thân có thể rỗng hoặc lỗi nên vế danh sách của AC-4 không được chứng.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 4 (đối chứng dương không ghim thông điệp): kiểm tra bọc nhật ký chỉ đếm số dòng bắt được, ít nhất 1, không ghim dòng của lỗi 500**
  Người dùng thấy gì: Bài kiểm xác nhận số không lọt vào nhật ký máy chủ có thể xanh dù đường lỗi không thật sự ghi gì, nên khả năng nhật ký rò số khó bị phát hiện sớm. Người dùng không thấy ảnh hưởng gì ngay.
  Căn cứ: Đây là độ chặt của bài kiểm, không phải lỗi người dùng gặp; bài vẫn có đối chứng cơ bản, người dùng không mất dữ liệu, và có thể siết lại sau với chi phí thấp.
  file: `packages/api/test-db/mo-so-lead.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn của bên đọc): câu trả lời 200 giả {ownerPhone} không rút từ bên ghi**
  Người dùng thấy gì: Nếu sau này phía máy chủ đổi dạng trả số mà bài kiểm ở màn không bắt được, đầu chủ có thể thấy «Chưa mở được số» dù mở số ở máy chủ thành công.
  Căn cứ: Chỉ xảy ra khi một bên đổi khuôn trong tương lai, người dùng tải lại hoặc chờ bản sửa là gọi được, không mất hay lộ dữ liệu; sửa sau tương đối rẻ.
  file: `apps/web/src/app/(app)/today/mo-so.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (chỉ khẳng định âm, không có đối chứng dương): bẫy kho trên máy không được chứng là đã gài**
  Người dùng thấy gì: Bài kiểm lời hứa «số không được lưu trên máy» có thể không thật sự bắt được việc lưu, nên nếu sau này ai đó lưu số trên máy thì có thể không bị phát hiện kịp.
  Căn cứ: Hiện chưa có bằng chứng số đang bị lưu trên máy; rủi ro nằm ở khả năng bắt lỗi về sau, người dùng không thấy gì ngay, và việc thêm đối chứng rất rẻ.
  file: `apps/web/src/app/(app)/today/mo-so.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

