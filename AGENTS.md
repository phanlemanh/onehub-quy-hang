# onehub-quy-hang — hướng dẫn cho mọi AI coding agent

Quỹ hàng là **SaaS quản lý hàng cho sàn môi giới bất động sản**: nhận lead chủ nhà, biến thành căn sẵn sàng bán,
giữ tươi, phát cho đầu khách và khách qua link sống. Gốc quyết định: ADR-0017 của kho `onehub-invest`; khởi điểm của
kho này: `docs/adr/0001-khoi-diem.md`. Từ vựng (nhãn UI ↔ tên code): `CONTEXT.md`.
Làm việc với người dùng bằng **tiếng Việt**.

## Bản đồ kho

```
apps/web          bàn làm việc (máy tính + điện thoại) và trang khách /s/<mã> — Next.js
packages/core     luật nghiệp vụ thuần: lớp dữ liệu và trần, thoả thuận; sau: trạng thái, tính giá, luật ẩn, kiểm trùng
packages/api      API có phiên bản /api/v1 (Hono + OpenAPI): đường ghi duy nhất, đọc cho bên ngoài
packages/connect  loại kết nối và khuôn dữ liệu cấp vào; kết nối đầu tiên: danh mục từ OneHub Invest
packages/db       migration đánh số, luật cách ly theo dòng, bộ kiểm cách ly
docs/adr/         quyết định kiến trúc của kho này
```

## Bất biến — không thoả thuận, cấu hình hay yêu cầu nào mở được

1. **Cách ly giữa công ty.** Mọi bảng của công ty bật luật theo dòng (`enable` + `force row level security`) theo
   `app.current_company_id()`; API chạy bằng vai `quy_hang_app`, không phải chủ bảng. Bảng mới thiếu luật là lỗi chặn.
   Bộ kiểm `packages/db/tests/isolation.test.mjs` là check bắt buộc trước mỗi lần phát hành.
2. **Thông tin chủ nhà không rời công ty.** Lớp dữ liệu `source` (chủ nhà, số điện thoại, giá đáy, ảnh sổ) có trần
   `never_leaves_company` trong `packages/core` và bị chặn thêm ở ràng buộc của cơ sở dữ liệu. Không nới ở chỗ nào.
3. **Người luôn là người bấm gửi.** Không tích hợp gửi tin qua Zalo cá nhân, không đăng vào nhóm, không tự trả lời.
   Chỉ mở bảng chia sẻ của thiết bị.
4. **Phần nội bộ không ra trang khách.** Dữ liệu ra ngoài được dựng từ luật ẩn ở `packages/core`, không ẩn ở giao diện.

## Luật làm việc

- **Mọi kết nối là một thoả thuận** (`packages/core/src/agreements.ts`), không viết riêng từng bên. Invest, Platform
  hay công ty khác đều là bên của một loại kết nối.
- **Không đọc cơ sở dữ liệu của OneHub Invest**, không mở cửa cho Invest gọi vào. Invest đẩy dữ liệu theo khuôn ở
  `packages/connect`; khuôn `.strict()` — khoá lạ bị từ chối.
- **Dữ liệu cá nhân thật không vào kho**: không tên, số điện thoại thật trong test, fixture, docs. Dùng `[Tên]`,
  `0900 000 0xx`.
- **Schema chỉ đổi bằng migration mới** trong `packages/db/migrations/NNN_*.sql`; không sửa migration đã commit.
- **RESO-first**: tên trường và giá trị theo RESO Data Dictionary khi có (`UnitNumber`, `BuildingName`, `LivingArea`…);
  đặc trưng Việt Nam mới được đặt tên riêng.
- **TypeScript chặt** ở mọi gói. Code, API, tên bảng tiếng Anh; comment nghiệp vụ và chữ UI tiếng Việt, nhãn lấy từ
  `CONTEXT.md`.
- **UI** theo ReUI trên shadcn/ui, giống onehub-invest — cài khi dựng màn đầu tiên.
- **Git**: `main` có bảo vệ nhánh, vào main chỉ qua PR có check xanh. Commit theo Conventional Commits.

## Lệnh

```bash
npm install
npm run typecheck && npm test && npm run build

# Postgres local cho bộ kiểm cách ly (dự án riêng, cổng 5544)
docker run --rm -d --name quy-hang-db -e POSTGRES_PASSWORD=quyhang -p 5544:5432 postgres:16
export DATABASE_URL=postgres://postgres:quyhang@localhost:5544/postgres
npm run db:migrate && npm run db:test

npm run dev   # http://localhost:3460 · API http://localhost:3460/api/v1/health
```
