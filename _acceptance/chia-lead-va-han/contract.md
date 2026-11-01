---
schema_version: 1
feature: Lead không trùng được chia theo luật của sàn trong một phút; quá 15 phút chưa nhận hay 30 phút chưa gọi thì trưởng nhóm được báo
slug: chia-lead-va-han
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, db]
status: signed-off
design_doc: docs/superpowers/specs/2026-10-31-chia-lead-va-han-design.md
approved_by: Manh Phan
approved_at: 2026-11-01
---

# Acceptance Contract: chia-lead-va-han

## Context

Hàng 25 của lộ trình (dãy L, đợt `dau-chu-dong-vao`), đứng trên hàng 24 (ô nhận lead, ADR-0012). Luật 20 của Tham chiếu
§8: lead không trùng chia theo luật của sàn; hạn nhận 15 phút, hạn gọi lần đầu 30 phút; quá hạn thì báo trưởng nhóm.
Lộ trình ghi T2, nhưng hàng thêm cột, bảng và hàm ở cơ sở dữ liệu (migration `011`, `t3_paths`) nên chạy hạng T3 (giám
sát L-8). Hàng không có màn: lời báo nằm ở API cho trưởng nhóm; thông báo lên máy là hàng 26, bốn nấc của telesales là
hàng 27, màn Hôm nay của trưởng nhóm là hàng 42. Bảy câu Hỏi-1..7 soạn theo khuyến nghị; chủ kho chốt ở Cổng Phạm vi.

Chủ kho 1/11 (qua giám sát): phân phối lead là chuẩn của nhiều CRM và chủ sàn chưa chắc cách nào tốt nhất, nên cách chia,
hai hạn và người đọc lời báo là **cấu hình của sàn** chọn từ một thực đơn cố định của lõi, có mặc định (Tham chiếu §4:
«hạn, ngưỡng, tỉ lệ … là mặc định của sàn, sàn chỉnh được ở Cài đặt sàn»). Hàng này dựng lõi, bảng cấu hình theo sàn và
lối API đọc/ghi cho quản trị sàn; màn đổi cấu hình là hàng 48.

Source input: `docs/plan/lo-trinh.json` hàng 25 · `_acceptance/chia-lead-va-han/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-10-31-chia-lead-va-han-design.md`

Từ ngữ: «lead chờ chia» = lead kết quả không trùng, chưa có người nhận, chưa bỏ; «lead đã về người» = lead có đầu chủ
nhận (được chia, hay khớp chủ trùng lúc nhập); «nhịp» = một lần chạy lối việc nền; «mốc hạn» = lúc lead về người hiện tại;
«đầu chủ phụ trách toà» = thành viên có vai đầu chủ và một khu phụ trách cùng tên với toà của lead; «bộ mẫu» =
`packages/db/seed/mau/du-lieu-mau.json` của hàng 5; «cách chia» = một trong năm mục thực đơn: theo khu phụ trách lần
lượt (`zone_round_robin`, mặc định), lần lượt toàn sàn (`company_round_robin`), theo khu ai ít lead đang mở nhất
(`zone_least_open`), kho chung — đầu chủ tự nhận (`open_pool`), trưởng nhóm chia tay (`manual`); «lead đang mở» của một
người = lead đã về người ấy, chưa bỏ, chưa ghi gọi lần đầu; «đóng dấu» = lúc lead vào nhịp đầu tiên, lead mang theo cách
chia và hai hạn của sàn lúc ấy; «luồng lead mẫu» = sáu lead Toà A, Toà A, Toà B, Toà A, Toà B, Toà A nhập rồi một nhịp, ở
sàn có đầu chủ 1 (Toà A), đầu chủ 2 (Toà A, Toà B), đầu chủ 3 (Toà B) vào sàn theo thứ tự ấy, trước luồng đầu chủ 2 đã
có một lead Toà B chưa gọi (lần chia thứ nhất) và đầu chủ 1 đã gọi xong một lead Toà A (lần chia thứ hai).

## Criteria

