---
schema_version: 1
feature: Đầu chủ giữ căn thấy chủ nhà, số điện thoại và giá đáy của căn mình; người khác trong sàn mở cùng hồ sơ thì không thấy, và mỗi lần mở số chủ thành một sự kiện
slug: lop-truong-nguon
owner: omre.cnsp4@onemount.com
risk_tier: T3
surfaces: [api, db]
status: signed-off
design_doc: docs/superpowers/specs/2026-10-31-lop-truong-nguon-design.md
approved_by: Manh Phan
approved_at: 2026-10-31T03:44:46Z
---

# Acceptance Contract: lop-truong-nguon

## Context

Hàng 11 của lộ trình (nền, dãy N, đợt nen-2), đứng trên hàng 8 (lõi hàng và sự kiện). Tham chiếu §6 «lớp trường»,
bất biến 2 (thông tin chủ nhà không rời công ty). Hàng này dựng lõi — ba bảng có luật theo dòng, một hàm mở số, luật ở
`packages/core/src/access/`, lối API ở `packages/api/src/owners/` — chưa có màn. Gán đầu chủ cho hàng đi cùng hàng này
(sổ hàng 8, lời chủ kho ở Cổng Phạm vi). Ba câu Hỏi-1..3 của bản thiết kế soạn theo khuyến nghị; chủ kho chốt ở
Cổng Phạm vi.

Source input: `docs/plan/lo-trinh.json` hàng 11 · `_acceptance/lop-truong-nguon/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-10-31-lop-truong-nguon-design.md`

Từ ngữ: «đầu chủ giữ căn» = thành viên sàn được ghi là đầu chủ của hàng và còn vai Đầu chủ; «người thấy nguồn» = đầu
chủ giữ căn hoặc thành viên có vai Trưởng nhóm (theo Hỏi-2); «đầu chủ giữ căn» theo luật nhận căn của Hỏi-3; «ba trường nguồn» = tên chủ nhà, số chủ, giá đáy.

## Criteria

- AC-1: Given lõi của `packages/core`, When liệt các trường của hồ sơ chủ nhà, Then đúng ba trường `ownerName`,
  `ownerPhone`, `floorPrice`, mỗi trường thuộc lớp `source` có trần `never_leaves_company` và nằm trong danh sách khoá
  nguồn của lõi hàng; thêm hay bớt một trường làm phép kiểm đỏ.
- AC-2: Given luật xem nguồn, When thử đủ 12 ô của bảng dưới — ở lõi (`canSeeSource`) VÀ ở cơ sở dữ liệu
  (`app.can_see_source` dưới vai `quy_hang_app`), cùng một bảng viết tay dùng chung cho hai lớp — Then mỗi ô ra đúng kết
  quả ghi trong bảng, ở cả hai lớp:

  | Vai của người xem | Là người được ghi giữ căn | Không là |
  |---|---|---|
  | Đầu chủ | thấy | không |
  | Đầu khách (từng giữ căn, đã mất vai Đầu chủ) | không | không |
  | Telesales | không | không |
  | Trưởng nhóm | thấy | thấy |
  | Quản trị sàn | không | không |
  | Quản trị sàn kiêm Đầu chủ · Telesales kiêm Trưởng nhóm | thấy (giữ căn) | thấy (không giữ) |

  «Là người được ghi giữ căn» với vai khác Đầu chủ nghĩa là người ấy từng được gán rồi đổi vai. Hàng cuối là hai ô kiêm
  vai, mỗi ô một cột.
- AC-3: Given hồ sơ chủ nhà đủ ba trường, When lõi dựng bản trả cho người thấy nguồn và cho người không thấy, Then bản
  của người thấy có tên, giá đáy và cờ «có số», không bao giờ có số (đầy đủ hay rút gọn); bản của người không thấy chỉ có
  cờ không thấy và mã đầu chủ giữ căn — không một khoá nguồn hay giá trị nguồn nào ở bất kỳ cấp.
- AC-4: Given hàng của sàn A chưa có đầu chủ, When một thành viên có vai Đầu chủ đặt chủ nhà qua
  `PUT /api/v1/listings/{id}/owner`, Then người đó thành đầu chủ giữ căn (một dòng gán mới) và ba trường được lưu (số
  chuẩn hoá về 10 chữ số bắt đầu bằng 0); payload có khoá lạ, số sai dạng hay giá đáy không phải số nguyên dương bị 400
  và không lưu gì; thành viên không có vai Đầu chủ — kể cả trưởng nhóm không kiêm Đầu chủ — đặt chủ nhà trên hàng chưa có
  đầu chủ bị 403 `listing-agent-required` và không lưu gì (trưởng nhóm gán đầu chủ trước, AC-10). (cross-layer)
