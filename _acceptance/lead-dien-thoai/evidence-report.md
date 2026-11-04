---
schema_version: 2
feature_slug: lead-dien-thoai
verdict: BLOCKED
failed_evals: []
reason: |
  Tám eval ui-check (E2, E3, E4, E5, E6, E9, E8) không chạy được vì chỗ thử dãy D (máy dev cổng 3476 do dung-d.mjs dựng) không lên: một máy next dev có sẵn (PID 48719, cổng 3460, cùng thư mục apps/web) giữ khoá, Next từ chối máy thứ hai. Verifier không tắt máy không phải của mình; chưa có kết quả đối chứng nào cho các eval này. Chi tiết từng eval ở mục «Bị chặn» trong Evidence.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 988bda469d62649321ee3ec92af589d137fbac9a
human_signoff:
---

# Evidence Report: lead-dien-thoai

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E7a | AC-7 | script | PASS |
| E7b | AC-7 | test | PASS (carry-forward từ round 1) |
| E1 | AC-1 | ui-check | PASS |
| E2 | AC-2 | ui-check | BLOCKED |
| E3 | AC-3 | ui-check | BLOCKED |
| E4 | AC-4 | ui-check | BLOCKED |
| E5 | AC-5 | ui-check | BLOCKED |
| E6 | AC-6 | ui-check | BLOCKED |
| E9 | AC-9 | ui-check | BLOCKED |
| E8 | AC-8 | ui-check | BLOCKED |

## Evidence

- eval: E7a
  run_id: minted-lead-dien-thoai-E7a-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T11:02:38Z
  output: |
    6 tệp giao diện ngoài bản đồ

- eval: E1
  run_id: minted-lead-dien-thoai-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T11:02:38Z
  screenshot: evidence/E1-step1.png
  observed: |
    E1-nhap-390.png (khung 390 rong, da mo bang Read): tieu de «Lead», «O nhan lead», thanh tab «Nhap lead» (dang chon) / «Lead da nhap» o cung tab. Mot cot, nam muc xep doc: So chu nha (o 0900 000 000), Can hoac toa (ma can + chon Toa), Nhu cau (Ban / Cho thue / Ca hai), Gia (o Gia chu muon + Bao phi / Khong bao phi), Thoi gian muon ra hang (Ngay / Trong 1 thang / 1-3 thang / Chua dinh). Nut «Gui lead» nam o day khung nhin, ngay tren thanh dieu huong, khong thay cuon ngang. Khop Expected. E1-step1.png la ban chup cung phep do (khac byte nhung cung noi dung luong), khong mo thuan nhat de doc rieng ngoai viec cmp thay khac byte.
  network_observed: n-a (driver)

- eval: E7b
  run_id: minted-lead-dien-thoai-E7b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-04T10:14:44Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

### Bị chặn (không chạy được, không phải kết quả đánh giá tính năng)

- ui-check:E2 — chay-ui.mjs đặt cứng URL chỗ thử http://localhost:3476, không dùng http://localhost:3460 của config. Máy dev dãy D ở 3476 đã chết (.acceptance-runs/lead-dien-thoai/web-d51.pid không còn tiến trình) và dung-d.mjs không dựng lại được: `next dev` thứ hai cùng thư mục bị chặn vì máy dev 3460 do tôi khởi động đang giữ khoá. Lệnh kill máy 3460 bị bộ phân loại quyền từ chối nên tôi dừng, không lách. Chưa có kết quả đối chứng nào cho E2; không đoán đạt hay hỏng.
  - run_id: minted-lead-dien-thoai-E2-r2
  - screenshot: evidence/E2-step1.png
  - observed: |
      Đã mở E2-step1.png: màn "Ô nhận lead" 390px, ô "Số chủ nhà" trống viền đỏ, dòng lỗi đỏ "Cần số điện thoại Việt Nam 10 chữ số" ngay dưới ô, các ô còn lại đã điền (Toà A, Bán, 3.200.000.000, Ngay). Khung này cho thấy ca thiếu số có lỗi đúng ô, nhưng soPostLead chưa đo được vì script chết trước khi in dòng e2. Bốn ca thiếu còn lại và ca đối chứng chưa chạy, nên chưa đủ chứng cứ đạt.
  - network_observed: n-a (tool-error: script không in dòng e2, không có dump mạng CDP)
  - baseline: n-a
- ui-check:E3 — Chỗ thử dãy D không dựng được. chay-ui.mjs chạy trên máy dev cổng 3476, do dung-d.mjs dựng. dung-d.mjs báo «máy dev không lên» vì Next 16 từ chối chạy hai máy dev cùng một thư mục. Một next dev có sẵn (PID 48719, cổng 3460, thư mục apps/web của chính worktree này) đang chiếm. Tôi không tự khởi động máy đó nên không được tắt. Máy 3460 cũng hỏng: /api/v1/health trả 500, trang gốc trả 307.
  - run_id: minted-lead-dien-thoai-E3-r2
  - network_observed: n-a (driver)
  - baseline: n-a
