---
slug: goi-ep-gia-dot-hai
at: 2026-11-02T11:05:00Z
verdict: findings
p0: 1
p1: 4
p2: 0
claims_input: ok
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Hai dòng sổ máy tự quyết bỏ phạm vi mà căn cứ không đủ: bỏ dòng giá lead gốc khỏi lịch sử trả giá (ghi «một lối» trong khi lối thêm đường đọc vẫn sống) và bỏ ghi chú cuộc gọi, tin rao, «chủ còn căn nào» (câu trích từ hợp đồng hàng 28 không quyết ba mục ấy). Cùng dạng [cuoc-goi-khai-thac#F1], [va-san-sang-ban#F1]. | Chủ kho ký vì tưởng lịch sử trả giá đủ căn cứ ép giá; đầu chủ gọi đợt hai không thấy chủ đã xuống bao nhiêu từ lúc nhận lead; ba ô của bản phác KD2 biến mất mà không ai quyết. | Mỗi mục bỏ là một dòng sổ chỉ người quyết, thẻ Cổng Phạm vi nêu. | fixed: hai dòng sổ mới Hỏi-5 (giá lead gốc) và Hỏi-6 (ghi chú cuộc gọi, tin rao, chủ còn căn nào) mang supersedes hai dòng cũ; contract Out of scope, AC-2 và design trỏ Hỏi-5, Hỏi-6 |
| P1 | evals | Dữ liệu thử cho nhóm «Nên gọi điều chỉnh giá» (mốc ≥ 10 ngày) không nói cách lùi ngày; E6 chỉ khẳng định «P4 rời nhóm» mà không ghi P4 ở nhóm trước. | Hồ sơ mang ngày hôm nay nên P4 chưa từng vào nhóm, E6 xanh sẵn; E1b, E8 đỏ vì dữ liệu. | Bước đối chứng dương trước; evals khai đường lùi ngày và in mốc; mốc dưới 10 ngày thì dừng «chưa đủ điều kiện». | fixed: đầu evals.yaml khai dung-d.mjs lùi occurred_at trên Postgres thử của dãy D bằng phiên chủ (session_replication_role = replica) và in mốc, ui-check dừng «chưa đủ điều kiện» khi mốc dưới 10 ngày; E6, E8 thêm bước đối chứng dương ở Hôm nay |
| P1 | contract | Trục F (mất mạng, máy chủ từ chối) trỏ AC-5, AC-6, AC-7 mà không ô nào nói hai ca ấy; trục E thiếu ô «lịch sử chưa kéo về»; AC-4 hứa bấm chuột như phím mà không bài đo. | Máy chủ từ chối lần hạ giá, màn vẫn «Đã ghi», đầu chủ tưởng giá đã xuống; mọi bài xanh vì chỉ đi đường có mạng. | Ô Given/When/Then cho mất mạng và máy chủ từ chối, bài ui-check offline; bài bấm chuột. | fixed: AC-5 thêm ca mất mạng và máy chủ từ chối (Cần xem, chỉ báo nói vì sao), eval E5c ui-check backend-effect offline rồi từ chối; AC-2 và E2 thêm «Đang tải lịch sử»; E7b bước P5 chỉ bằng chuột |
| P1 | contract | Chưa rõ trưởng nhóm có mở màn ép giá không: AC-3 coi trưởng nhóm thấy nguồn, AC-10 chặn người không vai Đầu chủ mà không nêu trưởng nhóm, E3b tự gạch bước trưởng nhóm. | Người dựng và người chấm hiểu khác nhau; ô trưởng nhóm của trục A qua cổng không kiểm. | Một dòng Hỏi; AC-10 nêu đích danh; bước trưởng nhóm trong ui-check. | fixed: Hỏi-7 (khuyên chỉ vai Đầu chủ mở màn), AC-10 nêu trưởng nhóm không vai Đầu chủ, E10b thêm bước truong-nhom → 404, E3b bỏ dòng gạch; E3 giữ ca API trưởng nhóm thấy giá đáy |
| P1 | contract | Đường đo không gắn với màn này và ô cơ hội để trống ngưỡng, timebox; sự kiện không mang dấu ghi từ màn cuộc gọi. | Sửa giá ở Bảng hàng cũng đếm; Cổng Giá trị kết luận màn «sống» dù không ai mở. | Chủ kho ghi rõ thước ở mức căn và đặt ngưỡng, timebox trước khi thử — hoặc thêm dấu nguồn ghi. | human-gate1: Đường đo ghi rõ thước ở mức căn, không tách lần ghi từ màn; ngưỡng và timebox để chủ kho đặt trước khi thử — nêu ở thẻ Cổng Phạm vi |
