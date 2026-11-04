# Cài đặt hợp nhất — thiết kế

Hàng `cai-dat-hop-nhat` (dãy H, đợt `dau-khach-nhap`), sau hàng 38 (tab Tôi) và 43. Ô cơ hội: `opportunity.md` (chủ kho
chọn làm 04/11). Sổ lựa chọn: `decisions.jsonl` (dòng S1).

## 1. Cái đã có, cái còn thiếu

- **Cài đặt sàn** (`apps/web/src/app/(app)/settings`): một nhà riêng chỉ quản trị sàn có (`packages/core/src/navigation.ts`,
  bảng §9). Cột thứ hai liệt bảy mục sàn (`components/shell/second-column.tsx`). `/settings` mở thẳng Người dùng.
- **Tôi** (`apps/web/src/app/(app)/me`, hàng 38): sáu nhóm dòng hồ sơ · sàn · cài · thông báo · máy · đăng xuất. Trên điện thoại là
  tab dưới; trên máy tính chỉ mở được từ menu tài khoản, không có cột thứ hai.
- **Bố cục Đọc** (ADR-0024): thân trải hết bề rộng vùng nội dung. Trên 1440 nhãn một dòng và nút của nó cách nhau khoảng
  1.140px.
- Thiếu: một chỗ duy nhất cho cài đặt. Hiện người dùng gặp hai chỗ với hai hình dạng khác nhau, và một bề rộng vừa tầm mắt.

## 2. Khu Cài đặt

- **Một nhà «Cài đặt»** cho mọi vai có cột nhà (telesales không có cột nhà, §9), đứng ở đáy cột nhà như Cài đặt sàn hôm nay.
  Nhãn nhà đổi «Cài đặt sàn» → «Cài đặt».
- **Cột thứ hai, hai nhóm:**
  - «Cá nhân», một mục «Cá nhân» (`/settings/personal`). Ai cũng thấy.
  - «Sàn [tên sàn đang làm]», bảy mục như hôm nay. Chỉ người mang vai Quản trị sàn ở sàn đang làm thấy.
- **Mục «Cá nhân»** dựng lại đúng sáu nhóm dòng của màn Tôi (`nhomDong`, `ManToi`), không viết lại. Đường dẫn
  «Cài đặt › Cá nhân».
- **Phạm vi ghi ngay dưới tiêu đề mục:**
  - Cá nhân: «Áp cho tài khoản của bạn ở mọi sàn».
  - Mục sàn: «Chỉ áp cho sàn [Tên]».
  - Dòng «Cài lên màn hình chính» và «Thông báo lead» ghi thêm «trên máy này».
- **Chặn ở máy chủ của màn:** vai không quản trị mở địa chỉ một mục sàn thì về `/settings/personal`, đầu màn báo «Mục này
  chỉ quản trị sàn mở được» (Hỏi-1, viết theo khuyến nghị). Ghi vẫn do API chặn như cũ.

## 3. Hai đường vào

| Đường vào | Ai | Tới |
|---|---|---|
| Biểu tượng Cài đặt trên cột nhà (máy tính) | Quản trị sàn | `/settings/users` (Người dùng, như cũ) |
| Biểu tượng Cài đặt trên cột nhà (máy tính) | Vai khác có cột nhà | `/settings/personal` |
| Menu tài khoản, mục «Cá nhân» (máy tính) | Mọi vai, kể cả telesales | `/settings/personal` |
| Menu tài khoản, mục «Cài đặt sàn» (máy tính) | Quản trị sàn | `/settings/users` — giữ ngưỡng hai lần bấm |
| Tab «Tôi» (điện thoại) | Mọi vai | `/settings/personal` — nhãn tab giữ «Tôi» |
| Địa chỉ cũ `/me` | Mọi vai | chuyển về `/settings/personal` |

