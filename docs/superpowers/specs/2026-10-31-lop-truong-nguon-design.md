# Lớp trường nguồn — thiết kế (hàng 11, dãy N, đợt nen-2)

Ngày 31/10/2026 · hạng T3 · hồ sơ `_acceptance/lop-truong-nguon/` · đứng trên hàng 8 (`loi-hang-va-su-kien`).

## Ý định

Đầu chủ giữ căn thấy chủ nhà, số điện thoại và giá đáy của căn mình; người khác trong sàn mở cùng hồ sơ thì không thấy,
và mỗi lần mở số chủ thành một sự kiện (Tham chiếu §6 «lớp trường»; bất biến 2). Hàng này dựng lõi — luật ở
`packages/core/src/access/`, lối API ở `packages/api/src/owners/`, bảng và luật theo dòng ở migration 006 — chưa có màn.

Căn cứ trong kho:

- Tham chiếu §6: «chủ nhà, số điện thoại, giá đáy, ảnh sổ chỉ đầu chủ giữ căn và trưởng nhóm thấy; không bao giờ ra
  ngoài sàn. Mỗi lần mở số chủ là một sự kiện» · «quản trị sàn không tự động thấy chủ nhà».
- Kiến trúc §1 «Thông tin chủ nhà nằm ở bảng riêng có luật chặt hơn, không là cột của hàng; mở số đi qua một cửa duy
  nhất có ghi sự kiện»; §5 «mở số qua một hàm duy nhất có ghi sự kiện».
- Sổ hàng 8 (`loi-hang-va-su-kien#d-20261030T233406Z-25`, lời người ở Cổng Phạm vi): gán đầu chủ cho hàng đi cùng hàng
  chủ nhà — tức hàng này.
- ADR-0009 §9: khoá mã hoá số chủ `OWNER_PHONE_KEY` sinh ở hàng dựng bảng chủ nhà (xem Hỏi-1).

## Phương án

### Ba vật mới trong cơ sở dữ liệu (migration `006_lop_truong_nguon.sql`)

| Bảng / hàm | Lớp dữ liệu | Ai đọc | Ai ghi |
|---|---|---|---|
| `listing_agent_assignments` (sàn, hàng, lần gán → người nhận, người gán, lúc gán; chỉ thêm — đầu chủ giữ căn là dòng mới nhất) | Nội bộ công ty | Mọi thành viên sàn | Đầu chủ tự nhận hàng chưa có đầu chủ (Hỏi-3); trưởng nhóm gán, gán lại |
| `listing_owners` (sàn, hàng → tên chủ, số chủ, giá đáy) | Nguồn | Đầu chủ giữ căn, trưởng nhóm — **trừ cột số chủ** | Đầu chủ giữ căn, trưởng nhóm |
| `owner_phone_reveals` (sàn, hàng, người mở, vai lúc mở, lúc mở) | Hành vi | Người mở thấy dòng của mình; trưởng nhóm thấy cả sàn | Chỉ hàm mở số |
| hàm `app.reveal_owner_phone(listing)` | — | — | Cửa duy nhất đọc số chủ: xét quyền, ghi một dòng `owner_phone_reveals`, trả số |

- Ba bảng bật và ép luật theo dòng theo sàn (bất biến 1), như mọi bảng của công ty.
- **Cột số chủ không cấp quyền đọc cho vai API** (`grant select (…)` theo cột, bỏ `owner_phone`): kể cả đầu chủ giữ căn
  cũng không `select owner_phone` được. Đường duy nhất ra số là hàm mở số, và hàm luôn ghi sự kiện trước khi trả — nên
  «mỗi lần mở số chủ thành đúng một sự kiện» do cơ sở dữ liệu giữ, không trông vào API.
- Bảng sự kiện mở số và bảng gán đầu chủ chỉ thêm (trigger chặn sửa, xoá, truncate như bảng sự kiện của hàng); vai API
  không có quyền `insert` thẳng vào bảng sự kiện mở số. Hàm mở số từ chối bằng một thông điệp ghim «không có quyền mở số
  chủ».
- Thêm ràng buộc `listing_events_no_source` vào bảng sự kiện của hàng: payload mang khoá lớp nguồn (`ownerName`,
  `ownerPhone`, `floorPrice`, `titleDeedPhoto`) bị cơ sở dữ liệu từ chối — lớp chặn thứ hai sau khuôn chặt của lõi.
