---
schema_version: 1
feature: "Khi một phần của Hôm nay, Đội hay tin ở Đã gửi đọc lỗi, màn tự thử lại trước khi báo, báo đúng một câu ở đúng chỗ và không phần nào nói sai về số việc"
slug: hom-nay-chiu-loi-tung-phan
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: approved
design_doc: _acceptance/hom-nay-chiu-loi-tung-phan/design.md
approved_by: Manh Phan
approved_at: 2026-11-09
---

# Acceptance Contract: hom-nay-chiu-loi-tung-phan

## Context

R1 của audit màn Hôm nay (`docs/plan/audit-man-hom-nay.md`). Hàng `hom-nay-mot-danh-sach-viec` gộp trước (#230) đã giải một phần;
`opportunity.md` ghi kết quả đo lại chín vấn đề trên 5d55d0cc. Hợp đồng này chỉ phủ phần còn lại, cộng hai lỗi cùng gốc đo được trên
bản mới. Dữ liệu mẫu: `[Tên]`, `0900 000 0xx`.

## Criteria

- **AC-1 — Không báo lỗi khi không có lỗi.** Given người không có vai Đầu chủ (trưởng nhóm, telesales, đầu khách) · When mở Hôm nay, không
  nguồn nào lỗi · Then không có câu nào về bộ nhóm. Đối chứng: người có vai Đầu chủ mà bộ nhóm đọc hỏng vẫn thấy câu đúng (lưu trên máy
  hay mặc định).
- **AC-2 — Tự hồi lỗi thoáng qua.** Given bộ nhóm (Đầu chủ), danh sách đầu chủ (Hôm nay và Đội) hay hàng đợi ở Đội trả lỗi rồi được · When
  chờ, không bấm gì · Then màn tự đúng, không còn câu lỗi nào của nguồn ấy, và trong lúc máy đang thử lại không hiện câu lỗi nào; lỗi kéo dài thì câu lỗi chỉ hiện sau lần thử lại.
- **AC-3 — Danh sách đầu chủ lỗi ở Hôm nay.** Given trưởng nhóm có dòng lead cần giao, danh sách đầu chủ lỗi kéo dài · When mở Hôm nay · Then
  có đúng một câu «Chưa tải được danh sách đầu chủ» kèm một «Thử lại»; nút «Giao lại» tắt và không kèm câu «Sàn chưa có đầu chủ nào»; Thử lại
  thành công thì nút mở và câu biến mất. Hàng đợi cũng lỗi thì chỉ câu của hàng đợi. Sàn thật sự không có đầu chủ thì câu cũ vẫn hiện. Đang lỗi mà mạng trở lại thì tự đọc lại, nút mở, không cần bấm.
- **AC-4 — Đội một vùng một báo lỗi.** Given hàng đợi lỗi, danh sách đầu chủ lỗi, hay cả hai, kéo dài · When mở Đội · Then đúng một khối báo lỗi và
  một «Thử lại» đọc lại cả hai, nút nằm cạnh câu như khối lỗi của Hôm nay, không tràn ở khổ điện thoại; danh sách đầu chủ lỗi thì có câu riêng, dòng hiện «Chưa rõ tên», ô tròn «—», không mã thô.
- **AC-5 — Đội mất mạng rồi có lại.** Given Đội đang báo mất mạng · When mạng trở lại · Then màn tự đọc, không còn «Đang mất mạng», không cần tải lại
  trang. Lúc mất mạng: có số thì nói là lần đọc cuối, chưa có số thì nói máy sẽ tự đọc lại; không câu nào nhắc giao lại. Trình duyệt còn báo có mạng mà lời gọi không tới máy chủ thì là lỗi đọc: một khối, một «Thử lại», không có «Đang mất mạng».
- **AC-6 — Không có số 0 khi chưa đọc được.** Given có nguồn của người xem đọc hỏng hay mở lúc mất mạng, chưa có việc nào · When nhìn cột thứ hai · Then
  «Tất cả việc» không hiện số; nhóm của nguồn hỏng, kể cả nhóm lead sàn tự đặt mã, không hiện số. Đối chứng: không lỗi mà hết việc thì vẫn 0; có việc
  thì vẫn hiện số việc.
- **AC-7 — Mở lúc mất mạng có một câu.** Given mở Hôm nay lúc mất mạng, chưa có việc nào đọc được · When nhìn thân màn · Then có đúng một câu nói chưa đọc
  được và máy sẽ tự đọc lại, không câu nào nói không còn việc; mạng trở lại thì câu biến mất, việc hiện ra. Có việc từ kho trên máy thì không có câu này.
- **AC-8 — «Giao lại» bị từ chối thì báo ở dòng.** Given trưởng nhóm trên máy tính · When bấm «Giao lại», chọn người, máy chủ từ chối · Then câu lỗi hiện
  ngay ở dòng ấy, dòng giữ nguyên; lần giao sau thành công thì câu biến mất.
- **AC-9 — Tin của khách ở Đã gửi không treo.** Given lời đọc tin trả 200 mà nội dung hỏng, hay trả lỗi kéo dài · When mở Đã gửi · Tin của khách · Then
  hết khung chờ, có khối lỗi và «Thử lại»; lỗi một lần rồi được thì tự hồi; đang lỗi mà mạng trở lại thì tự đọc.
- **AC-10 — Một khối báo lỗi, phần đã đúng giữ nguyên.** Given Hôm nay, Đội, tin ở Đã gửi và Lead đã nhập · When một nguồn đọc lỗi kéo dài · Then cả bốn báo bằng
  cùng một khối `BaoLoiVung` trên `TrangThai`, không chỗ nào tự ghép nút «Thử lại»; Hôm nay vẫn mỗi nguồn một câu; «Lead mới» không báo không có việc cạnh
  dòng lỗi; Lead đã nhập tự đọc lại khi có mạng; khuôn và sàn thiết kế sạch.

## Coverage

Quét độ phủ làm ngay trong hợp đồng, ba trục:

- Trục **nguồn đọc** — bộ nhóm (AC-1, AC-2) | danh sách đầu chủ ở Hôm nay (AC-2, AC-3) và Đội (AC-2, AC-4) | hàng đợi ở Đội (AC-2, AC-4, AC-5) | tin ở Đã gửi (AC-9) | Lead đã nhập (AC-10) | bốn nguồn việc của Hôm nay (đã đạt từ #230; giữ ở AC-10) [thước CE: các lời đọc của `today/nguon.ts`, `team/dashboard.tsx`, `shares/tin/vung.tsx`, `leads/mine`]
- Trục **kiểu hỏng** — lỗi một lần (AC-2, AC-9) | lỗi kéo dài (AC-3, AC-4, AC-9, AC-10) | mất mạng lúc mở (AC-6, AC-7) | mạng trở lại (AC-3 qua đọc lại, AC-5, AC-7, AC-9, AC-10) | 200 nội dung hỏng (AC-9; bộ nhóm rơi về lỗi kéo dài, AC-1) | ghi bị từ chối (AC-8) [thước CE: năm trạng thái của mẫu Lỗi ADR-0024 cộng lỗi ghi]
- Trục **chỗ nói** — thân màn (AC-3, AC-4, AC-7, AC-9) | cột thứ hai (AC-6) | nút và dòng (AC-3, AC-8) | ô số và ô tròn (AC-4) [thước CE: các chỗ audit gọi tên]

## Đường đo

- Tám ca của `opportunity.md` đo ở lượt chấm: ca 1 ↔ AC-1, ca 2 ↔ AC-2, ca 3 ↔ AC-3, ca 4 ↔ AC-4, ca 5 ↔ AC-5, ca 6 ↔ AC-6 và AC-7, ca 7 ↔ AC-8, ca 8 ↔ AC-9 và AC-10; số từ các eval dưới, mỗi ca có một bài nhìn màn với lỗi giả lập.

## Out of scope

- Gộp lỗi nhiều nguồn của Hôm nay thành một câu — điều kiện bật của hàng là mỗi nguồn một câu.
- Đổi API đội để không trả tên rỗng — màn đã thay chữ ở mọi chỗ (A7 hết).
- Áp mẫu Lỗi cho nhà khác — ADR-0024: áp khi có hàng chạm tới.
- Đếm lại nhãn «N đầu chủ» khi có dòng «Chưa có người giữ» — điều kiện bật là nhãn bằng số dòng.

## Notes

- Bất biến chạm: không lối đọc mới, không chạm trang khách, chủ nhà không liên quan.
- AC-1 và AC-8 ngoài chín vấn đề của audit: chủ kho quyết ở Cổng Phạm vi có gộp vào hàng này không (sổ quyết định, câu chỉ người có). Bản nháp theo khuyến nghị gộp; tách thì gỡ hai tiêu chí, ca 1 và ca 7 của ngưỡng, phần còn lại không phụ thuộc chúng.
