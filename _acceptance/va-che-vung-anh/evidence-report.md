---
schema_version: 2
feature_slug: va-che-vung-anh
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 157c783fec870f1df83f3e969241f816c5bafc96
human_signoff: Manh Phan 2026-11-02
---

# Evidence Report: va-che-vung-anh

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | ui-check | PASS |
| E3 | AC-3 | ui-check | PASS |
| E4 | AC-4 | ui-check | PASS |
| E5 | AC-5 | ui-check | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-6 | script | PASS |
| E8 | AC-6 | script | PASS |
| E9 | AC-6 | script | PASS |
| E10 | AC-6 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-che-vung-anh-E1-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T05:50:20Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 355.299042

- eval: E2
  run_id: e2-va-che-vung-anh-20261102T0555Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T05:50:20Z
  screenshot: evidence/E2-step1.png
  observed: |
    Da mo bang Read tung frame that. E2-step1.png (1440x900): ho so can A-04.06 "Dang ban", muc Anh o the "Gui duoc (14)"; luoi thumbnail co nen xam voi o vuong do o tam (ngang 2000x1500, nho 400x300 nhin thay), nut "Chon anh" — bon anh thu da len. E2-ngang.png: hop "Che vung" rong 1024px (x 208 den 1232, y 72.5 den 827.5) nam tron trong cua so 1440x900; canvas 800x600 (x 319 den 1121, y 148.5 den 750.5) nam giua hop, nen xam, o do o tam; hang chan co "0 vung che", "Bo khung cuoi", "Bo het", "Luu ban che" nam duoi canvas (day canvas 750.5 <= dinh nut 783.5), khong chong nhau. E2-doc.png: hop cung 1024 rong, canvas doc 450x600 (x 494 den 946) nam giua, o do giua, nut Luu ban che duoi canvas. E2-nho.png: hop thap hon (y 222.5 den 677.5), canvas 400x300 dung kich co (khong phong to), nam giua, nut ben duoi. E2-rong.png: canvas 960x192 vua trong hop (x 239 den 1201 trong hop 208 den 1232), ti le 5:1, nut ben duoi. E2-step2.png trung E2-ngang.png (cung md5). Moi frame khop so do trong E2-measure.json; khong frame nao mau thuan Expected.
  network_observed: unscoped-partial   # words only — raw statuses live in evidence/E2-network.txt

- eval: E3
  run_id: minted-va-che-vung-anh-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T05:50:20Z
  screenshot: evidence/E3-step1.png
  observed: |
    E3-step1.png (1024×768, dau-chu-1, ho so can B-15.05 Toa B): muc «ANH», the «Gui duoc (5)», luoi anh co anh bia xanh, hai anh xam voi o do o tam (ngang va doc, thumb), moi anh co nut «...». E3-ngang.png (anh goc do lai = 2000×1500): hop «Che vung» tron trong cua so (dinh y≈27, day y≈740 tren 768); canvas xam co o do o tam nam giua hop (≈139–885 x ≈104–663), day canvas nam tren hang chan; hang chan hien «0 vung che», «Bo khung cuoi», «Bo het», «Luu ban che» o goc phai duoi, nut trong hop va trong cua so, khong chong canvas. E3-doc.png (anh goc do lai = 1500×2000): hop giong nhau, canvas dung (≈303–721 x ≈104–663) o giua, day canvas tren hang chan, nut «Luu ban che» trong hop va cua so. Khop Expected, khong thay chong cheo hay tran. E3-step2/step3 la ban sao cua ngang/doc.
  network_observed: clean   # words only — raw statuses live in evidence/E3-network.txt

- eval: E4
  run_id: minted-va-che-vung-anh-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T05:50:20Z
  screenshot: evidence/E4-keo.png
  observed: |
    E4-step1.png (khổ 1024×768, hộp «Che vùng» vừa mở, 0 vùng che): canvas ảnh dọc xám, ô đỏ nhỏ ở tâm, chưa có vùng đen, nằm gọn trong hộp; chân hộp «0 vùng che» + «Bỏ khung cuối», «Bỏ hết», «Lưu bản che». Khung hiển thị 420×560 (nhỏ hơn cỡ vẽ 450×600), khớp s<1. E4-keo.png (= E4-step2.png, byte giống nhau): sau khi kéo thật, có đúng một khối đen từ khoảng x 386–638, y 215–551 trên màn, tương ứng 0,2–0,8 mỗi trục của canvas (canvas x 302–722, y 104–663); phía ngoài khối còn xám; chân hộp «1 vùng che»; hai nút «Bỏ khung cuối»/«Bỏ hết» sáng lên. Khớp Expected. Số đo: r = {left 301,75; top 103,5; width 420,5; height 560}; canvas 450×600; s = 0,9344; kéo (385,85;215,5) → (638,15;551,5). Điểm dò (đọc getImageData): 0,5 → (225,300) RGBA 0,0,0,255 (bản đúng đen, bản lỗi đen); 0,78 → (351,468) 0,0,0,255 (bản đúng đen, bản lỗi KHÔNG đen, vì vùng lỗi chỉ tới 0,7476) ⇒ điểm phân biệt; 0,82 → (369,491) 136,136,136,255 (không đen ở cả hai bản); 0,15 → (67,90) 136,136,136,255 (không đen ở cả hai bản).
  network_observed: clean   # words only — raw statuses live in evidence/E4-network.txt

