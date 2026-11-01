---
schema_version: 2
feature_slug: lead-bon-nac
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b724b54ddfff7f75481f9da3a155c6a5cec12956
human_signoff: Manh Phan 2026-11-01
---

# Evidence Report: lead-bon-nac

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | ui-check | PASS |
| E11 | AC-11 | ui-check | PASS |
| E12 | AC-12 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-lead-bon-nac-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-01T05:53:56Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 211.578416

- eval: E2
  run_id: minted-lead-bon-nac-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T05:53:56Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 6595.371917

- eval: E3
  run_id: minted-lead-bon-nac-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T05:53:56Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 6595.371917

- eval: E4
  run_id: minted-lead-bon-nac-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T05:53:56Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 6595.371917

- eval: E5
  run_id: minted-lead-bon-nac-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T05:53:56Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 6595.371917

- eval: E6
  run_id: minted-lead-bon-nac-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T05:53:56Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 6595.371917

- eval: E7
  run_id: minted-lead-bon-nac-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T05:53:56Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 6595.371917

- eval: E8
  run_id: minted-lead-bon-nac-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T05:53:56Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 6595.371917

- eval: E9
  run_id: minted-lead-bon-nac-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T05:53:56Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 6595.371917

- eval: E12
  run_id: minted-lead-bon-nac-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T05:53:56Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 6595.371917

- eval: E10
  run_id: E10-ui-2026-11-01
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T05:53:56Z
  screenshot: evidence/E10-step1.png
  observed: |
    Đã mở và đọc cả 11 khung.
    - step1 (1440 sáng): thẻ «Lead đã nhập» có nút «+ Lead», 3 cột Lead, Nấc, Giờ · đầu chủ. Mỗi dòng có «Toà B · chỉ biết toà» hoặc «Toà A · A-15.01», «Bán · 3,2 tỷ, đã bao phí», Badge nấc, giờ và tên đầu chủ. Dòng Trả lại nền xám, chữ đỏ «[Mẫu] Đầu chủ 2 trả lại: «Số không liên lạc được»», ô «Số mới, 0900 000 0xx» và nút đen «Sửa số và gửi lại».
    - step2 (1440 tối): cùng bố cục trên nền tối, Badge và chữ đọc rõ. Nút «Sửa số và gửi lại» và «+ Lead» đổi sang nền sáng.
    - step3 và step4 (375 sáng và tối): dòng xếp 2 đến 3 tầng, không tràn ngang. Thanh dưới Hôm nay, Lead, Tôi hiện đủ. Ảnh chụp full-page chỉ lấy tới phần cuộn trong khung nên dòng Trả lại cắt ở ô số mới.
    - step5: dòng Trả lại cũ thành Badge «Đã gửi lại» kèm «Trả lại vì … · đã gửi lại thành lead mới». Trên đầu có dòng mới «Chờ chia», 12:57, «Chưa có người nhận», «Gửi lại từ lead bị trả lại».
    - step6 (/leads/mine): giống /today, cùng 9 dòng và dòng Chờ chia đứng đầu.
    - step7 (dau-chu-1): chỉ có «Hôm nay · Giờ làm gì? · Màn này đang dựng», là chỗ tạm như trước.
    - step8 (sàn trống): thẻ «Lead đã nhập» với icon hộp thư, «Chưa có lead nào» và lời nhắc bấm «+ Lead». Nút «+ Lead» ở đầu thẻ, không có nút thứ hai trong thân.
    - step9: tiêu đề cột giữ nguyên, 5 dòng Skeleton 2 tầng 3 cột, nút «+ Lead» vẫn hiện. Độ rộng cột lệch nhẹ so với dòng thật (cột Nấc bắt đầu ở x≈385 so với 477).
    - step10: khung đỏ nhạt «Không tải được lead đã nhập · Mạng hay máy chủ không trả lời. Lead đã gửi vẫn còn nguyên.» và nút «Thử lại».
    - step11: danh sách đầy đủ trở lại, dòng Chờ chia đứng đầu.
    Tất cả khớp Expected.
  network_observed: clean

- eval: E11
  run_id: E11-lead-bon-nac-20261101
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T05:53:56Z
  screenshot: evidence/E11-step1.png
  observed: |
    Đã mở bằng Read hai ảnh E11-step1.png (/today) và E11-step2.png (/leads/mine), cả hai chụp ở 1440 rộng, telesales mẫu, sàn [Mẫu] Sàn thử. Mỗi ảnh có tiêu đề «Lead đã nhập» và bảng 9 dòng lead nhìn thấy. Mỗi dòng có toà/căn (vd «Toà A · A-15.01», «Toà B · chỉ biết toà»), «Bán · 3,2 tỷ, đã bao phí», một Badge nấc (Chờ chia, Đã gửi, Tin bổ sung, Đã gửi lại, Lên bảng, Đã gọi, Đã nhận) và giờ cùng tên đầu chủ. Dòng trả lại có lý do «Số không liên lạc được». Không có số điện thoại nào trên cả hai ảnh, và hai ảnh giống nhau. Khớp Expected: có dòng lead trên màn, không lộ số chủ. Lưu ý: /leads/mine ra cùng nội dung với /today.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-lead-bon-nac-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-01T05:53:56Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-lead-bon-nac-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-01T05:53:56Z

- cmd: npm run test:hooks
  run_id: minted-lead-bon-nac-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-01T05:53:56Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-lead-bon-nac-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-01T05:53:56Z

- cmd: npm run typecheck
  run_id: minted-lead-bon-nac-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-01T05:53:56Z

- cmd: npm run lint
  run_id: minted-lead-bon-nac-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-01T05:53:56Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không-phân-biệt (xanh ở cả code mới lẫn baseline; chứng minh harness, nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- npm test -w @quy-hang/core — E1
- npm run db:migrate && npm run db:test — E2, E3, E4, E5, E6, E7, E8, E9, E12

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval xanh, không eval nào lỗi. Không có mục chờ người chấm.

### Re-pin lần 1 — 2026-11-01, do hoá cũ do gộp nhánh chính trước chữ ký
run_id: repin-20261101T062250Z-94434
sha: b724b54ddfff7f75481f9da3a155c6a5cec12956 · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · ngoài làn máy: E10 (E10 không khai paths), E11 (E11 không khai paths) · AC không có chốt máy: AC-10, AC-11
