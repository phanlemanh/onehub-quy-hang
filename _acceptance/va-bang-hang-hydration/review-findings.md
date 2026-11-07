# Review findings: va-bang-hang-hydration (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Thước có thể đo nhầm máy chủ cũ: không kiểm cổng 3585 đã trống trước khi bật bản dev của cây đo**
  Người dùng thấy gì: Nếu còn một máy chủ cũ đang chạy, công cụ kiểm có thể báo sạch hoặc đỏ cho một bản mã mà nó không hề đo. Người dùng cuối không bị ảnh hưởng, chỉ kết quả nghiệm thu có thể sai trong tình huống hiếm này.
  Căn cứ: Chỉ ảnh hưởng người chạy kiểm khi có máy chủ cũ sót lại, không mất dữ liệu, tắt máy chủ cũ rồi chạy lại là khắc phục được.
  file: `_acceptance/va-bang-hang-hydration/thu/kiem-hydration.mjs`
  severity: medium
  Đề xuất: known-limits

- **Đường xin lại phiên khi phiên giữ hết hạn luôn hỏng, lỗi bị nuốt thành null**
  Người dùng thấy gì: Khi phiên đăng nhập mẫu đã hết hạn, công cụ kiểm báo lỗi chung chung và giấu nguyên nhân thật, đồng thời tốn một lượt xin mã đăng nhập. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ làm người chạy kiểm khó tìm nguyên nhân và tốn một lượt xin mã, không ảnh hưởng dữ liệu hay người dùng cuối, chờ phiên mới rồi chạy lại là xong.
  file: `_acceptance/va-bang-hang-hydration/thu/kiem-hydration.mjs`
  severity: medium
  Đề xuất: known-limits

- **Khoá đo có thể làm thước sập khi khoá được nhả giữa mkdir và statSync**
  Người dùng thấy gì: Hiếm khi, công cụ kiểm có thể tự sập đúng lúc hai lần đo giành nhau khoá, và lần sập này bị đọc nhầm thành kết quả đỏ. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Rất hiếm xảy ra và chạy lại là hết, hậu quả chỉ là một lần báo đỏ nhầm cho người chạy kiểm nên không đáng mở việc sửa.
  file: `_acceptance/va-bang-hang-hydration/thu/kiem-hydration.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (assertion âm tính một mình): ca khổ điện thoại khẳng định «0 lỗi hydration» cho chỗ sửa ở bang-the.tsx, nhưng không có ca đối chứng đỏ nào**
  Người dùng thấy gì: Ở khổ điện thoại, việc kiểm không chứng minh được rằng chỗ sửa danh sách thẻ có tác dụng, vì bản cũ cũng không báo lỗi ở đó. Nếu chỗ sửa này bị gỡ sau này, việc kiểm vẫn xanh.
  Căn cứ: Chỉ là phòng ngừa chưa có lỗi thật quan sát được trên điện thoại, hợp đồng đã ghi rõ điểm này nên chấp nhận và ghi thành hạn chế đã biết.
  file: `_acceptance/va-bang-hang-hydration/evals.yaml`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(không có)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
