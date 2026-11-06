# Pooler chế độ giao dịch — thiết kế

Hàng `pooler-che-do-giao-dich` của lộ trình, hạng T3. Gốc lâu dài của sự cố 06/11 (PR #155 chỉ thu nhỏ bể; PR #158 cho bể
nghe lỗi): pooler Supabase **chế độ phiên** (cổng 5432) cấp tổng 15 kết nối cho cả dự án, mỗi kết nối khách giữ một kết
nối máy chủ suốt đời nó. Hàm serverless tự nhân bản khi tải tăng thì vẫn cạn được 15 kết nối đó (`EMAXCONNSESSION`).
**Chế độ giao dịch** (cổng 6543) chỉ giữ kết nối máy chủ trong một giao dịch rồi trả, nên nhiều kết nối khách dùng chung
15 kết nối máy chủ.

## Vấn đề: chế độ giao dịch không giữ trạng thái phiên

Ở chế độ giao dịch, hai câu lệnh liên tiếp của cùng một kết nối khách có thể chạy trên hai kết nối máy chủ khác nhau. Mọi
thứ đặt cho PHIÊN — tham số khởi động, `SET` không `LOCAL`, `set_config(..., false)`, `LISTEN`, khoá tư vấn mức phiên,
câu lệnh chuẩn bị có tên, bảng tạm — không còn đáng tin: có thể mất, hoặc tệ hơn, rò sang khách khác dùng chung kết nối
máy chủ ấy.

Soi mã (06/11):

| Chỗ | Trạng thái phiên? | Ở chế độ giao dịch |
|---|---|---|
| Bể danh tính `dungPools` (`apps/web/src/lib/api.ts`) dựng với `options: "-c search_path=identity"` | CÓ — tham số khởi động | Mất: truy vấn trần `"user"` của better-auth và của Quỹ hàng không tìm thấy bảng |
| better-auth (`packages/api/src/auth/auth.ts`) nhận `database: identityPool`, dựa vào search_path để tìm bảng `user`, `session`, `account`, `verification` | dựa vào điều trên | Hỏng đăng nhập, đọc phiên |
| Bốn truy vấn tay đọc tên người `select … from "user"` trên bể danh tính: `ten-hien-thi.ts`, `leads/routes.ts`, `owners/routes.ts`, `routing/routes.ts` | dựa vào điều trên | Hỏng màn có tên người |
| Hai truy vấn trong bộ kiểm db (`test-db/owners.test.ts`, `test-db/hom-nay-truong-nhom.test.ts`) và `test-db/helpers.ts` dựng bể danh tính như máy chủ | dựa vào điều trên | Bộ kiểm không đo đúng cấu hình mới |
| `withCompany` (`packages/api/src/db.ts`): `begin` · `set local role quy_hang_app` · `set_config(…, true)` · `commit`/`rollback` | KHÔNG — mọi thứ trong một giao dịch | An toàn — cách ly theo dòng giữ nguyên |
| Truy vấn tay khác trên bể danh tính (`accounts.ts`, `otp-limit.ts`, `dang-nhap-mat-khau.ts`, `may-bi-bao.ts`, `thanh-vien.ts`…) | KHÔNG — đã ghi `identity.<bảng>` | An toàn |
| `SET` phiên, `LISTEN`, khoá tư vấn mức phiên, câu lệnh có tên trong `apps/web/src`, `packages/api/src` | không tìm thấy | — |
| Hàm `security definer set search_path = …` trong migration | thuộc tính của hàm, không phải phiên | An toàn |

## Cách làm

1. **Bể danh tính bỏ tham số khởi động.** `dungPools` dựng bể danh tính không còn `options`; cỡ bể và trình nghe lỗi giữ
   nguyên (`NOI_TRANG`, `NOI_CHAN_DAU`, `ngheLoi`). Mỗi lần dựng bể ghi một dòng `[pool:ket-noi] cổng <cổng> · <nơi>` —
   chỉ cổng, không máy chủ hay mật khẩu — để nhật ký của một triển khai nói nó chạy chế độ nào (5432 phiên, 6543 giao dịch).
2. **better-auth đặt lược đồ ở lớp adapter.** `createAuth` truyền
   `database: { dialect: new PostgresDialect({ pool: identityPool }), type: "postgres", schemaName: "identity", transaction: true }`.
   Adapter Kysely của better-auth 1.7.14 (`@better-auth/kysely-adapter`, `createKyselyAdapter`) gọi
   `kysely.withSchema(schemaName)` — mọi câu của better-auth ghi `"identity"."session"`…; bước kiểm lược đồ lúc khởi động
   (`findSchemaProblems`) áp cùng plugin cho phía mong đợi. `transaction: true` giữ đúng hành vi hiện nay (adapter tự dựng
   từ `pg.Pool` trần cũng bật giao dịch). `kysely` thành phụ thuộc trực tiếp của `@quy-hang/api` (đã có trong cây,
   0.29.7 — phụ thuộc ngang hàng của better-auth).
