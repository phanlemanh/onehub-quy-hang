# Đánh giá bộ máy hướng dẫn Claude Code làm thiết kế (nháp 02/11)

Nháp để bàn với chủ kho, chưa phải điều đang đúng, chưa commit. Câu hỏi: mỗi lần máy dựng hay sửa một màn, nó có đủ
chỉ dẫn, khối, luật và công cụ kiểm để ra đúng thiết kế không — và chỗ nào nó vẫn phải tự đoán. Khảo sát trên
`main` `304c3d9`. Không chọn khuôn chung (việc của phiên «Khuôn chung», đề xuất bảy khuôn K1–K7).

## Trả lời ngắn

Bộ máy **giỏi cấm, kém cho sẵn**. Máy bị chặn khá chắc khi vẽ *sai kiểu* (màu thô, nút trần, bảng tự dựng, khối cấm
của nhóm), và có nghi thức tốt để *chọn khối* cho ô mới (trang ba lối). Nhưng không có gì đưa cho máy *bộ khung đúng của
một màn* — đầu màn, chờ tải, lỗi, trống, lề, chỗ đặt nút — nên mỗi màn đầu của một nhóm tự nghĩ lại từ đầu, và không
có gì kiểm *thiếu* (một màn không có chờ tải thì không luật nào đỏ). Kiểm bằng mắt trên bản chạy chỉ kiểm *dữ liệu đúng*,
không kiểm *trông đúng*.

## 1. Các lớp đang có và mỗi lớp chặn được gì

| Lớp | Là gì | Chặn được thật | Không chặn |
| --- | --- | --- | --- |
| Chỉ dẫn chung | Mục UI của `AGENTS.md`, luật theo đường dẫn `.claude/rules/giao-dien.md` (thang dùng lại bảy bậc), tự nạp khi chạm `apps/web` | Máy biết thứ tự tìm: khối đã chọn → ReUI → ghép → tự viết | Là chữ; máy đọc hay không, làm theo hay không, không ai đo |
| Skill | `reui` (chính chủ, bản `68f0e6fa91` — **trùng bản mới nhất** MCP báo hôm nay) + `quy-hang-ui` (lớp mỏng của kho) | Luật hình thức ReUI: họ khung, khoảng cách, chữ, chuyển động, «mỗi vùng dữ liệu có trống · tải · lỗi» | Kế hoạch bảy dòng (bề mặt, archetype, mật độ, vùng, trạng thái…) chỉ «viết trong câu trả lời» — không lưu, không so lại với màn làm ra |
| Bản đồ khối đích | `docs/design/vo-va-ia.md` §2: 21 màn → khối ReUI + phương án phụ; §3 «Chỗ hở» 14 dòng; §4 danh sách tránh | Màn nào đã có khối đích thì máy không chọn bừa | Chọn trên ảnh xem trước 30/10, trước dữ liệu thật; không nói bố cục *trong* khối khi chuyển thể |
| Bản đồ khuôn | `design/patterns/` 8 nhóm, mỗi nhóm: khuôn, màn mẫu, khe bắt buộc, khối cấm | Màn thứ hai trở đi của một nhóm dựng qua khuôn, không lệch nhóm | Màn **đầu** của nhóm không có gì để theo; phần lặp ở mọi màn (đầu màn, tải, lỗi) không thuộc nhóm nào |
| Lint giao diện | `packages/ui-lint`: 11 luật, nợ trần 0, kiểm chuẩn danh mục, bài quét khuôn, màn ngoài bản đồ — chạy ở `npm run lint`, hook cuối lượt và CI | Chắc nhất trong bộ: màu thô, nút/ô trần, `<table>`, `confirm()`, `asChild`, emoji, chữ dưới `text-xs`, chuyển động lạ, nhập khối cấm | Chỉ bắt *thứ có mặt mà sai*; không bắt *thứ vắng mặt* |
| Hook | Cuối lượt kiểm kiểu + lint tệp vừa đổi; chặn sửa migration, ghi `.env*` | Lỗi lint giao diện không sống qua một lượt | Không có hook nào về nhìn màn |
| Cổng nghiệm thu | `design-pass` (trang ba lối, ảnh đối chiếu 1440/375), eval `ui-check` do tác tử chấm chạy trên bản chạy, sàn thiết kế M1 | Ô chưa có khuôn buộc so ba lối và có người ký; màn mới đặt cạnh màn mẫu | Xem mục 2 |

