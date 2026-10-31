---
schema_version: 1
feature: Telesales nhập lead đủ năm mục trên máy tính và thấy ngay kết quả kiểm trùng: không trùng, đã có đầu chủ, hay căn đã có hàng mở
slug: o-nhan-lead
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api, db]
status: draft
design_doc: docs/superpowers/specs/2026-10-31-o-nhan-lead-design.md
---

# Acceptance Contract: o-nhan-lead

## Context

Hàng 24 của lộ trình (dãy L, đợt `dau-chu-dong-vao`), đứng trên hàng 5 (dữ liệu mẫu), 9 (gõ mã căn), 11 (lớp trường
nguồn), 53 (vỏ). Màn P0 «Ô nhận lead · Telesales · máy tính» (Tham chiếu §10, L1–L3); luật 19–21 (Tham chiếu §8). Hàng
dựng cửa vào và phép kiểm trùng: bảng `leads` mới (migration 007), dữ kiện kiểm trùng ở cơ sở dữ liệu, luật quyết kết quả
ở `packages/core/src/dedupe/`, lối API `/api/v1/leads`, màn `/leads/new`. Chia lead, hạn và báo trưởng nhóm là hàng 25.
Năm câu Hỏi-1..5 soạn theo khuyến nghị; chủ kho chốt ở Cổng Phạm vi.

Source input: `docs/plan/lo-trinh.json` hàng 24 · `_acceptance/o-nhan-lead/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-10-31-o-nhan-lead-design.md`

Từ ngữ: «năm mục» = số chủ nhà, căn hoặc toà, nhu cầu, giá kèm điều kiện phí, thời gian muốn ra hàng; «hàng mở» = hàng
của sàn ở Chưa đủ để rao, Đang bán, Đang giao dịch hay Tạm ngừng; «người nhập» = người gửi lead; «bản của telesales» =
câu trả lời API cho người nhập; «bộ mẫu» = `packages/db/seed/mau/du-lieu-mau.json` của hàng 5.

## Criteria

- AC-1: Given lõi của `packages/core`, When kiểm một lead, Then lead hợp lệ khi và chỉ khi đủ năm mục đúng dạng: số chủ
  là số Việt Nam (dấu cách, chấm, gạch, `+84` được chuẩn hoá về 10 chữ số), toà là chữ 1–200 ký tự, căn tuỳ chọn, nhu cầu
  một trong ba giá trị, giá là số đồng nguyên dương kèm điều kiện phí `included`/`excluded`, thời gian một trong bốn nấc;
  thiếu hay sai mục nào thì lỗi nêu đúng khoá ấy; khoá lạ bị từ chối kể cả khoá nguồn khác (`ownerName`, `floorPrice`).
- AC-2: Given hai dữ kiện «hàng mở trên căn» và «đầu chủ của chủ nhà», When lõi quyết kết quả, Then đúng bảng bốn ô:
  có hàng mở (có hay không đầu chủ) → căn trùng, người nhận là đầu chủ của hàng ấy; chỉ có đầu chủ → chủ trùng, người
  nhận là đầu chủ ấy; không có gì → không trùng, không người nhận.
- AC-3: Given sàn đã nạp hàng và chủ nhà của bộ mẫu, When telesales nhập lead L-01 của bộ mẫu (căn trên hàng đang mở) qua
  API, Then kết quả là căn trùng với đúng đầu chủ của hàng ấy, dòng lead ghi kết quả và hàng khớp; cùng căn nhưng hàng ở
  Đã bán hay Ngừng hẳn thì không trùng; mã căn gõ khác dạng (chữ thường, dấu cách, chấm thay gạch) vẫn khớp. (cross-layer)
- AC-4: Given sàn đã nạp bộ mẫu, When telesales nhập lead L-02 (số của chủ nhà CN-01 đã có đầu chủ) trên một căn chưa có
  hàng mở, Then kết quả là chủ trùng với đúng đầu chủ giữ chủ nhà ấy; số viết dạng `+84 900 000 001` vẫn khớp; lead thứ
  hai cùng số một chủ mới sau khi lead đầu đã về một đầu chủ cũng về đầu chủ ấy. (cross-layer)
- AC-5: Given sàn đã nạp bộ mẫu, When telesales nhập một lead không khớp số hay căn nào (gồm lead chỉ biết toà), Then kết
  quả là không trùng: dòng lead ghi kết quả `new`, không đầu chủ khớp, không hàng khớp (chờ hàng 25 chia). (cross-layer)
- AC-6: Given hai sàn, sàn B có hàng mở trên cùng toà, cùng căn và chủ nhà cùng số với lead của sàn A, When telesales sàn
  A nhập lead ấy, Then kết quả là không trùng; người sàn B không đọc được lead sàn A; bảng `leads` bật và ép luật theo
  dòng và bộ kiểm cách ly có ca cho nó. (cross-layer)
- AC-7: Given telesales vừa nhập lead (mọi kết quả), When đọc bản của telesales (lúc tạo và `GET /api/v1/leads/{id}`),
  Then bản chỉ có kết quả, tên đầu chủ nhận, năm mục trừ số chủ, lúc nhập, cờ đã bỏ — không mã hàng, không trường nào của
  hàng, không số chủ ở dạng nào; vai API đọc thẳng cột `leads.owner_phone` bị từ chối; lead người khác nhập trả 404.
  (cross-layer)
- AC-8: Given lead căn trùng, When người nhập bấm «Bỏ lead này», Then dòng lead còn nguyên, ghi người bỏ và lúc bỏ; lần
  bỏ thứ hai trả 409; bỏ lead kết quả khác trả 400; người khác bỏ trả 404; lead đã bỏ không còn làm «đầu chủ của chủ nhà»
  cho lần kiểm sau. (cross-layer)
