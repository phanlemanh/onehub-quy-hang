# Kiểm khu Cài đặt — 09/11/2026

Khu này do nhiều hàng dựng ở các thời điểm khác nhau. Bản này kiểm 11 màn (Cá nhân và mười mục của nhóm Sàn) theo bốn mặt:
tốc độ, đồng nhất, khuôn và lỗi giao diện. Chỉ đọc, chụp và bấm thử trên dữ liệu thử, không sửa mã. Mã đọc ở `main` @
`001ae667`.

**Chưa đo được, đọc số với điều kiện này:**

- **Chưa đo trên bản thật.** Trình duyệt của app chưa đăng nhập `quyhang.onehub.center`, nên mọi số đo là bản build chạy tại
  máy với sàn «[Mẫu] Sàn thử», cơ sở dữ liệu cùng máy. Cột «máy chủ» thêm độ trễ giả lập 5 ms mỗi lượt hỏi cơ sở dữ liệu;
  đó là ước lượng, không phải số thật của Vercel và Supabase.
- Điện thoại là giả lập khổ 375 trên Chrome, không có máy thật.
- Nhánh lỗi tải phía máy chủ chỉ đọc mã, chưa gây lỗi thật. Trạng thái lỗi của màn AI và lỗi mạng khi xoá thì đã chạy thật.
- MCP `reui` chưa đăng nhập, nên phần khuôn đối chiếu theo danh mục khối đã cài và `docs/design/vo-va-ia.md`, không tra mới.

## Trả lời ngắn

Khu Cài đặt **chạy được và đúng quyền**: bốn vai không quản trị đều bị chuyển về Cá nhân kèm câu báo, 44 lần mở màn ở
hai khổ và hai nền không có lỗi console, không tràn ngang cả trang.

Vấn đề là các hàng dựng lệch nhau ở **cách lưu**. Có năm kiểu báo «đã lưu», chỗ khoá nút Lưu khi chưa đổi chỗ không, và không màn nào hỏi lại khi bấm
sang mục khác lúc đang sửa. Có **hai lỗi thật**: nhãn trạng thái biến mất dù đã bấm «Giữ nhãn», và xoá mẫu nhập hỏng thì
không báo gì.

Về tốc độ, chỗ chậm nhất không riêng màn nào: **gói mã chung của vỏ**. Trên máy và mạng chậm, form hiện ở 1,1 giây nhưng khoảng
3 giây mới bấm được. Phần sửa được ngay trong khu là đọc phiên ba lần mỗi màn, 22 lượt tải trước mỗi lần mở, và đổi mục không
có phản hồi trong lúc chờ máy chủ.

## Bảng từng màn × bốn mặt

Mức: **đạt** · **lệch** (dùng được, khác khuôn hay khác màn khác) · **lỗi** (làm sai việc của người dùng).

| Màn | Tốc độ | Đồng nhất UX/UI | Khuôn, vẽ tay | Lỗi giao diện |
| --- | --- | --- | --- | --- |
| Cá nhân | đạt; danh sách máy đọc sau ở trình duyệt | đạt (nhóm `toi`) | đạt, `settings-2` | không |
| Người dùng | **lệch**: chậm nhất ở máy chủ (310 ms), đọc thành viên rồi mới đọc vùng | lệch: lưu xong không báo; mô tả lặp tên sàn | đạt, `solution-users-8` | đọc mã: máy chủ lỗi thì vỡ ra màn lỗi chung (L15) |
| Cách gọi | đạt | **lệch**: nút Lưu cách đầu màn 1.860 px; Lưu khi chưa đổi vẫn báo «đã lưu» | đạt, `settings-3` | «Tên của sàn» dễ hiểu nhầm (L21) |
| Trường riêng | đạt | lệch: Lưu không khoá khi chưa đổi | đạt, `settings-3` | không |
| Trạng thái | lệch: hai lượt đọc nối tiếp (269 ms) | **lệch**: hai nút Lưu trên một màn | **lệch**: hai khung, trái luật một khung | **lỗi**: «Giữ nhãn» không giữ (L1) |
| Luật chia lead | đạt | lệch: báo bằng toast; số không có đơn vị | đạt, `settings-3`; sổ «Chỗ hở» còn ghi ghép | toast trắng phủ nút (L9) |
| Thuế phí | đạt | lệch: như trên; tỉ lệ lặp hai lần trong dòng | lệch: `<label>` trần | ô tỉ lệ không có nhãn cho máy đọc màn (L13) |
| Mẫu | đạt | **lệch**: nội dung sát viền; ba cách báo trong ba tab | **lệch**: bảng, khung xem trước, tiêu đề tự dựng; chưa có khối đích | **lỗi**: xoá hỏng không báo (L2); nút Sửa, Xoá ra ngoài màn ở 375 (L8) |
| Từ điển | đạt | **lệch**: bảng sát viền; sàn trống vẫn hiện bảng toàn số 0 | lệch: bốn `Table` thay `data-grid` | cột cắt nhẹ ở 375 |
| Xử lý bằng AI | **lệch**: dữ liệu đọc ở trình duyệt, chờ thêm 0,3–2,1 s | lệch: tiêu đề lặp ba lần; công tắc áp ngay, không qua Lưu | đạt | không |
| Trang môi giới | đạt | lệch: ô phần trăm là ô chữ, các màn khác là ô số | lệch: `Input` thay `NumberField` | không |

