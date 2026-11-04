---
schema_version: 1
feature: Đầu khách chọn căn, xem trước đúng trang khách sẽ thấy, rồi mở bảng chia sẻ của điện thoại với link, ảnh và tin soạn sẵn; người tự bấm gửi trong Zalo
slug: luong-gui
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: implemented
design_doc: docs/superpowers/specs/2026-11-03-luong-gui-design.md
approved_by: Manh Phan
approved_at: 2026-11-04
---

# Acceptance Contract: luong-gui

## Context

Hàng 34 của lộ trình (dãy L, đợt `dau-khach-nhap`), Cổng Đáng: build (Manh Phan 02/11). Đứng trên hàng 32 (Bảng hàng
dạng thẻ, chọn nhiều căn), hàng 31 (luật ẩn `banRaNgoai`, rào cửa ra), hàng 86 (Lần gửi `POST /api/v1/shares`, nhu cầu
khách) và hàng 3 (bài thử Zalo). Không bảng, không migration, không route ra ngoài sàn (luật 39) nên hạng T2. Trang
khách công khai `/s/<mã>` là hàng 35.

Source input: `docs/plan/lo-trinh.json` hàng 34 · `_acceptance/luong-gui/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-11-03-luong-gui-design.md`.

Từ ngữ: «màn Gửi» = `/shares/new`; «bản ra» = kết quả `banRaNgoai` của lõi cho một căn và một người nhận; «khách riêng»
= Lần gửi gắn một nhu cầu khách; «nhóm môi giới» = Lần gửi không gắn khách; «bảng chia sẻ» = `navigator.share` của
thiết bị; «căn mồi» = `canMoi()` của hàng 31.

## Criteria

- **AC-1** (cross-layer) — Given đầu khách đã chọn n căn «Đang bán» trên Bảng hàng thẻ, When nhìn đáy màn, Then thấy thanh
  dính đáy «n căn · Xem trước · Gửi»; bấm Gửi hay Xem trước mở `/shares/new?can=<id…>` với đúng các căn theo thứ tự chọn,
  Xem trước mở thẳng ngăn xem trước; bỏ chọn hết thì thanh biến mất.
- **AC-2** (cross-layer) — Given đầu khách mở màn Gửi, When chọn «Khách riêng», Then danh sách chỉ gồm các nhu cầu khách
  đang mở do chính người ấy giữ (`GET /api/v1/prospects`: không của đầu khách khác, không nhu cầu đã đóng, không số khách,
  không mã liên hệ); vai không phải đầu khách bị 403; chọn «Nhóm môi giới» thì không cần khách.
- **AC-3** (cross-layer) — Given khách chưa có trong danh sách, When đầu khách bấm «Khách mới» và nhập tên, số, Mua/Thuê,
  Then một nhu cầu khách mới được tạo qua `POST /api/v1/prospects` của hàng 86 và được chọn làm người nhận, không rời màn
  Gửi (Hỏi-2); thân lời gọi «Khách mới» và «Gửi» do hàm dựng ở lõi (`packages/core/src/sharing/tin.ts`) sinh ra, và chính
  thân ấy được API thật nhận (201).
- **AC-4** — Given người nhận đã chọn, When mở Xem trước, Then ngăn toàn màn dựng trang khách từ đúng bản ra của người nhận
  ấy: khách riêng không có mã căn, trục, tầng số (chỉ toà và nấc tầng khi có); nhóm môi giới có mã căn; giá, điều kiện
  phí, tuổi xác nhận, ảnh, tên sàn, người gửi theo bản ra; đổi người nhận thì xem trước đổi theo.
- **AC-5** — Given mọi người nhận và mọi cấu hình luật ẩn của hàng 31, When dựng trang xem trước, tin soạn sẵn và gói chia
  sẻ (tin, tên tệp ảnh) từ căn mồi, Then `timRoRi` không bắt giá trị nội bộ hay nguồn nào trong cả ba; trang dưới
  `/shares/new` có bài rò rỉ cạnh nó nên `timCuaRaThieuKiem` sạch.
- **AC-6** — Given người nhận và căn đã chọn, When màn Gửi mở, Then tin soạn sẵn dựng từ bản ra theo mẫu mặc định ở lõi
  (`packages/core/src/sharing/tin.ts`, Hỏi-3), có chỗ cho link, người sửa được trước khi gửi; khách riêng không thấy mã
  căn trong tin.
- **AC-7** (cross-layer) — Given có mạng và người bấm Gửi, When máy xử lý, Then máy tạo đúng một Lần gửi qua
  `POST /api/v1/shares` (người nhận, nhu cầu khách khi khách riêng, căn theo thứ tự), rồi mở bảng chia sẻ một lần với tin
  chứa link `<gốc>/s/<mã>` trong thân tin và ảnh bìa các căn (ảnh ngăn gửi được, một ảnh mỗi căn, tối đa 10 tệp — Hỏi-3);
  máy không gọi thêm lời gửi nào khác; bấm Gửi lần nữa trong lúc đang tạo link không tạo Lần gửi thứ hai; Lần gửi ấy là sự
  kiện «gửi được căn» của số đo (Hỏi-1).
