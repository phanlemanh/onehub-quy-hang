---
schema_version: 1
feature: Đầu chủ mở app vào Hôm nay và thấy các hàng đợi của mình theo bộ nhóm của sàn — mặc định lead mới, nên gọi ép giá, cần gọi lại, thiếu thông tin, mới đổi — mỗi căn ở đúng một hàng đợi, lý do bằng chữ, ghi kết quả gọi một chạm; sàn tự định nghĩa nhóm từ bộ điều kiện đóng
slug: hom-nay-dau-chu
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api, core]
status: signed-off
design_doc: docs/superpowers/specs/2026-11-01-hom-nay-dau-chu-design.md
approved_by: Manh Phan
approved_at: 2026-11-01
---

# Acceptance Contract: hom-nay-dau-chu

## Context

Hàng 22 (dãy G), D10 · phác thảo 1. Tham chiếu §8 luật 18, 20; `so-diem-bien-thien.md` #4, #5, K8; ADR-0019 (màn đầu
nhóm mới → trang ba lối), ADR-0020, ADR-0021. Đứng trên 15, 17. «Đầu chủ» = vai `listing_agent`; «căn của mình» = căn
mình là người giữ (`listing_agent_assignments`). Giờ «hôm qua» tính theo giờ Việt Nam (UTC+7).

## Criteria

**AC-1 — Bộ mặc định: năm nhóm, mỗi căn đúng một nhóm.**
Given sàn chưa đặt bộ nhóm; căn mình giữ, nấc khác Đã bán và Ngừng bán
When tính hàng đợi
Then bộ nhóm là `new_lead` · `price_adjustment` · `call_back` · `missing_info` · `recent_change` theo thứ tự ấy, tên mặc
định Lead mới · <nhãn chốt ở Hỏi-5> · Cần gọi lại · Thiếu thông tin · Mới đổi, ngưỡng 10 (ép giá, mốc
theo Hỏi-1, chưa đổi giá thì từ lúc lên Đang bán) và 14 (gọi lại), đọc đè từ hai khoá ngưỡng cũ khi sàn đặt trong khoảng
và chưa có bộ nhóm riêng; căn vào đúng nhóm bật đầu tiên hợp mọi
điều kiện hay không nhóm nào; căn người khác giữ, căn Đã bán, Ngừng bán không vào nhóm nào.

**AC-2 — Bộ điều kiện đóng tính đúng.**
Given mỗi loại điều kiện (nấc, quá ngày từ mốc đổi giá / xác nhận / lên Đang bán / lần muộn hơn, thiếu tin, người khác đổi
từ hôm qua / hôm nay, loại hình, nấc lead)
When tính trên căn hay lead
Then mỗi điều kiện đúng theo nghĩa khai ở thiết kế §3.1, kể cả ranh giới đúng bằng ngưỡng ngày, mốc chưa có, «hôm qua»
theo giờ Việt Nam (UTC+7) bất kể múi giờ của máy, căn ngoài danh mục với điều kiện loại hình; đổi giá và đổi trạng thái xét
riêng, nên người khác đổi giá hôm qua rồi mình đổi trạng thái hôm nay vẫn hợp «người khác đổi».

**AC-3 — Sàn ghi đè bộ nhóm.**
Given sàn đặt bộ nhóm của mình (tắt một nhóm, đổi tên, đổi thứ tự, đổi ngưỡng, thêm nhóm theo loại hình)
When tính hàng đợi và đọc `GET /api/v1/company/settings/queue`
Then bộ của sàn thay trọn bộ mặc định: nhóm tắt không nhận căn nào, căn rơi sang nhóm bật kế tiếp theo thứ tự mới, tên mới
hiện ra, nhóm loại hình nhận đúng căn của loại hình ấy; lời đọc trả `nguon: san`; sàn khác vẫn dùng bộ của mình.

**AC-4 — Bộ nhóm hỏng thì về mặc định, ghi sai thì từ chối.**
Given bộ nhóm của sàn có khoá lạ, điều kiện ngoài từ vựng, ngày ngoài khoảng (Hỏi-4), hành động ngoài thực đơn, loại hình
ngoài tập mã, tên nhóm quá 40 ký tự hay chứa số điện thoại / email, mã nhóm trùng, thiếu nhóm lead, hay lệch đối tượng (nhóm căn mang điều kiện / hành động của lead và ngược lại)
When đọc bộ nhóm, hay quản trị sàn ghi bằng `PUT /api/v1/company/settings/queue`
Then lúc đọc cả bộ của sàn bị bỏ, dùng bộ mặc định, lời đọc trả `nguon: mac-dinh` kèm lỗi gọi tên chỗ sai; lúc ghi trả 400
nêu chỗ sai và không ghi gì; người không phải quản trị sàn ghi thì 403.