## 2. Chỗ hở — máy vẫn đoán ở đâu

| # | Chỗ máy đoán | Bằng chứng trong kho |
| --- | --- | --- |
| H1 | **Bộ khung một màn** (đầu màn, lối về, chỗ nút chính, bề rộng, căn lề) không có ở đâu — mỗi màn tự quyết | Bốn `Khung*` riêng (`KhungBangHang`, `KhungHoSoCan`, `KhungLead`, `KhungLeadCuaToi`); `max-w-3xl` bám trái ở ba màn, `max-w-3xl mx-auto` ở hồ sơ toàn màn; hồ sơ toàn màn không lối về; `+ Lead` ở hai nơi; `Breadcrumb` cài mà không màn nào dùng |
| H2 | **Trạng thái tải · lỗi · không có** — luật có, khuôn chưa có, kiểm không có | 0 tệp `loading.tsx` / `error.tsx` / `not-found.tsx` dưới `apps/web/src/app`; `TrangThai` chưa có kiểu tải; Skeleton viết tay ở 3 màn (Bảng hàng, hồ sơ căn, lead đã nhập). Luật `KH-ts-chua-co-kieu` hẹn «màn đầu tiên cần thì thêm kiểu» — ba màn đã cần, không gì nhắc |
| H3 | **«Chuyển thể khối ReUI» thực tế là dựng lại bằng mắt** từ ảnh xem trước | Danh mục ghi `solution-crm-4` «dựng bằng thành phần đã cài, không cài khối»; lối «ReUI» của trang ba lối hồ sơ căn là bản dựng tay. Không bước nào đặt mã gốc của khối cạnh bản chuyển thể để so — chỗ hở lớn nhất dẫn tới «trông không giống Verve» dù cùng họ thành phần |
| H4 | **Kiểm bằng mắt kiểm dữ liệu, không kiểm hình** | Eval `ui-check` của hồ sơ căn (E9, E9b) liệt kê chữ, số dòng, URL, tràn ngang — không câu nào về mật độ, thẳng hàng, thứ bậc. E9b không có ảnh: «Playwright kẹt ở màn tải, screencapture ra ảnh đen». Ảnh đối chiếu so màn mới với màn mẫu cùng nhóm — màn đầu nhóm so với chính nó |
| H5 | **Mật độ** chọn theo cảm tính từng màn | Kế hoạch bảy dòng của ReUI có ô «mật độ» nhưng không lưu; Bảng hàng dày có chủ ý, form thoáng — không đâu ghi nhóm màn nào dày, nhóm nào thoáng |
| H6 | **Sàn thiết kế mới ở M1** — chỉ chặn mã màu thô | `design-floor.json` của hồ sơ: «design_floor.tokens chưa khai; design_floor.registry chưa khai». M2 (bộ token, danh mục máy đọc) hẹn «mở khi có màn thật» — đã có màn thật |
| H7 | **Cảnh báo không thành việc** | Bốn dòng «Chỗ hở» hạn `2026-10-30` đã quá (đăng nhập, ô nhận lead, trống·lỗi·báo, người dùng — đều «chờ khoá ReUI Pro»), trong khi khoá đã chạy từ 31/10 (hàng 14 cài khối Pro `data-grid-editing-6`; phiên Khuôn chung xác nhận MCP trả gói Pro). `npm run lint` in cảnh báo; không ai mở hàng |
| H8 | **Tài liệu thiết kế lệch mã** — máy đọc chỉ dẫn cũ | `design/patterns/bang-hang.md` còn luật `KH-bh-chi-doc` («ô chỉ đọc tới khi mục 15 mở») và danh mục ghi Bảng hàng «chỉ đọc — bỏ sửa ô», trong khi mã đã có `inventory/cell-edit/`, `inventory/bulk/` |

