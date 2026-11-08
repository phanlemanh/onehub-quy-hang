# Review findings: can-nhap-len-bang-chung (round 3)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **hom-nay-b: phép kiểm «B không thấy căn của A» vẫn đọc chữ trang chưa chuẩn hoá gạch nối, trong khi phép chờ đã chuẩn hoá**
  Người dùng thấy gì: Kịch bản chụp màn của đầu chủ B có thể báo «không thấy căn của A» là đạt trong khi thật ra chỉ không nhận ra chữ. Sản phẩm không bị ảnh hưởng, chỉ có bằng chứng chụp màn kém chắc hơn.
  Căn cứ: Không ảnh hưởng người dùng thật, không mất hay lộ dữ liệu; việc cách ly đã có phép đo riêng ở tầng dữ liệu, và kịch bản chụp chạy lại được bất kỳ lúc nào.
  file: `_acceptance/can-nhap-len-bang-chung/thu/chup.mjs`
  severity: medium
  Đề xuất: known-limits

- **Khung chờ so mã sau khi chuẩn hoá gạch nối, nhưng các phép đọc và kiểm sau đó so trên chữ thô, nên khung hom-nay-b có thể báo đạt sai**
  Người dùng thấy gì: Khi mã căn dùng dấu gạch nối khác loại, kịch bản chụp màn có thể ghi nhóm trống hoặc báo đạt sai. Người dùng không gặp gì, chỉ ảnh chụp bằng chứng có thể kém tin cậy.
  Căn cứ: Chỉ ảnh hưởng độ tin cậy của bằng chứng nghiệm thu, không ảnh hưởng người dùng thật và không có dữ liệu bị mất hay lộ; chạy lại kịch bản là tự kiểm được.
  file: `_acceptance/can-nhap-len-bang-chung/thu/chup.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — chỉ đo «chuỗi có mặt» thay cho quan hệ căn–trạng thái (Bảng hàng ở khổ 375)**
  Người dùng thấy gì: Ở màn điện thoại, kịch bản chỉ xác nhận căn có xuất hiện trên Bảng hàng, chưa xác nhận căn nằm đúng ở nhóm Đang bán. Người dùng thật không bị ảnh hưởng.
  Căn cứ: Hậu quả nhẹ: chỉ làm bằng chứng chụp màn điện thoại yếu hơn, trạng thái căn đã được kiểm ở chỗ khác; không mất hay lộ dữ liệu.
  file: `_acceptance/can-nhap-len-bang-chung/thu/chup.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — kiểm âm `khongThayCuaA` đọc chữ chưa chuẩn hoá gạch nối, nên đối chứng dương không thực sự đối chứng**
  Người dùng thấy gì: Phép kiểm «B không thấy căn của A» trong kịch bản chụp màn đọc chữ theo cách khác với phép kiểm ngược lại, nên có thể báo đạt oan. Sản phẩm vẫn chạy đúng, chỉ bằng chứng chụp kém chắc.
  Căn cứ: Không ảnh hưởng người dùng thật và không lộ dữ liệu; cách ly đã có phép đo riêng, còn kịch bản chụp có thể sửa và chạy lại rẻ khi cần.
  file: `_acceptance/can-nhap-len-bang-chung/thu/chup.mjs`
  severity: medium
  Đề xuất: known-limits

- **Danh sách trạng thái ở khung hồ sơ ghi «Ngừng bán», nhãn thật là «Ngừng hẳn» (r2 · tệp đã đổi)**
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

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): cửa «sửa hàng loạt» ở E5 là thân lệnh gõ tay, không dựng từ trình sửa ô (r1)**
  Người dùng thấy gì: Phép thử cho cửa sửa hàng loạt dùng lệnh viết tay chứ không đi qua trình sửa thật trên màn. Nếu trình sửa thật gửi lệnh khác đi, bài thử vẫn xanh trong khi người dùng có thể gặp lỗi.
  Căn cứ: Chỉ làm bài thử kém chặt chứ không làm sản phẩm sai; sản phẩm vẫn từ chối đúng và có thể bổ sung phép thử sau.
  file: `packages/api/test-db/imports/can-nhap-len-bang-chung.test.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

⚠ Cụm ngoài vùng phủ: 4/4 lỗi rơi vào file không bộ đo nào phủ (_acceptance/can-nhap-len-bang-chung/thu/chup.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
