# Lõi nhập tất định và bộ thử có đáp án (hàng 64, ND1)

Ngày 03/11/2026 · Hạng T2 · dãy G đợt dau-khach-nhap · Nguồn: ADR-0011 quyết định 1, 7, 12; Kiến trúc «Nhập dữ liệu»
§1, §3, §4, §9, §12, §13; ô cơ hội `_acceptance/nhap-loi-tat-dinh/opportunity.md` (Cổng Đáng đã duyệt «build» 02/11).

## Vấn đề

Đợt nhập dữ liệu (ND1–ND8) cần một lõi đọc bảng hàng bẩn **không cần AI**: nó là chế độ nền (sàn tắt AI, hết trần, nhà
cung cấp lỗi), là chế độ dự phòng, và số đo của nó quyết có dựng tác tử hay không (ADR-0011 quyết định 7: «nền đạt mọi
ngưỡng thì không dựng tác tử»). Bộ đọc giá trị của nó cũng là **bộ chuẩn hoá dùng chung** cho mọi cửa gõ tay (quyết định
12) — hàng 15, 24, 70 dùng lại.

## Ranh giới của vòng

Trong: `packages/core/src/import/**` (mã + test chạy trong `npm test -w @quy-hang/core`), `packages/core/test/import/**`
(bộ thử: bộ sinh file bẩn có đáp án, bộ đọc xlsx chỉ để thử, bộ đo), `_acceptance/nhap-loi-tat-dinh/**` (gồm
`so-nen.json`). Không chạm `package.json`, `package-lock.json`, `packages/core/src/index.ts` — lõi nhập chưa xuất ra gốc
gói; hàng 65 (người dùng đầu tiên ngoài lõi) thêm lối xuất `./import` khi cần.

Ngoài: đọc tệp xlsx/xls trên trình duyệt (thư viện đọc file chọn ở hàng 65 — thêm thư viện là sửa `package-lock.json`),
màu ô và gạch ngang (bộ đọc file trích thành cột ảo ở hàng 65; lõi nhận như một cột thường), kiểm trùng với hàng đang
mở (máy chủ, hàng 65), ghi, hoàn tác, nhớ mẫu, tác tử.

## Thiết kế

Mọi tệp ở `packages/core/src/import/`, hàm thuần, không I/O, không `node:`, chạy như nhau ở trình duyệt và máy chủ.

```
byte csv ──decodeText──▶ chữ ──parseCsv──▶ LƯỚI (ô: chữ | số | trống)  ◀── (hàng 65: bộ đọc xlsx ra cùng lưới)
                                              │
                                   readTable: tìm dòng tiêu đề (≤ 15 dòng đầu, kể cả hai tầng, ô gộp),
                                              bỏ dòng trống, dòng tổng
                                              ▼
                                           BẢNG (tiêu đề + dòng dữ liệu, số dòng gốc)
                                              │
                         classifyColumns ─────┤ (TRƯỚC mọi bước có thể gửi đi)
                                              ├──▶ buildProfile ──▶ HỒ SƠ CỘT (đầu vào của tác tử hàng 68)
                                              │
                         planFromDictionary ──┤ ghép tất định: từ điển tiêu đề → dò theo giá trị → giữ làm ghi chú
                                              ▼
                                         KẾ HOẠCH (khuôn chặt, validatePlan)
                                              │
                                   applyPlan ─┤ thực đơn phép biến đổi + đối chiếu danh mục + trùng mã trong file
                                              ▼
                                  KẾT QUẢ: mỗi ô một dấu — giữ nguyên · máy sửa (lý do) · cần người (lý do) · chặn (lý do)
```

### Trường chuẩn (RESO-first)

`unitNumber`, `buildingName`, `subdivisionName`, `floor`, `livingArea`, `bedroomsTotal`, `directionFaces` (lớp
`catalog`); `listPrice`, `feeInclusion`, `standardStatus` (`shareable_listing`); `ownerName`, `ownerPhone` (`source`);
`listAgentName` — RESO `ListAgentFullName`, người phụ trách (`company_internal`, cột tên người); `privateRemarks` — RESO
`PrivateRemarks`, ghi chú nội bộ (`company_internal`, chữ tự do); `confirmedDate` — ngày trong file (đặc trưng Quỹ hàng:
nguồn của `confirmedAt` ở ADR-0011 quyết định 8). Đích của một cột: trường chuẩn · `keep_as_note` · `ignore_with_reason`
(chỉ hợp lệ khi cột trống hoặc là số thứ tự 1…n — luật 11 «không bỏ mất cột nào»).