- ui-check:E4 — Không chạy được. chay-ui.mjs gắn cứng http://localhost:3476, là chỗ thử dãy D do dung-d.mjs dựng bằng `next dev -p 3476` trong cùng thư mục apps/web. Máy dev có sẵn ở cổng 3460 (PID 48719) đã giữ khoá thư mục này, nên Next từ chối bản thứ hai ("Another next dev server is already running"). Cổng 3476 không lên, mọi lệnh gọi từ chay-ui.mjs bị ECONNREFUSED. Tôi không tắt máy 3460 vì nó có sẵn từ trước, và không sửa code. Chạy lại được khi máy dev 3460 tắt hoặc chỗ thử được tách riêng.
  - run_id: minted-lead-dien-thoai-E4-r2
  - network_observed: n-a (tool-error: không chạy được, chỗ thử cổng 3476 không lên)
  - baseline: n-a
- ui-check:E5 — Không chạy được phép nhìn E5. chay-ui.mjs trỏ vào máy thử dãy D ở cổng 3476 (dung-d.mjs dựng), nhưng cổng 3476 không có máy nào. Dựng lại bằng dung-d.mjs thì next dev ở 3460 (PID 48719, có sẵn, không phải tôi bật) chặn: "Another next dev server is already running" — cùng thư mục apps/web, Next chỉ cho một máy dev. Máy 3460 lại trả 500 ở /login và /api/v1/health. Tôi không tắt máy không phải của mình nên dừng ở đây.
  - run_id: minted-lead-dien-thoai-E5-r2
  - network_observed: n-a (driver)
  - baseline: n-a
- ui-check:E6 — Không chạy được E6. chay-ui.mjs đọc máy dev dãy D ở cổng 3476 (URL_GOC cố định) cùng phiên đăng nhập do dung-d.mjs dựng. Cổng 3476 không có gì, và dung-d.mjs không dựng được vì Next báo "Another next dev server is already running" (PID 48719, cổng 3460, thư mục apps/web của worktree này). Đó là máy dev có sẵn, không phải tôi bật nên tôi không tắt. Cổng 3460 chỉ trả 307 sang /login nên cũng không thay được. Muốn chạy phải tắt máy dev 48719 rồi chạy lại dung-d.mjs.
  - run_id: minted-lead-dien-thoai-E6-r2
  - network_observed: n-a (driver)
  - baseline: n-a
- ui-check:E9 — Không chạy được E9. chay-ui.mjs mã cứng máy dev của chỗ thử ở http://localhost:3476, không dùng 3460. Cổng 3476 không có máy nào nghe. Máy 3476 do dung-d.mjs dựng không lên được vì một máy next dev khác (PID 48719) đang giữ cổng 3460 cho cùng thư mục apps/web. Máy 3460 là máy có sẵn, không phải tôi khởi động, nên tôi không tắt. Đây là vấn đề môi trường (máy dev thừa), không phải kết quả đánh giá tính năng.
  - run_id: minted-lead-dien-thoai-E9-r2
  - network_observed: n-a (tool-error: máy dev 3476 không chạy, trang không tải được)
  - baseline: n-a
- ui-check:E8 — Không chạy được bước 1. Script chay-ui.mjs mở cổng 3476, không phải 3460. Cổng 3476 do dung-d.mjs dựng, và dung-d.mjs thất bại ("máy dev không lên") vì Next 16 từ chối chạy máy dev thứ hai trong cùng thư mục apps/web: một next-server PID 48719 đã giữ cổng 3460 từ trước, không do verifier khởi động. Tôi không tắt máy đó vì không phải của tôi. Khi chạy trực tiếp, chay-ui.mjs --e8 hết giờ chờ (chạy hai lần) ở điều kiện trang có [data-bo-cuc-goc], và không in dòng e8 nào, nên không có soMuc, soCotBang hay cuonNgang để đối chiếu.
  - run_id: minted-lead-dien-thoai-E8-r2
  - network_observed: n-a (driver)
  - baseline: n-a

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-lead-dien-thoai-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-04T11:02:38Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-lead-dien-thoai-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-04T11:02:38Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-lead-dien-thoai-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-04T11:02:38Z

- cmd: npm run test:hooks
  run_id: minted-lead-dien-thoai-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-04T11:02:38Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-lead-dien-thoai-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-04T11:02:38Z

- cmd: npm run typecheck
  run_id: minted-lead-dien-thoai-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-04T11:02:38Z

- cmd: npm run lint
  run_id: minted-lead-dien-thoai-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-04T11:02:38Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Eval không phân biệt (pass cả trên HEAD lẫn baseline): E7b (lệnh npm test -w @quy-hang/ui-lint).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lượt chấm lại ghi BLOCKED do máy dev thừa; E3, E4 đỏ. Returned to implementation.
Round 2: BLOCKED — E7a, E1 đạt, E7b carry-forward; E2, E3, E4, E5, E6, E9, E8 không chạy được vì chỗ thử cổng 3476 không dựng được (máy dev có sẵn PID 48719 giữ khoá thư mục apps/web). Cần tắt máy đó hoặc tách chỗ thử rồi chấm lại.