- Hai hàm phụ `security definer` khoá `search_path`: `app.current_user_roles()` (vai của người đang làm ở sàn đang làm)
  và `app.can_see_source(listing)` (người đang làm là đầu chủ giữ căn có vai đầu chủ, hoặc là trưởng nhóm). Lõi và cơ sở
  dữ liệu được kiểm bằng CÙNG một bảng 12 ô viết tay (AC-2) — hai lớp không lệch nhau được mà không đỏ.

### Lõi `packages/core/src/access/` (lối con `@quy-hang/core/access`)

- `OWNER_FIELDS` — ba trường của hàng này (`ownerName`, `ownerPhone`, `floorPrice`), mỗi trường gắn lớp `source`; phép
  kiểm ghim rằng cả ba có trần `never_leaves_company` và nằm trong `SOURCE_KEYS` của lõi hàng.
- `canSeeSource(viewer, listingAgentUserId)` — đúng khi người xem là đầu chủ giữ căn (và còn vai đầu chủ) hoặc có vai
  trưởng nhóm; quản trị sàn, đầu khách, telesales, đầu chủ khác: sai. Cùng luật với `app.can_see_source` ở cơ sở dữ liệu.
- `ownerView(record, viewer)` — hồ sơ chủ nhà như API trả: thấy thì `{ visible: true, ownerName, floorPrice,
  hasPhone }` (không bao giờ có số, đầy đủ hay rút gọn); không thấy thì `{ visible: false, listingAgentUserId }` — đủ để
  màn sau hiện «Liên hệ đầu chủ», không một khoá nguồn nào ở bất kỳ cấp.
- `validateOwnerInput(payload)` — khuôn chặt: chỉ ba khoá trên, khoá lạ bị từ chối; số Việt Nam chuẩn hoá về 10 chữ số
  bắt đầu bằng 0 (nhận `+84`, `84`, dấu cách, chấm, gạch); giá đáy là số đồng nguyên dương.

### API `packages/api/src/owners/`

| Lời gọi | Việc |
|---|---|
| `GET /api/v1/listings/{id}/owner` | Hồ sơ chủ nhà qua `ownerView`. Hàng không ở sàn đang làm: 404 |
| `PUT /api/v1/listings/{id}/owner` | Đặt hay sửa tên, số, giá đáy. Hàng chưa có đầu chủ: người gọi có vai Đầu chủ thì thành đầu chủ giữ căn; không có vai Đầu chủ (kể cả trưởng nhóm không kiêm) thì 403 `listing-agent-required` — trưởng nhóm gán đầu chủ trước. Hàng đã có đầu chủ: chỉ người thấy nguồn sửa, người khác 403 |
| `POST /api/v1/listings/{id}/owner/phone-reveal` | Mở số chủ qua hàm `app.reveal_owner_phone`; mỗi lời gọi thành một sự kiện. Không thấy nguồn: 403, không sự kiện nào |
| `PUT /api/v1/listings/{id}/listing-agent` | Trưởng nhóm gán, gán lại đầu chủ giữ căn — thêm một dòng gán, dòng cũ giữ nguyên (người nhận phải có vai Đầu chủ ở sàn, sai thì 400). Khác trưởng nhóm, kể cả đầu chủ tự chuyển: 403 |

Mọi lời gọi qua `withCompany` như đường hàng của hàng 8 — chạy bằng vai `quy_hang_app`, luật theo dòng luôn áp. Ẩn ở
lõi và cơ sở dữ liệu, không ở giao diện (bất biến 4, luật đợt 18). Hai mã lỗi mới vào `API_ERRORS`:
`listing-agent-required` (403), `owner-not-set` (404 — mở số khi chưa có số).

## Lựa chọn và căn cứ

| Lựa chọn | Nguồn căn cứ |
|---|---|
| Bảng gán đầu chủ riêng, chỉ thêm, không phải sự kiện mới của hàng | Một lối: ghi vào `listing_events` làm tăng phiên bản hàng mỗi lần gán (lệnh sửa giá đang mở bị báo «đã có người sửa trước»); bảng ghi đè thì mất lịch sử ai giữ căn lúc số bị mở (phản biện F2) |
| Sự kiện mở số ở bảng riêng, không vào `listing_events` | Một lối: `listing_events.seq` là phiên bản của hàng — mở số làm tăng phiên bản, đầu chủ đang sửa giá bị báo «đã có người sửa trước» |
| Mở số qua một hàm cơ sở dữ liệu, cột số không cấp quyền đọc | Mục tiêu: Kiến trúc §5 «mở số qua một hàm duy nhất có ghi sự kiện» |
| Người giữ căn = đầu chủ đặt chủ nhà đầu tiên; trưởng nhóm gán lại; đầu chủ không tự chuyển | Chỉ người có — Hỏi-3 |
| Quản trị sàn không thấy | Mục tiêu: Tham chiếu §6 «quản trị sàn không tự động thấy chủ nhà» |
| Hồ sơ chủ nhà không hiện số nào, chỉ cờ «có số»; số chỉ qua mở số | Mục tiêu: Tham chiếu §6 «mỗi lần mở số chủ là một sự kiện» — xem số ở đâu thì đó là mở số |

