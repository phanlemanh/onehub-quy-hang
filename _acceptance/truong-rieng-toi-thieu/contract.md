---
schema_version: 1
feature: Quản trị sàn tạo trường riêng có / không hoặc chọn một sau khi máy dò không có trường chuẩn cùng nghĩa; trường của hàng hiện và lọc được ở Bảng hàng, không ra trang khách; liên hệ có trường riêng theo loại, trường của liên hệ chủ nhà mang lớp nguồn
slug: truong-rieng-toi-thieu
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui, config]
status: draft
design_doc: docs/superpowers/specs/2026-11-06-truong-rieng-toi-thieu-design.md
---

# Acceptance Contract: truong-rieng-toi-thieu

## Context

Màn P1 «Trường riêng» trong Cài đặt › Sàn (S5): lớp thứ ba của Tham chiếu §7 — trường thật sự mới của sàn, bản đầu kiểu
«có / không» và «chọn một» (chốt 29/10). Định nghĩa ở bảng mới `custom_fields` (ADR-0018 quyết định 8, sổ điểm biến thiên
#22); giá trị của hàng ở cột mới `listings.custom`, ghi bằng sự kiện `custom_changed`; giá trị của liên hệ ở chỗ hàng 85
đã giữ (`contacts.custom`). Hạng T3 vì migration 043 (giám sát giữ chỗ cho hàng 47, LUAT.md luật 74) và nới lớp dữ liệu
cho trường của liên hệ chủ nhà (ADR-0021 «Mục chờ cho hàng 47», Hỏi-1 của design doc).

Source input: hàng 47 của `docs/plan/lo-trinh.json` · ô cơ hội `_acceptance/truong-rieng-toi-thieu/opportunity.md` (Cổng
Đáng 05/11).

## Criteria

- AC-1: Given quản trị sàn A mở Cài đặt › Sàn › Trường riêng, When thêm trường của hàng «Căn góc» kiểu có / không và
  trường «Nội thất bàn giao» kiểu chọn một với ba lựa chọn rồi Lưu, Then tải lại màn thấy hai trường dưới nhóm «Trường của
  hàng», `GET /api/v1/company/fields` trả hai trường ấy kèm mã, kiểu, lựa chọn, lớp `custom_field`, bảng `custom_fields`
  có đúng hai dòng của A, và nhật ký `custom_field_events` có đúng hai sự kiện mới ghi người đổi. (cross-layer)
- AC-2: Given quản trị sàn A ở khối tạo trường, When gõ tên trùng nghĩa một trường chuẩn («Hướng», «Toà nhà», «Phí CN»,
  tên riêng sàn đã đặt cho một trường chuẩn ở Cách gọi, hay với trường của liên hệ «Số điện thoại»), Then khối báo «Đã có
  trường «[tên chuẩn]» — đổi tên ở Cách gọi» kèm liên kết, nút Lưu khoá, và `PUT /api/v1/company/fields` gửi thẳng trả 409
  nêu trường chuẩn, không dòng nào được ghi; tên không trùng («Căn góc») thì tạo được. (cross-layer)
- AC-3: Given quản trị sàn A, When gửi một trường thiếu tên, tên dài hơn 40 ký tự sau khi bỏ khoảng trắng hai đầu, tên chứa
  số điện thoại hay email, kiểu ngoài hai kiểu, chọn một không có lựa chọn hay quá 30 lựa chọn, hai lựa chọn trùng chữ, tên
  trùng một trường riêng còn sống khác cùng đối tượng, trường của liên hệ không có loại, trường thứ 21 còn sống của sàn,
  hay đổi kiểu, đối tượng, loại liên hệ của trường đã có, hay gỡ một lựa chọn đã có, Then API trả 400 nêu khoá, không dòng
  nào được ghi, và màn khoá nút Lưu ở ô ấy. (cross-layer)
- AC-4: Given sàn A có «Căn góc» và «Nội thất bàn giao», When đầu chủ mở Bảng hàng trên máy tính, Then mỗi trường là một
  cột sau các cột chuẩn; When đầu chủ đặt «Căn góc» là «Có» cho một căn ở trình sửa ô, Then hàng nhận đúng một sự kiện
  `custom_changed {can_goc: true}`, bản hàng mang `custom` `{"can_goc": true}`, ô hiện «Có», người thứ hai trên trình duyệt
  mới thấy «Có» sau đồng bộ; When lọc cột «Căn góc» chọn «Có», Then chỉ còn căn ấy; và lệnh mang mã trường không có, mã
  trường của liên hệ, giá trị sai kiểu hay mã lựa chọn không có thì API trả 400 nêu mã, không sự kiện nào được ghi.
  (cross-layer)
- AC-5: Given một căn mang giá trị trường riêng nằm trong một Lần gửi, When khách riêng hay nhóm môi giới mở `/s/<mã>`, đầu
  chủ phát hàng cho nhóm môi giới với góc nhìn có cột trường riêng, hay xuất bảng, Then thân trả công khai, bản phát và tệp
  xuất không mang mã trường, chữ trường hay giá trị trường riêng, và bộ kiểm rò rỉ (có mồi cho `custom`) vẫn xanh.
  (cross-layer)
- AC-6: Given quản trị sàn A tạo trường của liên hệ «Nguồn khách» (chọn một, loại Người mua · Người thuê) và «Giờ gọi được»
  (chọn một, loại Chủ bán · Chủ cho thuê), Then `custom_fields` ghi lớp `custom_field` cho trường thứ nhất và `source` cho
  trường thứ hai, màn hiện huy hiệu «Thông tin chủ nhà» ở trường thứ hai; When đầu chủ giữ một liên hệ Chủ bán mở hồ sơ,
  Then mục «Trường riêng» chỉ có «Giờ gọi được», chọn giá trị thì `contacts.custom` của người ấy mang mã ấy; và một liên hệ
  Người mua chỉ thấy «Nguồn khách». (cross-layer)
- AC-7: Given liên hệ Chủ bán X có giá trị «Giờ gọi được», When telesales, quản trị sàn, đầu chủ không giữ X, hay người
  của sàn B đọc X qua API hay cơ sở dữ liệu, hoặc gọi hàm ghi giá trị cho X, Then không ai trong số đó đọc được `custom`
  của X hay ghi được, trong khi người giữ X và trưởng nhóm đọc, ghi được; và giá trị ấy không có trong bất kỳ thân ra
  ngoài, thoả thuận nào (lớp `source` không rời công ty). (cross-layer)
- AC-8: Given «Nội thất bàn giao» đã có căn mang lựa chọn «Cơ bản», When quản trị đổi tên trường và đổi chữ lựa chọn rồi
  Lưu, Then cột và ô ở Bảng hàng hiện tên mới, chữ mới và không căn nào nhận sự kiện; When quản trị thêm một lựa chọn, Then
  trình sửa ô có lựa chọn mới; When quản trị bỏ trường (xác nhận ở hộp hỏi), Then trường thôi hiện ở Bảng hàng, ô lọc và
  hồ sơ liên hệ, `custom` của các căn vẫn giữ giá trị cũ, và một trường mới cùng tên được mã khác. (cross-layer)
- AC-9: Given sàn A có trường riêng, When người của sàn B gọi `GET /api/v1/company/fields`, đọc bảng `custom_fields` ở cơ
  sở dữ liệu, hay gửi lệnh `custom_changed` mang mã trường của A, Then sàn B không thấy trường của A và lệnh bị từ chối 400;
  và When người không phải quản trị sàn A gọi `PUT /api/v1/company/fields`, ghi thẳng bảng `custom_fields`, hay mở
  `/settings/fields`, Then API trả 403, cơ sở dữ liệu từ chối, màn chuyển về Cá nhân kèm câu «Mục này chỉ quản trị sàn mở
  được». (cross-layer)
- AC-10: Given một sàn chưa tạo trường riêng nào, When mở Bảng hàng, góc nhìn đã lưu, hồ sơ liên hệ, trang khách và bản phát
  hàng, Then mọi cột, ô lọc, mục hồ sơ và thân ra ngoài đúng như trước vòng này, căn tạo hay sửa không mang `custom` có
  `custom` rỗng, và trang Cài đặt › Sàn › Trường riêng không còn là trang tạm.

## Coverage

- Trục mặt: màn Trường riêng | API | Bảng hàng máy tính (cột, sửa ô, lọc, góc nhìn) | hồ sơ liên hệ | trang khách | bản phát
  hàng | xuất bảng [thước CE: câu giao hàng 47 + Tham chiếu §7 «hiện ở bảng hàng… không lên trang khách»] → AC-1, 4, 5, 6
- Trục thao tác với trường: tạo | dò trùng nghĩa | đổi tên | thêm lựa chọn | đổi chữ lựa chọn | bỏ trường | đặt giá trị |
  xoá giá trị | lọc [thước CE: §7 ba câu hỏi + sổ #22 «bỏ trường: ẩn, giữ giá trị»] → AC-1, 2, 4, 8
- Trục đối tượng: hàng | liên hệ Người mua · Người thuê | liên hệ Chủ bán · Chủ cho thuê [thước CE: câu giao «theo loại
  liên hệ… chủ nhà mang lớp nguồn»; ADR-0021 mục chờ] → AC-4, 6, 7
- Trục người: quản trị sàn A | đầu chủ giữ | đầu chủ không giữ | trưởng nhóm | telesales | người sàn B | khách ngoài [thước
  CE: bất biến 1, 2, 4 của AGENTS.md; luật đọc liên hệ 036; bảng quyền 046] → AC-7, 9, 5
- Trục dữ liệu: chưa có | có | hỏng (tên trùng nghĩa, trùng trường khác, dài, số điện thoại, email, kiểu lạ, lựa chọn rỗng
  hay quá 30, trường thứ 21, đổi kiểu, gỡ lựa chọn, mã lạ trong lệnh, giá trị sai kiểu) [thước CE: sổ #22 + bài học
  Ngoài-1/3 hàng 45] → AC-2, 3, 4, 10
- Later (ngoài phạm vi): kiểu chữ, số, ngày; kèm trường khi phát hàng cho đội khác (#23); thẻ điện thoại, hồ sơ căn, nhập
  Excel; gỡ lựa chọn; lịch sử giá trị của liên hệ.

## Đường đo

- Thước: quản trị tạo «Căn góc» rồi một căn mang «Có» hiện và lọc được ở Bảng hàng · số từ: `custom_field_events` +
  `listing_events` (`custom_changed`) · bảo đảm bởi: AC-1, AC-4
- Thước: tạo chỉ sau khi máy dò không có trường chuẩn cùng nghĩa · số từ: mã 409 `trung-nghia` của `PUT /company/fields` ·
  bảo đảm bởi: AC-2
- Thước: không bao giờ ra trang khách · số từ: thân trả công khai và bộ kiểm rò rỉ có mồi `custom` · bảo đảm bởi: AC-5
- Thước: trường của liên hệ chủ nhà mang lớp nguồn, không rời công ty · số từ: `custom_fields.data_class` + luật đọc liên hệ
  · bảo đảm bởi: AC-6, AC-7
- Thước: sàn khác không thấy trường của nhau · số từ: bộ kiểm cách ly · bảo đảm bởi: AC-9

## Out of scope

- Kiểu chữ, số, ngày (Tham chiếu §7 «để sau»).
- Kèm trường riêng khi phát hàng cho đội khác (sổ #23) — vòng này trường riêng không bao giờ ra.
- Trường riêng ở thẻ điện thoại, hồ sơ căn, thao tác hàng loạt, nhập Excel ghép vào trường riêng (Hỏi-4).
- Gỡ một lựa chọn đã có; đổi kiểu, đối tượng, loại liên hệ của trường đã tạo (Hỏi-3).
- Lịch sử từng lần đổi giá trị trường riêng của liên hệ.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Migration 043 `043_truong_rieng.sql` (giám sát giữ chỗ cho hàng 47, LUAT.md luật 74): bảng `custom_fields` + nhật ký
  `custom_field_events` có luật theo dòng; cột `listings.custom` + loại sự kiện `custom_changed`; mở `contacts.custom` và hàm
  `app.set_contact_custom`.
- Lệnh máy cần `DATABASE_URL` tới Postgres dãy B (cổng 5572) cho bộ kiểm cách ly và bộ kiểm API trên cơ sở dữ liệu.
- Dữ liệu thử: sàn thử dựng qua đường ghi thật, tên «[Tên]», số `0900 000 0xx`.