- AC-1: Given lõi của `packages/core`, When chọn người nhận cho một lead dưới mỗi cách chia, Then luật chủ trùng đứng trước
  mọi cách chia — đầu chủ của lead trước cùng số nhận nếu còn vai đầu chủ và không nghỉ, không thì theo cách chia; theo khu
  lần lượt: đầu chủ phụ trách toà, không nghỉ, lâu chưa được chia nhất (chưa nhận lần nào đứng đầu), hoà thì người vào sàn
  trước; lần lượt toàn sàn: như vậy nhưng mọi đầu chủ không nghỉ, không xét khu; theo khu ít lead đang mở: đầu chủ phụ
  trách toà ít lead đang mở nhất, hoà thì lâu chưa được chia nhất; kho chung và chia tay: không chọn ai; không ai đủ
  điều kiện thì không chọn và nêu lý do; người không có vai đầu chủ không bao giờ được chọn; khu khớp toà khi tên bằng nhau
  sau khi bỏ khoảng trắng thừa, chuẩn hoá Unicode, không phân hoa thường; luồng lead mẫu ra đúng bảng viết trước ở
  tiêu chí AC-12.
- AC-2: Given lõi của `packages/core`, When xét hạn và cấu hình, Then lead đã về người báo «quá hạn nhận» khi chưa nhận và đã
  đủ hạn nhận đã đóng dấu từ mốc hạn, «quá hạn gọi» khi chưa gọi và đã đủ hạn gọi (14 phút 59 giây không báo, đúng 15 phút
  báo; với hạn 5/10 thì đúng 5 và 10 phút); loại đã báo cho mốc hạn ấy không báo lại; lead chưa có người được báo «chưa
  chia được» ngay ở nhịp không chia được với ba cách chia tự động và chia tay, còn kho chung thì khi đủ hạn nhận từ lúc
  nhập; mặc định của sàn là theo khu lần lượt, 15 phút, 30 phút, lời báo cho trưởng nhóm; một lần đổi cấu hình chỉ nhận
  bốn khoá, cách chia và người đọc báo trong thực đơn, mỗi hạn là số phút nguyên từ 1 tới 1440, hạn gọi không ngắn hơn hạn
  nhận — sai thì từ chối kèm lý do.
- AC-3: Given sàn của bộ mẫu dùng mặc định (đầu chủ 1 phụ trách Toà A; đầu chủ 2 phụ trách Toà B và được quản trị thêm
  Toà A qua lối người dùng có sẵn), When telesales nhập mười lead L-03..L-12 của bộ mẫu qua `POST /api/v1/leads` và nhịp
  chạy — bảy lead đầu, rồi đầu chủ 1 đánh dấu nghỉ, rồi ba lead còn lại — Then mỗi lead về đúng người của bảng viết trước
  (L-03 đầu chủ 1, L-04 đầu chủ 2, L-05 đầu chủ 2, L-06 đầu chủ 1, L-07 đầu chủ 2, L-08 đầu chủ 1, L-09 đầu chủ 2, L-10..L-12
  đầu chủ 2), mỗi lead được chia ngay ở nhịp đầu tiên sau khi nhập; đầu chủ 1 đi làm lại thì lead Toà A kế tiếp về đầu chủ 1.
- AC-4: Given lead chờ chia không ai nhận được — toà không đầu chủ nào phụ trách hay mọi người phụ trách đều nghỉ dưới
  cách chia theo khu, hay sàn chia tay, hay kho chung chưa ai nhận, When nhịp chạy nhiều lần, Then lead vẫn chờ và trưởng
  nhóm có đúng một lời báo «chưa chia được» cho lead ấy (kho chung: từ nhịp đủ hạn nhận kể từ lúc nhập, trước đó không); khi
  một đầu chủ phụ trách đi làm lại thì nhịp kế chia lead cho người ấy.
