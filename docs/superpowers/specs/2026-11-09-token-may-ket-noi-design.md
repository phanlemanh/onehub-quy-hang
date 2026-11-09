# Token máy của kết nối — thiết kế

Ngày: 2026-11-09 · Hàng 96 `token-may-ket-noi` · Dãy G · Hạng **T3** (`packages/db/**`, `packages/core/src/agreements.ts`).
Nguồn: câu giao và `bat_khi` của hàng 96 ở `docs/plan/lo-trinh.json` · ADR-0015 mục «Để sau: khoá máy cho Invest tự đẩy» ·
ADR-0027 (hàng 96 là token máy, hàng 97 là hộp thư đi) · phanlemanh/onehub-quy-hang#94 việc 3.

Không màn hình (Hỏi-4). Đường phiên của quản trị sàn ở cửa nhận danh mục giữ nguyên.

## 1. Việc làm được sau hàng này

Bên kia của một thoả thuận (trước hết là Invest) gọi `POST /api/v1/catalog/feeds` với `Authorization: Bearer <token>`, không
cần phiên của ai. Token gắn đúng một thoả thuận. Thoả thuận tắt, hết hạn, hay token bị thu hồi thì lời gọi kế bị từ chối.
Hàng 97 dùng lại cùng cổng này cho API kéo sự kiện.

## 2. Dữ liệu (migration 041, số giám sát giữ cho hàng 96)

`machine_tokens`: `id`, `company_id`, `agreement_id`, `token_hash` (SHA-256 hex, duy nhất), `display_prefix` (tám ký tự đầu phần
ngẫu nhiên), `created_by`, `created_at`, `revoked_at`, `revoked_by`.

`machine_token_calls`: `id`, `company_id`, `token_id`, `agreement_id`, `called_at`, `method`, `route`, `http_status`, `outcome`.
`outcome` là tập đóng: `accepted`, `invalid_payload`, `wrong_connection`, `agreement_inactive`, `token_revoked`, `server_error`.

Luật:

- Cả hai bảng `enable` + `force row level security` theo `app.current_company_id()`, mỗi bảng một ca trong bộ kiểm cách ly.
- Khoá ngoại ghép `(agreement_id, company_id)` → `agreements (id, company_id)`: token không gắn được vào thoả thuận của sàn
  khác kể cả khi câu ghi tự đặt `company_id`. Nhật ký ghép `(token_id, company_id)` tương tự.
- Thu hồi một chiều, chặn ở cơ sở dữ liệu: vai API chỉ được `update (revoked_at, revoked_by)`, luật `using (revoked_at is null)
  with check (revoked_at is not null)`. Không cột nào khác sửa được, token đã thu hồi không sống lại.
- Nhật ký chỉ thêm: vai API có `select, insert`, không `update`, `delete`.
- Thoả thuận sang `ended` thì trigger thu hồi mọi token còn sống của nó, `revoked_by = 'system:agreement-ended'` (Hỏi-6). `paused` và quá
  `valid_until` chỉ chặn tạm.
- Khoá ngoại ghép cần chỉ mục duy nhất `agreements (id, company_id)`, tạo trong 041.
- Tra theo băm khi chưa biết sàn: hàm `app.machine_token_by_hash(p_hash text)` theo khuôn `app.share_by_code` (migration 031):
  `security definer`, `search_path` rỗng, chỉ nhận đúng dạng 64 hex, trả tối đa một dòng `(token_id, company_id, agreement_id,
  revoked)`. Không có đường liệt kê.

Tệp viết theo lưu ý của migration 040: bản thật áp sau 052, cơ sở dữ liệu mới áp trước 042–052, nên chỉ dựa vào đối tượng có
từ ≤ 040 và viết lặp lại được.

## 3. Token

`qhm_` + 43 ký tự base64url của 32 byte ngẫu nhiên. Entropy 256 bit nên băm một lượt SHA-256 là đủ; hàm chậm kiểu bcrypt không
tra được theo băm và tốn ~100 ms mỗi lời gọi. Chuỗi rõ chỉ tồn tại trong phản hồi cấp, kèm `Cache-Control: no-store`.

Lõi (`packages/core/src/agreements.ts`) thêm `MACHINE_TOKEN_KINDS` = `catalog_source` (chiều vào) và `catalog_confirmation`
(chiều ra), và số token còn sống tối đa mỗi thoả thuận `MACHINE_TOKEN_LIMIT` (Hỏi-2).

## 4. Quản lý token (phiên quản trị sàn)

