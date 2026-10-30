# Review findings: tang-5-giao-dien (round 2)

## Trong hợp đồng

(không có finding nào map được vào AC)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 5 (tuyên quét LỚP nhưng chỉ có điểm-case): test mới của muc-no nêu «ui/reui thì không» nhưng không có tệp nào dưới reui**
  Người dùng thấy gì: Phép đếm nợ giao diện hiện đúng, nhưng bài tự kiểm chưa chứng minh được việc bỏ qua thư mục thành phần chính chủ. Nếu sau này ai đó sửa danh sách thư mục bị bỏ qua, nợ có thể bị đếm sai mà bài kiểm vẫn báo xanh.
  Căn cứ: Nhẹ với người dùng: hôm nay phép đếm đúng, chỉ là lưới an toàn phía sau còn lỗ, và chỗ lỗ chỉ lộ ra khi có người sửa danh sách, nên ghi lại để lần sau biết là đủ.
  file: `packages/ui-lint/tests/muc-no.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP nhưng chỉ có điểm-case): cau-hinh kiểm phạm vi luật cho blocks nhưng bỏ sót examples**
  Người dùng thấy gì: Cấu hình kiểm lỗi giao diện hiện đúng, nhưng bài tự kiểm chưa phủ thư mục ví dụ đã chuyển thể. Nếu sau này thư mục đó vô tình bị miễn luật, các màn dựng từ ví dụ có thể lọt lỗi giao diện mà không ai báo.
  Căn cứ: Nhẹ: không mất dữ liệu và không ảnh hưởng người dùng cuối hôm nay, chỉ là một chỗ chưa có người gác nếu cấu hình bị đổi nhầm về sau.
  file: `packages/ui-lint/tests/cau-hinh.test.mjs`
  severity: low
  Đề xuất: known-limits

- **The text-based comment scanner misses directives that come after a URL or glob string on the same line (r1 · tệp đã đổi)**
  Người dùng thấy gì: Hiếm khi, một dòng tắt kiểm tra giao diện mà không ghi lý do có thể lọt qua nếu cùng dòng đó có đường dẫn hay địa chỉ web. Người duyệt PR vẫn thấy được dòng đó khi đọc thay đổi.
  Căn cứ: Chỉ xảy ra với cách viết hiếm, không làm mất hay lộ dữ liệu của ai, và người duyệt PR vẫn nhìn thấy dòng đó; sửa sau được rẻ vì chỉ đổi cách đọc chú thích.
  file: `packages/ui-lint/check-bare-disables.mjs`
  severity: low
  Đề xuất: known-limits

- **Debt-ceiling gate passes silently when `tran` is missing or not a number, or when main's ceiling file can't be read (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu tệp ghi mức trần bị sửa hỏng hoặc mất con số, cổng chặn tăng nợ giao diện có thể cho qua mà không báo. Chỉ ảnh hưởng người sửa tệp này, không ảnh hưởng người dùng cuối.
  Căn cứ: Cần ai đó sửa tệp trần sai đúng kiểu này mới gặp, hậu quả chỉ là nợ giao diện tăng mà không bị chặn, không động đến dữ liệu khách; người duyệt PR nhìn thấy thay đổi tệp trần và sửa sau rẻ.
  file: `packages/ui-lint/muc-no.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP nhưng chỉ có điểm-case): ma trận phá của kiem-chuan không phủ hết các nhánh lỗi của script (r1)**
  Người dùng thấy gì: Một số lỗi khai thiếu trong cấu hình giao diện của kho chưa có bài thử riêng bắt được. Nếu bước kiểm này hỏng đúng chỗ đó, bài thử vẫn xanh và không ai hay.
  Căn cứ: Không ảnh hưởng trực tiếp người dùng, bước kiểm vẫn chạy và chặn các lỗi chính; thiếu bài thử chỉ làm lỗi trong chính bước kiểm khó bị phát hiện sớm, bổ sung sau rẻ.
  file: `packages/ui-lint/tests/kiem-chuan.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): test tim-kit tự soạn sẵn danh sách bản cài và danh sách gốc kho, không đọc sổ plugin thật (r1)**
  Người dùng thấy gì: Bài thử việc tự tìm bộ công cụ nghiệm thu dùng dữ liệu viết tay, chưa chạy trên sổ cài thật. Nếu cách đọc sổ thật sai, bước sàn thiết kế có thể không chạy mà bài thử vẫn xanh.
  Căn cứ: Chỉ làm bước chạy sàn thiết kế trên máy người làm có thể báo lỗi, không mất dữ liệu và thử lại được ngay; lần sửa gần nhất đã xử lý đường này nên rủi ro còn lại nhỏ.
  file: `packages/ui-lint/tests/tim-kit.test.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
