# Review findings: du-lieu-mau-san-thu (round 1)

## Trong hợp đồng

- **The real-phone-number scanner misses numbers that sit next to other digits or use the +84 prefix**
  AC: AC-2
  file: `packages/db/seed/du-lieu-mau.mjs:180`
  severity: medium
  source: bugs
  detail: The DAY_SO pattern `/\d[\d .]{7,}\d/g` is greedy and treats spaces and dots as part of a number. So it joins a phone number to any digit that follows a space into one long run. quetChuoi only checks runs that come out to exactly 10 digits starting with 0, or exactly 9 digits starting with 3/5/7/8/9. Any other length is skipped silently, with no error. I ran it against the current code: "0912345678 0987654321" (two real numbers joined into a 20-digit run), "0912 345 678 2 phòng" (11 digits) and "+84 912 345 678" (11 digits starting with 84) all returned loi=[] and so=0. Only a lone "0912345678" was caught. This is a false negative in the very check behind the rule that no real personal data goes into the repo. Both kiemDuLieuThat and kiemXlsxThat in the test rely on quetChuoi, so a real number in a note field, written in one of these common forms, passes the check. The current tamper test only uses one lone number ("0912 345 678"), so it does not cover this. Fix: match each phone-sized group separately (a non-greedy pattern with word boundaries), or flag every run of 9 or more digits that is not in the sample format. Also handle the 84/+84 prefix.
  rationale: AC-2 đòi chèn một số điện thoại khác dạng vào bản sao thì bài quét phải đỏ, mà bài quét bỏ lọt số thật khi dính chữ số khác hoặc có tiền tố +84.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Lệnh nạp và xoá báo «xem .env.example» nhưng không tự đọc .env.local như công cụ vận hành cùng loại**
  Người dùng thấy gì: Người dựng sàn thử ghi địa chỉ cơ sở dữ liệu vào tệp cấu hình theo lời nhắc nhưng lệnh nạp vẫn báo thiếu, nên phải tự khai báo biến đó trước khi chạy.
  Căn cứ: Chỉ gây vướng lúc chạy lần đầu, không mất hay lộ dữ liệu, người dùng tự khắc phục được ngay bằng cách khai báo biến rồi chạy lại, và sửa sau rất rẻ.
  file: `packages/db/seed/nap.mjs`
  severity: low
  Đề xuất: known-limits
- **Hình dạng 4 (assertion âm tính một mình): hai luật lead ở AC-5 không có ca phá thử nào**
  Người dùng thấy gì: Bộ kiểm không chứng minh được rằng nó sẽ báo lỗi khi dữ liệu mẫu thiếu lead trên căn đã có hàng mở hoặc thiếu lead mang số chủ nhà đã có, nên sau này dữ liệu hỏng có thể vẫn qua.
  Căn cứ: Dữ liệu mẫu hiện tại đúng và chỉ là dữ liệu giả cho sàn thử, nên không ảnh hưởng người dùng thật; rủi ro chỉ ở lần sửa sau, và bổ sung ca thử sau rất rẻ.
  file: `packages/db/seed/du-lieu-mau.test.mjs`
  severity: medium
  Đề xuất: known-limits
- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có một điểm): AC-4 hứa kiểm toà, tầng, trục nhưng chỉ phá tầng**
  Người dùng thấy gì: Bộ kiểm mới chứng minh được việc bắt lỗi lệch tầng, chưa chứng minh bắt được lỗi lệch toà hay lệch trục của căn trong dữ liệu mẫu.
  Căn cứ: Dữ liệu mẫu hiện đúng, không có hại cho người dùng và chỉ là dữ liệu giả; thêm ca thử cho toà và trục sau rất rẻ.
  file: `packages/db/seed/du-lieu-mau.test.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
