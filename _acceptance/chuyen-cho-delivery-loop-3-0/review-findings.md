# Review findings: chuyen-cho-delivery-loop-3-0

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bài đo của hồ sơ T3 ghim cứng v3.0.0 và so với nhánh chính, nên chuyển đỏ sau lần gộp hay lần nâng kit kế tiếp**
  Người dùng thấy gì: Sau khi gộp hoặc khi nâng kit lần sau, bài kiểm của việc chuyển chợ này sẽ báo đỏ dù hệ thống vẫn đúng. Người làm sẽ phải gỡ hồ sơ này khỏi lượt kiểm.
  Căn cứ: Chỉ gây báo động giả cho người làm về sau, không ảnh hưởng người dùng cuối, thử lại hoặc chỉnh bài đo là xử lý được.
  file: `_acceptance/chuyen-cho-delivery-loop-3-0/thu/chuyen-cho.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Bài chặn đường cache có số không còn bắt bố cục cache của chợ mới**
  Người dùng thấy gì: Một lệnh ghi cứng đường dẫn bản cài kit theo số phiên của chợ mới sẽ lọt qua mà không ai bị báo. Nếu có, máy khác sẽ chạy hỏng khi đổi phiên kit.
  Căn cứ: Hậu quả nhẹ, chỉ gây lỗi cấu hình khi đổi phiên, không mất dữ liệu, và hồ sơ cũ này vốn đã đỏ nên ít người dựa vào.
  file: `_acceptance/nang-kit-2-36-0/thu/nac.test.mjs`
  severity: low
  Đề xuất: known-limits

- **kiem-nut.mjs --trong takes the kit repo and core path from ci.yml, not from the ghim-lai-ban-that.yml workflow it measures**
  Người dùng thấy gì: Nếu luồng ghim lại trên CI bị để sai bố cục kit, bài kiểm của nút ghim lại vẫn xanh nhưng bước ghim lại trên CI sẽ hỏng. Người làm chỉ biết khi chạy thật.
  Căn cứ: Lỗi lộ ngay khi chạy luồng thật và thử lại được, không mất dữ liệu; còn có bài đo khác của vòng này chặn đúng chỗ ấy.
  file: `_acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs`
  severity: low
  Đề xuất: known-limits

- **kiem-ag-root.mjs now accepts CLAUDE_PLUGIN_ROOT=$RUNNER_TEMP/kit (the old layout), which breaks repin on kit v3.0.0**
  Người dùng thấy gì: Phép kiểm tĩnh của nút này chấp nhận cả bố cục kit cũ, nên một cấu hình sai có thể qua kiểm mà làm hỏng bước ghim lại trên CI.
  Căn cứ: Hậu quả nhẹ và tự lộ khi CI chạy; đã có bài đo khác của vòng chặn cùng lỗi nên sửa sau cũng được.
  file: `_acceptance/va-nut-ci-ag-root/thu/kiem-ag-root.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 — fixture viết tay đúng khuôn bên đọc: E7 đọc phan-loai-ghim.json lắp tay, không rút lại từ lượt repin-lane**
  Người dùng thấy gì: Danh sách hồ sơ ghim lại do người viết tay, chưa đối chiếu với kết quả máy chạy thật, nên có thể sót một hồ sơ đỏ mà bài vẫn xanh.
  Căn cứ: Rủi ro là báo xanh nhầm cho hồ sơ nội bộ, không ảnh hưởng người dùng; người ký đã xem kết quả và có thể chạy lại làn ghim bất cứ lúc nào.
  file: `_acceptance/chuyen-cho-delivery-loop-3-0/thu/chuyen-cho.test.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét cả LỚP nhưng chỉ có điểm-case: 7 luật loại trừ chỉ thử 3, assert «đúng một luật» luôn đúng theo cách dựng**
  Người dùng thấy gì: Phép quét tên lệnh cũ chỉ thử vài luật loại trừ, nên một luật bỏ thừa có thể giấu một tên cũ còn sót trong tệp đang dùng.
  Căn cứ: Nếu sót thì chỉ là một tên lệnh cũ trong tài liệu hoặc cấu hình, dễ thấy và sửa lại rẻ, không mất dữ liệu.
  file: `_acceptance/chuyen-cho-delivery-loop-3-0/thu/chuyen-cho.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 — đo môi trường máy tác giả thay vì cây đang kiểm: ca AC-4 «trên máy này» đọc sổ cài ở home, chung tệp với mọi eval cc30_thu**
  Người dùng thấy gì: Trên máy chưa cài đúng bản kit, toàn bộ bài kiểm của hồ sơ này sẽ đỏ dù mã nguồn đúng. Người khác chạy sẽ thấy lỗi khó hiểu.
  Căn cứ: Chỉ làm người làm khác tốn công khi chạy lại, không ảnh hưởng người dùng; cài đúng bản kit là hết đỏ.
  file: `_acceptance/chuyen-cho-delivery-loop-3-0/thu/chuyen-cho.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — lời hứa là quan hệ «chạy trên đúng cây HEAD» nhưng assert loại trừ chính đầu vào của phép đo (_acceptance/ gồm config.yaml)**
  Người dùng thấy gì: Nếu cấu hình nghiệm thu đổi sau lượt phân loại, bài vẫn báo khớp. Kết quả phân loại có thể cũ mà không ai biết.
  Căn cứ: Hiện chưa có lệch thật và chỉ ảnh hưởng độ tin của hồ sơ nội bộ; phân loại chạy lại được.
  file: `_acceptance/chuyen-cho-delivery-loop-3-0/thu/chuyen-cho.test.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — đối chứng AC-6 không có sàn dương: hai tập OK rỗng vẫn tính là «cùng phán quyết»**
  Người dùng thấy gì: Nếu kit bỏ qua mọi hồ sơ, bài đối chứng hai bản kit vẫn báo cùng kết quả và xanh. Người ký có thể tin nhầm là không đổi phán quyết.
  Căn cứ: Kết quả thật hiện có hồ sơ OK nên chưa gây hại; chỉ là lưới an toàn mỏng, thêm sàn sau với chi phí nhỏ.
  file: `_acceptance/chuyen-cho-delivery-loop-3-0/rang/doi-chung.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
