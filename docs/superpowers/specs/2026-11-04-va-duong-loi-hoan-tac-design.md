# Vá đường lỗi hoàn tác — thiết kế

Hàng 88 của lộ trình (dãy B, đợt dau-khach-nhap). Ô cơ hội: `_acceptance/va-duong-loi-hoan-tac/opportunity.md` (Cổng
Đáng `build` 02/11). Gộp ba giới hạn cùng một đường lỗi:

- hàng 16 (`sua-hang-loat`), Ngoài-3 — chủ kho chọn «mở hợp đồng mới»: hoàn tác lô báo «Đã hoàn tác n căn» bằng thông
  báo thành công dù vài căn chưa ghi được, không nói căn nào;
- hàng 15 vá (`va-sua-tren-o`), Known limits Ngoài-1: máy chưa lưu được lần hoàn tác mà bấm Hoàn tác lần nữa thì báo «Đã
  hoàn tác rồi» dù giá chưa về;
- cùng chỗ, Ngoài-3: lưu hay hoàn tác gặp lỗi bất ngờ thì ô sửa đã đóng và không có thông báo lỗi.

## Hiện trạng

- `inventory/cell-edit/hoan-tac.ts`: `taoSoHoanTac().dungNut/dungPhim` đánh dấu bản ghi `daDung` NGAY khi xét, trước lần ghi
  lệnh bù. `tren-o.tsx` `hoanTac` ghi lệnh bù; ghi hỏng chỉ báo lỗi — bản ghi đã dùng, bấm lại ra «Đã hoàn tác rồi».
- `inventory/bulk/hoan-tac-lo.ts`: `dungLo` đánh dấu đã dùng; `thanh.tsx` `hoanTacLo` đếm số căn ghi được rồi luôn
  `toast.success(chuHoanTacLo(kq, duoc))` — căn hỏng không có tên, không có lý do.
- `lib/sync/dong-bo.ts` `sua()`: lỗi kho trên máy (`LoiKho`) thành `{ ok: false, loi: { kind: "kho" } }`; lỗi khác ném ra.
  Bốn chỗ gọi (`ghi` và `hoanTac` của ô, `ghi` và `hoanTacLo` của lô) gọi qua `void …` nên lỗi ném ra mất lặng.

## Cách làm

1. **Một lần ghi không bao giờ ném ra màn** — hàm `ghiAnToan(sua)` bọc `sua` ngay chỗ lấy nó (`ghiAnToan(useSuaHang())`): lỗi ném ra thành
   `{ ok: false, loi: { kind: "bat-ngo" } }`; `moTaLoi` nói «Lỗi bất ngờ — chưa lưu được, thử lại». Bốn chỗ gọi đi qua nó.
2. **Hoàn tác ô chỉ «đã dùng» khi lệnh bù ghi được.** Bộ giữ bản ghi thêm `traLai(b)`: lệnh bù hỏng → bản ghi thôi «đã
   dùng» và (nếu là bản ghi gần nhất) Ctrl/Cmd+Z lại trỏ nó. Thông báo lỗi mang nút «Hoàn tác» trỏ đúng bản ghi ấy. Luật cũ
   giữ nguyên: căn đã có lần sửa sau thì từ chối; hoàn tác xong bấm lại ra «Đã hoàn tác rồi».
3. **Hoàn tác lô kể đúng căn chưa trả về và vì sao** — theo nếp ghi lô một phần của hàng 16 (AC-6 của `sua-hang-loat`:
   thông báo trung tính «… · k căn chưa ghi được», căn không đổi được vẫn tích). Hàm thuần `ketQuaHoanTacLo(kq, ketQua)` dựng
   thông báo từ kết quả từng căn: mọi căn về → thông báo thành công như cũ; có căn hỏng → thông báo trung tính «Đã hoàn tác n
   căn · k căn chưa hoàn tác được», mô tả liệt tối đa năm mã căn kèm lý do (`moTaLoi`), phần «đã có lần sửa sau», «không hoàn
   tác được» như cũ; căn chưa về được tích lại trên lưới; và một bản ghi lô MỚI chỉ gồm căn hỏng vì kho hay lỗi bất ngờ, chưa
   dùng — nút «Hoàn tác» trên thông báo bấm lại đúng các căn ấy. Căn hỏng vì luật của lõi kể vào «không hoàn tác được».
