---
schema_version: 2
feature_slug: trang-thai-rieng
verdict: REJECT
failed_evals: ["E15"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c74620d178d80393f24f8b1098d9ea1b1db9617c
human_signoff:
---

# Evidence Report: trang-thai-rieng

Vòng 1. Một eval truot: E15 (AC-7). Lenh suite `npm run typecheck` cung do (khong gan eval nao), xem muc Lenh suite.

Lenh fail khong gan eval: `npm run typecheck` (ma thoat 2, loi `.next/types/validator.ts` Route/never o apps/web) va `ui-check:E15` (gan eval E15).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E2c | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E3c | AC-3 | test | PASS |
| E3d | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | script | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E6c | AC-7 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E7c | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E10b | AC-10 | test | PASS |
| E11 | AC-1 | ui-check | PASS |
| E12 | AC-3 | ui-check | PASS |
| E13 | AC-8 | ui-check | PASS |
| E14 | AC-1 | script | PASS (dat co gioi han) |
| E14b | AC-1 | script | PASS |
| E15 | AC-7 | ui-check | REJECT |

## Analyst

Eval khong phan biet (xanh tren CA HEAD lan baseline):
- npm test -w @quy-hang/core: E2, E3b, E6b, E10b
- npm test -w @quy-hang/web: E2c, E3c, E4b, E6, E7, E8b, E9b, E10
- npm run test:ro-ri: E5b

Baseline khong do
- node _acceptance/trang-thai-rieng/kiem-khuon-e14.mjs: bo qua baseline: tep _acceptance/trang-thai-rieng/kiem-khuon-e14.mjs co o cay dang kiem nhung chua co o merge-base 24dbfb2de227ce73a8fc9aaf6306347a8c34cd8a — eval moi, chay tren code cu khong phan biet gi

## Evidence

- eval: E1
  run_id: minted-trang-thai-rieng-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T22:54:59Z
  output: |
    npm run db:migrate && npm run db:test — duration_ms 97224.786

- eval: E2b
  run_id: minted-trang-thai-rieng-E2b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T22:54:59Z
  output: |
    npm run db:migrate && npm run db:test — duration_ms 97224.786

- eval: E3
  run_id: minted-trang-thai-rieng-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T22:54:59Z
  output: |
    npm run db:migrate && npm run db:test — duration_ms 97224.786

- eval: E4
  run_id: minted-trang-thai-rieng-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T22:54:59Z
  output: |
    npm run db:migrate && npm run db:test — duration_ms 97224.786

- eval: E5
  run_id: minted-trang-thai-rieng-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T22:54:59Z
  output: |
    npm run db:migrate && npm run db:test — duration_ms 97224.786

- eval: E7b
  run_id: minted-trang-thai-rieng-E7b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T22:54:59Z
  output: |
    npm run db:migrate && npm run db:test — duration_ms 97224.786

- eval: E8
  run_id: minted-trang-thai-rieng-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T22:54:59Z
  output: |
    npm run db:migrate && npm run db:test — duration_ms 97224.786

- eval: E9
  run_id: minted-trang-thai-rieng-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T22:54:59Z
  output: |
    npm run db:migrate && npm run db:test — duration_ms 97224.786

- eval: E3d
  run_id: minted-trang-thai-rieng-E3d-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T22:54:59Z
  output: |
    npm run db:migrate && npm run db:test — duration_ms 97224.786

- eval: E6c
  run_id: minted-trang-thai-rieng-E6c-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T22:54:59Z
  output: |
    npm run db:migrate && npm run db:test — duration_ms 97224.786

- eval: E7c
  run_id: minted-trang-thai-rieng-E7c-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T22:54:59Z
  output: |
    npm run db:migrate && npm run db:test — duration_ms 97224.786

- eval: E2
  run_id: minted-trang-thai-rieng-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T22:54:59Z
  output: |
    npm test -w @quy-hang/core — duration_ms 1103.630916

- eval: E3b
  run_id: minted-trang-thai-rieng-E3b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T22:54:59Z
  output: |
    npm test -w @quy-hang/core — duration_ms 1103.630916

- eval: E6b
  run_id: minted-trang-thai-rieng-E6b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T22:54:59Z
  output: |
    npm test -w @quy-hang/core — duration_ms 1103.630916

- eval: E10b
  run_id: minted-trang-thai-rieng-E10b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T22:54:59Z
  output: |
    npm test -w @quy-hang/core — duration_ms 1103.630916

- eval: E2c
  run_id: minted-trang-thai-rieng-E2c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T22:54:59Z
  output: |
    npm test -w @quy-hang/web — duration_ms 4210.518167

- eval: E3c
  run_id: minted-trang-thai-rieng-E3c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T22:54:59Z
  output: |
    npm test -w @quy-hang/web — duration_ms 4210.518167

- eval: E4b
  run_id: minted-trang-thai-rieng-E4b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T22:54:59Z
  output: |
    npm test -w @quy-hang/web — duration_ms 4210.518167

- eval: E6
  run_id: minted-trang-thai-rieng-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T22:54:59Z
  output: |
    npm test -w @quy-hang/web — duration_ms 4210.518167

- eval: E7
  run_id: minted-trang-thai-rieng-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T22:54:59Z
  output: |
    npm test -w @quy-hang/web — duration_ms 4210.518167

- eval: E8b
  run_id: minted-trang-thai-rieng-E8b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T22:54:59Z
  output: |
    npm test -w @quy-hang/web — duration_ms 4210.518167

- eval: E9b
  run_id: minted-trang-thai-rieng-E9b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T22:54:59Z
  output: |
    npm test -w @quy-hang/web — duration_ms 4210.518167

- eval: E10
  run_id: minted-trang-thai-rieng-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T22:54:59Z
  output: |
    npm test -w @quy-hang/web — duration_ms 4210.518167

- eval: E5b
  run_id: minted-trang-thai-rieng-E5b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-05T22:54:59Z
  output: |
    npm run test:ro-ri — duration_ms 416.970375

- eval: E14
  run_id: minted-trang-thai-rieng-E14-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T22:54:59Z
  output: |
    16 tệp giao diện ngoài bản đồ
    (ma thoat 1 la ket qua da khai truoc, dat co gioi han, di cung E14b)

- eval: E14b
  run_id: minted-trang-thai-rieng-E14b-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/trang-thai-rieng/kiem-khuon-e14.mjs
  verified_at: 2026-11-05T22:54:59Z
  output: |
    E14b: chỉ có dòng báo oan đã khai (1): lệch: apps/web/src/app/(app)/settings/statuses/page.tsx · thuộc hai nhóm màn: cai-dat-san, trang-tam

- eval: E11
  run_id: minted-trang-thai-rieng-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T22:54:59Z
  screenshot: evidence/E11-step1.png
  observed: |
    step1 (1440): vỏ đủ cột nhà (icon), header «[Mẫu] Sàn thử», cột Cài đặt với mục «Trạng thái» sáng; breadcrumb Cài đặt › Sàn [Mẫu] Sàn thử › Trạng thái; một Frame «Nhãn trạng thái của sàn» chứa sáu nhóm có huy hiệu màu (cam, xanh lá, tím, xám, vàng, đỏ), mỗi nhóm có «Thêm nhãn», nút Lưu. Khớp Expected. step2: dưới Đang giao dịch có ô «Giữ chỗ» (Nhãn riêng, 0 căn đang mang), thông báo «Đã lưu trạng thái — Bảng hàng và Hôm nay dùng nhãn mới từ lần mở kế.» ở cuối; khớp. step3: dưới Tạm ngừng có ô «Đang bán» viền đỏ, dòng đỏ «Trùng tên trạng thái «Đang bán»», nút Lưu xám khoá; khớp. step4 (375): vỏ điện thoại, tiêu đề Trạng thái, Frame với huy hiệu nhóm và nhãn «Giữ chỗ», thanh tab dưới, không cuộn ngang; khớp.
  network_observed: clean
  output: |
    Server dev cổng 3462 (DB dãy B 5572) tự khởi động, đã tắt khi xong. Đăng nhập OTP quan-tri@mau.quy-hang.test OK. Thêm «Giữ chỗ» ở Đang giao dịch, Lưu, tải lại còn; thêm «Đang bán» ở Tạm ngừng bị chặn, Lưu khoá; khổ 375 không cuộn ngang.

- eval: E12
  run_id: minted-trang-thai-rieng-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T22:54:59Z
  screenshot: evidence/E12-step1.png
  observed: |
    E12-step1.png (1440): lưới Bảng hàng, thực đơn trạng thái mở dưới ô Trạng thái của A-13.01 đang «Đang bán». Các chip theo thứ tự: Đang giao dịch, Giữ chỗ, Đã bán, Tạm ngừng, Ngừng hẳn; dòng chú thích «Tính là vừa xác nhận với chủ nhà». «Giữ chỗ» nằm liền sau «Đang giao dịch» trên cùng hàng chip. Đúng Expected về thứ tự; bố cục là hàng chip chứ không phải danh sách dọc.
    E12-step2.png (1440): ô A-13.01 hiện huy hiệu «Giữ chỗ» màu tím nhạt, cùng kiểu với huy hiệu «Đang giao dịch» của A-13.03. Toast «Đã đổi trạng thái A-13.01 · Tính là vừa xác nhận với chủ nhà · Hoàn tác». Khớp Expected.
    E12-step3.png (1440): ô lọc cột Trạng thái là «Đang giao dịch», bộ đếm 6 / 36 căn; căn «Giữ chỗ» nằm trong kết quả lọc. Khớp Expected.
    E12-step4.png (375): danh sách thẻ căn; thẻ A-13.01 gắn nhãn «Giữ chỗ», cùng tông tím với thẻ A-13.03 «Đang giao dịch». Khớp Expected.
    E12-step5.png (1440, ngữ cảnh mới, quan-tri): Bảng hàng 29 căn, hàng 1 là A-13.01 hiện «Giữ chỗ» (tím). Khớp Expected: nhãn đến người thứ hai qua đồng bộ.
  network_observed: clean
  output: |
    Ngữ cảnh trình duyệt mới thấy A-13.01 «Giữ chỗ» sau đồng bộ. Đã tắt máy chủ dev cổng 3462.

- eval: E13
  run_id: minted-trang-thai-rieng-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T22:54:59Z
  screenshot: evidence/E13-step1.png
  observed: |
    E13-step1.png: nền mờ màn Trạng thái, hộp giữa màn tiêu đề «Gỡ nhãn «Giữ chỗ»?», dòng «1 căn đang là «Giữ chỗ». Chuyển chúng sang:», một lựa chọn «Đang giao dịch» (chưa tích), nút «Giữ nhãn» và «Gỡ và chuyển» (xám, chưa bấm được). Khớp Expected. E13-step2.png: màn Trạng thái sáu nhóm, nhóm «Đang giao dịch» chỉ còn nút «Thêm nhãn» (không còn «Giữ chỗ»), thông báo «Đã lưu trạng thái — Bảng hàng và Hôm nay dùng nhãn mới từ lần mở kế». Khớp. E13-step3.png: Bảng hàng 29 căn, nhiều căn hiện huy hiệu «Đang giao dịch» (A-13.01, A-13.03, A-15.04), không có huy hiệu «Giữ chỗ». Khớp.
  network_observed: clean
  output: |
    Cột status_label của listings là NULL ở cả 40 dòng sau khi gỡ nhãn; 6 căn Pending hiển thị «Đang giao dịch». Chỉ có 1 lỗi console hydration, không phải lỗi mạng.

- eval: E15
  run_id: minted-trang-thai-rieng-E15-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T22:54:59Z
  screenshot: evidence/E15-step1.png
  observed: |
    E15-step1.png (đã mở bằng Read; khung 1440x900 thu nhỏ 800x500, đăng nhập dau-chu-1, URL /today?nhom=recent_change): tiêu đề «Hôm nay», 23 việc, dòng thông báo «Hôm nay không có việc ở «Mới đổi»»; thanh trái có «Mới đổi» được chọn. Bảng chỉ có nhóm «Lead mới» (8) và «Thiếu thông tin» (15). KHÔNG có nhóm «Mới đổi» và không có dòng «Đang bán → Giữ chỗ — Trưởng nhóm, hôm nay». Mâu thuẫn Expected.
  network_observed: clean
  output: |
    Trưởng nhóm POST status_changed {to Pending, label giu_cho} lên căn A-04.06 của đầu chủ: ghi nhận đúng, đầu chủ đọc được standardStatus Pending và statusLabel giu_cho. Nhưng /today của đầu chủ không có nhóm «Mới đổi»; căn A-04.06 nằm ở nhóm «Thiếu thông tin».
    Nguyên nhân quan sát được: chiaNhom/nhomCuaCan (packages/core/src/today/hang-doi.ts) lấy nhóm khớp đầu tiên theo thứ tự bộ; «Thiếu thông tin» đứng trước «Mới đổi» nên nuốt căn vừa đổi. Dữ liệu API và sự kiện đúng, lỗi ở lớp nhóm Hôm nay hoặc bộ mẫu thiếu căn đủ thông tin. Không sửa code.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-trang-thai-rieng-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-05T22:54:59Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-trang-thai-rieng-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-05T22:54:59Z

- cmd: npm run test:hooks
  run_id: minted-trang-thai-rieng-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-05T22:54:59Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-trang-thai-rieng-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-05T22:54:59Z

- cmd: npm run typecheck
  run_id: minted-trang-thai-rieng-SUITE-typecheck-r1
  exit_code: 2
  verified_at: 2026-11-05T22:54:59Z

- cmd: npm run lint
  run_id: minted-trang-thai-rieng-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-05T22:54:59Z

## Known limits

- E14 (AC-1) dat-co-gioi-han: ma thoat 1 la ket qua DA KHAI TRUOC cua eval nay, khong phai mot luot truot. Lenh: R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-khuon.mjs" --kiem --root .

## Ngoài hợp đồng

## Variance

none — moi eval nhieu-lan deu dong nhat (khong eval nao co runs lon hon 1).

## Iterations

Round 1: E15 failed — Hôm nay không đưa căn vừa đổi sang «Giữ chỗ» vào nhóm «Mới đổi» (bị nhóm «Thiếu thông tin» nuốt theo thứ tự khớp đầu tiên). Ngoài ra typecheck của apps/web đỏ ở `.next/types/validator.ts`. Returned to implementation.