- AC-5: Given một lead đã về người ở mốc hạn T với hạn đóng dấu 15/30, When nhịp chạy ở T + 14:59, T + 15:00, T + 29:59,
  T + 30:00 và chạy lại, Then có lời báo «quá hạn nhận» từ nhịp T + 15:00 và «quá hạn gọi» từ nhịp T + 30:00, mỗi loại đúng
  một lời; lead đã nhận trước T + 15:00 không có báo quá hạn nhận; lead đã ghi gọi trước T + 30:00 không có báo quá hạn
  gọi; lead khớp chủ trùng lúc nhập tính hạn từ lúc nhập; lead căn trùng (bỏ hay chưa bỏ) không tính hạn; sàn đặt người
  đọc báo «trưởng nhóm và quản trị» thì quản trị sàn đọc được danh sách báo, sàn để mặc định thì quản trị → 403.
- AC-6: Given lead của sàn, When gọi `POST /api/v1/leads/{id}/accept`, `/first-call`, `/claim`, `GET /api/v1/lead-pool` và
  `PUT /api/v1/company/members/{userId}/leave`, Then chỉ đầu chủ của lead nhận và ghi gọi được (người khác, kể cả trưởng
  nhóm → 404; lần hai → 409; ghi gọi khi chưa nhận thì ghi luôn mốc nhận); lead kho chung chưa ai nhận hiện trong danh sách
  kho chung của đầu chủ không nghỉ phụ trách toà của lead (toà, căn, nhu cầu, lúc nhập — không chủ nhà, không số), đầu chủ
  ấy bấm nhận thì lead về người ấy, đã nhận, mốc hạn gọi bắt đầu; người thứ hai nhận cùng lead → 409; người nghỉ,
  telesales nhận → 403; đầu chủ không phụ trách toà ấy, hay lead không ở kho chung → 404; đánh dấu nghỉ chỉ chính người đó, trưởng nhóm hay quản trị sàn (người khác → 403; người không
  thuộc sàn → 404); chưa đăng nhập → 401.
- AC-7: Given lời báo của sàn, When trưởng nhóm gọi `GET /api/v1/lead-alerts` và `POST /api/v1/leads/{id}/assign`, Then danh
  sách có loại báo, toà, căn, tên đầu chủ (trống với «chưa chia được»), mốc — mới nhất trước; vai không được đọc → 403;
  giao một lead chờ chia (kể cả kho chung, chia tay), lead đã chia hay lead khớp chủ trùng cho một đầu chủ của sàn thì lead
  về người mới, mốc hạn bắt đầu lại, mốc nhận và gọi xoá, nhịp sau tính hạn mới theo hạn đã đóng dấu; mỗi lần giao lại một lead đã về người cộng
  một vào số lần giao lại của lead; người nhận không
  phải đầu chủ của sàn → 400; lead căn trùng → 400; vai khác trưởng nhóm gọi giao → 403.
- AC-8: Given lối `POST /api/v1/jobs/lead-tick`, When gọi không khoá, sai khoá, máy chủ không cấu hình khoá, hay đúng khoá,
  Then lần lượt 401, 401, 503, 200 kèm số lead đã chia và số lời báo mới; hai nhịp chạy cùng lúc trên cùng dữ liệu không
  chia một lead hai lần và không tạo lời báo trùng.
- AC-9: Given hai sàn A và B, When người của B gọi mọi lối của hàng trên lead, người, lời báo, kho chung và cấu hình của A,
  và vai API gọi thẳng các hàm của hàng dưới ngữ cảnh B, Then không thấy, không chia, không nhận, không đổi được gì của A
  (404 hoặc không dòng); cấu hình của B không đổi cách chia của A; nhịp chia lead của A chỉ cho người của A; vai API không
  sửa thẳng được `leads`, `lead_alerts`; hàm liệt sàn của nhịp chỉ trả mã sàn; lời báo, danh sách báo, kho chung và kết quả
  nhịp không mang số chủ.
