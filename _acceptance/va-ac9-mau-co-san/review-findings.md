## Trong hợp đồng

- **Hình dạng 4 (khẳng định âm tính một mình): ca deploy-san-khac chỉ kiểm «AC-9 không bị bỏ qua», không có đối chứng dương «AC-9 đã chạy và đạt»**
  file: `_acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs:253`
  severity: medium
  AC: AC-1
  source: measurement
  detail: Trong mot(), nhánh kyVongXanh có `if (ca !== "deploy-san-khac" && !k.ac9Dat) loi.push(...)`, nên với ca deploy-san-khac (chayDeploy chạy `npm run test:isolation -w @quy-hang/db`) đòi hỏi «AC-9 đã chạy» bị tắt hẳn. Phép đo chỉ còn lại `k.ma === 0` và phép âm `if (k.ac9BoQua)` (đầu ra không có dòng «AC-9 … # SKIP» / «﹣ AC-9»). AC-1 của contract hứa rằng dưới đúng lệnh deploy thì «ca AC-9 được chạy và đạt (không bị bỏ qua)», và expected của E1 cũng nói thế. Nhưng nếu glob tests/*.test.mjs của test:isolation không còn gom tệp này, hay ca AC-9 không xuất hiện trong đầu ra vì lý do khác, thì mã thoát vẫn 0, đầu ra không có SKIP, và ca vẫn ra ok. Như vậy sự vắng mặt của SKIP được đọc thành bằng chứng AC-9 chạy, trong khi không có phép dương nào cho điều đó. Đầu ra thật (.acceptance-runs/va-ac9-mau-co-san/ra-deploy-san-khac-91394.txt) có in «✔ AC-9 …», nên phép dương ac9Dat áp được cho ca này mà không vướng gì.
  rationale: AC-1 đòi rõ dưới lệnh deploy ca AC-9 «được chạy và đạt (không bị bỏ qua)», mà phép đo của ca này chỉ kiểm vắng mặt SKIP chứ không kiểm AC-9 đã chạy, nên không chứng minh được vế «chạy và đạt» của AC-1; không nằm trong mục Out of scope.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
