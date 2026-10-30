---
schema_version: 2
feature_slug: doi-ten-api-tieng-anh
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 52c0a32e16bc73d887a58dea709bb9813e106b35
human_signoff: Manh Phan 2026-10-31
---

# Evidence Report: doi-ten-api-tieng-anh

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | ui-check | PASS |
| E6 | AC-6 | ui-check | PASS |
| E6b | AC-6 | test | PASS |
| E7 | AC-7 | judgment | PASS |
| E8 | AC-8 | judgment | PASS |

## Evidence

- eval: E1
  run_id: minted-doi-ten-api-tieng-anh-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-10-30T22:22:08Z
  output: |
    npm test -w @quy-hang/api
    ca «OpenAPI liệt đúng bộ đường tiếng Anh» ok
    ℹ duration_ms 60360.498083

- eval: E3b
  run_id: minted-doi-ten-api-tieng-anh-E3b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-10-30T22:22:08Z
  output: |
    npm test -w @quy-hang/api
    ca «API_ERRORS khớp bảng đổi tên» ok
    ℹ duration_ms 60360.498083

- eval: E4
  run_id: minted-doi-ten-api-tieng-anh-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-10-30T22:22:08Z
  output: |
    npm test -w @quy-hang/api
    ca «không còn tên tiếng Việt cũ trong mã nguồn» ok
    ca «màn đọc mã lỗi từ API_ERRORS» ok
    ℹ duration_ms 60360.498083

- eval: E2
  run_id: minted-doi-ten-api-tieng-anh-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T22:22:08Z
  output: |
    npm run db:migrate && npm run db:test
    ca «đường cũ trả 404» ok
    ℹ duration_ms 896.365959

- eval: E3
  run_id: minted-doi-ten-api-tieng-anh-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T22:22:08Z
  output: |
    npm run db:migrate && npm run db:test
    mọi ca của test-db và bộ cách ly ok
    ℹ duration_ms 896.365959

- eval: E6b
  run_id: minted-doi-ten-api-tieng-anh-E6b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T22:22:08Z
  output: |
    npm run db:migrate && npm run db:test
    ca «mời: email đã là thành viên ... already-member» ok
    ca «quản trị cuối ... last-admin» ok
    ℹ duration_ms 896.365959

- eval: E5
  run_id: minted-doi-ten-api-tieng-anh-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-10-30T22:22:08Z
  screenshot: evidence/E5-step1.png
  observed: |
    Đã mở và đối chiếu từng khung. step1: thẻ "Đăng nhập Quỹ hàng", ô Email và nút "Gửi mã" (ST-login-email); khung chụp không có thanh địa chỉ, nên /login được xác nhận bằng URL của trang, không bằng pixel. step2: "Chọn sàn làm việc" với [Sàn mẫu DT-A] và [Sàn mẫu DT-B] và nút Đăng xuất, URL /select-company. step3: "Quỹ hàng / Bạn đang làm ở sàn [Sàn mẫu DT-A]", URL /. step4: trang 404 "This page could not be found." (chụp ở /chon-san). step5: về lại form "Đăng nhập Quỹ hàng", URL /login. step6: "Chưa thuộc sàn nào – Tài khoản dt-khong-san@example.test chưa thuộc sàn nào. Nhờ quản trị sàn mời bạn.", URL /no-company. Cả sáu khớp Expected. Ở step2 đến step3 có huy hiệu "1 Issue" của lớp phủ Next dev; xem phần ghi chú.
  network_observed: clean

- eval: E6
  run_id: minted-doi-ten-api-tieng-anh-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-10-30T22:22:08Z
  screenshot: evidence/E6-step1.png
  observed: |
    step1.png: trang /settings/users, tiêu đề «Người dùng / Người của sàn [Sàn mẫu DT-C]», mục Thành viên có đúng một dòng dt-mot-san@example.test nhãn «Quản trị sàn», nút Sửa và Rời sàn, nút Mời người, mục Khu có ô Tên khu và nút Thêm khu. step2.png: form mời mở, email dt-moi@example.test, ô Đầu chủ đã chọn, dòng đỏ «Email này đã là thành viên của sàn.», danh sách đã có dt-moi@example.test nhãn «Đầu chủ» ở trên dt-mot-san; không thấy chữ already-member. step3.png: hộp thoại «Bỏ dt-mot-san@example.test khỏi sàn?» có dòng đỏ «Sàn cần ít nhất một quản trị.», nút Huỷ và Bỏ khỏi sàn; không lộ mã last-admin. Cả ba khớp expected. Lệch nhỏ: danh sách và khu được gọi trong tiến trình máy chủ (page.tsx dòng 19 và 33), nên không hiện trên nhật ký mạng trình duyệt; E5 đã ghi nhận hạn chế này.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-doi-ten-api-tieng-anh-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-10-30T22:22:08Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-doi-ten-api-tieng-anh-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-10-30T22:22:08Z

