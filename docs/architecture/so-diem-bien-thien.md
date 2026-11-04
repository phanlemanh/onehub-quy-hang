# Sổ điểm biến thiên — mỗi chỗ sàn chỉnh được, khai một lần

> **Đã chốt 01/11/2026** cùng [ADR-0018](../adr/0018-cau-hinh-theo-san.md). Khoá theo khuôn hàng 25 đã đặt:
> `<nhóm>.<khoá>` chữ thường, gạch dưới; giá trị ở bảng `company_settings`. Đây là đầu vào cho sổ ở mã
> (`packages/core/src/config/`, hàng 81): khi có sổ ở mã, bộ kiểm của lõi so hai bên — khoá có ở đây mà không có ở mã
> (hay ngược lại) là đỏ. Thêm, bớt hay đổi một điểm là sửa bảng này trong cùng PR với mã.

Kiểm kê ngày 01/11 trên `main` 611df45, các nhánh đang chạy của đợt `dau-chu-dong-vao` (dãy L hàng 25, dãy D hàng 72) và
Tham chiếu §5–§13. Mỗi dòng ghi nguồn. Không có số nào ở đây mà Tham chiếu, ADR hay mã chưa nói — trừ cột «Khoảng cho
phép», là đề xuất của phiên này, chốt ở Cổng Phạm vi của hàng mở màn chỉnh điểm ấy.

## Cách đọc

| Cột | Nghĩa |
| --- | --- |
| Khoá | Tên trong mã, tiếng Anh, `<nhóm>.<khoá>` chữ thường có gạch dưới (khuôn hàng 25). Khoá có `<…>` là một họ khoá (mỗi trường, mỗi trạng thái một khoá) |
| Kiểu | `int` · `decimal` · `bool` · `enum{…}` · `set{…}` (tập con) · `text≤n` · `map` (đối tượng cấu hình có bảng riêng) |
| Mặc định | Mặc định dựng sẵn của sản phẩm; sàn chưa đổi thì nhận số này (ADR-0018 quyết định 3) |
| Khoảng | Giá trị lệnh đổi được nhận; ngoài khoảng → lỗi nêu đúng khoá |
| Ai đổi | Vai đổi ở cấp sàn; mặc định Quản trị sàn (Tham chiếu §2, §4 «Cấu hình sàn») |
| Ghi đè | Cấp dưới sàn được sửa riêng cho một đối tượng (một căn, một bộ gửi) — không phải đổi cấu hình |
| Hiệu lực | `mới`: đối tượng mang số lúc tạo, đổi sau chỉ áp cho đối tượng mới (luật 13, hàng 48) · `tính lại`: đọc lúc tính, áp ngay cho mọi thứ |
| Lớp | Lớp dữ liệu của giá trị (`packages/core/src/data-classes.ts`). Cấu hình là `company_internal`; định nghĩa trường riêng mang `custom_field`. **Không điểm nào thuộc `source`** |
| Tình trạng | **Mở** — Tham chiếu đã chốt là mặc định của sàn · **Đề xuất** — ADR đề xuất, chờ Cổng Phạm vi · **Ứng viên** — chưa mở, chờ điều kiện (ADR-0018 quyết định 7) · **Khoá** — khai để biết là không mở |
| Màn | Hàng lộ trình đưa màn chỉnh điểm ấy; `—` là chưa có màn, sàn nhận mặc định |

## A. Điểm mở và đề xuất

### A1. Lead — luật 20, hàng 25, 48

