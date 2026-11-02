# Vá Hệ bố cục: mục Hôm nay ở cột thứ hai mở đúng chỗ — thiết kế

Hàng `va-he-bo-cuc` (dãy H, chuyển từ G). Hồ sơ: `_acceptance/va-he-bo-cuc/`.

## Vì sao

Hàng 91 (`he-bo-cuc`) cho mọi nhà một cột thứ hai mặc định mở. Ở nhà Hôm nay, cột liệt năm hàng đợi của bộ nhóm mặc định
(lead mới, nên gọi điều chỉnh giá, cần gọi lại, thiếu thông tin, mới đổi). Mỗi mục trỏ `/today#<mã nhóm>`, nhưng màn Hôm
nay không có chỗ nào mang mã ấy. Bấm thì không cuộn, không mở, không lọc, và mục không bao giờ sáng lên là đang chọn.
Chủ kho chọn «mở hợp đồng mới» cho lỗi này ở Cổng Bằng chứng hàng 91 (`_acceptance/he-bo-cuc/decisions.jsonl`
d-20261102T071242Z-59, Ngoài-6).

## Cách làm

1. **Mục trỏ `/today?nhom=<mã>`** thay cho `#<mã>`. Hôm nay đọc tham số, mở nhóm ấy nếu đang gập, cuộn dòng nhóm vào khung
   và chọn nó. Đây là đúng đường mở một lead từ thông báo của hàng 26 (`today/mo-lead.ts`: `?lead=<id>` → mở nhóm, chọn
   dòng, cuộn tới). Hai đường dùng chung `moNhom` và cách cuộn theo `data-row-id`.
2. **Mục đang chọn sáng lên.** Mục có mã bằng `?nhom` mang `aria-current="page"` và lớp đang chọn như mục của các nhà
   khác. `/today` trần thì không mục nào sáng.
3. **Mục không có chỗ thì báo rõ một dòng**, như «Lead này không còn ở Hôm nay của bạn» của hàng 26 (khuôn `TrangThai`
   kind notice trong `FramePanel`):
   - đầu chủ, nhóm không có việc hôm nay (lưới bỏ nhóm rỗng) → «Hôm nay không có việc ở «<nhãn nhóm>»»;
   - mã đúng khuôn mà không có trong bộ nhóm đang dùng (sàn tắt nhóm, mã lạ) → «Không có hàng đợi này ở Hôm nay của bạn»;
   - người không có vai Đầu chủ (chỉ telesales, trưởng nhóm không đầu chủ…) → «Hàng đợi «<nhãn>» chỉ có ở Hôm nay của đầu
     chủ», ở đầu màn, phần còn lại giữ nguyên.
   Người không có vai Đầu chủ thấy gì ở cột là **Hỏi-1** cho chủ kho: khuyến nghị giữ năm mục và báo một dòng khi bấm
   (vỏ không rẽ nhánh theo tên vai, `app-shell.tsx`); lối khác là ẩn năm mục qua `navigationFor` của lõi, giá là sửa lõi
   điều hướng và thêm ca kiểm theo vai. Người kiêm Đầu chủ và Telesales được xử như đầu chủ.
4. **Tải nguội** (`/today?nhom=<mã>` mở thẳng hay tải lại): khi lưới còn đang tải thì chưa báo, chưa chọn; tải xong mới
   tìm chỗ của nhóm — tránh báo nhầm «không có việc» lúc lưới còn rỗng.
5. **Tham số sai khuôn bị bỏ qua** như `/today` trần (khuôn mã nhóm của lõi `^[a-z][a-z0-9_]{1,39}$`, `packages/core/src/today/kiem.ts`). Có cả `?lead` thì
   đường lead thắng, `?nhom` bị bỏ qua.
6. **Mô-đun thuần mới** `apps/web/src/app/(app)/today/mo-nhom.ts`: đọc tham số, tìm nhóm và chữ báo, mục đang chọn của
   cột. Màn Hôm nay, trang `today/page.tsx` và cột thứ hai cùng gọi nó; bài kiểm thuần đo nó.

## Lựa chọn đã loại

