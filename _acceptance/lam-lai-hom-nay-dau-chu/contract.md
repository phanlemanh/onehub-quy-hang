---
schema_version: 1
feature: "Đầu chủ mở Hôm nay và đọc mỗi việc trên một dòng: tên căn, cột «Vì sao hôm nay» hai tầng — lý do chữ đậm, hạn đỏ khi quá, vàng khi còn dưới 15 phút — và giá; làm việc đầu của nhóm bằng đúng một nút, một chạm; việc còn lại nằm trong ⋯; hàng đợi, luật mỗi căn một hàng đợi và ghi kết quả của hàng 22 giữ nguyên"
slug: lam-lai-hom-nay-dau-chu
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
design_doc: docs/superpowers/specs/2026-11-04-lam-lai-hom-nay-dau-chu-design.md
approved_by:
approved_at:
---

# Acceptance Contract: lam-lai-hom-nay-dau-chu

## Context

Hàng 92 (dãy D). Quyết định 14A của chủ kho 02/11 (vo-va-ia §2): Hôm nay của đầu chủ làm lại theo khối `solution-agents-2`
cộng ô hạn của `data-grid-base-5`. Chỉ giao diện; dữ liệu, hàng đợi và lời gọi của hàng 22 giữ nguyên. Máy tính; điện
thoại là hàng 39.

Source input: `docs/plan/lo-trinh.json` hàng 92 · `_acceptance/lam-lai-hom-nay-dau-chu/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-11-04-lam-lai-hom-nay-dau-chu-design.md`

## Criteria

- **AC-1** — Mỗi việc một dòng, «Vì sao hôm nay» hai tầng.
  Given đầu chủ mẫu có căn và lead trong hàng đợi, khổ 1440,
  When mở Hôm nay,
  Then mỗi việc một dòng bốn cột Việc · Vì sao hôm nay · Giá · Hành động; cột Việc dòng trên tên căn (lead: toà · căn),
  dòng dưới loại việc; cột «Vì sao hôm nay» dòng trên lý do chữ đậm, dòng dưới hạn (khi có).

- **AC-2** — Màu hạn theo mốc.
  Given việc có hạn đã quá, còn dưới 15 phút, còn đúng 15 phút, còn hơn 15 phút, không hạn,
  When dựng ô hạn,
  Then đã quá đỏ, dưới 15 phút vàng, từ 15 phút trở lên thường, không hạn thì không dòng hạn.

- **AC-3** — Đúng một nút, việc còn lại trong ⋯.
  Given mọi loại việc của hàng đợi (căn mỗi nhóm của bộ nhóm mặc định, lead đã gửi, đã nhận, đã gọi),
  When dựng cột Hành động,
  Then mỗi dòng hiện đúng một nút viền cùng bề rộng, nhãn là việc đầu của nhóm theo hàng 22 (lead đã gửi «Nhận», lead đã
  nhận «Đã gọi», căn của nhóm có việc xác nhận chủ nhà «Còn · giữ giá», căn của nhóm chỉ có Mở hồ sơ — Thiếu thông tin —
  «Đổi giá, trạng thái · Mở hồ sơ»); mọi việc khác của hàng 22 cho dòng ấy — Trả lại (có hỏi lại), Đổi giá, trạng thái,
  Mở hồ sơ — nằm trong ⋯, không việc nào mất và không nhóm nào nhận thêm việc hàng 22 không có.

- **AC-4** — Một chạm.
  Given một lead đã gửi cho đầu chủ mẫu,
  When bấm nút chính «Nhận» trên dòng ấy,
  Then lead sang nấc đã nhận ngay, không hộp thoại thêm, và nút chính của dòng thành «Đã gọi».

- **AC-5** — Nhóm thu gọn được, giữ luật hàng đợi.
  Given bộ nhóm của sàn,
  When mở Hôm nay,
  Then nhóm hiện theo thứ tự bộ nhóm, đầu nhóm có số việc, bấm đầu nhóm thu gọn và mở lại; mỗi căn đúng một nhóm.

