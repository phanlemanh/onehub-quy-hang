---
schema_version: 2
feature_slug: trang-thai-rieng
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 37cac55f34d54f54736734160b612620f74b1e87
human_signoff:
---

# Evidence Report: trang-thai-rieng

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E2c | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E3c | AC-3 | test | PASS |
| E3d | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | script | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E6c | AC-7 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E7c | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E10b | AC-10 | test | PASS |
| E11 | AC-1 | ui-check | PASS |
| E12 | AC-3 | ui-check | PASS |
| E13 | AC-8 | ui-check | PASS |
| E14 | AC-1 | script | PASS |
| E14b | AC-1 | script | PASS |
| E15 | AC-7 | ui-check | PASS |

## Evidence

### Eval chạy ở round 3

- eval: E1
  run_id: minted-trang-thai-rieng-E1-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T23:27:33Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 99026.673209

- eval: E8
  run_id: minted-trang-thai-rieng-E8-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T23:27:33Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 99026.673209

- eval: E8b
  run_id: minted-trang-thai-rieng-E8b-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T23:27:33Z
  output: |
    cmd: npm test -w @quy-hang/web
    ℹ duration_ms 4168.365458

- eval: E14
  run_id: minted-trang-thai-rieng-E14-r3
  exit_code: 1
  baseline: red
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T23:27:33Z
  output: |
    Kết quả đã khai trước của eval này (đạt có giới hạn, xem Known limits), chỉ chấp nhận cùng E14b.
    16 tệp giao diện ngoài bản đồ

- eval: E14b
  run_id: minted-trang-thai-rieng-E14b-r3
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/trang-thai-rieng/kiem-khuon-e14.mjs
  verified_at: 2026-11-05T23:27:33Z
  output: |
    E14b: chỉ có dòng báo oan đã khai (1): lệch: apps/web/src/app/(app)/settings/statuses/page.tsx · thuộc hai nhóm màn: cai-dat-san, trang-tam

- eval: E11
  run_id: minted-trang-thai-rieng-E11-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T23:27:33Z
  screenshot: evidence/E11-step1.png
  observed: |
    E11-step1.png (1440): một Frame, đủ cột nhà; cột thứ hai Cài đặt có «Trạng thái» sáng; breadcrumb «Cài đặt › Sàn [Mẫu] Sàn thử › Trạng thái»; sáu nhóm theo thứ tự Chưa đủ để rao (vàng), Đang bán (xanh lục), Đang giao dịch (tím), Đã bán (xám), Tạm ngừng (cam), Ngừng hẳn (đỏ), mỗi nhóm có huy hiệu màu, chú thích «Trạng thái chuẩn · nhãn riêng nhận luật và màu này» và nút «Thêm nhãn»; nút Lưu cuối. Khớp Expected.
    E11-step2.png: dưới Đang giao dịch có dòng «Nhãn riêng» ô nhập «Giữ chỗ» («0 căn đang mang»), thẻ «Đã lưu trạng thái» ở cuối; tải lại thì ô vẫn là «Giữ chỗ». Khớp Expected.
    E11-step3.png: dưới Tạm ngừng dòng «Nhãn mới» ô «Đang bán» viền đỏ, câu đỏ «Trùng tên trạng thái «Đang bán»»; Lưu khoá (kiểm bằng DOM vì nút nằm ngoài khung nhìn). Khớp Expected.
    E11-step4.png (375): bố cục một cột, tiêu đề «Cài đặt», lối trở về «Sàn [Mẫu] Sàn thử», «Trạng thái», nhóm Chưa đủ để rao, Đang bán, Đang giao dịch với nhãn «Giữ chỗ» và nút xoá, thanh tab dưới «Cài đặt sàn / Tôi»; không cuộn ngang. Khớp Expected.
  network_observed: clean

