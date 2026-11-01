---
schema_version: 1
feature: Mỗi người làm việc với sàn là một liên hệ (RESO Contacts) — một người, nhiều số, nhiều loại liên hệ, một người giữ; lead và hàng gắn vào liên hệ chủ nhà
slug: lien-he
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, db]
status: implemented
design_doc: docs/superpowers/specs/2026-11-01-lien-he-design.md
approved_by: Manh Phan
approved_at: 2026-11-01
---

# Acceptance Contract: lien-he

## Context

Hàng 85 của lộ trình (dãy L, đợt `dau-chu-dong-vao`), Cổng Đáng: build (Manh Phan 01/11). Đứng trên hàng 27 (lead bốn
nấc, ADR-0020), hàng 11 (lớp trường nguồn, ADR-0010), hàng 24 (ô nhận lead), hàng 62 (mã hoá số chủ, ADR-0013). Chạm
cơ sở dữ liệu (migration `016`, `t3_paths`) nên hạng T3. Không có màn: màn liên hệ và liên hệ khách là hàng 86; cơ chế
định nghĩa trường riêng là hàng 47. Câu Hỏi-1..5 soạn theo khuyến nghị; chủ kho chốt ở Cổng Phạm vi.

Source input: `docs/plan/lo-trinh.json` hàng 85 · `_acceptance/lien-he/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-11-01-lien-he-design.md` (bảng đối chiếu RESO §1) · yêu cầu L-12 và trả lời của giám sát

Từ ngữ: «liên hệ» = một người của sàn (RESO `Contacts`); «loại liên hệ» = RESO `ContactType` (Multi): Chủ bán `Seller`,
Chủ cho thuê `Landlord`, Người mua `Buyer`, Người thuê `Tenant`; «liên hệ chủ nhà» = liên hệ mang `Seller` hay `Landlord`;
«người giữ» = RESO `OwnerMemberKey`, một đầu chủ; «dấu vết số» = HMAC theo sàn của ADR-0013; «bộ mẫu» =
`packages/db/seed/mau/du-lieu-mau.json` của hàng 5.

## Criteria

- AC-1: Given lõi của `packages/core`, When dựng loại liên hệ, Then thực đơn đúng bốn giá trị RESO `Seller · Landlord ·
  Buyer · Tenant` với nhãn Chủ bán · Chủ cho thuê · Người mua · Người thuê; nhu cầu của lead ra loại (Bán → `Seller`, Cho
  thuê → `Landlord`, Cả hai → cả hai); liên hệ mang `Seller` hay `Landlord` là lớp nguồn; bản xem của liên hệ cho người
  không được xem chỉ nói «không thấy», cho người được xem không bao giờ có số; trạng thái Lead/Liên hệ của
  người suy từ dữ kiện — `contact` khi có mốc gọi lần đầu trên một lead của họ hay có hàng gắn họ, ngược lại `lead` (KW).
- AC-2: Given migration 016, When đọc lược đồ và gọi bằng vai API, Then có bảng liên hệ và bảng số của liên hệ bật và ép
  luật theo dòng theo sàn; một dấu vết số chỉ thuộc một liên hệ trong sàn; mỗi số mang nhãn `Home · Mobile · Work ·
  Other` và đúng một số chính trên mỗi liên hệ; vai API không đọc được bản mã hay dấu vết, không
  ghi thẳng hai bảng; liên hệ chủ nhà chỉ người giữ (còn vai Đầu chủ) và trưởng nhóm đọc được — liên hệ chưa có người giữ chỉ trưởng nhóm đọc; chỗ trường riêng có mặt và
  giữ rỗng; lược đồ không có cột số dạng chữ nào chưa bị chặn.
- AC-3: Given telesales nhập lead qua `POST /api/v1/leads`, When số chưa thuộc liên hệ nào, Then máy tạo một liên hệ chủ nhà
  với loại theo nhu cầu, thêm số vào liên hệ và lead mang mã liên hệ ấy; số đã thuộc một liên hệ thì lead gắn đúng liên hệ
  ấy, không tạo liên hệ mới; telesales không đọc được liên hệ hay số của nó qua bất kỳ lối nào (404), thân trả của lead không
  có mã liên hệ, số chủ hay mã hàng (Hỏi-4).
- AC-4: Given một chủ nhà có hai số — số A trên chủ nhà của một hàng do đầu chủ 1 giữ, số B trên một lead đã về đầu chủ 1 —
  đã gộp vào cùng một liên hệ, When telesales nhập lead mới với số B rồi với số A, Then cả hai lead ra «chủ đã có đầu chủ»
  về đầu chủ 1 và gắn cùng liên hệ; đối chứng: số của một liên hệ khác ra đúng người giữ liên hệ ấy; số chưa thuộc ai ra
  «không trùng»; số của liên hệ đã thôi người giữ (lead trả lại) ra «không trùng», không về đầu chủ đã trả.
