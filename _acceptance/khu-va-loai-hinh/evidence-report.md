---
schema_version: 2
feature_slug: khu-va-loai-hinh
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: afa6a85aa21a8861611f7687c0896dabfc9df944
human_signoff:
---

# Evidence Report: khu-va-loai-hinh

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-3 | test | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-5 | test | PASS |
| E7b | AC-5 | test | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-7 | test | PASS |
| E10 | AC-8 | judgment | đề xuất PASS — chờ người chốt |
| E11 | AC-9 | judgment | đề xuất FAIL — chờ người chốt |

## Evidence

- eval: E1
  run_id: minted-khu-va-loai-hinh-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-10-31T15:50:13Z
  output: |
    ℹ duration_ms 436.850042

- eval: E3
  run_id: minted-khu-va-loai-hinh-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-10-31T15:50:13Z
  output: |
    ℹ duration_ms 436.850042

- eval: E6
  run_id: minted-khu-va-loai-hinh-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-10-31T15:50:13Z
  output: |
    ℹ duration_ms 436.850042

- eval: E7
  run_id: minted-khu-va-loai-hinh-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-10-31T15:50:13Z
  output: |
    ℹ duration_ms 436.850042

- eval: E8
  run_id: minted-khu-va-loai-hinh-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-10-31T15:50:13Z
  output: |
    ℹ duration_ms 436.850042

- eval: E9
  run_id: minted-khu-va-loai-hinh-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-10-31T15:50:13Z
  output: |
    ℹ duration_ms 436.850042

- eval: E2
  run_id: minted-khu-va-loai-hinh-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:50:13Z
  output: |
    ℹ duration_ms 10734.062

- eval: E5
  run_id: minted-khu-va-loai-hinh-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:50:13Z
  output: |
    ℹ duration_ms 10734.062

- eval: E7b
  run_id: minted-khu-va-loai-hinh-E7b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:50:13Z
  output: |
    ℹ duration_ms 10734.062

- eval: E4
  run_id: minted-khu-va-loai-hinh-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.api
  verified_at: 2026-10-31T15:50:13Z
  output: |
    ℹ duration_ms 64333.732584

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/connect
  run_id: minted-khu-va-loai-hinh-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-10-31T15:50:13Z

- cmd: npm run test:hooks
  run_id: minted-khu-va-loai-hinh-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-10-31T15:50:13Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-khu-va-loai-hinh-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-10-31T15:50:13Z

- cmd: npm run typecheck
  run_id: minted-khu-va-loai-hinh-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-10-31T15:50:13Z

- cmd: npm run lint
  run_id: minted-khu-va-loai-hinh-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-10-31T15:50:13Z

### Phán đoán (judgment) — đề xuất hội đồng, chờ người

- eval: E10
  proposal: PASS
  judges:
    - domain-correctness: PASS — Sổ có dòng seal gate 1, phê khuyến nghị Hỏi-1 (d-...-6): nhãn khu chứa căn là «Khu» (khu phụ trách đổi thành «Vùng phụ trách»). CONTEXT.md có hàng «Khu» kèm `subdivisionName`/`subdivisionKey` (RESO SubdivisionName); chữ «Dự án» chỉ nằm ở cột «tránh dùng». Hàng «Loại hình» ghi `propertyType`/`propertySubType` theo RESO. Tham chiếu §12 có dòng 31/10 (dòng 331) ghi quyết định đổi tên khu và loại hình. Mọi chữ «dự án» còn lại của Tham chiếu nằm ở các dòng lịch sử sổ quyết định §12 (dòng 318–331), không dùng làm tên khái niệm.
    - operational-feasibility: PASS — Sổ không có dòng gate1 riêng cho Hỏi-1. Dòng seal gate 1 (d-...-15) phê khuyến nghị của dòng Hỏi-1 (d-...-6), nên nhãn là nguyên văn «Khu» (khu phụ trách đổi thành «Vùng phụ trách»). CONTEXT.md dòng 13 gọi «Khu» kèm `subdivisionName` / `subdivisionKey` (RESO `SubdivisionName`) và đặt «Dự án» ở cột tránh dùng. Dòng 14 nêu căn mang `propertyType` / `propertySubType` theo RESO. Tham chiếu dòng 63 dùng «khu (`SubdivisionName`)». Chữ «dự án» còn lại chỉ nằm trong các dòng lịch sử §12 (dòng 318–331). §12 dòng 331 ghi quyết định đổi tên và loại hình ngày 31/10.
    - spec-alignment: PASS — Sổ không có dòng gate1 riêng; Hỏi-1 (d-6) khuyến nghị «Khu» cho khu chứa căn và d-15 là dòng seal gate 1 nên nhãn chủ kho chọn là «Khu» (khu phụ trách thành «Vùng phụ trách»). CONTEXT.md dòng 13 gọi «Khu» kèm `subdivisionName` (RESO SubdivisionName) và liệt «Dự án» ở cột tránh, dòng 14 nêu căn mang `propertyType`/`propertySubType`. Tham chiếu dòng 63 dùng khu (`SubdivisionName`) và căn mang loại hình RESO, còn dòng 331 ở §12 ghi quyết định khu và loại hình ngày 31/10; mọi chữ «dự án» còn lại của Tham chiếu (dòng 318–331) nằm trong các dòng lịch sử sổ quyết định hoặc trích lời.
  human_override:  # chi nguoi ghi

