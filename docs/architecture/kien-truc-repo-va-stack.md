# Kiến trúc repo và stack

> **Nguồn chính từ 29/10/2026**, chuyển từ tài liệu thiết kế trên claude.ai. Quyết định đã chốt có ADR: ADR-0017 của onehub-invest và [ADR-0001](../adr/0001-khoi-diem.md) của kho này. Phần «Đề xuất» đổi thành «Đã chốt» bằng ADR mới, không sửa lặng ở đây.

Bản 29/10 · **Đã chốt 29/10 (ADR-0017): chỗ đứng, kho riêng, nguyên tắc SaaS, API, nguồn cấp từ Invest. Stack chốt tiếp ở kho Quỹ hàng sau ba bài thử.** Dựng trên các điều đã chốt ở [Tham chiếu](../product/tham-chieu.md) và trên hai kho đang chạy: OneHub Invest (Next.js, Postgres trên Supabase, dữ liệu tính sẵn ở máy local) và CRM nội bộ của OneHub (Next.js, đăng nhập better-auth, chỉ một tổ chức). Chữ kỹ thuật là tên công cụ; mỗi lựa chọn kèm lý do theo nghiệp vụ.

## 0. Nguyên tắc nền: Quỹ hàng là một sản phẩm SaaS

Đã chốt 29/10 (ADR-0017), từ câu hỏi của Mạnh: tách vận hành khỏi kiến trúc. Quỹ hàng là SaaS cho ngành bất động sản, linh hoạt theo công ty và linh hoạt kết nối; quy định kết nối chỉ là đóng mở thoả thuận.

**Đồng ý, với một điều kiện**: muốn quy định kết nối chỉ là đóng mở thoả thuận, kiến trúc phải biết thoả thuận là gì. Kiến trúc dựng cơ chế; vận hành chọn chính sách. Nếu mỗi kết nối được viết riêng như một đường dây cứng, thì đổi quy định lại thành đổi code.

| Tầng | Gồm | Ai đổi | Đổi bằng |
| --- | --- | --- | --- |
| Bất biến | Cách ly giữa công ty; thông tin chủ nhà không rời công ty; người luôn bấm gửi, không tự động hoá Zalo cá nhân; phần nội bộ không ra trang khách | Không ai — đổi là đổi sản phẩm | Không đổi; có bộ kiểm bắt buộc |
| Kiến trúc (cơ chế) | Lõi nghiệp vụ ngành, ba lớp dữ liệu, API, hộp thư sự kiện, loại kết nối, thoả thuận, lớp dữ liệu | Đội sản phẩm | Code + ADR |
| Cấu hình công ty | Cách gọi riêng, trạng thái riêng, trường riêng, luật chia lead, thuế phí, vai, mẫu | Quản trị công ty | Cài đặt sàn |
| Thoả thuận kết nối (chính sách) | Bật kết nối nào, chiều nào, lớp dữ liệu nào, hiệu lực từ bao giờ đến bao giờ | Người có thẩm quyền của hai bên | Bật / tắt thoả thuận, có nhật ký |
| Vận hành | Mở công ty mới, gói dịch vụ, hợp đồng, hỗ trợ, thanh toán | Đội vận hành OneHub | Công cụ vận hành, không chạm dữ liệu của công ty |

**Thoả thuận là một đối tượng của hệ thống**, gồm: hai bên · loại kết nối · chiều · các lớp dữ liệu được đi · hiệu lực · ai duyệt · nhật ký. Tắt thoả thuận thì dữ liệu dừng chảy ngay; phần đã chảy đi theo điều khoản của thoả thuận đó.

**Lớp dữ liệu có trần.** Mỗi trường thuộc đúng một lớp; thoả thuận chỉ mở được tới trần của lớp đó. Bất biến chính là trần.

