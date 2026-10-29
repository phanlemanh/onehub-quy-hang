---
name: new-migration
description: Tạo migration PostgreSQL mới cho onehub-quy-hang đúng chuẩn — số kế tiếp, luật cách ly theo công ty, grant cho vai API, một ca trong bộ kiểm cách ly. Dùng khi cần thêm hay đổi bảng, cột, index, ràng buộc.
allowed-tools: Bash(ls *) Bash(git *) Bash(npm *) Bash(docker *)
---

# /new-migration

1. **Số kế tiếp**: `ls packages/db/migrations/` → số lớn nhất + 1, ba chữ số. Tên `NNN_<viet-thuong-gach-noi>.sql`.
2. **Đầu tệp**: một dòng nói migration làm gì và vì sao, dẫn mục của Tham chiếu hoặc ADR nếu có.
3. **Bảng của công ty** (gần như mọi bảng):
   - `company_id uuid not null references companies (id)`
   - `alter table … enable row level security;` và `force row level security;`
   - luật đọc / ghi theo `app.current_company_id()`; luật ghi có `with check`
   - `grant` đúng quyền cho `quy_hang_app` — không hơn
4. **Trần dữ liệu**: cột thuộc lớp `source` (chủ nhà, số điện thoại, giá đáy, ảnh sổ) để ở bảng riêng có luật chặt hơn.
   Bất biến của lõi thì chặn thêm bằng `check` ở cơ sở dữ liệu.
5. **Tên theo RESO** khi có; đặc trưng Việt Nam đặt tên riêng và ghi vào `CONTEXT.md` nếu có nhãn trên màn.
6. **Bộ kiểm cách ly**: thêm ca vào `packages/db/tests/isolation.test.mjs` — công ty này không đọc, không ghi được
   dữ liệu của công ty kia ở bảng mới.
7. **Chạy**: các bước ở `/verify` mục 6. Migration phải chạy được hai lần (lần hai không áp lại).

Không sửa migration đã commit — hook chặn. Cần đổi thì viết migration mới.
