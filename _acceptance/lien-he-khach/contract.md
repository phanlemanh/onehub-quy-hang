---
schema_version: 1
feature: Đầu khách lưu khách là một liên hệ loại Người mua hoặc Người thuê, gắn nhu cầu và Lần gửi vào liên hệ ấy qua nhu cầu khách; một khách hai số vẫn là một người; số khách không ra trang khách
slug: lien-he-khach
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, db]
status: approved
design_doc: docs/superpowers/specs/2026-11-03-lien-he-khach-design.md
approved_by: Manh Phan
approved_at: 2026-11-03
---

# Acceptance Contract: lien-he-khach

## Context

Hàng 86 của lộ trình (dãy L, đợt `dau-khach-nhap`), Cổng Đáng: build (Manh Phan 02/11). Đứng trên hàng 85 (liên hệ,
ADR-0021), hàng 62 (mã hoá số, ADR-0013), hàng 12 (ai thấy hàng). Chạm cơ sở dữ liệu (migration `021`, `t3_paths`) nên
hạng T3. Không có màn: Gửi (34), Trang khách (35), Đã gửi (36) dựng trên dữ liệu này. Hỏi-1..7 soạn theo khuyến nghị; chủ
kho chốt ở Cổng Phạm vi.

Source input: `docs/plan/lo-trinh.json` hàng 86 · `_acceptance/lien-he-khach/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-11-03-lien-he-khach-design.md` (bảng đối chiếu §1).

Từ ngữ: «khách» = liên hệ mang `Buyer` hay `Tenant`; «nhu cầu khách» = một đầu khách phục vụ một khách (RESO
`Prospecting`): liên hệ, đầu khách giữ, tên khách đầu khách gõ, loại giao dịch Mua · Thuê · Cả hai, tiêu chí; «Lần gửi» =
một link (bộ căn) gửi cho một nhu cầu khách hay cho nhóm môi giới, người gửi là chỗ ghi công; «phong bì công khai» = phần
của Lần gửi được ra trang khách; «bộ mẫu» = `packages/db/seed/mau/du-lieu-mau.json` của hàng 5.

## Criteria

- AC-1: Given lõi `packages/core/src/contacts`, When kiểm và dựng nhu cầu khách, Then loại giao dịch ra loại liên hệ (Mua →
  `Buyer`, Thuê → `Tenant`, Cả hai → cả hai); khuôn nhập nhận đúng các khoá tên, số, loại giao dịch, tiêu chí và tiêu chí
  đúng tập trường `SubdivisionName · BuildingName · BedroomsTotalMin · LivingAreaMin · ListPriceMax · LeaseAmountMax · Note`
  — khoá lạ, số sai khuôn, loại ngoài thực đơn, số âm đều ra lỗi nêu đường dẫn; bản xem nhu cầu khách chỉ mang khoá viết
  trước, không số, không dấu vết, không mã liên hệ; tên loại sự kiện của nhu cầu khách là một hằng của lõi
  (`inquiry_received · phone_added · reassigned · closed`).
- AC-2: Given migration 021, When đọc lược đồ và gọi bằng vai API, Then bốn bảng nhu cầu khách, sự kiện của nhu cầu khách,
  Lần gửi, căn của Lần gửi bật và ép luật theo dòng theo sàn; vai API chỉ đọc, không ghi thẳng bốn bảng, sự kiện không sửa
  không xoá được; nhu cầu khách chỉ trưởng nhóm và đầu khách giữ
  (còn vai Đầu khách) đọc được; Lần gửi chỉ người gửi, trưởng nhóm, đầu khách giữ nhu cầu đọc được; Lần gửi khách riêng bắt
  buộc có nhu cầu, Lần gửi nhóm môi giới không có; mã link duy nhất toàn hệ; số của khách vào `contact_phones` với ngữ
  cảnh `prospects:<sàn>:<nhu cầu>`; không cột số dạng chữ nào chưa bị chặn.
