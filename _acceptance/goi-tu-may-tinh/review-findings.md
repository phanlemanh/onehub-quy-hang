## Trong hợp đồng

- **Hình dạng 5 — E4 nói quét mọi dòng nhật ký trong lúc chạy ca nhưng chỉ bọc đúng một lời gọi thành công**
  file: `packages/api/test-db/goi-tu-may-tinh.test.ts:192`
  severity: medium
  AC: AC-3
  source: measurement
  detail: Theo evals.yaml E4, bài kiểm phải dò «mọi dòng ghi ra console (log, error, warn) cùng process.stdout.write/process.stderr.write trong lúc chạy ca (bọc tạm)», và «thân trả của mọi lời bị từ chối ở E2» cũng thuộc diện kiểm. Trong code, console và stdout/stderr chỉ bị bọc trong khối try ở khoảng dòng 192-201, quanh đúng một lời `quaySo(s, ok.id, "dc1")` trả 200. Mười một lời bị từ chối (vòng `for (const [ten, dung, ma] of BANG)` và khối «đầu chủ kiêm người nhập») chạy trước khi bọc, nên mọi thứ API ghi ra nhật ký ở lối 401/403/404 không vào `lo`. Thân trả của các lời từ chối thì có được dò qua `tuChoi`, nhưng nhật ký của chúng thì không. Lối từ chối lại là chỗ hay ghi lỗi nhất. Dòng ["nhật ký", lo.join(...)] chỉ phủ một điểm, trong khi lời hứa là cả lớp nhật ký của ca. Lý do vào hợp đồng: AC-3 yêu cầu khi máy chủ trả lời hay ghi nhật ký không lộ lớp nguồn; nhật ký ở các lối bị từ chối chưa được dò.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Phím Enter trên nút ngoài danh sách hỏi bị nuốt và nhảy vào ô giá (nút «Đã gọi», «Quay số trên điện thoại» không bấm được bằng Enter)**
  Người dùng thấy gì: Khi dùng bàn phím, nhấn Enter trên nút «Quay số trên điện thoại» hoặc «Đã gọi» không kích hoạt nút mà kéo con trỏ vào ô giá. Bấm bằng chuột hay chạm vẫn dùng bình thường.
  Căn cứ: Nhẹ vì chỉ ảnh hưởng người dùng bàn phím, không mất dữ liệu, bấm chuột là làm được ngay.
  file: `apps/web/src/app/(app)/units/call/cuoc-goi.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — E4: máy dò «giá» và «mã căn» chỉ có phép phủ định, không có đối chứng dương**
  Người dùng thấy gì: Bài kiểm chống rò giá và mã căn chưa tự chứng minh là máy dò bắt được khi có rò thật, nên nếu giá lộ ra dưới dạng lạ thì có thể không ai nhận ra. Người dùng không thấy gì khác đi hôm nay.
  Căn cứ: Nhẹ vì chưa có rò thực tế nào, chỉ là lưới an toàn lỏng hơn mong muốn, và bổ sung sau rất rẻ.
  file: `packages/api/test-db/goi-tu-may-tinh.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
