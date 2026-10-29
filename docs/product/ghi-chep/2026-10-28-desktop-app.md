# Desktop app: bàn làm việc của người giữ quỹ hàng

> **Lưu vết, không sửa.** Bản chép ngày 29/10/2026 từ tab «Desktop app» của [tài liệu thiết kế](https://claude.ai/artifact/B12d9FDirVB9vEA8gSChLe). Điều đang đúng nằm ở [Tham chiếu](../tham-chieu.md); khi hai nơi nói khác nhau, Tham chiếu thắng.

Desktop là nơi nhập hàng, giữ hàng tươi và phát hàng cho cả đội; mobile và bộ gõ chỉ đọc và gửi từ kho mà desktop giữ. Bản đầu phải thay được Google Sheet cho năm việc hằng ngày — không hơn.

## Ai dùng desktop và làm gì mỗi ngày

Người dùng desktop là người **giữ sổ**, không phải người đi dẫn khách. Cả hai bảng hàng thật đều chỉ có vài người sửa, còn cả đội chỉ xem.

| Vai | Màn hình lớn dùng để | Hiện làm bằng |
| --- | --- | --- |
| Người quản lý khu / toà | Nhập hàng mới, sửa giá và trạng thái, gọi lại xác nhận với chủ nhà | Một tab Sheet mỗi khu, cột ngày gọi, ghi chú tự do |
| Chủ sàn / trưởng nhóm | Xem quỹ hàng cả đội, ai giữ gì, hàng nào cũ, hàng nào thiếu thông tin; phát bảng hàng ra ngoài | Tab «tổng», tab «số lượng theo người», chụp ảnh bảng gửi nhóm |
| Môi giới khi ngồi văn phòng | Lọc hàng cho khách, chọn căn, gửi | Chế độ xem Sheet + bộ lọc |

**Phỏng vấn 28/10:** sàn còn có đội marketing / telesales chuyển lead cho đầu chủ, và đầu chủ tách hẳn với đầu khách. «Người quản lý khu / toà» ở bảng trên chính là đầu chủ, «môi giới khi ngồi văn phòng» là đầu khách. Dòng vào từ lead đến căn sẵn sàng bán: Đầu chủ và telesales

Năm việc hằng ngày mà bản đầu phải làm tốt hơn Sheet:

1. **Nhập** hàng mới (chủ nhà gọi, đồng nghiệp chuyển, bảng hàng Excel, tin Zalo).
2. **Giữ tươi**: gọi lại, cập nhật giá và trạng thái, đánh dấu đã bán.
3. **Tìm** căn khớp nhu cầu khách.
4. **Phát** hàng: gửi một căn, một bộ căn, hay cả bảng hàng cập nhật cho đội và nhóm.
5. **Quản lý đội**: ai giữ căn nào, hàng ai đang cũ.

## Màn hình chính

Toàn bộ việc hằng ngày nằm trên một màn hình, dày như Sheet; không có trang chi tiết riêng cho từng căn.

*(Sơ đồ «khung màn hình chính · 3 vùng» — xem ở [tài liệu thiết kế gốc](https://claude.ai/artifact/B12d9FDirVB9vEA8gSChLe).)*

Góc nhìn đã lưu thay cho các tab của Sheet; chọn một dòng là hồ sơ mở cạnh bảng, chọn nhiều dòng là hiện thanh sửa hàng loạt.

**Hướng đã chọn (28/10):** mở app vào «Hôm nay» — hàng đợi gọi lại, căn mới đổi, căn thiếu thông tin, link khách đã mở. Làm việc ở bảng kiểu Sheet. Lưới toà là một cách xem bật ngay trong bảng, giữ nguyên bộ lọc và hồ sơ đang mở. «Hôm nay» là mục đầu của cột góc nhìn, không phải một trang riêng. Phác thảo: [Phác thảo UX quỹ hàng](https://claude.ai/artifact/VESE23ChnX6oSC3X73Bzwf).

## Sửa ngay trên ô

**Gõ nhanh như Sheet, lưu chặt như cơ sở dữ liệu.** Sửa trên ô là lý do lớn nhất khiến người giữ sổ chưa rời Sheet: gọi xong chủ nhà, sửa giá trong hai giây. Nhưng chép nguyên kiểu ô chữ tự do là chép luôn lỗi của các bảng hàng thật — giá thiếu điều kiện phí, trạng thái mỗi người viết một kiểu, diện tích sửa tay lệch thực tế.

1. **Chỉ sửa trên ô những gì thuộc lần rao**: giá, phí, trạng thái, nội thất, người giữ, ghi chú. Thuộc tính căn tự điền từ mã (diện tích, loại, hướng) bị khoá; thấy sai thì «báo sai thông tin căn». Đổi mã căn là chuyển căn, có bước riêng.
2. **Giá luôn đi cùng điều kiện phí**: ô sửa giá có sẵn nút «Không bao phí / Bao phí».
3. **Gõ kiểu gì cũng hiểu, và nói lại**: «2.35», «2,35», «2t35», «2350» → hiện «Hiểu là 2,35 tỷ · trước 2,40 · −2%» trước khi lưu; đổi quá khoảng 20% thì hỏi lại để chặn gõ nhầm.
4. **Ô danh mục thì chọn, không gõ**: trạng thái, pháp lý, người giữ có danh sách, bấm phím số để chọn nhanh.
5. **Bàn phím như Sheet**: mũi tên di chuyển, gõ là thay, Enter lưu, Esc huỷ, Tab sang ô kế; chọn nhiều ô rồi gõ là áp cho tất cả; dán một cột từ Excel thì xem trước chỗ sẽ đổi rồi mới áp.
6. **Không có nút Lưu**: mỗi ô tự lưu khi rời đi, kèm thanh báo «Đã lưu · Hoàn tác» và Ctrl+Z.
7. **Mỗi lần sửa là một sự kiện, không ghi đè mất dấu**: hiện chấm «mới đổi», vào lịch sử căn và mục «Mới đổi từ hôm qua» của màn Hôm nay; mức đủ thông tin tự tính lại.
8. **Báo trước khi thay đổi đi ra ngoài**: căn đang đăng trên Platform thì ghi rõ tin sẽ cập nhật; chọn «Đã bán» thì hỏi có gỡ tin không.
9. **Hai người cùng sửa một căn**: ô hiện ai sửa gần nhất; giá trị đã bị người khác đổi trong lúc mình gõ thì báo, không âm thầm ghi đè.

**Đã chốt (28/10):** sửa giá hoặc trạng thái thì mặc định tính là vừa xác nhận với chủ nhà — ghi thêm một sự kiện «xác nhận», làm mới ngày xác nhận. Ô sửa có ô «Vừa xác nhận với chủ nhà», bỏ chọn khi chỉ sửa lỗi gõ.

**Phạm vi:** sửa trên ô chỉ có ở cách xem Danh sách trên desktop; khi đang sửa, cột hồ sơ ẩn để bảng rộng như Sheet. Trên lưới, bấm ô là chọn căn, sửa ở hồ sơ. Mobile không sửa trên ô: dùng nút ghi kết quả gọi một chạm và màn sửa nhanh giá / trạng thái.

## Mobile: bản mang theo người

Mobile không phải bảng thu nhỏ. Nó làm bốn việc của người đang đi ngoài: **gọi lại, đổi giá nhanh, tra căn, gửi khách**. Nhập hàng loạt, sửa trên ô, nhập Excel và xuất bảng hàng ở lại desktop.

- **Hôm nay**: ô gõ mã căn, ba ô số liệu, hàng đợi gọi lại với nút «Gọi chủ nhà» và bốn nút kết quả bấm một tay.
- **Đổi giá**: bảng trượt lên kèm bàn phím số, theo đúng luật sửa trên ô — giá đi cùng điều kiện phí, nói lại «Hiểu là…», ô «Vừa xác nhận với chủ nhà» tick sẵn.
- **Hồ sơ căn**: giá kèm điều kiện phí, lần đổi gần nhất, ai xác nhận và khi nào; thanh dưới có gọi chủ nhà, đổi giá / trạng thái và «Gửi cho khách».
- **Bảng hàng**: mỗi căn một thẻ, cùng bộ lọc với desktop; giữ lâu một thẻ để chọn nhiều.

## Luồng Gửi

Bốn bước: **chọn căn → xem trước trang khách thấy → chép link hoặc chia sẻ → theo dõi sau khi gửi.** Người luôn là người bấm gửi.

1. **Chọn căn.** Lọc rồi chạm thẻ để chọn; chỉ căn còn hàng mới gửi được. Căn quá 14 ngày chưa xác nhận vẫn chọn được nhưng có dòng nhắc «nên gọi trước khi gửi». Có mục «Gửi lại bộ cũ».
2. **Xem trước.** Chọn gửi cho «Khách riêng» hay «Nhóm môi giới»; màn ghi rõ phần bị ẩn và hiện đúng trang khách sẽ thấy.
3. **Chép hoặc chia sẻ.** Link, nút chép link, tin nhắn soạn sẵn theo mẫu kênh (sửa được). «Chép link + tin» hoặc «Chia sẻ…» mở bảng chia sẻ của điện thoại để chọn Zalo; người dùng tự chọn người nhận và bấm gửi trong Zalo, hệ thống không gửi hộ.
4. **Sau khi gửi.** Danh sách link đã gửi kèm lượt khách mở. Link ghi công cho người gửi.

Luật của trang khách:

- **Không bao giờ hiện**: chủ nhà, số điện thoại chủ, ghi chú nội bộ, người giữ.
- **Nói bằng lời khách hiểu**: «bao phí» thành «đã gồm phí chuyển nhượng», «không bao phí» thành «chưa gồm phí chuyển nhượng».
- **Link sống**: giá và trạng thái trên trang luôn theo quỹ hàng. Căn đã cọc thì trang tự hiện «căn đã có người đặt»; app báo cho người gửi kèm «Gợi ý căn thay» và «Nhắn khách».
- **Thẻ người gửi** cuối trang, có nút gọi.

**Đã chốt (28/10):** gửi khách riêng thì mặc định ẩn mã căn, chỉ hiện toà + tầng cao / thấp, để khách khó vòng qua người gửi tìm thẳng chủ nhà hay môi giới khác. Gửi nhóm môi giới thì hiện đủ mã, vì đồng nghiệp cần mã để khớp hàng.

Phác thảo: hàng «Mobile» và «Mobile · luồng Gửi» trong [Phác thảo UX quỹ hàng](https://claude.ai/artifact/VESE23ChnX6oSC3X73Bzwf).

## Ảnh căn

Ảnh là thứ khách xem đầu tiên và là thứ môi giới gửi vào Zalo nhiều nhất. Trong Sheet, ảnh nằm rải rác ở album điện thoại và tin nhắn với chủ nhà, không gắn với căn nào. Mỗi căn có một chỗ giữ ảnh, chia ba ngăn:

- **Gửi được cho khách**: ảnh thật của đội, ghi ngày chụp; có ảnh bìa, đổi thứ tự được. Ảnh mẫu dự án gắn nhãn «Ảnh mẫu» để khách không nhầm là ảnh căn.
- **Tự có từ mã căn**: mặt bằng theo trục và ảnh view theo hướng / tầng, lấy từ danh mục căn giống thuộc tính căn; căn mới nhập đã có ảnh trước khi ai đi chụp.
- **Nội bộ, không bao giờ gửi**: sổ, hợp đồng, giấy tờ. Chỉ người giữ và trưởng nhóm xem; không vào trang khách, không vào ảnh bảng hàng.

Luật:

1. **Ảnh thuộc căn, lần rao chọn ảnh.** Ảnh giữ ở căn kèm ngày chụp; khi căn rao lại với nội thất khác, ảnh cũ vẫn còn nhưng lần rao mới chọn ảnh hiện.
2. **Nguồn ảnh**: chụp ngay trong app khi đi xem nhà, hoặc thêm từ máy (ảnh chủ nhà gửi qua Zalo đã lưu về máy). Ảnh từ tin rao của người khác mà OneHub Invest thu được **không** vào ngăn gửi được — chỉ để đối chiếu, đúng luật «gom vào, không phát ra».
3. **Che trước khi gửi**: có công cụ «Che một vùng» cho số cửa, giấy tờ lọt khung, mặt người — khớp với luật ẩn mã căn khi gửi khách riêng. Máy tự gợi ý chỗ cần che để sau.
4. **Gửi Zalo bằng ảnh + tin, link là phụ.** Ở bước chia sẻ, máy chọn sẵn ảnh bìa mỗi căn và ảnh thật; «Chia sẻ ảnh + tin…» mở bảng chia sẻ của điện thoại với các ảnh, còn tin nhắn được chép sẵn để dán ngay sau. Người vẫn là người bấm gửi.
5. **Ảnh tính vào mức đủ thông tin**: căn chưa có ảnh thật thì hiện trong «Thiếu thông tin» với nhãn «ảnh»; ảnh quá cũ so với lần rao thì nhắc chụp lại.
6. **Giữ bản gốc, gửi bản nhẹ**: gửi ra ngoài dùng bản thu nhỏ cho nhanh; bản gốc giữ để in hoặc đăng Platform.

**Đã chốt (28/10):** cho lưu ảnh sổ và giấy tờ ở ngăn nội bộ. Chỉ người giữ căn và trưởng nhóm xem được; không bao giờ ra trang khách, ảnh bảng hàng hay bài chia sẻ. Lý do: môi giới cần ảnh sổ để trả lời khách hỏi pháp lý; không cho lưu thì ảnh nằm trong album điện thoại, còn khó kiểm soát hơn.

Phác thảo: màn «M5 · Ảnh căn», dải ảnh trong hồ sơ căn (desktop và mobile), và bước chia sẻ có ảnh gửi kèm trong [Phác thảo UX quỹ hàng](https://claude.ai/artifact/VESE23ChnX6oSC3X73Bzwf).

## Nhập Excel

Bốn bước: **chọn file → ghép cột → xem trước → nhập.** Đây là màn hiện rõ nhất luật «mỗi đội một cách gọi, dữ liệu một chuẩn».

- **Nhớ mẫu file**: nhận ra file cùng mẫu lần trước thì ghép sẵn; chỉ hỏi phần mới.
- **Ghép cả giá trị, không chỉ cột**: «Còn / Cọc / Bán» vào trạng thái chuẩn; giá trị mới như «Giữ chỗ» thì thêm làm trạng thái riêng của công ty, bắt buộc chọn trạng thái chuẩn gần nhất.
- **Thuộc tính tự điền từ mã chỉ để đối chiếu**: cột diện tích, loại, hướng trong file không đè danh mục; dòng lệch đi vào «báo sai thông tin căn».
- **Cột không có chỗ không bị bỏ mất**: đề nghị tạo trường riêng, gộp vào ghi chú, hoặc người chủ động bỏ qua.
- **Xem trước rồi mới ghi**: chia cập nhật / thêm mới / không đổi / cần sửa; mã gõ nhầm có gợi ý; dòng lỗi để lại nhập sau.
- **Nhập là sự kiện**: mỗi thay đổi ghi «nhập từ file» kèm tên file và người nhập; ngày xác nhận lấy từ cột ngày gọi trong file, không lấy hôm nay; hoàn tác được cả lần nhập. Căn đã sửa trong app sau ngày của file thì giữ bản trong app và hỏi người.

Phác thảo: hàng «Desktop · Nhập Excel» trong [Phác thảo UX quỹ hàng](https://claude.ai/artifact/VESE23ChnX6oSC3X73Bzwf).

## Nhóm tính năng

25 tính năng trong 10 nhóm; 15 vào bản đầu. Mỗi tính năng ghi nó thay cho việc gì đang làm trong Sheet; cột Giai đoạn chọn lại được.

| Nhóm | Tính năng | Thay cho | Giai đoạn |
| --- | --- | --- | --- |
| Bảng hàng | Bảng dữ liệu kiểu Sheet: sửa tại ô, đi bằng phím, chọn nhiều dòng, dán từ Excel | Chính Google Sheet | MVP |
| Bảng hàng | Bộ lọc ở mọi cột; góc nhìn đã lưu (theo khu, loại căn, người giữ, trạng thái) | Mỗi khu một tab, chế độ lọc của Sheet | MVP |
| Bảng hàng | Nhóm theo toà / dãy rồi loại căn; cột hiện theo lựa chọn của đội | Dải màu chia nhóm tô tay | MVP |
| Bảng hàng | Sửa hàng loạt: đổi trạng thái, người giữ, đánh dấu đã gọi cho nhiều căn một lúc | Sửa từng ô | MVP |
| Nhập liệu | Gõ mã căn là thuộc tính căn tự điền; mã chưa có trong danh mục thì báo rõ | Gõ lại 5 cột mỗi căn, công thức tra cứu tự nối | MVP |
| Nhập liệu | Nhập file Excel bảng hàng: tự đoán cột, ghép mã căn, xem trước, báo dòng không khớp | Chép dán từng khối | MVP |
| Nhập liệu | Dán một tin rao Zalo / Facebook → máy bóc thành căn, người duyệt | Đọc tin rồi gõ lại | Sau |
| Nhập liệu | Nhận căn: tin của chính đội mà hệ thống đã thu, xác nhận là vào kho | (chưa có) | Sau |
| Nhập liệu | Nối Google Sheet hai chiều cho đội chưa muốn rời Sheet | Giữ hai nơi | Cân nhắc |
| Hồ sơ căn | Bảng bên phải: thuộc tính căn, lần rao, lịch sử giá và trạng thái, pháp lý theo mốc, tài chính (vay, ngân hàng), cho thuê, ảnh | Ghi chú dài trong một ô | MVP |
| Hồ sơ căn | Máy tách nhãn từ ghi chú (đang thuê + giá + hạn hợp đồng, vay, có ảnh, xem phải hẹn), người xác nhận | Đọc ghi chú bằng mắt | Sau |
| Hồ sơ căn | Thẻ thị trường: căn đang rao ở mấy nơi, giá so trung vị toà, lợi suất, chênh lệch so giá gốc | (chưa có) | Sau |
| Độ tươi | Hàng đợi «cần gọi lại hôm nay»; ghi kết quả gọi một chạm: còn / đổi giá / đã bán / không liên lạc được | Cột ngày gọi, tab «gọi lại» | MVP |
| Độ tươi | Mức đủ thông tin tự tính, kèm danh sách trường còn thiếu | Chấm L1–L4 bằng tay | MVP |
| Độ tươi | Trạng thái có tên, màu theo trạng thái; lịch sử thay đổi; căn đã bán giữ giá chốt | Tô màu tay, chuyển dòng sang tab «đã bán» | MVP |
| Vị trí | Lưới toà (căn hộ) / bản đồ phân lô (thấp tầng), tô sáng theo bộ lọc, chấm đổi mới | Tự dựng lưới trong Sheet | Sau |
| Phát hàng | Xuất bảng hàng ra ảnh / PDF / Excel theo mẫu, đúng góc nhìn đang lọc, giấu cột nội bộ | Chụp màn hình Sheet gửi nhóm | MVP |
| Phát hàng | Link căn / bộ căn có ghi công, giấu số chủ và số nhà; biết khách đã mở | Gửi ảnh + chữ | MVP |
| Phát hàng | Chép bài theo mẫu kênh (nhóm Zalo, Facebook, khách riêng) | Soạn tay mỗi lần | MVP |
| Phát hàng | Mức hiển thị theo từng căn; đưa căn đủ mức lên Platform | (chưa có) | Sau |
| Đội | Vai và quyền sửa theo khu; ai sửa gì, lúc nào | Chia sẻ chỉ xem + một người sửa | MVP |
| Đội | Quỹ hàng theo người giữ; bàn giao hàng khi có người nghỉ | Tab «số lượng theo người» | Sau |
| Khách | Nhu cầu khách, khớp căn, lịch hẹn xem nhà | Tab «hẹn xem nhà» | Sau |
| Báo cáo | Tổng quan quỹ hàng theo khu, loại, trạng thái, độ tươi, mức đủ; đã bán theo tháng | Tab «tổng» | Sau |
| Tuỳ biến | Nhãn riêng của đội trên trường chuẩn; cách đọc mã căn theo dự án; trạng thái tự đặt | Ký hiệu ngầm chỉ người trong đội hiểu | MVP |

## Bản đầu (MVP)

Bản đầu xong khi **một đội bỏ hẳn Google Sheet cho một dự án trong hai tuần** và không muốn quay lại. Đây chính là giai đoạn «web kho + link» của lộ trình; người dùng đầu tiên là đội của bạn.

Mười lăm tính năng MVP xếp theo một vòng việc trong ngày:

1. **Nhập**: nhập file bảng hàng cũ một lần; gõ mã căn là tự điền; nhãn riêng của đội và cách đọc mã theo dự án khai sẵn.
2. **Giữ tươi**: hàng đợi gọi lại, kết quả gọi một chạm, sửa hàng loạt, trạng thái có tên và lịch sử, mức đủ thông tin tự tính.
3. **Tìm**: bảng kiểu Sheet, bộ lọc mọi cột, góc nhìn đã lưu, nhóm theo toà / dãy rồi loại căn, bảng hồ sơ bên phải.
4. **Phát**: xuất bảng hàng theo góc nhìn, link căn có ghi công, chép bài theo mẫu kênh.
5. **Đội**: vai và quyền sửa theo khu, lịch sử ai sửa gì.

Cố ý **không** làm ở bản đầu:

- **Tự đăng hay tự trả lời Zalo** — trái luật «gom vào, không phát ra»; người luôn bấm gửi.
- **CRM khách đầy đủ** — khách và hẹn xem để sau, ở mức nhẹ; sản phẩm là quỹ hàng, không phải phễu bán.
- **Bản đồ vị trí** — hàng thứ cấp xem theo danh sách là chính; lưới và bản đồ phân lô đến khi có hàng sơ cấp hoặc người dùng đòi.
- **Máy đọc chữ** (bóc tin rao, tách nhãn ghi chú) — làm sau khi đã có dữ liệu thật để đo độ đúng; bản đầu dùng nhãn chọn tay.
- **Đồng bộ lên Platform** — chờ kết quả thử «cho đưa căn nào lên?».
- **Hoa hồng, hợp đồng, thanh toán** — ngoài phạm vi.

## Nền tảng kỹ thuật và mô hình dữ liệu

Đề xuất: **làm web app chạy trên trình duyệt máy tính trước, đóng gói thành app cài máy sau** nếu thật cần.

- **Vì sao web trước**: đội đã quen làm việc với Sheet trên trình duyệt; không phải cài; cập nhật tức thì cho cả đội; link căn và trang căn vốn là web; dùng chung mã với bản mobile.
- **Khi nào cần app cài máy**: thông báo hệ thống («12 căn cần gọi lại»), phím tắt toàn cục, làm việc khi mất mạng, đọc file lớn trên máy. Chưa bài nào bắt buộc ở bản đầu.
- **Bảng dữ liệu** phải mượt với vài nghìn dòng: cuộn ảo, sửa tại ô, dán khối từ Excel. Đây là nơi người dùng so với Sheet đầu tiên.
- **Lưu và đồng bộ**: một kho trên máy chủ, cập nhật thời gian thực giữa các người cùng mở; hai người sửa cùng ô thì người sau thấy thay đổi của người trước.

Mô hình dữ liệu tách theo nhịp thay đổi:

| Đối tượng | Giữ gì | Đổi khi nào |
| --- | --- | --- |
| Dự án → toà / phân khu → dãy | Tên, loại hình, cách đọc mã căn | Gần như không |
| Căn | Mã căn, vị trí tách từ mã, diện tích, số phòng ngủ, hướng, đặc tính theo loại hình | Gần như không |
| Lần rao bán | Giá + điều kiện phí và thuế, nội thất / mức hoàn thiện, pháp lý, tài chính, tình trạng sử dụng, người giữ, mức hiển thị, ghi chú | Hằng tuần |
| Sự kiện | Gọi xác nhận, đổi giá, đổi trạng thái, đã bán + giá chốt — ai, khi nào | Hằng ngày, chỉ thêm không sửa |
| Đội | Người, vai, khu phụ trách, nhãn riêng, trạng thái tự đặt | Thỉnh thoảng |

Độ tươi, mức đủ thông tin và lịch sử đều **tính ra từ sự kiện**, không ai phải điền.

Nối với OneHub Invest: căn dùng cùng khoá với hồ sơ «một căn nhà» theo mã căn. Invest cấp danh mục và số liệu thị trường vào; hàng riêng của đội chỉ chảy ra ngoài theo mức hiển thị họ chọn.

### Mỗi đội một cách gọi, dữ liệu một chuẩn

**Đã chốt (28/10):** ba lớp dưới đây, tách công ty từ bản đầu. Sheet thắng ở chỗ mỗi đội tự đặt cột theo cách mình gọi. Cũng vì thế mà mỗi Sheet là một hòn đảo: hai bảng hàng thật ghi điều kiện phí mỗi bên một kiểu, không ghép được, không so được với thị trường, gửi sang đội khác thì người nhận phải đọc lại từ đầu. Quỹ hàng phải giữ được cái tự do đó mà không mất chuẩn: **app nói tiếng của từng đội, dữ liệu bên dưới nói một tiếng — tiếng RESO.**

| Lớp | Gồm | Ai đổi được | Ví dụ |
| --- | --- | --- | --- |
| **Lõi chuẩn** | Căn, lần rao, giá + điều kiện phí, trạng thái chuẩn, sự kiện — theo RESO | Chỉ đội sản phẩm, qua quy trình RESO-first | Diện tích, hướng, «Đang giao dịch» |
| **Cách gọi riêng** | Tên hiển thị của trường chuẩn; giá trị riêng neo vào giá trị chuẩn; bộ nhớ ghép cột khi nhập Excel | Quản trị của công ty | «Phí CN» là điều kiện phí; «Đã cọc», «Chờ ký» đều là Đang giao dịch |
| **Trường riêng** | Trường thật sự mới của đội, có kiểu: chữ, số, ngày, chọn một, có / không | Quản trị của công ty | «Căn góc» (không phải «Chủ cần bán gấp» — đó là thời gian ra hàng «Trong 1 tháng», đã có trong lõi) |

1. **Hỏi ba câu theo thứ tự trước khi thêm gì.** Cùng nghĩa khác tên → đổi tên hiển thị. Cùng trường khác giá trị → thêm giá trị riêng, bắt buộc chọn giá trị chuẩn gần nhất (RESO làm đúng vậy: trạng thái chuẩn đi cùng trạng thái riêng của từng hệ thống). Chỉ khi thật sự mới mới thêm trường riêng. Phần lớn chỗ «mỗi công ty một kiểu» rơi vào hai câu đầu.
2. **Lõi khoá nghĩa, chỉ mở tên.** Đội đổi được cách gọi, không đổi được nghĩa. Thuộc tính tự điền từ mã không bị trường riêng đè.
3. **Trường riêng ở lại trong đội.** Lọc, sắp xếp, tạo góc nhìn được; không vào số liệu thị trường; không lên trang khách hay bảng hàng xuất ra trừ khi đội bật từng trường.
4. **Nhập Excel nhớ cách ghép.** Lần đầu máy đoán cột, người sửa; lần sau cùng mẫu file thì tự ghép. Cột không khớp được đề nghị thành trường riêng hoặc ghi chú, không bỏ mất.
5. **Gửi đi thì đổi tiếng.** Bảng hàng sang đội khác hiện bằng cách gọi của bên nhận nếu họ cũng dùng quỹ hàng, không thì bằng tên chuẩn; xuất Excel theo mẫu bên nhận chọn.
6. **Trường riêng là cảm biến cho chuẩn.** Một trường riêng cùng nghĩa xuất hiện ở từ ba công ty → xét đưa vào lõi theo quy trình RESO-first; các đội được gộp trường của mình vào trường chuẩn.

**Nhiều công ty trên một nền.** Mỗi công ty là một vùng riêng: người, đội, cách gọi, trường riêng và quỹ hàng (lần rao, chủ nhà, ghi chú) chỉ người trong công ty thấy. Riêng danh mục dự án, toà, căn là dùng chung — một căn nhà chỉ có một hồ sơ, dù ba công ty cùng giữ. Hệ thống biết hai công ty cùng giữ một căn nhưng không cho bên này thấy hàng của bên kia; chia sẻ chỉ xảy ra khi đội chủ động gửi. Cách ly đặt ở tầng kho dữ liệu, không trông vào từng màn hình nhớ lọc; kiểm thử «công ty này không thấy gì của công ty kia» là cổng bắt buộc trước mỗi lần phát hành.

**Không làm, có chủ ý.** Không cho tạo đối tượng mới, không công thức, không bố cục tự dựng. Đối tượng của nghề đã biết trước; mở các thứ này là biến quỹ hàng thành công cụ dựng app — mỗi đội một app, mất khả năng so, gộp và hỗ trợ. Đây là chỗ khác Salesforce: họ bán nền cho mọi ngành nên phải đưa cả lõi vào cấu hình; mình làm một ngành nên lõi viết chặt, chỉ hai lớp ngoài là cấu hình.

**Theo nấc.** Bản đầu: lõi chuẩn, tách công ty ngay từ đầu (rẻ khi làm sớm, rất đắt khi vá sau), cách gọi riêng, bộ nhớ ghép cột Excel, và **trường riêng mức tối thiểu** — hai kiểu «có / không» và «chọn một», không lên trang khách, không vào số liệu thị trường, không lên Platform (*đã chốt 29/10*: file Excel của sàn thử đã có cột kiểu «Căn góc»; dồn vào ghi chú thì mất lọc). Khi có đội thứ hai, thứ ba: trường riêng đủ kiểu (chữ, số, ngày), xuất theo mẫu từng đội. Khi có từ năm công ty: vòng nâng chuẩn và gửi hàng hợp tác giữa công ty.

*Ghi chú kỹ thuật:* lõi là bảng có cột kiểu chặt như kho hiện có; trường riêng là một cột dữ liệu linh hoạt kèm bảng định nghĩa trường theo công ty, không dùng mô hình bảng phẳng cột chung của Force.com; cách ly bằng luật theo dòng của Postgres sẵn có.

### Nhanh tức thì, chịu được mất mạng

**Đã chốt (28/10):** hai mức — nhanh tức thì cho cả desktop và mobile từ bản đầu; ngoại tuyến thật chỉ ở mobile, đo trong hai tuần thử rồi mới làm. Hai nhu cầu hay bị gộp làm một: **nhanh** và **làm việc khi không có mạng**. Nhanh không cần chế độ ngoại tuyến; nó cần app giữ sẵn dữ liệu trên máy, ghi trước trên máy rồi đồng bộ sau. Cùng nền đó cho ra ngoại tuyến với chi phí thêm nhỏ, nên làm nền này từ bản đầu (giống tách công ty: rẻ khi làm sớm, đắt khi vá sau).

|  | Desktop | Mobile |
| --- | --- | --- |
| **Nhanh tức thì** (bản đầu) | Bảng giữ sẵn trên máy: lọc, cuộn, mở hồ sơ không chờ. Sửa ghi ngay trên máy, gửi lên sau; rớt wifi vài phút không mất ô nào. | Như desktop, cho «Hôm nay» và căn của mình. |
| **Ngoại tuyến thật** | Không cần: văn phòng có mạng, chỉ cần không mất việc khi rớt mạng. | Cần: hầm toà, thang máy, căn mẫu, công trường. Tra căn đã tải, ghi kết quả gọi, đổi giá / trạng thái, chụp ảnh — tất cả xếp hàng chờ gửi. |

1. **Luôn nói rõ đang ở đâu.** Thanh trên cùng: «Ngoại tuyến · 3 thay đổi chờ gửi · dữ liệu lúc 14:02». Căn sửa khi ngoại tuyến mang dấu «chờ gửi» tới khi lên máy chủ.
2. **Sửa ngoại tuyến là sự kiện chờ gửi, không phải ghi đè.** Mô hình sự kiện sẵn có làm việc này dễ: có mạng lại thì gửi theo thứ tự, mỗi sự kiện mang giờ thật lúc người bấm.
3. **Đụng nhau thì hỏi, không tự chọn.** Có mạng lại mà căn đã bị người khác đổi giá hay trạng thái → hiện cả hai, người chọn, cùng luật «hai người cùng sửa một căn». Riêng «Đã bán» và «Đã cọc» từ bất kỳ ai thắng ngay: một lần sửa giá ngoại tuyến không được hồi sinh căn đã bán.
4. **Gửi khách cần mạng.** Link sống phải đọc được quỹ hàng mới nhất; ngoại tuyến thì nút Gửi ghi rõ «cần mạng», không gửi bảng giá cũ đi. Nhập Excel, xuất bảng hàng và thẻ thị trường cũng cần mạng.
5. **Mang theo ít, không mang theo hết.** Máy chỉ giữ căn của mình, hàng đợi Hôm nay và góc nhìn đã ghim — không giữ cả quỹ hàng công ty. Số chủ nhà chỉ giữ cho căn mình giữ; ảnh ngăn nội bộ (sổ, giấy tờ) không bao giờ lưu trên máy. Đăng xuất hay báo mất máy thì xoá sạch bản trên máy.
6. **Hàng cũ thì nhắc.** Dữ liệu trên máy quá một ngày chưa đồng bộ thì hồ sơ căn hiện cảnh báo trước khi người đọc giá cho khách.

**Đo trước khi làm phần ngoại tuyến thật:** trong hai tuần thử, đếm số lần mất mạng và số thao tác người dùng thử làm lúc mất mạng trên mobile.

*Ghi chú kỹ thuật:* web app giữ dữ liệu trong bộ nhớ trình duyệt kèm hàng đợi ghi; mobile cần chạy được khi tắt mạng (web cài vào màn hình chính hoặc app gốc) — quyết khi làm mobile.

## Đo thành công

Bản đầu thành công khi đội thôi mở Sheet. Ngưỡng cụ thể chưa chốt; đặt trước khi bắt đầu hai tuần dùng thử.

| Số đo | Trả lời câu hỏi |
| --- | --- |
| Số ngày trong hai tuần mà Sheet cũ không được sửa | Đội đã chuyển hẳn chưa? |
| Tỉ lệ căn được xác nhận trong N ngày qua | Hàng có tươi hơn lúc dùng Sheet không? |
| Tỉ lệ căn ở mức đủ thông tin cao nhất | Thông tin có đầy hơn không? |
| Tỉ lệ mã căn tự điền được | Danh mục có đủ phủ dự án không? |
| Thời gian từ lúc khách hỏi đến lúc gửi được căn | Việc thật có nhanh hơn không? |
| Số lần xuất bảng hàng, số link được khách mở | Hàng có được phát ra từ đây không? |

## Câu hỏi mở

- [ ] Dự án nào dùng thử trước — căn hộ hay thấp tầng? (đề xuất: dự án mà đội của bạn đang giữ nhiều hàng nhất)
- [ ] Danh mục căn cho dự án đó lấy từ đâu, để gõ mã là tự điền ngay từ ngày đầu?
- [ ] Mẫu bảng hàng xuất ra (ảnh / PDF) mà các nhóm quen nhận trông thế nào?
- [ ] Ai trong đội được sửa khu nào?
- [x] **Đã chốt (28/10):** tài khoản các sàn và quỹ hàng chạy trên máy chủ; dữ liệu người dùng đi kèm hợp đồng và điều khoản sử dụng. Ngoài phạm vi bản phác này, làm ở khâu vận hành sau.
