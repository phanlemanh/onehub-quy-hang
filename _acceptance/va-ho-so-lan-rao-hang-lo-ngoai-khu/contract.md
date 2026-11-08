---
schema_version: 1
feature: "Trong hồ sơ của căn lô hoặc căn ngoài khu, bấm vào một lần rao ở mục «Các lần rao» mở đúng lần rao ấy, không báo «không thấy căn»."
slug: va-ho-so-lan-rao-hang-lo-ngoai-khu
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
design_doc: docs/superpowers/specs/2026-11-08-va-ho-so-lan-rao-hang-lo-ngoai-khu-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-11-08T16:47:47Z
---

# Acceptance Contract: va-ho-so-lan-rao-hang-lo-ngoai-khu

## Context

Ngoài-5 của hàng 79 (`_acceptance/bang-hang-theo-loai-hinh/`), chủ kho chọn «mở hợp đồng mới» 08/11. Không chạm bất biến nào; không đổi dữ liệu, API.

## Criteria

- **AC-1** — Link lần rao của hàng không toà giữ đường mở theo hàng.
  Given hồ sơ một hàng lô và một hàng ngoài khu, mở trong cột cạnh bảng và trong bảng thẻ,
  When dựng mục «Các lần rao»,
  Then link mỗi lần rao đọc ra đúng hồ sơ theo hàng của hàng ấy (không có `unit`, `toa`), giữ các tham số khác của địa chỉ.

- **AC-2** — Căn hộ không đổi.
  Given hồ sơ một căn hộ có hai lần rao,
  When dựng mục «Các lần rao»,
  Then link mỗi lần rao vẫn theo căn (mã căn, toà, lần rao) như trước.

- **AC-3** — Trên màn đang chạy.
  Given đầu chủ mẫu có một hàng lô và một hàng ngoài khu, máy tính 1440 × 900,
  When mở hồ sơ từng hàng từ Bảng hàng rồi bấm lần rao trong «Các lần rao»,
  Then hồ sơ vẫn mở đúng căn, không hiện lời báo không thấy căn.

## Coverage

- Trục A — dạng hàng: lô | ngoài khu | căn hộ. [thước CE: ba dạng của khuôn `created`, hàng 76]
- Trục B — chỗ mở hồ sơ: cột cạnh bảng | bảng thẻ. [thước CE: `dongHref` có tham số | không tham số]

## Đường đo

- Thước: bấm lần rao của hàng không toà vẫn đúng hồ sơ · số từ: bộ kiểm web và màn đang chạy · bảo đảm bởi: AC-1, AC-3

## Out of scope

- Các lỗi khác của hồ sơ hàng không toà ghi ở Known limits hàng 79 (tiêu đề hồ sơ lặp tên khu).
- Hai hàng vá cùng đợt: cột thấp tầng khi lọc rỗng, lỗi đọc căn ngoài khu.

## Notes