| Lớp | Ví dụ | Trần |
| --- | --- | --- |
| Danh mục | Toà, trục, căn, thuộc tính căn | Ra ngoài được |
| Hàng chia sẻ được | Giá kèm điều kiện phí, trạng thái, ảnh gửi được | Ra ngoài theo thoả thuận, qua luật ẩn |
| Nội bộ công ty | Ghi chú nội bộ, đầu chủ, lịch sử trả giá, trường riêng | Trong công ty; trường riêng ra ngoài khi công ty bật từng trường |
| Nguồn | Chủ nhà, số điện thoại, giá đáy, ảnh sổ | Không bao giờ rời công ty — bất biến |
| Giao dịch | Giá chốt, ngày bán | Chỉ ra ngoài theo thoả thuận có điều khoản riêng; mặc định tắt |
| Hành vi | Lượt mở, quan tâm, chia sẻ | Người gửi và công ty; ra ngoài chỉ dạng tổng hợp theo thoả thuận |

**Loại kết nối** — cơ chế dựng một lần, mỗi thoả thuận là một lần bật:

- Nguồn danh mục và thị trường đi vào — Invest là bên cung cấp đầu tiên.
- Kênh đăng đi ra — Platform là kênh đầu tiên.
- Nguồn lead đi vào — form quảng cáo, khách từ Platform.
- Xuất và nối bảng tính — Excel, Google Sheet.
- Hợp tác giữa công ty — gửi bộ căn sang công ty khác cùng dùng Quỹ hàng.
- API khoá theo công ty — cho công cụ riêng của công ty.

**Hệ quả**:

- **Kết nối ở mục 3 và 4 là thoả thuận đang bật, không phải dây cứng.** Invest → Quỹ hàng đang bật; lớp Giao dịch về Invest đang tắt. Mở về sau là một quyết định kinh doanh có điều khoản với sàn, không sửa kiến trúc.
- **Luật riêng của mỗi bên chặn ở cửa của bên đó.** Luật S08, AirDNA, tên nguồn thật của Invest nằm ở bộ soát khi Invest đẩy ra. Quỹ hàng không cần biết các luật đó, vì không bao giờ nhận những thứ đó.
- **Platform không được viết cứng vào Quỹ hàng**: nó là một kênh đăng và một nguồn lead. Chỗ đứng «phía cung của Platform» (chốt 29/10) là chiến lược kinh doanh, không phải ràng buộc kiến trúc.
- **Đội của mình là một công ty như mọi công ty**: không cửa riêng, không quyền ngầm. Đội vận hành OneHub vào dữ liệu của một công ty chỉ khi công ty đó cấp quyền hỗ trợ có hạn, có nhật ký.
- **Linh hoạt có biên**: SaaS dọc theo ngành, không ngang như Salesforce — không đối tượng mới, không công thức (đã chốt 28/10). Linh hoạt nằm ở cấu hình và kết nối, không ở lõi.
- **Đo trước khi build**: cơ chế thoả thuận và lớp dữ liệu làm từ bản đầu — rẻ khi làm sớm, đắt khi vá sau, giống tách công ty. Nhưng bản đầu chỉ cài hai loại kết nối: nguồn danh mục đi vào và xuất file.

## 1. Từ quyết định sản phẩm ra đòi hỏi kỹ thuật

