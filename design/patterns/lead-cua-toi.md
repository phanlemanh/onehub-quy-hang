---
nhom: lead-cua-toi
doi_tuong: [lead]
khuon: { ten: KhungLeadCuaToi, nhap: "@/app/(app)/proto/lead-bon-nac/_chung/khung" }
nhan_dien: ["apps/web/src/app/(app)/proto/lead-bon-nac/trong-kho/page.tsx", "apps/web/src/app/(app)/proto/lead-bon-nac/reui/page.tsx", "apps/web/src/app/(app)/proto/lead-bon-nac/ve-moi/page.tsx"]
mau_dang_chay: { tep: "apps/web/src/app/(app)/proto/lead-bon-nac/reui/page.tsx", duong: "/proto/lead-bon-nac/reui", trang_thai: [mac-dinh, trong, dang-tai, loi, tra-lai, da-gui-lai, tin-bo-sung] }
khe_bat_buoc: [children]
cam_ngoai_khuon: [Card]
ngoai_le: []
luat: [KH-lct-mot-khung, KH-lct-khong-hang, KH-lct-ba-trang-thai]
---
# Lead của tôi

Vùng «Lead đã nhập» của telesales (hàng 27, L1 cột phải, L5): lead mình đã nhập, mới nhất trước, với bốn nấc Đã gửi →
Đã nhận → Đã gọi → Lên bảng; lead bị trả lại có ô sửa số và gửi lại; lead căn trùng là tin bổ sung, không theo bốn nấc.
Màn đầu của nhóm mới — đi trang ba lối (ADR-0019): ba trang mẫu dưới `proto/lead-bon-nac/` (Trong kho · ReUI · Vẽ mới)
cùng dựng khuôn tạm `KhungLeadCuaToi`; màn mẫu là lối máy khuyên. Ký Cổng Phạm vi xong thì khuôn thật (Frame của lối
được duyệt) thay khuôn tạm, màn thật vào `nhan_dien`, ba trang mẫu rời nhóm.

**Dùng khi** màn liệt kê lead của chính người nhập và nấc đầu chủ đã tới. **Không dùng** cho Ô nhận lead (nhóm
`o-nhan-lead`) hay Hôm nay của đầu chủ, trưởng nhóm (bảng việc theo nhóm, hàng 22, 42).

## Luật

- **KH-lct-mot-khung** — Vùng là đúng một `Frame` trong khuôn; không `Card`, không Frame lồng Frame.
- **KH-lct-khong-hang** — Telesales không thấy số chủ, mã hàng hay trường nào của hàng: dòng lead chỉ có toà, căn (hay
  «chỉ biết toà»), nhu cầu, giá đã đọc thành câu, đầu chủ nhận, nấc và giờ. Ô sửa số không hiện số cũ.
- **KH-lct-ba-trang-thai** — Vùng có trống (một hành động «+ Lead»), đang tải (`Skeleton` đúng bố cục của lối) và lỗi
  (thử lại); trống và lỗi đi qua `TrangThai`.
