---
schema_version: 1
feature: Đổi đường API, mã lỗi và đường màn đăng nhập sang tiếng Anh, giữ nguyên hành vi và chữ trên màn
slug: doi-ten-api-tieng-anh
owner: omre.cnsp4@onemount.com
risk_tier: T2
surfaces: [api, ui]
status: signed-off
design_doc: docs/superpowers/specs/2026-10-31-doi-ten-api-tieng-anh-design.md
approved_by: Manh Phan
approved_at: 2026-10-30T22:14:35Z
---

# Acceptance Contract: doi-ten-api-tieng-anh

## Context

Hàng phát sinh của dãy Q (đợt nen-dau), giám sát thêm 30/10 theo quyết của chủ kho «Đổi sau hàng 7». Luật kho
(`AGENTS.md`): code và API tiếng Anh, chữ UI tiếng Việt. Hàng 6 và 7 đã gộp với đường API, mã lỗi và đường màn đăng
nhập tiếng Việt. Hàng này đổi chúng sang tiếng Anh, không đổi hành vi, kèm ADR-0007 nối tiếp ADR-0005. Bảng đổi tên đầy
đủ ở mục 2 của bản thiết kế.

Source input: câu giao trong `hang-viec.json` của đợt · trả lời giám sát Q-13 · thiết kế
`docs/superpowers/specs/2026-10-31-doi-ten-api-tieng-anh-design.md`

## Criteria

- AC-1: Given API đang chạy, When gọi các đường của sàn đang làm, Then chúng phục vụ ở `/api/v1/me/company`,
  `/api/v1/company`, `/api/v1/company/members`, `/api/v1/company/members/{userId}`, `/api/v1/company/zones` với cùng
  phương thức, cùng mã HTTP và cùng thân như trước; bản OpenAPI liệt đúng mười cặp (phương thức, đường): tám cặp
  của các đường này cùng `GET /health`, `GET /me` — các đường đăng nhập `/auth/**` không nằm trong OpenAPI, như trước.
- AC-2: Given bốn đường cũ `/api/v1/san`, `/api/v1/san/thanh-vien`, `/api/v1/san/khu`, `/api/v1/me/san`, When gọi bằng
  phiên hợp lệ, Then trả 404 — không còn phục vụ, không chuyển hướng.
- AC-3: Given mỗi ca lỗi mà API đang trả, When ca ấy xảy ra, Then thân lỗi mang mã tiếng Anh theo bảng đổi tên
  (`unauthenticated`, `not-a-member`, `no-company`, `admin-required`, `select-company`, `already-member`, `last-admin`,
  `zone-name-taken`, `invalid-role`, `role-required`, `invalid-zone`, `zone-name-required`, `not-found`) với đúng mã
  HTTP cũ. (cross-layer)
- AC-4: Given mã nguồn API và web, When quét, Then không còn chuỗi nào trong danh sách đóng gồm mười ba mã lỗi cũ, bốn
  đường API cũ và ba đường màn cũ; mười ba mã mới nằm ở một hằng duy nhất của gói API và màn đọc kiểu mã từ hằng ấy.
- AC-5: Given người chưa đăng nhập, When mở bất kỳ trang nào của bàn làm việc, Then được đưa về `/login`; đăng nhập
  xong người nhiều sàn tới `/select-company`, người chưa thuộc sàn nào tới `/no-company`; đăng xuất đưa về `/login`;
  khi đã đăng nhập, ba đường màn cũ trả trang 404 (chưa đăng nhập thì mọi đường, kể cả đường cũ, về `/login`).
- AC-6: Given quản trị sàn ở màn Người dùng, When mời một email đã là thành viên hay bỏ quản trị cuối cùng, Then màn vẫn
  báo đúng câu tiếng Việt như trước («Email này đã là thành viên của sàn.», «Sàn cần ít nhất một quản trị.»), danh sách
  và khu vẫn tải từ đường mới. (cross-layer)
- AC-7: Given sau thay đổi, When đọc màn đăng nhập, chọn sàn, chưa gắn sàn và Người dùng, Then mọi chữ người thấy vẫn là
  tiếng Việt, không lộ mã hay đường tiếng Anh nào ra chữ trên màn.
- AC-8: Given kho sau thay đổi, When đọc tài liệu, Then có ADR-0007 nêu bảng đổi tên, lý do và ba thứ cố ý giữ (cookie
  `qh_san`, tên tệp, thẻ nhật ký mã dev); ADR-0005 trỏ sang ADR-0007; Tham chiếu §12 có dòng ghi quyết định. (judgment)

## Coverage

Quét morphological-scan, preset entity-feature, cho thực thể «tên tiếng Việt lộ ra ngoài mã».

- Trục loại tên: đường API (AC-1, AC-2) | mã lỗi (AC-3) | đường màn (AC-5) | mã lỗi nội bộ màn (AC-4) | cookie, tên
  tệp, thẻ nhật ký — Never, cố ý giữ (Out of scope) [thước CE: câu giao «đường API, mã lỗi và đường màn đăng nhập»]
- Trục bên đọc: bên gọi API (AC-1..AC-3) | màn của bàn làm việc (AC-5, AC-6) | người đọc tài liệu (AC-8) | người dùng
  cuối thấy chữ (AC-7)
- Trục tồn dư: đường cũ còn phục vụ (AC-2) | chuỗi cũ còn trong mã (AC-4) | hai nguồn mã lỗi (AC-4)
- Trục hành vi giữ nguyên: mã HTTP (AC-1, AC-3) | thân JSON (AC-1) | quyền (AC-3 qua các ca quyền) | chữ trên màn
  (AC-6, AC-7)

## Đường đo

- bỏ đường-đo — hàng phát sinh không có ô cơ hội và ngưỡng nghiệm thu; không có thước nào để dựng đường.

## Out of scope

- Đổi tên cookie sàn đang làm `qh_san` — câu giao không nêu; đổi làm mọi phiên phải chọn lại sàn.
- Đổi tên tệp và thư mục mã tiếng Việt (`thanh-vien.ts`, `quan-nguoi.tsx`…) ngoài ba thư mục màn đổi đường — theo
  khuyến nghị Hỏi-1, chủ kho chốt ở Cổng Phạm vi.
- Đổi thẻ nhật ký mã đăng nhập dev `[ma-dang-nhap]` — bài chấm giao diện của các hàng đã ký đọc đúng thẻ này.
- Giữ đường cũ hay chuyển hướng từ đường cũ — bản thật chưa chạy, chưa ai giữ đường cũ.
- Sửa kiểm thử của gói cơ sở dữ liệu — chúng không gọi đường API.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Không chạm bất biến nào: (1) cách ly — luật theo dòng không đổi; (2) chủ nhà — không chạm lớp `source`; (3), (4) không
  chạm.
- Dãy Q chạy dev ở cổng 3461 (`web-q`), Postgres 5545.
- Known limits — chọn ở Cổng Bằng chứng 2026-10-31:
  - Ngoài-1: Một đường API tiếng Việt cũ viết lại theo dạng ít gặp có thể lọt bài quét tự động; hôm nay không đường cũ nào còn phục vụ.
  - Ngoài-2: Nếu ai dựng lại thư mục của một màn cũ, địa chỉ cũ sống lại mà bài quét tự động không báo; hôm nay ba địa chỉ cũ trả trang không tồn tại.
