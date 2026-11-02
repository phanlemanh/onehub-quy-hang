---
nhom: cuoc-goi
doi_tuong: [lead, can, lan-rao]
khuon: { ten: KhungCuocGoi, nhap: "@/app/(app)/units/call/khung" }
nhan_dien: ["apps/web/src/app/(app)/units/call/page.tsx"]
mau_dang_chay: { tep: "apps/web/src/app/(app)/units/call/page.tsx", duong: "/units/call", trang_thai: [mac-dinh] }
khe_bat_buoc: [children]
cam_ngoai_khuon: [Card, Placeholder]
ngoai_le: []
luat: [KH-cg-mot-khung, KH-cg-tren-may, KH-cg-phim, KH-cg-khong-nguon]
bo_cuc: ho-so
---
# Chế độ cuộc gọi

Màn đầu chủ dùng trong lúc nói chuyện với chủ nhà, hai chế độ trên một trang: khai thác một lead (`/units/call?lead=`, hàng
28, KD1) và ép giá một căn đang bán (`/units/call?hang=`, hàng 29, KD2). Bố cục «Hồ sơ» của ADR-0024 (Cổng Phạm vi hàng 29,
Hỏi-1): đầu màn rồi thân một cột — khuôn `KhungCuocGoi` dựng `BoCuc kieu="ho-so"` và đúng một Frame; khối ép giá ở
`units/call/push/`.

**Dùng khi** màn ghi những gì nghe được trong một cuộc gọi về một lead hay một căn — khai thác (28), ép giá (29), quay số
(30). **Không dùng** cho hồ sơ căn (nhóm `ho-so-can`), Hôm nay (nhóm `hom-nay-dau-chu`) hay bản điện thoại K1–K4.

## Luật

- **KH-cg-mot-khung** — Màn dựng qua `KhungCuocGoi` (bố cục «Hồ sơ», đúng một `Frame`); mỗi vùng là một `FramePanel` xếp
  dọc; không `Card`, không `Placeholder`, không lồng Frame.
- **KH-cg-tren-may** — Hồ sơ căn đọc và ghi qua bộ đồng bộ trên máy (hàng 13): mỗi lựa chọn hay kết quả gọi là một sự
  kiện, mất mạng vẫn ghi; mức đủ tính bằng `completeness` của lõi trên bản trên máy. Lead đọc thẳng API.
- **KH-cg-phim** — Đi được bằng phím: danh sách hỏi (Tab nhóm, số chọn, Delete xoá), kết quả gọi (H · G · B · K, 1–3 ở «Đã
  cọc / bán…»), Ctrl+Enter về Hôm nay; phím không bắt khi con trỏ ở ô chữ.
- **KH-cg-khong-nguon** — Màn không hiện số chủ nhà, ảnh sổ (bất biến 2); giá đáy chỉ đọc thẳng đường chủ nhà của hàng cho
  người thấy nguồn, không lưu trên máy.
