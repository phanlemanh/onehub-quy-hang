# Review findings: va-nut-ci-gitleaks (round 2)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Lỗi dựng bản sao cây dùng throw, lệch khuôn dat(false) của bộ đo**
  Người dùng thấy gì: Nếu bước dựng bản sao để chấm bị lỗi, nhật ký chỉ hiện dòng lỗi thô thay vì dòng «HỎNG» gọn. Kết quả vẫn là không đạt, chỉ khó đọc hơn.
  Căn cứ: Hậu quả nhẹ: kết quả vẫn đúng là không đạt, không mất hay lộ dữ liệu, chỉ đọc nhật ký khó hơn, và sửa không đáng công mở việc riêng.
  file: `_acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs`
  severity: low
  Đề xuất: wont-fix

- **Lệnh test:hooks đọc từ cây làm việc, còn suite chạy trên bản sao tại HEAD**
  Người dùng thấy gì: Bộ đo trộn lệnh lấy từ bản đang sửa với mã lấy từ bản đã lưu, nên khi còn sửa dở thì kết quả có thể không phản ánh đúng bản đang có. Lúc chấm ở cổng mọi thứ đã lưu nên kết quả hiện tại vẫn đúng.
  Căn cứ: Chỉ ảnh hưởng khi chạy bộ đo lúc còn sửa dở, không ảnh hưởng người dùng cuối, người chạy tự tránh được bằng cách lưu trước khi chấm.
  file: `_acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs`
  severity: low
  Đề xuất: known-limits

- **E3 (--hooks) chấm bản đã commit, không chấm cây đang có mà không cảnh báo, trong khi lệnh chạy lại đọc từ cây đang có**
  Người dùng thấy gì: Khi còn sửa chưa lưu ở các rào phát hành, bộ đo vẫn chấm bản cũ đã lưu mà không cảnh báo, nên có thể báo đạt cho mã chưa từng được thử. Với cây đã lưu sạch thì kết quả đúng.
  Căn cứ: Rủi ro báo đạt oan chỉ xảy ra khi chấm lúc còn sửa dở và ghim lại bằng chế độ cây bẩn; không mất dữ liệu, chạy lại trên cây sạch là sửa được.
  file: `_acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 (đo nhầm cây): --hooks chạy bài tự kiểm trên bản commit HEAD, không phải cây đang kiểm**
  Người dùng thấy gì: Bộ đo bài tự kiểm chấm bản đã lưu chứ không phải bản đang có trên đĩa, nên sửa chưa lưu ở các rào có thể không được chấm tới. Hiện tại cây chỉ có tệp chưa theo dõi nên kết quả chưa sai.
  Căn cứ: Hậu quả nhẹ và chỉ khi cây còn sửa dở; không mất hay lộ dữ liệu, và người chạy tự tránh được bằng cách lưu trước khi chấm.
  file: `_acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs`
  severity: low
  Đề xuất: known-limits

- **Thẻ Cổng Phạm vi báo hợp đồng thiếu «Đường đo», nhưng hợp đồng có mục này từ lần commit đầu (r1)**
  Người dùng thấy gì: Thẻ người ký đã xem có một cờ cảnh báo sai và một con số ca phá lệch với hợp đồng. Hợp đồng và kết quả kiểm thật không bị ảnh hưởng, chỉ tấm thẻ đã dùng để duyệt hơi sai.
  Căn cứ: Hậu quả nhẹ: chỉ là thẻ đọc lệch, không mất hay lộ dữ liệu, hợp đồng đã ký vẫn đúng; vẽ lại thẻ cũ sau khi đã duyệt không đem lại giá trị đáng kể.
  file: `_acceptance/va-nut-ci-gitleaks/card.html`
  severity: low
  Đề xuất: wont-fix

- **Phép đo --hooks bỏ khỏi PATH cả thư mục chứa gitleaks, kéo theo node, git và jq nếu chúng nằm chung thư mục (r1 · tệp đã đổi)**
  Người dùng thấy gì: Trên một số máy chấm, bài kiểm có thể báo đỏ oan vì mất luôn các công cụ khác nằm cùng chỗ với gitleaks. Không bao giờ báo xanh giả, và trên máy hiện tại vẫn chạy đúng.
  Căn cứ: Hậu quả nhẹ: chỉ có thể làm kết quả đỏ oan, không bao giờ xanh giả, không mất dữ liệu, và người chạy lại trên máy khác là tự gỡ được.
  file: `_acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5: tuyên quét LỚP «env hiệu lực» (3 nguồn) nhưng ma trận phá thử chỉ có điểm-case cho 2 nguồn (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu sau này có người cho bước trước ghi bí mật vào môi trường chung của luồng nút, bài kiểm hiện tại có thể không bắt được. Hiện luồng thật không làm vậy nên không có rủi ro ngay.
  Căn cứ: Hậu quả hiện chưa xảy ra vì luồng thật sạch; chỉ là lỗ hổng phủ kiểm tra cho thay đổi tương lai, và bổ sung ca thử sau này rẻ, không mất dữ liệu.
  file: `_acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
