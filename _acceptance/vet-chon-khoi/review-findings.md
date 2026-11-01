# Review findings: vet-chon-khoi (round 2)

## Trong hợp đồng

Không có finding nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Archetype check is a substring match on the whole of vo-va-ia.md, so it accepts almost any value**
  Người dùng thấy gì: Cột Archetype của danh mục khối chỉ bị bắt khi để trống. Ghi một tên sai nhưng là từ thường gặp trong tài liệu vỏ và IA thì kiểm chuẩn vẫn xanh.
  Căn cứ: Hậu quả nhẹ: chỉ làm một nhãn mô tả trong tài liệu sai mà không bị bắt, không mất hay lộ dữ liệu, người đọc soát lại được và sửa sau rẻ.
  file: `packages/ui-lint/kiem-chuan.mjs`
  severity: low
  Đề xuất: known-limits

- **Default homNay uses the UTC date, which lags the Vietnam date by up to 7 hours**
  Người dùng thấy gì: Nếu chạy kiểm tra trong khoảng 0 đến 7 giờ sáng giờ Việt Nam, cảnh báo về hạn xem lại đúng ngày hôm nay sẽ hiện trễ đến sáng. Đến 7 giờ thì cảnh báo xuất hiện bình thường.
  Căn cứ: Hậu quả rất nhẹ: chỉ trễ vài giờ một dòng nhắc, không chặn việc gì, tự hết sau 7 giờ sáng.
  file: `packages/ui-lint/kiem-chuan.mjs`
  severity: low
  Đề xuất: known-limits

- **Archetype check passes any text that appears anywhere in vo-va-ia.md**
  Người dùng thấy gì: Cột Archetype chỉ bị bắt lỗi khi trống; một giá trị bịa nhưng trùng chữ nào đó trong tài liệu vẫn qua mặt kiểm chuẩn.
  Căn cứ: Hậu quả nhẹ: chỉ một nhãn mô tả sai không bị máy bắt, không động đến dữ liệu hay người dùng cuối, người soát sửa được và sửa sau rẻ.
  file: `packages/ui-lint/kiem-chuan.mjs`
  severity: low
  Đề xuất: known-limits

- **Default «today» uses UTC, so the review-deadline warning shows up to 7 hours late in Vietnam**
  Người dùng thấy gì: Chạy kiểm tra trước 7 giờ sáng giờ Việt Nam thì dòng nhắc hạn xem lại của đúng hôm nay chưa hiện, sau 7 giờ mới hiện.
  Căn cứ: Hậu quả rất nhẹ: chỉ một dòng nhắc đến muộn vài giờ, không mất dữ liệu, tự hết khi qua 7 giờ sáng.
  file: `packages/ui-lint/kiem-chuan.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 — fixture viết tay đúng khuôn bên đọc: reui-tra.md, tức «kết quả ReUI thô», được gõ tay theo đúng khuôn mà bài kiểm tự phân tích**
  Người dùng thấy gì: Bảng ghi điều đã tra trên kho khối giao diện được đối chiếu với một tệp kết quả do người gõ lại, không phải bản chụp nguyên văn từ công cụ tra. Máy không chứng minh được lượt tra đã thật sự chạy.
  Căn cứ: Hậu quả nhẹ với người dùng: chỉ làm yếu bằng chứng của một ghi chú nội bộ, không ảnh hưởng sản phẩm hay dữ liệu, người soát có thể chạy lại truy vấn để kiểm.
  file: `packages/ui-lint/tests/kiem-chuan.test.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
