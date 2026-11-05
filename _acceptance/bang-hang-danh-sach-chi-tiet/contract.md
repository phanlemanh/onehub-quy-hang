---
schema_version: 1
feature: "Đầu chủ mở hồ sơ căn từ Bảng hàng thì hồ sơ là một cột đứng cạnh bảng, ngoài khung bảng, cao từ đỉnh vùng làm việc tới đáy màn, đẩy bảng sang trái và kéo chia 28–50%; thanh trên của vỏ giữ nguyên, nhóm nút Nhóm · Lọc · Cột · Xuất và +Lead không bị che; điện thoại không đổi; Bảng hàng có cột Đầu chủ"
slug: bang-hang-danh-sach-chi-tiet
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: approved
design_doc: docs/superpowers/specs/2026-11-05-bang-hang-danh-sach-chi-tiet-design.md
approved_by: Manh Phan
approved_at: 2026-11-05
---

# Acceptance Contract: bang-hang-danh-sach-chi-tiet

## Context

Hàng 105 của lộ trình (dãy D, đợt `dau-khach-nhap`, luật đợt 60). Chủ kho chọn lối C ở phiên đánh giá ngăn hồ sơ căn
(nguyên văn «Chọn C», 05/11; `docs/design/danh-gia-ngan-chi-tiet-can.md`). Đứng trên 14, 17, 91. Thêm theo giám sát đợt:
cột «Đầu chủ» — nguồn «AC-4 hàng 89» (chủ kho chọn «Thu AC-4, cột sau», `d-20261105T035554Z-21`). Không chạm bất biến nào;
không chạm `inventory/bulk/**` (hàng 89).

Source input: `docs/plan/lo-trinh.json` hàng 105 · `_acceptance/bang-hang-danh-sach-chi-tiet/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-11-05-bang-hang-danh-sach-chi-tiet-design.md`

## Criteria

- **AC-1** — Hồ sơ là cột cao hết vùng làm việc, ngoài khung bảng.
  Given đầu chủ mẫu ở Bảng hàng, khổ 1440 × 900 và 1280 × 800,
  When bấm một dòng căn,
  Then hồ sơ căn mở thành một cột bên phải, ngoài khung «Bảng hàng»: mép trên cột ngang mép trên khung «Bảng hàng», mép dưới
  cột chạm đáy vùng làm việc của vỏ (vỏ giữ lề và viền đáy của nó); thanh trên của vỏ (gõ mã căn, +Lead, đồng bộ, chuông, tài khoản) giữ nguyên vị trí và không bị
  che; không có lớp phủ.

- **AC-2** — Bảng co sang trái, công cụ vẫn thấy, kéo chia được.
  Given hồ sơ đang mở,
  When nhìn bảng và kéo mép cột,
  Then cột mặc định 38% bề rộng vùng làm việc; bảng nằm trọn bên trái cột, không ô nào của bảng nằm dưới cột; nhóm nút Nhóm ·
  Lọc · Cột · Xuất thấy và bấm được; ở 1280 bảng còn thấy ít nhất 4 cột; kéo mép thì cột dừng ở 28% và 50%.

- **AC-3** — Bảng không dựng lại.
  Given bảng đang lọc, nhóm và cuộn xuống giữa danh sách,
  When mở hồ sơ, đổi sang căn khác, rồi đóng hồ sơ,
  Then lọc, nhóm và vị trí cuộn giữ nguyên qua cả ba bước; dòng đang mở được đánh dấu.

- **AC-4** — Không cuộn trang.
  Given khổ 1440 × 900 và 1280 × 800, hồ sơ đóng và hồ sơ mở,
  When mở Bảng hàng,
  Then trang không cuộn (chiều cao tài liệu không quá khung nhìn); bảng cuộn trong khung của nó.

- **AC-5** — Bố cục danh sách – chi tiết đổi sang cột kéo chia, ngăn nổi giữ cho việc khác.
  Given bộ bố cục,
  When dựng `BoCuc` kiểu `danh-sach-chi-tiet` có cột phụ trên máy tính, và dựng ngăn báo, lọc điện thoại, luồng nhiều bước,
  Then cột phụ là cột kéo chia đứng cạnh thân (không ngăn nổi); ngăn báo, lọc điện thoại và luồng nhiều bước vẫn dùng ngăn
  nổi như trước; Bảng hàng dựng bằng bố cục này và không còn trong ngoại lệ có hạn của khuôn `bang-hang`.

- **AC-6** — Điện thoại không đổi.
  Given khổ 375,
  When mở Bảng hàng, rồi mở `/inventory?unit=<mã>`,
  Then thấy bảng thẻ như trước; `?unit=` mở hồ sơ toàn màn như trước; không có cột kéo chia.

