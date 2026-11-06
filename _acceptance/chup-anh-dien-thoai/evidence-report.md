---
schema_version: 2
feature_slug: chup-anh-dien-thoai
verdict: BLOCKED
failed_evals: []
reason: "Không chạy được E16 ở URL đã khai http://localhost:3460. Cổng 3460 không có máy chủ (health không phản hồi). Thử khởi động npm run dev ở cổng 3460 thì Next từ chối: Another next dev server is already running (PID 18189, cổng 3494, cùng thư mục worktree dreamy-mahavira-36d819). Máy chủ thật của chỗ thử, cùng cơ sở dữ liệu sau E14, nằm ở 3494 và không phải do verifier khởi động nên không tắt. Không đọc được biến môi trường của tiến trình đó (bị chặn quyền) nên không dựng được bản thứ hai ở 3460 trỏ đúng cơ sở dữ liệu. Chuyển sang 3494 là đổi URL do cấu hình giao và đổi cổng có thể lệch origin xác thực nên không tự đổi. Cần chủ kho hoặc người điều phối chọn một trong hai cách: (a) cho phép chạy E16 trên http://localhost:3494, hoặc (b) tắt máy chủ 3494 để verifier dựng máy chủ ở 3460 với đúng DATABASE_URL của chỗ thử. Chưa chạy bước nào của E16, chưa lưu frame mới nào. Các tệp E16-* cũ trong thư mục evidence là của lượt trước, không dùng làm bằng chứng cho lượt này."
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c352b6b800f6f23321ba787b86245080fe444c1c
human_signoff:
---

# Evidence Report: chup-anh-dien-thoai

Round 6. Verdict BLOCKED: E16 chưa chạy được vì hạ tầng chỗ thử (xem `reason`). Mọi eval khác đã chạy và xanh.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | script | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-10 | ui-check | PASS |
| E13 | AC-1 | ui-check | PASS |
| E14 | AC-2 | ui-check | PASS |
| E15 | AC-4 | ui-check | PASS |
| E16 | AC-5 | ui-check | BLOCKED |
| E17 | AC-5 | script | PASS |
| E18 | AC-3 | ui-check | PASS |
| E19 | AC-6 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-chup-anh-dien-thoai-E1-r6
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T12:37:01Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4714.478375

- eval: E2
  run_id: minted-chup-anh-dien-thoai-E2-r6
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T12:37:01Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4714.478375

- eval: E3
  run_id: minted-chup-anh-dien-thoai-E3-r6
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T12:37:01Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4714.478375

- eval: E4
  run_id: minted-chup-anh-dien-thoai-E4-r6
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T12:37:01Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4714.478375

- eval: E5
  run_id: minted-chup-anh-dien-thoai-E5-r6
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-11-06T12:37:01Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 1110.399917

- eval: E6
  run_id: minted-chup-anh-dien-thoai-E6-r6
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T12:37:01Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 1583.235292

- eval: E7
  run_id: minted-chup-anh-dien-thoai-E7-r6
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T12:37:01Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4714.478375

- eval: E8
  run_id: minted-chup-anh-dien-thoai-E8-r6
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T12:37:01Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4714.478375

- eval: E9
  run_id: minted-chup-anh-dien-thoai-E9-r6
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T12:37:01Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4714.478375

- eval: E10
  run_id: minted-chup-anh-dien-thoai-E10-r6
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-06T12:37:01Z
  output: |
    design-floor-khuon.mjs --kiem --root .
    13 tệp giao diện ngoài bản đồ

- eval: E11
  run_id: minted-chup-anh-dien-thoai-E11-r6
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-06T12:37:01Z
  output: |
    npm test -w @quy-hang/ui-lint
    ℹ duration_ms 39444.798042

