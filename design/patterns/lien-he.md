---
nhom: lien-he
doi_tuong: [lien-he, so, co-hoi, can]
khuon: { ten: KhungLienHe, nhap: "@/app/(app)/contacts/khung" }
nhan_dien: ["apps/web/src/app/(app)/contacts/vung.tsx"]
mau_dang_chay: { tep: "apps/web/src/app/(app)/contacts/vung.tsx", duong: "/contacts", trang_thai: [dang-tai, trong, khong-khop, nguoi-khac-giu, loi, ho-so, khong-so, so-da-hien, mo-so-loi] }
khe_bat_buoc: [children]
cam_ngoai_khuon: [Card]
ngoai_le: []
luat: [KH-lh-danh-sach-chi-tiet, KH-lh-khong-so, KH-lh-mo-so, KH-lh-trang-thai]
bo_cuc: danh-sach-chi-tiet
---
# Liên hệ

Màn Liên hệ (hàng 103, ADR-0021 sửa đổi 05/11): vùng `apps/web/src/app/(app)/contacts/vung.tsx` trả `<KhungLienHe>…</KhungLienHe>`
ở gốc (trang `page.tsx` dựng vùng — trang mới dưới vỏ là ngoại lệ có tên của nhóm trang-tam) — bố cục «Danh sách → chi tiết» (ADR-0024). Thân là lưới liên hệ người xem đọc được (đầu chủ: người mình giữ; trưởng
nhóm: cả sàn) theo `solution-crm-3` (lối Lai, chủ kho 05/11, trang `_acceptance/man-lien-he/ba-loi-man/`): ô người có chữ đầu,
tên, dấu Lead và loại; ô người giữ; cột cơ hội mở và căn; ô tìm theo tên hay số. Lọc loại và Lead ở cột thứ hai; dưới md lưới
thành danh sách thẻ một cột và thanh có chọn loại. Chạm dòng mở hồ sơ người cạnh bảng theo lối Trong kho (chủ kho chọn ở
Cổng Phạm vi hàng 103, trang ba lối `_acceptance/man-lien-he/ba-loi/`): một cột theo khuôn hồ sơ căn (solution-crm-4) — đầu hồ
sơ · Số · Cơ hội · Căn · Dòng thời gian. Khi hàng 105 gộp, ngăn cạnh bảng thành cột kéo chia (lối C) mà màn không đổi.

**Dùng khi** màn tìm một người và xem cơ hội, căn, số của họ. **Không dùng** cho Đã gửi (nhóm `da-gui`), Lead đã nhập (nhóm
`lead-cua-toi`) hay hồ sơ căn (nhóm `ho-so-can`).

## Luật

- **KH-lh-danh-sach-chi-tiet** — Lưới (`DataGrid` trong `Frame`, sắp xếp chỉ mở khi đã tải hết) và hồ sơ nằm trong `KhungLienHe`; hồ sơ dùng mảnh của solution-crm-4 (`DauHoSo`,
  `MucHoSo`, `CapGiaTri`, `ThanHoSo`) trong ngăn cạnh bảng; không `Card`.
- **KH-lh-khong-so** — Danh sách, hồ sơ, dòng thời gian không mang số rõ hay giá đáy; số che chỉ ba số cuối.
- **KH-lh-mo-so** — Số rõ chỉ đi qua «Hiện số» (`POST …/reveal`, mỗi lần một sự kiện), sống trong state của hồ sơ, rời hồ sơ
  là che lại; không lưu kho trên máy, không vào URL. Tìm theo số đi POST.
- **KH-lh-trang-thai** — Đang tải dùng `ChoTai` của bố cục; trống · không khớp · người khác giữ · lỗi đi qua `TrangThai`; lỗi
  có «Thử lại».
