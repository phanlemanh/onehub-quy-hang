---
schema_version: 1
feature: Lệnh chốt bán với ngày bán không có thật (như 30 tháng 2) bị từ chối với lỗi nêu đúng trường ngày bán, không phải lỗi hệ thống
slug: bao-ro-ngay-ban-sai
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api]
status: implemented
design_doc: docs/superpowers/specs/2026-10-31-bao-ro-ngay-ban-sai-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-31T09:02:09Z
---

# Acceptance Contract: bao-ro-ngay-ban-sai

## Context

Hàng 57 của lộ trình (nền, dãy X, đợt nen-2), đứng trên hàng 8 (lõi hàng và sự kiện). Mở từ Cổng Bằng chứng hàng 8,
mục Ngoài-2 — chủ kho chọn «mở hợp đồng mới» ngày 31/10: ngày bán không có thật (vd `2026-02-30`) qua được kiểm payload
rồi cơ sở dữ liệu báo lỗi, API trả 500 thay vì 400 `invalid-payload`. Sửa ở lõi: kiểm ngày theo lịch thật thay cho
`Date.parse` (tự cuộn ngày lố sang tháng sau). API không đổi.

Hạng: máy suy **T2** (không tệp nào thuộc `t3_paths`); hàng lộ trình ghi **T2**.

Source input: `docs/plan/lo-trinh.json` hàng 57 · `_acceptance/bao-ro-ngay-ban-sai/opportunity.md` ·
`_acceptance/loi-hang-va-su-kien/decisions.jsonl` dòng `d-20261031T002445Z-30` · thiết kế
`docs/superpowers/specs/2026-10-31-bao-ro-ngay-ban-sai-design.md`

## Criteria

- AC-1: Given ma trận ngày đúng dạng `YYYY-MM-DD` mà không có thật viết trước — ngày 29/2 năm không nhuận (`2025-02-29`,
  `1900-02-29`), ngày 30 và 31 tháng 2, ngày 31 của tháng 30 ngày (tháng 4, 6, 9, 11), ngày `00` và `32`, tháng `00` và
  `13`, năm `0000` — When kiểm payload lệnh chốt bán (`status_changed` sang `Closed`, giá chốt hợp lệ, `closeDate` là ngày
  ấy), Then mỗi ngày ra đúng một lỗi, ở đường `closeDate`, lý do «ngày không có thật»; chuỗi sai dạng (`2026-2-3`,
  `30/02/2026`, chuỗi rỗng, số) vẫn ra một lỗi ở `closeDate` với lý do dạng ngày.
- AC-2: Given ma trận ngày có thật viết trước — ngày nhuận (`2024-02-29`, `2000-02-29`), ngày cuối mỗi tháng của một năm,
  `0001-01-01`, `9999-12-31` — When kiểm cùng payload, Then không lỗi nào.
- AC-3: Given đúng hai ma trận của AC-1 và AC-2 (một danh sách dùng chung, không chép lại), When đưa từng ngày đúng dạng
  vào kiểu `date` của Postgres, Then Postgres nhận đúng những ngày lõi nhận và từ chối đúng những ngày lõi từ chối — không
  ngày nào lõi cho qua mà cơ sở dữ liệu từ chối. (cross-layer)
- AC-4: Given một hàng ở «Đang bán» trên Postgres thật, When gửi lệnh chốt bán qua API với từng ngày không có thật của
  AC-1, Then mỗi lần trả 400 `invalid-payload` với `details` đúng một mục đường `closeDate`, không lần nào trả 500, số
  sự kiện và bản tính của hàng không đổi; đối chứng dương trên cùng hàng: chốt bán với `2024-02-29` trả 200 và đọc lại
  hàng thấy «Đã bán» với ngày bán `2024-02-29`. (cross-layer)

## Coverage

Quét theo khuôn morphological-scan, preset test-matrix, cho phép kiểm «ngày bán của lệnh chốt bán». Chân sản phẩm: Tham
chiếu §5 «căn đã bán giữ giá chốt và ngày bán» [SUY-TỪ-REPO: docs/product/tham-chieu.md], mục Ngoài-2 của hàng 8
[SUY-TỪ-REPO: _acceptance/loi-hang-va-su-kien/decisions.jsonl]. Chân ngành: kiểu `date` của Postgres là bên đọc thật
[NGÀNH: PostgreSQL 16 — date input, năm 1 tới 5874897, không năm 0]; ngày đóng giao dịch theo RESO `CloseDate`.

- Trục loại ngày: có thật thường | ngày nhuận (luật 4/100/400) | cuối tháng 30/31 ngày | lố ngày trong tháng | lố tháng |
  năm 0 | sai dạng (AC-1, AC-2) [thước CE: luật lịch Gregorian]
- Trục lớp đọc: lõi kiểm payload (AC-1, AC-2) | Postgres `date` (AC-3) | API trên Postgres thật (AC-4) [thước CE: đường
  ghi duy nhất — AGENTS.md, dòng `packages/api`: «đường ghi duy nhất»; trong đó `closeDate` chỉ vào qua
  lệnh `status_changed` của `applyCommand`, kiểm payload trước khi chèn sự kiện; tạo hàng không nhận `closeDate` (khuôn
  `created` chặt)] [SUY-TỪ-REPO: packages/api/src/listings/store.ts]
- Trục kết cục: 400 nêu trường, không ghi (AC-4) | 200 ghi đúng ngày (AC-4 đối chứng) [thước CE: `API_ERRORS.invalidPayload`]
- Later: luật nghiệp vụ cho ngày bán ở tương lai hay quá xa trong quá khứ; màn chốt bán đọc `details` để tô đỏ ô ngày.
- Never: bắt lỗi Postgres ở API rồi đổi mã (sổ quyết định — lối loại).

## Out of scope

- Không chặn ngày bán ở tương lai hay quá xa trong quá khứ — luật nghiệp vụ, không phải ngày không có thật.
- Không đổi giao diện (chưa có màn chốt bán).
- Không đổi cột `close_date`, migration hay ràng buộc của cơ sở dữ liệu.
- Không đổi đường API, mã lỗi hay khuôn thân lỗi.

## Notes

- Vùng của hàng: `packages/core/src/listing/**` (vùng gốc ở `hang-viec.json`) cộng `packages/api/test-db/ngay-ban/**` (tệp
  kiểm trên Postgres thật) và hai tệp thiết kế, kế hoạch — khai thêm ở Cổng Phạm vi (sổ `d-20261031T085832Z-4`). Mã API
  (`packages/api/src/**`) chỉ được đọc, không sửa.
