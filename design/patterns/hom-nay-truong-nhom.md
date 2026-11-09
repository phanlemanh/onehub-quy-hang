---
nhom: hom-nay-truong-nhom
doi_tuong: [lead, dau-chu, hang-cu]
khuon: { ten: KhungDoi, nhap: "@/app/(app)/team/khung" }
nhan_dien: ["apps/web/src/app/(app)/team/page.tsx"]
mau_dang_chay: { tep: "apps/web/src/app/(app)/team/page.tsx", duong: "/team", trang_thai: [dang-tai, mac-dinh, trong, loi, mat-mang] }
khe_bat_buoc: [children]
cam_ngoai_khuon: [Card]
ngoai_le: []
luat: [KH-hntn-theo-vai, KH-hntn-ba-o, KH-hntn-giao-lai, KH-hntn-hang-cu, KH-hntn-sau-trang-thai, KH-hntn-may-tinh]
bo_cuc: bang-dieu-khien
---
# Đội

Nhà Đội của vai Trưởng nhóm (hàng 42, dời từ Hôm nay ở hồ sơ hom-nay-mot-danh-sach-viec; ADR-0024 bố cục Bảng điều khiển): ba ô số
và bảng theo đầu chủ có thanh tỉ lệ tươi. Khối `dashboard-6` bỏ biểu đồ, chuyển thể ở `components/khoi/dashboard-6`, dựng ở
`team/dashboard.tsx`; phần cấp trang (đường dẫn, bề rộng) thuộc bố cục. Việc giao lại ở Hôm nay.

**Dùng khi** màn trình cho người điều phối một nhóm đầu chủ: số việc quá hạn, việc chưa chia được và hàng cũ theo người,
kèm việc làm ngay. **Không dùng** cho hàng đợi việc của một người (nhóm `hom-nay-dau-chu`), phễu và tốc độ theo người
(trang Đội), hay bản điện thoại.

## Luật

- **KH-hntn-theo-vai** — Trang chỉ cho vai có nhà Đội; vai khác không vào được.
- **KH-hntn-ba-o** — Ba ô giữ cứng: «Lead quá hạn» = dòng `accept_overdue` hay `first_call_overdue` của hàng đợi;
  «Ngoại lệ» = dòng `unrouted` (lead chưa chia được); «Hàng cũ» = `tongCanGoiLai` của lõi.
- **KH-hntn-giao-lai** — Trang này không giao lại: «Giao lại» là việc trên dòng ở Hôm nay (`today/viec/giao-lai.tsx`).
- **KH-hntn-hang-cu** — Bảng theo người đếm bằng `hangCuTheoNguoi` trên căn của kho trên máy, chỉ căn toàn sàn, dòng
  «Chỉ tính căn toàn sàn» dưới bảng; tên khớp danh sách đầu chủ theo mã, người không có trong danh sách hiện «Chưa rõ tên»; nhãn số đầu chủ bằng số dòng của bảng.
- **KH-hntn-sau-trang-thai** — Sáu trạng thái dựng từ hàm thuần `trangThaiTruongNhom`, chữ đúng bảng ST-hntn-*: đang tải
  là `ChoTai` của bố cục Bảng điều khiển; lỗi, mất mạng đi qua `TrangThai`; mất mạng giữ số lần đọc cuối và tắt nút giao.
- **KH-hntn-may-tinh** — Nhà Đội chỉ có trên máy tính (Tham chiếu §9).