---
schema_version: 1
feature: Quản trị sàn đổi tên hiển thị của trường chuẩn và thêm giá trị riêng neo vào giá trị chuẩn; cùng một căn hiện đúng ở bảng hàng, đội khác và trang khách
slug: cach-goi-rieng
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui, config]
status: signed-off
design_doc: docs/superpowers/specs/2026-11-05-cach-goi-rieng-design.md
approved_by: Manh Phan
approved_at: 2026-11-05T13:38:07Z
---

# Acceptance Contract: cach-goi-rieng

## Context

Màn P1 «Cách gọi» trong Cài đặt › Sàn: quản trị sàn đặt tên riêng cho trường chuẩn («Điều kiện phí» → «Phí CN») và
cho giá trị chuẩn của tập đóng («Đã gồm phí» → «BP»); nghĩa vẫn do lõi giữ (Tham chiếu §7 «sàn thêm nhãn, không thêm
nghĩa», ADR-0022 D5). Bản đầu đang chạy bằng nhãn dựng sẵn; hàng này để mỗi sàn nói chữ của mình ở Bảng hàng, ở bản
phát hàng cho đội khác và trên trang khách. Hạng T3 vì cần migration 039 nới khoá của `company_settings` (giám sát duyệt
B-15).

Source input: hàng 45 của `docs/plan/lo-trinh.json` · ô cơ hội `_acceptance/cach-goi-rieng/opportunity.md` (Cổng Đáng
ký 05/11).

## Criteria

- AC-1: Given quản trị sàn A mở Cài đặt › Sàn › Cách gọi, When gõ «Phí CN» cho trường Điều kiện phí rồi Lưu, Then tải lại
  màn thấy «Phí CN» ở dòng ấy, `GET /api/v1/company/labels` trả `feeInclusion` nhãn «Phí CN» (`custom: true`), và nhật ký
  cấu hình có đúng một sự kiện mới cho khoá `labels.field.feeInclusion` ghi người đổi. (cross-layer)
- AC-2: Given trường Điều kiện phí đã có nhãn riêng, When quản trị bấm «Trả về mặc định» rồi Lưu, Then dòng cấu hình của
  khoá ấy mang giá trị rỗng (`null`), nhật ký có đúng một sự kiện mới ghi người đổi, và màn, API trả lại nhãn mặc định
  «Điều kiện phí» (`custom: false`); khoá không đổi trong lượt Lưu ấy không sinh sự kiện nào. Cũng vậy khi gỡ hay đổi
  tên một giá trị riêng đang được căn dùng («BP» → trống hay → «Bao phí SC»): căn không mất dữ liệu nào — giá trị chuẩn
  lưu ở căn (`included`) giữ nguyên, căn hiện lại chữ mặc định hay tên mới, và lọc, đếm không đổi. (cross-layer)
- AC-3: Given quản trị sàn A ở màn Cách gọi, When đặt tên riêng «BP» neo vào giá trị chuẩn «Đã gồm phí» (`included`) rồi
  Lưu, Then API trả giá trị `feeInclusion/included` nhãn «BP»; và When gửi lên một giá trị riêng không có neo hay neo vào
  giá trị không thuộc tập đóng của trường, Then API trả 400 nêu khoá, không dòng nào được ghi, màn khoá nút Lưu ở ô ấy.
  (cross-layer)
- AC-4: Given sàn A đã đặt «Phí CN» và «BP», When đầu chủ của sàn A mở Bảng hàng, Then tiêu đề cột phí là «Phí CN» và ô
  phí của một căn có giá trị chuẩn `included` hiện «BP» — trên máy tính và thẻ điện thoại. (cross-layer)
- AC-5: Given Bảng hàng của sàn A có ba căn `included` và hai căn `excluded`, và sàn đặt tên riêng «BP» cho `included`,
  When lọc cột phí chọn «BP», Then bộ lọc giữ đúng ba căn có giá trị chuẩn `included` và số căn sau lọc (dòng tổng, số
  căn của nhóm Toà) là 3; đổi tên riêng không làm đổi kết quả lọc hay số căn — lọc và đếm theo giá trị chuẩn, chữ riêng
  chỉ là chữ hiện. (Lời sửa 05/11, chủ kho chọn «Sửa theo khuyến nghị»: Bảng hàng không có kiểu nhóm theo cột phí.)
- AC-6: Given sàn A đã đặt nhãn riêng, When đầu chủ phát hàng cho nhóm môi giới (bản xuất) hay gửi một Lần gửi cho nhóm
  môi giới, Then bản xuất có tiêu đề cột và chữ ô phí theo tên riêng của sàn, và trang `/s/<mã>` nhóm môi giới mở thấy
  «BP» ở căn `included`. (cross-layer)
- AC-7: Given sàn A đã đặt nhãn riêng cho trường `feeInclusion`, `legalStatus` và `withdrawnReason`, When khách riêng mở
  `/s/<mã>` của Lần gửi từ sàn A, Then thẻ và chi tiết căn hiện «BP» và tên riêng của «Pháp lý»; thân trả công khai chỉ
  mang nhãn của trường có trong tập khoá ra của người nhận — không có nhãn nào của `withdrawnReason` hay trường lớp
  `source` — và bộ kiểm rò rỉ vẫn xanh. (cross-layer)
- AC-8: Given sàn A đã đặt nhãn riêng, When người của sàn B mở Bảng hàng, gọi `GET /api/v1/company/labels` hay mở trang
  khách của một Lần gửi từ sàn B, Then sàn B thấy đúng nhãn mặc định; và ở cơ sở dữ liệu, người của sàn B không đọc được
  dòng `labels.*` của sàn A (bộ kiểm cách ly).