- AC-5: Given hàng đã có chủ nhà, When đầu chủ giữ căn hay trưởng nhóm cùng sàn gọi `GET /api/v1/listings/{id}/owner`,
  Then nhận tên chủ, giá đáy và cờ «có số»; không nhận số; và chỉ họ sửa được chủ nhà — đầu chủ khác, telesales, quản
  trị sàn gọi `PUT` bị 403 và chủ nhà giữ nguyên. (cross-layer)
- AC-6: Given cùng hàng ấy, When đầu khách, đầu chủ khác, telesales hay quản trị sàn cùng sàn gọi
  `GET /api/v1/listings/{id}/owner`, `GET /api/v1/listings/{id}` và `GET /api/v1/listings`, Then thân trả về không chứa
  khoá nguồn nào và không chứa giá trị tên chủ, số chủ (mọi cách viết), giá đáy ở bất kỳ cấp; lời gọi chủ nhà trả cờ
  không thấy kèm mã đầu chủ giữ căn. (cross-layer)
- AC-7: Given hàng đã có số chủ, When người thấy nguồn gọi `POST /api/v1/listings/{id}/owner/phone-reveal` n lần, Then
  mỗi lần nhận số đầy đủ và bảng sự kiện mở số có đúng n dòng mới, mỗi dòng ghi người mở, vai lúc mở và lúc mở; người
  không thấy nguồn gọi thì bị 403 và không thêm dòng nào; hàng chưa có số thì 404 `owner-not-set` và không thêm dòng
  nào; phiên bản của hàng không đổi sau khi mở số. (cross-layer)
- AC-8: Given cơ sở dữ liệu đã áp mọi migration, When vai `quy_hang_app` chạm thẳng bảng và hàm, Then với mỗi ô «không»
  của bảng AC-2: đọc bảng chủ nhà ra 0 dòng, sửa chủ nhà trúng 0 dòng, thêm chủ nhà bị luật theo dòng từ chối, gọi hàm mở
  số bị từ chối với thông điệp «không có quyền mở số chủ» và số sự kiện mở số không đổi; với mỗi ô «thấy»: đọc được tên
  và giá đáy nhưng đọc cột số chủ bị từ chối quyền — số chỉ ra qua hàm mở số; bảng sự kiện mở số và bảng gán đầu chủ
  không sửa, không xoá, không truncate được (kể cả chủ bảng); sự kiện mở số không thêm thẳng được; payload sự kiện của
  hàng mang khoá nguồn ở cấp đầu bị ràng buộc từ chối.
- AC-9: Given bộ kiểm cách ly, When chạy, Then ba bảng mới bật và ép luật theo dòng; sàn A không đọc, không ghi được đầu
  chủ, chủ nhà, sự kiện mở số của sàn B, và hàm mở số trên hàng của sàn B không trả số, không ghi sự kiện; qua API mọi lời
  gọi chủ nhà vào hàng của sàn B trả 404. (cross-layer)
- AC-10: Given hàng đã có đầu chủ giữ căn, When trưởng nhóm gán lại đầu chủ qua `PUT /api/v1/listings/{id}/listing-agent`
  cho một thành viên có vai Đầu chủ, Then người mới thấy nguồn và mở được số, người cũ không còn thấy, và bảng gán có
  đúng một dòng mới (người nhận, người gán, lúc gán) — dòng cũ giữ nguyên; gán cho người không có vai Đầu chủ hay người
  ngoài sàn bị 400; người không phải trưởng nhóm gán (kể cả đầu chủ giữ căn tự chuyển) bị 403; ca bị từ chối không thêm
  dòng nào. (cross-layer)

## Coverage

Quét morphological-scan, preset entity-feature, cho thực thể «hồ sơ chủ nhà của một hàng».

- Trục người xem: đầu chủ giữ căn (AC-2, AC-5, AC-7) | đầu chủ khác (AC-2, AC-6) | đầu khách (AC-2, AC-6) | telesales
  (AC-2, AC-6) | trưởng nhóm (AC-2, AC-5, AC-7, AC-10) | quản trị sàn (AC-2, AC-6) | sàn khác (AC-9) [thước CE: Tham chiếu
  §2 cột «Không thấy», §6]
- Trục thao tác: đặt / sửa (AC-4, AC-5) | đọc (AC-3, AC-5, AC-6) | mở số (AC-7) | gán đầu chủ (AC-4, AC-10) | xoá — Never
  ở hàng này (chủ nhà không xoá; ngừng hàng không xoá dữ liệu, Tham chiếu §5)
