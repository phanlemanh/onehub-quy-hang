# Sửa hàng loạt — thiết kế

Hàng 16 của đợt «Đầu chủ động vào» (dãy B). Câu giao: đầu chủ chọn nhiều căn rồi đổi trạng thái, đổi đầu chủ hay đánh dấu
đã gọi cho tất cả trong một lần. Đứng trên hàng 15 (sửa trên ô) và va-sua-tren-o (hoàn tác theo phiên bản).

## Vấn đề

Giữ tươi kho hàng hôm nay là từng căn một: gọi một loạt chủ nhà cùng toà rồi phải đánh dấu «Còn / giữ giá» từng căn, chủ
tạm ngừng cả mấy căn thì đổi từng ô. Bảng hàng đã có lưới kiểu Sheet (hàng 14) và sửa trên ô (hàng 15), nhưng chưa có cột
chọn dòng và chưa có thao tác nào trên nhiều căn.

## Cách giải

- **Chọn căn.** Bật cột chọn dòng có sẵn của khối data-grid-editing-6 (nhãn «Chọn dòng», «Chọn hết»). «Chọn hết» tích mọi
  căn đang hiện sau lọc. Căn đã tích giữ khi đổi lọc, nhóm, góc nhìn (luật 4).
- **Thanh hành động** hiện khi có căn tích: «n căn đã chọn» (+ «k đang bị lọc ẩn» khi có), «Đổi trạng thái ▾», «Đánh dấu
  đã gọi», «Bỏ chọn». Logic thuần ở `bulk/lo.ts`; móc vào `bang-hang.tsx` chỉ hai chỗ (cột chọn, thanh).
- **Xét lô trước khi ghi** — hàm thuần `xetDoiTrangThai(hang[], to, them)` và `xetDaGoi(hang[])` trả
  `{ doiDuoc: id[], khongDoi: {id, maCan, lyDo}[] }`. Đổi trạng thái dùng đúng bảng chuyển và điều kiện của lõi
  (`checkTransition`), nên căn thiếu giá / pháp lý không lên Đang bán, căn đã ở nấc ấy là «đã ở nấc này». Menu chỉ đưa nấc
  mà ít nhất một căn tích chuyển được, không bao giờ «Đã bán» (giá chốt từng căn). «Ngừng hẳn» hỏi một lý do cho cả lô.
- **Hỏi lại một lần** (AlertDialog): «Đổi n căn sang <nấc>» hoặc «Đánh dấu đã gọi n căn — Còn / giữ giá · không hoàn tác
  được»; dưới là «k căn không đổi được» kèm mã căn và lý do. «Thôi» không ghi gì; «Đổi» ghi mỗi căn đổi được một sự kiện
  qua kho trên máy (`useSuaHang`), căn không đổi được không ghi.
- **Sau khi ghi**: thông báo «Đã đổi trạng thái n căn · Hoàn tác» / «Đã đánh dấu đã gọi n căn». Căn đã ghi bỏ tích; căn
  không đổi được giữ tích. Căn mà kho trên máy từ chối lúc ghi được cộng vào «k căn chưa ghi được».
- **Hoàn tác lô** (chỉ đổi trạng thái): mỗi căn một sự kiện bù bằng `lenhHoanTac` của hàng 15; căn đã có lần sửa sau
  (phiên bản khác phiên bản ngay sau lần ghi — `xetHoanTac` của va-sua-tren-o) bỏ qua và được đếm; bấm lần hai «Đã hoàn
  tác rồi». Đánh dấu đã gọi không có nút Hoàn tác — nói trước ở hộp hỏi.
- **Ctrl/Cmd+Z trong ô chữ** (Ngoài-2 của va-sua-tren-o): phím tắt hoàn tác của trình sửa trên ô bỏ qua khi tiêu điểm
  đang ở ô gõ (input, textarea, contenteditable) — hàm thuần `laOGo(target)` ở `bulk/phim.ts`, `tren-o.tsx` gọi.

## Đặc tả UX

<!-- ux-spec:start -->
Không màn mới; thêm vào Bảng hàng trên máy tính:

| Trạng thái | Thấy gì |
|---|---|
| Chưa tích căn nào | cột ô tích ở đầu dòng; không thanh hành động |
| Tích ≥ 1 căn | thanh trên lưới: «n căn đã chọn» · Đổi trạng thái ▾ · Đánh dấu đã gọi · Bỏ chọn |
| Tích rồi đổi lọc làm ẩn căn | thanh thêm «k đang bị lọc ẩn»; căn vẫn tích |
| Mở «Đổi trạng thái» | danh sách nấc mà ít nhất một căn chuyển được; không có «Đã bán» |
| Chọn «Ngừng hẳn» | hộp hỏi thêm ô chọn lý do (bắt buộc, một lý do cho cả lô) |
| Hộp hỏi lại | «Đổi n căn sang <nấc>» · «k căn không đổi được» + mã căn — lý do · Thôi / Đổi |
| Không căn nào đổi được | hộp hỏi chỉ kể lý do, nút Đổi tắt |
| Đã ghi | thông báo «Đã đổi trạng thái n căn · Hoàn tác»; căn đã ghi bỏ tích |
| Hoàn tác lô | «Đã hoàn tác n căn» (+ «k căn đã có lần sửa sau — bỏ qua») |
| Đánh dấu đã gọi | hộp hỏi «… · không hoàn tác được»; thông báo không có Hoàn tác; cột Độ tươi về «hôm nay» |

Khuôn IA: Table-backed management (giữ khối data-grid-editing-6 của hàng 14; thanh hành động hàng loạt là phần «đổi hàng
loạt cho hàng đã tích» đã ghi ở `docs/design/vo-va-ia.md`). Không tra mẫu: khuôn đã chốt ở vo-va-ia.
<!-- ux-spec:end -->

## Quyết định

Sổ `decisions.jsonl` d-…-3 tới d-…-14 (d-…-14 thay d-…-9). Chỉ người quyết:

- **Hỏi-1** (d-…-2): tách «đổi đầu chủ hàng loạt» thành hàng sau. Đổi đầu chủ cần hàng mang đầu chủ hiện tại, danh sách
  thành viên cho trưởng nhóm và vai người dùng ở web — cả ba ở API và bộ đồng bộ, ngoài ranh giới; API gán đầu chủ chỉ cho
  trưởng nhóm. Nháp theo khuyến nghị: hàng 16 làm đổi trạng thái + đánh dấu đã gọi. Lối khác: mở ranh giới, làm đủ ba.
- **Hỏi-2** (d-…-15, thay d-…-5): đổi trạng thái hàng loạt có hỏi lại trước khi ghi không? Nháp theo khuyến nghị: hỏi
  lại một lần cho mọi thao tác lô — người thấy trước căn nào không đổi được. Lối khác: đổi trạng thái ghi ngay, thông báo
  kể căn bỏ qua kèm Hoàn tác lô; chỉ đánh dấu đã gọi và Ngừng hẳn mới hỏi.

## Ngoài phạm vi

Đổi đầu chủ hàng loạt (Hỏi-1) · Đã bán hàng loạt · dán, kéo điền nhiều ô · khổ điện thoại (sửa chỉ có trên máy tính,
luật 6) · Ctrl/Cmd+Z hoàn tác cả lô (lô hoàn tác bằng nút trên thông báo) · «Không nghe máy» hàng loạt (lõi chưa có
sự kiện).
