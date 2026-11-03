---
schema_version: 1
feature: "Số đo của hai tuần thử đọc được từ sự kiện của sàn thử: tỉ lệ xác nhận, mức đủ, mã tự điền, lead đến cuộc gọi đầu, lần phát, lượt mở, thao tác theo thiết bị và vai, lần mất mạng trên điện thoại"
slug: so-do-hai-tuan-thu
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [core]
status: implemented
design_doc: _acceptance/so-do-hai-tuan-thu/design.md
approved_by: Manh Phan
approved_at: 2026-11-03
---

# Acceptance Contract: so-do-hai-tuan-thu

## Context

Hàng 52 (dãy D, đợt dau-khach-nhap), mã M1 — Tham chiếu §11 «Đo trong hai tuần thử». Đứng trên hàng 8 (sự kiện của hàng,
`foldListing`) và hàng 13. Dựng một hàm thuần ở `packages/core/src/metrics/` nhận sự kiện của hàng, dữ kiện lead, danh mục
và kỳ đo `[tu, den)`, trả bảng số đo §11. Ngưỡng không đặt ở hàng này (luật đợt 24). Không API, không màn, không sự kiện mới.

Source input: `docs/plan/lo-trinh.json` hàng 52 · `_acceptance/so-do-hai-tuan-thu/opportunity.md` · thiết kế
`_acceptance/so-do-hai-tuan-thu/design.md`.

## Criteria

- AC-1: Given bảng §11 của `docs/product/tham-chieu.md`, When đọc danh sách số đo của lõi, Then mỗi ô «Số đo» của §11 trừ
  «Số ngày Sheet cũ không được sửa» khớp đúng một nhóm mã có `dongThamChieu` ghép lại bằng đúng chữ ô ấy, không mã nào trỏ
  dòng không có trong §11, không mã nào trỏ dòng Sheet cũ; và bảng số đo trả đúng một dòng cho mỗi mã, theo thứ tự §11.
- AC-2: Given các hàng có lần xác nhận cách ngày của `den` 13, 14 và chưa từng xác nhận, When tính
  `confirmed_within_n_days` với N vắng và với N = 7, Then tử số chỉ gồm hàng mở có tuổi xác nhận nhỏ hơn N (N vắng = 14 —
  căn 13 ngày vào, căn 14 ngày không vào, đúng ranh «Cần gọi lại» của `freshness`); hàng Đã bán, Ngừng bán không vào mẫu
  số; kết quả kèm tử và mẫu theo từng trạng thái.
- AC-3: Given hàng mở đủ năm mục danh sách hỏi, thiếu một mục, đủ bốn phần mô tả mà chưa có giá, When tính
  `top_completeness`, Then chỉ hàng đủ năm mục (theo `completeness` của lõi) vào tử số; mẫu số 0 thì `phanTram` là `null`,
  không phải 0.
- AC-4: Given các mã căn gõ trong kỳ ở hai cửa — tạo hàng (lúc tạo, lúc gắn mã sau) và ô nhận lead — gồm mã có trong danh
  mục, mã viết khác của cùng căn, mã không có trong danh mục và mã ra «nhiều căn», When tính `unit_code_autofill`, Then tử
  số là mã tra (không kèm toà, như ô nhận lead) ra `found`, mẫu số là mọi mã đã gõ trong kỳ, «nhiều căn» tính là hụt và đếm
  riêng; hàng hay lead không mã, hay mã gõ ngoài kỳ, không vào.
- AC-5: Given lead nhập trong kỳ có mốc gọi đầu, có mốc lên bảng, chưa gọi, gọi sau `den`, và lead căn trùng, lead đã bỏ,
  When tính `lead_to_first_call` và `lead_to_ready`, Then mỗi số là thời lượng từ lúc nhập (phút, ngày) của lead không phải
  căn trùng, chưa bỏ (kể cả lead chưa chia và lead đã trả lại); kèm trung vị, dãy giá trị đã xếp và số lead chưa tới mốc tại `den` tách ba phần — chưa chia, đã chia, đã trả lại;
  mốc sau `den` tính là chưa tới.
- AC-6: Given lead nhập trong kỳ với ba kết quả kiểm trùng và lead nhập ngoài kỳ, When tính `duplicate_leads_blocked`,
  Then số là lead trong kỳ có kết quả khác `new`, kèm số «căn trùng» và «chủ trùng» riêng.
- AC-7: Given một căn Đang bán đã qua ngưỡng nhóm «Nên gọi điều chỉnh giá» được ghi `owner_confirmed` hai lần và
  `price_changed` một lần trong kỳ, một căn chưa qua ngưỡng được hạ giá, một căn qua ngưỡng nhưng Tạm giữ, When tính
  `price_adjustment_calls`, Then chỉ căn đầu được đếm, đếm một lần; đổi `nguongDieuChinhGia` thì căn thứ hai vào/ra đúng
  theo ngưỡng mới (cùng luật nhóm của Hôm nay).
- AC-8: Given bất kỳ đầu vào nào, kể cả rỗng, When tính bảng số đo, Then sáu mã chưa có sự kiện (`inquiry_to_send`,
  `sheet_publishes`, `customer_link_opens`, `customer_interest`, `actions_by_device_role`, `mobile_offline`) ra
  `chua-co-su-kien` với câu `thieu` nêu sự kiện còn thiếu, không mang số; các mã đo được trên đầu vào rỗng ra mẫu 0, dãy
  rỗng — không ra «chưa có sự kiện».
