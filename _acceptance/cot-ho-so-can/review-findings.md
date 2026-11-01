# Review findings: cot-ho-so-can (round 2)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Đổi Link của Next sang <a> và onClick luôn preventDefault làm hỏng mở thẻ mới bằng Cmd/Ctrl-click hoặc chuột giữa**
  Người dùng thấy gì: Giữ Cmd hoặc Ctrl rồi bấm vào một lần rao, một toà hay nút Đóng sẽ không mở thẻ mới như người dùng quen, mà đổi ngay trong thẻ đang xem. Bấm thường vẫn chạy đúng.
  Căn cứ: Nhẹ: không mất dữ liệu, chỉ bất tiện khi muốn so hai lần rao ở hai thẻ, và người dùng vẫn tự chép link được.
  file: `apps/web/src/app/(app)/units/ho-so/cot-ho-so.tsx`
  severity: low
  Đề xuất: known-limits

- **Nút «Thử lại» của lịch sử không phản hồi và nuốt lỗi: thử lại hỏng thì màn không đổi gì**
  Người dùng thấy gì: Khi lịch sử không tải được, bấm «Thử lại» mà vẫn lỗi thì màn không đổi gì, người dùng không biết lần thử đã chạy và đã hỏng.
  Căn cứ: Mức vừa: không mất dữ liệu và người dùng tự bấm lại hoặc tải lại trang được, nhưng dễ tưởng nút bị đơ.
  file: `apps/web/src/app/(app)/units/ho-so/cot-ho-so.tsx`
  severity: medium
  Đề xuất: known-limits

- **Chặn mặc định mọi cú bấm nên Cmd/Ctrl+bấm không mở được tab mới cho lần rao, toà và nút Đóng**
  Người dùng thấy gì: Giữ Cmd hoặc Ctrl rồi bấm vào lần rao, toà hay nút Đóng chỉ đổi địa chỉ trong thẻ hiện tại, không mở thẻ khác để so sánh hay chép link.
  Căn cứ: Nhẹ: không mất dữ liệu, người dùng vẫn mở thủ công được, và sửa sau rẻ.
  file: `apps/web/src/app/(app)/units/ho-so/cot-ho-so.tsx`
  severity: low
  Đề xuất: known-limits

- **Bài kiểm của bộ quét bỏ khối thật solution-crm-4 dù khối này vẫn qua, lưới kiểm bị nới cho khớp chữ ở hồ sơ**
  Người dùng thấy gì: Người dùng không thấy gì khác. Bài kiểm nội bộ của bộ quét giao diện kiểm kém hơn một khối đã chuyển thể, nên sau này nếu khối đó mất dòng khai báo thì máy có thể không báo.
  Căn cứ: Không ảnh hưởng người dùng hiện tại và không mất dữ liệu; chỉ là lưới kiểm hẹp hơn, bổ sung lại sau rất rẻ.
  file: `packages/ui-lint/tests/kiem-chuan.test.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP nhưng chỉ có điểm-case): ca «bộ quét bắt hai khối thật» bỏ khối thật solution-crm-4 khỏi danh sách gõ tay, số assert không còn bằng số phần tử bộ quét thấy**
  Người dùng thấy gì: Người dùng không thấy gì khác. Bài kiểm nội bộ chỉ thử hai trong ba khối đã chuyển thể, nên một khối có thể mất khai báo mà không bị phát hiện.
  Căn cứ: Không có hậu quả trực tiếp cho người dùng và không mất dữ liệu; rủi ro chỉ ở việc phát hiện lỗi muộn, và vá lại rất rẻ.
  file: `packages/ui-lint/tests/kiem-chuan.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Dòng của căn đang mở không được đánh dấu khi đường dẫn không mang `lan` (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi mở căn bằng đường link chép từ nơi khác, hoặc chọn toà khi mã căn trùng, hồ sơ vẫn mở đúng nhưng không dòng nào trong bảng được tô sáng. Đầu chủ khó nhận ra đang xem căn nào trong bảng.
  Căn cứ: Hồ sơ vẫn hiện đúng căn, không mất hay lộ dữ liệu; chỉ thiếu dấu tô dòng trong vài đường vào hiếm, bấm lại dòng là có.
  file: `apps/web/src/app/(app)/units/ho-so/bang-co-ho-so.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (chỉ có khẳng định âm, không đối chứng dương): ca số chủ trong báo sai gọi là «đối chứng dương» nhưng chỉ khẳng định âm, và phép quét khoá nguồn không bao giờ bắt được gì (r1)**
  Người dùng thấy gì: Bài kiểm cho lời báo sai thông tin căn chưa chứng minh được là sẽ bắt khi số điện thoại chủ nhà lọt vào. Hiện lời báo không chứa thông tin chủ nhà, nhưng nếu sau này có người sửa nhầm thì bài kiểm có thể không kêu.
  Căn cứ: Người dùng hiện không bị ảnh hưởng, chỉ là lưới an toàn cho lần sửa sau còn lỏng; bổ sung bài kiểm sau này rẻ và không mất dữ liệu.
  file: `apps/web/src/app/(app)/units/ho-so/bao-sai.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng ma trận chỉ là danh sách gõ tay): ca «bộ quét bắt ba khối thật» đếm chính mảng vừa gõ, còn evals.yaml vẫn ghi tên ca «hai khối» với 2 phần tử (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm luật giao diện tự đếm danh sách khối do chính nó gõ, nên khi thêm khối mới có thể không ai nhắc kiểm. Tên ca trong hồ sơ nghiệm thu cũ cũng lệch với bài kiểm thật, làm người chấm khó đối chiếu.
  Căn cứ: Không ảnh hưởng người dùng cuối, chỉ làm lưới kiểm giao diện kém chặt và hồ sơ lệch chữ; sửa sau rẻ và không mất dữ liệu.
  file: `packages/ui-lint/tests/kiem-chuan.test.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
