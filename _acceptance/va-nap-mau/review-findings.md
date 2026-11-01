# Review findings: va-nap-mau

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bài kiểm kiểu ghi tệp lỗi kiểu tạm vào cây nguồn và chạy kèm trong lệnh chấm du_lieu_mau**
  Người dùng thấy gì: Khi bài kiểm này chạy cùng lúc với một lượt kiểm kiểu khác trên cùng bản làm việc, lượt kia có thể báo đỏ giả. Nếu tiến trình bị ngắt giữa chừng, một tệp sai kiểu có thể nằm lại và làm các lượt kiểm sau đều đỏ cho đến khi xoá tay.
  Căn cứ: Chỉ gây đỏ giả và gây phiền cho người làm, không mất hay lộ dữ liệu; chỉ xảy ra khi chạy chồng nhau hoặc bị ngắt, và xoá tệp tạm là hết lỗi.
  file: `packages/db/seed/typecheck-db.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Chú thích đầu workflow mâu thuẫn với cách truyền email mới**
  Người dùng thấy gì: Dòng ghi chú ở đầu quy trình nạp mẫu nói ngược với cách làm thật, nên người sửa sau có thể hiểu nhầm về cách bảo vệ ô email. Nút bấm vẫn chạy đúng và an toàn.
  Căn cứ: Chỉ là chữ ghi chú, không ảnh hưởng người dùng cuối hay dữ liệu; sửa sau rất rẻ và không có rủi ro.
  file: `.github/workflows/nap-mau.yml`
  severity: low
  Đề xuất: known-limits

- **Kiểm lỗi kiểu ghi một tệp tạm vào cây mã, nên hai lần chạy chồng nhau có thể làm nhau đỏ**
  Người dùng thấy gì: Hai lượt kiểm chạy chồng nhau trên cùng bản làm việc có thể làm nhau báo đỏ giả. Nếu bị ngắt giữa chừng, tệp sai kiểu còn sót lại làm mọi lượt kiểm kiểu sau đều đỏ.
  Căn cứ: Chỉ làm phiền người làm bằng kết quả đỏ giả, không động tới dữ liệu khách; thử lại hoặc xoá tệp sót là hết, và chỉ xảy ra khi chạy song song.
  file: `packages/db/seed/typecheck-db.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5: tuyên quét LỚP «mọi ký tự điều khiển và dấu tách dòng Unicode» nhưng ma trận chỉ có điểm-case, thiếu phần tử của chính lớp mà guard chặn**
  Người dùng thấy gì: Bộ kiểm chưa thử một vài ký tự tách dòng hiếm, nên nếu sau này ai đó thu hẹp việc chặn thì bộ kiểm vẫn báo xanh. Hiện tại ô email vẫn từ chối đúng các ký tự đó.
  Căn cứ: Hiện chưa có hậu quả với người dùng vì việc chặn đang hoạt động; rủi ro chỉ nảy sinh nếu sau này sửa nhầm, và bổ sung ca kiểm sau rất rẻ.
  file: `packages/db/seed/nap-ban-that.test.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
