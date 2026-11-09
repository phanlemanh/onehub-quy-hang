---
schema_version: 2
feature_slug: hom-nay-mot-danh-sach-viec
verdict: REJECT
failed_evals: ["E11"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 51fb0b44d0225213a82107557a6de4e0fc201b42
human_signoff:
---

# Evidence Report: hom-nay-mot-danh-sach-viec

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | ui-check | PASS |
| E1b | AC-1 | ui-check | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | ui-check | PASS |
| E3 | AC-3 | ui-check | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | ui-check | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | ui-check | PASS |
| E6 | AC-6 | ui-check | PASS |
| E7 | AC-7 | ui-check | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | ui-check | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | ui-check | PASS |
| E10 | AC-10 | ui-check | PASS |
| E11 | AC-1 | script | FAIL |

Lệnh fail gắn eval: lệnh kiểm khuôn thiết kế (design-floor-khuon.mjs --kiem) chỉ phủ E11. Không có lệnh fail nào không gắn eval.

## Evidence

- eval: E1
  run_id: E1-hom-nay-mot-danh-sach-viec
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T02:49:11Z
  screenshot: evidence/E1-1440.png
  observed: |
    E1-1440.png: màn Hôm nay, breadcrumb «Quỹ hàng > Hôm nay» ở đầu, một tiêu đề «Hôm nay», dòng «30 việc · 6 quá hạn», banner «Bật thông báo lead». Dưới đó là một bảng việc đủ chiều rộng với cột Việc, Vì sao hôm nay, Chi tiết, Hành động và nhóm Lead quá hạn, Chưa chia được, Lead mới. Bảng rộng đúng bằng banner phía trên, không bị thụt. Không có khối trưởng nhóm, bảng Lead đã nhập hay Timeline. E1-1912.png: bố cục y hệt, giãn tới mép phải (vùng than 280 đến 1887), không còn dải trống hai bên như trước. Ghi chú: bảng data-grid bên trong khung thụt 5 px mỗi bên do đệm và viền của Frame ReUI; khung ngoài lệch 0 px. Chiều đỏ (dựng lại trên main cũ cho lệch 164 px) không chạy lại.
  network_observed: n-a (driver)

- eval: E1b
  run_id: minted-hom-nay-mot-danh-sach-viec-E1b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T02:49:11Z
  screenshot: evidence/E1b-step2-trong-telesales.png
  observed: |
    E1b-step2-trong-telesales.png: trang Hôm nay, tiêu đề «Không còn việc», một thẻ trống có biểu tượng hộp thư, câu «Hôm nay không còn việc» và duy nhất một nút viền «Nhập lead»; bên dưới dòng «Lead đã nhập (0)»; không có chữ «mục 22». E1b-step2-trong-dau-chu.png: một câu «Hôm nay không còn việc», một nút «Mở Bảng hàng». E1b-step2-trong-quan-tri.png: trang Cài đặt > Người dùng (/settings/users) với menu Cài đặt sẵn, không phải trang Hôm nay, không có «mục 22». Phù hợp Expected; lưu ý URL cuối là /settings/users chứ không đúng nguyên /settings.
  network_observed: n-a (driver)

- eval: E2
  run_id: minted-hom-nay-mot-danh-sach-viec-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-09T02:49:11Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 7392.332292

- eval: E2b
  run_id: minted-hom-nay-mot-danh-sach-viec-E2b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T02:49:11Z
  screenshot: evidence/E2b-1440.png
  observed: |
    E2b-1440.png: màn Hôm nay khổ 1440. Tiêu đề "30 việc · 4 quá hạn", thanh bên «Tất cả việc 30» và các nhóm với số 3/1/7/0/0/15/0/0/1/1/1/1 (cộng lại 30). Bảng có 4 cột Việc, Vì sao hôm nay, Chi tiết, Hành động. Mỗi dòng có một nút chính chữ nguyên vẹn (Giao lại, Nhận) rộng bằng nhau và một nút ⋯ bên phải, không chữ bị cắt. E2b-step2-full.png giống hệt khung nhìn nên các nhóm còn lại được kiểm bằng DOM.
  network_observed: clean

- eval: E3
  run_id: minted-hom-nay-mot-danh-sach-viec-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T02:49:11Z
  screenshot: evidence/E3-step2-truoc.png
  observed: |
    Chỉ mở trực tiếp E3-step4-sau.png và E3-step2-hop.png. E3-step2-hop.png: 4 việc, 3 quá hạn; dòng "Toà A · A-05.06" đang mở hộp "Giao cho" với ba đầu chủ kèm số lead; nhóm Chưa chia được có 1 dòng (Toà Z). E3-step4-sau.png: cả hai lead đã giao xong, còn 2 việc, 2 quá hạn; nhóm Chưa chia được có số 0 và đã mất khỏi bảng. Khớp Expected. E3-step2-sau.png không mở bằng Read, số liệu lấy từ innerText.
  network_observed: clean

- eval: E3b
  run_id: minted-hom-nay-mot-danh-sach-viec-E3b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api_db
  verified_at: 2026-11-09T02:49:11Z
  output: |
    DATABASE_URL=... npm run test:db -w @quy-hang/api
    ℹ todo 0
    ℹ duration_ms 183630.366625

- eval: E4
  run_id: minted-hom-nay-mot-danh-sach-viec-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-09T02:49:11Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 7392.332292

- eval: E4b
  run_id: minted-hom-nay-mot-danh-sach-viec-E4b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T02:49:11Z
  screenshot: evidence/E4b-step1.png
  observed: |
    step1: màn Hôm nay vai telesales, 1 việc, nhóm «Lead bị trả lại 1», dòng Toà A · A-13.04, nút «Sửa số», «Lead đã nhập (13)». step2: ngăn «Sửa số và gửi lại». step4: gõ lại chuỗi mẫu + Enter cho lỗi đỏ «Số cần mười chữ số, bắt đầu bằng 0.». step5 (số hợp lệ): «Hôm nay không còn việc», «Lead đã nhập (14)», API 14 lead, lead gốc ở stage resubmitted.
  network_observed: clean

- eval: E5
  run_id: minted-hom-nay-mot-danh-sach-viec-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-09T02:49:11Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 7392.332292

- eval: E5b
  run_id: minted-hom-nay-mot-danh-sach-viec-E5b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T02:49:11Z
  screenshot: evidence/E5b-step1-du-vai.png
  observed: |
    step1 đủ vai: Hôm nay 30 việc, sidebar có nhóm Khách phản ứng 1, Vừa đổi 1, Căn mới khớp 1; không thấy số điện thoại hay trường nguồn. step5 đầu khách: 3 việc, nhóm Khách phản ứng, Vừa đổi, Căn mới khớp đủ nút Xem phản ứng, Xem link, Gửi căn; không có số mồi. step2 đầu chủ: 18 việc, không có dòng tin khách (đúng, vai không được xem); các vai còn lại tương tự, xác nhận bằng DOM. Đối chứng: dữ liệu nguồn có mồi được mã hoá trong DB, không lộ ra dòng.
  network_observed: clean

- eval: E6
  run_id: minted-hom-nay-mot-danh-sach-viec-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T02:49:11Z
  screenshot: evidence/E6-step1.png
  observed: |
    E6-step1.png (trưởng nhóm, 1440): breadcrumb «Đội > Tổng quan» ở đầu; ba ô: Lead quá hạn 3 (Giao lại), Ngoại lệ 1, Hàng cũ 0; bảng «Theo đầu chủ» 2 dòng. Khớp lead-queue; không có «Màn này đang dựng». E6-step2.png (đầu khách): thanh bên chỉ có 3 icon, không có mục Đội; thông báo «Không thấy trang này ... không có quyền xem» và nút «Về Hôm nay».
  network_observed: clean

- eval: E7
  run_id: minted-hom-nay-mot-danh-sach-viec-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T02:49:11Z
  screenshot: evidence/E7-step2.png
  observed: |
    E7-step2.png (1440x900, tối): bên trái cột thứ hai «ĐÃ GỬI» với mục «Tin của khách» sáng; vùng chính có đường dẫn, tiêu đề, nhóm HÔM NAY (3) dạng dòng tin dọc gồm ba thẻ Căn mới, Vừa đổi, Khách phản ứng. Cột tin rộng 768 px, nằm giữa vùng nội dung, khoảng trống hai bên cân nhau. Khớp Expected.
  network_observed: n-a (driver)

- eval: E8
  run_id: minted-hom-nay-mot-danh-sach-viec-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-09T02:49:11Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 7392.332292

- eval: E8b
  run_id: minted-hom-nay-mot-danh-sach-viec-E8b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T02:49:11Z
  screenshot: evidence/E8b-step2.png
  observed: |
    E8b-step2.png: cột «HÔM NAY» với «Tất cả việc 29» sáng, «Lead trễ giờ nhận 2» ở cả cột và tiêu đề nhóm trong thân; số các mục khớp, mục số 0 không có nhóm thân. E8b-step2-500.png: «Tất cả việc 26», ba mục tin khách không có số, banner đỏ «Chưa tải được tin của khách» kèm «Thử lại». E8b-step3-la.png: /today?nhom=la sáng «Tất cả việc», banner «Không có hàng đợi này». Hai ảnh step3-today và step3-nhom chỉ kiểm bằng DOM. Lưu ý: aria-current toàn trang là 3 (cột, breadcrumb, home rail); đọc «đúng một» là trong cột thứ hai.
  network_observed: clean

- eval: E9
  run_id: minted-hom-nay-mot-danh-sach-viec-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-09T02:49:11Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 7392.332292

- eval: E9b
  run_id: minted-hom-nay-mot-danh-sach-viec-E9b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T02:49:11Z
  screenshot: evidence/E9b-1440.png
  observed: |
    E9b-1440.png: sau khi chặn lead-queue trả lỗi, trang 26 việc · 3 quá hạn có một khung đỏ nhạt «Chưa tải được lead quá hạn / Các nhóm còn lại vẫn đúng.» kèm một nút «Thử lại»; nhóm Lead mới (7) và Thiếu thông tin (15) vẫn hiện; thanh bên không có số cho hai nhóm lỗi. E9b-step3.png: đúng một dải «Đang xem bản đã tải — mất mạng». E9b-step4.png: có mạng lại, không còn dải hay dòng lỗi. Khớp Expected.
  network_observed: clean

- eval: E10
  run_id: E10-20261109
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T02:49:11Z
  screenshot: evidence/E10-step2-truong-nhom.png
  observed: |
    E10-step2-dau-chu.png (375 rộng): nhóm Lead mới 3, tên căn đầy đủ cạnh nút Nhận và ⋯, dòng chi tiết cắt bằng dấu ba chấm, không có «mở trên máy tính». E10-step2-ngan-day.png: ngăn đáy «Giao cho đầu chủ» với ô tìm và danh sách đầu chủ kèm số lead. E10-step2-sau.png: ngăn đã đóng, hàng đợi còn 3 việc · 2 quá hạn, dòng A-05.06 đã mất. Khớp Expected.
  network_observed: clean

- eval: E11
  run_id: minted-hom-nay-mot-danh-sach-viec-E11-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-09T02:49:11Z
  output: |
    sai: design/patterns/hom-nay-dau-khach.md: mau_dang_chay.tep không có: apps/web/src/app/(app)/today/buyer/vung.tsx
    sai: design/patterns/hom-nay-truong-nhom.md: mau_dang_chay.tep không có: apps/web/src/app/(app)/today/truong-nhom.tsx
    bản đồ nhóm hom-nay-dau-chu, hom-nay-dau-khach, hom-nay-truong-nhom, lead-cua-toi, trang-tam đổi sau khi ghim — chấm theo bản ghim
    lệch: apps/web/src/app/(app)/shares/tin/page.tsx · khuôn Placeholder · nhóm trang-tam
    lệch: apps/web/src/app/(app)/team/page.tsx · khuôn Placeholder · nhóm trang-tam
    nợ cũ: apps/web/src/app/(app)/today/page.tsx · thuộc hai nhóm màn: hom-nay-dau-chu, hom-nay-truong-nhom, lead-cua-toi, trang-tam
    33 tệp giao diện ngoài bản đồ

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-hom-nay-mot-danh-sach-viec-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-09T02:49:11Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-hom-nay-mot-danh-sach-viec-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-09T02:49:11Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-hom-nay-mot-danh-sach-viec-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-09T02:49:11Z

- cmd: npm run test:hooks
  run_id: minted-hom-nay-mot-danh-sach-viec-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-09T02:49:11Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-hom-nay-mot-danh-sach-viec-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-09T02:49:11Z

- cmd: npm run typecheck
  run_id: minted-hom-nay-mot-danh-sach-viec-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-09T02:49:11Z

- cmd: npm run lint
  run_id: minted-hom-nay-mot-danh-sach-viec-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-09T02:49:11Z

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «This session is isolated in the worktree /Users/manhphan/dev/onehub-quy-hang/.claude/worktrees/hom-nay-mot-danh-sach-viec, but this command is too complex to verify that it stays inside the worktree. Refusing to run it — a worktree-isolated»

Eval không-phân-biệt: không đo được ở round này (baseline bị chặn hạ tầng, mọi field baseline là n-a).

Baseline khong do:
- npm test -w @quy-hang/web: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «This session is isolated in the worktree /Users/manhphan/dev/onehub-quy-hang/.claude/worktrees/hom-nay-mot-danh-sach-viec, but this command is too complex to verify that it stays inside the worktree. Refusing to run it — a worktree-isolated»
- DATABASE_URL=${DATABASE_URL:-postgres://postgres:quyhang@localhost:5575/postgres} npm run test:db -w @quy-hang/api: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «This session is isolated in the worktree /Users/manhphan/dev/onehub-quy-hang/.claude/worktrees/hom-nay-mot-danh-sach-viec, but this command is too complex to verify that it stays inside the worktree. Refusing to run it — a worktree-isolated»
- R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-khuon.mjs" --kiem --root .: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «This session is isolated in the worktree /Users/manhphan/dev/onehub-quy-hang/.claude/worktrees/hom-nay-mot-danh-sach-viec, but this command is too complex to verify that it stays inside the worktree. Refusing to run it — a worktree-isolated»

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E11 failed — kiểm khuôn thiết kế báo hai khuôn (hom-nay-dau-khach, hom-nay-truong-nhom) trỏ tới tệp mẫu đang chạy không còn tồn tại, bản đồ nhóm đổi sau khi ghim, và trang tạm còn lệch khuôn. Returned to implementation.
