---
schema_version: 1
feature: Số điện thoại chủ nhà nằm trong cơ sở dữ liệu ở dạng mã hoá; chỉ cửa «Mở số» giải ra số cho người được thấy, đọc thẳng bảng hay bản sao lưu không ra số
slug: ma-hoa-so-chu
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, db]
status: implemented
approved_by: Manh Phan
approved_at: 2026-11-01
design_doc: docs/superpowers/specs/2026-10-31-ma-hoa-so-chu-design.md
---

# Acceptance Contract: ma-hoa-so-chu

## Context

Hàng 62 của lộ trình (dãy G, đợt dau-chu-dong-vao), đứng trên hàng 11 (`lop-truong-nguon`, ADR-0010): cửa «Mở số»
duy nhất đã có nhưng số chủ còn nằm rõ trong cột `listing_owners.owner_phone`. Chủ kho đặt điều kiện «phải xong trước
dữ liệu thật» (sổ hàng 11, `d-20261031T034503Z-16`). Bất biến chạm: 2 (lớp `source` — chỉ chặn thêm, trần
`never_leaves_company` không đổi) và 1 (luật theo dòng của `listing_owners` giữ nguyên, không bảng mới). Số giữ chỗ do
giám sát cấp (trả lời G-1): migration `008_ma_hoa_so_chu.sql`, `docs/adr/0013-ma-hoa-so-chu.md`.

Source input: `docs/plan/lo-trinh.json` hàng 62 · `_acceptance/ma-hoa-so-chu/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-10-31-ma-hoa-so-chu-design.md` · trả lời G-1 của giám sát (phủ số chủ của lead hàng 24).

Từ ngữ: «số mẫu» = `0900 000 0xx`; «bốn dạng của số» = `0900000012`, `0900 000 012`, `+84900000012`, `84900000012`;
«bản mã» = giá trị `bytea` khuôn `0x01 ‖ nonce 12 ‖ thẻ 16 ‖ bản mã`; «dấu vết» = HMAC 32 byte của số theo sàn;
«vai chủ» = vai sở hữu bảng (local: `postgres`; thật: `quy_hang_owner`, `bypassrls`); «người thấy nguồn» như hàng 11.

## Criteria

**AC-1 — Mã hoá khứ hồi, bản mã không mang số.**
Given khoá thử 32 byte và số mẫu `0900000012` với ngữ cảnh `listing_owners:<sàn>:<hàng>`
When mã hoá rồi giải mã với cùng khoá, cùng ngữ cảnh
Then giải ra đúng `0900000012`; bản mã mở đầu byte `0x01`, dài 1+12+16+10 byte; hai lần mã hoá cùng số ra hai bản mã
khác nhau; bản mã viết dưới dạng hex, base64 và utf8 không chứa dạng nào trong bốn dạng của số.

**AC-2 — Bản mã gắn đúng dòng, đúng khoá, không bị sửa.**
Given một bản mã hợp lệ của số mẫu
When giải mã với ngữ cảnh của hàng khác, của sàn khác, với khoá khác, hoặc sau khi đổi một byte bất kỳ (phiên bản,
nonce, thẻ, thân)
Then mỗi lần đều ném lỗi; thông điệp lỗi không chứa số ở bốn dạng và không chứa khoá.

**AC-3 — Dấu vết để kiểm trùng mà không cần số.**
Given khoá thử và hai sàn
When tính dấu vết của cùng một số viết ở bốn dạng (sau chuẩn hoá của lõi) trong cùng sàn, của cùng số ở sàn kia, và
của số mẫu khác
Then cùng số cùng sàn → cùng dấu vết 32 byte; khác sàn → khác; khác số → khác; dấu vết không chứa số ở bốn dạng và
khác HMAC tính bằng chính khoá mã hoá (khoá con tách riêng).

**AC-4 — Thiếu khoá thì máy chủ không dựng API thay vì ghi số rõ.**
Given môi trường chạy
When `NODE_ENV=production` mà thiếu `OWNER_PHONE_KEY` hay khoá là khoá dev; hoặc ở môi trường bất kỳ khoá sai dạng
(không base64, khác 32 byte)
Then dựng API (`createApi`) ném lỗi nêu tên biến `OWNER_PHONE_KEY`, không nêu giá trị khoá; ngoài production thiếu khoá
thì API dựng được và vẫn ghi bản mã (khoá dev), không có đường ghi số rõ; khoá sinh bằng đúng lệnh ghi trong ADR-0013
qua được bộ đọc khoá dưới `NODE_ENV=production`.

