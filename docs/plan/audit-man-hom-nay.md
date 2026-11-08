# Audit màn Hôm nay — đối chiếu với kế hoạch sửa

Ngày: 2026-11-09 · Trạng thái: **rà soát, chỉ đọc** · Người hỏi: chủ kho, qua phiên giám sát đợt dau-khach-nhap ·
Soát trên mã `main` `001ae667`, bản thật `https://quyhang.onehub.center` và một bản máy.

**Cách soát.**

- Bản thật: chỉ đọc nhật ký Vercel, tên biến môi trường (không đọc giá trị), lịch sử CI. Không đăng nhập, không chạm dữ
  liệu. Ảnh của chủ kho (sàn «[Mẫu] Sàn thử», đồng bộ 05:37 ngày 09/11) gọi là **ảnh 05:37**.
- Bản máy: Postgres riêng cổng 5599, nạp sàn mẫu (40 hàng, 12 lead), lùi hạn 4 lead cho thành quá hạn; đi đủ sáu tài
  khoản (Đầu chủ, Trưởng nhóm, Telesales, Đầu khách, Quản trị, người đủ năm vai) ở khổ 1912, 1440, 375, nền tối.
- Audit cũ: `_acceptance/*hom-nay*`, `_acceptance/va-he-bo-cuc`, `_acceptance/thong-bao-lead`,
  `docs/plan/audit-san-moi-day-0.md`, `docs/plan/ra-soat-ban-mau.md`, quyết định 14A ở `docs/design/vo-va-ia.md`.

