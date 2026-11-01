---
schema_version: 1
feature: Đầu chủ mở app vào Hôm nay và thấy các hàng đợi của mình — lead mới, nên gọi ép giá, cần gọi lại, thiếu thông tin, mới đổi — mỗi căn ở đúng một hàng đợi, lý do bằng chữ, ghi kết quả gọi một chạm
slug: hom-nay-dau-chu
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api, core]
status: draft
design_doc: docs/superpowers/specs/2026-11-01-hom-nay-dau-chu-design.md
approved_by:
approved_at:
---

# Acceptance Contract: hom-nay-dau-chu

## Context

Hàng 22 (dãy G), D10 · phác thảo 1. Tham chiếu §8 luật 18, 20; `so-diem-bien-thien.md` #4, #5, K8; ADR-0019 (màn đầu
nhóm mới → trang ba lối), ADR-0020, ADR-0021. Đứng trên 15, 17. «Đầu chủ» = vai `listing_agent`; «căn của mình» = căn
mình là người giữ (`listing_agent_assignments`). Giờ «hôm qua» tính theo giờ Việt Nam (UTC+7).

## Criteria

**AC-1 — Mỗi căn đúng một hàng đợi.**
Given căn mình giữ, nấc khác Đã bán và Ngừng bán
When tính hàng đợi
Then căn vào đúng một trong Nên gọi ép giá · Cần gọi lại · Thiếu thông tin · Mới đổi hay không vào nhóm nào, theo thứ tự
thắng ấy; căn người khác giữ, căn Đã bán, Ngừng bán không vào nhóm nào.

**AC-2 — Ngưỡng là mặc định của sàn, sàn đè được trong khoảng.**
Given sàn chưa cài, sàn cài trong khoảng, sàn cài ngoài khoảng
When tính hàng đợi và đọc `GET /api/v1/company/settings/queue`
Then ngưỡng là 14 (gọi lại) và 10 (ép giá), giá trị sàn cài (gọi lại 7–30, ép giá 7–14), hay mặc định khi ngoài khoảng;
căn đúng bằng ngưỡng ngày đã vào nhóm, kém một ngày thì chưa.

**AC-3 — Mới đổi là đổi giá hay trạng thái từ hôm qua bởi người khác.**
Given căn mình giữ đổi giá hay trạng thái lúc 00:00 hôm qua (giờ Việt Nam) trở đi
When tính hàng đợi
Then căn vào Mới đổi khi người đổi không phải mình, kèm chữ «<giá cũ> → <giá mới> — <vai>, <lúc>» (hay trạng thái cũ →
mới) dựng từ bản xem hàng; lần đổi giá và lần đổi trạng thái xét riêng, nên người khác đổi giá hôm qua rồi mình đổi trạng
thái hôm nay vẫn vào Mới đổi; mình tự đổi, hay đổi trước 00:00 hôm qua, thì không. (cross-layer)

**AC-4 — Bản xem hàng mang người giữ và mốc đổi.**
Given hàng có người giữ, có sự kiện đổi giá, đổi trạng thái
When gọi `GET /api/v1/listings`
Then mỗi hàng mang `listAgentKey`, `priceChangeTimestamp`, `statusChangeTimestamp` và hai bản ghi lần đổi cuối
`lastPriceChange`, `lastStatusChange` (lúc, người, vai, giá trị cũ → mới) đúng theo sự kiện và bảng gán (`null` khi chưa
có); không trường nguồn nào; kéo về của bộ đồng bộ đưa đủ các trường ấy vào kho trên máy và vẫn chặn thân mang khoá nguồn.

**AC-5 — Lead giao cho tôi.**
Given lead giao cho đầu chủ A ở các nấc, lead giao cho B, lead sàn khác
When A gọi `GET /api/v1/leads/assigned`
Then A nhận đúng lead giao cho A ở nấc Đã gửi hay Đã nhận, chưa trả lại, chưa bỏ — có toà, căn, nhu cầu, giá đọc thành câu,
giờ nhập, hạn nhận, hạn gọi, không số chủ; lead của B và sàn khác không ra; người hai vai (Đầu chủ và telesales) nhận lead
giao cho mình; telesales không có vai Đầu chủ nhận 403.

**AC-6 — Màn Hôm nay của đầu chủ.**
Given người có vai Đầu chủ, dữ liệu mẫu có việc ở cả năm nhóm; người có cả vai Đầu chủ lẫn telesales
When mở `/today`
Then thấy Lead mới · Nên gọi ép giá · Cần gọi lại · Thiếu thông tin · Mới đổi đúng thứ tự, mỗi nhóm có số, nhóm rỗng không
hiện; mỗi dòng có mã căn (hay toà, căn của lead), lý do bằng chữ và giá kèm điều kiện phí; telesales vẫn thấy vùng Lead đã
nhập, vai khác vẫn thấy chỗ tạm; người hai vai thấy Hôm nay của đầu chủ trước rồi vùng Lead đã nhập. (cross-layer)

