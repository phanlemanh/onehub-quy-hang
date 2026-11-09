---
schema_version: 2
feature_slug: va-lead-da-nhap-than-hong
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 9e7b154692c5cb26508be5a0a1de4b3521ef6de1
human_signoff:
---

# Evidence Report: va-lead-da-nhap-than-hong

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | ui-check | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | ui-check | PASS |
| E3b | AC-3 | ui-check | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | ui-check | PASS |
| E5 | AC-4 | script | PASS |
| E6 | AC-4 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-lead-da-nhap-than-hong-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T14:01:03Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 7827.658334

- eval: E1b
  run_id: minted-va-lead-da-nhap-than-hong-E1b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T14:01:03Z
  screenshot: evidence/E1b-step1.png
  observed: |
    step2 (doi chung 1440): trang Lead da nhap, the co tieu de, vung than la cac thanh xam khung cho (skeleton) o nam cot, khong co khoi loi, khong nut. Khop expected (co khung cho). step3 (1440, than hong): khung cho bien mat; mot khoi do nhat 'Khong tai duoc lead da nhap' kem dong 'Mang hay may chu khong tra loi. Lead da gui van con nguyen.' va dung mot nut 'Thu lai' ben phai. Khop. step4 (375): khoi loi tuong tu xep doc, nut 'Thu lai' duoi chu, nam trong khung nhin, khong tran ngang (nut Next dev o goc la cong cu dev). Khop. step1 la ban sao step2.
  network_observed: clean

- eval: E2
  run_id: minted-va-lead-da-nhap-than-hong-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T14:01:03Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 7827.658334

- eval: E2b
  run_id: minted-va-lead-da-nhap-than-hong-E2b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T14:01:03Z
  screenshot: evidence/E2b-step2.png
  observed: |
    E2b-step2.png (ca {"a":1}): trang /leads/mine ve binh thuong (header «[Mau] San thu», nut «+ Lead», breadcrumb Quy hang > Lead da nhap, tieu de «Lead da nhap»); trong khung «Lead da nhap» co dung mot khoi do nhat «Khong tai duoc lead da nhap / Mang hay may chu khong tra loi. Lead da gui van con nguyen.» voi mot nut «Thu lai» ben phai; khong khung cho, khong hang lead, khong trang loi toan man (chi co nut dev N goc trai duoi). E2b-step3.png (ca [null]): giong het ca 1 — dung mot khoi bao loi, mot «Thu lai», khong khung cho, khong trang loi toan man. Khop Expected cua ca hai ca.
  network_observed: clean

- eval: E3b
  run_id: E3b-20261109
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T14:01:03Z
  screenshot: evidence/E3b-step2.png
  observed: |
    E3b-step2.png: Lead da nhap page with the table populated; rows with badges "Cho chia", "Tra lai", "Da gui" (full Vietnamese diacritics on screen). No error block and no loading skeleton. Matches Expected for step 2. E3b-step3.png: identical populated table after the online event with no click. Matches step 3. E3b-step4.png: no table; a single pink error block "Khong tai duoc lead da nhap / Mang hay may chu khong tra loi. Lead da gui van con nguyen." with one "Thu lai" button at right; no loading frame. Matches step 4 (one block, one button). E3b-step5b.png: same single error block and single "Thu lai" button after the second click, no loading frame. Matches step 5. The Next dev-tools N badge is visible bottom-left in all frames (not app UI). Per-click GET delta was exactly 1 in the measured dev run.
  network_observed: clean

- eval: E4
  run_id: minted-va-lead-da-nhap-than-hong-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T14:01:03Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 7827.658334

- eval: E4b
  run_id: minted-va-lead-da-nhap-than-hong-E4b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T14:01:03Z
  screenshot: evidence/E4b-step1.png
  observed: |
    step1 (E4b-step1.png): trang Lead đã nhập, bảng có nhiều dòng (Toà Z, Toà A A-13.04, A-07.05, Toà B…) với nhãn Chờ chia / Trả lại / Đã gửi; không khối lỗi, không khung chờ. step2 (E4b-step2.png): giống step1, bảng đầy dòng lead (đếm DOM 16 hàng) — khớp expected bước 2 (>=1 dòng). step3 (E4b-step3.png): khung Lead đã nhập chỉ có trạng thái trống, biểu tượng hộp thư và chữ «Chưa có lead nào» kèm hướng dẫn bấm «+ Lead»; không khối báo lỗi, không bảng — khớp expected bước 3. step4 (E4b-step4.png): đúng một khối nền đỏ nhạt «Không tải được lead đã nhập / Mạng hay máy chủ không trả lời. Lead đã gửi vẫn còn nguyên.» với đúng một nút «Thử lại»; không khung chờ, không bảng — khớp expected bước 4. step5 (E4b-step5.png): hình giống hệt step4, đúng một khối lỗi và một «Thử lại», không khung chờ — khớp expected bước 5.
  network_observed: clean

- eval: E5
  run_id: minted-va-lead-da-nhap-than-hong-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-09T14:01:03Z
  output: |
    design-floor-khuon --kiem --root .
    2 tệp giao diện ngoài bản đồ

- eval: E6
  run_id: minted-va-lead-da-nhap-than-hong-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.floor
  verified_at: 2026-11-09T14:01:03Z
  output: |
    design-floor-s4 --root .
    (không có dòng lỗi)

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-lead-da-nhap-than-hong-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-09T14:01:03Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-lead-da-nhap-than-hong-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-09T14:01:03Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-lead-da-nhap-than-hong-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-09T14:01:03Z

- cmd: npm run test:hooks
  run_id: minted-va-lead-da-nhap-than-hong-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-09T14:01:03Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-lead-da-nhap-than-hong-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-09T14:01:03Z

- cmd: npm run typecheck
  run_id: minted-va-lead-da-nhap-than-hong-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-09T14:01:03Z

- cmd: npm run lint
  run_id: minted-va-lead-da-nhap-than-hong-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-09T14:01:03Z

## Known limits

## Ngoài hợp đồng

## Analyst

Non-discriminating evals (xanh ở cả nhánh lẫn baseline, chứng minh khung chạy chứ không chứng minh tính năng; cần viết lại để khẳng định hành vi mới hoặc xác nhận là lưới hồi quy có chủ ý):

- E1, E2, E4 (lệnh npm test -w @quy-hang/web)
- E5 (lệnh design-floor-khuon)
- E6 (lệnh design-floor-s4)

Baseline không đo: E1b, E2b, E3b, E4b (eval ui-check chỉ chạy trên cây đang chấm, không chạy trên bản cũ).

Không có judgment item nào được khai trong vòng này.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval đều đạt; không có eval hỏng.
