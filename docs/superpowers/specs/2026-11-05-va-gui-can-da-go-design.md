# Căn đã gỡ không vào Lần gửi, không nhận «Quan tâm» (hàng vá va-gui-can-da-go) — thiết kế

Ngày: 2026-11-05 · Hồ sơ: `_acceptance/va-gui-can-da-go/` · Hạng T3 (migration 037) · Dãy G, đợt dau-khach-nhap · Nguồn:
Ngoài-2 của hàng 66 (`nhap-hoan-tac`), chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 05/11; luật 65 của đợt.

## 1. Lỗ

Hàng 66 thêm cờ `listings.voided` (căn gỡ khỏi Quỹ hàng khi hoàn tác lần nhập) và lọc nó ở mọi đường đọc của API. Hai hàm
`security definer` ở tầng cơ sở dữ liệu thì chưa biết cờ này:

- `app.create_share` (migration 021) chỉ đòi căn từng có sự kiện `status_changed → Active`. Căn đã lên Đang bán rồi bị gỡ
  vẫn vào được một Lần gửi mới nếu ai đó gửi đúng mã căn.
- `app.record_share_event` (migration 031) chỉ đòi `standard_status = 'Active'`. Gỡ không đổi trạng thái, nên khách mở link
  cũ vẫn bấm «Quan tâm» được cho căn mà trang đã báo là không còn.

## 2. Sửa

Migration `037_gui_can_da_go.sql` (số giám sát giữ, luật 65) thay hai hàm bằng `create or replace`, giữ nguyên chữ ký, quyền
(`security definer`, `search_path = ''`, chỉ `quy_hang_app` được gọi) và mã lỗi đang có:

- `app.create_share`: căn nào `voided` → `22023` «căn chưa lên bảng» (cùng mã căn không gửi được, API đã ánh xạ sang
  `400 listing-not-shareable`). Không ghi `shares` hay `share_listings` nào.
- `app.record_share_event` loại `interest`: thêm `and not l.voided` vào điều kiện căn còn Đang bán → `23514` (API trả
  `409`, như căn không còn bán). Loại `link_opened` không đổi — khách vẫn mở được link, trang báo căn không còn (hàng 66).

Không đổi API, không đổi màn: mã lỗi và đường ánh xạ đã có. Căn cứ: chặn ở tầng dữ liệu, không ẩn ở giao diện (bất biến 4,
`.claude/rules/du-lieu-ca-nhan.md`).

## 3. Lựa chọn

- Dùng lại mã lỗi đang có thay vì mã mới — một lối: API và màn đã nói đúng «căn không gửi được», «căn không quan tâm được».
- Không đụng `listing_events` hay luật cách ly; hàm vẫn kiểm sàn bằng `app.current_company_id()`.

## 4. Ngoài phạm vi

- Gỡ căn đã gỡ khỏi các Lần gửi cũ (`share_listings`) — trang khách đã báo căn không còn (hàng 66).
- Các hàm khác đọc `listings` mà không ghi ra khách.

## Đối chiếu ngành (ADR-0022)

Không năng lực mới: sửa ràng buộc dữ liệu của tính năng hoàn tác đã đối chiếu ở hàng 66 (`docs/product/doi-chieu-nganh.md`
§11). Không dòng «ta cứng — họ cấu hình».
