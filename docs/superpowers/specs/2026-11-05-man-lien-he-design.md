# 103 · Màn Liên hệ — thiết kế

Ngày 05/11 · Dãy L · hồ sơ `_acceptance/man-lien-he/` · Cổng Đáng: build (Manh Phan 05/11).

Đầu vào:

- ô cơ hội `_acceptance/man-lien-he/opportunity.md`, gồm câu giao và ngưỡng;
- báo cáo khám phá `bao-cao-kham-pha.md`;
- `lead-va-lien-he.md` (chủ kho chọn «Áp ba lớp»);
- ADR-0021, kể cả sửa đổi 05/11;
- luật đợt 58, 61, 62.

## Mục tiêu

Đầu chủ và trưởng nhóm có một chỗ để tìm một người bằng tên hay bằng số, xem đủ các cơ hội và căn của người ấy, rồi gọi được
trong tối đa ba chạm. Màn này thay việc tra danh bạ và Excel.

Ngưỡng nghiệm thu, nguyên văn ô cơ hội:

- **Sống:** mỗi người dự (ít nhất một đầu chủ, một trưởng nhóm) tìm ra một chủ bằng tên hay số và gọi được trong tối đa ba chạm;
  chủ có từ hai căn hiện đúng một hồ sơ đủ cơ hội.
- **Chết:** người dự phải quay lại danh bạ hay Excel để tìm số; hoặc vai không được đọc vẫn thấy số chủ; hoặc hồ sơ thiếu cơ hội
  hay hàng của người ấy.

## Phương án

### Mô hình (ba lớp, ADR-0021 sửa đổi 05/11)

- **Liên hệ** là người. Dấu Lead / Liên hệ suy bằng máy (`contactStatus`).
- **Cơ hội** là việc với người.
  - Phía chủ là bản ghi `leads`; pha suy từ bốn nấc, rồi từ trạng thái hàng sau khi Lên bảng.
  - Phía khách là `prospects`.
- **Hàng** đi kèm cơ hội bán đã Lên bảng.

Bảng pha có một chỗ, ở lõi `packages/core/src/contacts/co-hoi.ts`:

| Nấc / trạng thái | Pha (KW) | Nhãn trên màn (Hỏi-2) |
|---|---|---|
| Đã gửi · Đã nhận (lead) | Cultivate | **Mới** |
| Đã gọi (lead) | Appointment | **Đã gọi** |
| Lên bảng → hàng Chưa đủ để rao, Đang bán | Active | **Đang chào** |
| Hàng Đang giao dịch | Under Contract | **Đang giao dịch** |
| Hàng Đã bán | Closed | **Đã chốt** |
| Trả lại · Đã bỏ (lead) · hàng Ngừng hẳn | — (đóng) | **Đã đóng** |
| Nhu cầu khách mở | Cultivate | **Mới** (lịch xem khi dựng là Appointment) |
| Nhu cầu khách đã đóng | — (đóng) | **Đã đóng** |

Lead đã «gửi lại» chỉ hiện ở dạng bản ghi mới, vì chuỗi gửi lại đi theo bản ghi cuối. Đây là ADR-0020 qđ 4, không đổi.

### Phần đọc mới

Phần đọc mới đặt ở `packages/api/src/contacts/read/**` (luật 58), dưới tiền tố `/api/v1/contacts`. Tệp `contacts/routes.ts`,
`store.ts` đang có thì không sửa, vì hàng 89 đang sửa chúng. Có năm đường:

1. **Danh sách:** `GET /api/v1/contacts?type=&status=&q=&cursor=`. Trả các liên hệ người xem được đọc theo luật cách ly theo dòng
   đã có (người giữ còn vai Đầu chủ, hoặc trưởng nhóm). Mỗi dòng gồm tên, loại, dấu Lead / Liên hệ, người giữ, số lượng số, số cơ
   hội mở và số căn. **Không có số, không có giá đáy.** Lọc theo loại và dấu. Tìm theo tên bằng `ILIKE` bỏ dấu (`unaccent` nếu có,
   không thì so chữ thường). Phân trang theo con trỏ, 50 dòng một trang.
