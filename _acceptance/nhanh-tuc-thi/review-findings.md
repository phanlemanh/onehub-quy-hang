# Review findings: nhanh-tuc-thi (round 1)

Không có finder nào chết; review đầy đủ.

## Trong hợp đồng

- **Sign-out can recreate the local store after it was wiped, if a send or fetch is still running**
  AC: AC-10
  file: `apps/web/src/lib/sync/react.tsx:57`
  severity: medium
  detail: dangXuat calls `bd.dung()` and then `await kho.wipe()`. `dung()` only cancels the next scheduled timer. It does not wait for the `dangChay` run that is already in progress (mot(): send queue → fetch → doi()). kho-indexeddb.ts wipe() sets `db = null` and deletes the database, and `onblocked` resolves straight away. When the in-progress run reaches `o.kho.write`, `lay()` opens `quy-hang-sync:<user>` again and writes the whole section back: listings, history, queue. That breaks the rule that signing out wipes the user's store (rule 32, AC-10), and it is most likely to happen exactly when the user signs out with pending changes and a retry is running. The sync engine needs a stopped state that blocks further writes, and dangXuat should wait for the current run (or cancel it) before wipe.
  rationale: AC-10 đòi «Vẫn đăng xuất» xoá sạch kho; lượt đồng bộ đang chạy ghi lại kho đã xoá là làm AC này hỏng.
  source: conventions

- **«Sửa lại» bỏ mất giá trị người đã sửa: bảng Cần xem vứt giá trị trả về**
  AC: AC-6
  file: `apps/web/src/components/sync/bang-can-xem.tsx:39`
  severity: high
  detail: `bd.suaLai(id)` gỡ căn khỏi Cần xem và TRẢ VỀ `nhap` (gộp payload của tôi) để điền lại ô (xu-ly-can-xem.ts:30, dong-bo.ts:130-138). Nút gọi `void bd.suaLai(r.listingId)` nên giá trị trả về bị bỏ đi, không có ô nào được điền lại. Kết quả: bấm «Sửa lại» giống hệt «Bỏ thay đổi». Các thao tác của người dùng rời hàng Cần xem và mất hẳn, không báo gì.
  rationale: AC-6 đòi «Sửa lại» trả giá trị của tôi về ô để sửa; nút hiện bỏ giá trị đi.
  source: bugs

- **Đăng xuất xoá kho trong lúc lô đồng bộ đang chạy: lô ghi lại và dựng lại kho đã xoá**
  AC: AC-10
  file: `apps/web/src/lib/sync/react.tsx:57`
  severity: high
  detail: `dangXuat` gọi `bd.dung()` (chỉ huỷ hẹn giờ) rồi `kho.wipe()` ngay, không đợi `dangChay`. Nếu một lượt `mot()` đang chờ mạng (lượt định kỳ, lượt khi quay lại trang, hay lượt sau `sua`), lúc lời gọi trả về nó gọi `doi` → `kho.write` → `lay()`. Vì `wipe` đã đặt `db=null`, `lay()` mở lại cơ sở dữ liệu `quy-hang-sync:<người>` và ghi lại ngăn đầy đủ (hàng, lịch sử, hàng đợi). Thế là vi phạm luật 32 «đăng xuất xoá cả kho». Thêm nữa, kho-indexeddb.ts:45 coi `onblocked` là xong (`ok()`). Khi tab khác còn mở kho (không có `onversionchange` để đóng), đăng xuất vẫn báo xong dù kho chưa xoá.
  rationale: Kho dựng lại sau khi xoá làm AC-10 (xoá sạch kho khi đăng xuất) thất bại.
  source: bugs

- **Hỏi khi đăng xuất chỉ đếm hàng đợi, bỏ qua thay đổi đang nằm ở Cần xem**
  AC: AC-10
  file: `apps/web/src/lib/sync/trang-thai.ts:26`
  severity: medium
  detail: `canHoiKhiDangXuat` chỉ cộng `queue.length`. Khi máy chủ không nhận, các thao tác bị chuyển khỏi `queue` sang `review[].mine` (gui.ts:93-95), dù vẫn là thay đổi chưa lên máy chủ. Vì vậy một người chỉ còn thay đổi ở Cần xem bấm đăng xuất sẽ không được hỏi. `kho.wipe()` lặng lẽ xoá các thay đổi đó, trái với AC-10.
  rationale: Thao tác chờ gồm cả thao tác ở «cần xem»; AC-10 đòi hỏi nói đúng n thay đổi chờ gửi.
  source: bugs

