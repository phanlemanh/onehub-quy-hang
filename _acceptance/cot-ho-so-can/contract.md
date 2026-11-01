---
schema_version: 1
feature: Đầu chủ chọn một căn và thấy cột hồ sơ cạnh bảng — thuộc tính tự điền, lần rao, lịch sử giá và trạng thái ai sửa khi nào; thấy thuộc tính sai thì bấm «Báo sai thông tin căn»
slug: cot-ho-so-can
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
design_doc: docs/superpowers/specs/2026-11-01-cot-ho-so-can-design.md
approved_by:
approved_at:
---

# Acceptance Contract: cot-ho-so-can

## Context

Hàng 17 của lộ trình (dãy H, đợt `dau-chu-dong-vao`), đứng trên hàng 14 (Bảng hàng). Mã phạm vi D4 (cột hồ sơ căn:
thuộc tính tự điền, lần rao, lịch sử ai sửa gì) và D5 (báo sai thông tin căn). Màn đầu của nhóm Hồ sơ căn: đi trang ba
lối (ADR-0019) và sinh khuôn nhóm (luật đợt 18). Không đổi máy chủ, lõi hay cơ sở dữ liệu.

Source input: `docs/plan/lo-trinh.json` hàng 17 · `_acceptance/cot-ho-so-can/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-11-01-cot-ho-so-can-design.md` · trang ba lối `_acceptance/cot-ho-so-can/ba-loi/index.html`

Từ ngữ: «mã căn» = mã căn trong danh mục (RESO `UnitNumber`); «căn» = toà + mã căn; «lần rao» = một hàng của sàn trên
căn ấy (Tham chiếu §4); «cột hồ sơ» = hồ sơ căn mở ở cột phải của Bảng hàng; «kho trên máy» như hàng 13.

## Criteria

- AC-1: Given Bảng hàng trên máy tính có căn A (toà T, mã căn M), When đầu chủ bấm dòng của A, Then cột hồ sơ của A mở
  ở bên phải, URL có `?unit=M&toa=T&lan=<lần rao của dòng>`, dòng A được đánh dấu, bảng vẫn cuộn và bấm được; When bấm
  dòng B, Then cột đổi sang B mà không đóng; When bấm «Đóng», Then `unit`, `toa`, `lan` rời URL và cột đóng (tham số khác
  giữ nguyên); When mở thẳng `/inventory?unit=M&toa=T` (tải lại, link chép), Then cột của A mở; `?unit=M` không kèm toà
  mà M có ở hai toà thì cột liệt «Nhiều căn» như AC-7.
- AC-2: Given căn A có trong danh mục, When cột hồ sơ của A mở, Then cột hiện loại căn, diện tích, tầng, hướng, toà, khu,
  loại hình đúng như danh mục cho đúng toà của A (hai toà trùng mã căn không lẫn nhau), không ô nào sửa được; Given căn
  ngoài danh mục, Then phần thuộc tính ghi «Chưa có trong danh mục» và không có nút «Báo sai thông tin căn».
- AC-3: Given căn A có hai lần rao trên máy (một đang mở, một đã ngừng), When cột hồ sơ của A mở từ dòng đang mở, Then
  phần lần rao hiện giá kèm phí, nội thất, pháp lý, tài chính, tình trạng sử dụng và mức đủ «n/5» bằng đúng giá trị trên
  máy (đã gồm thao tác chờ gửi); danh sách «Các lần rao» có hai dòng, mới nhất trên, mỗi dòng trạng thái, giá và ngày bắt
  đầu, dòng đang xem được đánh dấu; When mở từ dòng đã ngừng (hay bấm lần rao ấy trong danh sách), Then phần lần rao và
  lịch sử là của lần rao đã ngừng, đầu phần ghi trạng thái «Ngừng bán»; Given căn không còn lần rao nào đang mở và URL
  không có `lan`, Then cột hiện lần rao mới nhất.
- AC-4: Given lần rao đang mở của A có sự kiện tạo, hai lần đổi giá, một lần đổi trạng thái, một lần đổi phần lần rao,
  một lần xác nhận với chủ nhà do hai người làm, When cột hồ sơ của A mở, Then «Lịch sử» liệt đủ sáu sự kiện, mới nhất
  trên, mỗi dòng nêu việc (đổi giá «a → b», đổi trạng thái «a → b» bằng nhãn tiếng Việt, đổi phần lần rao kèm phần đổi,
  xác nhận, tạo), người («Bạn» khi là người đang xem, còn lại tên vai — theo Hỏi-3) và thời điểm; lịch sử là của lần rao
  đang xem.
- AC-5: Given lịch sử của A đã tải một lần, When mất mạng và mở lại cột của A, Then lịch sử đã tải vẫn hiện kèm dòng
  «đang xem bản trên máy»; Given lịch sử của căn C chưa tải lần nào và đang mất mạng, Then phần lịch sử ghi «Lịch sử cần
  mạng để tải lần đầu» — phần thuộc tính và lần rao vẫn hiện.
