---
schema_version: 1
feature: Đầu chủ chụp ảnh khi đi xem nhà ngay trên điện thoại và ảnh vào đúng ngăn của căn, tải lên ở nền
slug: chup-anh-dien-thoai
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
design_doc: _acceptance/chup-anh-dien-thoai/design.md
---

# Acceptance Contract: chup-anh-dien-thoai

## Context

Hàng 41 của lộ trình (dãy H, đợt `dau-khach-nhap`), T2: không migration, không đổi trần lớp dữ liệu, thoả thuận hay
`packages/connect`; có đổi nhỏ ở API ảnh (`packages/api/src/photos`, nhận mã ảnh của máy khách). Ô cơ hội: `opportunity.md`
(chủ kho «build» 05/11). Đứng trên hồ sơ căn điện thoại (`ho-so-dien-thoai-product-detail-5`) và mục Ảnh (hàng 18, ADR-0014).
Hỏi-1 (ảnh chờ trên máy khi mất mạng, kể cả ngăn Nội bộ) quyết ở Cổng Phạm vi; AC-4, AC-6 viết theo khuyến nghị của máy.

## Criteria

- AC-1 (cross-layer): Given một người mở hồ sơ căn trên điện thoại (dưới 768 px), When căn có mã và API ảnh trả
  `suaDuoc: true` cho người ấy (đầu chủ giữ căn, trưởng nhóm), Then ảnh lớn đầu màn có nút «Chụp ảnh»; When người không thấy
  nguồn (đầu khách, đầu chủ không giữ) hay căn chưa có mã, Then không có nút; và máy chủ từ chối thêm ảnh của người ấy dù gọi
  thẳng API — màn chỉ đọc cờ API, không tự quyết quyền.
- AC-2 (cross-layer): Given ngăn «Chụp ảnh» đang mở, When người chọn ngăn rồi chụp, Then ảnh vào đúng toà + mã căn và đúng ngăn
  đang chọn lúc chụp (mặc định «Gửi được»; «Nội bộ» chỉ có khi API trả `noiBo: "thay"`); đổi ngăn sau khi chụp không đổi ngăn
  của ảnh đã chụp; ảnh lên máy chủ mang đúng ngăn ấy.
- AC-3: Given ảnh vừa chụp, When ảnh qua kiểm tệp của lõi, Then ảnh vào hàng chờ ngay (người không phải chờ tải), máy tải ở nền
  theo thứ tự chụp kể cả khi người đóng ngăn hay rời hồ sơ; mỗi ảnh mang một trong bốn trạng thái «Chờ mạng» · «Đang tải lên» ·
  «Đã tải lên» · «Không tải được — thử lại» (kèm «Thử lại»); một ảnh lỗi không chặn ảnh sau; tệp hỏng không vào hàng chờ và báo
  lý do.
- AC-4 (cross-layer): Given máy mất mạng, When người chụp N ảnh, Then cả N ảnh nằm chờ trên máy, giữ qua tải lại trang và
  đóng mở app; When có mạng lại (sự kiện mạng hay nhịp thử 15 giây), Then máy tự tải đủ N ảnh, không mất ảnh nào; gửi lại sau
  khi mất phản hồi không sinh ảnh thứ hai (mã ảnh tạo lúc chụp, máy chủ nhận mã của máy khách ở cả hai bản kho; trả 409 thì
  máy đối chiếu danh sách ảnh của căn).
- AC-5 (cross-layer): Given ảnh chụp vào ngăn «Nội bộ» (sổ đỏ, giấy tờ), When ảnh đã lên máy chủ, Then ảnh thuộc lớp `source`
  theo lõi; người không thấy nguồn không thấy ảnh ấy trong danh sách ảnh và không đọc được byte của nó; trang khách, link gửi và
  bộ kiểm rò rỉ không có ảnh ấy — ẩn ở lõi, API và luật theo dòng, không ở giao diện (bất biến 2, 4).
- AC-6: Given ảnh «Nội bộ» đang chờ trên máy, When máy chủ xác nhận ảnh, Then bản trên máy bị xoá ngay; When người đăng xuất
  hay máy bị báo mất, Then mọi ảnh chờ (cả hai ngăn) bị xoá cùng kho đồng bộ; ảnh chờ nằm trong kho riêng của người chụp, không
  vào kho đồng bộ, không hiện cho người khác trên cùng máy.
- AC-7: Given ảnh chụp trong app, When ảnh lên máy chủ, Then ngày chụp của ảnh (nhãn «Ảnh thật · ngày») là ngày trong tệp, vắng
  thì ngày lúc chụp trên máy — ảnh chờ mạng qua đêm không mang ngày tải lên.
- AC-8: Given một ảnh của căn vừa «Đã tải lên», When người đang ở hồ sơ căn ấy, Then ảnh lớn đầu màn và mục Ảnh đọc lại danh
  sách và có ảnh mới, giữ ảnh cũ trên màn tới khi có danh sách mới (đóng Ngoài-3 của hồ sơ trước cho đường chụp).
- AC-9: Given mã của tính năng, When chạy lint, bộ kiểm giao diện và lưới khuôn, Then ngăn chụp đi qua `NganNoi` (không
  Sheet/Drawer trực tiếp), báo trạng thái qua `TrangThai`, nằm trong khuôn `KhungHoSoCan` của nhóm `ho-so-can`; không mã màu
  thô; bảng viết trước của bản đồ khuôn ghi tệp mới.