- AC-5: Given đầu chủ ghi chủ nhà của hàng qua `PUT /api/v1/listings/{id}/owner`, When số đã thuộc một liên hệ hay chưa,
  Then chủ nhà của hàng gắn liên hệ của số (hay liên hệ mới mang `Seller`), liên hệ chưa có người giữ thì nhận đầu chủ giữ
  căn; giá đáy vẫn theo từng hàng; «Mở số» của hàng 11 vẫn trả đúng số và ghi một sự kiện mở số; người giữ liên hệ chỉ đặt
  khi liên hệ chưa có người giữ (Hỏi-3).
- AC-6: Given lead đã trả lại, When người nhập «Sửa số và gửi lại» với số mới chưa thuộc liên hệ nào, Then lead mới gắn cùng
  liên hệ của lead cũ và số mới thêm vào liên hệ ấy (liên hệ có hai số); số mới đã thuộc liên hệ khác thì lead mới gắn liên
  hệ của số mới, không gộp hai liên hệ; lead cũ trả lại mà liên hệ không còn hàng hay lead đang mở nào khác thì liên hệ thôi
  có người giữ.
- AC-7: Given lead đã về đầu chủ (chưa trả lại, chưa bỏ, không căn trùng), When đầu chủ của lead gọi
  `POST /api/v1/leads/{id}/listing`, Then máy tạo một hàng mang mã lead, toà và căn của lead, chủ nhà là liên hệ của lead,
  đầu chủ giữ căn — 201; người khác → 404, lead đã có hàng → 409, lead trả lại hay căn trùng → 409, chưa đăng nhập → 401;
  «Lên bảng» của lead (và của số đo `app.lead_board_metric`) là lần đầu hàng mang mã lead ấy — hay lead gửi lại sau nó trong
  chuỗi — sang Sẵn sàng bán; hàng cùng số mà không mang mã lead thì không làm lead lên bảng (Hỏi-2).
- AC-8: Given một liên hệ chủ nhà, When người giữ (hay trưởng nhóm) gọi `PATCH /api/v1/contacts/{id}` thêm `Buyer`, Then vẫn là
  một liên hệ, cùng số, loại ra `Seller, Buyer`; liên hệ vẫn lớp nguồn; `GET /api/v1/contacts/{id}` của người giữ ra tên, loại,
  người giữ, số lượng số — không số; người không được xem (đầu chủ khác, telesales, quản trị, người sàn khác) → 404; khoá lạ
  hay loại ngoài thực đơn → 400; bỏ hết loại → 400; liên hệ còn hàng hay còn lead đang mở phải giữ ít nhất một loại
  chủ nhà (`Seller` hay `Landlord`) — bỏ hết loại chủ nhà → 400; liên hệ không còn liên kết nào thì bỏ được.
- AC-9: Given sàn có dữ liệu cũ của hàng 11, 24, 27 (chủ nhà của hàng, lead, trong đó hai dòng cùng dấu vết số khác đầu chủ),
  When chạy migration 016 rồi chạy lại, Then mỗi dấu vết số của sàn thành đúng một liên hệ, chủ nhà của hàng và lead đều gắn
  liên hệ, bản mã chép kèm ngữ cảnh gốc và «Mở số» vẫn giải được; liên hệ gộp từ nhiều đầu chủ nhận người giữ là đầu chủ có
  lần gán hay lần chia mới nhất và có mặt trong danh sách gộp cho trưởng nhóm (Hỏi-1); chạy lại không đổi số dòng; sàn khác
  không bị gộp chéo; cột số, dấu vết của chủ nhà của hàng và của lead giữ nguyên từng byte (gỡ gộp được); migration in số
  lead và số liên hệ gộp từ nhiều đầu chủ của từng sàn lúc chạy.
- AC-10: Given tài liệu của kho, When đọc Tham chiếu, CONTEXT.md và ADR-0021, Then Tham chiếu có mục «Tri thức ngành và RESO»
  với bảng đối tượng ↔ RESO ↔ khái niệm ngành; CONTEXT.md có «Liên hệ», «Loại liên hệ», «Người giữ» và dòng «Lead» viết lại
  theo Hỏi-5 (trạng thái của liên hệ chưa nói chuyện hai chiều, bản ghi lead là cơ hội pha đầu); nhãn loại liên hệ trong CONTEXT.md khớp nhãn của lõi; ADR-0021 có mục chờ cho hàng 47 về lớp nguồn của trường
  riêng của liên hệ.

## Coverage

Quét morphological-scan, preset entity-feature, cho thực thể «một người làm việc với sàn».

- Trục cửa vào của người: nhập lead (AC-3) · ghi chủ nhà của hàng (AC-5) · gửi lại (AC-6) · dữ liệu cũ (AC-9) · tạo hàng
  từ lead (AC-7) [thước CE: câu giao hàng 85, Tham chiếu §3 «ba cửa vào, một đích»]
