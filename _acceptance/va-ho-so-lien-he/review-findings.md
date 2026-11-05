# Review findings: va-ho-so-lien-he (round 3)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E6 bước 3 chạy với danh sách Chủ cho thuê rỗng (0 dòng), nên vế (b) «màn chỉ còn dòng Chủ cho thuê» được chấm trên dữ liệu không thể lộ lỗi**
  Người dùng thấy gì: Lần thử trên màn Liên hệ khi đổi sang Chủ cho thuê chỉ chạy với danh sách trống, nên chưa chứng minh được màn hiện đúng các dòng Chủ cho thuê. Người dùng không thấy lỗi nào; chỉ là bằng chứng kiểm kém chặt hơn lời ghi.
  Căn cứ: Không có hậu quả cho người dùng vì không dòng lạc nào hiện ra, chỉ là phép kiểm chưa chặt, và có thể bổ sung sau với chi phí thấp.
  file: `_acceptance/va-ho-so-lien-he/evidence/E6-network.txt`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — kiểm âm tính đứng một mình: E6 bước 3 đo trên danh sách Chủ cho thuê rỗng (0 dòng), không có đối chứng dương**
  Người dùng thấy gì: Phép thử chỉ cho thấy màn không có dòng lạc, chưa cho thấy các dòng Chủ cho thuê hợp lệ vẫn hiện đầy đủ sau khi đổi loại. Nếu sau này có lỗi làm mất các dòng đó, phép thử này vẫn xanh.
  Căn cứ: Hiện chưa có lỗi nào xảy ra với người dùng; rủi ro chỉ là bỏ sót một lỗi mất dòng trong tương lai, và người dùng tải lại là thấy lại được.
  file: `_acceptance/va-ho-so-lien-he/evidence/E6-network.txt`
  severity: medium
  Đề xuất: known-limits

- **The test of the old rule never runs the double-click scenario, so its check always passes (r2)**
  Người dùng thấy gì: Bài kiểm có một phép so với luật cũ luôn cho cùng kết quả, nên nó không chứng minh được luật cũ từng nối trang hai lần. Người dùng không bị ảnh hưởng, chỉ là bằng chứng kiểm kém chặt hơn lời ghi.
  Căn cứ: Nhẹ: người dùng không thấy gì sai, chỉ là một đối chứng trong bài kiểm yếu, và phần chặn thật đã được thử bằng cách bỏ phép so rồi thấy bài kiểm đỏ.
  file: `apps/web/src/app/(app)/contacts/xem-them.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình 2 (fixture viết tay đúng khuôn bên đọc): ca «bấm hai lần» tự viết lại vòng cập nhật con trỏ của màn thay vì chạy đúng đường của vung.tsx (r2)**
  Người dùng thấy gì: Nếu sau này ai đó sửa màn Liên hệ làm hỏng việc cập nhật vị trí trang, bấm «Xem thêm» hai lần nhanh có thể làm hiện trùng dòng mà bài kiểm vẫn xanh. Hiện tại màn chạy đúng, chỉ chưa có bài kiểm chạm đúng đường ấy.
  Căn cứ: Nhẹ: không mất dữ liệu, nếu có trùng dòng thì tải lại là hết, và hiện chưa có lỗi thật; chỉ là lưới an toàn cho thay đổi tương lai còn thủng.
  file: `apps/web/src/app/(app)/contacts/xem-them.test.ts`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/2 lỗi rơi vào file không bộ đo nào phủ (_acceptance/va-ho-so-lien-he/evidence/E6-network.txt) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