- **AC-7** — Cột Đầu chủ (nguồn AC-4 hàng 89). (cross-layer)
  Given sàn mẫu có căn đã gán đầu chủ và căn chưa gán,
  When mở Bảng hàng, rồi gán một căn sang đầu chủ khác qua API,
  Then mọi vai có Bảng hàng (đầu chủ, đầu khách, trưởng nhóm) đọc được tên thành viên của sàn mình qua một đường đọc chỉ trả
  mã và tên (không email, không số điện thoại), người sàn khác không đọc được; bảng có cột «Đầu chủ» hiện tên thành viên
  đang giữ căn, căn chưa gán hiện «—», căn có đầu chủ đã rời sàn hiện «Đã
  rời sàn» (Hỏi-3); sau một lần kéo của bộ đồng bộ, ô của căn vừa gán hiện tên người nhận mà không tải lại trang; cột ẩn
  được ở trình đơn Cột.

- **AC-8** — Tài liệu hết lệch.
  Given cây sau thay đổi,
  When đọc ADR-0024, Tham chiếu §12, `vo-va-ia.md`, `design/patterns/ho-so-can.md`, `design/patterns/bang-hang.md`,
  Then ADR-0024 có mục «Sửa đổi 05/11» sửa quyết định 2 và 13 (khối nguồn `app-shell-11` cột kéo chia + ruột `solution-crm-4`)
  mà không viết đè chữ cũ; Tham chiếu §12 có dòng 05/11; ba tệp còn lại tả cột kéo chia cao hết vùng làm việc và không còn
  chữ «ngăn trượt đè lên bảng» cho hồ sơ căn; khi Hỏi-2 chốt giữ cứng, Sổ điểm biến thiên có một dòng điều khoá cho kiểu mở
  chi tiết kèm lý do.

- **AC-9** — Khuôn và vùng.
  Given cây sau thay đổi,
  When chạy bước chấm khuôn và bộ kiểm chuẩn giao diện,
  Then nhóm `bang-hang` và `ho-so-can` không lệch khuôn; catalog có dòng `@reui/app-shell-11`; diff không chạm
  `apps/web/src/app/(app)/inventory/bulk/**`.

- **AC-10** — Hồ sơ chờ tải hay lỗi không kéo sập bảng.
  Given hồ sơ căn đang mở và lời đọc hồ sơ bị giữ chậm, rồi trả lỗi,
  When nhìn cột hồ sơ và bấm một dòng khác trên bảng,
  Then lúc chậm cột hiện khung chờ của bố cục; lúc lỗi cột hiện lời lỗi kèm «Thử lại»; trong cả hai lúc bảng vẫn hiện đủ dòng,
  bấm được và giữ lọc; bấm «Thử lại» sau khi lời đọc trở lại bình thường thì hồ sơ hiện ra.

## Coverage

Bỏ quét morphological-scan (sổ: «bỏ coverage-scan»); trục ghi tay:

- Trục khổ: 1440 × 900 | 1280 × 800 | 375 (AC-1, AC-2, AC-4, AC-6).
- Trục trạng thái cột: đóng | mở | đổi căn | kéo chạm biên | chờ tải | lỗi tải (AC-1, AC-2, AC-3, AC-10).
- Trục bố cục: danh sách – chi tiết (cột kéo chia) | ngăn báo, lọc điện thoại, luồng nhiều bước (ngăn nổi) (AC-5).
- Trục dữ liệu cột Đầu chủ: đã gán | chưa gán | đầu chủ đã rời sàn | vừa gán lại | người xem là đầu chủ, đầu khách,
  trưởng nhóm | người sàn khác (AC-7).
- Trục tài liệu: ADR | Tham chiếu | thiết kế | khuôn (AC-8, AC-9).
- Later: J / K đi căn trước · sau mà không đóng cột; nhớ bề rộng cột theo người. Never: lớp phủ chặn bảng khi hồ sơ mở.

## Đường đo

- Thước SỐNG của ô cơ hội «Bảng hàng có hồ sơ cạnh bên dùng cột kéo chia của bộ bố cục; khung Bảng hàng không cao quá khung
  nhìn; ADR-0024 Sửa đổi 05/11 và Tham chiếu §12; ba tệp hết lệch; không chạm inventory/bulk» · số từ: phép nhìn màn trên
  chỗ thử dãy D (E1–E4, E6, E7b) và bộ kiểm tài liệu, bố cục (E5, E8, E9) · bảo đảm bởi: AC-1, AC-4, AC-5, AC-8, AC-9.

## Out of scope

- J / K hay ↑↓ đi căn trước · sau mà không đóng cột (khảo sát mục 5 nêu cho lối B; lối C giữ bấm dòng).
- Nhớ bề rộng cột theo người hay theo sàn.
- Màn danh sách – chi tiết khác (103 Liên hệ, 79, 99, 100, 102) — dựng trên bố cục này ở hàng của chúng.
- Đổi đầu chủ trên bảng (hàng 89); cột Đầu chủ chỉ đọc.

## Notes

- Hỏi-1, Hỏi-2, Hỏi-3: xem sổ quyết định (S1).
