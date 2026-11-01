# Thiết kế — Chia lead và hạn (hàng 25, T3)

Hàng 25 của lộ trình (dãy L, đợt `dau-chu-dong-vao`), đứng trên hàng 24 (ô nhận lead, ADR-0012). Câu giao: «Lead không
trùng được chia theo luật của sàn trong một phút; quá 15 phút chưa nhận hay 30 phút chưa gọi thì trưởng nhóm được báo».
Luật 20 của Tham chiếu §8. Hạng T3: hàng thêm cột, bảng và hàm ở cơ sở dữ liệu (`packages/db/**` thuộc `t3_paths`),
migration `011_chia_lead_va_han.sql` và ADR-0017 do giám sát giữ chỗ (L-8).

## 1. Hàng làm gì

Chủ kho 1/11: phân phối lead là chuẩn của nhiều CRM và chủ sàn chưa chắc cách nào tốt nhất, nên cứng một luật thì không
triển khai được. Cách chia, hai hạn và người đọc lời báo là **cấu hình của sàn**, chọn từ thực đơn cố định của lõi, có
mặc định (Tham chiếu §4: con số và lựa chọn là mặc định của sàn).

1. **Cấu hình**: quản trị sàn đọc và đổi cấu hình qua API; sàn chưa đặt thì chạy mặc định khai một chỗ ở lõi. Màn đổi
   cấu hình là hàng 48.
2. **Chia**: mỗi nhịp, lead `new` chưa có người nhận được đóng dấu cách chia và hai hạn của sàn (lần đầu nó vào nhịp), rồi
   chia theo dấu ấy. Luật chủ trùng (người của lead trước cùng số) đứng trước mọi cách chia. Thực đơn:
   - `zone_round_robin` (mặc định) — đầu chủ phụ trách toà, không nghỉ, lâu chưa được chia nhất;
   - `company_round_robin` — như trên với mọi đầu chủ không nghỉ, không xét khu;
   - `zone_least_open` — đầu chủ phụ trách toà ít lead đang mở nhất (đã về, chưa bỏ, chưa gọi lần đầu), hoà thì lâu chưa
     được chia nhất;
   - `open_pool` — không chia; lead nằm ở kho chung, đầu chủ không nghỉ phụ trách toà của lead bấm nhận được (Hỏi-7);
   - `manual` — không chia; trưởng nhóm chia tay.
   Không ai nhận được thì lead chờ và người đọc báo được báo «chưa chia được» một lần — ngay ở nhịp ấy, riêng kho chung
   khi đủ hạn nhận kể từ lúc nhập.
3. **Hạn**: lead đã về một đầu chủ (chia, tự nhận ở kho chung, hay khớp chủ trùng lúc nhập) mà quá hạn nhận chưa nhận, hay
   quá hạn gọi chưa gọi lần đầu (hai hạn đã đóng dấu), thì có lời báo — một lời cho mỗi loại hạn của mỗi lần giao.
4. **Ghi mốc**: đầu chủ nhận lead, tự nhận ở kho chung, ghi đã gọi lần đầu; trưởng nhóm chia tay một lead (giao lại) và xem
   danh sách báo; một người được đánh dấu nghỉ hay đi làm lại.
5. **Nhịp**: một lối việc nền có khoá bí mật, ai gọi mỗi phút cũng được. Bên gọi trên bản thật là câu Hỏi-1.

Hàng KHÔNG đưa thông báo lên điện thoại hay máy tính (hàng 26; phần của trưởng nhóm — Hỏi-6), không dựng màn (Hôm nay
hàng 22, theo dõi lead hàng 27, cuộc gọi hàng 28, Hôm nay của trưởng nhóm hàng 42, Cài đặt sàn hàng 48).

## 2. Dữ liệu (migration 011)

Bản nháp `011_chia_lead_va_han.sql` đang có trong nhánh là bản trước khi đổi hướng 1/11 (một luật cứng); S3 viết lại theo
mục này sau khi hàng 62 gộp.


