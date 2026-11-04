# Review findings: va-duong-loi-hoan-tac (round 2)

## Trong hợp đồng

- **Bài chấm E6 bị viết lại sau REJECT cho khớp hành vi đang có, nhưng hợp đồng AC-3 vẫn hứa ngược lại**
  AC: AC-3
  file: `_acceptance/va-duong-loi-hoan-tac/evals.yaml:63`
  severity: medium
  source: conventions
  detail: Commit 7ef0e91b ghi lượt 1 bị REJECT. Trong cùng commit, phần expected của E6 bị đổi từ «Ctrl+Z thêm một lần ra đúng «Đã hoàn tác rồi»» thành «Ctrl+Z thêm một lần không làm gì — không thông báo, giá không đổi». Tức là bài chấm được sửa cho khớp đúng hành vi sản phẩm vừa trượt. Còn contract.md:37-39 (AC-3) thì không đổi một chữ: «bấm nút ấy hay Ctrl/Cmd+Z thử lại đúng lần sửa ấy …; thử lại thành công thì lần bấm sau ra «Đã hoàn tác rồi»». Ở lượt (b) của E6, người thử lại bằng Ctrl+Z, và khi thử lại thành công thì thông báo không còn nút nào. Vậy «lần bấm sau» ở lượt này chỉ có thể là Ctrl+Z. Expected mới khẳng định Ctrl+Z đó không ra gì, trái với chữ của AC-3. Quyết định d-...-11 lý giải rằng AC-3 «chỉ nói lần bấm sau của nút» và viện dẫn AC-6 của va-sua-tren-o. Nhưng làm vậy là thu hẹp một tiêu chí đã đóng ấn ở Cổng 1 (seal d-...-10) mà không sửa hợp đồng và không có người ký. Thêm nữa, vế «lần bấm sau ra «Đã hoàn tác rồi»» của AC-3 giờ không còn bài chấm giao diện nào kiểm: gap-probe P1 ghim đúng vế này, và nay vế ấy bị gỡ. Cách sửa: sửa AC-3 trong contract.md cho khớp bài chấm và đưa người ký lại, hoặc giữ nguyên bài chấm cũ và sửa sản phẩm.
  rationale: AC-3 hứa thử lại thành công thì lần bấm sau ra «Đã hoàn tác rồi», còn sản phẩm cho Ctrl+Z không làm gì nên chữ của AC-3 không được giữ.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hoàn tác hỏng làm Ctrl/Cmd+Z trỏ lại một lần sửa cũ, dù lần sửa mới nhất không hoàn tác được**
  Người dùng thấy gì: Trong tình huống hiếm (sửa hai căn, một lần không hoàn tác được, rồi bấm lại ở thông báo cũ hỏng), phím Ctrl/Cmd+Z có thể hoàn tác nhầm lần sửa của căn cũ thay vì lần sửa gần nhất.
  Căn cứ: Hiếm gặp, người dùng thấy ngay thông báo hoàn tác nói rõ căn nào và có thể sửa lại giá; không mất dữ liệu ngầm, còn sửa cho đúng cần thêm cách theo dõi lần sửa gần nhất.
  file: `apps/web/src/app/(app)/inventory/cell-edit/hoan-tac.ts`
  severity: medium
  Đề xuất: known-limits

- **ghiAnToan nuốt hẳn exception: không log, mất stack của lỗi bất ngờ**
  Người dùng thấy gì: Khi xảy ra lỗi bất ngờ, người dùng vẫn thấy thông báo «thử lại», nhưng đội kỹ thuật không có dấu vết để tìm nguyên nhân nếu lỗi cứ lặp lại.
  Căn cứ: Người dùng không mất dữ liệu và vẫn thấy thông báo; hợp đồng đã xếp việc ghi nhật ký lỗi vào phần làm sau.
  file: `apps/web/src/app/(app)/inventory/cell-edit/lenh.ts`
  severity: low
  Đề xuất: known-limits

- **Vật chứng E6/E7 trên đĩa là của lượt 1 REJECT, không khớp bước của evals.yaml hiện hành**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối; chỉ là bằng chứng nghiệm thu của lượt cũ còn nằm lại và không khớp bài chấm mới.
  Căn cứ: Không đụng tới người dùng, và lượt chấm sau chạy lại bằng chứng mới nên không cần mở việc riêng.
  file: `_acceptance/va-duong-loi-hoan-tac/evidence/E6-chay.log`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 — câu khẳng định phủ định đứng một mình: E6 «Ctrl+Z thêm một lần không làm gì» không có cách phân biệt đúng với sai**
  Người dùng thấy gì: Không ảnh hưởng trực tiếp người dùng; bài kiểm tra có thể không bắt được trường hợp hoàn tác ghi bù hai lần.
  Căn cứ: Rủi ro nằm ở độ chặt của bài kiểm tra chứ không ở sản phẩm, và bài chấm có thể siết lại ở lượt chạy sau mà không mở việc mới.
  file: `_acceptance/va-duong-loi-hoan-tac/evals.yaml`
  severity: medium
  Đề xuất: wont-fix

