---
schema_version: 2
feature_slug: bai-thu-luoi-5000-dong
verdict: BLOCKED
failed_evals: []
reason: "node _acceptance/bai-thu-luoi-5000-dong/thu/do-lai.mjs (phủ E3, E4, E5, E6, E10): lệnh chạy được nhưng script do-lai.mjs thoát với lỗi, không phải bị công cụ giết. Nguyên nhân: service local ở cổng 3462 chưa chạy; page.goto báo net::ERR_CONNECTION_REFUSED tại http://localhost:3462/spikes/luoi?cham=1 (thu/do.mjs:55, gọi từ motLuot ở do.mjs:148). Script cần server đang chạy trước khi đo. Không chạy lại để cho pass theo chỉ dẫn."
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8054bd89a119e08df1e5dc3468cc64a08e290d43
human_signoff:
---

# Evidence Report: bai-thu-luoi-5000-dong

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-6 | test | PASS |
| E2 | AC-1 | script | PASS |
| E3 | AC-2 | script | BLOCKED |
| E4 | AC-3 | script | BLOCKED |
| E5 | AC-4 | script | BLOCKED |
| E6 | AC-5 | script | BLOCKED |
| E7 | AC-8 | script | PASS |
| E8 | AC-1 | ui-check | PASS |
| E9 | AC-7 | judgment | PASS (đề xuất của hội đồng, chờ người chốt) |
| E10 | AC-9 | script | BLOCKED |

Năm eval E3, E4, E5, E6, E10 dùng chung một lệnh `do-lai.mjs`. Lệnh này chưa cho ra kết quả đo nào vì máy chủ ở cổng 3462 không chạy lúc đó. Bản báo cáo này không tuyên bố các eval đó đạt hay trượt.

## Evidence

- eval: E1
  run_id: minted-bai-thu-luoi-5000-dong-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.luoi_nguong
  verified_at: 2026-10-30T10:09:33Z
  output: |
    node --test "_acceptance/bai-thu-luoi-5000-dong/thu/*.test.mjs"
    ℹ duration_ms 42.9135

- eval: E2
  run_id: minted-bai-thu-luoi-5000-dong-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.luoi_trang
  verified_at: 2026-10-30T10:09:33Z
  output: |
    node _acceptance/bai-thu-luoi-5000-dong/thu/do-lai.mjs --chi-trang --cong 3466
    {"tag":"thu/bai-thu-luoi-5000-dong-v1","sha":"98735f182194d4c3520632bb9818eb235722e798","trang":{"dong":5000,"cot":20,"mau":"MAU-00001"}}

- eval: E3
  run_id: minted-bai-thu-luoi-5000-dong-E3-r1
  status: BLOCKED
  baseline: n-a
  verifier: config:executors.script.luoi_do_lai
  verified_at: 2026-10-30T10:09:33Z
  output: |
    node _acceptance/bai-thu-luoi-5000-dong/thu/do-lai.mjs
    Script thoát với lỗi trước khi in JSON đo nào: page.goto báo net::ERR_CONNECTION_REFUSED tại http://localhost:3462/spikes/luoi?cham=1 (thu/do.mjs:55, từ motLuot ở do.mjs:148). Không phải công cụ giết lệnh. Chưa có số đo nào cho thước cuộn.

- eval: E4
  run_id: minted-bai-thu-luoi-5000-dong-E4-r1
  status: BLOCKED
  baseline: n-a
  verifier: config:executors.script.luoi_do_lai
  verified_at: 2026-10-30T10:09:33Z
  output: |
    Cùng một lệnh do-lai.mjs với E3, cùng lỗi kết nối bị từ chối ở cổng 3462. Chưa có số đo nào cho thước gõ.

- eval: E5
  run_id: minted-bai-thu-luoi-5000-dong-E5-r1
  status: BLOCKED
  baseline: n-a
  verifier: config:executors.script.luoi_do_lai
  verified_at: 2026-10-30T10:09:33Z
  output: |
    Cùng một lệnh do-lai.mjs với E3, cùng lỗi kết nối bị từ chối ở cổng 3462. Chưa có số đo nào cho thước dán.

- eval: E6
  run_id: minted-bai-thu-luoi-5000-dong-E6-r1
  status: BLOCKED
  baseline: n-a
  verifier: config:executors.script.luoi_do_lai
  verified_at: 2026-10-30T10:09:33Z
  output: |
    Cùng một lệnh do-lai.mjs với E3, cùng lỗi kết nối bị từ chối ở cổng 3462. Chưa có số đo nào cho đối chứng đỏ.

- eval: E10
  run_id: minted-bai-thu-luoi-5000-dong-E10-r1
  status: BLOCKED
  baseline: n-a
  verifier: config:executors.script.luoi_do_lai
  verified_at: 2026-10-30T10:09:33Z
  output: |
    Cùng một lệnh do-lai.mjs với E3, cùng lỗi kết nối bị từ chối ở cổng 3462. Chưa có số đo nào để xét phương án glide.

