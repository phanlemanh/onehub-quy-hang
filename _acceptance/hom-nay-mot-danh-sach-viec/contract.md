---
schema_version: 1
feature: "Mở Hôm nay, mỗi người thấy một danh sách việc của mình, cùng một kiểu dòng cho mọi vai; phần theo dõi về đúng nhà"
slug: hom-nay-mot-danh-sach-viec
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [core, api, ui]
status: approved
design_doc: docs/superpowers/specs/2026-11-09-hom-nay-mot-danh-sach-viec-design.md
approved_by: Manh Phan
approved_at: 2026-11-09
---

# Acceptance Contract: hom-nay-mot-danh-sach-viec

## Context

Chủ kho mở Cổng Phạm vi 09/11 sau audit `docs/plan/audit-man-hom-nay.md`. `/today` đang là bốn màn của bốn vai xếp một cột;
từ 08/11 chủ sàn mới mang đủ năm vai. Hợp đồng viết theo khuyến nghị của Hỏi-1 đến Hỏi-6.

Source input: `docs/plan/audit-man-hom-nay.md` · thiết kế `docs/superpowers/specs/2026-11-09-hom-nay-mot-danh-sach-viec-design.md`.

## Criteria

- AC-1: Given người mang bất kỳ vai nào có Hôm nay, When mở `/today` trên máy tính, Then trang có một vùng chính, một tiêu đề
  cấp một, đường dẫn ở đầu màn và đúng một danh sách việc; không còn bảng điều khiển, bảng Lead đã nhập hay dòng tin; đo ở
  khổ 1440 và 1912, mép trái và phải của danh sách trùng mép vùng nội dung. Given hết việc, Then một câu và đúng một nút đi tiếp
  theo vai. Given người chỉ giữ vai Quản trị gõ `/today`, Then về Cài đặt sàn, không thấy số nội bộ.
- AC-2: Given người đủ năm vai có việc ở mọi nguồn, When xem danh sách, Then mọi dòng việc cùng bốn cột Việc · Vì sao hôm nay ·
  Chi tiết · Hành động với đúng một nút chính và ⋯; nhóm có hạn đã quá đứng trước các nhóm khác, trong bộ nhóm đầu chủ giữ thứ
  tự của sàn; đầu màn đếm «N việc · M quá hạn» đúng bằng số dòng việc. Không nút nào cắt chữ ở khổ 1440. Dòng «Lead đã nhập (N)»
  của AC-4 không phải việc: không đếm, không theo khuôn dòng, đứng dưới danh sách, chỉ hiện cho người có vai Telesales, vẫn hiện
  khi hết việc.
- AC-3 (cross-layer): Given trưởng nhóm và một lead quá hạn, When bấm «Giao lại» trên dòng và chọn đầu chủ, Then lead được giao
  ở máy chủ, dòng rời danh sách, số giảm một. Lead chưa chia được hiện ở nhóm «Chưa chia được» với cùng nút. Vai khác trưởng
  nhóm không thấy hai nhóm này.
- AC-4 (cross-layer): Given telesales có lead bị trả lại và lead đang chạy, When mở Hôm nay, Then lead bị trả lại là một việc
  với nút «Sửa số», gửi lại xong thì rời danh sách; lead đang chạy không thành việc; có đúng một dòng «Lead đã nhập (N)» dẫn
  tới `/leads/mine`, N bằng số lead ở trang ấy.
- AC-5: Given đầu khách có tin khách phản ứng, căn vừa đổi, căn mới khớp, When mở Hôm nay, Then mỗi tin trong 48 giờ là một việc
  mở đúng đích hiện có; tin quá 48 giờ không còn là việc; dòng không chứa số khách hay trường lớp `source`.
- AC-6: Given trưởng nhóm, When mở `/team`, Then thấy ba ô số và bảng theo đầu chủ với số giống Hôm nay trưởng nhóm trước
  đây, đúng bố cục Bảng điều khiển, có đường dẫn ở đầu màn; vai không có nhà Đội không vào được.
- AC-7: Given đầu khách, When mở mục «Tin của khách» ở cột thứ hai của Đã gửi, Then thấy tin 7 ngày như vùng Đầu khách cũ, bố
  cục Dòng tin rộng 48rem căn giữa.
