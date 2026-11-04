---
nhom: da-gui
doi_tuong: [lan-gui, luot-mo, luot-quan-tam, can-thay]
khuon: { ten: KhungDaGui, nhap: "@/app/(app)/shares/khung" }
nhan_dien: ["apps/web/src/app/(app)/shares/page.tsx"]
mau_dang_chay: { tep: "apps/web/src/app/(app)/shares/page.tsx", duong: "/shares", trang_thai: [mac-dinh, trong, dang-tai, loi-tai, vai-khong-xem, chi-tiet, vua-doi, da-tat] }
khe_bat_buoc: [children]
cam_ngoai_khuon: [Frame, FrameHeader, Card]
ngoai_le: []
luat: [KH-dg-danh-sach-chi-tiet, KH-dg-khong-nguon, KH-dg-can-thay-mo-gui]
bo_cuc: danh-sach-chi-tiet
---
# Đã gửi

Màn Đã gửi (hàng 36): trang `apps/web/src/app/(app)/shares/page.tsx` trả `<KhungDaGui>…</KhungDaGui>` ở gốc — bố cục
«Danh sách → chi tiết» (ADR-0024). Mỗi Lần gửi là một thẻ theo lối ReUI `wishlist-4` (chủ kho chọn ở Cổng Phạm vi hàng 36,
trang ba lối `_acceptance/da-gui/ba-loi/`): bìa tối đa bốn ảnh căn, người nhận, số căn, lượt mở, lượt quan tâm, giờ mở gần
nhất. Chạm thẻ mở chi tiết: các căn theo thứ tự gửi, nhãn «Vừa đổi», «Gợi ý căn thay», nút «Tắt link». Trang ba lối đã gỡ
khỏi cây; ảnh ba lối giữ ở hồ sơ.

**Dùng khi** màn đọc lại các link đã gửi và phản ứng của khách. **Không dùng** cho màn Gửi (`/shares/new`, nhóm `gui`) hay
trang khách công khai `/s/<mã>` (nhóm `trang-khach`).

## Luật

- **KH-dg-danh-sach-chi-tiet** — Danh sách thẻ và chi tiết một Lần gửi nằm trong `KhungDaGui`; trang không tự dựng `Frame`
  hay `Card`. Trống · đang tải · lỗi tải · vai không xem được đi qua `TrangThai`; tắt link hỏi xác nhận bằng `AlertDialog`.
- **KH-dg-khong-nguon** — Màn chỉ đọc `GET /api/v1/shares` và `/api/v1/shares/{id}`: không trường lớp `source`, không số
  khách; lượt mở, lượt quan tâm đếm từ `share_events`.
- **KH-dg-can-thay-mo-gui** — «Gợi ý căn thay» chỉ mở luồng Gửi `/shares/new?can=<id>`; máy không gửi gì — người tự bấm gửi
  (bất biến 3).
