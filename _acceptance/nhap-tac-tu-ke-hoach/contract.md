---
schema_version: 1
feature: "Đầu chủ thả file mẫu lạ khi sàn đã bật «Xử lý bằng AI» và thấy máy ghép gần hết, mỗi đề xuất kèm lý do; tắt hay hết trần thì vẫn nhập như không có AI (hàng 68)"
slug: nhap-tac-tu-ke-hoach
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api]
status: draft
design_doc: _acceptance/nhap-tac-tu-ke-hoach/design.md
---

# Acceptance Contract: nhap-tac-tu-ke-hoach

## Context

Màn Nhập Excel (hàng 65–67) ghép cột bằng mẫu đã nhớ, từ điển tiêu đề và bộ dò theo giá trị. Trên **file mẫu lạ** — mọi
tiêu đề ngoài từ điển — nền tất định chỉ ghép đúng 44,8% cột và để lọt 3,6% ô (bộ lạ của hàng này, `so-nen-la.json`), hụt
ngưỡng Kiến trúc «Nhập dữ liệu» §9 (ghép ≥ 95%, lọt ≤ 0,5%) — nên hàng không bị gác (ADR-0011 qđ 7). Hàng này thêm
**tác tử lập kế hoạch** theo ADR-0011 qđ 1–6, 10, 11: chỉ các cột còn chưa ghép được gửi tới Claude dưới dạng hồ sơ cột đã
che, qua thoả thuận mới «Xử lý bằng AI» (`ai_processing`), có trần chi phí theo sàn; người duyệt mọi đề xuất trước khi
ghi. Bất biến chạm: 1 (bảng mới có luật theo dòng), 2 (nguồn không rời công ty — cửa chặn hai lần, trần `source` của
thoả thuận). Thiết kế: `_acceptance/nhap-tac-tu-ke-hoach/design.md`. Migration 035 (số giám sát giữ, luật 25 của đợt).

Dữ liệu mẫu: `[Tên]`, `0900 000 0xx`, `[Tên sàn]`.

## Criteria

- **AC-1 — Ghép gần hết trên file mẫu lạ.** Given bộ bốn file mẫu lạ có đáp án (mọi tiêu đề ngoài từ điển, kiểm bằng máy)
  và đề xuất của Claude cho đúng gói đề xuất mà mã dựng từ mỗi file (băm gói khớp) · When áp đề xuất qua kiểm, gộp và áp kế
  hoạch, coi người đồng ý mọi đề xuất · Then cộng bộ lạ: ghép cột đúng ≥ 95% (nền 44,8%), lỗi lọt ≤ 0,5% (nền 3,6%), ô cần
  người ≤ 10%, rò nguồn 0; trên bộ thử hàng 64 không số đo nào tệ hơn số nền đã commit. Số ghi ở `so-do-tac-tu.json`.
- **AC-2 — Gói gửi đi không chứa nguồn hay dữ liệu cá nhân.** Given mọi file của bộ thử hàng 64 (gồm `ban-nguon-giau`:
  số chủ trong ghi chú, cột liên hệ, tên chủ trong cột toà, số +84) và bộ lạ · When mã dựng gói đề xuất · Then không chuỗi
  cấm nào của đáp án có trong gói; cột lớp `source`, `person_name`, `free_text`, `unknown` không mang giá trị; chỉ cột chưa
  ghép lớp `catalog`/`shareable_listing` mang giá trị; cột đã ghép chỉ mang tiêu đề, hình dạng và đích.
- **AC-3 — Máy chủ chặn lần hai.** (cross-layer) Given một gói giả có số điện thoại (mọi kiểu viết), email, số giấy tờ hay
  dáng họ tên trong tiêu đề hay giá trị, và một gói gắn giá trị cho cột lớp nguồn · When gửi tới đường đề xuất · Then khách
  AI không được gọi; gói có dữ liệu cá nhân trả chế độ tất định kèm lý do và ghi một dòng `ai_usage` kết quả `blocked_pii`
  không chứa chuỗi nào của gói; gói gắn giá trị sai lớp hay có khoá lạ trả 400; gói sạch thì khách được gọi đúng một lần.
- **AC-4 — Thoả thuận «Xử lý bằng AI».** (cross-layer) Given lõi và cơ sở dữ liệu sau migration 035 · When tạo thoả thuận
  `ai_processing` · Then nhận được với chiều ra, bên kia `anthropic`, lớp `catalog` + `shareable_listing`; thêm `source`
  bị từ chối ở lõi (`agreementErrors`, `mayFlow`) và ở ràng buộc cơ sở dữ liệu; loại kết nối lạ vẫn bị ràng buộc `kind` từ
  chối; đường đề xuất chỉ gọi Claude khi sàn có thoả thuận ấy đang hiệu lực, và mỗi cột mang giá trị qua `mayFlow`.
