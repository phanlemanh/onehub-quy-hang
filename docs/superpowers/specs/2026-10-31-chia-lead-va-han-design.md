# Thiết kế — Chia lead và hạn (hàng 25, T3)

Hàng 25 của lộ trình (dãy L, đợt `dau-chu-dong-vao`), đứng trên hàng 24 (ô nhận lead, ADR-0012). Câu giao: «Lead không
trùng được chia theo luật của sàn trong một phút; quá 15 phút chưa nhận hay 30 phút chưa gọi thì trưởng nhóm được báo».
Luật 20 của Tham chiếu §8. Hạng T3: hàng thêm cột, bảng và hàm ở cơ sở dữ liệu (`packages/db/**` thuộc `t3_paths`),
migration `011_chia_lead_va_han.sql` và ADR-0017 do giám sát giữ chỗ (L-8).

## 1. Hàng làm gì

1. **Chia**: mỗi nhịp, lead `new` chưa có người nhận được chia cho một đầu chủ theo luật mặc định của sàn — đầu chủ
   phụ trách toà của lead, không đang nghỉ, người lâu chưa được chia nhất. Không ai nhận được thì lead chờ và trưởng nhóm
   được báo «chưa chia được» một lần; nhịp sau thử lại.
2. **Hạn**: lead đã về một đầu chủ (chia, hay khớp chủ trùng lúc nhập) mà quá 15 phút chưa nhận, hay quá 30 phút chưa gọi
   lần đầu, thì trưởng nhóm được báo — một lời báo cho mỗi loại hạn của mỗi lần giao.
3. **Ghi mốc**: đầu chủ nhận lead và ghi đã gọi lần đầu; trưởng nhóm chia tay một lead (giao lại) và xem danh sách báo; một
   người được đánh dấu nghỉ hay đi làm lại.
4. **Nhịp**: một lối việc nền có khoá bí mật, ai gọi mỗi phút cũng được. Bên gọi trên bản thật là câu Hỏi-1.

Hàng KHÔNG đưa thông báo lên điện thoại hay máy tính (hàng 26; phần của trưởng nhóm — Hỏi-6), không dựng màn (Hôm nay hàng 22, theo dõi lead hàng 27,
cuộc gọi hàng 28, Hôm nay của trưởng nhóm hàng 42), không làm Cài đặt sàn (luật chia và hạn chỉnh được ở hàng Cài đặt sàn, P1).

## 2. Dữ liệu (migration 011)

- `leads` thêm `routed_at` (lần giao gần nhất bằng máy hay trưởng nhóm), `routed_seq` (số tăng dần cấp lúc chia — thứ tự «lâu chưa được chia»), `accepted_at`,
  `first_called_at`. Người nhận của lead `new` sau khi chia ghi vào cột có sẵn `matched_agent_user_id`: cột này nghĩa là
  «đầu chủ lead đã về» — khớp chủ trùng lúc nhập hay được chia. Nhờ vậy ba chỗ của hàng 24 tự đúng mà không sửa:
  vế «lead trước cùng số đã về một đầu chủ» của `app.lead_dedupe_facts` (ADR-0012: «hàng 25 chia lead cùng số cho cùng
  người»), luật đọc «đầu chủ được khớp thấy lead về mình», và tên đầu chủ trong bản của telesales. Ràng buộc
  `leads_new_has_no_match` thay bằng: lead `new` không khớp hàng; lead `new` có người nhận khi và chỉ khi có `routed_at`.
  Thân hàm dữ kiện của hàng 62 không bị đụng.
- `member_availability (company_id, user_id, on_leave, changed_by, changed_at)` — khoá ngoại đôi về `company_members`.
  Đọc: cả sàn. Ghi: chính người đó, trưởng nhóm, quản trị sàn.
- `lead_alerts (id, company_id, lead_id, kind, agent_user_id, deadline_from, raised_at)`, `kind` ∈ `unrouted`,
  `accept_overdue`, `first_call_overdue`; duy nhất theo `(company_id, lead_id, kind, deadline_from)` — mỗi lần giao một
  lời báo mỗi loại. Đọc: trưởng nhóm của sàn. Không cấp ghi cho vai API.
