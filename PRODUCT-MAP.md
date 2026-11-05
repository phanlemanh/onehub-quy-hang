# Bản đồ sản phẩm

> Bản đồ vẽ lại từ hồ sơ của xưởng mỗi lần một người ký một cổng — đừng sửa tay.
> (đọc từ thư mục `_acceptance/` và `.out-of-scope/`)
> Lộ trình: [LO-TRINH.html](LO-TRINH.html)

```mermaid
flowchart TD
  A["Đang cân nhắc cơ hội<br/>chưa có"] --> GD{"Cổng Đáng"}
  GD --> B["Sắp mở vòng<br/>2 việc"]
  GD --> XL["Xếp lại sau<br/>chưa có"]
  GD --> DB["Đã bác từ khám phá<br/>chưa có"]
  B --> CD["Chờ duyệt phạm vi<br/>chưa có"] --> GP{"Cổng Phạm vi"}
  GP --> DL["Đang làm<br/>chưa có"] --> GB{"Cổng Bằng chứng"}
  GB --> DG["Đã giao<br/>20 việc"]
  GB --> CN["Chờ phiên nghiệm thu<br/>76 việc"] --> GG{"Cổng Giá trị"}
  GG --> NT["Đã nghiệm thu giá trị<br/>chưa có"]
```

> **Bốn cổng người** — mỗi cổng là một câu hỏi chỉ người trả lời được:
> **Cổng Đáng** việc này có đáng làm không · **Cổng Phạm vi** bộ tiêu chí
> đã đủ và đúng chưa · **Cổng Bằng chứng** đã làm đúng thứ đã hứa chưa ·
> **Cổng Giá trị** thứ đã giao có ăn thua không.

## Sắp mở vòng

- Trưởng nhóm tích nhiều căn trên Bảng hàng rồi đổi đầu chủ một lần: chọn từ danh sách thành viên mang vai Đầu chủ của sàn, hộp hỏi kể đủ căn và người giữ cũ, đổi đầu chủ của hàng thì đổi luôn người giữ liên hệ chủ nhà theo luật một chủ một đầu chủ, hoàn tác được (`doi-dau-chu-hang-loat`)
- Đầu chủ mở Hôm nay trên điện thoại, gọi lại một chạm và ghi kết quả bằng một tay (`hom-nay-dau-chu-dien-thoai`)

## Đã giao — chờ phiên nghiệm thu

