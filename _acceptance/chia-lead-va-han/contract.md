---
schema_version: 1
feature: Lead không trùng được chia theo luật của sàn trong một phút; quá 15 phút chưa nhận hay 30 phút chưa gọi thì trưởng nhóm được báo
slug: chia-lead-va-han
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, db]
status: draft
design_doc: docs/superpowers/specs/2026-10-31-chia-lead-va-han-design.md
approved_by:
approved_at:
---

# Acceptance Contract: chia-lead-va-han

## Context

Hàng 25 của lộ trình (dãy L, đợt `dau-chu-dong-vao`), đứng trên hàng 24 (ô nhận lead, ADR-0012). Luật 20 của Tham chiếu
§8: lead không trùng chia theo luật của sàn; hạn nhận 15 phút, hạn gọi lần đầu 30 phút; quá hạn thì báo trưởng nhóm.
Lộ trình ghi T2, nhưng hàng thêm cột, bảng và hàm ở cơ sở dữ liệu (migration `011`, `t3_paths`) nên chạy hạng T3 (giám
sát L-8). Hàng không có màn: lời báo nằm ở API cho trưởng nhóm; thông báo lên máy là hàng 26, bốn nấc của telesales là
hàng 27, màn Hôm nay của trưởng nhóm là hàng 42. Sáu câu Hỏi-1..6 soạn theo khuyến nghị; chủ kho chốt ở Cổng Phạm vi.

Source input: `docs/plan/lo-trinh.json` hàng 25 · `_acceptance/chia-lead-va-han/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-10-31-chia-lead-va-han-design.md`

Từ ngữ: «lead chờ chia» = lead kết quả không trùng, chưa có người nhận, chưa bỏ; «lead đã về người» = lead có đầu chủ
nhận (được chia, hay khớp chủ trùng lúc nhập); «nhịp» = một lần chạy lối việc nền; «mốc hạn» = lúc lead về người hiện tại;
«đầu chủ phụ trách toà» = thành viên có vai đầu chủ và một khu phụ trách cùng tên với toà của lead; «bộ mẫu» =
`packages/db/seed/mau/du-lieu-mau.json` của hàng 5.

## Criteria

- AC-1: Given lõi của `packages/core`, When chọn người nhận cho một lead, Then theo đúng thứ tự: đầu chủ của lead trước
  cùng số nếu người ấy còn vai đầu chủ và không nghỉ; nếu không thì đầu chủ phụ trách toà, không nghỉ, có số thứ tự lần
  chia gần nhất nhỏ nhất (chưa nhận lần nào đứng đầu), hoà thì người vào sàn trước; không ai đủ điều kiện thì không
  chọn ai và nêu lý do. Khu khớp toà khi tên bằng nhau sau khi bỏ khoảng trắng thừa, chuẩn hoá Unicode, không phân hoa
  thường; người không có vai đầu chủ không bao giờ được chọn.
- AC-2: Given lõi của `packages/core` và hạn mặc định 15 phút nhận, 30 phút gọi, When xét một lead đã về người tại một
  thời điểm, Then báo «quá hạn nhận» khi chưa nhận và đã đủ 15 phút từ mốc hạn, «quá hạn gọi» khi chưa gọi và đã đủ 30 phút;
  lúc 14 phút 59 giây không báo, đúng 15 phút thì báo; lead đã nhận không báo quá hạn nhận; loại đã báo cho mốc hạn ấy
  không báo lại.
- AC-3: Given một sàn có người của bộ mẫu (đầu chủ 1 phụ trách Toà A; đầu chủ 2 phụ trách Toà B và được quản trị thêm Toà A
  qua lối người dùng có sẵn), When telesales nhập mười lead L-03..L-12 của bộ mẫu qua `POST /api/v1/leads` và nhịp chạy
  — bảy lead đầu, rồi đầu chủ 1 đánh dấu nghỉ, rồi ba lead còn lại — Then mỗi lead về đúng người của bảng viết trước
  (L-03 đầu chủ 1, L-04 đầu chủ 2, L-05 đầu chủ 2, L-06 đầu chủ 1, L-07 đầu chủ 2, L-08 đầu chủ 1, L-09 đầu chủ 2, L-10..L-12
  đầu chủ 2), mỗi lead được chia ngay ở nhịp đầu tiên sau khi nhập; đầu chủ 1 đi làm lại thì lead Toà A kế tiếp về đầu chủ 1.
- AC-4: Given lead chờ chia ở một toà mà không đầu chủ nào phụ trách, hoặc mọi đầu chủ phụ trách đều nghỉ, When nhịp chạy
  nhiều lần, Then lead vẫn chờ, trưởng nhóm có đúng một lời báo «chưa chia được» cho lead ấy; khi một đầu chủ phụ trách
  đi làm lại thì nhịp kế chia lead cho người ấy.