- eval: E12
  run_id: minted-chup-anh-dien-thoai-E12-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T12:37:01Z
  screenshot: evidence/E12-truoc.png
  observed: |
    Đã mở từng ảnh bằng Read. E12-truoc.png: 375×812, căn A-02.06 (Toà A), ảnh lớn là khung xám «Chưa có ảnh», nút «Chụp ảnh» ở góc phải trên ảnh. E12-chon-ngan.png: ngăn «Chụp ảnh · A-02.06 / Toà A» có hai nút ngăn «Gửi được» và «Nội bộ», dòng «Chọn ngăn trước khi chụp.», nút «Mở máy ảnh» dính đáy và đang xám (tắt). E12-cho-mang.png: khối «Mất mạng — Ảnh chờ trên máy và tự tải lên khi có mạng» cùng ba dòng Gửi được, Gửi được, Nội bộ (có khoá), mỗi dòng nhãn «Chờ mạng — tự tải khi có mạng». E12-da-tai.png: ba dòng cùng nhãn «Đã tải lên» (xanh). E12-anh-lon.png: ngăn đã đóng, ảnh lớn có chỉ số «1/3», nút «Chụp ảnh» còn.
    E12-dau-khach.png (dark mode): căn A-02.06 là căn Incomplete nên màn chỉ hiện «Không thấy căn», không có nút «Chụp ảnh»; vì vậy chụp bổ sung căn A-04.06 (Đang bán): đầu khách thấy căn nhưng không có nút «Chụp ảnh» (DOM không có data-nut=chup-anh), đầu chủ có nút. E12-tai-lai.png (sau tải lại, dark): mở lại ngăn còn đúng ba dòng Gửi được / Gửi được / Nội bộ nhãn «Chờ mạng — tự tải khi có mạng»; khối «Mất mạng» không hiện vì lúc tải lại chỉ chặn POST lên /api/v1/units/photos chứ không giả lập offline. Sau khi bỏ chặn ba dòng thành «Đã tải lên» (E12-tai-lai-da-tai.png, chưa mở lại bằng Read ngoài kết quả DOM). Ngăn: 3 ảnh mới = shareable, shareable, internal. Phù hợp Expected, trừ lệch nhỏ đã nêu (hai khung chụp ở dark mode, căn ở đầu khách).
  network_observed: clean

- eval: E13
  run_id: minted-chup-anh-dien-thoai-E13-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T12:37:01Z
  screenshot: evidence/E13-step1.html
  observed: |
    Đã mở E13-step1.html (fallback HTML, không có capture.ui). Căn Toà A / A-02.06, đếm trước 6/6. dau-khach gọi POST upload-url và POST photos đều bị từ chối listing-agent-required, đếm sau 6/6 không đổi. dau-chu-1 gọi POST upload-url thành công (truc_tiep false) và POST photos tạo mới, đếm sau 7/7 (tăng 1). Khớp Expected. Ghi chú: căn A-03.02 của lượt E13 cũ không còn ảnh nên dùng căn mẫu A-02.06 của E12 hiện tại.
  network_observed: n-a (driver)

- eval: E14
  run_id: minted-chup-anh-dien-thoai-E14-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T12:37:01Z
  screenshot: evidence/E14-db.txt
  observed: |
    Đã đọc E14-db.txt (bằng chứng truy vấn DB bằng chữ, thay frame). Cửa sổ lượt E12 cuối: bảng unit_photos có đúng 3 dòng mới cho Toà A / A-02.06, 2 dòng compartment=shareable và 1 dòng compartment=internal, removed_at rỗng. unit_photo_events có 3 sự kiện type=added, payload.compartment khớp ngăn của ảnh (shareable, shareable, internal), số sự kiện lệch ngăn bằng 0. Khớp Expected. Lưu ý: căn A-02.06 có 6 ảnh gốc từ hai lượt E12, đã đếm riêng cửa sổ lượt cuối nên không ảnh hưởng.
  network_observed: n-a (driver)

- eval: E15
  run_id: E15-2026-11-06T14:20Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T12:37:01Z
  screenshot: evidence/E15-step1.png
  observed: |
    E15-step1.png (375x812, đang offline): ngăn «Chụp ảnh · A-08.05 / Toà A», hai nút ngăn Gửi được và Nội bộ, khối «Mất mạng — Ảnh chờ trên máy và tự tải lên khi có mạng», ba dòng Gửi được, Gửi được, Nội bộ (có ổ khoá), mỗi dòng nhãn cam «Chờ mạng — tự tải khi có mạng»; nút «Mở máy ảnh» dính đáy. E15-step2.png (sau khi mở mạng và lời xác nhận POST đầu bị cắt): cùng ba dòng, cả ba nhãn xanh «Đã tải lên». E15-db.txt: trước 0 dòng, sau 3 dòng (tăng đúng 3), ba mã khác nhau (shareable, shareable, internal), không mã nào hai dòng. Khớp Expected. Căn A-01.01 của lượt trước không còn nên dùng A-08.05.
  network_observed: clean

- eval: E16
  run_id: minted-chup-anh-dien-thoai-E16-r6
  cannot_run: true
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T12:37:01Z
  reason: BLOCKED — cổng 3460 không có máy chủ, máy chủ chỗ thử nằm ở 3494 (xem `reason` ở frontmatter); chưa chạy bước nào, chưa lưu frame, không có assertion nào được chấm.
  network_observed: n-a (tool-error: không chạy được, cổng 3460 không có máy chủ)

