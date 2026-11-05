---
schema_version: 2
feature_slug: luat-chia-lead
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 7e91413c024683653d69d3ccaafcfefcb260420c
human_signoff: Manh Phan 2026-11-06
---

# Evidence Report: luat-chia-lead

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | ui-check | PASS |
| E2a | AC-2 | ui-check | PASS |
| E2b | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5a | AC-5 | test | PASS |
| E5b | AC-5 | ui-check | PASS |
| E6a | AC-6 | ui-check | PASS |
| E6b | AC-6 | test | PASS |
| E7a | AC-7 | test | PASS |
| E7b | AC-7 | ui-check | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10a | AC-10 | test | PASS |
| E10b | AC-10 | ui-check | PASS |
| E11 | AC-1 | script | PASS |
| E12 | AC-1 | script | PASS |
| E13 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-luat-chia-lead-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T18:30:38Z
  screenshot: evidence/E1-1440.png
  observed: |
    E1-1440.png (1440x900, phiên quản trị, trang "Luật chia lead"): sáu dòng đúng thứ tự. Cách chia lead không trùng = "Theo vùng, lần lượt", Mặc định. Hạn nhận lead = 20, nguồn "Đã đổi · [Mẫu] Quản trị sàn · 06/11". Hạn gọi lần đầu = 30, Mặc định. Báo lead quá hạn cho ai = "Trưởng nhóm", Mặc định. Nhóm "Hàng đợi Hôm nay": «Cần gọi lại» sau số ngày chưa xác nhận = 14 Mặc định; «Nên gọi ép giá» sau số ngày = 10 Mặc định. Nút Hoàn lại và Lưu bị mờ. E1-truoc.png (cùng bố cục, trước khi đặt 20): Hạn nhận lead = 15, nguồn "Mặc định", năm dòng còn lại giống hệt. Cả hai khớp Expected.
  network_observed: n-a (driver)

- eval: E2a
  run_id: minted-luat-chia-lead-E2a-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T18:30:38Z
  screenshot: evidence/E2a-step1.png
  observed: |
    E2-sau-luu.png (E2a-step1): màn Luật chia lead của [Mẫu] Sàn thử; Cách chia = Kho chung kèm chú «Đã đổi · [Mẫu] Quản trị sàn · 06/11»; Hạn nhận lead = 25 kèm «Đã đổi · ... 06/11»; Hạn gọi lần đầu 30 «Mặc định»; Báo lead quá hạn cho ai = Trưởng nhóm «Mặc định»; Cần gọi lại 14, Nên gọi ép giá 10 «Mặc định»; toast «Đã lưu · áp cho lead mới từ bây giờ» ở đáy. Khớp Expected. E2-hoan-lai.png (E2a-step2): 25, Kho chung giữ nguyên; Hạn gọi lần đầu 30 và Báo lead quá hạn = Trưởng nhóm (đã về giá trị đang áp sau Hoàn lại); Cần gọi lại 20 (đã lưu ở ca e2-ngay, kèm «Đã đổi»); Nên gọi ép giá 10; không toast mới. Khớp Expected.
  network_observed: clean

- eval: E5b
  run_id: minted-luat-chia-lead-E5b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T18:30:38Z
  screenshot: evidence/E5-o-sai.png
  observed: |
    E5-o-sai.png: man Luat chia lead (toi); Han nhan lead = 0 co dong do «So nguyen tu 1 toi 1440 phut» ngay duoi o; o Han goi lan dau 30 khong loi; nut Luu o cuoi trang hien mo (disabled). Khop Expected. E5-400.png: Han nhan lead 15, Han goi lan dau gia tri 40 giu nguyen, dong do «Khong nho hon han nhan lead (15 phut)» duoi dung o do; khong co banner khac. Khop. E5-403.png: banner do dau trang «Chi quan tri san doi duoc luat nay»; Han nhan lead van 22, Han goi lan dau 30. Khop. E5-mang.png: banner do «Chua luu duoc — mat ket noi toi may chu» kem nut «Thu lai»; Han nhan lead van 18 (gia tri vua go). Khop; toast «Da luu» sau Thu lai xac nhan qua dong ket qua e5-mang (khong co trong anh).
  network_observed: n-a (driver)

- eval: E6a
  run_id: minted-luat-chia-lead-E6a-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T18:30:38Z
  screenshot: evidence/E6a-step1.png
  observed: |
    E6a-step1.png (bản sao của E6-truong-nhom.png, lưu 01:33, vừa chụp) đã mở bằng Read. Đây là phiên trưởng nhóm (avatar TR, truong-nhom@mau.quy-hang.test). Trang là Cài đặt > Cá nhân, URL cuối /settings/personal?chi-quan-tri=1. Cột mục lục bên trái chỉ có nhóm «CÁ NHÂN» với một mục «Cá nhân», không có mục Chia lead. Ngay dưới tiêu đề có hộp báo «Mục này chỉ quản trị sàn mở được». Khớp Expected. Hai phiên còn lại (đầu chủ, quản trị) không có ảnh; kết quả của chúng lấy từ dòng JSON của script.
  network_observed: n-a (driver)

