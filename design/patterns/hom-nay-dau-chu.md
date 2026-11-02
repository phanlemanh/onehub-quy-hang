---
nhom: hom-nay-dau-chu
doi_tuong: [hang-doi, can, lead]
khuon: { ten: KhungHomNay, nhap: "@/app/(app)/today/khung" }
nhan_dien: ["apps/web/src/app/(app)/today/page.tsx", "apps/web/src/app/(app)/proto/hom-nay-dau-chu/page.tsx"]
mau_dang_chay: { tep: "apps/web/src/app/(app)/today/page.tsx", duong: "/today", trang_thai: [mac-dinh, trong, dang-tai, loi, mat-mang] }
khe_bat_buoc: [children]
cam_ngoai_khuon: [Card]
ngoai_le: []
luat: [KH-hn-theo-vai, KH-hn-mot-khung, KH-hn-bo-nhom, KH-hn-tren-may, KH-hn-ba-trang-thai]
---
# Hôm nay của đầu chủ

Màn mở app của vai Đầu chủ (hàng 22, Tham chiếu §8 luật 18, §10): các hàng đợi theo bộ nhóm của sàn — mặc định Lead mới
· Nên gọi điều chỉnh giá · Cần gọi lại · Thiếu thông tin · Mới đổi — mỗi căn đúng một nhóm, lý do bằng chữ, kết quả gọi
một chạm. Khối đích `data-grid-grouping-1` (`docs/design/vo-va-ia.md` §2); lối ReUI chốt ở Cổng Phạm vi hàng 22 qua trang
ba lối (ADR-0019), dựng trên thành phần `data-grid` đã cài ở `today/hom-nay-dau-chu.tsx`. Khuôn `KhungHomNay` là cột các
vùng của `/today` xếp theo vai; trang ba lối `proto/hom-nay-dau-chu` đi cùng khuôn, gỡ khi màn thật qua Cổng Bằng chứng.

**Dùng khi** màn trình hàng đợi việc của một người theo bộ nhóm của sàn. **Không dùng** cho Bảng hàng (nhóm
`bang-hang`), vùng Lead đã nhập của telesales (nhóm `lead-cua-toi` — đặt vào khuôn này ở `/today`), Hôm nay của trưởng
nhóm (hàng 42) hay bản điện thoại (hàng 39).

## Luật

- **KH-hn-theo-vai** — `/today` trả đúng một `KhungHomNay`; trong đó vùng Hôm nay của đầu chủ (vai `listing_agent`) đứng
  trước vùng Lead đã nhập (`telesales`, qua `KhungLeadCuaToi`); người không có vai nào trong hai thấy `Placeholder` trong
  khuôn tới hàng 42.
- **KH-hn-mot-khung** — Mỗi vùng là đúng một `Frame` stacked; khuôn không thêm Frame, không `Card`; cột hồ sơ căn mở cạnh
  lưới là `KhungHoSoCan cot` trong Frame của vùng, không lồng Frame trong Frame.
- **KH-hn-bo-nhom** — Nhóm, tên, thứ tự, nút của dòng đọc từ bộ nhóm đang áp (`@quy-hang/core/today`), không viết chết ở
  màn; nhóm rỗng hay tắt không hiện; lý do bằng chữ dựng ở `today/ly-do.ts`.
- **KH-hn-tren-may** — Căn đọc từ kho trên máy (bộ đồng bộ, hàng 13), «Còn · giữ giá» ghi trên máy trước; bộ nhóm đọc được
  thì lưu trên máy theo sàn, mất mạng hay lỗi đọc thì chia theo bộ đã lưu và nói giờ lưu, chưa từng lưu thì bộ mặc định
  kèm chữ báo.
- **KH-hn-ba-trang-thai** — Vùng có trống («Hôm nay không còn việc» và một hành động mở Bảng hàng), đang tải (`Skeleton`
  đúng bố cục nhóm) và lỗi tải lead (nói nguyên nhân, «Thử lại», nhóm căn vẫn hiện); trống, lỗi và báo đi qua `TrangThai`.