## Câu chỉ người có

- **Hỏi-1 — Mã hoá số chủ ở mức trường: làm ở hàng này hay tách hàng sau?** Khuyến nghị: **tách**. Hàng này đặt số sau
  một cửa duy nhất (cột không ai đọc thẳng, chỉ hàm mở số), nên mã hoá sau chỉ đổi thân hàm và cột. Làm ngay cần chủ kho
  sinh `OWNER_PHONE_KEY`, đặt vào Vercel và secret GitHub trước khi gộp (việc ngoài kho), thêm biến vào `.env.example`
  (ngoài vùng hàng), và bản thật thiếu khoá thì không ghi được số. Hiện chỉ có dữ liệu mẫu tới khi pháp lý rà (ADR-0009
  §10). Lối khác — làm ngay — giá: một lần ngồi của chủ kho để sinh và cất khoá, cộng một yêu cầu chạm `.env.example`.
- **Hỏi-2 — Trưởng nhóm thấy chủ nhà của cả sàn?** Kho chưa có «nhóm»; Tham chiếu §2 nói trưởng nhóm «thấy như đầu chủ,
  cho cả nhóm». Khuyến nghị: **có, cả sàn** tới khi có nhóm — sàn bản đầu là một đội; trưởng nhóm cần số để bàn giao và
  xử lý ngoại lệ. Lối khác — trưởng nhóm không thấy gì tới khi có nhóm — giá: trưởng nhóm không bàn giao được, và hàng
  nhóm phải mở lại luật này.

- **Hỏi-3 — Ai thành đầu chủ giữ căn?** Khuyến nghị: đầu chủ đặt chủ nhà đầu tiên cho hàng chưa có người giữ thì giữ căn;
  trưởng nhóm gán, gán lại; đầu chủ không tự chuyển căn; người không có vai Đầu chủ (kể cả trưởng nhóm không kiêm) đặt
  chủ nhà trên hàng chưa có người giữ thì bị từ chối — trưởng nhóm gán đầu chủ trước. Lối khác: người tạo hàng giữ căn —
  giá: lead do telesales tạo thì telesales giữ căn, trái chốt 29/10 «telesales không thấy số sau khi gửi»; hoặc chỉ
  trưởng nhóm gán — giá: mỗi hàng mới chờ trưởng nhóm.

## Ngoài phạm vi

- Ảnh sổ (lớp nguồn thứ tư) — kho ảnh chưa có; ràng buộc `listing_events_no_source` đã chặn khoá `titleDeedPhoto`.
- Mã hoá số chủ ở mức trường — theo Hỏi-1.
- Trục «Chỉ tôi → Nhóm → Toàn sàn» — hàng 12 (`truc-ai-thay-hang`, dãy A).
- Telesales nhập số chủ ở lead, kiểm trùng chủ nhà — hàng dòng vào.
- Lịch sử giá đáy từng nói — một giá đáy hiện hành; đổi giá đáy chưa thành sự kiện.
- Số chủ trên máy (đồng bộ, xoá khi đăng xuất) — hàng 13 (`nhanh-tuc-thi`).
- Mọi màn (hồ sơ căn, «Xin dẫn xem», «Liên hệ đầu chủ»).

## Đặc tả UX

Bỏ — hàng không chạm giao diện (sổ: «bỏ đặc-tả-UX»).

## Kiểm

- Lõi: `npm test -w @quy-hang/core` — ma trận đủ sáu loại người xem × giữ / không giữ căn; quét khoá nguồn ở mọi cấp
  của hồ sơ trả về.
- Cơ sở dữ liệu: `npm run db:migrate && npm run db:test` trên Postgres dãy N (5551) — bộ kiểm cách ly thêm ca ba bảng,
  cột số, hàm mở số, ràng buộc payload; tệp `packages/api/test-db/owners.test.ts` gọi API thật trên cùng Postgres.