- **Hoàn tác trên ô mời bấm lại cả khi lỗi do luật của lõi, khác luật của hoàn tác lô (r1)**
  Người dùng thấy gì: Khi hoàn tác một lần sửa trên ô thất bại vì luật nghiệp vụ (ví dụ căn không còn hợp lệ để chuyển), thông báo vẫn mời bấm Hoàn tác lại dù chắc chắn lại hỏng. Người dùng chỉ mất vài lần bấm vô ích và vẫn thấy lý do.
  Căn cứ: Hậu quả nhẹ: không mất hay lộ dữ liệu, người dùng chỉ bấm thừa và thấy lại thông báo lỗi; hợp đồng cũng không cấm hành vi này.
  file: `apps/web/src/app/(app)/inventory/cell-edit/hoan-tac.ts`
  severity: medium
  Đề xuất: known-limits

- **traLai có thể làm Ctrl/Cmd+Z trỏ lại một lần sửa cũ dù đã có lần sửa mới hơn không hoàn tác được (r1)**
  Người dùng thấy gì: Trong một tình huống hiếm (bấm nút Hoàn tác ở thông báo cũ bị hỏng sau khi đã có lần sửa mới hơn không hoàn tác được), phím Ctrl/Cmd+Z có thể hoàn tác lần sửa cũ thay vì lần gần nhất.
  Căn cứ: Cần chuỗi thao tác hiếm, kiểm phiên bản chặn được phần lớn trường hợp cùng căn, và người dùng thấy kết quả để sửa lại; nhưng căn khác nhau thì có thể đổi nhầm.
  file: `apps/web/src/app/(app)/inventory/cell-edit/hoan-tac.ts`
  severity: medium
  Đề xuất: known-limits

- **Chú thích của moTaLoi bị đẩy lên kiểu LoiGhi (r1)**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối; chỉ khiến người viết mã thấy chú thích gợi ý sai khi rê chuột.
  Căn cứ: Không có hậu quả nào với người dùng, không mất dữ liệu, sửa lúc nào cũng được và rất rẻ nếu có dịp.
  file: `apps/web/src/app/(app)/inventory/cell-edit/lenh.ts`
  severity: low
  Đề xuất: wont-fix

- **traLai đưa một bản ghi cũ trở lại Ctrl/Cmd+Z khi lần sửa mới hơn không hoàn tác được (r1)**
  Người dùng thấy gì: Sau khi bấm Hoàn tác trên thông báo cũ bị hỏng, phím Ctrl/Cmd+Z có thể quay về lần sửa cũ thay vì lần sửa gần nhất, và nếu hai lần sửa khác căn thì có thể đổi nhầm căn.
  Căn cứ: Chỉ xảy ra với chuỗi thao tác hiếm, người dùng thấy thông báo kết quả và hoàn tác lại được; sửa nằm chung một chỗ với lỗi tương tự.
  file: `apps/web/src/app/(app)/inventory/cell-edit/hoan-tac.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): hàng «ghi lô» của bảng E4 tắt đối chứng dương, nên phép kiểm âm còn lại luôn đạt (r1)**
  Người dùng thấy gì: Một bài kiểm tự động chưa chắc bắt được lỗi nếu sau này ghi lô báo nhầm câu chữ lỗi kho; người dùng hiện chưa gặp lỗi nào.
  Căn cứ: Chưa gây hậu quả nào cho người dùng, chỉ làm lưới an toàn khi sửa code về sau yếu đi; sửa rẻ nhưng ngoài hợp đồng.
  file: `apps/web/src/app/(app)/inventory/cell-edit/hoan-tac-loi.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay): bản ghi lô của các ca E1, E2, E5 được dựng tay, không lấy từ chayGhiLo (r1)**
  Người dùng thấy gì: Bài kiểm tự động dùng dữ liệu dựng sẵn thay vì dữ liệu do chức năng ghi lô thật tạo ra, nên nếu bên ghi điền sai mã căn thì bài vẫn xanh và thông báo có thể kể sai căn.
  Căn cứ: Chưa có hỏng thật, chỉ là rủi ro bài kiểm không bắt được lỗi về sau; người dùng không bị mất dữ liệu.
  file: `apps/web/src/app/(app)/inventory/bulk/hoan-tac-lo-loi.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (ma trận thiếu): bảng «loại lỗi nào được bấm lại» khai 5 × 2 nhưng chỉ assert cột thứ hai ở ba hàng (r1)**
  Người dùng thấy gì: Bài kiểm chưa kiểm hết các ô của bảng loại lỗi, nên một căn hỏng có thể bị đếm hai lần trong tiêu đề thông báo mà bài vẫn xanh.
  Căn cứ: Chưa có lỗi thật, chỉ là lưới kiểm lỏng ở vài ô; nhẹ và người dùng nếu gặp chỉ thấy số đếm lệch.
  file: `apps/web/src/app/(app)/inventory/bulk/hoan-tac-lo-loi.test.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/5 lỗi rơi vào file không bộ đo nào phủ (_acceptance/va-duong-loi-hoan-tac/evals.yaml, _acceptance/va-duong-loi-hoan-tac/evidence/E6-chay.log) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