- AC-9: Given một người không phải quản trị sàn A, When gọi `PUT /api/v1/company/labels` hay mở đường `/settings/labels`,
  Then API trả 403 và không ghi gì, còn màn chuyển về Cá nhân kèm câu «Mục này chỉ quản trị sàn mở được»; và When quản
  trị gửi nhãn chứa số điện thoại, email hay dài hơn 40 ký tự, Then API trả 400 nêu khoá và không ghi gì. (cross-layer)
- AC-10: Given một sàn chưa đặt nhãn nào, When mở Bảng hàng, bản phát hàng và trang khách, Then mọi tiêu đề và chữ ô
  đúng như trước vòng này (nhãn dựng sẵn của từng mặt) — bản đầu chạy bằng mặc định.

## Coverage

- Trục mặt hiện chữ: màn Cách gọi | API | Bảng hàng máy tính | thẻ điện thoại | bản phát hàng | trang nhóm môi giới |
  trang khách riêng [thước CE: Tham chiếu §7 bảng lớp + câu giao hàng 45 «Bảng hàng, đội khác, trang khách»] → AC-1, 4, 6, 7
- Trục loại nhãn: tên trường | tên giá trị (có neo) | trả về mặc định [thước CE: sổ #18, #37] → AC-1, 2, 3
- Trục người: quản trị sàn A | vai khác sàn A | người sàn B | khách ngoài [thước CE: bất biến 1, 4 của AGENTS.md] → AC-8, 9, 7
- Trục dữ liệu: chưa đặt | đã đặt | hỏng (thiếu neo, neo lạ, số điện thoại, quá dài) [thước CE: khuôn #18] → AC-3, 9, 10
- Trục nghĩa: hiện theo tên riêng | lọc, đếm theo giá trị chuẩn [thước CE: Tham chiếu §7 «sàn thêm nhãn, không thêm nghĩa»] → AC-4, 5
- Later (ngoài phạm vi): tên riêng cho hướng, loại hình; mặt Hồ sơ căn, ô lead, Gửi, Hôm nay; nhãn xuống kho trên máy.

## Đường đo

- Thước: quản trị sàn đổi tên một trường và một giá trị rồi cùng một căn hiện chữ mới ở ba mặt · số từ: nhật ký
  `company_settings_events` (khoá `labels.*`, mỗi lần đổi một sự kiện) + ba mặt dựng cùng hàm lõi · bảo đảm bởi: AC-1, AC-3, AC-4, AC-6, AC-7
- Thước: lọc và đếm vẫn theo giá trị chuẩn · số từ: bộ lọc và dòng đếm của Bảng hàng · bảo đảm bởi: AC-5
- Thước: không neo thì không lưu được · số từ: mã 400 của `PUT /company/labels` · bảo đảm bởi: AC-3
- Thước: sàn khác vẫn thấy tên mặc định · số từ: `GET /company/labels` của sàn B + bộ kiểm cách ly · bảo đảm bởi: AC-8

## Out of scope

- Trạng thái riêng (hàng 46), trường riêng (hàng 47), từ điển gõ tắt khi nhập và đề xuất từ điển (hàng 70, sổ #19).
- Tên riêng cho hướng và loại hình (`directionFaces`, `propertySubType`) — hướng là cột chữ, loại hình chưa là cột.
- Hồ sơ căn, ô nhận lead, màn Gửi, Hôm nay giữ nhãn dựng sẵn ở vòng này.
- Đưa nhãn xuống kho trên máy cùng lần kéo đồng bộ (ADR-0018 quyết định 9) — Bảng hàng đọc ở máy chủ lúc mở trang.
- Nhiều tên riêng cùng neo một giá trị chuẩn (xem Hỏi-2 của design doc).
- Chụp tệp xlsx/ảnh xuất ra: bản phát hàng chụp ở khung xem trước của hộp thoại (E14), tệp xuất đo bằng bài kiểm hàm dựng.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Migration 039 (giám sát cấp, yêu cầu B-15): nới check khoá `company_settings` nhận `labels.(field|value).<trường>`.
- Lệnh máy cần `DATABASE_URL` tới Postgres dãy B (cổng 5572) cho bộ kiểm cách ly và bộ kiểm API trên cơ sở dữ liệu.
- Dữ liệu thử: sàn thử dựng qua đường ghi thật, tên «[Tên]», số `0900 000 0xx`.
- Known limits — chọn ở Cổng Bằng chứng 2026-11-06:
  - Ngoài-2: Tên riêng của sàn ghi là thông tin nội bộ nhưng vẫn hiện trên trang khách và bản phát hàng theo thiết kế; nhãn phân loại chưa khớp thực tế, không lộ dữ liệu nào.
  - Ngoài-4: Một tên riêng đã lưu mà sau này không còn hợp lệ thì lặng lẽ về chữ mặc định, quản trị không được báo.
  - Ngoài-5: Bài kiểm «mọi trang Bảng hàng đọc tên riêng» liệt kê tay hai trang; trang mới thêm sau có thể quên mà bài kiểm vẫn xanh.
  - Ngoài-7: Bài kiểm màn Cách gọi chỉ dò chữ trong mã nguồn, không chạy thật việc chuyển người không phải quản trị đi; máy chủ vẫn từ chối ghi.
  - Ngoài-8: Bài kiểm bản phát hàng đo mã nguồn hộp thoại, không đo tệp xuất ra; khâu truyền tên riêng từ Bảng hàng vào hộp thoại không có lưới tự động.
