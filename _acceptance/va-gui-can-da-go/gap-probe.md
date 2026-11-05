---
slug: va-gui-can-da-go
at: 2026-11-05T05:00:00Z
verdict: findings
p0: 4
p1: 0
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Bỏ đường đo ghi nguồn một-lối trong khi ngưỡng là của chủ kho [nhap-hoan-tac#F1] | Cổng 1 ký căn cứ một-lối sai | Dòng chỉ-người thay dòng cũ | human-gate1: Hỏi-2 (supersedes dòng bỏ đường-đo) |
| P0 | decisions | Câu trích của dòng «chặn ở hàm» chỉ liên quan, không quyết | Cổng 1 duyệt hướng sửa trên câu trích lạc | Câu trích quyết đúng lựa chọn | fixed: dòng mới trích tiêu đề Ngoài-2 hàng 66 (review-findings.md) |
| P0 | decisions | Dòng mã lỗi ghi một-lối trong khi lối mã riêng vẫn sống | Thông điệp «căn chưa lên bảng» sai nghĩa với căn đã gỡ mà không ai chọn | Ghi là đánh đổi cho người | human-gate1: Hỏi-1 |
| P0 | decisions | Bỏ quét độ phủ mà không liệt kê hàm và loại sự kiện | Một đường ra ngoài khác vẫn nhận căn đã gỡ | Bảng liệt kê đã soát | fixed: dòng phạm vi liệt bốn hàm security definer đọc listings và hai loại sự kiện; Coverage ghi trục |
| P2 | evals | E3 không kiểm share_events sau từ chối; E4 chỉ kiểm PUBLIC | Dòng ghi lọt hay vai khác có quyền mà phép thử vẫn xanh | Thêm assert | fixed: E3 thêm số share_events trước = sau; E4 kiểm proacl chỉ chủ hàm và quy_hang_app |