- AC-9: Given vai trong sàn, When gửi lead, Then telesales, đầu chủ, trưởng nhóm gửi được; đầu khách và quản trị sàn
  không kiêm ba vai ấy nhận 403 và không dòng nào được ghi; chưa đăng nhập nhận 401. (cross-layer)
- AC-10: Given màn `/leads/new` trên máy tính đang chạy, When telesales điền năm ô và gửi, Then thấy năm ô với nhãn của
  Tham chiếu, dòng «Hiểu là…» của giá, lỗi dưới đúng ô khi thiếu; mã căn ngoài danh mục thì báo và vẫn chọn toà được;
  trong lúc gửi nút «Đang kiểm trùng…» khoá; rồi Alert kết quả đúng chữ của ba dạng, năm ô trống lại và tiêu điểm về ô số
  chủ; «Bỏ lead này» chỉ hiện ở dạng căn trùng và sau khi bỏ hiện «Đã bỏ lead này — có ghi lại»; lỗi mạng giữ nguyên chữ
  đã gõ.

## Coverage

Quét morphological-scan, preset entity-feature, cho thực thể «một lead lúc nhập».

- Trục kết quả: không trùng (AC-2, AC-5) | chủ trùng (AC-2, AC-4) | căn trùng (AC-2, AC-3) | cả hai trùng → căn thắng
  (AC-2) [thước CE: Tham chiếu §8 luật 20, §4 «tối đa một hàng đang mở trên một căn»]
- Trục khớp căn: không có căn (chỉ toà, AC-5) | căn trên hàng mở (AC-3) | căn trên hàng nấc cuối (AC-3) | mã khác dạng
  (AC-3) | căn ghi tay khác tên toà với danh mục — Never ở hàng này (chuẩn hoá ADR-0011, hàng 63)
- Trục khớp số: không (AC-5) | chủ nhà đã có đầu chủ (AC-4) | số khác dạng (AC-1, AC-4) | lead trước đã về đầu chủ
  (AC-4) | lead trước đang chờ chia — Later (hàng 25) | lead trước đã bỏ (AC-8)
- Trục sàn: cùng sàn (AC-3..AC-5) | sàn khác (AC-6)
- Trục vai người nhập: telesales (AC-3..AC-5, AC-7) | đầu chủ, trưởng nhóm (AC-9) | đầu khách, quản trị sàn (AC-9) |
  chưa đăng nhập (AC-9)
- Trục rò: bản của telesales (AC-7) | đọc thẳng cột số (AC-7) | lead người khác (AC-7, AC-8) | sàn khác (AC-6)
- Trục lớp: lõi thuần (AC-1, AC-2) | cơ sở dữ liệu + API (AC-3..AC-9) | màn (AC-10)
- Trục trạng thái màn: trống, thiếu, đang gửi, ba kết quả, đã bỏ, lỗi (AC-10) [thước CE: bảng trạng thái của design doc]

## Đường đo

Ô cơ hội khai số đo hai tuần thử «Số lead trùng bị chặn», ngưỡng số chưa đặt:

- «Số lead trùng bị chặn» = số dòng `leads` có kết quả chủ trùng hay căn trùng trong khoảng đo (đếm theo `created_at`,
  tách hai loại), trừ lead căn trùng đã bỏ đếm riêng ← AC-3, AC-4 (kết quả ghi trên dòng lead), AC-8 (bỏ có ghi lại);
  số từ bảng `leads` bằng một câu đếm, không cần mã mới. Lead trùng số với lead đang chờ chia chưa đếm được tới hàng 25
  (Hỏi-5).
- «Telesales thấy ngay kết quả kiểm trùng» ← AC-10 (Alert trong cùng lần gửi) và AC-7 (bản của telesales).

## Out of scope

- Chia lead theo luật của sàn, hạn nhận 15 phút, hạn gọi 30 phút, báo trưởng nhóm — hàng 25.
- Thông báo lead cho đầu chủ — hàng 26.
- Bốn nấc của lead và danh sách lead đã nhập (cột phải của L1, khối `list-11`), «Sửa số và gửi lại» — hàng 27.
- Lead thành hàng khi đầu chủ nhận; tin bổ sung hiện ở hồ sơ căn — hàng 25, 22, 17.
- Lead trùng số với lead khác đang chờ chia — hàng 25 (Hỏi-5).
- Ô nhận lead trên điện thoại (L4, L5) — P1.
- Mã hoá số chủ trong `leads` — hàng 62 (migration 008).
- Kiểm trùng ở nhập Excel và các cửa vào khác — hàng 64–71 (ADR-0011) dùng lại lõi này.
- Gửi lead khi mất mạng.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Bất biến chạm: (1) cách ly — bảng `leads` mới mang luật theo dòng và ca trong bộ kiểm cách ly; hàm dữ kiện chỉ nhìn sàn
  đang làm (AC-6); (2) chủ nhà — số chủ của lead là lớp `source`: cột không cấp quyền đọc cho vai API, bản của telesales
  không mang số, hàm dữ kiện không trả số (AC-7); (3) người bấm gửi — không chạm; (4) phần nội bộ không ra trang khách —
  không chạm, bản của telesales dựng ở lõi.
- Không sửa `packages/core/src/data-classes.ts` hay `agreements.ts`: lớp `source` và trần đã có.
- Dãy L chạy Postgres 5563 (container `quy-hang-db-L`), dev 3483. Migration số 007 và ADR-0012 do giám sát giữ chỗ.
