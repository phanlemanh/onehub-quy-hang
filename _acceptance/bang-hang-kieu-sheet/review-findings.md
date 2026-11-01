# Review findings: bang-hang-kieu-sheet (round 4)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Khoá dựng không có chủ và không làm mới: sau khi khoá bị coi là bỏ rơi, tiến trình cũ vẫn xoá khoá của tiến trình mới**
  Người dùng thấy gì: Người dùng Bảng hàng không bị ảnh hưởng. Chỉ khi người nghiệm thu chạy nhiều bài nhìn cùng lúc và bước dựng dữ liệu mẫu kéo rất lâu thì hai lần dựng có thể chạy chồng nhau, làm dữ liệu thử lộn xộn và phải chạy lại.
  Căn cứ: Chỉ ảnh hưởng công cụ chuẩn bị dữ liệu thử của người nghiệm thu, không mất hay lộ dữ liệu thật, và chạy lại là xong; hiếm khi xảy ra vì cần dựng quá 15 phút.
  file: `_acceptance/bang-hang-kieu-sheet/thu/dung-b.mjs`
  severity: medium
  Đề xuất: known-limits

- **Khoá dựng chỉ được nhả ở sự kiện 'exit': bị ngắt bằng tín hiệu thì khoá mồ côi, và tiến trình bị cướp khoá vẫn xoá mất khoá của tiến trình khác**
  Người dùng thấy gì: Người dùng Bảng hàng không thấy gì. Nếu lần dựng dữ liệu thử bị ngắt giữa chừng, các bài nhìn chạy sau có thể phải đứng chờ tới 15 phút mới chạy tiếp.
  Căn cứ: Hậu quả chỉ là chờ lâu hơn trong khâu nghiệm thu, không mất dữ liệu, người nghiệm thu tự gỡ được bằng cách xoá thư mục khoá; sửa không đáng công.
  file: `_acceptance/bang-hang-kieu-sheet/thu/dung-b.mjs`
  severity: low
  Đề xuất: wont-fix

- **Turning on column windowing breaks End and Ctrl/Cmd+ArrowRight: focus moves to an off-screen column and the view does not scroll to it (r3)**
  Người dùng thấy gì: Trên Bảng hàng, khi bấm phím End hoặc Ctrl/Cmd+Mũi tên phải để nhảy tới cột cuối, ô được chọn nằm ở cột đang ngoài màn hình và bảng không tự cuộn theo. Người dùng không thấy mình đang chọn ô nào, phải tự cuộn ngang bằng chuột. Bấm từng mũi tên một cột vẫn chạy bình thường.
  Căn cứ: Nhẹ vì không mất hay sai dữ liệu, chỉ là phím tắt nhảy cuối hàng không kéo màn theo; người dùng tự cuộn ngang hoặc bấm từng mũi tên là xong, và màn này chỉ để đọc, chưa sửa trên ô.
  file: `apps/web/src/app/(app)/inventory/bang-hang.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5: E5 tuyên quét cả lớp «mọi mã căn còn lại» nhưng chỉ chép một mẫu, tối đa 3 căn (r2)**
  Người dùng thấy gì: Khi kiểm tay ba ô lọc cùng lúc, người kiểm chỉ ghi lại vài căn đầu rồi kết luận cho cả danh sách, nên một căn lọt sai ở cuối danh sách có thể không bị phát hiện. Bảng hàng của người dùng không đổi; chỉ độ chặt của bài kiểm yếu hơn lời hứa.
  Căn cứ: Hậu quả nhẹ vì chỉ làm bài kiểm tay lỏng hơn chứ không làm người dùng mất hay sai dữ liệu, và có thể siết lại bất cứ lúc nào bằng cách sửa lời bài kiểm với chi phí rất thấp.
  file: `_acceptance/bang-hang-kieu-sheet/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Ghim/Bỏ ghim cột trên menu tiêu đề cột không làm gì: trạng thái ghim bị cố định, không có hàm nhận thay đổi (r1)**
  Người dùng thấy gì: Trên menu của tiêu đề cột vẫn có mục ghim cột sang trái hoặc phải, nhưng bấm vào thì không có gì xảy ra. Hai cột Toà và Mã căn vẫn luôn được giữ cố định như thiết kế.
  Căn cứ: Nhẹ: không mất dữ liệu, chỉ là một lựa chọn trên menu bấm không có tác dụng, và hai cột quan trọng vẫn ghim sẵn nên việc xem bảng không bị cản.
  file: `apps/web/src/app/(app)/inventory/bang-hang.tsx`
  severity: medium
  Đề xuất: known-limits