Mọi màn đều có thêm hai chỗ lệch chung: không hỏi khi rời trang lúc chưa lưu (L4), và đổi mục không có phản hồi (L6).

## Tốc độ tải

Bản build, sàn mẫu, đo bằng đồng hồ trong trang, trung vị 3 lần. Mạng thường: 20 Mbps, trễ 40 ms. Mạng chậm: 4G chậm 1,6 Mbps,
trễ 150 ms, máy chậm 4 lần. Tải lạnh, không có bộ đệm. Đơn vị ms, trừ cột cuối.

| Màn | Thường: hiện · bấm được | Chậm: hiện · bấm được | Máy chủ dựng xong (giả lập) | Câu SQL một lần mở | Mã JS nén (KB) |
| --- | --- | --- | --- | --- | --- |
| Cá nhân | 164 · 417 | 1.092 · 2.981 | 111 | 26 | 374 |
| Người dùng | 164 · 432 | 1.168 · 3.087 | **310** | 61 | 382 |
| Cách gọi | 164 · 395 | 1.148 · 2.970 | 177 | 41 | 370 |
| Trường riêng | 160 · 409 | 1.156 · 3.128 | 206 | 65 | 392 |
| Trạng thái | 156 · 411 | 1.168 · 3.166 | 269 | 52 | 386 |
| Luật chia lead | 156 · 422 | 1.168 · 3.150 | 251 | 68 | 393 |
| Thuế phí | 168 · 418 | 1.152 · 3.067 | 229 | 56 | 385 |
| Mẫu | 164 · 424 | 1.144 · 3.169 | 228 | 64 | 411 |
| Từ điển | 164 · 420 | 1.148 · 3.047 | 191 | 38 | 381 |
| Xử lý bằng AI | 160 · **452** | 1.136 · **3.223** | 99 | 26 | 386 |
| Trang môi giới | 160 · 394 | 1.164 · 2.992 | 163 | 38 | 377 |

Ở màn AI, số sau là lúc công tắc mới hiện (dữ liệu về); các màn khác dữ liệu có ngay từ lúc hiện. Chuyển mục bằng cột thứ hai:
49–88 ms ở mạng thường, 184–206 ms ở mạng chậm (AI 109 và 362 ms). Tại máy máy chủ trả gần tức thì, nên số này chưa gồm thời gian
máy chủ thật.

**Chờ thừa và tải dư, theo thứ tự lợi:**

1. **Đọc phiên ba lần mỗi màn.** Vỏ, trang và khung mục mỗi nơi tự hỏi lại người đang đăng nhập (`shell-layout.tsx`, từng
   `page.tsx`, `settings/khung.tsx:29`), không dùng chung kết quả (`lib/api.ts:159`). Màn AI không đọc gì khác ở máy chủ mà
   vẫn 26 câu SQL. Với trễ giả lập, một lần đọc phiên 49 ms; dùng chung một lần đọc thì mỗi màn nhanh thêm khoảng 40–100 ms.
