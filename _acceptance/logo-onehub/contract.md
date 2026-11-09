---
schema_version: 1
feature: "Quỹ hàng dùng logo OneHub đang chạy ở OneHub CRM: cột nhà, đăng nhập, thẻ trình duyệt, màn hình chính; rõ ở sáng và tối, khổ 1440 và 375."
slug: logo-onehub
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
approved_by: Manh Phan
approved_at: 2026-11-09
design_doc: docs/superpowers/specs/2026-11-09-logo-onehub-design.md
---

# Acceptance Contract: logo-onehub

## Context

Quỹ hàng đang dùng ô hộp màu chính làm dấu hiệu, biểu tượng ba vạch khi cài lên màn hình chính, và không có biểu tượng trên
thẻ trình duyệt. Chủ kho yêu cầu đổi sang logo đang dùng ở OneHub CRM. Logo CRM có hình sáu lục giác không chữ và bản ngang
kèm chữ «OneHub»; không có chữ «CRM».

Bất biến chạm: bất biến 4 (phần nội bộ không ra trang khách) — việc này không đưa thành phần nào vào trang khách.

Source input: `docs/plan/lo-trinh.json` hàng logo-onehub · `~/dev/crm/apps/app/public/*` (chỉ đọc) ·
`apps/web/src/components/shell/home-rail.tsx` · `apps/web/src/app/(auth)/khung.tsx` · `apps/web/src/app/manifest.ts`.

Từ dùng trong tiêu chí: **dấu hiệu OneHub** là hình sáu lục giác xanh của CRM, không kèm chữ.

## Criteria

- AC-1: Given vỏ máy tính ở khổ 1440, sáng và tối, When mở màn trong vỏ, Then đầu cột nhà hiện dấu hiệu OneHub cỡ 28×28, đúng cỡ
  ô hộp cũ, đọc rõ trên nền cột; không còn ô hộp màu chính; ảnh có chữ thay thế rỗng.
- AC-2: Given người chưa đăng nhập ở khổ 1440 và 375, sáng và tối, When mở trang đăng nhập, Then đầu trang hiện dấu hiệu
  OneHub cỡ 32×32, đúng cỡ ô hộp cũ, cạnh chữ «Quỹ hàng» (theo Hỏi-1); trang không hiện chữ «OneHub» hay «CRM» cạnh dấu
  hiệu; ảnh có chữ thay thế rỗng; khổ 375 không tràn ngang.
- AC-3: Given bộ tệp hình của ứng dụng, When so với bản của CRM theo bảng ánh xạ ở Notes, Then cả năm tệp trùng từng byte;
  tên cài vẫn là «Quỹ hàng».
- AC-4: Given người chưa đăng nhập, When trình duyệt xin biểu tượng, Then favicon, tệp dấu hiệu và biểu tượng cài trả về
  thành công, không bị đưa về trang đăng nhập; trang khai đủ favicon và biểu tượng apple.
- AC-5: Given mã giao diện, When đọc hai chỗ hiện dấu hiệu, Then cả hai gọi cùng một thành phần, đường dẫn tệp dấu hiệu chỉ
  khai một chỗ, biểu tượng ô hộp không còn ở đó.
- AC-6: Given trang khách `/s/<mã>`, When đọc mã trang và chạy bộ kiểm rò rỉ, Then không có thành phần dấu hiệu nào trong
  thư mục trang khách, và bộ kiểm rò rỉ xanh.
- AC-7: Given khách mở trang khách, When đọc biểu tượng thẻ trình duyệt, Then biểu tượng là favicon OneHub giống trang đăng
  nhập (theo Hỏi-2); đầu trang vẫn là tên sàn.

## Coverage

Bỏ quét không gian bằng công cụ: `d-…` «bỏ coverage-scan» trong `decisions.jsonl`. Trục kê tay: chỗ hiện (cột nhà ·
đăng nhập · thẻ trình duyệt · màn hình chính · trang khách · vỏ điện thoại) × nền (sáng · tối) × khổ (1440 · 375). Vỏ điện
thoại và đầu trang khách không có logo hôm nay, xếp vào Out of scope (Hỏi-3); thẻ trình duyệt của trang khách có AC-7 (Hỏi-2), và AC-6 giữ phần còn lại của trang khách.

## Out of scope

- Thêm logo vào thanh trên của vỏ điện thoại (Hỏi-3).
- Thêm logo vào đầu trang khách `/s/<mã>`; đầu trang vẫn là tên sàn.
- Đổi tên sản phẩm, hay dùng bản ngang chữ «OneHub».
- Đổi màu nút chính và màu giao diện.
- Sửa biểu tượng nhỏ trên thanh trạng thái Android khi có thông báo.

## Notes

Bảng ánh xạ từ CRM (`~/dev/crm`, commit 6adaf11e0):

| Tệp nguồn ở CRM | Tệp trong Quỹ hàng |
|---|---|
| `apps/app/public/favicon.svg` | `apps/web/public/icons/onehub-mark.svg` |
| `apps/app/app/favicon.ico` | `apps/web/src/app/favicon.ico` |
| `apps/app/public/apple-touch-icon.png` | `apps/web/public/icons/apple-touch-icon.png` |
| `apps/app/public/web-app-manifest-192x192.png` | `apps/web/public/icons/icon-192.png` |
| `apps/app/public/web-app-manifest-512x512.png` | `apps/web/public/icons/icon-512.png` |

Máy đã cài Quỹ hàng lên màn hình chính nhận biểu tượng mới theo lịch của hệ điều hành; iPhone thường phải cài lại. Service
worker của Quỹ hàng không cache trang hay tệp, nên không giữ biểu tượng cũ. Biểu tượng cài là bản CRM đã canh trong vùng an
toàn nên không bị cắt khi khai maskable.
