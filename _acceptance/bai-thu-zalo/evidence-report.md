---
schema_version: 2
feature_slug: bai-thu-zalo
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 375e30d691b3f8aaa375f98cd7017dc26e6a225c
human_signoff: Manh Phan 2026-10-30
---

# Evidence Report: bai-thu-zalo

Round 2. Mọi eval máy (E1 đến E9) đều xanh trên cây 375e30d. Eval E10 là phán đoán: hội đồng ba lăng kính cùng đề xuất đạt, ADR-0003 đã tách «cấu hình» khỏi «số đo». Hợp đồng ở mức T2 nên ô human_override của E10 không bắt buộc.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-7 | script | PASS |
| E6 | AC-8 | script | PASS |
| E7 | AC-5 | script | PASS |
| E8 | AC-6 | ui-check | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-10 | judgment | PASS |

## Evidence

Các eval E1 đến E7 và E9 cùng chạy trong một lệnh `node --test "_acceptance/bai-thu-zalo/thu/*.test.mjs"`: một lần chạy, một lần qua, không phương sai. Bảng kết quả máy không trả đoạn đầu ra riêng cho từng eval, nên mỗi khối ghi chung kết quả của lệnh đó.

- eval: E1
  run_id: minted-bai-thu-zalo-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bai_thu_zalo
  verified_at: 2026-10-30T06:33:26Z
  output: |
    Lệnh node --test trên thư mục thu/ chạy một lần, một lần qua, kết thúc bình thường.
    Ca «AC-1 thẻ Open Graph» nằm trong lệnh này (trang gọi không JS; ca phá thử bỏ og:image phải đỏ).
    duration_ms 252.681

- eval: E2
  run_id: minted-bai-thu-zalo-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bai_thu_zalo
  verified_at: 2026-10-30T06:33:26Z
  output: |
    Lệnh node --test trên thư mục thu/ chạy một lần, một lần qua, kết thúc bình thường.
    Ca «AC-2 ảnh xem trước» nằm trong lệnh này (PNG, IHDR 1200×630, dưới 300 KB; ca phá thử đổi cỡ phải đỏ).
    duration_ms 252.681

- eval: E3
  run_id: minted-bai-thu-zalo-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bai_thu_zalo
  verified_at: 2026-10-30T06:33:26Z
  output: |
    Lệnh node --test trên thư mục thu/ chạy một lần, một lần qua, kết thúc bình thường.
    Ca «AC-3 tải mà không báo thì không mở» nằm trong lệnh này, chạy qua máy chủ thật.
    duration_ms 252.681

- eval: E4
  run_id: minted-bai-thu-zalo-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bai_thu_zalo
  verified_at: 2026-10-30T06:33:26Z
  output: |
    Lệnh node --test trên thư mục thu/ chạy một lần, một lần qua, kết thúc bình thường.
    Ca «AC-4 lượt báo của máy bị loại» nằm trong lệnh này (ma trận lớp máy kèm đối chứng trình duyệt thật).
    duration_ms 252.681

- eval: E5
  run_id: minted-bai-thu-zalo-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bai_thu_zalo
  verified_at: 2026-10-30T06:33:26Z
  output: |
    Lệnh node --test trên thư mục thu/ chạy một lần, một lần qua, kết thúc bình thường.
    Ca «AC-7 một lệnh» nằm trong lệnh này (link in ra, không IP thô, SIGINT ra bảng đếm, chọn đường hầm).
    duration_ms 252.681

- eval: E6
  run_id: minted-bai-thu-zalo-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bai_thu_zalo
  verified_at: 2026-10-30T06:33:26Z
  output: |
    Lệnh node --test trên thư mục thu/ chạy một lần, một lần qua, kết thúc bình thường.
    Ca «AC-8 chỉ dữ liệu mẫu» nằm trong lệnh này (nhãn «Mẫu», không số điện thoại; ca phá thử phải đỏ).
    duration_ms 252.681

- eval: E7
  run_id: minted-bai-thu-zalo-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bai_thu_zalo
  verified_at: 2026-10-30T06:33:26Z
  output: |
    Lệnh node --test trên thư mục thu/ chạy một lần, một lần qua, kết thúc bình thường.
    Ca «AC-5 nhánh chia sẻ» nằm trong lệnh này (tep, link, khong-ho-tro; một dòng nhật ký cho mỗi kết cục chia-se).
    duration_ms 252.681

