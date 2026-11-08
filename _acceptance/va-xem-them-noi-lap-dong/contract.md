---
schema_version: 1
feature: "Hàng vá va-xem-them-noi-lap-dong: «Xem thêm» nối đúng trang sau khi gõ rồi xoá nhanh ô tìm (Ngoài-1 của khung-ho-so-lien-he, #199)"
slug: va-xem-them-noi-lap-dong
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
design_doc: _acceptance/va-xem-them-noi-lap-dong/design.md
approved_by:
approved_at:
---

# Acceptance Contract: va-xem-them-noi-lap-dong

## Context

Hàng `khung-ho-so-lien-he` đã gộp (#199). Ở Cổng Bằng chứng, chủ kho chọn «mở hợp đồng mới» cho Ngoài-1 (sổ
`_acceptance/khung-ho-so-lien-he/decisions.jsonl` d-20261108T024501Z-24): trên màn Liên hệ, sau khi đã bấm «Xem thêm», gõ
rồi xoá ô tìm trong 250 ms làm con trỏ «Xem thêm» quay về trang 1, nên lần bấm kế nối lặp dòng. Gốc lỗi và cách sửa:
`_acceptance/va-xem-them-noi-lap-dong/design.md`. Dữ liệu mẫu: `[Tên]`, `0900 000 0xx`.

## Criteria

- **AC-1 — Lượt không đọc lại giữ con trỏ trang cuối.** Given danh sách Liên hệ đã nối trang 2 (trang cuối mang con trỏ của
  trang 3) · When ô tìm đổi rồi trở về như cũ trước khi hết 250 ms chờ gõ, nên lượt ấy không đọc lại (hay hiệu ứng đọc chạy
  lại khi bảng đã đúng bộ lọc) · Then trang cuối vẫn là trang đã nối sau cùng — con trỏ của trang 3 — không quay về con trỏ
  của trang máy chủ trao lúc mở màn; chỉ khi máy chủ vừa trao một trang mới đúng bộ lọc ấy thì trang cuối lấy con trỏ của
  trang mới; lúc mở màn có trang máy chủ thì trang cuối là trang ấy (đối chứng: «Xem thêm» bấm được ngay lần mở đầu).
- **AC-2 — Lần «Xem thêm» kế nối đúng trang sau, không dòng lặp.** Given kịch bản AC-1 phát lại từng bước trên luật thật
  của màn (`khoaLoc`, `canDocLan`, `conTroXemThem`, `duocNoi` và luật mới) với ba trang dữ liệu mẫu · When bấm «Xem thêm»
  sau khi ô tìm đã trở về · Then yêu cầu gửi con trỏ của trang 3, bảng có đủ dòng của trang 1, 2, 3 theo đúng thứ tự, không
  dòng nào lặp; luật trước bản vá chạy trên cùng kịch bản thì gửi lại con trỏ của trang 2 và lặp đủ một trang (chứng đó là
  kịch bản lỗi). Cùng bộ phát lại: với bốn trang (50, 50, 50, 10), hai lần «Xem thêm» liền sau gõ-xoá gửi con trỏ trang 3
  rồi trang 4, bảng 160 dòng không trùng; gõ-xoá trong lúc trang 2 đang về thì trang ấy về sau không được nối (luật lượt
  đọc của `va-ho-so-lien-he`), lần bấm kế gửi lại con trỏ trang 2 và nối nó đúng một lần; vẽ lại với cùng trang máy chủ
  (cùng đối tượng) giữ con trỏ trang 3, còn trang máy chủ mới đúng bộ lọc thì bảng thay bằng trang ấy và con trỏ là của nó
  trong cùng lượt. Năm ca cũ của «Xem thêm» (`va-ho-so-lien-he` AC-2) vẫn đạt.
- **AC-3 — Màn Liên hệ dùng đúng luật ấy, giao diện không đổi.** Given màn Liên hệ của một Đầu chủ có hơn hai
  trang liên hệ · When bấm «Xem thêm», gõ rồi xoá một ký tự ô tìm trong 250 ms, rồi bấm «Xem thêm» lần nữa · Then yêu cầu
  «Xem thêm» thứ hai mang con trỏ khác yêu cầu thứ nhất, trên màn không tên nào lặp và các dòng đi đúng thứ tự trang; trong
  `vung.tsx` trang cuối khởi đầu từ trang máy chủ qua luật của AC-1, nhánh không đọc lại chỉ đổi trang cuối qua luật ấy
  (không còn gán trang máy chủ lúc mở màn), trang máy chủ mới nhận theo đối tượng và khi trang cuối lấy con trỏ của nó thì
  bảng thay bằng nó trong cùng nhánh, mọi chỗ đặt trang cuối đổi cùng lúc con trỏ đã nối, và so với bản trước, JSX, chữ và mọi đường đọc khác không đổi; tệp màn vẫn theo
  khuôn nhóm Liên hệ.

## Coverage

Quét độ phủ làm ngay trong hợp đồng (sổ quyết định, dòng thay dòng «bỏ coverage-scan»): ba trục, mọi ô có tiêu chí.

- Trục **lượt hiệu ứng** — mở màn có trang máy chủ (AC-1) | mở màn không trang máy chủ (AC-1) | không đọc lại, không trang
  mới (AC-1, AC-2) | vẽ lại với cùng trang máy chủ (AC-2) | có trang máy chủ mới đúng bộ lọc (AC-1, AC-2) | trang máy chủ
  mới của bộ lọc khác (AC-1) [thước CE: hai nhánh của hiệu ứng đọc danh sách trong `vung.tsx` cộng khởi đầu trạng thái và
  cách nhận trang máy chủ mới theo đối tượng]
- Trục **«Xem thêm» lúc gõ-xoá** — rảnh (AC-2, AC-3) | đang về (AC-2) [thước CE: luật lượt đọc `duocNoi` của
  `va-ho-so-lien-he`]
- Trục **số lần «Xem thêm» sau gõ-xoá** — một (AC-2, AC-3) | hai liền (AC-2) [thước CE: câu giao của hàng]

## Đường đo

Không áp: ô cơ hội của hàng vá không khai ngưỡng nghiệm thu (đã quyết ở Cổng Bằng chứng #199, không phiên nghiệm thu); lưới
là các eval máy, một lượt nhìn màn và một eval đọc dưới đây.

## Out of scope

- Đổi loại hay dấu rồi đổi lại nhanh qua URL (cột thứ hai) — lượt đổi bộ lọc không chờ 250 ms nên đọc lại ngay; câu giao chỉ
  nói ô tìm. Cùng luật mới vẫn áp nếu lượt ấy không đọc lại.
- «Xem thêm» lỗi mạng không báo gì — Known limits đã ghi ở Cổng Bằng chứng hàng 103 (Ngoài-5).
- API, quyền, migration của danh sách liên hệ — hàng vá chỉ sửa luật con trỏ phía màn.

## Notes

- Vùng: `apps/web/src/app/(app)/contacts/**`, `_acceptance/va-xem-them-noi-lap-dong/**`.
- Nguồn: Ngoài-1 của `khung-ho-so-lien-he` (#199), `_acceptance/khung-ho-so-lien-he/decisions.jsonl` d-20261108T024501Z-24.
