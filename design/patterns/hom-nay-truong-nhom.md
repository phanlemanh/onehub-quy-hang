---
nhom: hom-nay-truong-nhom
doi_tuong: [lead, dau-chu, hang-cu]
khuon: { ten: KhungTruongNhom, nhap: "@/app/(app)/today/khung" }
nhan_dien: ["apps/web/src/app/(app)/today/truong-nhom.tsx", "apps/web/src/app/(app)/today/page.tsx"]
mau_dang_chay: { tep: "apps/web/src/app/(app)/today/truong-nhom.tsx", duong: "/today", trang_thai: [dang-tai, mac-dinh, trong, loi, mat-mang, giao-loi] }
khe_bat_buoc: [children]
cam_ngoai_khuon: [Card]
ngoai_le: [{ tep: "apps/web/src/app/(app)/today/page.tsx", ly_do: "Hôm nay theo vai — trang thuộc nhóm hom-nay-dau-chu (khuôn KhungHomNay): vùng trưởng nhóm dựng qua KhungTruongNhom đặt trong KhungHomNay, trên vùng đầu chủ." }]
luat: [KH-hntn-theo-vai, KH-hntn-ba-o, KH-hntn-giao-lai, KH-hntn-hang-cu, KH-hntn-sau-trang-thai, KH-hntn-may-tinh]
bo_cuc: bang-dieu-khien
---
# Hôm nay của trưởng nhóm

Vùng mở app của vai Trưởng nhóm (hàng 42, Tham chiếu §10, ADR-0024 bố cục Bảng điều khiển): ba ô số, hàng đợi lead quá
hạn và ngoại lệ kèm nút «Giao lại», bảng theo đầu chủ có thanh tỉ lệ tươi. Lối ReUI chốt ở Cổng Phạm vi hàng 42 qua trang
ba lối (ADR-0019; ảnh ở `_acceptance/hom-nay-truong-nhom/ba-loi/`): khối `dashboard-6` bỏ biểu đồ, chuyển thể ở
`components/khoi/dashboard-6`, dựng ở `today/truong-nhom.tsx`. Khuôn `KhungTruongNhom` là vùng đặt trong `KhungHomNay`
của `/today` — một trang, một bố cục.

**Dùng khi** màn trình cho người điều phối một nhóm đầu chủ: số việc quá hạn, việc chưa chia được và hàng cũ theo người,
kèm việc làm ngay. **Không dùng** cho hàng đợi việc của một người (nhóm `hom-nay-dau-chu`), phễu và tốc độ theo người
(trang Đội), hay bản điện thoại.

## Luật

- **KH-hntn-theo-vai** — Vùng xếp bằng hàm thuần `vungTheoVai` (`today/truong-nhom-trang-thai.ts`): trưởng nhóm thấy vùng
  này trên cùng; người có cả vai Đầu chủ thấy hàng đợi của mình dưới (gate1, Hỏi-2).
- **KH-hntn-ba-o** — Ba ô giữ cứng: «Lead quá hạn» = dòng `accept_overdue` hay `first_call_overdue` của hàng đợi;
  «Ngoại lệ» = dòng `unrouted` (lead chưa chia được); «Hàng cũ» = `tongCanGoiLai` của lõi.
- **KH-hntn-giao-lai** — «Giao lại» mở chọn đầu chủ (Popover + Command đã cài): người nghỉ có nhãn «Đang nghỉ», số lead
  mở cạnh tên, Enter giao, Esc đóng; giao xong đọc lại hàng đợi; lỗi thì dòng ở lại, câu lỗi máy chủ dưới dòng.
- **KH-hntn-hang-cu** — Bảng theo người đếm bằng `hangCuTheoNguoi` trên căn của kho trên máy, chỉ căn toàn sàn, dòng
  «Chỉ tính căn toàn sàn» dưới bảng; tên khớp danh sách đầu chủ theo mã, người không có trong danh sách hiện mã ngắn.
- **KH-hntn-sau-trang-thai** — Sáu trạng thái dựng từ hàm thuần `trangThaiTruongNhom`, chữ đúng bảng ST-hntn-*: đang tải
  là `ChoTai` của bố cục Bảng điều khiển; lỗi, mất mạng đi qua `TrangThai`; mất mạng giữ số lần đọc cuối và tắt nút giao.
- **KH-hntn-may-tinh** — Khổ dưới `md` khuôn thay bảng điều khiển bằng một dòng «Hôm nay của trưởng nhóm mở trên máy
  tính»; vùng khác của `/today` vẫn hiện.
