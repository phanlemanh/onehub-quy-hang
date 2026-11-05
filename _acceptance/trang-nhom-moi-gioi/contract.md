---
schema_version: 1
feature: "Hàng 44: Môi giới sàn khác mở link bảng hàng và thấy đủ mã căn, phí theo tên chuẩn kèm định nghĩa của sàn, mức chia của bộ; tải Excel hay ảnh bảng hàng được"
slug: trang-nhom-moi-gioi
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui]
status: approved
design_doc: docs/superpowers/specs/2026-11-06-trang-nhom-moi-gioi-design.md
approved_by: Manh Phan
approved_at: 2026-11-06
---

# Acceptance Contract: trang-nhom-moi-gioi

## Context

Lần gửi cho nhóm môi giới (`audience = agents`) hiện dùng chung trang khách dạng thẻ cho điện thoại. Hàng 44 cho nhóm môi giới
một trang bảng chỉ đọc trên máy tính, cùng link `/s/<mã>`. Trang có phí theo tên chuẩn kèm định nghĩa của sàn và mức chia
của bộ: mức chia lấy mặc định của sàn, người gửi sửa theo bộ, sàn ẩn được (chốt 29/10). Môi giới tải được Excel hay ảnh với
đúng các cột của bảng. Mọi thứ trên trang dựng từ luật ẩn ở lõi (bất biến 4). Hạng T3 vì có migration 048, chỉ thêm, trên
`packages/db`. Thiết kế: `docs/superpowers/specs/2026-11-06-trang-nhom-moi-gioi-design.md`. Dữ liệu mẫu: `[Tên]`,
`0900 000 0xx`.

## Criteria

- **AC-1 — Mở link nhóm môi giới thấy bảng.** (cross-layer) Given một Lần gửi cho nhóm môi giới có ba căn còn bán · When
  mở `/s/<mã>` không đăng nhập · Then thấy tên sàn và người gửi, cùng một bảng chỉ đọc: mỗi căn một dòng theo thứ tự gửi,
  cột đúng bằng danh sách cột ra của nhóm môi giới ở lõi, có đủ mã căn. Căn đã cọc hay đã bán trong bộ hiện dòng mờ, giá theo
  đúng luật giá ra của `banRaNgoai` (không giá với căn đã bán). Một Lần gửi cho khách riêng vẫn mở trang khách dạng thẻ như
  cũ.
- **AC-2 — Phí theo tên chuẩn kèm định nghĩa của sàn.** (cross-layer) Given sàn đặt `fee.inclusion` gồm một tập khoản
  · When môi giới mở trang · Then:
  - cột phí hiện nhãn Bao phí / Không bao phí theo cách gọi của sàn;
  - đầu trang ghi định nghĩa của sàn, kể đúng các khoản trong tập đó;
  - định nghĩa chụp lúc gửi (hiệu lực «mới» của điểm #8): sàn đổi tập khoản về sau → link đã gửi vẫn hiện định nghĩa lúc
    gửi, Lần gửi mới hiện định nghĩa mới.
- **AC-3 — Mức chia của bộ.** (cross-layer) Given sàn đặt mức chia mặc định X% · When người gửi tạo Lần gửi cho nhóm môi
  giới · Then:
  - ô «Mức chia» điền sẵn X;
  - người gửi sửa thành Y → trang hiện «Mức chia: Y%»;
  - sàn đổi mặc định về sau → bộ đã gửi vẫn hiện Y;
  - mặc định trống và người gửi để trống → trang không có dòng mức chia;
  - Lần gửi cho khách riêng không mang mức chia.
- **AC-4 — Sàn ẩn mức chia.** (cross-layer) Given một bộ có mức chia · When Quản trị sàn bật «Ẩn mức chia» · Then thân
  trả của route công khai không có khoá mức chia, trang, Excel và ảnh đều không hiện. Tắt lại thì hiện lại.
- **AC-5 — Tải Excel.** Given trang môi giới đang mở · When bấm «Tải Excel» · Then tệp xlsx có:
  - dòng tiêu đề cột bằng đúng danh sách cột của bảng trang;
  - mỗi căn một dòng theo thứ tự trang, giá trị khớp bảng;
  - phần đầu ghi tên sàn, định nghĩa phí và mức chia (khi không ẩn).
- **AC-6 — Tải ảnh.** Given trang môi giới đang mở · When bấm «Tải ảnh» · Then tệp PNG vẽ đúng các cột và các dòng ấy, cùng
  phần đầu như Excel.
- **AC-7 — Không rò rỉ.** (cross-layer) Given căn mồi mang số chủ nhà, tên chủ, giá đáy, ảnh sổ, ghi chú nội bộ, người giữ
  · When dựng thân route công khai, HTML trang môi giới, Excel và ảnh · Then không chuỗi mồi nào xuất hiện. Thân và tệp dựng
  từ `banRaNgoai` qua lõi. Trang mới có tệp `*.ro-ri.test.ts` quét mồi trên mã nguồn trang.
- **AC-8 — Sàn đặt mặc định và ẩn.** (cross-layer) Given Quản trị sàn ở Cài đặt › Sàn › Trang môi giới · When đặt mức chia
  (0–100, để trống được) và công tắc ẩn rồi lưu · Then:
  - đọc lại thấy đúng giá trị;
  - giá trị ngoài 0–100 bị trả 400 kèm lý do dưới ô;
  - vai khác bị chuyển về Cá nhân kèm câu báo, gọi đường lưu thì nhận 403.
- **AC-9 — Migration 048 an toàn và chỉ thêm.** Given cơ sở dữ liệu đã có 001–047 · When chạy `npm run db:migrate` hai lần
  · Then:
  - lần hai không áp lại;
  - `shares` có cột mức chia: rỗng được, chặn ngoài 0–100, và khách riêng thì rỗng (ràng buộc của bảng);
  - `shares` có cột định nghĩa phí lúc gửi: chỉ nhận khoản trong tập đóng của điểm #8; Lần gửi cũ để rỗng (đọc theo cấu hình
    hiện tại);
  - `app.create_share` nhận tham số mức chia và định nghĩa phí, `quy_hang_app` gọi được;
  - luật theo dòng của `shares` giữ nguyên, sàn khác không đọc được mức chia.
