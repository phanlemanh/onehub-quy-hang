---
schema_version: 1
feature: Gói «nguồn danh mục và thị trường» phiên bản 2 — danh mục kèm độ chắc từng giá trị, số thị trường theo toà và loại căn có mốc đo, tin rao công khai đã khớp căn — được nhận vào vùng dùng chung khi thoả thuận đang bật; gói v1 vẫn nhận trong thời gian chuyển
slug: khuon-nguon-danh-muc-v2
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api]
status: verified
approved_by: Manh Phan
approved_at: 2026-11-09
design_doc: docs/superpowers/specs/2026-11-09-khuon-nguon-danh-muc-v2-design.md
---

# Acceptance Contract: khuon-nguon-danh-muc-v2

## Context

Hàng 94 của lộ trình, Cổng Đáng đã quyết `build` ngày 05/11. Hạng **T3** (`packages/connect/**`, `packages/db/**`). Bất biến chạm: (1) cách ly, hai bảng mới ở vùng dùng chung; (2) lớp nguồn không vào khuôn.
Chưa có bên nào đẩy v2 thật; DN5 của Invest đợi khuôn này.

Source input: `docs/plan/lo-trinh.json` hàng 94 · `_acceptance/khuon-nguon-danh-muc-v2/opportunity.md` · ADR-0015 · ADR-0017 §5 của Invest · `docs/plan/pham-vi-xac-nhan-danh-muc.md` · issue #94 việc 1.

## Criteria

- AC-1: Given gói v2 mẫu sinh từ khuôn và thoả thuận `catalog_source` đang bật của sàn được tin, When đẩy bằng phiên quản trị và bằng token máy, Then 200 đúng số đếm; `catalog_units.field_confidence` đúng từng giá trị; mỗi khu có đúng một ảnh chụp số thị trường và một ảnh chụp tin rao đúng nội dung; đẩy lại created 0, số dòng ba bảng không đổi (cross-layer).
- AC-2: Given gói v1, When đẩy, Then kết quả và phản hồi như trước hàng này (bộ `nhan-goi` xanh, thân trả đúng tập khoá cũ); căn từng có nhãn mà gói v1 ghi lại thì nhãn về `null`; `schemaVersion` khác 1, 2 hay vắng thì 422 không ghi (cross-layer).
- AC-3: Given gói v2 lệch luật độ chắc, When đọc khuôn, Then từng ô của ma trận viết trước (nhãn ngoài ba nhãn · giá trị khác `null` thiếu nhãn · nhãn cho giá trị `null` · nhãn cho giá trị vắng · nhãn cho trường ngoài chín trường · nhãn cho `upi`) bị từ chối đúng một lỗi, đúng đường khoá.
- AC-4: Given phần số thị trường lệch khuôn, When đọc khuôn, Then từng ô (khu không có trong gói · toà không thuộc khu · đoạn trùng khoá · khu lặp · thấp > trung vị · trung vị > cao · giá không nguyên · giá ≤ 0 · số tin ≤ 0 · loại hình ngoài bảng loại hình · số phòng âm · mốc đo sai dạng · `bedroomsTotal` `null` ở loại hình có dùng · số phòng ở loại hình không dùng · hai đoạn cùng khoá có `null`) bị từ chối đúng đường khoá; `bedroomsTotal` `null` ở loại hình không dùng được nhận.
- AC-5: Given khu đã có ảnh chụp, When gói có mốc đo mới hơn hay bằng tới, Then ảnh của khu ấy thay nguyên, đoạn và tin cũ không còn, khu khác không đổi; When mốc đo cũ hơn, Then ảnh không đổi, danh mục cùng gói vẫn ghi, 200 và `staleSnapshotsSkipped` đúng (cross-layer).
- AC-6: Given phần tin rao lệch khuôn, When đọc khuôn, Then từng ô (`upi` không có trong gói · `upi` thuộc khu khác · `listingKey` sai dạng · `listingKey` trùng trong khu · giá ≤ 0 · giá không nguyên · `feeInclusion` ngoài tập · ngày sai dạng · khu không có trong gói · khu lặp) bị từ chối đúng đường khoá; `feeInclusion` `null` và mảng rỗng được nhận.
- AC-7: Given gói v2 mang khoá hay giá trị cấm, When đẩy, Then ma trận khoá (`sourceUrl`, `sourceName`, `domain`, `photos`, `imageUrl`, `listAgentFullName`, `ownerPhone` ở cả tám cấp của gói) và ma trận giá trị (dáng URL, `www.`, tên miền, số điện thoại ở mọi lá chuỗi của gói, trừ các trường tập đóng và ngày đã liệt trước; mã tin có đoạn dáng số điện thoại cũng bị từ chối) làm cả gói 422 nêu đường khoá, không dòng nào được ghi ở ba bảng; đối chứng: chuỗi sạch có dấu chấm như «A.2305» được nhận (cross-layer).
- AC-8: Given gói v2 hợp lệ, When thoả thuận `paused`, `ended`, quá hạn, sai loại, hay sàn rời danh sách tin, Then cả hai đường vào đều 403 và không dòng nào ở ba bảng đổi nội dung, kể cả khi khu đã có ảnh chụp; When thoả thuận tắt giữa lúc kiểm và lúc ghi, Then 403 và không phần nào của gói vào (cross-layer).
- AC-9: Given vai API của cơ sở dữ liệu, When đọc `segments`, `listings`, `agreement_id`, xoá dòng ảnh chụp, hay chèn hoặc sửa với thoả thuận không hiệu lực, Then bị từ chối; thoả thuận hiệu lực mới ghi đè được ảnh của thoả thuận cũ; hai bảng ép luật theo dòng; bộ kiểm cách ly xanh; `field_confidence` chỉ nhận đúng khoá và nhãn; migration 042 cho cùng luật, quyền, ràng buộc khi áp trước 043–052 và sau 052, áp lại lần hai không lỗi.
- AC-10: Given hàm sinh gói mẫu của khuôn, When chạy, Then ra gói qua được khuôn, đủ cả ba nhãn và cả ba phần, không có dữ liệu cá nhân thật, và đúng byte với tệp `catalog-feed-v2.example.json` trong kho.
- AC-11: Given đường token, When đẩy v2 đúng và sai khuôn, Then nhật ký gọi ghi `accepted` và `invalid_payload` đúng một dòng mỗi lời; tài liệu OpenAPI khai phản hồi v2; `CATALOG_FEED_VERSIONS` liệt đúng 1 và 2 (cross-layer).

