---
schema_version: 1
slug: va-cai-dat-mat-viec
feature: Bấm «Giữ nhãn» luôn giữ nhãn ở mọi lần gỡ; xoá hay sửa một cột mẫu nhập hỏng thì màn nói rõ và dòng giữ nguyên; bảng Mẫu nhập trên điện thoại thấy được Sửa, Xoá không phải cuộn ngang; ô tỉ lệ môi giới có nhãn cho máy đọc màn.
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-09T04:10:21Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: va-cai-dat-mat-viec
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng va-cai-dat-mat-viec của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Bấm «Giữ nhãn» luôn giữ nhãn ở mọi lần gỡ; xoá hay sửa một cột mẫu nhập hỏng thì màn nói rõ và dòng giữ nguyên; bảng Mẫu nhập trên điện thoại thấy được Sửa, Xoá không phải cuộn ngang; ô tỉ lệ môi giới có nhãn cho máy đọc màn.

Vì sao: Hàng A: Bản kiểm khu Cài đặt 09/11 (docs/plan/kiem-cai-dat.md, PR #218) và đề xuất thống nhất (docs/plan/thong-nhat-ia-khuon-ux.md, PR #219); chủ kho duyệt phương án 09/11 «Duyệt theo khuyến nghị» (nhật ký đợt, hỏi h-20261109T012003Z-18). Dãy D.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: đã đạt «Gỡ hai nhãn đang dùng, chuyển nhãn đầu, «Giữ nhãn» nhãn sau: nhãn sau còn và Lưu bấm được; chặn lời gọi xoá: có báo lỗi, hộp không tự đóng; ở 375 bảng không tràn khung; axe không còn lỗi label» chưa?
- Kết quả nào là SỐNG: Gỡ hai nhãn đang dùng, chuyển nhãn đầu, «Giữ nhãn» nhãn sau: nhãn sau còn và Lưu bấm được; chặn lời gọi xoá: có báo lỗi, hộp không tự đóng; ở 375 bảng không tràn khung; axe không còn lỗi label
- Kết quả nào là CHẾT: chưa đạt «Gỡ hai nhãn đang dùng, chuyển nhãn đầu, «Giữ nhãn» nhãn sau: nhãn sau còn và Lưu bấm được; chặn lời gọi xoá: có báo lỗi, hộp không tự đóng; ở 375 bảng không tràn khung; axe không còn lỗi label» khi hết timebox
- Timebox: một ngày làm (chủ kho quyết ở phiên D, 09/11)