- **AC-10 — Màn theo khuôn, có đủ trạng thái.** Given trang môi giới và mục cài đặt · When đang tải, có dữ liệu, ẩn mức chia,
  link tắt, lỗi tạm, tải tệp lỗi · Then mỗi trạng thái có chữ như bảng trạng thái của thiết kế. Trang dựng trong
  `KhungTrangKhach`, mục cài đặt trong `MucCaiDat`. Trên điện thoại bảng cuộn ngang, không vỡ khung.

## Coverage

Quét tay theo khuôn morphological-scan (preset entity-feature) trên ba trục chính.

- Trục **người nhận**: nhóm môi giới | khách riêng [thước CE: `SHARE_AUDIENCES`] — AC-1, AC-3, AC-7
- Trục **mức chia**: mặc định có, giữ | mặc định có, sửa | mặc định trống, để trống | sàn đổi mặc định sau khi gửi | sàn
  ẩn | sàn tắt ẩn [thước CE: điểm #15, #16] — AC-3, AC-4
- Trục **định nghĩa phí** (tập con khác rỗng): một khoản | hai khoản | đủ ba | sàn đổi sau khi gửi (bộ cũ giữ, bộ mới theo) | Lần gửi trước
  048 (cột rỗng) [thước CE: điểm #8 `fee.inclusion`, hiệu lực «mới»] — AC-2, AC-9
- Trục **cửa ra của trang**: thân route | HTML trang | Excel | ảnh [thước CE: ba cửa ra của `cua-ra.ts`] — AC-4, AC-5,
  AC-6, AC-7
- Trục **trạng thái căn**: còn bán | đã cọc | đã bán [thước CE: luật giá ra của `banRaNgoai`] — AC-1, AC-7
- Trục **người đặt cấu hình**: Quản trị | vai khác | chưa đăng nhập [thước CE: `ROLES`] — AC-8
- Trục **trạng thái màn**: đang tải | có dữ liệu | ẩn mức chia | link tắt | lỗi tạm | tải lỗi | lưu bị từ chối | không
  quyền [thước CE: bảng trạng thái thiết kế] — AC-8, AC-10

## Đường đo

Ngưỡng SỐNG (câu `bat_khi` của hàng 44): «Môi giới sàn khác mở link bảng hàng không cần đăng nhập và thấy đủ mã căn, phí
theo tên chuẩn kèm định nghĩa của sàn, mức chia của bộ; sàn ẩn mức chia thì không hiện; tải Excel hay ảnh bảng hàng ra
đúng những cột ấy; không số chủ nhà, giá đáy hay ghi chú nội bộ nào lọt ra, dựng từ luật ẩn ở lõi» — bảo đảm bởi
AC-1..AC-7. Số lượt mở link nhóm môi giới đọc từ `share_events` (`link_opened`, hàng 35), không cần đo mới.

## Out of scope

- Đếm lượt tải Excel hay ảnh làm số đo.
- Lối hiện riêng cho điện thoại; trên điện thoại bảng chỉ cuộn ngang.
- Sàn tự chỉnh cột của bảng gửi: điểm #26 `export.templates`, hàng mau-bang-hang-va-bai.
- Mức chia tính bằng số tiền thay vì phần trăm (Hỏi-1).
- Link tự hết hạn.

## Notes

- Vùng: `apps/web/src/app/s/broker/**`; xin thêm `apps/web/src/app/s/[code]/**`, `apps/web/src/app/(app)/shares/new/**`,
  `apps/web/src/app/(app)/settings/broker-page/**`, `apps/web/src/app/(app)/settings/cai-dat.ts`, `packages/core/src/sharing/**`,
  `packages/api/src/public/**`, `packages/api/src/contacts/**`, `packages/db/migrations/048_*.sql`, `packages/db/tests/isolation.test.mjs`,
  `packages/api/test-db/trang-nhom-moi-gioi/**`, `docs/product/tham-chieu.md`.
