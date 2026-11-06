---
schema_version: 1
feature: "Đầu chủ thấy ô máy không đọc được — giá dải, «thu về 4.2», trạng thái lạ — có đề xuất kèm lý do và chọn một chạm (hàng 69)"
slug: nhap-o-la
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: draft
design_doc: _acceptance/nhap-o-la/design.md
---

# Acceptance Contract: nhap-o-la

## Context

Sau khi áp kế hoạch nhập (hàng 64–68), bước Xem trước của màn Nhập Excel còn những ô bộ chuẩn hoá không đọc được, mang
dấu «Cần người»: giá dải, giá về tay «thu về 4.2», trạng thái lạ. Hàng này làm mục «Ô lạ còn lại» của Kiến trúc «Nhập dữ
liệu» §5 (ADR-0011 qđ 1, 2, 3, 10): khi sàn bật «Xử lý bằng AI» (thoả thuận `ai_processing` của hàng 68), các ô ấy — chỉ ở
cột danh mục, giá, phí, trạng thái, gộp theo chữ, ≤ 300 — gửi tới Claude một lần kèm lý do mã từ chối; mỗi đề xuất qua kiểm
nghĩa của lõi hiện dưới ô với lý do, người bấm «Dùng» một chạm (đúng đường gõ tay) hay sửa tay. Không ô nào tự ghi. Mô hình
theo ADR-0011 qđ 3: đo Opus 5.5 và Haiku 5.5 trên bộ ô lạ có đáp án, bản rẻ hơn thắng nếu giữ ngưỡng. Bất biến chạm: 2
(nguồn không rời công ty — cùng cửa chặn hai lần của hàng 68). Không migration: `ai_usage` và thoả thuận dùng nguyên khuôn của
migration 035. Thiết kế: `_acceptance/nhap-o-la/design.md`.

Dữ liệu mẫu: `[Tên]`, `0900 000 0xx`, `[Tên sàn]`.

## Criteria

- **AC-1 — Gói ô lạ chỉ mang ô được mở.** Given kết quả áp kế hoạch của một tệp có ô «Cần người» ở nhiều lớp cột, When lõi
  dựng gói ô lạ, Then gói chỉ có ô `needs_person` do bộ chuẩn hoá quyết, ở cột lớp `catalog`/`shareable_listing` đã ghép vào
  trường chuẩn cùng lớp; mỗi ô mang `{id, cot, tieuDe, truong, giaTri, lyDoMa}`; ô cùng (cột, chữ) gộp một; tối đa 300 ô;
  ô có giá trị trúng bộ dò dữ liệu cá nhân bị loại; cột nguồn, tên người, ghi chú, chưa rõ và ô do luật cấp dòng không bao giờ
  vào gói, và không chuỗi cấm nào của bộ thử có trong gói.
- **AC-2 — Máy chủ chặn trước khi gửi.** Given sàn có thoả thuận `ai_processing` đang hiệu lực, When POST
  `/api/v1/imports/ai/cells` với gói sai khuôn (khoá lạ, ô của trường lớp nguồn, quá 300 ô) Then 400 và không gọi Claude; When
  gói có số điện thoại, email hay số giấy tờ trong một giá trị Then không gọi Claude, ghi đúng một dòng `ai_usage` `blocked_pii`
  không chứa chuỗi trúng, trả `{cheDo: "tat-dinh"}`; gói sạch → gọi đúng một lần.
- **AC-3 — Lõi loại đề xuất sai nghĩa.** Given gói ô lạ và đầu ra của tác tử, When lõi kiểm, Then mỗi đề xuất sai chỉ bỏ
  đề xuất ấy, kèm lý do: `id` lạ hay lặp, lý do rỗng, chữ đề xuất không qua bộ chuẩn hoá của trường, giá ngoài dải của ô dải,
  ô «thu về X» mà giá khác X «chưa gồm phí» và khác giá bao phí quy từ X theo tỉ lệ mặc định; đầu ra sai khuôn ở gốc → không đề
  xuất nào.
- **AC-4 — Thấy đề xuất kèm lý do, chọn một chạm.** Given sàn bật «Xử lý bằng AI» và tệp có ô giá dải, «thu về 4.2», trạng
  thái lạ, When đầu chủ vào bước Xem trước, Then màn tự gửi một lần cho mỗi gói khác nhau của lần nhập; mỗi ô lưới mang chữ
  của một ô gói có đề xuất qua kiểm hiện huy hiệu «Máy đề xuất», chữ đề xuất, lý do và nút «Dùng»; bấm «Dùng» → đúng ô ấy
  thành «Giữ nguyên» hay «Máy sửa» với giá trị ấy (ô cùng chữ chỉ đổi theo ở trường giá trị đóng — trạng thái, điều kiện
  phí — như khi gõ tay); bản xem thử của máy chủ nhận đúng giá trị ấy; ở khổ 1440 và 375. (cross-layer)
- **AC-5 — Không ô nào tự ghi.** Given màn đã nhận đề xuất, When đầu chủ chưa bấm «Dùng» ở một ô, Then ô ấy vẫn «Cần
  người» và bản xem thử gửi máy chủ mang chữ gốc của ô — giá trị đề xuất không có trong gói ghi. (cross-layer)