Điểm chung của H1, H2, H5: là **thứ phải có mặt**, mà cả bộ kiểm chỉ biết **cấm thứ có mặt**. Điểm chung của H3, H4:
không có **ảnh đích** để máy so trước khi trình người.

## 3. Đối chiếu với cách các kho tốt làm

| Cách làm | Kho tốt | Quỹ hàng hôm nay |
| --- | --- | --- |
| Token thiết kế là nguồn, lint đọc từ token | Bộ token (màu, khoảng, chữ) một tệp; lint và sàn thiết kế đọc từ đó | Có nhờ style `base-nova` + luật cấm màu thô; chưa khai token cho sàn M2 — **gần đạt** |
| Khung trang có khe bắt buộc | Polaris `Page` (tiêu đề, lối về, hành động chính/phụ), Primer `PageLayout` — màn nào cũng bọc khung ấy | Khuôn theo nhóm, không có khuôn chung cho mọi màn — **thiếu** (đúng chỗ phiên Khuôn chung đang đề xuất K2, K6) |
| Lệnh dựng màn | Bộ sinh (plop, generator) tạo trang + chờ tải + lỗi + mục danh mục cùng lúc; máy không thể quên | Kho có `/new-migration` cho cơ sở dữ liệu; **không có** lệnh tương đương cho màn |
| Mọi trạng thái có bản xem | Storybook/Ladle: mỗi thành phần và khuôn có câu chuyện cho trống, tải, lỗi, dài, hẹp | Có tuyến `/proto/<slug>` cho từng vòng, bỏ sau vòng; không có trang tập hợp trạng thái |
| Ảnh chuẩn + so ảnh tự động | Playwright `toHaveScreenshot` / Chromatic so màn mẫu mỗi PR | Ảnh đối chiếu để người xem ở cổng; máy không so; chụp còn chập chờn — **thiếu** |
| Kiểm *có mặt*, không chỉ kiểm *cấm* | Luật kiểu «mỗi tuyến có `loading`/`error`», «mỗi màn bọc `Page`» | Bài quét khuôn đã kiểm khe bắt buộc *trong nhóm* — cùng cơ chế, chưa áp cho mọi màn |

Kho đi trước nhiều kho ở phần *chọn khối có người ký* và *lint giao diện trần 0*. Kho đi sau ở phần *khung cho sẵn* và
*so ảnh*.

## 4. Một khuyến nghị

**Đổi từ «cấm» sang «cho sẵn»: một lệnh dựng màn sinh đủ bộ khung — đầu màn, chờ tải, lỗi, không có, mục bản đồ khuôn —
và bài quét khuôn đỏ khi một màn dưới `(app)` thiếu bộ ấy.** Giống cách kho đã làm với cơ sở dữ liệu: không trông vào
việc máy nhớ luật cách ly, mà có `/new-migration` sinh sẵn và bộ kiểm cách ly đỏ khi thiếu.

Căn cứ:

- Sửa đúng nhóm chỗ hở nhiều bằng chứng nhất (H1, H2, H5): ba chỗ Skeleton viết tay, 0 tuyến có chờ tải/lỗi, bốn kiểu
  khung, hai kiểu lề — đều là thứ *vắng mặt*, mà kiểu kiểm duy nhất bắt được thứ vắng mặt là kiểm có mặt.
- Dùng lại máy móc sẵn có: bài quét khuôn đã kiểm «khe bắt buộc» trong từng nhóm — nới cùng cơ chế cho mọi màn, không dựng
  công cụ mới.
- Không thêm lượt gọi người: lệnh chạy trong vòng, bài quét chạy trong `npm run lint`.
- Khớp với phiên Khuôn chung: phiên ấy chọn *nội dung* khung (K2 khung màn, K6 trạng thái); khuyến nghị này làm khung ấy
  **thành thứ máy không quên được**. Nên đi cùng hàng nền của Khuôn chung, sau khi chủ kho duyệt hướng K2/K6.

