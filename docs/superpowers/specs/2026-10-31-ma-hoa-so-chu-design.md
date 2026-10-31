# Mã hoá số chủ nhà — thiết kế (hàng 62)

Ngày: 2026-10-31 · Hồ sơ: `_acceptance/ma-hoa-so-chu/` · Hạng T3 (chạm `packages/db`, lớp `source`, bất biến 2) ·
Dãy G, đợt dau-chu-dong-vao · Đứng trên hàng 11 (`lop-truong-nguon`, ADR-0010) và ADR-0009 §9–10.

## Vì sao

Hàng 11 dựng cửa «Mở số» duy nhất nhưng số chủ vẫn nằm rõ trong cột `listing_owners.owner_phone`. Ai đọc thẳng bảng
bằng vai chủ, hay có bản sao lưu, đều thấy số. Chủ kho tách việc mã hoá sang hàng này kèm điều kiện «phải xong trước
khi có dữ liệu thật» (sổ hàng 11, `d-20261031T034503Z-16`). Kiến trúc §8: «Số được mã hoá ở mức trường; chỉ giải mã
qua cửa mở số, có ghi ai và khi nào.»

Bốn bất biến của `AGENTS.md`: hàng này chạm bất biến 1 (bảng mới thì không có; luật theo dòng của `listing_owners`
giữ nguyên) và bất biến 2 (lớp `source` — trần `never_leaves_company` không đổi, chỉ chặn thêm). Không chạm bất biến
3, 4.

## Cách làm

### 1. Mã hoá ở tầng API, khoá không bao giờ vào cơ sở dữ liệu

- Khoá `OWNER_PHONE_KEY`: 32 byte ngẫu nhiên, viết base64, chỉ ở môi trường chạy app (Vercel, loại Sensitive — ADR-0009
  §9). Cơ sở dữ liệu và bản sao lưu không có khoá, nên đọc thẳng bảng hay bản sao lưu chỉ thấy bản mã.
- Thuật toán AES-256-GCM của `node:crypto` (không thêm thư viện). Bản mã là `bytea`:
  `0x01 (phiên bản khoá) ‖ nonce 12 byte ‖ thẻ 16 byte ‖ bản mã`. Nonce ngẫu nhiên mỗi lần ghi, nên cùng một số ghi hai
  lần ra hai bản mã khác nhau.
- **Bản mã gắn đúng dòng**: dữ liệu xác thực kèm (AAD) là chuỗi ngữ cảnh do bên gọi đưa, với chủ nhà là
  `listing_owners:<company_id>:<listing_id>`. Chép bản mã sang hàng khác hay sàn khác thì giải mã thất bại.
- **Dấu vết để kiểm trùng**: `dauVetSo(so, companyId)` = HMAC-SHA256 của số chuẩn hoá, khoá con suy từ
  `OWNER_PHONE_KEY` bằng HKDF (nhãn riêng, không dùng lại khoá mã hoá), trộn `company_id` để dấu vết hai sàn không nối
  được với nhau. Cột `owner_phone_hash bytea`. Hàng 24 (ô nhận lead, dãy L) và hàng kiểm trùng so dấu vết với dấu vết,
  không so số.
- Mã đặt ở `packages/api/src/owners/ma-hoa.ts` (thuần, kiểm bằng `node --test` không cần Postgres) và
  `packages/api/src/owners/khoa.ts` (đọc khoá từ môi trường).

### 2. Thiếu khoá

- Có `OWNER_PHONE_KEY` mà sai dạng (không phải base64 của đúng 32 byte) → ném lỗi ở mọi môi trường.
- `NODE_ENV=production` mà thiếu khoá, hay khoá trùng khoá dev → `createApi` ném «thiếu OWNER_PHONE_KEY»: API không
  dựng, không ghi gì. Cùng nếp với bộ gửi mã đăng nhập (ADR-0009 §8, ADR-0005 §7).