4. Chỗ đặt: chỉ `inventory/cell-edit/**` và `inventory/bulk/**` (vùng của hàng); `ghiAnToan` ở `cell-edit/lenh.ts` cạnh
   `moTaLoi`. Không đổi bộ đồng bộ, API, lõi.

Không làm: đổi cách bộ đồng bộ gửi lên máy chủ; hoàn tác «đã gọi» (vẫn không đảo được); thông báo dài quá năm căn gộp
«… và n căn khác» là đủ — không có màn danh sách riêng.

## Đối chiếu ngành (ADR-0022)

| Năng lực | RESO | Sản phẩm 1 | Sản phẩm 2 | Ta làm | Ta cứng — họ cấu hình |
|---|---|---|---|---|---|
| Báo lỗi ghi từng bản ghi của thao tác hàng loạt | — (RESO không phủ thao tác giao diện) | Airtable: thao tác hàng loạt lỗi một phần báo số bản ghi lỗi (chưa kiểm chi tiết) | Google Sheets: hoàn tác là một bước, không có lỗi từng dòng (chưa kiểm) | Kể đúng mã căn và lý do, bấm lại được phần hỏng | Không — không phải danh sách cố định của sàn |

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Bảng hàng → đổi trạng thái hàng loạt → thông báo có «Hoàn tác» → bấm → «Đã hoàn tác n căn» (như cũ).
- Biên: 2 trong 5 căn không ghi được → «Đã hoàn tác 3 căn · 2 căn chưa hoàn tác được» kể mã căn và lý do, hai căn tích lại,
  nút «Hoàn tác» → bấm lại hoàn tác đúng 2 căn ấy. Hoàn tác trên ô hỏng → thông báo lỗi có «Hoàn tác»; Ctrl/Cmd+Z cũng thử lại.
- Lỗi & quay lại: lỗi bất ngờ khi lưu hay hoàn tác sau khi ô sửa đóng → thông báo lỗi nêu căn; người sửa lại hay bấm lại.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Bảng hàng (máy tính) | sửa và hoàn tác căn | không đổi |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-ht-lo-thanh-cong | Bảng hàng | «Đã hoàn tác n căn» (+ phần bỏ qua như cũ) | tiếp tục |
| ST-ht-lo-mot-phan | Bảng hàng | «Đã hoàn tác n căn · k căn chưa hoàn tác được» + mã căn và lý do + nút «Hoàn tác»; căn chưa về tích lại | bấm lại |
| ST-ht-o-hong | Bảng hàng | lỗi «Không hoàn tác được: <lý do>» + nút «Hoàn tác» | bấm lại hay Ctrl/Cmd+Z |
| ST-ghi-bat-ngo | Bảng hàng | lỗi «<căn>: Lỗi bất ngờ — chưa lưu được, thử lại» | sửa lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Thông báo lỗi giữ 10 giây như thông báo có nút «Hoàn tác» hiện nay.
- Liệt tối đa năm mã căn, phần còn lại «và n căn khác».

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `sonner` toast | dùng | thông báo đang có của sửa trên ô và sửa hàng loạt |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: không đổi (thông báo nổi của Bảng hàng)
Căn cứ: chỉ đổi chữ và nút của thông báo đang có.
### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Đầu chủ |
| Việc chính | hoàn tác một lần sửa hay một lô mà không mất dấu căn chưa về |
| Tần suất | mỗi ngày vài lần |
| Số bản ghi | một tới vài chục |
| Thiết bị | máy tính |
<!-- UX-SPEC-TEMPLATE>>> -->
