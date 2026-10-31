---
schema_version: 1
feature: Nâng kit nghiệm thu lên 2.36.0 và bật các nấc có căn cứ — gộp không dừng ở tệp sinh, phản biện bắt buộc, chặn việc ngoài lộ trình, máy tự định tuyến mục ngoài hợp đồng
slug: nang-kit-2-36-0
owner: omre.cnsp4@onemount.com
risk_tier: T3
surfaces: [ci, config]
status: draft
design_doc: docs/superpowers/specs/2026-10-31-nang-kit-2-36-0-design.md
---

# Acceptance Contract: nang-kit-2-36-0

## Context

Chủ kho đã cài kit 2.36.0 trên máy; CI còn chấm bằng 2.35.0. Đợt Điều phối `nen-2` mở bằng kit 2.36.0, nên thay đổi này
gộp trước khi mở đợt. Chủ kho giao: kho dùng mọi nấc kit mới hỗ trợ ở mức cao nhất có căn cứ. Hiện trạng, cấu hình đích
và lý do từng nấc không bật: mục 2–3 của bản thiết kế. Hạng T3 vì chạm rào của kho (AGENTS.md «Cổng nghiệm thu»).

Source input: lời giao của phiên giám sát 31/10 · CHANGELOG 2.36.0 «Kho tiêu thụ làm gì khi nhận» · GUIDE §5.2, §5.3,
khối `GITATTR-TEP-SINH`, `NGOAI-N-TU-DINH-TUYEN` · ADR-0025 của kit · thiết kế
`docs/superpowers/specs/2026-10-31-nang-kit-2-36-0-design.md`

## Criteria

- AC-1: Given PR này, When CI chạy job cổng nghiệm thu, Then job lấy kit theo thẻ `v2.36.0` (không còn `v2.35.0` ở bất kỳ
  dòng nào của `.github/workflows/`), lưới trước-gộp kết luận sạch trừ phần chờ chữ ký, và bước kiểm bản đồ xanh; mọi bài
  đo trên máy của vòng chạy bằng kit có số phiên bản 2.36.0.
- AC-2: Given kho sau thay đổi, When quét `_acceptance/config.yaml`, `.github/workflows/` và `packages/ui-lint/`, Then
  không lệnh nào trỏ thư mục bộ đệm có số phiên bản của gói kit, và kho không chứa tệp nào của danh sách chép CI của kit
  (kho đi đường lấy kit từ thẻ, không chép).
- AC-3: Given `.gitattributes` có đúng hai dòng của khối `GITATTR-TEP-SINH` và bản clone có driver `tep-sinh`, When gộp hai
  nhánh sửa khác nhau `PRODUCT-MAP.md`, Then git gộp không dừng ở tệp ấy; cùng hai nhánh trên bản clone không có driver
  thì git dừng xung đột ở `PRODUCT-MAP.md`.
- AC-4: Given bản clone mới, When chạy `npm install`, Then cấu hình git của bản clone có `merge.tep-sinh.driver = true`
  cạnh `core.hooksPath = .githooks`, không cần lệnh tay.
- AC-5: Given `gap_probe: required`, When một PR mang hồ sơ T2/T3 đã làm xong mà thiếu `gap-probe.md` và không có dòng sổ
  «bỏ gap-probe», Then lưới trước-gộp chặn với dòng vi phạm gọi tên hồ sơ; cùng hồ sơ có `gap-probe.md` hợp lệ thì không
  có dòng ấy.
- AC-6: Given `lo_trinh.chan: true`, When một PR thêm hồ sơ mới không thuộc hàng lộ trình nào, Then luật chặn lộ trình gọi
  tên hồ sơ ấy; hồ sơ mới ghi `lo_trinh_ma` của một hàng có thật, hồ sơ của chính vòng này, và hồ sơ cũ ngoài diff không
  bị gọi tên.
- AC-7: Given `feature_loop.ngoai_n_tu_dinh_tuyen: true`, When bên ghi định tuyến máy kiểm một hồ sơ T2, Then nó đọc khoá
  là bật; cùng hồ sơ với khoá `false` thì nó báo tắt; và hồ sơ T3 (như chính hồ sơ này) không được máy định tuyến dù
  khoá bật. `.gitattributes` nằm trong `risk_tiers.t3_paths`; tệp cấu hình nghiệm thu thì KHÔNG (lưới gộp bỏ qua mọi tệp
  hồ sơ trước khi đối chiếu, và hầu hết vòng đều thêm lệnh kiểm vào tệp ấy — khai thì chặn nhầm định tuyến máy, Cổng
  Bằng chứng lượt 1, Ngoài-1).