| Đã chốt hoặc ghi nhận | Đòi hỏi kỹ thuật |
| --- | --- |
| App riêng, đọc Invest một chiều (29/10) | Kho mã riêng, cơ sở dữ liệu riêng; một đường cấp dữ liệu có hợp đồng, chỉ chạy từ Invest sang |
| Tài khoản và quỹ hàng trên máy chủ, có hợp đồng (28/10) | Luật «hồ sơ người dùng không rời máy local» của Invest không áp được, nên Quỹ hàng cần luật dữ liệu của riêng nó |
| Nhiều sàn, cách ly ở kho dữ liệu (28/10) | Mỗi dòng mang mã sàn; luật theo dòng của Postgres; bộ kiểm cách ly chạy trước mỗi lần phát hành |
| Số chủ nhà chỉ đầu chủ giữ căn và trưởng nhóm thấy | Thông tin chủ nhà nằm ở bảng riêng có luật chặt hơn, không là cột của hàng; mở số đi qua một cửa duy nhất có ghi sự kiện |
| Sự kiện chỉ thêm; độ tươi, mức đủ tính từ sự kiện | Bảng sự kiện chỉ ghi thêm; số trên màn là bản tính ra từ sự kiện |
| Ba lớp dữ liệu, trường riêng tối thiểu (28/10, 29/10) | Lõi là cột kiểu chặt; trường riêng là một cột linh hoạt kèm bảng định nghĩa theo sàn |
| Nhanh tức thì, ghi trên máy trước (28/10) | Kho dữ liệu ngay trên máy, hàng đợi ghi, đồng bộ thời gian thực |
| Bảng kiểu Sheet vài nghìn dòng | Lưới cuộn ảo, sửa trên ô, dán khối từ Excel |
| Đầu chủ máy tính, đầu khách điện thoại (29/10) | Một web app làm sâu cho máy tính; điện thoại là web cài lên màn hình chính trước, app gốc sau |
| Trang khách mở từ Zalo, link sống | Trang dựng ở máy chủ, có ảnh xem trước cho Zalo, đọc giá sống; lượt Zalo tự lấy ảnh xem trước không được tính là khách mở |
| Hạn nhận lead 15 phút | Thông báo đẩy và việc chạy theo giờ |
| Ảnh ba ngăn; ngăn nội bộ không lưu trên máy | Kho ảnh hai vùng: vùng gửi được (bản thu nhỏ) và vùng nội bộ (link ngắn hạn, không lưu đệm) |
| Không gửi Zalo hộ | Không tích hợp gửi tin Zalo cá nhân; chỉ mở bảng chia sẻ của điện thoại |

## 2. Chiến lược repo

| Phương án | Được | Mất |
| --- | --- | --- |
| A. Thư mục mới trong kho onehub-invest | Dùng lại hạ tầng, cổng nghiệm thu | Kho đang công khai và có bản sao công khai. Luật tầng A, làn hai agent, máy chạy đêm đọc thẳng từ kho — đều sai cho một sản phẩm nhiều sàn giữ số chủ nhà. Trái chốt 29/10 |
| B. App mới trong kho CRM nội bộ | Cùng cách đăng nhập, cùng đội Vercel | CRM khoá cứng một tổ chức và dành cho nhân viên OneHub. Quỹ hàng là nhiều sàn bên ngoài, nên phải đổi mô hình lõi của CRM |
| **C. Kho riêng, riêng tư** — khuyến nghị | Cách ly dữ liệu và nhịp phát hành; luật dữ liệu riêng; chép lại chuẩn đã chạy tốt (ReUI, cổng nghiệm thu, bảo vệ nhánh) | Thêm một kho phải giữ; hợp đồng với Invest phải viết rõ |

**Khuyến nghị C**: kho `phanlemanh/onehub-quy-hang`, riêng tư, không có bản công khai.

```
onehub-quy-hang/
├── apps/web          bàn làm việc (máy tính + điện thoại) và trang khách /s/<mã>
├── packages/core     luật nghiệp vụ: trạng thái, kết quả gọi, tính giá, luật ẩn, mức đủ, kiểm trùng, quyền, lớp dữ liệu
├── packages/api      API có phiên bản (/api/v1): lệnh ghi, đọc cho bên ngoài, hộp thư sự kiện đi
├── packages/connect  loại kết nối và thoả thuận; kết nối đầu tiên: nguồn danh mục từ Invest (khuôn + số phiên bản)
├── packages/db       migration, luật cách ly theo dòng, dữ liệu mẫu, bộ kiểm cách ly
├── docs/  adr/  _acceptance/
└── (sau) apps/shell  vỏ app gốc cho điện thoại · apps/keyboard-android  bộ gõ
```

