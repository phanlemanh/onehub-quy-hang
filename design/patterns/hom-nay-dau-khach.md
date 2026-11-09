---
nhom: hom-nay-dau-khach
doi_tuong: [tin, lan-gui, luot-mo, can-moi]
khuon: { ten: KhungTinKhach, nhap: "@/app/(app)/shares/tin/khung" }
nhan_dien: ["apps/web/src/app/(app)/shares/tin/page.tsx"]
mau_dang_chay: { tep: "apps/web/src/app/(app)/shares/tin/page.tsx", duong: "/shares/tin", trang_thai: [dang-tai, trong, loi, co-tin] }
khe_bat_buoc: [children]
cam_ngoai_khuon: [Card]
ngoai_le: []
luat: [KH-hndk-dong-tin, KH-hndk-khong-nguon, KH-hndk-cham-thang, KH-hndk-bon-trang-thai]
bo_cuc: dong-tin
---
# Tin của khách

Mục «Tin của khách» ở Đã gửi (hàng 37, dời từ Hôm nay ở hồ sơ hom-nay-mot-danh-sach-viec, Tham chiếu §10): tin 7 ngày về các link chính người xem đã gửi, nhóm theo ngày giờ
Việt Nam — «Khách phản ứng» (khách mở link, chạm «Quan tâm»), «Vừa đổi» (căn trong link còn mở đổi giá rao hay trạng thái),
«Căn mới» (căn lên Đang bán khớp bộ đã gửi). Khối đích `solution-crm-5` (`docs/design/vo-va-ia.md` §2 «Hôm nay, đầu
khách»); lối ReUI chốt ở Cổng Phạm vi hàng 37 qua trang ba lối (`_acceptance/hom-nay-dau-khach/ba-loi/`), chuyển thể ở
`shares/tin/dong-tin.tsx`: bỏ lọc theo loại và theo người, phần gấp mở thành chạm thẳng. Trong 48 giờ đầu mỗi tin cũng là một việc ở Hôm nay.

**Dùng khi** màn liệt tin theo ngày về việc người xem đã làm, mỗi tin một lối đi tiếp. **Không dùng** cho Đã gửi (nhóm
`da-gui`) hay hàng đợi việc của đầu chủ (nhóm `hom-nay-dau-chu`).

## Luật

- **KH-hndk-dong-tin** — Trang trả đúng một `KhungTinKhach`; tin nhóm theo ngày, mỗi tin một `Frame` của khối trên mốc
  thời gian dọc; khuôn không thêm Frame, không `Card`.
- **KH-hndk-khong-nguon** — Vùng chỉ đọc `GET /api/v1/today/buyer`: không trường lớp `source`, không số khách.
- **KH-hndk-cham-thang** — Tin phản ứng và vừa đổi mở `/shares?lan=<id>`; tin căn mới mở `/shares/new?can=<id>`; máy không gửi
  gì — người tự bấm gửi (bất biến 3).
- **KH-hndk-bon-trang-thai** — Đang tải dùng `ChoTai` của bố cục Dòng tin; trống («Chưa có gì mới trong 7 ngày» + «Gửi căn»)
  và lỗi tải («Chưa tải được — thử lại» + «Thử lại») đi qua `TrangThai`.
