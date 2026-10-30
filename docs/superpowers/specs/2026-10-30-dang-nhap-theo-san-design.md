# Đăng nhập theo sàn — thiết kế

Ngày 30/10/2026 · Hàng 6 của lộ trình (`docs/plan/lo-trinh.json`) · Hồ sơ `_acceptance/dang-nhap-theo-san/` · T3.

Câu giao: **Người trong sàn đăng nhập và vào đúng vùng dữ liệu của sàn mình; chưa gắn sàn thì không thấy gì.**
Vì sao: Kiến trúc §9 bước 2 (nền); cách đăng nhập hỏi lại ở vòng này (Mạnh 29/10, Kiến trúc §10).

## 1. Bài toán

Hôm nay kho đã có nền cách ly (migration 001): mọi bảng của công ty bật luật theo dòng theo `app.current_company_id()`,
API chạy bằng vai `quy_hang_app`. Nhưng chưa có ai đăng nhập, chưa có gì nối một người với một sàn, và API chưa chạm
cơ sở dữ liệu. Hàng này dựng đoạn nối: **người → phiên → sàn đang làm → giao dịch của API mang đúng mã sàn**. Mọi
màn sau (bảng hàng, lead, cài đặt) đứng trên đoạn nối này; hàng 7 (mời người, vai, khu) và hàng 8 (một đường ghi) chờ nó.

## 2. Bốn câu chỉ chủ kho trả lời (lên thẻ Cổng Phạm vi)

Máy soạn nháp theo khuyến nghị; người đổi ở cổng thì máy soạn lại.

- **Hỏi-1 · Cách đăng nhập bản đầu.** Khuyến nghị: **email + mã 6 số gửi qua email**. Đầu chủ ngồi máy tính nhưng đọc
  email trên điện thoại: link đăng nhập (đề xuất cũ ở Kiến trúc §10) mở ra ở máy đọc email, không ở máy đang cần vào;
  mã 6 số thì gõ được ở máy nào cũng xong. Cùng một luồng «nhập định danh → nhập mã» đổi sang số điện thoại + mã OTP
  khi có sàn ngoài mà không đổi màn. Lối khác: link đăng nhập qua email (giá: người phải mở email trên đúng máy) ·
  Google (giá: cần dự án Google Cloud và khoá OAuth — cam kết ngoài kho, để khi có nơi chạy) · số điện thoại + OTP ngay
  (giá: nhà cung cấp SMS và chi phí mỗi tin trước khi có sàn ngoài).
- **Hỏi-2 · Dùng phần «tổ chức» của better-auth hay bảng thành viên của mình.** Khuyến nghị: **better-auth chỉ giữ danh
  tính (tài khoản, phiên, mã); thành viên sàn là bảng `company_members` của Quỹ hàng, có luật theo dòng**. Vì: (a) sàn
  đã là bảng `companies` (ADR-0001) — phần tổ chức của better-auth thêm một bảng tổ chức thứ hai phải giữ khớp;
  (b) vai của phần tổ chức (owner/admin/member) không khớp năm vai và «một người nhiều vai, có khu» của Tham chiếu §2 —
  hàng 7 sẽ phải bẻ nó; (c) bảng của mình được luật theo dòng và bộ kiểm cách ly che như mọi bảng của công ty. Lối khác:
  dùng phần tổ chức như Kiến trúc §5 ghi (giá: hai nguồn cho «sàn», bảng của thư viện phải tự thêm luật theo dòng, hàng
  7 làm vai trên khuôn không vừa).
- **Hỏi-3 · Màn đăng nhập dùng khối ReUI `auth-15` ngay hay sau.** ReUI chưa cài trong kho — hàng 4 (chuẩn giao diện,
  dãy G) đang cài song song. Khuyến nghị: **hàng này dựng màn tối giản đúng luồng và đủ trạng thái, không cài ReUI;
  chuyển thể `auth-15` thành một việc nhỏ sau khi hàng 4 gộp** (máy gửi việc phụ). Lối khác: chờ hàng 4 gộp rồi dựng
  bằng `auth-15` ngay trong hàng này (giá: dãy Q đứng chờ dãy G, hàng 7 và 8 lùi theo; hai dãy cùng chạm cấu hình
  giao diện của `apps/web`).