- AC-5: Given một lead đã về người ở mốc hạn T, When nhịp chạy ở T + 14:59, T + 15:00, T + 29:59, T + 30:00 và chạy lại, Then
  trưởng nhóm có lời báo «quá hạn nhận» từ nhịp T + 15:00 và «quá hạn gọi» từ nhịp T + 30:00, mỗi loại đúng một lời; lead
  đầu chủ đã nhận trước T + 15:00 không có lời báo quá hạn nhận; lead đã ghi gọi trước T + 30:00 không có lời báo quá hạn
  gọi; lead khớp chủ trùng lúc nhập cũng tính hạn từ lúc nhập; lead căn trùng (tin bổ sung, bỏ hay chưa bỏ) không
  tính hạn.
- AC-6: Given một lead đã về một đầu chủ, When gọi `POST /api/v1/leads/{id}/accept`, `POST /api/v1/leads/{id}/first-call` và
  `PUT /api/v1/company/members/{userId}/leave`, Then chỉ đầu chủ của lead nhận và ghi gọi được (người khác, kể cả trưởng
  nhóm, → 404; lần thứ hai → 409; ghi gọi khi chưa nhận thì ghi luôn mốc nhận); đánh dấu nghỉ chỉ chính người đó, trưởng
  nhóm hay quản trị sàn làm được (người khác → 403; người không thuộc sàn → 404); chưa đăng nhập → 401.
- AC-7: Given lời báo của sàn, When trưởng nhóm gọi `GET /api/v1/lead-alerts` và `POST /api/v1/leads/{id}/assign`, Then danh
  sách có loại báo, toà, căn, tên đầu chủ (trống với «chưa chia được»), mốc — mới nhất trước; vai khác → 403; giao lại một
  lead chờ chia hay đã chia cho một đầu chủ của sàn thì lead về người mới, mốc hạn bắt đầu lại, mốc nhận và gọi xoá, nhịp
  sau tính hạn mới — giao được lead chờ chia chưa có người, lead đã chia, và lead khớp chủ trùng; người nhận không phải
  đầu chủ của sàn → 400; lead căn trùng → 400.
- AC-8: Given lối `POST /api/v1/jobs/lead-tick`, When gọi không khoá, sai khoá, máy chủ không cấu hình khoá, hay đúng khoá,
  Then lần lượt 401, 401, 503, 200 kèm số lead đã chia và số lời báo mới; hai nhịp chạy cùng lúc trên cùng dữ liệu không chia
  một lead hai lần và không tạo lời báo trùng.
- AC-9: Given hai sàn A và B, When người của B gọi mọi lối của hàng trên lead, người, lời báo của A, và vai API gọi thẳng các
  hàm của hàng dưới ngữ cảnh B, Then không thấy, không chia, không nhận, không đổi được gì của A (404 hoặc không dòng); nhịp
  chia lead của A chỉ cho người của A; vai API không sửa được thẳng bảng `leads`, `lead_alerts`; hàm liệt sàn của nhịp chỉ
  trả mã sàn; lời báo, danh sách báo và kết quả nhịp không mang số chủ.
- AC-10: Given lead đã về một đầu chủ, When telesales nhập lead khác cùng số chủ (kể cả ở toà khác) trước hay sau nhịp, Then
  lead sau về cùng đầu chủ ấy — sau nhịp thì kết quả lúc nhập là chủ trùng (hàm dữ kiện của hàng 24 không đổi), trước nhịp
  thì nhịp chia nó cho người của lead trước; người ấy đang nghỉ thì lead còn chờ chia được chia như lead thường, còn lead
  nhập sau nhịp vẫn về người ấy theo kiểm trùng của hàng 24 và trưởng nhóm giao lại được (AC-7).

## Coverage

Quét morphological-scan, preset entity-feature, cho thực thể «một lead sau lúc nhập».

- Trục người nhận: người của lead cùng số (AC-1, AC-10) | đầu chủ phụ trách toà (AC-1, AC-3) | không ai (AC-1, AC-4) |
  trưởng nhóm giao tay (AC-7) [thước CE: Tham chiếu §8 luật 20, §2 dòng Trưởng nhóm]
- Trục người: đi làm (AC-3) | nghỉ (AC-1, AC-3, AC-4) | đi làm lại (AC-3, AC-4) | mất vai đầu chủ (AC-1) | vào sàn trước/sau
  (AC-1)
- Trục khớp toà: cùng tên (AC-3) | khác hoa thường, khoảng trắng (AC-1) | không khu nào khớp (AC-4)
- Trục thời gian: trước hạn 1 giây, đúng hạn (AC-2, AC-5) | hạn nhận, hạn gọi (AC-2, AC-5) | đã nhận, đã gọi (AC-5) | giao
  lại → mốc mới (AC-7) | chạy lại (AC-5, AC-8)