- eval: E17
  run_id: minted-chup-anh-dien-thoai-E17-r6
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-06T12:37:01Z
  output: |
    npm run test:ro-ri
    ℹ duration_ms 1125.422833

- eval: E18
  run_id: minted-chup-anh-dien-thoai-E18-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T12:37:01Z
  screenshot: evidence/E18-hom-nay.png
  observed: |
    E18-step1.png (375x812, máy thật 3460, căn A-13.01): hồ sơ mở sau khay nổi «Chụp ảnh · A-13.01 / Toà A», ngăn «Gửi được» đã chọn, hai dòng ảnh mới đều nhãn «Chờ mạng — tự tải khi có mạng», nút «Mở máy ảnh» đang bật. E18-hom-nay.png (cùng máy, sau Escape, chạm tab, mở mạng, chờ 20 giây): màn «Hôm nay», 15 việc, tab «Hôm nay» đang chọn, không còn khay chụp; thẻ đỏ «Chưa tải được lead giao cho bạn» là do các cuộc gọi /api/ bị chặn lúc vào trang. E18-doichung-step1.png và E18-doichung-hom-nay.png (bản sao đối chứng 3496, căn A-13.03): cùng khay, cùng màn «Hôm nay». Đếm DB: máy thật 3 sang 5 (tăng 2) tại /today, đối chứng 1 sang 1 (tăng 0).
  network_observed: clean

- eval: E19
  run_id: minted-chup-anh-dien-thoai-E19-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T12:37:01Z
  screenshot: evidence/E19-step1.png
  observed: |
    E19-step1.png (375x812, dau-chu-1, căn A-04.06): khay «Chụp ảnh · A-04.06» mở, 2 dòng «Chờ mạng — tự tải khi có mạng»: «Gửi được» và «Nội bộ» (có ổ khoá). E19-con.png sau tải lại không đăng xuất: vẫn 2 dòng chờ, nút «Mở máy ảnh» xám. E19-dang-xuat.png (1280x800): trang /login «Đăng nhập Quỹ hàng» có ô Email, sau khi bấm mục Đăng xuất thật ở menu tài khoản. E19-nguoi-b.png (người B trưởng nhóm, 375x812): khay mở, ngăn ghi «Chưa chụp ảnh nào cho căn này.», không có dòng chờ nào của dau-chu-1. Khớp Expected.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/connect
  run_id: minted-chup-anh-dien-thoai-SUITE-npm_test_w_quy_hang_connect-r6
  exit_code: 0
  verified_at: 2026-11-06T12:37:01Z

- cmd: npm run test:hooks
  run_id: minted-chup-anh-dien-thoai-SUITE-test_hooks-r6
  exit_code: 0
  verified_at: 2026-11-06T12:37:01Z

- cmd: npm run typecheck
  run_id: minted-chup-anh-dien-thoai-SUITE-typecheck-r6
  exit_code: 0
  verified_at: 2026-11-06T12:37:01Z

- cmd: npm run lint
  run_id: minted-chup-anh-dien-thoai-SUITE-lint-r6
  exit_code: 0
  verified_at: 2026-11-06T12:37:01Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả code hiện tại lẫn baseline diffBase; chứng minh harness hơn là tính năng — cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý):
- npm test -w @quy-hang/web: E1, E2, E3, E4, E7, E8, E9
- npm test -w @quy-hang/api: E5
- npm test -w @quy-hang/core: E6
- design-floor-khuon.mjs --kiem: E10
- npm test -w @quy-hang/ui-lint: E11
- npm run test:ro-ri: E17

Baseline không đo: các eval ui-check E12, E13, E14, E15, E16, E18, E19 có baseline n-a theo kết quả máy.

Không có mục chấm theo hội đồng trong vòng này: mọi eval là máy chạy hoặc ui-check, không eval nào là judgment.

## Variance

none — mọi eval chạy một lần, xác định; không eval nào có phương sai.

## Iterations

Round 3: REJECT — E14 đếm 6 dòng, lỗi đo trong hợp đồng; sửa phép đo.
Round 4: PASS — máy thông, cửa veto mở.
Round 5: PASS — sau bản sửa 24fc0ecc (ảnh chờ chỉ lên đúng sàn lúc chụp); mọi eval xanh.
Round 6: BLOCKED — E16 không chạy được: cổng 3460 không có máy chủ, máy chủ chỗ thử ở 3494 thuộc tiến trình khác; các eval còn lại xanh trên bản c352b6b8. Cần chủ kho chọn chạy E16 ở 3494 hoặc tắt 3494 để dựng 3460.

