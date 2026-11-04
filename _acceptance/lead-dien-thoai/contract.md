---
schema_version: 1
feature: "Telesales nhập lead trên điện thoại: thiếu một mục thì chưa gửi được, gửi xong theo dõi được bốn nấc"
slug: lead-dien-thoai
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: approved
design_doc: docs/superpowers/specs/2026-11-04-lead-dien-thoai-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-11-04T09:32:51Z
---

# Acceptance Contract: lead-dien-thoai

## Context

Hàng 51 của lộ trình (dãy D, đợt `dau-khach-nhap`), mã phạm vi L9, màn P1 L4, L5. Đứng trên hàng 24 (Ô nhận lead,
`/leads/new`) và 27 (Lead đã nhập với bốn nấc, `/leads/mine`). Chỉ giao diện: không đổi API, lõi hay cơ sở dữ liệu. Hai
trang vào hệ bố cục (ADR-0024) theo bố cục khuôn đã khai; điện thoại một cột. Dặn của giám sát 04/11: tiêu chí cho mất mạng
đặt từ đầu (bài học Ngoài-5/6 hàng 42). Bước chủ kho cầm điện thoại thật gom một yêu cầu `can-nguoi` (luật đợt 16).

Source input: `docs/plan/lo-trinh.json` hàng 51 · `_acceptance/lead-dien-thoai/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-11-04-lead-dien-thoai-design.md`

## Criteria

- **AC-1** — Ô nhận lead vừa điện thoại.
  Given telesales của sàn mẫu trên khổ 390 × 844,
  When mở tab Lead,
  Then thấy phần «Nhập lead» một cột với năm mục, không cuộn ngang, ô số và ô giá mở bàn phím số, nút Gửi bấm được; có
  phần «Lead đã nhập» kèm bốn nấc trong cùng tab.

- **AC-2** — Thiếu một mục thì chưa gửi được.
  Given ô nhận lead trên điện thoại,
  When bấm Gửi khi thiếu lần lượt từng mục trong năm mục,
  Then mỗi lần lỗi hiện dưới đúng ô thiếu và không có lời gọi gửi lead nào ra máy chủ; điền đủ thì gửi được.

- **AC-3** — Gửi xong thấy kết quả và lối theo dõi.
  Given năm mục đã điền,
  When bấm Gửi,
  Then thấy kết quả kiểm trùng và lối «Xem ở Lead đã nhập»; bấm lối ấy thấy lead vừa gửi ở đầu danh sách, nấc «Đã gửi».

- **AC-4** — Theo dõi bốn nấc trên điện thoại.
  Given telesales có lead đã gửi và đầu chủ nhận rồi gọi lead ấy,
  When mở «Lead đã nhập» trên khổ 390,
  Then mỗi lead một dòng một cột với nấc (Đã gửi → Đã nhận → Đã gọi → Lên bảng) đổi theo việc của đầu chủ; không dòng nào
  hiện số chủ nhà hay mã hàng.

- **AC-5** — Mất mạng lúc gửi không mất lead đã điền.
  Given năm mục đã điền và máy mất mạng,
  When bấm Gửi,
  Then thấy «Chưa gửi được — mất mạng», năm mục giữ nguyên; có mạng lại người bấm Gửi thì lead gửi được đúng một lần;
  máy không tự gửi.

- **AC-6** — Mất mạng lúc mở danh sách không báo nhầm, có mạng lại thì thôi báo (bài học Ngoài-5/6 hàng 42).
  Given máy mất mạng,
  When mở «Lead đã nhập», rồi máy có mạng lại,
  Then lúc mất mạng thấy báo không tải được kèm «Thử lại», không thấy «Chưa có lead nào»; có mạng lại thì dải mất mạng
  biến mất không cần tải lại trang, «Thử lại» tải được danh sách.

- **AC-7** — Hai trang đi qua hệ bố cục và khuôn, dọn chỗ hở.
  Given cây sau thay đổi,
  When chạy bước chấm khuôn và bộ kiểm chuẩn giao diện,
  Then hai nhóm `o-nhan-lead`, `lead-cua-toi` không lệch khuôn, hết `ngoai_le_han` hạn hàng này, trang ba lối
  `proto/o-nhan-lead` đã gỡ, khuôn ghi «bản ghép là đích», dòng «Chỗ hở» Ô nhận lead không còn hạn «khi hàng 51 gộp».