| # | Khoá | Điểm | Kiểu | Mặc định | Khoảng | Ai đổi | Ghi đè | Hiệu lực | Lớp | Tình trạng | Nguồn | Màn |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `lead_routing.accept_minutes` | Hạn nhận lead | `int` phút | 15 | 1–1440 | Quản trị sàn | — | mới | company_internal | Mở | Tham chiếu luật 20, §13 (chốt 29/10); `DEFAULT_LEAD_ROUTING` ở `packages/core/src/routing/index.ts` (nhánh hàng 25) | 48 |
| 2 | `lead_routing.first_call_minutes` | Hạn gọi lần đầu | `int` phút | 30 | 1–1440, không nhỏ hơn #1 | Quản trị sàn | — | mới | company_internal | Mở | Như #1 | 48 |
| 3 | `lead_routing.strategy` | Cách chia lead không trùng | `enum{zone_round_robin, company_round_robin, zone_least_open, open_pool, manual}` | `zone_round_robin` — theo vùng phụ trách, lần lượt | Năm chiến lược của thực đơn; luật chủ trùng và lối trưởng nhóm giao lại luôn chạy, chiến lược nào cũng vậy | Quản trị sàn | Trưởng nhóm giao lại từng lead (hàng 25 AC-7) | mới — lead mang dấu cách chia từ nhịp đầu nó vào | company_internal | Mở | Luật 20 «chia theo luật của sàn»; chủ kho 1/11 «cứng là không triển khai được» (giám sát chuyển); hàng 25 | 25 (thực đơn), 48 (màn) |
| 3a | `lead_routing.alert_to` | Báo lead quá hạn cho ai | `enum{team_lead, team_lead_and_admin}`; kênh theo hàng 26 | `team_lead`, trong app | hai giá trị | Quản trị sàn | — | tính lại — áp ngay cho mọi lời báo | company_internal | Mở | Luật 20 «quá hạn thì báo trưởng nhóm»; chủ kho 1/11; hàng 25 | 25, 48 |

### A2. Độ tươi, hàng đợi, nhắc trước khi gửi — luật 18, 25, hàng 22, 48