3. **Bốn truy vấn tay ghi rõ lược đồ**: `identity."user"`. Hai truy vấn của bộ kiểm db cũng vậy; `test-db/helpers.ts` dựng
   bể danh tính KHÔNG tham số khởi động — nên toàn bộ bộ kiểm db (job `isolation` của CI) từ nay chạy đúng cấu hình máy
   chủ và đỏ ngay nếu còn chỗ nào dựa vào search_path.
4. **Không đổi `withCompany`, không migration.** Cách ly theo dòng đã nằm trọn trong giao dịch.
5. **Mã chạy được ở cả hai chế độ.** Sau bản vá, cùng mã chạy với Postgres trực tiếp (máy, CI), pooler chế độ phiên 5432
   (bản thật hiện nay) và pooler chế độ giao dịch 6543. Gộp PR không đổi cách bản thật kết nối; đổi `DATABASE_URL` là một
   bước vận hành riêng (mục «Đường ra bản thật»).

Lối khác đã loại:

- Đặt `search_path` bằng `SET` trên sự kiện `connect` của bể: đó là `SET` mức phiên — ở chế độ giao dịch nó đặt lên một
  kết nối máy chủ rồi kết nối ấy về tay khách khác (rò lược đồ sang bể ứng dụng), còn câu kế của mình có thể chạy trên kết
  nối máy chủ chưa đặt.
- `alter role … set search_path`: đổi cho mọi khách dùng cùng vai chủ, kể cả bể ứng dụng; lại là thay đổi cơ sở dữ liệu
  (T3, migration) cho một việc lớp adapter làm được.
- Đặt tên bảng có lược đồ qua `modelName` của từng bảng better-auth: phải liệt kê từng bảng (kể cả bảng plugin thêm sau),
  sót một bảng là hỏng âm thầm; `schemaName` phủ mọi bảng một chỗ.

## Bàn thử pooler chế độ giao dịch tại máy

Postgres thật không giả được chế độ giao dịch, nên bằng chứng máy cần một pooler thật đứng trước Postgres:

- **PgBouncer** (Homebrew, bản 1.26.1 có sẵn bản dựng) `pool_mode = transaction`, `default_pool_size = 1` — MỌI kết nối
  khách dùng chung MỘT kết nối máy chủ, phép thử khắt khe hơn Supavisor bản thật (15). Đứng trước Postgres của chỗ thử
  hồ sơ `va-pool-ket-noi` (`_acceptance/va-pool-ket-noi/thu/dung-su-co.mjs --dung`, cổng 5598, đã nạp mẫu). Tệp cấu hình
  và nhật ký của PgBouncer ở `.acceptance-runs/pooler-che-do-giao-dich/` (ngoài kho git), mật khẩu thử của AGENTS.md.
- Tiến trình con nạp `getApi` THẬT từ `apps/web/src/lib/api.ts` với `DATABASE_URL` trỏ PgBouncer (đúng như bản thật đổi
  chuỗi kết nối), gọi API bằng `getApi().request(...)`.
- Kịch bản: đăng nhập bằng mã (bộ gửi mã của máy dev in mã), đọc phiên `/api/v1/me`, Hôm nay, Bảng hàng; rồi một loạt 40
  yêu cầu đồng thời từ 10 tiến trình (mô phỏng 10 phiên bản hàm, mỗi tiến trình một bộ bể như bản thật) của người thuộc
  HAI sàn xen kẽ — mỗi phản hồi chỉ chứa dữ liệu sàn của người hỏi; sau loạt, một kết nối trần qua PgBouncer thấy vai
  `postgres`, `app.company_id` rỗng (không gì của `set local` sót lại).
- Chiều đỏ, chứng bàn thử phân biệt được: (a) kết nối mang search_path sai (`public`) qua PgBouncer thì câu trần `"user"`
  hỏng — còn luồng đăng nhập của bản vá chạy cả trên kết nối ấy; (b) một khách đặt `set app.company_id` mức phiên qua PgBouncer thì khách khác thấy giá
  trị ấy — tức bàn thử thật sự dùng chung kết nối máy chủ và sẽ bắt được một chỗ rò.

Đo 06/11 (S3): PgBouncer 1.26 giữ riêng `search_path` của từng khách (đặt lại khi đổi kết nối máy chủ), kể cả khi đặt
bỏ qua tham số khởi động, và từ chối tham số khởi động khác — cấu hình cũ KHÔNG hỏng ở PgBouncer. Vì thế bàn thử đo độc
lập khỏi search_path bằng kết nối mang search_path sai, không bằng cấu hình cũ.