2. **22 lượt tải trước mỗi lần mở màn.** Cột thứ hai có 11 liên kết, mỗi liên kết tải trước hai đợt (`second-column.tsx:82,
   136`). Cách gọi: chỉ tải trang là 41 câu SQL, mở trong trình duyệt là 97. Người chỉ mở một mục vẫn tốn máy chủ cho cả 11 mục.
3. **Đổi mục không có phản hồi.** Giữ lời gọi máy chủ 1,3 s rồi chụp: [màn cũ đứng nguyên](kiem-cai-dat/8-doi-muc-khong-phan-hoi.png),
   địa chỉ và mục sáng trên cột chưa đổi. Khu không có `loading.tsx` riêng; khuôn chờ tải dạng nhãn – ô (`ChoTai`, kiểu `nhan-o`)
   đã có sẵn nhưng chưa dùng. Chờ tải chung của nhóm (`(app)/loading.tsx:5`) lại là hình lưới bảng.
4. **Đọc nối tiếp đáng ra song song.** Người dùng đọc thành viên rồi mới đọc vùng (`users/page.tsx:24,32`); Trạng thái đọc nhãn
   rồi mới đọc cấu hình (`statuses/page.tsx:26,28`). Các màn khác đã đọc song song.
5. **Màn AI đọc ở trình duyệt** (`ai/cong-tac.tsx:29`) dù trang đã chạy ở máy chủ: khung hiện rồi chờ thêm 320 ms ở mạng thường,
   2,1 s ở mạng chậm.
6. **Gói mã chung của vỏ.** 370–411 KB nén mỗi màn, 1,1–1,2 MB chưa nén; riêng trang chuyển hướng `/settings` đã 1.108 KB, nên
   mỗi mục chỉ thêm 18–124 KB. Đây là chỗ chiếm phần lớn 2 giây chờ ở máy chậm, nhưng thuộc cả vỏ, không riêng khu này. Ghi để
   xét ngoài phạm vi; bản kiểm liên hệ 06/11 đo cùng cỡ 420 KB.

## Đồng nhất

**Lưu xong báo thế nào, mỗi màn một kiểu:**

| Màn | Nút Lưu lúc chưa đổi | Đang lưu | Báo lưu xong | Hoàn lại |
| --- | --- | --- | --- | --- |
| Cách gọi, Trường riêng, Trang môi giới | bấm được (Cách gọi đã thử: vẫn báo «Đã lưu») | chữ «Đang lưu…» | khối báo ở chân khung | không |
| Trạng thái, phần nhãn | bấm được | chữ «Đang lưu…» | khối báo ở chân khung | không |
| Trạng thái, phần số ảnh | bấm được | vòng quay | khối báo dưới ô | không |
| Luật chia lead, Thuế phí | **khoá** | vòng quay | toast đáy giữa | **có** |
| Mẫu nhập | trong hộp | không | **không báo** | không |
| Mẫu bảng hàng | trong hộp | không | khối báo đầu tab | không |
| Mẫu bài | bấm được | khoá nút, không chữ | khối báo trên mỗi khối kênh | «Về mặc định» |
| Người dùng, Từ điển | trong hộp, hay từng dòng | không | **không báo**, chỉ danh sách đổi | không |
| AI | áp ngay | khoá công tắc | công tắc đổi | không |

Luật chia lead và Thuế phí là cách đúng nhất trong khu: khoá khi chưa đổi, có Hoàn lại, có vòng quay.

Các chỗ khác lệch nhau:

- **Lỗi tải:** Luật chia lead, Thuế phí, Mẫu, Từ điển, AI có nút «Thử lại». Cách gọi, Trường riêng, Trạng thái, Trang môi giới chỉ
  có câu «Tải lại trang để thử lại» (`labels/page.tsx:30`, `fields/page.tsx:32`, `statuses/page.tsx:34,39`, `broker-page/page.tsx:27`).