### Phân loại cột (`classify.ts`) — §3 của Kiến trúc

Sáu lớp tạm: `source` · `person_name` · `free_text` · `catalog` · `shareable_listing` · `unknown`. Thứ tự quyết, nghiêng
về che: (1) bộ dò chạy trên MỌI ô của mọi cột — số điện thoại Việt Nam (0/+84/84, chín chữ số sau đầu số, ngăn bằng cách,
chấm, gạch), email, số giấy tờ 9/12 chữ số; cột có ≥ 30% ô trúng bộ dò (số, email, giấy tờ) → `source`; cột có ô trúng bộ dò mà dưới
30% → `free_text` (một ô «chủ … 0900 000 0xx» trong Ghi chú là đủ); (2) tiêu đề trong từ điển nguồn → `source`, từ điển
người → `person_name`, ghi chú → `free_text`; (3) ≥ 50% ô có dáng họ tên (2–5 chữ, viết hoa đầu, không số, chữ đầu là một họ
phổ biến hay nhãn «[…]») → `person_name`; (4) chữ dài trung bình > 25 ký tự → `free_text`; (5) tiêu đề hay giá trị khớp trường danh mục / hàng chia
sẻ được → lớp đó; (6) còn lại `unknown`. Ngưỡng 30% / 50% / 25 ký tự ghi thành hằng có tên, có test. Chuỗi chữ số tận cùng năm số 0 trở lên là
dáng số tiền, không tính là số điện thoại hay giấy tờ (giá đồng 9–11 chữ số).

### Hồ sơ cột (`profile.ts`)

Mỗi cột: tiêu đề, lớp tạm, số dòng, số ô trống, số giá trị khác nhau, **hình dạng** (độ dài, lớp ký tự: «10 chữ số, 92%
bắt đầu 09»), và **giá trị khác nhau chỉ khi** lớp là `catalog` hay `shareable_listing` (tối đa 300). Trong cột được gửi
giá trị, một giá trị vẫn bị giữ lại (chỉ đếm vào hình dạng) khi: trúng bộ dò số / email / giấy tờ, có dáng họ tên, hoặc
trùng nguyên văn một giá trị của cột `source` / `person_name` cùng file (bắt «tên chủ trong cột Toà»). Hồ sơ là dữ liệu
JSON thuần, không trỏ lại lưới.

### Bộ chuẩn hoá dùng chung (`normalize.ts`) và thực đơn (`transforms.ts`)

`fold(chữ)` — NFC, bỏ dấu, `đ→d`, chữ thường, gộp khoảng trắng — là phép so duy nhất của từ điển tiêu đề và từ điển giá
trị. `normalizeValue(field, raw, ctx)` là **một cửa** cho mọi nơi gõ tay và lần nhập: trả `{ ok: true, value, repair? }`
hay `{ ok: false, outcome: "needs_person" | "blocked", reason }`. Thực đơn đóng, mỗi phép một hàm có tham số:

| Phép | Dùng lại | Xử lý |
| --- | --- | --- |
| `price` (đơn vị `ty`/`trieu`/`dong`/`auto`) | `docGia` của hàng 15 | số trần theo đơn vị cột, «4 tỷ 650», «4650tr» (đơn vị khác cột → máy sửa), «4.65 BP» (tách điều kiện phí sang cột phí), dải «4.6–4.8» → cần người, «TL»/«thương lượng» → cần người, «thu về 4.2» → cần người (luật 12 giá về tay) |
| `fee_condition` | `FEE_INCLUSIONS` | `BP`, `KBP`, «Đã gồm phí», «Chưa gồm phí», «bao sang tên», «chưa phí» |
| `area` | — | «75m2», «75,0», «75 (TT)» |
| `unit_code` | `readUnitCode`, `lookupUnit` của hàng 9 | «a1-03», «A 01 03», «A0103» → «A-01.03» (khác dạng chuẩn → máy sửa); đọc được mà không có trong danh mục → cần người «chưa có trong danh mục», không đoán |
| `floor`, `bedrooms` | — | «T12»; «2PN», «2N1WC», «2PN+1» (→ 2, lý do «+1») |
| `direction`, `status` | `STANDARD_STATUSES` | từ điển dựng sẵn: «ĐN», «Đ-N», «dong nam»; «Đang GD», «cọc», «dang ban», «đã chốt» |
| `date` (`dmy`/`mdy`/`auto`) | kiểm lịch như `events.ts` | «12/03/2026», số ngày Excel, ISO; thứ tự ngày/tháng đoán theo cả cột (ô có phần > 12); thiếu năm → cần người; ngày sau hôm nay → chặn |
| `phone` | `normalizePhone` của hàng 18 | chuẩn 10 chữ số đầu 0 |
| `text` | — | cắt khoảng trắng, NFC |

