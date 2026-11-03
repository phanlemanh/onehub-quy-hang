---
schema_version: 1
feature: "Vá tiêu đề Cuộc gọi: trên điện thoại, đầu trang của màn ghi cuộc gọi hiện «Ghi cuộc gọi» thay vì «Căn call»; trang của một căn vẫn hiện mã căn như cũ"
slug: va-tieu-de-goi
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: approved
design_doc: docs/superpowers/specs/2026-11-03-va-tieu-de-goi-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-11-03T14:43:42Z
---

# Acceptance Contract: va-tieu-de-goi

## Context

Hàng `va-tieu-de-goi` của lộ trình (vai Đầu chủ, dựng trên hàng 28, 29). Thanh trên của vỏ điện thoại coi mọi đường
`/units/<x>` là mã căn nên màn ghi cuộc gọi hiện «Căn call». Nhãn «Ghi cuộc gọi» là nhãn nút mở chế độ cuộc gọi đã chốt
ở Hỏi-8 của hàng 29.

Source input: hàng `va-tieu-de-goi` của `docs/plan/lo-trinh.json` · ô cơ hội `_acceptance/va-tieu-de-goi/opportunity.md`
(ký `build` 02/11).

## Criteria

- AC-1: Given Đầu chủ mẫu đăng nhập ở khổ 375×812, When mở `/units/call` (cả `?lead=<mã>` và `?hang=<mã>`) và `/units/call/dial?lead=<mã>`,
  Then thanh trên của vỏ điện thoại ghi đúng «Ghi cuộc gọi», không còn chữ «Căn call»; hàm tiêu đề cho «Ghi cuộc gọi»
  với `/units/call`, `/units/call/`, `/units/call/dial` và không cho «Căn call» với đường nào dưới `/units/call`.
- AC-2: Given hàm tiêu đề của vỏ điện thoại, When nhận `/units/<mã>` (mã thường, mã có dấu chấm gạch, mã mã hoá phần
  trăm, mã phần trăm hỏng), các đường khác của bảng tên trang, đủ năm nhà và `/units` trần, Then `/units/<mã>` cho «Căn <mã đã giải mã>»
  (mã hỏng cho chuỗi thô, không ném lỗi), còn mọi đường khác cho đúng tiêu đề như trước hàng này; ở khổ 375 hồ sơ một căn
  thật vẫn ghi «Căn <mã>».
- AC-3: Given cây sau hàng này, When chạy kiểm kiểu, lint (luật `quy-hang-ui`, mức nợ 0, kiểm chuẩn, bài quét khuôn) và
  bước chấm khuôn của nhóm trạng thái, Then đều xanh.

## Đường đo

- Thước: tiêu đề đúng trên màn cuộc gọi · số từ: E1, E3 · bảo đảm bởi: AC-1
- Thước: trang một căn không đổi · số từ: E2, E3 · bảo đảm bởi: AC-2

## Coverage

Quét bằng morphological-scan (preset entity-feature), hai trục:

- Trục A — đường dưới `/units`: `/units/call` · `/units/call/` · `/units/call/dial` · `/units/<mã>` thường · mã có
  dấu · mã mã hoá phần trăm · mã phần trăm hỏng · `/units` trần [thước CE: cây `apps/web/src/app/(app)/units/**/page.tsx`
  — chỉ `[code]`, `call`, `call/dial`]
- Trục B — khổ: điện thoại (thanh trên `MobileHeader`) · máy tính (không có thanh tiêu đề này) [thước CE: `app-shell.tsx`
  — chỉ `MobileHeader` đọc `titleOf`]
- Core: A toàn bộ ở AC-1, AC-2; B điện thoại ở AC-1, AC-2.
- Later: tiêu đề phân biệt «Gọi khai thác»/«Gọi ép giá» theo truy vấn (vỏ không đọc truy vấn; `DauMan` của trang đã
  nói).
- Never: khổ máy tính — không có thanh tiêu đề vỏ để vá.

## Out of scope

- Đổi đầu màn `DauMan` của trang cuộc gọi hay nhãn nút «Ghi cuộc gọi» ở Hôm nay.
- Tiêu đề theo chế độ (khai thác / ép giá) trên thanh trên.
- Vỏ máy tính.

## Notes

- Chạm tệp: `apps/web/src/components/shell/app-shell.tsx` (đổi dòng nhập), tệp mới `apps/web/src/components/shell/tieu-de.ts`
  và bài kiểm `tieu-de.test.ts` — vùng của hàng đã khai thêm `tieu-de.ts`.
