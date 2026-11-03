---
schema_version: 1
feature: Người dùng điện thoại cài Quỹ hàng lên màn hình chính, bật thông báo; đăng xuất hay báo mất máy thì dữ liệu trên máy bị xoá sạch
slug: tab-toi
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api, db]
status: draft
design_doc: _acceptance/tab-toi/design.md
---

# Acceptance Contract: tab-toi

## Context

Hàng 38 của lộ trình (dãy H, đợt `dau-khach-nhap`), mã phạm vi K9; đứng trên hàng 13 (kho trên máy, đăng xuất xoá),
26 (thông báo lead), 53 (vỏ, tab Tôi). Luật 32 và Kiến trúc §7–§8. Khối đích `settings-2` (vo-va-ia.md). Hàng lộ trình
khai T2; hồ sơ là T3 vì thêm một migration (bảng dấu máy bị báo trong schema `identity`, số do giám sát giữ chỗ — yêu cầu
H-6). Thiết kế và hai câu chỉ người quyết: `design.md` §3 (Hỏi-1), §4 (Hỏi-2). Hợp đồng viết theo khuyến nghị.

## Criteria

- AC-1: Given người đã đăng nhập ở bất kỳ vai nào (đầu chủ, đầu khách, trưởng nhóm, telesales, quản trị sàn), When mở
  tab Tôi trên điện thoại hay «Tôi» từ menu tài khoản trên máy tính, Then màn hiện sáu nhóm dòng theo thứ tự: hồ sơ
  (email đăng nhập), sàn đang làm (có «Đổi sàn» khi người thuộc từ hai sàn), cài lên màn hình chính, thông báo lead, máy
  đang đăng nhập, đăng xuất; không còn trang chỗ giữ.
- AC-2: Given thiết bị ở mỗi trạng thái cài — đang chạy từ màn hình chính; trình duyệt đã phát lời mời cài; iPhone hay
  iPad trên Safari chưa cài; trình duyệt khác — When mở tab Tôi, Then dòng cài hiện lần lượt «Đã cài»; nút «Cài» mở lời
  mời cài của trình duyệt; ba bước cài của Safari; «Mở bằng Chrome hay Safari để cài» — mỗi trạng thái đúng một cách hiện.
- AC-3: Given thiết bị ở mỗi trạng thái thông báo mà dải bật Hôm nay phân loại (chưa bật, đã bật, máy chủ chưa lưu,
  từ chối, iPhone chưa cài, không hỗ trợ, máy chủ chưa cấu hình), When mở tab Tôi, Then dòng thông báo nói đúng trạng
  thái ấy bằng cùng hàm phân loại; «chưa bật» có nút «Bật», bấm thì xin quyền và lưu đăng ký như dải bật.
- AC-4: Given người còn n thay đổi chưa gửi (n ≥ 0), When bấm «Đăng xuất» ở tab Tôi, Then đi đúng đường đăng xuất đã có:
  n > 0 thì hỏi nói đúng n; đồng ý (hay n = 0) thì kho của người trên máy bị xoá, đăng ký thông báo của máy này bị gỡ ở
  máy chủ, phiên kết thúc và màn về đăng nhập; kho của người khác trên cùng máy không bị đụng.
- AC-5: Given người có các phiên còn sống trên k máy (k ≥ 1), When mở tab Tôi, Then dòng máy đang đăng nhập liệt đúng k
  máy, mỗi máy có loại máy (iPhone · Android · máy tính · máy khác) và lần dùng gần nhất, máy đang xem mang «Máy này»;
  danh sách không có phiên của người khác; k = 1 thì không có nút «Báo mất máy».
- AC-6: Given người có phiên trên máy A (đang bấm) và các máy B, C, mỗi máy một đăng ký thông báo, người là thành viên
  hai sàn, When bấm «Báo mất máy» rồi xác nhận trên A, Then phiên của B, C bị thu, đăng ký thông báo của B, C bị gỡ ở cả
  hai sàn, đăng ký của A còn nguyên, A vẫn đăng nhập và danh sách chỉ còn «Máy này»; phiên và đăng ký của người khác
  không bị đụng; mỗi phiên bị thu có dấu «máy bị báo» lưu bằng băm của mã phiên, không lưu mã thật.
- AC-7 (cross-layer): Given máy B vừa bị báo mất, trình duyệt B có kho của người bị báo (bản kéo, lịch sử, thay đổi chưa
  gửi) và kho của một người khác, When B chạm máy chủ lần đầu — điều hướng tới một trang trong vỏ mang cookie phiên cũ, hay
  bộ đồng bộ gửi hoặc kéo — Then máy chủ trả 401 kèm mã `device_reported_lost`, đích cuối là màn đăng nhập với lời «Máy này
  đã bị báo mất — dữ liệu Quỹ hàng trên máy đã xoá», kho của người bị báo không còn (kể cả thay đổi chưa gửi), kho của
  người khác còn nguyên (Hỏi-4), đăng ký thông báo trên trình duyệt bị huỷ; đăng nhập lại trên B bằng mã email thì dùng
  bình thường.