- **AC-5 — Quản trị sàn bật và tắt.** (cross-layer) Given sàn chưa có thoả thuận `ai_processing` · When Quản trị sàn bật
  rồi tắt «Xử lý bằng AI» · Then bật tạo đúng một thoả thuận đang hiệu lực (người duyệt là Quản trị sàn), tắt chuyển nó sang
  tạm ngừng, bật lại dùng lại thoả thuận ấy; Đầu chủ, Trưởng nhóm, người sàn khác bật/tắt nhận 403 hay không thấy; khối Cài
  đặt hiện trạng thái và «Tháng này đã dùng X / Y USD» đủ trạng thái bật, tắt, hết trần, lỗi.
- **AC-6 — Đề xuất được kiểm trước khi tới màn.** Given đề xuất trả về có: khoá lạ, đích ngoài trường chuẩn, đề xuất cho cột
  đã ghép hay cột không gửi, bảng quy đổi cho cột không gửi giá trị hay với khoá không phải giá trị đã gửi, phép biến đổi
  ngoài thực đơn, lý do rỗng, hai cột cùng đích · When kiểm và gộp · Then mỗi đề xuất sai chỉ bỏ đúng cột ấy (cột về «Giữ
  làm ghi chú», độ tin thấp, có câu hỏi), đề xuất đúng vẫn được giữ, kế hoạch gộp qua `validatePlan`, mỗi cột máy đề xuất
  mang lý do của Claude sau tiền tố «Máy đề xuất».
- **AC-7 — Người duyệt mọi đề xuất trước khi ghi.** (cross-layer) Given sàn bật AI và file mẫu lạ · When Đầu chủ thả file ·
  Then bước Ghép cột hiện «Máy đang đề xuất cách ghép…» rồi mỗi cột máy đề xuất mang huy hiệu «Máy đề xuất» và lý do; Tiếp
  khoá kèm «Còn N cột máy đề xuất chưa duyệt» tới khi người đồng ý từng cột, «Đồng ý mọi đề xuất (N)» hay đổi đích; không
  lần ghi nào xảy ra trước khi duyệt; ở 1440 và 375.
- **AC-8 — Không AI vẫn nhập.** (cross-layer) Given lần lượt: sàn chưa bật, thoả thuận tạm ngừng, máy chủ thiếu khoá API,
  khách AI lỗi, khách AI quá 240 giây, đầu ra sai khuôn · When Đầu chủ thả file · Then mỗi ca máy ghép như hàng 65 (cột
  chưa ghép để người ghép tay), màn hiện một dòng nói đúng lý do của ca ấy, đi được tới ghi; ca chưa bật và tạm ngừng
  không gọi đường đề xuất lần nào; ca lỗi, quá giờ, sai khuôn ghi một dòng `ai_usage` đúng kết quả.
- **AC-9 — Trần chi phí theo sàn.** (cross-layer) Given trần `ai.monthly_budget_usd` của sàn và các dòng `ai_usage` tháng
  này (giờ Việt Nam) · When gọi đường đề xuất · Then tổng chưa tới trần thì gọi và ghi một dòng (mô hình, token vào/ra/đọc
  đệm, tiền, thời gian, kết quả `ok`); tổng chạm trần thì không gọi, trả «Hết trần AI tháng này»; dòng tháng trước không
  tính; `ai_usage` chỉ thêm (sửa, xoá bị từ chối) và sàn khác không đọc được (ca cách ly).
- **AC-10 — Nhập lại cùng mẫu không gọi AI.** (cross-layer) Given một lần nhập file mẫu lạ có đề xuất đã duyệt đã ghi xong
  · When nhập lại file cùng mẫu · Then mọi cột ghép theo mẫu đã nhớ, gói đề xuất không có cột chưa ghép và màn không gọi
  đường đề xuất; mẫu đã nhớ không chứa giá trị nào của cột nguồn hay cột tên người.
- **AC-11 — Chỉ vai được nhập gọi đề xuất.** Given đường đề xuất · When gọi bằng Đầu chủ, Trưởng nhóm, Quản trị sàn, Đầu
  khách, người chưa đăng nhập, và sàn khác với thoả thuận của sàn này · Then Đầu chủ, Trưởng nhóm được phục vụ; Quản trị
  sàn, Đầu khách nhận 403; chưa đăng nhập 401; sàn khác không dùng được thoả thuận hay trần của sàn này (đọc theo sàn đang
  chọn).

## Coverage

Quét không gian tiêu chí (preset entity-feature × risk-premortem, skill morphological-scan). Chân sản phẩm: ADR-0011,
Kiến trúc «Nhập dữ liệu» [SUY-TỪ-REPO: docs/adr/0011-nhap-du-lieu-tac-tu.md]. Chân ngành: Flatfile, OneSchema, Ivandt
[NGÀNH: trang sản phẩm Flatfile mapping; nhật ký OneSchema «AI suggested mappings»; tài liệu Ivandt import] — cả ba có
gợi ý ghép bằng AI và bước người xác nhận; Ivandt chỉ gửi tiêu đề.