- AC-6: Given cột hồ sơ của A (A trong danh mục), When đầu chủ bấm «Báo sai thông tin căn», chọn thuộc tính, gõ giá trị
  đúng và ghi chú rồi bấm «Chép và mở bảng chia sẻ», Then nội dung báo gồm mã căn, toà, khu, tên thuộc tính, giá trị đang
  hiện, giá trị đúng, ghi chú — không có thông tin chủ nhà; máy mở bảng chia sẻ của thiết bị với nội dung ấy, thiết bị
  không có bảng chia sẻ thì chép vào bộ nhớ tạm và báo «Đã chép»; không lời gọi mạng nào phát sinh; nút tắt khi giá trị
  đúng còn trống.
- AC-7: Given mã căn M, When mở `/units/M`, Then hồ sơ của căn M hiện toàn màn với cùng ba phần; Given M có ở hai toà,
  Then trang liệt «Nhiều căn» kèm tên từng toà, chọn toà thì ra đúng một căn; Given M không có trên máy (kể cả hàng «Chỉ
  tôi» của người khác), Then trang ghi «Không có căn này trong Bảng hàng».
- AC-8: Given nhóm màn Hồ sơ căn chưa có khuôn, When vòng này xong, Then `design/patterns/ho-so-can.md` khai khuôn
  `KhungHoSoCan` và nhận diện `/units/[code]/page.tsx`; bài quét khuôn và `npm run lint` xanh; trang tạm `/units/[code]` đã
  rời nhóm trang tạm; trang ba lối có trong hồ sơ với ba lối và lối được chọn ghi trong sổ quyết định.
- AC-9: Given ứng dụng chạy trên máy chủ dev với dữ liệu mẫu, đăng nhập Đầu chủ mẫu, When ở khổ 1440 bấm một dòng của
  Bảng hàng, mở lịch sử, bấm «Báo sai thông tin căn», và ở khổ 375 mở `/units/<mã>`, Then cột hồ sơ đứng cạnh bảng với
  đúng thuộc tính, lần rao, lịch sử như API trả; bảng soạn báo sai mở; khổ 375 một cột đọc được. (cross-layer)

## Coverage

Quét bằng `morphological-scan` (preset entity-feature, đối tượng = một lần mở hồ sơ căn):

- Trục A — đường vào: bấm dòng Bảng hàng · URL `?unit=` · `/units/<mã>` · gõ mã căn.
- Trục B — phần của hồ sơ: thuộc tính · lần rao đang mở · các lần rao · lịch sử · báo sai.
- Trục C — trạng thái dữ liệu: đủ · ngoài danh mục · mã trùng hai toà · không có trên máy · mất mạng có bản · mất mạng
  chưa có bản · có thao tác chờ gửi · không lần rao đang mở · mở từ dòng đã ngừng.
- Trục D — người xem: đầu chủ tạo hàng · người khác cùng sàn.

Core → AC: (A bấm dòng/URL) AC-1 · (B thuộc tính × C đủ/ngoài danh mục/trùng toà) AC-2 · (B lần rao × C chờ gửi/không lần mở/dòng đã ngừng) AC-3 ·
(B lịch sử × D) AC-4 · (B lịch sử × C mất mạng) AC-5 · (B báo sai) AC-6 · (A `/units` × C trùng/không có) AC-7 · khuôn
nhóm AC-8 · mặt người nhìn AC-9. Gõ mã căn đã đi `/units/<mã>` (hàng 53) — phủ bởi AC-7. Later/Never: sửa trên cột, ảnh,
phần chủ nhà, bản điện thoại cho đầu khách — Out of scope.
Thước CE: mỗi ô (B × C) có ít nhất một ca trong evals [CE chưa kiểm chứng bằng đếm ô máy].

## Đường đo

- Tỉ lệ căn ở mức đủ cao nhất (opportunity.md, Tham chiếu §11) — số tính từ mức đủ của lõi trên Bảng hàng, không từ cột
  này; AC-3 bảo đảm cột hiện mức đủ đúng giá trị lõi để đầu chủ thấy chỗ thiếu. Đếm thật là việc của phiên nghiệm thu.
- Tỉ lệ mã căn tự điền được — AC-2 bảo đảm căn ngoài danh mục hiện rõ «Chưa có trong danh mục»; đếm vẫn ở `do-ti-le.ts`.

## Out of scope

- Sửa trên cột (giá, trạng thái, phần lần rao) — hàng 15, 19.
- Ảnh căn ba ngăn — hàng 18.
- Phần chủ nhà và số điện thoại — hàng 62 (lớp `source`).
- Hồ sơ căn trên điện thoại cho đầu khách — hàng 33.
- Tên người sửa khác mình — cột giao «vai», không giao «người» (Hỏi-3): hai đầu chủ khác nhau cùng hiện «Đầu chủ».
- Nhận báo sai trên máy chủ và hàng đợi duyệt của Invest — hàng riêng sau (Kiến trúc §7).

## Notes
