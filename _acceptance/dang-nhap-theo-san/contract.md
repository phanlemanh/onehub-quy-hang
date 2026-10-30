---
schema_version: 1
feature: Người trong sàn đăng nhập và vào đúng vùng dữ liệu của sàn mình; chưa gắn sàn thì không thấy gì
slug: dang-nhap-theo-san
owner: omre.cnsp4@onemount.com
risk_tier: T3
surfaces: [api, ui, config]
status: verified
design_doc: docs/superpowers/specs/2026-10-30-dang-nhap-theo-san-design.md
approved_by: Manh Phan
approved_at: 2026-10-30T02:25:02Z
---

# Acceptance Contract: dang-nhap-theo-san

## Context

Hàng 6 của lộ trình (nền quyền, dãy Q). Kho đã có nền cách ly theo sàn nhưng chưa có ai đăng nhập và chưa có gì nối
một người với một sàn. Hàng này dựng đoạn nối người → phiên → sàn đang làm → giao dịch của API mang đúng mã sàn, để
mọi màn sau đứng lên; hàng 7 (mời người, vai) và hàng 8 (một đường ghi) chờ nó. Cách đăng nhập theo khuyến nghị
Hỏi-1 của bản thiết kế (email + mã 6 số) — chủ kho chốt ở Cổng Phạm vi.

Source input: `docs/plan/lo-trinh.json` hàng 6 · `_acceptance/dang-nhap-theo-san/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-10-30-dang-nhap-theo-san-design.md`

## Criteria

- AC-1: Given một email đã có tài khoản và một email lạ, When người xin mã đăng nhập, Then với email có tài khoản bộ
  gửi nhận đúng một mã 6 chữ số, với email lạ bộ gửi không nhận mã nào (không tự đăng ký — Hỏi-4), và câu trả lời của
  API giống hệt nhau ở hai ca; When một email xin mã lần thứ sáu trong 15 phút, Then API trả 429 và bộ gửi không nhận
  thêm mã (lần thứ năm vẫn nhận).
- AC-2: Given một mã vừa gửi, When người nhập đúng mã trong 5 phút, Then API mở phiên (cookie phiên) và `GET /me` trả
  người đó; When nhập sai, nhập sau khi mã hết hạn, hay nhập lần thứ tư sau ba lần sai, Then không phiên nào được mở.
- AC-3: Given người thuộc đúng một sàn A, When gọi `GET /san`, Then API trả sàn A, đọc từ cơ sở dữ liệu trong một giao
  dịch chạy bằng vai `quy_hang_app` với `app.company_id` = A — không cần chọn gì.
- AC-4: Given người đã đăng nhập mà chưa thuộc sàn nào, When gọi `GET /san`, Then API trả 403 `chua-gan-san` và không
  dòng nào của bất kỳ sàn nào; `GET /me` trả danh sách sàn rỗng.
- AC-5: Given người thuộc sàn A và B, When chưa chọn sàn và gọi `GET /san`, Then API trả 409 `chon-san`; When chọn B
  qua `POST /me/san`, Then các lời gọi sau vào B; When chọn sàn C mình không thuộc (hay đã bị bỏ khỏi B), Then API trả
  403 và sàn đang làm không là C (với B: lời gọi kế không vào B).
- AC-6: Given chưa đăng nhập hay phiên đã đăng xuất, When gọi `GET /me`, `GET /san`, `POST /me/san`, Then API trả 401;
  When mở một trang của app (trừ `/dang-nhap`), Then trang chuyển về `/dang-nhap`.
- AC-7: Given cơ sở dữ liệu đã áp mọi migration, When chạy bộ kiểm cách ly, Then: bảng thành viên sàn bật và ép luật
  theo dòng; vai `quy_hang_app` không đọc được thành viên hay tên của sàn mình không thuộc, không thêm được thành viên,
  và không có quyền gì trên schema `identity` của tài khoản và phiên.
- AC-8: Given API đang chạy các luồng của AC-3, AC-4, AC-5 và luồng trọn của AC-10, When ghi lại mọi truy vấn chạm
  bảng ở schema `public` kèm vai đang chạy, Then 100% chạy bằng vai `quy_hang_app` trong giao dịch do đúng một hàm của
  `packages/api` mở (hàm đặt `app.user_id` và `app.company_id`, sàn được phép trống); Given mã nguồn `packages/api/src`,
  Then chỉ tệp của hàm ấy và phần danh tính của better-auth (chỉ chạm schema `auth`) gọi truy vấn. Công cụ vận hành
  (AC-9) nằm ngoài `packages/api`, không có đường HTTP nào gọi tới.
- AC-9: Given công cụ vận hành mở sàn (`packages/db`, chạy bằng tay trên kết nối chủ), When chạy với tên sàn và email,
  Then sàn được tạo và email được gắn làm thành viên (tạo tài khoản nếu chưa có); When chạy lại cùng tham số, Then không
  tạo sàn, tài khoản hay thành viên trùng; When chạy với cùng email và một tên sàn khác, Then người thuộc hai sàn.
