---
schema_version: 1
feature: "Quản trị sàn xem và sửa mẫu bảng hàng (cột và thứ tự khi xuất) và mẫu bài theo kênh trong màn Mẫu của Cài đặt › Sàn; sửa hay xoá một mẫu thì lần xuất và lần gửi kế dùng bản mới, lần đã xong không đổi"
slug: mau-bang-hang-va-bai
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, ui]
status: implemented
design_doc: docs/superpowers/specs/2026-11-06-mau-bang-hang-va-bai-design.md
approved_by: Manh Phan
approved_at: 2026-11-07
---

# Acceptance Contract: mau-bang-hang-va-bai

## Context

Hàng 50 tách mẫu bảng hàng và mẫu bài theo kênh sang hàng này (Cổng Phạm vi 50, Hỏi-1); Cổng Đáng 50 đã ký cả ba loại
mẫu (luật 74 của đợt). Sổ điểm biến thiên đã khai hai điểm: #26 `export.templates`, #27 `share.post_templates` — kiểu map,
Quản trị đổi, hiệu lực lần sau. Hai điểm lưu ở `company_settings` (đã có cách ly theo dòng và nhật ký đổi từ migration 026),
không thêm migration — hạng T2. Bài và bảng vẫn dựng từ luật ẩn ở lõi (bất biến 4). Thiết kế:
`docs/superpowers/specs/2026-11-06-mau-bang-hang-va-bai-design.md`. Dữ liệu mẫu: `[Tên]`, `0900 000 0xx`.

## Criteria

- **AC-1 — Quản trị giữ mẫu bảng hàng.** (cross-layer) Given Quản trị sàn ở Cài đặt › Sàn › Mẫu, tab «Mẫu bảng hàng» ·
  When thêm một mẫu (tên, cột, thứ tự), sửa nó, rồi xoá nó · Then:
  - đọc lại sau mỗi bước thấy đúng tên và đúng dãy cột theo thứ tự;
  - mẫu đã xoá không còn trong danh sách.
- **AC-2 — Mẫu bảng hàng sai khuôn bị từ chối.** Given Quản trị lưu mẫu bảng hàng · When tên trống, quá 60 ký tự hay trùng
  tên khác trong sàn; không cột, quá 15 cột, cột trùng, cột lạ hay cột nội bộ («Người giữ», «Giá chốt»…); hay sàn đã có 20
  mẫu · Then:
  - nhận 400 kèm lý do nêu khoá sai;
  - không mẫu nào trong lần lưu ấy được ghi;
  - màn hiện lý do dưới ô và giữ chữ đã gõ.
- **AC-3 — Quản trị giữ mẫu bài theo kênh.** (cross-layer) Given tab «Mẫu bài» · When Quản trị lưu lời mở đầu, lời kết cho
  Zalo và cho Facebook (0–500 ký tự mỗi ô), rồi bấm «Về mặc định» ở một kênh · Then:
  - đọc lại thấy đúng chữ đã lưu;
  - kênh về mặc định không còn lời nào;
  - quá 500 ký tự hay kênh lạ thì nhận 400 kèm lý do.
- **AC-4 — Chỉ Quản trị sửa, sàn khác không thấy.** (cross-layer) Given hai sàn A, B và đủ năm vai · When đọc và ghi mẫu ·
  Then:
  - mọi thành viên sàn A đọc được mẫu của A;
  - vai khác Quản trị ghi thì nhận 403, mở màn Mẫu thì về Cá nhân kèm câu «Chỉ Quản trị sàn sửa được mẫu»;
  - sàn B không đọc, không ghi được mẫu của A.
- **AC-5 — Xuất bảng hàng theo mẫu.** (cross-layer) Given sàn có mẫu «[Tên] gửi đội» với cột Mã căn · Giá · Diện tích · When
  Đầu chủ mở Xuất bảng hàng, chọn «Cột theo: [Tên] gửi đội» · Then:
  - xem trước, Excel, PDF, ảnh và bài có đúng ba cột ấy theo đúng thứ tự;
  - người nhận khách riêng: cột Mã căn thành nấc tầng như luật ẩn hiện có;
  - không chọn mẫu thì cột theo góc nhìn đang mở như cũ;
  - đọc mẫu lỗi thì chỉ còn «Góc nhìn đang mở» kèm câu báo, xuất vẫn được.
- **AC-6 — Bài xuất mang lời của mẫu bài.** Given mẫu bài Zalo có lời mở đầu D và lời kết C · When Đầu chủ chép bài Zalo ở
  Xuất bảng hàng · Then:
  - bài là D, rồi các dòng căn dựng sẵn, rồi C;
  - Facebook giữ dòng tên sàn ở đầu, D ngay sau;
  - kênh không có mẫu thì bài y như hôm nay;
  - biểu tượng cảm xúc trong D, C bị bỏ.
- **AC-7 — Tin của màn Gửi mang lời của mẫu Zalo.** (cross-layer) Given mẫu bài Zalo có D, C · When Đầu khách mở màn Gửi ·
  Then:
  - tin soạn sẵn là lời chào, D, «Em gửi N căn…», các dòng căn, dòng link, C;
  - người gửi vẫn sửa được tin trước khi bấm Gửi;
  - tin gửi đi có link đúng một lần.
