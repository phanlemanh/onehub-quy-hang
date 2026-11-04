# Review findings: va-duong-loi-hoan-tac (round 1)

## Trong hợp đồng

(không có finding nào)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hoàn tác trên ô mời bấm lại cả khi lỗi do luật của lõi, khác luật của hoàn tác lô**
  Người dùng thấy gì: Khi hoàn tác một lần sửa trên ô thất bại vì luật nghiệp vụ (ví dụ căn không còn hợp lệ để chuyển), thông báo vẫn mời bấm Hoàn tác lại dù chắc chắn lại hỏng. Người dùng chỉ mất vài lần bấm vô ích và vẫn thấy lý do.
  Căn cứ: Hậu quả nhẹ: không mất hay lộ dữ liệu, người dùng chỉ bấm thừa và thấy lại thông báo lỗi; hợp đồng cũng không cấm hành vi này.
  file: `apps/web/src/app/(app)/inventory/cell-edit/hoan-tac.ts`
  severity: medium
  Đề xuất: known-limits

- **traLai có thể làm Ctrl/Cmd+Z trỏ lại một lần sửa cũ dù đã có lần sửa mới hơn không hoàn tác được**
  Người dùng thấy gì: Trong một tình huống hiếm (bấm nút Hoàn tác ở thông báo cũ bị hỏng sau khi đã có lần sửa mới hơn không hoàn tác được), phím Ctrl/Cmd+Z có thể hoàn tác lần sửa cũ thay vì lần gần nhất.
  Căn cứ: Cần chuỗi thao tác hiếm, kiểm phiên bản chặn được phần lớn trường hợp cùng căn, và người dùng thấy kết quả để sửa lại; nhưng căn khác nhau thì có thể đổi nhầm.
  file: `apps/web/src/app/(app)/inventory/cell-edit/hoan-tac.ts`
  severity: medium
  Đề xuất: known-limits

- **Chú thích của moTaLoi bị đẩy lên kiểu LoiGhi**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối; chỉ khiến người viết mã thấy chú thích gợi ý sai khi rê chuột.
  Căn cứ: Không có hậu quả nào với người dùng, không mất dữ liệu, sửa lúc nào cũng được và rất rẻ nếu có dịp.
  file: `apps/web/src/app/(app)/inventory/cell-edit/lenh.ts`
  severity: low
  Đề xuất: wont-fix

- **traLai đưa một bản ghi cũ trở lại Ctrl/Cmd+Z khi lần sửa mới hơn không hoàn tác được**
  Người dùng thấy gì: Sau khi bấm Hoàn tác trên thông báo cũ bị hỏng, phím Ctrl/Cmd+Z có thể quay về lần sửa cũ thay vì lần sửa gần nhất, và nếu hai lần sửa khác căn thì có thể đổi nhầm căn.
  Căn cứ: Chỉ xảy ra với chuỗi thao tác hiếm, người dùng thấy thông báo kết quả và hoàn tác lại được; sửa nằm chung một chỗ với lỗi tương tự.
  file: `apps/web/src/app/(app)/inventory/cell-edit/hoan-tac.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): hàng «ghi lô» của bảng E4 tắt đối chứng dương, nên phép kiểm âm còn lại luôn đạt**
  Người dùng thấy gì: Một bài kiểm tự động chưa chắc bắt được lỗi nếu sau này ghi lô báo nhầm câu chữ lỗi kho; người dùng hiện chưa gặp lỗi nào.
  Căn cứ: Chưa gây hậu quả nào cho người dùng, chỉ làm lưới an toàn khi sửa code về sau yếu đi; sửa rẻ nhưng ngoài hợp đồng.
  file: `apps/web/src/app/(app)/inventory/cell-edit/hoan-tac-loi.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay): bản ghi lô của các ca E1, E2, E5 được dựng tay, không lấy từ chayGhiLo**
  Người dùng thấy gì: Bài kiểm tự động dùng dữ liệu dựng sẵn thay vì dữ liệu do chức năng ghi lô thật tạo ra, nên nếu bên ghi điền sai mã căn thì bài vẫn xanh và thông báo có thể kể sai căn.
  Căn cứ: Chưa có hỏng thật, chỉ là rủi ro bài kiểm không bắt được lỗi về sau; người dùng không bị mất dữ liệu.
  file: `apps/web/src/app/(app)/inventory/bulk/hoan-tac-lo-loi.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (ma trận thiếu): bảng «loại lỗi nào được bấm lại» khai 5 × 2 nhưng chỉ assert cột thứ hai ở ba hàng**
  Người dùng thấy gì: Bài kiểm chưa kiểm hết các ô của bảng loại lỗi, nên một căn hỏng có thể bị đếm hai lần trong tiêu đề thông báo mà bài vẫn xanh.
  Căn cứ: Chưa có lỗi thật, chỉ là lưới kiểm lỏng ở vài ô; nhẹ và người dùng nếu gặp chỉ thấy số đếm lệch.
  file: `apps/web/src/app/(app)/inventory/bulk/hoan-tac-lo-loi.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
