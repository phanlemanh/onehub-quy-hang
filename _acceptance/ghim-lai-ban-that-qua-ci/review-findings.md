# Review findings: ghim-lai-ban-that-qua-ci (round 1)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bộ chặn dùng danh sách cấm theo tên script npm nên bỏ lọt các bộ kiểm ghi có sẵn trong config và cả lệnh viết thẳng**
  Người dùng thấy gì: Nút ghim lại có thể cho chạy nhầm một số bộ kiểm khác có ghi dữ liệu trên cơ sở dữ liệu thật, nếu ai đó trỏ hồ sơ vào chúng trên nhánh của mình. Hiện chỉ người có quyền đẩy nhánh và bấm nút mới tạo được tình huống này.
  Căn cứ: Hậu quả có thể nặng vì chạm dữ liệu thật và khó hoàn lại, nhưng cần người có quyền sửa nhánh cố ý làm, và nút còn bị giới hạn ở danh sách hồ sơ cố định; sửa cần thiết kế lại cách chặn nên đáng làm thành việc riêng.
  file: `.github/scripts/chan-ghim-ban-that.mjs`
  severity: high
  Đề xuất: new-contract

- **Bộ chặn tự đọc evals bằng regex một dòng nên để lọt `cmd` viết dạng khối (`cmd: >` hoặc `cmd: |`), trong khi kit vẫn chạy lệnh đó**
  Người dùng thấy gì: Nếu một hồ sơ khai lệnh kiểm theo cách viết nhiều dòng, bộ chặn không nhận ra và vẫn cho chạy bộ kiểm ghi trên cơ sở dữ liệu thật. Hồ sơ hiện có đều viết một dòng nên chưa xảy ra.
  Căn cứ: Hiện chưa có hồ sơ nào viết kiểu này nên chưa gây mất dữ liệu, và lỗi chỉ xuất hiện khi có người cố tình hoặc vô ý đổi cách viết; ghi lại làm han chế đã biết là đủ cho tới khi mở việc gia cố bộ chặn.
  file: `.github/scripts/chan-ghim-ban-that.mjs`
  severity: medium
  Đề xuất: known-limits

- **Danh sách lệnh ghi của bộ chặn thiếu những bộ kiểm có ghi vào cơ sở dữ liệu đang khai ngay trong config.yaml**
  Người dùng thấy gì: Một số bộ nạp và kiểm dữ liệu mẫu có ghi vào cơ sở dữ liệu không bị nút ghim lại chặn, nên lời hứa nút không bao giờ ghi vào dữ liệu thật chỉ đúng với vài bộ kiểm quen thuộc.
  Căn cứ: Dữ liệu thật có thể bị ghi hoặc xoá và không tự lấy lại được, nhưng cần hồ sơ bị trỏ sai một cách chủ động; nên gộp với việc gia cố bộ chặn thành một việc riêng thay vì vá lẻ.
  file: `.github/scripts/chan-ghim-ban-that.mjs`
  severity: medium
  Đề xuất: new-contract

- **Khi bộ chặn từ chối, bước quét (`if: always()`) vẫn chạy và tệp đính kèm vẫn được tải lên, mang nguyên run-log và evidence-report cũ của nhánh**
  Người dùng thấy gì: Khi nút từ chối một hồ sơ, vẫn có một tệp đính kèm cùng tên chứa kết quả cũ, dễ bị nhầm là vừa ghim lại xong. Lượt chạy vẫn báo đỏ nên người nhìn sẽ thấy đã bị từ chối.
  Căn cứ: Không lộ bí mật và không mất dữ liệu, chỉ gây nhầm lẫn nếu có người hoặc máy lấy tệp mà không nhìn trạng thái đỏ; người dùng tự phân biệt được nên ghi lại là đủ.
  file: `.github/workflows/ghim-lai-ban-that.yml`
  severity: low
  Đề xuất: known-limits

- **Hình 5: tuyên chặn cả LỚP bộ kiểm ghi nhưng phép đo chỉ có một điểm-case (cach_ly_that)**
  Người dùng thấy gì: Phép thử của nút chỉ kiểm một bộ kiểm ghi cụ thể, nên nếu bộ chặn bỏ sót bộ kiểm ghi khác thì phép thử vẫn báo xanh và tạo cảm giác an toàn hơn thực tế.
  Căn cứ: Đây là khoảng trống của phép đo chứ không trực tiếp làm hỏng nút; sẽ tự được xử lý nếu việc gia cố bộ chặn được mở, nên ghi lại cho tới lúc đó.
  file: `_acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
