# Kế hoạch thi công — danh-muc-xa-day-du (S2)

Hạng T2, đi tiếp không dừng. Mọi task tuần tự (cùng vùng `packages/core/src/address/**`, task sau dùng vật task trước);
verify per-task: `npm run typecheck -w @quy-hang/core && npm test -w @quy-hang/core`.

| # | Task | Tệp | Phục vụ | independent |
| --- | --- | --- | --- | --- |
| 1 | Chép hai tệp nguồn Cục Thống kê vào kho (đã duyệt Hỏi-1) | `address/nguon/danh-muc-xa-06-11-2026.xml`, `address/nguon/bang-chuyen-doi-moi-cu.xlsx` | E1, E2, E8 | false |
| 2 | Bộ đọc tệp thuần Node (zip, sheet, XML dịch vụ) | `address/nguon/doc-tep.ts` | E1, E2 | false |
| 3 | Bộ sinh + bảng sửa nguồn có tên; sinh ba bảng JSON sắp theo mã | `address/nguon/sinh-danh-muc.ts`, `address/du-lieu/{xa,xa-cu,tinh-cu}.json` | E1, E2, E3 | false |
| 4 | Danh mục lõi nạp ba bảng; ba tên tỉnh theo nguồn; nguồn có ngày tham chiếu và băm; `kiemDanhMuc` mở rộng | `address/danh-muc.ts` | E4, E8 | false |
| 5 | Bộ đọc: tỉnh cũ, so xã trong tỉnh, huyện cũ dạng thành phố/thị xã; chỉ mục tên lập một lần cho mỗi danh mục; công tắc phá thử nằm ở tệp lõi không xuất qua `index.ts` | `address/doc-dia-chi-loi.ts`, `address/doc-dia-chi.ts` | E3, E5, E6, E9 | false |
| 6 | Bộ kiểm AC-1…AC-9, mỗi ca một cặp đối chứng dương + phá thử ghim thông điệp; không-mạng quét thêm `nguon/` | `address/danh-muc-xa.test.ts`, `address/khong-mang.test.ts` | E1–E9 | false |
| 7 | Chạy lại bộ kiểm hàng 75 và va-duong-so-n, sửa chỗ vỡ do tên ba tỉnh nếu có | `address/*.test.ts` | E7 | false |

Lựa chọn load-bearing: bộ sinh viết bằng TypeScript chạy qua tsx (đồng bộ kiểm kiểu với lõi) thay cho `.mjs` ghi ở E8 —
ghi sổ `fix`.
