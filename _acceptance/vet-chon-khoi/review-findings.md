# Review findings: vet-chon-khoi (round 1)

## Trong hợp đồng

- **«Tệp đang dùng» không có dấu backtick thì không được kiểm, kể cả khi đường dẫn sai**
  file: `packages/ui-lint/kiem-chuan.mjs:168`
  severity: medium
  AC: AC-3
  source: bugs
  detail: kiemKhoi chỉ kiểm sự tồn tại của các đường dẫn nằm trong dấu backtick (vòng `for (const t of trongVet(tepDung ?? ""))`). Nếu ô có chữ nhưng không có backtick, chẳng hạn `apps/web/src/khong-co/`, thì trongVet trả mảng rỗng. Ô cũng qua được bước kiểm rỗng, nên không lỗi nào được báo. Đã thử trên một worktree tạm: đổi ô Tệp đang dùng của app-shell-8 thành `| apps/web/src/khong-co/ |` thì kiem-chuan.mjs vẫn in «khối: 2 dòng đủ chín ô … chuẩn giao diện: đạt» và thoát bình thường. Như vậy mục «trỏ sai tệp thì đỏ» trong hợp đồng (AC-3) và trong catalog.md bị lọt mà không có thông báo nào. Cách sửa: khi ô không trống mà trongVet rỗng thì báo lỗi khuôn, tương tự cách Ảnh chuẩn đang làm với `!a`.
  rationale: AC-3 đòi tệp đang dùng không có trên đĩa thì đỏ; ô ghi đường dẫn sai không backtick vẫn xanh nên AC-3 thất bại.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Ô «Duyệt» của data-grid-editing-6 ghi sai ngày, và kiểm chuẩn không bắt được vì không đối chiếu ngày**
  Người dùng thấy gì: Ngày duyệt ghi trong danh mục khối lệch một ngày so với hồ sơ gốc, và máy không báo. Chỉ làm vết duyệt kém chính xác, không ảnh hưởng chạy hay dữ liệu.
  Căn cứ: Hậu quả nhẹ: chỉ lệch một ngày ở dòng ghi chép, không mất dữ liệu, người sửa tay được ngay và rẻ.
  file: `.agents/skills/quy-hang-ui/catalog.md`
  severity: medium
  Đề xuất: known-limits

- **Regex đọc approved_by vượt sang dòng sau khi ô ký còn trống**
  Người dùng thấy gì: Khi hồ sơ chưa ký, máy vẫn báo đỏ nhưng lý do in ra có thể gây hiểu nhầm một chút.
  Căn cứ: Hậu quả rất nhẹ: kết quả đỏ vẫn đúng, chỉ lời giải thích hơi lạc, người đọc vẫn tìm ra nguyên nhân.
  file: `packages/ui-lint/kiem-chuan.mjs`
  severity: low
  Đề xuất: known-limits

- **Kiểm Archetype chỉ là tìm chuỗi con trong cả tệp vo-va-ia.md**
  Người dùng thấy gì: Máy gần như không bắt được việc ghi sai tên kiểu màn trong danh mục khối, nên một tên sai có thể lọt qua.
  Căn cứ: Hậu quả nhẹ: chỉ sai một nhãn mô tả trong tài liệu, không ảnh hưởng người dùng cuối, người duyệt tay thấy được.
  file: `packages/ui-lint/kiem-chuan.mjs`
  severity: low
  Đề xuất: known-limits

- **Kiểm Archetype dùng tìm chuỗi con trên cả tệp vo-va-ia.md, nên tên sai hay viết thiếu vẫn qua**
  Người dùng thấy gì: Tên kiểu màn viết thiếu hay sai vẫn được coi là hợp lệ, máy không cảnh báo.
  Căn cứ: Hậu quả nhẹ: chỉ là nhãn mô tả sai trong tài liệu, không mất dữ liệu và sửa tay rẻ.
  file: `packages/ui-lint/kiem-chuan.mjs`
  severity: low
  Đề xuất: known-limits

- **Ngày «hôm nay» mặc định lấy theo UTC, nên cảnh báo hạn xem lại tới trễ trong múi giờ Việt Nam**
  Người dùng thấy gì: Cảnh báo hạn xem lại có thể tới trễ vài giờ đầu ngày theo giờ Việt Nam.
  Căn cứ: Hậu quả rất nhẹ: chỉ trễ tối đa vài giờ một cảnh báo không chặn, hôm sau vẫn hiện.
  file: `packages/ui-lint/kiem-chuan.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 — fixture viết tay đúng khuôn bên đọc: reui-tra.md («kết quả thô») là danh sách gõ tay theo đúng khuôn mà test tự phân tích**
  Người dùng thấy gì: Bằng chứng tra cứu thư viện giao diện được chép tay nên chưa chứng minh được là kết quả máy trả về thật.
  Căn cứ: Hậu quả vừa nhưng không ảnh hưởng người dùng cuối: chỉ làm giảm độ tin của vết tra cứu, chạy lại tra cứu thật là kiểm được.
  file: `packages/ui-lint/tests/kiem-chuan.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — ma trận viết trước bị đổi phần tử mà số assert vẫn bằng 15: thiếu ca «Khối gốc» rỗng**
  Người dùng thấy gì: Bài tự kiểm bỏ sót một trường hợp ô tên khối để trống, nên lỗi ở đó có thể không được phát hiện.
  Căn cứ: Hậu quả nhẹ: chỉ là một ca thử thiếu, người dùng không thấy, bổ sung sau rẻ.
  file: `packages/ui-lint/tests/kiem-chuan.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3/5 — «bộ quét bắt khối thật»: ma trận là hằng gõ tay với assert độ dài tự đúng, quan hệ tập chỉ được so bằng số đếm**
  Người dùng thấy gì: Bài tự kiểm chỉ so số lượng khối, nên nhận nhầm một khối đồng thời bỏ sót một khối vẫn có thể không bị phát hiện.
  Căn cứ: Hậu quả nhẹ và hiếm xảy ra: không ảnh hưởng người dùng cuối, chỉ làm lưới kiểm lỏng hơn một chút.
  file: `packages/ui-lint/tests/kiem-chuan.test.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