- Trục **cột** (khi tới bước đề xuất): đã ghép theo mẫu | đã ghép theo từ điển/bộ dò | chưa ghép lớp catalog |
  chưa ghép lớp shareable_listing | chưa ghép lớp source | chưa ghép tên người | chưa ghép chữ tự do | chưa ghép chưa rõ
  [thước CE: `ColumnClass` ở `packages/core/src/import/classify.ts`, bảng §3 Kiến trúc — AC-1, AC-2, AC-6, AC-10]
- Trục **trạng thái AI của sàn**: chưa có thoả thuận | đang hiệu lực | tạm ngừng | hết trần | thiếu khoá | nhà cung cấp lỗi |
  quá giờ | đầu ra sai khuôn [thước CE: ADR-0011 qđ 1 «Sàn tắt AI, hết trần chi phí hay nhà cung cấp lỗi thì nhập vẫn chạy»,
  qđ 4, qđ 10 — AC-4, AC-5, AC-8, AC-9]
- Trục **đề xuất trả về**: đúng | khoá lạ | đích lạ | cột không được hỏi | quy đổi trái phép | phép biến đổi lạ | lý do rỗng |
  trùng đích [thước CE: khuôn `ImportPlan` Kiến trúc §4, `validatePlan` — AC-6]
- Trục **người gọi**: Đầu chủ | Trưởng nhóm | Quản trị sàn | Đầu khách | chưa đăng nhập | sàn khác [thước CE: ADR-0011
  qđ 11, bất biến 1 — AC-5, AC-11]
- Trục **lớp** (cross-cutting): trình duyệt dựng gói | máy chủ quét lại | cơ sở dữ liệu ràng buộc [thước CE: «chặn hai lần»
  ADR-0011 qđ 2 — AC-2, AC-3, AC-4]

Later: vòng tác tử bốn công cụ (`lookup_catalog`, `try_transform`, `request_values`, `submit_plan`) — mở khi AC-1 một lần gọi
hụt ngưỡng · ô lạ còn lại có đề xuất (hàng 69) · màn sổ chi phí chi tiết theo lần nhập · trần nền tảng ở không gian làm
việc Anthropic (vận hành). Never: tác tử đọc dòng hay ô nguồn (trái bất biến 2) · nhập thẳng không xem trước (ADR qđ 1).

## Đường đo

| Thước của ô cơ hội | Số từ đâu | AC bảo đảm |
| --- | --- | --- |
| Máy ghép đúng phần lớn cột hơn nền hàng 64 trên file mẫu lạ | `so-do-tac-tu.json` so `so-nen-la.json` (lệnh `thu/do-tac-tu.ts`) | AC-1 |
| Mỗi đề xuất có lý do và người duyệt trước khi ghi | lý do sau tiền tố «Máy đề xuất» ở kế hoạch gộp; khoá Tiếp ở màn | AC-6, AC-7 |
| Số chủ nhà, giá đáy không rời công ty sang dịch vụ AI | bộ kiểm rò trên gói đề xuất; dòng `blocked_pii` | AC-2, AC-3 |
| Tắt AI hay hết trần thì nhập như không có AI | ca không AI ở màn và đường đề xuất | AC-8, AC-9 |

## Out of scope

- Vòng tác tử nhiều lượt có công cụ (ADR qđ 4) — bản này một lần gọi có khuôn đầu ra; mở khi số đo AC-1 hụt.
- Ô lạ còn lại sau khi áp kế hoạch (giá dải, «thu về 4.2») — hàng 69.
- Màn sửa trần chi phí (trần đọc từ sổ cấu hình, mặc định 10 USD) và màn sổ chi phí theo lần nhập.
- Dọn từ điển định kỳ bằng AI (hàng 71), chuẩn hoá ở mọi cửa gõ tay (hàng 70).
- Việc vận hành ngoài kho: tài khoản Claude API của OneHub, đặt khoá vào Vercel, trần chi tiêu nền tảng; người pháp lý rà
  bốn câu của ADR-0011 qđ 2 trước sàn đầu tiên ngoài đội.

## Notes

- Nguồn: hàng 68 lộ trình (`docs/plan/lo-trinh.json`), ô cơ hội đã ký «build» 05/11.
- Known limits đề xuất: một lần gọi có thể vượt trần tháng tối đa một lần gọi (≤ ~1,3 USD theo Kiến trúc §7) vì tiền chỉ
  biết sau khi gọi; chi phí và thời gian thật mỗi lần nhập chỉ đo được khi có khoá (Hỏi-1).