- AC-9: Given bộ dữ liệu mẫu của hàng 5 chuyển thành đúng chuỗi lệnh bộ nạp bản thật ghi, kỳ
  `[2026-11-03T00:00:00Z, 2026-11-17T00:00:00Z)`, When tính bảng số đo hai lần, Then hai lần ra cùng kết quả và đúng các
  số ghim: 30 hàng mở, xác nhận 0/30 (30/30 khi `den` là ngày sau ngày nạp), mức đủ 0/30, tự điền 47/47 (40 hàng, 7 lead),
  lead trùng 2 (1 căn, 1 chủ), lead gọi đầu n = 0 với 11 chưa gọi (10 chưa chia, 1 đã chia), đợt hai 0; đầu ra không mang
  khoá thông tin chủ nhà nào; thứ tự loại lệnh của bộ chuyển khớp các lời gọi lệnh trong bộ nạp bản thật.
- AC-10: Given sự kiện và lead ghi trước `tu`, trong kỳ, và từ `den` trở đi, When tính bảng số đo, Then trạng thái hàng
  là trạng thái gấp từ sự kiện trước `den` (sự kiện từ `den` không đổi số), số đếm theo lần (tự điền, lead, đợt hai) chỉ
  đếm việc trong `[tu, den)`; và lõi không đọc đồng hồ máy — cùng đầu vào ra cùng kết quả dưới đồng hồ bị đổi.

## Coverage

Quét theo khuôn entity-feature của morphological-scan cho thực thể «một số đo §11 trên một kỳ», tại chỗ:

- Trục dòng §11: tám dòng trừ Sheet cũ (AC-1); mỗi dòng đo được một AC (AC-2…AC-7), dòng thiếu sự kiện (AC-8).
- Trục nguồn dữ liệu: sự kiện của hàng (AC-2, AC-3, AC-4, AC-7) | dữ kiện lead (AC-5, AC-6) | danh mục (AC-4) | không có
  (AC-8).
- Trục thời gian: trước kỳ | trong kỳ | từ `den` (AC-10, AC-5 «gọi sau `den`») [thước CE: kỳ nửa mở, mốc bằng `den` là ngoài].
- Trục biên: mẫu 0 (AC-3, AC-8) | dãy rỗng, dãy chẵn (AC-5) | ranh N ngày (AC-2) | ranh ngưỡng nhóm (AC-7).
- Trục bất biến: không thông tin chủ nhà ở đầu ra (AC-9) | không đồng hồ (AC-10).
- Later: đường đọc cơ sở dữ liệu, API, màn số liệu (hàng sau). Never ở hàng này: ngưỡng (Cổng Đáng của chủ kho).

## Đường đo

- Thước của ô cơ hội: «mỗi số đo §11 trừ Sheet cũ ra từ một truy vấn trên sự kiện, chạy trên dữ liệu mẫu» · số từ: bảng
  số đo của lõi chạy trên bộ mẫu hàng 5 (AC-9) · hiện trạng: 7/13 mã ra từ truy vấn trên sự kiện (AC-2…AC-7), 6/13 là giới
  hạn đã khai, ra «chưa có sự kiện» có tên (AC-8) — câu SỐNG đọc nguyên văn chưa đạt; nhận đóng hàng với 7/13 là Hỏi-1
  (sổ quyết định, yêu cầu can-nguoi D-1) · bảo đảm bởi: AC-1 (đủ dòng), AC-8, AC-9 · ngưỡng số của từng số đo: chủ kho đặt
  ở Cổng Đáng trước hai tuần thử (luật đợt 24).

## Out of scope

- Đường đọc sự kiện từ cơ sở dữ liệu, API `/api/v1/...` cho số đo, màn số liệu — hàng sau.
- Ngưỡng của bất kỳ số đo nào — chủ kho đặt ở Cổng Đáng (luật đợt 24, opportunity).
- Dòng «Số ngày Sheet cũ không được sửa» — câu bật của hàng loại trừ.
- Thêm sự kiện mới (khách hỏi, Gửi, phát, mở link, quan tâm, thiết bị, mất mạng) — hàng của dãy khác hay hàng chưa có.
- Xuất export `./metrics` trong `packages/core/package.json` — chưa có nơi dùng; hàng đọc số đo thêm khi cần.

## Notes

- Bất biến chạm: (2) chủ nhà — đầu vào không khoá nào thuộc lớp `source`, đầu ra chỉ số (AC-9); (1), (3), (4) không chạm.
- Giới hạn đã biết (luật đợt 24): sáu số đo chưa có sự kiện — khách hỏi → gửi được căn, số lần phát bảng hàng, số link
  khách mở, số lượt quan tâm, tỉ lệ thao tác máy tính / điện thoại theo vai (thiếu thiết bị), số lần mất mạng và thao tác
  lúc mất mạng trên điện thoại. Bảng số đo trả «chưa có sự kiện» cho chúng (AC-8); yêu cầu `can-nguoi` gửi chủ kho.
- Dãy D chạy dev ở cổng 3495, Postgres 5575 (luật đợt 7) — hàng này không cần cả hai.
