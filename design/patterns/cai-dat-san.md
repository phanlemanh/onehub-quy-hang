---
nhom: cai-dat-san
doi_tuong: [nguoi-dung, cach-goi, trang-thai-hang, truong-rieng, luat-chia-lead, thue-phi, mau-nhap]
khuon: { ten: MucCaiDat, nhap: "@/app/(app)/settings/khung" }
nhan_dien: ["apps/web/src/app/(app)/settings/**/page.tsx"]
mau_dang_chay: { tep: "apps/web/src/app/(app)/settings/users/page.tsx", duong: "/settings/users", trang_thai: [mac-dinh, khong-quyen, loi] }
khe_bat_buoc: [title, children]
cam_ngoai_khuon: [Frame, FrameHeader, FramePanel, Card]
ngoai_le: [{ tep: "apps/web/src/app/(app)/settings/page.tsx", ly_do: "Chỉ chuyển hướng sang mục đầu (Người dùng), không dựng màn nào." }, { tep: "apps/web/src/app/(app)/settings/[section]/page.tsx", ly_do: "Mục chưa dựng (mục 45–50 của lộ trình) đi khuôn trang tạm; mỗi mục dựng thật thì có trang riêng dựng MucCaiDat." }]
luat: [KH-cd-mot-khung, KH-cd-khong-quyen]
bo_cuc: doc
---
# Cài đặt sàn

Mỗi mục trong nhóm «Sàn [Tên]» của cột mục lục Cài đặt — Người dùng, Cách gọi, Trạng thái, Trường riêng, Luật chia lead,
Thuế phí, Mẫu nhập — là một trang `apps/web/src/app/(app)/settings/<mục>/page.tsx` trả
`<MucCaiDat title="…" tenSan="…">…</MucCaiDat>` ở gốc: đường dẫn «Cài đặt › Sàn [Tên] › mục», câu phạm vi «Chỉ áp cho sàn
[Tên]» (hàng cai-dat-hop-nhat). Trang gọi `chanMucSan` ở máy chủ trước khi dựng: người không quản trị về Cá nhân kèm câu
báo.

**Dùng khi** màn chỉnh một mục cấu hình của sàn, đọc trong vỏ, quyền ghi chỉ ở quản trị sàn.
**Không dùng** cho màn vận hành (Bảng hàng, Hôm nay, Đội) hay mục «Cá nhân» — nhóm `toi`. Mục
chưa dựng hiện trang tạm, không giả một `MucCaiDat` rỗng.

Ngoại lệ: `settings/page.tsx` chỉ chuyển hướng; `settings/[section]/page.tsx` là trang tạm chung cho các mục chưa dựng, và dựng `CaNhan` (nhóm `toi`) cho đoạn «personal» —
lý do ghi trong frontmatter.

## Luật

- **KH-cd-mot-khung** — Một mục là đúng một `Frame` (qua `MucCaiDat`) trong cột nội dung của vỏ; trang không tự dựng
  `<main>`, không kéo cao cả màn, không lồng `Card`.
- **KH-cd-khong-quyen** — Người không đủ quyền xem mục thấy một khối báo qua `TrangThai kind="notice"` nói ai xem được,
  không thấy khung trống hay lỗi.
