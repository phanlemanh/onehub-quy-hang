---
schema_version: 2
feature_slug: doi-gia-nhanh
verdict: REJECT
failed_evals: ["E10"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2de3e591199bea2aec6baedcba7574a03a22b517
human_signoff:
---

# Evidence Report: doi-gia-nhanh

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | script | PASS |
| E9 | AC-7 | test | PASS |
| E8 | AC-8 | ui-check | PASS |
| E10 | AC-1 | ui-check | FAIL |

Lần này có hai lệnh không đạt: E10 (ui-check, đã gắn eval) và `npm run lint` (lệnh suite, không gắn eval nào). Chi tiết ở phần Evidence và Iterations.

## Evidence

- eval: E1
  run_id: minted-doi-gia-nhanh-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-08T02:53:26Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 14243.730333

- eval: E2
  run_id: minted-doi-gia-nhanh-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T02:53:26Z
  output: |
    npm test -w @quy-hang/web (một lần chạy chung cho E2 đến E6)
    ℹ duration_ms 4411.802

- eval: E3
  run_id: minted-doi-gia-nhanh-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T02:53:26Z
  output: |
    npm test -w @quy-hang/web (một lần chạy chung cho E2 đến E6)
    ℹ duration_ms 4411.802

- eval: E4
  run_id: minted-doi-gia-nhanh-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T02:53:26Z
  output: |
    npm test -w @quy-hang/web (một lần chạy chung cho E2 đến E6)
    ℹ duration_ms 4411.802

- eval: E5
  run_id: minted-doi-gia-nhanh-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T02:53:26Z
  output: |
    npm test -w @quy-hang/web (một lần chạy chung cho E2 đến E6)
    ℹ duration_ms 4411.802

- eval: E6
  run_id: minted-doi-gia-nhanh-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T02:53:26Z
  output: |
    npm test -w @quy-hang/web (một lần chạy chung cho E2 đến E6)
    ℹ duration_ms 4411.802

- eval: E7
  run_id: minted-doi-gia-nhanh-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-08T02:53:26Z
  output: |
    design-floor-khuon.mjs --kiem --root .
    4 tệp giao diện ngoài bản đồ

- eval: E9
  run_id: minted-doi-gia-nhanh-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-08T02:53:26Z
  output: |
    npm test -w @quy-hang/ui-lint
    ℹ duration_ms 44395.954417

- eval: E8
  run_id: minted-doi-gia-nhanh-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-08T02:53:26Z
  screenshot: evidence/E8-canh1-ngan-doi-gia.png
  observed: |
    Đã mở từng ảnh bằng Read. Hồ sơ /units/A-10.05 (Đang bán, dau-chu-1 giữ, 6,97 tỷ Bao phí), 375x812.
    Cảnh 1 (E8-canh1-ngan-doi-gia.png): chạm khối Giá, ngăn «Đổi giá · A-10.05» nổi từ đáy, ô 6,97 tỷ, nút Bao phí / Không bao phí, nút Lưu.
    Cảnh 2 (E8-canh2a-hoi-lai.png): gõ 9 tỷ, bấm Lưu, hiện khối hỏi lại «6,97 tỷ, Bao phí → 9 tỷ, Bao phí / Đổi +29% so với giá đang ghi — chắc chưa?». E8-canh2b-gia-moi.png: sau «Ghi», khối Giá hiện 9 tỷ. E8-canh2-4-lich-su-doi-gia-doi-trang-thai.png: Lịch sử có «Đổi giá · 6,97 tỷ → 9 tỷ — Bạn 08/11 09:54». Ảnh E8-canh2c-lich-su.png chỉ chụp đầu trang (dòng Lịch sử không nằm trong khung), đã chụp lại bằng ảnh có tên canh2-4.
    Cảnh 3: DB listings = 9000000000; E8-canh3a-inventory.png: Bảng hàng cuộn tới A-10.05 hiện 9 tỷ, Bao phí. Trang khách /s/6CA79Zbb81dN: innerText có «9 tỷ», không còn 6,97; ảnh E8-canh3b-trang-khach.png chỉ thấy cột Toà/Mã căn/Loại căn (cột giá nằm ngoài khung ngang, giá xác nhận bằng text).
    Cảnh 4: E8-canh4a có 4 nấc Đang giao dịch, Đã bán, Tạm ngừng, Ngừng hẳn (nhãn Đã cọc trong đề tương ứng «Đang giao dịch»). E8-canh4b: chọn Đã bán, Lưu không giá chốt, khung đỏ «Cần giá chốt». E8-canh4c: huy hiệu «Đang giao dịch». Lịch sử: «Đổi trạng thái · Đang bán → Đang giao dịch — Bạn 08/11 09:56» (ảnh E8-canh2-4 sau khi đổi giá lần 2 còn thấy dòng này cùng «Đổi giá 9 tỷ → 12 tỷ»). E8-canh4d chỉ chụp đầu trang.
    Cảnh 5: E8-canh5-da-ban-khoa-gia.png: A-01.03 Đã bán 4,65 tỷ, không có nút Đổi giá (0 phần tử data-nut=doi-gia), có chữ «Căn đã bán không đổi giá — giá chốt đã ghi»; chạm vào khối không mở ngăn.
    Cảnh 6: E8-canh6-telesales.png: telesales mở /units/A-10.05 thấy «Không thấy trang này — bạn không có quyền xem» (chặn hẳn hồ sơ, nghiêm hơn «không lối sửa»); không có nút sửa nào. Ảnh có huy hiệu dev «1 Issue».
    Số chạm: đổi giá 3 chạm (khối Giá, Lưu, Ghi) ≤ 4; đổi trạng thái 3 chạm (huy hiệu, nấc, Lưu) ≤ 3.
    Offline (E8-network-offline-luc-ghi.png, E8-network-online-sau-khi-mo-mang.png): ngắt mạng đúng lúc Ghi 9 → 12 tỷ, thấy banner «Đang xem bản đã tải — mất mạng, thay đổi được giữ trên máy», khối Giá hiện 12 tỷ; mở mạng, sự kiện được gửi.
  network_observed: clean

- eval: E10
  run_id: minted-doi-gia-nhanh-E10-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-08T02:53:26Z
  screenshot: evidence/E10-step1.html
  observed: |
    Frame E10-step1.html (bản HTML của E10-mang.txt, đã mở bằng Read). Vai trước khi gọi: dau-chu-1 = listing_agent, dau-chu-2 = listing_agent, quan-tri = company_admin, telesales = telesales. Căn mẫu 0daff353-14c5-41c6-8eb4-e7c839cb47a8 (Active) do dau-chu-1 giữ, ban đầu có 4 listing_events, version 4. telesales gọi đổi giá: máy chủ trả «không tìm thấy», số sự kiện giữ nguyên. quan-tri: cũng trả «không tìm thấy», số sự kiện giữ nguyên. dau-chu-2 (expectedVersion=4): thành công, sự kiện tăng thêm 1. dau-chu-1 (expectedVersion=5): thành công, sự kiện tăng thêm 1. Mẫu thuẫn với Expected ở hai dòng đầu: Expected đòi mã «cấm truy cập» nhưng API trả mã «không tìm thấy» cho hai vai không làm việc với hàng. Theo code, store.ts:224 trả notFound khi !lamViecVoiHang(viewer), tức là giấu có chủ đích. Hai dòng thành công khớp (+1 mỗi lần). Số event không đổi ở hai ca bị chặn nên chặn thật, nhưng sai mã trạng thái so với Expected.
  network_observed: n-a (driver)
  output: |
    Điều kiện chạy: dev_server.url cổng 3460 không có server. Server cổng 3494 do dung-h.mjs bật, cwd là đúng worktree dreamy-mahavira-36d819, health tốt. Dùng cổng 3494 và Postgres dãy H (5574). Không tự start hay tắt server.
    Assertion:
    1. Đọc vai 4 người trước khi gọi: PASS (4 vai đúng như trên).
    2. telesales bị chặn và events không đổi: FAIL (nhận mã «không tìm thấy», events 4 giữ nguyên 4).
    3. quan-tri (chỉ company_admin) bị chặn và events không đổi: FAIL (nhận mã «không tìm thấy», events 4 giữ nguyên 4).
    4. dau-chu-2 (người khác giữ) thành công và events +1: PASS (4 lên 5).
    5. dau-chu-1 (giữ căn) thành công và events +1: PASS (5 lên 6).
    Lần chạy đầu dùng sai payload (feeInclusion "fee_included" bị từ chối vì sai khuôn); đã sửa thành "included" và chạy lại, kết quả trên là lần chạy sau. Lần chạy đầu không ghi event nào. Hai ca bị chặn giống nhau ở cả hai lần.
    Tác dụng phụ: 2 lần đổi giá thật trên căn mẫu của chỗ thử dãy H (8060000000 → 8100000000, version 4 → 6), có chủ đích theo đề.
    Evidence đã lưu: E10-mang.txt (đủ nội dung) và E10-step1.html (fallback vì config không có capture.ui, không có ảnh chụp). Cả hai nằm trong _acceptance/doi-gia-nhanh/evidence/.
    Kết luận: không đạt, chỉ vì mã trạng thái là «không tìm thấy» thay vì «cấm truy cập» ở hai vai bị chặn. Cần người quyết: sửa Expected thành «không tìm thấy» (giấu sự tồn tại), hoặc sửa code trả mã cấm truy cập.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-doi-gia-nhanh-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-08T02:53:26Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-doi-gia-nhanh-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-08T02:53:26Z

- cmd: npm run test:hooks
  run_id: minted-doi-gia-nhanh-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-08T02:53:26Z

- cmd: npm run typecheck
  run_id: minted-doi-gia-nhanh-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-08T02:53:26Z

- cmd: npm run lint
  run_id: minted-doi-gia-nhanh-SUITE-lint-r1
  exit_code: 1
  verified_at: 2026-11-08T02:53:26Z
  output: |
    Lệnh suite không gắn eval nào, không đạt. eslint báo 3 lỗi và 3 cảnh báo.
    Cả 3 lỗi nằm ở apps/web/src/app/(app)/units/ho-so/dien-thoai/sua-nhanh.test.ts (dòng 75, 82, 86), luật react/no-children-prop: «Do not pass children as props».
    3 cảnh báo (không chặn): 'COT' không dùng ở inventory/bang-hang.tsx:44; useVirtualizer không memo được ở inventory/cards/bang-the.tsx:115; 'LoiTrenMay' không dùng ở inventory/cell-edit/tren-o.tsx:20.

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt được (xanh trên cả bản chính lẫn bản cũ, chứng minh bộ kiểm chứ chưa chứng minh tính năng; nên viết lại để khẳng định hành vi mới, hoặc xác nhận là lưới hồi quy có chủ ý):
- E1 (`npm test -w @quy-hang/core`)
- E2, E3, E4, E5, E6 (`npm test -w @quy-hang/web`)
- E7 (`design-floor-khuon.mjs --kiem --root .`)
- E9 (`npm test -w @quy-hang/ui-lint`)

Baseline không đo: E8 và E10 (ui-check, chạy trên chỗ thử dãy H, không có bản cũ để so).

Lệnh fail không gắn eval: `npm run lint` (lỗi ở sua-nhanh.test.ts, xem phần Evidence); `ui-check:E10` đã gắn eval E10.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E10 không đạt: API giấu hàng bằng mã «không tìm thấy» cho telesales và quan-tri, trong khi Expected đòi mã «cấm truy cập»; chặn vẫn thật (số sự kiện không đổi). Ngoài ra `npm run lint` không đạt vì ba lỗi react/no-children-prop trong sua-nhanh.test.ts. Trả về bước cài đặt: sửa Expected hoặc code cho E10, sửa ba lỗi lint.