- Trục kết quả lúc nhập: không trùng (AC-3..AC-5) | chủ trùng (AC-5, AC-7) | căn trùng — không chia (AC-7), không hạn
  (AC-5) | đã bỏ (AC-5)
- Trục vai: đầu chủ của lead (AC-6) | đầu chủ khác, trưởng nhóm, quản trị, telesales (AC-6, AC-7) | chưa đăng nhập (AC-6)
- Trục sàn và rò: cùng sàn | sàn khác (AC-9) | số chủ (AC-9) | gọi thẳng hàm, sửa thẳng bảng (AC-9)
- Trục nhịp: không khoá, sai khoá, thiếu khoá, đúng khoá (AC-8) | hai nhịp cùng lúc (AC-8)
- Trục lớp: lõi thuần (AC-1, AC-2) | cơ sở dữ liệu + API (AC-3..AC-10)

## Đường đo

Ô cơ hội khai số đo hai tuần thử «Thời gian lead → cuộc gọi đầu», ngưỡng số đặt trước khi thử:

- «Thời gian lead → cuộc gọi đầu» = `first_called_at − created_at` trên các dòng `leads` có `first_called_at` trong khoảng
  đo ← AC-6 (đầu chủ ghi gọi lần đầu), AC-5 (mốc nhập giữ nguyên); số từ bảng `leads` bằng một câu tính, không cần mã mới.
  Ghi gọi trên màn là việc của hàng 22/28; tới khi có màn, mốc gọi chỉ có qua API.
- «Báo quá hạn đến trong sai số một phút» ← AC-5 (báo ở nhịp đầu tiên từ lúc đến hạn) cộng nhịp mỗi phút của Hỏi-1.
- Điều kiện trước phiên thử (không phải tiêu chí của hàng, việc vận hành sau gộp): nhịp mỗi phút đã bật trên bản thật,
  kiểm bằng một câu đếm — mười lead thử đều có `routed_at − created_at ≤ 60 giây`. Chưa bật thì phiên thử không đo
  được ngưỡng, không phải ngưỡng chết.
- Số đo §11 «Thời gian lead → cuộc gọi đầu» chưa có dữ liệu tự nhiên tới khi màn ghi gọi (hàng 22/28) gộp; trong hai tuần
  thử trước đó, mốc gọi chỉ có nếu đầu chủ ghi qua API — ghi rõ ở phiên thử.

## Out of scope

- Thông báo lead lên điện thoại, máy tính của đầu chủ — hàng 26; lời báo quá hạn lên máy của trưởng nhóm — đề nghị nới
  hàng 26 (Hỏi-6).
- Màn: Hôm nay của đầu chủ có nút nhận (hàng 22), bốn nấc lead của telesales (hàng 27), màn cuộc gọi ghi gọi (hàng 28),
  Hôm nay của trưởng nhóm xem lead quá hạn và chia lại (hàng 42).
- Cài đặt sàn chỉnh luật chia và hai hạn (`/settings/lead-routing`) — P1; hàng này chạy bằng mặc định dựng sẵn.
- Bật nhịp mỗi phút trên bản thật (bật extension, đặt khoá ở Vercel) — việc vận hành sau gộp theo lời chốt Hỏi-1.
- Tự giao lại lead của người vừa nghỉ, hay lead quá hạn — trưởng nhóm giao tay (AC-7).
- Chia theo tải (số lead đang mở), theo ca làm, theo giờ — luật của sàn ở P1.
- Lead thành hàng khi đầu chủ nhận — hàng 22/17.
- Danh sách người đang nghỉ trên màn người dùng — hàng của Cài đặt sàn.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Bất biến chạm: (1) cách ly — `member_availability`, `lead_alerts` bật và ép luật theo dòng; hàm definer lọc theo sàn
  đang làm, trừ hàm liệt sàn của nhịp chỉ trả mã sàn (AC-9); (2) chủ nhà — so số chỉ trong cơ sở dữ liệu, vai API vẫn không
  đọc `leads.owner_phone`, không lời báo nào mang số (AC-9); (3) người bấm gửi — lời báo chỉ ở trong app, không gửi tin;
  (4) phần nội bộ không ra trang khách — không chạm.
- Không sửa `packages/api/src/leads/**` (dãy G sửa cho hàng 62) và không đổi thân `app.lead_dedupe_facts`: người nhận của
  lead đã chia ghi vào `matched_agent_user_id` (ADR-0017).
- Dãy L chạy Postgres 5563 (container `quy-hang-db-L`), dev 3483. Migration 011 và ADR-0017 do giám sát giữ chỗ (L-8).
