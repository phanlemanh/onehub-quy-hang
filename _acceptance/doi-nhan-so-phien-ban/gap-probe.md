---
slug: doi-nhan-so-phien-ban
at: 2026-11-07T11:04:30Z
verdict: findings
p0: 1
p1: 2
p2: 1
---

# Phản biện context sạch — doi-nhan-so-phien-ban

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | design | Vế «bản hiện tại chưa ở đích» đổi kết quả ca hai người cùng đưa căn vào Đang giao dịch / Đã bán từ một bản; sổ ghi máy quyết, không AC API đo | Người sau chốt Đã bán bị đẩy vào Cần xem mà Cổng Phạm vi không biết | Hỏi ở Cổng Phạm vi; thêm ca API hai người cùng đưa vào | fixed: đối chiếu mã — hôm nay lệnh sau không nhãn đã bị bảng chuyển từ chối (Pending không chuyển sang Pending), không thắng; lệnh sau có nhãn thì đè nhãn âm thầm (biến thể Ngoài-5). Vế giữ, kết cục người dùng không đổi ngoài việc nhãn hết bị đè — design §Máy chủ «Hệ quả có chủ ý», sổ d-20261107T110415Z-9 (supersedes d-2, nguồn một-lối); AC-1 thêm ca «cùng đưa vào», AC-5 thêm ca API hai người cùng đưa vào (không nhãn, có nhãn, Đã bán giá chốt khác) + phá thử luật bỏ vế hiện tại |
| P1 | evals | E1 không có bảng kết quả viết tay từng bộ — có thể hằng đúng; ca (Closed,null,Active) của AC-1 không có trong E1 | Luật sai tập mà vẫn ra 60 bộ và tám ca có tên làm E1 xanh | Bảng viết tay, so từng bộ; thêm ca | fixed: E1 so từng bộ trong 252 với bảng viết tay theo nhóm (đích, bản hiện tại), thêm ca (Closed,null,Active)=true và phá thử luật đảo vế không biết, luật bỏ vế hiện tại |
| P1 | design | Sổ d-4 trích luật 10 không quyết ca lệnh vắng phiên bản; không nêu lệnh khác vắng phiên bản ra gì | Bên gọi API đổi nhãn không gửi phiên bản nhận 409 mà Cổng không thấy là đổi hợp đồng | Trích đúng chỗ quyết; đối chứng đổi giá vắng phiên bản | fixed: đường ghi hôm nay trả 409 cho MỌI lệnh không thắng ngay vắng phiên bản — sổ d-20261107T110415Z-10 (supersedes d-4) trích dòng ấy của store.ts; E5 thêm đối chứng price_changed vắng phiên bản ra cùng mã |
| P2 | evals | Ngoài-7 qua hàng đợi đồng bộ và đổi nhãn đụng nhau trong Đã bán qua đồng bộ không có ca | Bộ đồng bộ cập nhật phiên bản lệnh xếp hàng thì Ngoài-7 lọt ở đường thật; nhánh Closed còn phép cũ | Thêm hai ca E6 | fixed: AC-6/E6 thêm ca căn Đã bán (kind «dung-nhau») và ca lệnh đổi nhãn xếp hàng gửi sau khi căn về Đang bán |