| Lệnh | Kết quả |
|---|---|
| `POST /api/v1/agreements/{id}/machine-tokens` | 201 `{ id, token, displayPrefix, createdAt }` |
| `GET /api/v1/agreements/{id}/machine-tokens` | 200, danh sách không có token rõ, không có băm |
| `DELETE /api/v1/agreements/{id}/machine-tokens/{tokenId}` | 204, gọi lại vẫn 204 |

Mọi lệnh: chưa đăng nhập 401 · không phải quản trị sàn 403 `admin-required` · thoả thuận không thuộc sàn 404.

Riêng lệnh cấp: loại kết nối hay chiều không cấp được 400 `token-kind-not-supported` · thoả thuận không hiệu lực 403
`agreement-inactive` · đã đủ số token còn sống 409 `token-limit-reached`.

Đọc và thu hồi chạy ở mọi trạng thái của thoả thuận: token lộ lúc thoả thuận đang `paused` vẫn thu hồi được. `tokenId` không thuộc
đúng thoả thuận trên đường dẫn thì 404, không đổi token nào. Thu hồi lại token đã thu hồi trả 204 và giữ nguyên `revoked_at`, `revoked_by`. Lời cấp khoá dòng thoả thuận trong giao dịch để hai lời cấp song song không vượt trần.

## 5. Cổng token ở cửa nhận

Có header `Authorization` scheme `Bearer` (không phân biệt hoa thường) thì đi đường token và **không** rơi về phiên, kể cả khi token
hỏng và cookie quản trị còn sống; không có
thì đi đường phiên như cũ. Đường token bỏ qua cookie sàn: sàn lấy từ token. Cửa nhận không xét `Origin` (không có lớp CSRF chung).

Thứ tự xét và kết quả:

| Bước | Trả | `outcome` nhật ký |
|---|---|---|
| Sai dạng, băm không có | 401 `invalid-machine-token`, `WWW-Authenticate: Bearer error="invalid_token"` | không ghi (Hỏi-3) |
| Token đã thu hồi | 401 `invalid-machine-token` (cùng mã, không lộ trạng thái) | `token_revoked` |
| Thoả thuận khác loại hay khác chiều với cửa | 403 `token-scope` | `wrong_connection` |
| `mayFlow` từ chối, sàn ngoài danh sách tin | 403 `agreement-inactive` | `agreement_inactive` |
| Gói sai khuôn | 422 `invalid-feed` | `invalid_payload` |
| Lỗi máy chủ giữa chừng | 500 | `server_error` |
| Nhận | 200 | `accepted` |

Ghi dùng **đúng thoả thuận gắn token**, không phải `chonThoaThuan`. Trong giao dịch ghi, dòng token được khoá `for share` với điều
kiện `revoked_at is null`: thu hồi chờ lần ghi đang chạy xong, lời kế nhận 401. Khoá ra 0 dòng nghĩa là token vừa bị thu hồi sau bước
tra: lời ấy trả 401, `token_revoked`, không ghi gì. Thoả thuận tắt giữa lúc kiểm và lúc ghi vẫn do luật theo dòng chặn như cũ, trả 403
`agreement-inactive`, `outcome` `agreement_inactive`.

**Nhật ký.** Lần `accepted` ghi dòng trong cùng giao dịch với gói: ghi nhật ký lỗi thì gói không vào, không có lần nhận nào thiếu
dòng. Lần bị từ chối và lần lỗi giữa chừng ghi ở giao dịch riêng sau khi rollback, vì dòng trong giao dịch bị rollback sẽ mất. Token rõ và băm không
vào nhật ký, không vào `console`.

`app.current_user_id()` trống ở đường token (khuôn `userId: ""` của trang khách); cửa nhận không dùng người.

## 6. Đối chiếu ngành (ADR-0022)

