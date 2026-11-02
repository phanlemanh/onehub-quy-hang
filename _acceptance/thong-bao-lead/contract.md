---
schema_version: 1
feature: Đầu chủ nhận thông báo lead trên điện thoại và máy tính, chạm vào thì mở đúng mục ở Hôm nay
slug: thong-bao-lead
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, db, ui]
status: draft
design_doc: docs/superpowers/specs/2026-11-02-thong-bao-lead-design.md
---

# Acceptance Contract: thong-bao-lead

## Context

Hàng 26 của lộ trình (dãy L, đợt `dau-chu-dong-vao`), Cổng Đáng: build (Manh Phan 31/10). Đứng trên hàng 22 (Hôm nay của
đầu chủ) và 25 (chia lead, ADR-0017). Thêm một bảng có luật theo dòng nên hạng T3 (lộ trình ghi T2). Kiến trúc §5 chọn Web
Push; §7 hẹn hướng dẫn cài cho iPhone.

Source input: `_acceptance/thong-bao-lead/opportunity.md` · `docs/plan/lo-trinh.json` hàng 26 · Kiến trúc §5, §7 · ADR-0017
quyết định 9 (Hỏi-6) · thiết kế `docs/superpowers/specs/2026-11-02-thong-bao-lead-design.md`

Từ ngữ: «đăng ký» = một thiết bị đã cho phép nhận thông báo của một người trong một sàn; «lead về đầu chủ» = lead được gán
đầu chủ bằng nhịp chia, trưởng nhóm giao, hay lúc nhập (khớp đầu chủ giữ chủ nhà hay căn); «dải bật» = dải trạng thái đầu
khung Hôm nay.

## Criteria

- AC-1: Given đầu chủ hay trưởng nhóm mở Hôm nay trên trình duyệt hỗ trợ đẩy, chưa bật, khoá đã sẵn (máy chủ tự sinh), When bấm
  «Bật thông báo» và cho phép, Then thiết bị đăng ký với dịch vụ đẩy và máy chủ lưu một đăng ký gắn người và sàn; dải bật biến
  mất; cùng thiết bị bật lại không sinh dòng thứ hai; gỡ (`DELETE`) và đăng xuất xoá đúng đăng ký ấy; máy chủ không dựng được
  khoá thì dải báo «Thông báo chưa được cấu hình», không nút; từ chối quyền thì một dòng «Thông báo đang tắt trong trình duyệt».
- AC-2: Given bảng đăng ký, When đọc lược đồ và gọi bằng vai API, Then bảng bật và ép luật theo dòng; người chỉ đọc, thêm,
  xoá đăng ký của chính mình trong sàn đang làm; người khác cùng sàn, sàn khác đều không đọc được; đối chứng: chính người đọc
  được đăng ký của mình.
- AC-3: Given đầu chủ có đăng ký, When lead về đầu chủ ấy bằng nhịp chia, trưởng nhóm giao, hay nhập (kể cả gửi lại) khớp
  đầu chủ, Then sau khi việc giao đã ghi, mỗi đăng ký của đúng đầu chủ ấy nhận một thông báo; tự nhận từ kho chung không gửi;
  việc giao quay lui thì không gửi; lỗi gửi không làm hỏng việc giao; lỗi tạm thì nhịp chia sau gửi lại (tối đa ba lần trong
  15 phút).
- AC-4: Given một thông báo lead, When dựng nội dung, Then chỉ có tiêu đề «Lead mới», toà, nhu cầu (Bán · Cho thuê · Cả hai)
  và đường mở `/today?lead=<id>`; không số, không tên chủ, không giá, không mã căn.
- AC-5: Given dịch vụ đẩy trả 404 hay 410 cho một đăng ký, When gửi, Then đăng ký ấy bị xoá; lỗi khác giữ đăng ký và ghi lần
  hỏng; các đăng ký khác của cùng người vẫn nhận.
- AC-6: Given đầu chủ chạm thông báo, When Hôm nay mở `/today?lead=<id>`, Then nhóm chứa lead mở ra, dòng `lead:<id>` được
  chọn và cuộn vào tầm nhìn (chạm thông báo mở hay đưa lên trước cửa sổ có đúng đường ấy); lead không còn trong danh sách của người ấy thì hiện một dòng «Lead này không còn ở Hôm nay của
  bạn».
- AC-7: Given iPhone mở web bằng Safari mà chưa cài lên màn hình chính, When vào Hôm nay, Then dải bật thay nút bằng hướng
  dẫn cài (Chia sẻ → Thêm vào MH chính); web có manifest, biểu tượng và service worker đăng ký ở gốc.
- AC-8: Given trưởng nhóm có đăng ký, When nhịp chia ghi một lời báo mới (`unrouted`, `accept_overdue`, `first_call_overdue`),
  Then trưởng nhóm nhận một thông báo nêu loại lời báo và toà, mở `/today`; nội dung theo cùng luật AC-4.
- AC-9: Given máy chủ chưa có khoá VAPID, When thông báo được dùng lần đầu (kể cả hai lần đầu chạy song song), Then máy chủ tự
  sinh đúng một cặp khoá; khoá riêng chỉ nằm ở dạng bản mã, giải được bằng khoá con suy từ khoá mã hoá đã có; vai API không đọc
  được bảng khoá; không thêm biến môi trường; Tham chiếu ghi thông báo lead, ADR-0025 ghi lựa chọn Web Push, nội dung không
  mang lớp nguồn và lối khoá không người cầm.

## Coverage

Bỏ quét coverage có tên — không gian AC lấy từ ba lối giao lead đã kê ở ADR-0017 và kiến trúc §7 (dòng `descope`
«bỏ coverage-scan»). Trục đã phủ: lối giao (AC-3) · thiết bị (AC-1, AC-7) · người nhận (AC-3, AC-8) · rò (AC-2, AC-4) · hỏng
(AC-5) · mở (AC-6) · khoá và tài liệu (AC-9).

## Đường đo

- Thời gian lead → cuộc gọi đầu (opportunity.md, Tham chiếu §11): mốc giao `leads.routed_at` và mốc gọi đầu
  `leads.first_called_at` đã có (hàng 25, 27); hàng này thêm mốc gửi `push_outbox.sent_at` (AC-3) để tách phần thông báo.
  Ngưỡng số và timebox: Hỏi-4 (khuyến nghị trung vị ≤ 5 phút, timebox hai tuần thử) — chủ kho chốt, máy ghi vào
  `opportunity.md`.

## Out of scope

- Tab «Tôi» trên điện thoại (bật thông báo, cài, đăng xuất) — hàng `tab-toi`.
- Thông báo cho đầu khách, telesales, quản trị; nhắc hạn gọi cho chính đầu chủ; chuông trong app — hàng sau.
- Zalo OA — cần quyết định riêng (Kiến trúc §8).
- Màn lời báo của trưởng nhóm — hàng 42.
- Thử trên điện thoại thật — phiên nghiệm thu, không phải bài chấm máy.

## Notes

- Không ai cầm khoá: máy chủ tự sinh khoá VAPID, khoá riêng mã hoá bằng khoá con của `OWNER_PHONE_KEY` đã có trên Vercel
  (giám sát 02/11, luật chủ kho «máy không tạo, đọc, chép hay chuyển khoá bí mật»).
- Giám sát cấp (02/11): migration `018_thong_bao_lead.sql`, ADR-0025.