- **Hỏi-4 · Ai được nhận mã — người lạ tự tạo tài khoản, hay chỉ tài khoản đã được mở.** Khuyến nghị: **chỉ email đã
  có tài khoản mới nhận mã** (tài khoản sinh ra khi đội vận hành mở sàn, sau này khi quản trị sàn mời — hàng 7); email
  lạ nhận cùng câu «đã gửi mã» nhưng không có mã nào được gửi. Vì: khi gắn bộ gửi email thật, cửa tự đăng ký cho phép
  bất kỳ ai trên mạng bắt Quỹ hàng gửi thư tới địa chỉ tuỳ ý bằng tên miền của mình — uy tín người gửi và chi phí nằm
  ngoài kho. Trạng thái «đã đăng nhập mà chưa gắn sàn» vẫn có thật: người bị bỏ khỏi mọi sàn, hay tài khoản mở xong mà
  lời mời chưa xong. Lối khác: người lạ tự tạo tài khoản ở lần nhập mã đúng đầu tiên (giá: cửa gửi thư cho mọi địa
  chỉ; tài khoản rác không thấy dữ liệu nào nhưng tồn tại).

## 3. Phương án (theo khuyến nghị)

### Danh tính — better-auth, chỉ phần lõi + mã qua email

- `better-auth` (bản 1.7.x) với plugin `emailOTP`: `sendVerificationOTP` gọi **bộ gửi** do API nhận vào. Bản đầu có
  một bộ gửi: **bộ gửi dev** in mã ra nhật ký máy chủ (`[ma-dang-nhap] <email> <mã>`). Bộ gửi email thật để hàng nơi
  chạy; ở `NODE_ENV=production` mà chưa khai bộ gửi thì máy chủ từ chối khởi động thay vì nuốt mã.
- Mã 6 số, hết hạn sau 5 phút, sai 3 lần thì mã hỏng (mặc định của plugin, ghi thành hằng ở mã để kiểm được).
- Không tự đăng ký (Hỏi-4): `disableSignUp`; email chưa có tài khoản không sinh mã, không gọi bộ gửi.
- Trả lời «đã gửi mã» như nhau dù email đã có tài khoản hay chưa — không dò được ai đang dùng Quỹ hàng.
- Mỗi email xin mã tối đa **5 lần trong 15 phút** (hằng của mã); lần thứ sáu trả 429 trước khi sinh mã. Đếm ở bảng
  `identity.otp_requests` (email, lúc) — chạy nhiều máy chủ vẫn đúng, không đếm trong bộ nhớ. Đếm cả email lạ, để 429
  không thành đường dò.
- Bộ gửi là tham số bắt buộc ở `NODE_ENV=production`: thiếu thì `createApi` ném lỗi «thiếu bộ gửi mã đăng nhập».
- Bảng của better-auth (`user`, `session`, `account`, `verification`) nằm ở **schema `identity`** do chủ bảng giữ; vai
  `quy_hang_app` **không có quyền gì** trên schema này. Danh tính không thuộc một công ty nên không mang luật theo dòng
  theo công ty — thay vào đó vai của API không với tới được. Kết nối của better-auth là kết nối chủ, chỉ dùng cho danh tính.

### Thành viên sàn — bảng của Quỹ hàng

Migration mới `002_dang_nhap_theo_san.sql` (không sửa 001):

- `app.current_user_id()` đọc `app.user_id` như `app.current_company_id()` đọc `app.company_id`.
- `company_members (company_id, user_id, created_at)`, khoá chính đôi; `enable` + `force row level security`; luật đọc:
  dòng của chính mình (`user_id = app.current_user_id()`) hoặc dòng của sàn đang làm (`company_id =
  app.current_company_id()`). `quy_hang_app` chỉ được `select` — thêm, bớt thành viên là việc của hàng 7 và của công
  cụ vận hành.
- Thêm luật đọc thứ hai cho `companies`: người thấy tên các sàn mình là thành viên (để chọn sàn), không thấy sàn khác.
- Bộ kiểm cách ly thêm ca cho mọi điều trên (AC-7).

### Sàn đang làm — chọn ở API, kiểm lại mỗi lời gọi

