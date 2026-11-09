## Trong hợp đồng

- **Lỗi máy chủ sau khi đã nhận ra token thu hồi thì trả 500 mà không ghi nhật ký**
  AC: AC-7
  file: `packages/api/src/catalog/feeds-token.ts:90`
  severity: low
  source: bugs
  detail: Khối try ở dòng 78-92 bọc cả traToken lẫn doThoaThuanKetThuc. Với token đã thu hồi, t đã có giá trị. Nếu doThoaThuanKetThuc (dòng 83) ném lỗi, catch ở dòng 90 chỉ gọi baoLoi, trả 500, không gọi ghiRieng(..., 'server_error'). AC-7 và thiết kế §5 đòi mỗi lời gọi mang token nhận ra được một dòng, kể cả lỗi giữa chừng. Khối try thứ hai (dòng 153) có ghi, khối này thì không. Ca kiểm server_error trong nhat-ky.test.ts chỉ phủ lỗi ở móc truocKhiGhi nên không bắt được đường này. Cách sửa: trong catch, nếu t khác null thì gọi ghiRieng với 500 và 'server_error' trước khi trả. Cửa sổ hẹp: chỉ khi token đã thu hồi và câu đọc đó lỗi.

- **Hình 4 (âm tính một mình): quét route so 400 với 400 ở 14 route, không chạm tới lớp danh tính**
  AC: AC-4
  file: `packages/api/test-db/token-may/pham-vi.test.ts:43`
  severity: medium
  source: measurement
  detail: quetRoute gửi body "{}" cho mọi route không phải GET/HEAD (dòng 43), rồi chỉ ghi nhận khi hai mã lệch (dòng 46). Ca «token không mở route nào khác» chỉ assert lech = [] (dòng 70). Chạy createApi với deps giả, đúng cách gửi này, không kèm thông tin đăng nhập: 111 route gồm 1 route 200, 96 route 401 và 14 route 400 do bộ kiểm thân chạy trước khi handler kiểm danh tính (POST /me/company, POST /company/members, POST /company/zones, POST /imports, POST /leads/{leadId}/assign...). Ở 14 route này cả hai lượt đều trả 400 trước lớp danh tính, nên Bearer được coi là người cũng không làm mã lệch. Hai đối chứng dương không đại diện cho nhóm này: cửa nhận (dòng 76) và route giả me-gia không có bộ kiểm thân (dòng 79-82). Test cũng không assert mã của lượt không header (phải là 401), nên ô 400 vẫn tính vào soRoute như đã đo. Lời hứa Never của hợp đồng («token gọi được đường của người») vì vậy chưa được đo ở 14 route này.

- **Hình 4 (âm tính một mình, không ghim thông điệp): 42501 ở bốn cột khoá không phân biệt quyền cột với luật dòng**
  AC: AC-8
  file: `packages/db/tests/token-may.test.mjs:113`
  severity: medium
  source: measurement
  detail: Ca «thu hồi một chiều» sửa token_hash, agreement_id, company_id, created_by trên token CÒN SỐNG và chỉ kiểm e.code === 42501 (hoiLoi, dòng 15). Migration 041 có hai lớp: grant update (revoked_at, revoked_by) và luật with check (revoked_at is not null). Nếu grant bị nới thành grant update toàn bảng, câu ở dòng 113 vẫn bị with check từ chối với cùng mã 42501, vì dòng sau khi sửa vẫn có revoked_at null. Vậy cả bốn ô vẫn xanh khi lớp quyền cột mất. Câu thực sự cần chặn là sửa cột khoá cùng lúc đặt revoked_at, ví dụ set token_hash = ..., revoked_at = now(): câu này qua with check và chỉ quyền cột chặn được, nhưng không có ô nào thử. Đối chứng dương dòng 123 chỉ chứng minh thu hồi đúng cách chạy được, không chứng minh cột khoá bị khoá. Thông điệp lỗi («permission denied» so với «row-level security») cũng không được ghim.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Thoả thuận sang ended ngay sau bước tra token thì máy nhận 401 token_revoked thay vì 403 agreement-inactive**
  Người dùng thấy gì: Hiếm khi, nếu thoả thuận vừa tắt đúng lúc một lời gọi đang chạy, bên kia nhận báo token bị thu hồi thay vì báo thoả thuận đã tắt. Lời gọi kế tiếp sẽ nhận đúng báo thoả thuận đã tắt.
  Căn cứ: Chỉ sai lời báo trong một lời gọi duy nhất ở khoảng thời gian rất hẹp, không lộ hay mất dữ liệu, và lời gọi sau tự đúng.
  file: `packages/api/src/catalog/feeds-token.ts`
  severity: low
  Đề xuất: known-limits

- **Ô «đã thu hồi» của bài Bearer hỏng kèm cookie thiếu đối chứng dương mà E6 đòi**
  Người dùng thấy gì: Bài kiểm token đã thu hồi chưa chứng minh token đó từng dùng được trước khi bị thu hồi. Hành vi thực tế vẫn đúng và được bài khác kiểm.
  Căn cứ: Chỉ làm bài kiểm kém chặt, người dùng không bị ảnh hưởng và có thể bổ sung sau với chi phí thấp.
  file: `packages/api/test-db/token-may/cua-nhan.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình 4 (âm tính một mình): ô «chữ hoa» của tra theo băm không có dòng nào để khớp nhầm**
  Người dùng thấy gì: Một ô kiểm tra về chữ hoa chữ thường của mã băm token luôn xanh vì không có dữ liệu để khớp nhầm. Chưa có lỗi thật nào được thấy.
  Căn cứ: Không ảnh hưởng người dùng; nguy cơ chỉ là bỏ sót một lỗi hồi quy hiếm và sửa bài kiểm rẻ.
  file: `packages/db/tests/token-may.test.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình 4 (thiếu đối chứng dương): ô «đã thu hồi» của Bearer hỏng kèm cookie chưa từng được chứng minh là gọi được**
  Người dùng thấy gì: Bài kiểm token đã thu hồi kèm cookie chưa cho thấy token từng hợp lệ trước đó, nên khó phân biệt với token chưa bao giờ hợp lệ. Hành vi thật không sai.
  Căn cứ: Chỉ là độ chặt của bài kiểm, không có hậu quả với người dùng và bổ sung sau rất rẻ.
  file: `packages/api/test-db/token-may/cua-nhan.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình 5 (số đếm = số phần tử): soCot lấy từ độ dài danh sách, không đếm số cột đã quét**
  Người dùng thấy gì: Phép kiểm token không bị lưu ở dạng rõ có một phép so đếm tự khớp, nên nếu vòng quét bỏ sót cột thì bài vẫn xanh. Chưa có dấu hiệu token bị lưu rõ.
  Căn cứ: Rủi ro chỉ là bỏ sót trong tương lai khi thêm cột, không có rò rỉ hiện tại, và sửa bài kiểm rẻ.
  file: `packages/api/test-db/token-may/quan-ly.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình 5 (tuyên quét lớp, chỉ có điểm-case): quét console chỉ thấy đối số dạng chuỗi**
  Người dùng thấy gì: Bài kiểm xem token có lọt vào nhật ký máy chủ chưa phát hiện được trường hợp token nằm trong đối tượng hay lỗi. Hiện không có chỗ nào ghi như vậy.
  Căn cứ: Hiện không có rò rỉ nào; chỉ là lưới an toàn cho thay đổi sau này, sửa rẻ khi cần.
  file: `packages/api/test-db/token-may/nhat-ky.test.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
