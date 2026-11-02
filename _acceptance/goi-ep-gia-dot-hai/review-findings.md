# Review findings: goi-ep-gia-dot-hai (round 2)

## Trong hợp đồng

- **Chọn kết quả bằng chuột rồi bấm Enter thì bỏ chọn thay vì ghi; phím 1/2/3 và H/G/B/K không còn tác dụng**
  AC: AC-6
  file: `apps/web/src/app/(app)/units/call/push/ep-gia.tsx:209`
  severity: medium
  source: bugs
  detail: Bộ nghe phím toàn cửa sổ bỏ qua mọi phím trừ Ctrl+Enter khi con trỏ đang ở một nút nằm ngoài danh sách hỏi: dòng 209 là `if (!laO && !trongDs && !((e.ctrlKey || e.metaKey) && e.key === "Enter")) return;`. Khi đầu chủ bấm chuột vào «Giữ giá» hoặc «Đã cọc / bán…», trình duyệt (Chrome) đặt con trỏ lên chính nút đó. Sau đó, Enter (màn có ghi gợi ý «Ghi Enter») không đi vào nhánh ghi ở dòng 219–221 mà rơi về hành vi mặc định của nút: nút đó bị bấm lại, ToggleGroup một-giá-trị bỏ chọn, gọi onValueChange([]) rồi chonKq(null). Kết quả là lựa chọn biến mất và không có gì được ghi. Cùng lý do đó, phím 1/2/3 để chọn lối bán (dòng 210, nhánh loi-ban) và phím H/G/B/K không chạy sau khi đã bấm chuột vào nhóm kết quả. Lời nhắc phím ở màn vì thế không đúng ngay trong luồng dùng chuột rồi chuyển sang bàn phím.
  rationale: AC-6 đòi: khi «Giữ giá» đang chọn, bấm Enter thì ghi đúng một sự kiện; chọn bằng chuột rồi Enter lại bỏ chọn và không ghi nên tiêu chí không đạt (phím H/G/B/K sau khi bấm chuột cũng trái AC-4).

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The badge at the top of the screen hardcodes «Nên gọi ép giá». The queue was renamed «Nên gọi điều chỉnh giá», and each brokerage can rename it.**
  Người dùng thấy gì: Thẻ trên đầu màn gọi vẫn ghi «Nên gọi ép giá», là chữ cũ đã bỏ, và không theo tên nhóm mà sàn tự đặt. Đầu chủ vẫn gọi và ghi được bình thường, chỉ thấy chữ lệch với màn Hôm nay.
  Căn cứ: Chỉ sai chữ hiển thị, không mất dữ liệu và không cản việc gọi; sửa sau rẻ và an toàn.
  file: `apps/web/src/app/(app)/units/call/push/ep-gia.tsx`
  severity: medium
  Đề xuất: known-limits

- **Không kéo được lịch sử thì khối «Lịch sử trả giá» hiện «Đang tải…» mãi, lỗi bị nuốt**
  Người dùng thấy gì: Nếu mở một căn chưa có lịch sử trên máy lúc mất mạng hoặc máy chủ lỗi, khối lịch sử cứ hiện «Đang tải» mà không báo lỗi hay cho thử lại. Có mạng lại và mở lại thì lịch sử hiện đúng.
  Căn cứ: Chỉ xảy ra khi mất mạng với căn chưa từng mở, không mất dữ liệu và người dùng tự khắc phục bằng cách tải lại khi có mạng.
  file: `apps/web/src/app/(app)/units/call/push/lich-su.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 — so khớp chuỗi «3,6%» trong khi lời hứa là quan hệ giá đáy với giá về tay; ca duy nhất có giá về tay bằng giá niêm yết**
  Người dùng thấy gì: Bài kiểm câu «thấp hơn giá về tay» chỉ thử một trường hợp nên có thể bỏ sót việc tính nhầm khi giá đã gồm phí. Người dùng hiện chưa thấy sai số nào.
  Căn cứ: Không có lỗi hiển thị nào được chứng minh, chỉ là lưới an toàn mỏng; bổ sung ca kiểm sau rẻ và không ảnh hưởng người dùng hôm nay.
  file: `apps/web/src/app/(app)/units/call/push/gia-day.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 2 — fixture ListingView viết tay rồi ép kiểu qua `as unknown as`, không dựng từ bộ gấp sự kiện mà bên đọc thật dùng**
  Người dùng thấy gì: Bài kiểm đầu màn dùng dữ liệu căn tự khai chứ không dựng từ chuỗi sự kiện thật, nên nếu cấu trúc dữ liệu đổi sau này bài kiểm có thể vẫn xanh dù đầu màn sai.
  Căn cứ: Rủi ro chỉ ở lần sửa sau, người dùng hiện không bị ảnh hưởng và sửa bài kiểm sau rẻ.
  file: `apps/web/src/app/(app)/units/call/push/dau-man.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