- **Vì sao chia vậy**: luật nghiệp vụ dùng chung cho máy tính, điện thoại, trang khách, việc nền và vỏ app sau này — viết một lần, kiểm một lần. Luật «mọi cửa ra dùng chung một bộ luật ẩn» thành một hàm duy nhất quyết định trường nào được ra ngoài.
- **Một app cho tới khi có app thứ hai thật** (như ADR-0001 của Invest): các thư mục `packages/` chỉ là mã dùng chung, không phải dịch vụ riêng.
- **Thay đổi trong onehub-invest, nhỏ**: một ADR ghi Quỹ hàng là ứng dụng riêng và đường cấp dữ liệu một chiều; một việc đẩy nguồn cấp ở pipeline. Không thêm route nào vào app Invest; luật hai cổng giữ nguyên.
- **Làn**: kho Quỹ hàng thuộc làn Claude. ZCode giữ làn thu thập, không có việc ở kho này.

## 3. Đường nối với Invest: nguồn cấp một chiều

| Sang Quỹ hàng | Không bao giờ sang |
| --- | --- |
| Danh mục dự án → toà → trục → căn và thuộc tính căn, từ danh bạ vật thể của Invest; mặt bằng theo trục | Vật thể và giá trị chỉ có từ S08 |
| Số thị trường tổng hợp theo toà và loại căn (dải giá đang rao, trung vị), kèm mốc đo | Số AirDNA |
| Tin rao công khai đã khớp căn: giá, điều kiện phí nếu có, ngày, người đăng | Đường dẫn bài gốc và tên trang nguồn, vì chúng lộ tên nguồn thật |
| — | Ảnh tin rao (chỉ để đối chiếu trong Invest), hồ sơ người dùng Invest |

- **Invest đẩy sang, Quỹ hàng không chọc vào kho Invest.** Cùng mẫu với việc đẩy số Ops lên cloud (ADR-0014): máy local tính sẵn, đẩy lên kèm mốc đo, qua bộ soát chặn mọi giá trị tầng A và S08.
- **Khuôn có số phiên bản**, như hợp đồng dữ liệu giữa collector và pipeline: thêm trường thì tăng phiên bản; Quỹ hàng từ chối gói sai khuôn.
- **Quỹ hàng nạp vào vùng danh mục dùng chung**, chỉ đọc với mọi sàn. Sai thuộc tính căn thì sàn bấm «Báo sai thông tin căn»; báo sai về tới đội vận hành, không tự sửa danh mục.
- **Không có đường ngược ở bản đầu**: hàng, chủ nhà, giá chốt của sàn không sang Invest. Giá chốt là nguồn giá giao dịch thật; muốn dùng ở Invest cần một quyết định riêng và điều khoản với sàn. Khung toà mà sàn nhập Excel tạo ra ở lại danh mục của Quỹ hàng.
- **Danh mục ban đầu**: S08 không dùng được, nên danh mục của dự án thử lấy từ bảng hàng Excel của chính sàn thử, cộng phần danh bạ vật thể của Invest không đến từ S08. Đây là câu hỏi mở «danh mục dùng ra ngoài lấy từ đâu».

## 4. API: một cửa cho mọi bề mặt và mọi hệ thống

Trả lời câu hỏi 29/10 «có nên xây theo kiến trúc API headless để tích hợp hai chiều». **Có, ở lõi** — kèm ba giới hạn. Đã chốt 29/10 (ADR-0017).

**Một API cho mọi bề mặt.** Máy tính, điện thoại, trang khách, vỏ app gốc, bộ gõ Android và Platform đều đi qua cùng một API; không bề mặt nào đọc thẳng cơ sở dữ liệu. Cái lợi lớn nhất không nằm ở tích hợp mà ở luật: kiểm quyền, lớp trường, luật ẩn, kiểm trùng nằm ở API, nên thêm một bề mặt mới không thể quên luật.

