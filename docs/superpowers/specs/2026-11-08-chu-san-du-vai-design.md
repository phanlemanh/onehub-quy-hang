# Quản trị sàn mang đủ vai, và luật «vai kéo theo vai»

Ngày 08/11/2026 · hàng `chu-san-du-vai` (T3) · dãy Q, đợt `dau-khach-nhap` · Cổng Đáng: chủ kho «build» (08/11, gõ ở phiên Q).

## Vì sao

Người mở sàn mới chỉ mang vai Quản trị sàn. Bảng vai hiện hành cho vai này đúng một nhà là Cài đặt, không nút tạo, không
thấy chủ nhà, nên đăng nhập lần đầu là ngõ cụt (`docs/plan/audit-san-moi-day-0.md` §3b; chủ kho gặp trên sàn «OneHub» bản
thật 06/11). Lối gỡ có nhưng phải tự biết: vào Người dùng, sửa dòng của chính mình, tích thêm vai.

Chủ kho đã chốt hai điều:

- 06/11, **cách B** (Tham chiếu §12): trao Quản trị sàn — ở công cụ mở sàn hay màn Người dùng — là trao luôn bốn vai làm
  việc, gỡ bớt được cho người chỉ cấu hình; không đổi luật theo dòng. Cách A («Quản trị bao mọi vai ở luật») bị loại vì
  chạm khoảng 17 migration và mất người chỉ cấu hình.
- 08/11, **H-33**: mở rộng thành luật chung «vai kéo theo vai» — trao vai trên là trao kèm vai dưới, gỡ bớt được, không đổi
  luật theo dòng. Quản trị sàn kéo bốn vai làm việc; Trưởng nhóm kéo vai của thành viên.

## Thiết kế

1. **Một bảng ở lõi.** `packages/core/src/access/goi-vai.json`: vai trên → các vai nó kéo theo. `company_admin` → Telesales,
   Đầu chủ, Đầu khách, Trưởng nhóm. `team_lead` → Đầu chủ, Đầu khách (Hỏi-1). Hàm thuần `doiVaiKhiTich(hienTai, vai, bat)`
   ở `packages/core/src/access/goi-vai.ts`: bật một vai thì thêm vai ấy và các vai nó kéo theo; tắt một vai thì chỉ bớt
   đúng vai ấy. Kéo theo một lần lúc tích, không lan dây chuyền và không kéo lại khi đã gỡ.
2. **Công cụ mở sàn** (`packages/db/scripts/mo-san.mjs`): người đầu tiên của sàn mới mang đủ năm vai, danh sách lấy từ
   `goi-vai.json`. Chạy lại không đổi vai ai — nhánh `on conflict` giữ nguyên.
3. **Màn Người dùng** (`settings/users/quan-nguoi.tsx`): hộp Mời và hộp Sửa gọi `doiVaiKhiTich` khi một ô vai đổi. Thêm một
   dòng mô tả dưới nhóm Vai của hộp (`member-dialog.tsx`, khe mới `roles.description`): «Tích Quản trị sàn hay Trưởng nhóm
   là tích sẵn các vai đi kèm; bỏ tích vai nào không cần.»
4. **Máy chủ lưu đúng điều màn gửi** (`thanh-vien.ts` giữ nguyên hành vi): API không tự thêm vai. Chỉ có vậy người chỉ
   cấu hình mới tồn tại — gửi đúng `[company_admin]` thì lưu đúng `[company_admin]`.
5. **Không migration, không đổi luật theo dòng, không đổi vai của ai đang có.** Quyền của người mang đủ vai là hợp quyền
   các vai — bảng nhà, nút, xem nguồn, ghi vết đều đã chạy theo vai (`navigation.ts`, `can-see-source.ts`).
6. **Tài liệu:** Tham chiếu §2, §6, §9, §12 đổi «chưa dựng» thành điều đang đúng; ADR-0010 và ADR-0011 thêm mục sửa đổi.

### Hệ quả cần biết

- Người mở sàn mang Đầu chủ nên vào danh sách chia lead và giữ được căn ngay. Đúng ý «chủ sàn giữ luôn các vai khác»; muốn
  ra khỏi danh sách thì gỡ vai Đầu chủ.
- Người mang Trưởng nhóm thấy chủ nhà cả sàn, mỗi lần mở số vẫn một vết (Tham chiếu §6, bất biến 2 không nới).

### Ba câu của H-33 và một câu ADR-0022 (chủ kho trả lời ở Cổng Phạm vi)

