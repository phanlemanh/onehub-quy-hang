# Review findings: va-tieu-de-goi (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Card list can stay blank if the first listings arrive after the empty state was shown**
  Người dùng thấy gì: Nếu đang mở danh sách thẻ hàng lúc còn trống rồi có căn mới về, danh sách có thể vẫn trắng dù đầu trang báo có căn. Tải lại trang là hiện đủ.
  Căn cứ: Chỉ xảy ra khi danh sách đang trống rồi mới có hàng về, không mất dữ liệu và người dùng tự khắc phục bằng cách tải lại; sửa nằm ngoài việc vá tiêu đề này.
  file: `apps/web/src/app/(app)/inventory/cards/bang-the.tsx`
  severity: medium
  Đề xuất: known-limits

- **Đo CHỈ DẪN thay vì ĐẦU RA + fixture VIẾT TAY: ca «bộ mẫu: bộ chuyển theo bộ nạp» so chữ nguồn, không so sự kiện bộ nạp thật ghi**
  Người dùng thấy gì: Bài kiểm của bộ số đo có thể vẫn xanh dù bộ mẫu lệch khỏi bộ nạp thật, nên số liệu mẫu có thể sai mà không ai báo. Người dùng cuối không thấy ngay.
  Căn cứ: Chỉ làm bài kiểm yếu đi chứ không làm hỏng chức năng cho người dùng, không ảnh hưởng dữ liệu thật; sửa tốn công và thuộc việc riêng của số đo.
  file: `packages/core/src/metrics/so-do.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình: ca «bộ thử: bộ sinh không nhập mã đang kiểm» không có đối chứng dương cho regex quét import**
  Người dùng thấy gì: Bài kiểm có thể báo xanh dù thật ra không quét được gì, nên có thể không bắt được lỗi nhập nhầm mã về sau. Người dùng cuối không bị ảnh hưởng trực tiếp.
  Căn cứ: Chỉ là độ chắc của bài kiểm, không ảnh hưởng người dùng hay dữ liệu; chi phí sửa nhỏ nhưng thuộc việc khác.
  file: `packages/core/src/import/bo-thu.test.ts`
  severity: low
  Đề xuất: known-limits

- **Assert «chuỗi có mặt» trong khi lời hứa là QUAN HỆ: «người giữ ≠ đầu khách» chỉ được kiểm bằng việc hai chữ cùng nằm trên một dòng**
  Người dùng thấy gì: Bài kiểm tài liệu có thể bỏ lọt một câu mô tả sai quan hệ giữa người giữ và đầu khách. Người dùng cuối không gặp ảnh hưởng nào.
  Căn cứ: Chỉ liên quan chữ trong tài liệu, không ảnh hưởng chức năng hay dữ liệu, nên chi phí sửa vượt hậu quả.
  file: `packages/core/src/contacts/prospects.test.ts`
  severity: low
  Đề xuất: wont-fix

⚠ Cụm ngoài vùng phủ: 3/4 lỗi rơi vào file không bộ đo nào phủ (packages/core/src/metrics/so-do.test.ts, packages/core/src/import/bo-thu.test.ts, packages/core/src/contacts/prospects.test.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
