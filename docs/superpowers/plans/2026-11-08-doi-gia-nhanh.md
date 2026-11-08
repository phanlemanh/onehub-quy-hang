# Kế hoạch — doi-gia-nhanh (hàng 40)

Hợp đồng: `_acceptance/doi-gia-nhanh/contract.md` (duyệt 08/11; Hỏi-1 = a, Hỏi-2 = a).

| # | Việc | Tệp | Kiểm | Phục vụ | independent |
|---|---|---|---|---|---|
| 1 | Cờ `suaHang` của lớp phủ hồ sơ = bảng quyền «sua»; bài đối chiếu bang-quyen-hang.json + chiều đỏ | `packages/core/src/access/lop-phu-ho-so.ts`, `.test.ts` | `npm test -w @quy-hang/core` | E1 | false |
| 2 | Phần thuần hai ngăn (`buocDoiGia`, `buocDoiTrangThai`, `khoaGia`, `ghiLenh`) dùng lại `lenh.ts` | `units/ho-so/dien-thoai/sua-nhanh.ts` | `npm test -w @quy-hang/web` | E2–E5 | false |
| 3 | Ngăn Đổi giá / Đổi trạng thái qua `NganNoi`, lối mở trên khối Giá và huy hiệu trạng thái | `units/ho-so/dien-thoai/ngan-sua-nhanh.tsx`, `than-dien-thoai.tsx` | lint, ui-lint, khuôn | E7, E9 | false |
| 4 | Bài đo E2–E6 | `units/ho-so/dien-thoai/sua-nhanh.test.ts` | `npm test -w @quy-hang/web` | E2–E6 | false |

Các việc nối tiếp nhau nên chạy tuần tự trong vòng chính.
