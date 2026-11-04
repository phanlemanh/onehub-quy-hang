---
schema_version: 1
feature: "Vá mốc gọi đầu: lead đã trả lại thì máy chủ từ chối mốc gọi đầu của người giữ cũ, mốc không đổi; lead đang giữ vẫn ghi gọi đầu như cũ"
slug: va-moc-goi-dau-lead-tra-lai
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, db]
status: approved
design_doc: docs/superpowers/specs/2026-11-04-va-moc-goi-dau-lead-tra-lai-design.md
approved_by: Manh Phan
approved_at: 2026-11-04
---

# Acceptance Contract: va-moc-goi-dau-lead-tra-lai

## Context

Hàng vá máy chủ của đợt dau-khach-nhap (luật 31). `app.mark_first_call` của migration 011 không kiểm `returned_at`: đầu chủ
đã trả lead vẫn ghi được mốc gọi đầu. Gộp thêm luật 37 (Ngoài-5 hàng 52: một định nghĩa chung cho lead trả lại rồi gửi
lại) và luật 40 (sửa gốc ca số đo chập chờn ở `leads-mine.test.ts`).

Source input: ô cơ hội `_acceptance/va-moc-goi-dau-lead-tra-lai/opportunity.md` (ký `build` 02/11) · luật 31, 37, 40
của đợt · `_acceptance/so-do-hai-tuan-thu/review-findings.md` Ngoài-5.

## Criteria

- AC-1 (cross-layer): Given lead đã về đầu chủ dc1 rồi dc1 trả lại, When dc1 gọi `POST /api/v1/leads/:id/first-call`,
  Then API trả 404 (lỗi «không tìm thấy» như lead không còn của người gọi), và trong cơ sở dữ liệu `first_called_at`,
  `accepted_at` của lead giữ nguyên giá trị trước lời gọi.
- AC-2 (cross-layer): Given lead đang giữ (chưa trả lại) của dc1, chưa nhận, When dc1 gọi first-call, Then 200,
  `first_called_at` có giá trị và `accepted_at` được ghi cùng lúc; gọi lần hai ra 409; người không giữ lead gọi ra 404.
- AC-3: Given cây sau hàng này, When đọc migration, Then bản vá là tệp mới `packages/db/migrations/023_*.sql` định nghĩa
  lại `app.mark_first_call(uuid)` cùng chữ ký, giữ thu quyền của `public` và cấp `quy_hang_app`; không migration đã
  commit nào đổi; bộ kiểm cách ly xanh.
- AC-4: Given số đo lõi `lead_to_first_call` và `lead_to_ready`, When trong kỳ có lead trả lại rồi gửi lại (một hay hai
  lần), Then (luật 37 · Ngoài-5 hàng 52) chuỗi ấy — cùng một chủ nhà — đếm đúng một lần, thuộc kỳ theo lúc nhập lead
  đầu chuỗi; «lead → cuộc gọi đầu» tính từ lúc nhập lead đầu tới cuộc gọi sớm nhất trong chuỗi (kể cả cuộc gọi của đầu
  chủ đã trả lại), «lead → Sẵn sàng bán» tính tới lúc lead cuối chuỗi lên bảng; lead đã gửi lại không vào phần «chưa · đã
  trả lại»; xét tại mốc cuối kỳ (lead gửi lại sau mốc ấy thì tại mốc vẫn đếm là đã trả lại).
- AC-5 (cross-layer): Given cùng một bộ lead nạp qua API (lead thường, chuỗi trả lại rồi gửi lại một và hai lần, lên
  bảng), When chạy số đo lõi `lead_to_ready` và `app.lead_board_metric` trên một khoảng chứa trọn mọi lần nhập và lên
  bảng, Then hai bên ra cùng tập chủ nhà (lead cuối chuỗi) và cùng số ngày cho từng chuỗi.
