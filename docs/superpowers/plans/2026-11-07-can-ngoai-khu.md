# Kế hoạch — can-ngoai-khu (hàng 76)

Hợp đồng: `_acceptance/can-ngoai-khu/contract.md` (T3, Cổng Phạm vi duyệt 07/11, Hỏi-1..4 theo khuyến nghị). Thiết kế:
`docs/superpowers/specs/2026-11-07-can-ngoai-khu-design.md`. Tuần tự trong một phiên — các task nối nhau.

| # | Việc (người dùng thấy gì) | Tệp chính | Phục vụ | Kiểm sau task |
| --- | --- | --- | --- | --- |
| 1 | Ghim bản tính của hàng cũ TRƯỚC khi sửa: ảnh gấp lại của sáu dãy sự kiện cũ, commit riêng | `packages/core/src/listing/anh-gap-cu.json`, bộ sinh trong tệp ca | E2 | ảnh sinh từ `foldListing` hiện hành; commit trước task 2 |
| 2 | Lõi nhận ba cách gọi căn khi tạo hàng; hàng cũ gấp ra như cũ | `packages/core/src/listing/events.ts`, `fold.ts`, `dinh-danh.test.ts` | E1, E2 | `npm test -w @quy-hang/core`, kèm hai lượt phá thử ghim thông điệp |
| 3 | Lõi đọc chữ địa chỉ + loại hình thành bản ghi căn ngoài khu, hay lý do từ chối | `packages/core/src/property/can-ngoai-khu.ts` (+ ca kiểm), `packages/core/src/address/index.ts` (mở đường nhập) | E3, E4, E5 | `npm test -w @quy-hang/core` |
| 4 | Cơ sở dữ liệu có bảng căn ngoài khu của sàn và ba cột mới trên bảng hàng, khoá theo sàn | `packages/db/migrations/052_can_ngoai_khu.sql`, `packages/db/tests/isolation.test.mjs` | E7 | migrate hai lần + bộ kiểm cách ly trên Postgres dãy X |
| 5 | API tạo, đọc căn ngoài khu; lệnh tạo hàng nhận ba dạng, mã căn sàn khác như không có | `packages/api/src/off-compound-units/**`, `packages/api/src/app.ts`, `packages/api/src/listings/store.ts`, `routes.ts` | E3–E6, E8, E9 | bộ kiểm `packages/api/test-db/can-ngoai-khu/` |
| 6 | Mọi chỗ đọc toà chịu được hàng không toà (không gãy, chưa hiện đẹp — hàng 79); gấp lại cả bảng | các nơi kiểm kiểu báo lỗi ở `packages/api`, `apps/web`; `packages/api/test-db/listings.test.ts` | E10, E10b | `npm run typecheck`, `npm run lint`, toàn bộ `db:test` |

Lựa chọn tải trọng trong kế hoạch:

- Task 1 đi trước task 2 và commit riêng: ảnh ghim phải sinh bằng lõi CŨ, không thì phép so «hàng cũ gấp ra như cũ» hằng đúng.
- Task 6 chỉ làm hàng không toà **không gãy**: phép so theo toà tự không khớp với `null`; chỗ in tên hàng in khu · dãy · lô
  hay «căn ngoài khu». Vùng `apps/web` khai thêm theo đúng các thư mục kiểm kiểu báo, trước khi sửa.
- Migration mới số 052 (đã kiểm không nhánh nào khác dùng); không sửa migration đã commit.