**AC-5 — Cơ sở dữ liệu từ chối số rõ ở mọi bảng, mọi vai.** (bất biến 2)
Given cơ sở dữ liệu đã áp migration 008
When vai chủ hay vai API chèn hoặc sửa `listing_owners.owner_phone` khác null; chèn bản mã sai khuôn; vai API đọc
`owner_phone`, `owner_phone_enc` hay `owner_phone_hash`; và khi quét mọi cột kiểu chữ tên chứa `phone` ở mọi schema
không thuộc hệ thống
Then chèn/sửa số rõ và bản mã sai khuôn bị từ chối nêu tên ràng buộc; vai API bị `permission denied` trên ba cột; mọi
cột chữ tên chứa `phone` mang ràng buộc `check (<cột> is null)`, cột nào thiếu thì ca nêu tên bảng.cột; bộ kiểm cách ly
trọn bộ xanh.

**AC-6 — Ghi chủ nhà qua API chỉ để lại bản mã.** (cross-layer)
Given đầu chủ giữ căn của một hàng
When `PUT /api/v1/listings/{id}/owner` với số mẫu
Then dòng `listing_owners` có `owner_phone` null, `owner_phone_enc` và `owner_phone_hash` có giá trị; đọc toàn bộ dòng
của `listing_owners`, `owner_phone_reveals`, `listing_events` của hàng ấy bằng vai chủ dưới dạng chữ (cả mã hoá hex,
base64, escape của từng cột bytea) không có số ở bốn dạng; `GET …/owner` trả `hasPhone: true` và không số.

**AC-7 — «Mở số» vẫn trả đúng số và ghi một sự kiện mỗi lần.** (cross-layer)
Given hàng có số chủ đã ghi qua API
When người thấy nguồn gọi `POST …/owner/phone-reveal` bốn lần; người không thấy nguồn gọi một lần; vai API gọi thẳng
`app.reveal_owner_phone`
Then người thấy nguồn nhận `{ ownerPhone: "0900000012" }` mỗi lần và `owner_phone_reveals` tăng đúng 4; người không thấy
nhận 403 `listing-agent-required` và không thêm dòng; hàm cơ sở dữ liệu trả `bytea` — không phải chữ số.

**AC-8 — Bản mã chép sang dòng khác hay bị sửa thì không ra số.** (cross-layer)
Given hai hàng A, B cùng sàn có số chủ khác nhau
When vai chủ chép bản mã của A sang B, hoặc đổi một byte bản mã của B, rồi người thấy nguồn mở số của B
Then trả lời là lỗi, thân không chứa số của A hay B ở bốn dạng; `owner_phone_reveals` của B không thêm dòng nào.

**AC-9 — Dữ liệu đã có được mã hoá lại bằng một lệnh chạy lại không đổi kết quả.** (cross-layer)
Given (trong một giao dịch hoàn lại) ba dòng `listing_owners` mang số rõ ở hai sàn
When chạy `maHoaLai` lần một, rồi lần hai; và chạy lệnh dòng lệnh `ma-hoa-lai.ts` hai lần trên Postgres dãy
Then lần một: ba dòng có bản mã và dấu vết, `owner_phone` null, ràng buộc `listing_owners_phone_chi_ban_ma` đã
`validated`, người thấy nguồn mở số mỗi dòng qua `POST …/owner/phone-reveal` ra đúng số của dòng ấy và
`owner_phone_reveals` tăng đúng 3; lần hai: 0 dòng đổi, bản mã và dấu vết giữ nguyên từng byte; đầu ra lệnh (stdout,
stderr) mọi lần không có số ở bốn dạng và không có khoá, mã thoát 0. Lệnh chạy khi thiếu `OWNER_PHONE_KEY`, khoá sai
dạng hay khoá trùng khoá dev thì thoát khác 0 nêu tên biến, và số dòng số rõ trước và sau bằng nhau (không bao giờ rơi
về khoá dev).

**AC-10 — Người vận hành biết khoá ở đâu và mất khoá thì mất gì.** (judgment)
Given ADR-0013, `.env.example`, Tham chiếu §12
When người vận hành đọc chúng để đặt khoá thật và chạy mã hoá lại
Then ADR nêu: cách sinh khoá (một lệnh trong khối mã, đầu ra qua được bộ đọc khoá — đo ở AC-4), chỗ giữ (Vercel
Production; Preview theo Hỏi-1; bản ngoài Vercel theo Hỏi-3), mất khoá thì mất mọi số chủ, cách chạy lệnh mã hoá lại và đếm trước khi chạy, việc xoá cột `owner_phone` là
hàng sau; `.env.example` có dòng `OWNER_PHONE_KEY=` không giá trị; Tham chiếu có dòng sổ quyết định trỏ ADR-0013.