- `company_settings (company_id, key, value jsonb, updated_by, updated_at)`, khoá chính `(company_id, key)`, khoá dạng
  «<nhóm>.<khoá>» — bảng chung cho cấu hình của sàn để sổ điểm biến thiên (phiên CH) gom sau. Hàng này dùng bốn khoá:
  `lead_routing.strategy`, `lead_routing.accept_minutes`, `lead_routing.first_call_minutes`, `lead_routing.alert_to`.
  Khoá vắng = mặc định của sàn ở lõi (`DEFAULT_LEAD_ROUTING`); SQL không chép con số hay tên mặc định. Đọc: cả sàn. Ghi:
  quản trị sàn (luật theo dòng); giá trị do lõi kiểm trước khi ghi.
- `leads` thêm `routed_at` (lần giao gần nhất bằng máy, tự nhận hay trưởng nhóm), `routed_seq` (số tăng dần cấp lúc giao —
  thứ tự «lâu chưa được chia»), `accepted_at`, `first_called_at`, `reassign_count` (số lần trưởng nhóm giao lại một lead đã
  về người — số đo «lead → cuộc gọi đầu» loại các lead này), và dấu `routing_strategy`, `accept_minutes`,
  `first_call_minutes` (đóng một lần, cùng có hay cùng trống). Người nhận của lead `new` ghi vào cột có sẵn
  `matched_agent_user_id`: cột này nghĩa là «đầu chủ lead đã về» — khớp chủ trùng lúc nhập hay được giao. Nhờ vậy ba chỗ
  của hàng 24 tự đúng mà không sửa: vế «lead trước cùng số đã về một đầu chủ» của `app.lead_dedupe_facts`, luật đọc «đầu
  chủ được khớp thấy lead về mình», và tên đầu chủ trong bản của telesales. Ràng buộc `leads_new_has_no_match` thay bằng:
  lead `new` không khớp hàng; lead `new` có người nhận khi và chỉ khi có `routed_at`. Thân hàm dữ kiện không bị đụng.
- `member_availability (company_id, user_id, on_leave, changed_by, changed_at)` — khoá ngoại đôi về `company_members`.
  Đọc: cả sàn. Ghi: chính người đó, trưởng nhóm, quản trị sàn.
- `lead_alerts (id, company_id, lead_id, kind, agent_user_id, deadline_from, raised_at)`, `kind` ∈ `unrouted`,
  `accept_overdue`, `first_call_overdue`; duy nhất theo `(company_id, lead_id, kind, deadline_from)`. Đọc: trưởng nhóm, và
  quản trị khi `lead_routing.alert_to` = `team_lead_and_admin` (hàm `app.lead_alerts_to_admin()` đọc khoá ấy; trong SQL
  chỉ có tên mục thực đơn, không có giá trị mặc định — khoá vắng thì quản trị không đọc). Không cấp ghi cho vai API.
