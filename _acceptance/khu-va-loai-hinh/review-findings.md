## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Tham chiếu còn gọi chia quyền theo «khu», trong khi nghĩa này đã đổi tên thành «Vùng»**
  Người dùng thấy gì: Một dòng trong tài liệu sản phẩm vẫn viết «quyền theo khu» trong khi từ đúng nay là «vùng». Người đọc tài liệu có thể hiểu nhầm là chia quyền theo khu chứa căn, nhưng màn hình và dữ liệu của người dùng không bị ảnh hưởng.
  Căn cứ: Chỉ là một chữ lệch trong tài liệu nội bộ, không mất dữ liệu và không ảnh hưởng người dùng cuối; sửa lại sau rất rẻ và dễ.
  file: `docs/product/tham-chieu.md`
  severity: low
  Đề xuất: known-limits

- **OpenAPI schema Unit thiếu propertyType/propertySubType — hợp đồng API /api/v1 lệch với thân trả về thật (r1)**
  Người dùng thấy gì: Tài liệu mô tả API cho bên ngoài chưa nhắc đến loại hình của căn, dù dữ liệu trả về thật đã có. Người viết tích hợp dựa vào tài liệu sẽ không thấy hai thông tin này.
  Căn cứ: Dữ liệu trả về vẫn đúng, chỉ tài liệu thiếu nên không mất dữ liệu và chưa có bên ngoài nào dùng; sửa sau rẻ, chỉ thêm hai dòng mô tả.
  file: `packages/api/src/catalog/routes.ts`
  severity: medium
  Đề xuất: known-limits

- **Màn Cài đặt sàn → Người dùng mới đổi nhãn một nửa: phần quản lý vùng (zone) vẫn ghi «Khu», chữ CONTEXT giờ cấm (r1)**
  Người dùng thấy gì: Trên màn Cài đặt sàn, phần Người dùng vừa gọi là «Vùng phụ trách» vừa còn mục tên «Khu» cho cùng một thứ. Người dùng có thể thấy rối chữ nhưng chức năng không hỏng.
  Căn cứ: Chỉ là lệch chữ trên màn, không mất hay lộ dữ liệu, người dùng vẫn làm được việc; sửa sau rẻ vì chỉ đổi vài nhãn.
  file: `apps/web/src/app/settings/users/quan-nguoi.tsx`
  severity: medium
  Đề xuất: known-limits

- **Đổi khuôn kết nối packages/connect (T3) dù hợp đồng xếp nó ngoài phạm vi, và không nâng schemaVersion (r1)**
  Người dùng thấy gì: Khuôn nhận danh mục từ bên ngoài đã đổi tên khoá nhưng vẫn mang số phiên bản cũ, nên gói dữ liệu theo tên cũ giờ bị từ chối. Hiện chưa có bên nào đẩy dữ liệu thật vào nên chưa ai bị ảnh hưởng.
  Căn cứ: Chưa có bên gửi dữ liệu thật nên chưa gây hậu quả cho người dùng; ghi lại lệch này rồi nâng phiên bản khi dựng khuôn chính thức ở việc kế tiếp thì rẻ.
  file: `packages/connect/src/catalog-feed.ts`
  severity: medium
  Đề xuất: known-limits

- **Khuôn cấp vào không chở được các trường của loại hình thấp tầng/đất mà lõi đã khai (r1)**
  Người dùng thấy gì: Khuôn nhận danh mục từ ngoài chưa chở được thông tin riêng của nhà phố và đất, nên gói có các loại này sẽ bị từ chối. Hiện chỉ có căn hộ nên chưa ai gặp.
  Căn cứ: Mới chỉ có căn hộ trong danh mục nên chưa ai gặp lỗi và không mất dữ liệu; việc này đã được xếp cho hàng 10 làm tiếp.
  file: `packages/connect/src/catalog-feed.ts`
  severity: low
  Đề xuất: known-limits

- **OpenAPI Unit schema của /api/v1/catalog/units thiếu propertyType và propertySubType — hợp đồng công khai lệch với thân trả về (r1)**
  Người dùng thấy gì: Tài liệu API công khai chưa liệt kê loại hình của căn, dù API trả về hai thông tin này. Bên ngoài tự sinh mã khách từ tài liệu có thể bỏ sót hoặc từ chối hai trường này.
  Căn cứ: Dữ liệu thật không mất và chưa có bên ngoài dùng API này; sửa sau rẻ, chỉ thêm hai trường vào mô tả.
  file: `packages/api/src/catalog/routes.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét LỚP «không còn tên dự án» nhưng tập mẫu cấm chỉ có điểm-case, thiếu dạng tên cũ phổ biến nhất (r1)**
  Người dùng thấy gì: Phép kiểm tự động xem còn sót tên «dự án» cũ hay không mới bắt vài dạng, nên có thể bỏ lọt một chỗ còn tên cũ. Nếu sót thì chỉ lệch tên chứ người dùng không mất dữ liệu.
  Căn cứ: Không có bằng chứng đã sót chỗ nào và lỗi sót nếu có chỉ là lệch tên, người dùng không bị ảnh hưởng; mở rộng phép kiểm sau rẻ.
  file: `packages/core/src/catalog/khu-va-loai-hinh.test.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

