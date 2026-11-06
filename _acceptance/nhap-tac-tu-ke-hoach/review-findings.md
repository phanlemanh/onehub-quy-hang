# Review findings: nhap-tac-tu-ke-hoach (round 2)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Two new environment variables (ANTHROPIC_API_KEY, QH_AI_GIA) are not declared in .env.example**
  Người dùng thấy gì: Người dựng máy mới không có ghi chú nào nói cần khoá AI, nên tính năng AI âm thầm tắt và họ khó biết vì sao.
  Căn cứ: Chỉ ảnh hưởng người cài đặt, không lộ dữ liệu, nhập vẫn chạy bình thường; thêm ghi chú sau rất rẻ.
  file: `packages/api/src/imports/ai/claude.ts`
  severity: medium
  Đề xuất: known-limits

- **The server's second PII scan skips the `dich` field, a free-text field that also goes to Anthropic**
  Người dùng thấy gì: Một chuỗi chữ tự do do trình duyệt đặt cho đích cột có thể đi tới dịch vụ AI mà không bị máy chủ quét dữ liệu cá nhân lần hai.
  Căn cứ: Là khe hở ở cửa dữ liệu rời công ty nên đáng xử lý nghiêm, nhưng cần gói dựng bất thường mới khai thác được và sửa tương đối rẻ.
  file: `packages/core/src/import/ai/quet.ts`
  severity: medium
  Đề xuất: new-contract

- **Turning AI back on only changes `status`: `approved_by` keeps the first admin and there is no record of who switched it on or off**
  Người dùng thấy gì: Khi một quản trị viên khác bật lại AI cho sàn, hệ thống vẫn ghi người duyệt là người đầu tiên và không lưu ai đã bật hay tắt.
  Căn cứ: Không lộ dữ liệu, chỉ thiếu dấu vết kiểm toán; thêm nhật ký sau này không làm hỏng gì đã chạy.
  file: `packages/api/src/imports/ai/store.ts`
  severity: low
  Đề xuất: new-contract

- **Trưởng nhóm chọn «Đầu chủ giữ căn» khi máy đang chờ AI thì đề xuất đã trả tiền bị bỏ lặng lẽ**
  Người dùng thấy gì: Trưởng nhóm tải tệp rồi chọn đầu chủ lúc máy còn đang đề xuất thì đề xuất bị bỏ không báo gì, nhưng tiền AI vẫn bị tính vào trần tháng.
  Căn cứ: Mất tiền nhỏ và mất đề xuất, nhưng không mất dữ liệu; người dùng tải lại tệp là có lại, nhập vẫn đi được.
  file: `apps/web/src/app/(app)/imports/new/man-nhap.tsx`
  severity: medium
  Đề xuất: new-contract

- **Cờ «đang đọc tệp» giữ suốt lúc chờ AI (tới 240 giây): khoá ô chọn tệp và hiện sai «Đang đọc tệp…»**
  Người dùng thấy gì: Trong lúc chờ AI trả lời (tối đa bốn phút) người dùng không đổi được tệp và màn vẫn ghi «Đang đọc tệp» dù đã đọc xong.
  Căn cứ: Chỉ gây chờ và khó chịu, không mất dữ liệu; hết giờ hoặc có kết quả là hết kẹt, tải lại trang cũng thoát.
  file: `apps/web/src/app/(app)/imports/new/man-nhap.tsx`
  severity: medium
  Đề xuất: known-limits

- **Máy chủ từ chối gói (400/403) bị báo nhầm là «không gửi được tới máy chủ», lý do của máy chủ bị nuốt**
  Người dùng thấy gì: Khi máy chủ cố ý từ chối gói, người dùng được báo là lỗi mạng nên không biết nguyên nhân thật, nhưng vẫn nhập tay được như bình thường.
  Căn cứ: Chỉ sai lời giải thích ở ca hiếm, không mất dữ liệu và nhập vẫn chạy; sửa lời báo sau rẻ.
  file: `apps/web/src/lib/nhap/de-xuat.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): dấu «lập bởi tác tử context sạch» là nhãn do chính script ghi, phép kiểm chỉ chép lại biểu thức của script**
  Người dùng thấy gì: Con số «máy ghép đúng bao nhiêu phần trăm» dựa vào nhãn tự khai là do tác tử độc lập lập, nên chưa chứng minh được nguồn gốc thật của đề xuất.
  Căn cứ: Không ảnh hưởng người dùng cuối; chỉ làm số đo kém tin hơn và sẽ được kiểm lại khi chạy qua API thật ở phiên nghiệm thu.
  file: `packages/core/src/import/ai/do-tac-tu.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E8b hứa «hàm gọi đề xuất không được gọi (đếm 0)» khi AI tắt, nhưng chỉ kiểm hàm điều kiện canHoi**
  Người dùng thấy gì: Nếu sau này ai đó vô tình bỏ dòng chặn khi AI tắt, bộ kiểm tự động vẫn xanh và màn có thể gọi AI dù sàn đã tắt.
  Căn cứ: Hiện chưa có lỗi thật, chỉ thiếu lưới bắt lỗi tương lai; bản ghi mạng của kiểm giao diện đã che một phần.
  file: `apps/web/src/lib/nhap/de-xuat.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (kiểm «chuỗi có mặt» trong khi lời hứa là quan hệ): E7b hứa ở Xem trước «cột ấy đã ghép đúng đích», nhưng chỉ ghi lại sự có mặt của tiêu đề trang**
  Người dùng thấy gì: Bằng chứng chụp màn chỉ cho thấy đã sang được trang Xem trước, chưa chứng minh cột máy đề xuất ghép đúng đích.
  Căn cứ: Chỉ làm hồ sơ nghiệm thu kém chặt, người dùng không gặp gì; lỗi ghép sai đích sẽ bị bắt ở bước người duyệt.
  file: `_acceptance/nhap-tac-tu-ke-hoach/thu/chup.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
