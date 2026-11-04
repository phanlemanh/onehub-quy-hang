---
schema_version: 1
feature: "Đầu chủ hoàn tác một lần sửa hay một lô mà máy không ghi được: thông báo nói đúng căn nào chưa trả về và vì sao, lần hoàn tác chưa xong vẫn bấm lại được, lỗi bất ngờ sau khi ô sửa đã đóng hiện thông báo thay vì im lặng"
slug: va-duong-loi-hoan-tac
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
design_doc: docs/superpowers/specs/2026-11-04-va-duong-loi-hoan-tac-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-11-04T02:39:36Z
---

# Acceptance Contract: va-duong-loi-hoan-tac

## Context

Hàng 88 của lộ trình. Gộp ba giới hạn cùng một đường lỗi hoàn tác: hàng 16 Ngoài-3 (chủ kho chọn «mở hợp đồng mới»: hoàn
tác lô báo thành công dù vài căn chưa ghi), hàng 15 vá Known limits Ngoài-1 (hoàn tác hỏng vẫn đánh dấu đã hoàn tác) và
Ngoài-3 (lỗi bất ngờ sau khi ô sửa đóng thì im lặng).

Source input: hàng 88 của `docs/plan/lo-trinh.json` · ô cơ hội `_acceptance/va-duong-loi-hoan-tac/opportunity.md` (ký
`build` 02/11) · `_acceptance/va-sua-tren-o/contract.md` Notes · `_acceptance/sua-hang-loat/review-findings.md`.

## Criteria

- AC-1: Given một lô 5 căn đã đổi trạng thái, When Đầu chủ bấm «Hoàn tác» mà kho trên máy không ghi được 2 trong 5 lệnh
  bù, Then thông báo (cùng loại thông báo trung tính với ghi lô một phần của hàng 16, không phải thông báo thành công) là
  «Đã hoàn tác 3 căn · 2 căn chưa hoàn tác được», mô tả kể đúng hai mã căn ấy và lý do của từng căn (tối đa năm mã, phần
  còn lại «và n căn khác»), và hai căn ấy được tích lại trên lưới.
- AC-2: Given thông báo ở AC-1, When Đầu chủ bấm «Hoàn tác» trên thông báo ấy sau khi kho ghi lại được, Then đúng hai căn
  chưa trả về nhận lệnh bù, ba căn đã về không nhận lệnh nào nữa, và thông báo là «Đã hoàn tác 2 căn»; căn chưa về mà có lần
  sửa sau thì bỏ qua và kể như luật cũ. Chỉ căn hỏng vì kho trên máy hay lỗi bất ngờ vào lượt bấm lại; căn hỏng vì luật của
  lõi (không còn thấy, chuyển không hợp lệ, thiếu điều kiện) kể vào «không hoàn tác được» và không bấm lại.
- AC-3: Given một lần sửa giá hay trạng thái trên ô có thông báo «Hoàn tác», When lệnh bù không ghi được, Then thông báo
  lỗi nói lý do và mang nút «Hoàn tác»; bấm nút ấy hay Ctrl/Cmd+Z thử lại đúng lần sửa ấy (không ra «Đã hoàn tác rồi»);
  thử lại thành công thì lần bấm sau ra «Đã hoàn tác rồi».
- AC-4: Given bốn chỗ ghi sau khi ô sửa đã đóng — lưu trên ô, hoàn tác trên ô, ghi lô, hoàn tác lô — When lần ghi ném lỗi
  bất ngờ (không phải lỗi kho đã biết), Then màn hiện thông báo lỗi nêu căn và chữ «Lỗi bất ngờ — chưa lưu được, thử lại»;
  không chỗ nào im lặng; không lỗi chưa bắt nào ra trình duyệt; cả bốn chỗ gọi lần ghi qua cùng một hàm bọc.
- AC-5: Given lô và lần sửa trên ô ghi được trọn, When hoàn tác, Then thông báo và hành vi như trước hàng này (thành công
  «Đã hoàn tác …», phần «đã có lần sửa sau» và «không hoàn tác được» như cũ, bấm lần hai ra «Đã hoàn tác rồi»).
- AC-6: Given Bảng hàng trên máy tính 1440, When tiêm lỗi ghi kho trên máy cho 2 trong 5 căn của một lô rồi hoàn tác và bấm
  lại, Then người thấy thông báo kể đúng hai mã căn (hai căn ấy đang tích trên lưới), rồi «Đã hoàn tác 2 căn», và trạng thái
  năm căn trên lưới về nấc cũ.
- AC-7: Given cây sau hàng này, When chạy kiểm kiểu, lint (luật `quy-hang-ui`, mức nợ 0, kiểm chuẩn), quét khuôn và sàn
  thiết kế M1, Then đều xanh.

## Đường đo

Ngưỡng của ô cơ hội: «Tiêm lỗi ghi ở kho trên máy cho 2 trong 5 căn của một lô rồi hoàn tác: thông báo kể đúng 2 căn chưa
trả về, bấm lại hoàn tác được 2 căn ấy; lỗi bất ngờ sau khi ô sửa đóng hiện thông báo; hoàn tác thành công không đổi hành
vi».

- Thước: lô 2/5 hỏng kể đúng căn và bấm lại được · số từ: E1, E2, E7 · bảo đảm bởi: AC-1, AC-2, AC-6
- Thước: lỗi bất ngờ không im lặng · số từ: E4 · bảo đảm bởi: AC-4
- Thước: thành công không đổi · số từ: E5 · bảo đảm bởi: AC-5

## Coverage

Quét bằng morphological-scan (preset test-matrix), ba trục:

- Trục A — chỗ ghi: lưu trên ô · hoàn tác trên ô · ghi lô · hoàn tác lô [thước CE: bốn lời gọi `sua` ở `tren-o.tsx` và
  `thanh.tsx`]
- Trục B — kết cục một lần ghi: thành · lỗi kho đã biết (`kho`) · lỗi lõi đã biết (`invalid-transition`,
  `missing-requirement`, `not-found`) · lỗi bất ngờ (ném ra) [thước CE: `LoiTrenMay` ở `lib/sync/ap-tren-may.ts` và nhánh
  `throw e` của `sua()`]
- Trục C — lượt bấm: lần đầu · bấm lại sau hỏng · bấm lại sau thành · Ctrl/Cmd+Z [thước CE: `taoSoHoanTac`, `dungLo`]
- Core: B × hoàn tác lô ở AC-1, AC-2; B × hoàn tác ô ở AC-3; lỗi bất ngờ × A ở AC-4; thành × C ở AC-5.
- Later: gom thông báo lỗi nhiều lô vào một chỗ xem lại · ghi nhật ký lỗi bất ngờ về máy chủ.
- Never: tự thử lại ngầm không báo người.

## Out of scope

- Đổi cách bộ đồng bộ gửi lên máy chủ hay xử lý «Cần xem».
- Hoàn tác «đã gọi» (vẫn không đảo được).
- Màn danh sách lỗi riêng; thông báo liệt tối đa năm mã căn.

## Notes

- Vùng của hàng: `apps/web/src/app/(app)/inventory/cell-edit/**`, `apps/web/src/app/(app)/inventory/bulk/**`.
