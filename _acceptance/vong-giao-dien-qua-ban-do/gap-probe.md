---
slug: vong-giao-dien-qua-ban-do
at: 2026-10-31T12:46:09Z
verdict: findings
p0: 2
p1: 2
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ chọn khổ và trạng thái đối chiếu ghi căn cứ «mục tiêu» nhưng câu trích (AC-7 hồ sơ 58) không quyết khổ cho bước đối chiếu; vế trạng thái không có câu trích nào. | Người ký tin khổ đối chiếu đã được hồ sơ 58 chốt, trong khi đó là lựa chọn của máy chưa có căn cứ. | Tách thành hai dòng, mỗi dòng có căn cứ thật hoặc thành câu hỏi. | fixed: hai dòng mới thay dòng cũ — khổ trích skill quy-hang-ui («nhìn màn đang chạy ở khổ máy tính và 375px»); trạng thái là «một lối» (ngoài trạng thái bản đồ khai thì không có màn mẫu để đặt cạnh). |
| P0 | design | Dòng sổ đặt răng «màn ngoài bản đồ» trong bài quét sẵn có ghi căn cứ «mục tiêu» nhưng câu trích nguyên tắc 5 không quyết chỗ đặt; lý do loại lệnh riêng không đứng. | Người ký không cân đánh đổi đổi nghĩa ban-do-khuon so với lệnh riêng. | Đổi sang «một lối» với ràng buộc thật. | fixed: dòng mới «một lối» — lệnh riêng vẫn phải sửa lối thoát sớm của ban-do-khuon --base và bước chấm phải gọi hai lệnh; giá «đổi nghĩa ban-do-khuon» ghi ở vế giá. |
| P1 | evals | Ngưỡng «ảnh màn mới cạnh màn mẫu có ở Cổng Phạm vi» không có đường đo; luật không buộc gửi trang ghép kèm thẻ. | Hàng 14 tới Cổng Phạm vi không có trang ghép mà mọi eval vẫn xanh. | Thêm câu hỏi vào E8 và khai phần ngưỡng do hàng 14 chứng. | fixed: AC-8 và E8 thêm vế (7) buộc gửi doi-chieu/index.html có ảnh màn mới kèm thẻ Cổng Phạm vi trước khi ký; Đường đo khai lần đầu ngưỡng đo trên vòng thật là hàng 14. |
| P1 | contract | AC-1 và E1 không kiểm tệp màn mới chưa theo dõi. | Màn mới chưa commit bị bỏ sót, lệnh in «không chạm màn» và thoát 0. | Thêm ca chưa theo dõi kèm đối chứng âm. | fixed: AC-1 và E1 thêm ca settings/thu/page.tsx chưa git add sinh 6 cặp; docs/moi.md chưa theo dõi không sinh cặp nào. |
| P2 | evals | E7 dùng chung kho với E6 mà không ghim HEAD; AC-6 ghi ba commit nhưng kể bốn. | E7 đỏ oan sau đối chứng c5 hoặc số kỳ vọng bị chỉnh tay. | Ghim HEAD = c4 hay kho riêng; assert dòng --bao bằng số trong JSON. | fixed: E7 dùng kho riêng tới c4, thêm assert ba số của dòng --bao bằng khuon-so-do.json; AC-6 sửa «bốn commit». |
