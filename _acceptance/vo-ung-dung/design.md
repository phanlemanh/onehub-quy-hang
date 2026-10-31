# Thiết kế — Vỏ ứng dụng (hàng 53)

Nguồn đã chốt, không bàn lại: ADR-0002, `docs/design/vo-va-ia.md` mục 1, Tham chiếu §9 (bảng nhà và nút theo vai,
đường dẫn). Hàng này dựng đúng thứ đó; việc của thiết kế là chia vỏ thành phần mã và chọn chỗ nào máy tự quyết.

## Cách dựng

1. **Bảng nhà và nút theo vai là luật thuần ở `packages/core/src/navigation.ts`.** Đầu vào: danh sách vai của người ở
   sàn đang làm. Đầu ra: nhà của cột (máy tính), tab dưới (điện thoại), nút của thanh trên, nhà mở đầu, có ô gõ mã căn
   hay không. Một người nhiều vai nhận hợp các nhà. Bảng chép từ Tham chiếu §9; test hai chiều cho từng vai. Vỏ chỉ đọc
   kết quả, không tự rẽ nhánh theo tên vai.
2. **Vỏ máy tính: cài khối Pro `app-shell-8`** vào `apps/web/src/components/shell/`, chuyển thể đúng bảng vùng ↔ thành
   ở `vo-va-ia.md` mục 1: bộ chọn Org → Sàn (ẩn khi một sàn), bỏ App/Env; ô ⌘K → «Gõ mã căn»; Create → «+ Lead»,
   «Nhập Excel», «Phát hàng» theo vai; cột biểu tượng và `INNER_NAV` theo bảng ở bước 1; chuông và ngăn thông báo giữ,
   chưa có dữ liệu thì trống.
3. **Vỏ điện thoại: ghép** (bậc 6, đã ghi «Chỗ hở»): dưới `md` ẩn cột, thanh trên mảnh (tên nhà · nút gõ mã căn mở
   `CommandDialog` toàn màn · chuông), thanh tab dưới bằng `Button variant="ghost"` dẫn đường, `aria-current` cho tab
   đang mở. Một mã, đổi theo bề rộng bằng lớp `md:` — không đọc user-agent, không route riêng.
4. **Nhóm route `(app)`** chứa các nhà; `layout.tsx` của nhóm đọc người đăng nhập (như trang đầu hiện nay) rồi dựng
   vỏ. `settings/` có `layout.tsx` riêng dựng cùng vỏ để không phải dời `settings/users` (dãy Q đang đổi tên đường API
   trong tệp đó). Nhóm `(auth)` và trang khách `/s/<mã>` nằm ngoài, không vỏ.
5. **Nhà chưa có màn** (Hôm nay, Bảng hàng, Đã gửi, Lịch xem, Đội, các mục Cài đặt sàn, Lead, Tôi, Hồ sơ căn) có trang
   giữ chỗ trong vỏ: một Frame với `Empty` nói nhà này dựng ở hàng nào. Các hàng màn sau thay nội dung, không đổi vỏ.
6. **Cột thứ hai**: mặc định gập ở Bảng hàng, Hôm nay, hồ sơ căn; mở ở Đã gửi và Cài đặt sàn. Người mở hay gập thì
   nhớ theo người, theo nhà — cách nhớ là Hỏi-1.
7. **Sáng / tối**: `next-themes` ThemeProvider ở gốc (khối đòi), nút đổi trong menu tài khoản.
8. **Gõ mã căn**: ⌘K hoặc `/` mở; chữ khớp tên nhà → nhảy nhà; còn lại → `/units/<mã>` (hồ sơ căn giữ chỗ hiện mã).
   Telesales không có ô này.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: đăng nhập → `/` → nhà mở đầu theo vai (Hôm nay; chỉ quản trị → Cài đặt sàn) → bấm nhà trên cột/tab → màn
  của nhà (điểm ra: nhà khác, hồ sơ căn qua gõ mã căn, đăng xuất)
- Biên: người một sàn không thấy bộ chọn sàn; telesales không có cột nhà và ô gõ mã căn; chỉ quản trị trên điện thoại
  (Hỏi-2); nhà chưa có màn hiện giữ chỗ
- Lỗi & quay lại: phiên hết → về `/login`; chưa gắn sàn → `/no-company`; chưa chọn sàn → `/select-company`; mã căn
  không có → hồ sơ căn giữ chỗ nói chưa có dữ liệu, nút quay lại Bảng hàng

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Vỏ máy tính | Đưa người tới nhà của vai mình | mọi trang trong `(app)` / nhà khác |
| Vỏ điện thoại | Như trên, bằng bốn tab dưới | như trên |
| Gõ mã căn | Mở hồ sơ căn hoặc nhảy nhà bằng bàn phím | ⌘K, `/`, nút trên thanh / `/units/<mã>`, nhà |
| Trang giữ chỗ của nhà | Cho biết nhà này dựng ở hàng nào | cột/tab / nhà khác |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-vo-dang-tai | Vỏ | Vỏ dựng ở máy chủ, không có trạng thái tải riêng; vùng nội dung theo màn | — |
| ST-vo-thong-bao-trong | Ngăn thông báo | `Empty`: «Chưa có thông báo» | đóng ngăn |
| ST-vo-goc-nhin-trong | Cột thứ hai Bảng hàng | «Chưa có góc nhìn» + nút «+ Lưu góc nhìn» (tắt tới hàng 14) | về bảng |
| ST-nha-giu-cho | Trang giữ chỗ | Frame + `Empty`: tên nhà, «Màn này dựng ở hàng N» | chọn nhà khác |
| ST-go-ma-trong | Gõ mã căn | gợi ý «Gõ mã căn hoặc tên nhà» | gõ / Esc |
| ST-ho-so-chua-co | Hồ sơ căn giữ chỗ | «Căn <mã>: chưa có dữ liệu» | quay lại Bảng hàng |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Bề rộng: `< md` (768px) là vỏ điện thoại, từ `md` là vỏ máy tính; cùng địa chỉ.
- Phím: ⌘K/Ctrl+K và `/` (khi không ở ô nhập) mở gõ mã căn; Enter mở; Esc đóng. Tab trên thanh dưới có `aria-current`.
- Cột thứ hai: tay nắm ở mép cột gập/mở; trạng thái nhớ theo người, theo nhà (Hỏi-1).

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `app-shell-8` | dùng (chuyển thể dữ liệu, chữ, prop) | khối đích của vỏ máy tính (ADR-0002) |
| Thanh tab dưới | ghép (`Button` + `Link`) | ReUI không có vỏ tab dưới (`vo-va-ia.md` «Chỗ hở») |
| `CommandDialog` | dùng | gõ mã căn trên điện thoại |
| `Empty`, `Frame` | dùng | trang giữ chỗ |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: trung-tâm-toả-nhánh (hub-and-spoke)
Căn cứ: đã chốt ở ADR-0002 và Tham chiếu §9 — cột nhà / tab dưới là các nhánh, mỗi nhà một câu hỏi; không tra thêm.
<!-- UX-SPEC-TEMPLATE>>> -->

## Ngoài hàng này

Quyền vào từng trang theo vai (vỏ chỉ không hiện lối; trang tự chặn ở hàng của nó) · dữ liệu thật của góc nhìn, độ
tươi, thông báo · bộ chọn dự án (chưa có danh mục dự án — hiện khi kết nối danh mục về) · nội dung các nhà.
