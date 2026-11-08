# Đổi giá nhanh trên điện thoại — thiết kế (hàng 40)

Hàng 40 `doi-gia-nhanh` (dãy H, đợt dau-khach-nhap). Ô cơ hội: `_acceptance/doi-gia-nhanh/opportunity.md` (Cổng Đáng: build,
05/11). Hàng 39 (Hôm nay đầu chủ điện thoại) đã chốt: không làm chế độ cuộc gọi trên điện thoại, «hạ giá và đổi trạng thái
đi qua hồ sơ căn» (`_acceptance/hom-nay-dau-chu-dien-thoai/decisions.jsonl` d-20261105T082851Z-3). Hàng này dựng đúng lối ấy.

## Làm gì

Trên hồ sơ căn điện thoại (dưới 768 px), người được sửa hàng theo bảng quyền của lõi có hai lối sửa nhanh:

- **Đổi giá** — chạm khối Giá mở ngăn nổi từ đáy (`NganNoi`): ô giá (đọc «3,2 tỷ», «3200 triệu» bằng `docGia` của lõi), chọn
  bao phí / không bao phí (bắt buộc — luật 7, 12), «Lưu». Giá đổi quá ngưỡng hỏi lại (mặc định 20%) hay đổi điều kiện phí →
  máy hỏi lại một lần trước khi ghi (`canHoiLai`). Căn Đã bán → không mở được sửa giá, nói lý do của lõi («Căn đã bán không đổi
  giá — giá chốt đã ghi»).
- **Đổi trạng thái** — chạm huy hiệu trạng thái mở ngăn nổi: các nấc theo bảng chuyển và nhãn của sàn (`luaChonTrangThai`),
  người không có cờ «Sẵn sàng bán» không thấy nấc Đang bán; Đã bán đòi giá chốt + ngày, Ngừng bán đòi lý do; chuyển trái luật
  hay thiếu điều kiện → nói lý do (`moTaLoi`), không ghi.

Mọi lần ghi đi qua bộ đồng bộ (`useSuaHang`) như ô của Bảng hàng: ghi ngay trên máy, mất mạng thì chờ và tự gửi, máy chủ từ chối
về sau thì căn vào «Cần xem». Sự kiện mang người làm, lúc làm, thiết bị `mobile` (đầu `x-quy-hang-device`), nên Lịch sử của hồ
sơ hiện «Đổi giá cũ → mới» / «Đổi trạng thái cũ → mới» kèm người và lúc.

## Dùng lại

`inventory/cell-edit/lenh.ts` (`dungLenhGia`, `dungLenhPhi`, `dungLenhTrangThai`, `luaChonTrangThai`, `coDuaLenDangBan`,
`moTaLoi`), `@quy-hang/core/pricing` (`docGia`, `vietGia`, `canHoiLai`), `@quy-hang/core/listing` (`kiemDoiGia`,
`checkTransition`), `useSuaHang`, `NganNoi`, `TrangThai`. Quyền hiện lối: cờ thứ sáu `suaHang` của lớp phủ hồ sơ =
`duocLamVoiHang(viewer, "sua", người giữ)` — màn không rẽ theo tên vai.

## Ngoài

- Màn cuộc gọi trên điện thoại (hàng 39 đã loại). Trang khách đang mở không tự làm mới (Hỏi-1).
- Thân cột máy tính: Bảng hàng đã có ô sửa.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: hồ sơ căn điện thoại → chạm khối Giá → ngăn «Đổi giá» → gõ giá, chọn bao phí → «Lưu» → ngăn đóng, khối Giá hiện giá mới, Lịch sử thêm dòng (điểm ra: hồ sơ căn).
- Suôn sẻ: chạm huy hiệu trạng thái → ngăn «Đổi trạng thái» → chọn nấc (kèm giá chốt/ngày/lý do khi nấc đòi) → «Lưu» → huy hiệu mới, Lịch sử thêm dòng.
- Biên: giá đổi quá ngưỡng hay đổi điều kiện phí → khối hỏi lại «Giá đổi 35% so với giá đang ghi — chắc chưa?» → «Ghi» / «Sửa lại».
- Biên: căn Đã bán → khối Giá không mở sửa, dòng «Căn đã bán không đổi giá — giá chốt đã ghi».
- Lỗi & quay lại: giá đọc không được, thiếu bao phí, chuyển trạng thái trái luật → lời lỗi ngay trong ngăn, ngăn vẫn mở để sửa; mất mạng → ghi trên máy, «Chờ mạng» như ô Bảng hàng.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hồ sơ căn, điện thoại | xem một căn và làm việc chính với căn | Bảng hàng, Hôm nay / ngăn Đổi giá, ngăn Đổi trạng thái |
| Ngăn Đổi giá | ghi giá mới kèm điều kiện phí | khối Giá / hồ sơ căn |
| Ngăn Đổi trạng thái | chuyển căn sang nấc khác theo luật | huy hiệu trạng thái / hồ sơ căn |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-doi-gia-mo | Ngăn Đổi giá | ô giá điền sẵn giá đang ghi, hai lựa chọn bao phí, «Lưu» | gõ giá, chọn phí, lưu |
| ST-doi-gia-loi | Ngăn Đổi giá | lời lỗi dưới ô (đọc không được giá · thiếu bao phí) | sửa rồi lưu lại |
| ST-doi-gia-hoi-lai | Ngăn Đổi giá | khối hỏi lại kèm phần trăm đổi | «Ghi» hay «Sửa lại» |
| ST-doi-gia-khoa | Hồ sơ căn, điện thoại | khối Giá không mở sửa, dòng lý do căn đã bán | đọc |
| ST-doi-tt-mo | Ngăn Đổi trạng thái | danh sách nấc theo luật, ô giá chốt/ngày/lý do khi nấc đòi | chọn, lưu |
| ST-doi-tt-loi | Ngăn Đổi trạng thái | lý do của lõi (thiếu … · không chuyển được) | chọn nấc khác hay đóng |
| ST-khong-sua | Hồ sơ căn, điện thoại | không có lối sửa (người không được sửa hàng) | đọc |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Ô giá dùng bàn phím số; giá hiện lại bằng `vietGia` ngay dưới ô khi gõ («3,2 tỷ»).
- Ngăn đóng khi lưu xong; lỗi giữ ngăn mở.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| NganNoi | dùng | luật no-direct-sheet; như ngăn Chụp ảnh |
| ToggleGroup bao phí | dùng | như ngăn chọn ngăn của Chụp ảnh |
| TrangThai | dùng | báo lỗi, khoá theo khuôn |
| Ngăn Đổi giá, Đổi trạng thái | ghép | ghép từ thành phần có sẵn, logic dùng lại `lenh.ts` |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: sửa nhanh là chế độ của màn chi tiết hồ sơ căn (nhóm khuôn ho-so-can), mở ngăn nổi như Chụp ảnh — luồng hiển nhiên.

### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | đầu chủ (chính), trưởng nhóm, đầu khách |
| Việc chính | đổi giá hay trạng thái một căn ngay sau cuộc gọi |
| Tần suất | mỗi ngày nhiều lần |
| Số bản ghi | một |
| Thiết bị | điện thoại |
<!-- UX-SPEC-TEMPLATE>>> -->
