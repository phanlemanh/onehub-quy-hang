# Review findings: trang-thai-rieng (round 5)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E12-step5.png, the screenshot the contract names, is the wrong account and shows no «Giữ chỗ»**
  Người dùng thấy gì: Sản phẩm không bị ảnh hưởng. Chỉ là ảnh minh chứng cho bước kiểm trên máy thứ hai nằm sai tên, nên người duyệt mở đúng tệp sẽ thấy màn của quản trị thay vì căn «Giữ chỗ».
  Căn cứ: Không ảnh hưởng người dùng thật, chỉ gây nhầm cho người duyệt hồ sơ và sửa lại chỉ là đổi tên hay chụp lại một ảnh.
  file: `_acceptance/trang-thai-rieng/evidence/E12-step5.png`
  severity: high
  Đề xuất: known-limits

- **E12-network.txt has no record of the second account signing in, so it does not support step 5**
  Người dùng thấy gì: Sản phẩm vẫn chạy như cũ. Nhật ký ghi lại không chứng minh được việc đăng nhập bằng tài khoản thứ hai, nên người duyệt chỉ có ảnh chụp để tin rằng nhãn đã đến máy khác.
  Căn cứ: Chỉ làm bằng chứng yếu hơn chứ không làm sai hay mất dữ liệu của người dùng, và có thể bổ sung bằng cách chạy lại bước kiểm.
  file: `_acceptance/trang-thai-rieng/evidence/E12-network.txt`
  severity: medium
  Đề xuất: known-limits

- **E12-step5.png, the file the current eval asks for, shows the admin on a placeholder screen with no unit or «Giữ chỗ» label**
  Người dùng thấy gì: Sản phẩm không bị ảnh hưởng. Ảnh minh chứng bước thứ năm hiện cho thấy màn đang dựng của quản trị chứ không phải căn mang nhãn «Giữ chỗ», nên người duyệt đọc nhầm kết quả.
  Căn cứ: Không gây hại cho người dùng, chỉ làm sai hồ sơ duyệt, và sửa rẻ bằng cách thay ảnh đúng vào.
  file: `_acceptance/trang-thai-rieng/evidence/E12-step5.png`
  severity: medium
  Đề xuất: known-limits

- **E12-network.txt has no sign-in requests at all, including for the step-5 fresh-browser login as a second user**
  Người dùng thấy gì: Sản phẩm không đổi. Hồ sơ kiểm không chứng minh được rằng bước kiểm máy thứ hai chạy trên phiên mới hoàn toàn, nên điểm chờ đồng bộ chưa có bằng chứng.
  Căn cứ: Không ảnh hưởng người dùng thật, chỉ làm hồ sơ kiểm thiếu một mảnh bằng chứng, có thể chạy lại bước để ghi bù.
  file: `_acceptance/trang-thai-rieng/evidence/E12-network.txt`
  severity: low
  Đề xuất: known-limits

- **Đổi nhãn tại chỗ trong Đang giao dịch / Đã bán bỏ qua phép so phiên bản (luật «thắng ngay») (r4)**
  Người dùng thấy gì: Hai người cùng đổi nhãn của một căn đang giao dịch hoặc đã bán: lần đổi đến sau, dựa trên bản cũ, âm thầm đè lần trước mà không báo «Cần xem».
  Căn cứ: Chỉ đổi chữ nhãn, không mất dữ liệu quan trọng và người dùng đổi lại được; nhưng hành vi lệch với Đang bán nên đáng xử lý cùng lỗi liên quan trong một việc riêng.
  file: `packages/api/src/listings/store.ts`
  severity: medium
  Đề xuất: new-contract

- **Tham số `nhan` của apTrenMay không nơi nào truyền — kiểm mã nhãn trên máy là mã chết (r4)**
  Người dùng thấy gì: Khi dùng nhãn đã bị gỡ ở chế độ ngoại tuyến, máy hiện đổi nhãn trước rồi mới bị máy chủ từ chối và lùi lại.
  Căn cứ: Chỉ là một nháy hiển thị sai rồi tự lùi, không mất dữ liệu và máy chủ vẫn chặn đúng, nên ghi lại là đủ.
  file: `apps/web/src/lib/sync/ap-tren-may.ts`
  severity: low
  Đề xuất: known-limits

- **Đổi nhãn tại chỗ trong Đang giao dịch bỏ qua phép so phiên bản, nên một lệnh cũ âm thầm kéo căn về Đang giao dịch (r4)**
  Người dùng thấy gì: Nếu căn vừa được đưa về Đang bán (ví dụ khách bỏ cọc) mà một máy cũ còn gửi lệnh đổi nhãn, căn bị kéo ngược về Đang giao dịch mà không ai được báo.
  Căn cứ: Làm sai trạng thái thật của căn và hiện sai ra Bảng hàng và trang khách, tuy hiếm gặp và sửa lại bằng tay được; nên mở việc riêng để sửa kỹ.
  file: `packages/api/src/listings/store.ts`
  severity: high
  Đề xuất: new-contract

- **Màn Trạng thái cho Lưu dù nhãn thay đã chọn đã bị gỡ trong cùng lượt, máy chủ trả 400 (r4)**
  Người dùng thấy gì: Quản trị sàn gỡ một nhãn rồi chọn nhãn thay, sau đó gỡ luôn nhãn thay ấy, thì nút Lưu vẫn bật nhưng lưu bị từ chối và màn không chỉ cách sửa.
  Căn cứ: Chỉ gặp ở thao tác hiếm, không mất dữ liệu và người dùng tự gỡ rồi chọn lại được.
  file: `apps/web/src/app/(app)/settings/statuses/trang-thai-thuan.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5: tuyên quét LỚP «mọi chỗ đọc payload ->> 'to'» nhưng toàn bộ migration gộp thành một dòng, chỉ đo một điểm (r4)**
  Người dùng thấy gì: Người dùng không thấy gì ngay; chỉ là bài kiểm tự động có thể không báo đỏ nếu sau này có thêm luật cơ sở dữ liệu đọc trạng thái đích mà quên tính đến nhãn.
  Căn cứ: Rủi ro nằm ở khâu kiểm thử về sau, không ảnh hưởng người dùng hôm nay và bổ sung sau rẻ.
  file: `packages/api/test-db/trang-thai-rieng/nhan.test.ts`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 4/4 lỗi rơi vào file không bộ đo nào phủ (_acceptance/trang-thai-rieng/evidence/E12-step5.png, _acceptance/trang-thai-rieng/evidence/E12-network.txt) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
