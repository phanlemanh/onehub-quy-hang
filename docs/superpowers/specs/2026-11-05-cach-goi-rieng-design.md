# Cách gọi riêng (hàng 45) — thiết kế

Ngày 05/11/2026 · dãy B đợt dau-khach-nhap · hạng T3 (chạm `packages/db`, giám sát cấp migration 039 — yêu cầu B-15).
Hồ sơ: `_acceptance/cach-goi-rieng/`. Ô cơ hội đã ký Cổng Đáng (Manh Phan, 05/11).

## Vấn đề

Mỗi sàn gọi cùng một thứ bằng chữ của mình: «Phí CN» là điều kiện phí, «BP» là bao phí (Tham chiếu §7, bảng lớp
«Cách gọi riêng»). Bản đầu chạy bằng nhãn dựng sẵn (`CONTEXT.md`); hàng này mở màn P1 «Cách gọi» trong Cài đặt › Sàn để
quản trị sàn đổi tên hiển thị của trường chuẩn và đặt tên riêng cho giá trị chuẩn — mà nghĩa vẫn do lõi giữ (ADR-0022 D5
«nghĩa do lõi giữ; tên gọi là dữ liệu của sàn»; Tham chiếu §7 «sàn thêm nhãn, không thêm nghĩa»).

Câu giao (hàng 45): Quản trị sàn đổi tên hiển thị một trường chuẩn và thêm một giá trị riêng neo vào giá trị chuẩn, rồi
cùng một căn hiện đúng chữ mới ở Bảng hàng, ở đội khác và trên trang khách; lọc và đếm vẫn theo giá trị chuẩn; không neo
thì không lưu được; sàn khác vẫn thấy tên mặc định.

## Cách làm

### 1. Lưu ở đâu — `company_settings` với khoá ba đoạn (migration 039)

- Sổ điểm biến thiên đã khai #18 `labels.field.<trường chuẩn>` (chữ ≤ 40). Bảng `company_settings` (migration 011) chặn
  khoá ba đoạn bằng check `^[a-z][a-z_]*\.[a-z][a-z_]*$`, nên #18 chưa lưu được.
- Migration 039 nới check đúng hai họ: khoá hai đoạn như cũ, hoặc `labels.(field|value).<trường chuẩn>` với tên trường
  RESO camelCase (`^labels\.(field|value)\.[a-z][A-Za-z0-9]*$`). Khoá như `Lead Routing` vẫn bị check từ chối (ca cũ
  của bộ kiểm cách ly giữ nguyên).
- Không bảng mới: dòng nhãn đi chung luật dòng, quyền ghi chỉ quản trị sàn (011) và nhật ký chỉ thêm (026) — mỗi lần đổi
  nhãn một sự kiện ghi người và vai, đúng Tham chiếu §4 «mọi thay đổi vào nhật ký».
- Sổ thêm dòng #37 `labels.value.<trường chuẩn>` (đối tượng `{giá trị chuẩn: tên riêng}`, lối riêng của hàng 45). #19
  `values.aliases` (từ điển gõ tắt khi nhập, nhiều cách gõ → một giá trị chuẩn) giữ nguyên cho hàng 70 — đó là chiều
  VÀO, còn #37 là chiều HIỆN. Lệch so với chữ sổ #19 (bảng `company_value_aliases`) nêu ở Cổng Phạm vi (Hỏi-3).

### 2. Lõi — `packages/core/src/labels/` (một sổ từ vựng)

- `TRUONG_DAT_TEN`: 15 trường chuẩn đổi tên được, theo RESO, mỗi trường một nhãn mặc định lấy từ `CONTEXT.md`:
  `buildingName` Toà · `unitNumber` Mã căn · `livingArea` Diện tích · `floor` Tầng · `directionFaces` Hướng ·
  `standardStatus` Trạng thái · `listPrice` Giá chào · `feeInclusion` Điều kiện phí · `furnished` Nội thất ·
  `legalStatus` Pháp lý · `financing` Tài chính · `occupantType` Tình trạng sử dụng · `closePrice` Giá chốt ·
  `closeDate` Ngày bán · `withdrawnReason` Lý do ngừng. Không trường lớp `source` nào (bất biến 2) — bài kiểm buộc.