- **AC-8 — Hiệu lực lần sau, lần đã xong không đổi.** (cross-layer) Given đã có một Lần gửi và một lần xuất trước khi đổi mẫu
  · When Quản trị sửa rồi xoá mẫu · Then:
  - lần mở Xuất bảng hàng và màn Gửi kế tiếp dùng bản mới;
  - hộp Xuất đang mở giữ mẫu lúc mở;
  - trang `/s/<mã>` của Lần gửi cũ y như trước (so thân trả);
  - sổ `exports` của lần xuất cũ không đổi.
- **AC-9 — Không rò rỉ.** (cross-layer) Given căn mồi mang số chủ nhà, tên chủ, giá đáy, ghi chú nội bộ, người giữ · When dựng
  bài và bảng theo mẫu bất kỳ, kể cả mẫu ghi thẳng vào cơ sở dữ liệu mang cột nội bộ · Then:
  - không chuỗi mồi nào ra bài, bảng hay tệp;
  - cột nội bộ bị bỏ ở lõi;
  - màn Mẫu mới có tệp `*.ro-ri.test.ts` quét mồi trên mã nguồn màn.
- **AC-10 — Màn theo khuôn, đủ trạng thái.** Given màn Mẫu · When đang tải, chưa có mẫu, có mẫu, lỗi đọc, lưu bị từ chối, lỗi
  lưu, đã lưu, không quyền · Then:
  - mỗi trạng thái có chữ như bảng trạng thái của thiết kế;
  - màn dựng trong `MucCaiDat`;
  - nhãn menu là «Mẫu» và tab «Mẫu nhập» của hàng 50 giữ nguyên hành vi.

## Coverage

Quét tay theo khuôn morphological-scan (preset entity-feature) trên các trục chính.

- Trục **loại mẫu**: mẫu bảng hàng | mẫu bài Zalo | mẫu bài Facebook [thước CE: điểm #26, #27 của sổ điểm] — AC-1, AC-3, AC-5, AC-6
- Trục **thao tác trên mẫu**: thêm | sửa | xoá hay về mặc định | lưu sai khuôn [thước CE: CRUD + từ chối] — AC-1, AC-2, AC-3
- Trục **luật khuôn mẫu bảng**: tên trống · quá dài · trùng · không cột · quá 15 · cột trùng · cột lạ · cột nội bộ · quá 20
  mẫu [thước CE: hàm kiểm khuôn ở lõi] — AC-2
- Trục **vai**: Quản trị | Đầu chủ | Đầu khách | Trưởng nhóm | Telesales | chưa đăng nhập [thước CE: `ROLES`] — AC-4
- Trục **nơi dùng mẫu**: Xuất bảng hàng (xem trước · Excel · PDF · ảnh · bài Zalo · bài Facebook) | màn Gửi [thước CE: năm
  mẫu xuất của `MAU_XUAT` + tin Gửi] — AC-5, AC-6, AC-7
- Trục **người nhận**: nhóm môi giới | khách riêng [thước CE: `NguoiNhan`] — AC-5, AC-9
- Trục **thời điểm**: lần đã xong | hộp đang mở | lần kế tiếp [thước CE: hiệu lực `lan_sau`] — AC-8
- Trục **trạng thái màn**: đang tải | trống | có mẫu | lỗi đọc | từ chối | lỗi lưu | đã lưu | không quyền [thước CE: bảng
  trạng thái thiết kế] — AC-10

## Đường đo

Ngưỡng SỐNG và CHẾT chép từ ô cơ hội hàng 50 vào `opportunity.md` của hàng này. Mỗi vế trỏ tới tiêu chí và bài đo nó:
- thấy đủ mẫu bảng hàng và mẫu bài của sàn mình — AC-1, AC-3 · E1, E3, E10;
- sửa hay xoá một mẫu thì lần kế dùng bản mới, lần đã xong không đổi — AC-8 · E8, E8b, E7c, E10;
- vai khác không mở được màn; sàn khác không thấy mẫu của nhau — AC-4 · E4, E4b.

Không thêm số đo mới.

## Out of scope

- Trang nhóm môi giới (hàng 44) theo một mẫu bảng hàng — giữ cột cố định (Hỏi-4).
- Chỗ trống chèn trường của căn vào bài (`{gia}`, `{toa}`…) — dòng căn do lõi dựng (Hỏi-1).
- Mẫu theo nhóm hay theo người (Hỏi-6); mẫu cho kênh khác ngoài Zalo, Facebook.
- Ghi tên mẫu vào sổ `exports` của mỗi lần xuất (Hỏi-7).
- Kéo thả để xếp cột.

## Notes

- Vùng: `apps/web/src/app/(app)/settings/templates/**`, `apps/web/src/app/(app)/settings/cai-dat.ts`,
  `apps/web/src/app/(app)/inventory/phat-hang/**`, `apps/web/src/app/(app)/shares/new/**`, `packages/core/src/export/**`,
  `packages/core/src/sharing/**`, `packages/api/src/mau-san/**`, `packages/api/src/app.ts`,
  `packages/api/test-db/mau-bang-hang-va-bai/**`, `docs/product/tham-chieu.md`.
