---
schema_version: 2
feature_slug: va-ho-so-lien-he
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 942e76185f1bf63e84284fa91772101770885085
human_signoff:
---

# Evidence Report: va-ho-so-lien-he

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | judgment | PASS |
| E4 | AC-3 | script | PASS |
| E5 | AC-3 | script | PASS |
| E6 | AC-3 | ui-check | PASS |
| E7 | AC-3 | test | PASS |

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline): E1 và E7 (lệnh `npm run db:migrate && npm run db:test`). Cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý.

## Variance

none — mọi eval chạy một lần, xác định, không có phương sai.

## Evidence

- eval: E1
  run_id: minted-va-ho-so-lien-he-E1-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T12:30:09Z
  output: |
    bộ kiểm cách ly và ma trận vai chạy trong lệnh db:test, kết quả xanh
    ℹ duration_ms 91792.537625

- eval: E7
  run_id: minted-va-ho-so-lien-he-E7-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T12:30:09Z
  output: |
    ca xem thêm với con trỏ của loại cũ chạy trong lệnh db:test, kết quả xanh
    ℹ duration_ms 91792.537625

- eval: E2
  run_id: minted-va-ho-so-lien-he-E2-r2
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-05T11:54:00Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-va-ho-so-lien-he-E4-r2
  exit_code: 0
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T11:54:00Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-va-ho-so-lien-he-E5-r2
  exit_code: 0
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-05T11:54:00Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E6
  run_id: E6-ui-2026-11-05
  exit_code: 0
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T11:54:00Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval
  screenshot: evidence/E6-step1.png
  observed: |
    E6-step1.png: trang Liên hệ, mục «Chủ bán» đang chọn, tiêu đề «50+ liên hệ», các dòng là «[Tên] Thử xem thêm 29…17», cột Loại đều là «Chủ bán», người giữ [Mẫu] Đầu chủ 1. Nút «Xem thêm» nằm dưới danh sách, ngoài khung hình trên màn 1440x900 nhưng có trong DOM (đã chờ được). Khớp đối chứng.
    E6-step2.png: sau khi bấm «Xem thêm», danh sách cuộn xuống các dòng nối thêm ([Mẫu] Chủ nhà 03, 29, 06, 11, các dòng «[Chưa có tên] Lead»…), mọi dòng nhìn thấy đều mang nhãn «Chủ bán». Đếm bằng tiêu đề: 50+ thành 58 liên hệ, tức 50 thành 58 dòng. Khớp Expected bước 2.
    E6-step3.png: sau khi giữ phản hồi cursor 2 giây, chạm «Chủ cho thuê» rồi bấm Xem thêm cũ, chờ 3 giây: mục «Chủ cho thuê» được chọn, tiêu đề «0 liên hệ», trạng thái trống «Không tìm thấy «Chủ cho thuê»». Không có dòng nào, kể cả dòng chỉ mang nhãn Chủ bán. (a) Không có yêu cầu nào mang cursor Chủ bán kèm type=Landlord, hai yêu cầu cursor đều là type=Seller. (b) Không có dòng nào chỉ mang nhãn Chủ bán trên màn. Khớp Expected bước 3.
  network_observed: clean

### Judgment

- eval: E3
  judged_by: judge-subagent (fresh context)
  verdict: PASS
  rationale: panel giữ nguyên từ round 2 — inputs không đổi, không chấm lại; rationale xem round đó. Đề xuất panel (carried, round 2):
  votes:
    - domain-correctness: PASS (r2)
    - operational-feasibility: PASS (r2)
    - spec-alignment: PASS (r2)
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-ho-so-lien-he-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-11-05T12:30:09Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-ho-so-lien-he-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-05T12:30:09Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-ho-so-lien-he-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-05T12:30:09Z

- cmd: npm run test:hooks
  run_id: minted-va-ho-so-lien-he-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-05T12:30:09Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-ho-so-lien-he-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-11-05T12:30:09Z

- cmd: npm run typecheck
  run_id: minted-va-ho-so-lien-he-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-11-05T12:30:09Z

- cmd: npm run lint
  run_id: minted-va-ho-so-lien-he-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-11-05T12:30:09Z

## Known limits

## Ngoài hợp đồng

## Iterations

Round 1: AC-2 lỗi «Xem thêm» bấm hai lần nối trang hai lần — trả về triển khai, đã sửa.
Round 2: PASS ở E2, E4, E5, E6 — hai mục ngoài hợp đồng ghi lại.
Round 3: PASS — E1 và E7 chạy lại sau khi thêm ca E7 lớp máy chủ; E2, E4, E5, E6 mang sang từ round 2; E3 giữ panel round 2.

### Re-pin lần 1 — 2026-11-05, do gộp main có #134 trước khi gộp PR #136
run_id: repin-20261105T124806Z-50682
sha: 942e76185f1bf63e84284fa91772101770885085 · suites: 7 lệnh exit 0 · evals: 5/5 eval máy đạt kỳ vọng · ngoài làn máy: E3, E6