- Trục lớp chặn: lõi thuần (AC-1, AC-2, AC-3) | API (AC-4..AC-7, AC-10) | cơ sở dữ liệu (AC-8, AC-9) [thước CE: luật đợt
  18 «ẩn ở lõi và API, không ẩn ở giao diện»]
- Trục đường rò: lời gọi chủ nhà (AC-6) | lời gọi hàng, danh sách hàng (AC-6) | sự kiện của hàng (AC-8) | đọc thẳng
  bảng (AC-8) | sàn khác (AC-9) | trang khách, kết nối ra ngoài — Later (chưa có; trần `never_leaves_company` đã chặn ở
  thoả thuận)
- Trục trường nguồn: tên (AC-1, AC-6) | số (AC-1, AC-6, AC-7, AC-8) | giá đáy (AC-1, AC-6) | ảnh sổ — Later (kho ảnh
  chưa có; khoá đã bị chặn ở AC-8)

## Đường đo

Ô cơ hội khai điều kiện sống bằng lời, chưa có ngưỡng số (timebox «…»):

- «Đầu chủ giữ căn nhận chủ nhà, số điện thoại và giá đáy» ← AC-5 (tên, giá đáy, cờ «có số») và AC-7 (số đầy đủ qua mở
  số); số từ `packages/api/test-db/owners.test.ts`.
- «Người khác cùng sàn mở cùng hồ sơ qua API không nhận ba trường ấy (ẩn ở lõi, không ở giao diện)» ← AC-3, AC-6, AC-8;
  số từ bộ kiểm lõi, `owners.test.ts` và bộ kiểm cách ly.
- «Mỗi lần mở số chủ thành đúng một sự kiện» ← AC-7 (n lời gọi → n dòng) và AC-8 (không đường nào khác ra số).

## Out of scope

- Mã hoá số chủ ở mức trường (`OWNER_PHONE_KEY`) — tách hàng sau theo Hỏi-1; số đã nằm sau một cửa duy nhất.
- Ảnh sổ — kho ảnh chưa có.
- Nhóm và trục «Chỉ tôi → Nhóm → Toàn sàn» — hàng 12; tới khi có nhóm, trưởng nhóm thấy cả sàn (Hỏi-2).
- Telesales nhập số chủ ở lead; kiểm trùng chủ nhà — hàng dòng vào.
- Lịch sử giá đáy; đổi chủ nhà thành sự kiện của hàng.
- Số chủ trên máy, xoá khi đăng xuất — hàng 13.
- Mọi màn (hồ sơ căn, «Xin dẫn xem», «Liên hệ đầu chủ»).

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Bất biến chạm: (1) cách ly — ba bảng mới mang luật theo dòng và ca trong bộ kiểm cách ly; (2) chủ nhà — đây là hàng
  dựng lớp nguồn: bảng riêng, cột số không đọc thẳng, ràng buộc chặn khoá nguồn trong sự kiện của hàng; (3) người bấm gửi
  — không chạm; (4) phần nội bộ không ra trang khách — không chạm (chưa có trang khách), bản trả cho người không thấy dựng
  ở lõi.
- Không sửa `packages/core/src/data-classes.ts`: lớp `source` và trần đã có.
- Dãy N chạy Postgres 5551 (container `quy-hang-db-N`), dev 3471.
- Known limits — chọn ở Cổng Bằng chứng 2026-10-31:
  - Ngoài-1: Kết quả trả về của bốn lời gọi chủ nhà không được máy đối chiếu với khuôn đã công bố, nên một lần sửa sau làm lệch khuôn sẽ không bị báo sớm.
  - Ngoài-2: Luật trưởng nhóm gán đầu chủ nằm ở lớp API chứ chưa ở lõi; thêm màn hay kênh gán khác sẽ phải viết lại luật này.
  - Ngoài-3: Khi nhiều người cùng mở hồ sơ chủ nhà của một căn, các lần xem phải chờ nhau và chờ cả lúc căn đang được cập nhật.
  - Ngoài-4: Nếu cấu hình quyền của hệ thống hỏng, người đáng được mở số sẽ thấy báo «không có quyền» thay vì báo lỗi hệ thống.
  - Ngoài-5: Gọi thẳng bằng mã căn sai dạng đặc biệt nhận lỗi máy chủ thay vì «không tìm thấy»; người dùng qua màn hình không gặp.
  - Ngoài-6: Bài kiểm danh sách căn không lộ chủ nhà vẫn xanh nếu danh sách trả về trống.
