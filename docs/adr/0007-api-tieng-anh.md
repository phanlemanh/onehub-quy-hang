# ADR-0007: Đường API, mã lỗi và đường màn đăng nhập bằng tiếng Anh

Ngày: 2026-10-31 · Trạng thái: **accepted** (Manh Phan duyệt Cổng Phạm vi hồ sơ `doi-ten-api-tieng-anh` 31/10; quyết
của chủ kho 30/10 «Đổi sau hàng 7») · Nối tiếp: ADR-0005 (đăng nhập theo sàn), ADR-0006 (vai, khu, lời mời)

## Bối cảnh

Luật kho (`AGENTS.md`, mục Luật làm việc): code, API, tên bảng tiếng Anh; comment nghiệp vụ và chữ UI tiếng Việt. Hàng 6
và hàng 7 gộp với đường API, mã lỗi và đường màn đăng nhập tiếng Việt. Chưa bản thật nào chạy (ADR-0005 mục 7: thiếu bộ
gửi email thì bản thật không khởi động) và kết nối Invest đẩy qua khuôn cấp vào chứ không gọi các đường này — đổi bây
giờ không gãy bên gọi nào, và rẻ hơn mọi lúc sau.

## Quyết định

1. **Đường API** (gốc `/api/v1`) theo từ điển `CONTEXT.md` (Sàn = `company`, Khu = `zone`, Thành viên sàn =
   `company_member`):

   | Cũ | Mới |
   |---|---|
   | `POST /me/san` | `POST /me/company` |
   | `GET /san` | `GET /company` |
   | `GET, POST /san/thanh-vien` | `GET, POST /company/members` |
   | `PATCH, DELETE /san/thanh-vien/{userId}` | `PATCH, DELETE /company/members/{userId}` |
   | `GET, POST /san/khu` | `GET, POST /company/zones` |

   `/health`, `/me`, `/auth/**`, `/openapi.json` giữ nguyên.

2. **Mã lỗi** — cùng mã HTTP, cùng thân `{ "error": <mã> }`:

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

   Mười ba mã sống ở một hằng `API_ERRORS` (`packages/api/src/errors.ts`, cũng xuất ở `@quy-hang/api/errors`); màn đọc
   kiểu mã từ đó để tra câu báo tiếng Việt. Mã giới hạn xin mã đăng nhập của better-auth (429) đổi `xin-ma-qua-nhieu` →
   `too-many-code-requests`, ở cùng tệp. Mã nội bộ form đăng nhập đổi `ma-sai`, `ma-het`, `qua-nhieu` → `invalid-code`,
   `code-expired`, `too-many-requests`.

3. **Đường màn**: `/dang-nhap` → `/login`, `/chon-san` → `/select-company`, `/chua-gan-san` → `/no-company`. Chữ trên màn
   giữ nguyên tiếng Việt.

4. **Không giữ đường cũ, không chuyển hướng** — đường API cũ và đường màn cũ trả 404.

5. **Ba thứ cố ý giữ**:
   - cookie sàn đang làm `qh_san` — đổi thì mọi phiên phải chọn lại sàn, và câu giao không nêu cookie;
   - tên tệp mã tiếng Việt (`thanh-vien.ts`, `quan-nguoi.tsx`, `danh-sach.tsx`…) — chủ kho chọn ở Cổng Phạm vi (Hỏi-1):
     dọn bằng một việc nhỏ riêng, vì tên tệp không đổi gì cho người dùng hay bên gọi API;
   - thẻ nhật ký mã đăng nhập dev `[ma-dang-nhap]` — bài chấm giao diện của các hàng đã ký đọc đúng thẻ này.

## Hệ quả

- Kiểm thử `ten-cu.test.ts` quét mã nguồn API và web bằng danh sách đóng các tên cũ; cấy lại một chuỗi cũ là CI đỏ.
- Mã lỗi mới thêm vào `API_ERRORS`, không viết chuỗi rời ở route hay màn.
- Việc dọn tên tệp tiếng Việt còn nợ — một PR đổi tên thuần, không đổi hành vi.
