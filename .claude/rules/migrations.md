---
paths:
  - "packages/db/**"
---

# Luật khi chạm cơ sở dữ liệu

- Schema chỉ đổi bằng migration MỚI `packages/db/migrations/NNN_<tên>.sql`, số kế tiếp. Migration đã commit không sửa
  (hook `guard-edits.sh` chặn). Dùng `/new-migration`.
- Mỗi bảng của công ty: cột `company_id`, `enable` + `force row level security`, luật theo `app.current_company_id()`,
  `grant` cho vai `quy_hang_app` — và một ca trong `packages/db/tests/isolation.test.mjs` cùng PR. Bộ kiểm cũng tự bắt
  bảng nào quên bật luật.
- Lớp `source` (chủ nhà, số điện thoại, giá đáy, ảnh sổ) nằm ở bảng riêng có luật chặt hơn, không là cột của hàng.
- Tên bảng, cột theo RESO khi có (`UnitNumber`, `BuildingName`, `LivingArea`…); đặc trưng Việt Nam đặt tên riêng.
- Kiểm trước khi xong: `npm run db:migrate && npm run db:test` trên Postgres tạm (lệnh ở AGENTS.md).