- AC-3: Given đầu khách gọi `POST /api/v1/prospects` với tên, số, loại giao dịch, tiêu chí, When số chưa thuộc liên hệ nào,
  Then máy tạo một liên hệ loại theo loại giao dịch, không người giữ, thêm số (bản mã + dấu vết) và nhu cầu khách gắn liên
  hệ ấy — 201 trả bản xem; số đã thuộc một liên hệ (kể cả liên hệ chủ nhà do đầu chủ giữ) thì nhu cầu gắn liên hệ ấy, liên
  hệ cộng loại, người giữ không đổi, và thân trả cùng tập khoá với trường hợp số mới; mỗi nhu cầu mới ghi đúng một sự kiện
  «khách hỏi» (`inquiry_received`, luật 35 của đợt — số đo hai tuần thử) mang người và vai lúc làm, không số; không vai
  Đầu khách → 403 và không ghi gì; sai khuôn → 400; chưa đăng nhập → 401.
- AC-4: Given một nhu cầu khách số A, When đầu khách giữ nó thêm số B qua `POST /api/v1/prospects/{id}/phones` rồi một đầu
  khách (chính họ hay người khác) tạo nhu cầu mới bằng số B, Then liên hệ có hai số và cả hai nhu cầu gắn cùng một liên hệ
  (một khách hai số là một người); thêm lại số đã thuộc liên hệ ấy → 200 không thêm dòng; số thuộc liên hệ khác — liên hệ
  khách hay liên hệ chủ nhà — → 409 cùng một thân, không nêu liên hệ nào, hai liên hệ vẫn tách (Hỏi-6: lối này cho đầu
  khách biết số ấy đã có trong sàn); người không giữ nhu cầu → 404.
- AC-5: Given hai nhu cầu khách cùng liên hệ (từ số A và số B), When đầu khách tạo hai Lần gửi qua `POST /api/v1/shares`
  (khách riêng, mỗi Lần gửi một nhu cầu, căn đã lên bảng), Then hai Lần gửi đọc thẳng bảng ra cùng một liên hệ qua nhu cầu,
  người gửi là người gọi, mỗi Lần gửi một mã link 12 ký tự khác nhau, `GET /api/v1/prospects/{id}/shares` liệt đúng Lần gửi
  của nhu cầu theo thứ tự mới trước; Lần gửi nhóm môi giới không cần nhu cầu; nhu cầu của người khác hay nhu cầu đã đóng →
  404; căn chưa lên bảng («Chỉ tôi» — của người khác hay của chính người gửi), căn của sàn khác, căn không có, căn trùng,
  quá 30 căn (Hỏi-7), khán giả lạ → 400.
- AC-6: Given một nhu cầu khách và Lần gửi của nó, When đọc qua API bằng từng người, Then đầu khách giữ và trưởng nhóm thấy
  nhu cầu và Lần gửi; người gửi thấy Lần gửi của mình; đầu khách khác, đầu chủ, telesales, quản trị, người sàn khác → 404 với
  nhu cầu và danh sách rỗng với Lần gửi; đầu khách không đọc được liên hệ của khách qua `GET /api/v1/contacts/{id}` (404),
  kể cả liên hệ vừa khách vừa chủ.
- AC-7: Given một nhu cầu khách có Lần gửi, When đầu khách giữ hay trưởng nhóm gọi `POST /api/v1/prospects/{id}/close`,
  Then nhu cầu mang mốc đóng, ghi một sự kiện `closed`, vẫn đọc được cùng Lần gửi cũ, gọi lại → 409, người khác → 404; và
  When trưởng nhóm gọi `PATCH /api/v1/prospects/{id}` đổi đầu khách giữ sang
  một thành viên còn vai Đầu khách, Then đầu khách mới thấy nhu cầu và mọi Lần gửi cũ, người gửi của Lần gửi cũ giữ nguyên,
  đầu khách cũ không còn thấy nhu cầu nhưng vẫn thấy Lần gửi mình gửi, nhu cầu ghi một sự kiện đổi đầu khách (`reassigned`,
  người cũ, người mới); đích không mang vai Đầu khách → 400; người gọi không
  phải trưởng nhóm → 404; khoá lạ → 400.
