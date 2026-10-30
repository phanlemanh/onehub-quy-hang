# Kế hoạch thi công — doi-ten-api-tieng-anh

Hồ sơ `_acceptance/doi-ten-api-tieng-anh/` · T2 · thiết kế `docs/superpowers/specs/2026-10-31-doi-ten-api-tieng-anh-design.md`

1. **Hằng mã lỗi** — `packages/api/src/errors.ts`: `API_ERRORS` mười ba mục `{ code, status }`, kiểu `ApiErrorCode`;
   `OTP_RATE_LIMITED` cho mã 429 của better-auth. Xuất ở `index.ts` và lối con `@quy-hang/api/errors` (màn client chỉ
   nhập hằng, không kéo cả gói API). Ca `errors.test.ts` «API_ERRORS khớp bảng đổi tên» (E3b).
2. **Đường và mã ở API** — `app.ts`, `thanh-vien.ts`, `auth/company.ts`, `auth/auth.ts` dùng hằng; đường `/me/company`,
   `/company`, `/company/members`, `/company/zones`. Ca `app.test.ts` «OpenAPI liệt đúng bộ đường tiếng Anh» (E1).
3. **Màn** — đổi tên ba thư mục `(auth)` (`login`, `select-company`, `no-company`); `proxy.ts`, `dang-xuat.tsx`,
   `page.tsx`, `settings/users/*` theo đường mới; `quan-nguoi.tsx` khoá câu báo bằng `API_ERRORS`; mã nội bộ form đăng
   nhập sang tiếng Anh.
4. **Kiểm thử có Postgres** — `test-db/*` gọi đường mới, so mã qua `API_ERRORS`; thêm ca «đường cũ trả 404» (E2).
5. **Quét tên cũ** — `ten-cu.test.ts`: danh sách đóng, đối chứng dương, ca «màn đọc mã lỗi từ API_ERRORS» (E4).
6. **Tài liệu** — ADR-0007, dòng trỏ ở ADR-0005, dòng Tham chiếu §12 (E8).
7. `/verify` rồi S4.
