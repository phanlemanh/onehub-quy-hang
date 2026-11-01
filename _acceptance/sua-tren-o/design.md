# Thiết kế — Sửa trên ô (hàng 15)

Câu giao: Đầu chủ sửa giá, phí, trạng thái ngay trên ô; giá luôn kèm điều kiện phí, máy nói lại «Hiểu là…», sửa là vừa
xác nhận với chủ nhà, hoàn tác được. Luật sản phẩm 6–10 (`docs/product/tham-chieu.md` §8). Dựng trên Bảng hàng của
hàng 14 (khối `data-grid-editing-6`, đang tắt sửa ô tường minh).

## Cái đã có — không làm lại

- **Giá luôn kèm điều kiện phí** ở lõi: sự kiện `price_changed` đòi cả `listPrice` lẫn `feeInclusion`
  (`packages/core/src/listing/events.ts`).
- **Sửa giá, trạng thái tính là vừa xác nhận với chủ nhà** mặc định (`confirmsWithOwner`, luật 9) — máy chủ tự áp khi
  lệnh không gửi cờ.
- **Hai người cùng sửa thì báo** (luật 10): máy chủ so `expectedVersion`, «Đang giao dịch» và «Đã bán» thắng ngay; bộ
  đồng bộ của hàng 13 đưa hàng đụng nhau vào «Cần xem» với bốn lối ra.
- **Ghi trên máy trước** (luật 30): `useSuaHang()` kiểm bằng luật lõi, ghi hàng chờ trên máy, gửi lên sau.
- **Bảng chuyển trạng thái** (ADR-0008): `TRANSITIONS` + `missingFor` ở `packages/core/src/listing/status.ts`.
- **Khối sửa ô của ReUI**: `cellEdit` (`editable`, `parse`, `format`), `onCellsChange`, `onCellEditRequest`, lớp phủ
  sửa ô, `invertDataGridCellsChange` cho hoàn tác (`apps/web/src/components/reui/data-grid/`).

## Cái hàng này thêm

1. **Bộ đọc giá** — `packages/core/src/pricing/`: chữ đầu chủ gõ → số đồng. Nhận «4,65 tỷ», «4.65 tỷ», «4,65t»,
   «4 tỷ 650», «4ty65», «950 triệu», «950tr», «950 tr», «4650000000», «4.650.000.000». Không đoán: chữ mơ hồ (một số
   trần dưới 1 triệu không đơn vị, hai số, đơn vị lạ) → trả «chưa hiểu». Câu đọc lại «Hiểu là: 4,65 tỷ, không bao phí»
   dùng đúng chữ của cột Phí («bao phí / không bao phí»), không dùng «đã / chưa bao phí» của Ô nhận lead.
2. **Ngưỡng hỏi lại** — `packages/core/src/pricing/`: hằng `MUC_HOI_LAI_DOI_GIA_PHAN_TRAM = 20` khai một chỗ có tên,
   chú thích «mặc định của sàn» (khoá `price.change_confirm_pct` ở `docs/architecture/so-diem-bien-thien.md`; luật thường
   trực G-3110-24). Hàm thuần `canHoiLai(cu, moi)`: đổi điều kiện phí → luôn hỏi (luật 12 cấm so giá bao phí với không
   bao phí); cùng điều kiện → hỏi khi |mới − cũ| / cũ > 20%; hàng chưa có giá → không hỏi.
3. **Khối sửa ô** — `apps/web/src/app/(app)/inventory/cell-edit/`: ba trình sửa và lớp nối vào lưới.
   - **Giá**: ô gõ + nhóm hai nút «Bao phí / Không bao phí» (mặc định điều kiện hiện tại; hàng chưa có giá thì chưa
     chọn và phải chọn). Dưới ô là dòng đọc lại sống. Enter ghi; Esc huỷ. Chưa hiểu → dòng báo đỏ, Enter không ghi.
   - **Phí**: đổi điều kiện phí trên giá hiện tại — ghi `price_changed` với giá cũ + phí mới. Hàng chưa có giá → mở trình
     sửa Giá.
   - **Trạng thái**: danh sách CHỈ các nấc chuyển hợp lệ từ trạng thái hiện tại (nhãn của `STATUS_LABEL`). «Đã bán» hỏi
     giá chốt (cùng bộ đọc giá) và ngày bán (mặc định hôm nay); «Ngừng hẳn» hỏi lý do (ba lý do chuẩn). «Đang bán» thiếu
     điều kiện (`missingFor`) → nói thiếu gì, không ghi.
   - **Hỏi lại**: khi `canHoiLai` đúng hoặc khi nấc mới không hoàn tác được → một hộp xác nhận nhỏ ngay tại ô: cũ → mới,
     phần trăm đổi, câu «Không hoàn tác được» khi đúng; «Đổi» ghi, «Thôi» bỏ.
   - **Hoàn tác**: sau mỗi lần ghi, thông báo góc màn «Đã đổi … · Hoàn tác» (sonner, 10 giây) và Ctrl/Cmd+Z khi lưới có
     tiêu điểm. Hoàn tác = MỘT sự kiện mới đưa về giá trị trước (luật 8: mỗi lần sửa là một sự kiện) — không xoá sự kiện cũ.
4. **Nối vào Bảng hàng** (chạm ngoài ranh giới, giám sát duyệt B-9): ba cột Giá, Phí, Trạng thái bật
   `cellEdit.editable` trên máy tính; mọi cột khác giữ khoá (luật 6 — thuộc tính căn khoá; bốn phần chữ của lần rao để
   hàng sau). Điện thoại không sửa trên ô (luật 6).

## Quyết định của máy (sổ `decisions.jsonl`, mỗi dòng có căn cứ)