- eval: E9
  run_id: minted-bai-thu-zalo-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bai_thu_zalo
  verified_at: 2026-10-30T06:33:26Z
  output: |
    Lệnh node --test trên thư mục thu/ chạy một lần, một lần qua, kết thúc bình thường.
    Hai ca «AC-9 luật kết luận» và «AC-9 kết quả khớp nhật ký» nằm trong lệnh này.
    duration_ms 252.681

- eval: E8
  run_id: minted-bai-thu-zalo-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/bai-thu-zalo/thu/chay.mjs
  verified_at: 2026-10-30T06:33:26Z
  screenshot: evidence/E8-step1.png
  observed: |
    step1.png: trang «Thử kéo ảnh từ Zalo máy tính», nhãn vàng «Mẫu · bài thử», ô nét đứt chỉ có chữ «Thả ảnh vào đây», không có dòng kết quả — khớp Expected (ô trống, nhãn Mẫu). step2.png: ô thả hiện một ảnh (chấm 1x1 px giữa ô, chữ placeholder biến mất), dưới ô có dòng «Đã nhận image/png · 70 byte · kiểu kéo: Files» — khớp (ảnh hiện, ghi kiểu và cỡ). step3.png: ô vẫn giữ ảnh cũ, dòng dưới ô «không có tệp ảnh · kiểu nhận được: text/plain» — khớp.
    step4.png: khổ 390 px, tiêu đề «Thử chia sẻ ảnh + tin», dòng «Trình duyệt này: chia sẻ được ảnh + tin», nút «Gửi ảnh + tin», «Gửi chỉ ảnh», «Gửi link + tin» và các nút trả lời — khớp. step5.png: sau lần bốn, dòng dưới nút ghi «Trình duyệt này không mở được bảng chia sẻ từ web.» (kết cục khong-ho-tro) — khớp.
  network_observed: clean
  output: |
    Giả canShare trả true, share giả ghi đối số: lần 1 (xong) nhận một tệp mau-can.png kiểu image/png cỡ 3767 byte kèm tin; lần 2 ném AbortError (người huỷ); lần 3 ném TypeError (lỗi); lần 4 share vắng (trình duyệt không mở được bảng chia sẻ).
    Đường đếm kèm nhật ký: đúng hai sự kiện nhan-anh (một có tệp image/png 70 byte, một không tệp, kiểu text/plain) và bốn sự kiện chia-se với kết cục lần lượt da-gui, huy, loi, khong-ho-tro. Có thêm một sự kiện tai-anh do trang tự tải ảnh xem trước, loại khác, không vi phạm «đúng hai nhan-anh và bốn chia-se».
    Mạng (Playwright): trang /chia-se, ảnh /og/CS.png và bốn lượt POST /ghi đều thành công; console chỉ có lỗi thiếu favicon.ico (tệp tĩnh, chỉ ghi chú). Trang /keo-anh không có request lỗi. Số thô nằm ở evidence/E8-network.txt.

