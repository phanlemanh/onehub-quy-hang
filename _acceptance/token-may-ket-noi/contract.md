---
schema_version: 1
feature: Bên kia của một thoả thuận gọi API bằng token máy gắn đúng thoả thuận ấy, đẩy gói danh mục không cần phiên của quản trị sàn, và lời gọi kế bị từ chối ngay khi thoả thuận tắt hay token bị thu hồi.
slug: token-may-ket-noi
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api]
status: signed-off
approved_by: Manh Phan
approved_at: 2026-11-09
design_doc: docs/superpowers/specs/2026-11-09-token-may-ket-noi-design.md
---

# Acceptance Contract: token-may-ket-noi

## Context

Hàng 96 của lộ trình, Cổng Đáng đã quyết `build` ngày 05/11. Hạng **T3** (`packages/db/**`, `packages/core/src/agreements.ts`).
Bất biến chạm: (1) cách ly giữa công ty, hai bảng mới và một đường vào không có phiên. Chưa có bên nào gọi thật; hàng 97 dùng lại cổng này.

Source input: `docs/plan/lo-trinh.json` hàng 96 · `_acceptance/token-may-ket-noi/opportunity.md` · ADR-0015 · ADR-0027 · issue #94 việc 3.

## Criteria

- AC-1: Given quản trị sàn và thoả thuận đúng loại đang hiệu lực, When cấp token, Then nhận 201 kèm token đúng dạng `qhm_` và
  `Cache-Control: no-store`; đọc danh sách chỉ có mã nhận diện ngắn; quét mọi cột của `machine_tokens` và `machine_token_calls`
  sau một lượt cấp và gọi thì không cột nào chứa token rõ; băm lưu bằng SHA-256 của token (cross-layer).
- AC-2: Given ma trận ba người (chưa đăng nhập, thành viên không phải quản trị, quản trị sàn khác) × ba lệnh (cấp, đọc, thu hồi),
  When gọi, Then 401, 403, 404 đúng từng ô; với lệnh cấp: loại hay chiều không cấp được thì 400, thoả thuận không hiệu lực thì 403, token
  còn sống vượt trần thì 409, hai lời cấp song song khi còn một chỗ chỉ một lời thành công; thu hồi chạy ở mọi trạng thái của thoả
  thuận, `tokenId` của thoả thuận khác thì 404 không đổi gì, thu hồi lại thì 204 và giữ nguyên mốc cũ (cross-layer).
- AC-3: Given token của thoả thuận `catalog_source` chiều vào của sàn được tin, không phiên, không header `Origin`, When đẩy gói
  đúng khuôn, Then 200 và dòng ghi mang đúng thoả thuận gắn token kể cả khi sàn có thoả thuận hợp lệ khác tạo trước; đẩy lại không
  nhân đôi; gói sai khuôn 422 không ghi; đường phiên của quản trị sàn cho kết quả như trước (cross-layer).
- AC-4: Given token hợp lệ, When gọi ngoài phạm vi của nó, Then token của thoả thuận `catalog_confirmation` gọi cửa nhận, và token mà thoả thuận bị đổi chiều sau khi cấp, đều bị 403
  `token-scope` không ghi dòng nào; mọi route đã đăng ký khác trả đúng mã như lời gọi không có header (số route so bằng số đếm từ
  tài liệu OpenAPI); kèm cookie sàn khác thì vẫn ghi theo sàn của token và không đổi dòng nào của sàn cookie (cross-layer).
- AC-5: Given hai sàn, When sàn B đọc, chèn, sửa trên `machine_tokens` và `machine_token_calls` bằng vai API, Then không thấy, không
  ghi được dòng của sàn A; token không gắn được vào thoả thuận của sàn khác kể cả khi câu ghi tự đặt `company_id`; hàm tra theo băm
  trả đúng một dòng với băm đúng và không dòng với chuỗi sai dạng hay băm khác; migration 041 cho cùng luật, quyền, ràng buộc khi áp trước
  042–052 và khi áp sau 052, áp lại lần hai không lỗi.
- AC-6: Given token từng gọi được, When thu hồi, hay thoả thuận `paused`, `ended`, quá `valid_until`, hay sàn rời danh sách tin, Then
  lời gọi kế bị 401 với thu hồi và 403 `agreement-inactive` với các ca còn lại, không ghi dòng nào; token hỏng kèm cookie quản trị còn
  sống vẫn 401, không rơi về phiên; bật lại sau `paused` và gia hạn sau quá hạn thì gọi được lại, mở lại sau `ended` thì vẫn 401 (Hỏi-6);
  tắt thoả thuận giữa lúc kiểm và lúc ghi thì 403 và gói không vào; thu hồi sau bước tra token thì 401; thu hồi giữa lúc ghi thì lần đang
  chạy xong và lời kế bị 401 (cross-layer).
