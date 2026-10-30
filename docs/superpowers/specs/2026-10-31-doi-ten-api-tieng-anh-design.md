# Đổi đường API, mã lỗi và đường màn đăng nhập sang tiếng Anh — thiết kế

Ngày 31/10/2026 · Hàng phát sinh của dãy Q, đợt nen-dau · Hồ sơ `_acceptance/doi-ten-api-tieng-anh/` · T2 · nối tiếp
ADR-0005 (đăng nhập theo sàn) và hàng 7 (mời người, vai, khu).

Câu giao (quyết của chủ kho 30/10, nguyên văn «Đổi sau hàng 7»): **đổi đường API, mã lỗi và đường màn đăng nhập sang
tiếng Anh bằng PR riêng kèm ADR nối tiếp ADR-0005.**

## 1. Bài toán

Luật kho (`AGENTS.md`, mục Luật làm việc): «Code, API, tên bảng tiếng Anh; comment nghiệp vụ và chữ UI tiếng Việt».
Hàng 6 và hàng 7 đã gộp với đường API tiếng Việt (`/api/v1/san`, `/san/thanh-vien`, `/san/khu`, `/me/san`), mười ba
mã lỗi tiếng Việt (`chua-gan-san`, `can-quan-tri`…) và ba đường màn tiếng Việt (`/dang-nhap`, `/chon-san`,
`/chua-gan-san`). Hàng này đưa chúng về tiếng Anh trước khi có màn và kết nối thứ ba gọi vào, khi giá đổi còn rẻ nhất.

Không đổi hành vi: cùng mã HTTP, cùng thân JSON (khoá thân đã là tiếng Anh), cùng luật quyền, cùng chữ trên màn.

## 2. Bảng đổi tên

Tên lấy theo từ điển `CONTEXT.md`: Sàn = `company`, Khu = `zone`, Thành viên sàn = `company_member`.

### Đường API (gốc `/api/v1`)

| Cũ | Mới |
|---|---|
| `POST /me/san` | `POST /me/company` |
| `GET /san` | `GET /company` |
| `GET, POST /san/thanh-vien` | `GET, POST /company/members` |
| `PATCH, DELETE /san/thanh-vien/{userId}` | `PATCH, DELETE /company/members/{userId}` |
| `GET, POST /san/khu` | `GET, POST /company/zones` |

`/health`, `/me`, `/auth/**`, `/openapi.json` giữ nguyên (đã là tiếng Anh).

### Mã lỗi

| Cũ | Mới | HTTP |
|---|---|---|
| `chua-dang-nhap` | `unauthenticated` | 401 |
| `khong-thuoc-san` | `not-a-member` | 403 |
| `chua-gan-san` | `no-company` | 403 |
| `can-quan-tri` | `admin-required` | 403 |
| `chon-san` | `select-company` | 409 |
| `da-la-thanh-vien` | `already-member` | 409 |
| `can-mot-quan-tri` | `last-admin` | 409 |
| `khu-trung-ten` | `zone-name-taken` | 409 |
| `vai-khong-hop-le` | `invalid-role` | 400 |
| `can-it-nhat-mot-vai` | `role-required` | 400 |
| `khu-khong-thuoc-san` | `invalid-zone` | 400 |
| `ten-khu-rong` | `zone-name-required` | 400 |
| `khong-thay` | `not-found` | 404 |

Mười ba mã sống ở MỘT chỗ — hằng `API_ERRORS` của `packages/api` — và màn đọc kiểu mã từ đó, để lần đổi sau không
phải đi tìm chuỗi rải rác. Mã lỗi nội bộ của form đăng nhập (`ma-sai`, `ma-het`, `qua-nhieu` — chỉ sống trong màn, không
qua API) đổi cùng: `invalid-code`, `code-expired`, `too-many-requests`.

### Đường màn

| Cũ | Mới |
|---|---|
| `/dang-nhap` | `/login` |
| `/chon-san` | `/select-company` |
| `/chua-gan-san` | `/no-company` |

`/settings/users` đã là tiếng Anh. Chữ trên màn giữ nguyên tiếng Việt.

## 3. Lựa chọn máy đã quyết (sổ quyết định mang căn cứ)

- **Không giữ đường cũ, không chuyển hướng** — chưa bản thật nào chạy: ADR-0005 mục 7 cấm bản thật khởi động khi thiếu
  bộ gửi email, và bộ gửi thật thuộc hàng nơi chạy chưa làm; kết nối Invest đẩy qua khuôn cấp vào, không qua các đường
  này. Đường cũ trả 404.
- **Cookie sàn đang làm `qh_san` giữ nguyên** — câu giao chỉ nêu đường API, mã lỗi, đường màn; đổi cookie làm mọi phiên
  phải chọn lại sàn và phải sửa một dòng dùng chung của `CONTEXT.md` (luật 12 của đợt).