- eval: E10
  judged_by: judge panel đề xuất (ba lăng kính: domain-correctness, operational-feasibility, spec-alignment; fresh context)
  verdict: PASS
  rationale: Hội đồng đề xuất đạt, cả ba phiếu cùng chiều. ADR-0003 ghi «đề xuất — chờ chủ kho chốt»; cả bốn việc đều có khuyến nghị, lối khác và giá; các số trích khớp ket-qua.md. Bộ thẻ og và cỡ ảnh 1200×630 dưới 300 KB được ADR gọi đúng tên là cấu hình, không phải số đo. Việc 4 không đạt thì có ba đường vòng (a)(b)(c) kèm giá. Bất biến «người luôn là người bấm gửi» được giữ, không lối nào để máy gửi hộ người. Ô human_override để trống: đây là mục phán đoán, người quyết ở Cổng 2.
  panel_votes:
    - domain-correctness: PASS — ADR-0003 ghi trạng thái «đề xuất — chờ chủ kho chốt». Cả bốn việc đều có khuyến nghị, lối khác và giá. Các số trích (UA WhatsApp/2, znetwork/8.14.1, K-6819 thước JS 0 và thước UA 1, A-6819 1 lượt và I-6819 2 lượt tải ảnh, 2 lượt đã gửi kèm tệp, 0 sự kiện kéo ảnh) khớp ket-qua.md. Cỡ ảnh 1200×630 và 300 KB không có trong ket-qua.md, nhưng ADR gọi đúng tên đó là cấu hình chứ không phải số đo. Vế 4 «không đạt» có ba đường đi vòng (a)(b)(c) kèm giá, và ADR nói rõ «link + tin» trên iPhone chỉ dựa vào lời chủ kho khai. Bất biến «người luôn là người bấm gửi» được nhắc ở phần mở đầu, và không lối nào trong ADR để máy gửi hộ người.
    - operational-feasibility: PASS — ADR-0003 ghi trạng thái «đề xuất — chờ chủ kho chốt». Cả bốn việc đều có khuyến nghị, lối khác và giá, và các số dẫn khớp ket-qua.md: UA WhatsApp/2, znetwork/8.14.1 và facebookexternalhit/1.1; K-6819 thước JS 0, thước UA 1; «có ảnh» Android 1 và iPhone 1; ảnh A-6819 1 lượt, I-6819 2 lượt; gửi kèm tệp 2. Việc 4 không đạt thì ADR nêu ba đường đi vòng (a), (b), (c) kèm giá và một khuyến nghị. ADR giữ bất biến «người luôn là người bấm gửi» ở mục 3 của AGENTS.md và không lối nào gửi hộ người. Hai điểm lệch nhỏ không đổi kết luận: cỡ ảnh và bộ thẻ og là cấu hình, ADR tự ghi không phải số đo; dòng 39 của ket-qua.md gán «link + tin» cho iPhone nhưng bảng «Chia sẻ» ghi «Máy tính», và ADR theo bảng.
    - spec-alignment: PASS — ADR-0003 ghi «đề xuất — chờ chủ kho chốt». Bốn việc đều có khuyến nghị, lối khác và giá. Các số trích khớp ket-qua.md: K-6819 thước JS 0 và thước UA 1, UA WhatsApp/2 và znetwork/8.14.1, tải ảnh A 1 và I 2, iPhone đã gửi kèm tệp 2, ba câu trả lời «có» mỗi câu 2 lượt, Vế 4 nhận 0 sự kiện. Việc 2 nói rõ bộ thẻ og và cỡ ảnh 1200×630 dưới 300 KB là cấu hình chứ không phải số đo, và lăng kính này không kiểm được cấu hình đó vì nằm ngoài các file được phép đọc. Vế 4 không đạt nên ADR đưa ba đường vòng (a), (b), (c) kèm giá để chủ kho chọn. ADR giữ bất biến «người luôn là người bấm gửi» ở mục Bối cảnh, và không lối nào gửi hộ người, vì luồng chỉ dùng bảng chia sẻ và nút «Đã gửi» do người bấm.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-bai-thu-zalo-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-10-30T06:33:26Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-bai-thu-zalo-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-10-30T06:33:26Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-bai-thu-zalo-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-10-30T06:33:26Z

- cmd: npm run test:hooks
  run_id: minted-bai-thu-zalo-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-10-30T06:33:26Z

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

### Baseline khong do

- node --test "_acceptance/bai-thu-zalo/thu/*.test.mjs": BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

Danh sách eval không-phân-biệt (xanh cả trên HEAD lẫn baseline) không đo được ở round này vì baseline bị chặn hạ tầng; mọi field baseline của eval ghi n-a.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, không có phương sai)

## Iterations

Round 1: E1 đến E9 xanh; E10 (phán đoán) hội đồng đề xuất không đạt vì ADR-0003 mục 2 nêu số thẻ và cỡ ảnh dưới nhãn «Số đo» mà ket-qua.md không có; chờ người quyết ở Cổng 2.
Round 2: E1 đến E9 xanh trên cây 375e30d; E10 hội đồng ba lăng kính cùng đề xuất đạt (ADR đã gọi cỡ ảnh và bộ thẻ là cấu hình, không phải số đo). Baseline vẫn bị chặn hạ tầng nên không đo được; một phát hiện trong hợp đồng (AC-7, lý do thật khi đường hầm thoát sớm) và một phát hiện ngoài hợp đồng được ghi ở review-findings.md.
