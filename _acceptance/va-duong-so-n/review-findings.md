# Review findings: va-duong-so-n (round 1)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bản vá làm mất số nhà ở các địa chỉ có chữ cái «D» đứng ngay trước «số N» (Lô D, Khu D, Block D)**
  Người dùng thấy gì: Địa chỉ như «Lô D số 12 Nguyễn Trãi» trước đây đọc ra số nhà 12, nay bị báo thiếu số nhà và không có khoá. Người dùng phải tự nhập số nhà cho các địa chỉ có lô, khu, block ghi bằng chữ D.
  Căn cứ: Hậu quả nhẹ đến vừa: không ra khoá sai và không mất dữ liệu, chỉ phải nhập tay số nhà. Nhưng dạng lô, khu, block khá hay gặp nên đáng sửa bằng một việc riêng trước khi lưu khoá ở hàng 76, và sửa lúc này còn rẻ.
  file: `packages/core/src/address/chuan-hoa.ts`
  severity: medium
  Đề xuất: new-contract

- **Chỗ nối dành riêng cho bộ kiểm (tachSoNhaVoi) bị xuất ra API công khai của gói address**
  Người dùng thấy gì: Hiện người dùng không gặp gì. Về sau, khi gói được mở ra, một lập trình viên có thể dùng nhầm hàm phá thử và dựng lại lỗi «Đường số N» bị đọc thành số nhà.
  Căn cứ: Chưa có hậu quả nào với người dùng vì đường vào chưa mở. Chỉ cần ghi lại để xử lý ngay trước khi mở đường ở hàng 76, sửa lúc đó rất rẻ.
  file: `packages/core/src/address/chuan-hoa.ts`
  severity: low
  Đề xuất: known-limits

- **Số 0 ở đầu chỉ được bỏ khi tên đường đúng hai chữ: «Đường số 05 nối dài» và «Đường số 5 nối dài» ra hai khoá khác nhau**
  Người dùng thấy gì: Cùng một đường viết «số 05 nối dài» hay «số 5 nối dài» có thể ra hai khoá, nên có thể bị coi là hai đường khác nhau khi kiểm trùng. Hai nhà khác nhau không bao giờ bị gộp nhầm.
  Căn cứ: Lỗi nghiêng về phía an toàn: chỉ bỏ sót một cặp trùng, không gộp nhầm và không mất dữ liệu. Dạng tên đường này hiếm, người dùng tự gộp được bằng tay.
  file: `packages/core/src/address/chuan-hoa.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 — assert «chuỗi có mặt» (đúng khuôn sha) trong khi lời hứa là QUAN HỆ: sha phải là commit trước vá**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng: ảnh khoá cũ đã được kiểm tay là thật. Chỉ là bộ kiểm chưa tự chứng minh mốc commit của ảnh, nên về sau có người đổi nhầm ảnh thì có thể không bị phát hiện.
  Căn cứ: Ảnh hiện tại đã đúng nên không có hậu quả nào; rủi ro chỉ là bộ kiểm yếu đi về sau, mà thêm kiểm tra lịch sử git vào bộ thử thì tốn công hơn lợi ích.
  file: `packages/core/src/address/duong-so.test.ts`
  severity: low
  Đề xuất: wont-fix

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