- **Hỏi-1 · Tên tệp mã tiếng Việt** (`thanh-vien.ts`, `quan-nguoi.tsx`, `danh-sach.tsx`…) — câu của chủ kho. Khuyến
  nghị: **giữ ở hàng này**, dọn tên tệp bằng một việc nhỏ riêng; tên tệp không đổi gì cho người dùng hay bên gọi API.
  Lối khác: đổi luôn trong PR này (giá: thêm khoảng mười tệp đổi tên, diff khó soát hơn). Luật kho đòi code tiếng Anh
  nên máy không tự cắt.
- **Thẻ nhật ký mã đăng nhập dev `[ma-dang-nhap]` giữ nguyên** — bài chấm giao diện của các hàng đã ký đọc đúng thẻ này;
  nó không phải đường API hay mã lỗi.
- **Kiểm thử của gói cơ sở dữ liệu không đụng** — chúng không gọi đường API; đụng `packages/db/**` kéo hàng lên T3.
- **ADR mới số 0007** — số kế tiếp còn trống trên `origin/main` (0004 và 0006 đã dùng), theo trả lời của giám sát Q-13.

## 4. Thay đổi theo chỗ

| Người dùng / bên gọi thấy gì khác | Đụng đâu |
|---|---|
| API phục vụ ở đường mới; OpenAPI liệt đường mới | `packages/api/src/app.ts`, `thanh-vien.ts` |
| Lỗi trả mã tiếng Anh, cùng mã HTTP | hằng mới `packages/api/src/errors.ts`, `auth/company.ts` |
| Màn đăng nhập, chọn sàn, chưa gắn sàn ở đường mới | `apps/web/src/app/(auth)/*` (đổi tên thư mục), `proxy.ts`, `dang-xuat.tsx` |
| Trang chủ và màn Người dùng chuyển hướng và gọi đường mới | `apps/web/src/app/page.tsx`, `apps/web/src/app/settings/users/*` |
| Câu báo lỗi trên màn Người dùng vẫn đúng chữ Việt cũ | `quan-nguoi.tsx` (khoá theo mã mới) |
| Kiểm thử gọi đường mới, đòi mã mới | `packages/api/src/*.test.ts`, `packages/api/test-db/*` |
| Quyết định ghi lại | `docs/adr/0007-api-tieng-anh.md`, dòng thêm ở Tham chiếu §12 |

## Đặc tả UX
<!-- <<<UX-SPEC-TEMPLATE -->

### 1. Luồng

- Suôn sẻ: mở app chưa đăng nhập → về `/login` → nhập email, mã → một sàn thì vào trang chủ, nhiều sàn thì
  `/select-company` → chọn → trang chủ (điểm ra: trang chủ).
- Biên: người chưa thuộc sàn nào → `/no-company`; người không phải quản trị mở `/settings/users` → câu «Chỉ quản trị sàn
  xem được trang này.»
- Lỗi & quay lại: mã sai / hết hạn / xin quá nhiều → cùng ba câu báo như hôm nay; đăng xuất → về `/login`.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Đăng nhập `/login` | Nhận email và mã | mọi trang khi chưa có phiên / trang chủ hay Chọn sàn |
| Chọn sàn `/select-company` | Chọn sàn đang làm | sau đăng nhập khi có nhiều sàn / trang chủ |
| Chưa gắn sàn `/no-company` | Báo người chưa thuộc sàn nào | sau đăng nhập / đăng xuất |
| Người dùng `/settings/users` | Quản người của sàn (không đổi đường) | trang chủ / — |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-login-email | Đăng nhập | Ô email + nút gửi mã (không đổi) | nhập email |
| ST-select-company | Chọn sàn | Danh sách sàn của người (không đổi) | chọn một sàn |
| ST-no-company | Chưa gắn sàn | Câu báo chưa thuộc sàn nào (không đổi) | đăng xuất |
| ST-users-loi-ma-moi | Người dùng | «Email này đã là thành viên của sàn.» khi API trả `already-member` | sửa email |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Khi đã đăng nhập, đường màn cũ trả trang 404 của app, không chuyển hướng (chưa có người dùng giữ đường cũ); chưa
  đăng nhập thì mọi đường, kể cả đường cũ, về `/login` như hôm nay.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| Màn đăng nhập, chọn sàn, chưa gắn sàn | dùng | chỉ dời đường, không đổi thành phần |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: giữ nguyên khuôn của ba màn đăng nhập hàng 6; hàng này chỉ đổi đường, không đổi bố cục — không cần tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## 5. Cách đo

- Kiểm thử API (có Postgres): mọi ca đang có đổi sang đường và mã mới; thêm ca «đường cũ trả 404».
- Kiểm thử không cần Postgres: bản OpenAPI liệt đúng bộ đường mới; mỗi mã trong `API_ERRORS` là kebab-case ASCII.
- Một kịch bản quét mã nguồn API và web: không còn chuỗi đường cũ hay mã lỗi cũ nào (danh sách đóng 13 mã + 4 đường API
  + 3 đường màn); chiều đỏ: cấy lại một chuỗi cũ thì kịch bản đỏ và gọi tên chuỗi.
- Bài chấm giao diện: đi luồng đăng nhập → chọn sàn → Người dùng → mời trùng → đăng xuất ở đường mới, chụp khung.
