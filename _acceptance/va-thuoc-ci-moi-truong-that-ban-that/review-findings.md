# Review findings: va-thuoc-ci-moi-truong-that-ban-that (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E2 và E3 khai thiếu `paths`: bộ đo đọc những tệp không có trong danh sách theo dõi nên bằng chứng không bị đánh dấu cũ khi các tệp ấy đổi**
  Người dùng thấy gì: Nếu một số tệp cấu hình triển khai hoặc hồ sơ liên quan đổi sau này, bằng chứng cũ có thể vẫn bị coi là còn hiệu lực. Người dùng cuối không thấy gì, chỉ là lưới kiểm có thể bỏ sót một lần đổi.
  Căn cứ: Hậu quả nhẹ và không ảnh hưởng người dùng cuối hay dữ liệu; chỉ làm lưới kiểm lỏng hơn ở những lần đổi hiếm, và bổ sung sau rẻ.
  file: `_acceptance/va-thuoc-ci-moi-truong-that-ban-that/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Một ca phá thử mang nhãn «gọi Vercel trước kiểm nhanh» nhưng thực ra xoá bước kiểm nhanh, lệch với ma trận đã viết trước ở E2**
  Người dùng thấy gì: Một dòng báo cáo nội bộ gọi tên ca thử không khớp với điều ca đó làm, và chưa có ca thử việc đảo thứ tự kiểm nhanh với bước gọi Vercel. Người dùng không bị ảnh hưởng.
  Căn cứ: Chỉ là nhãn chữ trong báo cáo kiểm, không làm sai kết quả hay lộ dữ liệu, và có thể chỉnh sau khi cần.
  file: `_acceptance/va-thuoc-ci-moi-truong-that-ban-that/thu/kiem-thuoc.mjs`
  severity: low
  Đề xuất: known-limits

- **Tên và chú thích của executor `suc_khoe_xem_truoc` vẫn nói về bản xem trước, trong khi E8 nay đo trên bản thật**
  Người dùng thấy gì: Chú thích trong cấu hình nói về bản xem trước trong khi phép đo chạy trên bản thật, dễ làm người bảo trì hiểu nhầm. Người dùng cuối không thấy gì.
  Căn cứ: Chỉ là chữ chú thích gây hiểu nhầm cho người bảo trì, không đổi hành vi, và sửa lại rất rẻ.
  file: `_acceptance/config.yaml`
  severity: low
  Đề xuất: known-limits

- **E7 vẫn ghi chiều đỏ là «năm ca» trong khi ma trận phá thử nay có mười ca**
  Người dùng thấy gì: Một dòng mô tả trong hồ sơ cũ ghi sai số ca thử so với thực tế, người đối chiếu có thể thấy lệch. Phép đo vẫn đúng và người dùng không bị ảnh hưởng.
  Căn cứ: Lệch tài liệu thuần tuý, không làm hỏng phép đo hay dữ liệu, tự nhận ra khi đối chiếu.
  file: `_acceptance/moi-truong-that/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 — hồ sơ tuyên quét cả lớp «tám vế × chiều đỏ», nhưng ma trận phá thử chỉ phủ 6/8 vế**
  Người dùng thấy gì: Hai trong tám điều kiện của quy trình triển khai chưa có phép thử cố tình làm hỏng, nên nếu phép kiểm hai điều kiện đó hỏng thì lưới vẫn báo xanh. Có thể để lọt một lần triển khai sai bước.
  Căn cứ: Hậu quả có thể xảy ra nhưng chỉ khi phép kiểm hai vế đó hỏng âm thầm, trong khi hiện chúng vẫn đạt trên vật lành; bổ sung ca thử sau rẻ và không mất dữ liệu.
  file: `_acceptance/va-thuoc-ci-moi-truong-that-ban-that/thu/kiem-thuoc.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (phụ) — E7 của moi-truong-that khai ma trận phá thử «năm ca», trong khi ma trận viết trước có mười ca**
  Người dùng thấy gì: Một dòng mô tả trong hồ sơ cũ ghi sai số ca thử so với ma trận thật, làm người đối chiếu khó biết ma trận nào đúng. Người dùng không bị ảnh hưởng.
  Căn cứ: Lệch tài liệu thuần tuý như mục trùng, không đổi kết quả đo hay dữ liệu, và chỉnh lại rất rẻ.
  file: `_acceptance/moi-truong-that/evals.yaml`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

⚠ Cụm ngoài vùng phủ: 2/6 lỗi rơi vào file không bộ đo nào phủ (_acceptance/va-thuoc-ci-moi-truong-that-ban-that/evals.yaml, _acceptance/config.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