**Đối chiếu kế hoạch.** Lộ trình `docs/plan/lo-trinh.json`, hàng việc đợt (chỉ đọc), `git log`, PR đã gộp và ba PR đang
mở (#192, #211, #214 — không PR nào chạm màn này).

**Chưa soát được.** Tìm trong lịch sử phiên không thấy lần audit Hôm nay nào ngoài các hồ sơ kể trên, nên «audit cũ» ở
đây là những gì kho ghi lại. Bản thật không đo được giao diện vì không đăng nhập; mọi số đo bố cục lấy ở bản máy. Nhật
ký của chính pooler Supabase không đọc được, nên phần «ai giữ kết nối» ở mục Truy nguyên gốc suy từ nhật ký Vercel.

## Kết luận

1. **Băng lỗi ở ảnh 05:37 không phải lỗi của vai.** Cơ sở dữ liệu bản thật hết kết nối đúng giây màn mở, và chính một
   người dùng mở app đã đủ làm cạn trần. Bản vá gốc đã ký từ 06/11, chỉ chờ chủ kho bật công tắc; bản thật vẫn chạy chế
   độ cũ.
2. **Màn phản ứng với lỗi đó kém.** Một lỗi nói ba chỗ, không tự thử lại, kéo theo «0 đầu chủ» và mã thô. Phần này chưa
   có kế hoạch.
3. **Bốn vùng xếp chồng là điều đã chốt khi đa vai còn hiếm.** Từ 08/11 chủ sàn mới mang đủ năm vai nên đây thành màn mặc
   định của người mở sàn, và chưa có kế hoạch cho nó.
4. **Cột thứ hai chỉ phục vụ đầu chủ**: không số đếm, không theo vai, không theo bộ nhóm của sàn. Lời hứa số đếm rơi
   giữa hai hàng.
5. Tổng 41 vấn đề: **8 đã sửa · 2 đã có kế hoạch · 31 chưa có kế hoạch.**

## Truy nguyên gốc

### Vì sao hết 15 kết nối (A1, A2)

Chuỗi nguyên nhân, từ gần tới xa:

1. **Bản thật còn ở chế độ phiên.** Mỗi kết nối bị giữ suốt đời của nó, cả dự án chung trần 15. Nhật ký mỗi lần dựng bể
   đều ghi `cổng 5432`.
2. **Phép tính ngân sách kết nối sai giả định.** Mã tính mỗi hàm một phiên bản: (4 + 2) × 2 bản triển khai + 2 khách khác
   = 14, vừa dưới trần (`lib/api.ts:19-30`). Thực đo: chỉ bản chính thức đã dựng 5 phiên bản hàm trang và 3 phiên bản bước
   chặn đầu trong 45 giây (22:33:17–22:34:02Z), tức tới 26 kết nối. Bản xem trước không góp: không dòng nhật ký nào.
3. **Một người mở app tạo đồng thời cao.** Cả năm phút cao tải 22:26–22:44Z đều chỉ một chuỗi nhận diện trình duyệt,
   nên nhiều khả năng là một người. Hai nguồn:
   - Hôm nay bắn 8 lời gọi cùng lúc (A2); lúc 22:37:25 chúng rơi vào ít nhất hai phiên bản hàm, một phiên bản vừa khởi
     động và báo lỗi ngay ở lần đọc lược đồ danh tính.
   - Mọi `Link` ở cột nhà và cột thứ hai tải trước theo mặc định, và **mỗi lần tải trước đi qua bước chặn đầu, đọc phiên
     từ cơ sở dữ liệu** (`proxy.ts:33`, `lib/session-refresh.ts:21`, kho không có `prefetch=` nào). 22:33:15–45: `/today`
     ×11, `/team`, `/shares`, `/contacts`, `/settings`, `/leads/new` ×4 mỗi đường. 22:44:26–27: 6 phiên bản bước chặn đầu
     dựng trong 2 giây, mỗi phiên bản một đường.
4. **Đồng bộ nền giữ phiên bản ấm**: `/api/v1/listings` mỗi 30 giây, nên kết nối rảnh 5 giây của lần đọc trước còn đang
   giữ khi màn mở (22:37:20 và 22:37:25).

Đã loại: CI (job đưa lên bản thật bị bỏ qua lúc đó, các job khác dùng Postgres riêng) và bản xem trước (không dòng nhật
ký nào). Máy dev trên máy này không có kết nối ra cổng 5432 hay 6543 lúc soát, nhưng lúc soát đã sau sự cố. **Chưa chứng
minh**: số kết nối đúng tại giây 22:37:25, và chưa thử tắt tải trước để đo chênh lệch. Lỗi 5xx từ 02/11 tới 08/11 có 27
đợt; 06/11 nhiều đợt trùng lúc CI đẩy bản thật, 4 trong 6 đợt từ 07/11 không trùng CI. Chưa đọc lý do từng đợt cũ.

### Vì sao nhịp chia lead không chạy (A12)

Từ 01/11 chỉ có 4 lần gọi: 06/11 07:58Z và 09:02Z trả 503 (Vercel chưa có `JOB_SECRET`), 06/11 09:12Z và 07/11 01:15Z trả
401 (khoá hai bên lệch, theo ADR-0017), rồi không lần nào nữa. Lịch mỗi phút thì phải có khoảng 1 lần mỗi phút, nên lịch
`pg_cron` hiện **không gọi tới**. Bước vận hành dừng giữa chừng sau lần thử 401. Lịch trong cơ sở dữ liệu chưa đọc được.

### Sáu gốc chung của phần còn lại

| Gốc | Mục | Vì sao thành lỗi |
| --- | --- | --- |
| Mỗi vùng tự đọc, tự báo lỗi; «đọc hỏng» bị xử như «rỗng» | A3, A4, A8, A9, A10, A11 | Không có lớp đọc chung của màn. Kết quả lỗi thành danh sách rỗng hay `null`, rồi câu «không có việc» chạy trên đó |
| Cùng một thứ đọc từ hai nguồn | A5, A6, A7, C4, C7 | Nhãn đọc máy chủ, bảng đọc máy; cột đọc bộ mặc định, thân đọc bộ của sàn; ô Hàng cũ đọc ngưỡng mặc định; tên thay thế chỉ áp khi vắng, không áp khi chuỗi rỗng |
| Khối cả trang đặt làm một vùng | B2, B3, B4, C6 | `dashboard-6` là khối trang: có vùng chính, tiêu đề cấp một, đường dẫn, bề rộng tối đa. Luật «chuyển thể chỉ đổi dữ liệu, chữ, prop» giữ nguyên chúng khi khối chỉ còn là một vùng |
| Vùng theo vai thiết kế cho một, hai vai | B1, B5, B6, B8, C1 | `vungTheoVai` cộng dồn; mỗi vùng là một hàng riêng ở một đợt riêng, không hàng nào chịu trách nhiệm cả trang khi đủ vai |
| Nhãn dài trong nút rộng cố định | D1, D2 | Nhãn duyệt ở AC-3, bề rộng `w-36` chung; điện thoại dành chỗ nút trước, tên căn chịu ép |
| Việc hẹn không có chủ | C2, C3, A7, A8, A9, C7, D3–D6, B2, B3 | `va-he-bo-cuc` hẹn số đếm sang hàng 42, hợp đồng 42 không nhận. Known limit ký ở Cổng Bằng chứng không sinh hàng lộ trình nào, nên chưa mục nào được quay lại |

## Bảng đối chiếu

Mức tác động: **Cao** — sai hay mất việc của người dùng · **Vừa** — người dùng hiểu nhầm, tốn thêm thao tác · **Thấp** —
xấu, hiếm, hay không thấy trên màn. Căn cứ dưới dạng `tệp:dòng` tính từ `apps/web/src/` khi không ghi gốc khác; `today/`
là `app/(app)/today/`.

### A. Đọc dữ liệu và báo lỗi

| # | Vấn đề | Nguồn | Căn cứ | Tác động | Tình trạng |
| --- | --- | --- | --- | --- | --- |
| A1 | Băng «Không tải được lead quá hạn» và «Không tải được lead đã nhập»: API hàng đợi trưởng nhóm, đầu chủ của sàn và lead đã nhập cùng trả 500. Không theo vai: cùng người, cùng lần mở, «lead giao cho tôi» và «đầu khách» vẫn 200; lần 05:33 thì tập API hỏng khác hẳn | Lần này | Nhật ký Vercel 22:37:25Z: `team/lead-queue`, `team/listing-agents`, `leads` = 500, `leads/assigned`, `today/buyer` = 200. Lý do: `EMAXCONNSESSION … pool_size: 15`; mọi dòng lỗi 24 giờ qua là lý do này hay hệ quả của nó | Cao | **Đã có kế hoạch** — hàng `pooler-che-do-giao-dich` (T3, đã ký, PR #162, dãy V đang nghỉ). Còn đúng bước E7: chủ kho duyệt đổi bản thật. Biến `DATABASE_POOLER_PORT` chưa đặt, nhật ký 22:44Z vẫn ghi `cổng 5432` |
| A2 | Mở Hôm nay với người đủ vai bắn 8 lời gọi cùng lúc, mỗi lời gọi đọc phiên rồi đọc dữ liệu, tự nhân áp lực lên trần kết nối | Lần này | Bản máy: 8 lời gọi API riêng. Bản thật: các lời gọi của Hôm nay trong 5 mili giây. Nguồn đọc rải ở `today/truong-nhom.tsx:127`, `today/hom-nay-dau-chu.tsx:312`, `today/buyer/vung.tsx:10`. Cộng thêm tải trước đường dẫn qua bước chặn đầu, xem Truy nguyên gốc | Cao | **Chưa có kế hoạch** → R5 |
| A3 | Lỗi thoáng qua đứng yên trên màn tới khi người bấm tay; mỗi vùng một nút «Thử lại» riêng | Lần này | `today/nguon.ts:72-78` không thử lại; ảnh 05:37 có hai nút | Vừa | **Chưa có kế hoạch** → R1 |
| A4 | Một lỗi nói ba chỗ: băng đầu trang, hai ô số «—», thẻ «Lead quá hạn và ngoại lệ» | Lần này | Ảnh 05:37; `today/truong-nhom.tsx:196,205,266-284,304-306` | Vừa | **Chưa có kế hoạch** → R1 |
| A5 | Thẻ «0 đầu chủ» cạnh bảng có hai đầu chủ. Bảng đọc căn trên máy, nhãn đọc danh sách đầu chủ của máy chủ, hai nguồn khác nhau; không lỗi vẫn lệch | Lần này | Ảnh 05:37; `today/truong-nhom.tsx:293`. Bản máy không lỗi: «3 đầu chủ» cạnh 2 dòng, vì người thứ ba chưa giữ căn nào | Vừa | **Chưa có kế hoạch** → R1 |
| A6 | Tên đầu chủ hiện mã thô `7d95ed6a`, ô tròn «7D» khi danh sách đầu chủ đọc lỗi | Lần này | Ảnh 05:37; `today/truong-nhom-trang-thai.ts:100,109`, `today/truong-nhom.tsx:46` | Vừa | **Chưa có kế hoạch** → R1 |
| A7 | Đầu chủ chưa đặt tên hiện ô trống ở bảng theo người và dòng hàng đợi | Audit cũ: `hom-nay-truong-nhom` Ngoài-7 | Máy chủ trả chuỗi rỗng `packages/api/src/team/routes.ts:93`; màn chỉ thay khi vắng hẳn, `today/truong-nhom-trang-thai.ts:109` | Vừa | **Chưa có kế hoạch** (Known limit 04/11) → R1 |
| A8 | Mạng trở lại mà màn trưởng nhóm vẫn báo mất mạng, «Giao lại» vẫn tắt tới khi tải lại trang | Audit cũ: `hom-nay-truong-nhom` Ngoài-5 | `today/truong-nhom.tsx:174`: không đọc lại khi có mạng | Vừa | **Chưa có kế hoạch** (Known limit 04/11) → R1 |
| A9 | Mở màn lúc mất mạng thì thẻ báo «Không lead nào quá hạn» dù chưa đọc được gì; trưởng nhóm tưởng không có việc | Audit cũ: `hom-nay-truong-nhom` Ngoài-6 | `today/truong-nhom.tsx:304-305` | Cao | **Chưa có kế hoạch** (Known limit 04/11) → R1 |
| A10 | Lead giao cho tôi tải lỗi mà bấm «Lead mới» vẫn báo «không có việc», cạnh dòng báo lỗi | Audit cũ: `va-he-bo-cuc` Ngoài-1, 4 | `today/mo-nhom.ts:36`, `today/hom-nay-dau-chu.tsx:451` | Vừa | **Chưa có kế hoạch** (Known limit 02/11) → R1 |
| A11 | Ca hiếm máy chủ báo thành công nhưng nội dung hỏng: vùng Đầu khách hiện khung chờ mãi, không báo lỗi | Audit cũ: `hom-nay-dau-khach` Ngoài-3 | `today/buyer/vung.tsx:12` | Thấp | **Chưa có kế hoạch** (Known limit 05/11) → R1 |
| A12 | Nhịp chia lead không chạy trên bản thật: 72 giờ qua 4 lần gọi, 401 ×2 và 503 ×2, không lần nào thành công. Lead chưa vào nhịp không vào hàng đợi trưởng nhóm, nên «Lead quá hạn» và «Ngoại lệ» trên bản thật sẽ thiếu | Audit cũ: audit ngày 0 A1; đo lại lần này | Nhật ký Vercel `/api/v1/jobs/lead-tick`; `packages/api/src/team/store.ts:44-47` đòi đã vào nhịp | Cao | **Đã có kế hoạch** — mục «Ra khỏi kho» của audit ngày 0 (A1), việc vận hành của chủ kho theo ADR-0017. Biến `JOB_SECRET` đã có trên bản thật nhưng nhịp chưa chạy thành công |

### B. Bố cục cả trang

| # | Vấn đề | Nguồn | Căn cứ | Tác động | Tình trạng |
| --- | --- | --- | --- | --- | --- |
| B1 | Bốn vùng vai xếp chồng trên một trang. Đã chốt cho người hai vai (Cổng Phạm vi `hom-nay-truong-nhom`, Hỏi-2), nhưng từ 08/11 chủ sàn mới mang đủ năm vai nên đây là màn đầu tiên của người mở sàn. Cao hơn một màn hình cả ở khổ 1912 | Lần này | Ảnh 05:37; `today/truong-nhom-trang-thai.ts:18-26`; `today/page.tsx:51-63`; Tham chiếu §12 dòng 08/11 «Vai kéo theo vai» | Cao | **Chưa có kế hoạch** → R2 |
| B2 | Khối Trưởng nhóm thụt vào: khổ 1912 rộng 1280 px, các vùng khác 1607 px, lệch mép 164 px mỗi bên. Băng lỗi của chính vùng này lại đủ bề rộng | Audit cũ: `hom-nay-truong-nhom` Ngoài-4; đo lại lần này | `components/khoi/dashboard-6/coverage-dashboard.tsx:267` (`max-w-7xl mx-auto`) | Vừa | **Chưa có kế hoạch** (Known limit 04/11) → R2 |
| B3 | Khối Trưởng nhóm mở thêm vùng chính và tiêu đề cấp một thứ hai trong trang; đọc màn hình nghe trùng | Audit cũ: `hom-nay-truong-nhom` Ngoài-4; đo lại lần này | Bản máy: 2 `main`, 2 `h1`; `coverage-dashboard.tsx:267-268` | Thấp | **Chưa có kế hoạch** → R2 |
| B4 | «Hôm nay › Trưởng nhóm» đứng giữa trang, dưới dòng thông báo; mắt xích đầu trỏ lại chính trang đang mở và tải lại cả trang | Lần này | `today/truong-nhom.tsx:287`, `coverage-dashboard.tsx:61`; đầu màn của trang để trống `today/khung.tsx:14` | Vừa | **Chưa có kế hoạch** → R2 |
| B5 | Bốn vùng ba kiểu đầu: đường dẫn, chữ 16 px trong khung, chữ 20 px ngoài khung. Vùng đầu chủ tên «Hôm nay», trùng tên màn, không nói đây là việc của tôi | Lần này | Bản máy: 16 px/500 trong khung, 20 px/600 ngoài khung; `today/hom-nay-dau-chu.tsx:557`, `leads/mine/khung.tsx:15`, `today/buyer/khung.tsx:10` | Vừa | **Chưa có kế hoạch** → R2 |
| B6 | Dòng «Thông báo đang tắt trong trình duyệt» đứng trơ đầu mọi vùng, không lối bật lại, không tắt được. Đúng hợp đồng `thong-bao-lead`, nhưng người đã từ chối thấy mãi mỗi lần mở, trên cả điện thoại | Lần này | Ảnh 05:37; `today/dai-bat.tsx:30`; `_acceptance/thong-bao-lead/contract.md:34` | Vừa | **Chưa có kế hoạch** → R2 |
| B7 | Khung chờ tải bốn cột, màn thật ba ô số: khối nhảy khi đọc xong | Lần này | Bản máy, trưởng nhóm khổ 1912 | Thấp | **Chưa có kế hoạch** → R2 |
| B8 | Người chỉ giữ vai Quản trị gõ `/today` thấy «Màn này đang dựng … mục 22, 39 của lộ trình»: số nội bộ ra màn | Audit cũ: audit ngày 0 mục D; đo lại lần này | Bản máy; `today/page.tsx:64`, `components/shell/placeholder.tsx:14` | Thấp | **Chưa có kế hoạch** — có đề xuất `bat-dau-san` ở audit ngày 0 §8 nhưng chưa vào lộ trình; `chu-san-du-vai` (PR #213) không đổi trang này → R2 |

### C. Cột thứ hai và các con số

| # | Vấn đề | Nguồn | Căn cứ | Tác động | Tình trạng |
| --- | --- | --- | --- | --- | --- |
| C1 | Cột thứ hai liệt sáu hàng đợi của đầu chủ cho mọi vai có cột. Đầu khách thuần, trưởng nhóm thuần cũng thấy, bấm mục nào cũng ra dòng báo; ba vùng còn lại của trang không có mục | Lần này | Bản máy, 6 mục ở tài khoản Đầu khách; `components/shell/second-column.tsx:43-45`, `today/page.tsx:40` | Vừa | **Chưa có kế hoạch** → R3 |
| C2 | Mục ở cột thứ hai không có số đếm, nên «0 việc» ở cột giữa nhìn như mâu thuẫn với sáu mục bên trái. Số 0 trong ảnh là đúng: tài khoản ấy không giữ căn hay lead nào | Lần này | Ảnh 05:37; bản máy: tài khoản đủ vai 0 việc, Đầu chủ 1 có 23 việc, cột giữ nguyên | Vừa | **Chưa có kế hoạch** → R3. Hợp đồng `va-he-bo-cuc` hẹn sang hàng 42, hợp đồng hàng 42 không nhận |
| C3 | Vào `/today` không mục nào sáng; chỉ sáng khi đã bấm một mục | Lần này | Bản máy: `aria-current` rỗng ở cả sáu mục | Thấp | **Chưa có kế hoạch** → R3 |
| C4 | Cột theo bộ nhóm mặc định, không theo bộ nhóm của sàn: sàn đổi tên, ẩn hay thêm nhóm thì cột và thân màn nói hai thứ | Lần này | `components/shell/second-column.tsx:45` dùng bộ mặc định; thân màn dùng bộ của sàn `today/hom-nay-dau-chu.tsx:326`; `_acceptance/va-he-bo-cuc/contract.md:64` | Vừa | **Chưa có kế hoạch** → R3 |
| C5 | Mục rỗng báo hai câu chồng nhau: «Hôm nay không có việc ở "…"» rồi «Hôm nay không còn việc» | Lần này | Bản máy, `/today?nhom=missing_info` | Thấp | **Chưa có kế hoạch** → R3 |
| C6 | Nhãn «Giao lại», «Chưa có người», «Toàn sàn» ở ba ô số trông như nút nhưng không bấm được; ô số không dẫn tới dòng tương ứng | Lần này | Ảnh 05:37; `coverage-dashboard.tsx:102-105`, `today/truong-nhom.tsx:198,207,216` | Vừa | **Chưa có kế hoạch** → R2 |
| C7 | Ô «Hàng cũ» đếm theo ngưỡng mặc định; sàn đổi ngưỡng ở Cài đặt thì số lệch với hàng đợi của đầu chủ. Hàng 48 cho sàn đổi ngưỡng từ 05/11 nên ca này đã xảy ra được | Audit cũ: `hom-nay-truong-nhom` Ngoài-1 | `today/truong-nhom.tsx:178` không truyền cấu hình sàn | Vừa | **Chưa có kế hoạch** (Known limit 04/11) → R6 |

### D. Hàng đợi của đầu chủ

| # | Vấn đề | Nguồn | Căn cứ | Tác động | Tình trạng |
| --- | --- | --- | --- | --- | --- |
| D1 | Nút «Đổi giá, trạng thái · Mở hồ sơ» dài hơn khung nút, chữ bị cắt ở mọi dòng nhóm Thiếu thông tin | Lần này | Bản máy khổ 1440: chữ 156 px, khung 142 px, 15 dòng; `today/viec-dong.ts:29`, `components/khoi/solution-agents-2/o-dong.tsx:56` | Vừa | **Chưa có kế hoạch** → R4 |
| D2 | Khổ 375: cũng nút ấy ép tên căn còn «B-13.02 · …», lý do còn «Thiếu: nội t…». Đầu chủ không biết căn ở toà nào | Lần này | Bản máy, Đầu chủ 2 | Cao | **Chưa có kế hoạch** → R4 |
| D3 | Chọn Ghi cuộc gọi, Đổi giá hay Mở hồ sơ trong ⋯ tải lại cả trang thay vì chuyển mượt | Audit cũ: `lam-lai-hom-nay-dau-chu` Ngoài-3 | `components/khoi/solution-agents-2/o-dong.tsx:39` | Vừa | **Chưa có kế hoạch** (Known limit 05/11) → R4 |
| D4 | Sát hai mốc hạn: chữ ghi «còn 15 phút» mà ô vàng, «còn 0 phút» mà ô đỏ | Audit cũ: `lam-lai-hom-nay-dau-chu` Ngoài-6 | `today/hom-nay-dau-chu.tsx:147-151` | Thấp | **Chưa có kế hoạch** (Known limit 05/11) → R4 |
| D5 | Sau khi đổi giá hay trạng thái, căn có thể tạm biến khỏi Hôm nay tới lần đồng bộ kế tiếp; mất mạng thì vắng lâu hơn, màn không báo | Audit cũ: `hom-nay-dau-chu` Ngoài-1 | Hợp đồng `hom-nay-dau-chu` mục Known limits; chưa tái hiện lần này | Vừa | **Chưa có kế hoạch** (Known limit 02/11) → R4 |
| D6 | Nợ bài kiểm không thấy trên màn: nút chính, tên cột, trả lại lead, vắng tên chủ nhà ở hàng đợi, mở đúng nhóm mới phủ một mã | Audit cũ: Ngoài-2, 3, 8 `hom-nay-truong-nhom`; Ngoài-1, 2, 4, 5, 9–12 `lam-lai-hom-nay-dau-chu`; Ngoài-2, 3 `hom-nay-dau-chu-dien-thoai`; Ngoài-2, 3 `va-he-bo-cuc` | Các hợp đồng tương ứng, mục Known limits | Thấp | **Chưa có kế hoạch** → R7 |

### E. Đã sửa

| # | Vấn đề | Nguồn | Căn cứ | Tác động | Tình trạng |
| --- | --- | --- | --- | --- | --- |
| E1 | Hôm nay của đầu chủ rối nút, lý do khó đọc | Audit cũ: quyết định 14A, 02/11 | Bản máy: một nút mỗi dòng, «Vì sao hôm nay» hai tầng | Cao | **Đã sửa** — PR #123 |
| E2 | Bấm mục Hôm nay ở cột thứ hai không phản hồi | Audit cũ: `he-bo-cuc` Ngoài-6 | Bản máy: bấm mục đổi địa chỉ và sáng đúng mục | Vừa | **Đã sửa** — PR #86 |
| E3 | Chưa có Hôm nay của đầu chủ trên điện thoại | Lộ trình hàng 39 | Bản máy khổ 375 | Cao | **Đã sửa** — PR #134 |
| E4 | Người đã đăng nhập bị đá về màn đăng nhập khi nghẽn kết nối | Sự cố 06/11 | Ảnh 05:37: màn vẫn đứng, chỉ báo lỗi từng phần | Cao | **Đã sửa** — PR #155 |
| E5 | «Gửi căn» ở Hôm nay đầu khách rơi vào trang không có | Hàng `va-link-gui-can` | `git log` | Vừa | **Đã sửa** — PR #142 |
| E6 | Nút «Ghi cuộc gọi» hiện cho người không vào được màn ghi cuộc gọi | Hàng `va-nut-ghi-cuoc-goi-truong-nhom` | `git log` | Vừa | **Đã sửa** — PR #197 |
| E7 | Trang bản mẫu Hôm nay (hàng 22, 37, 42): nhà không sáng, không cột thứ hai | Audit cũ: `ra-soat-ban-mau.md` | `git log` | Thấp | **Đã sửa** — PR #212 |
| E8 | Căn thiếu ảnh không có việc «Bổ sung ảnh» ở Hôm nay | Audit ngày 0, Tham chiếu 06/11 | Bản máy: nhóm «Bổ sung ảnh» ở cột thứ hai | Vừa | **Đã sửa** — PR #187 |

## Đề xuất hàng việc cho nhóm chưa có kế hoạch

Chưa ghi vào `docs/plan/lo-trinh.json`. Hình dạng như mục §8 của audit ngày 0. Mọi hàng là vùng `apps/web`, không đổi cơ
sở dữ liệu, trừ R5 thêm lối đọc API.

```json
[
  {
    "slug": "hom-nay-chiu-loi-tung-phan",
    "ma_audit": "R1 — A3, A4, A5, A6, A7, A8, A9, A10, A11",
    "vai": "Trưởng nhóm, Đầu chủ, Đầu khách, Telesales",
    "hang": "T2",
    "cau_giao": "Khi một phần của Hôm nay đọc lỗi, người dùng thấy đúng một câu lỗi ở đúng chỗ của phần ấy, màn tự thử lại trước khi báo, các phần còn lại giữ nguyên và không phần nào nói sai về số việc; đầu chủ luôn hiện tên người",
    "bat_khi": "Lời gọi trả 500 một lần rồi 200 thì màn tự hồi, không cần bấm; lỗi kéo dài thì mỗi nguồn đúng một câu và một «Thử lại»; danh sách đầu chủ lỗi thì bảng không hiện «0 đầu chủ», không hiện mã thô; đầu chủ chưa đặt tên có chữ thay thế; số trên nhãn bằng số dòng của bảng; mạng trở lại thì tự đọc và mở lại «Giao lại»; mở lúc mất mạng hay lead tải lỗi thì không câu nào báo «không có việc»; nội dung hỏng ở vùng Đầu khách ra trạng thái lỗi",
    "vung": ["apps/web/src/app/(app)/today/**", "apps/web/src/app/(app)/leads/mine/**", "packages/api/src/team/**"]
  },
  {
    "slug": "hom-nay-nhieu-vai",
    "ma_audit": "R2 — B1, B2, B3, B4, B5, B6, B7, B8, C6",
    "vai": "Người mang từ hai vai trở lên, Quản trị sàn",
    "hang": "T2",
    "cau_giao": "Người mang nhiều vai mở Hôm nay thấy một việc chính rõ ràng thay vì bốn vùng xếp chồng; các vùng cùng bề rộng, cùng kiểu đầu vùng; người chỉ quản trị không gặp số nội bộ",
    "bat_khi": "Đo ở khổ 1440 và 1912: mọi vùng cùng mép trái và phải; trang có một vùng chính và một tiêu đề cấp một; không còn đường dẫn giữa trang; người đủ năm vai thấy phần của một vai trong một màn hình và chuyển phần khác một chạm, lần sau nhớ lựa chọn; dòng thông báo đã tắt rời đầu trang nhưng vẫn tìm được; ô số chạm được hay không trông như nút; người một vai không đổi gì",
    "vung": ["apps/web/src/app/(app)/today/**", "apps/web/src/components/khoi/dashboard-6/**", "apps/web/src/components/shell/placeholder.tsx", "design/patterns/hom-nay-*.md", "docs/design/vo-va-ia.md"],
    "ghi_chu": "Đi Cổng Phạm vi có bản bấm được và trang ba lối (ADR-0019), đối chiếu ngành theo ADR-0022. Đổi điều đã chốt ở Hỏi-2 của hom-nay-truong-nhom nên chủ kho duyệt"
  },
  {
    "slug": "cot-hai-hom-nay-theo-vai",
    "ma_audit": "R3 — C1, C2, C3, C4, C5",
    "vai": "Mọi vai có cột thứ hai",
    "hang": "T2",
    "cau_giao": "Cột thứ hai của Hôm nay liệt đúng phần của vai người xem, theo bộ nhóm của sàn, mỗi mục có số việc, và luôn có một mục sáng",
    "bat_khi": "Đầu khách thuần không thấy hàng đợi đầu chủ; sàn đổi tên, ẩn, thêm nhóm thì cột đổi theo; số ở mục bằng số dòng nhóm trên màn, lỗi tải thì không hiện số; vào /today có đúng một mục sáng; mục rỗng chỉ một câu",
    "vung": ["apps/web/src/components/shell/second-column.tsx", "apps/web/src/app/(app)/today/mo-nhom.ts", "apps/web/src/app/(app)/today/hom-nay-dau-chu.tsx"],
    "ghi_chu": "Làm sau hom-nay-nhieu-vai: mục của cột phụ thuộc cách chia vùng"
  },
  {
    "slug": "nut-hom-nay-dau-chu-gon",
    "ma_audit": "R4 — D1, D2, D3, D4, D5",
    "vai": "Đầu chủ",
    "hang": "T2",
    "cau_giao": "Mọi nút chính ở Hôm nay của đầu chủ hiện đủ chữ và không chiếm chỗ của tên căn; mở việc trong ⋯ không tải lại trang",
    "bat_khi": "Khổ 375 và 1440: không nút nào cắt chữ; tên căn và toà đọc đủ trên mọi dòng; Ghi cuộc gọi, Đổi giá, Mở hồ sơ chuyển trang không nạp lại bàn làm việc; chữ hạn và màu hạn đổi cùng một mốc; căn vừa đổi không biến khỏi màn, hoặc màn báo đang đồng bộ",
    "vung": ["apps/web/src/app/(app)/today/**", "apps/web/src/components/khoi/solution-agents-2/**"],
    "ghi_chu": "Đổi nhãn đã duyệt ở AC-3 của lam-lai-hom-nay-dau-chu nên chủ kho xem nhãn mới"
  },
  {
    "slug": "doc-hom-nay-mot-nhip",
    "ma_audit": "R5 — A2",
    "vai": "Mọi vai",
    "hang": "T2",
    "cau_giao": "Mở app tốn ít kết nối cơ sở dữ liệu: các phần đọc của Hôm nay gộp một lượt hoặc xếp lần lượt, và tải trước các đường ở cột nhà không đọc phiên từ cơ sở dữ liệu",
    "bat_khi": "Người đủ năm vai mở Hôm nay: tối đa 3 lời gọi đồng thời, đo bằng bài kiểm; lần tải trước đường dẫn không làm bước chặn đầu đọc phiên, cookie phiên vẫn trượt theo ngày khi người thật mở trang; bài kiểm cách ly xanh; người một vai không chậm hơn",
    "vung": ["apps/web/src/app/(app)/today/**", "apps/web/src/proxy.ts", "apps/web/src/lib/session-refresh.ts", "apps/web/src/components/shell/**", "packages/api/src/team/**", "packages/api/src/today/**"],
    "ghi_chu": "Đo lại sau khi bản thật sang chế độ giao dịch; nếu hết lỗi thì hạ ưu tiên. Chế độ giao dịch nới trần nhưng không giảm số lần đọc phiên, nên phần tải trước vẫn đáng làm khi sàn đông người"
  },
  {
    "slug": "hang-cu-theo-nguong-san",
    "ma_audit": "R6 — C7",
    "vai": "Trưởng nhóm",
    "hang": "T2",
    "cau_giao": "Ô «Hàng cũ» và cột «Cần gọi lại» của trưởng nhóm đếm theo ngưỡng của sàn",
    "bat_khi": "Sàn đổi ngưỡng gọi lại thì ô số đổi theo và bằng số căn ở nhóm «Cần gọi lại» của các đầu chủ; đọc ngưỡng lỗi thì báo, không lặng lẽ dùng mặc định",
    "vung": ["apps/web/src/app/(app)/today/truong-nhom.tsx", "apps/web/src/app/(app)/today/truong-nhom-trang-thai.ts"]
  },
  {
    "slug": "tra-no-bai-kiem-hom-nay",
    "ma_audit": "R7 — D6",
    "vai": "Không ai thấy trên màn",
    "hang": "T2",
    "cau_giao": "Các bài kiểm của Hôm nay đỏ được khi hành vi hỏng: nút chính theo từng loại việc, tên bốn cột, trả lại lead ghi thật ở máy chủ, vắng tên chủ nhà có đối chứng, cả năm nhóm mở đúng",
    "bat_khi": "Mỗi Ngoài-N của D6 có một bài đỏ trên bản cố ý làm hỏng và xanh trên main",
    "vung": ["apps/web/src/app/(app)/today/**/*.test.ts", "packages/api/test-db/hom-nay-truong-nhom.test.ts", "_acceptance/lam-lai-hom-nay-dau-chu/thu/**"]
  }
]
```

## Khuyến nghị làm gì trước

**Làm `hom-nay-chiu-loi-tung-phan` (R1) trước trong nhóm chưa có kế hoạch**, vì lỗi đọc đang xảy ra trên bản thật và đây
là nhóm duy nhất có màn nói sai với người dùng (A9, A10). R1 không phụ thuộc cách chia vùng ở R2.

Trước cả R1 là một việc đã có kế hoạch và không tốn mã: **chủ kho duyệt đổi bản thật sang chế độ giao dịch** (bước E7 của
`pooler-che-do-giao-dich`). Việc này gỡ gốc của ảnh 05:37. Thứ tự sau đó: R2 rồi R3, R4 song song được, R5 sau khi đo lại,
R6 và R7 khi rảnh.

Chữ «Lead» trên màn sẽ đổi theo hàng `doi-chu-lead-co-hoi` (dãy L, chưa mở hồ sơ). R2 và R3 nên lấy nhãn từ `CONTEXT.md`
lúc làm, không viết cứng.

## Việc ngoài màn phát hiện trong lúc soát

**Lần gộp PR #213 không lên bản thật.** Job quét bí mật trên `main` báo 3 chỗ lộ, job đưa lên bản thật bị bỏ qua (CI
`42529678617`). Bản thật vẫn là bản dựng 17:59Z ngày 08/11, nên «Vai kéo theo vai» chưa chạy ở đó. PR #211 đang đỏ
cùng job ấy. Chưa kiểm ba chỗ lộ là gì, cần xem riêng trước khi gộp tiếp.