| Năng lực | RESO | MLS Grid | Spark (FBS) | Bridge | Bright, Trestle | Ta định làm | Ta viết cứng — họ cấu hình |
|---|---|---|---|---|---|---|---|
| Cách gọi máy-máy | Web API Core: OAuth2 Bearer Token hoặc Client Credentials ([RCP-37](https://transport.reso.org/proposals/web-api-core.html)) | Bearer, không endpoint đổi token ([bên thứ ba](https://apis.io/security/mls-grid/mls-grid-authentication/)) | Access token không hết hạn ([chính chủ](https://www.sparkplatform.com/docs/authentication/access_token)) | Server token, Client Credentials là đường phụ ([bên thứ ba](https://glama.ai/mcp/servers/@GumpperGroup/unlock-reso-mcp-remote/blob/fff3ad30ea1e2f1b7073952ea3e42f3b292a7fd7/docs/authentication.md)) | Client Credentials ([Bright](https://developer.brightmls.com/brightreso/default/authentication)) | Bearer tĩnh | Không — là lựa chọn của bên cấp. Hỏi-1 |
| Đổi token | Chưa kiểm | Cấp lại thì token cũ chết ([bên thứ ba](https://apis.io/security/mls-grid/mls-grid-authentication/)) | Chưa kiểm | Chưa kiểm | Chưa kiểm | Hai token còn sống để đổi không gián đoạn | Trần do lõi giữ. Hỏi-2 |
| Hạn của token | OAuth2 để bên cấp định | Chưa kiểm | Không hết hạn | Chưa kiểm | Access token ngắn hạn | Theo hạn thoả thuận | Không có hạn riêng. Hỏi-5 |

Lý do giữ cứng trần (Hỏi-2): «quyền và an toàn». Chọn thì thành một dòng điều khoá ở Sổ điểm biến thiên.

## 7. Ngoài phạm vi

Hộp thư đi và API kéo (hàng 97) · màn bật, tắt thoả thuận, đọc nhật ký (hàng 98) · giới hạn tần suất và hạn giữ nhật ký (Hỏi-8).

## 8. Câu hỏi cho Cổng Phạm vi

- **Hỏi-1 — cách bên kia gọi (khó đảo: Invest dựng máy theo cách này).** Khuyến: token Bearer tĩnh, RESO cho phép, MLS Grid và
  Spark làm vậy, Invest chỉ thêm một header. Lối khác: OAuth2 Client Credentials như Bright, Trestle: access token ngắn hạn, an
  toàn hơn khi lộ, nhưng phải dựng thêm điểm đổi token và Invest phải làm luồng làm mới.
- **Hỏi-2 — số token còn sống mỗi thoả thuận.** Khuyến: tối đa 2, để cấp cái mới, đổi bên kia, rồi thu hồi cái cũ mà không mất lần
  đẩy nào. Lối khác: 1 như MLS Grid, đơn giản hơn, đổi token có khoảng gián đoạn.
- **Hỏi-3 — nhật ký với token lạ.** Khuyến: không ghi dòng, vì không biết của sàn nào, và ai cũng spam được bảng. Lối khác: thêm
  bảng cấp nền để đo dò token: một bảng ngoài luật cách ly theo sàn, cần vận hành đọc.
- **Hỏi-4 — màn cấp token.** Khuyến: hàng này không làm màn, quản trị sàn cấp bằng API (vai `nen`, kết nối đầu tiên là Invest do
  đội vận hành), đưa ô «token» vào hàng 98. Lối khác: thêm màn ở hàng này, phải mở rộng phạm vi sang giao diện Cài đặt sàn.
- **Hỏi-5 — token có hạn riêng không.** Khuyến: không, token không tự hết theo lịch, như Spark; thoả thuận quá hạn thì lời gọi bị chặn (xem
  Hỏi-6). Lối khác: hạn
  riêng (ví dụ 12 tháng): giảm rủi ro token cũ lọt, đổi lại phải có việc nhắc xoay token, nếu quên thì máy đứng.
- **Hỏi-6 — thoả thuận tắt rồi mở lại thì token cũ thế nào.** Khuyến: `paused` và quá hạn chỉ chặn tạm, bật lại hay gia hạn thì token cũ
  chạy tiếp; `ended` là thu hồi hẳn, muốn nối lại phải cấp token mới. Lối khác: cả ba đều chặn tạm (đơn giản nhất, token lộ có thể sống
  lại sau khi thoả thuận đã kết thúc) hoặc cả ba đều thu hồi (an toàn nhất, mỗi lần tạm dừng phải cấp và trao lại token).
- **Hỏi-7 — mã lỗi trả cho máy bên kia (khó đảo: Invest dựng xử lý lỗi theo mã).** Khuyến: token lạ, sai dạng, đã thu hồi chung 401
  `invalid-machine-token`, không cho người dò biết token từng có thật; thoả thuận tắt 403 `agreement-inactive`, sai loại 403 `token-scope`.
  Lối khác: tách `token-revoked` riêng: bên vận hành Invest tự biết phải xin token mới, giá là lộ một token từng có thật.
- **Hỏi-8 — giới hạn tần suất và hạn giữ nhật ký.** Khuyến: để sau cả hai, chưa có bên gọi thật, xem lại khi có bên ngoài Invest gọi hay
  nhật ký cho thấy gọi dồn. Hệ quả: máy bên kia lỗi vòng lặp hay token lộ làm bảng nhật ký chỉ thêm phình không trần, vai API không xoá
  được. Lối khác: làm ngay giới hạn theo token và việc nền dọn nhật ký quá hạn: thêm hai việc ngoài câu giao.
