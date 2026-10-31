---
nhom: o-nhan-lead
doi_tuong: [lead]
khuon: { ten: KhungLead, nhap: "@/app/(app)/leads/new/khung" }
nhan_dien: ["apps/web/src/app/(app)/leads/new/page.tsx", "apps/web/src/app/(app)/proto/o-nhan-lead/page.tsx"]
mau_dang_chay: { tep: "apps/web/src/app/(app)/leads/new/page.tsx", duong: "/leads/new", trang_thai: [mac-dinh, khong-quyen, khong-trung, co-dau-chu, can-trung, da-bo, loi] }
khe_bat_buoc: [children]
cam_ngoai_khuon: [Frame, FrameHeader, FramePanel, Card]
ngoai_le: []
luat: [KH-ol-mot-khung, KH-ol-khong-quyen, KH-ol-ket-qua-tu-loi]
---
# Ô nhận lead

Cửa vào của lead trên máy tính (L1–L3, hàng 24): một trang `apps/web/src/app/(app)/leads/new/page.tsx` trả
`<KhungLead>…</KhungLead>` ở gốc, ghép theo khối đích `form-2` (`docs/design/vo-va-ia.md` §2). Trang mẫu của
design-pass (`proto/o-nhan-lead`) đi cùng khuôn, gỡ khi màn thật qua Cổng Bằng chứng.

**Dùng khi** màn nhập một lead và hiện kết quả kiểm trùng. **Không dùng** cho danh sách lead đã nhập và bốn nấc (hàng
27, cột phải `list-11` — sẽ là khe thứ hai của khuôn) hay ô nhận lead trên điện thoại (L4, L5).

## Luật

- **KH-ol-mot-khung** — Ô nhận lead là đúng một `Frame` (qua `KhungLead`) trong cột nội dung của vỏ; trang không tự dựng
  `<main>`, không lồng `Card`.
- **KH-ol-khong-quyen** — Vai không có nút «+ Lead» ở bảng vai của lõi thấy một khối báo qua `TrangThai kind="notice"`
  nói vai nào nhập được, không thấy biểu mẫu.
- **KH-ol-ket-qua-tu-loi** — Kết quả kiểm trùng hiện bằng `Alert` dưới biểu mẫu, chữ dựng từ bản của telesales mà lõi
  trả (`leadResultView`); màn không hiện số chủ, mã hàng hay trường nào của hàng.
