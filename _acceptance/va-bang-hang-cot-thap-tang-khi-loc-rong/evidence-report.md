---
schema_version: 2
feature_slug: va-bang-hang-cot-thap-tang-khi-loc-rong
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 05456fedc29cfd08ae8c6e94d3e79b4e202485b0
human_signoff:
---

# Evidence Report: va-bang-hang-cot-thap-tang-khi-loc-rong

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-6 | test | PASS |
| E5 | AC-5 | ui-check | PASS |
| E6 | AC-1 | script | PASS |
| E7 | AC-1 | script | PASS (carry-forward từ round 1) |
| E8 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T04:09:03Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4231.298417

- eval: E2
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T04:09:03Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4231.298417

- eval: E3
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-E3-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T04:09:03Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4231.298417

- eval: E4
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T04:09:03Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4231.298417

- eval: E4b
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-E4b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T04:09:03Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4231.298417

- eval: E5
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T04:09:03Z
  screenshot: evidence/E5-rong.png
  observed: |
    E5-rong.png (ca1): bảng trống, biểu tượng lọc và chữ «Không căn nào khớp bộ lọc» cùng nút «Xoá lọc» nằm giữa khung nhìn; ô Diện tích đất có chữ ">99999999", đang có viền focus; hàng tiêu đề vẫn đủ cột Hướng, Diện tích đất, Số tầng, Mặt tiền, Lộ giới, Trạng thái; đếm 0 / 12 căn, nút Lọc có huy hiệu 1.
    E5-sau.png (ca1 sau khi xoá chữ): bảng quay lại 12 / 12 căn, các dòng nhóm và căn hiện lại (LK1-01, Nhà phố, Biệt thự, Đất...), tiêu đề đủ cột Loại hình, Loại căn, Diện tích, Tầng, Hướng, Diện tích đất, Số tầng...; ô Diện tích đất có con trỏ nhấp nháy, focus giữ nguyên, chữ ">80" mờ là gợi ý.
    E5-cot-chung.png (ca2, lọc Đất, ô Giá ">99999999"): bảng trống, thông báo «Không căn nào khớp bộ lọc» trong khung nhìn; tiêu đề vẫn đủ cột Trạng thái, Giá, Phí, Nội thất, Pháp lý, Tài chính; focus ở ô Giá có nút xoá; nút Lọc huy hiệu 2. Cả ba ảnh khớp dòng JSON và Expected.
  network_observed: n-a (driver)
  output: |
    Ca2 (lọc Đất, gõ ô Giá): PASS rong.soDong=0; PASS rong.cot == truoc.cot (14 cột); PASS rong.focus="Lọc Giá theo luật số"; baoRong có, trongKhung=true.
    Frame đã lưu (evidence/): E5-rong.png, E5-sau.png, E5-cot-chung.png.

- eval: E6
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-E6-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-09T04:09:03Z
  output: |
    npm run typecheck — kiểm kiểu mọi gói xanh.

- eval: E7
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-E7-r1
  exit_code: 0
  verifier: config:executors.design.khuon
  verified_at: 2026-11-09T02:43:06Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-E8-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.design.floor
  verified_at: 2026-11-09T04:09:03Z
  output: |
    design-floor-s4 --root . — không mã màu thô trên tệp giao diện vòng chạm.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-09T04:09:03Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-09T04:09:03Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-09T04:09:03Z

- cmd: npm run test:hooks
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-09T04:09:03Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-09T04:09:03Z

- cmd: npm run lint
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-09T04:09:03Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline), cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý:
- npm test -w @quy-hang/web: E1, E2, E3, E4, E4b
- npm run typecheck: E6
- design-floor-s4 (E8): E8

E5 baseline n-a (bài nhìn màn không chạy được trên cây cũ). E7 mang từ round 1, không đo lại.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: các phát hiện trong hợp đồng ở AC-6 (bộ cột đang giữ không bị bỏ khi áp góc nhìn; bài E4b đo bật cột chưa đúng) và AC-1 (bước liền trước) — đã sửa ở commit 496d65a9, quay lại thực thi.
Round 2: E1, E2, E3, E4, E4b, E5, E6, E8 chạy lại và xanh; E7 mang từ round 1 vì delta không chạm paths của nó. Verdict PASS.

### Re-pin lần 1 — 2026-11-09, do gộp main có mã mới, tới lượt gộp
run_id: repin-20261109T052312Z-52942
sha: 05456fedc29cfd08ae8c6e94d3e79b4e202485b0 · suites: 7 lệnh exit 0 · evals: 8/8 eval máy đạt kỳ vọng · ngoài làn máy: E5 (E5 không khai paths) · AC không có chốt máy: AC-5 · suite chạy ở môi trường giống CI (biến rỗng: DATABASE_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, APP_URL)
