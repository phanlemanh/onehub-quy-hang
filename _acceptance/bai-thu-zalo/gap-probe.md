---
slug: bai-thu-zalo
at: 2026-10-30T02:20:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

# Phản biện context sạch — bai-thu-zalo

Một tác tử tươi đọc đúng năm tệp (design, contract, evals, sổ quyết định, ô cơ hội), không đọc code. Không có input bài
học xuyên tính năng (kho mới, bản quét rỗng).

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | ADR tự chọn cách đếm lượt mở và đường đi vòng — lựa chọn chỉ người có, không ai ký | Máy chốt thước đếm theo UA vì số đẹp; E10 chấm đạt vì ADR trỏ số | Mỗi lựa chọn có người quyết ghi tên | fixed: AC-10 đổi thành ADR «đề xuất» nêu khuyến nghị, lối khác, giá; chốt là của chủ kho (Out of scope + sổ dòng 13); E10 hỏi ADR không tự chốt |
| P0 | design | Ba dòng sổ trích câu luật chỉ liên quan, không quyết lựa chọn | Người duyệt tưởng luật đợt bắt buộc Node thuần và bỏ design-pass | Câu trích quyết lựa chọn hoặc nguồn một-lối | fixed: dòng 10 trích ranh giới của hàng trong hang-viec.json (chỉ mở _acceptance/bai-thu-zalo/**); dòng 11–12 trích khối trang khách đã chốt ở docs/design/vo-va-ia.md |
| P1 | evals | Kết luận đạt/không đạt chép tay; vế 2 thiếu đối chứng dương (K có thật được Zalo lấy không); bảng đếm chưa đối chiếu luật AC-3/AC-4 | K không được lấy lại vì đệm, mở = 0, ket-qua vẫn ghi đạt | tom-tat tự ra kết luận theo luật viết trước; nhật ký dựng bằng máy chủ thật | fixed: AC-9 + E9 — kết luận do tom-tat.mjs quyết; vế 2 cần K có lượt tải và mở = 0, A, I mở ≥ 1; nhật ký dựng bằng gọi HTTP vào máy chủ thật, so với /dem; hai ca phá thử ghim thông điệp |
| P1 | evals | IP thật qua x-forwarded-for, cf-connecting-ip có thể lọt vào nhật ký được commit | nhat-ky-zalo.jsonl mang IP điện thoại người thử vào kho | Gửi 203.0.113.7 qua đầu, tìm trong nhật ký phải 0 | fixed: AC-7, E5 gửi 203.0.113.7 qua hai đầu và quét nhật ký + tom-tat; E9 quét IPv4/IPv6 trên nhat-ky-zalo.jsonl; ca phá thử «có IP thô» |
| P1 | evals | Không eval nào bấm nút chia sẻ thật và kiểm đối số share cùng bốn kết cục | Nút quên tin hoặc ghi người huỷ thành lỗi; phiên iPhone ghi sai vế 3 | ui-check với share giả, bốn kết cục | fixed: E8 thêm bước share giả: đối số có 1 tệp image/png + tin, nhật ký có bốn kết cục da-gui, huy, loi, khong-ho-tro |
