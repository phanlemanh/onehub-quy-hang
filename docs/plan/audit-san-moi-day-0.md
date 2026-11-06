# Audit: một sàn hoàn toàn mới lên Quỹ hàng — ngày 0 trên bản thật

Ngày: 2026-11-06 · Trạng thái: **rà soát, chỉ đọc** · Người hỏi: chủ kho, qua phiên giám sát đợt dau-khach-nhap ·
Soát trên `main` `1d682ade` và bản thật `https://quyhang.onehub.center` lúc khoảng 07:30–08:15Z.

**Cách soát.** Đọc mã, tài liệu (Tham chiếu, ADR-0005, 0006, 0009, 0011, 0017, 0025), hồ sơ nghiệm thu và lộ trình. Trên
bản thật chỉ đọc: `/api/v1/health`, mã trả của các trang đăng nhập, một lời gọi không khoá vào lối việc nền, nhật ký
Vercel 7 ngày, **tên** biến môi trường của Vercel (không đọc giá trị), DNS thư của `onehub.center`, lịch sử job `deploy`
của CI. Không tạo tài khoản, sàn, dữ liệu; không chạm cơ sở dữ liệu bản thật. Không dựng thử trên Postgres local: mọi
kết luận dưới đây đọc thẳng được từ mã hay từ bản thật.

Thang hiện trạng: **chạy được** · **thủ công** (chạy được nhưng cần người làm ngoài sản phẩm) · **gãy** (có nhưng sai
với sàn thật) · **chưa có**.

## Tóm tắt

Một sàn mới hôm nay **đăng nhập được và mời được người, nhưng người mở sàn không bắt đầu làm việc được** — chủ kho
thấy đúng điều này trên sàn «OneHub» của bản thật ngày 06/11 (mục 3b). Bốn chỗ chặn:

0. **Người mở sàn rơi vào ngõ cụt.** Công cụ mở sàn chỉ gắn vai Quản trị sàn; vai này không có nhà nào ở cột nhà (chỉ
   Cài đặt), không có nút tạo nào, không nhập Excel được. Không màn nào nói phải tự thêm vai làm việc cho mình. Thêm vai
   rồi, Excel là cửa duy nhất đưa được căn và chủ nhà vào; không có lối tạo một căn, một liên hệ, một khách bằng tay.
1. **Danh mục là danh mục mẫu, viết cứng trong mã.** Gõ mã căn, ô nhập lead, nhập Excel và gợi ý mã ở hồ sơ căn đều tra
   «[Mẫu] Dự án căn hộ thử» (Toà A, Toà B) cho mọi sàn. Sàn thật **không chọn được toà của mình khi nhập lead**, mã căn
   thật luôn báo «chưa có trong danh mục». Cửa nhận danh mục Invest đã dựng (hàng 10) nhưng chưa đường tra nào đọc từ
   đó (hàng 99 chưa mở).
2. **Lead không bao giờ được chia trên bản thật.** Nhịp chia mỗi phút trả 503: bản thật thiếu khoá việc nền và chưa có
   lịch gọi. Bật xong vẫn kẹt: cách chia mặc định chỉ giao cho đầu chủ có khu phụ trách trùng tên toà — sàn mới chưa có
   khu nào.
3. **Mở sàn là lệnh chạy tay bằng chuỗi kết nối chủ**, chỉ chủ kho làm được; quản trị đầu tiên chỉ vào được bằng mã qua
   email.

Hai điều kiện có từ trước, chưa đóng, phải xong trước khi có dữ liệu chủ nhà thật: **rà pháp lý** trước sàn đầu tiên
ngoài đội, và **bản xem trước dùng chung cơ sở dữ liệu thật**.

| # | Bước | Hiện trạng | Ai làm | Chặn sàn mới? |
| --- | --- | --- | --- | --- |
| 1 | Tạo sàn và quản trị đầu tiên | Thủ công | OneHub (chỉ chủ kho) | Không chặn, nhưng là nút thắt người |
| 2 | Đăng nhập lần đầu | Chạy được, một cửa duy nhất | Sàn | Có thể — nếu thư mã không tới |
| 3 | Quản trị dựng sàn | Chạy được, thiếu vài mục | Sàn | Có — chưa có khu thì lead không chia |
| 3b | Người mở sàn bắt đầu làm việc | Gãy — chỉ vai Quản trị, cột nhà trống, không nút tạo | Sàn | **Có — ngõ cụt ngay sau đăng nhập** |
| 4 | Đưa hàng vào | Excel chạy được; lead gãy; tạo tay theo lead | Sàn | Có — toà ở lead chỉ toà mẫu |
| 5 | Ngày làm việc đầu | Màn chạy; chia lead gãy | Sàn + OneHub | Có — nhịp chia lead tắt |
| 6 | Cách ly | Dữ liệu cách ly đúng; danh mục mẫu lọt vào | — | Không lộ dữ liệu sàn khác |

## 0. Bối cảnh bản thật lúc soát

- **Sống**: `/api/v1/health` trả `ok: true` (bảy lớp dữ liệu); `/login`, `/dat-mat-khau` trả 200; `/`, `/no-company`
  chuyển về đăng nhập (307).
