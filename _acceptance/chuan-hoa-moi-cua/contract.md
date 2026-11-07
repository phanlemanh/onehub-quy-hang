---
schema_version: 1
feature: Ở bước xem trước nhập file, đầu chủ gõ «dong nam», «bp», «Đang gd» thì thấy máy gợi giá trị chuẩn; chọn gợi ý thành đề xuất từ điển của sàn; quản trị sàn duyệt ở màn Từ điển và xem sức khoẻ dữ liệu; cách gõ đã duyệt chuẩn hoá thẳng ở mọi lần nhập sau
slug: chuan-hoa-moi-cua
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui, db]
status: draft
design_doc: docs/superpowers/specs/2026-11-07-chuan-hoa-moi-cua-design.md
approved_by:
approved_at:
---

# Acceptance Contract: chuan-hoa-moi-cua

## Context

Hàng 70 (Cổng Đáng build 05/11). ADR-0011 quyết định 12 và `docs/architecture/nhap-du-lieu.md` §12: chuẩn hoá là một lớp
của lõi; lựa chọn của người thành đề xuất từ điển của sàn, quản trị sàn duyệt; không dọn tự động lặng lẽ. Phạm vi: ba
trường tập đóng có từ điển ở lõi (trạng thái, điều kiện phí, hướng), cửa vào là bước xem trước nhập file. Hạng T3 vì
thêm migration (`packages/db/**`); lộ trình ghi T2.

## Acceptance Criteria

- **AC-1** Given chữ «dong nam» (hướng), «bp» (phí), «Đang gd» (trạng thái), và chữ gần đúng «dong nm», «khong bao phi»
  When lõi gợi ý (`goiYGiaTri`)
  Then ba chữ đầu khớp đúng giá trị chuẩn; chữ gần đúng nhận gợi ý đứng đầu là giá trị chuẩn đúng (tối đa ba gợi ý); chữ
  vô nghĩa không gợi ý gì; chữ chứa số điện thoại, email, số giấy tờ không gợi ý. Không gọi dịch vụ ngoài.
- **AC-2** Given bước xem trước có ô «cần người» ở cột trạng thái, phí hay hướng
  When đầu chủ mở ô ấy
  Then dưới ô hiện «Ý bạn là:» với các gợi ý của AC-1; bấm một gợi ý sửa ô thành giá trị chuẩn như gõ tay.
- **AC-3** Given đầu chủ bấm gợi ý cho chữ gốc X của trường F (cross-layer)
  When lựa chọn được ghi
  Then sàn có đúng một dòng đề xuất (F, X gập) → giá trị chuẩn, trạng thái chờ duyệt, số lần chọn 1; chọn lại cùng chữ gập
  thì số lần chọn tăng, không thêm dòng; dòng đã duyệt hay đã bỏ không đổi trạng thái.
- **AC-4** Given một đề xuất còn chờ duyệt
  When người khác nhập file có chữ X ở cột F
  Then ô ấy vẫn «cần người» — đề xuất chưa duyệt không đổi cách chuẩn hoá của ai.
- **AC-5** Given quản trị sàn ở Cài đặt › Sàn › Từ điển (cross-layer)
  When duyệt hay bỏ một đề xuất
  Then trạng thái đổi và có một sự kiện nhật ký (ai, khi nào, quyết gì); người không phải quản trị sàn không đổi được
  (máy chủ từ chối) và không mở được màn.
- **AC-6** Given cách gõ X → V của trường F đã duyệt (cross-layer)
  When nhập file lần sau có chữ X (viết hoa, dấu, khoảng trắng khác) ở cột F — trên bước xem trước và trên đường ghi máy chủ
  Then ô chuẩn hoá thẳng thành V, không «cần người» (ND7); và căn được ghi mang V.
- **AC-7** Given cách gõ được duyệt hay bỏ
  When đọc dữ liệu đã lưu của các căn
  Then không căn nào đổi — duyệt không viết lại dữ liệu đã lưu.
- **AC-8** Given hai sàn A và B
  When A có đề xuất và cách gõ đã duyệt
  Then B không đọc, không ghi, không dùng được từ điển của A; bảng không nhận trường ngoài ba trường (không trường lớp
  `source`); nhật ký chỉ thêm.
- **AC-9** Given màn Từ điển
  When mở
  Then đầu màn hiện sức khoẻ dữ liệu theo trường: số cách gõ lạ đã gặp, đã neo, chờ duyệt, đã bỏ, tổng số lần chọn — khớp
  dữ liệu bảng; sàn chưa có dòng nào thì hiện trạng thái trống có câu hướng dẫn.
- **AC-10** Given chữ gốc có số điện thoại, email, số giấy tờ, hay dài hơn 40 ký tự
  When gửi đề xuất
  Then máy chủ từ chối, không ghi dòng nào. Chữ gốc mà khi gập trùng một cách gõ dựng sẵn hay tên một giá trị chuẩn nhưng
  trỏ sang giá trị khác cũng bị từ chối — sàn không ghi đè nghĩa của lõi (Hỏi-4, khuyến nghị).

## Coverage

Bỏ quét bằng skill — trục kê tay (sổ: dòng «bỏ coverage-scan»):
- Trường: trạng thái · phí · hướng (AC-1, AC-6).
- Kiểu chữ: khớp dựng sẵn · khớp từ điển sàn · gần đúng · vô nghĩa · có dữ liệu cá nhân (AC-1, AC-10).
- Vòng đời dòng: chưa có → chờ duyệt → duyệt / bỏ; chọn lại (AC-3, AC-5).
- Nơi chuẩn hoá: bước xem trước · đường ghi máy chủ (AC-4, AC-6).
- Quyền: đầu chủ đề xuất · quản trị duyệt · vai khác bị từ chối · sàn khác (AC-3, AC-5, AC-8).
- Dữ liệu đã lưu không đổi (AC-7); sức khoẻ (AC-9).

## Out of scope

- Ô nhận lead, sửa hàng loạt, API công cụ của sàn — cửa vào sau.
- «Tự nhận khi ba người cùng chọn» (Tham chiếu: mặc định tắt).
- Dọn từ điển định kỳ bằng AI (ND8).
- Nội thất, pháp lý, tình trạng sử dụng — chưa có tập giá trị chuẩn.
- Một chạm mở Bảng hàng lọc căn lạ — ba trường này không lưu được giá trị ngoài chuẩn.
- Màn Từ điển xếp một cột ở khổ điện thoại (thu phạm vi sau lượt chấm 2, chủ kho chọn 07/11) — bản đầu dùng trên máy tính.

## Notes

- Known limits — chọn ở Cổng Bằng chứng 2026-11-07:
  - Màn Từ điển ở khổ điện thoại: bảng cách gõ phải cuộn ngang, nút «Bỏ» có thể nằm ngoài khung — quản trị duyệt từ điển trên máy tính.

- Migration 051 `company_value_aliases` + `company_value_alias_events`; luật theo dòng theo sàn; bộ kiểm cách ly thêm ca.
- Bài kiểm trên Postgres dãy B (5572); dữ liệu thử «[Tên]», `0900 000 0xx`.