- Hàm security definer, mọi hàm gói trong `app.current_company_id()`:
  - `app.lead_routing_settings_rows()` — các dòng `lead_routing.*` của sàn; lõi điền mặc định.
  - `app.stamp_leads(strategy, accept, first_call)` — đóng dấu lead chưa có dấu (lead `new` hay chủ trùng, chưa bỏ).
  - `app.lead_routing_queue()` — lead chờ chia đã đóng dấu, cũ trước, kèm cách chia, `owner_group` (dấu vết số) và
    `prior_agent`: đầu chủ của lead trước cùng số đã về người.
  - `app.lead_routing_candidates()` — thành viên có vai đầu chủ, tên khu, nghỉ hay không, ngày vào sàn, `routed_seq` lớn
    nhất đã nhận, số lead đang mở.
  - `app.route_lead(lead, agent, now)` — chỉ lead `new` chưa có người, chưa bỏ, người nhận là đầu chủ của sàn.
  - `app.lead_pool()`, `app.claim_lead(lead)` — kho chung: lead `open_pool` chưa có người (mã, toà, căn, nhu cầu, lúc
    nhập — không chủ nhà, không số); lối API lọc theo `poolVisibleTo` của lõi (khu khớp toà) trước khi trả hay nhận; nhận: người gọi là đầu chủ không nghỉ, lead còn trống; ghi người nhận, `routed_at`,
    `routed_seq`, `accepted_at`.
  - `app.lead_deadline_facts()` — lead đã về người, chưa bỏ: mốc hạn (`routed_at` hay `created_at`), hai hạn đã đóng dấu,
    mốc nhận, mốc gọi, loại báo đã có cho mốc ấy; và lead chờ chia: cách chia, lúc nhập, hạn nhận, đã báo «chưa chia được»
    chưa.
  - `app.raise_lead_alert(lead, kind, from, now)` — chèn, trùng thì bỏ qua.
  - `app.accept_lead`, `app.mark_first_call`, `app.reassign_lead` — mỗi ca một mã lỗi (như `app.discard_lead`).
  - `app.lead_job_companies()` — mã các sàn có lead chờ chia hay lead còn hạn mở; chỉ trả mã. Hàm duy nhất không đọc sàn
    đang làm: nhịp chạy không có sàn.
- Số chủ không ra khỏi hàm nào và không hàm nào đọc số dạng chữ: lead cùng số nhận ra bằng dấu vết `owner_phone_hash`
  (HMAC theo sàn của hàng 62, migration 009 cho bảng leads). Vì vậy 011 đứng sau 009: phần cơ sở dữ liệu của hàng 25
  dựng và đo khi 62 đã gộp vào nhánh chính.

## 3. Lõi (`packages/core/src/routing/`)

- `DEFAULT_LEAD_ROUTING` — mặc định của sàn, chỗ khai duy nhất: `zone_round_robin`, 15 phút nhận, 30 phút gọi, lời báo cho
  trưởng nhóm. `ROUTING_STRATEGIES`, `ALERT_AUDIENCES` — thực đơn; `DEADLINE_MINUTES` — khoảng 1..1440 phút.
- `LEAD_ROUTING_KEYS`, `readLeadRoutingSettings(rows)` (khoá vắng → mặc định, giá trị hỏng → ném),
  `applyLeadRoutingPatch(current, input)` (bốn khoá, thực đơn, khoảng phút, hạn gọi không ngắn hơn hạn nhận).
- `STRATEGIES` — giao diện chiến lược: mỗi mục có `pick(lead, candidates)` và `unroutedAlert` («now» hay «after_accept»).
  Thêm cách chia mới là thêm một mục và một bảng ca.
- `chooseAgent(lead, candidates, strategy)` — luật chủ trùng trước, rồi `STRATEGIES[strategy].pick`.
- `unroutedDue(lead, now)`, `dueAlerts(fact, now)` — xét «chưa chia được» và hai hạn theo dấu của lead.
- `poolVisibleTo(lead, candidate)` — ai thấy và nhận được lead kho chung: đầu chủ không nghỉ phụ trách toà.
- `sameBuilding(zoneName, buildingName)` — khu khớp toà khi tên bằng nhau sau khi bỏ khoảng trắng thừa, chuẩn hoá Unicode,
  không phân hoa thường.

## 4. API (`packages/api/src/routing/`, `packages/api/src/jobs/`)

