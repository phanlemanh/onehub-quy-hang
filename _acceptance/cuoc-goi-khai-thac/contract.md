---
schema_version: 1
feature: "Đầu chủ mở chế độ cuộc gọi của một lead trên máy tính: thẻ lead so giá với toà, danh sách hỏi chọn bằng phím, tính giá bao phí ↔ về tay; ghi xong thì mức đủ tự tính lại"
slug: cuoc-goi-khai-thac
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: draft
design_doc: docs/superpowers/specs/2026-11-02-cuoc-goi-khai-thac-design.md
approved_by:
approved_at:
---

# Acceptance Contract: cuoc-goi-khai-thac

## Context

Hàng 28 (dãy D), mã L5, phác thảo KD1 — Tham chiếu §8 luật 7, 8, 12–14, 16; §10 «Chế độ cuộc gọi: khai thác» P0. Đứng
trên hàng 22 (Hôm nay của đầu chủ, `GET /api/v1/leads/assigned`, nút «Đã gọi») và hàng 24/85 (lead, tạo hàng từ lead).
«Đầu chủ» = vai `listing_agent`; «lead của mình» = lead có `matched_agent_user_id` là mình, chưa bỏ, chưa trả lại, bất kể nhóm
Hôm nay. Sáu chỗ chỉ chủ kho quyết ghi ở sổ (Hỏi-1…Hỏi-6); tiêu chí dưới viết theo khuyến nghị của từng Hỏi.

Source input: `docs/plan/lo-trinh.json` hàng 28 · `_acceptance/cuoc-goi-khai-thac/opportunity.md`

## Criteria

- AC-1: Given đầu chủ có một lead của mình ở Hôm nay, When bấm «Gọi» trên dòng lead, Then trang `/units/call?lead=<mã>`
  mở chế độ cuộc gọi với thẻ lead: toà · mã căn (hay «chỉ biết toà»), thuộc tính căn tự điền từ danh mục khi có mã,
  nhu cầu, giá chủ muốn kèm điều kiện phí theo câu «Hiểu là…», giờ nhập và nấc; lead không phải của mình hay không còn
  thì trang báo «Không thấy lead này trong việc của bạn» kèm «Về Hôm nay»; `GET /api/v1/leads/assigned/{leadId}` trả
  đúng một lead giao cho người gọi bất kể nhóm Hôm nay (kể cả sau «Đã gọi»), kèm `listPrice`, `feeInclusion`,
  `listingId`, không khoá nguồn nào; lead của người khác, đã bỏ hay đã trả lại → 404. (cross-layer)
- AC-2: Given lead đang mở chưa ghi mốc gọi đầu, When đầu chủ bấm «Đã gọi» (hay phím G) trên thẻ lead, hoặc ghi câu
  trả lời đầu tiên ở danh sách hỏi (Hỏi-6), Then mốc gọi đầu được ghi đúng một lần (`first_called_at` khác null), thẻ
  đổi nấc sang Đã gọi và nút ẩn; lead đã có mốc thì câu trả lời không ghi lại mốc; máy chủ trả 409 thì thẻ nói lý do
  bằng chữ và giữ nguyên nấc. (cross-layer)
- AC-3: Given ba tỉ lệ mặc định của sàn (thuế thu nhập cá nhân 2%, lệ phí trước bạ 0,5%, môi giới 1%), When tính về tay
  từ một giá, Then giá bao phí ra về tay = giá − ba khoản, mỗi khoản làm tròn tới đồng trên chính giá ấy (2,75 tỷ bao phí
  → về tay 2.653.750.000 đ, ba khoản 55.000.000 · 13.750.000 · 27.500.000); giá không bao phí ra về tay bằng chính giá,
  không khoản nào; tính ngược từ về tay ra giá bao phí nhỏ nhất có về tay không thấp hơn số đã cho; mọi phép tính bằng
  số nguyên đồng.
- AC-4: Given chế độ cuộc gọi đang mở, When đầu chủ gõ giá chủ báo theo cách nói của nghề và chọn điều kiện phí, hoặc gõ
  giá về tay, hoặc sửa phần trăm môi giới, Then ô còn lại tính lại ngay theo AC-3, ba khoản hiện từng dòng có số tiền,
  kèm dòng «Tỉ lệ mặc định của sàn»; chữ giá chưa hiểu thì báo dưới ô và không tính; sửa phần trăm môi giới không ghi gì
  vào hồ sơ.
- AC-5: Given kho trên máy có căn của toà của lead, When chế độ cuộc gọi mở, Then khối «Cùng loại trong toà» liệt các
  căn cùng toà, cùng số phòng ngủ theo danh mục (lead chỉ biết toà thì cả toà và nói rõ), nấc Đang bán hay Đang giao dịch,
  có giá kèm điều kiện phí, trừ chính căn đang gọi, mỗi dòng Mã · Giá · Phí · Trạng thái · Xác nhận; dải thấp – giữa –
  cao tính trên giá về tay của các căn ấy, căn đang gọi đặt trên dải kèm phần trăm lệch so với giữa; giá bao phí và
  không bao phí không bao giờ đem so thẳng; toà không có căn hợp thì khối nói «Toà chưa có căn cùng loại có giá»; không
  câu nào gợi ý mức giá nên ép.
- AC-6: Given chế độ cuộc gọi đang mở, When đầu chủ dùng phím — Tab / Shift+Tab đổi nhóm, phím số chọn lựa chọn của nhóm
  đang đứng, Delete xoá câu trả lời của nhóm, Alt+1 / Alt+2 chọn điều kiện phí khi con trỏ đang ở ô giá, Esc rời ô giá về
  danh sách — Then danh sách hỏi là đúng năm mục của mức đủ theo thứ tự của lõi, mỗi mục
  một hàng lựa chọn mặc định của sàn có phím; mỗi lần chọn hay xoá ghi đúng một sự kiện của hồ sơ căn qua bộ đồng bộ
  trên máy; giá trị cũ ngoài bộ lựa chọn hiện nguyên và đánh dấu; phím số không bắt khi con trỏ đang ở ô chữ. (cross-layer)
