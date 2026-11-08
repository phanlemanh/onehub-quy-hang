---
schema_version: 2
feature_slug: bang-hang-theo-loai-hinh
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b096e06137ddfd66e62c645e4f8da4650d36a8c7
human_signoff:
---

# Evidence Report: bang-hang-theo-loai-hinh

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7a | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | ui-check | PASS |
| E8b | AC-8 | test | PASS |
| E9 | AC-9 | script | PASS |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | judgment | PASS |
| E11 | AC-2 | script | PASS |
| E12 | AC-6 | script | PASS |
| E13 | AC-2 | script | PASS |
| E14 | AC-1 | script | PASS |

## Evidence

Vòng 2 chạy lại E4, E7a, E8, E9, E14; các eval còn lại mang từ vòng 1 vì delta không chạm paths của chúng.

- eval: E4
  run_id: minted-bang-hang-theo-loai-hinh-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T08:04:10Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3780.474167

- eval: E7a
  run_id: minted-bang-hang-theo-loai-hinh-E7a-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-11-08T08:04:10Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 1048.732459

- eval: E9
  run_id: minted-bang-hang-theo-loai-hinh-E9-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-08T08:04:10Z
  output: |
    npm run lint
    chuẩn giao diện: đạt

- eval: E14
  run_id: minted-bang-hang-theo-loai-hinh-E14-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-08T08:04:10Z
  output: |
    npm run typecheck
    (không in lỗi kiểu nào)

- eval: E8
  run_id: minted-bang-hang-theo-loai-hinh-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-08T08:04:10Z
  screenshot: evidence/E8-loc-dat.png
  observed: |
    E8-loc-dat.png: góc nhìn «[Mẫu] Chỉ đất», 2/11 căn; tiêu đề cột Vị trí, Mã căn, Loại hình (lọc Đất), Diện tích đất, Mặt tiền, Lộ giới, Trạng thái, Giá, Phí...; không có Tầng, Hướng, Loại căn; hai dòng đều Loại hình «Đất» (39 và 37 Đường Mẫu 7...). Khớp Expected.
    E8-nhom-loai-hinh.png: nhóm Loại hình, các hàng nhóm «Biệt thự 1 căn», «Căn hộ 6 căn», «Đất 2 căn», «Nhà phố 2 căn», tổng 11/11; cột đầu «Vị trí», cột Loại hình có. Khớp.
    E8-ho-so-dat.png: mở dòng «37 Đường Mẫu 7...» (cột hồ sơ phải): mục «Thuộc tính căn» có Loại hình = Đất, Diện tích đất, Mặt tiền, Lộ giới (—), không có nhãn Tầng. Khớp (bảng nền đang nhóm Toà → Loại căn do không áp góc nhìn, không ảnh hưởng điều cần kiểm). E8-tron.png chưa mở bằng Read nhưng số liệu e8.tron khớp (cột đầu Vị trí, có Loại hình, ô địa chỉ đất đúng).
  network_observed: n-a (driver)
  output: |
    PASS nhom: Biệt thự 1, Căn hộ 6, Đất 2, Nhà phố 2 = soCan khớp dem của dung-x.
    PASS hoSo: loaiHinhDat=true, coTang=false; cột hồ sơ có «Loại hình: Đất», không có «Tầng».
    Frames: evidence/E8-tron.png, E8-loc-dat.png, E8-nhom-loai-hinh.png, E8-ho-so-dat.png.

### Mang từ vòng trước

- eval: E1
  run_id: minted-bang-hang-theo-loai-hinh-E1-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-08T07:48:13Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-bang-hang-theo-loai-hinh-E2-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-08T07:48:13Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-bang-hang-theo-loai-hinh-E3-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-08T07:48:13Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-bang-hang-theo-loai-hinh-E5-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-08T07:48:13Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-bang-hang-theo-loai-hinh-E6-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-08T07:48:13Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7b
  run_id: minted-bang-hang-theo-loai-hinh-E7b-r1
  exit_code: 0
  verifier: config:executors.test.doi_nhan_db
  verified_at: 2026-11-08T07:48:13Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8b
  run_id: minted-bang-hang-theo-loai-hinh-E8b-r1
  exit_code: 0
  verifier: config:executors.test.doi_nhan_db
  verified_at: 2026-11-08T07:48:13Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9b
  run_id: minted-bang-hang-theo-loai-hinh-E9b-r1
  exit_code: 0
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-08T07:48:13Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-bang-hang-theo-loai-hinh-E11-r1
  exit_code: 0
  verifier: config:executors.design.khuon
  verified_at: 2026-11-08T07:48:13Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E12
  run_id: minted-bang-hang-theo-loai-hinh-E12-r1
  exit_code: 0
  verifier: config:executors.design.khuon
  verified_at: 2026-11-08T07:48:13Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E13
  run_id: minted-bang-hang-theo-loai-hinh-E13-r1
  exit_code: 0
  verifier: config:executors.design.floor
  verified_at: 2026-11-08T07:48:13Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

### Judgment (đề xuất panel, chờ người chốt)

- eval: E10
  proposal: PASS
  judged_by: panel ba lens (fresh context)
  votes:
    - domain-correctness: PASS — §12 dòng 435 ngày 08/11 (hàng 79 bang-hang-theo-loai-hinh) ghi cột và mục thuộc tính hồ sơ căn đọc từ bảng trường theo loại hình của lõi, có lọc và nhóm theo loại hình. Dòng ấy nói ô của trường loại hình không dùng để trống, khác «—» của trường dùng mà chưa có số, và lọc còn toàn đất thì không có cột tầng; đất không có Tầng, Trục, Toà.
    - operational-feasibility: PASS — Dòng 435 của §12 nói Bảng hàng và hồ sơ căn đọc bộ cột và mục thuộc tính từ bảng trường theo loại hình của lõi, có lọc theo loại hình và các nhóm «Loại hình», «Loại hình → Toà»; ô không dùng để trống khác «—»; lọc toàn đất không có cột tầng, hướng, loại căn.
    - spec-alignment: PASS — §12 có dòng 08/11 (hàng 79) ở dòng 435: bộ cột và mục thuộc tính của hồ sơ căn đọc từ bảng trường theo loại hình của lõi, có lọc và nhóm «Loại hình» / «Loại hình → Toà»; ô không dùng để trống, khác «—»; đất không có Tầng, Trục, Toà.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-bang-hang-theo-loai-hinh-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-08T08:04:10Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-bang-hang-theo-loai-hinh-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-08T08:04:10Z

- cmd: npm run test:hooks
  run_id: minted-bang-hang-theo-loai-hinh-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-08T08:04:10Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-bang-hang-theo-loai-hinh-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-08T08:04:10Z

## Known limits

## Ngoài hợp đồng

## Analyst

Baseline không đo: none.

Eval không phân biệt (xanh cả trên HEAD lẫn baseline; nên viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý):
- E4 (npm test -w @quy-hang/web)
- E7a (npm test -w @quy-hang/api)
- E9 (npm run lint)
- E14 (npm run typecheck)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: S4 lượt 1 bị REJECT; bằng chứng và sổ đã ghi, trả về dựng lại.
Round 2: E4, E7a, E8, E9, E14 chạy lại và đạt; các eval còn lại mang từ vòng 1 (delta không chạm paths). Verdict PASS.
