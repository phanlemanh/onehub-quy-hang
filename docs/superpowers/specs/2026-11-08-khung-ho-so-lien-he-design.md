# Khung hồ sơ liên hệ — thiết kế

Hàng `khung-ho-so-lien-he` (lộ trình), từ bản kiểm `docs/plan/kiem-chi-tiet-lien-he.md` (06/11, PR #167). Hạng T2: chỉ
web và bộ kiểm khuôn, không API, không cơ sở dữ liệu. Câu giao và điều bật ở hàng lộ trình.

## Làm gì

1. **Một khung cột chung.** `KhungHoSo` của khối `solution-crm-4` (`components/khoi/solution-crm-4/ho-so.tsx`) thêm kiểu
   `cotPhu`: một `Frame dense` cao hết cột, `FramePanel` cuộn riêng — đúng lớp mà `KhungHoSoCan cotPhu` đang dựng.
   `KhungHoSoCan cotPhu` (`units/ho-so/khung.tsx`) gọi lại nó, nên hồ sơ căn giữ y lớp và ảnh; hồ sơ liên hệ
   (`contacts/vung.tsx`) đặt `HoSoNguoi` trong `KhungHoSo cotPhu` — cả lúc đang tải và lỗi.
2. **Đóng.** Đầu hồ sơ liên hệ nhận nút «Đóng hồ sơ» (ghost, icon X, như hồ sơ căn); phím Esc đóng khi hồ sơ đang mở và
   phím không bị một hộp, menu hay ô nhập đang mở dùng trước (`defaultPrevented`, hay đích là ô nhập/vùng soạn).
3. **Bảng giữ đủ cột.** Bỏ cột Loại (loại đã nằm dưới tên trong ô người — lỗi 6); cột tên co giãn, các cột khác bề rộng
   tối thiểu nhỏ hơn, nên ở 1440 với cột hồ sơ 38% bảng còn đủ bốn cột không cuộn ngang.
4. **Tên cột dính đầu.** Khung bảng cao hết vùng làm việc, lưới cuộn bên trong (như Bảng hàng): tiêu đề khung, ô tìm và
   hàng tên cột đứng yên khi cuộn.
5. **Tô dòng đang mở.** Dòng của người đang mở hồ sơ mang `data-state="selected"` (cùng kiểu chọn của DataGrid).
6. **Lưới khuôn bắt khung.** Bản đồ khuôn thêm khoá tuỳ chọn `khe_boc` (`packages/ui-lint/lib/ban-do.mjs`): với nhóm đơn
   vị màn, khe khai ở đó mà truyền JSX thì gốc JSX phải là thành phần đã khai — `lien-he.md` khai `khe_boc: { cotPhu:
   KhungHoSo }` và luật KH-lh-mot-khung. Gỡ khung khỏi cột phụ ở `vung.tsx` → lưới lệch, nêu tệp và khe.
7. **Bảng hiện cùng màn.** `page.tsx` (đang chạy ở máy chủ để đọc phiên) đọc luôn trang đầu danh sách theo `type`,
   `status` của URL qua API trong tiến trình, trao xuống `VungLienHe`; vùng dùng nó làm trạng thái đầu, không hỏi lại lần
   đầu. Khoảng chờ 250 ms chỉ áp khi gõ ô tìm; mở màn và đổi bộ lọc hỏi ngay.

## Câu hỏi cho chủ kho

- **Hỏi-1 · Duyệt giao diện.** Khuyến nghị: duyệt bằng chữ ở Cổng Phạm vi, nhìn ảnh 1440 và 375 (sáng) ở Cổng Bằng chứng
  — các lỗi đã chụp ở bản kiểm, khuôn đích là hồ sơ căn đang chạy. Lối khác: dựng bản bấm được (design-pass) trước.
- **Hỏi-2 · Esc khi đang gõ ô tìm hay khi menu, hộp đang mở.** Khuyến nghị: không đóng hồ sơ (Esc thoát chỗ ấy trước).
  Lối khác: Esc luôn đóng hồ sơ — đơn giản hơn, dễ đóng nhầm.

## Ngoài vòng

Lỗi 7 (tên hai lần trong ngăn điện thoại), lỗi 8 (dòng thời gian khối ReUI, tên căn trong sự kiện — chạm API), lỗi 9 (căn
bấm được), lối vào Liên hệ ở thanh đáy điện thoại, gói mã 420 KB và kho kết nối.

## Đối chiếu ngành

Vòng chỉ sửa khung và tốc độ của màn đã có; không thêm tập đóng — không có dòng «ta cứng — họ cấu hình».

| Năng lực | RESO | Follow Up Boss | KW Command | Ta làm | Ta cứng — họ cấu hình |
|---|---|---|---|---|---|
| Hồ sơ liên hệ cạnh danh sách | `Contacts` | chưa kiểm | chưa kiểm | cùng khung cột với hồ sơ căn | không |