- **Ghi**: mọi thay đổi là một lệnh qua API (đổi giá, kết quả gọi, nhập lead…); máy chủ kiểm rồi ghi sự kiện. Đây là đường ghi duy nhất.
- **Đọc của app mình**: qua bộ đồng bộ xuống kho trên máy, để bảng hàng nhanh tức thì; bộ đồng bộ cũng chỉ trả phần luật cho phép. Không gọi API mỗi lần cuộn hay lọc.
- **Đọc của bên ngoài** (Platform, đối tác sau này): qua API có phiên bản.
- **Kiểu API**: REST có mô tả OpenAPI (Hono + zod, như data-api của Invest). Không dùng tRPC như CRM: tRPC chỉ nói chuyện được với mã TypeScript, còn bộ gõ Android và hệ thống Platform thì không chắc viết bằng TypeScript.
- **Chưa tách dịch vụ**: mã API ở `packages/api`, gắn vào app web dưới `/api/v1`. Tách ra chạy riêng khi có bên thứ hai cần nhịp phát hành hay tải riêng.

**Giới hạn 1 — hai chiều theo chủ dữ liệu, không phải mặc định.** Mỗi loại dữ liệu có đúng một nơi là chủ; dữ liệu chảy ra từ chủ, không ai sửa bản của người khác.

| Dữ liệu | Chủ | Chiều chảy |
| --- | --- | --- |
| Danh mục căn, số thị trường, tin rao công khai | Invest | Invest → Quỹ hàng, một chiều (đã chốt 29/10) |
| Hàng, chủ nhà, sự kiện, giá chốt | Quỹ hàng, thay mặt sàn | Không ra ngoài, trừ phần sàn chọn đăng |
| Tin đăng công khai của sàn | Quỹ hàng giữ bản gốc | Quỹ hàng → Platform: đăng, đổi giá, gỡ |
| Khách tìm, câu hỏi, lượt liên hệ trên Platform | Platform | Platform → Quỹ hàng, về đúng người được ghi công |
| Báo sai thông tin căn | Sàn báo, Invest sửa | Quỹ hàng → hàng đợi duyệt của Invest (Sau, cần quyết định riêng) |

Hai chiều với Platform là đúng thiết kế: hàng đi ra, khách đi vào. Với Invest, chiều ngược (giá chốt, báo sai) là một thoả thuận đang tắt (mục 0). Bật nó là một quyết định kinh doanh có điều khoản với sàn, và phía Invest phải nhận qua cửa kiểm của chính nó — không phải đổi kiến trúc Quỹ hàng.

**Giới hạn 2 — giữa các hệ thống dùng hợp đồng và sự kiện, không gọi qua lại tức thì.**

- Quỹ hàng ghi sự kiện ra một hộp thư đi cùng lúc ghi dữ liệu: «đăng lên Platform», «đổi giá», «đã cọc», «gỡ tin». Platform nhận qua webhook có ký, lỗi thì gửi lại. Một hệ thống chết không kéo hệ thống kia chết theo, và không sự kiện nào bị mất.
- Invest không mở API cho Quỹ hàng gọi: phần tính của Invest chạy ở máy local, không có cửa vào từ cloud (cùng luật ADR-0014, ADR-0015). Đường đẩy nguồn cấp ở mục 3 giữ nguyên.
- Mỗi hợp đồng có số phiên bản; đổi khuôn thì tăng phiên bản và giữ bản cũ một thời gian.

**Giới hạn 3 — không làm API cho bên ngoài trước khi có người dùng nó.** Bản đầu chỉ cần API cho app của mình; phần cho Platform viết khi Platform có thật (đo trước khi build). Nhưng từ ngày đầu API đã có phiên bản, có mô tả, khoá theo sàn, và mọi lời gọi ghi người và vai — để khi mở ra không phải đập lại.

## 5. Stack

