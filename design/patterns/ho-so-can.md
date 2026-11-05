---
nhom: ho-so-can
doi_tuong: [can, lan-rao, lich-su-hang]
khuon: { ten: KhungHoSoCan, nhap: "@/app/(app)/units/ho-so/khung" }
nhan_dien: ["apps/web/src/app/(app)/units/[code]/page.tsx", "apps/web/src/app/(app)/proto/cot-ho-so-can/page.tsx", "apps/web/src/app/(app)/proto/anh-can-ba-ngan/page.tsx", "apps/web/src/app/(app)/proto/ho-so-dien-thoai/page.tsx"]
mau_dang_chay: { tep: "apps/web/src/app/(app)/units/[code]/page.tsx", duong: "/units/A-01.02", trang_thai: [mac-dinh, nhieu-can, khong-co] }
khe_bat_buoc: [children]
cam_ngoai_khuon: [Card, Placeholder]
ngoai_le: []
luat: [KH-hs-mot-khung, KH-hs-tren-may, KH-hs-khoa-thuoc-tinh, KH-hs-anh-noi-bo, KH-hs-lop-phu]
bo_cuc: ho-so
---
# Hồ sơ căn

Toàn bộ thông tin của một căn (`CONTEXT.md`): trên máy tính mở thành cột phải cạnh Bảng hàng (`/inventory?unit=<mã>`)
hay toàn màn (`/units/<mã>`). Khối đích `solution-crm-4` (`docs/design/vo-va-ia.md` §2); lối dựng chốt ở Cổng Phạm vi
hàng 17 theo trang ba lối (ADR-0019): lối ReUI. Cạnh Bảng hàng, hồ sơ là cột kéo chia của bố cục «Danh sách – chi
tiết» (hàng 105, ADR-0024 sửa đổi 05/11; khối `app-shell-11`): cột đứng cạnh bảng, ngoài khung bảng, cao từ đỉnh vùng làm
việc tới đáy, mặc định 38%, kéo 28–50%, bảng co trái và vẫn bấm được — dựng qua `KhungHoSoCan cotPhu`
(`units/ho-so/bang-co-ho-so.tsx`). Cột phải của Hôm nay, đầu chủ vẫn là `KhungHoSoCan cot` trong Frame của Hôm nay. Trang
ba lối `proto/cot-ho-so-can` đi cùng khuôn, gỡ khi màn thật qua Cổng Bằng chứng. Trang ba lối `proto/ho-so-dien-thoai` (Hồ sơ
căn trên điện thoại, `product-detail-5`, hồ sơ ho-so-dien-thoai-product-detail-5) cũng đi cùng khuôn, gỡ khi màn thật ra.

**Dùng khi** màn trình hồ sơ một căn: thuộc tính tự điền, lần rao, lịch sử. **Không dùng** cho Bảng hàng (nhóm
`bang-hang`) hay chế độ cuộc gọi (hàng 28). Hồ sơ căn của Đầu khách trên điện thoại (hàng 33) là **lớp phủ trên cùng
khuôn** này, không phải khối đích riêng; thân điện thoại theo `product-detail-5` (hồ sơ ho-so-dien-thoai-product-detail-5)
cũng đi trong cùng khuôn.

## Luật

- **KH-hs-mot-khung** — Hồ sơ toàn màn dựng trong bố cục Hồ sơ (`<BoCuc kieu="ho-so">`) và là đúng một `Frame` (qua
  `KhungHoSoCan`); ở cột kéo chia cạnh Bảng hàng nó là đúng một `Frame` cao hết cột, thân cuộn riêng (`KhungHoSoCan
  cotPhu`); ở cột phải của Hôm nay nó là một `FramePanel` trong Frame của Hôm nay (`KhungHoSoCan cot`). Không lồng Frame
  trong Frame; không `Card`, không `Placeholder`. Chờ tải và lỗi của hồ sơ nằm trong cột (`ChoTai`, `TrangThai` kèm «Thử
  lại»), bảng bên cạnh vẫn dùng được. Hồ sơ có hai thân dựng từ cùng mô hình thuần (`units/ho-so/mo-hinh.ts`): thân cột
  (`than-cot.tsx`, từ 768 px ở mọi chỗ) và thân điện thoại (`dien-thoai/than-dien-thoai.tsx`, dưới 768 px ở toàn màn và
  trong Bảng hàng thẻ; lối ReUI `product-detail-5`, hồ sơ ho-so-dien-thoai-product-detail-5). Thân không mang khung: cả
  hai nằm trong `KhungHoSoCan` của chỗ gọi; rẽ thân bằng `chonThan` (hàm khổ của Hôm nay điện thoại, một mốc cho kho).
- **KH-hs-tren-may** — Hồ sơ đọc kho trên máy (bộ đồng bộ, hàng 13) và danh mục đã giữ trên máy; lịch sử qua
  `useHoSoHang`, mất mạng thì xem bản đã tải.
- **KH-hs-anh-noi-bo** — Mục Ảnh (hàng 18, `units/photos/`) là ngoại lệ có tên của KH-hs-tren-may: ảnh và danh sách ảnh đọc
  thẳng API, không qua bộ đồng bộ, không vào kho trên máy; ngăn nội bộ API trả no-store. Ẩn ngăn nội bộ do API và luật
  theo dòng quyết — mục chỉ trình điều API trả. Trang bấm được `proto/anh-can-ba-ngan` đi cùng khuôn, gỡ khi màn thật
  qua Cổng Bằng chứng.
- **KH-hs-lop-phu** — Quyền là lớp phủ trên cùng màn (hàng 33): `lopPhuHoSo` ở `packages/core/src/access` trả bốn cờ
  (ngăn Nội bộ, Sẵn sàng bán, sửa ảnh, nút «Hỏi đầu chủ»), không rẽ theo tên vai. Hồ sơ đọc hai cờ Sẵn sàng bán và nút
  hỏi; ngăn Nội bộ và sửa ảnh của mục Ảnh vẫn do API ảnh trả (`noiBo`, `suaDuoc` — KH-hs-anh-noi-bo), cùng luật
  `canSeeSource` / `canSeeUnitInternal` nên khớp hai cờ còn lại. Người không thấy nguồn: không thẻ Nội bộ, không ổ khoá;
  nút «Hỏi đầu chủ» dính đáy chỉ mở bảng chia sẻ của máy. Thân điện thoại: ảnh lớn đầu màn đọc đúng đường của mục Ảnh và
  chỉ trình ảnh Nội bộ khi cả cờ `noiBo` của lõi lẫn API cho; nút chính dính đáy chọn bằng `nutChinh` — người không thấy
  nguồn «Hỏi đầu chủ», người thấy nguồn «Ghi cuộc gọi» (`/units/call?hang=<id>`), căn chưa có mã không nút.
- **KH-hs-khoa-thuoc-tinh** — Thuộc tính căn từ danh mục là chữ khoá, không ô sửa; sai thì «Báo sai thông tin căn».
