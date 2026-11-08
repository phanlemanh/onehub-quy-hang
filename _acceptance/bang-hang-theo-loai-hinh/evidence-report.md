---
schema_version: 2
feature_slug: bang-hang-theo-loai-hinh
verdict: REJECT
failed_evals: ["E7a","E9"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2a15e90a8ca3c977fd0db6ad75800e154077c7bd
human_signoff:
---

# Evidence Report: bang-hang-theo-loai-hinh

Round 1: hai eval đỏ (E7a, E9). Verdict tổng là REJECT; trả về khâu cài đặt.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7a | AC-7 | test | FAIL |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | ui-check | PASS |
| E8b | AC-8 | test | PASS |
| E9 | AC-9 | script | FAIL |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | judgment | PASS (đề xuất của hội đồng, chờ người chốt ở Cổng 2) |
| E11 | AC-2 | script | PASS |
| E12 | AC-6 | script | PASS |
| E13 | AC-2 | script | PASS |
| E14 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-bang-hang-theo-loai-hinh-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T07:48:13Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4351.362208

- eval: E2
  run_id: minted-bang-hang-theo-loai-hinh-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T07:48:13Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4351.362208

- eval: E3
  run_id: minted-bang-hang-theo-loai-hinh-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T07:48:13Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4351.362208

- eval: E4
  run_id: minted-bang-hang-theo-loai-hinh-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T07:48:13Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4351.362208

- eval: E5
  run_id: minted-bang-hang-theo-loai-hinh-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T07:48:13Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4351.362208

- eval: E6
  run_id: minted-bang-hang-theo-loai-hinh-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T07:48:13Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4351.362208

- eval: E7a
  run_id: minted-bang-hang-theo-loai-hinh-E7a-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-11-08T07:48:13Z
  output: |
    npm test -w @quy-hang/api
    ℹ pass 85
    ℹ fail 1
    ✖ OpenAPI liệt đúng bộ đường tiếng Anh (src/app.test.ts)
    actual thua: [ 'GET /api/v1/off-compound-units' ], thieu: []
    Bộ kiểm danh sách đường OpenAPI chưa biết đường mới GET /api/v1/off-compound-units.

- eval: E7b
  run_id: minted-bang-hang-theo-loai-hinh-E7b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.doi_nhan_db
  verified_at: 2026-11-08T07:48:13Z
  output: |
    export DATABASE_URL=postgres://postgres:quyhang@localhost:5576/postgres && npm run db:migrate && npm run db:test
    ℹ duration_ms 150482.769375

- eval: E8
  run_id: minted-bang-hang-theo-loai-hinh-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-08T07:48:13Z
  screenshot: evidence/E8-loc-dat.png
  observed: |
    E8-loc-dat.png: góc nhìn «[Mẫu] Chỉ đất», bộ lọc Loại hình = Đất, 2/11 căn. Cột hiện: Vị trí, Mã căn, Loại hình, Diện tích đất, Mặt tiền, Lộ giới, Trạng thái, Giá, Phí... Không có cột Tầng, Hướng, Loại căn. Hai dòng đều có ô Loại hình «Đất» (Vị trí là 39 và 37 Đường Mẫu 7). Khớp Expected.
    E8-nhom-loai-hinh.png: góc nhìn «[Mẫu] Theo loại hình», Nhóm: Loại hình, 11/11 căn. Bốn hàng nhóm: Biệt thự 1 căn, Căn hộ 6 căn, Đất 2 căn, Nhà phố 2 căn. Cột đầu là «Vị trí». Khớp Expected.
    E8-ho-so-dat.png: cột hồ sơ bên phải của dòng «37 Đường Mẫu 7, Phường Tân Định, Thành phố Hồ Chí Minh · Đất». Mục THUỘC TÍNH CĂN có Loại hình = Đất, Diện tích đất, Mặt tiền, Lộ giới; không có nhãn Tầng. Khớp Expected.
    E8-tron.png: bảng trộn nhóm Toà → Loại căn. Có cột Loại hình, cột đầu «Vị trí», dòng đất ngoài khu hiện đúng địa chỉ Đường Mẫu 7 ở cột Vị trí. Khớp Hỏi-1.
  network_observed: n-a (driver)
  output: |
    PASS nhóm Loại hình: Biệt thự 1, Căn hộ 6, Đất 2, Nhà phố 2 khớp số dung-x in (soCan = mong)
    PASS hồ sơ dòng đất: loaiHinhDat=true, coTang=false; mục «Thuộc tính căn» có Loại hình = Đất, Diện tích đất, Mặt tiền, Lộ giới, không có Tầng
    Frame đã lưu (evidence/): E8-loc-dat.png, E8-nhom-loai-hinh.png, E8-ho-so-dat.png, E8-tron.png.

- eval: E8b
  run_id: minted-bang-hang-theo-loai-hinh-E8b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.doi_nhan_db
  verified_at: 2026-11-08T07:48:13Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 150482.769375

- eval: E9
  run_id: minted-bang-hang-theo-loai-hinh-E9-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-08T07:48:13Z
  output: |
    npm run lint (eslint . rồi ba bước ui-lint)
    _acceptance/bang-hang-theo-loai-hinh/thu/chay-ui.mjs
      86:62  error  'k' is defined but never used  no-unused-vars
    4 problems (1 error, 3 warnings)
    Ba cảnh báo còn lại: bang-hang.tsx 'COT' không dùng; bang-the.tsx useVirtualizer không memo hoá được; tren-o.tsx 'LoiTrenMay' không dùng.
    Các bước ui-lint sau eslint không chạy tới vì eslint dừng trước.

- eval: E9b
  run_id: minted-bang-hang-theo-loai-hinh-E9b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-08T07:48:13Z
  output: |
    npm test -w @quy-hang/ui-lint
    ℹ duration_ms 41886.24525

- eval: E10
  judged_by: hội đồng judge (fresh context) — đề xuất, chưa phải quyết định
  verdict: PASS
  rationale: Hội đồng đề xuất PASS; ba lens cùng dẫn dòng 08/11 (hàng 79) ở §12 tham-chieu.md (dòng 435) có đủ bốn ý.
  votes:
    - domain-correctness: PASS — §12 của tham-chieu.md có dòng 08/11 (dòng 435, hàng 79 bang-hang-theo-loai-hinh). Dòng này nói bộ cột và mục thuộc tính của hồ sơ căn đọc từ bảng trường theo loại hình của lõi, có lọc theo loại hình và nhóm «Loại hình» / «Loại hình → Toà». Dòng này cũng nói ô của trường mà loại hình không dùng thì để trống, khác «—» của trường dùng mà chưa có số. Dòng này còn nói «lọc còn toàn đất thì không có cột tầng, hướng, loại căn» và «đất không có Tầng, Trục, Toà».
    - operational-feasibility: PASS — Dòng 08/11 ở §12 (tham-chieu.md dòng 435, hàng 79) nói bộ cột và mục thuộc tính của hồ sơ căn đọc từ bảng trường theo loại hình của lõi. Dòng ấy cũng nêu lọc theo loại hình và nhóm «Loại hình», «Loại hình → Toà». Nó nói ô của trường mà loại hình dòng không dùng thì để trống, khác «—» của trường dùng mà chưa có số. Nó cũng viết «lọc còn toàn đất thì không có cột tầng, hướng, loại căn» và «đất không có Tầng, Trục, Toà».
    - spec-alignment: PASS — Dòng 435 của §12 ghi ngày 08/11 (hàng 79). Dòng nói bộ cột và mục thuộc tính của hồ sơ căn đọc từ bảng trường theo loại hình của lõi. Dòng nói có lọc theo loại hình và nhóm «Loại hình», «Loại hình → Toà». Dòng nói ô của trường mà loại hình không dùng thì để trống, khác «—» của trường dùng mà chưa có số. Dòng cũng nói thẳng rằng lọc còn toàn đất thì không có cột tầng, hướng, loại căn, và đất không có Tầng, Trục, Toà.
  human_override:  # chi nguoi ghi

- eval: E11
  run_id: minted-bang-hang-theo-loai-hinh-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-08T07:48:13Z
  output: |
    design-floor-khuon.mjs --kiem --root .
    18 tệp giao diện ngoài bản đồ

- eval: E12
  run_id: minted-bang-hang-theo-loai-hinh-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-08T07:48:13Z
  output: |
    design-floor-khuon.mjs --kiem --root .
    18 tệp giao diện ngoài bản đồ

- eval: E13
  run_id: minted-bang-hang-theo-loai-hinh-E13-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.floor
  verified_at: 2026-11-08T07:48:13Z
  output: |
    design-floor-s4.mjs --root .
    (không in dòng nào)

- eval: E14
  run_id: minted-bang-hang-theo-loai-hinh-E14-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-08T07:48:13Z
  output: |
    npm run typecheck
    (xanh mọi gói)

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-bang-hang-theo-loai-hinh-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-08T07:48:13Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-bang-hang-theo-loai-hinh-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-08T07:48:13Z

- cmd: npm run test:hooks
  run_id: minted-bang-hang-theo-loai-hinh-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-08T07:48:13Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả code mới lẫn baseline; chứng minh harness, chưa chứng minh tính năng — cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- npm test -w @quy-hang/web: E1, E2, E3, E4, E5, E6
- npm test -w @quy-hang/ui-lint: E9b
- design-floor-khuon.mjs --kiem: E11, E12
- design-floor-s4.mjs: E13
- npm run typecheck: E14

Hai eval đỏ cũng xanh ở baseline (E7a, E9), nghĩa là lỗi do thay đổi lần này gây ra, không có sẵn từ trước.

Nguyên nhân đỏ:
- E7a: bộ kiểm danh sách đường OpenAPI (packages/api/src/app.test.ts) chưa liệt đường mới GET /api/v1/off-compound-units, báo thừa đúng đường đó; cần thêm đường vào danh sách mong đợi.
- E9: eslint báo một lỗi ở _acceptance/bang-hang-theo-loai-hinh/thu/chay-ui.mjs dòng 86 cột 62 (biến 'k' khai báo mà không dùng), nên lint dừng và các bước ui-lint sau không chạy.

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất (mọi eval chạy một lần, xác định)

## Iterations

Round 1: E7a, E9 failed — E7a: danh sách đường OpenAPI trong app.test.ts thiếu đường off-compound-units mới; E9: lỗi no-unused-vars trong tệp thử chay-ui.mjs. Returned to implementation.
