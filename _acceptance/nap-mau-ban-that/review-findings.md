# Review findings: nap-mau-ban-that (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **NODE_ENV=production đặt ở cấp job làm npm ci bỏ devDependencies, nên tsx không được cài và nút nạp hỏng ngay bước chạy bộ nạp**
  Người dùng thấy gì: Khi chủ kho bấm nút nạp hoặc gỡ dữ liệu mẫu trên bản thật, nút có thể báo lỗi ngay và không nạp được gì. Dữ liệu không bị hỏng, chỉ là tính năng chưa dùng được.
  Căn cứ: Nút hỏng thì không mất hay lộ dữ liệu nào, chủ kho bấm lại là thấy ngay lỗi, và sửa rẻ nhưng cần đổi cả cấu hình lẫn luật kiểm nên nên làm thành việc riêng.
  file: `.github/workflows/nap-mau.yml`
  severity: high
  Đề xuất: new-contract

- **Bộ nạp bản thật viết bằng TypeScript nhưng không nằm trong typecheck của gói nào**
  Người dùng thấy gì: Mã của bộ nạp dữ liệu mẫu không được máy kiểm kiểu soát, nên lỗi kiểu có thể lọt qua mà không ai biết. Người dùng chưa thấy ảnh hưởng ngay.
  Căn cứ: Hậu quả nhẹ và gián tiếp, không làm mất hay lộ dữ liệu, nhưng về lâu dài lỗi kiểu có thể lọt vào mã ghi cơ sở dữ liệu thật nên đáng xử lý trong một việc riêng.
  file: `packages/db/seed/nap-ban-that.ts`
  severity: medium
  Đề xuất: new-contract

- **Email input written to GITHUB_ENV without newline check lets the dispatcher inject env vars (e.g. NODE_OPTIONS) into the step that holds production secrets**
  Người dùng thấy gì: Người có quyền bấm nút có thể gõ vào ô email một chuỗi đặc biệt để chạy lệnh tuỳ ý với khoá và cơ sở dữ liệu bản thật, lách qua rào chỉ cho nhánh chính. Cần có quyền bấm nút trước nên không phải ai cũng làm được.
  Căn cứ: Hậu quả nặng vì chạm khoá và cơ sở dữ liệu bản thật, nhưng chỉ người đã có quyền kích hoạt mới khai thác được, và sửa rẻ nên nên làm sớm thành việc riêng.
  file: `.github/workflows/nap-mau.yml`
  severity: medium
  Đề xuất: new-contract

- **Assertion âm-tính-một-mình: quét kho tìm email chủ kho không bao giờ đỏ được (E5)**
  Người dùng thấy gì: Bài kiểm xác nhận email chủ kho không bị ghi vào kho luôn báo xanh, nên nếu sau này có ai lỡ ghi email thật vào kho thì bài kiểm này không bắt được.
  Căn cứ: Hiện chưa có email nào bị lộ, chỉ là lưới bắt lỗi này chưa chắc chắn, nên ghi lại như hạn chế đã biết là đủ.
  file: `packages/db/seed/nap-ban-that.test.ts`
  severity: high
  Đề xuất: known-limits

- **Assert «chuỗi có mặt» trong khi lời hứa là QUAN HỆ: bước chặn nhánh và bước xác nhận gỡ (E8)**
  Người dùng thấy gì: Bài kiểm rào chặn nhánh và xác nhận gỡ chỉ xem các chữ có mặt hay không, nên nếu ai sửa ngược điều kiện thì bài kiểm vẫn xanh và rào có thể mất tác dụng mà không ai hay.
  Căn cứ: Rào hiện tại vẫn đang đúng, rủi ro chỉ xuất hiện khi có người sửa sai sau này, và chủ kho sẽ thấy khi bấm thử nên ghi lại hạn chế là hợp lý.
  file: `packages/db/seed/nap-mau-yml.test.mjs`
  severity: high
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình: đọc chéo ra 0 dòng ở listing_owners, leads, listing_events không có đối chứng dương (E9)**
  Người dùng thấy gì: Bài kiểm xác nhận thành viên sàn thật không thấy chủ nhà, lead và sự kiện của sàn mẫu có thể xanh chỉ vì phép đọc không trả được dòng nào, chứ chưa chắc nhờ cách ly thật.
  Căn cứ: Bộ kiểm cách ly riêng của kho vẫn là lưới chính cho phần này, nên chỗ yếu này chỉ làm bằng chứng kém chắc chứ không mở lỗ lộ dữ liệu.
  file: `packages/db/seed/nap-ban-that.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Assertion âm-tính không ghim thông điệp: assert.throws với chuỗi là thông điệp hiển thị, không phải bộ kiểm lỗi (E2)**
  Người dùng thấy gì: Bài kiểm giải số chủ nhà bằng khoá sai chỉ xác nhận có lỗi xảy ra, chứ không xác nhận đúng loại lỗi, nên một lỗi khác cũng làm bài kiểm xanh.
  Căn cứ: Hậu quả rất nhẹ vì ca này vẫn có đối chứng dương đi kèm và không liên quan đến dữ liệu thật, nên ghi lại hạn chế là đủ.
  file: `packages/db/seed/nap-ban-that.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
