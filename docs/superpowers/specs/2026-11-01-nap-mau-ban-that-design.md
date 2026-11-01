# Nạp dữ liệu mẫu lên bản thật — thiết kế (hàng 87)

Ngày 2026-11-01 · Dãy D, đợt dau-chu-dong-vao · Hạng T3 · Hồ sơ `_acceptance/nap-mau-ban-that/`

## Vì sao

Chủ kho mở bản thật ngày 01/11 và không thấy gì: cơ sở dữ liệu thật có 2 sàn, 2 thành viên, mọi bảng khác 0 dòng. Bộ
nạp mẫu của hàng 5 (`packages/db/seed/nap.mjs`) chỉ dựng sàn, tài khoản mẫu, vai, khu — phần hàng, chủ nhà, lead nằm
trong `mau/du-lieu-mau.json` «chờ các hàng dựng bảng». Các bảng ấy nay đã có (migration 004–015). ADR-0009 chốt bản thật
chỉ chứa dữ liệu mẫu tới khi pháp lý rà.

## Mục tiêu

- Một nút chạy tay trên GitHub Actions (`nap-mau.yml`) nạp vào sàn «[Mẫu] Sàn thử» trên bản thật: 6 người mẫu đủ vai,
  2 khu và khu phụ trách, 40 hàng đúng sáu trạng thái của gói (14 Đang bán, 6 Chưa đủ, 5 Đang cọc, 5 Đã bán, 5 Tạm
  dừng, 5 Ngừng hẳn), mỗi hàng có đầu chủ phụ trách, 30 chủ nhà gắn hàng, 12 lead với kết quả kiểm trùng do chính luật
  kiểm trùng tính.
- Số chủ nhà và số lead chỉ vào cơ sở dữ liệu dạng bản mã, giải được bằng khoá Production (ADR-0013).
- Tài khoản chủ kho (email truyền vào job, không ghi vào kho) là thành viên sàn mẫu.
- Chạy lại không đổi một dòng. Nút gỡ chỉ xoá sàn mẫu và tài khoản miền mẫu; sàn thật không đổi một dòng.

## Không làm

- Không ghi danh mục vào vùng danh mục dùng chung. Đường tra danh mục vẫn phục vụ danh mục mẫu 180 căn ở mọi môi trường
  (`packages/api/src/catalog/sample.ts`), nên chủ kho đã thấy 180 căn mà không cần dòng nào. Ghi vào vùng dùng chung thì
  mọi sàn thật thấy danh mục «[Mẫu]», và gỡ phải xoá dòng mà cơ sở dữ liệu không cho vai nào xoá (migration 010) cùng
  thoả thuận và danh sách tin không xoá dây chuyền theo sàn.
- Không đổi gói `du-lieu-mau.json` (tệp sinh tất định nhiều hồ sơ đọc). Trường lead mà gói không có (nhu cầu, giá, phí,
  thời điểm) bộ nạp điền tất định.
- Không giao diện mới, không đường API mới, không migration.

## Cách làm

**Một đường ghi.** Bộ nạp mới `packages/db/seed/nap-ban-that.ts` chạy bằng `node --import tsx`. Phần nền giữ như
`nap.mjs` (vai chủ: sàn, tài khoản, vai, khu, khu phụ trách — dùng lại `napMau`). Phần hàng, chủ nhà, người phụ trách,
lead đi qua chính hàm ghi của API (`createListing`, `applyCommand`, `putOwner`, `assignAgent`, `createLead` trong
`packages/api/src/listings|owners|leads/store.ts`), mỗi bước trong `set local role quy_hang_app` với `app.user_id` là
người mẫu đúng vai (quản trị tạo hàng, trưởng nhóm gán đầu chủ, đầu chủ ghi chủ nhà và đổi trạng thái, telesales nhập
lead). Luật theo dòng, luật vai, sự kiện của hàng và luật kiểm trùng vì thế áp y như khi người bấm.

**Thứ tự.** Hàng (tạo ở Chưa đủ hay Đang bán) → gán đầu chủ → chủ nhà → chuyển trạng thái đích (Đã bán kèm giá chốt bằng
giá niêm yết và ngày cố định; Ngừng hẳn kèm lý do cố định theo thứ tự) → lead (sau cùng để kiểm trùng thấy hàng và số
chủ đã có).

**Khoá.** Bộ nạp đọc `OWNER_PHONE_KEY` bằng `khoaSoChu(process.env, { choPhepKhoaDev: false })` trước khi mở kết nối:
thiếu, sai dạng hay khoá dev → thoát 1, không ghi gì, thông điệp chỉ nêu tên biến. Job đặt `NODE_ENV=production` để
`createLead` (đọc khoá bằng mặc định) cũng không rơi về khoá dev. Chỗ để khoá trên GitHub là Hỏi-1.

**Chạy lại.** Bản mã có nonce ngẫu nhiên nên ghi đè sẽ đổi nội dung. Khoá tự nhiên trong sàn mẫu: hàng = (toà, mã căn),
chủ nhà = hàng, lead = (toà, mã căn hoặc rỗng, dấu vết số). Dòng đã có thì bỏ qua, không ghi lại. Mọi việc của một lần
chạy nằm trong một giao dịch: lỗi ở đâu cũng rollback trọn.