- AC-8: Given một liên hệ chủ nhà do đầu chủ 1 giữ, When đầu khách tạo nhu cầu bằng số của chủ ấy và telesales nhập lead mới
  bằng số của một khách chưa là chủ, Then liên hệ chủ nhà ra loại `Seller, Buyer`, vẫn một liên hệ, người giữ vẫn đầu chủ 1,
  đầu chủ 1 đọc liên hệ thấy loại ấy và số lượng số không đổi (cùng số), sau khi đầu khách thêm số thứ hai vào nhu cầu thì
  số lượng số tăng một, không lúc nào thấy nhu cầu; lead của khách ra «không trùng» và liên hệ khách cộng `Seller`, nhu cầu
  khách không đổi; người giữ hay trưởng nhóm bỏ `Buyer` khi nhu cầu Mua còn mở → 400, bỏ được sau khi nhu cầu đóng qua
  API.
- AC-9: Given lõi `packages/core/src/sharing`, When dựng phong bì công khai từ bản ghi Lần gửi đầy đủ (người gửi, nhu cầu,
  liên hệ, tên khách, số của khách, tiêu chí), Then phong bì chỉ có đúng các khoá viết trước — mã link, khán giả, danh sách
  mã hàng theo thứ tự, mã người gửi — và chuỗi JSON của nó không chứa tên khách, mã nhu cầu, mã liên hệ, số hay chín chữ số
  liền nào của số; khuôn nhập Lần gửi từ chối khán giả lạ, khách riêng thiếu nhu cầu, nhóm môi giới có nhu cầu, 0 hay quá
  30 căn, căn trùng; mã link mới đúng khuôn 12 ký tự và hai lần sinh khác nhau.
- AC-10: Given tài liệu của kho, When đọc Tham chiếu, ADR-0021 và Đối chiếu ngành, Then Tham chiếu §4 có dòng «Nhu cầu
  khách» và dòng «Lần gửi» nói gắn nhu cầu khách, §12 có một dòng 03/11 cho hàng 86, §15 có dòng RESO `Prospecting` và
  `SavedSearch`; ADR-0021 có mục «Sửa đổi 03/11 — liên hệ khách» nêu người giữ liên hệ không phải đầu khách và lịch xem gắn
  nhu cầu khách khi dựng; Đối chiếu ngành có dòng `Prospecting`.

## Coverage

Quét morphological-scan, preset entity-feature, cho thực thể «khách của một đầu khách».

- Trục cửa vào của khách: đầu khách tạo nhu cầu (AC-3) · thêm số (AC-4) · khách là chủ có sẵn (AC-3, AC-8) · chủ sau thành
  khách và khách sau thành chủ qua lead (AC-8) [thước CE: câu giao hàng 86, Tham chiếu §4 «Chủ nhà · Liên hệ»]
- Trục số: một số · hai số một người · số đã thuộc liên hệ khác · số của chủ nhà (AC-3, AC-4, AC-8)
- Trục loại: Mua · Thuê · Cả hai · khách + chủ (AC-1, AC-3, AC-8)
- Trục người phục vụ: đầu khách giữ · đầu khách thứ hai cùng khách · đổi đầu khách (AC-4, AC-7; Hỏi-1)
- Trục Lần gửi: khách riêng · nhóm môi giới · hai Lần gửi một người · căn không gửi được (AC-5, AC-9)
- Trục ai xem: đầu khách giữ · người gửi · trưởng nhóm · đầu khách khác · đầu chủ · telesales · quản trị · sàn khác · chưa
  đăng nhập (AC-2, AC-3, AC-6)
