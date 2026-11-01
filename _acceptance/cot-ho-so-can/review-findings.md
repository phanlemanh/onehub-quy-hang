# Review findings: cot-ho-so-can (round 1)

## Trong hợp đồng

- **Phần Lịch sử của hồ sơ căn có thể quay khung chờ mãi khi tải lịch sử thất bại (lỗi bị nuốt)**
  AC: AC-5
  file: `apps/web/src/app/(app)/units/ho-so/cot-ho-so.tsx:177`
  severity: medium
  source: bugs
  detail: `trangThaiLichSu({ coBan: lichSu.length > 0, dangTai: !daKeo[can.id], lan: ngan.lastAttempt })` chỉ ra «can-mang» khi `lastAttempt === "mang"`. Mọi trường hợp lịch sử rỗng khác, kể cả khi lượt kéo đã xong (`daKeo` = true), đều rơi vào nhánh `dang-tai`, tức khung chờ. Nhưng `bd.taiLichSu` (dong-bo.ts `taiLichSuCua`) nuốt mọi lỗi bằng `catch {}` mà không cập nhật `lastAttempt`. Còn `keoLichSu` (keo.ts:40), khi gặp trạng thái khác 200 (404 vì lần rao mới tạo trên máy chưa gửi lên, 5xx, phiên hết hạn), trả nguyên bản cũ. Sau đó `taiLichSuCua` ghi `history[id] = []`. Hệ quả: khi mất mạng mà lượt đồng bộ trước vẫn là "ok", hoặc khi máy chủ trả lỗi hay 404, thì lịch sử rỗng, đã kéo xong mà `lan` khác "mang". Khung chờ «Đang tải lịch sử» quay mãi, không báo lỗi, không có đường thử lại. Lời chú thích "lịch sử rỗng nghĩa là chưa tải" sai khi lượt kéo đã kết thúc. Cách sửa gợi ý: khi `daKeo[id]` đã đúng mà vẫn chưa có bản lịch sử thì hiện trạng thái không tải được, hoặc để `taiLichSu` trả về kết quả thành hay bại.
  rationale: Finding nêu ca mất mạng với căn chưa tải lịch sử lần nào mà phần lịch sử quay chờ mãi thay vì ghi «Lịch sử cần mạng để tải lần đầu», đúng điều AC-5 đòi.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Dòng của căn đang mở không được đánh dấu khi đường dẫn không mang `lan`**
  Người dùng thấy gì: Khi mở căn bằng đường link chép từ nơi khác, hoặc chọn toà khi mã căn trùng, hồ sơ vẫn mở đúng nhưng không dòng nào trong bảng được tô sáng. Đầu chủ khó nhận ra đang xem căn nào trong bảng.
  Căn cứ: Hồ sơ vẫn hiện đúng căn, không mất hay lộ dữ liệu; chỉ thiếu dấu tô dòng trong vài đường vào hiếm, bấm lại dòng là có.
  file: `apps/web/src/app/(app)/units/ho-so/bang-co-ho-so.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (chỉ có khẳng định âm, không đối chứng dương): ca số chủ trong báo sai gọi là «đối chứng dương» nhưng chỉ khẳng định âm, và phép quét khoá nguồn không bao giờ bắt được gì**
  Người dùng thấy gì: Bài kiểm cho lời báo sai thông tin căn chưa chứng minh được là sẽ bắt khi số điện thoại chủ nhà lọt vào. Hiện lời báo không chứa thông tin chủ nhà, nhưng nếu sau này có người sửa nhầm thì bài kiểm có thể không kêu.
  Căn cứ: Người dùng hiện không bị ảnh hưởng, chỉ là lưới an toàn cho lần sửa sau còn lỏng; bổ sung bài kiểm sau này rẻ và không mất dữ liệu.
  file: `apps/web/src/app/(app)/units/ho-so/bao-sai.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng ma trận chỉ là danh sách gõ tay): ca «bộ quét bắt ba khối thật» đếm chính mảng vừa gõ, còn evals.yaml vẫn ghi tên ca «hai khối» với 2 phần tử**
  Người dùng thấy gì: Bài kiểm luật giao diện tự đếm danh sách khối do chính nó gõ, nên khi thêm khối mới có thể không ai nhắc kiểm. Tên ca trong hồ sơ nghiệm thu cũ cũng lệch với bài kiểm thật, làm người chấm khó đối chiếu.
  Căn cứ: Không ảnh hưởng người dùng cuối, chỉ làm lưới kiểm giao diện kém chặt và hồ sơ lệch chữ; sửa sau rẻ và không mất dữ liệu.
  file: `packages/ui-lint/tests/kiem-chuan.test.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