- eval: E13
  run_id: minted-trang-thai-rieng-E13-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T23:27:33Z
  screenshot: evidence/E13-step1.png
  observed: |
    Chuẩn bị: sàn thử có nhãn «Giữ chỗ» neo Đang giao dịch với inUse 0; đã POST status_changed {to:Pending,label:giu_cho} bằng dau-chu-1 lên căn Đang bán B-14.04 (id 2afac20f-2c8b-4f27-9025-e1ba9b16185f), HTTP 200, inUse thành 1. step1.png (1440x900): /settings/statuses, bấm gỡ nhãn Giữ chỗ (màn trước đó ghi «1 căn đang mang», khớp inUse API = 1), hộp «Gỡ nhãn «Giữ chỗ»?» với nội dung «1 căn đang là «Giữ chỗ». Chuyển chúng sang:», chỉ một lựa chọn «Đang giao dịch» (không còn nhãn khác cùng nhóm), nút Giữ nhãn / Gỡ và chuyển. step2.png: sau chọn Đang giao dịch, Gỡ và chuyển, Lưu: toast «Đã lưu trạng thái — Bảng hàng và Hôm nay dùng nhãn mới từ lần mở kế», nhóm Đang giao dịch chỉ còn nút Thêm nhãn, không còn «Giữ chỗ». step3.png: /inventory 29 căn, cuộn tới Toà B 2PN, dòng B-14.04 hiện «Đang giao dịch» (chip tím); không dòng nào hiện «Giữ chỗ» (DOM không có chuỗi này; API listings: 0 căn có statusLabel; lastStatusChange fromLabel=giu_cho, toLabel=null). Lưu ý: bước bấm nhầm đầu tiên đóng hộp rồi làm lại, kết quả không ảnh hưởng. Console có 1 lỗi hydration mismatch trên /inventory (không phải lỗi mạng, chỉ ghi chú).
  network_observed: clean

### Eval mang sang (carry-forward)

- eval: E2
  run_id: minted-trang-thai-rieng-E2-r2
  exit_code: 0
  verifier: config:executors.test.core
  verified_at: 2026-11-05T23:12:06Z
  carried_from_round: 2
  ghi chú: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E2b
  run_id: minted-trang-thai-rieng-E2b-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T23:12:06Z
  carried_from_round: 2
  ghi chú: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E2c
  run_id: minted-trang-thai-rieng-E2c-r2
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-05T23:12:06Z
  carried_from_round: 2
  ghi chú: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-trang-thai-rieng-E3-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T23:12:06Z
  carried_from_round: 2
  ghi chú: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E3b
  run_id: minted-trang-thai-rieng-E3b-r2
  exit_code: 0
  verifier: config:executors.test.core
  verified_at: 2026-11-05T23:12:06Z
  carried_from_round: 2
  ghi chú: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E3c
  run_id: minted-trang-thai-rieng-E3c-r2
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-05T23:12:06Z
  carried_from_round: 2
  ghi chú: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E3d
  run_id: minted-trang-thai-rieng-E3d-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T23:12:06Z
  carried_from_round: 2
  ghi chú: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-trang-thai-rieng-E4-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T23:12:06Z
  carried_from_round: 2
  ghi chú: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E4b
  run_id: minted-trang-thai-rieng-E4b-r2
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-05T23:12:06Z
  carried_from_round: 2
  ghi chú: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-trang-thai-rieng-E5-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T23:12:06Z
  carried_from_round: 2
  ghi chú: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E5b
  run_id: minted-trang-thai-rieng-E5b-r2
  exit_code: 0
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-05T23:12:06Z
  carried_from_round: 2
  ghi chú: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-trang-thai-rieng-E6-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-05T22:54:59Z
  carried_from_round: 1
  ghi chú: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6b
  run_id: minted-trang-thai-rieng-E6b-r1
  exit_code: 0
  verifier: config:executors.test.core
  verified_at: 2026-11-05T22:54:59Z
  carried_from_round: 1
  ghi chú: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6c
  run_id: minted-trang-thai-rieng-E6c-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T23:12:06Z
  carried_from_round: 2
  ghi chú: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-trang-thai-rieng-E7-r2
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-05T23:12:06Z
  carried_from_round: 2
  ghi chú: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E7b
  run_id: minted-trang-thai-rieng-E7b-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T23:12:06Z
  carried_from_round: 2
  ghi chú: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E7c
  run_id: minted-trang-thai-rieng-E7c-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T23:12:06Z
  carried_from_round: 2
  ghi chú: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-trang-thai-rieng-E9-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T23:12:06Z
  carried_from_round: 2
  ghi chú: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E9b
  run_id: minted-trang-thai-rieng-E9b-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-05T22:54:59Z
  carried_from_round: 1
  ghi chú: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-trang-thai-rieng-E10-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-05T22:54:59Z
  carried_from_round: 1
  ghi chú: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10b
  run_id: minted-trang-thai-rieng-E10b-r2
  exit_code: 0
  verifier: config:executors.test.core
  verified_at: 2026-11-05T23:12:06Z
  carried_from_round: 2
  ghi chú: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E12
  run_id: minted-trang-thai-rieng-E12-r2
  exit_code: 0
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T23:12:06Z
  carried_from_round: 2
  ghi chú: carry-forward tu round 2 — delta khong cham paths cua eval
  screenshot: evidence/E12-step1.png
  observed: |
    E12-step1.png (1440): bảng hàng with the Trạng thái column in view; A-08.03 cell is focused and shows the green "Đang bán" badge. The editor popup lists Đang giao dịch (focused), Giữ chỗ, Giữ chỗ lần hai, Đã bán, Tạm ngừng, Ngừng hẳn, with the caption "Tính là vừa xác nhận với chủ nhà". Giữ chỗ follows Đang giao dịch directly. Matches Expected.
    E12-step2.png (1440): A-08.03 cell now shows a purple-tinted "Giữ chỗ" badge in the same style as the Đang giao dịch badges of A-13.01, A-13.03 and A-15.04. Toast "Đã đổi trạng thái A-08.03". The panel header badge reads "Đang giao dịch". Matches Expected (same color).
    E12-step3.png (1440): the Trạng thái filter shows "Đang giao dịch", counter 8 / 36 căn. Results: A-13.01 Đang giao dịch, A-08.03 Giữ chỗ, A-13.03, A-15.04, A-04.06 Giữ chỗ, B-10.01, B-14.02, B-08.04. A-08.03 stays in the results. Matches Expected.
    E12-step4.png (375): mobile Bảng hàng card list; the A-08.03 card (4,95 tỷ, 75 m², 2PN, Tây Bắc) has a "Giữ chỗ" badge on the photo, next to Đang giao dịch cards for A-13.03 and A-13.01. Matches Expected.
    E12-step5.png (1440, new context, quan-tri, avatar QU, Đã đồng bộ 06:18): the Trạng thái column shows A-08.03 as "Giữ chỗ" and A-04.06 as "Giữ chỗ" in the same purple style as Đang giao dịch. Matches Expected (label arrived through sync).
  network_observed: clean

