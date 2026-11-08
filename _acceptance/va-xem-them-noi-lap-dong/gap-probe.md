---
slug: va-xem-them-noi-lap-dong
at: 2026-11-08T07:10:25Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract (sổ dòng 3, bỏ coverage-scan) | Dòng bỏ quét ghi nguồn một-lối nhưng lối khác chỉ tốn hơn, không chết vì ràng buộc nêu được [va-nut-ci-ag-root#F1] [doi-gia-nhanh#F1]; ô Coverage «Xem thêm hai lần liền sau gõ-xoá» không AC nào đo | Chủ kho đọc dòng bỏ quét như máy đã chắc; một chuỗi gõ-xoá khác (gõ-xoá lúc Xem thêm đang tải) vẫn lặp dòng mà không bằng chứng nào nhìn tới | Dòng sổ mới thay dòng 3: hoặc chỉ-người, hoặc giữ một-lối với ràng buộc thật và mọi ô Coverage có AC | fixed: quét độ phủ làm ngay trong hợp đồng — ba trục (lượt hiệu ứng, Xem thêm lúc gõ-xoá rảnh hay đang về, một hay hai lần Xem thêm), mọi ô trỏ AC; dòng sổ mới mang supersedes dòng 3 |
| P1 | evals (E6) | Bước gõ-xoá giao cho tác tử qua hai lần gọi công cụ (thường lâu hơn 250 ms) và expected cho đạt cả khi có lượt đọc lại; không đối chứng trên bản trước vá | Màn đọc lại từ trang 1, nhánh không đọc không chạy, E6 xanh trên cả bản lỗi — AC-3 không có bằng chứng trên màn | Gõ-xoá trong một đoạn mã có hẹn giờ; có lượt đọc lại không cursor thì KHÔNG KẾT LUẬN; đối chứng trên bản trước vá | fixed: bước 4 gõ-xoá trong một đoạn mã trong trang cách 100 ms, ghi mốc thời gian, có yêu cầu đọc lại không cursor thì KHÔNG KẾT LUẬN rồi UNCERTAIN. rejected phần đối chứng trên bản trước vá: tác tử chấm không được ghi vào cây (lượt chấm ghi cây là lượt hỏng); đối chứng luật cũ đã chạy ở E2 trên cùng kịch bản, và trên bản vá điều kiện «không đọc lại» cộng «con trỏ khác lần một» đã phân biệt được với lỗi (bản lỗi gửi lại cùng con trỏ) |
| P1 | contract + evals (Coverage, AC-2, E2) | Ô «hai lần Xem thêm liền sau gõ-xoá» và ca «gõ-xoá khi trang 2 chưa về» không có AC hay ca | datTrang hay trangKhiKhongDoc chạy lúc một Xem thêm đang bay rồi đặt lại trang cuối; E1, E2 vẫn xanh | Bốn trang hai lần Xem thêm (c2 rồi c3, 160 mã); Xem thêm đang về khi gõ-xoá | fixed: AC-2 và E2 thêm ca bốn trang (gửi c1, c2, c3, 160 mã không trùng) và ca gõ-xoá lúc trang đang về (trang ấy bị bỏ theo luật lượt đọc đã ký, lần bấm kế gửi lại c1 và nối một lần); lựa chọn «bỏ chứ không nối» ghi sổ dòng 6 |
| P1 | evals (E1, E2, E3) | Bản sửa dựa vào nhận «máy chủ vừa trao trang mới» (dauMoi) mà bài kiểm tự đưa dauMoi; E3 không hỏi dauMoi tính thế nào và bảng có thay cùng lượt không | vung.tsx tính dauMoi theo khoá thì trang 1 quay lại, lỗi cũ trở về mà E1, E2 xanh, E3 có thể cho đạt | E3 thêm vế dauMoi theo đối tượng và vế thay bảng cùng lượt; E2 thêm ca vẽ lại với cùng trang máy chủ | fixed: bộ phát lại E2 nhận trang máy chủ mới theo đối tượng như vung.tsx, thêm ca vẽ lại cùng đối tượng (giữ c2) và đối tượng mới cùng khoá (bảng thay, con trỏ của nó); E3 thêm vế (3) dauMoi theo đối tượng (so theo khoá là FAIL) và thay bảng cùng nhánh; AC-3 nêu hai quan hệ ấy |
| P2 | evals (E6) | E6 đo bằng số đếm «N liên hệ» chưa chốt nghĩa, không đếm tên lặp trên màn; dữ liệu dựng chỉ có 100 số 0900 000 0xx, không kiểm đủ 101 dòng | Số đếm là tổng thì N1 = N2 = N3 đỏ oan; thiếu dữ liệu thì bước 5 không có nút, E6 kẹt hay kết luận sai | Đếm trên màn, chốt nghĩa số đếm, kiểm ít nhất 101 dòng sau dựng | fixed: E6 chốt «N liên hệ» là số dòng đang có (danh-sach.tsx), đếm dòng và tên khác nhau trên lưới, so thứ tự với phản hồi; dữ liệu dựng dùng dải giả 0900 000 xxx, đọc lại tổng sau dựng, dưới 101 thì eval hỏng có tên |
