# Review findings: hom-nay-dau-khach (round 2)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E6b-step1.png không cho thấy tin «Khách phản ứng», dù bước này đòi đủ ba loại tin**
  Người dùng thấy gì: Ảnh minh hoạ vùng Đầu khách trên điện thoại chỉ cho thấy hai loại tin, tin «Khách phản ứng» có thể nằm dưới phần bị cắt. Người dùng không gặp lỗi gì; chỉ là bằng chứng chụp chưa đủ để chứng minh ba loại tin cùng hiện.
  Căn cứ: Hậu quả nhẹ: không ảnh hưởng người dùng thật, không mất dữ liệu, chỉ thiếu một tấm ảnh chứng minh và chụp lại rẻ.
  file: `_acceptance/hom-nay-dau-khach/evidence/E6b-step1.png`
  severity: medium
  Đề xuất: known-limits

- **Ở E6b-step5.png, huy hiệu của công cụ dev Next đè lên nút «Thử lại»**
  Người dùng thấy gì: Trong ảnh chụp, biểu tượng của công cụ phát triển che mất một phần nút «Thử lại». Bản người dùng thật không có biểu tượng này nên họ vẫn thấy và bấm được nút.
  Căn cứ: Chỉ là lỗi của ảnh chụp trong môi trường thử, người dùng thật không gặp, nên không đáng mở thêm việc.
  file: `_acceptance/hom-nay-dau-khach/evidence/E6b-step5.png`
  severity: low
  Đề xuất: wont-fix

- **Vùng Đầu khách có thể kẹt ở trạng thái đang tải mãi khi body trả về không đọc được (r1)**
  Người dùng thấy gì: Hiếm khi mạng hoặc máy chủ trung gian trả về nội dung hỏng, vùng Đầu khách ở Hôm nay sẽ hiện khung chờ mãi, không báo lỗi và không có nút thử lại. Người dùng phải tự tải lại trang.
  Căn cứ: Chỉ xảy ra trong tình huống hiếm, không mất dữ liệu, người dùng tự khắc phục được bằng cách tải lại trang, và hậu quả nhẹ.
  file: `apps/web/src/app/(app)/today/buyer/vung.tsx`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/2 lỗi rơi vào file không bộ đo nào phủ (_acceptance/hom-nay-dau-khach/evidence/E6b-step1.png, _acceptance/hom-nay-dau-khach/evidence/E6b-step5.png) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