**AC-5 — Bản xem hàng mang người giữ và lần đổi cuối.**
Given hàng có người giữ, có sự kiện đổi giá, đổi trạng thái
When gọi `GET /api/v1/listings`
Then mỗi hàng mang `listAgentKey`, `priceChangeTimestamp`, `statusChangeTimestamp` và hai bản ghi lần đổi cuối
`lastPriceChange`, `lastStatusChange` (lúc, người, vai, giá trị cũ → mới) đúng theo sự kiện và bảng gán (`null` khi chưa
có); không trường nguồn nào; kéo về của bộ đồng bộ đưa đủ các trường ấy vào kho trên máy và vẫn chặn thân mang khoá nguồn.

**AC-6 — Lead giao cho tôi.**
Given lead giao cho đầu chủ A ở các nấc, lead giao cho B, lead sàn khác
When A gọi `GET /api/v1/leads/assigned`
Then A nhận đúng lead giao cho A hợp nhóm lead đang áp (mặc định: Đã gửi, Đã nhận, chưa trả lại, chưa bỏ) — có toà, căn,
nhu cầu, giá đọc thành câu, giờ nhập, hạn nhận, hạn gọi, không số chủ; lead của B và sàn khác không ra; người hai vai (Đầu
chủ và telesales) nhận lead giao cho mình; telesales không có vai Đầu chủ nhận 403.

**AC-7 — Màn Hôm nay theo bộ nhóm của sàn.**
Given người có vai Đầu chủ, dữ liệu mẫu có việc ở mọi nhóm; sàn đổi tên, thứ tự, tắt một nhóm; người có cả vai Đầu chủ lẫn
telesales
When mở `/today`
Then thấy các nhóm đúng tên và thứ tự đang áp, mỗi nhóm có số, nhóm rỗng hay tắt không hiện; mỗi dòng có mã căn (hay toà,
căn của lead), lý do bằng chữ (vd «Chưa xác nhận 16 ngày», «3,10 → 2,95 tỷ — Trưởng nhóm, hôm qua») và giá kèm điều kiện
phí; nút của dòng theo hành động của nhóm; telesales vẫn thấy vùng Lead đã nhập, vai khác vẫn thấy chỗ tạm; người hai vai
thấy Hôm nay của đầu chủ trước rồi vùng Lead đã nhập. (cross-layer)

**AC-8 — «Còn · giữ giá» một chạm.**
Given một căn ở nhóm có hành động «Còn · giữ giá»
When bấm «Còn · giữ giá»
Then máy chủ ghi đúng một sự kiện `owner_confirmed` của căn; căn rời nhóm ngay khi điều kiện của nhóm hết đúng (với bộ mặc
định: Cần gọi lại, và Nên gọi ép giá theo Hỏi-1), số nhóm giảm; khi mất mạng thì thao tác nằm ở hàng đợi trên máy và gửi
khi có mạng; «Đổi giá, trạng thái…» mở cột hồ sơ căn của căn ấy. (cross-layer)

**AC-9 — Nhận · Đã gọi · Trả lại trên lead.**
Given một lead ở nhóm lead
When bấm Nhận, Đã gọi hay «Trả lại · Số không liên lạc được»
Then máy chủ ghi đúng mốc (nhận, gọi lần đầu, trả lại); lead rời nhóm khi hết hợp điều kiện của nhóm (mặc định: đã gọi hay
trả lại); lỗi 409 hiện lý do bằng chữ và dòng giữ nguyên. (cross-layer)

**AC-10 — Trống, đang tải, lỗi, khổ điện thoại.**
Given đầu chủ không có việc; dữ liệu đang tải; lỗi tải lead hay bộ nhóm; khổ 375
When mở `/today`
Then trống «Hôm nay không còn việc» với nút mở Bảng hàng; đang tải là `Skeleton` đúng bố cục; lỗi nói nguyên nhân và có
thử lại; mất mạng hay lỗi đọc bộ nhóm thì màn chia theo bộ nhóm đã lưu trên máy và nói giờ lưu (chưa từng lưu thì bộ mặc
định kèm chữ báo); 375 một cột, không tràn ngang.

**AC-11 — Nhóm khuôn mới và trang ba lối.**
Given vòng thêm màn đầu của nhóm mới
When chạy bước chấm của vòng và `npm run lint`
Then có `design/patterns/hom-nay-dau-chu.md` với khuôn của lối đã duyệt, `doi-chieu.mjs --kiem-ba-loi` xanh (design-pass
`divergence: opened`, trang ba lối dựng bằng lệnh), bài quét khuôn 0 lệch mới, lint xanh.

