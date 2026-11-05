# Kế hoạch thi công — dia-chi-chuan (hàng 75)

Ngày 05/11/2026 · T2 (không Gate 1.5) · Cổng Phạm vi duyệt 05/11 (Hỏi-1, Hỏi-2 theo khuyến nghị).
Verify chung mỗi task: `npm test -w @quy-hang/core` và `npm run typecheck -w @quy-hang/core`. Mọi tệp ở
`packages/core/src/address/`.

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Lõi có danh mục 34 tỉnh và phần trích TP.HCM, ghi nguồn và ngày | `danh-muc.ts`, `danh-muc.test.ts` | AC-8 (danh mục có nguồn, khớp hàng 73) |
| Số nhà và tên đường gõ kiểu nào cũng ra một dạng chuẩn, khoá theo công thức | `chuan-hoa.ts`, `chuan-hoa.test.ts` | AC-7 (chuẩn hoá và khoá) |
| Một địa chỉ gõ ra địa chỉ chuẩn, phần thiếu, việc cần chọn | `doc-dia-chi.ts`, `index.ts` | AC-1..AC-6 |
| Bộ địa chỉ thử của hàng 73 được đo trọn | `bo-thu.test.ts` | AC-1, AC-2, AC-3, AC-5 |
| Tên cũ, tên bị tách, phần thiếu có ma trận viết trước | `doc-dia-chi.test.ts` | AC-4, AC-5, AC-6 |
| Không đường nào ra mạng | `khong-mang.test.ts` | AC-9 |

## Task

1. **Danh mục** — `danh-muc.ts`: khuôn `DanhMucDonViHanhChinh` (nguon theo phần, ngay, phamVi, tinh, xa, xaCu), dữ liệu 34 tỉnh
   (QĐ 19/2025), 4 phường mới + 10 phường cũ (NQ 1685), hàm `kiemDanhMuc(dm)` và `doiChieuBangTrich(dm, trich)` trả lỗi.
   Kiểm: `danh-muc.test.ts` ca «AC-8 …». Phục vụ E8. `independent: true`.
2. **Chuẩn hoá** — `chuan-hoa.ts`: `boDau`, `tenDuongChuan`, `chuanHoaSoNha` (hẻm, HXH, kiệt, ngõ · ngách), `khoaDiaChi`.
   Kiểm: `chuan-hoa.test.ts` ca «AC-7 …» (ma trận + phá thử). Phục vụ E7. `independent: true`.
3. **Bộ đọc** — `doc-dia-chi.ts`: `docDiaChi(chu, dm?)` theo bảy luật của design; `index.ts` xuất. Phụ thuộc 1, 2.
   `independent: false`.
4. **Hàm kiểm và bộ thử hàng 73** — trong `bo-thu.test.ts` (hàm kiểm thuần trả lỗi: khoá theo căn, khoá trùng, lệch đáp án, chọn hộ, không
   nói thiếu, xã ngoài tỉnh, tên cũ sai xã) + ca «AC-1», «AC-2», «AC-3», «AC-5» trên tệp của hàng 73 (đường
   suy từ vị trí tệp kiểm). Phục vụ E1, E2, E3, E5. Phụ thuộc 3.
5. **Ma trận đọc** — `doc-dia-chi.test.ts` ca «AC-4», «AC-5» (chiều đảo trên danh mục bản sao), «AC-6». Phục vụ E4, E5, E6.
6. **Không mạng** — `khong-mang.test.ts`: hàm quét theo tên module + ca «AC-9». Phục vụ E9.

Thứ tự: 1 → 2 → 3 → 4 → 5 → 6, tuần tự trong phiên chính (vùng nhỏ, các task 3–6 dùng chung bộ đọc).
Hàm kiểm nằm ngay trong tệp `.test.ts` dùng nó (mỗi tệp kiểm tự đủ, không nhập chéo để ca không chạy hai lần), nên tập
tệp không phải kiểm của vùng đúng bằng {danh-muc, chuan-hoa, doc-dia-chi, index} như E9 ghim.