- **Trống:** Mẫu bảng hàng có hành động «Thêm mẫu»; Mẫu nhập và Từ điển không có (`vung-mau-nhap.tsx:51`, `vung-tu-dien.tsx:67`).
- **Phím Enter:** Cách gọi, Trạng thái, Trường riêng chặn Enter; Trang môi giới và ô thêm vùng thì gửi.
- **Gỡ rồi đổi ý:** Trường riêng có nút «Giữ lại … (sẽ bỏ khi Lưu)» (`truong-rieng.tsx:187`); Trạng thái thì nhãn biến mất, không có
  lối lấy lại ngoài tải lại trang.
- **Tiêu đề nhóm trong khung:** `FieldLegend` ở ba màn, `h3` tự dựng ở Luật chia lead và Mẫu bài.
- **Sáng và tối:** cả 11 màn đều đọc được. Chữ «Đang giao dịch» trên nền tối chỉ đạt 3,5:1 (huy hiệu dùng chung, không riêng khu này).
- **Khổ 375:** không tràn cả trang. Bảng Mẫu nhập và một bảng Từ điển phải cuộn ngang (L8).

## Khuôn và chỗ vẽ tay

| Câu hỏi | Trả lời |
| --- | --- |
| Lưới khuôn có bắt được không? | **Không.** `cai-dat-san: 10 tệp theo khuôn · 0 lệch`, vì bài quét chỉ soi `page.tsx`. Khung thứ hai của Trạng thái nằm ở tệp thân nên lọt qua luật KH-cd-mot-khung |
| Vì sao Mẫu, Từ điển sát viền? | Bảy màn tự dựng khung và đặt `khoi`; ba màn còn lại (Mẫu, Từ điển, AI) để khuôn bọc. Khung bọc không có lề vì nó dành cho dòng `SettingField` tự có lề (`muc-cai-dat.tsx:26`, `khung.tsx:46`). AI dùng dòng ấy nên đẹp; bảng và tab của Mẫu, Từ điển thì dính viền |
| Màn tự dựng thay vì dùng khối | `Table` trần ở Mẫu nhập, Mẫu bảng hàng, Từ điển (`vung-mau-nhap.tsx:80`, `vung-mau-bang.tsx:91`, `vung-tu-dien.tsx:40`); luật `reui` giao bảng cho `data-grid`, kho có sẵn cách dùng bảng nhỏ trong khối `list-11`. Ô xem trước bài là `<pre rounded-md bg-muted>` (`vung-mau-bai.tsx:80`). `<label>` trần ở `bang-thue-phi.tsx:129`, `vung-mau-bang.tsx:153`. Lint không cấm các dạng này |
| Toast | `Toaster` gọi thẳng thư viện (`luat-chia-lead.tsx:236`, `bang-thue-phi.tsx:165`), không qua `components/ui/sonner` đã cài, nên không theo nền tối. Bốn chỗ ngoài khu cũng vậy |
| Sổ đã cũ | `design/patterns/cai-dat-san.md:3,15` kê bảy mục, thiếu Từ điển, AI, Trang môi giới, và ghi còn mục chưa dựng; `vo-va-ia.md` dòng «Chỗ hở» Luật chia lead nói ghép nhưng màn đã dùng `settings-3`; Mẫu, AI, Trang môi giới chưa có khối đích; `placeholder.tsx:20–22` còn các mục đã dựng |

## Lỗi xếp theo tác động

