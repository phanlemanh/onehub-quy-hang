# Review findings: ghim-lai-ban-that-qua-ci (round 3)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Kết quả mong đợi trong evals.yaml lệch với bộ đo hiện tại (E2: 12 ca so với 14 ca; E3: 8 ca so với 10 ca)**
  Người dùng thấy gì: Bản mô tả kết quả mong đợi của hai phép đo còn ghi số ca cũ, nên người chấm có thể thấy lệch dù nút hoạt động đúng. Không ảnh hưởng đến việc nút chạy hay độ an toàn của bí mật.
  Căn cứ: Chỉ là chữ ghi chú lệch, nhẹ, không mất dữ liệu và sửa lại sau rất rẻ.
  file: `_acceptance/ghim-lai-ban-that-qua-ci/evals.yaml`
  severity: high
  Đề xuất: known-limits

- **Eval E1 thiếu _acceptance/config.yaml trong paths dù --tinh giờ đọc risk_tiers.t3_paths**
  Người dùng thấy gì: Nếu sau này ai đó đổi cấu hình phân hạng rủi ro, bằng chứng của nút có thể không bị coi là cũ để chạy lại. Nút vẫn chạy đúng như hiện tại.
  Căn cứ: Hậu quả nhẹ và chỉ xảy ra khi có người sửa cấu hình sau này; chi phí sửa không đáng so với rủi ro.
  file: `_acceptance/ghim-lai-ban-that-qua-ci/evals.yaml`
  severity: low
  Đề xuất: wont-fix

- **KIT_TAG bị nhân đôi sang luồng mới, trái với luật «nâng kit là đổi dòng đó trong ci.yml», và CI không có gì giữ hai dòng khớp nhau**
  Người dùng thấy gì: Lần nâng phiên bản bộ kiểm sau này có thể quên nút ghim lại, khiến nút chạy trên bản cũ mà không có tín hiệu báo. Hồ sơ nghiệm thu có thể sai lệch âm thầm.
  Căn cứ: Không mất dữ liệu nhưng dễ bị quên và lệch kéo dài; nên có việc riêng để một lần nâng kit cập nhật cả hai nơi.
  file: `.github/workflows/ghim-lai-ban-that.yml`
  severity: medium
  Đề xuất: new-contract

- **Bộ quét nuốt lỗi decodeURIComponent: mật khẩu chứa '%' không hợp lệ thì không bị dò, chỉ dò nguyên chuỗi**
  Người dùng thấy gì: Nếu mật khẩu bản thật có ký tự đặc biệt dạng lạ, một nhật ký chỉ in mật khẩu vẫn có thể qua kiểm tra và bị tải lên nơi GitHub không che bí mật. Bí mật có thể lộ, không thu hồi được nếu đã tải.
  Căn cứ: Hậu quả nặng vì lộ bí mật bản thật và không rút lại được, nhưng chỉ xảy ra với mật khẩu có dạng hiếm; sửa rẻ nên đáng làm thành việc riêng.
  file: `.github/scripts/quet-bi-mat.mjs`
  severity: medium
  Đề xuất: new-contract

- **Bộ quét bỏ qua im lặng tệp không tồn tại mà vẫn in «SẠCH n tệp»**
  Người dùng thấy gì: Thông báo kiểm tra có thể nói đã quét sạch nhiều tệp hơn số tệp thật sự đọc. Hiện không làm lọt bí mật vì bước tải đã báo lỗi khi thiếu tệp.
  Căn cứ: Chỉ sai lời thông báo, không lộ dữ liệu nhờ chốt khác đã chặn; nhẹ.
  file: `.github/scripts/quet-bi-mat.mjs`
  severity: low
  Đề xuất: known-limits

- **evals.yaml ghi kỳ vọng cũ: E2 nói 12 ca, E3 nói 8 ca, trong khi bộ đo chạy 14 và 10 ca**
  Người dùng thấy gì: Mô tả kết quả mong đợi và dấu vết bằng chứng chưa theo kịp bản sửa mới nhất, nên người đối chiếu thấy lệch. Nút vẫn hoạt động đúng.
  Căn cứ: Chỉ là hồ sơ ghi chép cũ, không ảnh hưởng người dùng cuối và dễ cập nhật lại.
  file: `_acceptance/ghim-lai-ban-that-qua-ci/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Bộ chặn kiểm repin_ci_blank_env bằng regex toàn tệp, không gắn với khối feature_loop**
  Người dùng thấy gì: Nếu cấu hình được viết theo kiểu khác, nút có thể chặn oan, hoặc hiếm hơn là cho qua khi khoá đặt sai chỗ. Chỉ chủ kho và máy sửa được cấu hình này.
  Căn cứ: Cấu hình hiện tại viết đúng dạng nên chưa gây hại, và chỉ người tin cậy sửa được; rủi ro thấp.
  file: `.github/scripts/chan-ghim-ban-that.mjs`
  severity: low
  Đề xuất: known-limits

- **--trong: thiếu khoá thì báo HỎNG rồi vẫn chạy tiếp và crash, thư mục kit tạm không được dọn**
  Người dùng thấy gì: Khi phép đo gặp cấu hình thiếu, nó báo lỗi rối và để lại thư mục tạm trên máy. Không ảnh hưởng nút hay bí mật.
  Căn cứ: Chỉ rác tạm trên máy người chạy đo, tự xoá được; không đáng công sửa.
  file: `_acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình 3 (assert chuỗi có mặt trong khi lời hứa là quan hệ): vế «gác lấy từ main» không kiểm bộ chặn so với config của main**
  Người dùng thấy gì: Nếu sau này ai đó sửa luồng để bộ chặn so cấu hình nhánh với chính nó, phép đo vẫn báo đạt và một nhánh có thể đổi lệnh ghi mà vẫn được chạy trên bản thật.
  Căn cứ: Hiện luồng đang đúng nên chưa gây hại, nhưng nếu hỏng sau này thì không ai hay và ảnh hưởng bản thật; cần việc riêng làm phép đo chặt hơn.
  file: `_acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs`
  severity: medium
  Đề xuất: new-contract

- **Hình 3 (assert chuỗi có mặt trong khi lời hứa là quan hệ): «quét trước khi tải» không đối chiếu tệp được quét với tệp được tải**
  Người dùng thấy gì: Nếu sau này đường dẫn quét bị gõ lệch so với tệp tải lên, tệp mang chuỗi kết nối vẫn có thể được tải lên mà phép đo vẫn báo đạt. Bí mật bản thật có thể lộ.
  Căn cứ: Hiện đường dẫn đang khớp nên chưa lộ, nhưng nếu lệch sau này thì lộ bí mật không rút lại được; nên có việc riêng để phép đo bắt trường hợp này.
  file: `_acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs`
  severity: medium
  Đề xuất: new-contract

⚠ Cụm ngoài vùng phủ: 3/10 lỗi rơi vào file không bộ đo nào phủ (_acceptance/ghim-lai-ban-that-qua-ci/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