| Lớp | Chọn | Vì sao | Độ chắc |
| --- | --- | --- | --- |
| Ngôn ngữ | TypeScript chế độ chặt, khắp nơi | Luật chung của các kho; một ngôn ngữ cho web, việc nền và vỏ app | Đã dùng |
| Web app | Next.js 16 + React 19 | Cùng Invest và CRM; trang khách cần dựng ở máy chủ để Zalo hiện ảnh xem trước | Đã dùng |
| Giao diện | Tailwind 4 + shadcn/ui + ReUI | Chuẩn giao diện và luật ReUI đã có | Đã dùng |
| Lưới bảng hàng | Lưới dữ liệu ReUI (TanStack Table + Virtual) | Đã có trong Invest; sửa trên ô và phím như Sheet phải làm thêm | **Thử trước**: 5.000 dòng × 20 cột, dán 500 ô. Không đạt thì đổi sang lưới vẽ canvas (Glide Data Grid). **Đã thử 30/10: đạt cả ba thước, giữ ReUI** (ADR-0004) |
| Lõi nghiệp vụ | Mã TypeScript thuần + zod | Một bộ luật cho mọi bề mặt; kiểm được bằng test không cần giao diện | — |
| Cơ sở dữ liệu | Postgres trên Supabase, dự án riêng, vùng Singapore | Cùng nhà cung cấp; tách dự án để số chủ nhà không chung kho với Invest; gần Việt Nam | Đã dùng |
| Truy cập dữ liệu | SQL thuần + migration đánh số, như Invest | Luật cách ly viết bằng SQL; quen tay | Đã dùng |
| Cách ly và lớp trường | Luật theo dòng theo mã sàn; chủ nhà ở bảng riêng; mở số qua một hàm duy nhất có ghi sự kiện | Biến «sàn này không thấy gì của sàn kia» và «số chủ chỉ đầu chủ thấy» thành luật của kho dữ liệu, không trông vào màn hình | Đã chốt dùng luật theo dòng (28/10) |
| Đăng nhập | better-auth chỉ giữ danh tính (email + mã 6 số); thành viên sàn là bảng của Quỹ hàng có luật theo dòng | CRM đang dùng better-auth; vai và «một người nhiều vai, có khu» không vừa khuôn tổ chức của thư viện | Đã chốt 30/10 — [ADR-0005](../adr/0005-dang-nhap-theo-san.md) |
| Đồng bộ và kho trên máy | Ghi: lệnh qua API, máy chủ kiểm quyền và luật rồi ghi sự kiện. Đọc: bộ đồng bộ đưa đúng phần người đó được thấy xuống kho trên máy | Đáp ứng ghi trên máy trước, đụng nhau thì hỏi, mang theo ít | **Tự làm mỏng** (chốt 30/10, [ADR-0006](../adr/0006-bai-thu-dong-bo.md)): kéo qua API dưới luật theo dòng, kho IndexedDB gắn người dùng + hàng đợi ghi có khoá chống trùng, kênh thời gian thực của Supabase chỉ báo «có thay đổi, kéo về». PowerSync, ElectricSQL đã so bằng tài liệu, chưa đo |
| Ảnh | Supabase Storage, hai vùng; sinh bản thu nhỏ khi tải lên | Gửi bản nhẹ, giữ bản gốc; ngăn nội bộ chỉ mở bằng link ngắn hạn | Đã dùng (nhà cung cấp) |
| Việc nền | Bảng việc trong Postgres + lịch chạy mỗi phút của Vercel | Hạn lead 15 phút, hàng đợi hằng đêm, ảnh thu nhỏ, nạp nguồn cấp — không thêm hạ tầng | Mẫu đang chạy ở CRM |
| Thông báo | Web Push (máy tính, Android, iPhone khi đã cài lên màn hình chính) + trong app | Báo lead tức thì | Thử trên iPhone |
| Nhập Excel | Đọc file ngay trên trình duyệt (SheetJS hoặc exceljs), gửi từng dòng lên máy chủ để ghép căn | Xem trước nhanh, không chờ tải file lên | — |
| Trang khách | Dựng ở máy chủ, ảnh xem trước sinh theo bộ căn, đọc bản giá sống | Link sống, ghi công đúng người | Thử với Zalo |
| Điện thoại | Bản đầu: web cài lên màn hình chính. Sau: vỏ app gốc bọc cùng mã web (Capacitor); bộ gõ viết gốc Android | Đầu khách chủ yếu đọc và gửi — web làm được, kể cả chia sẻ ảnh + tin sang Zalo. Việc web trên iPhone không làm được thì để vỏ app | Đã biết giới hạn (mục 7) |
| Chạy | Vercel (cùng đội), vùng Singapore | Đã dùng cho Invest và CRM | Đã dùng |
| Chất lượng | Cổng nghiệm thu, bảo vệ nhánh main như CRM; bộ kiểm cách ly và bộ kiểm rò rỉ trang khách là kiểm bắt buộc | Hai lỗi đắt nhất là lộ hàng giữa sàn và lộ số chủ ra trang khách | Đã dùng |

