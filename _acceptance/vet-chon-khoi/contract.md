---
schema_version: 1
feature: Mọi lựa chọn khối của kho có một dòng máy đọc — khối đã chuyển thể ở danh mục giao diện, chỗ ghép hay tự viết ở «Chỗ hở» kèm điều đã tra trên ReUI, lý do và hạn xem lại; thiếu một ô thì npm run lint đỏ gọi đúng dòng
slug: vet-chon-khoi
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [docs, lint]
status: approved
design_doc: docs/superpowers/specs/2026-11-01-vet-chon-khoi-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-11-01T01:30:00Z
---

# Acceptance Contract: vet-chon-khoi

## Context

Hàng 83 (dãy G), CK2 + CK3 của bản phạm vi cổng chọn khối; ADR-0019 quyết định 3, 4. Cổng Đáng: build (Manh Phan,
`opportunity.md`). Hai bảng: «Khối đã chuyển thể» của `.agents/skills/quy-hang-ui/catalog.md` và «Chỗ hở» của
`docs/design/vo-va-ia.md` §3. Bộ kiểm: `packages/ui-lint/kiem-chuan.mjs` — chạy cuối `npm run lint`.

Từ ngữ: «khối đã chuyển thể» = tên khối ReUI đứng SAU chữ «chuyển thể» trong một chú thích của `apps/web/src`; «đỏ» =
`npm run lint` thoát khác 0 với dòng lỗi gọi tên; «cảnh báo» = dòng in ra, mã thoát 0.

## Criteria

**AC-1 — Danh mục khối đủ chín ô cho hai khối đã có.**
Given bảng «Khối đã chuyển thể» trên main có `app-shell-8` và `data-grid-editing-6`
When thi công xong
Then bảng có chín cột (Khối gốc · Archetype · Nhóm đang dùng · Tệp đang dùng · Màn · Ảnh chuẩn · Phiên bản ReUI · Duyệt ·
Đã đổi gì), hai dòng điền đủ, ảnh chuẩn và tệp đang dùng có trên đĩa, và `npm run lint` xanh.

**AC-2 — Khối chuyển thể mà thiếu dòng thì đỏ gọi tên khối.**
Given một chú thích «chuyển thể … <khối>» trong `apps/web/src` mà bảng không có dòng cho khối ấy
When chạy kiểm chuẩn
Then đỏ, dòng lỗi nêu tên khối và tệp:dòng; tên khối đứng trước chữ «chuyển thể» (việc sắp làm) không tính.

**AC-3 — Dòng khối thiếu ô hay trỏ sai thì đỏ gọi tên dòng và cột.**
Given một dòng của bảng khối để trống một ô (hay chỉ «—»), hay ảnh chuẩn / tệp đang dùng không có trên đĩa, hay nhóm không có trong bản
đồ khuôn, hay Duyệt sai khuôn `YYYY-MM-DD · tên · hồ sơ` hoặc tên không khớp `approved_by` của hồ sơ ấy
When chạy kiểm chuẩn
Then đỏ, dòng lỗi nêu tên khối và tên cột.

**AC-4 — «Chỗ hở» đủ năm ô cho 13 dòng.**
Given bảng §3 có 13 dòng hai cột
When thi công xong
Then bảng có năm cột (Chỗ · Ghép · Đã tra trên ReUI · Vì sao không đứng · Hạn xem lại), 13 dòng điền đủ bằng truy vấn ReUI
thật — mỗi ô «Đã tra trên ReUI» khớp một truy vấn và ứng viên trong kết quả thô lưu ở `evidence/reui-tra.md` — và `npm run lint` không đỏ vì bảng này.

**AC-5 — Dòng «Chỗ hở» thiếu một ô thì đỏ gọi tên dòng.**
Given một dòng «Chỗ hở» trống (hay chỉ «—») «Đã tra trên ReUI», «Vì sao không đứng» hay «Hạn xem lại», hay hạn không mở đầu bằng ngày
hoặc «khi »
When chạy kiểm chuẩn
Then đỏ, dòng lỗi nêu tên chỗ và tên cột.