## Coverage

Quét bằng morphological-scan, preset test-matrix:

- Trục A — phần của gói: đầu gói | danh mục có nhãn | số thị trường | tin rao [thước CE: SUY-TỪ-REPO `docs/plan/pham-vi-xac-nhan-danh-muc.md`, NGÀNH ADR-0017 §5 của Invest]
- Trục B — giá trị: đúng | thiếu | sai kiểu | khoá lạ | giá trị cấm [thước CE: SUY-TỪ-REPO `packages/connect/src/catalog-feed.ts`]
- Trục C — phiên bản: 1 | 2 | khác [thước CE: SUY-TỪ-REPO ADR-0015]
- Trục D — đường vào: phiên quản trị | token máy [thước CE: SUY-TỪ-REPO `packages/api/src/catalog/feeds.ts`]
- Trục E — thoả thuận: bật | tạm dừng | kết thúc | quá hạn | sai loại | ngoài danh sách tin | đổi giữa lúc ghi [thước CE: SUY-TỪ-REPO `packages/core/src/agreements.ts`]
- Trục F — lần gửi: đầu | lặp | mốc đo mới hơn | mốc đo bằng | mốc đo cũ hơn [thước CE: SUY-TỪ-REPO `docs/plan/lo-trinh.json` `bat_khi`]

Core: A×B → AC-3, AC-4, AC-6, AC-7 · C → AC-2 · A×D×F(đầu, lặp) → AC-1 · A(thị trường, tin)×F → AC-5 · E×D → AC-8 · lớp cơ sở dữ liệu → AC-9 · gói mẫu → AC-10 · nhật ký và tài liệu → AC-11.
Later: đọc và hiện (hàng 100, 102); bỏ v1. Never: đường dẫn, tên nguồn, tên miền, ảnh tin trong khuôn, vì lộ nguồn (ADR-0017 §5).

## Đường đo

- Gói v2 mẫu nạp được, chạy lại không nhân đôi: AC-1, AC-10.
- Gói v1 cũ vẫn nạp: AC-2.
- Khoá lạ, đường dẫn, tên miền, ảnh bị từ chối cả gói: AC-7.
- Gói số thị trường sau thay gói trước của cùng khu: AC-5.
- Tắt thoả thuận thì dừng nhận: AC-8.
- Bộ kiểm cách ly xanh: AC-9.

Số đo là kết quả eval máy, chưa có đường chảy thật cho tới khi Invest đẩy (DN5).

## Out of scope

- Đọc và hiện số thị trường, tin rao — hàng 102.
- Không điền sẵn giá trị chưa chắc — hàng 100.
- Bỏ khuôn v1 (Hỏi-5).
- Mặt bằng theo trục: ADR-0017 §5 có nêu, câu giao hàng 94 không có.
- Bước đẩy từ phía Invest (DN5).

## Notes

- Câu hỏi Cổng Phạm vi: Hỏi-1 loại căn · Hỏi-2 người đăng tin · Hỏi-3 căn chỉ có gói v1 · Hỏi-4 ai đọc · Hỏi-5 v1 tới khi nào · Hỏi-6 ảnh chụp đến muộn · Hỏi-7 ba nhãn độ chắc · Hỏi-8 nhãn bắt buộc · Hỏi-9 tin rao thay theo khu · Hỏi-10 chuỗi cấm từ chối cả gói · Hỏi-11 gói tự đủ · Hỏi-12 mặt bằng (thiết kế §7).
- Migration 042 do giám sát giữ cho hàng 94. Hợp đồng viết theo khuyến nghị của các Hỏi; AC-7 theo Hỏi-2: chọn chở người đăng thì `listAgentFullName` ra khỏi ma trận khoá.
