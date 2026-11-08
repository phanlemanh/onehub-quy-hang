## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Danh sách trạng thái ở khung hồ sơ ghi «Ngừng bán», nhãn thật là «Ngừng hẳn»**
  Người dùng thấy gì: Công cụ chụp màn dùng để nghiệm thu gọi sai tên một trạng thái nên sẽ không nhận ra căn «Ngừng hẳn». Người dùng cuối không bị ảnh hưởng gì.
  Căn cứ: Chỉ là công cụ kiểm thử nội bộ, không chạm dữ liệu hay màn của người dùng, và vòng đo hiện tại chỉ cần «Đang bán» nên kết quả vẫn đúng.
  file: `_acceptance/can-nhap-len-bang-chung/thu/chup.mjs`
  severity: low
  Đề xuất: wont-fix

- **Dòng file ghi «Đang giao dịch» bị báo «lên Đang bán — còn thiếu …» dù căn kết thúc ở Đang giao dịch (r1)**
  Người dùng thấy gì: Với dòng file ghi «Đang giao dịch», kết quả lần nhập có thể ghi câu «lên Đang bán — còn thiếu …» trong khi căn thật ra nằm ở Đang giao dịch. Người xem thấy hai thông tin lệch nhau nhưng căn và trạng thái vẫn đúng.
  Căn cứ: Chỉ là lời giải thích lệch ở một loại dòng hiếm, dữ liệu căn không sai và không mất gì, nên ghi lại là đủ.
  file: `packages/api/src/imports/store.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): cửa «sửa hàng loạt» ở E5 là thân lệnh gõ tay, không dựng từ trình sửa ô (r1 · tệp đã đổi)**
  Người dùng thấy gì: Phép thử cho cửa sửa hàng loạt dùng lệnh viết tay chứ không đi qua trình sửa thật trên màn. Nếu trình sửa thật gửi lệnh khác đi, bài thử vẫn xanh trong khi người dùng có thể gặp lỗi.
  Căn cứ: Chỉ làm bài thử kém chặt chứ không làm sản phẩm sai; sản phẩm vẫn từ chối đúng và có thể bổ sung phép thử sau.
  file: `packages/api/test-db/imports/can-nhap-len-bang-chung.test.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