- eval: E5
  run_id: E5-20261102-doclap
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T05:50:20Z
  screenshot: evidence/E5-step1.png
  observed: |
    Đã mở bằng Read cả ba frame. (1) E5-step1.png (375x812, căn A-04.06 Toà A, dau-chu-1, trước khi mở trình che): hồ sơ căn «Đang bán», mục ẢNH thẻ «Gửi được (14)» (số ảnh tăng do phiên khác cùng tải ảnh thử vào căn này, không phải eval này), lưới ảnh nền xám ô vuông đỏ, ảnh «ngang 2000x1500» ở ô thứ hai có nút «...» đang được focus; không tràn ngang. (2) E5-dien-thoai.png (375x812): hộp «Che vùng» chiếm gần hết bề ngang cửa sổ, chừa lề đều hai bên (16px mỗi bên), canvas xám có chữ «ngang 2000x1500» và ô vuông đỏ ở tâm nằm trọn trong hộp, các cạnh canvas cách mép hộp đều; dưới canvas là hàng chân xếp dọc ba nút theo thứ tự trên xuống «Lưu bản che», «Bỏ hết», «Bỏ khung cuối» (cả ba mờ vì chưa có vùng che) và chữ «0 vùng che» ở góc trái dưới; nút X đóng nằm ở góc phải đầu hộp, không thuộc hàng chân. (3) E5-step2.png: sau khi nhấn Escape hộp đã đóng, quay lại hồ sơ căn, thẻ vẫn «Gửi được (14)», ô ảnh «ngang» không đổi. Cả ba khớp Expected, không thấy chồng chéo hay tràn ngang.
  network_observed: unscoped-partial   # words only — raw statuses live in evidence/E5-network.txt

- eval: E6
  run_id: minted-va-che-vung-anh-E6-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T05:50:20Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 355.299042

- eval: E7
  run_id: minted-va-che-vung-anh-E7-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-02T05:50:20Z

- eval: E8
  run_id: minted-va-che-vung-anh-E8-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-02T05:50:20Z
  output: |
    chuẩn giao diện: đạt

- eval: E9
  run_id: minted-va-che-vung-anh-E9-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-02T05:50:20Z

- eval: E10
  run_id: minted-va-che-vung-anh-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-che-vung-anh/thu/ranh-gioi.mjs
  verified_at: 2026-11-02T05:50:20Z
  output: |
    0 tệp ngoài ranh giới

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-che-vung-anh-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-11-02T05:50:20Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-che-vung-anh-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-02T05:50:20Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-che-vung-anh-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-02T05:50:20Z

- cmd: npm run test:hooks
  run_id: minted-va-che-vung-anh-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-02T05:50:20Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-che-vung-anh-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-11-02T05:50:20Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không-phân-biệt (pass trên cả HEAD lẫn baseline — chứng minh harness, không chứng minh feature; viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):

- npm test -w @quy-hang/web: E1, E6
- npm run typecheck: E7
- npm run lint: E8
- R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-s4.mjs" --root .: E9

Baseline khong do:

- node _acceptance/va-che-vung-anh/thu/ranh-gioi.mjs: bo qua baseline: tep _acceptance/va-che-vung-anh/thu/ranh-gioi.mjs co o cay dang kiem nhung chua co o merge-base d91d30acd528ef949e4253a9a76381782114071b — eval moi, chay tren code cu khong phan biet gi

Ghi chú mạng: E2 và E5 chạy trên origin app thử ngoài phạm vi dev_server.url đã khai nên trạng thái mạng là unscoped-partial (chỉ ghi chú, không làm eval trượt). Số liệu thô nằm trong evidence/E{id}-network.txt.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E8 failed — bản sao kịch bản chấm nằm trong cây làm lint đỏ; dời ra ngoài cây, chấm lại.
Round 2: E7, E8 chạy lại, các eval còn lại mang sang từ round 1; bài nhìn E2, E4 bị phát hiện thiếu tệp số đo — bắt ghi số đo vào evidence/<E>-measure.json, chấm lại.
Round 3: chạy lại toàn bộ 10 eval trên commit 157c783; E2–E5 ghi đủ khung ảnh, số đo và mạng — tất cả PASS.