- eval: E15
  run_id: minted-trang-thai-rieng-E15-r2
  exit_code: 0
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T23:12:06Z
  carried_from_round: 2
  ghi chú: carry-forward tu round 2 — delta khong cham paths cua eval
  screenshot: evidence/E15-step1.png
  observed: |
    E15-step1.png (1440x1000, doc truc tiep): trang Hom nay cua dau-chu-1, cuon toi cuoi. Nhom «Thieu thong tin 14» o tren (cac can 3/5). Duoi cung nhom «Moi doi 1» co mot dong: «A-11.02 · Toa A, 2PN · 68,5 m²», cot ly do «Dang ban → Giu cho — Truong nhom, hom nay», gia 3,08 ty · Bao phi, nut «Con · giu gia». Khop Expected. Assert DOM: innerText chua dung chuoi «Dang ban → Giu cho — Truong nhom, hom nay», va dong ay nam duoi tieu de nhom «Moi doi 1».
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-trang-thai-rieng-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-11-05T23:27:33Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-trang-thai-rieng-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-05T23:27:33Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-trang-thai-rieng-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-05T23:27:33Z

- cmd: npm run test:hooks
  run_id: minted-trang-thai-rieng-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-05T23:27:33Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-trang-thai-rieng-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-11-05T23:27:33Z

- cmd: npm run typecheck
  run_id: minted-trang-thai-rieng-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-11-05T23:27:33Z

- cmd: npm run lint
  run_id: minted-trang-thai-rieng-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-11-05T23:27:33Z

## Known limits

- E14 (AC-1) dat-co-gioi-han: ma thoat 1 la ket qua DA KHAI TRUOC cua eval nay, khong phai mot luot truot. Lenh: R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-khuon.mjs" --kiem --root .

## Ngoài hợp đồng

## Analyst

Eval không-phân-biệt (xanh trên cả baseline lẫn HEAD):
- npm test -w @quy-hang/web: E8b

Baseline không đo:
- node _acceptance/trang-thai-rieng/kiem-khuon-e14.mjs: bo qua baseline: tep _acceptance/trang-thai-rieng/kiem-khuon-e14.mjs co o cay dang kiem nhung chua co o merge-base 24dbfb2de227ce73a8fc9aaf6306347a8c34cd8a — eval moi, chay tren code cu khong phan biet gi

## Variance

none — mọi eval chạy một lần, xác định, không có pass_rate hỗn hợp.

## Iterations

Round 1: E6, E6b, E9b, E10 đạt và được mang sang các round sau.
Round 2: E11 và E13 chưa đạt ở lượt chạy round 2, tổng kết round là REJECT; bài chụp được sửa (tự dọn dữ liệu, đọc số căn từ màn, E13 tự chuẩn bị căn mang nhãn). Quay lại triển khai.
Round 3: E1, E8, E8b, E14, E14b, E11, E13 chạy lại và đạt; các eval còn lại mang sang vì delta không chạm paths của chúng. Verdict PASS.