- AC-7: Given ma trận sáu kết cục (`accepted`, `invalid_payload`, `wrong_connection`, `agreement_inactive`, `token_revoked`,
  `server_error`), When gọi một lần mỗi kết cục, Then đúng một dòng nhật ký mỗi lời gọi với đúng kết cục, mã trả, token, thoả thuận, sàn; số dòng bằng số
  lời gọi; token lạ không sinh dòng; ghi nhật ký lỗi ở lần hợp lệ thì gói không vào (cross-layer).
- AC-8: Given vai API của cơ sở dữ liệu, When sửa băm, huỷ thu hồi, thu hồi lại token đã thu hồi, sửa hay xoá dòng nhật ký, Then đều
  bị từ chối hoặc không đổi dòng nào; token rõ không xuất hiện trong `console` ở lần thành công và lần lỗi; tài liệu OpenAPI khai
  được đường token cho cửa nhận.

## Coverage

Quét bằng morphological-scan, preset test-matrix:

- Trục A — ai gọi: chưa đăng nhập | thành viên | quản trị sàn | quản trị sàn khác | máy có token [thước CE: SUY-TỪ-REPO `packages/api/src/catalog/feeds.ts`]
- Trục B — trạng thái token: đúng | lạ | sai dạng | đã thu hồi [thước CE: NGÀNH RFC 6750, MLS Grid]
- Trục C — trạng thái thoả thuận: active | paused | ended | chưa tới hạn | quá hạn | loại khác | chiều khác | sàn ngoài danh sách tin [thước CE: SUY-TỪ-REPO `packages/core/src/agreements.ts`]
- Trục D — lớp chặn: lõi | API | luật theo dòng | ràng buộc [thước CE: SUY-TỪ-REPO `AGENTS.md` bất biến 1]
- Trục E — thời điểm: trước lúc kiểm | giữa lúc kiểm và ghi | lời gọi kế [thước CE: SUY-TỪ-REPO `packages/api/test-db/catalog/nhan-goi.test.ts`, móc `truocKhiGhi`]

Core: A×lệnh quản lý → AC-1, AC-2 · A(máy)×B(đúng) → AC-3 · B(đúng)×C(loại, chiều) và mọi route khác → AC-4 · D(luật dòng, ràng buộc) → AC-5, AC-8 · B×C×E → AC-6 · kết cục × nhật ký → AC-7.
Later: giới hạn tần suất; hạn giữ nhật ký (Hỏi-8). Never: token gọi được đường của người (phiên), vì một khoá lộ sẽ thành quyền quản trị.

## Đường đo

- Hiện một lần, lưu băm: kết quả quét cột của AC-1.
- Không gọi được loại, chiều khác; không chạm sàn khác: AC-4, AC-5.
- Thu hồi hay tắt thì lời kế bị 401/403: AC-6.
- Mỗi lời gọi một dòng nhật ký: AC-7, phép đếm dòng bằng số lời gọi.

Số đo là kết quả eval máy, chưa có đường chảy thật cho tới khi Invest gọi.

## Out of scope

- Hộp thư đi và API kéo — hàng 97.
- Màn bật, tắt thoả thuận và đọc nhật ký — hàng 98.
- Giới hạn tần suất lời gọi bằng token và hạn giữ nhật ký (Hỏi-8).
- OAuth2 Client Credentials, hạn riêng của token (Hỏi-1, Hỏi-5).

## Notes

- Câu hỏi Cổng Phạm vi: Hỏi-1 cách bên kia gọi · Hỏi-2 số token còn sống · Hỏi-3 nhật ký với token lạ · Hỏi-4 màn cấp token · Hỏi-5 hạn riêng · Hỏi-6 token sau khi thoả thuận tắt · Hỏi-7 mã lỗi cho máy bên kia · Hỏi-8 tần suất và hạn giữ nhật ký (thiết kế §8).
- Không đổi khuôn danh mục v1. Migration 041 do giám sát giữ cho hàng 96.
- Known limits — chọn ở Cổng Bằng chứng 2026-11-09:
  - Ngoài-1: Khi máy bên kia nhận lỗi 500 hàng loạt, người vận hành chỉ thấy mã lỗi chung nên khó truy ra nguyên nhân; khách và dữ liệu không bị ảnh hưởng.