## Coverage

Quét Zwicky (preset entity-feature). Chân sản phẩm: `[SUY-TỪ-REPO: docs/product/tham-chieu.md]` §8 luật 18, 20, §10;
`[SUY-TỪ-REPO: docs/architecture/so-diem-bien-thien.md]` #4, #5, K8; `[SUY-TỪ-REPO: docs/design/vo-va-ia.md]` §2 dòng
«Hôm nay, đầu chủ»; `[SUY-TỪ-REPO: docs/product/ghi-chep/2026-10-28-desktop-app.md]` «Mới đổi từ hôm qua». Chân ngành:
`[NGÀNH: RESO Data Dictionary 2.0 — ListAgentKey, PriceChangeTimestamp, StatusChangeTimestamp, PropertySubType]`,
`[NGÀNH: Follow Up Boss Smart Lists]`, `[NGÀNH: KW Command SmartViews]`, `[NGÀNH: Lofty Segments]`, `[NGÀNH: REDX danh sách gọi theo nguồn]`. Thước CE: ngưỡng `bat_khi` / câu giao hàng 22.

- Trục A — nguồn bộ nhóm: mặc định (AC-1) | sàn ghi đè (AC-3) | hỏng → mặc định, ghi sai bị từ chối (AC-4).
- Trục A' — điều kiện: mỗi loại trong bộ từ vựng đóng (AC-2); lead (AC-6, AC-9).
- Trục B — trạng thái căn: mình giữ · người khác giữ · Đã bán / Ngừng bán (AC-1); hai điều kiện cùng lúc (AC-1).
- Trục C — lớp: lõi (AC-1…AC-4) | API (AC-3…AC-6) | màn (AC-7…AC-10) | khuôn (AC-11).
- Trục D — trạng thái màn: mặc định · bộ của sàn · trống · đang tải · lỗi · mất mạng · 375 (AC-7, AC-8, AC-10).
- Later: màn sửa bộ nhóm (48); nhóm riêng từng người; kịch bản nhiều bước; AI ưu tiên; nguồn ngoài; Xin dẫn xem; Mở số
  lead; «Chưa gọi được»; bản điện thoại M1.

## Đường đo

- «Thời gian lead → cuộc gọi đầu» (Tham chiếu §11): mốc nhận và gọi lần đầu ghi bằng nút ở AC-9 (đã có cột ở bảng lead).
- «Số căn gọi ép giá đợt hai»: hàm hàng đợi của lõi là hàm thuần trên sự kiện và bộ nhóm (AC-1, AC-2), nên chạy lại trên dãy sự kiện
  của từng căn đếm được số lần căn vào nhóm Nên gọi ép giá; căn vào lần thứ hai là «đợt hai» (đếm bằng lệnh sau hai tuần
  thử, theo luật mốc ép giá chốt ở Hỏi-1).

## Out of scope

- Màn sửa bộ nhóm (hàng 48) — hàng này có lối ghi API cho quản trị sàn, chưa có màn.
- Nhóm riêng của từng người, kịch bản nhiều bước tự chạy, AI chấm ưu tiên, điều kiện theo nguồn ngoài.
- Mở số của lead cho đầu chủ (Hỏi-3).
- «Chưa gọi được» (không nghe máy) — chưa có sự kiện; căn ở lại nhóm.
- Hàng đợi Xin dẫn xem; Hôm nay của đầu chủ trên điện thoại (M1); màn sửa ngưỡng (hàng 48); đổi đầu chủ hàng loạt (89);
  vá đường lỗi hoàn tác (88).
- Tạo hàng từ lead trên màn này.

## Notes

- Vùng của hàng: `apps/web/src/app/(app)/today/**`, cộng các thư mục khai ở Cổng Phạm vi.
- Ngoài-1 (máy định tuyến 2026-11-01, đề xuất S4 known-limits): Sau khi đầu chủ đổi giá hay trạng thái một căn ở Bảng hàng hoặc Hồ sơ, căn đó có thể tạm biến khỏi màn Hôm nay cho đến lần tải lại dữ liệu kế tiếp. Nếu lần tải lại đó lỗi hoặc mất mạng thì căn vắng lâu hơn, và màn không báo gì. — `packages/api/src/listings/routes.ts`
- Known limits — chọn ở Cổng Bằng chứng 2026-11-02:
  - Ngoài-1: Sau khi đầu chủ đổi giá hay trạng thái một căn, căn đó có thể tạm biến khỏi màn Hôm nay tới lần đồng bộ kế tiếp; mất mạng thì vắng lâu hơn và màn không báo.