Cột danh mục (toà, tầng, diện tích, phòng ngủ, hướng) khi dòng có mã căn tra được: so với danh mục — khớp thì giữ nguyên,
lệch thì cần người «file ghi …, danh mục ghi …» (quyết định 12: trường danh mục lấy từ mã căn). Hai dòng cùng mã căn
chuẩn trong file → cả hai ô mã căn cần người «trùng mã căn với dòng N».

### Kế hoạch và ghép tất định (`plan.ts`, `headers.ts`)

`ImportPlan` đúng khuôn ở Kiến trúc §4 (`headerRow`, `columns[]` với `column` · `target` · `transform?` · `valueMap?` ·
`confidence` · `reason`, `questions[]`); `validatePlan` từ chối khoá lạ ở mọi cấp, phép ngoài thực đơn, tham số sai,
`ignore_with_reason` trên cột có dữ liệu không phải số thứ tự. `planFromDictionary(table, classes)` ghép: (1) tiêu đề đã
`fold` khớp từ điển đồng nghĩa (hai tầng ghép «cha con» trước, rồi «con») → `high`; (2) không khớp thì dò theo giá trị
(≥ 80% ô đọc được bằng một phép: mã căn, số điện thoại, trạng thái, điều kiện phí, hướng; dãy 1…n → số thứ tự) →
`medium`; (3) còn lại `keep_as_note`, `low` (màn hiện «cần người»). Đơn vị giá suy từ tiêu đề («(tỷ)», «VNĐ», «triệu»),
không thì `auto` theo độ lớn của cả cột.

### Áp kế hoạch (`apply.ts`)

`applyPlan(table, plan, ctx)` chạy mọi dòng, mỗi ô một dấu. «Giữ nguyên» = ô đọc thẳng ra giá trị chuẩn theo phép và
đơn vị của cột (đổi dạng số sang ISO hay số đồng không tính là sửa); «máy sửa» = phải sửa mới đọc được, kèm một câu lý
do; «cần người» = có lý do; «chặn» = giá trị phạm luật lõi không ô nào chọn lại được (giá ≤ 0 hay quá 1.000 tỷ, ngày sau
hôm nay). Cùng đầu vào → cùng kết quả từng byte (không `Date.now()` bên trong: `today` đi trong `ctx`).

### Bộ thử (`packages/core/test/import/`) và số nền

- Hai file mẫu: đọc **chính** `packages/db/seed/mau/mau-a.xlsx`, `mau-b.xlsx` bằng bộ đọc xlsx tối thiểu chỉ dành cho
  thử (zip lưu không nén, chữ nội tuyến, ô số — đúng khuôn bộ ghi của hàng 5; khuôn lạ → ném lỗi, không đoán).
- Sáu file bẩn sinh tất định từ `packages/db/seed/mau/du-lieu-mau.json`: `ban-tieu-de`, `ban-gia`, `ban-ma-can`,
  `ban-ngay-trang-thai`, `ban-nguon-giau`, `ban-csv` (UTF-8 có BOM và Windows-1258, dạng byte). Mỗi file kèm đáp án: dòng
  tiêu đề, đích từng cột, giá trị đúng của từng ô (suy từ dữ liệu mẫu, không từ bộ đọc), và mỗi lỗi cấy một nhãn (ô,
  giá trị đúng hay «phải hỏi người»).
