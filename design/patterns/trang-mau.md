---
nhom: trang-mau
doi_tuong: [trang-mau-song]
khuon: { ten: TrangMau, nhap: "@/app/mau/he-bo-cuc/trang-mau" }
nhan_dien: ["apps/web/src/app/mau/**/page.tsx"]
mau_dang_chay: { tep: "apps/web/src/app/mau/he-bo-cuc/page.tsx", duong: "/mau/he-bo-cuc", trang_thai: [mac-dinh, cho-tai, rong, loi, ngoai-tuyen] }
khe_bat_buoc: [che]
cam_ngoai_khuon: [Frame, Card]
ngoai_le: []
luat: [KH-tm-khong-goi-api, KH-tm-du-to-hop]
---
# Trang mẫu sống

Trang bày hệ bố cục (ADR-0024 quyết định 8) bằng dữ liệu mẫu, mở không cần cơ sở dữ liệu và không đăng nhập: chọn bố cục ×
trạng thái × khổ, xem trong khung đúng bề rộng. Ảnh chụp từ đây là ảnh chuẩn của bố cục (`design/anh-chuan/`). Trang trả
`<TrangMau che="tong|xem" …>` ở gốc.

**Dùng khi** cần xem hay chụp một bố cục ở một trạng thái và một khổ mà không dựng dữ liệu thật.
**Không dùng** để dựng màn vận hành — màn thật dưới `(app)` dựng qua `BoCuc` với dữ liệu thật.

## Luật

- **KH-tm-khong-goi-api** — Trang mẫu không nhập lớp gọi API, bộ đồng bộ hay `next/headers`; mọi dữ liệu ở `du-lieu-mau.ts`.
- **KH-tm-du-to-hop** — Mỗi tổ hợp bố cục × trạng thái × khổ có một địa chỉ riêng (`to-hop.ts`), để máy chụp được.