- AC-10: Given lead đã về một đầu chủ, When telesales nhập lead khác cùng số chủ (kể cả ở toà khác) trước hay sau nhịp, dưới
  mỗi cách chia, Then lead sau về cùng đầu chủ ấy — sau nhịp thì kết quả lúc nhập là chủ trùng (hàm dữ kiện của hàng 24
  không đổi), trước nhịp thì nhịp chia nó cho người của lead trước kể cả ở sàn kho chung hay chia tay; người ấy đang nghỉ thì
  lead còn chờ đi theo cách chia của sàn, còn lead nhập sau nhịp vẫn về người ấy theo kiểm trùng của hàng 24 và trưởng nhóm
  giao lại được (AC-7); hai lead cùng số chưa có lead trước, nhập trước cùng một nhịp ở sàn tự chia, về cùng một người.
- AC-11: Given một sàn chưa đặt cấu hình nào, When quản trị sàn gọi `GET` rồi `PUT /api/v1/company/settings/lead-routing`,
  Then `GET` trả mặc định của sàn; `PUT` hợp lệ trả 200 và `GET` sau đó trả giá trị mới; khoá lạ, cách chia ngoài thực đơn,
  phút ngoài khoảng, hay đổi một phần làm hạn gọi ngắn hơn hạn nhận đã lưu → 400 kèm lý do, cấu hình không đổi; trưởng nhóm, đầu chủ, telesales `GET` được, `PUT` → 403; chưa đăng nhập → 401; lead đã đóng
  dấu giữ cách chia và hai hạn cũ — đổi hạn nhận sang 5 phút thì lead đóng dấu trước vẫn báo ở phút 15, lead nhập sau báo
  ở phút 5; đổi cách chia sang chia tay thì lead đóng dấu trước còn chờ vẫn được nhịp chia theo cách cũ.
- AC-12: Given luồng lead mẫu nhập qua `POST /api/v1/leads` trên năm sàn thử, mỗi sàn đặt một cách chia qua lối cấu hình,
  When một nhịp chạy, Then người nhận của sáu lead theo đúng bảng viết trước — theo khu lần lượt: 2, 1, 3, 2, 3, 1; lần lượt
  toàn sàn: 3, 2, 1, 3, 2, 1; theo khu ít lead đang mở: 1, 2, 3, 1, 3, 2; kho chung: không ai; chia tay: không ai (số là đầu
  chủ 1, 2, 3).

## Coverage

Quét morphological-scan, preset entity-feature, cho thực thể «một lead sau lúc nhập» trong một sàn có cấu hình.

- Trục cách chia: theo khu lần lượt | lần lượt toàn sàn | theo khu ít lead đang mở | kho chung | chia tay (AC-1, AC-12, AC-4)
  [thước CE: thực đơn của chủ kho 1/11, Tham chiếu §8 luật 20]
- Trục người nhận: người của lead cùng số (AC-1, AC-10) | đầu chủ theo cách chia (AC-1, AC-3, AC-12) | không ai (AC-1, AC-4)
  | đầu chủ tự nhận ở kho chung (AC-6) | trưởng nhóm giao tay (AC-7)
- Trục người: đi làm (AC-3) | nghỉ (AC-1, AC-3, AC-4) | đi làm lại (AC-3, AC-4) | mất vai đầu chủ (AC-1) | vào sàn trước/sau
  (AC-1) | nhiều/ít lead đang mở (AC-1, AC-12)
- Trục cấu hình: chưa đặt — mặc định (AC-2, AC-11) | đặt hợp lệ (AC-11, AC-12) | đặt sai (AC-2, AC-11) | đổi khi lead đã đóng
  dấu (AC-11) | người đọc báo (AC-5)
- Trục khớp toà: cùng tên (AC-3) | khác hoa thường, khoảng trắng (AC-1) | không khu nào khớp (AC-4)
- Trục thời gian: trước hạn 1 giây, đúng hạn (AC-2, AC-5) | hạn nhận, hạn gọi (AC-2, AC-5) | hạn khác mặc định (AC-2,
  AC-11) | đã nhận, đã gọi (AC-5) | giao lại → mốc mới (AC-7) | chạy lại (AC-5, AC-8)
- Trục kết quả lúc nhập: không trùng (AC-3..AC-5) | chủ trùng (AC-5, AC-7) | căn trùng — không chia (AC-7), không hạn
  (AC-5) | đã bỏ (AC-5)
