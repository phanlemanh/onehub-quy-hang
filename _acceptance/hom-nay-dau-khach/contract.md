---
schema_version: 1
feature: "Đầu khách mở Hôm nay trên điện thoại và thấy khách vừa phản ứng, căn đã gửi vừa đổi, căn mới lên bảng khớp các bộ đã gửi"
slug: hom-nay-dau-khach
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: signed-off
design_doc: docs/superpowers/specs/2026-11-04-hom-nay-dau-khach-design.md
approved_by: Manh Phan
approved_at: 2026-11-04
---

# Acceptance Contract: hom-nay-dau-khach

## Context

Hàng 37 của lộ trình (dãy L, đợt `dau-khach-nhap`), Cổng Đáng: build (Manh Phan 02/11). Đứng trên hàng 34 (Lần gửi), 35
(`share_events`) và 36 (Đã gửi: luật «vừa đổi», «Gợi ý căn thay»). Nối vào `/today` sau hàng 92 (cùng tệp `page.tsx`).
Hợp đồng mang thêm mục chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng hàng 36 (luật đợt 56, nguồn «Ngoài-3 hàng 36»).

Source input: `docs/plan/lo-trinh.json` hàng 37 · `_acceptance/hom-nay-dau-khach/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-11-04-hom-nay-dau-khach-design.md`.

Từ ngữ: «tin» = một dòng của vùng Đầu khách ở Hôm nay; «khách phản ứng» = lượt `link_opened`, `interest` của
`share_events`; «vừa đổi» = luật lõi của hàng 36 (giá rao hay trạng thái đổi sau lúc gửi); «căn mới» = căn lên Đang bán sau
lúc gửi mà luật `khopBoDaGui` (Hỏi-2) nhận là khớp một căn trong bộ.

## Criteria

- **AC-1** (cross-layer) — Given đầu khách đã gửi link, When mở Hôm nay, Then thấy vùng «Đầu khách» liệt tin của CHÍNH mình
  (link mình gửi) trong 7 ngày gần nhất, nhóm theo ngày giờ Việt Nam, mới trước; người có vai khác cùng lúc thấy vùng này cạnh
  vùng của vai kia; người không có vai Đầu khách không thấy vùng và `GET /api/v1/today/buyer` trả 403; thân API không mang số
  khách hay trường lớp `source`.
- **AC-2** (cross-layer) — Given khách mở link và chạm «Quan tâm», When xem vùng, Then mỗi Lần gửi mỗi ngày có MỘT tin
  «Khách phản ứng»: người nhận, số lượt mở, tên các căn được quan tâm, giờ gần nhất — đúng bằng các dòng `share_events` của
  Lần gửi trong ngày ấy.
- **AC-3** (cross-layer) — Given một căn trong link còn mở đổi giá rao hay đổi trạng thái sau lúc gửi, When xem vùng, Then có
  tin «Vừa đổi»: tên căn, người nhận, giá cũ → mới hay trạng thái mới; đổi giá đáy (lớp nguồn) không sinh tin; link đã tắt
  không sinh tin «Vừa đổi».
- **AC-4** (cross-layer) — Given một căn lên Đang bán sau lúc gửi và khớp một căn trong bộ theo luật lõi (Hỏi-2), When xem
  vùng, Then có tin «Căn mới»: tên căn, giá, và người nhận của bộ khớp; một căn khớp nhiều bộ là MỘT tin liệt mọi người
  nhận; căn trở lại Đang bán sau Pending tính là căn mới; căn đã có trong bộ, căn không khớp, căn khớp bộ của người khác, bộ
  đã tắt, và căn trong bộ không có giá lúc gửi (không làm gốc khớp) không sinh tin.
- **AC-5** — Given một tin, When chạm, Then «Khách phản ứng» và «Vừa đổi» mở `/shares?lan=<id>` với ngăn chi tiết của đúng
  Lần gửi; «Căn mới» mở luồng Gửi `/shares/new?can=<id>`; máy không gửi gì (bất biến 3).
- **AC-6** — Given các trạng thái của vùng, When dựng, Then có đang tải, trống («Chưa có gì mới trong 7 ngày» + «Gửi căn»),
  lỗi tải («Chưa tải được — thử lại» + thử lại) — đi qua `TrangThai`.
- **AC-7** (nguồn «Ngoài-3 hàng 36») — Given ngăn chi tiết của một Lần gửi ở Đã gửi, When đang tải hay tải lỗi (404, 5xx,
  mất mạng), Then ngăn hiện khung chờ hay «Chưa tải được — thử lại» kèm nút thử lại qua `TrangThai`, không bao giờ trống.
