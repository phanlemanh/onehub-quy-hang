---
nhom: gui
doi_tuong: [lan-gui, nhu-cau-khach, can]
khuon: { ten: KhungGui, nhap: "@/app/(app)/shares/new/khung" }
nhan_dien: ["apps/web/src/app/(app)/shares/new/page.tsx"]
mau_dang_chay: { tep: "apps/web/src/app/(app)/shares/new/page.tsx", duong: "/shares/new", trang_thai: [mac-dinh, chua-nguoi-nhan, mat-mang, nhac-xac-nhan, khong-con-can, dang-tao-link, loi-tao-link, chep-tin] }
khe_bat_buoc: [children]
cam_ngoai_khuon: [Frame, FrameHeader, FramePanel]
ngoai_le: []
luat: [KH-gui-mot-luong, KH-gui-ban-ra, KH-gui-nguoi-bam]
bo_cuc: luong-nhieu-buoc
---
# Gửi

Màn đầu của nhóm Gửi (hàng 34): trang `apps/web/src/app/(app)/shares/new/page.tsx` trả `<KhungGui>…</KhungGui>` ở gốc —
bố cục «Luồng nhiều bước» (ADR-0024), một lần cuộn Gửi cho ai · Căn sẽ gửi · Tin soạn sẵn, thanh dính đáy
«n căn · Xem trước · Gửi» theo lối ReUI `wishlist-1` (chủ kho chọn ở Cổng Phạm vi hàng 34, trang ba lối
`_acceptance/luong-gui/ba-loi/`). Trang ba lối đã gỡ khỏi cây sau khi chủ kho chọn lối; ảnh ba lối giữ ở hồ sơ.

**Dùng khi** màn đưa căn ra khỏi sàn qua bảng chia sẻ của thiết bị: chọn người nhận, xem trước trang khách, mở bảng chia
sẻ. **Không dùng** cho trang khách công khai `/s/<mã>` (hàng 35, họ card, dùng lại `TrangKhach`) hay danh sách Đã gửi
(hàng 36).

## Luật

- **KH-gui-mot-luong** — Màn Gửi là một luồng trong `KhungGui`: không Frame lồng, hành động chính ở thanh dính đáy, xem
  trước là ngăn `NganNoi toanMan`; trạng thái báo (lỗi tạo link, đã chép, không còn căn) dựng qua `TrangThai`.
- **KH-gui-ban-ra** — Mọi chữ, ảnh và tin khách thấy dựng từ bản ra `banRaNgoai` của lõi; `TrangKhach` chỉ nhận
  `CanRaNgoai`. Thư mục màn có bài rò rỉ `*.ro-ri.test.ts` (rào cửa ra hàng 31).
- **KH-gui-nguoi-bam** — Nút Gửi chỉ tạo một Lần gửi rồi mở bảng chia sẻ của thiết bị (hay chép tin); máy không gửi tin,
  không đăng nhóm — người tự bấm gửi (bất biến 3).
