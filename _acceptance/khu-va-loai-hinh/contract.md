---
schema_version: 1
feature: Lõi, API và tài liệu gọi khu chứa căn là SubdivisionName, mỗi căn mang loại hình PropertyType và PropertySubType theo RESO, và trường dùng được của từng loại hình đọc từ một bảng dữ liệu của lõi
slug: khu-va-loai-hinh
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api]
status: approved
design_doc: docs/superpowers/specs/2026-10-31-khu-va-loai-hinh-design.md
approved_by: Manh Phan
approved_at: 2026-10-31T15:23:10Z
---

# Acceptance Contract: khu-va-loai-hinh

## Context

Hàng 72 (dãy D, đợt dau-chu-dong-vao), đứng trên hàng 9 và 63, đi trước hàng 10 và 24. ADR-0016 quyết định 1, 2, 8.
Hạng **T3**: dữ liệu mẫu ở `packages/db/seed/**` thuộc `t3_paths` (`packages/db/**`), trùng hạng hàng lộ trình. Bất biến chạm: (2) — kết quả tra chỉ lớp `catalog`.

Source input: `docs/plan/lo-trinh.json` hàng 72 · `_acceptance/khu-va-loai-hinh/opportunity.md` · `docs/adr/0016-moi-loai-hinh.md`
· thiết kế `docs/superpowers/specs/2026-10-31-khu-va-loai-hinh-design.md`

## Criteria

- AC-1: Given lõi tra, đường API, lệnh đo và dữ liệu mẫu, When tìm `projectKey`, `projectName`, khoá `projects` của danh
  mục và tham số `project` trong `packages/core/src/catalog`, `packages/api/src/catalog`, `packages/api/test-db/catalog`,
  `packages/db/seed`, `apps/web/src`, CONTEXT và Tham chiếu, Then không còn chỗ nào (trừ đúng một ca kiểm chứng tên cũ
  bị từ chối); khu là `subdivisionKey`/`subdivisionName` và danh mục là `subdivisions`.
- AC-2: Given danh mục mẫu, When tra qua `GET /api/v1/catalog/units/{code}` với `?subdivision=mau-du-an-thu`, `?subdivision=`
  một khu lạ, và `?project=mau-du-an-thu`, Then lần lượt 200 `found` đúng căn, 404 `not-found`, 400 (tên cũ bị từ chối,
  không bị lờ đi). (cross-layer)
- AC-3: Given mọi ca kiểm của hàng 9 và hàng 63 (lõi, API, Postgres), When chạy sau đổi tên, Then mọi ca có mặt với
  đúng tên cũ và xanh; lệnh đo tỉ lệ vẫn in `tự điền đúng 282/282 (100%) · chưa có 4/4 · điền đoán 0`.
- AC-4: Given dữ liệu mẫu sinh lại, When đọc danh mục, Then cả 180/180 căn mang `propertyType: "Residential"`,
  `propertySubType: "Condominium"`; sinh lại hai lần ra cùng tệp từng byte.
- AC-5: Given một căn tra ra `found`, When đọc thân trả về, Then căn mang đúng mười hai trường — mười trường cũ với khu đổi
  tên, cộng `propertyType`, `propertySubType` — mỗi trường lớp `catalog`; không khoá nào khác. (cross-layer)
- AC-6: Given bảng trường theo loại hình của lõi, When đọc nó, Then có đúng bốn loại hình với cặp RESO và tập «trường dùng
  được» viết trước theo ADR-0016 quyết định 2 (căn hộ · nhà phố · biệt thự · đất), không loại nào khác; hai vế còn lại
  của bảng (trường bắt buộc khi Sẵn sàng bán, mục của mức đủ) để hàng 76.
- AC-7: Given một căn mang trường không thuộc loại hình của nó (đất có `floor`, căn hộ có `lotSizeArea`, nhà phố có
  `stack`) hoặc cặp loại hình không có trong bảng (`Residential/Land`), When lõi kiểm căn, Then lõi trả lỗi gọi tên đúng
  căn, trường và loại hình; căn đúng loại hình không có lỗi; danh mục có căn lỗi thì dựng chỉ mục tra bị từ chối kèm
  lỗi ấy, danh mục mẫu dựng được.
