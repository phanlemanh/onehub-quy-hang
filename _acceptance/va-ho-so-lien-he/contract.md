---
schema_version: 1
feature: "Hàng vá va-ho-so-lien-he: ma trận vai phủ cả ba đường đọc liên hệ chủ nhà và đếm đủ ô (Ngoài-22 hàng 103); «Xem thêm» không trộn trang của bộ lọc cũ (AC-2 thấp hàng 103)"
slug: va-ho-so-lien-he
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, ui]
status: machine-cleared
design_doc: _acceptance/va-ho-so-lien-he/design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-11-05T11:46:24Z
---

# Acceptance Contract: va-ho-so-lien-he

## Context

Hàng 103 (`man-lien-he`) đã gộp (#126). Ở Cổng Bằng chứng, chủ kho chọn «mở hợp đồng mới» cho Ngoài-22: bộ kiểm vai của
màn Liên hệ không phủ đường xem hồ sơ và không đếm ô ở đường tìm theo số. Giám sát gom thêm phát hiện mức thấp AC-2 của
lượt chấm 4: «Xem thêm» trong 250 ms sau khi đổi bộ lọc có thể trộn trang của bộ lọc cũ vào danh sách mới (luật đợt 72).
Thiết kế: `_acceptance/va-ho-so-lien-he/design.md`. Dữ liệu mẫu: `[Tên]`, `0900 000 0xx`.

## Criteria

- **AC-1 — Ma trận vai trên bốn đường đọc liên hệ chủ nhà.** (cross-layer) Given một sàn thử có chín người và hai liên
  hệ chủ nhà — «giu» của người giữ còn vai Đầu chủ, «mat» của người giữ đã mất vai Đầu chủ (đổi sang Đầu khách) — và bảng
  kỳ vọng dưới đây · When mỗi người gọi danh sách, tìm theo số, xem hồ sơ và mở số trên từng liên hệ · Then mỗi ô cho đúng
  kết quả của bảng — đọc được: liên hệ có trong danh sách, tìm ra đúng liên hệ, hồ sơ 200, số rõ và thêm đúng một sự kiện mở
  số; chặn (có vai màn): không có trong danh sách, tìm theo số chỉ báo «đã có — người giữ», hồ sơ và mở số 404 cùng thân với
  liên hệ không có, không thêm sự kiện; vai ngoài màn: danh sách và tìm theo số 403, hồ sơ và mở số 404 cùng thân, không
  thêm sự kiện; không cookie: 401 ở cả bốn — bảng DOC trong tệp kiểm trùng từng ô với bảng này, và số ô đã kiểm bằng đúng
  4 × 9 × 2 = 72.

  Bảng kỳ vọng (căn cứ ADR-0021 qđ 3 «chỉ trưởng nhóm và người giữ còn vai Đầu chủ đọc»; vai vào màn: Đầu chủ, Trưởng nhóm):

  | Người | Vai | «giu» | «mat» |
  |---|---|---|---|
  | người giữ «giu» | Đầu chủ | đọc được | chặn |
  | người giữ «mat» (đã mất vai) | Đầu khách | vai ngoài màn | vai ngoài màn |
  | Đầu chủ khác | Đầu chủ | chặn | chặn |
  | người hai vai, không giữ | Đầu khách + Đầu chủ | chặn | chặn |
  | Trưởng nhóm | Trưởng nhóm | đọc được | đọc được |
  | Telesales | Telesales | vai ngoài màn | vai ngoài màn |
  | Đầu khách | Đầu khách | vai ngoài màn | vai ngoài màn |
  | Quản trị sàn | Quản trị | vai ngoài màn | vai ngoài màn |
  | không đăng nhập | — | 401 | 401 |
- **AC-2 — «Xem thêm» chỉ đi với bộ lọc của chính nó.** Given danh sách của một bộ lọc đang hiện và còn trang · When
  người xem đổi bộ lọc (loại, dấu, chuỗi tìm hay thử lại) rồi bấm «Xem thêm» trước khi danh sách mới về, hoặc trang «Xem
  thêm» về sau khi bộ lọc đã đổi · Then không con trỏ nào của bộ lọc cũ được gửi và không trang nào của bộ lọc cũ được nối;
  không đổi bộ lọc thì «Xem thêm» gửi đúng con trỏ và nối trang như trước.
- **AC-3 — Màn Liên hệ dùng đúng luật ấy.** (cross-layer) Given màn Liên hệ đang hiện danh sách một bộ lọc, còn trang · When
  người xem đổi loại rồi bấm «Xem thêm» trong lúc danh sách mới chưa về, và trang «Xem thêm» về sau danh sách mới · Then
  trên màn chỉ còn liên hệ của bộ lọc mới, không dòng nào lạc lọc; trong `vung.tsx` con trỏ chỉ lấy qua luật của AC-2 với
  khoá dựng từ đúng các giá trị bộ lọc dùng làm tham số của yêu cầu «Xem thêm» (loại và dấu trên URL, chuỗi tìm hiện tại),
  trang về chỉ nối khi luật cho nối, và nối vào danh sách đang hiện (không vào bản danh sách cũ giữ trong lúc gửi); chữ, khối
  và bố cục của màn không đổi so với bản trước, tệp màn vẫn theo khuôn nhóm Liên hệ.

## Coverage

Bỏ quét độ phủ (sổ quyết định, dòng «bỏ coverage-scan» bản thay): bốn trục đã liệt kê đủ trong bảng viết trước.

- Trục **đường đọc**: danh sách | tìm theo số | xem hồ sơ | mở số [thước CE: bốn route của
  `packages/api/src/contacts/read/routes.ts`, đủ cả bốn]
- Trục **người xem**: chín người như AC-1 [thước CE: `DOI` của bộ kiểm 103 cộng Quản trị và không cookie]
- Trục **liên hệ**: người giữ còn vai | người giữ đã mất vai [thước CE: ADR-0021 qđ 3, sổ 103 d-20261105T041349Z-11]
- Trục **«Xem thêm»**: cùng bộ lọc | đổi loại · dấu · chuỗi tìm · thử lại | đang tải | hết trang [thước CE: `khoaLoc`]

## Đường đo

Không áp: ô cơ hội của hàng vá không khai ngưỡng nghiệm thu (luật đợt 72 — đã quyết, không phiên nghiệm thu); lưới là các
eval máy, một lượt nhìn màn và một eval đọc dưới đây.

## Out of scope

- Sửa chú thích «dùng chung cho ba đường» và bảng `VAI` trong `packages/api/test-db/man-lien-he.test.ts` của 103 — tệp ngoài
  vùng của hàng; bộ kiểm mới thay vai trò ấy.
- Đổi quyền đọc liên hệ, API hay migration — hàng vá chỉ đo và sửa luật «Xem thêm» phía màn.
- «Xem thêm» lỗi mạng không báo gì, và lưới không tô dòng đang mở hồ sơ — chủ kho đã ghi Known limits ở Cổng Bằng chứng 103 (Ngoài-5, Ngoài-1).

## Notes

- Vùng: `apps/web/src/app/(app)/contacts/**`, `packages/api/test-db/man-lien-he/**`, `_acceptance/va-ho-so-lien-he/**`.
- Nguồn: Ngoài-22 hàng 103 (`_acceptance/man-lien-he/decisions.jsonl` d-20261105T094948Z-49), AC-2 thấp ở
  `_acceptance/man-lien-he/review-findings.md`, luật đợt 72.
- Ngoài-1 (máy định tuyến 2026-11-05, đề xuất S4 known-limits): Bài kiểm có một phép so với luật cũ luôn cho cùng kết quả, nên nó không chứng minh được luật cũ từng nối trang hai lần. Người dùng không bị ảnh hưởng, chỉ là bằng chứng kiểm kém chặt hơn lời ghi. — `apps/web/src/app/(app)/contacts/xem-them.test.ts`
- Ngoài-2 (máy định tuyến 2026-11-05, đề xuất S4 known-limits): Nếu sau này ai đó sửa màn Liên hệ làm hỏng việc cập nhật vị trí trang, bấm «Xem thêm» hai lần nhanh có thể làm hiện trùng dòng mà bài kiểm vẫn xanh. Hiện tại màn chạy đúng, chỉ chưa có bài kiểm chạm đúng đường ấy. — `apps/web/src/app/(app)/contacts/xem-them.test.ts`
- Ngoài-1 (máy định tuyến 2026-11-05, đề xuất S4 known-limits): Lần thử trên màn Liên hệ khi đổi sang Chủ cho thuê chỉ chạy với danh sách trống, nên chưa chứng minh được màn hiện đúng các dòng Chủ cho thuê. Người dùng không thấy lỗi nào; chỉ là bằng chứng kiểm kém chặt hơn lời ghi. — `_acceptance/va-ho-so-lien-he/evidence/E6-network.txt`
- Ngoài-2 (máy định tuyến 2026-11-05, đề xuất S4 known-limits): Phép thử chỉ cho thấy màn không có dòng lạc, chưa cho thấy các dòng Chủ cho thuê hợp lệ vẫn hiện đầy đủ sau khi đổi loại. Nếu sau này có lỗi làm mất các dòng đó, phép thử này vẫn xanh. — `_acceptance/va-ho-so-lien-he/evidence/E6-network.txt`