- Trục số: một số · hai số một người · số đã thuộc người khác · số chưa thuộc ai (AC-3, AC-4, AC-6)
- Trục loại: Chủ bán · Chủ cho thuê · cả hai · Chủ bán + Người mua (AC-1, AC-3, AC-8)
- Trục người giữ: chưa có · đặt khi có đầu chủ đầu tiên · không tự đổi khi giao lại · bỏ khi hết liên kết (AC-5, AC-6, Hỏi-3)
- Trục ai xem: người giữ · trưởng nhóm · đầu chủ khác · telesales · quản trị · sàn khác · chưa đăng nhập (AC-2, AC-3, AC-8)
- Trục lên bảng: hàng mang mã lead · chuỗi gửi lại · hàng cùng số không mang mã (AC-7)
- Trục chuyển dữ liệu: gộp một sàn · khác đầu chủ · chạy lại · hai sàn (AC-9)
- Trục rò: số · mã liên hệ cho telesales · mã hàng · sàn khác (AC-2, AC-3, AC-8)
- Trục lớp: lõi (AC-1) · cơ sở dữ liệu (AC-2, AC-9) · API (AC-3..AC-8) · tài liệu (AC-10)
- Bỏ: trục màn — hàng không có màn (dòng `descope` «bỏ design-pass»).

## Đường đo

Ô cơ hội không khai ngưỡng số; câu «Kết quả nào là SỐNG» của ô đo bằng chính AC-3..AC-10. Số đo «Số ngày lead → Sẵn sàng
bán» của hàng 27 đổi định nghĩa lên bảng sang dữ kiện ← AC-7 (câu tính `app.lead_board_metric` giữ nguyên lối gọi).

## Out of scope

- Liên hệ khách: đầu khách lưu Người mua, Người thuê gắn nhu cầu, Lần gửi, lịch xem — hàng 86.
- Cơ chế định nghĩa trường riêng theo loại liên hệ và việc nới ADR-0018 quyết định 8 cho lớp nguồn — hàng 47.
- Màn liên hệ (xem, sửa, gộp tay hai liên hệ) — hàng sau.
- Bỏ hẳn `listing_owners` để dời sang bảng nối liên hệ ↔ hàng theo RESO `ContactListings` — việc sau.
- Đổi người giữ liên hệ khi trưởng nhóm giao lại hàng, và báo lệch người giữ ↔ đầu chủ giữ căn — Hôm nay của trưởng nhóm,
  hàng 42 (Hỏi-3).
- Tên, địa chỉ, email và các trường RESO khác của liên hệ ngoài tên, loại, số, người giữ.
- Nguồn lead (KW Lead Source — nguồn ngoài hay liên hệ giới thiệu), quan hệ giữa các liên hệ (KW Relationships), thẻ, người
  cùng xem (KW Collaborators) — hàng sau.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Bất biến chạm: (1) cách ly — hai bảng mới bật và ép luật theo dòng; ca trong `packages/db/tests/isolation.test.mjs`;
  (2) chủ nhà — liên hệ chủ nhà trọn lớp nguồn, số chỉ ở dạng bản mã, cột số không cấp đọc; (3) người bấm gửi — không chạm;
  (4) trang khách — không chạm.
- Migration `016` và ADR-0021 giữ chỗ ở giám sát. Năm hàm cũ (`lead_dedupe_facts`, `lead_board_at_all`, `return_lead`,
  `route_lead`, `reassign_lead`, `claim_lead`) đổi bằng `create or replace` cùng chữ ký; bộ kiểm của hàng 11, 24, 25, 27, 62
  phải xanh — các ca của hàng 27 dựng «lên bảng» bằng hàng cùng số đổi sang tạo hàng từ lead theo AC-7; tên đúng các ca ấy ở
  dòng sổ «ca hàng 27 đổi theo AC-7».
- Hỏi-1 và Hỏi-2 chạm dữ liệu đã có trên mọi sàn khi deploy (khó đảo): đảo bằng gỡ gộp từ cột số cũ giữ nguyên (AC-9).
- S3 chỉ bắt đầu sau khi hàng 17 gộp và nhánh đã gộp nhánh chính (giám sát, trùng tệp).
- Việc thêm do giám sát giao ở S3 (01/11, sổ quyết định): bộ nạp mẫu bản thật `packages/db/seed/nap.mjs` (hàng 87) phải chạy
  sau 016–020 — ca kiểm nạp rồi nạp lại ra 30 liên hệ Chủ bán, 12 lead gắn liên hệ, không đổi gì; chỉ chạm seed sau khi hàng
  va-nap-mau của dãy D gộp. CONTEXT.md ghi «liên hệ» là đối tượng (RESO Contact) và nút «Liên hệ đầu chủ» (hàng 33) là chỗ
  va chữ để hàng 33 hỏi đổi nhãn — hàng 85 không tự đổi nhãn.