- Mỗi lời gọi đã đăng nhập: API đọc danh sách sàn của người (giao dịch có `app.user_id`, chưa có `app.company_id`).
- Sàn đang làm = sàn trong cookie `qh_san` nếu người còn là thành viên; nếu không và người thuộc đúng một sàn → sàn đó;
  thuộc nhiều sàn mà chưa chọn → chưa có sàn đang làm (API trả `409 chon-san`); không thuộc sàn nào → `403 chua-gan-san`.
- Cookie chỉ là lựa chọn, không phải quyền: mất thành viên thì lần gọi kế không còn vào sàn đó.
- `POST /api/v1/me/san` đổi sàn đang làm — chỉ nhận sàn người là thành viên; sàn khác → `403`, không đổi gì.
- Mọi truy vấn bảng ở `public` đi qua **một hàm** `withCompany(pool, { userId, companyId }, fn)` ở
  `packages/api/src/db.ts`: `begin` → `set local role quy_hang_app` → `set_config('app.user_id', …, true)` +
  `set_config('app.company_id', …, true)` (sàn được trống — bước đọc danh sách sàn của người) → `fn` → `commit`.
  `db.ts` chỉ xuất hàm ấy. Kiểm hai lớp (AC-8): test thời chạy bọc pool, ghi mọi truy vấn chạm `public` cùng
  `current_user` qua các luồng, khẳng định 100% là `quy_hang_app`; test mã nguồn quét `packages/api/src` — lời gọi
  truy vấn chỉ ở `db.ts` và phần danh tính.

### Đường API (dưới `/api/v1`, Hono + OpenAPI như hiện có)

| Đường | Làm gì | Chưa đăng nhập | Chưa gắn sàn |
|---|---|---|---|
| `/auth/*` | better-auth: gửi mã, nhập mã, đăng xuất, đọc phiên | — | — |
| `GET /me` | người + danh sách sàn + sàn đang làm (hoặc `null`) | 401 | 200, sàn rỗng |
| `POST /me/san` | đổi sàn đang làm | 401 | 403 |
| `GET /san` | sàn đang làm, đọc từ cơ sở dữ liệu dưới luật theo dòng — đường dữ liệu mẫu cho mọi đường sau | 401 | 403 `chua-gan-san` |