- Ngoài production mà thiếu khoá → khoá dev cố định, suy từ một chuỗi công khai trong mã — chỉ cho máy dev, CI và test
  (`npm run db:test` trong CI không cần bí mật mới). Khoá dev vẫn mã hoá: không có đường nào ghi số rõ.
- Thông điệp lỗi không bao giờ chứa giá trị khoá hay số.

### 3. Cơ sở dữ liệu (migration 008)

- `listing_owners` thêm `owner_phone_enc bytea` (ràng buộc: byte đầu là `0x01`, dài ≥ 1+12+16+10) và
  `owner_phone_hash bytea` (đúng 32 byte), hai cột cùng có hoặc cùng vắng.
- Ràng buộc `listing_owners_phone_chi_ban_ma check (owner_phone is null) NOT VALID`: từ nay mọi lần chèn hay sửa đặt số
  rõ đều bị cơ sở dữ liệu từ chối, ở mọi vai kể cả vai chủ; dòng cũ (nếu có) chưa bị xét tới khi lệnh mã hoá lại chạy
  xong và `validate`.
- Cột `owner_phone` **chưa xoá** ở hàng này: migration không có khoá nên không mã hoá được dòng cũ; xoá cột trước khi
  mã hoá là xoá dữ liệu trên cơ sở dữ liệu thật — việc khó đảo. Xoá cột là một migration của hàng sau, khi cơ sở dữ
  liệu thật đã chạy lệnh mã hoá lại.
- `has_phone` dựng lại theo `owner_phone_enc is not null`.
- Quyền: vai API được chèn, sửa `owner_phone_enc`, `owner_phone_hash`; **không** được đọc hai cột đó (như cột số cũ);
  được đọc `has_phone`.
- `app.reveal_owner_phone(uuid)` dựng lại, trả `bytea` (bản mã) thay cho `text`: vẫn xét quyền, vẫn ghi một dòng
  `owner_phone_reveals`, rồi trả bản mã. Không có bản mã → «chưa có số chủ» như cũ.
- Hàm `app.owner_phone_hash_matches(p_hash bytea)` **không** dựng ở hàng này — hàm kiểm trùng là của hàng 24/kiểm trùng.

### 4. API

- `PUT …/owner`: chuẩn hoá số (lõi, như cũ), mã hoá với ngữ cảnh của dòng, tính dấu vết, ghi hai cột; `owner_phone`
  luôn ghi `null`.
- `POST …/owner/phone-reveal`: gọi `app.reveal_owner_phone` (ghi sự kiện, trả bản mã), giải mã ở API, trả số. Giải mã
  thất bại (bản mã bị sửa, chép từ dòng khác, sai khoá) → lỗi máy chủ chung, không có số; giao dịch huỷ nên không để lại
  sự kiện mở số nào cho lần không ra số.
- Bốn lời gọi, hai khuôn trả lời, mã lỗi của hàng 11 không đổi.

### 5. Mã hoá lại dữ liệu đã có

`node --env-file-if-exists=.env.local --import tsx packages/api/van-hanh/ma-hoa-lai.ts` — chạy bằng vai chủ
(`DATABASE_URL` của vai chủ, như migration) cùng khoá của môi trường đó. **Lệnh không bao giờ rơi về khoá dev**: thiếu
`OWNER_PHONE_KEY`, khoá sai dạng hay khoá trùng khoá dev → thoát khác 0 trước khi chạm dòng nào, thông điệp nêu tên
biến. Lý do: lệnh xoá số rõ trong cùng giao dịch; mã hoá nhầm bằng khoá dev công khai là mất số (API thật không giải
được) và lộ số (ai có mã nguồn đều giải được). Máy dev và test đưa khoá thử tường minh.

1. Trong một giao dịch: khoá các dòng `owner_phone is not null`, mã hoá từng số với ngữ cảnh của dòng, ghi bản mã và
   dấu vết, đặt `owner_phone = null`.
2. `alter table listing_owners validate constraint listing_owners_phone_chi_ban_ma` — từ đây cơ sở dữ liệu bảo đảm
   không dòng nào còn số rõ.