**AC-11 — Số chủ của lead cũng chỉ ở dạng bản mã.** (cross-layer)
Given cơ sở dữ liệu đã áp migration 007 (bảng `leads` của hàng 24), 008 và 009; một người nhập lead của sàn
When nhập lead qua `POST /api/v1/leads` với số mẫu; và (trong một giao dịch hoàn lại) có dòng lead cũ mang số rõ rồi
chạy lệnh mã hoá lại
Then dòng `leads` có `owner_phone` null, `owner_phone_enc` (ngữ cảnh `leads:<company_id>:<lead_id>`, giải ra đúng số)
và `owner_phone_hash` có giá trị; đọc dòng lead bằng vai chủ dưới dạng chữ không thấy số ở bốn dạng; vai API không đọc
được ba cột số của lead; chèn hay sửa `leads.owner_phone` khác null bị từ chối nêu tên ràng buộc
`leads_phone_chi_ban_ma`; lệnh mã hoá lại chuyển dòng lead số rõ sang bản mã và dấu vết, validate ràng buộc ấy, chạy
lại không đổi byte; bản trả cho telesales vẫn không mang số; lead không mang số nào (cả ba cột số null) bị từ chối nêu tên
ràng buộc `leads_phone_co_so`; «Bỏ lead này» trên một lead cũ còn số rõ bị từ chối nêu tên ràng buộc cho tới khi chạy lệnh
mã hoá lại, rồi chạy được — nên lệnh mã hoá lại phải chạy ngay sau khi áp migration.

**AC-12 — Kiểm trùng lúc nhập lead so dấu vết, không so số.** (cross-layer)
Given chủ nhà mang số mẫu trên một hàng đã có đầu chủ, và một lead trước cùng số đã về một đầu chủ
When telesales nhập lead mang số ấy (viết `0900 000 0xx` hay `+84…`); và nhập lead cùng số ở sàn khác
Then kết quả kiểm trùng giữ đúng luật của hàng 24 (lead về đầu chủ giữ chủ nhà, `+84` vẫn khớp); hàm
`app.lead_dedupe_facts` nhận dấu vết (`bytea`) thay cho số — không còn hàm nào của cơ sở dữ liệu nhận số chủ dạng chữ;
lead ở sàn khác không khớp chủ nhà của sàn này, và hai lead cùng số ở hai sàn mang dấu vết khác nhau.

## Coverage

Quét không gian bằng `morphological-scan` (preset risk-premortem). Chân sản phẩm: `[SUY-TỪ-REPO:
docs/architecture/kien-truc-repo-va-stack.md]` §8, ADR-0009 §9–10, ADR-0010. Chân ngành: `[NGÀNH: OWASP ASVS 4.0 V6
Stored Cryptography]` (mã hoá có xác thực, khoá ngoài kho dữ liệu, không khoá mặc định ở production), `[NGÀNH: NIST SP
800-38D]` (GCM: nonce không lặp, thẻ 128 bit). Thước CE: bảng trạng thái cửa «Mở số» trong thiết kế + ba trục dưới;
coverage «đủ-để-bắt-đầu» — kiểm toán pháp lý thật (Luật Bảo vệ dữ liệu cá nhân 2026, `⏱ verify-current`) là của người
pháp lý trước dữ liệu thật (ADR-0009 §10), không phải của hàng này.

- Trục A — đường vào số: ghi qua API (AC-6) | dòng cũ số rõ (AC-9) | chèn thẳng bằng vai chủ hay vai API (AC-5) | bảng
  mới của hàng khác có cột số (lead hàng 24 — quét lược đồ AC-5).
- Trục B — đường ra: Mở số đúng người (AC-7) | Mở số sai người (AC-7) | đọc bảng thẳng / bản sao lưu (AC-5, AC-6) |
  thông điệp lỗi, nhật ký, đầu ra lệnh (AC-2, AC-4, AC-8, AC-9) | sự kiện của hàng (AC-6; ràng buộc
  `listing_events_no_source` của hàng 11 giữ).
- Trục C — khoá và bản mã: khoá đúng (AC-1) | thiếu khoá production (AC-4) | thiếu khoá dev (AC-4) | khoá sai dạng
  (AC-4) | khoá khác (AC-2) | bản mã bị sửa (AC-2, AC-8) | bản mã chép sang dòng khác (AC-2, AC-8) | dấu vết so trùng
  (AC-3).
- Trục A thêm: bảng lead của hàng 24 (gộp trước 62 theo lệnh giám sát) — ghi qua API và dòng cũ (AC-11); trục C thêm:
  dấu vết so trùng lead với chủ nhà và lead với lead (AC-12).
- Later: xoay khoá (byte phiên bản đặt sẵn) · xoá cột `owner_phone` · kiểm trùng mở rộng ngoài ô nhận lead (hàng kiểm trùng).
- Never: mã hoá trong cơ sở dữ liệu bằng pgcrypto — khoá phải đi vào phiên cơ sở dữ liệu, trái ADR-0009 §9.
- `[GIẢ ĐỊNH]` chờ gạch: cột số điện thoại ở mọi bảng đều có `phone` trong tên (quy ước RESO-first; quét AC-5 dựa trên
  tên). Cột số đặt tên khác (ví dụ `mobile`) sẽ lọt quét.

