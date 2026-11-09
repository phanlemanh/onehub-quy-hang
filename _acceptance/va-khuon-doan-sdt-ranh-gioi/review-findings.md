## Trong hợp đồng

- **Hình dạng 5 (tuyên quét lớp nhưng thiếu ma trận toàn phần): AC-3 hứa mọi căn mẫu qua từng hàm dựng, test chỉ quét một hàm**
  file: `packages/connect/src/catalog-confirmation.khoa.test.ts:103`
  severity: low
  AC: AC-3
  source: measurement
  detail: AC-3 trong contract.md ghi: «khoá dạng thật của Invest ... và mọi căn của bộ dữ liệu mẫu, When đọc bằng khuôn và dựng qua từng hàm dựng, Then không bị từ chối oan ở cả hai tầng». Vòng quét bộ mẫu ở dòng 101-121 chỉ gọi `dungThuocTinhCan` rồi `parseCatalogConfirmation`. Phép đếm `assert.equal(dem, tongTuTep)` ở dòng 122 vì thế chỉ chứng minh đủ 180 căn × 1 hàm. Hai toà mẫu không qua `dungKhungToa` và 180 căn không qua `dungBaoSai`. Hai hàm này chỉ được thử trên 3 khoá toà và 3 UPI viết tay ở dòng 66-95, tức điểm-case, không phải quét bộ mẫu. evals.yaml E3 viết hẹp lại thành «dựng được thuộc tính căn và qua khuôn», nên eval xanh nhưng không đo hết vế «từng hàm dựng» của AC. Không có lỗi sản phẩm đang ẩn: tôi chạy thử ngoài kho, 2 toà qua `dungKhungToa` và 180 căn qua `dungBaoSai` đều không bị từ chối. Đây thuần là khoảng hở của phép đo so với lời hứa.
  rationale: AC-3 đòi mọi căn của bộ mẫu qua từng hàm dựng ở cả hai tầng, mà phép đo chỉ quét một hàm, nên AC-3 chưa được chứng minh đủ.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Thẻ trình chủ kho nói sai phạm vi: nhầm «mã căn» và khẳng định «sát chữ đều bị chặn»**
  Người dùng thấy gì: Thẻ đưa cho người ký ghi hơi sai: nói là chặn cả «mã căn» và mọi trường hợp sát chữ, trong khi thực tế chỉ chặn khoá toà và UPI, và số liền sát chữ vẫn qua. Người ký có thể hiểu rộng hơn phạm vi thật.
  Căn cứ: Chỉ là câu chữ trên thẻ, không làm mất hay lộ dữ liệu; hành vi thật đúng hợp đồng và sửa lại câu chữ rất rẻ.
  file: `_acceptance/va-khuon-doan-sdt-ranh-gioi/card-plain.json`
  severity: low
  Đề xuất: known-limits

- **`dungBaoSai` bỏ mất hướng xử lý khi UPI có dáng số điện thoại**
  Người dùng thấy gì: Khi báo sai một căn có UPI giống số điện thoại, thông báo chỉ nói UPI ngoài dạng mà không nhắc là phải nhờ nguồn danh mục sửa. Hiện chưa có màn nào dùng đường này nên người dùng chưa gặp.
  Căn cứ: Hậu quả nhẹ: chỉ thiếu một dòng hướng dẫn, không mất hay lộ dữ liệu, chưa có màn nào hiện ra, và bổ sung sau rẻ.
  file: `packages/core/src/confirmation/dung.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