- **Hình dạng 4 — kiểm âm tính đứng một mình: «0 lời gọi mạng» đo trên bộ đếm không hề nối vào đường đọc**
  AC: AC-2
  file: `apps/web/src/lib/sync/doc.test.ts:44`
  severity: high
  detail: Ca «đọc không chờ mạng: lọc, mở hồ sơ, dựng lại từ kho» (E2/AC-2) tạo `mangHong()` ở dòng 28, nhưng hàm gọi mạng `mang.goi` không được đưa cho bất kỳ đường đọc nào. Các lần đọc chỉ gọi hàm thuần `locDanhSach(n, …)` và `moHoSo(n, …)` (dòng 32-35), mà hai hàm này không nhận hàm gọi mạng (doc.ts). Vì vậy `assert.equal(mang.dem(), 0)` ở dòng 44 và 47 luôn đúng theo cấu trúc: dù đường đọc thật có đi qua mạng, ca này vẫn xanh. Đối chứng dương ở dòng 49-50 gọi thẳng `keoVe(mang.goi, …)`. Nó chỉ chứng minh bộ đếm đếm được, không chạy lại các lần đọc đang kiểm, nên không phải đối chứng của cùng đường đi. Ngoài ra eval E2 hứa «dựng bộ đồng bộ mới từ CÙNG kho → các lần đọc cho cùng kết quả», nhưng ca này không dựng `taoBoDongBo` nào. «Dựng lại» ở dòng 46 chỉ gọi lại cùng hai hàm thuần trên cùng kho. Đường đọc thật của sản phẩm là `bd.danhSach()`/`bd.hoSo()` trong dong-bo.ts, và `hoSo` có phát lời gọi `keoLichSu(o.goi, …)` ở nền. Đường này không bị đo: thêm một lời gọi mạng có chờ vào `hoSo`/`danhSach` thì ca vẫn xanh. Chiều đỏ mà eval mô tả («đọc đi qua mạng → số đếm > 0») vì thế không thể xảy ra.
  rationale: AC-2 đòi chứng minh đọc có 0 lời gọi mạng qua bộ đồng bộ; ca kiểm không đi qua đường đọc thật nên không chứng minh được AC này.
  source: measurement

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Sending changes saves server data on the device without the owner-data check**
  Người dùng thấy gì: Lớp kiểm tra chống để lọt thông tin chủ nhà xuống máy chỉ chạy khi tải danh sách, chưa chạy ở bước gửi thay đổi. Hiện máy chủ không trả thông tin chủ nhà ở đường này nên chưa ai thấy hậu quả.
  Căn cứ: Chỉ là lớp bảo vệ thứ hai, chưa có dữ liệu nào lộ, và lớp thứ nhất ở máy chủ vẫn đang chặn.
  file: `apps/web/src/lib/sync/gui.ts`
  severity: medium
  Đề xuất: known-limits

- **Lỗi kéo về nào cũng bị nuốt và báo là «Mất mạng», kể cả khi bắt được nguồn rò ra**
  Người dùng thấy gì: Khi phiên hết hạn hoặc máy chủ lỗi, thanh trên vẫn ghi «Mất mạng» và người dùng không biết nguyên nhân thật. Ứng dụng cứ thử lại mãi.
  Căn cứ: Không mất dữ liệu, chỉ thông báo sai nguyên nhân; đăng nhập lại hoặc tải lại trang là gỡ được.
  file: `apps/web/src/lib/sync/dong-bo.ts`
  severity: medium
  Đề xuất: known-limits

- **Máy chủ trả 5xx hay 401 bị coi là từ chối: thao tác rời hàng đợi sang Cần xem**
  Người dùng thấy gì: Khi máy chủ đang lỗi tạm hoặc phiên hết hạn, thay đổi của người dùng bị đẩy sang «Cần xem» thay vì tự gửi lại sau. Có căn còn mất nút «Sửa lại».
  Căn cứ: Thay đổi không mất, người dùng vẫn giữ được ở Cần xem, nhưng phải xử lý tay một việc lẽ ra tự lành; sửa đụng tới cách phân loại lỗi nên nên tách việc riêng.
  file: `apps/web/src/lib/sync/gui.ts`
  severity: medium
  Đề xuất: new-contract

- **`sua` lấy phiên bản kỳ vọng và số thứ tự ngoài bước đọc-rồi-ghi: hai lần sửa sát nhau dựa cùng phiên bản**
  Người dùng thấy gì: Bấm lưu hai ô rất sát nhau hoặc mở hai tab cùng lúc có thể khiến lần sửa thứ hai bị báo «đụng nhau» với chính mình. Người dùng phải xử lý ở bảng Cần xem.
  Căn cứ: Hiếm gặp, không mất dữ liệu vì thay đổi còn nằm ở Cần xem và người dùng chọn «Giữ của tôi» là xong.
  file: `apps/web/src/lib/sync/dong-bo.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

