---
nhom: hom-nay-dau-chu
doi_tuong: [hang-doi, can, lead]
khuon: { ten: KhungHomNay, nhap: "@/app/(app)/today/khung" }
nhan_dien: ["apps/web/src/app/(app)/today/page.tsx"]
mau_dang_chay: { tep: "apps/web/src/app/(app)/today/page.tsx", duong: "/today", trang_thai: [mac-dinh, trong, dang-tai, loi, mat-mang] }
khe_bat_buoc: [children]
cam_ngoai_khuon: [Card]
ngoai_le: []
luat: [KH-hn-theo-vai, KH-hn-mot-khung, KH-hn-bo-nhom, KH-hn-tren-may, KH-hn-ba-trang-thai]
bo_cuc: tran
---
# Hôm nay của đầu chủ

Màn mở app của vai Đầu chủ (hàng 22, Tham chiếu §8 luật 18, §10): các hàng đợi theo bộ nhóm của sàn — mặc định Lead mới
· Nên gọi điều chỉnh giá · Cần gọi lại · Thiếu thông tin · Mới đổi — mỗi căn đúng một nhóm, lý do bằng chữ, kết quả gọi
một chạm. Khối đích `solution-agents-2` cộng ô hạn của `data-grid-base-5` (quyết định 14A của chủ kho 02/11,
`docs/design/vo-va-ia.md` §2; dựng ở hàng 92): mỗi dòng bốn cột Việc · Vì sao hôm nay (hai tầng: lý do chữ đậm, hạn đỏ khi
quá, vàng khi còn dưới 15 phút) · Giá · Hành động — đúng một nút viền cùng bề rộng là việc đầu của nhóm, việc còn lại trong
⋯ (`components/khoi/solution-agents-2/o-dong.tsx`, bảng nút ở `today/viec-dong.ts`). Khuôn `KhungHomNay` là cột các vùng
của `/today` xếp theo vai trong bố cục Tràn (`BoCuc kieu="tran"`, ADR-0024); trang ba lối của hàng 22 đã gỡ (luật đợt 45).

**Dùng khi** màn trình hàng đợi việc của một người theo bộ nhóm của sàn. **Không dùng** cho Bảng hàng (nhóm
`bang-hang`), vùng Lead đã nhập của telesales (nhóm `lead-cua-toi` — đặt vào khuôn này ở `/today`), Hôm nay của trưởng
nhóm (nhóm `hom-nay-truong-nhom` — đặt vào khuôn này ở `/today`, trên vùng đầu chủ) hay bản điện thoại (hàng 39).

## Luật

- **KH-hn-theo-vai** — `/today` trả đúng một `KhungHomNay`; vùng xếp bằng `vungTheoVai`: Hôm nay của trưởng nhóm
  (`team_lead`, qua `KhungTruongNhom`) trên cùng, rồi Hôm nay của đầu chủ (vai `listing_agent`), rồi vùng Lead đã nhập
  (`telesales`, qua `KhungLeadCuaToi`); người không có vai nào trong ba thấy `Placeholder` trong khuôn.
- **KH-hn-mot-khung** — Mỗi vùng là đúng một `Frame` stacked; khuôn không thêm Frame, không `Card`; cột hồ sơ căn mở cạnh
  lưới là `KhungHoSoCan cot` trong Frame của vùng, không lồng Frame trong Frame.
- **KH-hn-bo-nhom** — Nhóm, tên, thứ tự, nút của dòng đọc từ bộ nhóm đang áp (`@quy-hang/core/today`), không viết chết ở
  màn; nhóm rỗng hay tắt không hiện; lý do bằng chữ dựng ở `today/ly-do.ts`.
- **KH-hn-tren-may** — Căn đọc từ kho trên máy (bộ đồng bộ, hàng 13), «Còn · giữ giá» ghi trên máy trước; bộ nhóm đọc được
  thì lưu trên máy theo sàn, mất mạng hay lỗi đọc thì chia theo bộ đã lưu và nói giờ lưu, chưa từng lưu thì bộ mặc định
  kèm chữ báo.
- **KH-hn-ba-trang-thai** — Vùng có trống («Hôm nay không còn việc» và một hành động mở Bảng hàng), đang tải (`ChoTai`
  của bố cục Tràn) và lỗi tải lead (nói nguyên nhân, «Thử lại», nhóm căn vẫn hiện); trống, lỗi và báo đi qua `TrangThai`.