- **AC-8** — Given thiết bị không có bảng chia sẻ hay bảng chia sẻ báo không hỗ trợ tệp, When người bấm Gửi, Then màn
  thành «Chép tin» chép tin có link; chép không được thì hiện tin để chọn và chép tay; người huỷ bảng chia sẻ thì màn
  không báo lỗi và Lần gửi vẫn ghi.
- **AC-9** — Given mất mạng, When ở màn Gửi, Then Gửi mờ với chữ «Gửi cần mạng» và không tạo Lần gửi; chưa chọn người nhận
  (hay Khách riêng mà chưa chọn khách) thì Gửi mờ với chữ «Chọn người nhận»; căn quá 14 ngày chưa xác nhận mang nhắc «Gọi
  xác nhận trước» (vẫn gửi được); căn không còn «Đang bán» bị loại khỏi lần gửi kèm lý do; không còn căn thì không gửi
  được; tạo link lỗi thì báo lỗi tiếng Việt và giữ nguyên người nhận, căn, tin.
- **AC-10** — Given màn Gửi là màn đầu của nhóm Gửi (luật đợt 18), When chạy lưới giao diện, Then có
  `design/patterns/gui.md` khai bố cục «Luồng nhiều bước», nhận diện `apps/web/src/app/(app)/shares/new/**`, màn mẫu là
  màn Gửi; `npm run lint` (quy-hang-ui, mức nợ trần 0) xanh và Tham chiếu §10 ghi luồng Gửi «Đã dựng (hàng 34)».

## Coverage

Quét `morphological-scan` preset entity-feature trên «luồng Gửi»: trục **bước** (chọn · người nhận · xem trước · tin ·
chia sẻ · dự phòng) × **người nhận** (khách riêng · nhóm môi giới · khách mới) × **trạng thái máy** (có mạng · mất mạng ·
không có bảng chia sẻ · huỷ bảng) × **căn** (đang bán · quá 14 ngày · không còn bán) × **dữ liệu ra** (trang · tin ·
gói chia sẻ). Core → AC-1…AC-10; Later/Never → Out of scope. Thước CE: mỗi ô (bước × người nhận) có ít nhất một AC; ô dữ
liệu ra × người nhận phủ bởi AC-5 trên ma trận đủ `CUA_RA × NGUOI_NHAN × CAU_HINH_TAT_CA` của hàng 31.

## Đường đo

- «Thời gian khách hỏi → gửi được căn» (Tham chiếu §11): khách hỏi = sự kiện `inquiry_received` của hàng 86; gửi được căn =
  Lần gửi tạo lúc bấm Gửi (`shares.created_at`, `prospect_id`) — AC-7 bảo đảm mỗi lần bấm Gửi đúng một Lần gửi, AC-3 cho
  khách mới đi trọn đường đo trong một màn. Nối số đo vào `packages/core/src/metrics` (hàng 52 đã gộp, đang báo «chưa có
  sự kiện») là việc của giám sát (luật 35) — ghi ở Notes.
- «Số link khách mở, số lượt quan tâm»: hàng 35 ghi; hàng này cho mỗi link một Lần gửi để đếm.

## Out of scope

- Trang khách công khai `/s/<mã>` và route đọc công khai (hàng 35, mang rào route — luật 39); link gửi đi chưa mở được
  trang tới khi 35 gộp.
- Đã gửi, lượt mở, lượt quan tâm (hàng 35, 36).
- Chọn căn trên lưới Bảng hàng máy tính; che vùng ảnh trước khi gửi; nấc tầng khi danh mục chưa có số tầng toà.
- Mẫu tin và trần ảnh do sàn chỉnh (màn Cài đặt sàn 45–49).
- Tích hợp gửi tin, đăng nhóm, tự trả lời (bất biến 3).

## Notes

- Bất biến chạm: 3 (người bấm gửi), 4 (phần nội bộ không ra trang khách). Không bảng mới, không đổi lớp dữ liệu.
- Hỏi-4 (người nhận giữ cứng hai loại) và Hỏi-5 (lối vào Gửi trước khi trang khách 35 gộp) ở thiết kế.
- Giới hạn đã khai (chủ kho chốt 04/11 sau lượt chấm 2): bước chấm khuôn của kit 2.37.0 không xét `ngoai_le`, nên trang
  Gửi mới bị báo «thuộc hai nhóm màn: gui, trang-tam» (kit#480). E12 chấp nhận mã 1 chỉ khi E13 xanh — E13 bảo đảm đó là
  dòng lệch duy nhất, lệch khác vẫn đỏ. Kit vá thì bỏ mã 1 ở E12 và bỏ E13.
- Chủ kho thử thật trên điện thoại (mở bảng chia sẻ, dán vào Zalo) đi qua yêu cầu `can-nguoi` gom cùng hàng 35 (luật đợt 16).
