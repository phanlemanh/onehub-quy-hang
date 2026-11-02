---
schema_version: 2
feature_slug: dien-ma-can-cho-hang
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 013800fcabe731d193d9fa5f3ed43e29b2aea04b
human_signoff: Manh Phan 2026-11-02
---

# Evidence Report: dien-ma-can-cho-hang

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6u | AC-6 | ui-check | PASS |
| E6b | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7u | AC-7 | ui-check | PASS |
| E8u | AC-8 | ui-check | PASS |
| E9 | AC-9 | judgment | PASS (hội đồng đề xuất, chờ người chốt) |
| E10 | AC-6 | script | PASS |
| E11 | AC-6 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-dien-ma-can-cho-hang-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-02T08:34:23Z
  output: |
    ℹ duration_ms 193.851667

- eval: E4
  run_id: minted-dien-ma-can-cho-hang-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-02T08:34:23Z
  output: |
    ℹ duration_ms 193.851667

- eval: E2
  run_id: minted-dien-ma-can-cho-hang-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T08:34:23Z
  output: |
    ℹ duration_ms 27681.826584

- eval: E3
  run_id: minted-dien-ma-can-cho-hang-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T08:34:23Z
  output: |
    ℹ duration_ms 27681.826584

- eval: E5
  run_id: minted-dien-ma-can-cho-hang-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T08:34:23Z
  output: |
    ℹ duration_ms 1456.422

- eval: E6
  run_id: minted-dien-ma-can-cho-hang-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T08:34:23Z
  output: |
    ℹ duration_ms 1456.422

- eval: E7
  run_id: minted-dien-ma-can-cho-hang-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T08:34:23Z
  output: |
    ℹ duration_ms 1456.422

- eval: E6b
  run_id: minted-dien-ma-can-cho-hang-E6b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web_db
  verified_at: 2026-11-02T08:34:23Z
  output: |
    ℹ duration_ms 2129.12225

- eval: E10
  run_id: minted-dien-ma-can-cho-hang-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lint
  verified_at: 2026-11-02T08:34:23Z
  output: |
    chuẩn giao diện: đạt

- eval: E11
  run_id: minted-dien-ma-can-cho-hang-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-02T08:34:23Z
  output: |
    (không có dòng in ra; lệnh kết thúc sạch)

- eval: E6u
  run_id: E6u-1793608585905
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T08:34:23Z
  screenshot: evidence/E6u-step1.png
  observed: |
    Frame 1 (E6u-1-chua-co.png, 1440x900, /inventory?hang=<X>): Bảng hàng ở giữa, panel hồ sơ bên phải mở với tiêu đề «Chưa có mã căn» (huy hiệu «Chưa đủ để rao», «Toà A»). Mục THUỘC TÍNH CĂN có nhãn «Mã căn» kèm dấu vàng «Chưa có», ô nhập (placeholder «VD A-12.07») và nút đen «Lưu mã căn». Khớp Expected.
    Frame 2 (E6u-2-da-gan.png): sau khi gõ A-12.5905 và bấm lưu, tiêu đề hồ sơ thành «A-12.5905»; địa chỉ chuyển sang /inventory?unit=A-12.5905&toa=Toà+A&lan=<X> (có unit=MA). Dòng mức đủ chỉ nêu «thiếu Giá, Nội thất, Pháp lý, Tài chính, Tình trạng sử dụng», không có Mã căn. Bấm «Sẵn sàng bán» (E6u-2b-con-thieu.png) thì «Còn thiếu:» liệt kê Giá về tay, Ảnh thật, Pháp lý, Tình trạng sử dụng, không còn Mã căn. Khớp Expected. Lưu ý: tôi không chụp «Còn thiếu» của hàng X trước khi gắn mã, nên không tự đối chiếu việc «Mã căn» rời danh sách.
    Frame 3 (E6u-3-trung.png, hàng Y, gõ «a-12-5905»): ô nhập viền đỏ, nhãn «Mã căn» đỏ, chữ «a-12-5905» còn nguyên trong ô; dưới ô có lỗi «Căn này đã có hàng đang mở (Chưa đủ để rao) · Mở hàng kia» (nêu hàng đang mở và trạng thái, có liên kết). Hồ sơ vẫn «Chưa có mã căn». Khớp Expected.
    Frame 4 (E6u-4-rong.png): ô rỗng (hiện placeholder), viền đỏ, dưới ô có lời «Gõ mã căn». Không có request ghi nào sau khi bấm lưu (bắt request: danh sách rỗng). Khớp Expected.
  network_observed: clean

