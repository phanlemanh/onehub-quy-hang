# Review findings: luat-an-va-kiem-ro-ri (round 3)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The signed card still says the barrier makes room for public API routes, which this round removed**
  Người dùng thấy gì: Thẻ người quyết ký còn một dòng nói rào bảo vệ cả đường API công khai, trong khi phạm vi đã thu lại chỉ còn trang web. Người ký có thể hiểu nhầm phần được bảo vệ rộng hơn thực tế.
  Căn cứ: Chỉ là chữ lệch trong tài liệu, không làm mất hay lộ dữ liệu nào, sửa lại lúc nào cũng rẻ, và phạm vi thật đã ghi đúng ở phần ngoài phạm vi của hợp đồng.
  file: `_acceptance/luat-an-va-kiem-ro-ri/card-plain.json`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — kiểm âm tính đứng một mình: ô «route API công khai không thuộc rào trang web» rỗng theo cách dựng, không có đối chứng dương**
  Người dùng thấy gì: Một ca kiểm nói rằng đường API công khai không bị rào chặn thì luôn đạt, dù rào có đổi hay không. Nó không chứng minh được điều nó tuyên bố, nhưng không ảnh hưởng đến việc rào vẫn chặn trang web thiếu kiểm.
  Căn cứ: Rủi ro nhẹ vì phần này đã chuyển sang hàng 35 và các ca kiểm trang web khác vẫn đo rào thật; người dùng không thấy hậu quả, bổ sung đối chứng sau cũng rẻ.
  file: `packages/core/src/redaction/cua-ra.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — không ghim thông điệp: ô đỏ «tệp kiểm rỗng» bỏ trường `tep` dù E9 hứa «thông điệp nêu tệp»**
  Người dùng thấy gì: Khi rào báo đỏ vì tệp kiểm rỗng, các ca kiểm hiện chưa bảo đảm thông báo chỉ đúng tệp cần sửa. Nếu thông báo sai tệp thì người sửa mất thêm thời gian tìm, nhưng rào vẫn đỏ đúng chỗ.
  Căn cứ: Hậu quả nhẹ: rào vẫn chặn và nêu đúng địa chỉ trang, không mất hay lộ dữ liệu; chỉ là gợi ý tìm lỗi có thể kém chính xác, và người sửa tự lần ra được.
  file: `packages/core/src/redaction/cua-ra.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Gốc nhánh API dời lên `packages/api/src`: một tệp kiểm ở gốc src miễn kiểm cho mọi route cửa ra (r2 · tệp đã đổi)**
  Người dùng thấy gì: Một bài kiểm rò rỉ đặt ở thư mục gốc của API có thể khiến mọi cửa ra mới được coi là đã kiểm dù chưa có bài kiểm riêng. Cửa ra mới có thể lọt mà không ai bị nhắc viết bài kiểm.
  Căn cứ: Hậu quả là rào lỏng hơn dự định nhưng chỉ xảy ra khi có người cố ý đặt tệp kiểm ở chỗ đó, không làm lộ dữ liệu ngay, và sửa sau không đắt.
  file: `packages/core/src/redaction/rao-cua-ra.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét LỚP dạng mã hoá nhưng ma trận đếm tay 16, thiếu phần tử «ket_hop» của chính bảng dạng (r1)**
  Người dùng thấy gì: Bài kiểm chưa thử trường hợp văn bản bị mã hoá chồng nhiều lớp, nên nếu phần xử lý đó hỏng thì bài kiểm vẫn báo xanh. Các dạng mã hoá đơn lẻ vẫn được kiểm đủ.
  Căn cứ: Chưa có dữ liệu nào bị lộ, chỉ là một đường kiểm chưa được đo; thêm ca kiểm sau này rẻ và không ảnh hưởng người dùng hiện tại.
  file: `packages/core/src/redaction/khong-ro.test.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
