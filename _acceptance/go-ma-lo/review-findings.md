# Review findings: go-ma-lo (round 2)

## Trong hợp đồng

Không có finding.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

Không có finding mới ở round này. Hai mục mang từ round trước sẽ do máy tự chèn với nhãn (r<N>).

- **Khi cách đọc mã của một khu lệch với danh mục, lô bị báo nhầm là «chưa có trong danh mục» mà không có lỗi nào (r1)**
  Người dùng thấy gì: Khi sau này thêm một khu mới mà cách đọc mã khai lệch với danh mục, đầu chủ gõ đúng mã vẫn bị báo lô chưa có, và không ai nhận ra lỗi cấu hình. Hiện chưa ai gặp vì chỉ có khu mẫu đã kiểm.
  Căn cứ: Hiện chưa ảnh hưởng người dùng nào vì chưa có khu thật, và chỉ hiện ra khi thêm khu mới, lúc đó sẽ sửa cùng việc nhận danh mục thật.
  file: `packages/core/src/catalog/lot-lookup.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên bố «số assert = số dòng» nhưng con đếm luôn đúng theo cách dựng): con đếm của AC-5 là phép so tự thoả (r1 · tệp đã đổi)**
  Người dùng thấy gì: Một con số đếm trong bộ kiểm luôn khớp dù có bỏ sót dòng, nên nó không báo được nếu bộ kiểm bị rút gọn. Việc kiểm từng mã gần trúng vẫn chạy bình thường, người dùng không bị ảnh hưởng.
  Căn cứ: Không ảnh hưởng người dùng, kiểm từng dòng vẫn bắt lỗi thật, và sửa chỉ làm đẹp con số đếm nên không đáng mở việc.
  file: `packages/core/src/catalog/lot-lookup.test.ts`
  severity: low
  Đề xuất: wont-fix

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
