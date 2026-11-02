# Review findings: goi-ep-gia-dot-hai (round 3)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Nhãn nhóm «Nên gọi điều chỉnh giá» viết cứng trên màn ép giá, dù tên nhóm là dữ liệu của sàn**
  Người dùng thấy gì: Nếu một sàn đổi tên nhóm «Nên gọi điều chỉnh giá», màn ghi cuộc gọi vẫn hiện tên mặc định, lệch với tên trên màn Hôm nay. Chỉ lệch chữ, không sai dữ liệu.
  Căn cứ: Chỉ sàn đã đổi tên nhóm mới thấy chữ lệch, không mất hay sai dữ liệu nào, và sàn dùng tên mặc định thì không bị ảnh hưởng.
  file: `apps/web/src/app/(app)/units/call/push/ep-gia.tsx`
  severity: medium
  Đề xuất: known-limits

- **Enter on a result option that is focused but not selected saves the selected result instead**
  Người dùng thấy gì: Nếu đầu chủ chọn «Giữ giá» rồi dùng phím mũi tên sang lựa chọn khác và nhấn Enter để chọn, máy ghi ngay «Còn · giữ giá» thay vì chuyển lựa chọn. Một sự kiện ghi nhầm có thể phải sửa lại sau.
  Căn cứ: Chỉ xảy ra khi người dùng di chuyển bằng mũi tên trong nhóm kết quả rồi Enter, và lần ghi nhầm có thể làm lệch mốc xác nhận với chủ nhà nên đáng cân nhắc, nhưng ít gặp.
  file: `apps/web/src/app/(app)/units/call/push/ep-gia.tsx`
  severity: medium
  Đề xuất: known-limits

- **The Enter-after-mouse-click test script does not check what its comment promises, and synthetic events skip the native behaviour the fix is about**
  Người dùng thấy gì: Bài thử tự động cho thao tác bấm chuột rồi Enter chưa chứng minh được điều nó hứa, nên lỗi bấm lại làm mất lựa chọn có thể lọt qua mà vẫn báo đạt. Người dùng không thấy gì cho đến khi lỗi thật xảy ra.
  Căn cứ: Không ảnh hưởng người dùng trực tiếp, chỉ làm giảm độ tin của bằng chứng nghiệm thu, và có thể bổ sung bài thử chặt hơn sau mà không đụng đến sản phẩm.
  file: `_acceptance/goi-ep-gia-dot-hai/thu/thu-chuot-enter.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 — assert «chuỗi có mặt» trong khi lời hứa là quan hệ đếm (đúng một owner_confirmed, không bỏ chọn)**
  Người dùng thấy gì: Bài thử chỉ kiểm có dòng chữ «Đã ghi» hiện ra, không đếm số lần ghi và không kiểm lựa chọn còn được giữ. Ghi hai lần hay mất lựa chọn vẫn có thể được báo là đạt.
  Căn cứ: Là chỗ hở của bằng chứng thử chứ không phải lỗi người dùng đang gặp, nên ghi lại để lần sau siết chặt, chưa cần chặn việc phát hành.
  file: `_acceptance/goi-ep-gia-dot-hai/thu/thu-chuot-enter.mjs`
  severity: medium
  Đề xuất: known-limits

- **The badge at the top of the screen hardcodes «Nên gọi ép giá». The queue was renamed «Nên gọi điều chỉnh giá», and each brokerage can rename it. (r2 · tệp đã đổi)**
  Người dùng thấy gì: Thẻ trên đầu màn gọi vẫn ghi «Nên gọi ép giá», là chữ cũ đã bỏ, và không theo tên nhóm mà sàn tự đặt. Đầu chủ vẫn gọi và ghi được bình thường, chỉ thấy chữ lệch với màn Hôm nay.
  Căn cứ: Chỉ sai chữ hiển thị, không mất dữ liệu và không cản việc gọi; sửa sau rẻ và an toàn.
  file: `apps/web/src/app/(app)/units/call/push/ep-gia.tsx`
  severity: medium
  Đề xuất: known-limits

- **Không kéo được lịch sử thì khối «Lịch sử trả giá» hiện «Đang tải…» mãi, lỗi bị nuốt (r2)**
  Người dùng thấy gì: Nếu mở một căn chưa có lịch sử trên máy lúc mất mạng hoặc máy chủ lỗi, khối lịch sử cứ hiện «Đang tải» mà không báo lỗi hay cho thử lại. Có mạng lại và mở lại thì lịch sử hiện đúng.
  Căn cứ: Chỉ xảy ra khi mất mạng với căn chưa từng mở, không mất dữ liệu và người dùng tự khắc phục bằng cách tải lại khi có mạng.
  file: `apps/web/src/app/(app)/units/call/push/lich-su.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 — so khớp chuỗi «3,6%» trong khi lời hứa là quan hệ giá đáy với giá về tay; ca duy nhất có giá về tay bằng giá niêm yết (r2)**
  Người dùng thấy gì: Bài kiểm câu «thấp hơn giá về tay» chỉ thử một trường hợp nên có thể bỏ sót việc tính nhầm khi giá đã gồm phí. Người dùng hiện chưa thấy sai số nào.
  Căn cứ: Không có lỗi hiển thị nào được chứng minh, chỉ là lưới an toàn mỏng; bổ sung ca kiểm sau rẻ và không ảnh hưởng người dùng hôm nay.
  file: `apps/web/src/app/(app)/units/call/push/gia-day.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 2 — fixture ListingView viết tay rồi ép kiểu qua `as unknown as`, không dựng từ bộ gấp sự kiện mà bên đọc thật dùng (r2)**
  Người dùng thấy gì: Bài kiểm đầu màn dùng dữ liệu căn tự khai chứ không dựng từ chuỗi sự kiện thật, nên nếu cấu trúc dữ liệu đổi sau này bài kiểm có thể vẫn xanh dù đầu màn sai.
  Căn cứ: Rủi ro chỉ ở lần sửa sau, người dùng hiện không bị ảnh hưởng và sửa bài kiểm sau rẻ.
  file: `apps/web/src/app/(app)/units/call/push/dau-man.test.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/4 lỗi rơi vào file không bộ đo nào phủ (_acceptance/goi-ep-gia-dot-hai/thu/thu-chuot-enter.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
