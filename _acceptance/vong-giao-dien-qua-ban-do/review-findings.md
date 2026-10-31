## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **so-do-vong bỏ qua im lặng dòng JSONL hỏng, nên số kit và số lượt gọi người bị đếm thiếu**
  Người dùng thấy gì: Nếu nhật ký của một vòng bị hỏng một dòng, báo cáo số đo của vòng có thể ghi thiếu giờ máy hoặc lượt gọi người mà không cảnh báo.
  Căn cứ: Chỉ làm số liệu thống kê lệch, không mất dữ liệu của khách; nhật ký hỏng hiếm và người đọc có thể đo lại, sửa sau rẻ.
  file: `packages/ui-lint/so-do-vong.mjs`
  severity: medium
  Đề xuất: known-limits
- **ban-do-khuon --base xếp một màn-ngoài-bản-đồ mới sinh vào «nợ cũ» khi dòng khai hàm không đổi**
  Người dùng thấy gì: Khi một trang cũ đang chỉ chuyển hướng được sửa thành có giao diện thật, kiểm tra theo vòng có thể gọi nhầm là nợ cũ và cho qua. Kiểm tra toàn cây chạy khi lint vẫn báo đỏ.
  Căn cứ: Lỗi vẫn bị bắt ở lớp kiểm tra toàn cây nên không lọt ra ngoài, chỉ báo sai nhãn mới/cũ ở bước giữa; tình huống hiếm.
  file: `packages/ui-lint/ban-do-khuon.mjs`
  severity: low
  Đề xuất: known-limits
- **manNgoaiBanDo chỉ nhận màn khai bằng `export default function`, các dạng xuất mặc định khác lọt qua im lặng**
  Người dùng thấy gì: Một trang mới viết theo kiểu khai báo khác có thể không bị kiểm tra là màn nằm ngoài bản đồ, nên qua mà không ai nhắc tạo nhóm và khuôn.
  Căn cứ: Hiện chưa có trang nào viết kiểu đó nên chưa ai bị ảnh hưởng; nếu xảy ra chỉ là bỏ sót một lời nhắc, sửa sau rẻ.
  file: `packages/ui-lint/lib/ban-do.mjs`
  severity: low
  Đề xuất: known-limits
- **doi-chieu --base không chạm màn nào thì để nguyên ke-hoach.json và index.html cũ, --dung sau đó ghép theo kế hoạch cũ**
  Người dùng thấy gì: Nếu một vòng trước đã sinh kế hoạch rồi sau đó không còn chạm màn, trang đối chiếu có thể vẫn hiện các cặp ảnh cũ không còn thuộc vòng.
  Căn cứ: Chỉ xảy ra khi chạy lại trên cùng hồ sơ sau khi đổi phạm vi; người duyệt thấy ngay ảnh thừa và xoá tay được.
  file: `packages/ui-lint/doi-chieu.mjs`
  severity: low
  Đề xuất: known-limits
- **Hình dạng 5 (tuyên phủ lớp, không có ma trận viết trước): E3a so kế hoạch với chính docBanDo(d), không ghim bốn nhóm**
  Người dùng thấy gì: Bài kiểm tự động của danh sách màn mẫu có thể vẫn xanh dù bản đồ mất một nhóm, nên sự cố kiểu đó có thể không bị bắt sớm.
  Căn cứ: Không ảnh hưởng người dùng cuối; lệnh thật vẫn chạy đúng và việc siết bài kiểm có thể làm sau với chi phí thấp.
  file: `packages/ui-lint/tests/doi-chieu.test.mjs`
  severity: medium
  Đề xuất: known-limits
- **Hình dạng 6 (đo checkout thay vì cây đang kiểm): E1 lấy mẫu mong đợi từ docBanDo(ROOT), còn lệnh chạy trên kho tạm d**
  Người dùng thấy gì: Bài kiểm tự động so kết quả với bản đồ của một cây khác, hiện đang trùng nên không gây sai lệch nào.
  Căn cứ: Hiện hai bên trùng nhau nên không có hậu quả; chỉ có thể sai nếu sau này hai cây khác nhau, công sửa không đáng.
  file: `packages/ui-lint/tests/doi-chieu.test.mjs`
  severity: low
  Đề xuất: wont-fix
- **Hình dạng 3 (lời hứa là quan hệ «đúng tập», bài đo chỉ kiểm một chiều): kiem-ho-so chỉ bắt nhóm thiếu, không bắt nhóm thừa**
  Người dùng thấy gì: Bộ kiểm hồ sơ chỉ phát hiện khi kế hoạch thiếu nhóm, còn nhóm thừa hay đã bị xoá khỏi bản đồ vẫn được cho qua.
  Căn cứ: Nhóm thừa chỉ làm trang đối chiếu dài hơn, không mất hay lộ dữ liệu; người duyệt thấy được và chỉnh lại dễ.
  file: `_acceptance/vong-giao-dien-qua-ban-do/thu/kiem-ho-so.mjs`
  severity: medium
  Đề xuất: known-limits
- **Hình dạng 3 (lời hứa là quan hệ «khớp merge-base», bài đo chỉ kiểm «là tổ tiên»): base của khuon-so-do.json**
  Người dùng thấy gì: Bộ kiểm hồ sơ chấp nhận mốc so sánh của số đo là bất kỳ điểm nào trước đó, nên số đo có thể tính trên khoảng rộng hơn vòng thật mà không bị báo.
  Căn cứ: Chỉ làm số đo thống kê có thể lệch, không ảnh hưởng người dùng cuối; đo lại được.
  file: `_acceptance/vong-giao-dien-qua-ban-do/thu/kiem-ho-so.mjs`
  severity: low
  Đề xuất: known-limits
- **Hình dạng 4 (assert âm đứng một mình, không ghim lỗi): «không ghi tệp» đo bằng assert.throws trần**
  Người dùng thấy gì: Bài kiểm tự động chứng minh lệnh từ chối ghi số đo khi không đo được còn lỏng, có thể xanh vì một lỗi khác.
  Căn cứ: Không đến tay người dùng cuối và hành vi thật vẫn đúng; siết bài kiểm tốn công mà lợi ít.
  file: `packages/ui-lint/tests/so-do-vong.test.mjs`
  severity: low
  Đề xuất: wont-fix

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
