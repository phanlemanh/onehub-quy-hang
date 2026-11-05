# Review findings: lam-lai-hom-nay-dau-chu (round 2)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Mục trình đơn ⋯ dùng thẻ <a> trần cho đường nội bộ, lệch mẫu Link của kho (r1)**
  Người dùng thấy gì: Chọn Ghi cuộc gọi, Đổi giá hay Mở hồ sơ trong menu ⋯ làm cả trang tải lại thay vì chuyển mượt, nên chậm hơn một nhịp và phải nạp lại bàn làm việc.
  Căn cứ: Việc vẫn làm được đúng, chỉ chậm hơn một chút và người dùng không mất dữ liệu; sửa sau cũng rẻ.
  file: `apps/web/src/components/khoi/solution-agents-2/o-dong.tsx`
  severity: medium
  Đề xuất: known-limits

- **E1 đòi tieuDeCot là bốn tên cột, nhưng bảng tắt hàng tiêu đề và script không in khoá này (r1)**
  Người dùng thấy gì: Màn hình không thay đổi với người dùng, nhưng bước chấm tay không kiểm được tên bốn cột nên có thể ghi nhận là đạt khi chưa đối chiếu tên cột.
  Căn cứ: Không ảnh hưởng người dùng cuối, chỉ làm hồ sơ chấm kém chặt; ghi lại là đủ.
  file: `_acceptance/lam-lai-hom-nay-dau-chu/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **E9 đòi gọi API kiểm lead đã rời và đòi moHoSo.duong, nhưng script không gọi API và chỉ in location.href (r1 · tệp đã đổi)**
  Người dùng thấy gì: Việc trả lại lead có thể chưa được kiểm là đã ghi thật ở máy chủ, chỉ kiểm dòng đã biến mất trên màn.
  Căn cứ: Không có bằng chứng người dùng bị mất hay sai dữ liệu, chỉ là bước kiểm chưa chặt; bổ sung sau rẻ.
  file: `_acceptance/lam-lai-hom-nay-dau-chu/thu/chay-ui.mjs`
  severity: medium
  Đề xuất: known-limits

- **Màu hạn và chữ hạn lệch nhau quanh hai mốc vì chuHan làm tròn phút còn mucHan so mili-giây (r1 · tệp đã đổi)**
  Người dùng thấy gì: Sát hai mốc, chữ có thể ghi «còn 15 phút» mà ô tô vàng, hoặc «còn 0 phút» mà ô tô đỏ, khiến đầu chủ thấy hơi mâu thuẫn trong vài chục giây.
  Căn cứ: Chỉ lệch trong khoảng ngắn quanh mốc, không mất dữ liệu và tự hết khi thời gian trôi.
  file: `apps/web/src/app/(app)/today/hom-nay-dau-chu.tsx`
  severity: low
  Đề xuất: known-limits

- **dung-d.mjs không kiểm kết quả POST /api/v1/leads, nên ca quá hạn hoặc sắp hạn có thể mất mà không báo (r1)**
  Người dùng thấy gì: Không ảnh hưởng người dùng; chỉ có nguy cơ chỗ thử thiếu ca quá hạn hoặc sắp hạn nên lần chấm màu hạn có thể thiếu mẫu.
  Căn cứ: Chỉ là đồ nghề thử, chạy lại là có mẫu; tốn công sửa không đáng so với hậu quả.
  file: `_acceptance/lam-lai-hom-nay-dau-chu/thu/dung-d.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 2: tập việc đối chiếu rút từ chính hàm đang đo, không rút từ phía ghi cũ (NutViec), nên phép so tập không thể đỏ (r1)**
  Người dùng thấy gì: Bài thử hiện không bắt được trường hợp một việc bị mất khỏi dòng, nên sau này sửa bảng việc sai có thể lọt mà không ai biết.
  Căn cứ: Hôm nay người dùng chưa gặp lỗi, nhưng lưới an toàn cho việc không được mất đang rỗng; nên làm bài thử đúng trong một việc riêng.
  file: `apps/web/src/app/(app)/today/viec-dong.test.ts`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 3: E4 đếm mọi lead đã nhận thay vì kiểm acceptedAt của đúng lead vừa bấm (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bước chấm có thể báo đạt dù bấm Nhận chưa ghi đúng lead ấy, nếu sàn mẫu đã có sẵn lead đã nhận.
  Căn cứ: Không có lỗi thấy được ở người dùng, chỉ làm bằng chứng kém chặt; ghi lại để lần chấm sau đo chặt hơn.
  file: `_acceptance/lam-lai-hom-nay-dau-chu/thu/chay-ui.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3: E9 không đo vế API mà tiêu chí đòi ('GET /api/v1/leads/assigned không còn lead ấy') (r1 · tệp đã đổi)**
  Người dùng thấy gì: Việc trả lại lead chưa được xác nhận là đã ghi ở máy chủ, chỉ thấy dòng biến khỏi màn.
  Căn cứ: Không thấy hậu quả cho người dùng, chỉ bằng chứng thiếu một vế; bổ sung sau rẻ.
  file: `_acceptance/lam-lai-hom-nay-dau-chu/thu/chay-ui.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3: E1 đòi tên bốn cột và nhãn nút theo loại việc nhưng script chỉ đo số ô và nhãn rời (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bước chấm không đối chiếu được nút chính có đúng nhãn theo từng loại việc, nên một nhãn sai có thể không bị bắt.
  Căn cứ: Màn hiện chưa thấy sai, chỉ là lưới kiểm lỏng; sửa sau không đụng đến người dùng.
  file: `_acceptance/lam-lai-hom-nay-dau-chu/thu/chay-ui.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3: E5 đòi số trên mỗi đầu nhóm bằng số dòng của nhóm đó nhưng script chỉ so tổng (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu số việc ghi trên hai đầu nhóm lệch bù trừ nhau thì bước chấm vẫn báo đạt, và đầu chủ có thể thấy số sai trên một nhóm.
  Căn cứ: Khả năng lệch rất thấp và người dùng dễ nhận ra; chỉ là bằng chứng chưa chặt, bổ sung rẻ.
  file: `_acceptance/lam-lai-hom-nay-dau-chu/thu/chay-ui.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