- Trục vai: đầu chủ của lead (AC-6) | đầu chủ khác, trưởng nhóm, quản trị, telesales (AC-11, AC-5..AC-7) | chưa đăng nhập
  (AC-11, AC-6)
- Trục sàn và rò: cùng sàn | sàn khác (AC-9) | số chủ (AC-6, AC-9) | gọi thẳng hàm, sửa thẳng bảng (AC-9)
- Trục nhịp: không khoá, sai khoá, thiếu khoá, đúng khoá (AC-8) | hai nhịp cùng lúc (AC-8)
- Trục lớp: lõi thuần (AC-1, AC-2) | cơ sở dữ liệu + API (AC-3..AC-12)

## Đường đo

Ô cơ hội khai số đo hai tuần thử «Thời gian lead → cuộc gọi đầu», ngưỡng số đặt trước khi thử:

- «Thời gian lead → cuộc gọi đầu» = `first_called_at − created_at` trên các dòng `leads` có `first_called_at` trong khoảng
  đo, loại lead có số lần giao lại lớn hơn 0 (giao lại xoá mốc gọi của người trước) và báo kèm số lead bị loại
  ← AC-6 (đầu chủ ghi gọi lần đầu), AC-5 (mốc nhập giữ nguyên), AC-7 (số lần giao lại); số từ bảng `leads` bằng một câu tính, không cần mã mới.
  Ghi gọi trên màn là việc của hàng 22/28; tới khi có màn, mốc gọi chỉ có qua API.
- «Báo quá hạn đến trong sai số một phút» ← AC-5 (báo ở nhịp đầu tiên từ lúc đến hạn) cộng nhịp mỗi phút của Hỏi-1.
- Điều kiện trước phiên thử (không phải tiêu chí của hàng, việc vận hành sau gộp): nhịp mỗi phút đã bật trên bản thật,
  kiểm bằng một câu đếm — sàn thử để cách chia mặc định, mười lead thử đều có `routed_at − created_at ≤ 60 giây`. Chưa bật thì phiên thử không đo
  được ngưỡng, không phải ngưỡng chết.
- Số đo §11 «Thời gian lead → cuộc gọi đầu» chưa có dữ liệu tự nhiên tới khi màn ghi gọi (hàng 22/28) gộp; trong hai tuần
  thử trước đó, mốc gọi chỉ có nếu đầu chủ ghi qua API — ghi rõ ở phiên thử.

## Out of scope

- Thông báo lead lên điện thoại, máy tính của đầu chủ — hàng 26; lời báo quá hạn lên máy của trưởng nhóm — đề nghị nới
  hàng 26 (Hỏi-6).
- Màn: Hôm nay của đầu chủ có nút nhận (hàng 22), bốn nấc lead của telesales (hàng 27), màn cuộc gọi ghi gọi (hàng 28),
  Hôm nay của trưởng nhóm xem lead quá hạn và chia lại (hàng 42).
- Màn Cài đặt sàn đổi cách chia, hai hạn và người đọc báo (`/settings/lead-routing`) — hàng 48; hàng này có lõi, bảng
  cấu hình theo sàn và lối API đọc/ghi cho quản trị sàn.
- Cách chia tự viết (kịch bản, luật theo điều kiện), chia theo ca làm, theo giờ, theo nguồn lead, tải toàn sàn — thêm mục
  vào thực đơn ở hàng sau; mỗi mục mới là một chiến lược của lõi với ca kiểm riêng.