2. **Tìm theo số:** `POST /api/v1/contacts/lookup-phone`, thân `{phone}` (POST để số không nằm trên URL). Máy chủ chuẩn hoá số, tính
   dấu vết bằng khoá có sẵn (cùng hàm kiểm trùng), rồi gọi hàm cơ sở dữ liệu mới. Kết quả:
   - người xem đọc được thì trả `{contactId}`;
   - không đọc được thì trả `{held: true, holderName}`: chỉ «đã có trong sàn, [Tên] đang giữ», không tên chủ, không số, theo mẫu
     «thấy có, không thấy gì» của BoldTrail và Lofty;
   - không có thì trả `{found: false}`.

   Telesales, quản trị, đầu khách nhận 403. Đầu khách đã có lối riêng là báo 409 khi thêm số.
3. **Hồ sơ:** `GET /api/v1/contacts/{id}/profile` trả:
   - liên hệ: tên, loại, dấu, người giữ;
   - danh sách số đã che: nhãn, số chính, ba số cuối `••• 0xx`, `phoneId`;
   - **cơ hội phía chủ:** mỗi lead gồm loại Bán / Cho thuê, căn (toà · mã căn), pha, mốc nhập, và mã hàng nếu đã Lên bảng;
   - **hàng** của chủ (`listing_owners.contact_id`): mã, trạng thái, giá rao;
   - **cơ hội phía khách**, chỉ khi người xem là trưởng nhóm: nhu cầu khách (Mua / Thuê, đầu khách, pha) và số Lần gửi;
   - **dòng thời gian** gộp, 50 sự kiện mới nhất: sự kiện lead (nhập, nhận, gọi, trả lại), sự kiện hàng (`listing_events`, chỉ đổi
     trạng thái, đổi giá rao, tạo), sự kiện nhu cầu khách (với trưởng nhóm), và lần mở số liên hệ.
4. **Mở số:** `POST /api/v1/contacts/{id}/phones/{phoneId}/reveal` gọi hàm cơ sở dữ liệu mới. Hàm kiểm quyền đọc (luật theo dòng
   của `contacts`), trả `phone_enc` cho API giải mã, và **ghi một dòng sự kiện mở số** gồm người, lúc, liên hệ, số. API trả số rõ
   kèm `Cache-Control: no-store`. Người không được đọc nhận 404, một thân cho mọi trường hợp, không lộ có hay không.
5. **Số đo:** đếm chủ có từ hai căn mà hiện đúng một hồ sơ. Không cần đường mới: đếm `listing_owners` theo `contact_id` trong bộ
   kiểm.

**Migration `036_man_lien_he.sql`** (giám sát cấp 036, L-28):

- Bảng `contact_phone_reveals` chỉ thêm: `company_id`, `contact_id`, `phone_id`, `revealed_by`, `revealed_at`. Bảng có luật cách ly
  theo dòng và `force row level security`. Vai API chỉ insert qua hàm, select theo người giữ và trưởng nhóm.
- Hai hàm `security definer`:
  - `app.contact_phone_for_reveal(p_contact, p_phone)` kiểm quyền rồi ghi sự kiện;
  - `app.contact_lookup_by_phone_hash(p_hash)`.

  Cả hai lọc `company_id = app.current_company_id()` và tự kiểm vai, vì `security definer` bỏ qua luật theo dòng. Mỗi hàm có ca
  trong bộ kiểm cách ly: sàn A không đọc được và không dò được liên hệ sàn B.
- **Hạng T3**, vì chạm `packages/db/migrations`. Có thêm Gate 1.5 duyệt kế hoạch.

### Màn

- **Điều hướng (Hỏi-1):** thêm nhà thứ sáu «Liên hệ» (`/contacts`), chỉ hiện cho vai đọc được, tức đầu chủ và trưởng nhóm, ở
  `packages/core/src/navigation.ts`.
  - Điện thoại: tab «Liên hệ» thay tab nào là việc của Hỏi-1. Khuyên đặt vào trang «Tôi / Cài đặt» thành mục, không thêm tab: đầu
    chủ làm trên máy tính (Tham chiếu §4).
- **Bố cục:** Danh sách – chi tiết (`<BoCuc kieu="danh-sach-chi-tiet">`). Luật 62: khi hàng 105 gộp, cột hồ sơ là cột kéo chia cao
  hết vùng làm việc. 103 không sửa `components/bo-cuc/**`; dựng theo bố cục đang có (ngăn nội), rồi tự nhận lối C khi 105 gộp,
  không phải sửa 103.
  - Điện thoại: chi tiết mở ngăn từ đáy, theo hành vi sẵn của bố cục.
