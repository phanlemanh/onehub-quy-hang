---
schema_version: 1
feature: "Vá sự cố bản thật 06/11: người đã đăng nhập không bị đá về màn đăng nhập khi cơ sở dữ liệu nghẽn kết nối — mỗi phiên bản máy chủ giữ ít kết nối và nhả sớm để không cạn trần 15 của pooler, và khi vẫn không đọc được phiên thì hiện trang lỗi kèm «Thử lại» thay vì chuyển về đăng nhập"
slug: va-pool-ket-noi
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
design_doc: docs/superpowers/specs/2026-11-06-va-pool-ket-noi-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-11-06T02:25:23Z
---

# Acceptance Contract: va-pool-ket-noi

## Context

Sự cố bản thật `quyhang.onehub.center` 06/11 khoảng 01:29–01:47Z: mọi trang dựng ở máy chủ chuyển người đã đăng nhập về
`/login`. Nhật ký Vercel: `EMAXCONNSESSION max clients reached in session mode - max clients are limited to pool_size: 15`
ở bước better-auth lấy kết nối; `/api/v1/me` trả 500 và vỏ coi 500 như chưa đăng nhập. Gốc và cách vá: design doc.
Không đổi cơ sở dữ liệu, không đổi chuỗi kết nối bản thật, không đổi `packages/`.

Source input: yêu cầu của phiên giám sát đợt `dau-khach-nhap` (06/11) · hàng `va-pool-ket-noi` của `docs/plan/lo-trinh.json`.

## Criteria

- AC-1: Given phản hồi của `/api/v1/me` cho trang dựng ở máy chủ, When mã là 500, 502 hay 503, Then bộ phân loại ném
  `LoiDocPhien` mang đúng mã, không trả `null`; When mã là 200 thì trả người, 401 mang `device_reported_lost` và mã người
  thì trả mã người bị báo, 401 khác thì trả `null` — đúng như trước bản vá.
- AC-2: Given `getApi()` dựng kết nối, When dựng hai pool ở hàm trang và API, Then pool danh tính và pool ứng dụng mỗi
  pool tối đa 2 kết nối; When bước chặn đầu (`proxy.ts`, một hàm riêng trên Vercel) dựng bộ pool của nó, Then mỗi pool
  tối đa 1; cả bốn nhả kết nối rảnh sau 5 giây, chờ kết nối tối đa 10 giây, đều gắn `attachDatabasePool`; pool danh tính
  giữ `search_path=identity`, pool ứng dụng không mang tham số khởi động; và số bản triển khai dự kiến (2: chính thức + xem
  trước) × (hàm trang + hàm bước chặn đầu) + kết nối của khách khác (2) nhỏ hơn hẳn trần 15 của pooler.
- AC-3: Given chỗ thử `dung-su-co.mjs` (Postgres riêng sau một công tắc mạng ở cổng 5599, phiên thật của Đầu chủ mẫu) và
  máy dev `web-su-co-pool` mở qua `127.0.0.1`, When công tắc tắt và mở `/today`, `/inventory`, `/`, `/select-company`
  bằng cookie phiên, Then địa chỉ giữ nguyên, trang hiện «Không mở được trang này» kèm nút «Thử lại», không chuyển về
  `/login`; When công tắc mở lại rồi bấm «Thử lại» trên trang lỗi của `/today`, Then màn Hôm nay hiện ra ở `/today`
  mà trang không tải lại cả trang. Không cookie thì `/today` vẫn chuyển về `/login`; có cookie mà công tắc tắt thì
  `/login` vẫn hiện ô đăng nhập.
- AC-4: Given cây sau bản vá, When so với điểm rẽ khỏi nhánh chính, Then mọi tệp đổi nằm trong danh sách cho phép đích
  danh — `apps/web/**`, `package-lock.json`, `.claude/launch.json`, `_acceptance/va-pool-ket-noi/**`, design doc và kế hoạch của hàng,
  `docs/plan/lo-trinh.json`, `docs/product/tham-chieu.md` (dòng Sổ quyết định của bản vá, luật kho), hai tệp sinh — và `_acceptance/config.yaml` chỉ thêm đúng một dòng khoá executor của hồ sơ;
  không migration, luật cách ly theo dòng, `withCompany`, lõi, API hay rào nào đổi, nên cách ly giữa công ty giữ nguyên.
