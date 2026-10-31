---
schema_version: 1
feature: Đầu chủ để lead và hàng chưa khoá nguồn ở «Chỉ tôi»; hàng lên «Toàn sàn» thì cả sàn mới thấy
slug: truc-ai-thay-hang
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api]
status: implemented
design_doc: docs/superpowers/specs/2026-10-31-truc-ai-thay-hang-design.md
approved_by: Manh Phan
approved_at: 2026-10-31T03:44:32Z
---

# Acceptance Contract: truc-ai-thay-hang

## Context

Hàng 12 của lộ trình (nền, dãy A, đợt nen-2), đứng trên hàng 8 (lõi hàng và sự kiện, ADR-0008). Tham chiếu §6 trục 1:
lead và hàng chưa khoá nguồn mặc định «Chỉ tôi»; «Sẵn sàng bán» đưa lên «Toàn sàn». Hàng này dựng trục hai nấc ở
`packages/core/src/visibility/` — nấc tính ra từ dãy sự kiện, không cột mới — và áp nó trên bốn đường API hàng. Chưa có
màn. Hỏi-1 và Hỏi-2 của bản thiết kế theo khuyến nghị; chủ kho chốt ở Cổng Phạm vi.

Source input: `docs/plan/lo-trinh.json` hàng 12 · `_acceptance/truc-ai-thay-hang/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-10-31-truc-ai-thay-hang-design.md`

## Criteria

- AC-1: Given bộ ca kiểm cố định của dãy sự kiện viết trước trong tệp kiểm thử, When tính nấc bằng hàm của
  `packages/core/src/visibility/`, Then hàng chưa từng vào `Active` ra `Private` («Chỉ tôi») — gồm vừa tạo, đã có giá và
  điều kiện, `Incomplete` → `Hold`, `Incomplete` → `Withdrawn`; hàng đã từng vào `Active` ra `Company` («Toàn sàn») —
  gồm đang `Active`, rồi `Pending`, `Closed`, `Hold`, `Withdrawn` sau đó (giữ nấc theo Hỏi-1); không giá trị thứ ba nào.
- AC-2: Given ma trận viết trước người xem × nấc (người tạo, thành viên khác cùng sàn) × (`Private`, `Company`), When gọi
  hàm quyền đọc của lõi, Then đúng ba ô «đọc được» (người tạo ở cả hai nấc, thành viên khác ở `Company`) và một ô «không»
  (thành viên khác ở `Private`); vai của người xem không đổi kết quả.
- AC-3: Given hai thành viên X, Y cùng sàn, X tạo hàng, When mỗi người gọi `GET /api/v1/listings`, Then danh sách của X
  có hàng ấy với `visibility: "Private"`, danh sách của Y không có; sau khi X đưa hàng vào `Active`, danh sách của Y có
  hàng ấy với `visibility: "Company"`; `POST /api/v1/listings` trả hàng mới kèm `visibility: "Private"`. (cross-layer)
- AC-4: Given hàng «Chỉ tôi» của X, When Y gọi `GET /api/v1/listings/{listingId}`, Then API trả 404 `not-found` cùng thân
  với mã hàng không có; sau khi hàng lên «Toàn sàn», Y đọc được hàng kèm lịch sử sự kiện (200). (cross-layer)
- AC-5: Given hàng «Chỉ tôi» của X, When Y gửi lệnh đổi hàng (`POST /api/v1/listings/{listingId}/events`) — kể cả lệnh
  sai phiên bản hay sai khuôn payload, Then API trả 404 `not-found` với thân y hệt lệnh cùng loại vào một mã hàng không
  có, và không ghi sự kiện nào, bản tính không đổi; sau khi hàng lên «Toàn sàn», lệnh hợp lệ của Y ghi được (200) — theo
  Hỏi-2. (cross-layer)
- AC-6: Given hàng đã lên «Toàn sàn» rồi chuyển sang `Hold`, When Y đọc danh sách và đọc hàng, Then Y vẫn thấy hàng với
  `visibility: "Company"` — một lần lên là giữ (Hỏi-1). (cross-layer)
- AC-7: Given thành viên Z của sàn B, When Z đọc danh sách và đọc mã hàng của X ở sàn A, cả khi hàng ở «Chỉ tôi» lẫn khi
  đã lên «Toàn sàn», Then danh sách của Z không có hàng ấy và đọc mã trả 404 với thân y hệt mã hàng không có — «Toàn
  sàn» là toàn sàn A, không hơn.
  (cross-layer)
- AC-8: Given thành viên W cùng sàn mang vai `company_admin` (và một người mang `team_lead`) không phải người tạo, When đọc
  danh sách, đọc mã và gửi lệnh vào hàng «Chỉ tôi» của X, Then đều như thành viên thường: không có trong danh sách, 404
  với thân y hệt mã hàng không có, không ghi — vai không mở «Chỉ tôi». (cross-layer)
