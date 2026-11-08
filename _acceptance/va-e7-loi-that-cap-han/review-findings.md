# Review findings: va-e7-loi-that-cap-han (round 1)

## Trong hợp đồng

- **Chấm E7 không kiểm vế «GET thật nêu lead_routing.first_call_minutes» mà AC-1 đòi**
  AC: AC-1
  file: `_acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs:82`
  severity: medium
  source: conventions
  detail: Hợp đồng AC-1 và mục expected của E1 đòi GET thật trả lỗi cặp nêu «lead_routing.first_call_minutes». chay-ui.mjs đã tính sẵn trường `errorsNeuKhoaGoi` (coLoiGoi), nhưng kiem-e7.mjs bỏ qua nó. Thước chỉ kiểm `errorsTuGetThat` khác rỗng (dòng 82) rồi kiểm chữ trên màn. Ở chế độ thường, nếu máy chủ trả lỗi của một khoá khác mà màn vẫn hiện «chưa áp … Hạn gọi lần đầu» nhờ một nguồn khác, thước vẫn chấm ĐẠT dù vế đầu vào của AC-1 chưa được chứng. Nên thêm điều kiện: khi không chạy `--doi-cau` mà `k3.errorsNeuKhoaGoi` khác true thì thoát mã 2 (đối chứng dương hỏng).
  rationale: AC-1 đòi rõ GET thật trả lỗi nêu khoá lead_routing.first_call_minutes mà thước chấm không kiểm vế này.

- **Hình dạng 3: kiem-e7 không chấm việc lỗi GET nêu khoá vừa lưu, dù E1 hứa điều này**
  AC: AC-1
  file: `_acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs:81`
  severity: low
  source: measurement
  detail: Lời hứa của E1 ghi «dòng khung 3 có errors từ GET thật nêu «lead_routing.first_call_minutes»», tức một quan hệ: lỗi phải chỉ đúng khoá vừa lưu. chay-ui.mjs có tính `errorsNeuKhoaGoi` (`getThat.errors.some(e => e.includes(GOI))`) và in nó ra dòng JSON, nhưng kiem-e7.mjs chỉ kiểm `Array.isArray(k3.errorsTuGetThat) && k3.errorsTuGetThat.length`, tức là chỉ cần có lỗi. Nó không đọc `errorsNeuKhoaGoi`. Nếu GET trả lỗi của một khoá khác, phần chuẩn bị của khung 3 vẫn được coi là dựng xong. Điều kiện của E1 vì thế chỉ được người đọc output kiểm, không được thước chấm.
  rationale: Cùng vế với mục trên: AC-1 đòi lỗi GET thật nêu đúng khoá nhưng thước chỉ kiểm có lỗi.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Lỗi bất ngờ thoát mã 1, trùng mã «khung 3 ĐỎ», nên E2 và E3b có thể đạt nhầm**
  Người dùng thấy gì: Nếu máy chấm tự hỏng giữa chừng (không cài được, thiếu bản mã cũ), hai bài kiểm chiều đỏ vẫn có thể báo đạt dù chưa đo được gì. Người chạy chỉ phân biệt được qua chữ in ra.
  Căn cứ: Chỉ ảnh hưởng công cụ đo nội bộ, không chạm người dùng cuối; lỗi hạ tầng thường kèm chữ báo rõ nên người chạy tự phát hiện và chạy lại được.
  file: `_acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs`
  severity: medium
  Đề xuất: known-limits

- **Một lần chạy hỏng cho ra cùng mã thoát 1 với kết quả «ĐỎ» mà E2 và E3b đang chờ, nên hai phép đo này có thể đạt giả**
  Người dùng thấy gì: Một lần chạy bị hỏng giữa chừng có thể bị tính nhầm là đã bắt được lỗi, làm hai bài kiểm chiều đỏ đạt giả.
  Căn cứ: Chỉ làm công cụ kiểm nội bộ kém tin cậy trong tình huống hiếm, không mất dữ liệu; chạy lại là thấy, nhưng cần người tinh mắt.
  file: `_acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4: kiểm âm chỉ ghim mã thoát, mà mã thoát 1 cũng là mã khi script sập (E2, E3b)**
  Người dùng thấy gì: Hai bài kiểm chiều đỏ chỉ nhìn mã kết quả nên không phân biệt được lỗi đo thật với máy chấm bị sập.
  Căn cứ: Hậu quả nhẹ và chỉ ở công cụ nội bộ; người chạy tự gỡ được bằng cách xem chữ báo và chạy lại.
  file: `_acceptance/va-e7-loi-that-cap-han/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3: chỉ kiểm chuỗi có mặt (`__thanTuGet`) trong khi lời hứa AC-3 là thân phản hồi bằng đúng GET thật**
  Người dùng thấy gì: Phép kiểm nguồn có thể bị qua mặt nếu ai đó viết tay một câu lỗi giả có đúng tên biến, nên khung 3 vẫn có thể dựa vào câu lỗi gõ tay mà không bị bắt.
  Căn cứ: Cần cố ý lách mới xảy ra, chỉ ảnh hưởng công cụ đo, và người đọc mã khi duyệt PR sẽ thấy; sửa sau cũng rẻ.
  file: `_acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