- eval: E7u
  run_id: minted-dien-ma-can-cho-hang-E7u-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T08:34:23Z
  screenshot: evidence/E7u-1-bang-hang.png
  observed: |
    E7u-1-bang-hang.png (đã mở bằng Read): khổ 1440x900, bảng hàng, dòng số 24 «Toà B», mã căn «—», nhóm «Chưa rõ 1 căn» được chọn. Cột hồ sơ bên phải mở, tiêu đề «Chưa có mã căn», nhãn «Chưa đủ để rao»; mục THUỘC TÍNH CĂN có «Mã căn» + dấu «Chưa có», ô nhập «VD A-12.07», nút «Lưu mã căn». URL ?hang=0251f236 đúng id hàng Z. Khớp Expected.
    E7u-2-hom-nay.png (đã mở): sau khi bấm dòng «Chưa có mã căn · Toà B» ở /today, đích là /inventory?hang=0251f236 (đúng hàng Z); khung hiện Bảng hàng với cột hồ sơ «Chưa có mã căn», ô Mã căn «Chưa có», nút Lưu mã căn. Khớp Expected.
    E7u-3-con-thieu.png (đã mở): sau «Sẵn sàng bán» hiện khối «Còn thiếu:» với liên kết gạch chân «Mã căn» (href #o-ma-can) cùng Giá về tay, Pháp lý...; sau khi bấm «Mã căn», ô nhập «VD A-12.07» có viền focus, document.activeElement là INPUT id=o-ma-can. Khớp Expected. Ghi chú: lần đầu bấm nhầm Hôm nay không có hàng tạo bằng POST /listings nên làm lại với hàng tạo từ lead đã giao (Toà B chỉ biết toà).
  network_observed: clean

- eval: E8u
  run_id: minted-dien-ma-can-cho-hang-E8u-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T08:34:23Z
  screenshot: evidence/E8u-step1.html
  observed: |
    Frame 1 (E8u-step1.html, thay cho E8u-1-dien-thoai.png) và screenshot inline lúc 375x812: hồ sơ toàn màn mở hàng Toà A, tiêu đề «Chưa có mã căn», nhãn «Chưa đủ để rao». Mục THUỘC TÍNH CĂN có «Mã căn» kèm dấu «Chưa có», ô nhập placeholder «VD A-12.07» (x37, rộng 301, cao 32) và nút «Lưu mã căn» (x37, rộng 301, cao 32), cả hai nằm trong khung nhìn. scrollWidth 375 = innerWidth 375. Frame 2 (E8u-step2.html, thay cho E8u-2-da-gan.png) và screenshot inline sau khi gõ A-12.8841 rồi bấm lưu: tiêu đề hồ sơ đổi thành «Toà A / A-12.8841», URL chuyển sang ?unit=A-12.8841, ô nhập đã biến mất (khoá), mục THUỘC TÍNH CĂN ghi «Chưa có trong danh mục». scrollWidth vẫn 375 = innerWidth 375. Khớp Expected. Hai frame là HTML chứa văn bản DOM đã lấy qua javascript_tool, không phải ảnh lưu ra file; ảnh chụp chỉ xem được inline.
  network_observed: clean

- eval: E9
  judged_by: judge panel (3 lens, fresh context)
  verdict: PASS (đề xuất của hội đồng)
  verified_at: 2026-11-02T08:34:23Z
  rationale: Cả ba lens thấy Tham chiếu (§8 luật 6) và ADR-0026 ghi đủ cách gắn mã một lần, luật chặn trùng hàng đang mở, loại sự kiện mới và lý do không dùng sự kiện đổi chi tiết. Bản đồ mã lượt chạy không có mã cho E9, nên khối này không mang dòng mã chạy.
  human_override: Manh Phan 2026-11-02 — Đạt

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-dien-ma-can-cho-hang-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-02T08:34:23Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-dien-ma-can-cho-hang-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-02T08:34:23Z

- cmd: npm run test:hooks
  run_id: minted-dien-ma-can-cho-hang-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-02T08:34:23Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-dien-ma-can-cho-hang-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-02T08:34:23Z

- cmd: npm run typecheck
  run_id: minted-dien-ma-can-cho-hang-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-02T08:34:23Z

## Judge panel (đề xuất, chờ người chốt ở Gate 2)

E9 — đề xuất PASS. Người chốt điền human_override ở khối E9 phía trên.

- domain-correctness: PASS — Tham chiếu §8 luật 6 ghi mã căn gắn đúng một lần ở hồ sơ căn và máy chặn khi sàn đã có hàng đang mở khác trên căn đó (ADR-0026). ADR-0026 quyết định 1 đặt sự kiện riêng `unit_number_assigned`, quyết định 2 giải thích vì sao không mở `details_changed`: sự kiện đó đổi được nhiều lần và xoá trắng được, còn mã căn kéo theo ảnh và kiểm trùng.
- operational-feasibility: PASS — Tham chiếu §8 luật 6 (dòng 133) ghi hàng được gắn mã căn đúng một lần ở hồ sơ căn, và căn đã có hàng đang mở khác của sàn thì máy chặn (ADR-0026). ADR-0026 quyết định 1 đặt tên sự kiện riêng `unit_number_assigned`. Quyết định 2 nêu lý do không dùng `details_changed`: sự kiện đó đổi được nhiều lần và xoá trắng được, còn mã căn kéo theo ảnh và kiểm trùng, nên luật «một lần» và «chặn trùng» sẽ thành ngoại lệ, và vết lịch sử không phân biệt hai việc.
- spec-alignment: PASS — Tham chiếu ghi ở luật 6 (§8) rằng mã căn gắn đúng một lần ở hồ sơ căn và máy chặn khi sàn đã có hàng đang mở khác trên căn đó (ADR-0026); hàng sổ ngày 02/11 nhắc lại điều này. ADR-0026 quyết định 1 đặt sự kiện riêng `unit_number_assigned`, và quyết định 2 giải thích vì sao không mở `details_changed` cho mã căn: sự kiện ấy đổi nhiều lần được, còn mã căn một lần và kéo theo ảnh và kiểm trùng.

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Baseline khong do: toan bo eval may (round nay khong do lai vi evals.yaml khong doi tu lan baseline cuoi), moi block ghi baseline: n-a.

Eval KHONG-PHAN-BIET (pass tren ca HEAD lan baseline; chung minh harness chu khong phai feature — nen viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y):
- `npm test -w @quy-hang/core` — E1, E4
- `npm run db:migrate && npm run db:test` — E2, E3
- `npm test -w @quy-hang/web` — E5, E6, E7
- `npm run test:db -w @quy-hang/web` — E6b
- `npm run lint` — E10
- `design-floor-s4.mjs --root .` — E11

Lệnh fail không gắn eval: không có.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval máy đều xanh; E9 chờ người chốt ở Gate 2. Verdict PENDING-JUDGMENT.

### Re-pin lần 1 — 2026-11-02, do hoá cũ do gộp main (PR #81, #82) sau chữ ký
run_id: repin-20261102T092301Z-56855
sha: 013800fcabe731d193d9fa5f3ed43e29b2aea04b · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · ngoài làn máy: E6u, E7u, E8u, E9 (E9 không khai paths) · AC không có chốt máy: AC-8, AC-9
