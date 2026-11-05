# Review findings — hom-nay-dau-chu-dien-thoai (round 1)

## Trong hợp đồng

- **Chạm «Gọi» hai lần liên tiếp mở số hai lần (ghi hai vết mở số trên máy chủ)**
  file: `apps/web/src/app/(app)/today/mobile/danh-sach.tsx:345`
  severity: medium
  AC: AC-4
  source: bugs
  detail: Hàm `goi(t)` gọi `chayGoi` mà không đánh dấu dòng đang bận. Nút Gọi chỉ bị tắt bởi `t.ban` (lấy từ `dangGhi` của màn cha) và `!coMang`, nên trong lúc `moSo()`/`moSoChu()` chưa trả về, nút vẫn bấm được. `t.soCu` vẫn là null cho tới khi `daMo` gọi `setSoDaMo`, nên lần chạm thứ hai gửi thêm một POST phone-reveal, máy chủ ghi thêm một sự kiện mở số, và `tel:` bị mở hai lần. Đường máy tính (`hd.moSo` ở hom-nay-dau-chu.tsx) gọi `ban(id, true)` trước khi mở số để chặn đúng chuyện này. Đường điện thoại bỏ bước đó, nên luật «một lần mở số mỗi dòng trong phiên» và số vết mở số đều sai khi người dùng chạm hai lần.
  rationale: AC-4 đòi mỗi dòng mở số một lần trong phiên; chạm hai lần trước khi số về mở số hai lần làm AC này thất bại.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **moSoChu shows the wrong message on 403: server says the user no longer holds the listing, UI says the listing has no owner number**
  Người dùng thấy gì: Khi căn vừa được giao lại cho người khác mà máy chưa cập nhật, đầu chủ chạm Gọi sẽ bị báo là căn chưa có số và được bảo đi ghi số, trong khi thật ra họ không còn giữ căn.
  Căn cứ: Chỉ là lời báo sai trong tình huống hiếm, không mất hay lộ dữ liệu, người dùng tải lại là thấy đúng, và nhiều khả năng sửa cùng với việc làm mới dữ liệu về sau.
  file: `apps/web/src/app/(app)/today/mobile/mo-so-chu.ts`
  severity: medium
  Đề xuất: known-limits

- **E1 tests the breakpoint function laDienThoai, which production never uses**
  Người dùng thấy gì: Bài kiểm khổ màn hình đo một mốc chép riêng, nên nếu sau này mốc thật đổi thì bài kiểm vẫn xanh trong khi màn điện thoại và máy tính có thể chuyển sai chỗ.
  Căn cứ: Hôm nay người dùng không gặp lỗi gì, rủi ro chỉ xuất hiện khi ai đó đổi mốc sau này và có thể nhìn thấy ngay khi mở màn, nên ghi lại là đủ.
  file: `apps/web/src/app/(app)/today/mobile/goi.ts`
  severity: medium
  Đề xuất: known-limits

- **The red control in E4 (wrong order) is circular and never runs a check against chayGoi**
  Người dùng thấy gì: Bài kiểm chứng minh thứ tự mở số rồi mới gọi có một chiều đối chứng luôn xanh, nên nếu thứ tự bị đảo thì chiều ấy không báo được.
  Căn cứ: Không ảnh hưởng người dùng hiện tại, bài kiểm chiều xanh vẫn bảo vệ thứ tự, và sửa sau rẻ.
  file: `apps/web/src/app/(app)/today/mobile/goi.test.ts`
  severity: low
  Đề xuất: known-limits

- **Lỗi 403 khi mở số chủ bị báo nhầm thành «Căn chưa có số chủ»**
  Người dùng thấy gì: Đầu chủ không còn giữ căn lại được bảo là căn chưa có số và nên ghi số, làm họ hiểu sai nguyên nhân.
  Căn cứ: Chỉ là lời báo chưa đúng ở tình huống hiếm, không mất dữ liệu, người dùng tải lại là rõ, sửa sau rẻ.
  file: `apps/web/src/app/(app)/today/mobile/mo-so-chu.ts`
  severity: low
  Đề xuất: known-limits

- **Khoá ngăn kết quả trong sessionStorage không bị xoá khi dòng của nó không còn**
  Người dùng thấy gì: Hiếm khi, một căn vừa rời danh sách rồi quay lại trong cùng phiên có thể tự bật ngăn Kết quả cuộc gọi dù người dùng chưa gọi.
  Căn cứ: Tình huống hiếm, ngăn chỉ cần đóng là hết, không ghi gì sai vào dữ liệu.
  file: `apps/web/src/app/(app)/today/mobile/danh-sach.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình 4 — assertion âm tính một mình: chiều đỏ E4 tự dựng hàm sai rồi assert.notDeepEqual trên chính nó**
  Người dùng thấy gì: Chiều đối chứng của bài kiểm thứ tự gọi luôn xanh nên không chứng minh được khả năng bắt lỗi đảo thứ tự.
  Căn cứ: Người dùng không gặp gì hôm nay, bài kiểm chiều xanh vẫn giữ thứ tự, và sửa sau rẻ.
  file: `apps/web/src/app/(app)/today/mobile/goi.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình 2 — fixture viết tay đúng khuôn bên đọc: E1 không đi qua chiaNhom, thứ tự nhóm do test tự đặt**
  Người dùng thấy gì: Bài kiểm không chứng minh được thứ tự nhóm trên điện thoại khớp máy tính, nên nếu hai bên lệch sau này thì bài kiểm không báo.
  Căn cứ: Hôm nay người dùng thấy đúng, lệch nếu có sẽ lộ ngay khi mở màn, và bổ sung bài kiểm sau là rẻ.
  file: `apps/web/src/app/(app)/today/mobile/danh-sach.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình 2/3 — màu hạn so với bảng LOP_HAN chép tay, không so với MAU_HAN và mucHan của máy tính**
  Người dùng thấy gì: Nếu máy tính đổi màu hay ngưỡng hạn thì thẻ điện thoại có thể lệch mà bài kiểm không báo.
  Căn cứ: Hiện thẻ hiển thị đúng, rủi ro chỉ ở lần đổi sau và chỉ là sai màu thấy được bằng mắt, sửa rẻ.
  file: `apps/web/src/app/(app)/today/mobile/danh-sach.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình 2 — E7 đo nhánh «lỗi → Thử lại» và «trống» bằng đầu vào mà nơi gọi thật không bao giờ tạo**
  Người dùng thấy gì: Khi tải việc bị lỗi trên điện thoại, có thể màn không hiện nút Thử lại dù bài kiểm báo đạt, người dùng phải tải lại trang.
  Căn cứ: Người dùng tự gỡ được bằng cách tải lại, không mất dữ liệu, nhưng nên xác nhận sớm vì chạm vào trải nghiệm khi lỗi.
  file: `apps/web/src/app/(app)/today/mobile/danh-sach.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình 1/4 — E6 «Còn · giữ giá gọi hàm ghi cả khi mất mạng» chỉ đo việc thiếu thuộc tính disabled**
  Người dùng thấy gì: Bài kiểm chỉ chứng minh nút Còn · giữ giá bấm được khi mất mạng, chưa chứng minh việc ghi thật được gửi sau.
  Căn cứ: Không có dấu hiệu người dùng mất dữ liệu hôm nay, việc ghi dùng chung hàm đã kiểm ở máy tính, và bổ sung bài kiểm sau rẻ.
  file: `apps/web/src/app/(app)/today/mobile/danh-sach.test.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
