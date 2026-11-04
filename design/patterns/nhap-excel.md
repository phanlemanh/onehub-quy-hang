---
nhom: nhap-excel
doi_tuong: [lan-nhap]
khuon: { ten: KhungNhap, nhap: "@/app/(app)/imports/khung" }
nhan_dien: ["apps/web/src/app/(app)/proto/man-nhap-excel/page.tsx"]
mau_dang_chay: { tep: "apps/web/src/app/(app)/proto/man-nhap-excel/page.tsx", duong: "/proto/man-nhap-excel", trang_thai: [mac-dinh] }
khe_bat_buoc: [children]
cam_ngoai_khuon: [Card, FrameFooter]
ngoai_le: []
luat: [KH-nx-mot-luong, KH-nx-trang-thai, KH-nx-so-tu-may-chu]
bo_cuc: luong-nhieu-buoc
---
# Nhập Excel

Màn đưa căn từ một tệp bảng tính vào Quỹ hàng (hàng man-nhap-excel, 65b): trang trả `<KhungNhap>…</KhungNhap>` ở gốc, bố
cục «Luồng nhiều bước» (ADR-0024), thân là khung năm bước chuyển thể từ khối đích `solution-crm-6`
(`docs/design/vo-va-ia.md` §2) ở `components/khoi/solution-crm-6/`. Trang ba lối `proto/man-nhap-excel` đi cùng khuôn, gỡ
khi màn thật qua Cổng Bằng chứng; màn thật `imports/new` vào `nhan_dien` ở bước thi công.

**Dùng khi** màn đưa nhiều bản ghi từ một tệp vào Quỹ hàng qua các bước có xem trước. **Không dùng** cho xuất bảng hàng
hay sửa hàng loạt trên Bảng hàng.

## Luật

- **KH-nx-mot-luong** — Màn là đúng một khung năm bước (`KhungBuoc`) trong `KhungNhap`; không lồng `Card`, không tự dựng
  chân khung ngoài khung bước.
- **KH-nx-trang-thai** — Tệp rỗng, tệp lỗi, lỗi mạng và vai không có quyền đi qua `TrangThai` ở khe `rong`/`loi` của
  khuôn, không dựng tay trong bước.
- **KH-nx-so-tu-may-chu** — Con số «căn mới · cập nhật · tin bổ sung · bỏ» và lý do từng dòng trên màn là con số máy chủ trả
  ở bản xem thử; màn không tự đếm hành động dòng.
