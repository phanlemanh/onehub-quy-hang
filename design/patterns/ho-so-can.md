---
nhom: ho-so-can
doi_tuong: [can, lan-rao, lich-su-hang]
khuon: { ten: KhungHoSoCan, nhap: "@/app/(app)/units/ho-so/khung" }
nhan_dien: ["apps/web/src/app/(app)/proto/cot-ho-so-can/page.tsx"]
mau_dang_chay: { tep: "apps/web/src/app/(app)/proto/cot-ho-so-can/page.tsx", duong: "/proto/cot-ho-so-can", trang_thai: [mac-dinh] }
khe_bat_buoc: [children]
cam_ngoai_khuon: [Card, Placeholder]
ngoai_le: []
luat: [KH-hs-mot-khung, KH-hs-tren-may, KH-hs-khoa-thuoc-tinh]
---
# Hồ sơ căn

Toàn bộ thông tin của một căn (`CONTEXT.md`): trên máy tính mở thành cột phải cạnh Bảng hàng (`/inventory?unit=<mã>`)
hay toàn màn (`/units/<mã>`). Khối đích `solution-crm-4` (`docs/design/vo-va-ia.md` §2); lối dựng chốt ở Cổng Phạm vi
hàng 17 theo trang ba lối (ADR-0019). Màn thật `/units/[code]/page.tsx` vào nhóm khi rời trang tạm ở hàng 17.

**Dùng khi** màn trình hồ sơ một căn: thuộc tính tự điền, lần rao, lịch sử. **Không dùng** cho Bảng hàng (nhóm
`bang-hang`), chế độ cuộc gọi (hàng 28) hay hồ sơ căn của đầu khách trên điện thoại (hàng 33 — khối đích riêng).

## Luật

- **KH-hs-mot-khung** — Hồ sơ một căn là đúng một `Frame` (qua `KhungHoSoCan`); trang không lồng `Card`, không dựng
  `Placeholder`.
- **KH-hs-tren-may** — Hồ sơ đọc kho trên máy (bộ đồng bộ, hàng 13) và danh mục đã giữ trên máy; lịch sử qua
  `useHoSoHang`, mất mạng thì xem bản đã tải.
- **KH-hs-khoa-thuoc-tinh** — Thuộc tính căn từ danh mục là chữ khoá, không ô sửa; sai thì «Báo sai thông tin căn».
