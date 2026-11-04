---
schema_version: 1
feature: "Nhớ mẫu file (hàng 67): Đầu chủ nhập lại file cùng mẫu và thấy máy ghép sẵn như lần trước, kể cả cách gọi riêng của sàn; gộp Ngoài-3/Ngoài-7 của Màn Nhập Excel (luật 50)"
slug: nhap-nho-mau
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: approved
design_doc: docs/superpowers/specs/2026-11-04-nhap-nho-mau-design.md
approved_by: Manh Phan
approved_at: 2026-11-04
---

# Acceptance Contract: nhap-nho-mau

## Context

Màn Nhập Excel (hàng man-nhap-excel, đã gộp 04/11) ghép cột bằng từ điển chung mỗi lần nhập. Hàng 67 thêm **bộ nhớ của
sàn**: kế hoạch của các lần nhập đã ghi (bảng `imports`, migration 024) thành mẫu — tiêu đề đã gặp thì lấy đích, phép biến
đổi, bảng quy đổi giá trị của lần ghi mới nhất; sửa ô ở bước xem trước trên cột lớp danh mục hay hàng chia sẻ được thành một cặp quy
đổi trong kế hoạch (không học ở cột nguồn, tên người, chữ tự do, chưa rõ). Bộ nhớ không chứa giá trị của cột nguồn hay cột tên người (ADR-0011 quyết định 6). Thiết kế:
`docs/superpowers/specs/2026-11-04-nhap-nho-mau-design.md`. Gộp hai mục ngoài hợp đồng của Màn Nhập Excel mà chủ kho chọn
«mở hợp đồng mới» (luật 50 của đợt): Ngoài-3, Ngoài-7.

Dữ liệu mẫu: `[Tên]`, `0900 000 0xx`, `[Tên sàn]`.

## Criteria

- **AC-1 — Mẫu khớp theo từng tiêu đề.** Given bộ nhớ có kế hoạch của một lần nhập đã ghi (có cột người đổi đích) · When
  máy dựng kế hoạch cho tệp mới cùng tiêu đề (kể cả đổi thứ tự cột) · Then mỗi cột có tiêu đề trong bộ nhớ nhận đúng đích,
  phép biến đổi, bảng quy đổi đã nhớ, đánh dấu «theo mẫu»; cột chưa từng gặp đi từ điển như cũ; hai lần ghi cùng tiêu đề
  thì lần mới nhất thắng.
- **AC-2 — Mẫu không hợp lệ thì về từ điển.** Given cột nhớ được đích hay phép biến đổi mà `validatePlan` từ chối trên ô
  của tệp mới · When dựng kế hoạch · Then riêng cột ấy về từ điển, kèm lý do; các cột khác vẫn theo mẫu; kế hoạch gửi máy
  chủ luôn hợp lệ.
- **AC-3 — Bộ nhớ không chứa giá trị nguồn, tên người.** (cross-layer) Given lần nhập đã ghi có cột lớp nguồn (số chủ, giá đáy) và cột
  tên người · When đọc mẫu qua API · Then các cột ấy chỉ mang đích, không mang bảng quy đổi nào, và thân trả về không chứa
  chuỗi giá trị nào của các ô ấy.
- **AC-4 — Đọc mẫu của sàn.** Given sàn A có lần nhập đã ghi và lần nhập chỉ xem thử · When Đầu chủ hay Trưởng nhóm của sàn
  A gọi `GET /api/v1/imports/templates` · Then chỉ lần đã ghi góp mẫu, mỗi khoá tiêu đề một dòng của lần mới nhất; vai khác
  nhận 403 `import-role-required`; mẫu của sàn B không hiện (cách ly).
- **AC-5 — Nhập lại là ghép sẵn (vòng trọn).** Given Đầu chủ đã ghi một lần nhập qua hàm API của màn, có đổi đích một cột
  và sửa một ô «cần người» · When nhập tệp thứ hai cùng mẫu · Then kế hoạch của màn bằng kế hoạch đã ghi ở từng cột nhớ
  được, và ô cùng nguyên văn với ô đã sửa không còn «cần người».
- **AC-6 — Sửa ô thành cách gọi của cột.** Given bước xem trước, cột lớp danh mục hay hàng chia sẻ được có ô «cần người»
  · When người sửa ô ấy thành giá trị lõi nhận · Then kế hoạch thêm cặp «nguyên văn → giá trị» vào bảng quy đổi của cột,
  mọi ô cùng nguyên văn của cột đổi theo và màn báo «Đã đổi theo K ô cùng chữ» (theo Hỏi-2); sửa ô ở cột nguồn, tên
  người, chữ tự do hay chưa rõ chỉ đổi ô ấy, kế hoạch không đổi.
