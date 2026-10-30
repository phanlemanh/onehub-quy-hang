---
schema_version: 1
feature: Quản trị sàn mời người vào sàn, đặt vai và khu phụ trách; một người giữ được nhiều vai
slug: moi-nguoi-vai-khu
owner: omre.cnsp4@onemount.com
risk_tier: T3
surfaces: [api, ui]
status: draft
design_doc: docs/superpowers/specs/2026-10-30-moi-nguoi-vai-khu-design.md
approved_by:
approved_at:
---

# Acceptance Contract: moi-nguoi-vai-khu

## Context

Hàng 7 của lộ trình (nền quyền, dãy Q), đứng trên hàng 6 (đăng nhập theo sàn, ADR-0005). Hàng 6 có thành viên sàn
nhưng chỉ đội vận hành gắn được người và chưa ai có vai. Hàng này cho quản trị sàn tự mời người, đặt một hay nhiều trong
năm vai, giao khu phụ trách, sửa và bỏ khỏi sàn — nền quyền cho mọi màn sau. Ba câu Hỏi-1..3 của bản thiết kế theo
khuyến nghị; chủ kho chốt ở Cổng Phạm vi.

Source input: `docs/plan/lo-trinh.json` hàng 7 · `_acceptance/moi-nguoi-vai-khu/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-10-30-moi-nguoi-vai-khu-design.md`

## Criteria

- AC-1: Given quản trị sàn A, When mời một email chưa có tài khoản với vai đầu chủ và đầu khách, Then người đó xin mã,
  nhập mã và vào thẳng sàn A; `GET /me` của họ trả sàn A với đúng hai vai ấy. (cross-layer)
- AC-2: Given một người đã có tài khoản và đang thuộc sàn B, When quản trị sàn A mời đúng email ấy, Then người đó thuộc
  cả A và B, vẫn một tài khoản; When mời lại email đã là thành viên của A, Then API trả 409 `da-la-thanh-vien`, không
  đổi gì; mời email mới và email đã có tài khoản trả cùng mã và cùng hình dạng thân, để quản trị không dò được ai đã có
  tài khoản.
- AC-3: Given quản trị sàn A, When đặt vai cho một thành viên, Then chỉ năm giá trị telesales, đầu chủ, đầu khách,
  trưởng nhóm, quản trị sàn được nhận (giá trị khác → 400, cơ sở dữ liệu cũng từ chối), một người giữ được nhiều vai,
  và đổi vai có hiệu lực ở lời gọi kế của người đó.
- AC-4: Given quản trị sàn A, When tạo khu theo tên và giao khu cho thành viên, Then thành viên mang đúng các khu ấy;
  tên khu trùng trong cùng sàn → từ chối; When giao một khu của sàn B, Then bị từ chối (400 ở API, khoá ngoại ở cơ sở
  dữ liệu).
- AC-5: Given quản trị sàn A, When bỏ một thành viên khỏi sàn, Then lời gọi kế của người đó — kể cả dùng lại phiên và
  lựa chọn sàn A cũ — không vào được sàn A và khu phụ trách của họ ở A mất theo; When gỡ vai quản trị của một người,
  Then lời gọi quản người kế của họ trên phiên cũ bị 403 `can-quan-tri`.
- AC-6: Given người thuộc sàn A mà không có vai quản trị, When gọi danh sách, mời, sửa, bỏ thành viên hay tạo khu, Then
  API trả 403 `can-quan-tri`; When chính vai `quy_hang_app` thử ghi bảng thành viên, khu, khu phụ trách với người không
  phải quản trị, Then cơ sở dữ liệu từ chối.
- AC-7: Given sàn A chỉ còn một quản trị, When bỏ người đó khỏi sàn hay gỡ vai quản trị của họ, Then bị từ chối với
  409 `can-mot-quan-tri` và sàn vẫn còn một quản trị — chặn ở cơ sở dữ liệu, kể cả khi ghi thẳng không qua API và khi
  hai quản trị gỡ nhau cùng lúc; Given sàn còn hai quản trị, Then gỡ một người được.
- AC-8: Given cơ sở dữ liệu đã áp mọi migration, When chạy bộ kiểm cách ly, Then bảng khu và khu phụ trách bật và ép
  luật theo dòng; quản trị sàn A không đọc, không ghi được thành viên, khu, khu phụ trách của sàn B.
- AC-9: Given công cụ vận hành mở sàn, When mở sàn mới với một email, Then người đó là thành viên mang vai quản trị
  sàn.
- AC-10: Given dev server với một quản trị và một người không phải quản trị, When quản trị mở trang Người dùng — xem
  danh sách, thêm khu, mời người với hai vai và một khu, mời trùng email, sửa vai, bỏ người, thử bỏ chính mình khi là
  quản trị cuối — và người kia mở cùng trang, Then mỗi bước hiện đúng trạng thái ở bảng trạng thái của bản thiết kế,
  chữ tiếng Việt, danh sách đọc từ máy chủ sau khi tải lại. (cross-layer)

## Coverage

Quét morphological-scan, preset entity-feature, cho thực thể «thành viên sàn có vai và khu».

- Trục thao tác: mời (AC-1, AC-2) | xem danh sách (AC-6, AC-10) | sửa vai (AC-3) | giao khu (AC-4) | bỏ khỏi sàn
  (AC-5, AC-7) | tạo khu (AC-4) [thước CE: câu giao hàng 7 + Tham chiếu §9 nhà Cài đặt sàn]
- Trục người được mời: chưa có tài khoản (AC-1) | có tài khoản ở sàn khác (AC-2) | đã là thành viên (AC-2) [thước CE:
  ADR-0005 mục 4 — tài khoản sinh khi được mở hay mời]
- Trục vai: năm vai đơn (AC-3) | nhiều vai một người (AC-1, AC-3) | vai lạ (AC-3) | quản trị cuối cùng (AC-7)
  [thước CE: Tham chiếu §2 bảng năm vai, «một người giữ được nhiều vai»]
- Trục người thao tác: quản trị (AC-1..AC-5) | không phải quản trị (AC-6) | sàn khác (AC-8) [thước CE: AGENTS.md bất
  biến 1]
- Trục lớp chặn: API (AC-2..AC-7) | cơ sở dữ liệu (AC-3, AC-4, AC-6, AC-7, AC-8) | màn (AC-10)
- Trục khu: tên sàn tự đặt (AC-4) | gắn toà danh mục — Later, hàng nạp danh mục [CE chưa kiểm chứng: chờ Hỏi-2]

## Đường đo

- bỏ đường-đo — ô cơ hội chưa khai ngưỡng (bốn dòng «…»); không có thước nào để dựng đường

## Out of scope

- Gửi email mời — chưa có email thật (hàng nơi chạy); quản trị tự báo người được mời.
- Quyền chi tiết của từng vai ở từng màn — làm cùng màn đó; hàng này chỉ chặn quyền quản trị người.
- Lịch sử ai sửa gì — theo sự kiện của hàng 8.
- Gắn khu vào toà / phân khu của danh mục — hàng nạp danh mục.
- Màn Đội của trưởng nhóm, nhãn riêng của người.
- Khối Pro `solution-users-8` — màn ghép từ thành phần đã cài (theo Hỏi-5).

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Bất biến chạm: (1) cách ly giữa công ty — hai bảng mới mang luật theo dòng, khoá ngoại giữ khu cùng sàn. Không nới bất
  biến nào; (2), (3), (4) không chạm.
- Dãy Q chạy dev ở cổng 3461 (`web-q`), Postgres 5545.
