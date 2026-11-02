---
nhom: lead-cua-toi
doi_tuong: [lead]
khuon: { ten: KhungLeadCuaToi, nhap: "@/app/(app)/leads/mine/khung" }
nhan_dien: ["apps/web/src/app/(app)/leads/mine/page.tsx", "apps/web/src/app/(app)/today/page.tsx"]
mau_dang_chay: { tep: "apps/web/src/app/(app)/leads/mine/page.tsx", duong: "/leads/mine", trang_thai: [mac-dinh, trong, dang-tai, loi, tra-lai, da-gui-lai, tin-bo-sung] }
khe_bat_buoc: [children]
cam_ngoai_khuon: [Card]
ngoai_le: [{ tep: "apps/web/src/app/(app)/today/page.tsx", ly_do: "Hôm nay theo vai — trang thuộc nhóm hom-nay-dau-chu (khuôn KhungHomNay): vùng đầu chủ là Hôm nay của đầu chủ, vùng telesales dựng qua KhungLeadCuaToi đặt trong KhungHomNay, sau vùng đầu chủ." }]
luat: [KH-lct-mot-khung, KH-lct-khong-hang, KH-lct-ba-trang-thai]
---
# Lead của tôi

Vùng «Lead đã nhập» của telesales (hàng 27, L1 cột phải, L5): lead mình đã nhập, mới nhất trước, với bốn nấc Đã gửi →
Đã nhận → Đã gọi → Lên bảng; lead bị trả lại có ô sửa số và gửi lại; lead căn trùng là tin bổ sung, không theo bốn nấc.
Lối ReUI (`list-11`) được duyệt ở Cổng Phạm vi qua trang ba lối (ADR-0019); khuôn thật `KhungLeadCuaToi` là Frame
stacked của khối ấy, màn mẫu là `/leads/mine`. Hôm nay của telesales hiện cùng vùng (ngoại lệ có lý do: trang theo vai).

**Dùng khi** màn liệt kê lead của chính người nhập và nấc đầu chủ đã tới. **Không dùng** cho Ô nhận lead (nhóm
`o-nhan-lead`) hay Hôm nay của đầu chủ, trưởng nhóm (bảng việc theo nhóm, hàng 22, 42).

## Luật

- **KH-lct-mot-khung** — Vùng là đúng một `Frame` trong khuôn; không `Card`, không Frame lồng Frame.
- **KH-lct-khong-hang** — Telesales không thấy số chủ, mã hàng hay trường nào của hàng: dòng lead chỉ có toà, căn (hay
  «chỉ biết toà»), nhu cầu, giá đã đọc thành câu, đầu chủ nhận, nấc và giờ. Ô sửa số không hiện số cũ.
- **KH-lct-ba-trang-thai** — Vùng có trống (một hành động «+ Lead»), đang tải (`Skeleton` đúng bố cục của lối) và lỗi
  (thử lại); trống và lỗi đi qua `TrangThai`.
