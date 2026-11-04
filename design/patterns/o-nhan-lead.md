---
nhom: o-nhan-lead
doi_tuong: [lead]
khuon: { ten: KhungLead, nhap: "@/app/(app)/leads/new/khung" }
nhan_dien: ["apps/web/src/app/(app)/leads/new/page.tsx"]
mau_dang_chay: { tep: "apps/web/src/app/(app)/leads/new/page.tsx", duong: "/leads/new", trang_thai: [mac-dinh, khong-quyen, khong-trung, co-dau-chu, can-trung, da-bo, loi] }
khe_bat_buoc: [children]
cam_ngoai_khuon: [Frame, FrameHeader, FramePanel, Card]
ngoai_le: []
luat: [KH-ol-mot-khung, KH-ol-khong-quyen, KH-ol-ket-qua-tu-loi]
bo_cuc: doc
---
# Ô nhận lead

Cửa vào của lead (L1–L5, hàng 24, 51): một trang `apps/web/src/app/(app)/leads/new/page.tsx` trả `<KhungLead>…</KhungLead>`
ở gốc — bố cục Đọc của hệ bố cục (ADR-0024), bản ghép là khối đích (`docs/design/vo-va-ia.md` §2, chủ kho 02/11). Điện thoại
một cột; tab Lead có hai phần «Nhập lead» · «Lead đã nhập» (vùng của nhóm `lead-cua-toi`). Trang mẫu design-pass của hàng
24 đã gỡ (luật đợt 45, hàng 51).

**Dùng khi** màn nhập một lead và hiện kết quả kiểm trùng, trên máy tính và điện thoại. **Không dùng** cho trang riêng của
danh sách lead đã nhập và bốn nấc (nhóm `lead-cua-toi`, `/leads/mine`).

## Luật

- **KH-ol-mot-khung** — Phần nhập là đúng một `Frame` (qua `VungNhapLead`) trong bố cục của `KhungLead`; trang không tự
  dựng `<main>`, không lồng `Card`, không Frame trong Frame. Trên điện thoại phần «Lead đã nhập» là vùng `KhungLeadCuaToi`
  đặt cạnh, không lồng vào phần nhập.
- **KH-ol-khong-quyen** — Vai không có nút «+ Lead» ở bảng vai của lõi thấy một khối báo qua `TrangThai kind="notice"`
  nói vai nào nhập được, không thấy biểu mẫu.
- **KH-ol-ket-qua-tu-loi** — Kết quả kiểm trùng hiện bằng `Alert` dưới biểu mẫu, chữ dựng từ bản của telesales mà lõi
  trả (`leadResultView`); màn không hiện số chủ, mã hàng hay trường nào của hàng.
