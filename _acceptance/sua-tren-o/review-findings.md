## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

Không có.

- **Chú thích của TrinhSua nói có trang mẫu design-pass, nhưng trang đó không có trong kho (r1 · tệp đã đổi)**
  Người dùng thấy gì: Người dùng không thấy gì khác: chỉ có một dòng ghi chú nội bộ nhắc tới một trang mẫu không còn tồn tại, có thể làm người sau hiểu nhầm.
  Căn cứ: Không ảnh hưởng người dùng hay dữ liệu, chỉ gây hiểu nhầm nhẹ cho người đọc mã, sửa lúc nào cũng được.
  file: `apps/web/src/app/(app)/inventory/cell-edit/tren-o.tsx`
  severity: low
  Đề xuất: wont-fix

- **Dòng «Hiểu là» đọc lại một giá khác với số máy sẽ ghi (bị làm tròn) (r1)**
  Người dùng thấy gì: Nếu đầu chủ gõ giá có nhiều số lẻ như «4,655 tỷ», dòng «Hiểu là» hiện «4,66 tỷ» nhưng hệ thống ghi 4,655 tỷ. Người xác nhận một con số, dữ liệu lưu con số khác.
  Căn cứ: Sai lệch nhỏ và chỉ xảy ra khi gõ giá lẻ nhiều chữ số, nhưng đúng vào chỗ dòng «Hiểu là» sinh ra để chặn nhầm giá, nên đáng sửa trong một việc riêng.
  file: `packages/core/src/pricing/doc-gia.ts`
  severity: high
  Đề xuất: new-contract

- **Nút «Hoàn tác» trên thông báo cũ đảo lần sửa mới nhất, hoặc âm thầm không làm gì (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi sửa liên tiếp hai căn, bấm «Hoàn tác» trên thông báo của căn trước có thể hoàn tác nhầm căn sau, hoặc bấm mà không có gì xảy ra và không báo gì.
  Căn cứ: Có thể đổi nhầm dữ liệu căn khác mà người dùng không hay, nhưng vẫn còn lịch sử và sửa lại được, và chỉ xảy ra khi sửa dồn trong 10 giây.
  file: `apps/web/src/app/(app)/inventory/cell-edit/tren-o.tsx`
  severity: high
  Đề xuất: new-contract

- **Lần ghi thất bại giữ nguyên lệnh hoàn tác cũ, nên Ctrl+Z đảo một lần sửa trước đó (r1 · tệp đã đổi)**
  Người dùng thấy gì: Sau một lần sửa bị lỗi, bấm Ctrl+Z sẽ hoàn tác lần sửa thành công trước đó, có thể ở căn khác, mà người dùng không hay.
  Căn cứ: Cần đúng chuỗi lỗi rồi Ctrl+Z mới xảy ra, hậu quả là một lần sửa bị đảo mà vẫn còn trong lịch sử và sửa lại được.
  file: `apps/web/src/app/(app)/inventory/cell-edit/tren-o.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): đối chứng đỏ E3 không bao giờ đỏ được (r1)**
  Người dùng thấy gì: Một bài tự kiểm không chứng minh được rằng việc chặn chữ không hiểu như «abc» sẽ báo đỏ nếu bị gỡ. Người dùng chưa thấy lỗi, nhưng lưới bảo vệ yếu hơn lời hứa.
  Căn cứ: Không có hậu quả trực tiếp cho người dùng, chỉ làm lưới kiểm lỏng hơn, và bổ sung bài kiểm lúc nào cũng được.
  file: `apps/web/src/app/(app)/inventory/cell-edit/lenh.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét cả lớp nhưng chỉ chép một phần): E3 nói dùng «cùng bảng chưa hiểu của E1» mà chép tay thiếu 5 dòng (r1)**
  Người dùng thấy gì: Bài tự kiểm chỉ thử 10 trong 15 kiểu chữ không hiểu, nên 5 kiểu còn lại có thể lọt mà không ai biết. Người dùng chưa gặp lỗi nào.
  Căn cứ: Bộ đọc đã có bài kiểm đủ 15 dòng riêng, nên chỗ hở chỉ là bài thử phía trình sửa, ít rủi ro và bổ sung rẻ.
  file: `apps/web/src/app/(app)/inventory/cell-edit/lenh.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên cả lớp nhưng chỉ có điểm-case): «trình sửa báo Không hoàn tác được bằng cùng hàm» chỉ chạy 4 trên 12 chuyển (r1)**
  Người dùng thấy gì: Bài tự kiểm chỉ đối chiếu cảnh báo «Không hoàn tác được» cho 4 trong 12 kiểu chuyển trạng thái, nên 8 kiểu còn lại chưa được thử. Người dùng chưa gặp lỗi.
  Căn cứ: Chưa thấy cảnh báo sai nào, chỉ thiếu bài thử, và thêm các dòng thử còn lại rất rẻ.
  file: `apps/web/src/app/(app)/inventory/cell-edit/hoan-tac.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (đối chứng không nối vào assert đang đo): đối chứng đỏ E4 chỉ thử bộ kiểm khuôn của lõi, không thử ma trận E4 (r1)**
  Người dùng thấy gì: Bài tự kiểm chứng minh việc chặn lệnh thiếu giá ở lớp lõi, chưa chứng minh trình sửa trên ô sẽ báo đỏ nếu sinh lệnh thiếu giá. Người dùng không thấy khác biệt.
  Căn cứ: Lớp lõi vẫn chặn ghi giá thiếu điều kiện, nên không có mất dữ liệu; chỉ là bằng chứng kiểm hơi yếu.
  file: `apps/web/src/app/(app)/inventory/cell-edit/lenh.test.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 1 (đo chữ trong mã nguồn thay vì đầu ra): E15 grep bang-hang.tsx để kết luận Bảng hàng bật sửa ô (r1)**
  Người dùng thấy gì: Một bài tự kiểm xác nhận Bảng hàng bật sửa ô bằng cách đọc mã chứ không thử thao tác thật. Người dùng không thấy khác biệt, hành vi thật đã được xem bằng mắt.
  Căn cứ: Hành vi mở sửa đúng ba cột đã được bài nhìn thật xác nhận, nên bài đọc mã chỉ là lớp phụ, sửa đắt hơn lợi ích.
  file: `apps/web/src/app/(app)/inventory/cell-edit/cot-sua.test.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
