# Vá đổi giá căn Đã bán (hàng va-doi-gia-can-da-ban)

Ngày 03/11/2026 · Hạng T2 · dãy G đợt dau-khach-nhap · Nguồn: ô cơ hội `_acceptance/va-doi-gia-can-da-ban/opportunity.md`
(Cổng Đáng «build» 02/11), luật 31 của đợt, luật trạng thái hàng 8 (`packages/core/src/listing/status.ts`).

## Vấn đề

Máy chủ nhận `price_changed` trên căn Đã bán (`Closed`) khi lệnh mang đúng phiên bản: luật «Đã bán không đổi giá» chỉ
có ở ô Bảng hàng (giao diện), không ở lõi — trái AGENTS.md «luật nghiệp vụ ở packages/core» và một đường ghi (ADR-0008).

## Thiết kế

- **Lõi** (`packages/core/src/listing/doi-gia.ts`, xuất qua `@quy-hang/core/listing`): `kiemDoiGia(hang)` trả
  `DOI_GIA_DA_BAN` khi `standardStatus === "Closed"`, `null` với năm trạng thái còn lại; `LY_DO_DOI_GIA_DA_BAN` là câu
  tiếng Việt «Căn đã bán không đổi giá — giá chốt đã ghi». Cùng nếp `kiemGanMaCan` / `LY_DO_MA_CAN_DA_CO` (ADR-0026).
- **API** (`packages/api/src/listings/store.ts`, `applyCommand`): lệnh `price_changed` trên hàng mà `kiemDoiGia` từ chối
  → trả mã riêng `price-locked-closed` (422, cùng nếp `unit-number-already-set` của ADR-0026) kèm `reason` = câu của lõi, xét
  **trước** phép so phiên bản: máy đang giữ bản cũ cũng nhận đúng lý do «đã bán», không phải «đụng nhau». Không ghi sự
  kiện, không đổi bản tính.
- **Bộ đồng bộ**: không sửa. `gui.ts` đã đưa mọi 4xx vào «Cần xem» với `reason` của máy chủ (`lyDoTuChoi`); vòng này chỉ
  thêm một tệp kiểm trên API thật (luật 31: dãy chỉ kiểm).

## Lối đã so

| Câu | Lối chọn | Lối loại — vì sao |
| --- | --- | --- |
| Mã lỗi | Mã riêng `price-locked-closed` 422 (nếp ADR-0026) | Mượn `invalid-transition`: `price_changed` không phải phép chuyển trạng thái — bên đọc API ngoài hiểu nhầm, đổi sau là đổi phá vỡ |
| Chỗ xét | Trước phép so phiên bản | Sau: máy cũ nhận «đụng nhau», kéo lại rồi gửi lại vẫn bị từ chối — hai vòng thay một |
| Trạng thái khoá giá | Chỉ Đã bán | Cả Ngừng hẳn: câu bật khi ghi «căn các trạng thái khác đổi giá như cũ» |

## Đặc tả UX

Không có — không đổi màn (sổ quyết định, dòng «bỏ đặc-tả-UX»).