| | Câu | Máy khuyên | Lối khác — giá |
|---|---|---|---|
| Hỏi-1 | Trưởng nhóm kéo theo những vai nào? | Đầu chủ và Đầu khách. Trưởng nhóm đã có «+ Lead» nên Telesales không thêm gì; thiếu hai vai kia thì không giữ được căn, không gửi được cho khách. | Cả ba vai — dòng vai dài hơn, không thêm quyền đáng kể. Không kéo vai nào — Trưởng nhóm vẫn phải tích tay. |
| Hỏi-2 | Trưởng nhóm có vào danh sách chia lead không? | Có, đi theo vai Đầu chủ; gỡ Đầu chủ để ra. Không đổi luật. | Không — phải có migration đổi hàm chia lead (đang lấy người mang Đầu chủ), trái «không đổi luật theo dòng». |
| Hỏi-3 | Trưởng nhóm có tự giữ căn không? | Có, cùng lý do: giữ căn là quyền của vai Đầu chủ. | Không — cùng giá như Hỏi-2. |
| Hỏi-4 | Bảng «vai kéo theo vai» giữ cứng hay để sàn tự đặt? | Giữ cứng (lý do «quyền và an toàn» của ADR-0022): đây là gói mặc định lúc trao vai, từng người vẫn gỡ bớt được. | Sàn tự đặt — thêm một mục Cài đặt và một bảng dữ liệu cho một việc làm một lần lúc trao vai. |

## Đối chiếu ngành

| Năng lực | RESO | Follow Up Boss | KW Command | Ta định làm | Ta viết cứng — họ cấu hình |
|---|---|---|---|---|---|
| Vai và gói quyền của người trong sàn | Không có đối tượng tương ứng (chưa kiểm thêm ngoài trang đối chiếu của kho) | Vai cố định; chủ tài khoản giữ quyền cấu hình ([đối chiếu ngành](../../product/doi-chieu-nganh.md), dòng Follow Up Boss) | Quyền theo từng ứng dụng, mức do đội đặt ([đối chiếu ngành](../../product/doi-chieu-nganh.md), dòng KW Command) | Năm vai cố định, gói kéo theo lúc trao, gỡ bớt theo từng người | Có với KW Command — thành Hỏi-4 |

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
### 1. Luồng

- Suôn sẻ: Cài đặt › Sàn › Người dùng → «Mời người» hay «Sửa» → tích Quản trị sàn → bốn ô còn lại tự tích → Lưu (điểm ra: dòng người hiện đủ vai).
- Biên: gỡ bớt sau khi tích sẵn thì vai đã gỡ không tự tích lại; người đã có sẵn vai giữ nguyên, chỉ thêm vai còn thiếu.
- Lỗi & quay lại: lưu lỗi thì giữ nguyên ô đã tích và báo ở khe lỗi sẵn có của hộp; sàn còn một quản trị thì câu báo hiện hành không đổi.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hộp Mời người · Sửa người (Người dùng) | Đặt vai và vùng cho một người | Danh sách Người dùng / về danh sách |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-hopvai-chua-tich | Hộp Mời | Năm ô vai trống, dòng mô tả «Tích Quản trị sàn hay Trưởng nhóm là tích sẵn các vai đi kèm; bỏ tích vai nào không cần.» | Tích vai |
| ST-hopvai-tich-san | Hộp Mời · Sửa | Sau khi tích Quản trị sàn: cả năm ô tích | Bỏ tích vai không cần, hoặc Lưu |
| ST-hopvai-go-bot | Hộp Mời · Sửa | Ô vừa gỡ trống, các ô khác giữ nguyên | Lưu |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Kéo theo chỉ chạy khi một ô chuyển từ trống sang tích; mở hộp Sửa không tự đổi gì.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `MemberDialog` (chuyển thể solution-users-8) | mở rộng | Thêm một khe mô tả dưới nhóm Vai, dùng `FieldDescription` đã cài |
<!-- UX-SPEC-TEMPLATE>>> -->

## Bộ đo

Đặt ở `_acceptance/chu-san-du-vai/thu/` và cạnh mã; xem `evals.yaml`. Postgres của dãy Q ở cổng 5577.

## Kiểm thử cũ đổi kỳ vọng

`packages/db/tests/mo-san.test.mjs` (hàng 56) có bốn chỗ ghi người mở sàn chỉ mang `company_admin`; đổi sang đủ năm vai. Danh
sách từng dòng (tệp:dòng, cũ → mới, vì sao) nêu ở Cổng Bằng chứng.

## Đường đo sau gộp

Mở một sàn mới trên bản thật bằng công cụ mở sàn: người đầu tiên đăng nhập thấy đủ nhà và nút tạo. Timebox 1 ngày sau khi lên bản thật.
