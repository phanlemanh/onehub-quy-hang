# Review findings: goi-tu-may-tinh (round 2)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Trang quay số mới có tiêu đề đầu trang «Căn call»; ảnh bằng chứng E9 vẫn được nhận**
  Người dùng thấy gì: Trên trang quay số, dòng tiêu đề trên cùng hiện chữ «Căn call» thay vì một nhãn tiếng Việt đúng. Chức năng gọi vẫn chạy bình thường, chỉ là chữ ở đầu trang trông lạ.
  Căn cứ: Hậu quả nhẹ, chỉ sai chữ trang trí, không mất hay lộ dữ liệu, không cản việc gọi; sửa sau rẻ và nên làm chung với màn chế độ cuộc gọi vốn đã sai từ trước.
  file: `apps/web/src/components/shell/app-shell.tsx`
  severity: medium
  Đề xuất: known-limits

- **E9 network log says there were no 4xx responses, but frame 4b must produce two 404s, so the log does not cover the whole run**
  Người dùng thấy gì: Bản ghi mạng đi kèm hồ sơ ghi là không có lời từ chối nào, trong khi hai khung thử người không phải chủ lead chắc chắn có từ chối. Sản phẩm chạy đúng, chỉ là hồ sơ nghiệm thu ghi chưa đủ.
  Căn cứ: Không ảnh hưởng người dùng thật, chỉ làm hồ sơ kiểm kém chính xác; ảnh màn từ chối vẫn có, nên ghi lại hạn chế này là đủ và chụp lại sau cũng rẻ.
  file: `_acceptance/goi-tu-may-tinh/evidence/E9-network.txt`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — kiểm âm đứng một mình: kênh nhật ký ở lối từ chối không có đối chứng dương**
  Người dùng thấy gì: Bài kiểm xem nhật ký có lộ số điện thoại chủ nhà hay không có thể vẫn báo xanh ngay cả khi nó không bắt được dòng nhật ký nào. Hiện chưa có bằng chứng số bị lộ, chỉ là bài kiểm chưa chứng minh chắc điều đó.
  Căn cứ: Chưa thấy lộ số thật nên hậu quả hiện tại thấp, nhưng nếu sau này có lộ thì bài kiểm sẽ không báo; thêm một đối chứng vào bài kiểm là việc nhỏ, rẻ, làm lúc nào cũng được.
  file: `packages/api/test-db/goi-tu-may-tinh.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Phím Enter trên nút ngoài danh sách hỏi bị nuốt và nhảy vào ô giá (nút «Đã gọi», «Quay số trên điện thoại» không bấm được bằng Enter) (r1)**
  Người dùng thấy gì: Khi dùng bàn phím, nhấn Enter trên nút «Quay số trên điện thoại» hoặc «Đã gọi» không kích hoạt nút mà kéo con trỏ vào ô giá. Bấm bằng chuột hay chạm vẫn dùng bình thường.
  Căn cứ: Nhẹ vì chỉ ảnh hưởng người dùng bàn phím, không mất dữ liệu, bấm chuột là làm được ngay.
  file: `apps/web/src/app/(app)/units/call/cuoc-goi.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — E4: máy dò «giá» và «mã căn» chỉ có phép phủ định, không có đối chứng dương (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm chống rò giá và mã căn chưa tự chứng minh là máy dò bắt được khi có rò thật, nên nếu giá lộ ra dưới dạng lạ thì có thể không ai nhận ra. Người dùng không thấy gì khác đi hôm nay.
  Căn cứ: Nhẹ vì chưa có rò thực tế nào, chỉ là lưới an toàn lỏng hơn mong muốn, và bổ sung sau rất rẻ.
  file: `packages/api/test-db/goi-tu-may-tinh.test.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/3 lỗi rơi vào file không bộ đo nào phủ (apps/web/src/components/shell/app-shell.tsx, _acceptance/goi-tu-may-tinh/evidence/E9-network.txt) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
