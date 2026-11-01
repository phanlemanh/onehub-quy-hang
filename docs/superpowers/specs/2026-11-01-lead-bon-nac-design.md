# Thiết kế — Lead bốn nấc (hàng 27, T3)

Hàng 27 của lộ trình (dãy L, đợt `dau-chu-dong-vao`), đứng trên hàng 25 (chia lead và hạn, ADR-0017) và hàng 24 (ô nhận
lead, ADR-0012). Câu giao: «Telesales theo dõi lead đã nhập qua bốn nấc Đã gửi → Đã nhận → Đã gọi → Lên bảng, thấy lead bị
trả lại kèm «Sửa số và gửi lại»; không thấy hàng». Lộ trình ghi T2 với vùng màn `leads/mine`, nhưng «trả lại» cần cột và
hàm mới ở cơ sở dữ liệu (`packages/db/**` thuộc `t3_paths`), nên hàng chạy hạng T3. Migration `015_lead_bon_nac.sql` và
ADR-0020 xin giữ chỗ ở giám sát (yêu cầu L-11).

## 1. Hàng làm gì

1. **Danh sách lead đã nhập ở Hôm nay của telesales** (Tham chiếu §10: «Hôm nay · Lead đã nhập và bốn nấc · Telesales ·
   cả hai», P0). Telesales mở app vào Hôm nay và thấy mọi lead mình đã nhập, mới nhất trước. Màn dựng ở
   `apps/web/src/app/(app)/leads/mine/` (vùng của hàng); `today/page.tsx` hiện màn này cho vai telesales, vai khác giữ
   chỗ tạm như cũ (Hôm nay của đầu chủ là hàng 22). `/leads/mine` mở cùng màn cho ai đã nhập lead.
2. **Bốn nấc** của mỗi lead, kèm giờ của từng nấc đã qua:
   - **Đã gửi** — lead nhập xong (chưa có người: «chờ chia»; có người: tên đầu chủ);
   - **Đã nhận** — đầu chủ bấm nhận (hàng 25, `accepted_at`);
   - **Đã gọi** — đầu chủ ghi gọi lần đầu (hàng 25, `first_called_at`);
   - **Lên bảng** — chủ nhà của lead đã thành hàng Sẵn sàng bán (Hỏi-1).
   Ngoài bốn nấc: **Trả lại** (đầu chủ báo số không liên lạc được), **Đã gửi lại** (trỏ lead mới), **Tin bổ sung** (lead
   căn trùng — ghi vào hàng đang mở), **Đã bỏ** (lead căn trùng telesales bỏ).
3. **Trả lại**: đầu chủ của lead báo «Số không liên lạc được» khi chưa ghi gọi lần đầu. Lead rời việc của đầu chủ: không
   chia lại, không báo quá hạn, không tính là lead đang mở. Nút «Trả lại» ở màn của đầu chủ là hàng 22 — hàng này có lối
   API.
4. **Sửa số và gửi lại**: telesales nhập số mới ngay trên dòng lead bị trả lại; máy tạo một lead mới chép các mục khác của
   lead cũ, chạy kiểm trùng và chia như mọi lead mới (Hỏi-2); lead cũ mang dấu «đã gửi lại» trỏ lead mới.
5. **Không thấy hàng**: mỗi dòng chỉ có toà, căn, nhu cầu, giá kèm điều kiện phí, tên đầu chủ, nấc và giờ — không số chủ,
   không mã hàng, không trường nào của hàng (luật 21).

## 2. Dữ liệu (migration 015)

- `leads` thêm `returned_at`, `returned_by` (lần trả lại), `resubmitted_at`, `resubmitted_lead_id` (khoá ngoại về lead mới
  cùng sàn). Ràng buộc: hai cặp cùng có hay cùng trống; lead đã gửi lại phải là lead đã trả lại; trả lại chỉ khi chưa ghi
  gọi lần đầu. Vai API đọc bốn cột mới; không cấp sửa.
- Hàm security definer, lọc theo sàn đang làm:
  - `app.return_lead(lead)` — người gọi là đầu chủ của lead, lead không trùng hay chủ trùng, chưa bỏ, chưa trả lại, chưa ghi
    gọi. Mã lỗi: P0002 (không phải lead của người gọi) · 23505 (đã trả lại) · 22023 (đã ghi gọi lần đầu).
  - `app.mark_resubmitted(old, new)` — người gọi là người nhập lead cũ, lead cũ đã trả lại, chưa gửi lại; lead mới cùng
    người nhập, cùng sàn. Lối API tạo lead mới bằng `createLead` của hàng 24 rồi gọi hàm này trong cùng giao dịch.
  - `app.lead_board_dates(leads uuid[])` — với lead do người gọi nhập: lúc lên bảng = lần đầu một hàng mà chủ nhà mang
    cùng dấu vết số (`owner_phone_hash`) và đầu chủ hiện tại là đầu chủ của lead chuyển sang Sẵn sàng bán (`status_changed`
    → `Active`) kể từ lúc nhập lead. Chỉ trả mã lead và mốc giờ (Hỏi-1).