| Lối | Ai | Làm gì |
| --- | --- | --- |
| `GET /api/v1/company/settings/lead-routing` | mọi thành viên | cấu hình đang chạy (mặc định nếu chưa đặt) |
| `PUT /api/v1/company/settings/lead-routing` | quản trị sàn | đổi một phần; lõi kiểm trên cấu hình đã lưu ghép phần đổi (hạn gọi không ngắn hơn hạn nhận); áp cho lead chưa đóng dấu |
| `POST /api/v1/leads/{id}/accept` | đầu chủ lead đã về | ghi `accepted_at`; không phải lead của mình → 404; đã nhận → 409 |
| `POST /api/v1/leads/{id}/first-call` | đầu chủ lead đã về | ghi `first_called_at` (và `accepted_at` nếu còn trống); đã ghi → 409 |
| `GET /api/v1/lead-pool` | đầu chủ | lead kho chung chưa ai nhận ở toà mình phụ trách — không chủ nhà, không số |
| `POST /api/v1/leads/{id}/claim` | đầu chủ không nghỉ | nhận lead kho chung; đã có người → 409 |
| `POST /api/v1/leads/{id}/assign` | trưởng nhóm | giao lead không trùng (chờ chia — kể cả kho chung, chia tay — hay đã chia) hay lead chủ trùng cho một đầu chủ; mốc hạn bắt đầu lại, nhận và gọi xoá |
| `PUT /api/v1/company/members/{userId}/leave` | chính người đó, trưởng nhóm, quản trị | `{ onLeave }` |
| `GET /api/v1/lead-alerts` | trưởng nhóm (và quản trị nếu sàn chọn) | lời báo mới nhất trước: loại, toà, căn, tên đầu chủ, mốc — không số chủ |
| `POST /api/v1/jobs/lead-tick` | bên gọi có khoá | một nhịp cho từng sàn: đóng dấu, chia, xét hạn; trả số đếm |

Lối việc nền: `Authorization: Bearer <JOB_SECRET>`; máy chủ thiếu khoá → 503, sai khoá → 401. Một nhịp = với mỗi sàn của
`app.lead_job_companies()`, một giao dịch dưới ngữ cảnh sàn ấy (vai `quy_hang_app`, luật theo dòng vẫn áp): đọc cấu hình
(lõi điền mặc định), đóng dấu lead mới, lấy hàng chờ, lõi chọn người theo dấu từng lead (cập nhật số đã chia và lead đang
mở trong nhịp, lead cùng `owner_group` về cùng người), ghi; rồi lấy dữ kiện hạn, lõi xét, ghi báo. Chạy lại cùng lúc không
chia lại, không báo trùng. `runLeadTick(pool, now)` nhận đồng hồ để bộ kiểm đặt mốc 14:59 / 15:00 mà không sửa dòng.

## 5. Phương án đã cân

- **Chia ngay lúc nhập** (trong giao dịch `POST /leads`): nhanh hơn nhưng đổi câu «Không trùng — lead chờ chia» đã ký ở
  hàng 24, đụng `packages/api/src/leads/**` mà dãy G đang sửa (hàng 62), và vẫn cần nhịp để thử lại lead chưa chia được.
  Chọn chia trong nhịp: đúng câu giao «trong một phút».
- **Cột người nhận mới** (`assigned_agent_user_id`): nghĩa sạch hơn nhưng phải sửa thân `app.lead_dedupe_facts` và luật
  đọc `leads` — chồng đúng chỗ hàng 62 đổi. Chọn dùng lại `matched_agent_user_id` kèm chú thích nghĩa mới.
- **Vòng tròn theo thời gian chia**: hai lead chia trong cùng nhịp mang cùng mốc giờ nên hoà; dùng số tăng dần `routed_seq`.
- **Một luật cứng** (bản trước của hàng, chỉ theo khu lần lượt): chủ kho 1/11 bác — chủ sàn chưa chắc cách nào tốt nhất.
  Chọn thực đơn năm cách chia trong lõi, mỗi cách một chiến lược có bảng ca.
- **Kịch bản chia do sàn viết**: mềm nhất nhưng không kiểm được trước và mở đường cho luật lách bất biến. Không làm.
- **Áp cấu hình mới cho mọi lead đang chờ**: đơn giản hơn nhưng trái «đổi chỉ áp cho lead mới» của hàng 48. Chọn đóng dấu.
- **Cột cấu hình trên bảng sàn**: mỗi cấu hình mới một migration, sổ điểm biến thiên gom lại từng cột. Chọn bảng khoá–giá
  trị `company_settings`.

## 6. Câu chỉ người có (Hỏi ở Cổng Phạm vi)