- Bốn số đo (Kiến trúc §9): độ đúng ghép cột · lỗi được sửa · lỗi lọt · tỉ lệ hỏi người — mỗi file và cộng dồn, ghi
  `_acceptance/nhap-loi-tat-dinh/so-nen.json` bằng lệnh `do-so-nen`; test so tệp đã commit với lần tính lại (số nền không
  được cũ). Ngưỡng không đặt ở hàng này — Cổng Đáng của hàng 68 đọc số nền.

## Đối chiếu ngành (ADR-0022)

Tra 03/11 (help center chính chủ, không đăng nhập). Cả hai sản phẩm nhập **liên hệ** từ CSV; nhập **bảng hàng** (listing)
từ file của sàn **chưa kiểm** ở cả hai.

| Năng lực | RESO | Follow Up Boss | Lofty | Ta làm | Ta cứng — họ cấu hình? |
| --- | --- | --- | --- | --- | --- |
| Ghép cột file vào trường | Tên trường theo Data Dictionary (`ListPrice`, `UnitNumber`, `PrivateRemarks`…) | Người chọn trường cho từng cột ở bước ghép; tiêu đề rõ ở dòng đầu giúp ghép ([Import Contacts](https://help.followupboss.com/hc/en-us/articles/4402323033751)) | Máy tự ghép, người soát cả cột đã «matched» ([Lead Import](https://help.lofty.com/hc/en-us/articles/360001710831)) | Máy ghép tất định bằng từ điển + dò giá trị, người duyệt ở hàng 65; từ điển của sàn (`ctx`) chồng lên từ điển dựng sẵn | Không — từ điển dựng sẵn là mặc định của sản phẩm, sàn chồng từ điển riêng qua dữ liệu (`ctx.companyAliases`; bảng và màn ở hàng 67, 70) |
| Cột không khớp trường nào | — | Vào Notes (kèm tiêu đề) hoặc thành Custom Field | chưa kiểm | `keep_as_note` (giữ cùng tiêu đề) hoặc đích `custom:<tên>`; không bỏ cột | Không — đích `custom:` có sẵn trong khuôn kế hoạch |
| Ô nhiều giá trị | — | Không nhận: mỗi số một cột | chưa kiểm | Đọc «4.65 BP» thành giá + điều kiện phí; dải giá → cần người | Không |
| Tên người phụ trách | `ListAgentFullName` | — | Tên đầu chủ phải khớp đúng tên trong tài khoản (bên thứ ba: [Curaytor](https://help.curaytor.com/knowledge/importing-contact-lists-to-chime-crm)) | Phân loại `person_name`, không gửi giá trị; khớp tên thành viên ở hàng 65 | Không |
| Che dữ liệu cá nhân trước khi xử lý | — | chưa kiểm | chưa kiểm | Bộ dò + ngưỡng nghiêng về che | **Khoá** — bất biến 2 (quyền và an toàn), không phải dữ liệu của sàn |

## Lối đã so

| Câu | Lối chọn | Lối loại — vì sao |
| --- | --- | --- |
| Bộ thử đọc hai file mẫu thế nào | Đọc chính tệp xlsx đã commit bằng bộ đọc chỉ-để-thử | Thêm thư viện xlsx: sửa `package-lock.json` (ngoài ranh giới); sinh lại lưới bằng `mau-file.mjs`: lõi phụ thuộc gói db và không thử được tệp thật |
| File bẩn ở dạng nào | Lưới / byte sinh trong test từ dữ liệu mẫu | Commit file nhị phân: phải có bộ ghi xlsx thứ hai; xlsx bẩn (ô gộp) cần bộ đọc thật của hàng 65 |
| Giá đọc bằng gì | `docGia` của hàng 15 | Viết bộ đọc giá thứ hai: hai bộ đọc lệch nhau là đúng thứ quyết định 12 cấm |
| Ngưỡng của số đo | Chỉ ghi số nền | Đặt ngưỡng ở đây: ngưỡng là của Cổng Đáng hàng 68 (ADR-0011 quyết định 7) |

## Đặc tả UX

Không có — hàng không chạm giao diện (sổ quyết định, dòng «bỏ đặc-tả-UX»).