- **AC-6** — Trạng thái giữ như hàng 22, mất mạng không kẹt.
  Given đang tải, hàng đợi trống, lỗi tải, mất mạng rồi có mạng lại,
  When mở Hôm nay,
  Then thấy khung chờ, trống có lối sang Bảng hàng, lỗi kèm «Thử lại»; lúc mất mạng thấy dải mất mạng, có mạng lại dải tắt
  không cần tải lại trang.

- **AC-7** — Khuôn và dọn.
  Given cây sau thay đổi,
  When chạy bước chấm khuôn và bộ kiểm chuẩn giao diện,
  Then nhóm `hom-nay-dau-chu` không lệch khuôn, khuôn ghi khối đích mới, trang ba lối `proto/hom-nay-dau-chu` đã gỡ, catalog có
  dòng `@reui/solution-agents-2`.

- **AC-9** — Việc trong ⋯ vẫn làm được.
  Given một lead đã nhận và một căn trong hàng đợi,
  When mở ⋯ và chọn Trả lại (lead) rồi huỷ, chọn Trả lại rồi xác nhận, chọn Mở hồ sơ (căn),
  Then Trả lại luôn hỏi lại trước, huỷ thì lead giữ nguyên, xác nhận thì lead rời hàng đợi; Mở hồ sơ mở hồ sơ của đúng căn.

- **AC-8** — Luật hàng 22 giữ nguyên.
  Given bộ kiểm lõi và web của hàng 22 (nhóm, lý do, lead, mở số),
  When chạy,
  Then mọi ca hiện có vẫn xanh, không ca nào bị gỡ hay hạ.

## Coverage

Bỏ quét morphological-scan (sổ: «bỏ coverage-scan»); trục ghi tay:

- Trục cột: Việc · Vì sao hôm nay · Giá · Hành động (AC-1).
- Trục hạn: quá · dưới 15 phút · đúng 15 · hơn 15 · không hạn (AC-2).
- Trục loại việc: căn từng nhóm · lead đã gửi · đã nhận · đã gọi (AC-3, AC-4); việc trong ⋯ (AC-9).
- Trục nhóm: thứ tự, đếm, thu gọn (AC-5).
- Trục trạng thái: đang tải · trống · lỗi · mất mạng · có mạng lại (AC-6).
- Trục khuôn và luật cũ (AC-7, AC-8).
- Later: bản điện thoại (hàng 39). Never: đổi hàng đợi hay luật ghi kết quả ở hàng này.

## Đường đo

- Thước SỐNG «đầu chủ đọc một dòng, làm việc đầu một chạm» · số từ: phép nhìn màn 1440 trên chỗ thử dãy D (E1, E4, E5) ·
  bảo đảm bởi: AC-1, AC-3, AC-4.
- Thước «mười tiêu chí đã ký của hàng 22 vẫn đạt» · số từ: bộ kiểm lõi và web của hàng 22 (E8) cùng việc trong ⋯ trên màn (E9) · bảo đảm bởi: AC-8, AC-9.

## Vùng tệp

`apps/web/src/app/(app)/today/*.tsx`, `apps/web/src/app/(app)/today/*.ts`, `apps/web/src/components/khoi/solution-agents-2/**`,
`apps/web/src/app/(app)/proto/hom-nay-dau-chu/**` (gỡ), `design/patterns/hom-nay-dau-chu.md`, `design/patterns/trang-tam.md`,
`packages/ui-lint/tests/**`, `.agents/skills/quy-hang-ui/catalog.md`, `docs/design/vo-va-ia.md`, `_acceptance/lam-lai-hom-nay-dau-chu/**`.

## Out of scope

- Bản điện thoại của Hôm nay đầu chủ (hàng 39).
- Đổi bộ nhóm, luật mỗi căn một hàng đợi, lời gọi ghi kết quả hay API của hàng 22.
- Ô tìm, lọc «cần chú ý», nút mật độ của khối `solution-agents-2`.

## Notes
