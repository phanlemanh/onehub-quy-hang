# Review findings: can-trung-ma-hai-toa (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Chọn toà theo khoá toà vẫn lọc theo tên toà; hai toà cùng tên khác khoá không tách được**
  Người dùng thấy gì: Nếu một dự án có hai toà trùng tên nhưng khác mã toà, việc chọn một toà vẫn có thể ra «nhiều căn» thay vì đúng một căn. Người dùng phải tự phân biệt hai căn, nhưng không bị điền nhầm lặng lẽ.
  Căn cứ: Hậu quả nhẹ và chỉ xảy ra với dữ liệu hiếm có hai toà cùng tên trong một dự án; hệ thống vẫn báo «nhiều căn» chứ không chọn nhầm, không mất hay lộ dữ liệu, và danh mục mẫu không có ca này.
  file: `packages/core/src/catalog/lookup.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

