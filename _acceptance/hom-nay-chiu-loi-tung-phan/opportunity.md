---
schema_version: 1
slug: hom-nay-chiu-loi-tung-phan
feature: Khi một phần của Hôm nay đọc lỗi, người dùng thấy đúng một câu lỗi ở đúng chỗ của phần ấy, màn tự thử lại trước khi báo, các phần còn lại giữ nguyên và không phần nào nói sai về số việc; đầu chủ luôn hiện tên người
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-09T03:06:23Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: hom-nay-chiu-loi-tung-phan
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng hom-nay-chiu-loi-tung-phan của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Khi một phần của Hôm nay đọc lỗi, người dùng thấy đúng một câu lỗi ở đúng chỗ của phần ấy, màn tự thử lại trước khi báo, các phần còn lại giữ nguyên và không phần nào nói sai về số việc; đầu chủ luôn hiện tên người

Vì sao: R1 của audit màn Hôm nay 09/11 (`docs/plan/audit-man-hom-nay.md` trên nhánh `claude/audit-man-hom-nay`, PR #217); dựng khối báo lỗi dùng chung, mẫu «Lỗi» đầu tiên của tầng Mẫu hành vi (ADR-0024 sửa đổi 09/11). Chủ kho duyệt hướng 09/11, nguyên văn «Duyệt theo khuyến nghị» (nhật ký đợt, hỏi h-20261109T012003Z-18). Dãy L.

**Ai gặp:** Trưởng nhóm, Đầu chủ, Đầu khách, Telesales — ai mở Hôm nay đúng lúc một nguồn đọc lỗi hay máy mất mạng.

**Gốc chung (audit):** mỗi vùng tự đọc, tự báo lỗi; «đọc hỏng» bị xử như «rỗng»; cùng một thứ đọc từ hai nguồn. Gốc của băng lỗi trên bản thật (hết kết nối) đã gỡ 09/11; phần còn lại là màn phản ứng với lỗi kém.

**Chín vấn đề (mã của audit):**

- A3 · lỗi thoáng qua đứng yên tới khi bấm tay; mỗi vùng một nút «Thử lại» riêng
- A4 · một lỗi nói ba chỗ: băng đầu trang, hai ô số «—», thẻ «Lead quá hạn và ngoại lệ»
- A5 · nhãn «0 đầu chủ» cạnh bảng có hai đầu chủ; nhãn và bảng đọc hai nguồn, không lỗi vẫn lệch
- A6 · tên đầu chủ hiện mã thô khi danh sách đầu chủ đọc lỗi
- A7 · đầu chủ chưa đặt tên hiện ô trống (Known limit 04/11)
- A8 · mạng trở lại mà vẫn báo mất mạng, «Giao lại» tắt tới khi tải lại trang (Known limit 04/11)
- A9 · mở lúc mất mạng thì báo «Không lead nào quá hạn» dù chưa đọc được gì (Known limit 04/11, tác động cao)
- A10 · lead giao cho tôi tải lỗi mà vẫn báo «không có việc» (Known limit 02/11)
- A11 · nội dung hỏng ở vùng Đầu khách hiện khung chờ mãi (Known limit 05/11)

Cổng Đáng: chủ kho gõ tại phiên dãy L 09/11, nguyên văn «build». Chưa vào thiết kế: hàng `hom-nay-mot-danh-sach-viec` (nhánh cùng tên, chạm gần hết `today/**` và `leads/mine/**`) gộp trước; sau đó dãy L đo lại chín vấn đề trên bản mới và thu phạm vi (giám sát, 09/11). Ngưỡng dưới đây còn nhãn đề xuất vì sẽ chốt theo phạm vi đã thu.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] khi một nguồn của Hôm nay đọc lỗi, màn có nói đúng và tự hồi không?
- Kết quả nào là SỐNG: [đề xuất] đạt đủ tám ca, đo trên màn thật với lỗi giả lập:
  1. lời gọi trả 500 một lần rồi 200 thì màn tự hồi, không cần bấm;
  2. lỗi kéo dài thì mỗi nguồn đúng một câu và một «Thử lại»;
  3. danh sách đầu chủ lỗi thì không hiện «0 đầu chủ», không hiện mã thô;
  4. đầu chủ chưa đặt tên có chữ thay thế;
  5. số trên nhãn bằng số dòng của bảng;
  6. mạng trở lại thì tự đọc và mở lại «Giao lại»;
  7. mở lúc mất mạng hay lead tải lỗi thì không câu nào báo «không có việc»;
  8. nội dung hỏng ở vùng Đầu khách ra trạng thái lỗi.
- Kết quả nào là CHẾT: [đề xuất] còn bất kỳ ca nào trong tám ca chưa đạt khi hết timebox, nhất là ca 7 (màn nói sai về số việc).
- Timebox: [đề xuất] một vòng của đợt, tối đa ba lượt chấm; không đặt số lần báo lỗi trên bản thật vì chưa có đường đo.