Vì sao chưa khuyên so ảnh tự động trước: so ảnh khoá lại thứ đang có, mà màn đang có chưa đúng — khoá bây giờ là giữ lệch.
Làm sau, khi khuôn chung đã đứng (khi ấy H3, H4 là bước kế: đặt mã gốc khối cạnh bản chuyển thể, và ảnh chuẩn màn mẫu
mỗi nhóm có so tự động).

Việc nhỏ thấy được, đứng riêng (không cần quyết): H7 — bốn chỗ «chờ khoá» hết lý do chờ; H8 — sửa `bang-hang.md` và
danh mục cho khớp sửa trên ô. Đổi rào, skill, lint là việc T3, PR riêng.

## 5. Đối chiếu công thức «5 lớp cho kho shadcn» (chủ kho gửi 02/11)

| Lớp của công thức | Kho hôm nay | Đánh giá |
| --- | --- | --- |
| 1. `components.json` + token ở `globals.css` (`:root`, `.dark`, `@theme inline`) | Có đủ: `base-nova`, neutral, lucide, registry `@reui` có khoá; token shadcn + token trạng thái của ReUI | **Đạt.** Bước «thay token OneHub» không nên làm: kho đã chốt nền neutral như onehub-invest, và ReUI xếp style đã cài trên mọi luật khác |
| 2. `.mcp.json` để Claude tra thay vì đoán | MCP `shadcn` và `reui` chạy được trên máy này nhưng khai ở **cấu hình người dùng**, kho **không có** `.mcp.json` | **Hở thật, rẻ.** Phiên trên tài khoản khác (bàn giao đợt khi đổi tài khoản), phiên đám mây, máy khác sẽ không có MCP → máy quay về đoán từ trí nhớ cũ |
| 3. `CLAUDE.md` ngắn + skill có `tokens.md`, `components.md`, `patterns.md` + màn mẫu | Luật UI nằm ở luật theo đường dẫn (chỉ nạp khi chạm `apps/web`) — tốt hơn nhồi vào CLAUDE.md. `components.md` ≈ `catalog.md`; `patterns.md` ≈ `design/patterns/` (máy đọc, có răng — mạnh hơn công thức). Không có `tokens.md` riêng (skill `reui` phần màu đã nói nghĩa token). Màn mẫu: có theo nhóm (`mau_dang_chay`), chưa có màn mẫu cho khung chung | **Vượt** ở patterns, **ngang** ở components, **thiếu** màn mẫu chung (= H1) |
| 4. Lint chặn giá trị ngoài hệ + TS strict + hook sau mỗi lần sửa | Chặn hex/`rgb()`/`oklch()`, cỡ chữ tuỳ ý, thời lượng tuỳ ý; TS strict + `noUncheckedIndexedAccess`; hook cuối lượt (không phải sau mỗi lần sửa) | **Gần đạt.** Hở: **khoảng cách và kích thước tuỳ ý** (`p-[13px]`, `h-[…]`) chưa bị chặn — có 5 chỗ trong mã, gồm chiều cao viết cứng của cột hồ sơ căn. Hook cuối lượt hợp với kho nhiều gói (kiểm kiểu cả gói sau mỗi lần sửa thì chậm) — giữ |
| 5. Kiểm tương phản cặp token + Playwright chụp để tự xem | Không có bài tương phản. Công cụ chụp có (trình duyệt trong app, Playwright), nhưng **muốn thấy màn phải có Postgres, đăng nhập, dữ liệu mẫu theo dãy** — đắt và chập chờn (ảnh đen ở hồ sơ căn) | Tương phản: **chưa cần** (token là của shadcn/ReUI đã kiểm, kho không đổi). Tự xem: **hở lớn nhất của công thức với kho này** (= H4) |