- eval: E11
  proposal: FAIL
  judges:
    - domain-correctness: FAIL — Phần ADR khớp sổ. ADR-0016 ghi «chấp nhận» sau Cổng Phạm vi hàng 72 và Hỏi-1..3 theo khuyến nghị, khớp các dòng d-6, d-7, d-8 và dòng seal gate 1 (d-15). Màn Người dùng chỉ đổi nửa chừng: hai ô chọn ghi «Vùng phụ trách» (quan-nguoi.tsx dòng 137 và 198), nhưng mục quản lý danh sách khu phụ trách (cùng tệp, dòng 213, 223, 228) vẫn ghi «Khu», «Tên khu», «Thêm khu». Hỏi-1 đã duyệt đổi nhãn khu phụ trách thành «Vùng» (khu chia việc của sàn thành «Vùng»), và chữ «Khu» đã dành cho khu chứa căn (SubdivisionName).
    - operational-feasibility: FAIL — ADR-0016 ghi «chấp nhận» và chép đúng Hỏi-1..3 theo khuyến nghị. Các dòng 6-8 và dòng seal gate 1 của decisions.jsonl khớp với phần này. Nhưng quan-nguoi.tsx chưa đổi hết nhãn khu phụ trách. Ô chọn dùng «Vùng phụ trách», còn mục quản lý danh sách khu phụ trách vẫn hiện «Khu», «Tên khu» và «Thêm khu».
    - spec-alignment: PASS — ADR-0016 ghi trạng thái «chấp nhận» sau Cổng Phạm vi hàng 72. Câu trả lời của chủ kho cho Hỏi-1 («Khu» và «Vùng phụ trách»), Hỏi-2 (đất bốn mục) và Hỏi-3 (khách riêng thấy tên đường và xã) trùng từng ý với phần khuyến nghị ở các dòng sổ d-6, d-7, d-8 của decisions.jsonl. Các dòng ấy nằm ngay trước dòng seal gate 1 (d-15). Trên màn Người dùng, quan-nguoi.tsx dùng nhãn «Vùng phụ trách» ở hai chỗ chọn nhiều và ở thông báo xoá, đúng Hỏi-1. Có một chỗ hở nhỏ: sổ không có dòng nào ghi riêng câu trả lời của chủ kho, nên khớp được xác nhận qua dòng khuyến nghị cộng với dòng seal.
  required_evidence:
    - Sửa dòng 213 của quan-nguoi.tsx, hoặc có dòng trong decisions.jsonl nói rõ mục này giữ «Khu» là cố ý. Nhãn dòng 223 («Tên khu») và nút dòng 228 («Thêm khu») cũng phải đổi sang «Vùng», rồi chấm lại tệp: toàn bộ nhãn khu phụ trách trên màn Người dùng phải là «Vùng…».
    - Dòng sổ gate1 hoặc dòng seal có trường decided_by (hoặc trích lời chủ kho) ghi câu trả lời Hỏi-1..3. Hiện chỉ có d-15 (seal gate 1, không có người ký) và d-16 (Gate 1.5, decided_by Manh Phan); d-6, d-7, d-8 chỉ là câu hỏi kèm khuyến nghị. Lấy ở _acceptance/khu-va-loai-hinh/decisions.jsonl.
    - Trong quan-nguoi.tsx, tiêu đề mục ở dòng 213 («Khu»), nhãn «Tên khu» ở dòng 223 và nút «Thêm khu» ở dòng 228 đổi thành «Vùng» hoặc «Vùng phụ trách»; sau khi đổi, kiểm bằng Grep rằng không còn nhãn «Khu» nào chỉ khu phụ trách.
    - Nếu chủ kho cố ý giữ «Khu» cho mục tạo khu phụ trách, cần một dòng trong decisions.jsonl ghi quyết định đó (decided_by chủ kho), hoặc một câu trong ADR-0016 Hỏi-1 nói rõ phạm vi của nhãn «Vùng phụ trách».
  human_override:  # chi nguoi ghi

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline — chứng minh harness chứ không phải feature; viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý): `npm test -w @quy-hang/core` — E1, E3, E6, E7, E8, E9.

Các eval E2, E4, E5, E7b đỏ trên baseline (có phân biệt).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval máy xanh; E10 đề xuất PASS, E11 đề xuất FAIL (nhãn «Khu» còn sót ở phần quản lý vùng trên màn Người dùng, và sổ chưa có dòng ghi riêng câu trả lời của chủ kho) — chờ người chốt ở Cổng 2.

