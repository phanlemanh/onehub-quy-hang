# Review findings: va-khuon-xac-nhan-bao-sai-quet-ro-ri

## Trong hợp đồng

- **Hình 5: tuyên quét lớp «mọi chuỗi đầu vào» nhưng ma trận thiếu nhánh upi của dungThuocTinhCan**
  file: packages/core/src/confirmation/quet-ca-lop.test.ts:92
  severity: medium
  AC: AC-6
  source: measurement
  detail: AC-6 và tên ca «quét cả lớp: hàm dựng chặn mồi ở mọi chuỗi đầu vào» hứa mọi chuỗi đầu vào bị từ chối với thông điệp lỗi dạng. CHIN_TRUONG chỉ có một dòng upi, đi qua dungBaoSai (dòng 92-98). upi còn vào dungThuocTinhCan qua một nhánh riêng có thông điệp riêng (dung.ts:172, «UPI ngoài dạng khuôn.»), mà ma trận không có phần tử (upi, dungThuocTinhCan), nên kiểm thongDiep ở dòng 112 không chạy cho nhánh này. Đã thử trên bản sao ở thư mục tạm: đổi thông điệp dung.ts:172 về câu cũ «UPI không phải căn của toà này trong danh mục.» thì toàn bộ src/confirmation/*.test.ts vẫn xanh (22 đạt, 0 đỏ). Grep cả packages/*.ts: chuỗi này chỉ có ở dung.ts, và catalog-confirmation.test.ts không kiểm thongDiep. Ca E2 ở connect chỉ bắt được việc gỡ hẳn kiểm dạng (nhận mà khuôn từ chối), không ghim lỗi dạng. Số 72 vì vậy đếm đủ ma trận nhưng ma trận chưa phủ hết tích (hàm dựng × chuỗi đầu vào có nhánh riêng).

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Số điện thoại trong khoá toà/UPI vẫn lọt cả hàm dựng lẫn khuôn khi đứng cạnh dấu '-' hoặc '.'**
  Người dùng thấy gì: Một số điện thoại thật có thể lọt qua lớp chặn nếu nguồn danh mục gửi nó dính với dấu gạch hoặc dấu chấm trong mã toà hay mã căn. Hiện chưa có đường dữ liệu thật chảy vào nên chưa ai bị lộ.
  Căn cứ: Hậu quả có thể nặng vì là thông tin chủ nhà, nhưng chỉ xảy ra khi nguồn gửi mã lạ và hiện chưa có dữ liệu thật chảy; siết sau phải phối hợp bên Invest nên cần một việc riêng.
  file: `packages/core/src/confirmation/dang-dong.ts`
  severity: medium
  Đề xuất: new-contract

- **Hình 2: fixture viết tay gắn nhãn khoá thật, không rút từ bên ghi Invest**
  Người dùng thấy gì: Bài kiểm chỉ dùng mã mẫu do người viết tự gõ theo mô tả, chưa đối chiếu với mã thật do Invest phát ra. Nếu dạng thật lệch mô tả thì mã thật có thể bị từ chối oan.
  Căn cứ: Nhẹ vì chỉ gây từ chối oan chứ không làm lộ hay mất dữ liệu, và sẽ lộ ra ngay khi Invest gửi thử mã thật; mẫu thật nằm ở kho khác nên chưa lấy được.
  file: `packages/connect/src/catalog-confirmation.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4: đối chứng dương `nhan > 0` không phụ thuộc phần tử đối chứng và không tách theo hàm dựng**
  Người dùng thấy gì: Bài kiểm tra chống việc dựng báo sai nhận nhầm căn mã lạ có thể vẫn xanh dù một trong ba loại sự kiện không còn được thử thật. Người dùng không thấy lỗi nào ngay, chỉ là lưới an toàn ở chỗ đó kém chắc hơn dự định.
  Căn cứ: Hậu quả nhẹ: không làm mất hay lộ dữ liệu của ai, chỉ làm một bài kiểm yếu đi và lỗi này tự lộ khi sửa bài kiểm sau, nên ghi hạn chế đã biết là đủ.
  file: `packages/connect/src/catalog-confirmation.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
