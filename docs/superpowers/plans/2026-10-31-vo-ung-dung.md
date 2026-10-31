# Kế hoạch thi công — vỏ ứng dụng (vo-ung-dung, hàng 53)

Hợp đồng `_acceptance/vo-ung-dung/contract.md` (duyệt 31/10, Hỏi-1..4). Vỏ điện thoại đã có bản bấm được, chủ kho gật
khung. Mọi task chạy tuần tự trong phiên chính (cùng chạm `components/shell/`, không task nào `independent`).

| # | Task | Tệp | Kiểm từng task | Phục vụ |
|---|---|---|---|---|
| 1 | Lõi: nhà của đường, mặc định cột thứ hai, khoá nhớ, giải ô gõ mã căn | `packages/core/src/navigation.ts`, `navigation.test.ts` | `npm test -w @quy-hang/core` | E1, E2 |
| 2 | Vỏ máy tính: chuyển thể `app-shell-8` vào `components/shell/` (cột nhà, thanh trên, chọn sàn, nút theo vai, chuông, menu tài khoản, sáng/tối, cột thứ hai, tay nắm); gỡ thư mục cài `components/blocks/` | `apps/web/src/components/shell/*` | `npm run typecheck && npm run lint` | E3, E4, E5, E7 |
| 3 | Vỏ chung hai khổ: vỏ điện thoại đã gật ghép vào cùng khung, một mã đổi theo `md:` | `components/shell/app-shell.tsx`, `mobile-shell.tsx` | như trên | E5, E6 |
| 4 | Nhóm `(app)` + `settings/layout.tsx` dựng vỏ; trang giữ chỗ; `/` chuyển tới nhà mở đầu; gỡ đường bản mẫu | `apps/web/src/app/(app)/**`, `app/settings/layout.tsx`, `app/settings/page.tsx`, `app/page.tsx` | build + mở `/` | E8, E9 |
| 5 | Sáng/tối: `next-themes` ở gốc | `apps/web/src/app/layout.tsx` | E13 | E13 |
| 6 | Dữ liệu mẫu vai cho bài nhìn | `_acceptance/vo-ung-dung/thu/vai-mau.mjs` | chạy trên Postgres 5546 | E3–E7 |
| 7 | Tài liệu: `vo-va-ia.md`, `catalog.md`, Tham chiếu §9 | docs | E14, lint kiểm chuẩn | E14 |

Lựa chọn gánh tải: tay nắm cột thứ hai và nút «Gõ mã căn» của khối dùng thẻ `<button>` trần — chuyển sang `Button`
của kho (luật `no-raw-controls`), giữ vị trí và hành vi. Nhớ cột thứ hai bằng một cookie `qh_cot2` (JSON, khoá
`<người>:<sàn>:<nhà>`), máy chủ đọc nên không nháy.
