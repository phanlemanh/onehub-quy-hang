# Trang khách (hàng 35) — kế hoạch thi công

Thiết kế: `docs/superpowers/specs/2026-11-04-trang-khach-rieng-design.md` · hợp đồng
`_acceptance/trang-khach-rieng/contract.md` (duyệt 04/11, Manh Phan; Hỏi-1…6 theo khuyến nghị — lối ReUI) · evals
`_acceptance/trang-khach-rieng/evals.yaml`. Hạng T3 — Gate 1.5 duyệt kế hoạch này.

Ràng buộc chung: dữ liệu ra dựng bằng `banRaNgoai` (bất biến 4); không cột lớp `source` nào qua route công khai (bất
biến 2); bảng mới bật `enable` + `force row level security`, ghi chỉ qua hàm (bất biến 1); trang không gửi gì thay ai
(bất biến 3). Migration số 031 (luật đợt 25). Postgres dãy L cổng 5571, dev 3491. Web test `.ts` (node:test,
`createElement` + `renderToStaticMarkup`).

## Task 1 — Gỡ trang ba lối

- Files: xoá `apps/web/src/app/s/ba-loi/**`; một dòng `decisions.jsonl` (luật đợt 45: lối đã chọn, ảnh giữ ở
  `_acceptance/trang-khach-rieng/ba-loi/`).
- Verify: `ls apps/web/src/app/s` không còn `ba-loi`; `npm run lint` không còn dòng «ngoai-ban-do».
- Phục vụ E3c. `independent: true`.

## Task 2 — Migration 031: sự kiện của Lần gửi và hàm theo mã

- Files: `packages/db/migrations/031_trang_khach.sql`, `packages/db/tests/isolation.test.mjs`.
- Nội dung:
  - Bảng `share_events` (company_id, id, share_id, type `link_opened`|`interest`, listing_id null với `link_opened`,
    visitor text 8–64 ký tự, day date, created_at); khoá ngoại về `shares`, `share_listings`; duy nhất (company, share,
    visitor, day) cho `link_opened`, (company, share, listing, visitor) cho `interest`; `enable` + `force row level
    security`; đọc theo `app.current_company_id()` và luật đọc của `shares`; không grant insert cho `quy_hang_app`.
  - `app.share_by_code(p_code text)` security definer: đúng một dòng (company_id, share_id, sender_user_id, audience,
    active) — `active` = `disabled_at is null` và người gửi còn là thành viên sàn (Hỏi-6); mã sai khuôn hay không có →
    0 dòng; grant execute cho `quy_hang_app`.
  - `app.record_share_event(p_code, p_type, p_listing, p_visitor)` security definer: từ chối khi Lần gửi không active,
    type lạ, `interest` với căn không thuộc Lần gửi hay không còn Đang bán; trùng → không thêm (on conflict do
    nothing), trả `inserted boolean`.
  - Bộ kiểm cách ly: `share_events` vào danh sách bảng; ca «hàm theo mã không vượt sàn» (E9).
- Verify: `npm run db:migrate && npm run db:test` trên 5571 + phá thử (bỏ `force row level security` → bộ kiểm đỏ nêu
  bảng).
- Phục vụ E9 (và nền cho E1, E4b, E5b, E6, E7). `independent: false`.

## Task 3 — Lõi: tên sự kiện và thân trang khách

- Files: `packages/core/src/sharing/trang-khach.ts`, `packages/core/src/sharing/trang-khach.test.ts`,
  `packages/core/src/sharing/index.ts` (xuất thêm).
- Nội dung: `SU_KIEN_LAN_GUI = { mo: "link_opened", quanTam: "interest" }` (hằng số đo hàng 52 đọc);
  `thanTrangKhach({ can: CanNoiBo[], nguoiNhan, today, cauHinh? })` → `{ companyName, senderName, nguoiNhan, can:
  CanRaNgoai[] }` — mỗi căn qua `banRaNgoai(…, { cua: "gui_link" })`, giữ thứ tự; `nguoiNhanCua(audience)`
  (`client` → `khach_rieng`, `agents` → `nhom_moi_gioi`).
- Verify: `npm test -w @quy-hang/core` + phá thử (trả hàng nội bộ → ca khoá đỏ).
- Phục vụ E1, E8. `independent: true`.

## Task 4 — API: ba route công khai và rào route

- Files: `packages/api/src/public/routes.ts`, `packages/api/src/public/store.ts`, `packages/api/src/public/doc.ro-ri.test.ts`,
  `packages/api/src/public/rao-route.test.ts`, `packages/api/src/app.ts` (thêm một dòng đăng ký), `packages/api/src/app.test.ts`
  (thêm ba route vào danh sách), `packages/api/test-db/trang-khach.test.ts`, `package.json` gốc (lệnh `test:ro-ri` quét
  thêm `packages/api/src/**/*.ro-ri.test.ts` nếu chưa quét).
