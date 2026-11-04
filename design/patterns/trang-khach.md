---
nhom: trang-khach
doi_tuong: [lan-gui, can]
khuon: { ten: KhungTrangKhach, nhap: "@/app/s/[code]/khung" }
nhan_dien: ["apps/web/src/app/s/**/page.tsx"]
mau_dang_chay: { tep: "apps/web/src/app/s/[code]/page.tsx", duong: "/s/<mã>", trang_thai: [bo-can, da-coc, tam-ngung, chi-tiet, da-bao-quan-tam, link-tat] }
khe_bat_buoc: [children]
cam_ngoai_khuon: [Frame, FrameHeader, FramePanel, BoCuc]
ngoai_le: []
luat: [KH-tk-khong-vo, KH-tk-ban-ra, KH-tk-song]
bo_cuc: danh-sach-chi-tiet
---
# Trang khách

Màn đầu của nhóm trang khách (hàng 35): trang `apps/web/src/app/s/[code]/page.tsx` trả `<KhungTrangKhach>…</KhungTrangKhach>`
ở gốc — link công khai khách mở từ Zalo, không đăng nhập, không vỏ, điện thoại trước. Bộ căn theo lối ReUI `wishlist-3`
(lưới thẻ ảnh vuông + huy hiệu trạng thái + nút «Quan tâm»), chi tiết một căn theo `product-detail-5` (ảnh lớn, thông
số, hộp giá + nút chính), bỏ giỏ, đánh giá, carousel — chủ kho chọn ở Cổng Phạm vi hàng 35; ảnh ba lối ở
`_acceptance/trang-khach-rieng/ba-loi/`.

**Dùng khi** trang mở cho người ngoài sàn bằng một link: khách riêng, nhóm môi giới mở link của Lần gửi. **Không dùng**
cho màn vận hành trong vỏ (họ Frame) hay ngăn xem trước của màn Gửi (`TrangKhach` của hàng 34, cùng dữ liệu bản ra).

## Luật

- **KH-tk-khong-vo** — Trang khách không vỏ, không đăng nhập (`proxy.ts` mở `/s/`): đầu trang mảnh tên sàn + người gửi;
  họ card, không Frame, không `BoCuc` của bàn làm việc. Link không mở được thì không đầu trang (không lộ sàn).
- **KH-tk-ban-ra** — Mọi chữ và ảnh khách thấy dựng từ bản ra `banRaNgoai` của lõi qua route công khai; trang và route có
  bài rò rỉ `*.ro-ri.test.ts` (rào cửa ra hàng 31, rào route công khai hàng 35).
- **KH-tk-song** — Trang không lưu đệm (`force-dynamic`, đọc `no-store`): giá và trạng thái của lúc mở; căn đã cọc,
  tạm ngưng, không còn giữ chỗ trong bộ, mờ đi với nhãn, không nút «Quan tâm».
