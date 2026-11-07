---
slug: kiem-nhanh-rang-buoc-ban-ma
at: 2026-11-06T16:10:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | decisions | Căn cứ trích Tham chiếu chỉ quyết vế «bảng sạch mà chưa bật»; hai vế đỏ khác của AC-3 và vế chỉ báo của AC-2 chỉ được suy ra | Cổng Phạm vi duyệt điều kiện chặn deploy mới không có căn cứ phủ — máy tự thêm lựa chọn chặn | Mỗi vế có căn cứ tệp + câu trích quyết được nó, không thì thành Hỏi | fixed: dòng S1 mới (supersedes) trích đúng dòng kiemTrangThai của bat-rang-buoc.test.mjs — phủ hai vế đỏ và vế chỉ báo; ràng buộc vắng làm luật cũ ném lỗi nên deploy cũ cũng dừng |
| P1 | contract, evals | AC-1, AC-3 đòi CLI thoát 1 nhưng E1, E3 chỉ đo kết quả soi | Nhánh đỏ của CLI hỏng (không đặt mã 1, in sai tên) mà bài vẫn xanh | Đo phần dựng mã thoát và dòng lỗi của CLI trên kết quả đỏ thật | fixed: AC-1 và E1 đo ketQuaCli trên kết quả soi đỏ (mã 1, chứa tên bảng và ràng buộc) và đối chứng mã 0; giới hạn còn lại: đường read only với DDL đã commit không dựng được trong giao dịch rollback |
| P1 | design, contract | Không AC nào bảo đảm vai đếm thấy mọi dòng; bảng ép luật theo dòng | Vai kết nối đổi về vai thường → count = 0 → deploy tin bảng sạch | Đọc rolsuper/rolbypassrls của vai hiện tại, vai chịu luật thì báo lỗi ghim sẵn | fixed: thêm AC-6 và E6 (set local role quy_hang_app → lỗi vai, không lỗi bảng sạch; đối chứng postgres) |
| P1 | opportunity, contract | Không có ảnh chụp trạng thái bản thật trước cổng; timebox trống | Bản thật đang ở trạng thái bảng sạch chưa bật → deploy đỏ đúng mà hàng bị coi là chết | Chụp trạng thái bằng câu chỉ đọc, ghi Notes; người khai timebox | fixed: Notes ghi lần CI trên main 42230599946 (14:12Z, trước PR #176) chạy đúng ca này trên bản thật và xanh; không chạy gì lên bản thật từ máy; timebox để người khai ở Cổng Giá trị |
| P2 | evals | E5 so chuỗi câu SQL, `count(*), max(owner_phone)` lọt | Giá trị số vào bộ nhớ CI mà bài vẫn xanh | Ghi result.fields, đòi một cột int8, đối chứng max(owner_phone) | fixed: E5 đo result.fields một cột int8 và đối chứng đỏ hai cột |
