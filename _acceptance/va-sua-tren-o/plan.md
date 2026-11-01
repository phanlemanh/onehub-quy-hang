# Kế hoạch thi công — va-sua-tren-o (S2)

T2, không Gate 1.5. Thứ tự theo phụ thuộc; mỗi bước có bài kiểm viết trước kèm đối chứng đỏ.

1. **Bộ viết giá đúng từng đồng** — `packages/core/src/pricing/doc-gia.ts`: `vietGia` viết bằng số nguyên (phần nguyên ·
   phần lẻ cắt số 0 cuối), chín số lẻ của tỷ, sáu của triệu, không dấu nghìn. Test `doc-gia.test.ts`: bảng viết trước
   (E1) + 2.000 số sinh theo hạt giống cố định + đối chứng đỏ bộ viết làm tròn. (AC-1)
2. **Chỗ hiện giá của trình sửa thành hàm thuần** — `cell-edit/lenh.ts`: `moTaThayDoi`, `chuDienSan`, `hieuLaGiaChot`
   (dời từ `tren-o.tsx`); các hàm nhận bộ viết làm tham số cuối (mặc định `vietGia`) để đối chứng đỏ đo đúng mã đang
   chạy. Test `lenh.test.ts`: ma trận chỗ × hai giá (E2). (AC-2, AC-3)
3. **Bản ghi hoàn tác** — `cell-edit/hoan-tac.ts`: `xetHoanTac(banGhi, phienBanHienTai)` và bộ giữ thuần
   `taoSoHoanTac()` (ghi · dungNut · dungPhim). Test `hoan-tac.test.ts`: ma trận E4, ba chiều E6, hai đối chứng đỏ.
   (AC-5, AC-6)
4. **Nối vào trình sửa** — `cell-edit/tren-o.tsx`: thông báo giữ bản ghi của chính nó; `phienBanSau = op.expectedVersion
   + 1`; Ctrl/Cmd+Z qua `dungPhim`; chữ điền sẵn, mô tả hộp hỏi lại, đọc lại giá chốt gọi hàm của bước 2. (AC-3..AC-6)
5. **Rào** — kiểm kiểu, lint, test, sàn thiết kế, `thu/ranh-gioi.mjs`. (AC-7)