- eval: E7
  run_id: minted-bai-thu-luoi-5000-dong-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.luoi_main_sach
  verified_at: 2026-10-30T10:09:33Z
  output: |
    main sạch mã thử: 0 tệp apps/web/** hay package-lock.json trong diff (21 tệp)

- eval: E8
  run_id: minted-bai-thu-luoi-5000-dong-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-10-30T10:09:33Z
  screenshot: evidence/E8-dau.png
  observed: |
    Tôi đã mở từng khung bằng Read. E8-dau.png (1366×768): có tiêu đề trang «Bài thử lưới — 5.000 dòng × 20 cột (dữ liệu mẫu)». Lưới có hàng tiêu đề cột (ma, toa, tang, can, loai, dien_tich, phong_ngu, huong, gia, gia_m2, trang_thai, nguon, dau_chu, dau_khac…). Dòng đầu là MAU-00001, rồi MAU-00002 đến MAU-00017. Dữ liệu khớp Expected. E8-cuoi.png: sau khi cuộn hết, các dòng MAU-04983 đến MAU-05000 hiện ra. Mã căn dòng cuối là MAU-05000 (T1, 33, 05, 3PN, 79.8, 3, Đông Nam, 3.02 tỷ, 38 tr, Active, Sàn). Dòng đầu cổng nhìn thấy trong khung này là MAU-04983. Hàng tiêu đề cột không hiện trong khung cuối, chỉ còn khoảng trống phía trên dòng đầu; Expected không đòi hỏi tiêu đề ở khung này nên không tính là lỗi, chỉ ghi chú lại. E8-sua.png: ô cột tang của dòng MAU-04995 mang chữ «thu» và có viền chọn. E8-dan.png: khối 3×3 ở các cột toa, tang, can của dòng MAU-04984 đến MAU-04986 mang A1 B1 C1 / A2 B2 C2 / A3 B3 C3, có viền chọn quanh khối. Ô «thu» ở dòng MAU-04995 vẫn còn. Cả bốn khung khớp Expected.
  network_observed: clean
  output: |
    Bảy assertion đều qua: trang /spikes/luoi trả trang bình thường; khổ 1366×768; E8-dau có tiêu đề cột và MAU-00001; E8-cuoi có MAU-05000 là dòng cuối (aria-rowcount 5001); ô MAU-04995/tang mang «thu» sau khi gõ và Enter; dán TSV 3×3 vào MAU-04984/toa ra A1…C3 đúng ba dòng; bảng điều khiển không có thông điệp, lỗi hay cảnh báo.
    Khung đã lưu: evidence/E8-dau.png, E8-cuoi.png, E8-sua.png, E8-dan.png; bản sao theo bước E8-step2.png đến E8-step5.png. Chụp bằng trình duyệt Playwright vì config không có capture.ui. Mạng ghi ở evidence/E8-network.txt: 16 request GET đều thành công (1 trang cùng 15 tệp tĩnh), không có fetch hay XHR ra API.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-bai-thu-luoi-5000-dong-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-10-30T10:09:33Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-bai-thu-luoi-5000-dong-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-10-30T10:09:33Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-bai-thu-luoi-5000-dong-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-10-30T10:09:33Z

- cmd: npm run test:hooks
  run_id: minted-bai-thu-luoi-5000-dong-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-10-30T10:09:33Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-bai-thu-luoi-5000-dong-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-10-30T10:09:33Z

- cmd: npm run typecheck
  run_id: minted-bai-thu-luoi-5000-dong-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-10-30T10:09:33Z

- cmd: npm run lint
  run_id: minted-bai-thu-luoi-5000-dong-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-10-30T10:09:33Z

### Judgment

Hội đồng chỉ đề xuất; hạng mục này để người chốt ở Cổng 2. `human_override` để trống.

- eval: E9
  judged_by: judge panel (fresh context) — đề xuất
  verdict: PASS
  rationale: Ba góc nhìn cùng đề xuất PASS. Mọi số trong ADR-0004 khớp so-do.json sau khi làm tròn. Lỗi nhỏ không chặn, cả ba cùng nêu: ADR, contract và câu hỏi ghi «Kiến trúc §8» nhưng dòng «Lưới bảng hàng» nằm ở §5 Stack còn §8 là «Dữ liệu cá nhân và an toàn».
  votes:
    - domain-correctness: PASS — Mọi số trong ADR-0004 khớp so-do.json. Cuộn p95 là 33,3 / 16,8 / 16,8 (trung vị 16,8), tỉ lệ khung chậm là 0,14% / 0% / 0,14%, gõ là 16,8 / 15,8 / 16,8, dán là 54,2 / 55,3 / 53 (làm tròn 54 / 55 / 53, trung vị 54). Đối chứng đỏ (100 ms, 125 ms, 1.378 ms, 84 ms), loadavg và sha 98735f18… cũng khớp, và ADR nêu cấu hình máy đo (1366×768, CPU giảm tốc 4×, Chrome headless). ADR chọn ReUI vì đạt cả ba thước và ghi `glide: null`, đúng luật dòng «Lưới bảng hàng» của Kiến trúc. ADR có đủ hệ quả cho `noUncheckedIndexedAccess` ở hàng 14–16 và giới hạn của phép đo (không mô phỏng GPU, máy có tải). Một lỗi nhỏ không chặn: ADR, contract và câu hỏi đều viết «Kiến trúc §8», nhưng dòng «Lưới bảng hàng» nằm ở §5 Stack (dòng 150) còn §8 là «Dữ liệu cá nhân và an toàn». Nên sửa số mục trích dẫn, nội dung luật thì đúng.
    - operational-feasibility: PASS — ADR-0004 nêu đủ các mục AC-7 hỏi: số ba lượt của cả ba thước, cấu hình máy đo (1366×768, giảm tốc CPU 4×, Chrome headless), sha và tag nhánh thử, quyết định ReUI đạt nên chọn ReUI (`glide: null`), hệ quả `noUncheckedIndexedAccess` cho hàng 14–16, và giới hạn (không mô phỏng GPU, máy có tải). Mọi số trong ADR khớp `so-do.json` sau khi làm tròn: cuộn p95 33,3/16,8/16,8, khung chậm 0,14/0/0,14%, gõ 16,8/15,8/16,8, dán 54/55/53 ms, đối chứng đỏ 100 ms, 125 ms, 1.378 ms và 84 ms, loadavg và sha. Một điểm nhỏ cần sửa nhưng không đổi kết luận: luật «Lưới bảng hàng» nằm ở §5 của Kiến trúc, còn §8 là «Dữ liệu cá nhân và an toàn», nên ADR và contract đều ghi nhầm số mục.
    - spec-alignment: PASS — ADR-0004 nêu đủ các mục AC-7 cần. Số đo ba lượt của ba thước (trung vị cuộn 16,8 ms và 0,14%, gõ 16,8 ms, dán 54 ms). Cấu hình máy đo (1366×768, giảm tốc CPU 4×, Chrome headless). Sha 98735f18… khớp `nhanh-thu.json` và `so-do.json`. Quyết định giữ ReUI vì đạt cả ba thước, `glide: null`, khớp luật ở dòng «Lưới bảng hàng» của Kiến trúc. Hệ quả `noUncheckedIndexedAccess` và hai giới hạn (không mô phỏng GPU, máy có tải) cũng có đủ. Mọi số trong ADR khớp `so-do.json` sau khi làm tròn: lượt 1/2/3 của cuộn, gõ, dán, hai đối chứng đỏ (100 ms/93%, 125, 1.378, 84), loadavg 14,4/6,4/4,9, và mốc 86 ms với hiệu chuẩn. Một điểm lệch không chặn: ADR và contract ghi «Kiến trúc §8», nhưng dòng luật nằm ở bảng stack §5, còn §8 là «Dữ liệu cá nhân và an toàn». Nội dung luật đúng, chỉ số mục cần sửa.
  human_override:  # chi nguoi ghi

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

Danh sách eval không-phân-biệt không đo được ở round này vì baseline không chạy. Không có eval nào bị ghi là green trên baseline, nhưng cũng chưa có eval nào được xác nhận là red.

### Baseline khong do

- node --test "_acceptance/bai-thu-luoi-5000-dong/thu/*.test.mjs": BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- node _acceptance/bai-thu-luoi-5000-dong/thu/do-lai.mjs --chi-trang --cong 3466: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- node _acceptance/bai-thu-luoi-5000-dong/thu/do-lai.mjs: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- node _acceptance/bai-thu-luoi-5000-dong/thu/main-sach.mjs: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

### Ghi chú hạ tầng về cổng 3462

Bước E8 báo rằng nó đã dùng chung một máy chủ đang nghe ở cổng 3462 (do một tiến trình khác khởi động, thư mục chạy là worktree do-lai ở đúng sha ghim). Ở bước dọn, E8 lỡ tắt tiến trình đó, trái quy tắc «cổng có sẵn thì dùng chung và không tắt». Sau đó cổng 3462 không còn ai nghe. Đây là nguyên nhân khả dĩ của lỗi kết nối bị từ chối ở lệnh do-lai.mjs chạy song song (E3, E4, E5, E6, E10). Báo cáo ghi như một giả thuyết hợp lý, chưa kiểm chứng lại vì chỉ dẫn là không chạy lại để cho đạt. Cách gỡ: chạy lại riêng lệnh do-lai.mjs khi không có tiến trình nào khác giữ cổng 3462.

## Variance

none — không có eval nào chạy nhiều lần (mọi eval có runs là 1, variance là false).

## Iterations

Round 1: E3, E4, E5, E6, E10 BLOCKED — lệnh do-lai.mjs thoát với lỗi vì máy chủ ở cổng 3462 không chạy lúc đo (kết nối bị từ chối); không phải do công cụ giết lệnh, chưa có số đo. E1, E2, E7, E8 và bảy lệnh suite đều đạt; E9 chờ người chốt. Cần chạy lại do-lai.mjs trong môi trường cổng 3462 trống rồi verify lại.