- Thay bốn hàm của hàng 25 bằng `create or replace` cùng chữ ký, thêm điều kiện «chưa trả lại»: `lead_job_companies`,
  `lead_routing_candidates` (lead đang mở), `lead_deadline_facts`, và `lead_routing_queue` (lead cùng số đã trả lại không
  là người của lead trước). Vế «lead trước cùng số đã về đầu chủ» của `app.lead_dedupe_facts` (hàng 24, 62) cũng bỏ lead
  đã trả lại — số không liên lạc được không neo chủ nhà cho ai. Bộ kiểm của hàng 24, 25, 62 phải xanh nguyên.

## 3. Lõi (`packages/core/src/dedupe/`)

- `LEAD_STAGES` = `sent`, `accepted`, `called`, `on_board` (bốn nấc) và `LEAD_SIDE_STATES` = `returned`, `resubmitted`,
  `supplement`, `discarded`; `leadStage(facts)` → nấc hay trạng thái phụ theo thứ tự: gửi lại → bỏ → căn trùng → trả lại →
  lên bảng → gọi → nhận → gửi. Nhãn tiếng Việt `LEAD_STAGE_LABELS`.
- `MyLeadView` = bản của telesales (`leadResultView`) cộng `stage`, mốc từng nấc, `returnReason`, `resubmittedLeadId`. Dựng ở
  lõi, không ở màn (bất biến 4).

## 4. API (`packages/api/src/leads/`)

| Lối | Ai | Làm gì |
| --- | --- | --- |
| `GET /api/v1/leads` | người đã nhập lead | lead mình nhập, mới nhất trước, bản `MyLeadView` |
| `POST /api/v1/leads/{id}/return` | đầu chủ của lead | trả lại vì số không liên lạc được |
| `POST /api/v1/leads/{id}/resubmit` | người nhập lead | `{ ownerPhone }` — lead mới, kiểm trùng như lead mới; trả lead mới |

## 5. Màn (`apps/web/src/app/(app)/leads/mine/`)

Khối của màn chọn ở trang ba lối (ADR-0019, `_acceptance/lead-bon-nac/ba-loi/index.html`): Trong kho · ReUI (`list-11`,
khối đích ở `vo-va-ia.md`) · Vẽ mới. Nhóm màn mới «lead của tôi» thêm mục bản đồ `design/patterns/lead-cua-toi.md` cùng
vòng. Mỗi vùng dữ liệu có trống (một hành động «+ Lead»), đang tải (`Skeleton` đúng bố cục), lỗi (thử lại); khổ 1440 và 375.

## 6. Phương án đã cân

- **Sửa số tại chỗ trên lead cũ**: ít bản ghi hơn, nhưng phải đổi dấu vết số và kết quả kiểm trùng đã báo cho telesales,
  mất lịch sử lần trả lại. Chọn lead mới.
- **Gắn lead với hàng bằng mã**: chính xác hơn «Lên bảng» suy theo dấu vết, nhưng chưa có lối nào tạo hàng từ lead (hồ sơ căn
  và Hôm nay của đầu chủ là hàng 17 và 22). Đưa thành Hỏi-1.
- **Đặt danh sách ở cột phải ô nhận lead** (`vo-va-ia.md`): telesales chỉ thấy khi mở «+ Lead»; Tham chiếu §10 đặt ở
  Hôm nay — mở app là thấy.

## 7. Câu chỉ người có

- **Hỏi-1 — «Lên bảng» suy thế nào khi chưa có mã nối lead với hàng**: khuyến nghị suy từ hàng của chính đầu chủ ấy, chủ nhà
  cùng dấu vết số, chuyển Sẵn sàng bán sau lúc nhập lead. Lối khác: để nấc Lên bảng trống tới khi hàng 17/22 gắn lead với
  hàng — số đo §11 «Số ngày lead → Sẵn sàng bán» chưa có dữ liệu tới lúc ấy.
- **Hỏi-2 — lead gửi lại đi về đâu**: khuyến nghị đi như lead mới (kiểm trùng; không trùng thì chia theo cách chia của sàn,
  hạn tính lại). Lối khác: về thẳng đầu chủ đã trả lại.
- **Hỏi-3 — khối của màn** (ADR-0019): trang ba lối, máy khuyên một lối.

## 7b. Bất biến chạm

1. Cách ly: lối liệt, trả lại, gửi lại và hàm lên bảng chỉ thấy lead của sàn đang làm; bộ kiểm cách ly thêm ca.
2. Chủ nhà không rời công ty: danh sách và mọi lối trả về không có số chủ; lên bảng chỉ trả mốc giờ, không mã hàng.
3. Người bấm gửi: «Trả lại» và «Gửi lại» là người bấm, máy không gửi tin.
4. Phần nội bộ không ra trang khách: không chạm.
