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

Cổng Đáng: chủ kho gõ tại phiên dãy L 09/11, nguyên văn «build». Hàng `hom-nay-mot-danh-sach-viec` đã gộp trước (#230, 5d55d0cc); dãy L đo lại chín vấn đề trên bản mới theo lời giám sát 09/11.

**Đo lại 09/11 trên 5d55d0cc** (màn chạy thật, sàn mẫu, lỗi giả lập):

| Mã | Còn không | Thấy gì trên bản mới |
|---|---|---|
| A3 | Một phần | Bốn nguồn việc ở Hôm nay tự hồi. Còn đứng yên: bộ nhóm, danh sách đầu chủ, và cả màn Đội |
| A4 | Hết | Hôm nay mỗi nguồn một câu. Đội một câu, hai ô số «—» là ô chưa có số |
| A5 | Hết | Nhãn «2 đầu chủ» bằng 2 dòng, cùng một nguồn |
| A6 | Một phần | Mã thô đã hết, nhưng lỗi bị nuốt: Đội hiện mọi dòng «Chưa rõ tên», ô tròn «TÊ», không báo gì; Hôm nay tắt «Giao lại» kèm câu sai «Sàn chưa có đầu chủ nào» |
| A7 | Hết | Chưa đặt tên hiện «Chưa rõ tên» ở Hôm nay, Đội và danh sách giao |
| A8 | Một phần | Hôm nay tự đọc lại. Đội vẫn đứng «Đang mất mạng» sau khi có mạng, phải tải lại trang |
| A9 | Một phần | Không còn câu «Không lead nào quá hạn», nhưng cột thứ hai ghi «Tất cả việc 0» khi chưa đọc được gì, và thân màn trống |
| A10 | Hết | «Lead mới» không còn báo không có việc cạnh dòng lỗi |
| A11 | Dời chỗ | Hôm nay đã đúng. Vùng tin của khách dời sang Đã gửi và vẫn hiện khung chờ mãi |

**Phát sinh, cùng gốc «màn nói sai khi đọc»:** mọi người không có vai Đầu chủ luôn thấy câu «Đang dùng bộ mặc định — chưa tải được bộ nhóm của sàn» dù không lỗi gì (do #230, đo trên ba vai); «Giao lại» bị máy chủ từ chối trên máy tính thì màn im (chủ kho tách khỏi #230 thành việc riêng, chưa hàng nào nhận).

Khối báo lỗi dùng chung của ADR-0024 vẫn chưa có: bốn chỗ đang tự ghép.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: sau khi thu phạm vi, những chỗ còn lại trên Hôm nay, Đội và Đã gửi có nói đúng và tự hồi khi một nguồn đọc lỗi không?
- Kết quả nào là SỐNG (máy thu sau đo lại; chủ kho xem ở Cổng Phạm vi), đủ tám ca đo trên màn thật với lỗi giả lập:
  1. người không có vai Đầu chủ không thấy câu về bộ nhóm khi không có lỗi;
  2. bộ nhóm, danh sách đầu chủ, hàng đợi ở Đội trả lỗi một lần rồi được thì màn tự hồi, không cần bấm;
  3. danh sách đầu chủ lỗi kéo dài thì có một câu và một «Thử lại», không câu nào nói sàn chưa có đầu chủ;
  4. Đội có một báo lỗi cho cả vùng, không hiện mã thô hay ký hiệu vô nghĩa;
  5. mạng trở lại thì Đội tự đọc, hết báo mất mạng;
  6. nguồn lỗi hay mở lúc mất mạng thì không chỗ nào hiện số 0 và thân màn có đúng một câu;
  7. «Giao lại» bị từ chối thì báo ngay ở dòng, trên máy tính và điện thoại;
  8. nội dung hỏng ở tin của khách ra lỗi có «Thử lại»; bốn chỗ báo lỗi dùng một khối.
- Kết quả nào là CHẾT: còn ca nào trong tám ca chưa đạt khi hết timebox, nhất là ca 1 và ca 6 (màn nói sai).
- Timebox: một vòng của đợt, tối đa ba lượt chấm; không đặt số lần báo lỗi trên bản thật vì chưa có đường đo.