- **Job đưa main lên bản thật đỏ năm lần liền** từ 04:38Z (PR #155, #158, #159, #153, #161): bài «AC-9 nạp và xoá một
  lần» của bộ mẫu thấp tầng đỏ trên cơ sở dữ liệu thật (`packages/db/tests/du-lieu-mau-thap-tang.test.mjs:808`,
  «còn dòng mẫu sau xoá»). Hàng `va-ac9-mau-co-san` (#164) đang sửa; hai lần chạy sau đó chưa có kết quả lúc soát. Vercel
  có hai bản Production mới khoảng 07:20Z. Hệ quả cho bài này: **gộp main chưa chắc đã lên bản thật**.
- **Cạn kết nối vẫn chạm đường xin mã**: 07:16Z hôm nay, một lần xin mã đăng nhập lỗi `EMAXCONNSESSION … pool_size: 15`
  (nhật ký Vercel, đường `/api/v1/auth/email-otp/send-verification-otp`); cùng lỗi ngày 02/11. Sự cố đang xử ở hàng
  `va-pool-ket-noi`.

## 1. Ai tạo sàn và tài khoản đầu tiên

**Hiện trạng: thủ công — chỉ OneHub, chỉ chủ kho.**

- Không tự đăng ký (ADR-0005 §4, `packages/api/src/auth/auth.ts:62` `disableSignUp: true`). Sàn mở bằng lệnh vận hành
  `npm run van-hanh:mo-san -w @quy-hang/db -- --ten "[Tên sàn]" --email <email>` (`packages/db/scripts/mo-san.mjs:1-6`).
  Lệnh tạo dòng sàn, tạo tài khoản theo email (đã xác minh) và gắn người đó **chỉ với vai Quản trị sàn**
  (`mo-san.mjs:43-58`). Không tạo khu, cấu hình, thoả thuận nào.
- Lệnh chạy **trên máy, bằng chuỗi kết nối vai chủ** (`quy_hang_owner`, `bypassrls`) — chuỗi này chỉ chủ kho giữ (ADR-0009
  §2, §9). Không có màn quản trị OneHub, không có nút GitHub như «Nạp dữ liệu mẫu» (`.github/workflows/` chỉ có `ci.yml`,
  `nap-mau.yml`). Máy và phiên tác tử không chạy được trên bản thật (bị chặn ghi bí mật ra đĩa, ghi chú sự cố 06/11).
- Chạy lại an toàn: cùng tên + cùng email quản trị thì «chạy lại»; công ty khác trùng tên được sàn riêng (hàng 56,
  `mo-san.mjs:24-41`, bài kiểm `packages/db/tests/isolation.test.mjs:752-818`).
- **Không đổi được tên sàn** sau khi mở: vai API chỉ đọc bảng sàn (`packages/db/migrations/001_nen_cong_ty.sql:31`),
  không đường đổi tên. Tên này hiện ở đầu trang khách — gõ sai lúc mở là phải sửa thẳng cơ sở dữ liệu.
- Lộ trình có `H13` ở chân trời «Đội vận hành mở sàn mới với cấu hình sao từ một sàn mẫu», mở lại khi «đội vận hành mở
  sàn thứ hai thật» — **điều kiện ấy chính là câu hỏi của bài này**.

**Rủi ro:** mọi sàn mới chờ chủ kho ngồi máy; gõ sai email là tạo tài khoản rác (không đường gỡ trong sản phẩm); gõ sai
tên là sai trên trang khách.

## 2. Đăng nhập lần đầu

**Hiện trạng: chạy được — nhưng quản trị đầu tiên chỉ có một cửa là mã qua email.**

- Cửa thứ nhất: email + mã 6 số (ADR-0005). Cửa thứ hai: mật khẩu tạm do quản trị sàn cấp → `/dat-mat-khau`
  (ADR-0005 «Bổ sung 04/11», hàng 104). Mật khẩu tạm chỉ cấp được **bởi một quản trị khác của cùng sàn**: hàm cơ sở dữ
  liệu đòi người gọi là quản trị sàn (`packages/db/migrations/034_mat_khau.sql:61-63`), và `mo-san.mjs` không cấp mật
  khẩu. Nên **quản trị đầu tiên của sàn mới chỉ vào được bằng mã email**.
- Resend: nhật ký Vercel 7 ngày có hai lỗi «Resend 403» đều ngày 31/10 06:10Z; **từ đó không còn lỗi Resend** dù có
  người xin mã (các lỗi sau đó là cạn kết nối, mục 0). Đó là dấu hiệu tên miền gửi đã thông, **chưa phải bằng chứng thư
  tới hộp người nhận**. DNS hôm nay: khoá DKIM `resend._domainkey.onehub.center` có; `send.onehub.center` là CNAME sang
  `send.forge.rmta.net` (MX `feedback.forge.rmta.net`, SPF riêng của dịch vụ ấy), không phải bản ghi Resend thường
  hướng dẫn; DMARC `p=none`. Biến `RESEND_API_KEY`, `MAIL_FROM` có ở Production. Trạng thái xác minh ở Resend chưa đọc
  được (không có khoá đọc) — **chủ kho xác nhận một lần trên bảng Resend**.
- Lỗi gửi được giấu với người xin mã (ADR-0009 «Hệ quả»: luôn báo «đã gửi» để không lộ ai có tài khoản): thư không tới
  thì quản trị mới chỉ thấy «không nhận được mã», OneHub chỉ biết qua nhật ký.
- Sau đăng nhập: không thuộc sàn → `/no-company` «Nhờ quản trị sàn mời bạn»
  (`apps/web/src/app/(auth)/no-company/page.tsx:12-16`); nhiều sàn → `/select-company`; một sàn → vào thẳng. Người chỉ
  giữ vai Quản trị sàn mở vào Cài đặt sàn (`packages/core/src/navigation.ts:93,114`).

**Rủi ro:** thư mã rơi vào thư rác hay hộp thư công ty chặn → sàn mới kẹt ngay bước đầu, không ai trong sàn gỡ được.

## 3. Quản trị sàn dựng sàn

**Hiện trạng: phần lớn chạy được; thiếu khu sửa / gỡ, đổi tên sàn, trường riêng, thư mời.**

| Mục | Hiện trạng | Bằng chứng | Sàn mới không có dòng nào thì |
| --- | --- | --- | --- |
| Người dùng: mời, vai, bỏ người | Chạy được | `packages/api/src/thanh-vien.ts:113-147, 153, 190`; chặn bỏ quản trị cuối `:41` | — |
| Mật khẩu tạm | Chạy được | `thanh-vien.ts:213-240`; người thuộc sàn khác → 409 `:233` | — |
| Khu phụ trách | Tạo được; **không đổi tên, không gỡ** | API chỉ `GET`/`POST /zones` (`thanh-vien.ts:267, 284`) | Không khu → lead không chia (mục 5) |
| Cách gọi | Chạy được | `apps/web/src/app/(app)/settings/labels/page.tsx:24`; mặc định lõi `packages/api/src/labels/store.ts:9-20` | Nhãn mặc định |
| Trường riêng | **Chưa có** (hàng 47 chưa làm) | `/settings/fields` rơi vào trang tạm (`settings/[section]/page.tsx:30`) | — |
| Trạng thái (nhãn riêng) | Chạy được | `settings/statuses/page.tsx:24` | Sáu trạng thái chuẩn |
| Luật chia lead | Chạy được | `/company/settings/lead-routing`; mặc định `packages/core/src/routing/index.ts:33-38` | 15′ nhận, 30′ gọi, **chia theo khu** |
| Thuế phí | Chạy được | mặc định `packages/core/src/fees/index.ts:51`; nguồn «default»/«company» `packages/api/src/settings/store.ts:15,34-39` | Định nghĩa bao phí mặc định |
| Mẫu nhập | Chạy được | `settings/templates/page.tsx:23-24` | Danh sách rỗng |
| Xử lý bằng AI | Chạy được (bật / tắt) | `packages/api/src/imports/ai/store.ts:127-140`; chỉ quản trị (`migrations/035_xu_ly_bang_ai.sql:29-33`) | Tắt |
| Đổi tên sàn | **Chưa có** | mục 1 | — |

- **Mời không gửi thư** (ADR-0006 §2 cố ý: lúc ấy chưa có thư thật). Người được mời chỉ biết khi quản trị báo ngoài app,
  rồi tự xin mã ở `/login`. Bộ gửi thư duy nhất là mã đăng nhập (`packages/api/src/auth/sender.ts:27-38`).
- **Quản trị sàn không tự nhập hàng**: nhập Excel chỉ cho Đầu chủ và Trưởng nhóm (`packages/api/src/imports/store.ts:45`,
  đúng ADR-0011), ghi hàng chỉ ba vai có Bảng hàng (`migrations/046_bang_quyen_hang.sql:12-16`). Sàn một người (Tham
  chiếu §2) phải tự thêm vai Đầu chủ cho mình ở màn Người dùng — làm được, nhưng không có gợi ý nào.
- **Hôm nay của người chỉ giữ vai quản trị** là trang tạm (`apps/web/src/app/(app)/today/page.tsx:73`); ít gặp vì người
  ấy mở vào Cài đặt sàn. Nhà **Đội** (`/team`) còn là trang tạm.
- **Thoả thuận khác «Xử lý bằng AI»**: không màn, không API nào tạo. Dòng `insert into agreements` duy nhất ở
  `imports/ai/store.ts:136`. Thoả thuận nhận danh mục Invest (`catalog_source`) và danh sách sàn tin cậy
  (`catalog_trusted_companies`, chỉ chủ bảng ghi — `migrations/010_danh_muc_dung_chung.sql:5-12`) đều chỉ OneHub bật
  bằng SQL. Hàng 96, 98 đã nhận phần này.

**Rủi ro:** quản trị làm đúng thứ tự trên màn (mời người → đặt vai) mà không tạo khu đặt đúng tên toà thì lead đầu tiên
nằm chờ, không ai được giao. Không chỗ nào trên màn nói điều đó.

## 3b. Người mở sàn bắt đầu làm việc — ngõ cụt

**Hiện trạng: gãy.** Chủ kho mở sàn «OneHub» trên bản thật (06/11, ảnh màn Cài đặt › Sàn OneHub › Người dùng): một
thành viên, vai «Quản trị sàn», «Quản trị cuối», «Chưa giao vùng»; cột nhà chỉ có nút Cài đặt ở đáy.

- **Cột nhà trống là đúng bảng vai hiện hành** — và chính bảng ấy là ngõ cụt cho người mở sàn. Tham chiếu §9: Quản trị
  sàn không có Hôm nay, Bảng hàng, Đã gửi, Đội, không «+ Lead», không Nhập Excel, không Xuất. Mã:
  `packages/core/src/navigation.ts:64-71` (`company_admin: []` việc tạo, chú thích «ADR-0011: quản trị chỉ quản mẫu file
  ở Cài đặt sàn, không tự nhập»), `:87-117` (nhà theo vai, người chỉ quản trị mở vào Cài đặt).
- **Công cụ mở sàn chỉ gắn vai Quản trị** (`packages/db/scripts/mo-san.mjs:50-58`). Không có bước nào sau đó gợi ý
  thêm vai, tạo khu, mời người hay nhập bảng hàng cũ — trang Hôm nay của người chỉ quản trị là trang tạm
  (`apps/web/src/app/(app)/today/page.tsx:73`).
- **Lối gỡ có, nhưng phải tự biết**: quản trị bấm «Sửa» trên dòng của chính mình và thêm vai Đầu chủ, Đầu khách, Trưởng
  nhóm — API cho quản trị đổi vai của mọi thành viên kể cả chính mình (`packages/api/src/thanh-vien.ts:150-180`). Sau đó
  có Hôm nay, Bảng hàng, Đã gửi, Liên hệ, Đội, menu Tạo có «+ Lead», «Nhập Excel», «Xuất bảng hàng». Đánh đổi: thêm vai
  Trưởng nhóm là thấy chủ nhà cả sàn — Tham chiếu §6 tách quyền cấu hình khỏi quyền xem nguồn có chủ ý.

**Thêm vai rồi, sàn rỗng tạo được gì** (đối chiếu bảng tạo · xem · sửa · gỡ ở `docs/plan/ra-soat-crud-phan-quyen.md` §1,
ở đây chỉ hỏi «ngày 0 tạo được không»):

| Đối tượng | Tạo bằng tay | Qua lead | Qua Nhập Excel | Ngày 0 tạo được? |
| --- | --- | --- | --- | --- |
| Căn / hàng | **Chưa có màn** (API `POST /api/v1/listings` có, không màn gọi — `listings/routes.ts:77`) | **Gãy**: chỉ toà mẫu (mục 4) | Chạy được | **Chỉ qua Excel** |
| Chủ nhà (liên hệ phía chủ) | **Chưa có** — vai API chỉ đọc bảng liên hệ (`migrations/016_lien_he.sql:30`) | Gãy theo lead | Chạy được (cột chủ, số) | **Chỉ qua Excel** |
| Khách (liên hệ Người mua / Người thuê) + nhu cầu | Chỉ ở luồng Gửi, nút «Khách mới» (`shares/new/man-gui.tsx:128`), khi đã chọn căn để gửi | — | — | **Không** — cần một căn Đang bán trước |
| Lead | Ô nhận lead | Gãy với toà thật | — | **Không** với toà thật |
| Khu | Cài đặt › Người dùng › Vùng | — | — | Có (không sửa, không gỡ) |
| Người | Mời | — | — | Có (không thư mời) |

Kết luận khớp lời chủ kho: **ngày 0, tạo · sửa · xoá chưa tồn tại như một lối làm việc** — chỉ có một cửa (Excel) mở
được sau khi người mở sàn tự biết thêm vai cho mình, và cửa ấy cần sẵn một file. Căn và liên hệ không tạo tay được là
**có chủ ý** ở Tham chiếu §3 («ba cửa vào, một đích»: lead, Excel, tin thu) — chỉ đúng khi cửa lead chạy; hôm nay cửa
lead gãy nên thiết kế ba cửa còn một.

**Rủi ro:** sàn đầu tiên ngoài đội đăng nhập xong thấy một màn Cài đặt và không biết làm gì tiếp; sàn không có file bảng
hàng sẵn (môi giới mới, sàn một người) không có lối nào đưa căn đầu tiên vào.

## 4. Đưa hàng vào

**Hiện trạng: nhập Excel chạy được; ô nhập lead gãy với toà thật; không có lối tạo căn tay ngoài lead (đúng thiết kế
«ba cửa vào»); danh mục Invest chưa tới.**

- **Nhập Excel `/imports/new`: chạy được với sàn thật.** Mã căn không có trong danh mục **không bị từ chối**: lõi chỉ
  lấy thuộc tính danh mục khi tra ra «found», còn lại giữ giá trị trong file (`packages/core/src/import/apply.ts:101-117`);
  dòng chỉ bị chặn khi thiếu toà hay có ô chặn (`packages/api/src/imports/store.ts:242`). Tên toà là chữ tự do. Hệ quả:
  căn vào bảng hàng không có thuộc tính tự điền, không mang dấu «chưa có trong danh mục».
- **Nhưng nhập Excel cũng đối chiếu danh mục mẫu** (`packages/api/src/imports/routes.ts:60`): mã của sàn thật trùng dạng
  mã mẫu thì toà và thuộc tính căn bị «lấy theo danh mục» mẫu (`apply.ts:103-114`) — sai lặng lẽ, khó thấy.
- **Ghép cột bằng AI (hàng 68)**: bật được, nhưng **bản thật không có `ANTHROPIC_API_KEY`** (danh sách biến Production) →
  luôn chạy chế độ tất định, lý do «thiếu khoá» (`packages/api/src/imports/ai/routes.ts:94-95`). Bật khoá là việc tốn
  tiền (trần 10 USD/tháng/sàn, `packages/core/src/config/so.ts:113`) — quyết của chủ kho.
- **Ô lạ có đề xuất (hàng 69)**: chưa có.
- **Ô nhập lead `/leads/new`: gãy với sàn thật.** Danh sách toà là toà của danh mục mẫu
  (`packages/api/src/leads/routes.ts:47-48`, trả cho mọi sàn ở `:80`); ô toà chỉ là danh sách chọn
  (`apps/web/src/app/(app)/leads/new/o-lead.tsx:255-270`). Mã căn thật báo «Mã căn chưa có trong danh mục — chọn toà»
  (`leads/new/nguon-that.tsx:32`) mà chỉ có Toà A, Toà B mẫu để chọn. API nhận tên toà tự do
  (`packages/core/src/dedupe/index.ts:54`), màn thì không.
- **Tạo căn tay**: API `POST /api/v1/listings` có và không cần căn trong danh mục (`packages/api/src/listings/routes.ts:77`),
  nhưng không màn nào gọi — đúng Tham chiếu §3 «ba cửa vào» (lead, Excel, tin thu). Vì cửa lead gãy, **Excel là cửa vào
  duy nhất dùng được của sàn mới**.
- **Lên Đang bán không cần căn trong danh mục**: cần mã căn (chữ bất kỳ), giá kèm điều kiện phí, một ảnh thật, pháp lý,
  tình trạng sử dụng (`packages/core/src/listing/status.ts:90-104`). Kho ảnh bản thật có đủ ba biến `STORAGE_S3_*`.
- **Danh mục Invest**: cửa nhận `POST /api/v1/catalog/feeds` dựng xong (hàng 10, đã ký), nhưng (a) chỉ sàn trong danh sách
  tin cậy + có thoả thuận `catalog_source` — cả hai chỉ bật bằng SQL; (b) **không đường tra nào đọc vùng danh mục**: gõ
  mã căn, đọc cả danh mục, nhập Excel, toà của lead đều đọc `SAMPLE_CATALOG`
  (`packages/api/src/catalog/routes.ts:44`, `doc-ca-danh-muc.ts:71`, `imports/routes.ts:60`, `leads/routes.ts:48`). Vùng
  danh mục chỉ được đọc để ghép thuộc tính ở trang khách, Đã gửi, Hôm nay đầu khách
  (`public/store.ts:62`, `da-gui/store.ts:78,102`, `today-buyer/store.ts:11`). Hàng 99 «đọc vùng danh mục» chưa mở;
  chiều ngược «xác nhận danh mục» (94–102) chưa dựng. Tham chiếu §3 nói danh mục Invest lúc đầu sẽ thưa — **bảng hàng sàn
  nhập là hạt giống**, nhưng hôm nay hạt giống ấy không quay lại thành toà chọn được ở ô lead.

**Rủi ro:** sàn nhập Excel xong, telesales vẫn không nhập được lead cho chính những toà vừa nhập.

## 5. Ngày làm việc đầu tiên

**Hiện trạng: các màn chạy với sàn rỗng; chia lead và thông báo lead không chạy trên bản thật.**

- **Trạng thái trống đều có**: Hôm nay theo vai — Trưởng nhóm «Không lead nào quá hạn», Đầu chủ «Hôm nay không còn việc»,
  Telesales «Chưa có lead nào», Đầu khách «Chưa có gì mới trong 7 ngày» (`today/truong-nhom-trang-thai.ts:53`,
  `today/mobile/het-viec.tsx:13-15`, `leads/mine/lead-da-nhap.tsx:249`, `today/buyer/dau-khach.ts:70`). Bảng hàng «Sàn
  chưa có hàng nào» kèm nút Nhập Excel (`inventory/bang-hang.tsx:481-490`); Đã gửi, luồng Gửi, Liên hệ có câu trống.
- **Nhịp chia lead tắt trên bản thật — gãy.** `POST /api/v1/jobs/lead-tick` trả **503** lúc soát (503 = thiếu
  `JOB_SECRET`, `packages/api/src/jobs/routes.ts:31-35`); danh sách biến Production không có `JOB_SECRET`. Lịch gọi mỗi
  phút là `pg_cron` trên Supabase, bước tay của chủ kho (ADR-0017 «Bật nhịp mỗi phút trên bản thật», chưa làm). ADR-0017
  «Hệ quả»: chưa bật thì không lead nào được chia. Ngoại lệ duy nhất: lead trùng chủ / căn với đầu chủ đang giữ về thẳng
  người đó lúc nhập (`packages/api/src/leads/store.ts:130`). **Đúng cho cả «[Mẫu] Sàn thử»** — lúc soát, sàn thử cũng
  không được chia lead trên bản thật.
- **Bật nhịp rồi vẫn kẹt ở khu.** Mặc định `zone_round_robin` (`packages/core/src/config/so.ts:58-61`) chỉ chọn đầu chủ
  có khu trùng tên toà (`packages/core/src/routing/index.ts:142,166-168`); sàn mới không khu → «chưa chia được», báo trưởng
  nhóm. Lối gỡ: quản trị tạo khu đặt **đúng tên toà** rồi gán đầu chủ, hoặc đổi sang chia đều cả sàn ở Luật chia lead.
  Tên toà phải khớp chữ — mà toà của lead lại chỉ là toà mẫu (mục 4).
- **Thông báo lead**: khoá máy chủ tự sinh, không cần biến riêng (`packages/api/src/push/khoa-vapid.ts:6-10`); từng người
  tự bật trên từng máy, iPhone phải cài ra màn hình chính trước (`apps/web/src/lib/push/dang-ky.ts:33-40`); dải bật chỉ
  cho Đầu chủ, Trưởng nhóm. Lời báo giao lead và quá hạn chỉ phát trong nhịp chia (`jobs/lead-tick.ts:163-165`) → **tắt
  theo nhịp**. Không có thư hay Zalo (đúng bất biến 3).
- **Gửi căn cho khách `/s/<mã>`: chạy được.** Trang khách mang tên sàn từ bảng sàn (`packages/api/src/public/store.ts:56,61,95`,
  `apps/web/src/app/s/[code]/trang.tsx:12-13`), người gửi là người trong phiên. Chưa có logo, tên hiển thị riêng, tên miền
  riêng — mọi sàn chung `quyhang.onehub.center` (`shares/new/man-gui.tsx:224`). Người bấm gửi qua bảng chia sẻ của máy.

**Rủi ro:** sàn đầu tiên chạy đúng như thiết kế «telesales nhập → đầu chủ nhận trong 15 phút» thì không ai nhận được gì,
và không màn nào báo lý do.

## 6. Cách ly và dữ liệu

**Hiện trạng: dữ liệu sàn cách ly đúng; danh mục mẫu lọt vào mọi sàn.**

- **Chạy được**: sàn đang làm chọn ở API mỗi lời gọi (`packages/api/src/auth/company.ts:31-37`); mọi bảng của công ty có
  luật theo dòng; bộ kiểm cách ly có ca dựng sàn mới bằng chính công cụ mở sàn và kiểm người sàn mới đọc 0 dòng của sàn cũ
  ở mọi bảng có mã sàn (`packages/db/tests/isolation.test.mjs:752-818`), chạy trên cơ sở dữ liệu thật trước mỗi lần
  deploy. Hàng, chủ nhà, lead của «[Mẫu] Sàn thử» không sang sàn khác.
- **Gãy — danh mục mẫu lọt vào sàn thật** ở bốn chỗ: toà của ô lead, gõ mã căn, đọc cả danh mục (nhóm hàng ở Bảng hàng,
  gợi ý mã ở hồ sơ căn — `apps/web/src/app/(app)/units/ho-so/o-ma-can.tsx:36`), nhập Excel. Danh mục là dữ liệu dùng
  chung theo thiết kế (lớp `catalog`), nên đây không phải rò dữ liệu sàn khác — nhưng là **dữ liệu giả hiện trên màn sàn
  thật** và có thể ghi thuộc tính giả vào hàng thật (mục 4).
- **Bộ kiểm không phủ**: tầng API (danh mục nằm trong bộ nhớ API) và hành vi của sàn chưa cấu hình gì (chia lead khi không
  khu).
- **Bản xem trước dùng chung cơ sở dữ liệu thật** (ADR-0009 «Hệ quả»; Preview có `DATABASE_URL`, ghi chú sự cố 06/11 «bản
  xem trước dùng chung DATABASE_URL»): mọi nhánh đang mở chạy trên cùng dữ liệu với sàn thật. Bản xem trước không nhận
  khoá số chủ (không có `OWNER_PHONE_KEY` ở Preview) nên không giải được số, nhưng đọc / ghi được mọi bảng khác bằng vai
  chủ. ADR-0009 ghi rõ phải tách hay tắt **trước khi có dữ liệu thật** — chưa làm.
- **Pháp lý**: Tham chiếu §3 «Điều kiện trước sàn đầu tiên ngoài đội: chủ kho rà pháp lý theo Luật Bảo vệ dữ liệu cá
  nhân»; ADR-0009 §10 «chỉ dữ liệu mẫu tới khi người pháp lý rà». Chưa có ghi nhận đã rà.

## 7. Khoảng trống xếp theo độ chặn

**A. Chặn — sàn mới không chạy được một ngày làm việc**

| # | Khoảng trống | Loại | Ai gỡ |
| --- | --- | --- | --- |
| A0 | Người mở sàn chỉ giữ vai Quản trị: cột nhà trống, không nút tạo, không gợi ý bước tiếp; không tạo tay được căn, chủ nhà; khách chỉ tạo được khi đã có căn Đang bán | Sản phẩm — mở lại §3 «ba cửa vào» và bảng vai §9 | Hàng đề xuất 0a, 0b, 0c; ngay hôm nay chủ kho tự thêm vai cho mình |
| A1 | Nhịp chia lead tắt trên bản thật (thiếu `JOB_SECRET`, chưa lịch `pg_cron`) — không lead nào được chia, không thông báo lead nào phát | Vận hành, ngoài kho | Chủ kho, theo ADR-0017 bảy bước (~15 phút) |
| A2 | Sàn chưa có khu thì cách chia mặc định không giao cho ai, không màn nào nói vì sao | Sản phẩm | Hàng đề xuất 1, 4 |
| A3 | Ô nhập lead chỉ chọn toà mẫu — sàn thật không nhập được lead cho toà của mình | Sản phẩm | Hàng đề xuất 2 (hoặc hàng 99 khi danh mục Invest phủ khu của sàn) |
| A4 | Danh mục mẫu hiện ở sàn thật và có thể ghi thuộc tính mẫu vào hàng nhập Excel | Sản phẩm | Hàng đề xuất 3; hàng 99 đóng hẳn |

**B. Phải xong trước dữ liệu chủ nhà thật**

| # | Khoảng trống | Loại | Ai gỡ |
| --- | --- | --- | --- |
| B1 | Rà pháp lý (Luật Bảo vệ dữ liệu cá nhân) trước sàn đầu tiên ngoài đội | Ngoài kho | Chủ kho |
| B2 | Bản xem trước đọc / ghi cơ sở dữ liệu thật | Hạ tầng | Hàng đề xuất 8 |
| B3 | Job đưa main lên bản thật đỏ từ 04:38Z hôm nay; cạn kết nối còn chạm đường xin mã lúc 07:16Z | Hạ tầng, đang xử | Hàng `va-ac9-mau-co-san`, `va-pool-ket-noi` |

**C. Thủ công — chạy được nhưng mỗi sàn mới tốn công OneHub hay dễ kẹt**

| # | Khoảng trống | Loại | Ai gỡ |
| --- | --- | --- | --- |
| C1 | Mở sàn chỉ chủ kho, bằng lệnh tay và chuỗi kết nối chủ | Vận hành | Hàng đề xuất 5 |
| C2 | Quản trị đầu tiên chỉ có cửa mã email; xác minh tên miền gửi ở Resend chưa đọc được | Vận hành | Chủ kho xác nhận trên bảng Resend; hàng đề xuất 5 có thể cấp mật khẩu tạm |
| C3 | Mời không gửi thư — quản trị báo tay | Sản phẩm (ADR-0006 §2 cố ý) | Hàng đề xuất 6, mở lại quyết định |
| C4 | Không đổi tên sàn, không đổi tên / gỡ khu | Sản phẩm | Hàng đề xuất 7 |
| C5 | Danh mục Invest chỉ bật bằng SQL (danh sách tin cậy + thoả thuận) | Đã có hàng | Hàng 96, 98 |
| C6 | «Xử lý bằng AI» bật được nhưng bản thật không có khoá AI → luôn tất định | Quyết tốn tiền | Chủ kho |

**D. Chưa có, không chặn ngày đầu**

Trường riêng (hàng 47) · ô lạ có đề xuất (hàng 69) · nhà Đội (trang tạm) · Hôm nay của người chỉ quản trị (trang tạm) ·
logo / tên miền riêng trang khách · cấu hình sao từ sàn mẫu (`H13`, điều kiện mở lại đã tới).

**Ra khỏi kho — việc của chủ kho, không thành hàng:** A1 bật nhịp chia lead · B1 rà pháp lý · C2 xác nhận Resend · C6
quyết khoá AI · bật danh sách tin cậy + thoả thuận danh mục cho sàn đầu tiên (tới khi hàng 96, 98 xong).

## 8. Đề xuất hàng lộ trình

Theo khuôn `docs/plan/lo-trinh.json`; `ma` để giám sát đặt. Thứ tự theo độ chặn. Phiên này không ghi `lo-trinh.json`.

Ba hàng 0a–0c thêm sau khi chủ kho thử trên bản thật (06/11). 0b và 0c mở lại điều đã chốt ở Tham chiếu §3 («ba cửa
vào») — cần chủ kho quyết ở Cổng Phạm vi.

```json
[
  {
    "ma": "",
    "slug": "bat-dau-san",
    "cau_giao": "Quản trị sàn mới đăng nhập lần đầu và thấy danh sách «Bắt đầu sàn» — thêm vai làm việc cho mình, tạo khu, mời người, đưa căn đầu tiên vào — mỗi mục một chạm tới đúng màn và tự đánh dấu khi xong",
    "vai": "Quản trị sàn",
    "hang": "T2",
    "vi_sao": "Audit sàn mới ngày 0 A0, mục 3b: chủ kho mở sàn «OneHub» trên bản thật 06/11, người mở sàn chỉ có vai Quản trị, cột nhà trống, không nút tạo, không biết làm gì tiếp. Thay trang tạm của Hôm nay người chỉ quản trị",
    "bat_khi": "Sàn mới (một thành viên, không khu, không hàng): quản trị mở app thấy danh sách bốn mục; thêm vai cho mình xong thì cột nhà hiện nhà của vai ấy không cần tải lại tay; mục tự đánh dấu theo dữ liệu thật của sàn; sàn đã chạy không thấy danh sách",
    "vung": ["apps/web/src/app/(app)/settings/**", "apps/web/src/app/(app)/today/**", "packages/core/src/navigation.ts"]
  },
  {
    "ma": "",
    "slug": "tao-can-tay",
    "cau_giao": "Đầu chủ tạo một căn bằng tay từ menu Tạo — gõ toà và mã căn (hay mã lô, địa chỉ), giá kèm điều kiện phí, chủ nhà và số — căn vào «Chỉ tôi» ở Chưa đủ để rao, qua cùng kiểm trùng như lead và nhập file",
    "vai": "Đầu chủ",
    "hang": "T3",
    "vi_sao": "Audit sàn mới ngày 0 A0, mục 3b: sàn không có file sẵn thì không có lối đưa căn đầu tiên vào; API tạo hàng đã có, không màn gọi. Mở lại Tham chiếu §3 «ba cửa vào» — chủ kho quyết",
    "bat_khi": "Tạo một căn ngoài danh mục thì căn hiện ở Bảng hàng của người tạo; căn đã có hàng mở của sàn thì chặn và chỉ hàng kia; chủ nhà trùng số thì về đầu chủ đang giữ; số chủ chỉ lưu bản mã; vai không có Bảng hàng không thấy nút",
    "vung": ["apps/web/src/app/(app)/units/**", "apps/web/src/components/shell/**", "packages/api/src/listings/**", "packages/api/src/owners/**"]
  },
  {
    "ma": "",
    "slug": "tao-lien-he-tay",
    "cau_giao": "Đầu chủ hay đầu khách thêm một liên hệ bằng tay ở màn Liên hệ — tên, số, loại Chủ bán · Chủ cho thuê · Người mua · Người thuê; số đã có người giữ thì báo «đã có — [Tên] đang giữ», không tạo trùng",
    "vai": "Đầu chủ",
    "hang": "T3",
    "vi_sao": "Audit sàn mới ngày 0 A0, mục 3b: liên hệ chỉ sinh từ lead, nhập file hay luồng Gửi; khách chỉ tạo được khi đã chọn một căn để gửi. Gần chỗ hở G3 của rà soát CRUD 05/11",
    "bat_khi": "Thêm liên hệ mới thì hiện ở Liên hệ của người thêm; số trùng trong sàn bị chặn kèm tên người giữ; liên hệ chủ mang lớp nguồn, không ra ngoài sàn; khách thêm tay chọn được ở luồng Gửi",
    "vung": ["apps/web/src/app/(app)/contacts/**", "packages/api/src/contacts/**", "packages/db/migrations/**"]
  },
  {
    "ma": "",
    "slug": "chia-lead-khi-chua-co-khu",
    "cau_giao": "Sàn chưa đặt khu phụ trách nào thì lead mới vẫn được giao đều cho đầu chủ của cả sàn, và màn Luật chia lead nói rõ đang chia theo cách nào, vì sao",
    "vai": "Quản trị sàn",
    "hang": "T2",
    "vi_sao": "Audit sàn mới ngày 0 (docs/plan/audit-san-moi-day-0.md A2): mặc định zone_round_robin chỉ giao cho đầu chủ có khu trùng tên toà; sàn mới không khu → mọi lead nằm chờ. Đổi lối lùi của mặc định là quyết định sản phẩm — hỏi chủ kho ở Cổng Phạm vi",
    "bat_khi": "Sàn không khu: lead mới được giao cho một đầu chủ trong nhịp kế; sàn có khu: hành vi cũ không đổi; màn Luật chia lead hiện dòng giải thích khi sàn chưa có khu; bài kiểm phủ cả hai",
    "vung": ["packages/core/src/routing/**", "packages/api/src/jobs/**", "apps/web/src/app/(app)/settings/lead-routing/**"]
  },
  {
    "ma": "",
    "slug": "toa-cua-san-o-lead",
    "cau_giao": "Telesales chọn toà cho lead trong danh sách gồm toà của danh mục và toà sàn đã có hàng, hoặc gõ tên toà mới; kiểm trùng chạy như với toà danh mục",
    "vai": "Telesales",
    "hang": "T2",
    "vi_sao": "Audit sàn mới ngày 0 A3: ô toà ở /leads/new chỉ có toà của danh mục mẫu (leads/routes.ts:48) — sàn thật không nhập được lead. Tham chiếu §3: bảng hàng sàn nhập là hạt giống khi danh mục Invest còn thưa",
    "bat_khi": "Sàn mới nhập Excel hai toà thì ô toà của lead liệt hai toà ấy; gõ tên toà chưa có vẫn gửi được lead; sàn khác không thấy toà của sàn này; kiểm trùng theo căn và theo chủ nhà vẫn đúng",
    "vung": ["packages/api/src/leads/**", "apps/web/src/app/(app)/leads/new/**"]
  },
  {
    "ma": "",
    "slug": "danh-muc-mau-chi-san-mau",
    "cau_giao": "Dự án mẫu chỉ hiện ở sàn mẫu: sàn thật gõ mã căn, nhập lead hay nhập Excel không bao giờ nhận tên toà hay thuộc tính căn của «[Mẫu] Dự án căn hộ thử»",
    "vai": "Đầu chủ",
    "hang": "T3",
    "vi_sao": "Audit sàn mới ngày 0 A4: SAMPLE_CATALOG phục vụ mọi sàn ở bốn đường tra; nhập Excel ghi thuộc tính mẫu vào hàng thật khi mã trùng dạng. Có thể gộp vào hàng 99 nếu 99 mở ngay",
    "bat_khi": "Người sàn thật tra mã căn mẫu nhận «chưa có trong danh mục»; nhập file có mã trùng mã mẫu không lấy thuộc tính mẫu; «[Mẫu] Sàn thử» vẫn tra được như cũ; ca cách ly ở tầng API",
    "vung": ["packages/api/src/catalog/**", "packages/api/src/imports/**", "packages/api/src/leads/**"]
  },
  {
    "ma": "",
    "slug": "nhip-chia-lead-bao-song",
    "cau_giao": "Quản trị sàn mở Luật chia lead và thấy nhịp chia lead chạy lần cuối lúc nào; nhịp ngừng quá năm phút thì màn và trang sức khoẻ báo đỏ",
    "vai": "Quản trị sàn",
    "hang": "T2",
    "vi_sao": "Audit sàn mới ngày 0 A1: nhịp chia trả 503 trên bản thật mà không màn nào nói; sàn thử cũng chưa từng chia lead trên bản thật",
    "bat_khi": "Nhịp chạy: màn hiện giờ lần chạy cuối; nhịp tắt hay thiếu khoá: màn báo «Lead chưa được chia tự động» và /api/v1/health trả cờ việc nền; không lộ khoá",
    "vung": ["packages/api/src/jobs/**", "packages/api/src/app.ts", "apps/web/src/app/(app)/settings/lead-routing/**"]
  },
  {
    "ma": "",
    "slug": "nut-mo-san",
    "cau_giao": "Chủ kho mở sàn mới bằng một nút trên GitHub — tên sàn, email quản trị — như nút Nạp dữ liệu mẫu, không cần chuỗi kết nối chủ trên máy; nút nói «sàn mới» hay «chạy lại» và không in email ra nhật ký",
    "vai": "Vận hành OneHub",
    "hang": "T3",
    "vi_sao": "Audit sàn mới ngày 0 C1, C2: mở sàn hôm nay là lệnh tay bằng vai chủ trên máy chủ kho. Chân trời H13 mở lại «khi đội vận hành mở sàn thứ hai thật» — điều kiện đã tới. Tuỳ chọn: cấp mật khẩu tạm một lần cho quản trị đầu tiên khi thư mã không tới",
    "bat_khi": "Chạy nút với tên + email mới thì có sàn và quản trị; chạy lại cùng cặp không tạo trùng; ô email chỉ nhận đúng một email; nhật ký job không chứa email; chỉ chạy trên main với environment production",
    "vung": [".github/workflows/**", "packages/db/scripts/**"]
  },
  {
    "ma": "",
    "slug": "thu-moi-vao-san",
    "cau_giao": "Người được quản trị mời nhận một thư «[Tên sàn] mời bạn dùng Quỹ hàng» kèm đường đăng nhập; mời lại không gửi trùng trong ngày; email đã có tài khoản nhận cùng thư",
    "vai": "Quản trị sàn",
    "hang": "T2",
    "vi_sao": "Audit sàn mới ngày 0 C3: mời không gửi thư, quản trị báo tay. ADR-0006 §2 bỏ thư vì lúc ấy chưa có thư thật — Resend nay đã gửi được, mở lại cần chủ kho",
    "bat_khi": "Mời một email thì một thư tới bộ gửi; câu trả lời của màn giống hệt dù email đã có tài khoản hay chưa; lỗi gửi không chặn lời mời và hiện ở màn Người dùng",
    "vung": ["packages/api/src/thanh-vien.ts", "packages/api/src/auth/sender.ts", "apps/web/src/app/(app)/settings/users/**"]
  },
  {
    "ma": "",
    "slug": "ten-san-va-khu",
    "cau_giao": "Quản trị sàn đổi tên sàn hiện trên trang khách, đổi tên hay gỡ một khu phụ trách; mỗi lần đổi ghi người và vai",
    "vai": "Quản trị sàn",
    "hang": "T3",
    "vi_sao": "Audit sàn mới ngày 0 C4: tên sàn chỉ đặt lúc mở bằng lệnh, vai API chỉ đọc bảng sàn; khu chỉ tạo được. Khu sai tên toà làm hỏng chia lead theo khu",
    "bat_khi": "Đổi tên sàn thì trang khách mở sau đó mang tên mới; gỡ khu còn người phụ trách thì hỏi trước; vai khác quản trị không đổi được; sàn khác không thấy",
    "vung": ["packages/api/src/thanh-vien.ts", "packages/db/migrations/**", "apps/web/src/app/(app)/settings/users/**"]
  },
  {
    "ma": "",
    "slug": "xem-truoc-co-so-du-lieu-rieng",
    "cau_giao": "Bản xem trước của nhánh chạy trên cơ sở dữ liệu riêng, không đọc hay ghi cơ sở dữ liệu bản thật; deploy main vẫn áp migration và chạy bộ kiểm cách ly trên bản thật",
    "vai": "nen",
    "hang": "T3",
    "vi_sao": "Audit sàn mới ngày 0 B2; ADR-0009 «Hệ quả»: tách hoặc tắt bản xem trước trước khi có dữ liệu thật. Điều kiện cho sàn thật đầu tiên",
    "bat_khi": "Biến DATABASE_URL của Preview khác Production; một bản xem trước ghi dữ liệu thì bản thật không đổi; bài kiểm của CI đỏ nếu hai chuỗi trùng",
    "vung": [".github/workflows/**", "apps/web/vercel.json", "docs/adr/**"]
  }
]
```

**Khuyến nghị thứ tự:** ngay hôm nay, chủ kho tự thêm vai Đầu chủ (và Đầu khách nếu muốn gửi khách) cho mình ở sàn «OneHub»
để có Bảng hàng và Nhập Excel — thêm Trưởng nhóm là thấy chủ nhà cả sàn. Hàng đầu tiên nên mở: `bat-dau-san` (T2, gỡ ngõ
cụt mà không đụng quyết định đã chốt); `tao-can-tay` và `tao-lien-he-tay` chờ chủ kho quyết có mở lại «ba cửa vào» không.
Song song, chủ kho bật nhịp chia lead (A1, ngoài kho) — gỡ cho cả sàn thử; rồi `chia-lead-khi-chua-co-khu`
và `toa-cua-san-o-lead` (hai hàng T2 nhỏ, mở khoá ngày làm việc đầu); `danh-muc-mau-chi-san-mau` gộp vào hàng 99 nếu 99
mở trong đợt kế, không thì làm riêng; `xem-truoc-co-so-du-lieu-rieng` và rà pháp lý trước dữ liệu chủ nhà thật.
