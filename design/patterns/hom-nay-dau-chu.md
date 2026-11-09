---
nhom: hom-nay-dau-chu
doi_tuong: [hang-doi, can, lead]
khuon: { ten: KhungHomNay, nhap: "@/app/(app)/today/khung" }
nhan_dien: ["apps/web/src/app/(app)/today/page.tsx"]
mau_dang_chay: { tep: "apps/web/src/app/(app)/today/page.tsx", duong: "/today", trang_thai: [mac-dinh, trong, dang-tai, loi, mat-mang] }
khe_bat_buoc: [children]
cam_ngoai_khuon: [Card]
ngoai_le: []
luat: [KH-hn-theo-vai, KH-hn-mot-khung, KH-hn-bo-nhom, KH-hn-tren-may, KH-hn-ba-trang-thai, KH-hn-dien-thoai]
bo_cuc: tran
---
# Hôm nay

Màn mở app của vai Đầu chủ (hàng 22, Tham chiếu §8 luật 18, §10): các hàng đợi theo bộ nhóm của sàn — mặc định Lead mới
· Nên gọi điều chỉnh giá · Cần gọi lại · Thiếu thông tin · Mới đổi — mỗi căn đúng một nhóm, lý do bằng chữ, kết quả gọi
một chạm. Khối đích `solution-agents-2` cộng ô hạn của `data-grid-base-5` (quyết định 14A của chủ kho 02/11,
`docs/design/vo-va-ia.md` §2; dựng ở hàng 92): mỗi dòng bốn cột Việc · Vì sao hôm nay (hai tầng: lý do chữ đậm, hạn đỏ khi
quá, vàng khi còn dưới 15 phút) · Giá · Hành động — đúng một nút viền cùng bề rộng là việc đầu của nhóm, việc còn lại trong
⋯ (`components/khoi/solution-agents-2/o-dong.tsx`, bảng nút ở `today/viec-dong.ts`). Từ hồ sơ hom-nay-mot-danh-sach-viec màn này là danh sách việc của mọi vai (`today/hom-nay.tsx`, gộp ở `today/viec/gop-viec.ts`). Khuôn `KhungHomNay` đặt danh sách
trong bố cục Tràn (`BoCuc kieu="tran"`, ADR-0024); trang ba lối của hàng 22 đã gỡ (luật đợt 45).

**Dùng khi** màn trình việc của một người, mọi vai cùng một kiểu dòng. **Không dùng** cho Bảng hàng (nhóm `bang-hang`), Lead
đã nhập (nhóm `lead-cua-toi`), nhà Đội (nhóm `hom-nay-truong-nhom`), tin 7 ngày (nhóm `hom-nay-dau-khach`). Bản điện thoại
(hàng 39) nằm trong khuôn này — luật `KH-hn-dien-thoai`.

## Luật

- **KH-hn-theo-vai** — `/today` trả đúng một `KhungHomNay` chứa một danh sách việc; nhóm theo vai người xem: của trưởng nhóm
  trước, bộ nhóm đầu chủ giữ thứ tự của sàn, rồi telesales, đầu khách. Người chỉ giữ vai Quản trị về Cài đặt sàn.
- **KH-hn-mot-khung** — Danh sách là đúng một `Frame` stacked; khuôn không thêm Frame, không `Card`; cột hồ sơ căn mở cạnh
  lưới là `KhungHoSoCan cot` trong Frame của vùng, không lồng Frame trong Frame.
- **KH-hn-bo-nhom** — Nhóm, tên, thứ tự, nút của dòng đọc từ bộ nhóm đang áp (`@quy-hang/core/today`), không viết chết ở
  màn; nhóm rỗng hay tắt không hiện; lý do bằng chữ dựng ở `today/ly-do.ts`.
- **KH-hn-tren-may** — Căn đọc từ kho trên máy (bộ đồng bộ, hàng 13), «Còn · giữ giá» ghi trên máy trước; bộ nhóm đọc được
  thì lưu trên máy theo sàn, mất mạng hay lỗi đọc thì chia theo bộ đã lưu và nói giờ lưu, chưa từng lưu thì bộ mặc định
  kèm chữ báo.
- **KH-hn-ba-trang-thai** — Vùng có trống («Hôm nay không còn việc» và một hành động mở Bảng hàng), đang tải (`ChoTai`
  của bố cục Tràn) và lỗi từng nguồn (một dòng nêu nguồn, «Thử lại», nhóm khác vẫn hiện, tự đọc lại khi có mạng); trống, lỗi và báo đi qua `TrangThai`.
- **KH-hn-dien-thoai** — Dưới 768 px vùng đầu chủ dựng danh sách thẻ (`today/mobile/danh-sach.tsx`) thay lưới, trong cùng
  `FramePanel` của vùng: cùng nhóm, cùng thứ tự, cùng bộ việc (`today/mobile/goi.ts` đọc `viec-dong.ts`); thẻ hai tầng
  `OHaiTang`, một nút ở mép phải, ⋯ và «Kết quả cuộc gọi» là ngăn đáy qua `NganNoi` với dòng chạm `Item` (hàng 39).