Công thức **thiếu** ba điều kho này cần: chọn khối ReUI (khối Pro, trang ba lối); khuôn theo nhóm và kiểm *có mặt*; bẫy
Base UI ↔ Radix khi cài. Và luật «thiếu token thì hỏi» trái nhịp của chủ kho — đúng hơn là dùng token gần nhất rồi ghi
«Chỗ hở».

Không nên nhận «bộ file starter»: kho đã có skill, lint, hook riêng sâu hơn; chép thêm một bộ là hai nguồn luật cãi nhau.

**Khuyến nghị ở §4 giữ, mở rộng một ý từ lớp 5:** lệnh dựng màn sinh thêm **trang xem trạng thái chạy bằng dữ liệu mẫu,
không cần cơ sở dữ liệu hay đăng nhập** (mặc định · đang tải · trống · lỗi, khổ 1440 và 375). Một vật dùng ba việc: màn
mẫu để máy chép, chỗ máy tự chụp rẻ mỗi lượt, và về sau là ảnh chuẩn cho so ảnh tự động.

Việc nhỏ, rẻ, không cần đợi: đưa MCP `shadcn` + `reui` vào `.mcp.json` của kho; luật lint chặn khoảng cách và kích thước
tuỳ ý (ngoại lệ có lý do như vùng an toàn điện thoại).

## 6. Bức tranh chung với phiên «Khuôn chung» (02/11)

Đọc từ bản chép lời của phiên Khuôn chung (chưa viết gì vào kho; worktree của phiên ấy sạch). Phiên ấy đi ba nấc: bảy
khuôn K1–K7 → tách thành **hệ bố cục** ba tầng (nền · vỏ · bố cục trang) → quét bốn trục (7 bố cục × vùng × trạng thái ×
khổ màn) → **trình tự tám bước** kèm năm số đo, đang chờ chủ kho duyệt hướng.

**Hai phiên nhìn một vấn đề từ hai phía.** Khuôn chung trả lời *khung đúng trông thế nào*; phiên này trả lời *làm sao máy
không quên khung*. Cả hai tự đi tới cùng ba vật: **thành phần bố cục trong mã** (màn chọn bố cục, không tự chia vùng),
**trang mẫu sống** (mọi bố cục × trạng thái × khổ bằng dữ liệu mẫu), **máy kiểm có mặt** (đỏ khi màn không khai bố cục, tự
đặt lề, tự dựng chờ tải).

| Tầng | Kho hôm nay | Khuôn chung đề xuất | Phiên này bổ sung |
| --- | --- | --- | --- |
| Tra cứu | MCP chạy ở cấu hình người dùng | — | Khai MCP `shadcn` + `reui` trong kho (bước trước bước 0) |
| Nền | Token ReUI giữ nguyên; lề, khoảng giữa khung chưa có luật | Bước 1: lề, khoảng giữa khung, bề rộng «đọc», điểm gãy | Đo từ **mã đã cài** của khối, không từ ảnh xem trước (H3). Ví dụ thật: `settings-3` tự đặt bề rộng tối đa ở gốc — ReUI dặn gỡ khi vào trang cài đặt; đo theo ảnh sẽ chép nhầm |
| Vỏ | `app-shell-8` đã chuyển thể | Bước 2: menu Tạo (trang ba lối) | — |
| Bố cục trang | Không có; bốn `Khung*` riêng, hai kiểu lề | Bước 3–4: bảy bố cục, vùng đầu màn · thanh công cụ · chân · ngăn nổi | Mỗi bố cục khai **mật độ** (tràn dày, đọc thường) — ô «mật độ» trong kế hoạch của ReUI có đáp án sẵn (H5) |
| Trạng thái | 0 tuyến có chờ tải/lỗi; Skeleton tay ở 3 màn | Bước 5: chờ tải theo hình bố cục (`c-data-grid-21`, miễn phí — đã kiểm), lỗi, không thấy, ngoại tuyến | Gộp bốn chỗ «chờ khoá» quá hạn vào đây (H7) |
| Màn mẫu | Theo nhóm; màn đầu nhóm so với chính nó | Bước 6: trang mẫu sống | Phải **chạy không cần cơ sở dữ liệu, không đăng nhập** — điều kiện để máy tự chụp rẻ mỗi lượt; hôm nay muốn thấy màn phải có Postgres, đăng nhập, dữ liệu theo dãy, và từng ra ảnh đen (H4) |
| Máy kiểm | 11 luật cấm + bài quét khuôn theo nhóm | Bước 7: bốn luật có mặt (khai bố cục, lề tay, chờ tải ngoài khuôn, ngăn gọi thẳng) | Thêm luật **khoảng cách / kích thước tuỳ ý** (5 chỗ trong mã); eval giao diện của vòng phải **so với ảnh chuẩn bố cục**, không chỉ kiểm chữ và số |
| Ảnh chuẩn | Ảnh đối chiếu cho người xem ở cổng | Chụp trang mẫu sống 1440 · 1024 · 375; đối chiếu đổi sang so với ảnh chuẩn của bố cục | — |
| Tài liệu | Có chỗ lệch mã | ADR mới, cột «Bố cục» ở bảng khối đích, sửa Tham chiếu §9 | Sửa `bang-hang.md` (luật «chỉ đọc» lỗi thời) cùng PR (H8) |