- Hàm security definer, mọi hàm gói trong `app.current_company_id()`:
  - `app.lead_routing_queue()` — lead chờ chia, cũ trước, kèm `prior_agent`: đầu chủ của lead trước cùng số đã về người.
  - `app.lead_routing_candidates()` — thành viên có vai đầu chủ, tên khu phụ trách, đang nghỉ hay không, ngày vào sàn,
    `routed_seq` lớn nhất đã nhận.
  - `app.route_lead(lead, agent, now)` — chỉ lead `new` chưa có người, chưa bỏ, người nhận là đầu chủ của sàn.
  - `app.lead_deadline_facts()` — lead đã về người, chưa bỏ: mốc bắt đầu hạn (`routed_at` hay `created_at`), mốc nhận, mốc
    gọi, loại báo đã có cho mốc ấy.
  - `app.raise_lead_alert(lead, kind, from, now)` — chèn, trùng thì bỏ qua.
  - `app.accept_lead`, `app.mark_first_call`, `app.reassign_lead` — mỗi ca một mã lỗi (như `app.discard_lead`).
  - `app.lead_job_companies()` — mã các sàn có lead chờ chia hay lead còn hạn mở; chỉ trả mã, không dữ liệu nào khác.
    Đây là hàm duy nhất không đọc sàn đang làm: nhịp chạy không có sàn.
- Số chủ không ra khỏi hàm nào: hàm chia so số trong cơ sở dữ liệu, trả mã người.

## 3. Lõi (`packages/core/src/routing/`)

- `DEFAULT_LEAD_DEADLINES = { acceptMinutes: 15, firstCallMinutes: 30 }` — mặc định của luật 20.
- `sameBuilding(zoneName, buildingName)` — khu khớp toà khi tên bằng nhau sau khi bỏ dấu cách thừa, chuẩn hoá Unicode
  và không phân hoa thường. Khu là «toà hay phân khu do sàn tự đặt tên» (CONTEXT); bộ mẫu đặt khu «Toà A» trùng tên toà
  «Toà A» của danh mục.
- `chooseAgent(lead, candidates)` → người nhận hay lý do không chia được. Thứ tự: (a) đầu chủ của lead trước cùng số, nếu
  còn là đầu chủ và không nghỉ; (b) đầu chủ phụ trách toà, không nghỉ — người có `routed_seq` nhỏ nhất (chưa nhận lần nào
  đứng đầu), hoà thì người vào sàn trước, rồi mã người.
- `dueAlerts(fact, now, deadlines)` → các loại báo đến hạn: chưa nhận và `now ≥ từ + 15 phút` → `accept_overdue`; chưa gọi và
  `now ≥ từ + 30 phút` → `first_call_overdue`; loại đã báo cho mốc ấy thì bỏ.

## 4. API (`packages/api/src/routing/`, `packages/api/src/jobs/`)

| Lối | Ai | Làm gì |
| --- | --- | --- |
| `POST /api/v1/leads/{id}/accept` | đầu chủ lead đã về | ghi `accepted_at`; không phải lead của mình → 404; đã nhận → 409 |
| `POST /api/v1/leads/{id}/first-call` | đầu chủ lead đã về | ghi `first_called_at` (và `accepted_at` nếu còn trống); đã ghi → 409 |
| `POST /api/v1/leads/{id}/assign` | trưởng nhóm | giao lead không trùng (chờ chia hay đã chia) hay lead chủ trùng cho một đầu chủ của sàn; mốc hạn bắt đầu lại, nhận và gọi xoá |
| `PUT /api/v1/company/members/{userId}/leave` | chính người đó, trưởng nhóm, quản trị | `{ onLeave }` |
| `GET /api/v1/lead-alerts` | trưởng nhóm | lời báo mới nhất trước: loại, toà, căn, tên đầu chủ, mốc — không số chủ |
| `POST /api/v1/jobs/lead-tick` | bên gọi có khoá | một nhịp: chia rồi xét hạn cho từng sàn; trả số đếm |