Giới hạn khai trước: PgBouncer không phải Supavisor. Cách Supavisor xử tham số khởi động `options` và câu lệnh chuẩn bị
chưa kiểm ở máy — bước bản xem trước dưới đây đo trên Supavisor thật.

## Công tắc cổng (sửa đổi S3 06/11 — chủ kho chọn)

`DATABASE_URL` trên Vercel là biến bí mật kín: CLI kéo về chỉ được giá trị giữ chỗ, máy không dựng được chuỗi 6543 mà
không có người cầm chuỗi. Chủ kho chọn công tắc: biến thường `DATABASE_POOLER_PORT` (chỉ nhận 5432 hoặc 6543) đổi cổng
của `DATABASE_URL` lúc `getApi` dựng bể; vắng thì giữ nguyên; giá trị khác thì máy chủ không khởi động, lỗi không in chuỗi
kết nối. Máy tự đặt biến cho bản xem trước nhánh; đổi bản thật là đặt biến ở phạm vi Production, lùi là xoá biến.

## Bản xem trước với cổng 6543

`DATABASE_URL` của bản thật và bản xem trước hiện là một (pooler chế độ phiên). Đo trên Supavisor thật cần một biến
`DATABASE_URL` chỉ cho bản xem trước của nhánh này, cùng chuỗi kết nối, đổi cổng 5432 → 6543. Chuỗi ấy là bí mật:

- Khuyến nghị (Hỏi ở Cổng Phạm vi): máy đặt biến qua CLI Vercel bằng một tập lệnh đọc chuỗi hiện có, đổi cổng, ghi
  thành biến của bản xem trước nhánh `claude/pooler-che-do-giao-dich` — giá trị không in ra, không vào kho, tệp tạm xoá
  ngay. Rào của app chặn thì máy không lách: chủ kho làm đúng một bước (sao biến `DATABASE_URL` sang phạm vi bản xem
  trước của nhánh, đổi cổng).
- Đo bằng máy (bản xem trước có Vercel Authentication, đi qua `vercel curl` như khoá `suc_khoe_xem_truoc`): trước hết nhật
  ký của đúng triển khai ấy phải có dòng `[pool:ket-noi] cổng 6543` (chứng biến đã đổi cổng và triển khai dựng sau khi đặt
  biến — không đọc giá trị bí mật); rồi 40 yêu cầu đồng thời tới `/api/v1/me` và `/today` với cookie phiên giả (mỗi yêu
  cầu chạm bể danh tính khi đọc phiên) → không 5xx; nhật ký bản xem trước không có `EMAXCONNSESSION`, lỗi bể, lỗi lược đồ
  hay lỗi câu lệnh chuẩn bị; nhật ký bản thật cùng khoảng không có `EMAXCONNSESSION` hay 5xx.
- Rủi ro khai trước: bản xem trước dùng chung cơ sở dữ liệu và Supavisor với bản thật, mà bản thật còn ở chế độ phiên.
  Khung giờ và mức tải của phép đo là Hỏi ở Cổng Phạm vi (khuyến nghị: giờ vắng, 40 yêu cầu một đợt, máy theo dõi nhật
  ký bản thật suốt khoảng thử và dừng ngay khi thấy `EMAXCONNSESSION`).
- Thử tay của chủ kho, gom vào trang bằng chứng của Cổng Bằng chứng: đăng nhập, Hôm nay, Bảng hàng trên bản xem trước.
  (Bản xem trước dùng cơ sở dữ liệu bản thật; máy không tạo tài khoản thử trên dữ liệu thật.)

## Đường ra bản thật

1. Gộp PR — mã chạy được ở cả hai chế độ, bản thật vẫn 5432.
2. Cổng Bằng chứng: chủ kho đọc số đo bàn thử + bản xem trước, quyết đổi `DATABASE_URL` của Production sang 6543.
3. Đổi biến, triển khai lại; theo dõi nhật ký 30 phút (`EMAXCONNSESSION`, `[pool:`, 5xx).
4. Lùi: đặt lại chuỗi 5432, triển khai lại — mã không cần đổi.

Job `deploy` của CI chạy migration bằng secret riêng `PROD_DATABASE_URL` — giữ nguyên (migration là việc một lần, chạy
được ở chế độ phiên hay kết nối trực tiếp). ADR-0009 ghi mục sửa đổi 06/11 về chế độ kết nối, không viết đè.

**Không** đổi cỡ bể, không nâng `pool_size` của Supabase, không đổi `withCompany`, không migration.

## Đối chiếu ngành (ADR-0022)

Không có đối tượng nghiệp vụ hay danh sách cố định mới — bảng đối chiếu RESO và sản phẩm khác không áp.

## Đặc tả UX

Không chạm giao diện: không màn, chữ hay trạng thái mới.
