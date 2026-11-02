---
schema_version: 1
slug: va-moc-goi-dau-lead-tra-lai
feature: "Vá mốc gọi đầu: lead đã trả lại thì máy chủ từ chối mốc gọi đầu của người giữ cũ, mốc không đổi; lead đang giữ vẫn ghi gọi đầu như cũ"
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-02T21:21:03Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: va-moc-goi-dau-lead-tra-lai
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng va-moc-goi-dau-lead-tra-lai của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Vá mốc gọi đầu: lead đã trả lại thì máy chủ từ chối mốc gọi đầu của người giữ cũ, mốc không đổi; lead đang giữ vẫn ghi gọi đầu như cũ

Vì sao: Dãy D báo khi làm hàng 28 (đợt dau-chu-dong-vao, 02/11): app.mark_first_call chỉ kiểm người giữ, outcome và discarded_at, không kiểm returned_at — đầu chủ đã trả lead vẫn ghi được mốc gọi đầu, làm lệch luật chia và hạn của hàng 25. Chủ kho 02/11: «hai lỗi máy chủ: mở hai hàng vá ở đợt kế»

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Lead đã trả lại thì app.mark_first_call từ chối người giữ cũ (mã lỗi như lead không còn của người gọi), first_called_at và accepted_at không đổi; lead đang giữ vẫn ghi gọi đầu như cũ; sửa bằng migration mới, không sửa 011; bài kiểm cơ sở dữ liệu có ca trả lại rồi ghi gọi đầu, phá thử thì đỏ» chưa?
- Kết quả nào là SỐNG: [đề xuất] Lead đã trả lại thì app.mark_first_call từ chối người giữ cũ (mã lỗi như lead không còn của người gọi), first_called_at và accepted_at không đổi; lead đang giữ vẫn ghi gọi đầu như cũ; sửa bằng migration mới, không sửa 011; bài kiểm cơ sở dữ liệu có ca trả lại rồi ghi gọi đầu, phá thử thì đỏ
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Lead đã trả lại thì app.mark_first_call từ chối người giữ cũ (mã lỗi như lead không còn của người gọi), first_called_at và accepted_at không đổi; lead đang giữ vẫn ghi gọi đầu như cũ; sửa bằng migration mới, không sửa 011; bài kiểm cơ sở dữ liệu có ca trả lại rồi ghi gọi đầu, phá thử thì đỏ» khi hết timebox
- Timebox: …
