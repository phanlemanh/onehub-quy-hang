---
nhom: ho-so-can
doi_tuong: [can, lan-rao, lich-su-hang]
khuon: { ten: KhungHoSoCan, nhap: "@/app/(app)/units/ho-so/khung" }
nhan_dien: ["apps/web/src/app/(app)/units/[code]/page.tsx", "apps/web/src/app/(app)/proto/cot-ho-so-can/page.tsx", "apps/web/src/app/(app)/proto/anh-can-ba-ngan/page.tsx"]
mau_dang_chay: { tep: "apps/web/src/app/(app)/units/[code]/page.tsx", duong: "/units/A-01.02", trang_thai: [mac-dinh, nhieu-can, khong-co] }
khe_bat_buoc: [children]
cam_ngoai_khuon: [Card, Placeholder]
ngoai_le: []
luat: [KH-hs-mot-khung, KH-hs-tren-may, KH-hs-khoa-thuoc-tinh, KH-hs-anh-noi-bo]
bo_cuc: ho-so
ngoai_le_han: [{ tep: "apps/web/src/app/(app)/units/[code]/page.tsx", han: ho-so-can-dien-thoai, ly_do: "Hồ sơ căn chuyển sang bố cục Hồ sơ ở hàng 33." }, { tep: "apps/web/src/app/(app)/proto/cot-ho-so-can/page.tsx", han: ho-so-can-dien-thoai, ly_do: "Hồ sơ căn chuyển sang bố cục Hồ sơ ở hàng 33." }, { tep: "apps/web/src/app/(app)/proto/anh-can-ba-ngan/page.tsx", han: ho-so-can-dien-thoai, ly_do: "Hồ sơ căn chuyển sang bố cục Hồ sơ ở hàng 33." }]
---
# Hồ sơ căn

Toàn bộ thông tin của một căn (`CONTEXT.md`): trên máy tính mở thành cột phải cạnh Bảng hàng (`/inventory?unit=<mã>`)
hay toàn màn (`/units/<mã>`). Khối đích `solution-crm-4` (`docs/design/vo-va-ia.md` §2); lối dựng chốt ở Cổng Phạm vi
hàng 17 theo trang ba lối (ADR-0019): lối ReUI. Cột phải của Bảng hàng dựng qua `KhungHoSoCan cot` trong Frame của
Bảng hàng (`units/ho-so/bang-co-ho-so.tsx`); trang ba lối `proto/cot-ho-so-can` đi cùng khuôn, gỡ khi màn thật qua Cổng
Bằng chứng.

**Dùng khi** màn trình hồ sơ một căn: thuộc tính tự điền, lần rao, lịch sử. **Không dùng** cho Bảng hàng (nhóm
`bang-hang`), chế độ cuộc gọi (hàng 28) hay hồ sơ căn của đầu khách trên điện thoại (hàng 33 — khối đích riêng).

## Luật

- **KH-hs-mot-khung** — Hồ sơ toàn màn là đúng một `Frame` (qua `KhungHoSoCan`); ở cột phải nó là một `FramePanel`
  trong Frame của Bảng hàng (`KhungHoSoCan cot`), không lồng Frame trong Frame; không `Card`, không `Placeholder`.
- **KH-hs-tren-may** — Hồ sơ đọc kho trên máy (bộ đồng bộ, hàng 13) và danh mục đã giữ trên máy; lịch sử qua
  `useHoSoHang`, mất mạng thì xem bản đã tải.
- **KH-hs-anh-noi-bo** — Mục Ảnh (hàng 18, `units/photos/`) là ngoại lệ có tên của KH-hs-tren-may: ảnh và danh sách ảnh đọc
  thẳng API, không qua bộ đồng bộ, không vào kho trên máy; ngăn nội bộ API trả no-store. Ẩn ngăn nội bộ do API và luật
  theo dòng quyết — mục chỉ trình điều API trả. Trang bấm được `proto/anh-can-ba-ngan` đi cùng khuôn, gỡ khi màn thật
  qua Cổng Bằng chứng.
- **KH-hs-khoa-thuoc-tinh** — Thuộc tính căn từ danh mục là chữ khoá, không ô sửa; sai thì «Báo sai thông tin căn».
