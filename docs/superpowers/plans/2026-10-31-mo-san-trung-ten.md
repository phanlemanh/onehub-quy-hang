# Kế hoạch — mo-san-trung-ten (hàng 56)

Thiết kế: `docs/superpowers/specs/2026-10-31-mo-san-trung-ten-design.md` · hợp đồng:
`_acceptance/mo-san-trung-ten/contract.md` (đã duyệt 31/10, Hỏi-1 theo khuyến nghị).

## Task 1 — Công cụ mở sàn nhận diện theo tên + email quản trị

- Files: `packages/db/scripts/mo-san.mjs`, `packages/db/scripts/mo-san.d.mts`
- Việc: tìm sàn chạy lại trong MỌI sàn cùng tên mà email là quản trị; không có thì tạo sàn mới; trả thêm `daCo`,
  `chayLai`; dòng lệnh in «chạy lại — sàn có sẵn <mã>» hay «đã có N sàn khác cùng tên — đây là sàn mới <mã>».
- Verify: `npm run typecheck`; ca cũ của `mo-san.test.mjs` vẫn xanh.
- Phục vụ E1, E2, E3, E5. `independent: false`.

## Task 2 — Ca kiểm của công cụ

- Files: `packages/db/tests/mo-san.test.mjs` (chỉ thêm ca)
- Việc: ca tên trùng email khác (E1), chạy lại sàn thứ hai và thành viên thường (E2), ba sàn cùng tên (E3), dòng lệnh
  (E5); tên và email mang nhãn chạy; ca dòng lệnh dọn dữ liệu đã tạo.
- Verify: `npm run db:migrate && npm run db:test` (Postgres dãy X); phá thử — đưa công cụ về tìm theo tên, chỉ xét sàn
  đầu, bỏ dòng in → mỗi ca đỏ đúng thông điệp.
- `independent: false`.

## Task 3 — Ca cách ly hai sàn cùng tên

- Files: `packages/db/tests/isolation.test.mjs` (chỉ thêm ca, luật 20 của đợt)
- Việc: hai sàn cùng tên mở bằng công cụ thật, mỗi sàn có dữ liệu; đếm bằng vai chủ; người mới đặt sàn mới rồi sàn cũ
  không thấy dòng nào của sàn cũ; đối chứng quản trị cũ.
- Verify: như Task 2; phá thử — chèn người mới vào sàn cũ → ca đỏ.
- Phục vụ E4. `independent: false`.

## Task 4 — Tham chiếu

- Files: `docs/product/tham-chieu.md` (một dòng sổ quyết định)
- Việc: ghi mở sàn trùng tên ra sàn riêng, chạy lại chỉ khi email đã là quản trị sàn cùng tên.
- `independent: false`.