**Chỗ hai phiên từng khác nhau — đã gỡ:**

- *So ảnh làm ngay hay để sau.* Phiên này từng khuyên để sau vì sợ khoá lại màn đang lệch. Khuôn chung chụp ảnh chuẩn từ
  **trang mẫu sống** — vật mới, đã duyệt — chứ không từ màn đang có, nên không khoá lệch. **Theo Khuôn chung: làm trong hàng
  nền.**
- *Lệnh dựng màn.* Có thành phần bố cục và máy kiểm có mặt thì máy không quên được khung dù không có lệnh sinh; lệnh dựng màn
  hạ thành tiện ích, không còn là khuyến nghị chính.

**Khuyến nghị chung (thay §4):** lấy **tám bước của Khuôn chung làm xương sống**, nhận năm bổ sung ở cột phải (MCP trong kho;
chuyển thể từ mã đã cài; mật độ theo bố cục; trang mẫu sống không cần cơ sở dữ liệu; luật kích thước tuỳ ý + eval so ảnh
chuẩn). Một hàng nền, một lần duyệt ở Cổng Phạm vi, không thêm cổng.

Căn cứ: hai phiên làm độc lập, đi tới cùng ba vật — đó là tín hiệu hướng đúng. Năm bổ sung đều có bằng chứng trong kho
(§2) và đều nằm trong bước đã có của trình tự, không thêm bước.

Hai điều để giám sát chốt, không cần chủ kho: (1) phân tầng — Khuôn chung ghi hàng nền T2; phần sửa skill và luật kiểm là
sửa rào, phiên này nghiêng T3 (thêm cổng duyệt kế hoạch); (2) khoá ReUI Pro — có dấu hiệu mạnh đã chạy (khối Pro của Bảng
hàng cài 31/10), phiên này không đọc được tệp khoá theo luật kho nên chưa tự xác nhận.

## 7. Bản đồ tệp của hệ thiết kế — hiện trạng (02/11)

Kho **chưa có** một bản đồ chung cho hệ thiết kế. Có ba mảnh: bảng «mỗi loại thông tin một chỗ» ở `docs/README.md` chỉ
có một dòng thiết kế (trỏ `vo-va-ia.md`); skill `quy-hang-ui` có mục «Đọc theo thứ tự» năm chỗ — đây là lối vào thật của
Claude, vì skill tự nạp khi chạm giao diện; còn lại rải trong lời của từng tệp. Máy đi theo chuỗi trỏ: luật theo đường dẫn
→ skill → từng tệp; chỗ nào chuỗi không trỏ tới thì máy không biết là có.

