---
nhom: bang-hang
doi_tuong: [bang-hang, goc-nhin]
khuon: { ten: KhungBangHang, nhap: "@/app/(app)/inventory/khung" }
nhan_dien: ["apps/web/src/app/(app)/inventory/page.tsx", "apps/web/src/app/(app)/inventory/views/**/page.tsx"]
mau_dang_chay: { tep: "apps/web/src/app/(app)/inventory/page.tsx", duong: "/inventory", trang_thai: [mac-dinh, loc-rong] }
khe_bat_buoc: [title, children]
cam_ngoai_khuon: [Frame, FrameHeader, Card, Placeholder]
ngoai_le: []
luat: [KH-bh-mot-khung, KH-bh-tren-may, KH-bh-chi-doc]
bo_cuc: danh-sach-chi-tiet
ngoai_le_han: [{ tep: "apps/web/src/app/(app)/proto/nhanh-tuc-thi/page.tsx", han: bang-hang-theo-loai-hinh, ly_do: "Trang thử của bộ đồng bộ, gỡ hay chuyển ở hàng 79." }]
---
# Bảng hàng

Bảng hàng trên máy tính và các góc nhìn đã lưu của nó: trang trả `<KhungBangHang title="…">` ở gốc, lưới và thanh công cụ
nằm trong khe `children`. Khối đích `data-grid-editing-6` (`docs/design/vo-va-ia.md` §2, ADR-0004) đã chuyển thể ở
`apps/web/src/app/(app)/inventory/bang-hang.tsx`; nhóm dòng theo cách của `data-grid-grouping-2`.

**Dùng khi** màn trình tập hàng của sàn dạng bảng kiểu Sheet trên máy tính — Bảng hàng, một góc nhìn đã lưu; sau này
trang nhóm môi giới chỉ đọc (mục 44) dùng lại lưới này. Dưới `md` khuôn trao khe `dienThoai`: bảng thẻ của mục 32
(`apps/web/src/app/(app)/inventory/cards/`, chuyển thể `product-grid-4` + `filter-sidebar-5`) ở cùng địa chỉ. **Không dùng**
cho hồ sơ một căn (cột phải, mục 17), hay cho bảng phụ trong màn khác.

## Luật

- **KH-bh-mot-khung** — Một màn là đúng một `Frame` (qua `KhungBangHang`) lấp cột nội dung của vỏ; trang không tự dựng
  `Frame`, `FrameHeader` hay `Card`. Tên góc nhìn đang mở hiện ở nút «Góc nhìn ▾» đầu thanh công cụ, không đổi tiêu đề.
- **KH-bh-tren-may** — Lưới đọc từ kho trên máy (bộ đồng bộ, hàng 13): lọc, nhóm, sắp không gọi mạng; thuộc tính căn
  ghép từ danh mục đã giữ trên máy. Trạng thái đang tải · trống · lỗi · lọc rỗng đi qua `TrangThai`.
- **KH-bh-chi-doc** — Ô có `cellEdit.editable: false` cho tới khi mục 15 (sửa trên ô) mở từng cột; chọn ô và chép luôn
  bật, chữ chép ra là chữ đang hiện.