## 6. Bức tranh chạy

```
Máy tính: đầu chủ, telesales, quản trị ─┐
Điện thoại: đầu khách, đầu chủ mang theo ┼─ lệnh ──→ API ──→ Postgres: sàn | danh mục | sự kiện | chủ nhà
                                         └─ đồng bộ ←──────────────┘          │
Khách (mở từ Zalo) ──→ Trang khách /s/<mã> ← đọc giá sống ─────────┘          │
Việc nền: hạn lead, hàng đợi, ảnh thu nhỏ ─────────────────────────→ Kho ảnh  │
OneHub Invest (máy local) ── đẩy nguồn cấp có phiên bản, qua bộ soát ──→ vùng danh mục
(sau) Quỹ hàng ── căn đầu chủ chọn đăng ──→ OneHub Platform
```

## 7. Giới hạn của điện thoại, và cách đi vòng

| Việc | Web trên Android | Web trên iPhone | Cách đi ở bản đầu |
| --- | --- | --- | --- |
| Chia sẻ link, ảnh + tin sang Zalo | Được | Được | Bảng chia sẻ của điện thoại; người chọn người nhận và bấm gửi |
| Nhận ảnh chia sẻ từ Zalo vào app | Được (web đã cài) | Không | Đầu chủ ngồi máy tính: kéo hoặc dán ảnh từ Zalo trên máy tính vào hồ sơ căn. iPhone: lưu ảnh rồi thêm từ máy, tới khi có vỏ app gốc |
| Thông báo lead | Được | Được khi đã cài lên màn hình chính | Hướng dẫn cài ngay lần đăng nhập đầu |
| Dữ liệu trên máy lâu dài | Ổn | Hệ điều hành có thể dọn khi ít dùng | Đủ cho «nhanh tức thì»; ngoại tuyến bền chờ vỏ app gốc, sau khi đo |
| Bộ gõ trong Zalo | Không | Không | Chỉ app gốc, giai đoạn sau |

Ghi nhận thiết bị theo vai làm các giới hạn này nhẹ đi: việc cần app gốc nhất (nhận ảnh từ Zalo) là của đầu chủ, mà đầu chủ ngồi máy tính.

## 8. Dữ liệu cá nhân và an toàn

- **Số chủ nhà là dữ liệu nhạy nhất hệ thống**: chủ nhà là người thường, không phải người đăng rao công khai, nên không thuộc tầng C như người bán trên tin rao của Invest. Số được mã hoá ở mức trường; chỉ giải mã qua cửa mở số, có ghi ai và khi nào.
- **Vai pháp lý**: sàn là bên kiểm soát dữ liệu chủ nhà, OneHub là bên xử lý; ghi trong hợp đồng và điều khoản (28/10: làm ở khâu vận hành). Luật Bảo vệ dữ liệu cá nhân có hiệu lực từ 1/1/2026 — cần người pháp lý rà trước khi có sàn đầu tiên ngoài đội.
- **Ra và xoá**: sàn ngừng dùng thì được xuất toàn bộ (hàng là của họ) rồi xoá; đăng xuất hay báo mất máy thì xoá kho trên máy.
- **Zalo**: không đăng nhập Zalo, không đọc tin Zalo, không gửi qua Zalo cá nhân. Thông báo qua Zalo OA để sau và cần quyết định riêng.
- **Trang khách**: dữ liệu trả về được dựng từ luật ẩn trong lõi, không phải ẩn ở giao diện. Bộ kiểm rò rỉ khẳng định không trường nội bộ nào có trong trang, kể cả trong mã nguồn trang.
- **Nhật ký dùng** (lượt mở, quan tâm, chia sẻ) lưu trong Quỹ hàng, không sang Invest; không thu thông tin cá nhân của khách.