| Lớp | Việc nó làm | Tệp | Skill `quy-hang-ui` có trỏ? |
| --- | --- | --- | --- |
| Chỉ dẫn | Luật chung, thang dùng lại bảy bậc | `AGENTS.md` (mục UI), `.claude/rules/giao-dien.md` | có |
| Chỉ dẫn | Luật ReUI chính chủ | `.agents/skills/reui/` | có |
| Chỉ dẫn | Lớp riêng của kho | `.agents/skills/quy-hang-ui/SKILL.md` | — (chính nó) |
| Nền | Style, registry, khoá Pro | `apps/web/components.json` | có |
| Nền | Token màu sáng/tối | `apps/web/src/app/globals.css` | **không** |
| Nhãn | Chữ trên màn ↔ tên code | `CONTEXT.md` | có |
| Chọn khối | Vỏ, khối đích từng màn, chỗ hở, khối tránh | `docs/design/vo-va-ia.md` | có |
| Chọn khối | Thành phần đã cài, khối đã chuyển thể | `.agents/skills/quy-hang-ui/catalog.md` | có |
| Chọn khối | Lý do chọn | ADR-0002 (vỏ, IA), ADR-0019 (cổng chọn khối, ba lối), ADR-0022 (đối chiếu ngành) | chỉ ADR-0019 |
| Khuôn | Tám nhóm màn: khuôn, màn mẫu, khe, khối cấm | `design/patterns/*.md` | có (mục sau, không trong «Đọc theo thứ tự») |
| Khuôn | Khuôn trạng thái trống · lỗi · báo | `apps/web/src/components/trang-thai.tsx` | qua `trang-thai.md` |
| Kiểm | 11 luật, mức nợ, kiểm chuẩn, bài quét khuôn, đối chiếu, ba lối, số đo | `packages/ui-lint/` | có |
| Kiểm | Kiểm cuối lượt | `.claude/hooks/typecheck-changed.sh` | **không** |
| Cổng | Sàn thiết kế, chạy bản xem trước, skill chấm | `_acceptance/config.yaml` (`design`, `design_pass`) | có (sàn M1) |
| Sổ | Lệch lọt khi dùng thật | `docs/design/lech-lot.md` | có |
| Sổ | Hiện trạng cổng chọn khối (nháp 1/11) | `docs/design/cong-chon-khoi-hien-trang.md` | **không** |
| Đối chiếu | Sản phẩm cùng loại | `docs/product/doi-chieu-nganh.md` | **không** (luật ở `.claude/rules/thiet-ke-doi-chieu.md`) |
| Đối chiếu | Phác thảo 41 màn | canvas trên claude.ai | **không** |

Claude cần bản đồ này **ở lối vào của nó** — skill `quy-hang-ui` — không phải một tài liệu thứ ba: tài liệu riêng mà skill
không trỏ thì máy không đọc. Hàng nền «Hệ bố cục» thêm tệp mới (thành phần bố cục, trang mẫu sống, ảnh chuẩn) nên là lúc
dựng bảng này trong skill, `docs/README.md` trỏ một dòng sang, và kiểm chuẩn đỏ khi một tệp của hệ thiết kế không có dòng
(cùng cơ chế đang kiểm danh mục thành phần).

## Kết luận lượt thảo luận

02/11 — chủ kho: «Duyệt hướng chung». Tức là: tám bước của Khuôn chung làm xương sống, cộng năm bổ sung ở §6 (MCP trong
kho; chuyển thể từ mã đã cài; mật độ theo bố cục; trang mẫu sống không cần cơ sở dữ liệu, không đăng nhập; luật kích thước
tuỳ ý + eval so ảnh chuẩn bố cục). Một hàng nền, một lần ký ở Cổng Phạm vi.

Việc kế: phiên Khuôn chung viết ADR «Hệ bố cục» và hàng nền theo hướng này; giám sát chốt phân tầng (T2 hay T3) và xác nhận
khoá ReUI Pro. Tệp này là đầu vào của ADR ấy; nội dung đúng sau khi gộp nằm ở ADR và Tham chiếu, không ở đây.