- **Hỏi-1 — nhịp mỗi phút trên bản thật** (tốn tiền, luật 23): (a) lịch `pg_cron` + `pg_net` của Supabase gói đang dùng
  gọi lối việc nền mỗi phút — không tốn thêm; (b) kiểm quá hạn lúc có người mở app — không tốn, nhưng không ai mở thì
  không ai được báo, trượt hạn «sai số một phút»; (c) lịch mỗi phút của Vercel Pro — tốn gói trả phí, đúng Kiến trúc §5.
  Khuyến nghị (a). Mã của hàng không phụ thuộc bên gọi; bật lịch trên bản thật là bước vận hành của chủ kho sau gộp.
  Nguồn (đọc 31/10 qua công cụ Supabase): tổ chức «OneHub's Org» gói Pro; dự án `quy-hang` có sẵn `pg_cron` 1.6.4 và
  `pg_net` 0.20.4, chưa bật; Supabase Cron chạy từ mỗi giây tới mỗi năm (https://supabase.com/docs/guides/cron).
  Khoá `JOB_SECRET` là bí mật: chủ kho đặt ở Vercel (máy chủ kiểm) và ở Supabase (lịch gửi kèm) — giám sát và máy không
  đặt. ADR-0017 ghi hướng dẫn từng bước cho chủ kho.
- **Hỏi-2 — toà không có đầu chủ phụ trách** (hay mọi người đều nghỉ): khuyến nghị lead chờ, báo trưởng nhóm «chưa chia
  được», trưởng nhóm chia tay. Lối khác: chia cho mọi đầu chủ đang làm của sàn — lead không chờ, nhưng về người không
  biết toà.
- **Hỏi-3 — lead chủ trùng có tính hạn không**: khuyến nghị có — lead đã về một đầu chủ thì đầu chủ ấy phải nhận và gọi
  như lead được chia. Lối khác: chỉ lead được chia.
- **Hỏi-6 — «trưởng nhóm được báo» tới đâu ở hàng này**: khuyến nghị lời báo ghi trong app, đọc qua API; màn là
  hàng 42; đẩy lên điện thoại trưởng nhóm thì giám sát nới câu giao hàng 26 (đang chỉ nói đầu chủ). Lối khác: hàng 25 tự
  đẩy lên máy — kéo phần thông báo vào hàng này.
- **Hỏi-5 — mặc định của sàn là cách chia nào** (khi sàn chưa chọn): khuyến nghị theo khu phụ trách, lần lượt. Lối khác:
  theo khu ít lead đang mở (đỡ dồn việc); kho chung (nhanh tay được, cần màn kho chung ở hàng 22); chia tay (trưởng nhóm
  thành điểm nghẽn).
- **Hỏi-4 — ai đánh dấu nghỉ**: khuyến nghị chính người đó, trưởng nhóm, quản trị sàn. Lối khác: chỉ trưởng nhóm và quản
  trị.

- **Hỏi-7 — hai cách chia mới chạm thu nhập đầu chủ**: khuyến nghị kho chung theo khu (chỉ đầu chủ phụ trách toà thấy và
  nhận), «tải» = lead đã về, chưa bỏ, chưa gọi lần đầu, xét trong khu. Lối khác: kho chung toàn sàn; tải toàn sàn; tải =
  lead chưa nhận hay lead về trong N ngày.

## 7. Bất biến chạm

1. Cách ly: ba bảng mới (`company_settings`, `member_availability`, `lead_alerts`) bật và ép luật theo dòng; mọi hàm definer lọc theo sàn đang làm, trừ `app.lead_job_companies`
   chỉ trả mã sàn. Bộ kiểm cách ly thêm ca.
2. Chủ nhà không rời công ty: lời báo, danh sách báo, kho chung và kết quả nhịp không mang số chủ; vai API vẫn không đọc
   `leads.owner_phone`.
3. Người bấm gửi: lời báo chỉ nằm trong app cho trưởng nhóm; hàng không gửi tin.
