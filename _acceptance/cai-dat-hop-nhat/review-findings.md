# Review findings: cai-dat-hop-nhat (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **CONTEXT.md có hai dòng cùng tên code `settings` với nghĩa trái nhau**
  Người dùng thấy gì: Bảng từ vựng còn một dòng cũ nói «Cài đặt sàn» là nhà của quản trị sàn, trái với dòng mới. Người đọc tài liệu có thể hiểu sai tên gọi, còn người dùng cuối không thấy gì khác.
  Căn cứ: Chỉ ảnh hưởng người đọc tài liệu, không mất dữ liệu và không đổi hành vi sản phẩm; sửa một dòng chữ sau này là xong.
  file: `CONTEXT.md`
  severity: low
  Đề xuất: known-limits

- **A failed sign-out is hidden: the local store is wiped, the server session stays live, and the user is sent back into the app with no message**
  Người dùng thấy gì: Khi mạng chập chờn lúc bấm Đăng xuất, dữ liệu chưa gửi trên máy bị xoá nhưng tài khoản vẫn đăng nhập và người dùng bị đưa lại vào app mà không có lời báo nào. Họ tưởng đã thoát trong khi máy vẫn còn đăng nhập.
  Căn cứ: Hậu quả vừa: tài khoản còn mở trên máy dùng chung và thay đổi chưa gửi đã mất, nhưng chỉ xảy ra khi mạng lỗi đúng lúc đó và người dùng đăng xuất lại được; nên làm thành việc riêng vì liên quan cả nhánh đăng xuất của hàng trước.
  file: `apps/web/src/components/shell/dang-xuat-tren-may.ts`
  severity: medium
  Đề xuất: new-contract

- **Hình 5 (tuyên ma trận lớp nhưng ô không độc lập): E5 «12 ô vai × đường» không truyền đường vào hàm chặn**
  Người dùng thấy gì: Bài kiểm tự động về việc chặn mục sàn đối với người không phải quản trị phủ ít tổ hợp hơn tên gọi của nó. Nếu sau này có lỗi ở một tổ hợp vai và đường vào cụ thể, bài kiểm này có thể không bắt được.
  Căn cứ: Không ảnh hưởng người dùng hiện tại và không mất dữ liệu; nghiệm thu trên màn thật vẫn kiểm ma trận này nên rủi ro thấp, bổ sung bài kiểm sau là rẻ.
  file: `apps/web/src/app/(app)/settings/cai-dat.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 1 (đo chỉ dẫn thay vì đầu ra): E6 «dòng cài và thông báo chứa trên máy này» bằng regex trên mã nguồn man-toi.tsx**
  Người dùng thấy gì: Bài kiểm tự động xác nhận nhãn «trên máy này» bằng cách đọc chữ trong mã, không dựng màn thật. Nếu nhãn này hiện sai dòng trong tương lai, bài kiểm có thể vẫn xanh.
  Căn cứ: Chỉ là chữ nhãn trên màn, người dùng thấy sai thì không mất gì và tải lại hay sửa nhãn là xong; sửa bài kiểm sâu hơn thì tốn công hơn lợi ích.
  file: `apps/web/src/app/(app)/settings/cai-dat.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 (đối chứng đỏ không chạm assertion thật): bài đỏ Đọc hẹp kiểm một hàm lech viết lại tại chỗ**
  Người dùng thấy gì: Bài kiểm chứng minh rằng phép đo bề rộng Đọc hẹp sẽ bắt lỗi thực ra không chạm vào phép đo thật. Nếu phép đo thật bị gỡ nhầm, bài này vẫn báo xanh và nội dung có thể lại bị căn giữa mà không ai hay.
  Căn cứ: Không ảnh hưởng người dùng hôm nay vì bố cục đang đúng và được đo trên màn thật ở bước nghiệm thu; chỉ làm giảm lưới an toàn về sau.
  file: `apps/web/src/components/bo-cuc/bo-cuc.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 1 (báo giá trị tự khai thay vì đo đầu ra): soLanBam trong bằng chứng ui-check E11 là hằng số gán tay**
  Người dùng thấy gì: Con số «tối đa hai lần bấm» trong bằng chứng được ghi tay chứ không đếm thật. Chưa có dấu hiệu người dùng phải bấm nhiều hơn, nhưng bằng chứng chưa tự chứng minh điều đó.
  Căn cứ: Không ảnh hưởng người dùng và không mất dữ liệu; hợp đồng đã giao việc đếm lần bấm cho phiên nghiệm thu của người, nên chỉ cần ghi rõ giới hạn này.
  file: `_acceptance/cai-dat-hop-nhat/thu/chay-ui.mjs`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(không có)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