- Hoàn tác là sự kiện bù, giới hạn bởi bảng chuyển ADR-0008: nấc cuối (Đã bán, Ngừng hẳn) và mọi chuyển mà chiều ngược
  không có trong bảng (vd Chưa đủ để rao → Đang bán) không hoàn tác được — hỏi lại trước khi ghi, nói rõ.
- Hoàn tác giá về «chưa có giá» không làm được (lõi đòi giá > 0) — lần đặt giá đầu tiên của hàng không có Hoàn tác, hộp
  hỏi lại nói rõ.
- Không thêm cờ «không tính là xác nhận»: bộ đồng bộ hàng 13 không gửi cờ, máy chủ mặc định tính (luật 9 «mặc định»);
  trình sửa nói rõ «Tính là vừa xác nhận với chủ nhà». Lối tắt cờ để hàng sau (ngoài ranh giới `lib/sync`).
- Đổi điều kiện phí luôn hỏi lại — luật 12.
- Không chạm `lib/sync`, API, cơ sở dữ liệu: sửa đi qua `useSuaHang()` có sẵn.

## Ngoài phạm vi

Sửa hàng loạt, dán, kéo điền (hàng 16) · sửa bốn phần chữ của lần rao trên ô · cờ «không tính là xác nhận» · màn sửa
nhanh trên điện thoại · giá về tay / tỉ lệ bao phí (luật 12–13) · sàn chỉnh ngưỡng 20% ở Cài đặt sàn (hàng cấu hình theo
sàn đọc hằng này).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Bảng hàng (máy tính) → nhấp đúp hay Enter ở ô Giá → gõ «4,8 tỷ», thấy «Hiểu là: 4,8 tỷ, không bao phí» →
  Enter → ô đổi ngay, cột Xác nhận thành «Hôm nay», thông báo «Đã đổi giá A-12.03 · Hoàn tác» (điểm ra: lưới, tiêu điểm
  ở ô vừa sửa).
- Biên: đổi quá 20% hay đổi điều kiện phí → hộp hỏi lại tại ô; nấc không hoàn tác được → hộp hỏi lại có câu «Không hoàn
  tác được»; hàng chưa có giá → phải chọn điều kiện phí; «Đang bán» thiếu pháp lý → báo thiếu gì.
- Lỗi & quay lại: chữ chưa hiểu → báo đỏ dưới ô, giữ chữ đã gõ, sửa tiếp hay Esc; hai người cùng sửa → hàng vào «Cần xem»
  (hàng 13), không ghi đè lặng; mất mạng → ô vẫn đổi, chấm chờ gửi của hàng 13.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Bảng hàng (máy tính) | Thấy và sửa giá, phí, trạng thái của hàng sàn mình ngay trên ô | Vỏ, nhóm Bảng hàng / hồ sơ căn, Gửi |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-bang-hang-sua-gia | Bảng hàng | Ô gõ + «Bao phí / Không bao phí» + «Hiểu là: …» + «Tính là vừa xác nhận với chủ nhà» | Enter ghi · Esc huỷ |
| ST-bang-hang-chua-hieu | Bảng hàng | «Chưa hiểu «…» — gõ như 4,65 tỷ hoặc 950 triệu», viền đỏ | Sửa chữ · Esc |
| ST-bang-hang-hoi-lai | Bảng hàng | Hộp nhỏ tại ô: cũ → mới, ±%, (Không hoàn tác được) | «Đổi» · «Thôi» |
| ST-bang-hang-sua-trang-thai | Bảng hàng | Danh sách nấc chuyển hợp lệ; Đã bán hỏi giá chốt + ngày; Ngừng hẳn hỏi lý do | Chọn · Esc |
| ST-bang-hang-thieu-dieu-kien | Bảng hàng | «Chưa lên Đang bán được: thiếu pháp lý, tình trạng sử dụng» | Mở hồ sơ để điền · Esc |
| ST-bang-hang-da-doi | Bảng hàng | Ô giá trị mới, Xác nhận «Hôm nay», thông báo «Đã đổi … · Hoàn tác» | Hoàn tác (10 giây, Ctrl/Cmd+Z) · làm tiếp |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Mở sửa: nhấp đúp, Enter hay gõ ký tự đầu (thay chữ) ở ô Giá, Phí, Trạng thái; Tab/Enter ghi và đi ô kế như khối ReUI;
  Esc bỏ. Ô khác: nhấp đúp không mở gì.
- Giá: chữ ≤ 40 ký tự; số đồng nguyên dương ≤ 1.000 tỷ; nhóm hai nút phím ←/→.
- Hoàn tác: thông báo 10 giây; Ctrl/Cmd+Z hoàn tác lần sửa gần nhất của chính người này trên bảng này.
- Điện thoại (< 768): không mở sửa ô.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| DataGrid cellEdit + lớp phủ sửa ô (ReUI) | dùng | Khối đích `data-grid-editing-6` đã có sửa ô; hàng 14 chỉ tắt |
| ToggleGroup (Bao phí / Không bao phí) | dùng | Hai lựa chọn loại trừ, đã cài |
| Select (nấc trạng thái, lý do ngừng) | dùng | Danh sách đóng, đã cài |
| Popover (hộp hỏi lại) | ghép | Hỏi tại ô, không mở hộp thoại toàn màn |
| Sonner (Đã đổi · Hoàn tác) | dùng | Thông báo có nút hành động, đã cài |
| Trình sửa Giá (ô gõ + đọc lại) | ghép | Ghép Input + ToggleGroup + dòng chữ; không khối ReUI nào có «Hiểu là» |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên — sửa xảy ra tại chỗ trên bảng của hàng 14 (luật 3 «dày như Sheet; một căn một hồ sơ»), không
mở màn mới; không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->