| # | Khoá | Điểm | Kiểu | Mặc định | Khoảng | Ai đổi | Ghi đè | Hiệu lực | Lớp | Tình trạng | Nguồn | Màn |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 4 | `queue.call_back_after_days` | «Cần gọi lại» sau số ngày chưa xác nhận | `int` ngày | 14 | 7–30 | Quản trị sàn | — | tính lại | company_internal | Mở | Luật 18; `CALL_BACK_AFTER_DAYS` ở `packages/core/src/listing/freshness.ts` (main) | 48 |
| 5 | `queue.price_negotiation_after_days` | «Nên gọi ép giá» sau số ngày | `int` ngày | 10 | 7–14 | Quản trị sàn | — | tính lại | company_internal | Mở | Luật 18 (khoảng 7–14 đã chốt); §13 câu phỏng vấn | 48 |
| 6 | `share.stale_warning_days` | Nhắc gọi trước khi gửi căn chưa xác nhận | `int` ngày | 14 | 7–30 | Quản trị sàn | — | tính lại | company_internal | Mở | Luật 25 | — (theo #4 tới khi có màn) |
| 36 | `queue.groups` | Bộ nhóm của Hôm nay đầu chủ (nhãn, điều kiện, ngưỡng từng nhóm) | `map` — bộ nhóm, kiểm ở `today/kiem.ts` | bộ năm nhóm dựng sẵn (`BO_NHOM_MAC_DINH`); ngưỡng hai nhóm mặc định từ #4, #5 | nhóm mặc định giữ khoảng #4, #5; nhóm sàn tự tạo 1–90 ngày | Quản trị sàn | — | tính lại | company_internal | Mở | Hàng 22 (`today/mac-dinh.ts`, `QUEUE_GROUPS_KEY`); lối ghi `PUT /api/v1/company/settings/queue` | 48 |

### A3. Giá và phí — luật 7, 12, 13, §13, hàng 15, 28, 49

| # | Khoá | Điểm | Kiểu | Mặc định | Khoảng | Ai đổi | Ghi đè | Hiệu lực | Lớp | Tình trạng | Nguồn | Màn |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 7 | `price.change_confirm_pct` | Đổi giá quá bao nhiêu % thì hỏi lại | `int` % | 20 | 5–50 | Quản trị sàn | — | tính lại | company_internal | Mở | Luật 7; ADR-0011 quyết định 1 (luật kiểm của lần nhập) | 49 |
| 8 | `fee.inclusion` | Định nghĩa «Bao phí» | `set{personalIncomeTax, registrationFee, brokerageFee}` | cả ba | tập con khác rỗng | Quản trị sàn | — | mới — giá bao phí mang định nghĩa lúc tính | company_internal | Mở | §13 (chốt 29/10), luật 13 | 49 |
| 9 | `fee.brokerage_pct` | Phí môi giới | `decimal` % | 1 | 0–5 | Quản trị sàn | Đầu chủ sửa từng căn | mới | company_internal | Mở | §13 (chốt 29/10); hàng 28 đọc mặc định ở `TI_LE_BAO_PHI_MAC_DINH` (`pricing/ve-tay.ts`), đầu chủ sửa cho một lần tính trên màn cuộc gọi, chưa lưu | 49 |
| 10 | `fee.personal_income_tax_pct` | Thuế thu nhập cá nhân khi chuyển nhượng | `decimal` % | 2 (mặc định tạm của hàng 28, `TI_LE_BAO_PHI_MAC_DINH`) — kiểm lại văn bản ở hàng 49 | 2–2 — chỉ đúng số luật tới hàng 49 (Hỏi-1 hàng 81, 04/11) | Quản trị sàn | — | mới | company_internal | Mở | Luật 13, hàng 49 | 49 |
| 11 | `fee.registration_fee_pct` | Lệ phí trước bạ | `decimal` % | 0,5 (như #10) | 0,5–0,5 — như #10 | Quản trị sàn | — | mới | company_internal | Mở | Luật 13, hàng 49 | 49 |

### A4. Trang khách và gửi — luật 24, 26, §13, hàng 31, 35, 44

Mọi điểm ở đây chỉ chọn cách hiện **trong trần** của luật ẩn (`packages/core`, hàng 31): không khoá nào đưa được trường
nội bộ hay nguồn ra trang khách (bất biến 2, 4) — bộ kiểm rò rỉ chạy trên cấu hình mở nhất (ADR-0018 quyết định 6).

| # | Khoá | Điểm | Kiểu | Mặc định | Khoảng | Ai đổi | Ghi đè | Hiệu lực | Lớp | Tình trạng | Nguồn | Màn |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 12 | `customer_page.show_confirmed_age` | Hiện «giá xác nhận X ngày trước» cho khách | `bool` | có | — | Quản trị sàn | — | tính lại | company_internal | Mở | §13 (chốt 29/10) | — |
| 13 | `customer_page.private_hides_unit_number` | Gửi khách riêng ẩn mã căn, chỉ toà + tầng cao / thấp | `bool` | có | — | Quản trị sàn | — | tính lại | company_internal | Mở | Luật 24 (chốt 28/10), §7 «cách hiện trên trang khách là mặc định» | — |
| 14 | `customer_page.off_compound_address` | Khách riêng thấy gì với nhà ngoài khu | `enum{street_ward, ward_only}` | `street_ward` | hai giá trị; không mở số nhà, hẻm, toạ độ cho khách riêng | Quản trị sàn | — | tính lại | company_internal | Đề xuất | ADR-0016 Hỏi-3 | — |
| 15 | `broker_page.commission_split_pct` | Mức chia trên trang nhóm môi giới | `decimal` % | trống — chưa có số, đặt ở Cổng Phạm vi hàng 44 (Hỏi-1 hàng 81) | 0–100 | Quản trị sàn | Người gửi sửa theo bộ | mới — bộ gửi mang mức lúc gửi | company_internal | Mở | §13 (chốt 29/10) | 44 |
| 16 | `broker_page.hide_commission_split` | Sàn ẩn mức chia | `bool` | không | — | Quản trị sàn | — | tính lại | company_internal | Mở | §13 (chốt 29/10) | 44 |
| 17 | `customer_page.interest_button` | Nút «Quan tâm» trên trang khách | `bool` | có | — | Quản trị sàn | — | tính lại | company_internal | Mở | §13 «giữ» (29/10), §7 | — |

### A5. Cách gọi riêng, trạng thái riêng, trường riêng — §7, hàng 45, 46, 47, 70

| # | Khoá | Điểm | Kiểu | Mặc định | Khoảng | Ai đổi | Ghi đè | Hiệu lực | Lớp | Tình trạng | Nguồn | Màn |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 18 | `labels.field.<trường chuẩn>` | Tên hiển thị của một trường chuẩn | `text≤40` | nhãn ở `CONTEXT.md` | qua bộ dò số điện thoại, email của ADR-0011 §3 — trúng là từ chối | Quản trị sàn | — | tính lại | company_internal | Mở | §7 lớp «Cách gọi riêng» | 45 |
| 19 | `values.aliases` | Giá trị riêng neo vào giá trị chuẩn (từ điển của sàn) | `map` — bảng `company_value_aliases` | từ điển dựng sẵn của sản phẩm (`BP`, `KBP`…) | chỉ trường tập đóng; không trường lớp `source` | Quản trị sàn duyệt; người dùng đề xuất qua lựa chọn | — | tính lại | company_internal | Mở | §7; ADR-0011 quyết định 6, 12 | 45, 70 |
| 20 | `values.auto_accept_after_choices` | Tự nhận đề xuất từ điển khi đủ số người cùng chọn | `int` hoặc tắt | tắt | 2–10 | Quản trị sàn | — | tính lại | company_internal | Đề xuất | `docs/architecture/nhap-du-lieu.md` §12 («ba người cùng chọn») | 70 |
| 21 | `labels.status.<nhãn>` | Nhãn trạng thái riêng neo vào một trong sáu trạng thái chuẩn | `map` — nhãn → `StandardStatus` | nhãn mặc định §5 | tối đa 3 nhãn riêng mỗi trạng thái chuẩn; nhận luật và màu của trạng thái chuẩn | Quản trị sàn | — | tính lại | company_internal | Mở | §5, §7; hàng 46 | 46 |
| 22 | `custom_fields` | Trường riêng | `map` — bảng định nghĩa; kiểu `bool` hay `single_select` | không có | tối đa 20 trường, mỗi trường chọn một tối đa 30 lựa chọn; máy dò trùng nghĩa với trường chuẩn trước khi tạo | Quản trị sàn | — | tạo / đổi tên: tính lại; bỏ trường: ẩn, giữ giá trị đã lưu | custom_field | Mở | §7 (chốt 29/10); Kiến trúc §1 «một cột linh hoạt kèm bảng định nghĩa theo sàn» | 47 |
| 23 | `custom_fields.<id>.share_with_partners` | Kèm trường riêng khi phát hàng cho đội khác | `bool` | không | — | Quản trị sàn | — | tính lại | company_internal | Mở | §7; trần `by_company_toggle` | 47 |

### A6. Nhập dữ liệu, AI, mẫu — ADR-0011, hàng 43, 50, 67, 68

| # | Khoá | Điểm | Kiểu | Mặc định | Khoảng | Ai đổi | Ghi đè | Hiệu lực | Lớp | Tình trạng | Nguồn | Màn |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 24 | `ai.monthly_budget_usd` | Trần chi phí AI mỗi tháng | `decimal` USD | 10 | 0–10 — tới khi hàng 68 đặt trần nền tảng (Hỏi-1 hàng 81, 04/11) | Quản trị sàn | — | tính lại | company_internal | Mở | ADR-0011 quyết định 10 | 68 |
| 25 | `import.templates` | Mẫu file nhập đã nhớ | `map` — bảng `import_templates` | không có | không chứa giá trị cột nguồn hay cột tên người | Đầu chủ, trưởng nhóm tạo khi nhập; quản trị sàn sửa | — | áp cho lần nhập sau | company_internal | Mở | ADR-0011 quyết định 6 | 67, 50 |
| 26 | `export.templates` | Mẫu bảng hàng khi phát hàng | `map` | mẫu dựng sẵn | cột chỉ chọn trong tập luật ẩn cho phép | Quản trị sàn | Đầu chủ chọn mẫu khi phát | áp cho lần phát sau | company_internal | Mở | Hàng 43, 50 | 50 |
| 27 | `share.post_templates` | Mẫu bài theo kênh | `map` | mẫu dựng sẵn | chỗ điền chỉ lấy trường luật ẩn cho phép | Quản trị sàn | Người gửi sửa bài trước khi chia sẻ | áp cho lần gửi sau | company_internal | Mở | Hàng 34, 43, 50 | 50 |

Bật / tắt «Xử lý bằng AI» **không phải** cấu hình: đó là thoả thuận `ai_processing` (ADR-0011 quyết định 2), có nhật ký
và trần lớp của thoả thuận. Sổ không có khoá cho nó.

### A7. Lên bảng — luật 17, hàng 23

| # | Khoá | Điểm | Kiểu | Mặc định | Khoảng | Ai đổi | Ghi đè | Hiệu lực | Lớp | Tình trạng | Nguồn | Màn |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 33 | `listing.ready_min_real_photos` | Số ảnh thật tối thiểu (ngăn Gửi được, không ảnh mẫu, chưa xoá) để căn vào Đang bán | `int` | 1 | 1–20 (sàn nâng được, không bỏ được — giữ nghĩa K7) | Quản trị sàn | — | lần đổi trạng thái kế | company_internal | Mở | Luật 17; hàng 23 (giám sát đồng ý 01/11); MLS mỗi nơi một luật (Đối chiếu ngành §7); lõi `listing/san-sang.ts`, máy chủ đọc khi đổi sang Đang bán | chưa có |

## B. Ứng viên — chưa mở, chờ điều kiện

| # | Điểm | Vì sao chưa | Mở lại khi | Chờ |
| --- | --- | --- | --- | --- |
| 28 | Sàn thêm điều kiện riêng cho «Sẵn sàng bán» (chỉ thêm, không bớt của lõi) | Chưa sàn nào hỏi; điều kiện tối thiểu là ý nghĩa của «Đang bán» trên trang khách | Hai sàn thật xin điều kiện khác nhau | CH7 |
| 29 | Ngưỡng ép giá khác theo loại căn hay mức giá | §13 «Hỏi ở buổi phỏng vấn sau» | Phỏng vấn trả lời có | CH8 |
| 30 | Bảng quyết định cho chia lead (chiến lược khác theo loại hình, khoảng giá, nhu cầu) và chiến lược thứ sáu (theo ca, theo giờ) | Thực đơn năm chiến lược (#3) chưa được sàn thật dùng | Sàn thật cần điều kiện mà thực đơn không nói được | CH6 |
| 31 | Trường riêng kiểu chữ, số, ngày | §7 «để sau» | Hai sàn thật xin | CH9 |
| 32 | Sao cấu hình của một sàn mẫu cho sàn mới | Mới có một sàn | Đội vận hành mở sàn thứ hai thật | CH11 |
| 34 | Bộ lựa chọn của danh sách hỏi (chế độ cuộc gọi): mặc định ở `DANH_SACH_HOI` (`listing/danh-sach-hoi.ts`), neo mã RESO khi có | Hàng 28 Hỏi-2: sàn ghi đè qua sổ từ vựng, chưa có | Sổ từ vựng (hàng 90) có | hàng 90 |
| 35 | Tập căn đem so giá trong toà: cùng toà, cùng số phòng ngủ, nấc `SO_GIA_NAC` (Đang bán, Đang giao dịch) | Hàng 28 Hỏi-4: chưa sàn nào xin tập khác | Sàn thật xin so thêm nấc hay khác loại | — |

## C. Khoá — khai để không ai hỏi lại

| # | Điều | Vì sao khoá | Nguồn |
| --- | --- | --- | --- |
| K1 | Sáu trạng thái chuẩn, bảng chuyển 12 lối, Đã bán và Ngừng hẳn là nấc cuối | Nghĩa chung của dữ liệu mọi sàn; sàn thêm nhãn, không thêm nghĩa | §5; ADR-0008; `listing/status.ts` |
| K2 | «Đã cọc», «Đã bán» thắng ngay khi hai người cùng sửa | Luật đồng bộ | Luật 10; `WINS_IMMEDIATELY` |
| K3 | Trần của bảy lớp dữ liệu | Bất biến | `data-classes.ts`; ADR-0017 của onehub-invest |
| K4 | Ai thấy nguồn: đầu chủ giữ căn và trưởng nhóm; quản trị sàn không tự thấy | Bất biến 2 kề; quyền | ADR-0010; `access/bang-xem-nguon.json` |
| K5 | Trục ai thấy hàng: «Chỉ tôi» → «Toàn sàn» khi lần đầu Đang bán | Quyền, lớp khó đảo; «Nhóm» chưa có | §6; hàng 12; `visibility/index.ts` |
| K6 | Mức đủ thông tin: năm mục, theo loại hình — cũng là năm nhóm của danh sách hỏi trong chế độ cuộc gọi | Danh sách hỏi chung; so được giữa sàn | ADR-0008 quyết định 5; ADR-0016 quyết định 2; hàng 28 (`DANH_SACH_HOI` khớp `COMPLETENESS_ITEMS`) |
| K7 | Điều kiện tối thiểu vào Đang bán: mã căn, giá kèm điều kiện phí (thay cho giá về tay tới hàng 28), ít nhất một ảnh thật, pháp lý, tình trạng sử dụng; số ảnh thật tối thiểu sàn nâng được ở #33 | Nghĩa của «Đang bán» trên trang khách | Luật 17; ADR-0008 Hỏi-1; hàng 23; `missingFor` |
| K8 | Mỗi căn ở đúng một hàng đợi; ép giá thắng gọi lại | Hôm nay đọc được | Luật 18 |
| K9 | Sửa giá hay trạng thái là vừa xác nhận với chủ nhà | Tắt theo từng lệnh, không theo sàn | Luật 9; ADR-0008 quyết định 5; ADR-0011 quyết định 8 |
| K10 | Cách đọc mã căn của khu | Dữ liệu của danh mục dùng chung, không của sàn | Hàng 9; `catalog/code-rule.ts` |
| K11 | Bộ trường theo loại hình | Dữ liệu của lõi; sàn đặt nhãn loại hình qua #19 | ADR-0016 quyết định 1, 2; hàng 72 |
| K12 | Năm mục lead; tập giá trị nhu cầu, thời gian ra hàng; ba lý do Ngừng hẳn | Tập đóng của lõi; sàn đổi nhãn qua #18, #19 | ADR-0012; §5 |
| K13 | Ai nhập file: đầu chủ, trưởng nhóm | Quyền; nguồn | ADR-0011 quyết định 11 |
| K14 | Bộ phân loại cột trước khi gửi AI và ngưỡng của nó | Bất biến 2 | ADR-0011 quyết định 2; `nhap-du-lieu.md` §3 |
| K15 | Phiên đăng nhập 30 ngày; 5 lần xin mã / 15 phút | Nền tảng, an toàn | ADR-0005 bổ sung 31/10 |
| K16 | Nhịp kéo đồng bộ 30 giây; gói ghi 200 dòng; tác tử 8 lượt, 240 giây | Nền tảng | Tham chiếu §12 (31/10); ADR-0011 quyết định 4, 5 |
| K17 | Màu theo trạng thái chuẩn | Nhãn riêng nhận màu của trạng thái chuẩn | §5 |
| K18 | Người bấm gửi; không đăng hộ, không tự trả lời | Bất biến 3 — không có khoá nào | §8 luật 22 |
| K19 | Link không tự hết hạn ở bản đầu | Chốt 29/10 cho bản đầu | §13 |
| K20 | Mã căn của hàng gắn một lần; đã có thì khoá | Nghĩa chuẩn để so — thuộc tính căn, ảnh gắn theo toà + mã | ADR-0026 quyết định 1; hồ sơ `dien-ma-can-cho-hang` Hỏi-3 |
| K21 | Mỗi sàn tối đa một hàng đang mở trên một căn — gắn mã trùng bị chặn | Nghĩa chuẩn để so; «đang mở» là `OPEN_STATUSES` của lõi | §4; ADR-0026 quyết định 4 |
| K22 | Dòng nhập file trỏ căn đã có hàng mở mà người khác giữ thành tin bổ sung, không ghi đè hàng (Lofty cho chủ tài khoản chọn cách đè) | Quyền và an toàn — người giữ căn không bị người khác ghi đè | Luật 20; hàng 65a Hỏi-2 (chủ kho duyệt 03/11); `quyetDongNhap` ở `packages/core/src/import/dong.ts` |

## Đếm

- **30 điểm** ở phần A (#1–#27, #3a, #33 của hàng 23 và #36 của hàng 22): 28 «Mở» (Tham chiếu, ADR hay lời chủ kho đã chốt là mặc định của sàn), 2
  «Đề xuất» (#14, #20). Cột «Khoảng» là đề xuất của phiên này, chốt ở Cổng Phạm vi của hàng màn. 7 trong 30 là đối tượng
  cấu hình có bảng riêng (`map`: #19, #21, #22, #25, #26, #27, #36); 23 là giá trị đơn.
- **Đã có trong mã hay nhánh**: 3 điểm (#1, #2 ở nhánh hàng 25; #4 ở `main`) — đều khai một chỗ, chưa đọc theo sàn.
  Hàng 25 (dãy L) dựng thực đơn chia lead và bảng `company_settings` (migration 011): bốn khoá #1, #2, #3, #3a ở đây là
  đúng khoá, khoảng và mặc định dãy L đặt (`DEFAULT_LEAD_ROUTING`, `LEAD_ROUTING_KEYS`), đối chiếu 01/11.
- **Đang dựng ở dãy chạy**: #5 (hàng 22, dãy G). **Đã có trong mã ở hàng 23**: #33 và điều kiện K7 (máy chủ đọc #33; chưa có màn chỉnh).
- **7 ứng viên** ở phần B (#34, #35 của hàng 28), **21 điều khoá** ở phần C.
- Theo màn: hàng 48 nhận 6 điểm (#1–#5, #3a), 49 nhận 5 (#7–#11), 45 hai họ (#18, #19), 46 một, 47 hai, 50 ba, 44 hai, 70
  hai, 68 một; năm điểm (#6, #12, #13, #14, #17) chưa có hàng màn — sàn nhận mặc định tới khi Cổng Phạm vi hàng 35, 44
  hay 48 gom vào; #33 (hàng 23) chưa có hàng màn — sàn nhận mặc định 1.
