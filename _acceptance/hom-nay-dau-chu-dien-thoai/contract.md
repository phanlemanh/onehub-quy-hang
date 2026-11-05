---
schema_version: 1
feature: Đầu chủ mở Hôm nay trên điện thoại, gọi lại một chạm và ghi kết quả bằng một tay
slug: hom-nay-dau-chu-dien-thoai
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
design_doc: _acceptance/hom-nay-dau-chu-dien-thoai/design.md
approved_by: Manh Phan
approved_at: 2026-11-05
---

# Acceptance Contract: hom-nay-dau-chu-dien-thoai

## Context

Hàng 39 của lộ trình (dãy H, đợt `dau-khach-nhap`), T2. Đứng trên hàng 22 (hàng đợi, nút một chạm), 38 (vỏ điện thoại)
và 92 (Hôm nay máy tính dựng theo `solution-agents-2`). Ô cơ hội: `opportunity.md` (chủ kho chọn làm 02/11). Khối đích:
`docs/design/vo-va-ia.md` §2 dòng M1 · 39.

## Criteria

- AC-1: Given đầu chủ mở `/today`, When màn rộng dưới 768 px, Then vùng đầu chủ dựng danh sách thẻ, không dựng lưới; cùng
  nhóm và cùng thứ tự nhóm với bản máy tính. When màn rộng từ 768 px, Then lưới của máy tính giữ nguyên.
- AC-2: Given danh sách thẻ, When một việc hiện, Then thẻ có hai tầng: trên là tên căn (hay tên lead), dưới là lý do ·
  giá; hạn đỏ khi đã quá, vàng khi còn dưới 15 phút, như máy tính. Ở 375×812, khi có từ mười việc, ít nhất bảy thẻ nằm trọn trong khung nhìn.
- AC-3: Given một thẻ, When đầu chủ nhìn mép phải, Then có đúng một nút việc và một nút ⋯; ⋯ mở ngăn đáy kể đủ việc còn
  lại của dòng, cùng bộ việc với máy tính. Nút mép phải theo câu giao «gọi lại một chạm» (giám sát trả H-23): «Gọi» cho dòng mà việc là gọi
  (lead chưa gọi lần đầu, căn ở nhóm nên gọi điều chỉnh giá hay cần gọi lại) khi dòng có số gọi được; dòng khác giữ nút
  máy tính.
- AC-4: Given dòng có số gọi được (lead của mình, căn mình giữ), When đầu chủ chạm «Gọi», Then một chạm ấy gọi máy chủ mở
  số (lead: lối mở số lead; căn: lối mở số chủ) rồi mới mở `tel:` với đúng số trả về. Như máy tính, mỗi dòng mở số một lần trong phiên trang: chạm
  «Gọi» lại cùng dòng dùng lại số đã mở, không mở số mới. Dòng căn không do mình giữ không có «Gọi».
- AC-5: Given vừa chạm «Gọi», When đầu chủ quay lại app — kể cả khi trang đã ẩn rồi hiện lại hay tải lại — Then ngăn
  đáy «Kết quả cuộc gọi» của đúng dòng ấy đang mở (Hỏi-1, viết theo khuyến nghị: ngăn mở ngay khi chạm «Gọi»), nằm nửa dưới màn, nút
  kín bề ngang cao từ 48 px:
  - các việc một chạm của nhóm, như máy tính: lead → «Đã gọi», «Trả lại» khi nhóm cho; căn → «Còn · giữ giá»;
  - «Đổi giá, trạng thái · Mở hồ sơ» mở hồ sơ căn;
  - «Không nghe máy» đóng ngăn, không ghi gì.

  Chọn một việc thì ghi như nút cùng tên ở máy tính.
- AC-6: Given máy mất mạng, When đầu chủ mở Hôm nay, Then thẻ vẫn hiện từ máy; «Gọi» tắt kèm lời «Cần mạng để mở số»;
  «Còn · giữ giá» ghi trên máy rồi gửi sau, như máy tính.
- AC-7: Given Hôm nay trên điện thoại, When đang tải, trống hay lỗi, Then hiện khung chờ hai tầng, trạng thái trống có
  một hành động, lỗi có «Thử lại» — cùng nghĩa với máy tính.
- AC-8: Given đầu chủ mẫu trên điện thoại 375×812, When mở Hôm nay, chạm «Gọi» ở một lead mẫu rồi chọn «Đã gọi», và chạm
  «Còn · giữ giá» ở một căn mẫu, Then thấy thẻ hai tầng, `tel:` mang đúng số của lead mẫu, máy chủ ghi một lần mở số, lead
  sang đã gọi, căn ghi xác nhận còn; máy tính 1440 vẫn thấy lưới.

## Out of scope

- Chế độ cuộc gọi trên điện thoại (K1–K4: hạ giá bằng phím, ba lối «Đã cọc / bán…» trong một màn): P2 dự phòng theo
  Tham chiếu; hạ giá, đổi trạng thái đi qua hồ sơ căn trên điện thoại (hàng 33).
- Hôm nay của trưởng nhóm, telesales, đầu khách trên điện thoại: hàng khác.
- Biết cuộc gọi đã xong để tự mở ngăn: web không đọc được trạng thái cuộc gọi; ngăn mở ngay khi chạm «Gọi».
- Kéo để làm mới, vuốt thẻ để làm việc: không có ở khối đích.
- Lối «Ghi cuộc gọi» sang chế độ cuộc gọi của máy tính: trên điện thoại vào ⋯ như cũ, không đổi.

## Đường đo

- Ngưỡng SỐNG «Đầu chủ mở Hôm nay trên điện thoại, gọi lại một chạm và ghi kết quả bằng một tay» — AC-4, AC-5, kiểm ở
  bài kiểm hàm gọi (E4) và màn thật (E8).
- Số đo hai tuần thử «tỉ lệ thao tác trên máy tính / điện thoại theo vai» lấy từ cột thiết bị của sự kiện (hàng
  ghi-thiet-bi-va-mat-mang); hàng này không thêm số đo mới.

## Coverage

- Trục khổ: 375 · 390 · dưới 768 · từ 768 · 1440 — AC-1, AC-2.
- Trục loại dòng: lead mới · lead đã nhận chưa gọi · căn nên gọi điều chỉnh giá · căn cần gọi lại · căn thiếu thông tin ·
  căn mới đổi — AC-3, AC-4.
- Trục số: lead của mình · căn mình giữ · căn người khác giữ · không có số — AC-4.
- Trục kết quả: Đã gọi · Trả lại · Còn · giữ giá · Đổi giá, trạng thái · Không nghe máy — AC-5.
- Trục mạng: có mạng · mất mạng · mở số lỗi — AC-4, AC-6.
- Trục trạng thái: đang tải · trống · lỗi · có việc — AC-7.

## Notes

- Lựa chọn máy đã quyết: `design.md` §4; sổ quyết định dòng S1.