Lối việc nền: `Authorization: Bearer <JOB_SECRET>`; máy chủ thiếu khoá → 503, sai khoá → 401. Một nhịp = với mỗi sàn của
`app.lead_job_companies()`, một giao dịch dưới ngữ cảnh sàn ấy (vai `quy_hang_app`, luật theo dòng vẫn áp): lấy hàng chờ,
lõi chọn người, ghi; rồi lấy dữ kiện hạn, lõi xét, ghi báo. Chạy lại cùng lúc không chia lại, không báo trùng.
`runLeadTick(pool, now)` nhận đồng hồ để bộ kiểm đặt mốc 14:59 / 15:00 mà không sửa dòng.

## 5. Phương án đã cân

- **Chia ngay lúc nhập** (trong giao dịch `POST /leads`): nhanh hơn nhưng đổi câu «Không trùng — lead chờ chia» đã ký ở
  hàng 24, đụng `packages/api/src/leads/**` mà dãy G đang sửa (hàng 62), và vẫn cần nhịp để thử lại lead chưa chia được.
  Chọn chia trong nhịp: đúng câu giao «trong một phút».
- **Cột người nhận mới** (`assigned_agent_user_id`): nghĩa sạch hơn nhưng phải sửa thân `app.lead_dedupe_facts` và luật
  đọc `leads` — chồng đúng chỗ hàng 62 đổi. Chọn dùng lại `matched_agent_user_id` kèm chú thích nghĩa mới.
- **Vòng tròn theo thời gian chia**: hai lead chia trong cùng nhịp mang cùng mốc giờ nên hoà; dùng số tăng dần `routed_seq`.

## 6. Câu chỉ người có (Hỏi ở Cổng Phạm vi)

- **Hỏi-1 — nhịp mỗi phút trên bản thật** (tốn tiền, luật 23): (a) lịch `pg_cron` + `pg_net` của Supabase gói đang dùng
  gọi lối việc nền mỗi phút — không tốn thêm; (b) kiểm quá hạn lúc có người mở app — không tốn, nhưng không ai mở thì
  không ai được báo, trượt hạn «sai số một phút»; (c) lịch mỗi phút của Vercel Pro — tốn gói trả phí, đúng Kiến trúc §5.
  Khuyến nghị (a). Mã của hàng không phụ thuộc bên gọi; bật lịch trên bản thật là việc vận hành sau gộp.
- **Hỏi-2 — toà không có đầu chủ phụ trách** (hay mọi người đều nghỉ): khuyến nghị lead chờ, báo trưởng nhóm «chưa chia
  được», trưởng nhóm chia tay. Lối khác: chia cho mọi đầu chủ đang làm của sàn — lead không chờ, nhưng về người không
  biết toà.
- **Hỏi-3 — lead chủ trùng có tính hạn không**: khuyến nghị có — lead đã về một đầu chủ thì đầu chủ ấy phải nhận và gọi
  như lead được chia. Lối khác: chỉ lead được chia.
- **Hỏi-6 — «trưởng nhóm được báo» tới đâu ở hàng này**: khuyến nghị lời báo ghi trong app, đọc qua API; màn là
  hàng 42; đẩy lên điện thoại trưởng nhóm thì giám sát nới câu giao hàng 26 (đang chỉ nói đầu chủ). Lối khác: hàng 25 tự
  đẩy lên máy — kéo phần thông báo vào hàng này.
- **Hỏi-5 — nhiều đầu chủ cùng một toà**: khuyến nghị chia đều theo vòng (lâu chưa được chia nhất nhận trước). Lối khác:
  mọi người phụ trách cùng thấy lead, ai nhận trước được — cần màn nhận chung, hạn tính cho cả nhóm.
- **Hỏi-4 — ai đánh dấu nghỉ**: khuyến nghị chính người đó, trưởng nhóm, quản trị sàn. Lối khác: chỉ trưởng nhóm và quản
  trị.

## 7. Bất biến chạm

1. Cách ly: hai bảng mới bật và ép luật theo dòng; mọi hàm definer lọc theo sàn đang làm, trừ `app.lead_job_companies`
   chỉ trả mã sàn. Bộ kiểm cách ly thêm ca.
2. Chủ nhà không rời công ty: lời báo, danh sách báo và kết quả nhịp không mang số chủ; vai API vẫn không đọc
   `leads.owner_phone`.
3. Người bấm gửi: lời báo chỉ nằm trong app cho trưởng nhóm; hàng không gửi tin.
