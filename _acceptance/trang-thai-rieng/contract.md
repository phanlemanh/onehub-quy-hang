---
schema_version: 1
feature: Quản trị sàn thêm nhãn trạng thái riêng neo vào một trong sáu trạng thái chuẩn; căn mang nhãn nhận luật và màu của neo ở Bảng hàng, Hôm nay và trang khách; đếm vẫn theo sáu trạng thái chuẩn
slug: trang-thai-rieng
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui, config]
status: implemented
design_doc: docs/superpowers/specs/2026-11-06-trang-thai-rieng-design.md
approved_by: Manh Phan
approved_at: 2026-11-05T22:08:17Z
---

# Acceptance Contract: trang-thai-rieng

## Context

Màn P1 «Trạng thái» trong Cài đặt › Sàn: quản trị sàn thêm nhãn riêng như «Giữ chỗ», mỗi nhãn neo vào một trong sáu
trạng thái chuẩn và nhận luật, màu của trạng thái đó; không có trạng thái thứ bảy (Tham chiếu §5 «sàn thêm nhãn, không
thêm nghĩa»; sổ điểm biến thiên #21: tối đa 3 nhãn mỗi trạng thái chuẩn). Căn nhớ nhãn của nó ở cột mới
`listings.status_label`, đặt bằng sự kiện `status_changed` mang khoá `label`. Hạng T3 vì cần migration 047 (cột của
`listings` + nới check khoá `company_settings`; giám sát cấp ở yêu cầu B-17).

Source input: hàng 46 của `docs/plan/lo-trinh.json` · ô cơ hội `_acceptance/trang-thai-rieng/opportunity.md` (Cổng Đáng
ký 05/11).

## Criteria

- AC-1: Given quản trị sàn A mở Cài đặt › Sàn › Trạng thái, When thêm nhãn «Giữ chỗ» ở nhóm Đang giao dịch rồi Lưu, Then
  tải lại màn thấy «Giữ chỗ» dưới nhóm ấy, `GET /api/v1/company/statuses` trả nhãn ấy với neo `Pending` và `inUse` 0, dòng
  `company_settings` khoá `labels.status.giu_cho` mang `{"label":"Giữ chỗ","anchor":"Pending"}`, và nhật ký cấu hình có
  đúng một sự kiện mới cho khoá ấy ghi người đổi. (cross-layer)
- AC-2: Given quản trị sàn A ở màn Trạng thái, When gửi một nhãn không neo, neo vào giá trị ngoài sáu trạng thái chuẩn,
  nhãn thứ tư cùng một neo, nhãn trùng chữ với một trạng thái chuẩn («Đang bán») hay với một nhãn riêng khác, nhãn chứa số
  điện thoại hay email, hay dài hơn 40 ký tự sau khi bỏ khoảng trắng hai đầu, Then API trả 400 nêu khoá, không dòng nào được ghi, và màn khoá nút Lưu ở ô
  ấy. (cross-layer)
- AC-3: Given sàn A có nhãn «Giữ chỗ» neo Đang giao dịch, When đầu chủ mở ô Trạng thái của một căn Đang bán ở Bảng hàng và
  chọn «Giữ chỗ», Then hàng nhận đúng một sự kiện `status_changed {to: Pending, label: giu_cho}`, bản hàng mang
  `standard_status` Pending và `status_label` giu_cho, ô hiện «Giữ chỗ» với màu huy hiệu của Đang giao dịch trên máy tính và
  thẻ điện thoại; và When căn ấy đổi nhãn tại chỗ sang nhãn mặc định, hay chuyển sang Đang bán, Then nhãn của căn về rỗng
  và căn hiện chữ mặc định của trạng thái mới. (cross-layer)
- AC-4: Given một căn mang «Giữ chỗ», When đầu chủ mở thực đơn trạng thái của căn hay gửi một lệnh đổi trạng thái, Then căn
  có đúng các nấc chuyển của Đang giao dịch (Đang bán · Đã bán · Ngừng hẳn); và When lệnh mang một mã nhãn không có trong
  bộ nhãn của sàn, hay nhãn neo vào trạng thái khác với trạng thái đích, Then API trả 400 nêu mã, không sự kiện nào được
  ghi. (cross-layer)
- AC-5: Given một căn mang «Giữ chỗ» nằm trong một Lần gửi, When khách riêng hay nhóm môi giới mở `/s/<mã>`, hay đầu chủ
  phát hàng cho nhóm môi giới, Then căn hiện như mọi căn Đang giao dịch (`availability` «under_contract») theo luật giá của
  neo, thân trả công khai và bản xuất không mang chữ «Giữ chỗ» hay mã nhãn, và bộ kiểm rò rỉ vẫn xanh. (cross-layer)
- AC-6: Given sàn A có căn «Giữ chỗ», «Đã cọc» (mặc định Đang giao dịch) và căn Đang bán, When đầu chủ lọc cột Trạng thái
  chọn Đang giao dịch, hay máy đếm hàng mở theo trạng thái, Then bộ lọc giữ cả căn «Giữ chỗ» lẫn căn mặc định, số đếm theo
  sáu trạng thái chuẩn không có ô thứ bảy, và hàng đợi Hôm nay đặt căn «Giữ chỗ» đúng chỗ của căn Đang giao dịch.
- AC-7: Given trưởng nhóm sàn A đổi một căn Đang bán của đầu chủ sang «Giữ chỗ», When đầu chủ mở Hôm nay, Then nhóm «Mới
  đổi» có căn ấy với dòng «Đang bán → Giữ chỗ — Trưởng nhóm, hôm nay»; đổi nhãn tại chỗ trong cùng trạng thái đọc «Đang giao
  dịch → Giữ chỗ — …»; và một lần đổi nhãn trong Đang bán không đặt lại mốc «Đang bán N ngày». Căn không có nhãn riêng thì
  dòng như trước vòng này. (cross-layer)
- AC-8: Given nhãn «Giữ chỗ» đang được hai căn mang, When quản trị đổi tên thành «Giữ chỗ 7 ngày» rồi Lưu, Then hai căn hiện
  tên mới và không căn nào nhận sự kiện; và When quản trị gỡ nhãn ấy, Then màn hỏi «2 căn đang là «Giữ chỗ 7 ngày». Chuyển
  chúng sang:» với các nhãn cùng neo và nhãn mặc định, API từ chối gỡ không kèm nhãn thay (409 nêu số căn), còn gỡ kèm nhãn
  thay thì mỗi căn nhận đúng một sự kiện ghi tên quản trị, vẫn Đang giao dịch, mang nhãn thay (và hiện ở «Mới đổi» của đầu chủ);
  gỡ nhãn không căn nào mang thì không hỏi. (cross-layer)
- AC-9: Given sàn A có nhãn riêng, When người của sàn B mở Bảng hàng, gọi `GET /api/v1/company/statuses`, hay gửi lệnh đổi
  trạng thái mang mã nhãn của sàn A, Then sàn B thấy đúng nhãn mặc định và lệnh bị từ chối 400; ở cơ sở dữ liệu người sàn B
  không đọc được dòng `labels.status.*` của sàn A; và When người không phải quản trị sàn A gọi `PUT
  /api/v1/company/statuses` hay mở `/settings/statuses`, Then API trả 403 không ghi gì, màn chuyển về Cá nhân kèm câu «Mục
  này chỉ quản trị sàn mở được».
- AC-10: Given một sàn chưa thêm nhãn nào, When mở Bảng hàng, Hôm nay, trang khách và bản phát hàng, Then mọi chữ trạng
  thái, màu và nấc chuyển đúng như trước vòng này, và căn tạo hay đổi trạng thái không mang `label` có `status_label` rỗng.

## Coverage

- Trục mặt hiện chữ: màn Trạng thái | API | Bảng hàng máy tính | thẻ điện thoại | Hôm nay | trang khách | bản phát hàng
  [thước CE: câu giao hàng 46 «Bảng hàng, Hôm nay và trang khách» + Tham chiếu §5] → AC-1, 3, 5, 7
- Trục thao tác với nhãn: thêm | đổi tên | gỡ không dùng | gỡ đang dùng | đặt cho căn | đổi nhãn tại chỗ | chuyển trạng thái
  [thước CE: câu giao «xoá nhãn đang dùng thì máy hỏi trạng thái thay» + sổ #21] → AC-1, 3, 8
- Trục nghĩa: luật chuyển của neo | màu của neo | luật ra ngoài của neo | đếm và lọc theo chuẩn [thước CE: Tham chiếu §5
  «nhận luật, màu của trạng thái đó; không có trạng thái thứ bảy»] → AC-3, 4, 5, 6
- Trục người: quản trị sàn A | vai khác sàn A | người sàn B | khách ngoài [thước CE: bất biến 1, 4 của AGENTS.md] → AC-9, 5
- Trục dữ liệu: chưa đặt | đã đặt | hỏng (thiếu neo, neo lạ, quá trần, trùng chữ, số điện thoại, quá dài, mã lạ trong lệnh)
  [thước CE: sổ #21 + bài học Ngoài-1/3 hàng 45] → AC-2, 4, 10
- Later (ngoài phạm vi): nhãn riêng ở Hồ sơ căn, màn gọi, hàng loạt, Liên hệ; lọc theo từng nhãn; nhãn ra trang khách.

## Đường đo

- Thước: quản trị thêm «Giữ chỗ» rồi một căn mang nó hiện đúng chữ và màu ở Bảng hàng, Hôm nay · số từ: nhật ký
  `company_settings_events` (khoá `labels.status.*`) + `listing_events` (`status_changed` mang `label`) · bảo đảm bởi: AC-1,
  AC-3, AC-7
- Thước: căn mang nhãn nhận luật của neo ở trang khách · số từ: `availability` của thân trả công khai · bảo đảm bởi: AC-4,
  AC-5
- Thước: không neo thì không lưu được · số từ: mã 400 của `PUT /company/statuses` · bảo đảm bởi: AC-2
- Thước: gỡ nhãn đang dùng thì máy hỏi nhãn thay · số từ: mã 409 + số sự kiện `status_changed` ghi tên quản trị · bảo đảm
  bởi: AC-8
- Thước: báo cáo vẫn đếm theo sáu trạng thái chuẩn · số từ: `tiLeHangMo` và bộ lọc Bảng hàng · bảo đảm bởi: AC-6

## Out of scope

- Trường riêng (hàng 47), từ điển gõ tắt khi nhập (hàng 70).
- Nhãn riêng ở Hồ sơ căn, màn gọi (kết quả một chạm «Đã cọc / bán…»), thao tác hàng loạt, Liên hệ, ô nhận lead, màn Gửi —
  căn mang nhãn hiện chữ mặc định của neo ở đó; đặt nhãn chỉ ở trình sửa ô Bảng hàng.
- Lọc theo từng nhãn riêng ở Bảng hàng (Hỏi-4 của design doc).
- Nhãn riêng ra trang khách hay bản phát hàng cho đội khác (Hỏi-2).
- Màu riêng cho nhãn; đổi neo của nhãn đã tạo (Hỏi-5).

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Migration 047 `047_trang_thai_rieng.sql` (giám sát cấp, yêu cầu B-17): thêm `listings.status_label` (check khuôn mã, grant cho
  `quy_hang_app`), nới check khoá `company_settings` nhận `labels.status.<mã>`.
- Lệnh máy cần `DATABASE_URL` tới Postgres dãy B (cổng 5572) cho bộ kiểm cách ly và bộ kiểm API trên cơ sở dữ liệu.
- Dữ liệu thử: sàn thử dựng qua đường ghi thật, tên «[Tên]», số `0900 000 0xx`.
