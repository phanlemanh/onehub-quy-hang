# Review findings: nang-kit-2-36-0 (round 2)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 4 (assertion âm tính đứng một mình): nhánh đối chứng T2 của ca «định tuyến máy không chạm hồ sơ T3» không thể nào trượt**
  Người dùng thấy gì: Bài thử kiểm tra rằng hồ sơ cỡ vừa vẫn được máy tự xếp đúng chỗ có một vế quá lỏng, nên nếu máy xếp sai hồ sơ loại này thì bài thử vẫn báo xanh. Người dùng không gặp lỗi trực tiếp, chỉ là lưới an toàn ở chỗ này mỏng hơn vẻ ngoài.
  Căn cứ: Hậu quả nhẹ vì chỉ là bài thử yếu chứ sản phẩm không sai, không mất hay lộ dữ liệu, các nhánh khác của cùng tính năng đã kiểm chiều bật, và điểm yếu này đã được ghi nhận gần giống ở mục hạn chế đã biết của hợp đồng.
  file: `_acceptance/nang-kit-2-36-0/thu/nac.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Đưa _acceptance/config.yaml vào t3_paths không có tác dụng ở CI, mà lại tắt định tuyến máy cho phần lớn vòng sau (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi ai đó chỉ sửa tệp cấu hình của cổng nghiệm thu, cổng ở bước gộp không tự coi đó là thay đổi mức cao nhất và không đòi chữ ký thêm. Việc máy tự định tuyến các vòng sau cũng ít khi có hiệu lực hơn lời mô tả.
  Căn cứ: Không mất dữ liệu và không ảnh hưởng người dùng sản phẩm; chủ kho vẫn thấy thay đổi này khi duyệt PR, và ghi rõ giới hạn là đủ cho tới khi kit đổi cách phân loại.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hàng lộ trình mới lệch khuôn: mã là chữ thay vì số tiếp theo, thiếu các trường nhóm/đợt/vai (r1)**
  Người dùng thấy gì: Mục của việc nâng kit trên bảng lộ trình hiện ra ngoài mọi nhóm và đợt, nên người xem lộ trình khó tìm và khó xếp nó theo đợt.
  Căn cứ: Chỉ lệch về trình bày trên bảng lộ trình, không mất dữ liệu và không ảnh hưởng người dùng cuối; sửa lại sau rất rẻ.
  file: `docs/plan/lo-trinh.json`
  severity: low
  Đề xuất: known-limits

- **Bài đo để lại thư mục tạm, trái lời đầu tệp «được dọn khi xong» (r1 · tệp đã đổi)**
  Người dùng thấy gì: Mỗi lần chạy bài kiểm, máy dev của người làm bị để lại một số thư mục rác tạm, chiếm chỗ dần cho tới khi hệ điều hành dọn.
  Căn cứ: Không đụng tới kho, dữ liệu hay người dùng sản phẩm; hệ điều hành tự dọn thư mục tạm nên chi phí sửa không đáng so với hậu quả.
  file: `_acceptance/nang-kit-2-36-0/thu/nac.test.mjs`
  severity: low
  Đề xuất: wont-fix

- **Khai `_acceptance/config.yaml` trong t3_paths không có tác dụng ở CI: lưới trước-gộp bỏ qua mọi tệp `_acceptance/*` trước khi đối chiếu t3_paths (r1 · tệp đã đổi)**
  Người dùng thấy gì: Một PR chỉ hạ mức chặn trong cấu hình cổng nghiệm thu vẫn có thể qua cổng ở bước gộp mà không cần hồ sơ mức cao nhất hay chữ ký riêng, dù lời mô tả hứa là sẽ cần.
  Căn cứ: Rủi ro là nới một rào có chủ ý do người làm chứ không tự xảy ra, người duyệt PR vẫn thấy và gỡ được; ghi giới hạn đủ cho tới khi có cách chặn riêng.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **Bài đo AC-7, nhánh T2: không kiểm mã thoát, cũng không có khẳng định dương nào, nên lệnh chết vẫn xanh (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu công cụ định tuyến máy hỏng ở hồ sơ mức vừa, bài kiểm vẫn báo xanh, nên lỗi đó có thể lọt qua mà không ai thấy ngay.
  Căn cứ: Hiện công cụ vẫn chạy đúng nên chưa có hậu quả thật; nếu sau này hỏng thì lộ ra khi dùng và tự khắc phục được, chỉ làm bài đo kém nhạy.
  file: `_acceptance/nang-kit-2-36-0/thu/nac.test.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 6 (đo cây khác cây đang kiểm): vế tĩnh đọc cây làm việc ở ROOT, còn vế hành vi đo commit HEAD qua worktree tách (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu bài kiểm chạy khi còn thay đổi chưa lưu, kết quả có thể xanh dù hai nửa phép đo nhìn hai phiên bản khác nhau của kho.
  Căn cứ: Hiện cây sạch và bài kiểm đạt đủ nên chưa sai kết quả; chỉ cần chạy lại trên cây đã commit là rõ, không mất dữ liệu.
  file: `_acceptance/nang-kit-2-36-0/thu/nac.test.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