- **Thân danh sách:** bảng dày đặc (`data-grid` như Bảng hàng), gồm các cột:
  - Tên + dấu Lead;
  - Loại (badge);
  - Người giữ;
  - Cơ hội mở;
  - Căn.

  Đầu màn có ô tìm (tên hoặc số; chuỗi toàn chữ số từ chín số thì đi lối tìm theo số) và lọc loại, lọc dấu.
- **Cột hồ sơ:** khuôn nhóm mới `design/patterns/lien-he.md`, lối chọn ở trang ba lối (ADR-0019). Thứ tự khối:
  1. đầu hồ sơ (tên, loại, dấu, người giữ);
  2. **Số** (mỗi số một dòng: nhãn · `••• 0xx` · nút «Hiện số» → hiện số + nút «Gọi» `tel:`; gọi được từ chạm thứ hai);
  3. **Cơ hội** (phía chủ, rồi phía khách với trưởng nhóm; mỗi dòng: loại · căn · pha; chạm thì mở hồ sơ căn hay nhu cầu);
  4. **Căn** (hàng của chủ);
  5. **Dòng thời gian**.
- **Đường vào từ màn khác:** hồ sơ căn, Lead đã nhập, Đã gửi trỏ sang hồ sơ người (luật 62). **Không làm ở 103**; đề xuất thành hàng
  sau ở Cổng Phạm vi, vì chạm ba nhóm khuôn đang có và hàng 92, 106 đang chạy cạnh.

### Đã loại

- **Sửa tên, thêm số, đổi số chính ở 103.** Đường ghi liên hệ ở `contacts/routes.ts` đang do hàng 89 sửa (luật 58). Sửa loại đã có
  sẵn ở API nhưng màn chưa dùng: 103 dùng nó trong hồ sơ.
- **Gộp tay, xuất, thêm liên hệ tay, nhãn, việc kế.** Hàng sau, theo báo cáo khám phá §6.
- **Mở số qua lead hay qua chủ nhà của hàng** (không cần migration). Số trên lead và hàng là số lúc ghi; liên hệ có thể có thêm số
  từ «Sửa số và gửi lại» mà không hàng nào mang. Mở qua bản ghi phụ thì lỡ đúng số mới nhất. Ngưỡng «gọi được» đòi số của người.

## Đối chiếu ngành (ADR-0022)

Nguồn chi tiết có đường dẫn ở `_acceptance/man-lien-he/bao-cao-kham-pha.md` §3 và `lead-va-lien-he.md` §1.

| Năng lực | RESO | Follow Up Boss | KW Command | Ta làm | Ta cứng — họ cấu hình |
|---|---|---|---|---|---|
| Danh sách người, lọc | `Contacts`, `ContactType` | Smart List tự cập nhật, đội tự lập | All Contacts / Leads Only | Lọc loại + dấu Lead, tìm tên / số | **Bộ lọc cố định** — họ cho lưu danh sách (Hỏi-3) |
| Pha của việc | — | Deal stage do đội đặt | Năm pha cố định, stage con tự đặt | Năm pha cố định, nhãn mặc định ở lõi | **Nhãn pha cứng** — KW cho đặt stage con (Hỏi-2) |
| Dấu Lead | `ContactType = Lead` | stage «Lead» (hệ thống giữ) | ô Mark as Lead, bấm tay | Suy bằng máy | Khoá — nghĩa chuẩn (ADR-0021 qđ 7) |
| Mở số | không có | phân quyền theo vai | Owner + Assignees | Người giữ, trưởng nhóm; mỗi lần mở ghi sự kiện | Khoá — quyền và an toàn (bất biến 2) |
| Báo đã có khi tìm số | — | tự chống trùng | lead pool | «Đã có trong sàn, [Tên] đang giữ» | Khoá — quyền và an toàn |

## Rủi ro

- **Hàm `security definer` bỏ qua luật theo dòng.** Rò liên hệ giữa sàn là lỗi chặn (bất biến 1). Chặn bằng: lọc
  `app.current_company_id()` trong hàm, ca cách ly hai chiều, và đối chứng dương (sàn mình dò ra).