| # | Lỗi | Màn | Mức | Căn cứ | Tệp |
| --- | --- | --- | --- | --- | --- |
| L1 | Sau một lần «Gỡ và chuyển», gỡ nhãn thứ hai rồi bấm **«Giữ nhãn» thì nhãn vẫn biến mất**, nút Lưu khoá không nói vì sao. Chỉ tải lại trang mới gỡ được, mất mọi chỗ đang sửa. Bấm «Giữ nhãn» ngay lần đầu thì đúng | Trạng thái | cao | Đã tái hiện; [ảnh](kiem-cai-dat/1-trang-thai-giu-nhan-van-mat.png) | `statuses/trang-thai.tsx:59,166,195`: cờ xác nhận bật lên mà không bao giờ được hạ |
| L2 | **Xoá một cột mẫu nhập hỏng không báo gì**: hộp đóng, dòng vẫn còn, người dùng tưởng đã xoá | Mẫu nhập | cao | Chặn lời gọi xoá rồi bấm: không có báo, 5 dòng vẫn còn | `vung-mau-nhap.tsx:73` |
| L3 | **Hai nút Lưu trên một màn.** Lưu ở khung dưới không lưu nhãn: bấm thử, màn báo «Đã lưu» trong khi nhãn vừa thêm vẫn «Chưa lưu» | Trạng thái | cao | Đã tái hiện; [ảnh](kiem-cai-dat/2-trang-thai-hai-nut-luu.png) | `statuses/page.tsx:31–40` |
| L4 | **Rời trang lúc chưa lưu không hỏi**, phần đang gõ mất. Nhập Excel thì có hỏi | Mọi màn có form | cao | Gõ ở Cách gọi, bấm sang Trường riêng, quay lại: chữ mất, không có hộp hỏi | toàn khu; mẫu ở `imports/new/man-nhap.tsx:116` |
| L5 | Quản trị sàn trên điện thoại **chỉ tới được Người dùng**; chín mục còn lại không có đường vào, dù có tab «Cài đặt sàn» | 375 | trung bình | Trên màn chỉ có 3 liên kết; [ảnh](kiem-cai-dat/9-dien-thoai-chi-nguoi-dung.png). Tham chiếu §10 ghi Cài đặt sàn là «Quản trị · máy tính», nên đây là hệ quả của điều đã chốt | `second-column.tsx`, `mobile-shell.tsx` |
| L6 | Bấm mục khác, màn đứng yên cho tới khi máy chủ trả, không có chờ tải | Mọi màn | trung bình | [Ảnh](kiem-cai-dat/8-doi-muc-khong-phan-hoi.png) | thiếu `settings/loading.tsx` |
| L7 | Nội dung dính viền khung, lệch 16 px so với các màn khác | Mẫu, Từ điển | trung bình | [Mẫu bài](kiem-cai-dat/4-mau-bai-sat-vien.png) · [Từ điển](kiem-cai-dat/5-tu-dien-1440.png) | `muc-cai-dat.tsx:26`, `khung.tsx:46` |
| L8 | Ở 375, bảng Mẫu nhập rộng 609 px trong khung 333 px: **nút Sửa, Xoá nằm ngoài màn**, phải cuộn ngang mới thấy. Một tiêu đề cột dài (kho nhận tới 200 ký tự) đẩy bảng tới 1.633 px | Mẫu nhập | trung bình | [Ảnh](kiem-cai-dat/6-mau-nhap-375.png) | `vung-mau-nhap.tsx:80` |
| L9 | Toast trắng trên nền tối, che nút «Hoàn lại» | Luật chia lead, Thuế phí | trung bình | [Ảnh](kiem-cai-dat/3-toast-trang-phu-nut.png) | `luat-chia-lead.tsx:236`, `bang-thue-phi.tsx:165` |
| L10 | Năm kiểu báo lưu xong (bảng ở mục «Đồng nhất») | Toàn khu | trung bình | Bấm thử từng màn | — |
| L11 | Lưu không khoá khi chưa đổi; bấm vẫn báo «Đã lưu» | Cách gọi, Trường riêng, Trạng thái, Trang môi giới | trung bình | Đã bấm ở Cách gọi | `labels/cach-goi-thuan.ts:59` |
| L12 | Nút Lưu ở cuối, không dính đáy: sửa dòng đầu phải cuộn 1.860 px (375: 2.849 px) | Cách gọi; Trạng thái 1.035 px | trung bình | Đo vị trí nút | `muc-cai-dat.tsx` |
| L13 | Ô tỉ lệ môi giới không có nhãn cho máy đọc màn (axe mức nghiêm trọng): nhãn của dòng trỏ vào công tắc | Thuế phí | trung bình | axe, cả hai khổ | `bang-thue-phi.tsx:127,134` |
| L14 | Số không có đơn vị: «Hạn nhận lead 16», «Hạn gọi lần đầu 30» (phút), «Môi giới 1» (%). Sổ điểm đã có đơn vị | Luật chia lead, Thuế phí | trung bình | Ảnh L9 | `luat-chia-lead.tsx:155`; đơn vị ở `packages/core/src/config/so.ts:54` |
| L15 | Đọc thành viên hay vùng hỏng thì vỡ ra màn lỗi chung, không có khối lỗi của màn | Người dùng | trung bình | Đọc mã, chưa chạy | `users/page.tsx:27–33` |
| L16 | Tiêu đề lặp: AI ba lần ([ảnh](kiem-cai-dat/7-ai-tieu-de-ba-lan.png)); Thuế phí, Luật chia lead, Mẫu, Từ điển hai lần. Người dùng: «Chỉ áp cho sàn X · Người của sàn X». Thuế phí ghi tỉ lệ hai lần một dòng | Nhiều màn | thấp | Ảnh | `khung.tsx:46`, `users/page.tsx:26` |
| L17 | Địa chỉ mục không tồn tại hiện [«Màn này đang dựng»](kiem-cai-dat/10-dia-chi-la.png) thay vì không tìm thấy; vai khác lại nhận «chỉ quản trị sàn mở được» | `/settings/<lạ>` | thấp | Đã mở | `[section]/page.tsx:30` |
| L18 | Trạng thái, Từ điển, Trang môi giới dùng chung một biểu tượng | Cột thứ hai | thấp | Ảnh | `second-column.tsx:99–111` |
| L19 | Sàn trống: Từ điển hiện bảng năm cột toàn số 0 phía trên câu «chưa có» | Từ điển | thấp | [Ảnh](kiem-cai-dat/11-tu-dien-san-trong.png) | `vung-tu-dien.tsx:40` |
| L20 | Tab của màn Mẫu không ghi vào địa chỉ, tải lại về tab đầu | Mẫu | thấp | Đọc mã | `templates/page.tsx` |
| L21 | Chữ: mục tên «Luật chia lead» trong khi `CONTEXT.md` ghi tránh «Luật chia»; khung Cách gọi tên «Tên của sàn» đọc như tên công ty; nút đóng hộp đọc là «Close» cho máy đọc màn; tên nhóm thành «Sàn [Tên]» nên sàn có chữ «Sàn» trong tên bị lặp | Nhiều màn | thấp | Ảnh, đọc mã | `cai-dat.ts:15,28`, `labels/cach-goi.tsx:110`, `ui/dialog.tsx:75` |
| L22 | Thứ bậc tiêu đề nhảy cóc; đầu cột hành động trống | Luật chia lead; Mẫu, Từ điển | thấp | axe | `luat-chia-lead.tsx:208` |