- AC-9: Given các hàng ở cả hai nấc sau nhiều lệnh, When so `visibility` mà `GET /api/v1/listings` trả với nấc tính bằng
  hàm của lõi trên dãy sự kiện của chính hàng ấy, Then khớp từng hàng — dữ kiện câu SQL gom và dữ kiện gấp từ sự kiện cho
  cùng nấc; luật không có bản thứ hai ngoài lõi. (cross-layer)
- AC-10: Given tài liệu OpenAPI thật của `/api/v1` (`GET /api/v1/openapi.json`), When liệt mọi đường có mã hàng hay trả
  hàng, Then tập đường bằng đúng bảng bốn đường viết trước (`POST /listings`, `GET /listings`, `GET /listings/{listingId}`,
  `POST /listings/{listingId}/events`) — đường mới chạm hàng mà chưa vào bảng (và chưa có ca kiểm trục) thì đỏ.

## Coverage

Quét theo khuôn entity-feature (tay, trong bản thiết kế), thực thể «một hàng dưới mắt một người trong sàn».

- Trục nấc: `Private` (AC-1, AC-3, AC-4, AC-5) | `Company` (AC-1, AC-3, AC-4, AC-5, AC-6) | «Nhóm» — Later (Out of scope)
  [thước CE: Tham chiếu §6 trục 1]
- Trục chuyển nấc: lúc tạo (AC-1) | lần đầu vào Đang bán — từ Chưa đủ để rao và từ Tạm ngừng (AC-1, AC-3, AC-9) | rời
  Đang bán sau khi đã lên — mọi lối ra khỏi `Active` (AC-1, AC-6) | rời Chưa đủ để rao mà chưa từng Đang bán (AC-1) | đổi
  tay — Later (Out of scope) [thước CE: bảng chuyển 12 lối của ADR-0008 — mỗi lối vào hay ra khỏi `Active` một dòng ở E1]
- Trục người xem: người tạo (AC-2, AC-3) | thành viên khác cùng sàn (AC-2..AC-6) | vai cao trong sàn (AC-8) | sàn khác
  (AC-7) | trưởng nhóm thấy nhóm — Later [CE chưa kiểm chứng: chờ nấc «Nhóm»]
- Trục thao tác: liệt kê (AC-3) | đọc một (AC-4) | gửi lệnh (AC-5) | tạo (AC-3 — hàng mới ra `Private`) | đường hàng
  mới (AC-10) | đồng bộ về máy — hàng 13, đọc qua cùng hàm
- Trục lớp chặn: lõi thuần (AC-1, AC-2) | API (AC-3..AC-8) | một luật hai lối vào (AC-9) | luật theo dòng của cơ sở dữ
  liệu — Never ở hàng này (ranh giới cấm migration; sổ quyết định)

## Đường đo

- Ngưỡng SỐNG của ô cơ hội («chỉ người tạo đọc được qua API; lên «Toàn sàn» thì mọi người trong sàn đọc được, sàn khác
  vẫn không») là một phép đo có/không, không phải số: AC-3, AC-4 đo vế «chỉ người tạo» và vế «lên Toàn sàn thì cả sàn»;
  AC-7 đo vế «sàn khác vẫn không». Số lấy từ ca kiểm của `packages/api/test-db/` chạy trên Postgres (CI job isolation).

## Out of scope

- Nấc «Nhóm» và trưởng nhóm thấy hàng của nhóm — cần khái niệm nhóm; ngưỡng đã ký nói «người tạo».
- Đổi nấc bằng tay (đẩy lên «Toàn sàn» trước Sẵn sàng bán, hay hạ xuống) — cần loại sự kiện mới ở
  `packages/core/src/listing/`, ngoài vùng của hàng trong đợt nen-2.
- Gán đầu chủ và chuyển lead từ telesales sang đầu chủ — hàng chia lead; tới đó «người tạo» đổi thành «người giữ».
- Chặn ở luật theo dòng của cơ sở dữ liệu — ranh giới hàng cấm migration; chặn ở lõi + API.
- Trục 2 (hàng ra ngoài bằng cửa nào), lớp trường chủ nhà (hàng 11), mọi màn.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Bất biến chạm: (1) cách ly giữa công ty — không đổi, AC-7 đo lại qua API; (2) chủ nhà — không chạm (hàng không chứa
  lớp `source`); (3) không chạm; (4) phần nội bộ không ra trang khách — không chạm (trục 1 là trong sàn).
- Dãy A chạy Postgres 5552 (`quy-hang-db-A`), dev 3472.
- Hàng 13 (đồng bộ) đọc hàng về máy phải qua cùng hàm `canRead` của lõi — ghi ở thiết kế §2 «Chặn ở đâu».