- **Số rõ đi qua API.** Bất biến 2 không bị nới: số chỉ trả cho người đọc được, trong công ty, kèm `no-store`, ghi sự kiện. Bộ kiểm
  rò rỉ quét thân danh sách và hồ sơ không chứa số, giá đáy, ảnh sổ.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: nhà «Liên hệ» → gõ tên hay số → chạm dòng → cột hồ sơ → «Hiện số» → «Gọi» (điểm ra: ứng dụng gọi của máy).
- Biên: chưa có liên hệ nào; số thuộc người mình không được đọc («Đã có trong sàn, [Tên] đang giữ»); liên hệ chưa có số; chủ nhiều
  căn; người vừa chủ vừa khách.
- Lỗi & quay lại: tải danh sách hay hồ sơ lỗi thì hiện «Chưa tải được — thử lại» kèm nút thử lại; mở số lỗi thì giữ số che và báo
  dưới dòng số.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Liên hệ (`/contacts`) | Tìm một người và xem cơ hội của họ | nhà «Liên hệ» / cột hồ sơ, hồ sơ căn `/units/<mã>`, ứng dụng gọi |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-lienhe-dang-tai | Liên hệ | Khung chờ của bố cục danh sách | chờ |
| ST-lienhe-trong | Liên hệ | «Chưa có liên hệ nào» + «Liên hệ sinh ra khi nhập lead hay ghi chủ nhà» | mở Ô nhận lead |
| ST-lienhe-khong-khop | Liên hệ | «Không tìm thấy [chuỗi]» | xoá lọc |
| ST-lienhe-nguoi-khac-giu | Liên hệ | «Số này đã có trong sàn — [Tên] đang giữ» | không có hành động |
| ST-lienhe-loi | Liên hệ | «Chưa tải được — thử lại» + Thử lại | thử lại |
| ST-hoso-dang-tai | Cột hồ sơ | Khung chờ của hồ sơ | chờ |
| ST-hoso-co-du-lieu | Cột hồ sơ | Đầu hồ sơ · Số · Cơ hội · Căn · Dòng thời gian | Hiện số, Gọi, mở căn |
| ST-hoso-khong-so | Cột hồ sơ | Khối Số: «Chưa có số» | — |
| ST-hoso-loi | Cột hồ sơ | «Chưa tải được — thử lại» + Thử lại | thử lại |
| ST-so-da-hien | Cột hồ sơ | Số rõ + nút «Gọi» | gọi |
| ST-so-loi | Cột hồ sơ | Số giữ che + «Chưa mở được số — thử lại» | thử lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Ô tìm: chuỗi toàn chữ số, khoảng trắng, dấu chấm, từ chín chữ số trở lên thì đi lối tìm theo số; còn lại tìm theo tên, sau 250 ms
  ngừng gõ.
- Số rõ chỉ ở trong bộ nhớ của màn, không lưu kho trên máy, không vào URL; rời hồ sơ thì che lại.
- 375 px không cuộn ngang; danh sách trên điện thoại thành thẻ theo bố cục.

### 5. Xuất xứ component

| Component | Nấc | Vì sao (1 dòng) |
|---|---|---|
| `BoCuc kieu="danh-sach-chi-tiet"` | dùng | Bố cục đã có; lối C nhận qua 105 |
| `data-grid` (ReUI) | dùng | Như Bảng hàng; một họ khung Frame |
| Cột hồ sơ | ghép / theo lối chọn ở trang ba lối | Nhóm khuôn mới `lien-he` |
| `TrangThai`, `ChoTai` | dùng | Trạng thái chung của kho |
| Badge, Button, Frame | dùng | Thành phần đã cài |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luật đợt 62 đặt mọi màn danh sách – chi tiết lên lối C (chủ kho «Chọn C» 05/11). Follow Up Boss, Lofty, KW Command đều mở
người thành hồ sơ cạnh danh sách (báo cáo khám phá §3). Một lối, không cần tra thêm.

### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Đầu chủ, trưởng nhóm |
| Việc chính | Tìm một người bằng tên hay số, thấy đủ cơ hội và căn, rồi gọi |
| Tần suất | mỗi ngày nhiều lần |
| Số bản ghi | hàng trăm trở lên |
| Thiết bị | máy tính (điện thoại đọc được) |
<!-- UX-SPEC-TEMPLATE>>> -->