- AC-6: Given ca «số đo: ngày lead → Sẵn sàng bán trên bộ mẫu», When đọc ca, Then mốc đầu khoảng đo lấy từ đồng hồ cơ sở
  dữ liệu, không từ `Date()` của máy chạy test, và kỳ vọng của ca không đổi.
- AC-7: Given cây sau hàng này, When chạy kiểm kiểu, lint, bộ test lõi và API, bộ kiểm cách ly cùng bộ kiểm cơ sở dữ liệu
  của API, Then đều xanh.

## Coverage

Quét bằng morphological-scan (preset test-matrix), ba trục:

- Trục A — trạng thái lead khi ghi gọi đầu: đang giữ chưa nhận · đang giữ đã nhận · đã trả lại · đã gọi rồi · của người
  khác [thước CE: điều kiện chọn của `app.mark_first_call` ở 011 và cột `returned_at` ở 015]
- Trục B — hình chuỗi lead: không gửi lại · gửi lại một lần trước mốc · gửi lại hai lần · gửi lại sau mốc · lead gửi lại
  nhập sau mốc [thước CE: `resubmitted_lead_id`, `resubmitted_at` ở 015; `thoiLuongLead` của lõi]
- Trục C — nơi đo: số đo lõi (`tinhSoDo`) · hàm SQL `app.lead_board_metric` [thước CE: luật 37]
- Core: A trọn ở AC-1, AC-2; B trọn ở AC-4 (gồm «lead đầu đã gọi rồi trả lại»); B × C trên khoảng chứa trọn chuỗi ở
  AC-5.
- Later: bảng số đo trên màn (hàng sau) · đường gọi API cho `lead_board_metric`.
- Never: chặn ghi gọi đầu ở giao diện thay cho máy chủ (luật 31).

## Đường đo

Ngưỡng của ô cơ hội: «Lead đã trả lại thì app.mark_first_call từ chối người giữ cũ (mã lỗi như lead không còn của người
gọi), first_called_at và accepted_at không đổi; lead đang giữ vẫn ghi gọi đầu như cũ; sửa bằng migration mới, không sửa
011; bài kiểm cơ sở dữ liệu có ca trả lại rồi ghi gọi đầu, phá thử thì đỏ».

- Thước: trả lại rồi ghi gọi đầu bị từ chối, mốc không đổi · số từ: E1 · bảo đảm bởi: AC-1
- Thước: lead đang giữ ghi như cũ · số từ: E1 · bảo đảm bởi: AC-2
- Thước: migration mới, không sửa 011 · số từ: E2, E3 · bảo đảm bởi: AC-3
- Thước: phá thử thì đỏ · số từ: E1 (nhật ký lần chạy đỏ ở `evidence/E1-pha-thu.log`) · bảo đảm bởi: AC-1

## Out of scope

- Không đổi giao diện; không chặn ở màn (luật 31).
- Không đổi `app.lead_board_metric`, `app.lead_board_at_all` hay luật trả lại của hàng 27.
- Không đường API mới cho số đo; chưa có nơi nạp dữ liệu thật nào gọi `tinhSoDo` (lõi chỉ dùng ở bài kiểm và bộ mẫu) —
  hàng nối số đo lên màn phải đọc `resubmitted_lead_id` vào `resubmittedLeadId`.
- Cách gán kỳ giữ như trước hàng này: lõi theo lúc nhập (lead đầu chuỗi), `app.lead_board_metric` theo lúc lên bảng; kỳ có
  chuỗi vắt ranh giới vẫn cho hai số khác nhau giữa hai nơi — hàng số đo sau quyết.

## Notes

- Vùng (giám sát hẹp 04/11): `packages/db/migrations/023_*.sql`, `packages/api/test-db/va-moc-goi-dau-lead-tra-lai/**`,
  `packages/api/test-db/leads-mine.test.ts`, `leads.test.ts`, `routing.test.ts`, `dung-man-lead-bon-nac.ts`,
  `packages/core/src/metrics/**`, `packages/api/src/routing/**`, `packages/api/src/leads/**`.
