---
schema_version: 1
feature: "Vá đổi giá căn Đã bán: máy chủ từ chối lệnh đổi giá trên căn Đã bán với lý do rõ, kể cả khi bản trên máy đã mới; bộ đồng bộ đưa lệnh ấy vào «Cần xem»"
slug: va-doi-gia-can-da-ban
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api]
status: approved
design_doc: docs/superpowers/specs/2026-11-03-va-doi-gia-can-da-ban-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-11-03T12:57:51Z
---

# Acceptance Contract: va-doi-gia-can-da-ban

## Context

Hàng vá của đợt dau-khach-nhap (dãy G), đứng trên hàng 8 (lõi hàng và sự kiện) và 13. Dãy D báo khi làm hàng 28: máy chủ
nhận `price_changed` trên căn Đã bán khi lệnh mang đúng phiên bản — luật chỉ chặn ở ô. Luật 31 của đợt: luật nằm ở
`packages/core`, máy chủ trả 4xx với lý do tiếng Việt, bộ đồng bộ chỉ được kiểm.

Hạng: máy suy **T2**; hàng lộ trình ghi **T2**.

Source input: `docs/plan/lo-trinh.json` hàng va-doi-gia-can-da-ban · `_acceptance/va-doi-gia-can-da-ban/opportunity.md` ·
thiết kế `docs/superpowers/specs/2026-11-03-va-doi-gia-can-da-ban-design.md`.

## Criteria

- AC-1: Given ma trận sáu trạng thái chuẩn viết tay, When hỏi luật đổi giá của lõi (`kiemDoiGia`), Then đúng trạng thái
  Đã bán bị từ chối với hằng lý do đúng câu «Căn đã bán không đổi giá — giá chốt đã ghi», năm trạng thái còn lại được
  đổi giá.
- AC-2: Given một hàng đưa tới Đã bán qua API trên Postgres thật, When gửi lệnh đổi giá với đúng phiên bản hiện tại, và
  một lần nữa với phiên bản cũ, Then cả hai lần trả 422 mã riêng `price-locked-closed` với `reason` bằng đúng hằng lý do của
  lõi (không phải xung đột phiên bản), số sự kiện, phiên bản và giá của hàng không đổi; đối chứng: hàng ở Đang bán, Đang giao
  dịch, Tạm ngừng, Ngừng hẳn, Chưa đủ để rao đổi giá được (200, giá mới đọc lại đúng). (cross-layer)
- AC-3: Given bộ đồng bộ của trình duyệt nói với API thật, When đầu chủ đổi giá trên máy một căn mà máy chủ đã ghi Đã
  bán — (a) máy đã biết bản mới, (b) máy còn giữ bản Đang bán cũ vì người khác chốt bán sau khi máy kéo — Then lệnh rời
  hàng đợi vào «Cần xem»: ca (a) loại từ chối với lý do bằng đúng hằng lý do của lõi, ca (b) loại «đã bán» có sẵn của bộ
  đồng bộ; ở cả hai ca hàng trên máy về trạng thái và giá của máy chủ, số sự kiện máy chủ không đổi. (cross-layer)

## Coverage

Bỏ quét không gian tiêu chí — bài một chiều (một luật × sáu trạng thái × ba lớp đọc), sổ quyết định dòng «bỏ
coverage-scan». Ba lớp: lõi (AC-1) · API trên Postgres thật (AC-2) · bộ đồng bộ (AC-3) [thước CE: luật 31 của đợt — lõi,
máy chủ, «Cần xem»].

## Out of scope

- Không chặn đổi giá ở Ngừng hẳn hay trạng thái nào khác (câu bật khi: «căn các trạng thái khác đổi giá như cũ»).
- Không đổi màn, không sửa bộ đồng bộ (`apps/web/src/lib/sync/**` chỉ thêm một tệp kiểm); mã lỗi mới chỉ thêm một dòng ở
  `packages/api/src/errors.ts` (yêu cầu `cham-tep` G-3).
- Không chặn `details_changed` trên căn Đã bán.

## Notes

- Vùng: `packages/core/src/listing/**`, `packages/api/src/listings/**` cộng hai tệp kiểm mới
  (`packages/api/test-db/doi-gia-da-ban/**`, `apps/web/src/lib/sync/test-db/doi-gia-da-ban.db-test.mts`) — yêu cầu `cham-tep`
  G-1.
