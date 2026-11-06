# Review findings: pooler-che-do-giao-dich (round 1)

## Trong hợp đồng

- **Comment in api.ts says switching mode means changing DATABASE_URL, which contradicts the port switch this PR adds**
  file: `apps/web/src/lib/api.ts:16`
  severity: low
  AC: AC-7
  source: conventions
  detail: The comment on the pool block says "đổi chế độ là đổi `DATABASE_URL`, chủ kho quyết ở Cổng Bằng chứng". The same PR then adds `doiCong` and `DATABASE_POOLER_PORT`, and their docstring says DATABASE_URL is a sealed secret that nobody has to hold to switch mode. ADR-0009 «Sửa đổi 06/11» has the same contradiction: point 3 says to change DATABASE_URL, while points 5 and 6.1 say to keep DATABASE_URL and set DATABASE_POOLER_PORT=6543. Anyone running production who reads the ADR or this comment could go and edit the secret by hand. That is exactly what the switch exists to avoid, and the rollback in 6.4 (delete DATABASE_POOLER_PORT) would then no longer return to 5432. Fix: in both places say the mode is changed with `DATABASE_POOLER_PORT`.
  rationale: AC-7 đòi tài liệu nêu đúng các bước đổi bản thật và cách lùi; ADR-0009 tự mâu thuẫn (sửa DATABASE_URL hay đặt công tắc cổng) nên cách lùi bị sai.

- **Rollback script ignores a failed env removal and still says it rolled back to 5432**
  file: `_acceptance/pooler-che-do-giao-dich/thu/doi-ban-that.mjs:62`
  severity: medium
  AC: AC-6
  source: bugs
  detail: datCongTac(null) calls `vercel env rm DATABASE_POOLER_PORT production -y` and never checks the exit status. In lui() this is the step that actually undoes the change. If removal fails (auth, network, or wrong VERCEL_LINK_DIR), the script still redeploys with DATABASE_POOLER_PORT=6543 in place. choCong("5432") then times out, but line 74 still prints `đã lùi về 5432 — chưa thấy dòng «cổng 5432»...`, which tells the operator the rollback happened when production is still on transaction mode. When value is null the failure should be handled the same way as the add path: use dung(2, ...) and say plainly that the rollback did not take effect. Treat a 'variable not found' exit as success.
  rationale: AC-6 đòi khi có lỗi thì máy tự xoá công tắc và thấy dòng cổng 5432; script báo đã lùi dù xoá thất bại.

- **`--lui` exits 0 even when the rollback was never confirmed**
  file: `_acceptance/pooler-che-do-giao-dich/thu/doi-ban-that.mjs:111`
  severity: medium
  AC: AC-6
  source: bugs
  detail: lui() works out `ve` (whether the `cổng 5432` line appeared after redeploy) but only uses it for the message. It never returns `ve` or sets an exit code. In the `--lui` branch (`await lui(...)`) the process then ends with exit 0 whether or not production came back to 5432. The header documents 0 as green and 1 as red, so a caller or the acceptance kit would read an unconfirmed rollback as a success. The `--doi` paths are fine because they call process.exit(1) after lui(). `--lui` should exit 1 when `ve` is false.
  rationale: AC-6 đòi thấy dòng cổng 5432 sau khi lùi; thoát 0 khi chưa xác nhận thì coi như đạt sai.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The getApi port-switch test leaves the module-level `cached` filled and replaces the process.env object**
  Người dùng thấy gì: Bài kiểm có thể để lại trạng thái giả khiến bài kiểm thêm sau này chạy sai, nhưng người dùng sản phẩm không bị ảnh hưởng.
  Căn cứ: Chỉ ảnh hưởng người viết bài kiểm sau này, không mất dữ liệu, sửa lúc nào cũng rẻ khi có bài kiểm thứ hai gọi cùng hàm.
  file: `apps/web/src/lib/api.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assert âm tính một mình): bài kiểm chỉ soi một dòng khai báo, nên tham số khởi động ở dòng khác vẫn lọt qua**
  Người dùng thấy gì: Nếu sau này ai viết lại cách dựng kết nối theo kiểu nhiều dòng, bài kiểm có thể không phát hiện việc quay lại cách cũ, và khi đó đăng nhập có thể hỏng trên bản dùng chế độ giao dịch.
  Căn cứ: Hiện không ảnh hưởng người dùng, chỉ là lưới an toàn có kẽ hở cho thay đổi tương lai, và có thể vá rẻ khi đụng tới tệp đó.
  file: `_acceptance/pooler-che-do-giao-dich/thu/cach-ly.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): sàn B, người, phiên và cookie ký đều dựng tay, không đi qua bên ghi**
  Người dùng thấy gì: Phép thử cách ly giữa hai sàn dùng dữ liệu dựng tay, nên chưa chứng minh trọn vẹn với sàn do công cụ mở sàn thật tạo ra.
  Căn cứ: Cách ly theo dòng vẫn được bộ kiểm khác bảo đảm, rủi ro thấp, và có thể đổi sang công cụ thật ở lần chạm sau.
  file: `_acceptance/pooler-che-do-giao-dich/thu/pooler-giao-dich.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): ma trận mồi chiều đỏ bỏ sót các dạng viết mà chính đặc tả nêu tên**
  Người dùng thấy gì: Một số cách viết khác của cùng loại lệnh giữ trạng thái phiên chưa có bài kiểm riêng, nên nếu bộ quét bị sửa hỏng thì có thể không ai hay.
  Căn cứ: Hiện các dạng này vẫn bị bắt, nên người dùng không chịu hậu quả; chỉ là lưới kiểm chưa dày, bổ sung sau rất rẻ.
  file: `_acceptance/pooler-che-do-giao-dich/thu/quet-trang-thai-phien.test.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