- eval: E7b
  run_id: minted-luat-chia-lead-E7b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T18:30:38Z
  screenshot: evidence/E7b-step1.png
  observed: |
    E7b-step1 (E7-bo-nhom.png): trang Luat chia lead; muc «Hang doi Hom nay» co khung «San dang dung bo nhom Hom nay rieng — nguong dat trong bo ay»; hai o «Can goi lai» (14) va «Nen goi ep gia» (10) bi lam mo/disabled. Khop Expected. E7b-step2 (E7-dong-hong.png): dau khung co thanh bao «Han nhan lead, Han goi lan dau dang chay theo mac dinh — gia tri da luu cua san khong hop le. Luu gia tri...»; cac o hien 15/30 mac dinh. Khop Expected. E7b-step3 (E7-loi-tai.png): chi con khung do «Chua tai duoc luat chia lead» kem nut «Thu lai», khong co o cau hinh; sau Thu lai (theo JSON e7-c) tai lai du sau dong. Khop Expected.
  network_observed: n-a (driver)

- eval: E10b
  run_id: minted-luat-chia-lead-E10b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T18:30:38Z
  screenshot: evidence/E10b-step1.png
  observed: |
    E10b-step1.png (E10-loi): man Bang hang /inventory, 70/70 can, co banner do phia tren bang «Chua doc duoc danh ba thanh vien — cot Dau chu co the thieu ten» kem nut «Thu lai» ben phai: khop Expected. E10b-step2.png (E10-sau-thu-lai): cung man, banner da mat, bang day len; cot Dau chu nam ngoai khung nhin nen ten khong thay tren anh, chi xac nhan bang DOM (tenDauChuHien=true): khop Expected, khong mau thuan.
  network_observed: n-a (driver)

- eval: E11
  run_id: minted-luat-chia-lead-E11-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T18:30:38Z
  output: |
    8 tệp giao diện ngoài bản đồ

- eval: E13
  run_id: minted-luat-chia-lead-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/luat-chia-lead/thu/kiem-khuon-e11.mjs
  verified_at: 2026-11-05T18:30:38Z
  output: |
    E13: chỉ có dòng báo oan đã khai: lệch: apps/web/src/app/(app)/settings/lead-routing/page.tsx · thuộc hai nhóm màn: cai-dat-san, trang-tam

- eval: E2b
  run_id: minted-luat-chia-lead-E2b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api_db
  verified_at: 2026-11-05T15:05:39Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-luat-chia-lead-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api_db
  verified_at: 2026-11-05T15:05:39Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-luat-chia-lead-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-05T15:05:39Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5a
  run_id: minted-luat-chia-lead-E5a-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-05T15:05:39Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6b
  run_id: minted-luat-chia-lead-E6b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api_db
  verified_at: 2026-11-05T15:05:39Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7a
  run_id: minted-luat-chia-lead-E7a-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-05T15:05:39Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-luat-chia-lead-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-05T15:05:39Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8b
  run_id: minted-luat-chia-lead-E8b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-05T15:05:39Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-luat-chia-lead-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-05T15:05:39Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10a
  run_id: minted-luat-chia-lead-E10a-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-05T15:05:39Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E12
  run_id: minted-luat-chia-lead-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-05T15:05:39Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-luat-chia-lead-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-05T18:30:38Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-luat-chia-lead-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-05T18:30:38Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-luat-chia-lead-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-05T18:30:38Z

- cmd: npm run test:hooks
  run_id: minted-luat-chia-lead-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-05T18:30:38Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-luat-chia-lead-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-05T18:30:38Z

- cmd: npm run typecheck
  run_id: minted-luat-chia-lead-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-05T18:30:38Z

- cmd: npm run lint
  run_id: minted-luat-chia-lead-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-05T18:30:38Z

## Known limits

- E11 (AC-1) dat-co-gioi-han: ma thoat 1 la ket qua DA KHAI TRUOC cua eval nay, khong phai mot luot truot. Lenh: R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-khuon.mjs" --kiem --root .

## Ngoài hợp đồng

## Analyst

Carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi). Field baseline cua tung block eval ghi n-a.

Eval khong-phan-biet (pass tren ca HEAD lan baseline), can viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y:
- DATABASE_URL=${DATABASE_URL:-postgres://postgres:quyhang@localhost:5575/postgres} npm run test:db -w @quy-hang/api — E2b, E3, E6b
- npm test -w @quy-hang/web — E4, E5a, E7a, E8b, E9, E10a
- npm test -w @quy-hang/core — E8
- R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-s4.mjs" --root . — E12

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: bộ eval gốc chạy và được ghi vào nhật ký; các eval kiểm thử E2b, E3, E4, E5a, E6b, E7a, E8, E8b, E9, E10a, E12 mang kết quả từ round này.
Round 2: chạy lại E1, E2a, E5b, E6a, E7b, E10b, E11, E13 và bảy lệnh suite; các mục còn lại carry-forward từ round 1 vì delta không chạm paths của chúng. Verdict PASS, E11 đạt có giới hạn (xem Known limits).

### Re-pin lần 1 — 2026-11-05, do thêm phép đo phía máy chủ E5c, E7c cho hai tiêu chí xuyên lớp
run_id: repin-20261105T224630Z-83145
sha: 7e91413c024683653d69d3ccaafcfefcb260420c · suites: 7 lệnh exit 0 · evals: 15/15 eval máy đạt kỳ vọng · đạt-có-giới-hạn: E11=1 · ngoài làn máy: E1 (E1 không khai paths), E2a (E2a không khai paths), E5b (E5b không khai paths), E6a (E6a không khai paths), E7b (E7b không khai paths), E10b (E10b không khai paths)