- AC-8: Given CONTEXT và Tham chiếu, When đọc dòng «Căn», mục «Danh mục» và các chỗ gọi khu chứa căn, Then khu chứa căn
  được gọi theo nhãn chủ kho chọn ở Hỏi-1 kèm tên code `subdivisionName` (RESO SubdivisionName), không còn «dự án» làm
  tên khái niệm; có dòng loại hình `propertyType`/`propertySubType`; Tham chiếu §12 có một dòng ghi quyết định.
- AC-9: Given ADR-0016, When đọc sau Cổng Phạm vi, Then trạng thái và mục Hỏi-1..3 mang đúng câu chủ kho chọn; nhãn khu
  phụ trách trên màn Cài đặt sàn → Người dùng đổi theo Hỏi-1. (judgment)

## Coverage

Quét theo khuôn entity-feature của morphological-scan cho thực thể «khu và căn trong danh mục», trên ADR-0016
[SUY-TỪ-REPO: docs/adr/0016-moi-loai-hinh.md] và vùng mã của hàng 9.

- Trục tên: lõi · API · lệnh đo · dữ liệu mẫu · ca kiểm (AC-1, AC-3) | tài liệu (AC-8, AC-9) | tham số cũ (AC-2)
- Trục loại hình: dữ liệu mẫu (AC-4) | kết quả tra (AC-5) | bảng bốn loại (AC-6) | căn sai loại (AC-7)
  [thước CE: RESO DD 2.1 PropertyType 9 giá trị, PropertySubType 31 giá trị — bốn giá trị chọn có trong bảng]
- Trục hồi quy: hàng 9, 63 (AC-3)
- Later: dãy · lô, địa chỉ chuẩn, căn ngoài khu, mức đủ và luật ẩn theo loại hình (hàng 73–80); khuôn Invest v1 (hàng 10).
- Never: giữ tên cũ song song với tên mới.

## Đường đo

- Ngưỡng ô cơ hội «Không còn projectKey, projectName…; tra theo ?subdivision= ra đúng như hàng 9 và 63, ?project= bị từ
  chối; mọi căn mẫu mang Residential / Condominium; bảng bốn loại; lõi từ chối trường không thuộc loại hình» — số từ lệnh
  tìm tên cũ trên mã, dữ liệu mẫu, CONTEXT và Tham chiếu (AC-1, eval E1), ca kiểm API (AC-2, AC-3), ca kiểm lõi (AC-4, AC-6, AC-7).

## Out of scope

- Khuôn Invest `packages/connect` — hàng 10 dựng v1 thẳng tên mới.
- Dãy · lô, địa chỉ chuẩn, căn ngoài khu, kiểm trùng theo địa chỉ — hàng 73–80.
- Mức đủ theo loại hình (Hỏi-2) và luật ẩn theo loại hình (Hỏi-3) — chỉ ghi quyết vào ADR; làm ở hàng 76, 80.
- Hai vế còn lại của bảng trường theo loại hình — trường bắt buộc khi Sẵn sàng bán và mục của mức đủ — hàng 76.
- Ràng buộc theo loại hình ở cơ sở dữ liệu (ADR-0016 quyết định 2 «ở lõi và ở cơ sở dữ liệu») — đi cùng bảng danh mục
  của hàng 10 và bảng căn ngoài khu của hàng 76.
- Cột cơ sở dữ liệu cho loại hình — danh mục chưa có bảng (hàng 10).

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Dãy D chạy dev ở cổng 3485, Postgres 5565 (`quy-hang-db-D`). Yêu cầu D-7: chạm tệp ngoài vùng (ca kiểm Postgres của
  hàng 9 và 63, CONTEXT, Tham chiếu, ADR-0016, màn Cài đặt sàn → Người dùng).
