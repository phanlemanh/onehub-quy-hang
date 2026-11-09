---
schema_version: 2
feature_slug: va-loi-doc-can-ngoai-khu
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 77daa999cfcf0c8d1da9e3986c56274d5fc9b1e7
human_signoff:
---

# Evidence Report: va-loi-doc-can-ngoai-khu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | ui-check | PASS |
| E7 | AC-1 | script | PASS |
| E8 | AC-1 | script | PASS (carry-forward tu round 1) |
| E9 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-loi-doc-can-ngoai-khu-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T10:46:42Z
  output: |
    ℹ duration_ms 4961.263416
    __EXIT=0

- eval: E2
  run_id: minted-va-loi-doc-can-ngoai-khu-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T10:46:42Z
  output: |
    ℹ duration_ms 4961.263416
    __EXIT=0

- eval: E3
  run_id: minted-va-loi-doc-can-ngoai-khu-E3-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T10:46:42Z
  output: |
    ℹ duration_ms 4961.263416
    __EXIT=0

- eval: E4
  run_id: minted-va-loi-doc-can-ngoai-khu-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T10:46:42Z
  output: |
    ℹ duration_ms 4961.263416
    __EXIT=0

- eval: E5
  run_id: minted-va-loi-doc-can-ngoai-khu-E5-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T10:46:42Z
  output: |
    ℹ duration_ms 4961.263416
    __EXIT=0

- eval: E6
  run_id: minted-va-loi-doc-can-ngoai-khu-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T10:46:42Z
  screenshot: evidence/E6-bao.png
  observed: |
    E6-bao.png: Bảng hàng có khối báo đỏ trên bảng, chữ «Chưa đọc được danh sách căn ngoài khu — loại hình và địa chỉ của các căn này có thể thiếu» kèm một nút «Thử lại»; bảng vẫn hiện 12/12 căn, 5 căn ngoài khu tên «Căn ngoài khu», mã «—», loại «Chưa rõ». Khớp ca1/AC-1.
    E6-sau.png: không còn khối báo; nhóm theo địa chỉ (31 Đường Mẫu 3, 33, 35, 37, 39...), cột Loại hình hiện Nhà phố, Nhà phố, Biệt thự, Đất, Đất, đúng loại hình và địa chỉ đã gõ; có thêm cột Loại hình/Vị trí. Khớp.
    E6-ca-hai.png: đúng một khối báo, một nút «Thử lại», chữ «Chưa đọc được danh bạ thành viên và danh sách căn ngoài khu — cột Đầu chủ và các căn ngoài khu có thể thiếu thông tin» (đúng AC-5); các hàng vẫn hiện 12/12. Khớp.
  network_observed: n-a (driver)
  output: |
    chay-ui.mjs in một dòng JSON; mọi assertion PASS (ca1 báo đúng câu AC-1, nút Thử lại 1, sau khi đọc được thì 5 dòng đúng loại và bản giữ còn; ca500 báo đúng câu; ca2 một khối báo đúng chữ AC-5). Máy dev riêng cổng 3496 đã tắt sau khi chạy.

- eval: E7
  run_id: minted-va-loi-doc-can-ngoai-khu-E7-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-09T10:46:42Z
  output: |
    kiểm kiểu mọi gói xanh
    __EXIT=0

- eval: E8
  run_id: minted-va-loi-doc-can-ngoai-khu-E8-r1
  exit_code: 0
  carried_from_round: 1
  verifier: config:executors.design.khuon
  verified_at: 2026-11-09T10:08:44Z
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-va-loi-doc-can-ngoai-khu-E9-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.design.floor
  verified_at: 2026-11-09T10:46:42Z
  output: |
    __EXIT=0

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-loi-doc-can-ngoai-khu-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-09T10:46:42Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-loi-doc-can-ngoai-khu-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-09T10:46:42Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-loi-doc-can-ngoai-khu-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-09T10:46:42Z

- cmd: npm run test:hooks
  run_id: minted-va-loi-doc-can-ngoai-khu-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-09T10:46:42Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-loi-doc-can-ngoai-khu-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-09T10:46:42Z

- cmd: npm run lint
  run_id: minted-va-loi-doc-can-ngoai-khu-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-09T10:46:42Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả code mới lẫn baseline diffBase): E1, E2, E3, E4, E5 (lệnh npm test -w @quy-hang/web), E7 (npm run typecheck), E9 (design-floor-s4). Cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý. E8 mang từ round 1, không đo baseline round này.

Không có eval judgment nào; không có panel judge để đề xuất.

## Variance

none — mọi eval đều chạy một lần, xác định, không có pass_rate hỗn hợp.

## Iterations

Round 1: PASS — mọi eval xanh; còn ba finding trong hợp đồng và một ngoài hợp đồng ghi ở review-findings.
Round 2: PASS — E1-E7, E9 chạy lại trên commit efa00e50; E8 mang từ round 1 (delta không chạm paths của eval).

### Re-pin lần 1 — 2026-11-09, do thêm ca đo sau lượt 2 và gộp nhánh chính
run_id: repin-20261109T110753Z-15030
sha: 77daa999cfcf0c8d1da9e3986c56274d5fc9b1e7 · suites: 7 lệnh exit 0 · evals: 8/8 eval máy đạt kỳ vọng · ngoài làn máy: E6 (E6 không khai paths) · AC không có chốt máy: AC-6 · suite chạy ở môi trường giống CI (biến rỗng: DATABASE_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, APP_URL)
