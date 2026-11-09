# Review findings: hom-nay-chiu-loi-tung-phan (round 1)

## Trong hợp đồng

- **Đội không đọc lại khi có mạng nếu lúc mất mạng màn đang có số mà chưa có lỗi đọc, trái AC-5**
  AC: AC-5
  file: `apps/web/src/app/(app)/team/dashboard.tsx:61`
  severity: medium
  source: bugs
  detail: Điều kiện đọc lại là `if (tai.loiHangDoi || tai.loiDauChu) docLai()`. Hai cờ này chỉ bật khi một lượt đọc thất bại, mà Đội chỉ đọc lúc mở màn và khi bấm «Thử lại», không có đọc định kỳ. Đường lỗi: mở Đội lúc có mạng, đọc thành công, rồi mất mạng. Màn hiện «Đang mất mạng · Số là lần đọc cuối.» (đúng nhánh `moTaMatMang` có số), nhưng không có lượt đọc nào thất bại nên cả hai cờ vẫn false. Khi sự kiện online tới, `docLai` không chạy. `ngoaiTuyen` về false nên dải báo biến mất, trong khi số vẫn là số từ trước lúc mất mạng và không còn lời nào cho biết điều đó. AC-5 ghi: Given Đội đang báo mất mạng, When mạng trở lại, Then màn tự đọc; AC-5 cũng nêu rõ trạng thái «có số thì nói là lần đọc cuối». Bài E5b chỉ thử mở màn lúc đã mất mạng (lúc đó cờ lỗi bật) nên không bắt được đường này. Hướng sửa: nhớ đã từng ngoại tuyến, hoặc bỏ điều kiện cờ lỗi ở sự kiện online của Đội.
  rationale: AC-5 đòi Đội đang báo mất mạng thì khi mạng trở lại phải tự đọc; đường lỗi này làm điều đó thất bại.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hôm nay trên điện thoại còn một nhánh lỗi tự ghép nút «Thử lại», trái luật vừa thêm**
  Người dùng thấy gì: Người dùng không bao giờ thấy khối lỗi này trên điện thoại, vì lỗi thật đã đi qua khối báo lỗi chung. Chỉ còn một đoạn thừa trong mã có thể bị chép lại về sau.
  Căn cứ: Không ảnh hưởng người dùng nào hiện nay và dọn lúc khác rất rẻ, nên ghi lại là đủ.
  file: `apps/web/src/app/(app)/today/mobile/danh-sach.tsx`
  severity: low
  Đề xuất: known-limits

- **Lead đã nhập treo khung chờ vĩnh viễn khi lời đọc trả 200 mà thân hỏng; lối tự đọc lại mới cũng đi qua chỗ này**
  Người dùng thấy gì: Ở danh sách Lead đã nhập, nếu máy chủ trả về nội dung hỏng thì màn chờ mãi, không có nút «Thử lại». Người dùng phải tải lại trang mới thoát được.
  Căn cứ: Hiếm gặp và người dùng tự gỡ được bằng cách tải lại trang, nhưng màn treo không lời báo nên đáng sửa trong một việc riêng.
  file: `apps/web/src/app/(app)/leads/mine/nguon-that.tsx`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 5, tuyên quét LỚP nhưng chỉ có điểm-case: «nhóm của nguồn hỏng không hiện số» chỉ ghim một mã trong bảng ánh xạ**
  Người dùng thấy gì: Chưa có bài kiểm giữ cho mọi nhóm việc lỗi đều không hiện số. Nếu sau này ai đó làm sót một nhóm, cột có thể hiện số 0 sai mà không bị bắt.
  Căn cứ: Hiện màn vẫn đúng nên chưa ai bị ảnh hưởng; rủi ro chỉ ở lần sửa sau và bổ sung bài kiểm sau này rẻ.
  file: `apps/web/src/app/(app)/today/viec/kho-so.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4, assertion âm-tính-một-mình: bộ đếm MutationObserver của E2b không nhìn thấy câu mà nguồn bộ nhóm phát ra, đối chứng dương chỉ phủ alert ở Đội**
  Người dùng thấy gì: Bài kiểm tự động có thể không bắt được trường hợp câu báo bộ nhóm nháy lên vài giây trong lúc máy đang thử lại. Nếu lỗi này xảy ra, người dùng sẽ thấy câu lỗi thoáng qua dù sau đó tự hết.
  Căn cứ: Chỉ là câu báo thoáng, tự mất, không mất dữ liệu; hiện chưa có bằng chứng nó xảy ra, và siết bài kiểm có thể làm sau.
  file: `_acceptance/hom-nay-chiu-loi-tung-phan/evals.yaml`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