- **AC-8** — Given màn mới, When kiểm kho, Then vùng dựng khuôn nhóm mới `design/patterns/hom-nay-dau-khach.md`, `npm run lint`
  xanh, điện thoại 375 không cuộn ngang, Tham chiếu ghi «Hôm nay của đầu khách — Đã dựng (hàng 37)».

## Coverage

Quét `morphological-scan` preset entity-feature trên «tin của Hôm nay đầu khách»: trục **người xem** (đầu khách gửi · đầu
khách khác · trưởng nhóm không vai đầu khách · người nhiều vai · vai khác) × **loại tin** (phản ứng · vừa đổi · căn mới) ×
**trạng thái link** (mở · đã tắt) × **thời gian** (trong 7 ngày · cũ hơn · trước lúc gửi) × **hành động** (xem · chạm) ×
**lớp** (lõi · API · màn). Core → AC-1…AC-8; Later/Never → Out of scope. Thước CE: mỗi người xem có dòng ở AC-1; mỗi loại tin
một AC (AC-2, AC-3, AC-4) có ca link đã tắt; mỗi đích chạm có dòng ở AC-5; mục hàng 36 một AC (AC-7).

## Đường đo

- «Thời gian khách hỏi → gửi được căn» (Tham chiếu §11): tin «Căn mới» mở luồng Gửi với căn khớp (AC-4, AC-5) là đường rút
  ngắn. Đo bằng dữ liệu đã có, không thêm cột: với mỗi căn sinh tin «Căn mới» cho một đầu khách, khoảng từ sự kiện lên Đang bán
  (`listing_events`) tới Lần gửi đầu tiên của chính đầu khách ấy có căn đó (`shares.created_at` + `share_listings`). Lần gửi
  không ghi «mở từ Hôm nay» — muốn tách nguồn thì cần cột mới (migration), để vòng sau khi số đo đòi. Nối vào bảng số đo là
  việc giám sát (luật đợt 35); ngưỡng số và hạn thử chủ kho đặt trước hai tuần thử (ô cơ hội).

## Out of scope

- Lịch xem, xin dẫn xem (loại tin thứ tư ở `vo-va-ia.md` §2; chờ phỏng vấn, Tham chiếu §13).
- Đánh dấu đã đọc, đếm tin chưa đọc trên tab.
- Đẩy thông báo khi khách phản ứng (thông báo lead là hàng 26; mở rộng cho đầu khách là việc riêng).
- Sàn chỉnh luật khớp, cửa sổ ngày, loại tin (Cài đặt sàn 45–49).
- Đọc Hôm nay đầu khách khi mất mạng (ngoại tuyến bản đầu chỉ cho bảng hàng, hồ sơ, ảnh).
- Nối số đo vào `packages/core/src/metrics` (giám sát, luật đợt 35).

## Notes

- Bất biến chạm: 2 (không lớp `source`, không số khách), 3 (tin chỉ mở luồng Gửi), 4 không chạm (không trang khách).
- Phần nối vào `/today/page.tsx` và `vungTheoVai` chờ hàng 92 gộp (hàng 37 «sau: 36, 92»). Eval E6b (chụp vùng trên `/today`) chạy sau khi phần nối có; lớp chọn vùng theo vai đo riêng ở E1b.
- Ngoài-1 (máy định tuyến 2026-11-04, đề xuất S4 known-limits): Ảnh minh hoạ vùng Đầu khách trên điện thoại chỉ cho thấy hai loại tin, tin «Khách phản ứng» có thể nằm dưới phần bị cắt. Người dùng không gặp lỗi gì; chỉ là bằng chứng chụp chưa đủ để chứng minh ba loại tin cùng hiện. — `_acceptance/hom-nay-dau-khach/evidence/E6b-step1.png`
- Ngoài-3 (máy định tuyến 2026-11-04, đề xuất S4 known-limits): Hiếm khi mạng hoặc máy chủ trung gian trả về nội dung hỏng, vùng Đầu khách ở Hôm nay sẽ hiện khung chờ mãi, không báo lỗi và không có nút thử lại. Người dùng phải tự tải lại trang. — `apps/web/src/app/(app)/today/buyer/vung.tsx`
- Known limits — chọn ở Cổng Bằng chứng 2026-11-05:
  - Ngoài-3: Ở ca hiếm máy chủ báo thành công nhưng nội dung hỏng, vùng Đầu khách hiện khung chờ mãi; đầu khách tải lại trang là hết.