**Tài khoản chủ kho.** Tham số `--email`. Từ chối email sai dạng hay thuộc miền mẫu. Tài khoản có sẵn thì chỉ thêm (hay
đặt lại) dòng thành viên ở sàn mẫu với vai theo Hỏi-2; chưa có thì tạo tài khoản (email đã xác minh như `mo-san.mjs`).
Dòng thành viên ở sàn khác không đụng. Đầu ra lệnh không in email.

**Nhận diện sàn mẫu.** Sàn mẫu = sàn tên đúng «[Mẫu] Sàn thử» CÙNG có tài khoản quản trị mẫu
(`quan-tri@mau.quy-hang.test`) là thành viên (Hỏi-3). Tên một mình không đủ: sàn trùng tên mở được (hồ sơ
mo-san-trung-ten), nên một sàn thật có thể tự đặt đúng tên ấy. Nạp tìm sàn khớp cả hai; không có thì dựng sàn mẫu mới —
không bao giờ ghi vào sàn trùng tên thiếu quản trị mẫu. Bộ nạp hàng 5 (`napMau`) tìm theo tên; bộ nạp mới tìm sàn trước
rồi mới gọi phần nền với id sàn ấy.

**Gỡ.** `--go`: 0 sàn mẫu khớp → in «không có gì để gỡ»; từ 2 sàn trở lên → từ chối, không xoá gì. Đúng 1 sàn → xoá theo
id sàn ấy (dây chuyền mọi bảng của sàn) và tài khoản email miền mẫu không còn là thành viên sàn nào. Tài khoản chủ kho
chỉ mất dòng thành viên sàn mẫu (dây chuyền). Đây là lỗ mà quyết d-5 của hồ sơ du-lieu-mau-san-thu để ngỏ «vì chưa có
môi trường thật».

**Nút trên GitHub.** `.github/workflows/nap-mau.yml`: chỉ `workflow_dispatch`; tham số `viec` (`nap` | `go`), `email`,
`xac_nhan` (với `go` phải gõ đúng tên sàn mẫu). Job chạy ở environment `production`, bước đầu từ chối khi ref không
phải `main` — environment production giữ khoá của cơ sở dữ liệu thật, và nhánh khác chạy mã chưa duyệt (cùng lý do
ADR-0013 §5 không cho bản xem trước nhận khoá). Email được che trong log (`::add-mask::`). Bí mật chỉ đi qua `env`.

## Hỏi chủ kho

- **Hỏi-1 — khoá mã hoá trên GitHub.** Khuyến nghị: chủ kho thêm secret `OWNER_PHONE_KEY` vào environment `production`
  của GitHub (cùng giá trị Vercel Production, chép từ trình quản lý mật khẩu) và giới hạn environment ấy chỉ nhánh
  `main`. Lối khác: nạp qua API của bản thật bằng `JOB_SECRET` — khoá không rời Vercel, nhưng phải mở một đường ghi mẫu
  mới trên bản thật (ngoài vùng hàng, thêm bề mặt tấn công) và vẫn phải thêm `JOB_SECRET` vào GitHub. Chọn lối khác thì
  phần mã hoá chuyển sang máy chủ, AC-2 đo trên đường ấy.
- **Hỏi-2 — vai của chủ kho trong sàn mẫu.** Khuyến nghị: đủ mọi vai (quản trị, trưởng nhóm, đầu chủ, đầu khách,
  telesales) để mọi màn có dữ liệu. Lối khác: chỉ quản trị — màn theo vai (hàng của tôi, lead được chia) trống.

- **Hỏi-3 — nhận sàn mẫu khi gỡ (xoá dữ liệu trên bản thật).** Khuyến nghị: tên đúng cộng quản trị mẫu miền mẫu là
  thành viên. Lối khác: nhận theo id sàn ghi lại sau lần nạp (biến GitHub hay tệp) — chắc hơn nhưng thêm một chỗ giữ
  trạng thái ngoài cơ sở dữ liệu; mất nó là không gỡ được bằng nút.

## Kiểm

Bộ kiểm `packages/db/seed/nap-ban-that.test.ts` (chạy `node --import tsx --test`) trên Postgres dãy: nạp vào cơ sở dữ
liệu có một sàn thật dựng sẵn (hàng, chủ nhà, lead, thành viên); đếm và so từng bảng; giải bản mã bằng khoá thử; chụp
toàn bảng trước/sau để chứng chạy lại và gỡ không đổi dòng ngoài sàn mẫu; ca phá (khoá dev, email miền mẫu, sàn thật
trùng tên, hai sàn mẫu khớp, lead hỏng sau khi hàng đã ghi); tra danh mục qua `createApi` bằng phiên thành viên sàn mẫu. Bộ kiểm `nap-mau-yml.test.mjs` đọc tệp workflow. Bộ kiểm cách ly chạy sau khi nạp.

## Vận hành (sau khi gộp)

1. Chủ kho làm Hỏi-1 (thêm secret, giới hạn environment).
2. GitHub → Actions → «Nạp dữ liệu mẫu» → Run workflow trên `main`, `viec: nap`, `email: <email của mình>`.
3. Đăng nhập bản thật, chọn «[Mẫu] Sàn thử».
4. Gỡ: cùng nút, `viec: go`, `xac_nhan: [Mẫu] Sàn thử`.