- **AC-6 — Đề xuất sai thì sửa tay.** Given ô có đề xuất, When đầu chủ gõ một chữ khác vào ô, Then chữ của người được áp
  (qua đúng bộ chuẩn hoá), đề xuất của ô ấy tắt và không quay lại khi lưới dựng lại.
- **AC-7 — Không AI vẫn nhập.** Given sàn tắt «Xử lý bằng AI», hết trần tháng, thiếu khoá, Claude lỗi, quá 240 giây hay đầu
  ra sai khuôn, When vào bước Xem trước, Then không đề xuất nào, màn hiện một dòng «Sửa tay lần này: <lý do>», sửa tay và ghi
  chạy như hôm nay; mỗi lần đã gọi Claude ghi một dòng `ai_usage` đúng `result`. (cross-layer)
- **AC-8 — Đo trên bộ ô lạ có đáp án.** Given bộ ô lạ có đáp án (giá dải, giá và phí về tay, trạng thái lạ, ô đối chứng
  không có đáp án) và đề xuất ghi sẵn do tác tử context sạch lập trên đúng gói và lời nhắc của mã — một bộ Opus 5.5, một bộ
  Haiku 5.5, When mã chấm, Then mỗi bộ có số phủ, đúng, bịa, tự ghi, rò nguồn; bộ của mô hình đường ô lạ dùng (theo Hỏi-1:
  Opus 5.5) đạt phủ ≥ 90%, đúng ≥ 95%, bịa 0, tự ghi 0, rò nguồn 0; số của bộ kia in cạnh để phiên nghiệm thu quyết hạ mô
  hình; bộ dưới một ngưỡng (vd phủ 89%) thì bài đo đỏ và nêu số, không cho đường ô lạ dùng mô hình ấy.
- **AC-9 — Tính vào sổ chi phí.** Given một lần gọi ô lạ trả lời, When máy chủ ghi, Then đúng một dòng `ai_usage` mang mô
  hình đã gọi, token, tiền theo bảng giá của mô hình ấy, `result: "ok"`; trần tháng của sàn tính chung với đề xuất cột — đã chạm
  trần thì không gọi.

## Coverage

Quét bằng skill `morphological-scan` (preset entity-feature + risk-premortem). Đối tượng: một ô «Cần người» của lần nhập.

| Trục | Giá trị | Thước CE |
| --- | --- | --- |
| Loại ô | giá dải · giá về tay · phí về tay · trạng thái lạ · ô không có đáp án (thương lượng) · ô do luật cấp dòng · ô cột nguồn | Kiến trúc «Nhập dữ liệu» §4 bảng phép biến đổi (dòng price, fee_condition, status), lý do `hoi(...)` ở `transforms.ts` |
| Đường đề xuất | qua kiểm · bị mã loại · không đề xuất | ADR-0011 qđ 1 «mã kiểm» |
| Phản ứng người | Dùng · gõ tay khác · không chạm | câu giao «chọn một chạm; sửa tay được; không ô nào tự ghi» |
| Cửa AI | bật · tắt · hết trần · thiếu khoá · lỗi · quá giờ · sai khuôn · chặn dữ liệu cá nhân | hàng 68 AC-3, AC-7, AC-8 |
| Khổ | 1440 · 375 | `design/patterns/nhap-excel.md` |

Core ↔ AC: loại ô × qua kiểm/bị loại → AC-1, AC-3, AC-8; phản ứng người → AC-4, AC-5, AC-6; cửa AI → AC-2, AC-7, AC-9; khổ →
AC-4. Later/Never ở «Out of scope».

## Đường đo

- Mỗi ô lạ có một đề xuất kèm lý do · số phủ và đúng từ `so-do-o-la.json` (lệnh `thu/do-o-la.ts` trên bộ ô lạ, hai mô hình; số qua API thật ở phiên nghiệm thu) · AC-8
- Chọn một chạm, đề xuất sai thì sửa tay · số từ ca «Dùng» và «gõ tay thắng» ở trạng thái màn, ảnh màn 1440 và 375 · AC-4, AC-6
- Không ô nào tự ghi khi người chưa chọn · số «tự ghi» của bộ đo và ca gói ghi mang chữ gốc · AC-5, AC-8
- Thông tin chủ nhà không rời công ty · số từ bộ kiểm rò trên gói ô lạ và số dòng `ai_usage` kết quả `blocked_pii` · AC-1, AC-2

## Out of scope

- «Dùng mọi đề xuất» cho cả cột một chạm.
- Ô «Cần người» do luật cấp dòng (phí lệch giá, lệch danh mục, trùng mã căn) và mọi ô của cột lớp nguồn, tên người, ghi chú.
- Học đề xuất đã dùng vào bộ nhớ mẫu ngoài luật «ô cùng chữ đổi theo» của hàng 67.
- Tách lần gọi ô lạ khỏi lần gọi đề xuất cột trong `ai_usage` (cần đổi khuôn bảng, T3).
- Gọi thật Claude API trong bộ đo.

## Notes

- Số đo mô hình (AC-8) là mô phỏng: đề xuất ghi sẵn do tác tử con chạy đúng mô hình lập, không qua Claude API với đầu ra có
  khuôn. Số qua API thật là điều kiện của phiên nghiệm thu trước khi hạ đường ô lạ xuống Haiku 5.5 (Hỏi-1).
