---
schema_version: 1
feature: "Khi bộ lọc ở cột của hàng thấp tầng làm Bảng hàng ra rỗng, cột và ô lọc đang gõ vẫn ở nguyên để người dùng sửa; xoá ký tự trong ô thì hàng hiện lại."
slug: va-bang-hang-cot-thap-tang-khi-loc-rong
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: approved
design_doc: docs/superpowers/specs/2026-11-09-va-bang-hang-cot-thap-tang-khi-loc-rong-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-11-09T02:38:35Z
---

# Acceptance Contract: va-bang-hang-cot-thap-tang-khi-loc-rong

## Context

Ngoài-4 của hàng 79 (`_acceptance/bang-hang-theo-loai-hinh/`), chủ kho chọn «mở hợp đồng mới» 08/11. Bộ cột tính từ các dòng đã lọc, tập rỗng đọc như căn hộ, nên cột riêng của thấp tầng biến mất đúng lúc người đang gõ vào ô lọc của nó. Không chạm bất biến nào; không đổi dữ liệu, API.

## Criteria

- **AC-1** — Lọc ra rỗng ở cột thấp tầng: bộ cột còn nguyên.
  Given bảng đang có dòng, một ca đã lọc Loại hình = Đất, một ca bảng trộn chưa lọc Loại hình,
  When ô lọc Diện tích đất nhận giá trị không dòng nào khớp, bảng ra rỗng,
  Then bộ cột hiện và tiêu đề cột vị trí bằng đúng bước liền trước lúc bảng còn dòng, gồm cột đang lọc và các cột khác của thấp tầng.

- **AC-2** — Sửa ô thì hàng hiện lại.
  Given bảng rỗng vì ô lọc Diện tích đất,
  When xoá ký tự trong ô,
  Then các hàng khớp hiện lại với đúng bộ cột của chúng.

- **AC-3** — Rỗng vì ô lọc cột chung cũng giữ nguyên.
  Given bảng đã lọc Đất, ô Diện tích đất có giá trị khớp,
  When ô Giá nhận giá trị không dòng nào khớp, bảng ra rỗng,
  Then bộ cột hiện và tiêu đề cột vị trí bằng đúng bước liền trước, ô Diện tích đất còn trên màn với giá trị của nó.

- **AC-4** — Không đổi khi có dòng hay sàn chỉ căn hộ.
  Given bảng có dòng sau lọc, hoặc sàn chỉ có căn hộ lọc ra rỗng,
  When bộ cột được tính,
  Then bộ cột bằng đúng kết quả trước bản vá.

- **AC-6** — Mở bảng đã rỗng và bật tắt cột lúc rỗng.
  Given góc nhìn mở ra đã rỗng, hoặc bảng đang rỗng mà người dùng bật tắt một cột,
  When bộ cột được tính,
  Then lần mở đầu tính theo các dòng chỉ lọc Loại hình; cột người vừa tắt biến mất, cột vừa bật hiện nếu không bị loại hình ẩn.

- **AC-5** — Trên màn đang chạy.
  Given đầu chủ mẫu có hàng đất, máy tính 1440 × 900,
  When bật Lọc, gõ giá trị không khớp vào ô Diện tích đất rồi xoá ký tự,
  Then lúc bảng rỗng tiêu đề cột và ô đang gõ còn trên màn và giữ chữ đã gõ, khối báo rỗng hiện trong khung nhìn; sau khi xoá số hàng bằng trước khi gõ.

## Coverage

- Trục A — lý do rỗng: ô lọc cột thấp tầng (AC-1, AC-2, AC-5) | ô lọc cột chung (AC-3, AC-5) | mở trang đã rỗng (AC-6) | không rỗng (AC-4). [thước CE: ba nhánh của luật lọc trong `loc.ts`]
- Trục B — thành phần loại hình của dữ liệu: chỉ đất | trộn nhiều loại hình (AC-1) | chỉ căn hộ (AC-4). [thước CE: bộ mẫu hàng 5 và hàng 73]

## Đường đo

- Thước: gõ giá trị không khớp vào ô lọc cột đất, bảng rỗng, cột và ô lọc còn nguyên, xoá ký tự thì hàng hiện lại · số từ: bộ kiểm web và màn đang chạy · bảo đảm bởi: AC-1, AC-2, AC-5

## Out of scope

- Cách gọi tên, thứ tự cột, và cột của loại hình khi có dòng (hàng 79).
- Lỗi đọc căn ngoài khu (hàng vá `va-loi-doc-can-ngoai-khu`).
- Khối báo lọc rỗng: giữ nguyên chữ và vị trí.

## Notes