## Đường đo

Ngưỡng SỐNG của `opportunity.md`, từng vế:
- «mọi dòng số chủ là bản mã, truy vấn thẳng bằng vai chủ bảng không thấy chữ số nào của số gốc» — số từ đọc dòng bằng
  vai chủ dạng chữ ở test API trên Postgres · AC-5, AC-6.
- «Mở số trả đúng số và vẫn ghi một sự kiện mỗi lần» — đếm `owner_phone_reveals` trước/sau · AC-7.
- «thiếu khoá thì máy chủ không khởi động thay vì ghi số rõ» — `createApi` ném dưới `NODE_ENV=production` · AC-4.
- «dữ liệu mẫu đã có được mã hoá lại bằng một lệnh chạy lại không đổi kết quả» — so byte bản mã giữa hai lần chạy ·
  AC-9. Bộ dữ liệu mẫu của kho chưa nạp chủ nhà vào cơ sở dữ liệu (`packages/db/seed/nap.mjs` dòng 2: chủ nhà còn trong
  tệp, chờ các hàng dựng bảng), nên «dữ liệu đã có» là dòng ghi qua API của hàng 11; AC-9 cấy đúng dạng dòng ấy.
- «bộ kiểm cách ly xanh» — mã thoát `npm run db:migrate && npm run db:test` trên Postgres dãy G · AC-5.

- Vế lead của ngưỡng «mọi dòng số chủ là bản mã» — quét dòng lead bằng vai chủ · AC-11.

## Out of scope

- Xoá cột `owner_phone` — migration của hàng sau, sau khi cơ sở dữ liệu thật đã chạy lệnh mã hoá lại.
- Xoay khoá — byte phiên bản `0x01` đặt sẵn; lệnh xoay để sau.
- Kiểm trùng mở rộng ngoài ô nhận lead (hàng kiểm trùng). Hàm kiểm trùng của ô nhận lead (`app.lead_dedupe_facts`) thì
  hàng này chuyển sang so dấu vết (AC-12, nhánh «24 gộp trước»).
- Đặt khoá thật ở Vercel, cất bản ngoài máy, chạy lệnh mã hoá lại trên cơ sở dữ liệu thật — việc vận hành của chủ kho
  và giám sát, qua yêu cầu `can-nguoi` sau gộp.
- Số chủ trên máy (hàng 13), ảnh sổ, mọi màn.

## Notes

- **Hàng 24 đã gộp trước (giám sát chốt 31/10, PR #44 vào main 16:08Z)** — nhánh «24 gộp trước» dưới đây áp dụng:
  AC-11, AC-12 thêm qua Cổng Phạm vi lại; **migration thứ hai `009_ma_hoa_so_lead.sql`** (giám sát cấp ở G-4 — hook kho
  chặn sửa 008 đã commit; hàng 18 dời sang 012; 62 phải gộp trước hàng 25 vì 011 cần `leads.owner_phone_hash`) chuyển
  `leads.owner_phone` và đổi `app.lead_dedupe_facts`;
  sửa `packages/api/src/leads/{store,routes}.ts` và `packages/api/test-db/leads.test.ts` (yêu cầu chạm tệp G-3).
- **Thứ tự gộp với hàng 24 (ô nhận lead, dãy L — migration 007 thêm `leads.owner_phone` và hàm
  `app.lead_dedupe_facts` so số dạng chữ rõ).** 62 gộp trước: hàng 24 phải dùng đường mã hoá của 62 — cột
  `owner_phone_enc bytea` + `owner_phone_hash bytea`, `maHoaSo(so, "leads:<company_id>:<lead_id>")`,
  `dauVetSo(so, companyId)` từ `packages/api/src/owners/ma-hoa.ts`, hàm kiểm trùng so `owner_phone_hash`; ca quét lược
  đồ của AC-5 đỏ nếu 24 lưu số dạng chữ. 24 gộp trước: migration 008 chuyển `leads.owner_phone` theo cùng khuôn, đổi
  thân hàm kiểm trùng sang so dấu vết, lệnh mã hoá lại phủ bảng `leads` — kèm tiêu chí mới qua Cổng Phạm vi lại.
- So trùng bằng dấu vết có khoá hay cách khác là Hỏi-2 của thiết kế; bản khoá ngoài Vercel và rủi ro mất khoá là Hỏi-3.

- Sửa ca có sẵn ngoài vùng (trả lời G-1 cho phép, khai ở đây cho chủ kho thấy): `packages/db/tests/isolation.test.mjs`
  ba ca đang chèn và đọc số rõ (quanh dòng 517, 572, 637) đổi sang bản mã; `packages/api/test-db/owners.test.ts` dòng
  93–94 đọc cột số rõ.