- **Lưu góc nhìn bị mất không báo khi localStorage đọc được mà ghi lỗi (đầy dung lượng, Safari riêng tư bản cũ) (r1)**
  Người dùng thấy gì: Nếu trình duyệt không cho ghi (bộ nhớ đầy hoặc chế độ riêng tư cũ), góc nhìn vừa lưu có vẻ đã lưu nhưng khi mở lại báo không có trên máy này, và người dùng không được báo là lưu hỏng. Lưu đè và đổi tên cũng mất theo cách đó.
  Căn cứ: Chỉ xảy ra ở máy có trình duyệt đặc biệt hoặc đầy bộ nhớ; mất một góc nhìn là mất công đặt lại bộ lọc, không mất dữ liệu hàng, và người dùng có thể dọn bộ nhớ rồi lưu lại.
  file: `apps/web/src/app/(app)/inventory/goc-nhin-react.ts`
  severity: medium
  Đề xuất: known-limits

- **Cú pháp khoảng «5 đến 10» của ô lọc số không bao giờ khớp, ô báo đỏ (r1)**
  Người dùng thấy gì: Gõ khoảng bằng chữ như «5 đến 10» vào ô lọc số thì ô báo đỏ và không lọc được, dù chữ hướng dẫn cho trình đọc màn hình có gợi ý cách gõ này. Gõ «5-10» vẫn dùng được.
  Căn cứ: Nhẹ: có cách gõ khác cho kết quả tương đương, ô báo đỏ nên người dùng biết ngay và tự đổi được, không mất dữ liệu.
  file: `apps/web/src/app/(app)/inventory/bieu-thuc-so.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3: tên test hứa «ô trống xuống cuối» nhưng assert lọc bỏ ô trống trước khi so (r1)**
  Người dùng thấy gì: Bài kiểm nói là đảm bảo căn chưa có giá nằm cuối khi sắp theo giá, nhưng thực tế không kiểm điều đó, nên nếu sau này thứ tự này hỏng thì bài kiểm vẫn xanh. Người dùng hiện chưa gặp lỗi nào.
  Căn cứ: Chưa gây hại cho người dùng hiện tại, chỉ làm giảm khả năng bắt lỗi về sau; sửa bài kiểm rẻ nhưng không cấp bách.
  file: `apps/web/src/app/(app)/inventory/loc.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4: đối chứng đỏ của khoá góc nhìn chỉ là phép so trùng lặp, không chạy khoá sai qua đường đọc (r1)**
  Người dùng thấy gì: Bài kiểm chứng minh góc nhìn của sàn này không lộ sang sàn khác có một phần đối chứng không thật nên có thể không bắt được lỗi nếu phần tách theo sàn bị bỏ đi. Hiện người dùng chưa gặp lỗi lộ góc nhìn.
  Căn cứ: Chưa có hậu quả thấy được với người dùng, góc nhìn chỉ lưu trên máy và không chứa thông tin chủ nhà; chỉ là lưới an toàn của bài kiểm yếu hơn lời hứa.
  file: `apps/web/src/app/(app)/inventory/goc-nhin.test.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

⚠ Cụm ngoài vùng phủ: 2/2 lỗi rơi vào file không bộ đo nào phủ (_acceptance/bang-hang-kieu-sheet/thu/dung-b.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