- Nội dung:
  - `GET /api/v1/public/shares/{code}`: `share_by_code` (vai `quy_hang_app` không người) → không active → 404; active →
    `withCompany(company, sender)` đọc căn của Lần gửi theo `position` bằng các store sẵn có (lần rao, danh mục, ảnh ngăn
    gửi được) → `CanNoiBo[]` → `thanTrangKhach` → 200, `Cache-Control: no-store`.
  - `POST /api/v1/public/shares/{code}/events`: thân `.strict()` `{type, visitor, listingId?}` → `record_share_event` →
    201 khi thêm, 200 khi trùng, 404 khi không active, 409 khi căn không ghi được, 400 khi thân sai.
  - `GET /api/v1/public/shares/{code}/photos/{photoId}`: chỉ ảnh có id trong bản ra của chính Lần gửi → byte ảnh; còn
    lại 404.
  - Rào: `routeCongKhai(app)` đọc route đã đăng ký trên app Hono thật; `timRouteThieuKiem(app, goc)` trả route dưới
    `/api/v1/public/` chưa có tệp `*.ro-ri.test.ts` dưới `packages/api/src` nêu đúng đường ấy.
  - Bài test-db: E1, E3b, E4b, E5b, E6 (thêm ca người gửi bị gỡ khỏi sàn), E7 (kho ảnh giả của bộ kiểm).
- Verify: `node --import tsx --test packages/api/test-db/trang-khach.test.ts` trên 5571; `npm run test:ro-ri`; `npm test -w
  @quy-hang/api`; phá thử (trả hàng nội bộ; bỏ lọc disabled; bỏ kiểm ngăn ảnh; xoá dòng nêu route ảnh).
- Phục vụ E1, E3b, E4b, E5b, E6, E7, E8. `independent: false` (Task 2, 3).

## Task 5 — Web: trang `/s/[code]` theo lối ReUI

- Files: `apps/web/src/proxy.ts` (đã sửa ở S1), `apps/web/src/proxy.test.ts`, `apps/web/src/app/s/[code]/page.tsx`,
  `khung.tsx` (khuôn `KhungTrangKhach`), `the-can.tsx` (thẻ `wishlist-3`), `chi-tiet.tsx` (`product-detail-5`, mở bằng
  `?can=<thứ tự>`), `su-kien.ts` (+ `quan-tam.tsx` client), `trang.test.ts`, `su-kien.test.ts`, `trang.ro-ri.test.ts`.
- Nội dung: trang máy chủ đọc route công khai qua `getApi().request` với `cache: "no-store"`, `export const dynamic =
  "force-dynamic"`, `robots: noindex`; 404 → «Link không còn mở được — hỏi lại người gửi»; thẻ theo trạng thái (Hỏi-4);
  huy hiệu rõ, chỉ ảnh và giá mờ (finding 4 của design-pass); bỏ dòng toà lặp ở khách riêng (finding 3); `su-kien.ts`
  thuần: `taoBaoMo({goi, kho})` (một lần mỗi phiên, mã máy trong `localStorage`, kho ném lỗi → mã tạm) và
  `taoQuanTam({goi})` (khoá sau lần đầu, lỗi mạng → thử lại).
- Verify: `npm test -w @quy-hang/web`; `npm run test:ro-ri`; phá thử (dựng tên từ unitNumber bất kể người nhận; bỏ cờ đã
  gửi; bỏ force-dynamic; bỏ dòng mở `/s/` của proxy).
- Phục vụ E1b, E2, E3, E3c, E4, E5, E6b, E11. `independent: false` (Task 4).

## Task 6 — Khuôn, tài liệu, lưới giao diện

- Files: `design/patterns/trang-khach.md` (nhóm `trang-khach`, `nhan_dien: ["apps/web/src/app/s/**/page.tsx"]`, khuôn
  `KhungTrangKhach`, bố cục danh sách → chi tiết), `.agents/skills/quy-hang-ui/SKILL.md` (một dòng),
  `packages/ui-lint/tests/*` (số nhóm 14, nhóm mới), `docs/product/tham-chieu.md` (một dòng thêm, luật đợt 12),
  `docs/design/vo-va-ia.md` (dòng «Khối đã chuyển thể» của trang khách, thêm dòng).
- Verify: `npm run lint` («chuẩn giao diện: đạt», «khuôn: 14 nhóm · 0 lệch»); `npm test -w @quy-hang/ui-lint`; lệnh khuôn
  `design-floor-khuon.mjs --kiem` không dòng «lệch:».
- Phục vụ E10, E12. `independent: false` (Task 5).

Thứ tự: 1 → 2 → 3 → 4 → 5 → 6 (Task 1 và 3 độc lập nhưng nhỏ — chạy tuần tự trong phiên, không tách worktree).
