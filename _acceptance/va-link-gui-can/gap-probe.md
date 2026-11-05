---
slug: va-link-gui-can
at: 2026-11-05T13:42:30Z
verdict: findings
p0: 1
p1: 2
p2: 2
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract (sổ d-20261105T134116Z-4) | Dòng «bỏ design-pass» ghi nguồn một-lối nhưng lối chạy design-pass vẫn sống; câu lối-chết là cân nhắc lợi hại. Cùng dạng [va-dang-nhap-mat-khau#F2], [hom-nay-dau-chu-dien-thoai#F1]. | Chủ kho ký Cổng Phạm vi tưởng không còn lựa chọn trong khi kit đòi duyệt UI trên bản bấm được; hồ sơ bị trả. | Thay dòng bằng dòng mới (supersedes): hoặc Hỏi ở Gate 1, hoặc trích đúng luật. | fixed: chạy design-pass nấc 0 trên sản phẩm đang chạy — tám ảnh ở evidence/design-pass/, sổ phiên design-pass.md; dòng sổ mới d-20261105T134646Z-7 thay d-4 (qua d-6). |
| P1 | contract AC-3, evals E3 | Ma trận 19 dòng chỉ ghim 7 kỳ vọng trong hợp đồng, 12 dòng do người làm tự viết; AC-3 bỏ `[...x]`, neo, `/api/`, `//`, `route.ts`. [va-ho-so-lien-he#F3] | Bộ khớp xử `[...x]` như `[x]` hay `[[...x]]` không khớp đường cha trần; người làm chép kỳ vọng theo hành vi đang có, 19/19 xanh mà link sống bị báo oan. | Ghi đủ các cặp trong AC-3, gồm `[...x]`, `[[...x]]`, `route.ts`, truy vấn, neo, `/api/`, `//`; E3 đòi tệp kiểm trùng từng ô. | fixed: AC-3 nay ghi đủ ba bảng (cây thật 19 dòng, cây mẫu sáu tệp 18 dòng, 11 dạng link); thêm ca «ma trận kiểu đường trên cây mẫu viết trước» đi qua duongCuaTep; phá thử `[[...x]]` đỏ «cây mẫu, đường /help: mong có trang». |
| P1 | evals E3 (trục C) | Phần trích đường không có ma trận theo dạng link; mẫu đỏ chỉ ba dòng trong khi có bảy dạng trở lên. | Biểu thức quét bỏ sót `redirect` hay `router.replace`; link chết dạng ấy vẫn cho danh sách hỏng rỗng. | Ca «trích đường theo dạng», bảng viết trước mỗi dạng một mẫu, danh sách hỏng ghim theo từng dòng. | fixed: ca «trích đường theo từng dạng link» — 11 dạng, mỗi dạng một assert dòng và một assert đường, bốn mẫu ngoài không được trích, hỏng đúng mau.tsx:1…11; phá thử bỏ dạng router template đỏ «bộ quét phải thấy đúng 11 link, thấy 9». |
| P2 | evals E4, E5 | Bước ghi mã HTTP có thể không đo được vì điều hướng phía khách. | Người chấm không tìm được mã hay lấy nhầm 200 của yêu cầu khác. | Ghi rõ nguồn mã, hoặc bỏ mã HTTP chỉ giữ địa chỉ và câu chữ. | fixed: bỏ mã HTTP; đọc văn bản hiện trên màn (innerText), cảnh báo không đọc mã HTML nguồn vì gói dữ liệu của Next mang sẵn chữ trang lỗi (thấy khi chụp design-pass). |
| P2 | evals E4, E5 (trục B) | Kỳ vọng không có dấu riêng của bảng thẻ để phân biệt với bảng hàng máy tính. | Khổ 375 hiện bảng hàng máy tính mà E4, E5 vẫn qua. | Thêm dấu riêng của bảng thẻ và đối chứng ở khổ máy tính. | fixed: E4, E5 đòi «Chưa có căn nào trên bảng hàng chung» + «Về Hôm nay» và vắng «Sàn chưa có hàng nào»; E4 thêm đối chứng khổ 1280 (ngược lại); AC-1 ghi thêm khổ 1280. |