- AC-8: Given người xem theo từng tổ hợp vai và sàn đã đổi tên một nhóm, kể cả nhóm của vai khác đầu chủ, When xem cột thứ hai của
  Hôm nay, Then chỉ có nhóm của vai người xem, nhãn mới hiện ở cả cột và thân, số ở mục bằng số dòng nhóm trên cùng trang, luôn
  đúng một mục sáng kể cả với `?nhom=` lạ; nguồn lỗi thì mục ấy không hiện số.
- AC-9: Given một nguồn trả 500 hai lần liên tiếp, When mở Hôm nay, Then có đúng một dòng báo nêu tên nguồn và một «Thử lại»,
  không câu nào báo «không có việc» cho nguồn ấy, số chỉ đếm phần đọc được, các nhóm khác giữ nguyên. Given nguồn trả 500 một
  lần rồi 200, Then màn tự hồi không cần bấm. Given mất mạng, Then một dải ngoại tuyến, không chồng các dòng báo theo nguồn; Given
  mạng trở lại, Then nguồn lỗi tự đọc lại.
- AC-10: Given khổ 375 ở mọi vai, When xem Hôm nay, Then mỗi việc là thẻ hai tầng, tên căn và toà đọc đủ không bị nút ép, trưởng
  nhóm giao lại ở ngăn đáy; không còn dòng «mở trên máy tính».

## Coverage

Quét bằng `morphological-scan`, tự dựng trục (không khớp preset). Ngữ cảnh: chân sản phẩm `[SUY-TỪ-REPO: docs/product/tham-chieu.md]` ·
chân ngành `[NGÀNH: Follow Up Boss, Keller Williams Command, HubSpot]`.

- Trục vai: telesales · đầu chủ · đầu khách · trưởng nhóm · đủ năm vai · chỉ quản trị — thước: bảng vai Tham chiếu §9.
- Trục loại việc: lead quá hạn · chưa chia · lead mới · nhóm căn · lead bị trả lại · khách phản ứng · vừa đổi · căn mới khớp — thước: năm nguồn đọc ở thiết kế.
- Trục trạng thái nguồn: đọc được · có việc rỗng · lỗi một lần · lỗi kéo dài · mất mạng — thước: bảng ST ở Đặc tả UX.
- Trục khổ: 375 · 1440 · 1912 — thước: ADR-0024 quyết định 5.

Core: mỗi vai × có việc (AC-2 đến 5) · đủ vai (AC-1, 2) · hết việc, chỉ quản trị (AC-1) · lỗi từng phần, mất mạng (AC-9) · 375
(AC-10). Later: sàn ẩn hay đổi thứ tự nhóm của vai khác; nút Xong của đầu khách; bấm dòng mở chi tiết. Never: người tự tạo việc
trên màn này — việc suy từ trạng thái.

`[GIẢ ĐỊNH]` chờ người gạch ở Cổng Phạm vi: 48 giờ là khoảng đủ dài để đầu khách kịp xử việc từ tin phản ứng.

## Out of scope

- Sàn ẩn hay đổi thứ tự nhóm của vai khác đầu chủ (đổi tên thì có, Hỏi-5); nút «Xong» cho việc đầu khách.
- Gộp lời gọi đọc và tải trước đường dẫn (R5 của audit).
- Bấm cả dòng để mở chi tiết.
- Đổi luật nhóm căn, luật chia lead, luật ẩn.
- Đổi chữ «Lead» theo hàng `doi-chu-lead-co-hoi`.

## Notes

- Bất biến chạm: (1) cách ly — không lối đọc mới; (2) chủ nhà — dòng việc chỉ dựng từ lối đọc đang có; (3) người bấm gửi — nút chỉ mở luồng Gửi; (4) không chạm trang khách.
- Không đổi cơ sở dữ liệu nên hạng T2. Chọn nút «Xong» ở Hỏi-3 thì lên T3.
- Phần giữ cứng của Hỏi-5 thành dòng «điều khoá» ở `docs/architecture/so-diem-bien-thien.md` trong cùng PR; E8 kiểm có dòng.
- Đo nền hạ tầng chưa chạy: khoá của đợt Điều phối chặn lệnh đo nền, phiên này đứng ngoài đợt nên không xin khoá.