- Trục rò: số · liên hệ chủ nhà cho đầu khách · liên hệ trên trang khách · dò số chủ bằng thân trả của tạo nhu cầu (đóng,
  AC-3) · dò số đã có trong sàn bằng thêm số (mở có chủ đích, Hỏi-6, AC-4) (AC-3, AC-4, AC-6, AC-9)
- Trục vòng đời nhu cầu: mở · đổi đầu khách · đóng (AC-3, AC-7, AC-8)
- Trục lớp: lõi (AC-1, AC-9) · cơ sở dữ liệu (AC-2) · API (AC-3..AC-8) · tài liệu (AC-10)
- Bỏ: trục màn — hàng không có màn (dòng `descope` «bỏ design-pass»); trục lịch xem — Hỏi-4.

## Đường đo

Ô cơ hội không khai ngưỡng số; câu «Kết quả nào là SỐNG» đo bằng chính các tiêu chí:

- Một khách hai số có hai Lần gửi cùng một liên hệ: đọc Lần gửi → nhu cầu → liên hệ · AC-4, AC-5 bảo đảm.
- Liên hệ vừa Người mua vừa Chủ bán vẫn một người, phần chủ nhà lớp nguồn: đọc liên hệ của đầu chủ · AC-8 bảo đảm.
- Trang khách không lộ số hay trường nội bộ của liên hệ: phong bì công khai của lõi · AC-9 bảo đảm.
- Bộ kiểm cách ly xanh: `packages/db/tests/isolation.test.mjs` · AC-2 bảo đảm.
- Số đo §11 «số link khách mở, lượt quan tâm — đếm theo người, không theo số»: đếm theo liên hệ qua nhu cầu của Lần gửi ·
  AC-5 bảo đảm (lượt mở, quan tâm là hàng 35).
- Số đo §11 «Thời gian khách hỏi → gửi được căn» (luật 35 của đợt): mốc đầu là sự kiện `inquiry_received` của nhu cầu
  khách · AC-3 bảo đảm; mốc cuối là hàng 34; hàng 52 đọc tên hằng `PROSPECT_EVENT_TYPES` của lõi.

## Out of scope

- Lịch xem và xin dẫn xem — chờ phỏng vấn (Tham chiếu §13); luật gắn ghi ở ADR-0021 (Hỏi-4).
- Mở lại số khách trong app (Hỏi-5).
- Màn: Gửi (34), Trang khách và lượt mở, quan tâm (35), Đã gửi và tắt link (36), Hôm nay của đầu khách (37).
- Luật ẩn trường của căn trên trang khách và bộ kiểm rò rỉ — hàng 31.
- Gộp tay hai liên hệ, trường riêng của nhu cầu khách (hàng 47), lọc Bảng hàng theo nhu cầu (hàng 32).
- Ghi công, chia hoa hồng giữa hai đầu khách cùng khách — ngoài bản đầu (Tham chiếu §13).

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Bất biến chạm: (1) cách ly — ba bảng mới bật + ép luật theo dòng, ca trong `packages/db/tests/isolation.test.mjs`;
  (2) chủ nhà — liên hệ vừa khách vừa chủ trọn lớp nguồn, đầu khách không đọc liên hệ; (3) người bấm gửi — Lần gửi chỉ là
  bản ghi; (4) trang khách — phong bì công khai của lõi.
- Migration `021` giữ chỗ ở giám sát (tin L-0311-2). `app.set_contact_types` đổi bằng `create or replace` cùng chữ ký; bộ
  kiểm của hàng 85 (`lien-he*.test.ts`, `va-lien-he.test.ts`) phải xanh.
- Tệp ngoài vùng xin ở yêu cầu `cham-tep` L-1: `packages/api/src/errors.ts`, `packages/core/package.json`,
  `packages/api/test-db/lien-he-khach.test.ts`, `packages/db/tests/isolation.test.mjs`, `docs/adr/0021-lien-he.md`,
  `docs/product/doi-chieu-nganh.md` — chỉ thêm dòng.
