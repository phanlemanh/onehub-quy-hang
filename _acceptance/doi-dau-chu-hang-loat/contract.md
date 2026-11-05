---
schema_version: 1
feature: Trưởng nhóm đổi đầu chủ cho nhiều căn một lần, kéo theo mọi căn và liên hệ của cùng chủ nhà, hoàn tác được
slug: doi-dau-chu-hang-loat
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api]
status: implemented
design_doc: _acceptance/doi-dau-chu-hang-loat/design.md
approved_by: Manh Phan
approved_at: 2026-11-05
---

# Acceptance Contract: doi-dau-chu-hang-loat

## Context

Hàng 89 của lộ trình (dãy H, đợt `dau-khach-nhap`), T3 vì migration 027. Đứng trên hàng 16 (sửa hàng loạt) và 85–86
(liên hệ). Ô cơ hội: `opportunity.md` (chủ kho chọn làm 02/11). Đổi ADR-0021 điểm 5 cho lối hàng loạt, bằng mục sửa
đổi (`design.md` §3).

## Criteria

- AC-1 (cross-layer): Given một người mang tổ hợp vai bất kỳ, When tích căn trên Bảng hàng, Then:
  - người có vai Trưởng nhóm thấy lệnh «Đổi đầu chủ» trên thanh sửa hàng loạt;
  - người không có vai ấy không thấy lệnh;
  - máy chủ trả 403 cho ba lệnh xem trước, đổi, hoàn tác khi người gọi không có vai ấy.
- AC-2: Given hộp hỏi mở, When chọn người nhận, Then danh sách là đầu chủ của sàn đang làm. Máy chủ từ chối (400) người
  nhận không mang vai Đầu chủ hay không thuộc sàn.
- AC-3: Given k căn đã tích, When hộp hỏi dựng bản xem trước, Then hộp hỏi kể:
  - mọi căn sẽ đổi: k căn đã tích, cộng mọi căn khác có cùng liên hệ chủ nhà, các căn này đánh dấu «cùng chủ nhà»;
  - đầu chủ cũ của từng căn;
  - số liên hệ chủ nhà sẽ đổi người giữ.

  Không chữ nào của tên hay số chủ nhà có trong bản xem trước, kể cả câu trả về từ máy chủ.
- AC-4 (cross-layer): Given bản xem trước, When trưởng nhóm bấm «Đổi đầu chủ», Then:
  - trong một giao dịch, mỗi căn của bản xem trước có đầu chủ là người nhận;
  - mỗi liên hệ chủ nhà của các căn ấy có người giữ là người nhận;
  - căn đã do người nhận giữ thì không thêm dòng gán;
  - thông báo «Đã đổi đầu chủ N căn, M liên hệ» hiện 10 giây kèm «Hoàn tác»;
  - cột đầu chủ trên bảng đổi theo nhờ bộ đồng bộ, không cần tải lại trang.
- AC-5 (cross-layer): Given một lần đổi vừa xong, When bấm «Hoàn tác», Then:
  - mỗi căn và liên hệ còn đang do người nhận giữ về lại đúng người giữ cũ của nó;
  - căn hay liên hệ đã đổi tiếp sau đó thì giữ nguyên và được đếm vào «bỏ qua K»;
  - căn trước đó chưa có đầu chủ thì giữ người nhận, liên hệ của cùng chủ nhà cũng giữ người nhận, và thông báo ghi
    riêng «N căn trước chưa có đầu chủ nên giữ [người nhận]» (Hỏi-2, viết theo khuyến nghị);
  - liên hệ đã đổi người giữ tiếp sau lần đổi thì giữ nguyên và được đếm vào «bỏ qua»;
  - hoàn tác lần hai cùng một lần đổi bị từ chối (409).
- AC-6: Given hai sàn A và B, When người sàn A gọi xem trước, đổi hay hoàn tác với mã căn hay mã lần đổi của sàn B, Then
  máy chủ trả 404 và không dòng nào của sàn B đổi. Bảng lần đổi bật và ép luật theo dòng. Vai API không ghi thẳng được
  bảng lần đổi, bảng gán hay cột người giữ.
- AC-7: Given tập căn sau khi kéo theo vượt 200, When xem trước hay đổi, Then máy chủ từ chối (400) kèm lời «Tối đa 200
  căn một lần» và không dòng nào đổi. Khi máy mất mạng, lệnh tắt kèm lời «Cần mạng để đổi đầu chủ».
- AC-8: Given lần đổi đã ghi, When đọc tài liệu trong cùng PR, Then ADR-0021 có mục sửa đổi 05/11: lối hàng loạt đổi
  luôn người giữ liên hệ, lối gán một căn theo Hỏi-1 (khuyến nghị: giữ nguyên), chữ cũ không bị viết đè. Tham chiếu §12 có một dòng 05/11 trỏ hồ
  sơ.
- AC-9: Given trưởng nhóm mẫu trên máy tính 1440, When tích 5 căn của 2 chủ nhà mẫu rồi đổi sang một đầu chủ khác, Then
  hộp hỏi kể đủ căn kèm người giữ cũ. Sau khi đổi, mọi hàng của 2 chủ ấy và 2 liên hệ thuộc đầu chủ mới. Hoàn tác trả đủ
  người giữ cũ. Đầu chủ mẫu đăng nhập không thấy lệnh.

## Out of scope

- Báo cho đầu chủ cũ hay mới khi bị đổi hàng: hàng sau.
- Đổi đầu chủ trên điện thoại: Bảng hàng kiểu Sheet chỉ có trên máy tính.
- Lối gán một căn (`PUT /listings/{id}/listing-agent`) đổi luôn người giữ liên hệ: giữ nguyên hành vi cũ (Hỏi-1, viết
  theo khuyến nghị).
- Lead đang mở của chủ nhà đổi theo: lead đi theo luật chia lead, không đổi ở hàng này.
- Hoàn tác sau khi thông báo 10 giây đã tắt.

## Đường đo

- Ngưỡng SỐNG «5 căn của 2 chủ nhà… cùng sang đầu chủ mới» — AC-4, kiểm trên Postgres (E4) và màn thật (E9).
- «đầu chủ không phải trưởng nhóm không thấy lệnh» — AC-1 (E1, E1b, E9).
- «hoàn tác trả đủ người giữ cũ» — AC-5 (E5, E9).
- «bộ kiểm cách ly xanh» — AC-6 (E6).

## Coverage

- Trục vai: trưởng nhóm · đầu chủ · đầu khách · telesales · quản trị · trưởng nhóm kiêm đầu chủ — AC-1.
- Trục tập căn: căn đã tích · căn kéo theo vì cùng chủ · căn đã do người nhận giữ · căn chưa có đầu chủ · căn sàn khác
  — AC-3, AC-4, AC-5, AC-6.
- Trục liên hệ: liên hệ có người giữ · liên hệ chưa có người giữ · liên hệ chung nhiều căn · liên hệ đã đổi tiếp — AC-4,
  AC-5.
- Trục hoàn tác: còn nguyên · đã đổi tiếp · hoàn tác lần hai — AC-5.
- Trục giới hạn: 200 căn · mất mạng · người nhận sai vai — AC-2, AC-7.
- Trục lớp source: bản xem trước, câu trả về, hộp hỏi — AC-3.

## Notes

- Lựa chọn máy đã quyết: `design.md` §5; sổ quyết định dòng S1.