- cmd: npm run test:hooks
  run_id: minted-doi-ten-api-tieng-anh-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-10-30T22:22:08Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-doi-ten-api-tieng-anh-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-10-30T22:22:08Z

- cmd: npm run typecheck
  run_id: minted-doi-ten-api-tieng-anh-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-10-30T22:22:08Z

- cmd: npm run lint
  run_id: minted-doi-ten-api-tieng-anh-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-10-30T22:22:08Z

### Judgment (hội đồng đề xuất, chờ người)

Đề xuất panel E7: PASS (3/3). Đề xuất panel E8: PASS (3/3). human_override để trống cho người quyết ở Cổng 2.

- eval: E7
  judged_by: judge panel (fresh context) — đề xuất PASS
  domain-correctness: PASS — Trong sáu tệp, mọi tiêu đề, nhãn, nút và câu báo lỗi đều là tiếng Việt. Mã tiếng Anh chỉ làm khoá tra: "invalid-code" trong form.tsx tra ra CHU_LOI, còn `error` của API trong quan-nguoi.tsx tra ra bảng CHU, cả hai có câu dự phòng tiếng Việt. Không có chỗ nào in thẳng `error` hay `code` của API ra màn. Nhãn vai (`nhanVai`/`VAI` trong `@/lib/vai`) nằm ngoài danh sách tệp được giao nên không xét.
  operational-feasibility: PASS — Sáu tệp đều có chữ người dùng nhìn thấy bằng tiếng Việt. Mã lỗi chỉ dùng làm khoá tra, có chuỗi dự phòng "Có lỗi, thử lại.". Không in thẳng `error`, `code` hay đường API ra màn. Tên công ty và email là dữ liệu của người dùng.
  spec-alignment: PASS — Mọi chữ hiện ra đều là tiếng Việt. `form.tsx` đổi mã sang `CHU_LOI` rồi mới hiện chữ, `quan-nguoi.tsx` tra bảng `CHU` và rơi về "Có lỗi, thử lại." Không in thẳng `error`, `code` hay đường API.
  human_override:  # chi nguoi ghi

- eval: E8
  judged_by: judge panel (fresh context) — đề xuất PASS
  domain-correctness: PASS — ADR-0007 có bảng đổi đường API (mục 1), bảng 13 mã lỗi cùng mã nội bộ (mục 2), đường màn (mục 3), lý do đổi (Bối cảnh) và ba thứ cố ý giữ (qh_san, tên tệp tiếng Việt, thẻ [ma-dang-nhap]) ở mục 5. ADR-0005 dòng 38 trỏ sang ADR-0007, Tham chiếu có dòng 31/10 trong sổ quyết định (dòng 307).
  operational-feasibility: PASS — ADR-0007 có bảng đường API (mục 1), bảng mã lỗi (mục 2), đường màn (mục 3), lý do ở Bối cảnh, ba thứ giữ ở mục 5. ADR-0005 trỏ sang ADR-0007. Tham chiếu §12 có dòng 31/10 trỏ tới ADR-0007.
  spec-alignment: PASS — ADR-0007 có đủ bảng đường API, bảng mã lỗi, đường màn, lý do và ba thứ giữ. ADR-0005 dòng 38 trỏ sang ADR-0007. Tham chiếu §12 dòng 307 (ngày 31/10) ghi quyết định này.
  human_override:  # chi nguoi ghi

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

Mọi field baseline ghi n-a; danh sách eval không-phân-biệt không đo được ở round này.

### Baseline khong do

- npm test -w @quy-hang/api: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- npm run db:migrate && npm run db:test: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

Eval không-phân-biệt: không đo được vì baseline bị chặn hạ tầng.

Ghi chú từ verifier E5: (a) Trình duyệt Playwright dùng chung với verifier E6 nên chạy trong context riêng. (b) Lời gọi send-verification-otp được ghi từ kết quả script đầu vì listener chưa gắn lúc đó. (c) Không có công cụ chụp capture.ui nên dùng Playwright screenshot, khung không có thanh địa chỉ. (d) Log máy chủ dev có lỗi biên dịch "Cannot find module '@tailwindcss/postcss'" và "Can't resolve '@base-ui/react/button'", ngoài phạm vi E5; huy hiệu "1 Issue" của Next dev có thể liên quan, chưa tra ra nguyên nhân. Chỉ ghi chú, không tính fail.

## Variance

none — mọi eval đều deterministic (một lần chạy), không có eval nhiều lần.

## Iterations

Round 1: mọi eval máy và ui-check đạt; E7, E8 hội đồng đề xuất PASS, chờ người ở Cổng 2. Baseline bị chặn hạ tầng.
