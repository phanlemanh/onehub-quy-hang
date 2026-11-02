---
schema_version: 2
feature_slug: va-che-vung-anh
verdict: REJECT
failed_evals: ["E8"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 1f08966b66649a26988e90f12eddadaf070ce9b9
human_signoff:
---

# Evidence Report: va-che-vung-anh

Round 1. Một eval trượt (E8, bước lint). Chín eval còn lại đạt, năm lệnh suite hồi quy đạt.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | ui-check | PASS |
| E3 | AC-3 | ui-check | PASS |
| E4 | AC-4 | ui-check | PASS |
| E5 | AC-5 | ui-check | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-6 | script | PASS |
| E8 | AC-6 | script | FAIL |
| E9 | AC-6 | script | PASS |
| E10 | AC-6 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-che-vung-anh-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T05:33:55Z

- eval: E2
  run_id: E2-20261102
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T05:33:55Z
  screenshot: evidence/E2-step1.png
  observed: |
    Đã mở bằng Read cả 6 frame. E2-step1.png: hồ sơ căn A-04.06 «Đang bán», thẻ «Gửi được (5)» gồm 1 ảnh Bìa có sẵn từ trước cộng bốn ảnh thử (ngang, dọc, nhỏ, rất rộng) vừa tải, ô vuông đỏ ở tâm mỗi ảnh. E2-ngang.png: hộp «Che vùng» rộng 1024 nằm giữa cửa sổ 1440×900, canvas «ngang 2000x1500» 800×600 nằm trọn trong hộp, hàng chân nằm dưới canvas, nút «Lưu bản che» không bị canvas chồng. E2-doc.png: canvas «doc 1500x2000» 450×600 ở giữa hộp, hộp vẫn nằm trọn trong cửa sổ. E2-nho.png: canvas «nho 400x300» hiện 400×300 (không phóng to), hộp thấp hơn và căn giữa. E2-rong.png: canvas «rong 3000x600» 960×192 gần hết bề ngang hộp, hàng chân bên dưới. E2-step2.png là bản sao E2-ngang.png. Cả bốn frame khớp Expected, không thấy lỗi bố cục.
  network_observed: clean

- eval: E3
  run_id: E3-20261102
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T05:33:55Z
  screenshot: evidence/E3-step1.png
  observed: |
    Đã mở bằng Read cả ba frame. E3-step1.png (1024×768, hồ sơ căn B-15.05 Toà B, dau-chu-1): mục «Ảnh» thẻ «Gửi được (5)» có lưới ảnh, ảnh ngang và ảnh dọc đều thấy ô đỏ giữa nền xám, mỗi ảnh có nút «...». E3-ngang.png (ảnh 2000×1500): hộp «Che vùng» nằm trọn trong cửa sổ, đáy hộp khoảng y=740 trên 768; canvas xám có ô vuông đỏ ở tâm nằm giữa hộp, đáy canvas khoảng y=663 nằm trên hàng chân; hàng chân hiện «0 vùng che», «Bỏ khung cuối», «Bỏ hết», «Lưu bản che», nút «Lưu bản che» nằm trong hộp ở góc phải dưới, không chồng canvas. E3-doc.png (ảnh 1500×2000): hộp giống ngang, canvas dọc 421 rộng × 560 cao ở giữa hộp, đáy canvas trên hàng chân, nút «Lưu bản che» trong hộp và trong cửa sổ. Cả hai khung khớp Expected, không thấy chồng chéo hay tràn.
  network_observed: clean

- eval: E4
  run_id: E4-va-che-vung-anh-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T05:33:55Z
  screenshot: evidence/E4-step1.png
  observed: |
    Đã mở và đọc cả ba frame. E4-step1.png (hộp «Che vùng» vừa mở, 1024×768): canvas ảnh dọc xám có ô vuông đỏ ở tâm, nằm gọn trong hộp, nút «Lưu bản che» ở chân hộp, chân hộp ghi «0 vùng che». E4-keo.png và E4-step2.png (hai bản giống nhau, sau kéo chuột thật): một khối đen chữ nhật nằm trong canvas, từ khoảng x 386–638 và y 215–551 trên màn, khớp điểm kéo ở 0,2 và 0,8 mỗi trục của canvas hiển thị. Canvas rộng 303–721 và cao 104–663. Chân hộp ghi «1 vùng che». Ô đỏ ở tâm bị khối đen che hết. Khối đen không lệch về phía góc trên-trái như bản lỗi, vì cạnh dưới ở 551 so với đáy canvas 663 và cạnh phải ở 638 so với mép phải 721. Mép đen khớp với số đo pixel ở bên dưới.
  network_observed: clean

- eval: E5
  run_id: minted-va-che-vung-anh-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T05:33:55Z
  screenshot: evidence/E5-step1.png
  observed: |
    Đã mở bằng Read file /Users/manhphan/dev/onehub-quy-hang/.claude/worktrees/elated-jennings-2baf11/_acceptance/va-che-vung-anh/evidence/E5-step1.png (cùng nội dung E5-dien-thoai.png, 375×812). Khung hình là điện thoại, nền sau hộp bị làm mờ. Hộp thoại «Che vùng» gần như chạm hai mép màn hình, chừa lề 16px mỗi bên. Trong hộp có tiêu đề «Che vùng», dòng mô tả «Kéo để vẽ vùng che. Bản che lưu ở ngăn Gửi được; bản gốc sang Nội bộ.», nút đóng X ở góc trên phải, rồi canvas ảnh xám có ô vuông đỏ ở tâm. Canvas nằm trọn trong hộp, có lề hai bên và không chạm mép hộp. Hàng chân hộp có chữ «0 vùng che» và đúng ba nút xếp dọc, giữa hàng: «Lưu bản che» ở trên, «Bỏ hết» ở giữa, «Bỏ khung cuối» ở dưới. Cả ba nút đều mờ vì chưa vẽ khung nào. Thứ tự hiển thị đảo so với thứ tự trong DOM (Bỏ khung cuối, Bỏ hết, Lưu bản che). Khung hình khớp số đo, không có chỗ nào mâu thuẫn Expected.
  network_observed: clean

- eval: E6
  run_id: minted-va-che-vung-anh-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T05:33:55Z

- eval: E7
  run_id: minted-va-che-vung-anh-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-02T05:33:55Z

- eval: E8
  run_id: minted-va-che-vung-anh-E8-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-02T05:33:55Z
  output: |
    > lint
    > eslint . && node packages/ui-lint/check-bare-disables.mjs && node packages/ui-lint/muc-no.mjs && node packages/ui-lint/kiem-chuan.mjs
    .acceptance-runs/va-che-vung-anh/acceptance-verify.js
      210:3  error  Parsing error: 'return' outside of function
    apps/web/src/app/(app)/inventory/cell-edit/tren-o.tsx
      20:15  warning  'LoiTrenMay' is defined but never used  @typescript-eslint/no-unused-vars
    ✖ 2 problems (1 error, 1 warning)
    Bước eslint dừng ở lỗi phân tích cú pháp nên ba bước sau (kiểm tắt-luật-trần, mức nợ giao diện, kiểm chuẩn giao diện) không chạy tới. Dòng «mức nợ giao diện: 0/0» và «chuẩn giao diện: đạt» không xuất hiện, expected của E8 không được đáp ứng.

- eval: E9
  run_id: minted-va-che-vung-anh-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-02T05:33:55Z

- eval: E10
  run_id: minted-va-che-vung-anh-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-che-vung-anh/thu/ranh-gioi.mjs
  verified_at: 2026-11-02T05:33:55Z
  output: |
    0 tệp ngoài ranh giới

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-che-vung-anh-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-02T05:33:55Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-che-vung-anh-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-02T05:33:55Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-che-vung-anh-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-02T05:33:55Z

- cmd: npm run test:hooks
  run_id: minted-va-che-vung-anh-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-02T05:33:55Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-che-vung-anh-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-02T05:33:55Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên nhánh lẫn baseline, chứng minh bộ thử chứ chưa chứng minh tính năng; nên viết lại để assert hành vi mới, hoặc xác nhận là rào hồi quy có chủ ý):
- E1, E6 (npm test -w @quy-hang/web)
- E7 (npm run typecheck)
- E9 (design-floor-s4)

E8 (lint) xanh trên baseline và trượt ở nhánh này. Nguyên nhân nằm ở hai chỗ: một lỗi phân tích cú pháp trong tệp acceptance-verify.js dưới thư mục .acceptance-runs/va-che-vung-anh (dòng 210, «'return' outside of function»), và một cảnh báo biến `LoiTrenMay` khai báo mà không dùng ở apps/web/src/app/(app)/inventory/cell-edit/tren-o.tsx dòng 20. Lệnh lint không có lệnh fail nào mà không gắn eval.

Baseline không đo:
- node _acceptance/va-che-vung-anh/thu/ranh-gioi.mjs: bo qua baseline: tep _acceptance/va-che-vung-anh/thu/ranh-gioi.mjs co o cay dang kiem nhung chua co o merge-base d91d30acd528ef949e4253a9a76381782114071b — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E8 failed — lint dừng ở lỗi phân tích cú pháp của tệp acceptance-verify.js (thư mục .acceptance-runs) và một cảnh báo biến không dùng ở tren-o.tsx; ba bước lint sau không chạy tới. Returned to implementation.