- `TAP_DONG`: trường có tập giá trị đóng mà sàn đặt tên riêng cho từng giá trị: `feeInclusion` (`included`,
  `excluded`) và `withdrawnReason` (ba lý do). Trạng thái là việc của hàng 46; hướng và loại hình để sau.
- `kiemNhanTruong`, `kiemNhanGiaTri`: chữ 1–40 ký tự sau khi bỏ khoảng trắng hai đầu, qua bộ dò số điện thoại, email,
  số giấy tờ (`detectPersonal`, ADR-0011 §3 — khuôn #18 đã dùng); giá trị riêng PHẢI có neo là một giá trị trong tập
  đóng của trường — thiếu neo hay neo lạ là lỗi nêu khoá; hai giá trị riêng cùng chữ trong một trường là lỗi.
- `boTuVung(dong)`: từ các dòng `{key, value}` của sàn → `TuVung = { truong: Partial<Record<Truong, string>>,
  giaTri: Partial<Record<TruongDong, Partial<Record<string, string>>>> }`. Dòng hỏng bỏ qua (không làm sập màn), như
  `giaiCauHinh`.
- `nhanTruong(tv, truong, macDinh)` và `nhanGiaTri(tv, truong, chuan, macDinh)` — mặt nào cũng gọi; sàn chưa đặt thì
  trả đúng chữ mặc định của mặt ấy, nên «bản đầu chạy bằng mặc định» không đổi một chữ nào.
- `tuVungRaNgoai(tv, khoaRa)`: phần từ vựng được theo căn ra ngoài — chỉ nhãn của trường có trong tập khoá ra của
  người nhận (`truongRa`), và chỉ giá trị riêng của `feeInclusion` (khoá ra) — `withdrawnReason` không bao giờ ra. Đây là
  cửa duy nhất nhãn đi ra (bất biến 4: dữ liệu ra ngoài dựng ở lõi).

### 3. API — `packages/api/src/labels/`

- `GET /api/v1/company/labels` (mọi vai của sàn đang làm): `{ fields: [{ field, label, default, custom }],
  values: [{ field, value, label, default, custom }] }`.
- `PUT /api/v1/company/labels` (quản trị sàn): nhận toàn bộ bộ nhãn của màn, kiểm ở lõi, ghi nguyên khối trong một giao
  dịch và CHỈ ghi khoá đổi: trường có nhãn riêng mới → upsert `labels.field.<f>`; trường trả về mặc định (vắng trong thân,
  hay gõ đúng chữ mặc định) mà đang có nhãn → upsert giá trị JSON `null` (không xoá dòng: trigger nhật ký 026 chỉ bắt
  insert/update, nên «trả về mặc định» cũng để một sự kiện ghi người đổi); khoá giữ nguyên không ghi lại. Giá trị riêng
  tương tự với `labels.value.<f>`. Một ô sai thì không ô nào được ghi (400 nêu khoá). Vai khác 403. Bộ đọc coi `null` là
  chưa đặt.
- Trang khách: `docTrangKhach` đọc nhãn của sàn của Lần gửi, `thanTrangKhach` gắn `tuVung: tuVungRaNgoai(...)` theo
  người nhận vào thân trả.

### 4. Ba mặt hiện chữ

- **Bảng hàng** (`inventory/`): `page.tsx` đọc `GET /company/labels` ở máy chủ rồi bọc màn bằng `TuVungProvider`.
  `COT` giữ nhãn mặc định; tiêu đề cột đọc `nhanTruong`; `chuCuaO` nhận từ vựng cho `feeInclusion` và `withdrawnReason`.
  Lọc «chọn» vẫn theo `giaTriChon` (giá trị chuẩn), lựa chọn ô lọc hiện chữ riêng; nhóm và đếm theo giá trị chuẩn. Thẻ
  điện thoại đọc cùng từ vựng.
- **Đội khác** — phát hàng cho nhóm môi giới (`inventory/phat-hang`, `exports/new`) và Lần gửi người nhận nhóm môi giới
  (`/s/<mã>`): `xuatBang` nhận `tuVungRaNgoai` của người nhận; tiêu đề cột và chữ ô phí đọc từ đó. Hai trang phát hàng đọc
  `GET /company/labels` rồi đổi bằng `tuVungTuBang` (một hàm, cùng khuôn API trả) trước khi gọi hàm dựng bản xuất.
- **Trang khách** `/s/<mã>`: thẻ và chi tiết đọc `tuVung` trong thân trả, vắng thì chữ mặc định như cũ.
- Mặt khác (Hồ sơ căn, ô nhận lead, Gửi, Hôm nay) giữ chữ mặc định ở vòng này — ngoài phạm vi, nêu ở hợp đồng.

### 5. Màn «Cách gọi» — `settings/labels/`

Khuôn `cai-dat-san` (`MucCaiDat`, `chanMucSan`), khối đích `settings-3` đã chuyển thể (`components/khoi/settings-3`,
`SettingField`). Hai nhóm trong một Frame: «Tên trường» (mỗi trường một dòng: nhãn mặc định · ô chữ · «Trả về mặc định»)
và «Giá trị riêng» (mỗi giá trị chuẩn của tập đóng một dòng: giá trị chuẩn · ô tên riêng). Chân Frame: «Lưu» (một lượt
PUT nguyên khối).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Cài đặt › Sàn [Tên] › Cách gọi → gõ «Phí CN» ở dòng Điều kiện phí, «BP» ở dòng Đã gồm phí → Lưu → báo «Đã
  lưu cách gọi» (điểm ra: mở Bảng hàng thấy cột «Phí CN», ô «BP»).
- Biên: sàn chưa đặt gì → mọi ô trống, chữ mặc định hiện mờ trong ô; người không quản trị mở đường này → về Cá nhân
  kèm câu «Mục này chỉ quản trị sàn mở được».
- Lỗi & quay lại: chữ có số điện thoại / email hay quá 40 ký tự → ô ấy viền đỏ kèm câu lỗi, nút Lưu khoá; máy chủ từ
  chối → khối báo lỗi trên chân Frame, dữ liệu gõ giữ nguyên để sửa rồi lưu lại.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Cách gọi | Đặt tên sàn dùng cho trường chuẩn và giá trị chuẩn | Cột Cài đặt › Sàn / Bảng hàng, trang khách |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-cach-goi-mac-dinh | Cách gọi | Hai nhóm dòng, ô trống, chữ mặc định làm chữ gợi ý | Gõ tên riêng |
| ST-cach-goi-da-dat | Cách gọi | Ô mang tên riêng, nút «Trả về mặc định» ở dòng đó | Sửa hay trả về mặc định |
| ST-cach-goi-loi-o | Cách gọi | Ô viền đỏ + câu lỗi dưới ô, «Lưu» khoá | Sửa chữ |
| ST-cach-goi-dang-luu | Cách gọi | «Lưu» khoá kèm «Đang lưu…» | Chờ |
| ST-cach-goi-da-luu | Cách gọi | Câu «Đã lưu cách gọi» ở chân Frame | Mở Bảng hàng |
| ST-cach-goi-loi-may-chu | Cách gọi | `TrangThai kind="error"` ở chân, chữ gõ giữ nguyên | Lưu lại |
| ST-cach-goi-khong-quyen | Cách gọi | Chuyển về Cá nhân kèm câu báo (KH-cd-khong-quyen) | — |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Chữ 1–40 ký tự sau khi bỏ khoảng trắng hai đầu; ô rỗng = dùng mặc định. Kiểm ngay khi gõ bằng cùng hàm lõi máy chủ
  dùng. Tab đi qua các ô theo thứ tự dòng; Enter trong ô không gửi form. Máy tính là chính; điện thoại một cột.

### 5. Xuất xứ component

| Component | Nấc | Vì sao (1 dòng) |
|---|---|---|
| `MucCaiDat` (khuôn cai-dat-san) | dùng | Khuôn bắt buộc của mọi mục Cài đặt sàn |
| `SettingField` (settings-3 đã chuyển) | dùng | Dòng nhãn + mô tả + ô của khối đích Cài đặt sàn |
| `Input`, `Button`, `TrangThai` | dùng | Thành phần đã cài |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: luồng hiển nhiên — một form ~20 dòng thuộc khối đích `settings-3` của Cài đặt sàn (`vo-va-ia.md` dòng Cài đặt
sàn); không có khuôn khả dĩ thứ hai nên không tra mẫu.

### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Quản trị sàn |
| Việc chính | Đặt tên sàn dùng cho trường và giá trị chuẩn để mọi màn nói chữ của sàn |
| Tần suất | hiếm |
| Số bản ghi | vài chục |
| Thiết bị | máy tính |
<!-- UX-SPEC-TEMPLATE>>> -->

## Đối chiếu ngành (ADR-0022)

| Năng lực | RESO | Sản phẩm 1 | Sản phẩm 2 | Ta định làm | Ta cứng — họ cấu hình |
|---|---|---|---|---|---|
| Tên riêng neo vào giá trị chuẩn | `StandardStatus` cố định, `MlsStatus` do MLS đặt, mỗi giá trị neo đúng một chuẩn ([StandardStatus](https://dd.reso.org/DD2.0/Property/StandardStatus/), [MlsStatus](https://dd.reso.org/DD2.0/Property/MlsStatus/)) | Follow Up Boss: stage hệ thống không đổi tên, stage còn lại thêm và đổi tên ([Custom Stages](https://help.followupboss.com/hc/en-us/articles/4402370671767-Custom-Stages)) | KW Command: nhãn số cố định Home/Mobile/Work/Other ([Detail Fields](https://answers.kw.com/hc/en-us/articles/360015702354-Contact-and-Lead-Detail-Fields)) | Giá trị chuẩn giữ ở lõi; sàn đặt tên hiện cho từng giá trị của tập đóng | Tập đóng có tên riêng ở vòng này: hai (phí, lý do ngừng) — RESO/FUB cho mọi danh sách có nghĩa chung (Hỏi-4) |
| Đổi tên hiển thị của trường | Tên trường RESO là mã máy, không phải chữ hiện — RESO không nói chữ hiện | chưa kiểm | chưa kiểm | Sàn đổi chữ hiện của 15 trường RESO trên Bảng hàng | Danh sách 15 trường giữ ở lõi (Hỏi-4) |

## Câu chỉ người có (Cổng Phạm vi)

- **Hỏi-1** — Mỗi giá trị chuẩn có đúng MỘT tên riêng hiện ra (khuyến nghị); các cách gõ khác («bao phí», «BP») là từ
  điển nhập của hàng 70. Lối khác: cho nhiều tên riêng neo cùng một giá trị chuẩn và căn nhớ tên nào được chọn — phải
  thêm cột vào bản hàng, chạm đường ghi, gấp ba cỡ vòng.
- **Hỏi-2** — Tên riêng của trường và giá trị ra trang khách và bản phát hàng qua cửa của lõi (`tuVungRaNgoai`), chỉ cho
  trường có trong tập khoá ra của người nhận (khuyến nghị — đúng câu giao đã ký). Dòng nhãn lưu lớp `company_internal`;
  chữ nhãn đã qua bộ dò số điện thoại/email lúc lưu. Lối khác: trang khách giữ chữ mặc định — bỏ một vế của câu giao.
- **Hỏi-3** — Lưu nhãn trong `company_settings` bằng khoá ba đoạn (migration 039 nới check), thêm dòng sổ #37 cho tên
  giá trị; #19 bảng `company_value_aliases` để hàng 70 (khuyến nghị — giám sát duyệt B-15). Lối khác: bảng riêng
  `company_value_aliases` ngay vòng này — thêm bảng, luật dòng, trigger nhật ký riêng.
- **Hỏi-4** — Danh sách trường đổi tên được (15 trường đang là cột Bảng hàng) và tập đóng có tên riêng (phí, lý do ngừng)
  là bảng của lõi, thêm trường là thêm một dòng (khuyến nghị — giữ cứng vì nghĩa chuẩn để so giữa các sàn: chỉ trường có
  nghĩa chuẩn mới có tên mặc định để đổi). Lối khác: mở cho mọi trường của mọi mặt ngay — phải dọn mọi bảng nhãn viết tay
  (việc của sổ từ vựng hàng 90).

## Ngoài phạm vi

- Trạng thái riêng (hàng 46), trường riêng (hàng 47), từ điển gõ tắt khi nhập và đề xuất từ điển (hàng 70).
- Tên riêng cho hướng, loại hình (`propertySubType`, «Shophouse») — hướng là cột chữ (lọc «chứa»), loại hình chưa là cột
  (hàng 79); mở khi hai mặt ấy có tập chọn.
- Hồ sơ căn, ô nhận lead, màn Gửi, Hôm nay giữ chữ mặc định ở vòng này.
- Đưa nhãn xuống kho trên máy cùng lần kéo đồng bộ (ADR-0018 quyết định 9): Bảng hàng đọc ở máy chủ khi mở trang.