- Lọc lưới chỉ còn một nhóm: mất cái nhìn cả ngày, và khác đường mở lead đã có trên cùng màn.
- Giữ `#<mã>` và gắn `id` cho dòng nhóm: trình duyệt cuộn tới thẻ có `id` nhưng không mở nhóm đang gập, và Next không
  báo đổi dấu `#` cho màn, nên mục không biết lúc nào đang chọn.

## Không làm

- Bộ nhóm riêng của sàn và số đếm theo nhóm ở cột: hàng 42 (`second-column.tsx` ghi sẵn «Bộ nhóm của sàn và số đếm theo
  nhóm vào cột ở hàng 42»).
- Mục của các nhà khác (Đã gửi, Cài đặt sàn, Đội): câu giao chỉ nói mục của Hôm nay.
- Hôm nay của trưởng nhóm (hàng 42).
- Điện thoại: không có cột thứ hai.

## Đối chiếu ngành (ADR-0022)

Không áp: hàng vá hành vi bấm của mục đã có, không thêm năng lực, đối tượng nghiệp vụ hay danh sách cố định nào. Bộ nhóm
và nhãn đã đối chiếu ở hàng 22.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
### 1. Luồng

- Suôn sẻ: Hôm nay (đầu chủ) → bấm «Nên gọi điều chỉnh giá» ở cột thứ hai → địa chỉ `/today?nhom=price_adjustment`, nhóm
  mở, dòng nhóm cuộn vào khung và được chọn, mục ở cột sáng (điểm ra: bấm mục khác, hay mở việc trong nhóm).
- Biên: nhóm không có việc hôm nay; người không có vai Đầu chủ; sàn tắt nhóm; tham số sai khuôn; có cả `?lead`.
- Lỗi & quay lại: không có lỗi mạng mới — lưới tải như cũ; dòng báo mất khi bấm sang nhóm có việc.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hôm nay (đầu chủ) | Làm việc theo hàng đợi | Cột thứ hai, thông báo / hồ sơ căn, lead |
| Hôm nay (vai khác) | Lead đã nhập, hay chỗ giữ tạm | Cột thứ hai / như cũ |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-homnay-mo-nhom | Hôm nay (đầu chủ) | Nhóm mở, dòng nhóm được chọn và ở giữa khung; mục cột sáng | Mở việc trong nhóm |
| ST-homnay-nhom-trong | Hôm nay (đầu chủ) | Dòng báo «Hôm nay không có việc ở «<nhãn>»», lưới như cũ | Bấm nhóm khác |
| ST-homnay-nhom-la | Hôm nay (đầu chủ) | Dòng báo «Không có hàng đợi này ở Hôm nay của bạn» | Bấm nhóm khác |
| ST-homnay-khong-dau-chu | Hôm nay (vai khác) | Dòng báo «Hàng đợi «<nhãn>» chỉ có ở Hôm nay của đầu chủ» ở đầu màn | Làm việc của vai mình |
| ST-homnay-dang-tai | Hôm nay (đầu chủ) | Khung chờ của lưới như cũ; chưa báo, chưa cuộn | Chờ |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Khổ 1440 và 1024 có cột thứ hai; 375 không có cột, không đổi gì.
- Cuộn một lần cho mỗi lần đổi `?nhom`, đợi lưới vẽ xong (như đường lead).
- Mục cột là liên kết có `aria-current="page"` khi đang chọn (chỉ báo chọn của điều hướng bên, không chỉ bằng màu).
- Người bật giảm chuyển động thì cuộn tức thì, không cuộn mượt.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `TrangThai` kind notice trong `FramePanel` | dùng | Khuôn dòng báo đã có của Hôm nay (hàng 26) |
| `NavList` của cột thứ hai | dùng | Chỉ đổi địa chỉ và cách tính mục đang chọn |
| Lưới hàng đợi `DataGridTable` | dùng | Chỉ thêm trạng thái mở và chọn dòng nhóm |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: cột thứ hai là danh sách mục dẫn vào một chỗ của thân Hôm nay — luồng hiển nhiên, đúng khuôn vỏ `app-shell-8` đã
chọn (`docs/design/vo-va-ia.md` §1); không tra thêm.
<!-- UX-SPEC-TEMPLATE>>> -->