**AC-7 — «Còn · giữ giá» một chạm.**
Given một căn ở Cần gọi lại hay Nên gọi ép giá
When bấm «Còn · giữ giá»
Then căn rời nhóm ngay (với Nên gọi ép giá: theo luật mốc ép giá chốt ở Hỏi-1), số nhóm giảm, máy chủ ghi đúng một sự
kiện `owner_confirmed` của căn; khi mất mạng thì thao tác
nằm ở hàng đợi trên máy và gửi khi có mạng; «Đổi giá, trạng thái…» mở cột hồ sơ căn của căn ấy. (cross-layer)

**AC-8 — Nhận · Đã gọi · Trả lại trên lead.**
Given một lead ở Lead mới
When bấm Nhận, Đã gọi hay «Trả lại · Số không liên lạc được»
Then máy chủ ghi đúng mốc (nhận, gọi lần đầu, trả lại); lead rời nhóm khi đã gọi hay trả lại; lỗi 409 hiện lý do bằng chữ
và dòng giữ nguyên. (cross-layer)

**AC-9 — Trống, đang tải, lỗi, khổ điện thoại.**
Given đầu chủ không có việc; dữ liệu đang tải; lỗi tải lead; khổ 375
When mở `/today`
Then trống «Hôm nay không còn việc» với nút mở Bảng hàng; đang tải là `Skeleton` đúng bố cục; lỗi nói nguyên nhân và có
thử lại; 375 một cột, không tràn ngang.

**AC-10 — Nhóm khuôn mới và trang ba lối.**
Given vòng thêm màn đầu của nhóm mới
When chạy bước chấm của vòng và `npm run lint`
Then có `design/patterns/hom-nay-dau-chu.md` với khuôn của lối đã duyệt, `doi-chieu.mjs --kiem-ba-loi` xanh (design-pass
`divergence: opened`, trang ba lối dựng bằng lệnh), bài quét khuôn 0 lệch mới, lint xanh.

## Coverage

Quét Zwicky (preset entity-feature). Chân sản phẩm: `[SUY-TỪ-REPO: docs/product/tham-chieu.md]` §8 luật 18, 20, §10;
`[SUY-TỪ-REPO: docs/architecture/so-diem-bien-thien.md]` #4, #5, K8; `[SUY-TỪ-REPO: docs/design/vo-va-ia.md]` §2 dòng
«Hôm nay, đầu chủ»; `[SUY-TỪ-REPO: docs/product/ghi-chep/2026-10-28-desktop-app.md]` «Mới đổi từ hôm qua». Chân ngành:
`[NGÀNH: RESO Data Dictionary 2.0 — ListAgentKey, PriceChangeTimestamp, StatusChangeTimestamp]`, `[NGÀNH: KW Command —
hàng đợi việc «Today» và seller lead]`. Thước CE: ngưỡng `bat_khi` / câu giao hàng 22.

- Trục A — hàng đợi: Lead mới (AC-5, AC-8) | ép giá · gọi lại · thiếu thông tin · mới đổi (AC-1, AC-2, AC-3).
- Trục B — trạng thái căn: mình giữ · người khác giữ · Đã bán / Ngừng bán (AC-1); hai điều kiện cùng lúc (AC-1).
- Trục C — lớp: lõi (AC-1…AC-3) | API (AC-4, AC-5, AC-2) | màn (AC-6…AC-9) | khuôn (AC-10).
- Trục D — trạng thái màn: mặc định · trống · đang tải · lỗi · mất mạng · 375 (AC-6, AC-7, AC-9).
- Later: hàng đợi Xin dẫn xem; Mở số lead; «Chưa gọi được»; bản điện thoại M1; màn sửa ngưỡng (48).

## Đường đo

- «Thời gian lead → cuộc gọi đầu» (Tham chiếu §11): mốc nhận và gọi lần đầu ghi bằng nút ở AC-8 (đã có cột ở bảng lead).
- «Số căn gọi ép giá đợt hai»: hàm hàng đợi của lõi là hàm thuần trên sự kiện (AC-1, AC-2), nên chạy lại trên dãy sự kiện
  của từng căn đếm được số lần căn vào nhóm Nên gọi ép giá; căn vào lần thứ hai là «đợt hai» (đếm bằng lệnh sau hai tuần
  thử, theo luật mốc ép giá chốt ở Hỏi-1).

## Out of scope

- Mở số của lead cho đầu chủ (Hỏi-3).
- «Chưa gọi được» (không nghe máy) — chưa có sự kiện; căn ở lại nhóm.
- Hàng đợi Xin dẫn xem; Hôm nay của đầu chủ trên điện thoại (M1); màn sửa ngưỡng (hàng 48); đổi đầu chủ hàng loạt (89);
  vá đường lỗi hoàn tác (88).
- Tạo hàng từ lead trên màn này.

## Notes

- Vùng của hàng: `apps/web/src/app/(app)/today/**`, cộng các thư mục khai ở Cổng Phạm vi.
