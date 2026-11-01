---
schema_version: 1
feature: Vá hàng 85 «Liên hệ» — ca cách ly cho bảng nối lead với hàng, và hàng tạo từ lead báo «chưa có chủ nhà» thay vì trả tên trống
slug: va-lien-he
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, db]
status: draft
design_doc: docs/superpowers/specs/2026-11-01-va-lien-he-design.md
---

# Acceptance Contract: va-lien-he

## Context

Hàng `va-lien-he` của lộ trình (dãy L, đợt `dau-chu-dong-vao`, giám sát xếp sau 85, ưu tiên 0). Hai mục ngoài hợp đồng
mà chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng của `lien-he` (01/11): Ngoài-1 (bảng nối `lead_listings` chưa có ca
cách ly) và Ngoài-4 (GET chủ nhà của hàng tạo từ lead trả tên trống). Chạm `packages/db/tests` nên hạng T3. Không màn.

Source input: `_acceptance/lien-he/review-findings.md` (mục 1 và 4) · `_acceptance/lien-he/decisions.jsonl` (dòng Gate 2)
· yêu cầu L-15 và trả lời của giám sát · thiết kế `docs/superpowers/specs/2026-11-01-va-lien-he-design.md`

Từ ngữ: «dòng nối» = một dòng `lead_listings` (lead nào sinh ra hàng nào, ADR-0021 quyết định 6); «chưa có chủ nhà» = mã
lỗi `owner-not-set` (404) của lối chủ nhà.

## Criteria

- AC-1: Given sàn A có một dòng nối và sàn B có người đủ vai, When đọc lược đồ và gọi bằng vai API, Then bảng nối bật và
  ép luật theo dòng; người sàn B không đọc được dòng nối của sàn A, không chèn được dòng mang mã sàn A, không chèn được dòng
  trong sàn mình mà ghi tên người khác hay trỏ lead, hàng của sàn A; vai API không sửa, không xoá dòng nối; đối chứng: người sàn A đọc được đúng dòng nối
  của sàn A và chèn được dòng ghi tên mình.
- AC-2: Given một hàng đầu chủ vừa tạo từ lead (chủ nhà gắn liên hệ của lead, chưa có tên), When đầu chủ của hàng hay
  trưởng nhóm đọc chủ nhà hay bấm «Mở số», Then nhận 404 `owner-not-set` («chưa có chủ nhà»), không phải 200 với tên
  trống; When đầu chủ ghi chủ nhà có tên rồi đọc lại, Then nhận 200 với đúng tên ấy và liên hệ của lead vẫn gắn chủ nhà;
  đối chứng: hàng ghi chủ nhà thường vẫn đọc ra 200.

## Coverage

Bỏ quét coverage — bài toán một chiều: hai lỗi đã gọi tên, mỗi lỗi một lời hứa, không gian liệt kê nằm sẵn trong hai AC
(dòng `descope` «bỏ coverage-scan»).

## Out of scope

- Luật «chỉ đầu chủ của lead tạo được hàng từ lead» ở cơ sở dữ liệu — chủ kho đã ghi giới hạn (Ngoài-2 của `lien-he`).
- Nhãn Lead/Liên hệ đổi theo người xem (Ngoài-3, Ngoài-5) và ba chỗ bài kiểm mỏng của hàng 85 (Ngoài-6..8) — đã ghi giới hạn.
- Dời tên, số chủ nhà sang liên hệ theo RESO `ContactListings` — việc sau (ADR-0021).
- Màn chủ nhà, màn liên hệ — hàng 86.

## Notes

- Hàng ghi «sau va-anh-ban-that» trong hàng việc: chỉ thi công khi hàng ấy đã gộp, hoặc giám sát cho chạy trước (cùng tệp
  `isolation.test.mjs`).
