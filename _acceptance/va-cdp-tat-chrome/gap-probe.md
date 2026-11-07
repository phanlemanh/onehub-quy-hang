---
slug: va-cdp-tat-chrome
at: 2026-11-06T04:40:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Chiều đỏ E7 chỉ sáu ca, bỏ SIGINT, SIGHUP, bat-rieng; ca mo-coi rút khuôn sổ từ bản cũ vốn không ghi sổ; E7 chỉ gắn AC-4. | Bản sửa quên đăng ký SIGHUP mà không chiều đỏ nào bắt; mo-coi trên bản cũ ném lỗi trước khẳng định, E7 đỏ sai thông điệp. | Ma trận đủ chín ca, mỗi ca một thông điệp ghim; mo-coi trên bản cũ dùng khuôn sổ do bản sửa ghi cùng lượt. | fixed: E7 thành ma trận mười một ca (thêm SIGINT, SIGHUP, bat-rieng, dong-exit-0, dong-exit-3); mo-coi dựng sổ bằng khuôn của bản trong cây; E7 gắn AC-1, phủ AC-1 đến AC-5 theo expected |
| P1 | evals | E1–E4 khẳng định âm tính mà không có đối chứng dương trong ca; bộ dò tiến trình có thể đọc dòng lệnh bị cắt. | Sổ ghi sai chỗ hay ps cắt dòng lệnh thì «dòng sổ không còn», «không còn tiến trình» xanh rỗng. | Trước bước tắt: sổ có đúng đường con in và đúng PID; bộ dò thấy ≥1 tiến trình mang thư mục; đường gốc suy từ vị trí script. | fixed: đầu evals.yaml khai đối chứng dương bắt buộc cho mọi ca E1–E5 (thông điệp «đối chứng dương hỏng: <điều>»); bộ dò dùng ps -ww; đường cdp.mjs suy từ vị trí bài đo |
| P1 | contract | Người canh là loại tiến trình mới có thể mồ côi mà không AC hay eval nào đo nó tắt. | Lời gọi sống lâu mở rồi dong() nhiều lần, mỗi lần để lại một node canh; E1–E6 vẫn xanh. | Con in PID người canh; mọi lối kết thúc khẳng định người canh không còn trong 5 giây; E1: người canh tắt khi dong() xong dù con còn sống. | fixed: AC-1 đến AC-4 thêm «tiến trình canh không còn»; thiết kế: người canh thoát khi Chrome đã tắt dù tiến trình gọi còn sống, PID canh ghi trong sổ; E1–E4, E6 khẳng định người canh tắt |
| P1 | evals | Không ca nào dựng mẫu phổ biến nhất của chỗ thử: dong() không await rồi process.exit ngay, lúc hai bước tắt chồng nhau. | Bộ tắt lúc thoát ném ENOENT khi dong() dở đã xoá, mã thoát đổi 0 → 1, cả 30 chỗ thử đỏ oan. | Ca dong-roi-exit với exit(0) và exit(3): mã đúng, stderr rỗng, không còn Chrome, thư mục, sổ, người canh; chạy cả trên bản cũ. | fixed: AC-2 thêm dong() rồi process.exit(0) / (3); E2 thêm dong-exit-0, dong-exit-3 với stderr rỗng; thiết kế: mọi bước xoá và kill bỏ qua ENOENT/ESRCH; E7 chạy cả hai ca trên bản cũ |
| P2 | design | Dọn mồ côi bỏ ca Chrome và tiến trình gọi đều đã chết mà hồ sơ còn trên đĩa; không ghim đường được phép xoá. | Sau khởi động lại máy, thư mục qh-b-chrome-* nằm mãi; dòng sổ hỏng khiến rmSync xoá đường ngoài thư mục tạm. | Nhánh thứ ba xoá thư mục chỉ khi nằm dưới thư mục tạm và mang tiền tố qh-b-chrome-; E5 thêm hai dòng. | fixed: thiết kế thêm nhánh 3 và luật đường xoá; AC-5 thành bốn dòng (a)–(d); E5 ma trận bốn phần tử |