**Đã kiểm, không có lỗi:** Telesales, Đầu chủ, Đầu khách, Trưởng nhóm mở mục sàn đều về Cá nhân kèm câu báo; người giữ đủ năm vai thấy đủ mười mục; đọc danh sách
thành viên bằng vai khác bị máy chủ chặn; đi phím Tab đúng thứ tự, có viền tiêu điểm cả ở ô số; trùng nghĩa ở Trường riêng khoá Lưu và trỏ sang
Cách gọi; tắt hết ba khoản ở Thuế phí khoá Lưu kèm câu lỗi.

Ngoài phạm vi, ghi lại: `/favicon.ico` trả 404 ở lần mở đầu; toast trắng trên nền tối cũng có ở hồ sơ căn, ảnh căn, sửa trên ô và menu
tài khoản.

## Hàng việc đề xuất

Máy chỉ đề xuất, chưa ghi `lo-trinh.json`. Bốn PR đang mở lúc kiểm (#192, #211, #215, #216) không chạm vùng này.

| Đề xuất | Vai | Câu giao | `bat_khi` đề xuất | Hạng | Vùng |
| --- | --- | --- | --- | --- | --- |
| **A** `va-cai-dat-mat-viec` | Quản trị sàn | Bấm «Giữ nhãn» luôn giữ nhãn ở mọi lần gỡ; xoá hay sửa một cột mẫu nhập hỏng thì màn nói rõ và dòng giữ nguyên; bảng Mẫu nhập trên điện thoại thấy được Sửa, Xoá không phải cuộn ngang; ô tỉ lệ môi giới có nhãn cho máy đọc màn | Gỡ hai nhãn đang dùng, chuyển nhãn đầu, «Giữ nhãn» nhãn sau: nhãn sau còn và Lưu bấm được; chặn lời gọi xoá: có báo lỗi, hộp không tự đóng; ở 375 bảng không tràn khung; axe không còn lỗi `label` | T2 | `settings/statuses/**`, `settings/templates/vung-mau-nhap.tsx`, `settings/fees/**` |
| **B** `cai-dat-mot-cach-luu` | Quản trị sàn | Mọi mục cài đặt có form lưu theo một cách của Luật chia lead: Lưu khoá khi chưa đổi, có Hoàn lại, thanh Lưu dính đáy vùng làm việc, một kiểu báo đã lưu theo đúng nền sáng tối; mỗi màn một nút Lưu; rời trang lúc chưa lưu thì hỏi; số có đơn vị | Bảy màn form cùng hành vi trong một bài kiểm chung; Trạng thái còn một khung và một Lưu; bấm mục khác lúc đang sửa hiện hộp hỏi; nút Lưu luôn trong khung nhìn ở 1440 và 375; lưới khuôn đỏ khi một mục có hơn một khung ở tệp thân | T2 | `settings/**`, `components/khoi/settings-3/**`, `design/patterns/cai-dat-san.md`, `packages/ui-lint/**` |
| **C** `cai-dat-tai-nhanh` | Quản trị sàn | Mở một mục chỉ đọc phiên một lần và đọc dữ liệu song song; màn AI có dữ liệu ngay từ máy chủ; cột mục lục không tải trước cả 11 mục; đổi mục hiện ngay khung chờ dạng form | Mỗi màn: số câu SQL giảm ít nhất một phần ba so với bảng ở tài liệu này; không còn lượt tải trước khi chưa trỏ chuột vào mục; giữ lời gọi máy chủ 1 s thì khung chờ `nhan-o` hiện trong 100 ms; số đo đúng trên bản thật | T2 | `apps/web/src/lib/api.ts`, `settings/**`, `components/shell/second-column.tsx` |
| **D** `cai-dat-bang-dung-khung` | Quản trị sàn | Mẫu và Từ điển đi đúng khung: có lề như các mục khác, bảng dùng khối của kho, tiêu đề không lặp, trống có một hành động; lỗi tải mọi màn có «Thử lại»; sửa sổ khuôn và khối đích cho đúng mười mục; đặt tên mục theo `CONTEXT.md` | Ảnh Mẫu và Từ điển thẳng lề với Cách gọi ở 1440 và 375; không còn `Table` trần trong khu hoặc có dòng «Chỗ hở»; mỗi tiêu đề xuất hiện một lần; bản đồ khuôn kê đủ mười mục | T2 | `settings/templates/**`, `settings/dictionary/**`, `settings/khung.tsx`, `design/patterns/cai-dat-san.md`, `docs/design/vo-va-ia.md` |
| **E** `cai-dat-dien-thoai` | Quản trị sàn | Quản trị sàn trên điện thoại mở tab Cài đặt sàn thấy danh sách mười mục và vào được từng mục | Từ tab, chạm mục nào cũng tới đúng màn và quay lại được; không tràn ngang ở 375 | T2 | `components/shell/mobile-shell.tsx`, `settings/**` |

## Khuyến nghị

**Làm A trước.** Đây là chỗ duy nhất người dùng làm đúng mà màn xử sai, chạm ít tệp, khoảng nửa ngày máy, không phụ thuộc hàng nào.
Sau đó B, vì nó gỡ nhiều lệch nhất và là điều kiện để D không phải sửa lại. C độc lập, có thể chạy song song với B; nên đo lại trên
bản thật khi nghiệm thu vì số ở đây là giả lập. E chỉ nên mở nếu quản trị sàn thật sự cần sửa cấu hình trên điện thoại, vì Tham chiếu §10 đang
ghi Cài đặt sàn dùng trên máy tính.