- AC-10: Given dev server với ba người mẫu — thuộc một sàn, thuộc hai sàn, chưa gắn sàn — When đi trọn luồng trên
  trình duyệt: xin mã, nhập mã sai, nhập đúng, thấy tên sàn, tải lại, mở `/dang-nhap` khi đã đăng nhập, đăng xuất; người
  hai sàn chọn sàn ở `/chon-san`; người chưa gắn sàn đăng nhập; ba lần sai mã rồi «Gửi lại mã», Then mỗi bước hiện
  đúng trạng thái ở bảng trạng thái của bản thiết kế, chữ tiếng Việt, tên sàn trên trang đầu là tên đọc từ máy chủ.
  (cross-layer)
- AC-11: Given `NODE_ENV=production`, When dựng API mà không khai bộ gửi mã, Then dựng thất bại với thông điệp nêu
  thiếu bộ gửi (không rơi về bộ gửi dev in mã ra nhật ký); When có khai bộ gửi, Then dựng được.

## Coverage

Quét morphological-scan, preset entity-feature, cho thực thể «người đăng nhập vào sàn».

- Trục trạng thái người: chưa đăng nhập (AC-6) | đăng nhập, 0 sàn (AC-4) | 1 sàn (AC-3) | nhiều sàn chưa chọn
  (AC-5) | nhiều sàn đã chọn (AC-5) | bị bỏ khỏi sàn đang chọn (AC-5) [thước CE: Tham chiếu §2 «một người giữ được
  nhiều vai», §9 «chọn sàn chỉ hiện khi người thuộc hơn một sàn»]
- Trục bước đăng nhập: xin mã — email có tài khoản / email lạ / xin quá số lần (AC-1) | mã đúng (AC-2) | mã sai
  (AC-2) | mã hết hạn (AC-2) | sai quá số lần (AC-2, AC-10) | gửi lại mã (AC-10) | đăng xuất (AC-6, AC-10) [thước CE:
  hằng của plugin emailOTP — 5 phút, 3 lần; hằng của hàng — 5 lần xin mã / 15 phút]
- Trục môi trường: dev — bộ gửi in mã ra nhật ký (AC-10) | production thiếu bộ gửi — từ chối dựng (AC-11)
  [thước CE: Kiến trúc §8 — số và mã của người là dữ liệu nhạy]
- Trục lớp chặn: API (AC-3..AC-6) | cơ sở dữ liệu (AC-7) | mã nguồn — một cửa truy vấn (AC-8) | màn (AC-6, AC-10)
  [thước CE: AGENTS.md bất biến 1 — cách ly đặt ở kho dữ liệu, không ở màn]
- Trục ai tạo tài khoản, sàn và thành viên: đội vận hành (AC-9) | quản trị sàn mời — Later, hàng 7 | người lạ tự
  đăng ký — Never theo khuyến nghị Hỏi-4 | tự đăng ký vào sàn — Never
  [thước CE: Kiến trúc §0 «mở công ty mới» thuộc vận hành]
- Trục kênh mã: email (AC-1) | số điện thoại — Later theo Hỏi-1 | Google — Later theo Hỏi-1 [CE chưa kiểm chứng: chờ
  câu trả lời Hỏi-1]

## Đường đo

- bỏ đường-đo — ô cơ hội chưa khai ngưỡng (bốn dòng «…»); không có thước nào để dựng đường (entry d-20261030T021306Z-2)

## Out of scope

- Mời người vào sàn, đặt vai, khu phụ trách, quyền theo vai — hàng 7 `moi-nguoi-vai-khu`.
- Bộ chọn sàn trong vỏ app, cột nhà, thanh trên — hàng 53 `vo-ung-dung`; hàng này chỉ có màn chọn sàn giữa trang.
- Gửi email thật (nhà cung cấp, tên miền gửi) — hàng nơi chạy; bản này chỉ có bộ gửi dev in mã ra nhật ký máy chủ.
- Đăng nhập bằng Google hay số điện thoại + OTP — theo câu trả lời Hỏi-1.
- Quyền hỗ trợ có hạn cho đội vận hành vào dữ liệu một sàn — hàng riêng.
- Khối ReUI `auth-15` cho màn đăng nhập — theo câu trả lời Hỏi-3 (khuyến nghị: việc nhỏ sau khi hàng 4 gộp).

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Bất biến chạm: (1) cách ly giữa công ty — bảng thành viên mới mang luật theo dòng; sàn đang làm chỉ đặt qua một hàm.
  Không nới bất biến nào; (2), (3), (4) không chạm.
- Dãy Q chạy dev ở cổng 3461, Postgres 5545 (`quy-hang-db-Q`).
- Test cần Postgres của API chạy trong `npm run db:test` (job `isolation` của CI) — xem bản thiết kế, mục «Đường chạy test».
