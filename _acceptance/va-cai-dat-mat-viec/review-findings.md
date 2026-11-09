# Review findings: va-cai-dat-mat-viec (round 1)

## Trong hợp đồng

- **Hình dạng 3: assert "chuỗi có mặt" cho lời hứa quan hệ từng dòng (Quy đổi và Nguồn «của chính nó» ở khổ 375)**
  file: `_acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs:356`
  severity: medium
  AC: AC-7
  source: measurement
  detail: AC-7 hứa mỗi dòng đọc được Ghép vào, Quy đổi và Nguồn của chính nó ở dòng phụ. Có ba chỗ không đo được quan hệ này. (1) Dòng 348 chỉ lấy cells[1] và cells[3] làm chuẩn so, bỏ cột Quy đổi cells[2], nên Quy đổi không được đối chiếu từng dòng. (2) Dòng 356 (docDuocQuyDoi) chỉ kiểm một dòng KHOA_QD chứa literal "1 giá trị". Dòng 130 chỉ cho KHOA_QD có value_map, và map đó có đúng một khoá. Vì vậy dòng phụ in cứng "1 giá trị", hoặc đếm sai khi map có nhiều hơn một khoá, vẫn đạt. Năm dòng không có quy đổi cũng không bị kiểm là không mang số đó. (3) Phép so từng dòng ở dòng 353 không phân biệt được dòng: dòng 130 ghi cùng edited_by, trong cùng một ngày, nên Nguồn của sáu dòng là một chuỗi giống hệt. Ghép vào cũng chỉ có hai giá trị (hai dòng buildingName, bốn dòng keep_as_note). Dòng phụ lấy Nguồn của dòng khác vẫn qua includes. Fixture cần giá trị khác nhau giữa các dòng thì assert mới đo được «của chính nó».

- **Hình dạng 3: boChanLuuDuoc đếm số khoá trong khi lời hứa là máy chủ giữ đúng giá trị mới**
  file: `_acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs:341`
  severity: low
  AC: AC-6
  source: measurement
  detail: AC-6 và E6 hứa «cùng bản sửa ghi giá trị mới xuống cơ sở dữ liệu». Assert chỉ là Object.keys(value_map).length === 2, không so nội dung với bản đã gõ ở dòng 338 («B → [Mẫu] Toà B»). Lỗi tách khoá/giá trị, giá trị B bị đổi, hay giá trị A cũ bị ghi đè vẫn cho hai khoá nên vẫn đạt. Quan hệ cần đo là value_map bằng đúng { A: "[Mẫu] Toà A", B: "[Mẫu] Toà B" }. Hiện giá trị đã nhập và giá trị đọc lại không được so với nhau ở đâu.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bước cuối E10 tắt máy dev chung mà không qua khoá, phá luật chạy lần lượt của lệnh đo**
  Người dùng thấy gì: Khi hai bên cùng chấm, máy thử có thể bị tắt giữa chừng và vài ca đo báo trượt oan dù màn đúng. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ làm bài chấm báo sai thỉnh thoảng, không đụng dữ liệu hay màn thật, chạy lại là qua.
  file: `_acceptance/va-cai-dat-mat-viec/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **E10 ghi lệnh --dung-man để nguyên dữ liệu, nhưng khối finally dọn hết**
  Người dùng thấy gì: Người chấm mở màn thật sau lệnh chụp sẽ thấy dữ liệu thử đã bị dọn, khác với mô tả. Màn của người dùng không đổi.
  Căn cứ: Chỉ gây nhầm lẫn nhỏ cho người chấm, sửa một dòng mô tả là xong, không mất dữ liệu thật.
  file: `_acceptance/va-cai-dat-mat-viec/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **404 ở dòng cuối cùng: câu «Cột này đã bị xoá trước đó» biến mất, hộp bị tháo**
  Người dùng thấy gì: Khi xoá một cột mẫu nhập mà cột đó là dòng cuối và đã bị người khác xoá trước, người dùng chỉ thấy màn trống chứ không thấy câu giải thích. Hộp xoá cũ còn có thể tự bật lại nếu bảng có dòng lại.
  Căn cứ: Hiếm gặp (đúng dòng cuối, đúng lúc bị xoá trước), không mất dữ liệu, người dùng tải lại là ổn; nhưng gây khó hiểu nên nên có việc sửa riêng.
  file: `apps/web/src/app/(app)/settings/templates/vung-mau-nhap.tsx`
  severity: low
  Đề xuất: new-contract

- **--dung-man vẫn xoá dữ liệu mẫu dù bước E10 ghi «để nguyên dữ liệu»**
  Người dùng thấy gì: Sau lệnh chụp màn, dữ liệu thử bị dọn nên người chấm đối chiếu màn thật sẽ thấy khác ảnh. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ ảnh hưởng người chấm, ảnh đã chụp đúng, không mất dữ liệu thật và chạy lại là có dữ liệu thử.
  file: `_acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4: chiều đỏ của E7 không ghim thông điệp, lỗi dừng giữa kịch bản cũng được tính là đỏ**
  Người dùng thấy gì: Bằng chứng cho thấy bài đo từng đỏ trước khi sửa chưa chỉ rõ đỏ đúng vì lỗi nào. Màn người dùng thấy không đổi.
  Căn cứ: Chỉ làm bằng chứng lịch sử kém sắc nét, không ảnh hưởng người dùng; các phép đo hiện tại vẫn chạy được.
  file: `_acceptance/va-cai-dat-mat-viec/evidence/truoc-sua.log`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

⚠ Cụm ngoài vùng phủ: 3/7 lỗi rơi vào file không bộ đo nào phủ (_acceptance/va-cai-dat-mat-viec/evals.yaml, _acceptance/va-cai-dat-mat-viec/evidence/truoc-sua.log) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