3. In số dòng đã mã hoá và số dòng đã là bản mã — không in số, không in khoá.

Chạy lại: không còn dòng số rõ nên không đổi gì; bản mã đã có giữ nguyên từng byte. Phần lõi (`maHoaLai(client, khoa)`)
tách khỏi phần đọc môi trường để kiểm trong một giao dịch hoàn lại.

Dữ liệu mẫu (`packages/db/seed`) chưa nạp chủ nhà vào cơ sở dữ liệu — chủ nhà còn nằm trong `mau/du-lieu-mau.json`
chờ các hàng dựng bảng (`nap.mjs` dòng 2) — nên «dữ liệu đã có» là các dòng ghi qua API của hàng 11 trên cơ sở dữ liệu
thử hay thật. Hàng nạp chủ nhà mẫu sau này đi qua `maHoaSo`; ràng buộc chặn số rõ bắt nếu quên.

Chạy trên cơ sở dữ liệu thật là việc vận hành ngoài kho: giám sát đếm dòng số rõ trên đó trước khi đề xuất chạy (trả
lời G-1: prod chưa có số chủ thật).

### 6. Quét lược đồ — chặn cột số rõ ở mọi bảng

Bộ kiểm cách ly thêm một ca: mọi cột kiểu chữ (`text`, `varchar`, `char`) có tên chứa `phone` ở mọi schema không phải
của hệ thống phải mang ràng buộc `check (<cột> is null)`. Cột `bytea` (bản mã, dấu vết) và `boolean` (`has_phone`)
không bị xét. Bảng lead của hàng 24 hay bảng nào gộp sau mà lưu số dạng chữ → ca này đỏ và nêu tên bảng, cột. Đây là
cách hàng 62 phủ số chủ của lead mà không phải chờ hàng 24 (trả lời G-1 của giám sát). Nếu hàng 24 gộp trước, migration
008 chuyển luôn cột số của lead theo cùng khuôn.

### 7. Không ra nhật ký

Số chủ và khoá không ra log, thông điệp lỗi, đầu ra lệnh. Lợi thêm: trước đây ràng buộc `owner_phone ~ '^0[0-9]{9}$'`
hỏng thì Postgres in «Failing row contains (…số…)»; nay dòng chỉ chứa bản mã.

## Bảng trạng thái của cửa «Mở số»

| Bản mã của dòng | Người gọi | Kết quả | Sự kiện mở số |
|---|---|---|---|
| có, đúng dòng, đúng khoá | người thấy nguồn | 200, số chuẩn hoá | +1 |
| có | người không thấy nguồn | 403 `listing-agent-required` | 0 |
| không có | người thấy nguồn | 404 `owner-not-set` | 0 |
| chép từ dòng khác / bị sửa / khoá khác | người thấy nguồn | 500 chung, không số | 0 (giao dịch huỷ) |

## Đặc tả UX

Bỏ — hàng không có màn (sổ quyết định).

## Ngoài thiết kế này

Xoá cột `owner_phone` (hàng sau, sau khi cơ sở dữ liệu thật chạy lệnh mã hoá lại) · xoay khoá (byte phiên bản đặt
sẵn, lệnh xoay để sau) · hàm kiểm trùng (hàng 24 và hàng kiểm trùng) · số chủ trên máy (hàng 13) · ảnh sổ · đặt khoá
thật ở Vercel (chủ kho, theo hướng dẫn gửi kèm yêu cầu `can-nguoi` sau gộp) · bản xem trước của Vercel có nhận khoá thật
không (Hỏi-1).

## Hỏi-3 (chỉ người có — cam kết ra ngoài kho, khó đảo): bản khoá ngoài Vercel và rủi ro mất khoá