- AC-10: Given bản đang chạy với căn mẫu, When mở ở 375×812 cho đầu chủ giữ căn và cho đầu khách, Then ảnh thấy: nút «Chụp
  ảnh» trên ảnh lớn (đầu chủ) và không có (đầu khách); ngăn chọn ngăn; ba ảnh «Chờ mạng» kèm khối «Mất mạng» khi chặn mạng;
  «Đã tải lên» sau khi mở mạng; ảnh lớn có ảnh mới; mỗi cảnh một ảnh.

## Out of scope

- Tải sau khi đóng hẳn app (Background Sync) — Safari iOS không có; mở lại app thì hàng chờ tải tiếp.
- Tự nhận diện ảnh sổ đỏ, tự che mặt, biển số — chưa làm ở hàng gửi; người chọn ngăn.
- Sửa, xoá, sắp xếp, đặt bìa ảnh trong ngăn chụp — vẫn ở mục Ảnh.
- Chụp ảnh trên máy tính; nhận ảnh chia sẻ từ Zalo trên điện thoại (đường phụ của Tham chiếu).
- Ghi thiết bị và «làm lúc mất mạng» cho sự kiện ảnh (Tham chiếu: lead, liên hệ, ảnh chưa ghi thiết bị).

## Đường đo

Ô cơ hội có ngưỡng; mỗi thước một dòng — số từ đâu, AC nào bảo đảm:
- Ảnh vào đúng ngăn của căn (đích 100%): số ảnh có `building_name`, `unit_number`, `compartment` khớp căn và ngăn lúc chụp /
  số ảnh chụp — đếm ở bài kiểm E2 và trên chỗ thử E11 (`unit_photos` + `unit_photo_events` loại `added`); UAT: đầu chủ đếm ở
  mục Ảnh. AC-2.
- Không mất ảnh khi mất mạng (đích 0 ảnh mất): số khoá trong hàng chờ lúc chụp − số ảnh lên máy chủ sau khi có mạng — đếm ở bài
  kiểm E4 và trên chỗ thử E12 (đếm dòng `unit_photos` của căn trước/sau); UAT: chụp N ảnh ở chế độ máy bay, mở mạng, đếm N. AC-4.
- Không ảnh trùng khi gửi lại (đích 0): số dòng `unit_photos` mỗi mã ảnh máy khách — E12. AC-4.
- Ảnh sổ đỏ không ra ngoài (đích 0 mồi): số phản hồi chứa mã ảnh Nội bộ khi đầu khách mở hồ sơ, trang khách `/s/<mã>` —
  E12, bộ kiểm rò rỉ `npm run test:ro-ri`. AC-5.
- Không phải chờ tải (đích: ảnh hiện trong «Ảnh vừa chụp» ngay sau khi chụp, trước khi lời gọi mạng nào xong) — E3. AC-3.

## Coverage

Quét không gian tiêu chí năm trục (skill `morphological-scan`, preset entity-feature):
- Vai theo cờ API: sửa được (giữ căn, trưởng nhóm) · không sửa (đầu khách, đầu chủ không giữ) · căn chưa mã → AC-1.
- Ngăn: Gửi được · Nội bộ (có / không có theo cờ) → AC-2, AC-5, AC-6.
- Mạng: có · mất trước khi chụp · mất giữa lúc tải · mất phản hồi sau khi máy chủ ghi · có lại → AC-3, AC-4.
- Vòng đời ảnh chờ: chụp · chờ · đang tải · đã tải · lỗi · thử lại · đóng app · đăng xuất / máy bị báo mất → AC-3, AC-4, AC-6.
- Dữ liệu ảnh: có EXIF · không EXIF · tệp hỏng / quá cỡ → AC-3, AC-7.
- Hiển thị: ngăn chụp · ảnh lớn · mục Ảnh · khuôn, lint → AC-8, AC-9, AC-10.
Thước đủ (CE): mỗi ô vai × căn có mã của AC-1, mỗi ô ngăn × đổi ngăn của AC-2, mỗi ô mạng × vòng đời của AC-3/AC-4 là một ô
ma trận viết trước trong bài kiểm. Later/Never: Background Sync, nhận diện sổ, ghi thiết bị cho ảnh → Out of scope.

## Notes

- Lựa chọn máy đã quyết: `design.md` §4; sổ quyết định dòng S1. Câu chỉ người: Hỏi-1.
- Đổi điều đang đúng → sửa `docs/product/tham-chieu.md` §12 (dòng 01/11 Ảnh căn ba ngăn, «thêm ảnh cần mạng», «Nội bộ không
  lưu trên máy») và luật khuôn KH-hs-anh-noi-bo trong cùng PR (luật đợt 6).
- Vùng mã thật khác ranh giới cũ ở `hang-viec.json` (`apps/web/src/app/units/mobile/photos/**` không tồn tại) → `cham-tep` ở
  Cổng Phạm vi cho `apps/web/src/app/(app)/units/{photos,ho-so}/**`, `apps/web/src/lib/sync/may-bi-bao.ts`,
  `packages/api/src/photos/**`, `design/patterns/ho-so-can.md`, `packages/ui-lint/tests/ban-do-khuon.test.mjs`.
- Bản bấm được của bước thiết kế đã dựng thẳng trong hồ sơ thật (hàng chờ trong bộ nhớ); kho trên máy, mã ảnh chống trùng và
  xoá khi đăng xuất là phần của bước dựng.
