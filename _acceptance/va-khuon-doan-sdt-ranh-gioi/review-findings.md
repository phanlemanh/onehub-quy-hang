# Review findings: va-khuon-doan-sdt-ranh-gioi (round 3)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Thẻ trình chủ kho nói sai phạm vi: nhầm «mã căn» và khẳng định «sát chữ đều bị chặn» (r2)**
  Người dùng thấy gì: Thẻ đưa cho người ký ghi hơi sai: nói là chặn cả «mã căn» và mọi trường hợp sát chữ, trong khi thực tế chỉ chặn khoá toà và UPI, và số liền sát chữ vẫn qua. Người ký có thể hiểu rộng hơn phạm vi thật.
  Căn cứ: Chỉ là câu chữ trên thẻ, không làm mất hay lộ dữ liệu; hành vi thật đúng hợp đồng và sửa lại câu chữ rất rẻ.
  file: `_acceptance/va-khuon-doan-sdt-ranh-gioi/card-plain.json`
  severity: low
  Đề xuất: known-limits

- **`dungBaoSai` bỏ mất hướng xử lý khi UPI có dáng số điện thoại (r2)**
  Người dùng thấy gì: Khi báo sai một căn có UPI giống số điện thoại, thông báo chỉ nói UPI ngoài dạng mà không nhắc là phải nhờ nguồn danh mục sửa. Hiện chưa có màn nào dùng đường này nên người dùng chưa gặp.
  Căn cứ: Hậu quả nhẹ: chỉ thiếu một dòng hướng dẫn, không mất hay lộ dữ liệu, chưa có màn nào hiện ra, và bổ sung sau rẻ.
  file: `packages/core/src/confirmation/dung.ts`
  severity: low
  Đề xuất: known-limits

- **Nhánh «có dấu tách» của MAU_DOAN_SDT chặn cả dãy không thuộc luật đã ghi ở ADR-0027 (r1)**
  Người dùng thấy gì: Một dạng khoá hiếm (số dài dính chữ, kèm đuôi số sau dấu gạch) bị từ chối dù theo luật đã ghi thì phải qua. Khoá thật của Invest hiện không có dạng này.
  Căn cứ: Chỉ lệch về phía chặn thừa trên một dạng khoá chưa từng xuất hiện thật, không lộ dữ liệu nào, và nếu gặp thì Invest đổi khoá là xong.
  file: `packages/core/src/confirmation/dang-dong.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