Mất `OWNER_PHONE_KEY` là mất mọi số chủ: không đường cứu. Khoá loại Sensitive của Vercel không đọc lại được (ADR-0009
§9), mà lệnh mã hoá lại và mọi lần chuyển môi trường cần giá trị khoá — nên phải có một bản khoá ngoài Vercel. **Khuyến
nghị: chủ kho sinh khoá ở máy mình, đặt vào Vercel Production, cất MỘT bản trong trình quản lý mật khẩu của chủ kho
(không ở kho, không ở tin nhắn, không ở máy tác tử); chấp nhận mất cả hai bản là mất số chủ.** Lối khác: thêm bản thứ
hai ở secret GitHub (CI chạy được lệnh mã hoá lại khi deploy) — thêm một chỗ lộ, đổi lại bớt phụ thuộc một người; hoặc
dùng dịch vụ quản lý khoá (KMS) — tốn tiền và thêm phụ thuộc ngoài, là hàng riêng.

## Hỏi-2 (chỉ người có — đánh đổi giá trị): so trùng số chủ bằng gì

Hàng 24 (ô nhận lead, migration 007, dãy L) thêm bảng `leads` có cột `owner_phone` và hàm
`app.lead_dedupe_facts(phone, toà, căn)` so số của lead với `listing_owners.owner_phone` và `leads.owner_phone` dạng chữ
rõ. Mã hoá với nonce ngẫu nhiên thì không so được trong cơ sở dữ liệu. **Khuyến nghị: dấu vết HMAC-SHA256 có khoá**
(khoá con suy từ `OWNER_PHONE_KEY`, trộn `company_id`), lưu ở cột riêng `owner_phone_hash` cạnh bản mã; hàm kiểm trùng
so dấu vết. ADR-0011 cảnh báo «băm số 10 chữ số đảo ngược được» — đúng với băm không khoá (thử hết 10⁹ số); dấu vết có
khoá thì không thử được khi không có khoá, và ai có khoá thì vốn giải được bản mã — không thêm chỗ giữ dữ liệu nguồn
nào ngoài khoá. Giá: hai dòng cùng số trong một sàn lộ ra là trùng nhau cho người đọc thẳng bảng (đó chính là việc kiểm
trùng cần). Lối khác: mã hoá tất định (cùng số ra cùng bản mã, AES-SIV) — lộ y như vậy, cần thư viện mới (chạm
`package-lock.json`, ngoài ranh giới đợt), và gộp hai việc (giấu, so) vào một khoá. Lối thứ ba: không so trong cơ sở dữ
liệu, giải mã hết ở API để so — chậm theo số dòng và đưa mọi số của sàn qua bộ nhớ API mỗi lần nhận lead.

**Thứ tự gộp với hàng 24.** 62 gộp trước → hàng 24 dùng đường mã hoá: cột `owner_phone_enc` + `owner_phone_hash`
(không cột chữ rõ — ca quét lược đồ của 62 đỏ nếu có), `maHoaSo` với ngữ cảnh `leads:<company_id>:<lead_id>`,
`dauVetSo`, hàm kiểm trùng so `owner_phone_hash`. 24 gộp trước → migration 008 của 62 chuyển luôn `leads.owner_phone`
theo cùng khuôn, đổi thân hàm kiểm trùng sang so dấu vết, và lệnh mã hoá lại phủ cả bảng `leads`; hợp đồng 62 thêm tiêu
chí cho bảng ấy qua Cổng Phạm vi lại (sửa hợp đồng), không âm thầm.

## Hỏi-1 (chỉ người có — cam kết ra ngoài kho)

Bản xem trước (Preview) của Vercel có nhận khoá thật không? **Khuyến nghị: không — chỉ Production.** Bản xem trước đang
dùng chung cơ sở dữ liệu thật và chạy mã của mọi nhánh; đưa khoá vào đó là cho mã chưa duyệt đọc được số chủ. Giá: bản
xem trước thiếu khoá thì API không dựng — nhưng ADR-0009 đã ghi bản xem trước chưa đăng nhập được, nên mất gần như
không gì. Lối khác: Preview cùng khoá — bản xem trước chạy đủ, đổi lại mọi nhánh đọc được số chủ thật khi có dữ liệu
thật.
