---
slug: nhanh-tuc-thi
at: 2026-10-31T09:13:36Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | E4b tải lại trang khi trình duyệt ngoại tuyến hẳn, trái với Out of scope (mở app khi mất mạng hẳn cần service worker) | Trình duyệt hiện trang lỗi mất mạng thay trang thử: E4b đỏ chắc chắn, hoặc người code thêm service worker ngoài phạm vi | Mất mạng = chặn */api/v1/*; sau tải lại 0 lời gọi /api/v1 thành công và giá đã sửa còn; bỏ chặn thì về «Đã đồng bộ» | fixed: E4b và DỰNG T đổi sang chặn */api/v1/*, ghi số lời gọi thành công = 0 sau tải lại |
| P0 | design | Sổ d-11 ghi bỏ design-pass là một-lối «không có màn mới» trong khi Kiểm kê màn liệt bốn màn | Chủ kho duyệt giao diện bằng chữ vì tưởng không có lối khác; thấy chỉ báo lần đầu ở Cổng Bằng chứng | Dòng chỉ-người với khuyến nghị và lối khác có giá | human-gate1: thay bằng Hỏi-4 (dòng sổ d-20261031T091512Z-13 supersedes d-11), thêm vào thiết kế |
| P1 | contract | AC-10 không xoá kho khi đăng xuất lúc 0 thay đổi chờ; E8b đo việc xoá gián tiếp | Kho của người đã đăng xuất còn nằm trên máy dùng chung, mọi eval vẫn xanh | Thêm vế 0 chờ vẫn xoá; E10 ca B 0 chờ kho rỗng; E8b đọc indexedDB.databases() trước và sau | fixed: AC-10, E10, E8b |
| P1 | contract | Lối «Sửa lại», «Bỏ thay đổi» của căn bị từ chối và trạng thái đã cọc không có AC hay eval | Căn 404 kẹt mãi trong cần xem, chỉ báo che «Mất mạng» — trượt vế «thanh trên luôn nói đang ở đâu» | AC-6 thêm Then cho hai lối; E6 hai ca đếm hàng đợi và cần xem trước/sau; E8b chụp ST-canxem-tu-choi và ST-canxem-da-coc | fixed: AC-6, E6, E8b |
| P1 | contract | Hàng đợi sàn cũ ở lại khi đổi sàn không có AC hay eval | Hàng đợi sàn A gửi trong ngữ cảnh sàn B thành 404, người bấm «Bỏ thay đổi» là mất sửa | Ca web_db: 3 chờ ở A, đứng ở B gửi +0, về A +3 đúng thứ tự | fixed: AC-4 thêm vế đổi sàn, E4 thêm ca, trục mạng Coverage thêm giá trị |

Hai lỗ nhỏ ngoài suất cũng đã sửa: AC-5, AC-6, AC-7 gắn (cross-layer) và E5, E6, E7 mang `layer: backend-effect`; E5 lặp cả «Đã bán».
