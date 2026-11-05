---
schema_version: 1
feature: "Hàng vá va-gui-can-da-go: căn đã gỡ khi hoàn tác lần nhập không vào được Lần gửi mới và không ghi được sự kiện «Quan tâm» ở tầng cơ sở dữ liệu (Ngoài-2 hàng 66, luật 65)"
slug: va-gui-can-da-go
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api]
status: verified
design_doc: docs/superpowers/specs/2026-11-05-va-gui-can-da-go-design.md
approved_by: Manh Phan
approved_at: 2026-11-05
---

# Acceptance Contract: va-gui-can-da-go

## Context

Hàng 66 (`nhap-hoan-tac`) gỡ căn do lần nhập tạo bằng cờ `listings.voided` và lọc nó ở mọi đường đọc của API. Hai hàm
`security definer` của cơ sở dữ liệu — `app.create_share` (021) và `app.record_share_event` (031) — chưa biết cờ này, nên
căn đã gỡ vẫn vào được Lần gửi mới và vẫn nhận «Quan tâm» từ link cũ. Chủ kho chọn «mở hợp đồng mới» cho mục này
(Ngoài-2 hàng 66, Cổng Bằng chứng 05/11). Sửa bằng migration 037 thay hai hàm, giữ chữ ký, quyền và mã lỗi.
Thiết kế: `docs/superpowers/specs/2026-11-05-va-gui-can-da-go-design.md`.

Dữ liệu mẫu: `[Tên]`, `0900 000 0xx`.

## Criteria

- **AC-1 — Căn đã gỡ không vào Lần gửi mới.** (cross-layer) Given hai căn từng lên Đang bán, một căn đã gỡ (`voided`) · When
  Đầu khách tạo Lần gửi (`POST /api/v1/shares`) có căn đã gỡ · Then nhận `400 listing-not-shareable`, không thêm dòng
  `shares` hay `share_listings` nào; Lần gửi chỉ có căn còn lại thì tạo được như cũ.
- **AC-2 — Căn đã gỡ không nhận «Quan tâm».** (cross-layer) Given một Lần gửi đã có hai căn, sau đó một căn bị gỡ · When khách
  bấm «Quan tâm» căn đã gỡ (`POST /api/v1/public/shares/{mã}/events`) · Then nhận `409`, không thêm `share_events`; «Quan
  tâm» căn còn lại và lượt mở link vẫn ghi được.
- **AC-3 — Chặn ở chính hàm cơ sở dữ liệu.** Given vai `quy_hang_app` gọi thẳng `app.create_share` và
  `app.record_share_event` (bỏ qua API) với căn đã gỡ · When gọi · Then lần lượt lỗi `22023` và `23514`, không dòng nào được
  ghi; căn chưa gỡ cùng lời gọi thì qua (đối chứng); sàn B không gửi được căn của sàn A (cách ly).
- **AC-4 — Migration 037 an toàn.** Given cơ sở dữ liệu đã có 001–036 · When chạy `npm run db:migrate` hai lần · Then lần hai
  không áp lại; hai hàm giữ chữ ký, `security definer`, `search_path` rỗng và chỉ `quy_hang_app` được gọi.

## Coverage

Đã soát (sổ quyết định, dòng phạm vi): bốn hàm `security definer` đọc `listings` — `can_see_source`, `lead_dedupe_facts`,
`unit_holder` chỉ đọc nội bộ; `record_share_event` ghi ra khách (AC-2, AC-3). `create_share` đọc `listing_events` (AC-1,
AC-3). `record_share_event` chỉ nhận `link_opened` và `interest` (AC-2).

- Trục **hàm**: create_share | record_share_event [thước CE: quét migrations 001–036]
- Trục **căn**: đã gỡ | chưa gỡ (đối chứng) [thước CE: cờ `listings.voided`, hàng 66]
- Trục **đường gọi**: qua API | gọi thẳng hàm | sàn khác [thước CE: AC-1..3]

## Đường đo

Bỏ theo Hỏi-2 (ô cơ hội để ngưỡng cho chủ kho). Lối khác: đếm số lần từ chối căn đã gỡ theo tuần.

## Out of scope

- Gỡ căn đã gỡ khỏi các Lần gửi cũ (`share_listings`) — trang khách đã báo căn không còn (hàng 66).
- Hàm khác của cơ sở dữ liệu đọc `listings` mà không ghi gì ra khách.

## Notes

- Vùng: `packages/db/migrations/037_*.sql`, `packages/db/tests/isolation.test.mjs`, `packages/api/test-db/va-gui-can-da-go/**`.
- Nguồn: Ngoài-2 hàng 66 (`_acceptance/nhap-hoan-tac/decisions.jsonl` d-20261105T034940Z-24), luật 65.
