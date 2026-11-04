---
slug: dang-nhap-auth-15
at: 2026-11-04T05:23:19Z
verdict: findings
p0: 2
p1: 2
p2: 1
claims_input: ok
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ d-20261104T051947Z-4 để máy quyết nguyên văn câu đồng ý điều khoản ở chân trang — câu pháp lý hiện cho người dùng thật, kho_dao false; căn cứ một-lối chỉ chứng lối có liên kết đã chết, không chứng cách viết câu. Cùng kiểu [va-duong-loi-hoan-tac#F1] | Chủ kho ký vì tưởng câu chân trang là chữ giữ chỗ của khối; người bấm «Gửi mã» bị coi như đã đồng ý một bộ điều khoản chưa có văn bản (ADR-0009) | Câu chân trang thành Hỏi cho chủ kho, kho_dao true, AC-1 và E1, E4 ghi theo Hỏi-n | human-gate1: dòng S1 mới Hỏi-1 (chỉ-người, kho_dao true, supersedes -4, rồi -10 thay bằng câu khuyến nghị chính xác); AC-1, E1, E4 trỏ câu chốt ở Hỏi-1; bản chạy dựng câu khuyến nghị trung tính |
| P0 | design | Dòng -5 (dấu hiệu Boxes) và -6 (tiêu đề «Đăng nhập» kèm lời dẫn) là gu nhìn và nghĩa sản phẩm mà sổ ghi máy quyết; kho còn biểu tượng ứng dụng ba vạch nên lối khác còn sống | Màn đăng nhập mang dấu khác biểu tượng ứng dụng, chữ Quỹ hàng rời tiêu đề, chủ kho duyệt ảnh mà tưởng bắt buộc | Tách thành Hỏi có khuyến nghị; E1 ghim theo câu trả lời | human-gate1: dấu hiệu thành Hỏi-2 (chỉ-người, supersedes -5); tiêu đề trả về «Đăng nhập Quỹ hàng» của hàng 6, bỏ lời dẫn (dòng mới supersedes -6, căn cứ câu giao «giữ nguyên hàng 6»); E1 ghim theo Hỏi-2 |
| P1 | contract | Các trạng thái còn lại của bảng trạng thái và §4 (đang gửi, mã hết hạn và Gửi lại mã, quá nhiều lần dưới ô Email, ô mã one-time-code, email tự focus, máy bị báo) không AC hay eval nào đo | Chuyển ô sang InputGroup làm rơi one-time-code hay Gửi lại mã mà E1–E4 vẫn xanh | Thêm AC và ca test cho thuộc tính và nhánh; ui-check máy bị báo | fixed: AC-4 thêm vế trạng thái của hàng 6; E4 thêm ca «khung: trạng thái của hàng 6 còn đủ» (bảng viết trước bốn chữ lỗi, sáu thuộc tính và nhánh, đối chứng bỏ one-time-code). rejected phần ui-check máy bị báo: dựng trạng thái cần máy chủ báo mất một máy thật của người ấy (hàng 38 đã có bài nhìn riêng); hàng này chỉ dời khung, E4 ghim khối đứng trước form trong nguồn |
| P1 | evals | E10 đo AC-7 bằng điều kiện âm tính, không eval nào khẳng định dòng catalog auth-15 đủ chín ô, ảnh có thật; «bớt đúng một cảnh báo» là quan hệ trước/sau mà E9 đo số tuyệt đối | Thiếu dòng catalog hay ảnh trỏ tệp không có mà E10 vẫn xanh | Ca đọc catalog có đối chứng; so với merge-base | fixed: thêm E13 (thu/so-thiet-ke.test.mjs) — bảng Chỗ hở ở nhánh chính có dòng Đăng nhập, HEAD không, số dòng HEAD = nhánh chính − 1; dòng @reui/auth-15 đủ chín ô, ảnh có trong kho, có đối chứng mất ô và ảnh không có |
| P2 | evals | Trục C khai 1440 tối mà E11 chỉ chụp 375 tối bước email; bước mã ở 375 không đo cuộn ngang, lỗi chưa nhìn trên nền tối | Lời dặn email dài làm 375 cuộn ngang, chữ lỗi khó đọc trên nền tối | Thêm bước mã 375 tối và ảnh 1440 tối | fixed: E11 thêm ảnh 1440 tối của /login và bước mã sai ở 375 tối (telesales@…), ghi scrollWidth; AC-8 nêu 1440 và bước mã |
