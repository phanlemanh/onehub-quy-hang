# Kiến trúc thông tin của Quỹ hàng

> **Lưu vết, không sửa.** Bản chép ngày 29/10/2026 từ tab «Kiến trúc thông tin» của [tài liệu thiết kế](https://claude.ai/artifact/B12d9FDirVB9vEA8gSChLe). Điều đang đúng nằm ở [Tham chiếu](../tham-chieu.md); khi hai nơi nói khác nhau, Tham chiếu thắng.

*Đề xuất 29/10; chỗ đứng ở §2 đã chốt cùng ngày, các mục còn lại chưa chốt.* Rà soát lại ba tab trước (Ghi nhớ, Desktop app, Đầu chủ và telesales) và các màn đã phác, gỡ các chỗ lệch, rồi dựng một khung chung: đối tượng, trạng thái, quyền, điều hướng, màn và đường dẫn. Khi tab này và các tab trước nói khác nhau về cấu trúc, tab này là bản mới.

*Từ 29/10, khung chung của tab này đã gom vào Tham chiếu; tab này giữ lại phần rà soát và lịch sử chỉnh.*

## 1. Rà soát: chỗ lệch và chỗ hổng

| # | Chỗ lệch / hổng | Ở đâu | Gỡ thế nào (mục) |
| --- | --- | --- | --- |
| 1 | **Ba bộ vai khác nhau.** Ghi nhớ: môi giới cá nhân / chủ sàn / người mới. Desktop: người quản lý khu / chủ sàn / môi giới văn phòng. Đầu chủ: telesales / đầu chủ / trưởng nhóm / đầu khách | cả ba tab | Một bộ năm vai; «người mới» là một đầu khách, không phải vai; môi giới một mình là sàn một người giữ cả năm vai (§3) |
| 2 | **Bốn bộ trạng thái.** «còn / đã cọc / đã bán»; «Còn hàng / Đã cọc / Đã bán / Tạm ngừng bán»; «Đang giao dịch» ở màn Nhập Excel; «Lead mới → Đang khai thác → Sẵn sàng bán» | cả ba tab, N1 | Một vòng đời sáu trạng thái chuẩn, nhãn của sàn nằm trên (§4) |
| 3 | **«Đã bán» gộp hai việc khác nhau.** Sàn mình bán (có giá chốt — nguồn giá giao dịch thật) và chủ đã bán nơi khác (không có giá). Gộp lại là làm bẩn số liệu giá | K4, KD2 «Đã bán nơi khác» | Tách: «Đã bán» chỉ khi sàn mình bán; «Ngừng — chủ đã bán nơi khác» là lý do ngừng (§4) |
| 4 | **Hai thang mức hiển thị trộn hai câu hỏi.** «chỉ tôi / đội / lên Platform / công khai» và «Chỉ tôi → Nhóm → Toàn sàn → Ra ngoài» đều gộp «ai trong sàn thấy» với «căn đi ra ngoài bằng cửa nào» | Ghi nhớ, Đầu chủ | Tách hai trục, cộng một lớp quyền theo trường (§5) |
| 5 | **Thẻ thị trường** là lõi ★ ở Ghi nhớ, «Sau» ở bảng tính năng Desktop, rồi «Bản đầu» ở tab Đầu chủ | Desktop · Nhóm tính năng | Theo tab Đầu chủ: bản đầu, mức nhẹ (giá căn cùng loại trong toà) |
| 6 | **Nhận căn** (hệ thống đã thu tin của đội, chỉ việc xác nhận) là lõi ★ ở Ghi nhớ nhưng «Sau» ở Desktop | Ghi nhớ, Desktop | Giữ «Sau»: với sàn có telesales, dòng vào chính là lead; Nhận căn hợp với môi giới lẻ hơn. Cùng một cửa «Vào quỹ hàng» (§6) |
| 7 | **Đầu khách gần như chưa được thiết kế.** Có «Liên hệ đầu chủ» nhưng không có việc hay gặp nhất giữa hai người: **xin dẫn khách đi xem** (hẹn giờ, chìa khoá, báo người thuê) | Đầu chủ, Desktop | Thêm đối tượng **Lịch xem** và hàng đợi «Xin dẫn xem» ở Hôm nay của đầu chủ (§2, §6) |
| 8 | **Trang khách chỉ có bản xem trước**, chưa có chỗ đứng trong kiến trúc: nằm ở đâu, ai sở hữu, khác trang căn trên Platform ra sao | G2 | Một bề mặt riêng: công khai qua link, không đăng nhập (§2) |
| 9 | **Không có trang chi tiết cho từng căn** (Desktop) nhưng màn cuộc gọi KD1/KD2 là một màn toàn trang về một căn | Desktop, KD1 | Giữ luật; cuộc gọi là một **chế độ toàn màn của hồ sơ căn**, rời ra là về đúng chỗ cũ (§7) |
| 10 | **Quỹ hàng thuộc cổng nào?** Luật của kho chỉ có hai cổng (Invest công khai, Ops nội bộ). Quỹ hàng là khách hàng thứ ba — nhiều sàn, tài khoản trên máy chủ, có hợp đồng điều khoản — và Ghi nhớ đã đặt nó ở phía cung của Platform | Ghi nhớ, luật cổng | Quỹ hàng là **ứng dụng riêng**, đọc dữ liệu từ Invest; không phải cổng thứ ba trong OneHub Invest (§2) |
| 11 | **Thấp tầng chưa có màn nào.** Mọi phác thảo là căn hộ; bản đồ phân lô mới nằm trong chữ | Ghi nhớ, Desktop | Giữ «Sau», nhưng khung điều hướng chừa sẵn: «Lưới» là «cách xem vị trí», theo loại hình mà là lưới toà hay bản đồ lô (§6) |
| 12 | **Ghi công chưa có chỗ nối.** Bài học Beike là chia công cho người nhập nguồn, giữ chìa, dẫn khách; ta có telesales → đầu chủ → đầu khách nhưng chưa ghi ai làm khâu nào | Ghi nhớ, Đầu chủ | Không làm chia hoa hồng; chỉ bảo đảm mỗi sự kiện ghi đúng người và vai, để sau này tính được (§3) |
| 13 | **Bộ gõ** là chỗ làm việc thứ ba ở Ghi nhớ nhưng biến mất khỏi mọi tab sau | Ghi nhớ | Giữ là bề mặt thứ ba, giai đoạn sau; dùng chung cửa Gửi (§2) |

## 2. Bề mặt và chỗ đứng

**Đã chốt (29/10): Quỹ hàng là một ứng dụng riêng thuộc phía cung của Platform**, đọc dữ liệu từ OneHub Invest một chiều; không phải cổng thứ ba trong OneHub Invest. Lý do: khách hàng khác (nhiều sàn, mỗi sàn một vùng dữ liệu), dữ liệu khác (tài khoản và quỹ hàng trên máy chủ, có hợp đồng), nhịp phát hành khác. Invest giữ đúng vai bộ máy làm giàu và đo giá, hai cổng Invest / Ops giữ nguyên.

| Bề mặt | Ai | Đăng nhập | Việc |
| --- | --- | --- | --- |
| **Bàn làm việc** — desktop (trình duyệt) và mobile | Năm vai trong sàn | Có, theo sàn | Mọi việc hằng ngày: nhận lead, giữ tươi, tìm, gửi, quản lý đội, cài đặt sàn |
| **Trang khách** | Khách mua, môi giới sàn khác | Không — mở bằng link | Xem một căn hoặc một bộ căn; giá và trạng thái sống; thẻ người gửi. Ghi lượt mở cho người gửi |
| **Bộ gõ** (sau) | Đầu khách, đầu chủ | Có | Chèn bài + link vào Zalo, Facebook; cùng luật với cửa Gửi |

Hai hệ thống nối vào, đều một chiều:

- **OneHub Invest → Quỹ hàng** (chỉ đọc): danh mục dự án → toà → trục → căn, số thị trường tổng hợp, tin rao công khai để đối chiếu. Không số AirDNA, không danh mục S08 nguyên văn.
- **Quỹ hàng → Platform**: chỉ căn đầu chủ chọn đăng, đủ mức thông tin, đã bỏ phần nội bộ.

Chia cổng của OneHub Invest là quyết định đã ghi trong tài liệu kiến trúc của kho; đặt Quỹ hàng ra ngoài cần một ADR ghi lại trước khi viết code.

## 3. Vai

| Vai | Việc | Hôm nay của vai này | Không thấy |
| --- | --- | --- | --- |
| **Telesales** | Gọi lọc chủ nhà, nhập lead | Lead mình nhập: đã có người gọi chưa, đã ra hàng chưa | Bảng hàng, căn của người khác |
| **Đầu chủ** («người giữ» ở các tab trước) | Biến lead thành hàng, giữ tươi, ép giá, cho dẫn xem | Lead mới · Cần gọi lại · Nên gọi ép giá · Xin dẫn xem · Thiếu thông tin · Mới đổi | Chủ nhà của đầu chủ khác |
| **Đầu khách** | Tìm căn cho khách, gửi, dẫn xem | Căn mới lên bảng · Căn mình đã gửi vừa đổi · Link khách vừa mở · Lịch xem đã hẹn | Chủ nhà, giá đáy, ảnh sổ |
| **Trưởng nhóm** | Chia lead, xem phễu, xử lý ngoại lệ, bàn giao khi có người nghỉ | Lead quá hạn chưa gọi · Hàng cũ theo người · Ngoại lệ khi lên bảng | — (thấy như đầu chủ, cho cả nhóm) |
| **Quản trị sàn** | Cách gọi riêng, trường riêng, luật chia lead, thuế phí, mẫu, người dùng | — | Không tự động thấy chủ nhà — quyền cấu hình tách khỏi quyền xem nguồn |

Một người giữ được nhiều vai (đầu chủ kiêm đầu khách là thường); môi giới một mình là sàn một người. Mỗi sự kiện ghi người **và vai lúc làm** — đó là chỗ nối sẵn cho ghi công về sau.

## 4. Đối tượng và trạng thái

| Đối tượng | Là gì | Thuộc ai | Ghi chú |
| --- | --- | --- | --- |
| **Dự án → Toà / Phân khu → Trục / Dãy → Căn** | Danh mục vật thể, thuộc tính tự điền từ mã | Dùng chung mọi sàn | Khoá; sai thì «báo sai thông tin căn» |
| **Hàng** | Lần chào bán của sàn trên một căn: trạng thái, giá + điều kiện phí, nội thất, pháp lý, tài chính, người giữ, mức chia | Sàn | Lead là hàng ở nấc đầu, có thể mới biết toà chưa biết căn. **Mỗi sàn tối đa một hàng đang mở trên một căn** — đây là gốc của kiểm trùng |
| **Chủ nhà** | Tên, số, các căn của người đó, giá đáy từng nói | Đầu chủ giữ + trưởng nhóm | Một chủ nhiều căn → một đầu chủ |
| **Sự kiện** | Nhập lead, gọi, xác nhận, đổi giá, đổi trạng thái, nhập file, gửi, mở số chủ | Sàn | Chỉ thêm, không sửa. Độ tươi, mức đủ, lịch sử trả giá đều tính từ đây |
| **Ảnh** | Ba ngăn: gửi được / tự có từ mã / nội bộ | Thuộc căn trong sàn; lần rao chọn ảnh |  |
| **Lịch xem** *(mới)* | Đầu khách xin dẫn khách xem một căn; đầu chủ nhận, hẹn giờ với chủ / người thuê | Sàn | Không lộ số chủ cho đầu khách |
| **Lần gửi** | Một link (một căn hoặc bộ căn), gửi cho ai, lượt mở | Người gửi | Chỗ để ghi công |
| **Góc nhìn** | Bộ lọc + cột + cách xem đã lưu | Người hoặc cả đội | Thay các tab của Sheet |
| **Tin rao ngoài** | Tin công khai Invest thu được, khớp với căn | Chỉ đọc, chỉ đầu chủ thấy | Đối chiếu, không phát ra |
| **Cấu hình sàn** | Cách gọi riêng, trường riêng, trạng thái riêng, luật chia lead, thuế phí, mẫu file nhập, mẫu bài, mẫu bảng hàng | Sàn | Ba lớp đã chốt 28/10 |

Các đối tượng này khớp sẵn với các nhóm dữ liệu của RESO: tin, người dùng và văn phòng, nhóm, liên hệ, ảnh, lịch xem nhà, lượt xem trên mạng, lịch sử thay đổi — nên không phải tự đặt khung.

**Vòng đời của hàng: sáu trạng thái chuẩn, nhãn của sàn nằm trên.**

| Trạng thái chuẩn | Nhãn mặc định của sàn | Vào khi | Hiện ở bảng hàng chung |
| --- | --- | --- | --- |
| Chưa đủ để rao | Lead mới · Đang khai thác | Telesales nhập, hoặc đầu chủ tự nhập | Không |
| Đang bán | Còn hàng | Bấm «Sẵn sàng bán» và qua điều kiện máy kiểm | Có |
| Đang giao dịch | Đã cọc · Giữ chỗ *(riêng sàn)* | Có cọc hoặc giữ chỗ | Có, không gửi mới được |
| Đã bán | Đã bán | **Sàn mình** chốt; bắt buộc giá chốt | Không; vào lịch sử |
| Tạm ngừng | Tạm ngừng bán | Chủ tạm dừng, đang sửa nhà… | Không |
| Ngừng hẳn | Ngừng — chủ đã bán nơi khác · Ngừng — chủ đổi ý · Không liên lạc được | Kết quả gọi; bắt buộc lý do | Không |

Tên tiếng Anh của từng trạng thái chuẩn tra lại bản từ điển RESO đang dùng trong kho trước khi chốt.

## 5. Quyền: hai trục và một lớp

- **Trục 1 — Ai trong sàn thấy hàng:** Chỉ tôi → Nhóm → Toàn sàn. Lead và hàng chưa khoá nguồn mặc định «Chỉ tôi»; «Sẵn sàng bán» đưa lên «Toàn sàn».
- **Trục 2 — Hàng đi ra ngoài bằng cửa nào:** không ra · gửi tay (link, ảnh + tin, bảng hàng) · đăng Platform. Mọi cửa áp cùng luật ẩn: gửi khách riêng ẩn mã căn, gửi nhóm môi giới hiện mã.
- **Lớp trường — phủ lên cả hai trục:** chủ nhà, số điện thoại, giá đáy, ảnh sổ chỉ đầu chủ giữ căn và trưởng nhóm thấy; **không bao giờ** ra ngoài sàn dù căn ở mức nào. Mỗi lần mở số chủ là một sự kiện.

Quyền là lớp phủ trên cùng một màn, không phải màn riêng: đầu khách mở đúng hồ sơ căn đó, phần chủ nhà thay bằng nút «Xin dẫn xem» và «Liên hệ đầu chủ».

## 6. Điều hướng

**Desktop — cột trái, hiện theo vai:**

1. **Hôm nay** — nơi duy nhất máy đẩy việc đến; mỗi hàng đợi trả lời một câu «giờ gọi ai / làm gì». Mỗi căn chỉ nằm ở một hàng đợi (ép giá thắng gọi lại).
2. **Bảng hàng** — bảng kiểu Sheet, bật «Vị trí» (lưới toà với căn hộ, bản đồ lô với thấp tầng). Góc nhìn đã lưu nằm ngay dưới, kể cả góc nhìn có sẵn «Hàng của tôi», «Lead · đang khai thác», «Thiếu thông tin». Cùng tên với tab trên mobile và với chữ người dùng hay nói («bảng hàng chung»); «Quỹ hàng» là tên ứng dụng.
3. **Đã gửi** — link đã gửi, lượt mở, căn trong đó vừa đổi; lịch xem đã hẹn.
4. **Đội** *(trưởng nhóm)* — người, khu phụ trách, phễu lead → hàng, bàn giao. Chỉ quan sát và phân việc.
5. **Cài đặt sàn** *(quản trị sàn)* — mọi cấu hình. Chỉ ghi cấu hình, không xem nguồn.

Thanh trên cùng: chọn dự án (hoặc tất cả) · ô «Gõ mã căn» nhảy thẳng vào hồ sơ · ba cửa vào / ra: **+ Lead**, **Nhập Excel**, **Phát hàng**. Telesales chỉ thấy Hôm nay và + Lead.

**Mobile — bốn tab:** Hôm nay · Bảng hàng · Gửi · Tôi. Đội và Cài đặt sàn không có trên mobile; Nhập Excel và Phát hàng cũng ở lại desktop. Đường vào trên mobile là nhận ảnh từ Zalo qua nút Chia sẻ.

**Ba cửa vào quỹ hàng, một đích:** lead (telesales hoặc tự nhập) · nhập Excel · nhận căn từ tin đã thu *(sau)*. Cả ba đều đi qua cùng một bước kiểm trùng theo căn và theo chủ nhà.

**Ba cửa ra:** Gửi (link, ảnh + tin) · Phát hàng (bảng hàng ảnh / PDF / Excel) · Đăng Platform *(sau)*. Cùng luật ẩn, cùng ghi công.

## 7. Màn: đã phác và còn thiếu

| Nhà | Màn | Phác thảo | Giai đoạn |
| --- | --- | --- | --- |
| Hôm nay | Hàng đợi theo vai (desktop, mobile) | 1, M1 — đã có bản của đầu chủ; chưa có bản đầu khách, telesales, trưởng nhóm | Bản đầu |
| Bảng hàng | Bảng kiểu Sheet, sửa trên ô | 2, 2b, M4 | Bản đầu |
| Bảng hàng | Vị trí: lưới toà | 3 | Sau |
| Bảng hàng | Vị trí: bản đồ lô thấp tầng | **chưa có** | Sau |
| Hồ sơ căn | Cột hồ sơ (desktop), màn hồ sơ (mobile), ảnh | 2, M3, M5 | Bản đầu |
| Hồ sơ căn | Chế độ cuộc gọi: khai thác, ép giá | KD1, KD2, K1–K4 | Bản đầu |
| Hồ sơ căn | Đổi giá / trạng thái nhanh | M2 | Bản đầu |
| Cửa vào | **Ô nhận lead** cho telesales | L1–L5 | Bản đầu |
| Cửa vào | Nhập Excel: ghép cột, xem trước | N1, N2 | Bản đầu |
| Cửa ra | Gửi: chọn → xem trước → chia sẻ → theo dõi | G1–G4 | Bản đầu |
| Cửa ra | Phát hàng | D | Bản đầu |
| Cửa ra | **Trang khách** (bản thật, không phải xem trước) | T1–T4 (xem trước ở G2) | Bản đầu |
| Đã gửi | Danh sách link, lượt mở | G4 (mobile); desktop mới có mục ở cột trái | Bản đầu |
| Đã gửi | **Xin dẫn xem / lịch xem** giữa đầu khách và đầu chủ | mới có ô «Xin dẫn xem» ở Hôm nay (1); chưa có luồng của đầu khách | Bản đầu — cần hỏi lại |
| Đội | Phễu, hàng theo người, bàn giao | **chưa có** | Sau |
| Cài đặt sàn | **Cách gọi riêng, trạng thái riêng, luật chia lead, thuế phí** | S1–S4 | Bản đầu |

Mã phác thảo theo tên bảng trên [Phác thảo UX quỹ hàng](https://claude.ai/artifact/VESE23ChnX6oSC3X73Bzwf).

## 8. Đường dẫn

Theo cùng quy ước với kho OneHub: tiếng Anh, chữ thường nối gạch, danh từ số nhiều cho danh sách.

| Đường dẫn | Màn |
| --- | --- |
| `/today` | Hôm nay |
| `/inventory` · `?view=list` / `?view=position` | Quỹ hàng: bảng / vị trí |
| `/inventory/views/<id>` | Góc nhìn đã lưu |
| `/inventory?unit=<mã>` | Bảng với cột hồ sơ căn đang mở (desktop) |
| `/units/<mã>` | Hồ sơ căn toàn màn (mobile, link chia sẻ nội bộ) |
| `/units/<mã>/call` | Chế độ cuộc gọi |
| `/leads/new` | Ô nhận lead |
| `/imports/new` · `/imports/<id>` | Nhập Excel |
| `/shares` · `/shares/new` | Đã gửi · luồng Gửi |
| `/viewings` | Lịch xem |
| `/exports/new` | Phát hàng |
| `/team` | Đội |
| `/settings/labels` · `/fields` · `/statuses` · `/lead-routing` · `/fees` · `/templates` | Cài đặt sàn |
| `/s/<mã link>` | Trang khách — công khai, không đăng nhập |

## 9. Luật phân trang

1. **Mỗi nhà trả lời một câu.** Hôm nay: *giờ làm gì?* · Bảng hàng: *có hàng gì, ở đâu?* · Đã gửi: *khách đang phản ứng ra sao?* · Đội: *đội đang chạy thế nào?* · Cài đặt sàn: *sàn gọi tên và chạy theo luật nào?*
2. **Chỉ Hôm nay được đẩy việc.** Các nhà khác chỉ để người kéo; thông báo điện thoại chỉ mở vào đúng một mục của Hôm nay.
3. **Một căn một hồ sơ.** Cuộc gọi, ảnh, đổi giá, lịch xem đều là phần hay chế độ của hồ sơ — không có trang thứ hai về cùng một căn.
4. **Bộ lọc đi theo người.** Đổi bảng ↔ vị trí, sang Gửi hay Phát hàng thì giữ nguyên bộ lọc và căn đang chọn.
5. **Quan sát ở Đội, cấu hình ở Cài đặt sàn.** Giống luật tách «quan sát / quản trị» của cổng vận hành.
6. **Mọi cửa ra dùng chung một bộ luật ẩn** — thêm cửa mới (bộ gõ, Platform) là nối vào bộ luật đó, không viết luật riêng.
7. **Một bộ kết quả gọi ở mọi màn:** Còn / giữ giá · Đổi (hạ) giá · Đã cọc / bán… · Không nghe máy. «Đã cọc / bán…» hỏi tiếp: cọc, sàn mình bán (giá chốt) hay chủ bán nơi khác (Ngừng).
8. **Chữ trên màn dùng «đầu chủ»**, không dùng «người giữ».

## 10. Đề xuất tiếp

- **Đã chốt (29/10):** Quỹ hàng là ứng dụng riêng của phía Platform, đọc dữ liệu từ Invest một chiều (§2). Còn phải làm: một ADR trong kho OneHub Invest ghi quyết định này và đường đọc một chiều (danh mục căn, số thị trường tổng hợp, tin rao công khai — không số AirDNA, không S08 nguyên văn), trước khi viết code.
- **Phác tiếp theo thứ tự:** ~~Ô nhận lead~~ (đã phác, §12) → ~~Cài đặt sàn · cách gọi riêng~~ (đã phác, §13) → ~~Trang khách bản thật~~ (đã phác, §14) → Xin dẫn xem (sau khi hỏi lại).
- **Hỏi thêm ở buổi phỏng vấn sau:** đầu khách xin dẫn xem như thế nào hôm nay, mất bao lâu, ai cầm chìa khoá.

## 11. Đã chỉnh các màn theo IA (29/10)

Đã chỉnh trên [Phác thảo UX quỹ hàng](https://claude.ai/artifact/VESE23ChnX6oSC3X73Bzwf), bản 14. Các phương án ban đầu A, B, C giữ nguyên để lưu vết.

| Chỗ lệch | Màn | Đã chỉnh |
| --- | --- | --- |
| Cột trái chỉ có Hôm nay và góc nhìn | 1, 2, 2b, 3 | Ba nhà của đầu chủ: Hôm nay · Bảng hàng (góc nhìn nằm dưới) · Đã gửi; thêm góc nhìn «Hàng của tôi», «Lead · đang khai thác»; bỏ «Cần gọi lại» khỏi góc nhìn vì đó là hàng đợi của Hôm nay |
| Thanh trên thiếu cửa vào lead | 1, 2, 2b, 3 | Thêm «+ Lead» cạnh Nhập Excel và Phát hàng |
| Hôm nay chưa theo hàng đợi của đầu chủ | 1, M1 | Bốn ô: Lead mới 1 · Cần gọi lại 2 · Nên gọi ép giá 1 · Xin dẫn xem 1 (tổng 5, khớp số trên cột trái). Thêm thẻ lead A.2105, hàng đợi ép giá A.1508, ô Xin dẫn xem |
| Hàng đợi của Linh hiện căn của Minh, kèm số chủ — trái lớp quyền theo trường | 1, M1 | Chỉ còn căn của Linh; A.0807 giao cho Linh để khớp luồng Gửi đã phác |
| Một căn nằm hai hàng đợi | 1, M1 | A.1508 chỉ ở «Nên gọi ép giá» |
| Trạng thái thiếu «Ngừng», «Đã bán» không hỏi giá chốt | 2b | Năm lựa chọn: Còn hàng · Đã cọc · Đã bán… · Tạm ngừng bán · Ngừng…; «Đã bán» hỏi giá chốt, «Ngừng» hỏi lý do |
| Kết quả gọi mỗi màn một kiểu («Đã bán nơi khác») | K4, KD2, 1, M1 | Một bộ bốn nút, «Đã cọc / bán…» hỏi tiếp |
| Hồ sơ không mở được chế độ cuộc gọi | 2, 3 | Nút chính của hồ sơ là «Gọi chủ nhà» |
| Nội thất, pháp lý nằm trong «thuộc tính căn · tự điền từ mã» — trái luật tách căn và lần rao | M3 | Tách thành mục «Hàng đang rao» |
| Thiếu thông tin của A.1508 lệch với màn cuộc gọi | 1 | Còn thiếu: ảnh thật, lịch xem nhà (khớp KD2) |
| «Người giữ» trên màn | 2, 3, G2, M5, N1, D | Đổi thành «đầu chủ» |

**Chưa chỉnh, để lượt sau:** Hôm nay của đầu khách và trưởng nhóm chưa có; Đã gửi trên desktop mới là một mục ở cột trái, chưa có màn. Các màn ở bảng trên chưa xem trực tiếp trên canvas sau khi chỉnh.

## 12. Ô nhận lead (29/10)

Phác thảo: hàng «Telesales · Ô nhận lead» trên cùng của [Phác thảo UX quỹ hàng](https://claude.ai/artifact/VESE23ChnX6oSC3X73Bzwf), màn L1–L5. Đã xem trực tiếp trên canvas, bản 16. *Đề xuất, chưa chốt.*

**Việc của màn:** telesales vừa gác máy với chủ nhà, ghi lại trong dưới một phút, và lead đến đúng đầu chủ ngay — không ai phải chia tay trên file.

**Năm mục bắt buộc** — thiếu thì chưa gửi được, màn chỉ đúng chỗ thiếu:

- Số chủ nhà — sai định dạng thì chặn ngay.
- Căn hoặc toà — gõ mã thì tự điền loại, diện tích, hướng, tầng; mới biết toà vẫn gửi được.
- Nhu cầu — bán hay cho thuê.
- Giá chủ muốn kèm điều kiện phí — máy nói lại «Hiểu là…» như luật sửa giá.
- Thời gian muốn ra hàng.

**Biết thì chạm, không bắt buộc:** tình trạng sử dụng, giờ gọi được, cách xưng hô, ghi chú. Các mục này điền sẵn vào danh sách hỏi của đầu chủ, nên cuộc gọi đầu tiên không hỏi lại điều telesales đã biết.

**Kiểm trùng ngay lúc nhập, ba kết quả:**

| Tình huống | Máy làm gì | Telesales thấy |
| --- | --- | --- |
| Không trùng | Chia theo toà cho đầu chủ kế tiếp trong lượt | Tên đầu chủ sẽ nhận và hạn nhận 15 phút |
| Chủ nhà đã có đầu chủ | Lead về đầu chủ đó, không chia theo toà — chủ nhà chỉ làm việc với một người | «Đã có đầu chủ: Minh»; không thấy căn kia |
| Căn đã có hàng đang mở | Không mở lead thứ hai; ghi thành tin bổ sung vào hàng đó. Số khác số đang lưu thì báo đầu chủ kiểm | Ai đang giữ; không thấy giá đang rao hay số chủ cũ |

**Sau khi gửi:** telesales theo dõi bốn nấc Đã gửi → Đã nhận → Đã gọi → Lên bảng, thêm «Trả lại» khi đầu chủ báo số không liên lạc được (kèm «Sửa số và gửi lại»). Từ lúc gửi, số chủ nhà chỉ đầu chủ nhận lead và trưởng nhóm thấy — đúng lớp quyền theo trường ở §5. Telesales thấy kết quả, không thấy hàng.

**Khung theo vai:** telesales không có cột trái, không có ô gõ mã căn — chỉ Hôm nay và «+ Lead». Mobile ba tab: Hôm nay · Lead · Tôi.

**Nối với các màn đã có:** lead A.2105 nhập ở L1 lúc 09:41 chính là thẻ lead Linh nhận ở K1 và KD1 — 2,75 tỷ bao phí, trong 1 tháng, đang cho thuê, «chủ cần tiền, muốn ra nhanh».

**Chỗ cần chốt:**

- [ ] Hạn nhận lead: đang để 15 phút, sàn chỉnh ở Cài đặt sàn · luật chia lead.
- [ ] Telesales có còn thấy số chủ nhà sau khi gửi không. Phác thảo đang ẩn theo §5; telesales cần sửa số thì nhập lại từ ghi chép của mình.
- [ ] Khi trùng căn, cho «Bỏ lead này» hay bắt buộc gửi tin bổ sung.

## 13. Cài đặt sàn (29/10)

Phác thảo: hàng «Desktop · Cài đặt sàn» trên cùng của [Phác thảo UX quỹ hàng](https://claude.ai/artifact/VESE23ChnX6oSC3X73Bzwf), màn S1–S4. Đã xem trực tiếp trên canvas, bản 18. *Đề xuất, chưa chốt.*

Nhà này trả lời một câu: **sàn gọi tên thế nào và chạy theo luật nào.** Chỉ quản trị sàn vào được, chỉ trên desktop. Ở đây chỉ ghi cấu hình — không xem được hàng, chủ nhà hay số điện thoại.

Mục lục chia ba nhóm: *Sàn gọi tên thế nào* (Cách gọi riêng · Trạng thái · Trường riêng) · *Sàn chạy theo luật nào* (Luật chia lead · Thuế phí) · *Mẫu và người* (Mẫu file nhập · Mẫu bảng hàng và bài · Người dùng).

**S1 · Cách gọi riêng.** Ba câu hỏi theo thứ tự nằm trên đầu màn: cùng nghĩa khác tên thì đổi tên; cùng trường khác giá trị thì thêm giá trị riêng neo vào chuẩn; thật sự mới mới thêm trường riêng. Bảng trường chuẩn khoá nghĩa, chỉ mở cột «Sàn gọi là» và giá trị riêng. Ví dụ đang sửa: điều kiện phí, sàn gọi «Phí CN», giá trị «BP» và «N» — đúng chữ đã hiện ở bảng căn cùng loại trong toà. Thêm «Thương lượng» thì máy bắt chọn giá trị chuẩn để neo và khoá nút Áp dụng; vì không neo được, màn gợi ý ghi vào ghi chú của hàng. Cuối màn cho thấy cùng một căn hiện thế nào ở ba chỗ: bảng hàng của sàn, đội khác, trang khách.

**S2 · Trạng thái.** Sáu trạng thái chuẩn cố định, mỗi trạng thái mang luật đi kèm (khoá) và nhãn của sàn. Ví dụ: thêm «Giữ chỗ» — do lần Nhập Excel đề nghị — bắt buộc chọn thuộc «Đang giao dịch» và tự nhận luật, màu của trạng thái đó. Sàn không thêm trạng thái chuẩn thứ bảy, không đổi luật, không tự chọn màu.

**S3 · Luật chia lead.** Hai luật máy luôn làm trước (khoá): chủ nhà đã có đầu chủ thì về người đó; căn đã có hàng mở thì thành tin bổ sung. Còn lại sàn chọn cách chia — theo toà, lần lượt cả nhóm, hoặc trưởng nhóm chia tay — kèm người nhận từng toà, ai nhận lead kế, bỏ qua người nghỉ. Hạn nhận 15 phút. Ngưỡng hai hàng đợi của Hôm nay: cần gọi lại sau 14 ngày chưa xác nhận; nên gọi ép giá sau 10 ngày (chỉnh trong 7–14). Đổi luật chỉ áp cho lead mới.

**S4 · Thuế phí.** Ba tỉ lệ máy tính giá dùng (thuế thu nhập cá nhân 2%, lệ phí trước bạ 0,5%, phí môi giới mặc định 1%) và định nghĩa «bao phí» của sàn — gồm những khoản nào. Máy ghi kèm định nghĩa này vào mỗi giá bao phí, nên sàn khác đọc đúng khi nhận hàng. Ô «Thử với một giá» ra đúng 2,75 → 2,65 tỷ như màn cuộc gọi. Đổi tỉ lệ chỉ áp cho lần tính mới; giá đã lưu giữ nguyên kèm ngày tính.

**Luật chung của nhà này:** mọi thay đổi đi qua «Áp dụng cho cả sàn» và vào nhật ký thay đổi (ai, lúc nào, đổi gì); không thay đổi nào âm thầm sửa số đã lưu.

**Chưa phác:** Mẫu file nhập, Mẫu bảng hàng và bài, Người dùng.

**S5 · Trường riêng — đã chốt (29/10): mức tối thiểu vào bản đầu.** Hai kiểu «có / không» và «chọn một»; chữ, số, ngày để sau. Trường riêng ở lại trong sàn: hiện ở bảng hàng và hồ sơ căn, lọc và lưu góc nhìn được, nhập Excel ghép cột vào được; không lên trang khách, không vào số liệu thị trường, không lên Platform; kèm khi phát hàng cho đội khác thì bật từng trường. **Máy dò trùng nghĩa trước khi tạo:** gõ «Chủ cần bán gấp» thì máy chỉ ra nó gần nghĩa với trường chuẩn «Thời gian muốn ra hàng = Trong 1 tháng» và đề nghị dùng trường chuẩn với tên hiển thị riêng; vẫn muốn tạo thì phải ghi khác nghĩa ở điểm nào. (Tab Desktop từng lấy chính «Chủ cần bán gấp» làm ví dụ trường riêng — đã sửa.) Màn Nhập Excel (N1) đổi chữ cho khớp: trường riêng «Căn góc» chỉ sàn thấy, lọc được, không lên trang khách.

**Chỗ cần chốt:**

- [ ] ~~Trường riêng mức tối thiểu vào bản đầu hay chờ đội thứ hai.~~ Đã chốt 29/10: vào bản đầu.
- [ ] «Bao phí» mặc định gồm cả lệ phí trước bạ? Phác thảo đang tích cả ba khoản, khớp máy tính giá.
- [ ] Phí môi giới 1% là luật sàn hay thoả thuận từng căn — màn đang cho cả hai: mặc định của sàn, đầu chủ sửa từng căn.

## 14. Trang khách (29/10)

Phác thảo: hàng «Trang khách» trên cùng của [Phác thảo UX quỹ hàng](https://claude.ai/artifact/VESE23ChnX6oSC3X73Bzwf), màn T1–T4. Đã xem trực tiếp trên canvas, bản 20. *Đề xuất, chưa chốt.*

Trang khách là bề mặt thứ hai của Quỹ hàng: công khai qua link, không đăng nhập, **mang tên và logo của sàn**, không phải tên ứng dụng. Phần lớn được mở từ Zalo trên điện thoại. Cùng một trang, hai cách hiện theo người nhận — người gửi chọn ở bước xem trước (G2).

|  | Khách riêng (T1–T3) | Nhóm môi giới (T4) |
| --- | --- | --- |
| Mã căn | Ẩn, chỉ toà + tầng cao / thấp | Hiện đủ để khớp hàng |
| Phí | Lời khách hiểu: «đã / chưa gồm phí chuyển nhượng» | Tên chuẩn «Bao phí / Không bao phí» kèm định nghĩa của sàn (S4) |
| Dạng | Thẻ có ảnh; mỗi căn một trang | Bảng như bảng hàng; tải Excel hoặc ảnh bảng hàng |
| Thêm | Nút «Quan tâm» từng căn | Ô «Hợp tác bán»: mức chia, cách dẫn xem |

**Chung cho cả hai:**

- Không bao giờ có chủ nhà, số chủ, giá đáy, ghi chú nội bộ, ảnh sổ, trường riêng. Trang nhóm môi giới ghi rõ những thứ này không có ở đây.
- Giá sống: dòng «cập nhật trực tiếp» trên đầu, và mỗi căn ghi giá đã xác nhận với chủ nhà bao lâu trước — thứ mà ảnh chụp bảng hàng và Sheet không có.
- Ảnh gắn nhãn «Ảnh thật · ngày chụp» hoặc «Ảnh mẫu»; mặt bằng và view tự có từ mã căn.
- Thẻ người gửi luôn ở đáy với Gọi và Zalo. Khách tự bấm; không có gì gửi tự động.

**Link sống (T3):** căn có người đặt thì mờ đi, ẩn giá, ghi «vừa có người đặt cọc». Căn thay mà người gửi thêm qua «Gợi ý căn thay» (G4) hiện lên đầu, viền màu, kèm dòng báo cho khách.

**«Quan tâm» — đề xuất mới:** khách chạm tim một căn thì người gửi thấy ở Đã gửi, ví dụ «khách quan tâm Toà A tầng cao 2,49». Đây là tín hiệu rẻ nhất cho câu hỏi của nhà Đã gửi — khách đang phản ứng ra sao — mà không bắt khách để lại số. Trang nói rõ người gửi biết trang đã được mở và căn nào được quan tâm, không thu thông tin cá nhân.

**Chỗ cần chốt:**

- [ ] Hiện «giá xác nhận X ngày trước» cho khách? Đề xuất: hiện — khách tin hơn, và căn quá 14 ngày đã bị nhắc gọi trước khi gửi (G1).
- [ ] Mức chia hoa hồng trên trang nhóm môi giới đặt theo sàn hay theo từng bộ; có sàn không muốn công khai mức chia trong nhóm không?
- [ ] Người gửi có tắt link được không, và link có tự hết hạn không (ví dụ sau 30 ngày)?
- [ ] Giữ «Quan tâm» hay chỉ đếm lượt mở là đủ.