Điện thoại giữ quyết định Hỏi-2 của vỏ: không có mục sàn, trừ người chỉ mang vai Quản trị sàn — tab «Cài đặt sàn» (mục
sàn) và «Tôi» (Cá nhân); tab sáng theo đường, không bao giờ cả hai.

## 4. Bề rộng

Bố cục Đọc giữ thân trong bề rộng đọc 48rem (token `--container-doc` đã có, Hồ sơ và Dòng tin đang dùng). Thân đứng sát
cạnh trái vùng nội dung, cạnh cột mục lục, không căn giữa. Mọi màn Đọc cùng đổi: mục Cài đặt, Cá nhân, **Ô nhận lead**
(màn đầu chủ dùng hằng ngày), trang tạm. Không dựng bố cục thứ tám riêng cho Cài đặt (đổi ADR-0024 quyết định 2). Điện
thoại giữ.

## 5. Ba quyết định bị đổi — sửa bằng mục sửa đổi

| Quyết định | Chỗ ghi | Sửa |
|---|---|---|
| Vỏ 31/10: Cài đặt sàn là nhà riêng của quản trị | `docs/design/vo-va-ia.md` | thêm mục sửa đổi 04/11 |
| Tham chiếu §9: bảng vai thấy nhà nào | `docs/product/tham-chieu.md` §9, §12 | sửa bảng §9; một dòng §12 |
| ADR-0024: Đọc không giới hạn bề rộng | `docs/adr/0024-he-bo-cuc.md` | thêm mục «Sửa đổi 04/11» |

Thêm: từ vựng `CONTEXT.md` (Cài đặt, Cá nhân), khuôn `design/patterns/toi.md` (nhận thêm trang `/settings/personal`) và
`cai-dat-san.md` (đường dẫn «Cài đặt › Sàn [Tên] › mục»).

## 6. Lựa chọn máy đã quyết

Mỗi lựa chọn một dòng sổ S1 có căn cứ trích từ ô cơ hội hoặc sổ hồ sơ trước. Một câu chỉ người biết (Hỏi-1, người không
quản trị gõ địa chỉ mục sàn thấy gì), sinh từ phản biện context sạch.

- Vai không quản trị bị chặn ở máy chủ, không chỉ ẩn trên cột.
- Telesales chỉ vào qua menu tài khoản.
- Đọc hẹp áp cho mọi màn Đọc, không riêng Cài đặt. Lint cấm màn tự đặt bề rộng, nên bề rộng phải thuộc bố cục.

## 7. Đối chiếu ngành

- Linear, Notion: một khu Settings có hai nhóm «Account» và «Workspace», nhóm workspace theo quyền.
- Slack: «Preferences» cá nhân tách khỏi «Workspace settings» của admin, cả hai vào từ menu tài khoản.

Khuôn hai nhóm theo phạm vi là khuôn chung của ngành. RESO không có từ vựng cho cài đặt giao diện.

## 8. Đặc tả UX

<!-- ux-spec:start -->
- **Khuôn IA:** cài đặt hai nhóm theo phạm vi (Account · Workspace), cột mục lục trái, nội dung bề rộng đọc. Căn cứ: §7.
- **Màn:** `/settings/personal` (Cá nhân); bảy mục sàn giữ khung settings-3. Bố cục Đọc, đầu màn có đường dẫn
  «Cài đặt › …».
- **Trạng thái:** mục Cá nhân giữ đủ trạng thái của màn Tôi (đang tải, lỗi đọc máy, một máy, nhiều máy, báo mất xong).
  Vai không quản trị mở mục sàn thì về Cá nhân kèm câu báo (Hỏi-1), không có màn lỗi riêng.
- **Khổ:** 1440: cột nhà · cột mục lục · thân ≤ 48rem sát trái. 390: tab Tôi mở Cá nhân, một cột, không cột mục lục.
- **Thẻ việc:** người tìm một cài đặt → một chỗ, tối đa hai lần bấm từ đường vào nào cũng tới.
<!-- ux-spec:end -->