- Đầu chủ kéo hoặc dán ảnh từ Zalo trên máy tính vào hồ sơ căn và xếp vào ba ngăn; ngăn nội bộ không bao giờ ra ngoài, không lưu trên máy (`anh-can-ba-ngan`)
- Bộ đồng bộ đưa đúng phần mỗi người được thấy xuống máy, rút mạng năm phút rồi nối lại không mất thay đổi nào (`bai-thu-dong-bo-mat-mang`)
- Lưới bảng hàng 5.000 dòng × 20 cột cuộn, sửa trên ô và dán 500 ô từ Excel mà không giật trên máy tính văn phòng (`bai-thu-luoi-5000-dong`)
- Link trang khách dán vào Zalo hiện ảnh xem trước, và lượt Zalo tự lấy ảnh không bị tính là khách mở (`bai-thu-zalo`)
- Kho có bản đồ khuôn cho các nhóm màn đã có — Cài đặt sàn, Xác thực, trang tạm, trạng thái trống · lỗi · báo — và mỗi nhóm một khuôn có khe mà mọi màn của nhóm dựng qua (`ban-do-khuon-nhom-da-co`)
- Đầu khách mở Bảng hàng trên điện thoại, lọc theo nhu cầu khách thành thẻ, giữ lâu một thẻ để chọn nhiều căn (`bang-hang-dang-the`)
- Đầu chủ mở hồ sơ căn từ Bảng hàng thì hồ sơ là một cột đứng cạnh bảng, ngoài khung bảng, cao từ đỉnh vùng làm việc tới đáy màn, đẩy bảng sang trái và kéo chia 28–50%; thanh trên của vỏ giữ nguyên, nhóm nút Nhóm · Lọc · Cột · Xuất và +Lead không bị che; điện thoại không đổi; Bảng hàng có cột Đầu chủ (`bang-hang-danh-sach-chi-tiet`)
- Đầu chủ mở Bảng hàng trên máy tính và thấy hàng của sàn dày như Sheet: lọc mọi cột, nhóm theo toà rồi loại căn, lưu góc nhìn (`bang-hang-kieu-sheet`)
- Lệnh chốt bán với ngày bán không có thật (như 30 tháng 2) bị từ chối với lỗi nêu đúng trường ngày bán, không phải lỗi hệ thống (`bao-ro-ngay-ban-sai`)
- Mọi người dùng có một khu Cài đặt — nhóm Cá nhân ai cũng thấy, nhóm Sàn chỉ quản trị; hai đường vào; nội dung bề rộng đọc cạnh cột mục lục (`cai-dat-hop-nhat`)
- Đầu chủ gõ mã căn trùng ở hai toà cùng dự án thì thấy cả hai căn kèm tên toà để chọn, không bị điền lặng lẽ thuộc tính của căn toà khác (`can-trung-ma-hai-toa`)
- Mỗi sàn giữ cấu hình riêng: đổi một điểm qua một lệnh API thành sự kiện chỉ thêm ghi người và vai, sàn chưa đổi thì nhận mặc định của sổ, đối tượng tạo sau lần đổi mang số mới còn đối tượng cũ giữ số lúc tạo, và sàn khác không đọc hay đổi được (`cau-hinh-theo-san`)
- Che vùng ảnh: đầu chủ kéo khung che lên ảnh căn rồi lưu một bản che nhẹ ở ngăn Gửi được; bản gốc giữ nguyên và sang ngăn Nội bộ (`che-vung-anh`)
- Lead không trùng được chia theo luật của sàn trong một phút; quá 15 phút chưa nhận hay 30 phút chưa gọi thì trưởng nhóm được báo (`chia-lead-va-han`)
- Đầu chủ chọn một căn và thấy cột hồ sơ cạnh bảng — thuộc tính tự điền, lần rao, lịch sử giá và trạng thái ai sửa khi nào; thấy thuộc tính sai thì bấm «Báo sai thông tin căn» (`cot-ho-so-can`)
- Đầu chủ mở chế độ cuộc gọi của một lead trên máy tính: thẻ lead so giá với toà, danh sách hỏi chọn bằng phím, tính giá bao phí ↔ về tay; ghi xong thì mức đủ tự tính lại (`cuoc-goi-khai-thac`)
- Đầu khách mở Đã gửi và thấy từng link: lượt khách mở, căn được quan tâm, căn vừa đổi kèm «Gợi ý căn thay»; tắt được link (`da-gui`)
- Người trong sàn đăng nhập trên một thẻ theo khối auth-15: chỉ mã một lần qua email, không nút Google, Apple hay GitHub, giữ chân điều khoản; chọn sàn và chưa gắn sàn đi cùng khuôn; luồng đăng nhập, phiên và luật vào đúng sàn của hàng 6 giữ nguyên (`dang-nhap-auth-15`)
- Đăng nhập bằng mật khẩu do sàn cấp: quản trị cấp mật khẩu tạm, người đặt mật khẩu mới trước khi vào vỏ, quên thì quản trị cấp lại; mã 6 số qua email giữ nguyên; đăng xuất lỗi thì báo và cho thử lại (`dang-nhap-mat-khau`)
- Người trong sàn đăng nhập và vào đúng vùng dữ liệu của sàn mình; chưa gắn sàn thì không thấy gì (`dang-nhap-theo-san`)
- Đầu chủ gõ mã căn và thấy thuộc tính căn tự điền theo cách đọc mã của dự án; mã chưa có trong danh mục thì báo rõ (`danh-muc-go-ma-can`)
- Đầu chủ sửa căn lúc máy chủ trục trặc ngắn hay hết phiên thì thay đổi tự gửi lại khi máy chủ trả lời được, chỉ báo đồng bộ nói đúng vì sao chưa gửi, và căn đang ở Cần xem sửa tiếp hay xử lý không kẹt, không đảo thứ tự hai lần sửa (`dong-bo-tu-lanh`)
- Mọi đường gửi mã đăng nhập đi qua cùng giới hạn 5 lần xin mã trong 15 phút cho mỗi email; đường quên mật khẩu của plugin không còn phục vụ (`dong-duong-gui-ma-thua`)
- Bộ dữ liệu mẫu của một sàn thử — một dự án căn hộ, hai mẫu file bảng hàng Excel, lead và chủ nhà giả — sinh từ khuôn của bảng hàng thật, mọi bản ghi mang nhãn mẫu (`du-lieu-mau-san-thu`)
- Bộ dữ liệu mẫu thứ hai — một khu thấp tầng có dãy và lô nhà phố, biệt thự, đất; nhà và đất ngoài khu ở vài phường; một file bảng hàng thấp tầng bẩn có đáp án; lead và chủ nhà giả — sinh từ khuôn, mọi bản ghi mang nhãn mẫu (`du-lieu-mau-thap-tang`)
- Ghi thiết bị (máy tính hay điện thoại) vào sự kiện của thao tác, và ghi lượt mất mạng cùng thao tác lúc mất mạng trên điện thoại về máy chủ, để hai số đo §11 «thao tác theo thiết bị và vai» và «mất mạng trên điện thoại» đo được trong hai tuần thử (`ghi-thiet-bi-va-mat-mang`)
- Đầu chủ gọi ép giá đợt hai trên máy tính: thấy lịch sử trả giá và giá đáy nội bộ, ghi kết quả bằng phím, hạ giá theo đúng luật sửa giá (`goi-ep-gia-dot-hai`)
- Đầu chủ bấm Gọi trên máy tính thì chế độ cuộc gọi mở và điện thoại của mình quay số chủ nhà (`goi-tu-may-tinh`)
- Mọi màn sau đăng nhập chọn một trong bảy bố cục có tên với sáu vùng chuẩn, chờ tải theo hình bố cục, rỗng · lỗi · ngoại tuyến một luật, ba khổ và một menu Tạo trên vỏ; trang mẫu sống không cần cơ sở dữ liệu hay đăng nhập cho ảnh chuẩn để đối chiếu màn mới; răng lint và bản đồ hệ thiết kế giữ luật (`he-bo-cuc`)
- Đầu khách mở hồ sơ căn trên điện thoại và thấy giá, ảnh gửi được, lần xác nhận gần nhất; phần chủ nhà thay bằng «Liên hệ đầu chủ» (`ho-so-can-dien-thoai`)
- Đầu chủ mở app vào Hôm nay và thấy các hàng đợi của mình theo bộ nhóm của sàn — mặc định lead mới, nên gọi ép giá, cần gọi lại, thiếu thông tin, mới đổi — mỗi căn ở đúng một hàng đợi, lý do bằng chữ, ghi kết quả gọi một chạm; sàn tự định nghĩa nhóm từ bộ điều kiện đóng (`hom-nay-dau-chu`)
- Đầu khách mở Hôm nay trên điện thoại và thấy khách vừa phản ứng, căn đã gửi vừa đổi, căn mới lên bảng khớp các bộ đã gửi (`hom-nay-dau-khach`)
- Trưởng nhóm mở Hôm nay và thấy lead quá hạn để chia lại, hàng cũ theo từng đầu chủ, và ngoại lệ máy không tự quyết được (`hom-nay-truong-nhom`)
- Lõi, API và tài liệu gọi khu chứa căn là SubdivisionName, mỗi căn mang loại hình PropertyType và PropertySubType theo RESO, và trường dùng được của từng loại hình đọc từ một bảng dữ liệu của lõi (`khu-va-loai-hinh`)
- Đầu chủ mở Hôm nay và đọc mỗi việc trên một dòng: tên căn, cột «Vì sao hôm nay» hai tầng — lý do chữ đậm, hạn đỏ khi quá, vàng khi còn dưới 15 phút — và giá; làm việc đầu của nhóm bằng đúng một nút, một chạm; việc còn lại nằm trong ⋯; hàng đợi, luật mỗi căn một hàng đợi và ghi kết quả của hàng 22 giữ nguyên (`lam-lai-hom-nay-dau-chu`)
- Telesales theo dõi lead đã nhập qua bốn nấc Đã gửi → Đã nhận → Đã gọi → Lên bảng, thấy lead bị trả lại kèm «Sửa số và gửi lại»; không thấy hàng (`lead-bon-nac`)
- Telesales nhập lead trên điện thoại: thiếu một mục thì chưa gửi được, gửi xong theo dõi được bốn nấc (`lead-dien-thoai`)
- Mỗi người làm việc với sàn là một liên hệ (RESO Contacts) — một người, nhiều số, nhiều loại liên hệ, một người giữ; lead và hàng gắn vào liên hệ chủ nhà (`lien-he`)
- Đầu khách lưu khách là một liên hệ loại Người mua hoặc Người thuê, gắn nhu cầu và Lần gửi vào liên hệ ấy qua nhu cầu khách; một khách hai số vẫn là một người; số khách không ra trang khách (`lien-he-khach`)
- Mọi thay đổi của hàng đi qua một lệnh API và thành sự kiện chỉ thêm; sáu trạng thái chuẩn, độ tươi và mức đủ thông tin tính ra từ sự kiện (`loi-hang-va-su-kien`)
- Đầu chủ giữ căn thấy chủ nhà, số điện thoại và giá đáy của căn mình; người khác trong sàn mở cùng hồ sơ thì không thấy, và mỗi lần mở số chủ thành một sự kiện (`lop-truong-nguon`)
- Mọi cửa ra lấy dữ liệu từ một bộ luật ẩn ở lõi, và bộ kiểm rò rỉ chứng không trường nội bộ nào có trong trang khách, kể cả trong mã nguồn trang; luật ẩn phủ cả liên hệ (mọi liên hệ không ra ngoài) và ngăn ảnh (chỉ ngăn Gửi được ra trang khách) (`luat-an-va-kiem-ro-ri`)
- Đầu khách chọn căn, xem trước đúng trang khách sẽ thấy, rồi mở bảng chia sẻ của điện thoại với link, ảnh và tin soạn sẵn; người tự bấm gửi trong Zalo (`luong-gui`)
- Số điện thoại chủ nhà nằm trong cơ sở dữ liệu ở dạng mã hoá; chỉ cửa «Mở số» giải ra số cho người được thấy, đọc thẳng bảng hay bản sao lưu không ra số (`ma-hoa-so-chu`)
- Màn Nhập Excel (65b): Đầu chủ — hay Trưởng nhóm nhập hộ — chọn tệp bảng hàng cũ, màn đọc tệp trong trình duyệt, ghép cột, cho thấy từng ô sẽ ghi gì, cho sửa ô và bỏ dòng, xem thử trên máy chủ từng dòng thành gì, rồi ghi qua đường ghi lần nhập của hàng 65a (`man-nhap-excel`)
- Mở sàn cho công ty mới trùng tên với sàn đang chạy thì được một sàn riêng; người của sàn mới không thấy dữ liệu sàn cũ (`mo-san-trung-ten`)
- Quản trị sàn mời người vào sàn, đặt vai và khu phụ trách; một người giữ được nhiều vai (`moi-nguoi-vai-khu`)
- Một nút chạy tay trên GitHub Actions nạp đủ dữ liệu mẫu (hàng sáu trạng thái, chủ nhà số mã hoá, lead có ca trùng, người phụ trách, tài khoản chủ kho) vào «[Mẫu] Sàn thử» trên bản thật, chạy lại không đổi gì, gỡ chỉ đúng sàn mẫu (`nap-mau-ban-that`)
- Gói danh mục Invest đẩy sang theo khuôn phiên bản 1 được nhận vào vùng danh mục dùng chung khi thoả thuận đang bật; gói sai khuôn hay thoả thuận tắt bị từ chối (`nhan-danh-muc-invest`)
- Bảng hàng và hồ sơ đọc từ kho trên máy nên lọc, cuộn, mở hồ sơ không chờ mạng; sửa ghi trên máy trước, rớt mạng vài phút không mất thay đổi (`nhanh-tuc-thi`)
- Đường ghi lần nhập (65a): một lần nhập file bảng hàng ghi qua đúng cửa của lõi hàng — hàng mới, cập nhật hàng mình giữ, tin bổ sung cho căn người khác giữ, chủ nhà và số vào liên hệ chủ nhà ở dạng bản mã, độ tươi theo ngày trong file; xem thử trả đúng điều lần ghi sẽ làm (`nhap-excel-xem-truoc-ghi`)
- Hoàn tác cả lần nhập (hàng 66): Đầu chủ hoàn tác cả một lần nhập; căn đã có người sửa sau đó được liệt kê, không bị gỡ; gộp Ngoài-3/4/5 của hàng 67 (luật 54) (`nhap-hoan-tac`)
- Lõi đọc một bảng hàng bẩn và nói được từng cột là gì, từng ô ra giá trị chuẩn nào hay vì sao không đọc được — không cần AI — trên bộ file thử có đáp án (`nhap-loi-tat-dinh`)
- Nhớ mẫu file (hàng 67): Đầu chủ nhập lại file cùng mẫu và thấy máy ghép sẵn như lần trước, kể cả cách gọi riêng của sàn; gộp Ngoài-3/Ngoài-7 của Màn Nhập Excel (luật 50) (`nhap-nho-mau`)
- Telesales nhập lead đủ năm mục trên máy tính và thấy ngay kết quả kiểm trùng: không trùng, đã có đầu chủ, hay căn đã có hàng mở (`o-nhan-lead`)
- Đầu chủ phát góc nhìn đang lọc ra ảnh, PDF hay Excel theo mẫu, kèm bài chép theo kênh; không cột nội bộ nào ra ngoài (`phat-hang`)
- Một màn của nhóm dựng ngoài khuôn làm bài kiểm của kho đỏ và gọi đúng tên tệp cùng khối cấm; chỉ sửa tài liệu hay hồ sơ thì bài kiểm im (`rang-giu-khuon`)
- Đầu chủ bấm «Sẵn sàng bán» và căn lên bảng hàng chung ngay khi máy kiểm đủ giá về tay, ảnh thật, pháp lý, tình trạng sử dụng; thiếu thì chỉ đúng chỗ thiếu (`san-sang-ban`)
- Mọi điểm sàn chỉnh được khai ở một sổ của lõi — khoá, kiểu, mặc định, khoảng cho phép, ai đổi, áp cho mới hay tính lại, lớp dữ liệu — và luật của lõi nhận cấu hình làm tham số thay vì đọc hằng số (`so-diem-bien-thien`)
- Số đo của hai tuần thử đọc được từ sự kiện của sàn thử: tỉ lệ xác nhận, mức đủ, mã tự điền, lead đến cuộc gọi đầu, lần phát, lượt mở, thao tác theo thiết bị và vai, lần mất mạng trên điện thoại (`so-do-hai-tuan-thu`)
- Sửa hàng loạt: đầu chủ tích nhiều căn trên Bảng hàng rồi đổi trạng thái hay đánh dấu đã gọi cho tất cả trong một lần, máy kể trước căn nào không đổi được (`sua-hang-loat`)
- Đầu chủ sửa giá, phí, trạng thái ngay trên ô; giá luôn kèm điều kiện phí, máy nói lại «Hiểu là…», sửa là vừa xác nhận với chủ nhà, hoàn tác được (`sua-tren-o`)
- Người dùng điện thoại cài Quỹ hàng lên màn hình chính, bật thông báo; đăng xuất hay báo mất máy thì dữ liệu trên máy bị xoá sạch (`tab-toi`)
- Kho có bộ chuẩn giao diện trước màn sản phẩm đầu tiên: thành phần ReUI, skill giao diện của kho, lint giao diện có mức nợ, sàn thiết kế M1 (`tang-5-giao-dien`)
- Chủ sản phẩm duyệt Cổng Phạm vi của một vòng chạm ô chưa có khuôn trên trang so ba lối — Trong kho, ReUI, Vẽ mới — dựng bằng lệnh, cùng khổ 1440 và 375, mỗi lối một câu đánh đổi, lời khuyên ghim trên trang; vòng có ô chưa có khuôn mà bỏ bước phân kỳ thì bài chấm đỏ, vòng chỉ đi khuôn sẵn thì không cần trang (`the-ba-loi`)
- Đầu chủ nhận thông báo lead trên điện thoại và máy tính, chạm vào thì mở đúng mục ở Hôm nay (`thong-bao-lead`)
- Khách mở link từ Zalo và thấy bộ căn mang tên sàn, giá sống kèm «giá xác nhận X ngày trước», căn đã cọc tự mờ, chạm «Quan tâm» được (`trang-khach-rieng`)
- Đầu chủ để lead và hàng chưa khoá nguồn ở «Chỉ tôi»; hàng lên «Toàn sàn» thì cả sàn mới thấy (`truc-ai-thay-hang`)
- Vá đổi giá căn Đã bán: máy chủ từ chối lệnh đổi giá trên căn Đã bán với lý do rõ, kể cả khi bản trên máy đã mới; bộ đồng bộ đưa lệnh ấy vào «Cần xem» (`va-doi-gia-can-da-ban`)
- Đầu chủ hoàn tác một lần sửa hay một lô mà máy không ghi được: thông báo nói đúng căn nào chưa trả về và vì sao, lần hoàn tác chưa xong vẫn bấm lại được, lỗi bất ngờ sau khi ô sửa đã đóng hiện thông báo thay vì im lặng (`va-duong-loi-hoan-tac`)
- Hàng vá va-gui-can-da-go: căn đã gỡ khi hoàn tác lần nhập không vào được Lần gửi mới và không ghi được sự kiện «Quan tâm» ở tầng cơ sở dữ liệu (Ngoài-2 hàng 66, luật 65) (`va-gui-can-da-go`)
- Vá mốc gọi đầu: lead đã trả lại thì máy chủ từ chối mốc gọi đầu của người giữ cũ, mốc không đổi; lead đang giữ vẫn ghi gọi đầu như cũ (`va-moc-goi-dau-lead-tra-lai`)
- Vá tiêu đề Cuộc gọi: trên điện thoại, đầu trang của màn ghi cuộc gọi hiện «Ghi cuộc gọi» thay vì «Căn call»; trang của một căn vẫn hiện mã căn như cũ (`va-tieu-de-goi`)
- Mọi lựa chọn khối của kho có một dòng máy đọc — khối đã chuyển thể ở danh mục giao diện, chỗ ghép hay tự viết ở «Chỗ hở» kèm điều đã tra trên ReUI, lý do và hạn xem lại; thiếu một ô thì npm run lint đỏ gọi đúng dòng (`vet-chon-khoi`)
- Người trong sàn mở Quỹ hàng và thấy đúng vỏ theo thiết bị và vai: trên máy tính thanh trên, cột nhà và cột góc nhìn; trên điện thoại bốn tab dưới; telesales chỉ Hôm nay và «+ Lead» (`vo-ung-dung`)
- Chủ sản phẩm duyệt một vòng giao diện và thấy màn mới đặt cạnh màn mẫu của nhóm, cùng khổ và cùng trạng thái; nhóm chưa có trong bản đồ thì chính vòng ấy tạo mục bản đồ và khuôn (`vong-giao-dien-qua-ban-do`)