- AC-8: Given phiên trên máy hết hạn hay bị xoá không qua «Báo mất máy», When bộ đồng bộ gửi hay kéo, Then máy chủ trả 401
  không mang `device_reported_lost`, và hành vi của dong-bo-tu-lanh AC-2 giữ nguyên: thay đổi chờ ở lại hàng đợi, chỉ báo
  «Hết phiên», gửi tiếp khi đăng nhập lại — không kho nào bị xoá.
- AC-9: Given migration mới của bảng dấu, When chạy `npm run db:migrate` và bộ kiểm cách ly, Then bảng nằm ở schema
  `identity`, vai API của công ty (`quy_hang_app`) không đọc không ghi được bảng; hạn của dấu bằng lúc thu cộng hạn phiên
  đọc từ cấu hình phiên của danh tính (không chép số), nên không phiên bị thu nào sống lâu hơn dấu của nó; dấu quá hạn
  không còn làm máy bị xoá; bộ kiểm cách ly có một ca đỏ khi cấp quyền bảng cho `quy_hang_app`.
- AC-10: Given máy B, C bị báo từ A, B có đăng ký thông báo và service worker đang cài, C không bật thông báo, When máy chủ
  xử lý «Báo mất máy», Then máy chủ đẩy tin «xoá máy» (tag `xoa-may`, mang mã người bị báo) tới đăng ký của B TRƯỚC khi
  gỡ nó; service worker của B nhận tin thì xoá kho của người bị báo và hiện thông báo «Quỹ hàng đã đăng xuất trên máy này»
  mà không cần mở trang (Hỏi-3); C không nhận gì và đi đường AC-7; tin gửi hỏng không chặn việc thu phiên và gỡ đăng ký.

## Coverage

Quét theo khuôn entity-feature của `morphological-scan`. Chân sản phẩm `[SUY-TỪ-REPO: docs/product/tham-chieu.md]`
(luật 32), `[SUY-TỪ-REPO: docs/architecture/kien-truc-repo-va-stack.md]` (§7, §8), `[SUY-TỪ-REPO: docs/design/vo-va-ia.md]`
(dòng Tôi, khối `settings-2`); chân ngành `[NGÀNH: Google Account «Your devices»; WhatsApp «Linked devices»; Slack, Notion
«Log out of all other sessions»]`.

- Trục A — thiết bị: iPhone/iPad Safari · Android Chrome · máy tính · đã cài từ màn hình chính. `[thước CE: Kiến trúc §7]`
- Trục B — việc trên màn: xem hồ sơ/sàn · cài · bật thông báo · xem máy · báo mất máy · đăng xuất. `[thước CE: vo-va-ia
  dòng Tôi + câu giao]`
- Trục C — cách phiên kết thúc: đăng xuất trên máy · báo mất từ máy khác · hết hạn thường. `[thước CE: luật 32 +
  dong-bo-tu-lanh AC-2]`
- Trục D — vai: đầu chủ · đầu khách · trưởng nhóm · telesales · quản trị sàn. `[thước CE: vo-va-ia dòng 51–52]`

Core → AC: (A × cài) AC-2 · (A × thông báo) AC-3 · (B màn) AC-1 · (B máy) AC-5 · (C đăng xuất) AC-4 · (C báo mất) AC-6,
AC-7, AC-10 · (C hết hạn) AC-8 · (lưu dấu) AC-9 · (D) AC-1.
Later: chọn từng máy để báo mất (Hỏi-1 lối khác); quản trị sàn báo mất máy thay thành viên; sửa tên hiển thị ở hồ sơ.
Never: xoá dữ liệu trên máy không bật thông báo và không bao giờ chạm máy chủ — web không có đường nào tới máy ấy (giới
hạn đã biết).

## Đường đo

- Ngưỡng ở `opportunity.md` đo trong hai tuần thử (Tham chiếu §11): số lần mất mạng, tỉ lệ thao tác theo thiết bị — không
  thước nào của hàng này; hàng này bảo đảm đường cài và bật thông báo có mặt trên điện thoại (AC-2, AC-3) để số đo thử có
  người dùng điện thoại đã cài.

## Out of scope

- Chọn từng máy để báo mất, đặt tên máy — sau bản đầu (Hỏi-1).
- Quản trị sàn thu phiên của thành viên, gỡ thành viên khỏi sàn — hàng cài đặt sàn.
- Sửa email, tên hiển thị, ảnh đại diện; sáng/tối ở tab Tôi (menu tài khoản máy tính đã có) — sau bản đầu.
- Xoá dữ liệu trên máy không bật thông báo và không bao giờ mở lại — không làm được trên web; chờ vỏ app gốc (Kiến trúc
  §9 bước 7).
- Dải bật thông báo ở Hôm nay và lời hướng dẫn cài lúc đăng nhập đầu — giữ như hàng 26, không đổi.

## Notes

- Hỏi-1 … Hỏi-4: `design.md` §3, §4; sổ quyết định. Hỏi-3, Hỏi-4 sinh từ phản biện context sạch (`gap-probe.md`).