`packages/api` đổi từ app tĩnh sang `createApi({ pool, auth })`; route của Next dựng một lần từ `DATABASE_URL`,
`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.

### Màn (`apps/web/src/app/(auth)/**`, không vỏ — Tham chiếu §9)

`/dang-nhap` (nhập email → nhập mã) · `/chua-gan-san` · `/chon-san` (người nhiều sàn) · trang `/` hiện tên sàn đang làm
và nút Đăng xuất cho tới khi vỏ (hàng 53) thay. Chưa đăng nhập vào trang nào trong app cũng về `/dang-nhap`.

### Công cụ vận hành mở sàn

`npm run van-hanh:mo-san -w @quy-hang/db -- --ten "[Tên sàn]" --email <email>` — tệp
`packages/db/scripts/mo-san.mjs`, kết nối chủ, chạy bằng tay, ngoài `packages/api` nên không đường HTTP nào gọi được:
tạo sàn (theo tên) và tài khoản (theo email) nếu chưa có, gắn email làm thành viên; chạy lại cùng tham số không tạo
trùng; cùng email với tên sàn khác thì người thuộc hai sàn. Kiến trúc §0: mở công ty mới là việc của đội vận hành, không
phải của API. Đây cũng là đường dựng sàn thử cho phiên nghiệm thu.

### Đường chạy test

Test cần Postgres của API đặt tên `*.db.test.ts`, chạy bằng `npm run test:db -w @quy-hang/api`; lệnh gốc `db:test`
chạy cả bộ kiểm cách ly lẫn bộ này — job `isolation` của CI (có Postgres) vì thế chạy luôn test đăng nhập, không phải
sửa CI. Test không cần Postgres ở lại `npm test`. Bộ `*.db.test.ts` **ném lỗi** khi thiếu `DATABASE_URL` (không bỏ
qua): lệnh của nó chỉ chạy khi có Postgres, nên vắng Postgres là lỗi, không phải ca bỏ qua. Bộ chạy với reporter in tên
từng ca để bằng chứng S4 đối chiếu tên ca với `expected`.

## 4. Không làm ở hàng này

- Mời người, vai, khu phụ trách, quyền theo vai — hàng 7.
- Bộ chọn sàn trong vỏ, cột nhà — hàng 53 (vỏ); hàng này chỉ có màn `/chon-san` giữa trang.
- Gửi email thật (nhà cung cấp, tên miền gửi) — hàng nơi chạy.
- Google, số điện thoại + OTP — theo câu trả lời Hỏi-1.
- Quyền hỗ trợ có hạn cho đội vận hành (Kiến trúc §0) — hàng riêng.
- Đường ghi dữ liệu của hàng, sự kiện — hàng 8.

## Đặc tả UX
<!-- <<<UX-SPEC-TEMPLATE -->

### 1. Luồng

- Suôn sẻ: mở bất kỳ trang nào → `/dang-nhap` → nhập email → «Gửi mã» → nhập mã 6 số → vào `/` thấy «Bạn đang làm ở
  sàn [Tên sàn]» (điểm ra: `/`, sau này là Hôm nay).
- Biên: chưa thuộc sàn nào → `/chua-gan-san`; thuộc nhiều sàn → `/chon-san` → bấm một sàn → `/`; đã đăng nhập mà mở
  `/dang-nhap` → về `/`.
- Lỗi & quay lại: mã sai → báo dưới ô mã, giữ email, nhập lại; mã hết hạn hay sai quá 3 lần → báo và hiện «Gửi lại mã»;
  «Đổi email» quay về bước một.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Đăng nhập | Lấy mã và vào app | mọi trang khi chưa đăng nhập / `/`, `/chon-san`, `/chua-gan-san` |
| Chưa gắn sàn | Nói rõ vì sao không thấy gì và nhờ ai | sau đăng nhập / Đăng xuất |
| Chọn sàn | Chọn sàn làm việc | sau đăng nhập khi nhiều sàn / `/` |
| Trang đầu (tạm) | Cho thấy đang ở sàn nào | sau đăng nhập / Đăng xuất |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-dang-nhap-email | Đăng nhập | Ô «Email», nút «Gửi mã» | gõ email, gửi |
| ST-dang-nhap-dang-gui | Đăng nhập | nút «Đang gửi…» bị khoá | chờ |
| ST-dang-nhap-ma | Đăng nhập | «Đã gửi mã tới [email]», ô «Mã 6 số», nút «Vào», «Đổi email» | gõ mã |
| ST-dang-nhap-ma-sai | Đăng nhập | «Mã không đúng. Thử lại.» dưới ô mã | gõ lại |
| ST-dang-nhap-ma-het | Đăng nhập | «Mã đã hết hạn hoặc sai quá số lần. Gửi lại mã.» + nút «Gửi lại mã» | gửi lại |
| ST-chua-gan-san-trong | Chưa gắn sàn | «Tài khoản [email] chưa thuộc sàn nào. Nhờ quản trị sàn mời bạn.» + «Đăng xuất» | đăng xuất / chờ mời |
| ST-chon-san-danh-sach | Chọn sàn | danh sách tên sàn | bấm một sàn |
| ST-trang-dau-co-san | Trang đầu | «Bạn đang làm ở sàn [Tên sàn]» + «Đăng xuất» | đăng xuất |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Email kiểm khuôn trước khi gửi; mã chỉ nhận 6 chữ số, bàn phím số trên điện thoại (`inputmode="numeric"`,
  `autocomplete="one-time-code"`); Enter gửi; con trỏ tự vào ô mã khi sang bước hai.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| Form đăng nhập hai bước | tạo (tạm) | ReUI chưa cài (hàng 4); khối đích `auth-15` theo `docs/design/vo-va-ia.md` — chuyển thể sau theo Hỏi-3 |
| Danh sách chọn sàn | tạo (tạm) | khối đích là Frame + `Item` — cùng lý do |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: wizard
Căn cứ: luồng hiển nhiên hai bước tuần tự (định danh → mã), không tra mẫu; khối đích đã chọn sẵn ở `docs/design/vo-va-ia.md`.
<!-- UX-SPEC-TEMPLATE>>> -->