## Đã giao

- Khi deploy, cơ sở dữ liệu tự bật hẳn hai ràng buộc chặn số chủ để rõ nếu bảng không còn số rõ; còn số rõ thì bỏ qua và nhắc chạy lệnh mã hoá lại (`bat-rang-buoc-ban-ma`)
- Bài kiểm chuyển dữ liệu cũ của hàng 85 không kẹt khoá với các bài kiểm gỡ ràng buộc chạy song song (`chuyen-khong-ket-khoa`)
- Đầu chủ điền mã căn cho hàng tạo từ lead chỉ biết toà — mở hồ sơ căn của hàng chưa có mã, gắn mã một lần, máy chặn trùng hàng đang mở cùng căn; hàng có mã thì thôi báo thiếu mã căn và xét ảnh như thường (`dien-ma-can-cho-hang`)
- Đổi đường API, mã lỗi và đường màn đăng nhập sang tiếng Anh, giữ nguyên hành vi và chữ trên màn (`doi-ten-api-tieng-anh`)
- Đầu chủ được giao lead mở số chủ nhà của lead ấy ở Hôm nay để gọi; mỗi lần mở là một vết (`mo-so-lead`)
- Môi trường chạy thật — Supabase dự án riêng và Vercel vùng Singapore, migration áp qua CI trước khi deploy, mã đăng nhập gửi qua Resend (`moi-truong-that`)
- Nâng kit nghiệm thu lên 2.36.0 và bật các nấc có căn cứ — gộp không dừng ở tệp sinh, phản biện bắt buộc, chặn việc ngoài lộ trình, máy tự định tuyến mục ngoài hợp đồng (`nang-kit-2-36-0`)
- Vá nạp mẫu bản thật — căn mẫu Đang bán nhận một ảnh thật vẽ bằng mã trước khi lên Đang bán, để nút «Nạp dữ liệu mẫu» chạy trọn trên sàn mới sau luật ảnh thật của hàng 23 (`nap-mau-co-anh`)
- Phiên đăng nhập giữ 30 ngày thay vì 7, vẫn trượt theo ngày dùng (`phien-dang-nhap-30-ngay`)
- Đầu chủ tải ảnh điện thoại tới 10 MB lên hồ sơ căn trên bản thật mà không bị chặn ở giới hạn máy chủ, mở lại hồ sơ không thấy ảnh vỡ, và thấy lời báo khi sửa hay xoá ảnh không thành (`va-anh-ban-that`)
- Vá Che vùng ảnh — trên máy tính khung vẽ nằm gọn trong hộp che ở mọi cỡ ảnh, ảnh co theo khung; điện thoại giữ như cũ (`va-che-vung-anh`)
- Vá Điền mã căn — mã căn phải có ít nhất một chữ hay số; mã toàn dấu bị từ chối với lời báo rõ, không khoá hàng (`va-dien-ma-can-cho-hang`)
- Vá Hệ bố cục — mỗi mục của Hôm nay ở cột thứ hai mở đúng chỗ của nó, mục chưa có chỗ thì báo rõ, không mục nào bấm mà không phản hồi (`va-he-bo-cuc`)
- Vá hàng 85 «Liên hệ» — ca cách ly cho bảng nối lead với hàng, và hàng tạo từ lead báo «chưa có chủ nhà» thay vì trả tên trống (`va-lien-he`)
- Vá mã căn của lead — lead nhập mã căn toàn dấu bị từ chối ngay lúc nhập với lời báo như hồ sơ hàng; tạo hàng và gửi lại từ lead cũ mang mã rác không còn hỏng (`va-ma-can-lead`)
- Nút «Nạp dữ liệu mẫu» chạy được trên bản thật và không mở đường chèn lệnh qua ô email; bộ nạp của gói db được kiểm kiểu; lệnh chấm bộ dữ liệu mẫu hàng 5 chạy lại được (`va-nap-mau`)
- Vá bài kiểm Nạp mẫu có ảnh — ca kho Storage dùng đúng kho bước chọn kho dựng, có đối chứng dương, phá thử thì đỏ (`va-nap-mau-co-anh`)
- Vá Sẵn sàng bán — chuyển căn hay điền xong thì «Còn thiếu» và «Chưa có» làm mới đúng căn đang xem; nút chỉ báo đã gửi khi lệnh vào hàng đợi, không vào thì báo lỗi và giữ nút bấm lại được (`va-san-sang-ban`)
- Vá sửa trên ô: dòng «Hiểu là» đọc lại đúng số máy ghi, không làm tròn; nút Hoàn tác trên thông báo hoàn tác đúng lần sửa của chính nó và không ghi đè lần sửa sau (`va-sua-tren-o`)
- Vá Thông báo lead — chỉ nhận địa chỉ của dịch vụ đẩy đã biết; gửi có thời hạn, không treo lối giao lead, không gửi trùng; lưu đăng ký hỏng thì dải bật vẫn hiện và báo (`va-thong-bao-lead`)