- AC-5: Given cây sau bản vá, When chạy kiểm kiểu, lint (luật `quy-hang-ui`, mức nợ 0, kiểm chuẩn), build, sàn thiết kế và
  bước chấm khuôn của nhóm trạng thái, Then đều xanh.
- AC-6: Given mã nguồn `apps/web/src` (trừ bài kiểm), When soi các nơi đọc phiên, Then đúng ba tệp đọc thẳng
  `/api/v1/me` (bộ phân loại, dấu máy bị báo mất của bước chặn đầu, tab Tôi đọc trạng thái mật khẩu), chỉ màn đăng nhập
  bắt `LoiDocPhien`, và không nơi nào khác gắn `.catch` ngay sau lời gọi `readMe`/`readMeHayBiBao` — không nơi nào nuốt
  lỗi hạ tầng thành «chưa đăng nhập».

## Coverage

Liệt kê tay hai trục (descope «bỏ coverage-scan» trong sổ quyết định):

- Trục A — mã của `/api/v1/me`: 200 · 401 thường · 401 máy bị báo mất · 500 · 502 · 503 [thước CE: `docPhanHoiMe` chỉ rẽ
  theo `status` — 5xx một nhánh, 200 và 401 hai nhánh]
- Trục B — nơi đọc phiên: vỏ `(app)` · trang gốc `/` · chọn sàn · chưa gắn sàn · đăng nhập · trang trong vỏ gọi `readMe`
  · bước chặn đầu · tab Tôi ở trình duyệt [thước CE: bài soi nơi gọi của AC-6 trên cây thật — nơi đọc thẳng `/api/v1/me`,
  nơi bắt `LoiDocPhien`, `.catch` sau `readMe`]
- Trục C — pool: danh tính · ứng dụng × hàm trang · hàm bước chặn đầu [thước CE: `getApi` dựng đúng hai pool mỗi đồ thị mô-đun; bản build có hai đồ thị — trang và `/_middleware`]
- Core: A toàn bộ ở AC-1; B vỏ, `/`, chọn sàn, đăng nhập quan sát ở AC-3, mọi nơi ghim ở AC-6 (chưa gắn sàn đi cùng
  `readMe` như chọn sàn); C toàn bộ ở AC-2.
- Later: chuyển pooler sang chế độ transaction; nâng `pool_size` của Supabase; tự thử lại phía máy chủ.
- Never: báo lỗi hạ tầng bằng cách giữ người ở trang cũ — trang dựng ở máy chủ không có trang cũ để giữ.

## Out of scope

- Chuyển `DATABASE_URL` bản thật sang pooler chế độ transaction (cổng 6543) — cần đổi cách đặt `search_path` của danh tính
  và đổi biến môi trường bản thật.
- Nâng `pool_size` của pooler Supabase hay nâng gói — việc cấu hình bản thật của chủ kho.
- Cảnh báo better-auth «Rate limiting could not determine a client IP» ở trang dựng ở máy chủ.
- Chữ, bố cục, thành phần của trang lỗi.

## Notes

- Bản thật tự hồi sau 01:47Z (không lỗi mới, `/api/v1/health` 200 lúc 02:06Z) — không redeploy.
- Chạm tệp: `apps/web/src/lib/api.ts`, `api.test.ts` (mới), `apps/web/src/app/error.tsx`, `apps/web/src/app/(app)/error.tsx`,
  `apps/web/src/app/(auth)/login/page.tsx`, `apps/web/next.config.ts` (`allowedDevOrigins: ["127.0.0.1"]`, chỉ máy dev),
  `apps/web/package.json` + `package-lock.json` (`@vercel/functions` 3.10.2), `.claude/launch.json` (cấu hình
  `web-su-co-pool`), `_acceptance/config.yaml` (một khoá executor `va_pool_ket_noi`).
- Hình cho Cổng Phạm vi: trang lỗi trên máy dev khi cơ sở dữ liệu tắt — `evidence/E3-today-loi-ha-tang.jpg`.
- Máy dev qua `127.0.0.1`, không qua `localhost`: cookie không tách theo cổng, và máy dev của các dãy khác trên `localhost`
  để lại cookie phiên HttpOnly cùng tên trong trình duyệt chung — lần thử đầu trên `localhost` bị cookie lạ ấy đè.