- AC-7: Given nhóm «Giá và phí» của danh sách hỏi, When đầu chủ gõ giá theo cách nói của nghề, chọn điều kiện phí rồi
  Enter — chỉ bằng phím, Then máy nói lại «Hiểu là…» trước khi ghi, ghi một sự kiện đổi giá kèm điều kiện phí và máy chủ
  nhận đúng giá ấy (listPrice, feeInclusion trên hồ sơ của máy chủ); đổi quá 20% hay đổi điều kiện phí thì hỏi lại kèm
  giá cũ → mới trước khi ghi; máy chủ từ chối thì hồ sơ vào Cần xem và chỉ báo đồng bộ nói vì sao; hồ sơ chưa có giá
  thì ô gợi sẵn giá của lead. (cross-layer)
- AC-8: Given hồ sơ căn của lead đang có k trên năm mục, When một lần ghi ở AC-6 hay AC-7 làm đủ hay thiếu một mục, Then
  dòng «Mức đủ k/5» và «Còn thiếu: …» ở đầu danh sách hỏi đổi ngay sau lần ghi — kể cả khi mất mạng — và trùng số
  `completeness` của lõi trên chính bản trên máy; đủ năm mục thì nói «Đã đủ năm mục».
- AC-9: Given lead chưa có hồ sơ căn, When đầu chủ ghi câu trả lời đầu tiên, Then máy tạo hồ sơ căn từ lead (đường tạo
  hàng từ lead), ghi câu trả lời vào hồ sơ ấy và màn đọc hồ sơ ấy từ đó; lead đã có hồ sơ thì mọi lần ghi vào đúng hồ sơ
  `listingId`, không tạo hồ sơ thứ hai; tạo hồ sơ lỗi thì nhóm báo lỗi, câu trả lời chưa ghi và bấm lại được. (cross-layer)
- AC-10: Given người vào `/units/call` không có vai Đầu chủ (telesales, quản trị sàn), When mở trang, Then trang không
  hiện (không thấy); với đầu chủ, trang và mọi lời gọi của nó không mang số chủ nhà, giá đáy hay ảnh sổ.

## Coverage

Quét bằng skill morphological-scan, preset entity-feature (đối tượng: chế độ cuộc gọi của một lead).

- Trục A — vai người mở: Đầu chủ giữ lead · Đầu chủ khác · telesales · quản trị [thước CE: Tham chiếu §9 bảng nhà × vai] → AC-1, AC-10
- Trục B — trạng thái lead: chưa hồ sơ · đã hồ sơ · chưa gọi · đã gọi · không còn trong nhóm [thước CE: lõi `leadStage` + `lead_listings`] → AC-1, AC-2, AC-9
- Trục C — vùng màn: thẻ lead · danh sách hỏi · máy tính · so giá [thước CE: câu giao hàng 28 + bản phác KD1] → AC-1, AC-6, AC-4, AC-5
- Trục D — điều kiện phí: bao phí · không bao phí · đổi giữa hai [thước CE: `FEE_INCLUSIONS` của lõi] → AC-3, AC-5, AC-7
- Trục E — dữ liệu toà: có căn hợp · không căn hợp · lead chỉ biết toà [CE chưa kiểm chứng] → AC-5
- Trục F — mạng: có mạng · mất mạng · máy chủ từ chối [thước CE: bộ đồng bộ hàng 13, 61] → AC-6, AC-8, AC-9
- Trục G — cách nhập: phím · chuột · ô chữ đang giữ con trỏ [CE chưa kiểm chứng] → AC-6
- Later: kết quả gọi H/G/B/K, lịch sử trả giá, giá đáy (hàng 29); quay số (hàng 30); nhóm hỏi chưa có trường; lưu định nghĩa bao phí (hàng 49).

## Đường đo

- Thước: thời gian lead → cuộc gọi đầu · số từ: `leads.first_called_at − coalesce(routed_at, created_at)` (cột có từ hàng 25, đọc ở hàng 22) · bảo đảm bởi: AC-2 (lối ghi mốc trong chế độ cuộc gọi) · đã có sẵn: nút «Đã gọi» của Hôm nay

## Out of scope

- Kết quả gọi bốn nút (Hạ giá · Giữ giá · Đã cọc/bán · Không nghe máy), lịch sử trả giá, giá đáy nội bộ — hàng 29.
- Đồng hồ cuộc gọi, số chủ che một phần, «Mở trên điện thoại», quay số — hàng 30.
- Tin rao công khai bên ngoài trong so giá; «chủ còn căn nào khác» — cần dữ liệu Invest và đọc liên hệ chủ nhà, hàng riêng.
- Nhóm hỏi chưa có trường trên lần rao: ngân hàng đang vay, cách tất toán, thời gian ra hàng, lịch xem nhà, ghi chú cuộc gọi.
- Lưu giá về tay, định nghĩa bao phí lúc tính và phí môi giới riêng từng căn; sàn đặt tỉ lệ — hàng 49.
- Sàn ghi đè bộ lựa chọn của danh sách hỏi — hàng 90 (sổ từ vựng).
- Chế độ cuộc gọi trên điện thoại (K1–K4).

## Notes

- Không migration, không bảng mới. Tệp ngoài vùng `units/call/**` xin ở yêu cầu D-23.
- Năm Hỏi ở `decisions.jsonl`; người chọn khác khuyến nghị thì tiêu chí liên quan sửa trước khi duyệt.