- **AC-9** — Vai không nhập được và danh sách trống trên điện thoại.
  Given đầu chủ (không có vai telesales) và telesales chưa có lead nào, khổ 390,
  When mở `/leads/new`,
  Then đầu chủ có nút «+ Lead» thấy ô nhập như telesales; vai không có nút «+ Lead» (người mua hàng) thấy khối báo vai
  nào nhập được, không thấy biểu mẫu; telesales chưa có lead thấy phần «Lead đã nhập» báo «Chưa có lead nào» kèm việc
  kế, lúc đang tải thấy khung chờ đúng bố cục, không khung trắng.

- **AC-8** — Máy tính giữ như cũ.
  Given telesales và đầu chủ trên khổ 1440 × 900,
  When mở `/leads/new` và `/leads/mine`,
  Then thấy cùng năm mục, cùng kết quả kiểm trùng và cùng bảng ba cột như trước hàng này.

## Coverage

Bỏ quét morphological-scan (sổ: «bỏ coverage-scan»); trục ghi tay:

- Trục khổ: điện thoại 390 (AC-1–AC-6) | máy tính 1440 (AC-8).
- Trục việc: nhập (AC-1, AC-2, AC-3, AC-5) | theo dõi (AC-3, AC-4, AC-6).
- Trục mạng: có mạng | mất mạng lúc gửi (AC-5) | mất mạng lúc mở (AC-6) | có mạng lại (AC-5, AC-6).
- Trục trạng thái danh sách: đang tải (AC-9) · trống (AC-9) · lỗi (AC-6) · có dòng (AC-4).
- Trục vai: telesales (AC-1–AC-6) · đầu chủ có «+ Lead» (AC-9) · vai không nhập được (AC-9).
- Trục khuôn: bố cục, ngoại lệ có hạn, trang ba lối, chỗ hở (AC-7).
- Later: nhập lead ngoại tuyến hàng loạt. Never: máy tự gửi lead khi có mạng lại (lead không thuộc hàng đợi ghi ngoại tuyến). Never: hiện số chủ cho telesales.

## Đường đo

- Thước SỐNG «telesales nhập lead trên điện thoại, thiếu mục chưa gửi được, theo dõi được bốn nấc» · số từ: phép nhìn màn
  khổ 390 trên chỗ thử dãy D (E1–E6) và lượt chủ kho cầm máy thật (yêu cầu `can-nguoi`, luật 16) · bảo đảm bởi: AC-1–AC-6.
- Thước «tỉ lệ thao tác trên máy tính / điện thoại theo vai» (Tham chiếu §11) · số từ: bảng số đo của hàng 52 — hàng này
  không đổi cách đo · bảo đảm bởi: AC-1 (telesales làm được trên điện thoại).

## Vùng tệp

Khai lại ở Cổng Phạm vi thay vùng `apps/web/src/app/(app)/leads/mobile/**` của `hang-viec.json` (không mở đường riêng):
`apps/web/src/app/(app)/leads/new/**`, `apps/web/src/app/(app)/leads/mine/**`, `apps/web/src/app/(app)/proto/o-nhan-lead/**`
(gỡ), `design/patterns/o-nhan-lead.md`, `design/patterns/lead-cua-toi.md`, `design/patterns/trang-tam.md`,
`docs/design/vo-va-ia.md`, `packages/ui-lint/tests/**`, `.agents/skills/quy-hang-ui/**`, `_acceptance/lead-dien-thoai/**`.
Không chạm `apps/web/src/app/(app)/today/**`.

## Out of scope

- Máy tự gửi lead khi có mạng lại, hàng đợi lead ngoại tuyến — Tham chiếu chỉ giữ ghi ngoại tuyến cho kết quả gọi và đổi giá.
- Đổi luật năm mục, kiểm trùng hay lối API của hàng 24, 27.
- Màn Hôm nay của telesales (giữ vùng «Lead đã nhập» như hàng 27).
- Thử trên máy thật bằng máy chấm — đi yêu cầu `can-nguoi` cho chủ kho (luật đợt 16).

## Notes
