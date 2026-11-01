# Kế hoạch thi công — cột hồ sơ căn (hàng 17)

Hồ sơ: `_acceptance/cot-ho-so-can/` · thiết kế: `docs/superpowers/specs/2026-11-01-cot-ho-so-can-design.md` · đã duyệt
Cổng Phạm vi 01/11 (Hỏi-1 chép và mở bảng chia sẻ · Hỏi-2 lối ReUI · Hỏi-3 tên vai).

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Link của cột luôn trỏ đúng căn, đúng lần rao | `units/ho-so/ho-so.ts` (đường của cột) | AC-1 (bấm dòng mở cột) |
| Thuộc tính căn hiện đúng toà, căn ngoài danh mục ghi rõ | `units/ho-so/ho-so.ts` (thuộc tính) | AC-2 (thuộc tính tự điền) |
| Lần rao đang xem và các lần rao của căn | `units/ho-so/ho-so.ts` (lần rao) | AC-3 (lần rao) |
| Lịch sử ai đổi gì khi nào | `units/ho-so/ho-so.ts` (dòng lịch sử) | AC-4 (lịch sử) |
| Lịch sử vẫn đọc được khi mất mạng | `units/ho-so/ho-so.ts` (trạng thái lịch sử) | AC-5 (mất mạng) |
| Lời báo sai soạn sẵn, mở bảng chia sẻ | `units/ho-so/bao-sai.ts`, `bao-sai.tsx` | AC-6 (báo sai) |
| Mở hồ sơ toàn màn theo mã căn | `units/[code]/page.tsx`, `ho-so.ts` (tìm căn) | AC-7 (toàn màn) |
| Cột hồ sơ cạnh Bảng hàng, dòng đang mở được đánh dấu | `units/ho-so/cot-ho-so.tsx`, `bang-co-ho-so.tsx`, `inventory/bang-hang.tsx`, `inventory/page.tsx` | AC-1, AC-9 |
| Khuôn nhóm Hồ sơ căn nhận màn thật | `design/patterns/ho-so-can.md`, `trang-tam.md`, bộ kiểm ui-lint | AC-8 (khuôn nhóm) |
| Chỗ thử của bài chấm trên bản chạy | `_acceptance/cot-ho-so-can/thu/dung-h.mjs` | AC-9 (bản chạy) |

Thứ tự: lõi thuần + kiểm (E1–E7, mỗi phép đo có chiều đỏ) → giao diện cột và trang toàn màn → nối Bảng hàng (chỉ thêm:
`onRowClick`, đánh dấu dòng; giám sát cho ở H-2) → khuôn nhóm và dòng chụp cây → chỗ thử `dung-h.mjs` → Tham chiếu §12,
`vo-va-ia.md` «Đã chuyển thể», `catalog.md` «Khối đã chuyển thể». Các bước phụ thuộc nhau theo thứ tự trên
(`independent: false`); kiểm mỗi bước: `npm test -w @quy-hang/web`, `npm run typecheck`, `npm run lint`.