**AC-6 — Hạn đã tới thì cảnh báo có tên, không đỏ.**
Given một dòng «Chỗ hở» có hạn là ngày đã tới, và một dòng có hạn «khi …» hay ngày chưa tới
When chạy kiểm chuẩn
Then dòng hạn đã tới ra đúng một cảnh báo nêu tên chỗ và ngày, in ở đầu ra của kiểm chuẩn, mã thoát 0; dòng kia không in gì. Bốn chỗ tạm chờ khối Pro
trên cây thật ra bốn cảnh báo.

**AC-7 — Sửa ngoài hai bảng thì im.**
Given cây sạch đã xanh
When sửa phần khác của `catalog.md`, `vo-va-ia.md` hay một tài liệu khác
Then đầu ra kiểm chuẩn về hai bảng không đổi — không lỗi, không cảnh báo mới.

**AC-8 — Luật ghi cho người và tác tử. (judgment)**
Given `vo-va-ia.md` §3 và skill `quy-hang-ui`
When đọc
Then §3 nói ba ô bắt buộc và rơi bậc là một dòng sổ quyết định của hồ sơ; skill nói bậc 2 tra bảng «Khối đã chuyển thể»,
chuyển thể khối mới thì thêm dòng đủ chín ô và tệp chuyển thể mang chú thích «chuyển thể … <khối>», ghép hay tự viết thì thêm dòng «Chỗ hở» đủ năm ô.

## Coverage

Quét Zwicky (preset test-matrix). Chân sản phẩm: `[SUY-TỪ-REPO: docs/adr/0019-cong-chon-khoi.md]` quyết định 3–4,
`[SUY-TỪ-REPO: docs/plan/pham-vi-cong-chon-khoi.md]` CK2–CK3. Chân ngành: `[NGÀNH: ADR — Architecture Decision Records
(Nygard)]` cho vết quyết định có lý do và điều kiện xem lại. Thước CE: ngưỡng `bat_khi` của hàng 83.

- Trục A — bảng: Khối đã chuyển thể (AC-1, AC-2, AC-3) | Chỗ hở (AC-4, AC-5, AC-6).
- Trục B — trạng thái dòng: đủ (AC-1, AC-4) | thiếu ô (AC-3, AC-5) | trỏ sai đĩa hay sai khuôn (AC-3, AC-5) | khối có
  mà dòng không (AC-2) | hạn đã tới / chưa tới / điều kiện (AC-6).
- Trục C — thay đổi: trong hai bảng (AC-2…AC-6) | ngoài hai bảng (AC-7).
- Later: đo dòng rơi bậc trong `decisions.jsonl` bằng máy; trang ba lối (hàng 84).
- Nhận diện dựa trên chú thích «chuyển thể … <khối>» — nếp có sẵn ở cả hai khối hiện có (E2 đo trên cây thật), và AC-8 ghi
  nó thành luật của skill `quy-hang-ui`: tệp chuyển thể phải mang chú thích ấy. Tệp không chú thích là vi phạm luật skill,
  bộ kiểm không bắt được.

## Đường đo

- «Tiêm khối thiếu dòng → đỏ gọi tên khối»: AC-2 (E2).
- «Tiêm dòng Chỗ hở thiếu hạn → đỏ gọi tên dòng»: AC-5 (E5).
- «Hai khối đã có và 13 dòng điền ngược xanh»: AC-1, AC-4 (E1, E4).
- «Hạn đã tới in cảnh báo có tên, không đỏ»: AC-6 (E6).
- «Chỉ sửa docs ngoài hai bảng → im»: AC-7 (E7).

## Out of scope

- Trang ba lối và luật «ô chưa có khuôn» (CK1) — hàng 84.
- Trả bốn chỗ ghép tạm chờ khối Pro (CK4) — mục chờ H16, mở khi hàng này ký.
- Thước máy cho dòng «rơi bậc» trong sổ quyết định.
- Thêm chú thích nhận diện vào mã `apps/web`.

## Notes

- Vùng của hàng: `packages/ui-lint/**`, `.agents/skills/quy-hang-ui/**`, `docs/design/vo-va-ia.md`.