- **AC-7 — Màn báo mẫu đã nhớ.** Given tệp khớp một phần hoặc trọn bộ nhớ · When tới bước Ghép cột · Then dải báo «Ghép
  theo mẫu đã nhớ — N/M cột» và nhãn «theo mẫu» ở từng cột nhớ được, ở 1440 và 375; đọc mẫu lỗi thì màn vẫn chạy theo từ
  điển và báo «Không đọc được mẫu đã nhớ».
- **AC-8 — Thanh bước khoá khi máy chủ đang chạy (Ngoài-3 Màn Nhập Excel).** Given máy chủ đang xem thử hay đang ghi ·
  When người bấm một bước trên thanh bước · Then không đổi bước, như nút Quay lại; hết chạy thì bấm được lại.
- **AC-9 — Thân lỗi không phải chuỗi vẫn là lỗi (Ngoài-7 Màn Nhập Excel).** Given máy chủ trả mã lỗi với `error` là đối
  tượng (lỗi kiểm thân mặc định) · When mở lần nhập hay ghi một gói · Then kết quả là lỗi có chữ, gói không tính là đã ghi,
  không gọi đường dẫn có `undefined`.
- **AC-11 — Đo được việc chỉnh tay giảm (theo Hỏi-3).** Given các lần nhập đã ghi của một sàn · When chạy lệnh đo
  `_acceptance/nhap-nho-mau/thu/do-mau.mjs` · Then mỗi lần nhập in ba số đọc từ kế hoạch đã lưu: số cột theo mẫu, số cột
  người đổi đích, tổng cột — không đọc ô, không đọc dòng.
- **AC-10 — Đi khuôn đã duyệt.** Given mọi tệp màn và lib của vòng · When `npm run lint` · Then mức nợ giao diện 0/0, khuôn
  0 lệch, nhóm `nhap-excel` vẫn một tệp theo khuôn.

## Coverage

Quét không gian tiêu chí (preset entity-feature × test-matrix, skill morphological-scan):

- Trục **mức khớp**: không khớp | khớp một phần | khớp trọn | mẫu không còn hợp lệ [thước CE: ADR-0011 qđ 6 «khớp trọn /
  khớp một phần» — AC-1, AC-2, AC-7]
- Trục **ai ghép cột**: từ điển | mẫu | người đổi đích | người sửa ô [thước CE: Kiến trúc §2 «sửa của người → ghi vào mẫu
  file» — AC-1, AC-5, AC-6]
- Trục **lớp cột**: danh mục | giá trị đóng | chữ tự do | nguồn | tên người [thước CE: `FIELD_CLASS`, bất biến 2, ADR-0011
  «bộ nhớ không chứa giá trị cột nguồn hay tên người» — AC-3, AC-6]
- Trục **trạng thái lần nhập**: đã ghi | chỉ xem thử [thước CE: `imports.status` migration 024 — AC-4]
- Trục **người đọc mẫu**: Đầu chủ | Trưởng nhóm | vai khác | sàn khác [thước CE: ADR-0011 qđ 11, bất biến 1 — AC-4]
- Trục **máy chủ đang chạy** (gộp luật 50): xem thử | ghi | lỗi dạng lạ [thước CE: review-findings Ngoài-3, Ngoài-7 của
  man-nhap-excel — AC-8, AC-9]

## Đường đo

Đề xuất ngưỡng cho Cổng Giá trị (Hỏi-3, ô cơ hội điền theo lựa chọn ở Cổng Phạm vi):

- SỐNG: nhập lại tệp cùng mẫu thì ≥ 90% cột theo mẫu và ≤ 1 cột người phải đổi đích — số từ lệnh đo của AC-11.
- CHẾT: nhập lại cùng mẫu mà < 50% cột theo mẫu sau ba lần nhập của cùng một sàn — số từ cùng lệnh.

## Out of scope

- Màn quản mẫu file (sửa, xoá, đặt tên, đếm lượt dùng) và bảng `import_templates` — hàng 50 (S6).
- Từ điển giá trị dùng chung của sàn (`company_value_aliases`, cách gọi riêng ở Cài đặt sàn) — hàng 45/70.
- Tác tử AI cho cột chưa nhớ — hàng 68.
- Nhớ dòng tiêu đề, nhớ trang tính, nhớ đầu chủ được chọn khi Trưởng nhóm nhập hộ.

## Notes

- Vùng: `packages/core/src/import/memory/**`, `apps/web/src/app/(app)/imports/new/**`, `apps/web/src/lib/nhap/**` (luật 50),
  `packages/api/src/imports/**`, `packages/api/test-db/imports/**`; `apps/web/src/app/imports/templates/**` của hàng không
  dùng (màn quản mẫu để hàng 50).
- Nguồn Ngoài-3/Ngoài-7: Màn Nhập Excel (man-nhap-excel), Cổng Bằng chứng 04/11, luật 50 của đợt dau-khach-nhap.