## 9. Thứ tự dựng theo ưu tiên thiết bị

1. **Ba bài thử, khoảng một tuần, trước khi viết sản phẩm**: (a) lưới 5.000 dòng sửa trên ô và dán 500 ô; (b) bộ đồng bộ với luật cách ly và lớp trường, rút mạng năm phút rồi nối lại; (c) Zalo: link trang khách hiện ảnh xem trước và lượt Zalo tự lấy ảnh không bị đếm, chia sẻ ảnh + tin từ web trên iPhone, kéo ảnh từ Zalo trên máy tính vào trình duyệt.
2. **Nền**: kho, cơ sở dữ liệu, cách ly và bộ kiểm, đăng nhập theo sàn, lõi nghiệp vụ, nạp danh mục cho dự án thử.
3. **Máy tính của đầu chủ**: bảng hàng sửa trên ô, hồ sơ căn, nhập Excel, Hôm nay, Sẵn sàng bán. Xong bước này đội đã bỏ được Sheet ở phần giữ hàng.
4. **Dòng vào**: ô nhận lead, kiểm trùng, chia lead, thông báo, màn cuộc gọi trên máy tính.
5. **Điện thoại của đầu khách**: bảng hàng dạng thẻ, hồ sơ căn, Hôm nay của đầu khách, Gửi, Đã gửi, trang khách.
6. **Phần còn lại của bản đầu**: đầu chủ mang theo, phát hàng, trang nhóm môi giới, cài đặt sàn đủ màn, xin dẫn xem.
7. **Hai tuần thử với đội** → đo → quyết ngoại tuyến thật, vỏ app gốc, bộ gõ.

## 10. Chỗ cần chốt kỹ thuật

- [x] Tên kho và tạo kho riêng tư — đã tạo 29/10: `phanlemanh/onehub-quy-hang`, có khung, CI hai check (kiểm tra chung, cách ly giữa công ty) và bảo vệ nhánh main.
- [x] Cách đăng nhập bản đầu — chốt 30/10 ([ADR-0005](../adr/0005-dang-nhap-theo-san.md)): email + mã 6 số qua email; số điện thoại + OTP và Google để sau.
- [x] Bộ đồng bộ — chốt 30/10 ([ADR-0006](../adr/0006-bai-thu-dong-bo.md)): tự làm mỏng; vế mất mạng năm phút đo lại trên thiết bị ở hàng dựng phần đồng bộ.
- [x] Nơi chạy — dựng 31/10 ([ADR-0009](../adr/0009-moi-truong-that.md)): Supabase dự án riêng `quy-hang` vùng Singapore, Vercel `onehub-quy-hang` ở sin1, tên miền cố định `quyhang.onehub.center`, mã đăng nhập gửi qua Resend; CI áp migration và chạy bộ kiểm cách ly trên cơ sở dữ liệu thật trước khi deploy.
- [ ] Tên miền trang khách: chung một tên miền, tên và logo sàn trên trang (đề xuất); tên miền riêng của sàn để sau. Mạnh 29/10: để sau, hỏi ở vòng trang khách.
- [x] Khung toà do sàn nhập Excel có góp về Invest không — không ở bản đầu: chiều Quỹ hàng → Invest đang tắt (ADR-0017 §6).
- [x] ADR trong kho onehub-invest cho chỗ đứng và đường cấp dữ liệu một chiều — đã viết: ADR-0017, PR #167 chờ merge.
