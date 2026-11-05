# Bảng quyền thao tác × vai, bắt đầu từ hàng (G1, hàng vá bang-quyen-theo-vai) — thiết kế

Ngày: 2026-11-05 · Hồ sơ: `_acceptance/bang-quyen-theo-vai/` · Hạng T3 (migration 046, luật theo dòng) · Dãy Q, đợt
dau-khach-nhap · Nguồn: chỗ hở G1 (kèm G7 phần hàng) của `docs/plan/ra-soat-crud-phan-quyen.md` (PR #139); chủ kho
05/11 «Mở G1 ngay», đọc §12 31/10 «mọi thành viên sàn sửa được» là «mọi thành viên có Bảng hàng» (luật 74 của đợt).

## 1. Lỗ

- **Sửa hàng không kiểm vai.** `listings/store.ts:185-244` (`applyCommand`) chỉ xét trục ai thấy hàng (`canRead`). Hàng
  «Toàn sàn» thì Telesales và Quản trị sàn — hai vai không có nhà Bảng hàng (`core/navigation.ts` `HOMES`) — đọc, đổi giá,
  phí, trạng thái và gắn mã căn được qua API. Lệch luật 21 («Telesales thấy kết quả của lead, không thấy hàng») và bảng nhà
  theo vai ở §9.
- **Đưa lên «Đang bán» lệch giữa màn và API.** Nút «Sẵn sàng bán» của hồ sơ căn theo cờ `lopPhuHoSo(...).sanSang`
  (`core/access/lop-phu-ho-so.ts`): trưởng nhóm, đầu chủ giữ căn, đầu chủ khi căn chưa ai giữ. Ô Trạng thái của Bảng hàng
  (`inventory/cell-edit/lenh.ts` `nacTrangThai`) và API nhận `status_changed → Active` từ mọi người đọc được hàng, kể cả
  Đầu khách.
- **Luật theo dòng của hàng chỉ cách ly công ty** (`004:21-24,78-82`): kho dữ liệu không xét vai ở `listings` và
  `listing_events` (G7 phần hàng).
- **Quyền không có một chỗ chung.** Mỗi mô-đun API tự so tên vai. Chỉ «ai thấy nguồn» có bảng kỳ vọng
  (`core/access/bang-xem-nguon.json`).

## 2. Hướng

Một **bảng quyền thao tác × vai ở lõi**, viết trước, theo đúng hình `bang-xem-nguon.json`:
`packages/core/src/access/bang-quyen-hang.json`. Mỗi dòng là một ca người (vai, kiêm vai, quan hệ với căn), mỗi cột là
một thao tác với hàng, mỗi ô là kỳ vọng ✓/✗. Hàng này chỉ phủ thao tác với hàng («Trước hết» của câu giao); G2–G6 thêm
cột hay bảng cùng khuôn khi mở.

Bốn thao tác:

| Thao tác (khoá) | Gồm | Ai được |
| --- | --- | --- |
| Xem hàng (`xem`) | `GET /listings`, `GET /listings/{id}` | Có một trong ba vai của Bảng hàng: Đầu chủ, Đầu khách, Trưởng nhóm — rồi mới tới trục «Chỉ tôi / Toàn sàn» như cũ |
| Tạo hàng (`tao`) | `POST /listings` (lead → hàng và nhập file đi qua cùng cửa) | Như trên |
| Sửa hàng (`sua`) | mọi lệnh `POST /listings/{id}/events` trừ đưa lên Đang bán: giá kèm phí, trạng thái khác, chi tiết, xác nhận chủ, gắn mã căn | Như trên (đọc lại §12 31/10) |
| Đưa lên Đang bán (`dua_len_dang_ban`) | `status_changed` với `to = Active` | Trưởng nhóm; Đầu chủ giữ căn; Đầu chủ khi căn chưa ai giữ — đúng cờ «Sẵn sàng bán» |

Bảng ca người (dòng) — 14 ca, mỗi ca 4 ô, tổng 56 ô:

| Ca | xem | tao | sua | dua_len_dang_ban |
| --- | --- | --- | --- | --- |
| Telesales | ✗ | ✗ | ✗ | ✗ |
| Telesales từng giữ căn (mất vai Đầu chủ) · giữ căn | ✗ | ✗ | ✗ | ✗ |
| Quản trị sàn | ✗ | ✗ | ✗ | ✗ |
| Đầu chủ · giữ căn | ✓ | ✓ | ✓ | ✓ |
| Đầu chủ · căn chưa ai giữ | ✓ | ✓ | ✓ | ✓ |
| Đầu chủ · người khác giữ | ✓ | ✓ | ✓ | ✗ |
| Đầu chủ từng giữ, căn đã đổi sang người khác | ✓ | ✓ | ✓ | ✗ |
| Đầu khách | ✓ | ✓ | ✓ | ✗ |
| Đầu khách · căn chưa ai giữ | ✓ | ✓ | ✓ | ✗ |
| Đầu khách (từng giữ, mất vai Đầu chủ) · giữ căn | ✓ | ✓ | ✓ | ✗ |
| Trưởng nhóm · người khác giữ | ✓ | ✓ | ✓ | ✓ |
| Quản trị sàn kiêm Đầu chủ · giữ căn | ✓ | ✓ | ✓ | ✓ |
| Telesales kiêm Trưởng nhóm · người khác giữ | ✓ | ✓ | ✓ | ✓ |
| Telesales kiêm Đầu khách | ✓ | ✓ | ✓ | ✗ |

Ô «xem» nói về hàng «Toàn sàn». Trục «Chỉ tôi» giữ nguyên ở lõi và API (`core/visibility`, hàng 12) và đứng sau ô này:
người có vai Bảng hàng vẫn chỉ đọc hàng «Chỉ tôi» của chính mình.

### 2.1 Lõi

- `packages/core/src/access/quyen-hang.ts`: `THAO_TAC_HANG`, `VAI_BANG_HANG = ["listing_agent", "buyer_agent",
  "team_lead"]`, `lamViecVoiHang(viewer)` và `duocLamVoiHang(viewer, thaoTac, listingAgentUserId)`. Đưa lên Đang bán đọc
  cùng một luật với cờ `sanSang`: `lopPhuHoSo` gọi hàm này, không tự viết lại.
- `access.test.ts` thêm bài đọc `bang-quyen-hang.json` và so từng ô (56 assert), kèm cặp hai chiều: đổi một ô trong bản
  sao bảng → bài đỏ nêu tên ca và thao tác.

### 2.2 API (`packages/api/src/listings/**`)

- `routes.ts`: người không có vai Bảng hàng → `GET /listings` trả `[]`, `GET /listings/{id}`, `POST /listings/{id}/events`
  và `POST /listings` trả `404 not-found` — «không có hàng này», cùng câu với hàng «Chỉ tôi» của người khác. Xét vai TRƯỚC
  trục ai thấy hàng và trước phiên bản, để mã lỗi không lộ hàng có thật.
- `store.ts` `applyCommand`: lệnh `status_changed → Active` của người không đủ cờ → `403 listing-agent-required`
  (mã đã có; màn đã có câu báo), không sự kiện nào. `createListing` nhận người đang làm và từ chối người không có vai — lead
  → hàng (`leads/store.ts`) và nhập file đi qua cùng cửa, nên luật nằm một chỗ.

### 2.3 Luật theo dòng — migration `046_bang_quyen_hang.sql`

- Hàm `app.works_listings()` (security definer, `search_path = ''`): người đang làm có một trong ba vai Bảng hàng ở sàn
  đang làm.
- Hàm `app.can_activate_listing(uuid)` (security definer): `'team_lead' ∈ vai` HOẶC (`'listing_agent' ∈ vai` VÀ (dòng gán
  mới nhất của căn là người đang làm HOẶC căn chưa có dòng gán nào)). Ngoặc đúng như vậy: Đầu khách với căn chưa ai giữ
  không qua; Đầu chủ từng giữ mà dòng gán mới nhất đã là người khác không qua. Lõi viết cùng một hình.
- Thay năm luật: `listings_read/insert/update`, `listing_events_read/insert` thêm `app.works_listings()`;
  `listing_events_insert` thêm: sự kiện `status_changed` với `to = Active` thì `app.can_activate_listing(listing_id)`.
- Hàm `security definer` của các hàng trước (kiểm trùng lead, mốc lên bảng của telesales, trang khách, Lần gửi…) chạy bằng
  vai chủ hàm, bỏ qua luật theo dòng (local superuser; thật `quy_hang_owner` bypassrls — ghi ở 013) nên không đổi.
- Trục «Chỉ tôi» vẫn không xuống cơ sở dữ liệu (quyết định của hàng 12, `truc-ai-thay-hang`): hàng này chỉ thêm trục vai.

### 2.4 Màn (`inventory/cell-edit/**`)

- `nacTrangThai(trangThai, duaLenDangBan)` — tham số thứ hai bắt buộc, không mặc định, để kiểm kiểu bắt mọi chỗ gọi quên
  truyền cờ — bỏ nấc «Đang bán» khi người không đủ cờ; `dungLenhTrangThai` từ chối `Active`
  với câu «Chỉ đầu chủ giữ căn hay trưởng nhóm đưa lên Đang bán» trước khi gửi. Cờ lấy từ lõi (`duocLamVoiHang`) với
  người đang đăng nhập (`bd.me()`) và người giữ căn của dòng (`listAgentKey`) — không rẽ theo tên vai ở màn.

- Trang `/inventory` (`page.tsx`, xin chạm Q-4): người không có vai Bảng hàng (`lamViecVoiHang` của lõi) gõ thẳng địa chỉ thì
  về `/today` — chỗ tài liệu rà soát §5 gộp vào G1.

### 2.5 Tài liệu

- Sổ điểm biến thiên phần C thêm **K28** «Ai làm gì với hàng: bảng quyền thao tác × vai» trỏ `access/bang-quyen-hang.json`
  (giám sát duyệt chạm tệp, Q-1).
- Tham chiếu: §6 thêm một dòng «Quyền thao tác theo vai một bảng ở lõi»; §12 thêm dòng 05/11 đọc lại dòng 31/10.

## 3. Đường đang sống phải còn chạy

| Đường | Ai chạy | Vì sao còn chạy |
| --- | --- | --- |
| Lead → hàng (`createListingFromLead`) | Đầu chủ của lead | Có vai Đầu chủ |
| Nhập file, hoàn tác lần nhập | Đầu chủ, Trưởng nhóm | Có vai Bảng hàng; lần nhập không đưa lên Đang bán (`nhap-hoan-tac`) |
| Kiểm trùng lúc telesales nhập lead | Telesales | Hàm `security definer` (007, 016) |
| Mốc lên bảng ở «Lead của tôi» | Telesales | `app.lead_board_dates` (015), `security definer` |
| Trang khách, «Quan tâm» | Khách, chạy trong phiên người gửi | Người gửi là Đầu khách hay Trưởng nhóm |
| Đổi đầu chủ hàng loạt | Trưởng nhóm | Hàm `security definer` (027) |

Bài kiểm có sẵn nào tạo hàng bằng người chỉ giữ vai Quản trị sàn (người mở sàn trong bộ kiểm) thì người ấy nhận thêm vai
Bảng hàng ở chính bài đó — xem sổ quyết định (đo ở S1, mục 6).

## 4. Ngoài phạm vi

- Bảng quyền cho lead, liên hệ, nhu cầu khách, Lần gửi, vùng, cấu hình (G2–G6 thêm khi mở).
- Bảng thoả thuận (G7 phần hai) — hàng vá riêng của dãy nền.
- Đổi trục «Chỉ tôi» xuống cơ sở dữ liệu.

## 5. Đối chiếu ngành (ADR-0022)

| Năng lực | RESO | Keller Williams Command | Follow Up Boss | Ta định làm gì | Ta viết cứng — họ cho cấu hình |
| --- | --- | --- | --- | --- | --- |
| Ai làm gì với hàng theo vai | Không định nghĩa quyền theo vai; `ListAgentKey` là người giữ hàng | Ba nấc quyền cố định theo ứng dụng — Standard, Enhanced, Unlimited; người quản đội gán nấc cho từng người ([Team Permission Levels](https://answers.kw.com/hc/en-us/articles/360052475813-Team-Permission-Level-Details)) | Vai cố định Owner, Admin, Agent, Lender; Agent chỉ thấy, sửa phần được giao ([Users, Roles & Permissions](https://help.followupboss.com/hc/en-us/articles/4402370636567-Users-Roles-Permissions)) | Bảng quyền cố định ở lõi, đọc năm vai cố định (ADR-0006); quản trị sàn gán vai cho từng người như nay | Cả hai sản phẩm cố định nghĩa của nấc, vai; chỉ cho gán nấc, vai theo người — đúng như ta. Chưa kiểm: Follow Up Boss có cờ riêng từng người cho quyền sửa hàng hay không. Ta giữ cứng, lý do **quyền và an toàn** (K28) — Hỏi-2 |
| Người giữ hàng | `ListAgentKey` | Người giữ cơ hội (assignee) | Người được giao lead | Cột «giữ căn» đọc dòng gán mới nhất của `listing_agent_assignments` | Không lệch |

Không sản phẩm nào cho một vai không làm việc với hàng sửa hàng (`docs/plan/ra-soat-crud-phan-quyen.md` §4).

## 6. Đo trước khi chốt

Đo ngày 05/11 trên Postgres riêng của dãy Q (`quy-hang-db-dkn-Q`, cổng 5577), bản nháp luật theo dòng ngoài kho áp sau
migration 038:

| Bộ kiểm | Trước | Bật trục vai | Thêm luật «Đang bán» |
| --- | --- | --- | --- |
| Cách ly (`packages/db/tests`) | 143/143 | 140/143 | — |
| API trên Postgres (`packages/api/test-db`) | 433/433 | 413/433 | 413/433 (không thêm bài đỏ) |
| Đồng bộ của màn (`apps/web/src/lib/sync/test-db`) | — | 22/23 | — |

Mọi bài đỏ cùng một nguyên nhân: người tạo hàng trong bài là người mở sàn, chỉ giữ vai Quản trị sàn — đúng ca vòng này
chặn. Ba bài cách ly nằm trong vùng của hàng. Sáu tệp ngoài vùng (20 bài API ở `listings.test.ts` 12, `owners.test.ts` 4,
`doi-gia-da-ban` 2, `ngay-ban` 1, `goi-ep-gia-dot-hai` 1; 1 bài đồng bộ `doi-gia-da-ban.db-test.mts`) sửa bằng cách cho người
ấy thêm một vai Bảng hàng ngay trong bài — Đầu chủ khi bài đưa hàng lên Đang bán, Đầu khách khi không — không đổi điều bài
kiểm (xin chạm tệp Q-3). Không đường đang sống nào khác đỏ: kiểm trùng lead, mốc lên bảng của telesales, trang khách, Lần
gửi, nhập và hoàn tác, đổi đầu chủ đều xanh (hàm `security definer`).
