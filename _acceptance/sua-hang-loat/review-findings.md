# Review findings: sua-hang-loat (round 1)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bảng nhãn «thiếu …» bị chép lại với kiểu lỏng Record<string, string> thay vì Record<Requirement, string>**
  Người dùng thấy gì: Hiện tại hộp hỏi vẫn ghi đúng tên mục còn thiếu. Nếu sau này sản phẩm thêm một mục bắt buộc mới, hộp hỏi của sửa hàng loạt có thể ghi «thiếu undefined» thay vì tên mục.
  Căn cứ: Chưa gây lỗi nào cho người dùng, chỉ phát sinh khi thêm mục bắt buộc mới và chỉ làm sai chữ trong hộp hỏi; sửa sau rẻ.
  file: `apps/web/src/app/(app)/inventory/bulk/lo.ts`
  severity: low
  Đề xuất: known-limits

- **Hoàn tác lô bỏ qua lặng các căn ghi lệnh bù thất bại, vẫn báo thành công**
  Người dùng thấy gì: Khi bấm Hoàn tác một lô mà máy không ghi được vài căn, người dùng vẫn thấy thông báo thành công. Họ không biết căn nào còn ở trạng thái mới, và bấm lại chỉ báo «Đã hoàn tác rồi».
  Căn cứ: Người dùng bị báo sai là xong trong khi vài căn vẫn giữ trạng thái cũ và không còn đường hoàn tác, nhưng chỉ xảy ra khi kho trên máy lỗi và họ vẫn tự đổi lại từng căn được.
  file: `apps/web/src/app/(app)/inventory/bulk/thanh.tsx`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): đối chứng đỏ E2 chỉ lọc chính bảng mong đợi, không chạy hàm giả nào**
  Người dùng thấy gì: Một bài kiểm tự động nói là bảo vệ việc «căn đã đóng không bị gọi nhầm» thực ra không bắt được lỗi nếu bộ xét sai. Người dùng không thấy gì ngay, nhưng lỗi về sau có thể lọt qua.
  Căn cứ: Không ảnh hưởng người dùng hôm nay, chỉ làm lưới kiểm yếu đi; có thể bổ sung sau với chi phí thấp.
  file: `apps/web/src/app/(app)/inventory/bulk/lo.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): kiểm việc Bảng hàng bật sửa ô bằng cách grep mã nguồn**
  Người dùng thấy gì: Bài kiểm xác nhận chỉ ba cột sửa được trên bảng chỉ đọc chữ trong mã nên có thể xanh dù bảng thật mở nhầm cột, hoặc đỏ dù bảng đúng. Người dùng chưa gặp lỗi nào.
  Căn cứ: Chỉ là độ tin cậy của bài kiểm, không có mất mát dữ liệu hay lỗi người dùng thấy; sửa sau không đắt.
  file: `apps/web/src/app/(app)/inventory/cell-edit/cot-sua.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên cả lớp nhưng chỉ có điểm-case): «cùng hàm» của trình sửa chỉ kiểm 4 trên 12 chuyển trạng thái**
  Người dùng thấy gì: Bài kiểm câu cảnh báo «Không hoàn tác được» chỉ phủ một phần các chuyển trạng thái, nên một lệch ở chuyển còn lại có thể không bị bắt. Hiện chưa thấy người dùng gặp lỗi.
  Căn cứ: Mới là khoảng trống của bài kiểm, không có lỗi cụ thể; hậu quả nhẹ và bổ sung sau rẻ.
  file: `apps/web/src/app/(app)/inventory/cell-edit/hoan-tac.test.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Không có.

⚠ Cụm ngoài vùng phủ: 2/5 lỗi rơi vào file không bộ đo nào phủ (apps/web/src/app/(app)/inventory/cell-edit/cot-sua.test.ts, apps/web/src/app/(app)/inventory/cell-edit/hoan-tac.test.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