- Sổ điểm biến thiên chung gom mọi cấu hình của sàn — phiên CH; hàng này đặt khoá `lead_routing.*` theo kiểu nó sẽ gom.
- Bật nhịp mỗi phút trên bản thật — bước vận hành của chủ kho sau gộp, theo hướng dẫn ở ADR-0017 và lời chốt Hỏi-1:
  chủ kho đặt khoá việc nền (`JOB_SECRET`, bí mật) ở Vercel và ở Supabase — giám sát và máy không đặt; bật hai extension
  `pg_cron`, `pg_net` (dự án Supabase `quy-hang`, tổ chức gói Pro, có sẵn bản 1.6.4 và 0.20.4 mà chưa bật — đọc 31/10 qua
  công cụ Supabase; Supabase Cron là module Postgres của dự án, docs: https://supabase.com/docs/guides/cron) rồi tạo
  lịch mỗi phút gọi lối việc nền. Kho chỉ khai tên biến ở `.env.example`.
- Tự giao lại lead của người vừa nghỉ, hay lead quá hạn — trưởng nhóm giao tay (AC-7).
- Lead thành hàng khi đầu chủ nhận — hàng 22/17.
- Danh sách người đang nghỉ trên màn người dùng — hàng của Cài đặt sàn.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Bất biến chạm: (1) cách ly — `company_settings`, `member_availability`, `lead_alerts` bật và ép luật theo dòng; hàm definer
  lọc theo sàn đang làm, trừ hàm liệt sàn của nhịp chỉ trả mã sàn (AC-9); (2) chủ nhà — so số chỉ trong cơ sở dữ liệu, vai API vẫn không
  đọc `leads.owner_phone`, không lời báo hay dòng kho chung nào mang số (AC-9); (3) người bấm gửi — lời báo chỉ ở trong app, không gửi tin;
  (4) phần nội bộ không ra trang khách — không chạm.
- Đứng sau hàng 62 (migration 008 và 009 — 009 thêm dấu vết số cho bảng leads, ADR-0013): lead cùng số nhận ra bằng dấu vết `owner_phone_hash`, không hàm nào của
  hàng đọc hay nhận số dạng chữ (AC-10 của 62). Phần cơ sở dữ liệu và API dựng, đo sau khi 62 gộp vào nhánh chính.
- Không sửa `packages/api/src/leads/**` (dãy G sửa cho hàng 62) và không đổi thân `app.lead_dedupe_facts`: người nhận của
  lead đã chia ghi vào `matched_agent_user_id` (ADR-0017).
- Cấu hình nằm ở bảng `company_settings (company_id, key, value jsonb, updated_by, updated_at)`, một dòng một khoá, khoá
  dạng «<nhóm>.<khoá>»: `lead_routing.strategy`, `lead_routing.accept_minutes`, `lead_routing.first_call_minutes`,
  `lead_routing.alert_to`. Khoá vắng = mặc định của sàn khai một chỗ ở lõi (`DEFAULT_LEAD_ROUTING`); SQL không chép con số.
  Kiểu đặt tên báo phiên CH (sổ điểm biến thiên) để gom sau.
- Known limits — chọn ở Cổng Bằng chứng 2026-11-01:
  - Ngoài-1: Lần đầu bật nhịp mỗi phút, lead nhập từ trước mà đã gắn sẵn đầu chủ có thể bị báo quá hạn một loạt cho trưởng nhóm.
  - Ngoài-2: Ba chức năng chỉ dành cho nhịp nền chưa kiểm vai ở cơ sở dữ liệu; chưa có lối nào của app gọi tới được, sàn khác không bị chạm.
  - Ngoài-3: Khoá việc nền quá ngắn vẫn được nhận; chủ kho đặt khoá ngẫu nhiên từ 32 ký tự theo hướng dẫn ADR-0017.
  - Ngoài-4: Mỗi nhịp máy làm thêm việc thừa cho lead cũ và mốc hạn lưu kèm lời báo lệch dưới một mili giây; trưởng nhóm vẫn nhận đúng một lời báo.
  - Ngoài-6: Bài kiểm cách ly của bốn thao tác nhận, gọi, tự nhận, giao lại chỉ đo chiều chặn, chưa có đối chứng phân biệt.
  - Ngoài-7: Ca khớp tên toà viết bằng dấu tổ hợp chưa thật sự đo bước chuẩn hoá Unicode.
- Dãy L chạy Postgres 5563 (container `quy-hang-db-L`), dev 3483. Migration 011 và ADR-0017 do giám sát giữ chỗ (L-8).