- AC-8: Given kho sau thay đổi, When chạy bộ kiểm của kho (`feature_loop.suite_keys`) và kiểm bản đồ bằng kit 2.36.0,
  Then mọi lệnh xanh, bài tự kiểm của rào in `TỔNG: ĐẠT`, `PRODUCT-MAP.md` và `LO-TRINH.html` khớp, và lộ trình có một
  hàng mang slug `nang-kit-2-36-0`.
- AC-9: Given kho sau thay đổi, When đọc tài liệu, Then mục «Rào của kho» của AGENTS.md nói driver `tep-sinh` và nơi nó
  được bật, Tham chiếu §12 có dòng ghi nấc đã bật và nấc cố ý chưa bật kèm lý do, và cả hai khớp cấu hình thật. (judgment)

## Coverage

Quét morphological-scan, preset entity-feature, cho thực thể «nấc setup kit 2.36.0 ở kho tiêu thụ».

- Trục nấc: bản kit của CI (AC-1) | lớp chép CI + đường lệnh không số (AC-2) | tệp sinh (AC-3, AC-4) | phản biện bắt buộc
  (AC-5) | chặn lộ trình (AC-6) | định tuyến máy (AC-7) | bản vẽ + hàng lộ trình (AC-8) | cửa tín hiệu, tự áp chính
  sách, sàn M2, `--hang-pr`, `capture.ui`, khoá làn ghim lại — Later, ghi ở thiết kế §3 và Out of scope
  [thước CE: CHANGELOG 2.36.0 «Kho tiêu thụ làm gì khi nhận» + GUIDE §5.2–5.3 + ADR-0025]
- Trục chiều đo: bật thì có hiệu lực (AC-3..AC-7 chiều xanh) | tắt hay thiếu thì khác (AC-3..AC-7 chiều đỏ)
- Trục nơi chạy: CI (AC-1, AC-5) | máy dev (AC-3, AC-4) | lúc mở vòng (AC-6, AC-7) | người đọc tài liệu (AC-9)
- Trục không vỡ: bộ kiểm kho + rào (AC-8) | hồ sơ cũ không bị chấm lại (AC-6)

## Đường đo

- bỏ đường-đo — việc vận hành kho, không có ô cơ hội và ngưỡng nghiệm thu.

## Out of scope

- Cửa tín hiệu (`tin_hieu`) — chưa có người gửi ngoài chủ kho và đợt; bật khi sản phẩm có người dùng thử gửi ý.
- Tự áp chính sách lộ trình — cần mốc phát hành có ngày, là quyết sản phẩm.
- Sàn thiết kế M2 (tệp token + danh mục thành phần) — là việc dựng, vào lộ trình nếu cần.
- Bỏ job nặng cho PR không chạm vật (`--hang-pr`) — chưa có áp lực phút CI đo được; phải đổi check bắt buộc `ci-ok`.
- `capture.ui`, `executors.design.static`/`gate`, các khoá tinh chỉnh làn ghim lại — chưa có nhu cầu đo được.
- Sửa bản ghi cài plugin của worktree khác trên máy, hay dọn bản ghi mồ côi — việc của máy, không của kho.
- Gói đợt `nen-2` (PR #15) — đi PR riêng, gộp sau PR này.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Không chạm bất biến nào của AGENTS.md: không mã sản phẩm, không cơ sở dữ liệu, không lớp `source`.
- Thứ tự gộp sau khi đợt `nen-dau` đóng: PR #21 → PR này (gộp lại nhánh chính trước) → PR #15.
- Known limits — chọn ở Cổng Bằng chứng 2026-10-31:
  - Ngoài-2: Hàng của việc nâng kit trên trang lộ trình nằm ngoài mọi nhóm và đợt, mã là chữ thay vì số kế tiếp.
  - Ngoài-4: Đổi cấu hình cổng nghiệm thu không bị cổng gộp nâng hạng hay đòi chữ ký riêng; chỉ người duyệt PR canh.
  - Ngoài-5: Nếu công cụ định tuyến máy hỏng ở hồ sơ T2, bài đo của vòng vẫn có thể báo xanh.
  - Ngoài-6: Chạy bài đo của vòng lúc còn thay đổi chưa commit có thể cho kết quả xanh trên hai bản khác nhau của kho.
