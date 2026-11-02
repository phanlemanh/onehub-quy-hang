# Review findings: chuyen-khong-ket-khoa (round 2)

## Trong hợp đồng

- **Ca kiểm AC-1 không chụp khoá trên chính đường chạy của bài chuyển**
  file: `packages/api/test-db/lien-he-chuyen.test.ts:153`
  severity: medium
  AC: AC-1
  source: bugs
  detail: Ca kiểm gọi `theoThuTuKhoa(ghi, ghi)`, tức chỉ chụp pg_locks trong một giao dịch rỗng. Nó không chụp trong lần gọi `chuyen()`, nơi thực sự chạy app.lien_he_chuyen_du_lieu. Đoạn sau gọi `chuyen(X.s)` và chỉ kiểm kết quả dữ liệu, không kiểm khoá. Hệ quả có hai. (1) Nếu `chuyen` bị đổi để không đi qua theoThuTuKhoa (ví dụ quay về gọi thẳng appPool.query), ca kiểm vẫn xanh, dù tên ca và expected của E1 nói ca này chứng «trong giao dịch của bài chuyển». (2) Khoá mà hàm chuyển tự lấy khi chạy thì không bao giờ được đếm, nên khẳng định của AC-1 «bài chuyển không giữ khoá độc quyền bảng chung nào» chưa được đo trên bài chuyển thật. Các đột biến được nêu trong evals chỉ đụng đến theoThuTuKhoa, nên không lộ ra lỗ hổng này.

- **Đo CHỈ DẪN thay vì ĐẦU RA: ca thứ tự khoá chỉ đo hàm khoá dùng chung chạy với một hàm thăm dò, không đo đường thật của bài chuyển**
  file: `packages/api/test-db/lien-he-chuyen.test.ts:153`
  severity: medium
  AC: AC-1
  source: measurement
  detail: AC-1 hứa rằng chính bài chuyển (bước đưa sàn về trước 016 `veTruoc016` và lần chạy `chuyen`) đã giữ khoá bảng chủ nhà rồi bảng lead trước câu ghi đầu tiên. Nhưng ca chỉ đọc pg_locks (assert deepEqual `chup` ở dòng 154 và `manh === 0` ở dòng 155) trong lời gọi `await theoThuTuKhoa(ghi, ghi)`. Ở lời gọi đó, `ghi` vừa là hàm thăm dò, vừa đứng ở chỗ thân giao dịch. Vậy ca đo hàm khoá dùng chung chứ không đo chỗ dùng nó. Các lệnh `veTruoc016(X.s)` (dòng 160) và `chuyen(X.s)` (dòng 163) có chạy thật, nhưng không lần chụp khoá nào nằm trong giao dịch của chúng, và các assert sau đó chỉ kiểm kết quả dữ liệu. Nếu `veTruoc016` hoặc `chuyen` quay về gọi thẳng `appPool.query` như bản cũ từng kẹt khoá, cả ca vẫn xanh. Ba đột biến đỏ trong evals.yaml E1 đều đổi bên trong `theoThuTuKhoa`, nên không bắt được kiểu hồi quy này. Cách sửa gợi ý: chụp khoá ngay trong thân giao dịch của `veTruoc016` và `chuyen` (truyền hàm thăm dò `sauMoiKhoa` qua chúng, hoặc chụp ở đầu `fn`).

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bằng chứng PASS đã cũ: chấm ở mã 02bd061 với một ca kiểm không còn tồn tại**
  Người dùng thấy gì: Trang bằng chứng đang trình để ký ghi kết quả của một lượt chấm trên mã cũ, nên người ký có thể ký trên số liệu không còn khớp với bản hiện tại.
  Căn cứ: Không mất dữ liệu và không ảnh hưởng người dùng cuối, chỉ là hồ sơ ký lệch bản; chấm lại là rẻ và làm được bất cứ lúc nào trước khi ký.
  file: `_acceptance/chuyen-khong-ket-khoa/evidence-page.html`
  severity: high
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
