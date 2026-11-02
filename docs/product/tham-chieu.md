# Quỹ hàng: tài liệu tham chiếu

> **Nguồn chính từ 29/10/2026.** Sửa ở đây, qua PR. Tài liệu thiết kế trên claude.ai ([liên kết](https://claude.ai/artifact/B12d9FDirVB9vEA8gSChLe)) giữ để đọc lại và bình luận, không còn là bản hiện hành. Chữ «tab này» bên dưới nghĩa là tệp này.

Bản 29/10. Tab này ghi **điều đang đúng** của sản phẩm, gom từ bốn tab làm việc và 41 màn phác thảo. Lý do, ghi chép phỏng vấn và lịch sử chỉnh nằm ở các ghi chép làm việc trong [`ghi-chep/`](ghi-chep/). Khi tab này và một tab làm việc nói khác nhau, tab này thắng. Mỗi điều ghi rõ **Đã chốt** (kèm ngày) hay **Đề xuất**.

Phác thảo: [Phác thảo UX quỹ hàng](https://claude.ai/artifact/VESE23ChnX6oSC3X73Bzwf) · Kỹ thuật: [Kiến trúc repo và stack](../architecture/kien-truc-repo-va-stack.md)

## 1. Sản phẩm trong một trang

- **Quỹ hàng** là ứng dụng quản lý hàng cho sàn môi giới: nhận lead chủ nhà, biến thành căn sẵn sàng bán, giữ tươi, rồi phát cho đầu khách và khách.
- **Việc thật**: khi khách hỏi, tìm ra căn khớp và gửi được trong vài phút, trước khi khách hỏi người khác — mà không để lộ nguồn chủ nhà.
- **Thay cho** Google Sheet và nhóm Zalo. Thắng Sheet ở năm chỗ: gõ mã căn là đủ thông tin; giá luôn kèm điều kiện phí; độ tươi tự tính; gửi khách bằng link sống; nguồn chủ nhà được giữ kín ngay trong sàn.
- **Chỗ đứng** — Đã chốt 29/10: ứng dụng riêng thuộc phía cung của OneHub Platform, đọc dữ liệu từ OneHub Invest một chiều; không phải cổng thứ ba của Invest.
- **Người dùng đầu tiên**: chính đội, một khu căn hộ thứ cấp.
- **Bản đầu xong khi** một đội bỏ hẳn Google Sheet cho một khu trong hai tuần và không muốn quay lại.

**Kiểu sản phẩm** — Đã chốt 29/10 (ADR-0017): Quỹ hàng là SaaS cho ngành bất động sản, linh hoạt theo công ty và theo kết nối. Kiến trúc dựng cơ chế; mỗi kết nối với Invest, Platform hay công ty khác là một thoả thuận bật / tắt, chỉ mở được tới trần của từng lớp dữ liệu. Trần là bất biến: thông tin chủ nhà không bao giờ rời công ty. Chi tiết: [Kiến trúc repo và stack](../architecture/kien-truc-repo-va-stack.md), mục 0.

**Loại phần mềm và chuẩn đối chiếu** — Đã chốt hướng 01/11 (ADR-0022): phần mềm phía cung cho một sàn môi giới, gồm ba khối — quỹ hàng nội bộ (một kiểu MLS thu nhỏ trong sàn), khai thác và CRM phía chủ nhà, phát hàng bằng link sống. Không phải cổng đăng tin, MLS liên sàn, CRM người mua, phần mềm giao dịch hay công cụ gửi tự động. Thiết kế so với RESO và ít nhất hai sản phẩm cùng loại; danh sách cố định trong câu giao mặc định là dữ liệu của sàn. Chi tiết: [ADR-0022](../adr/0022-dinh-vi-va-chuan-doi-chieu.md), [Đối chiếu ngành](doi-chieu-nganh.md).

## 2. Vai và thiết bị

Ghi nhận 29/10: **đầu chủ làm việc trên máy tính; đầu khách xem bảng hàng trên điện thoại.** Đây là căn cứ chia nguồn lực ở mục 10 và ở thứ tự dựng.

| Vai | Việc | Thiết bị chính | Trên thiết bị kia | Không thấy |
| --- | --- | --- | --- | --- |
| Telesales | Gọi lọc chủ nhà, nhập lead | Máy tính (đề xuất, chưa hỏi) | Điện thoại: nhập lead, theo dõi bốn nấc | Bảng hàng, căn của người khác |
| Đầu chủ | Biến lead thành hàng, giữ tươi, gọi điều chỉnh giá, cho dẫn xem | **Máy tính** | Điện thoại: nhận báo lead, ghi kết quả gọi, đổi giá nhanh, chụp ảnh khi đi xem | Chủ nhà của đầu chủ khác |
| Đầu khách | Tìm căn, gửi khách, dẫn xem | **Điện thoại** | Máy tính: lọc và gửi khi ngồi văn phòng | Chủ nhà, số chủ, giá đáy, ảnh sổ |
| Trưởng nhóm | Chia lead, xem phễu, xử lý ngoại lệ, bàn giao | Máy tính | Điện thoại: báo lead quá hạn | — (thấy như đầu chủ, cho cả nhóm) |
| Quản trị sàn | Cấu hình sàn | Chỉ máy tính | — | Không tự thấy chủ nhà |
| Khách / môi giới sàn khác | Xem hàng được gửi | Điện thoại (khách riêng) · máy tính (nhóm môi giới) | — | Mọi phần nội bộ |

Một người giữ được nhiều vai (đầu chủ kiêm đầu khách là thường); môi giới một mình là sàn một người.

**Ưu tiên nguồn lực theo thiết bị** — Đề xuất:

- **Máy tính là bàn làm việc của đầu chủ — làm sâu nhất.** Bảng hàng sửa trên ô, Hôm nay, hồ sơ căn, màn cuộc gọi, nhập Excel, phát hàng, cài đặt. Đây là chỗ người dùng so với Sheet đầu tiên và tốn công nhất.
- **Điện thoại là bảng hàng của đầu khách — nhanh, đọc là chính.** Bảng hàng dạng thẻ, hồ sơ căn không có phần chủ nhà, Hôm nay của đầu khách, luồng Gửi, Đã gửi. Gần như không sửa dữ liệu.
- **Điện thoại của đầu chủ chỉ là bản mang theo**: báo lead, kết quả gọi một chạm, đổi giá nhanh, ảnh. Màn cuộc gọi trên máy tính (KD1, KD2) là bản chính; bốn màn cuộc gọi trên điện thoại (K1–K4) lùi thành dự phòng.
- **Trang khách luôn điện thoại trước**, vì khách mở từ Zalo.

Ghi nhận này đổi bốn chỗ:

- **Ngoại tuyến trên điện thoại** (đã chốt 28/10: chỉ ở mobile, đo trước khi làm) nay chủ yếu là **đọc**: đầu khách ở hầm toà, căn mẫu vẫn xem được bảng hàng, hồ sơ và ảnh gửi được. Phần ghi ngoại tuyến thu lại còn kết quả gọi và đổi giá của đầu chủ khi đi ngoài.
- **«Đầu chủ gọi bằng máy nào»** còn lại nửa sau: máy tính biết đang có cuộc gọi bằng cách nào — bấm Gọi để điện thoại quay số, hay nối tổng đài.
- **Nhận ảnh từ Zalo**: đường chính là kéo hoặc dán ảnh từ Zalo trên máy tính vào hồ sơ căn; chia sẻ từ Zalo trên điện thoại là đường phụ.
- **Màn còn thiếu quan trọng nhất là Hôm nay của đầu khách trên điện thoại**, xếp trước Đã gửi trên máy tính.

## 3. Dây chuyền và các cửa

Telesales tìm chủ nhà → đầu chủ biến cuộc gọi thành căn sẵn sàng bán → bảng hàng chung của sàn → đầu khách đem đi bán → khách.

- **Ba cửa vào, một đích**: lead (telesales nhập hoặc đầu chủ tự nhập) · nhập Excel · nhận căn từ tin đã thu (Sau). Cả ba qua cùng một bước kiểm trùng theo căn và theo chủ nhà.
- **Ba cửa ra**: Gửi (link, ảnh + tin) · Phát hàng (bảng hàng ra ảnh, PDF, Excel) · Đăng Platform (Sau). Cùng một bộ luật ẩn, cùng ghi công.
- **Hai hệ thống nối vào, đều một chiều**. Invest → Quỹ hàng: danh mục căn, số thị trường tổng hợp, tin rao công khai để đối chiếu; không số AirDNA, không danh mục S08 nguyên văn. Quỹ hàng → Platform: chỉ căn đầu chủ chọn đăng, đủ mức thông tin, đã bỏ phần nội bộ.

Hai kết nối trên là thoả thuận đang bật, không phải dây cứng: Invest đẩy vào, Platform nhận hàng ra và đưa khách về. Chiều giá chốt về Invest đang tắt; bật là quyết định kinh doanh có điều khoản với sàn.

## 4. Đối tượng

| Đối tượng | Là gì | Thuộc ai | Luật |
| --- | --- | --- | --- |
| Danh mục: khu (`SubdivisionName`) → toà / phân khu → trục / dãy → căn; căn mang loại hình RESO | Vật thể; thuộc tính tự điền từ mã | Dùng chung mọi sàn | Khoá; sai thì «Báo sai thông tin căn» |
| Hàng | Lần chào bán của sàn trên một căn. Lead là bản ghi riêng tới khi đầu chủ nhận rồi thành hàng ở nấc đầu, có thể mới biết toà (ADR-0012) | Sàn | Mỗi sàn tối đa một hàng đang mở trên một căn — gốc của kiểm trùng |
| Chủ nhà · Liên hệ | Một người của sàn (RESO `Contacts`): tên, các số, loại Chủ bán · Chủ cho thuê · Người mua · Người thuê, người giữ; các căn của người đó, giá đáy từng nói theo từng căn (ADR-0021) | Người giữ + trưởng nhóm | Một chủ nhiều căn → một đầu chủ; một số chỉ thuộc một người trong sàn |
| Sự kiện | Nhập lead, gọi, xác nhận, đổi giá, đổi trạng thái, nhập file, gửi, mở số chủ | Sàn | Chỉ thêm, không sửa; ghi người và vai lúc làm |
| Ảnh | Ba ngăn: gửi được · tự có từ mã · nội bộ | Căn trong sàn; lần rao chọn ảnh | Ngăn nội bộ không bao giờ ra ngoài, không lưu trên máy |
| Lịch xem | Đầu khách xin dẫn khách xem, đầu chủ hẹn với chủ / người thuê | Sàn | Không lộ số chủ cho đầu khách |
| Lần gửi | Một link (một căn hoặc bộ căn), gửi cho ai, lượt mở, lượt quan tâm | Người gửi | Chỗ ghi công |
| Góc nhìn | Bộ lọc + cột + cách xem đã lưu | Người hoặc cả đội | Thay các tab của Sheet |
| Tin rao ngoài | Tin công khai Invest thu được, đã khớp căn | Chỉ đọc, chỉ đầu chủ thấy | Đối chiếu, không phát ra |
| Cấu hình sàn | Cách gọi riêng, trường riêng, trạng thái riêng, luật chia lead, thuế phí, mẫu | Sàn | Mọi thay đổi vào nhật ký, không sửa số đã lưu |

**Căn và lần rao tách theo nhịp đổi.** Thuộc tính căn (diện tích, phòng ngủ, hướng, vị trí tách từ mã) gần như không đổi. Phần của lần rao (giá + điều kiện phí, nội thất, pháp lý, tài chính, tình trạng sử dụng, đầu chủ, mức hiển thị, ghi chú) đổi hằng tuần. Độ tươi, mức đủ thông tin và lịch sử trả giá đều tính từ sự kiện, không ai phải điền.

## 5. Vòng đời của hàng

Sáu trạng thái chuẩn; nhãn của sàn nằm trên.

| Trạng thái chuẩn | Nhãn mặc định | Vào khi | Trên bảng hàng chung |
| --- | --- | --- | --- |
| Chưa đủ để rao | Lead mới · Đang khai thác | Telesales hoặc đầu chủ nhập | Không |
| Đang bán | Còn hàng | Bấm «Sẵn sàng bán», qua điều kiện máy kiểm | Có |
| Đang giao dịch | Đã cọc · Giữ chỗ (riêng sàn) | Có cọc hoặc giữ chỗ | Có, không gửi mới được |
| Đã bán | Đã bán | Sàn mình chốt; bắt buộc giá chốt | Không; vào lịch sử |
| Tạm ngừng | Tạm ngừng bán | Chủ tạm dừng, đang sửa nhà… | Không |
| Ngừng hẳn | Ngừng — chủ đã bán nơi khác · chủ đổi ý · không liên lạc được | Kết quả gọi; bắt buộc lý do | Không |

- **Một bộ kết quả gọi ở mọi màn**: Còn / giữ giá · Đổi (hạ) giá · Đã cọc / bán… · Không nghe máy. «Đã cọc / bán…» hỏi tiếp: cọc, sàn mình bán (giá chốt), hay chủ bán nơi khác (Ngừng).
- **Đổi trạng thái không xoá dữ liệu**: căn đã bán giữ giá chốt và ngày bán — nguồn giá giao dịch thật.
- **Sàn thêm nhãn, không thêm nghĩa**: «Giữ chỗ» phải neo vào một trạng thái chuẩn và nhận luật, màu của trạng thái đó; không có trạng thái thứ bảy.
- Tên tiếng Anh theo RESO `StandardStatus` — máy điền 29/10, chốt khi viết lõi: Chưa đủ để rao `Incomplete` · Đang bán `Active` · Đang giao dịch `Pending` · Đã bán `Closed` · Tạm ngừng `Hold` · Ngừng hẳn `Withdrawn`.
- Bảng chuyển — Đã chốt 30/10 (ADR-0008): Chưa đủ để rao → Đang bán · Tạm ngừng · Ngừng hẳn; Đang bán → Đang giao dịch · Đã bán · Tạm ngừng · Ngừng hẳn; Đang giao dịch → Đang bán (khách bỏ cọc) · Đã bán · Ngừng hẳn; Tạm ngừng → Đang bán · Ngừng hẳn; Đã bán và Ngừng hẳn là nấc cuối — mở lại là hàng mới.

## 6. Quyền

- **Trục 1 — ai trong sàn thấy hàng**: Chỉ tôi → Nhóm → Toàn sàn. Lead và hàng chưa khoá nguồn mặc định «Chỉ tôi»; «Sẵn sàng bán» đưa lên «Toàn sàn».
- **Trục 2 — hàng ra ngoài bằng cửa nào**: không ra · gửi tay (link, ảnh + tin, bảng hàng) · đăng Platform.
- **Lớp trường, phủ cả hai trục**: chủ nhà, số điện thoại, giá đáy, ảnh sổ chỉ đầu chủ giữ căn và trưởng nhóm thấy; không bao giờ ra ngoài sàn. Mỗi lần mở số chủ là một sự kiện.
- **Quyền cấu hình tách khỏi quyền xem nguồn**: quản trị sàn không tự động thấy chủ nhà.
- **Quyền là lớp phủ trên cùng một màn**: đầu khách mở đúng hồ sơ căn đó, phần chủ nhà thay bằng «Xin dẫn xem» và «Liên hệ đầu chủ».
- **Nhiều sàn trên một nền** — Đã chốt 28/10: mỗi sàn một vùng riêng; chỉ danh mục là dùng chung. Hệ thống biết hai sàn cùng giữ một căn nhưng không cho bên này thấy hàng bên kia. Cách ly đặt ở kho dữ liệu; kiểm thử «sàn này không thấy gì của sàn kia» là cổng bắt buộc trước mỗi lần phát hành.

## 7. Mỗi sàn một cách gọi, dữ liệu một chuẩn

Đã chốt 28/10 (ba lớp) và 29/10 (trường riêng mức tối thiểu vào bản đầu).

| Lớp | Gồm | Ai đổi | Ví dụ |
| --- | --- | --- | --- |
| Lõi chuẩn | Căn, lần rao, giá + điều kiện phí, trạng thái chuẩn, sự kiện — theo RESO | Chỉ đội sản phẩm | Diện tích, hướng, «Đang giao dịch» |
| Cách gọi riêng | Tên hiển thị của trường chuẩn; giá trị riêng neo vào giá trị chuẩn; bộ nhớ ghép cột Excel | Quản trị sàn | «Phí CN» là điều kiện phí; «BP» là Bao phí |
| Trường riêng | Trường thật sự mới. Bản đầu: «có / không» và «chọn một»; chữ, số, ngày để sau | Quản trị sàn | «Căn góc» |

- **Ba câu hỏi theo thứ tự** trước khi thêm gì: cùng nghĩa khác tên → đổi tên; cùng trường khác giá trị → thêm giá trị riêng neo vào chuẩn; thật sự mới → trường riêng. Máy dò trùng nghĩa trước khi tạo trường riêng.
- **Trường riêng ở lại trong sàn**: hiện ở bảng hàng và hồ sơ, lọc và lưu góc nhìn được, nhập Excel ghép vào được; không lên trang khách, không vào số liệu thị trường, không lên Platform; kèm khi phát hàng cho đội khác thì bật từng trường.
- **Không làm, có chủ ý**: không đối tượng mới, không công thức, không bố cục tự dựng.
- **Con số và lựa chọn trong tab này là mặc định dựng sẵn** — Đã chốt 29/10: hạn, ngưỡng, tỉ lệ, cách hiện trên trang khách là mặc định của sàn, sàn chỉnh được ở Cài đặt sàn; chỉ bất biến (mục 1, mục 6) là không mở. Tính năng dựng và thử bằng dữ liệu mẫu có nhãn; có người dùng thật thì chỉnh dần.

## 8. Luật sản phẩm

**Xem và tìm**

1. Vị trí bất khả xâm phạm: toà, tầng, trục không đổi chỗ; lọc trên bản vị trí là tô sáng, không giấu.
2. Cách xem chính theo loại hàng: thứ cấp là danh sách, sơ cấp là lưới.
3. Dày như Sheet; một căn một hồ sơ — cuộc gọi, ảnh, đổi giá, lịch xem là phần hay chế độ của hồ sơ, không có trang thứ hai.
4. Bộ lọc và căn đang chọn đi theo người khi đổi cách xem hay sang Gửi, Phát hàng.
5. Dùng đúng chữ của nghề; chữ trên màn là «đầu chủ», không «người giữ».

**Sửa và nhập**

6. Chỉ sửa trên ô phần của lần rao; thuộc tính căn khoá. Sửa trên ô chỉ có ở danh sách trên máy tính; điện thoại dùng nút kết quả gọi và màn sửa nhanh. Hàng tạo khi mới biết toà được gắn mã căn đúng một lần ở hồ sơ căn; căn đã có hàng đang mở khác của sàn thì máy chặn và chỉ hàng kia (ADR-0026).
7. Giá luôn đi cùng điều kiện phí; máy nói lại «Hiểu là…»; đổi quá khoảng 20% thì hỏi lại.
8. Không có nút Lưu; mỗi lần sửa là một sự kiện, hoàn tác được.
9. Sửa giá hay trạng thái mặc định tính là vừa xác nhận với chủ nhà — Đã chốt 28/10.
10. Hai người cùng sửa một căn thì báo, không âm thầm ghi đè; «Đã bán» và «Đã cọc» thắng ngay.
11. Nhập Excel ghép cả cột lẫn giá trị, nhớ mẫu file, xem trước rồi mới ghi, không bỏ mất cột nào, hoàn tác được cả lần nhập; ngày xác nhận lấy theo file.

**Giá**

12. So giá luôn quy về giá chủ nhận về tay; không so giá bao phí với giá không bao phí.
13. Mỗi giá bao phí mang kèm định nghĩa bao phí của sàn lúc tính; đổi tỉ lệ chỉ áp cho lần tính mới.
14. Máy đưa sự thật, không đề xuất mức giá nên ép.

**Độ tươi, mức đủ, hàng đợi**

15. Độ tươi là ngày xác nhận gần nhất với chủ nhà; căn nhạt dần theo tuổi.
16. Mức đủ thông tin tự tính, và chính là danh sách hỏi của màn cuộc gọi.
17. «Sẵn sàng bán» một chạm: máy kiểm giá về tay, ảnh thật, pháp lý, tình trạng sử dụng; không qua người duyệt.
18. Chỉ Hôm nay được đẩy việc; mỗi căn nằm ở đúng một hàng đợi (điều chỉnh giá thắng gọi lại). Mặc định: cần gọi lại sau 14 ngày chưa xác nhận; nên gọi điều chỉnh giá sau 10 ngày (sàn chỉnh trong 7–14).

**Lead**

19. Năm mục bắt buộc: số chủ nhà, căn hoặc toà, nhu cầu, giá kèm điều kiện phí, thời gian muốn ra hàng.
20. Kiểm trùng lúc nhập: chủ nhà đã có đầu chủ thì về người đó; căn đã có hàng mở thì thành tin bổ sung (vẫn cho «Bỏ lead này», có ghi lại); còn lại chia theo luật của sàn. Hạn nhận 15 phút, hạn gọi lần đầu 30 phút; quá hạn thì báo trưởng nhóm. Cả hai là mặc định, sàn chỉnh ở Cài đặt sàn.
21. Telesales thấy kết quả của lead, không thấy hàng.

**Gửi và trang khách**

22. Người luôn là người bấm gửi: hệ thống không gửi hộ, không đăng vào nhóm, không tự trả lời.
23. Mọi cửa ra dùng chung một bộ luật ẩn; thêm cửa mới là nối vào bộ luật đó.
24. Gửi khách riêng ẩn mã căn, chỉ hiện toà + tầng cao / thấp; gửi nhóm môi giới hiện đủ mã — Đã chốt 28/10.
25. Chỉ căn còn hàng mới gửi được; quá 14 ngày chưa xác nhận thì nhắc gọi trước. Gửi cần mạng — không gửi bảng giá cũ.
26. Trang khách mang tên sàn, nói lời khách hiểu, giá và trạng thái sống; căn đã cọc tự mờ đi.

**Ảnh**

27. Ảnh thuộc căn, lần rao chọn ảnh hiện; nhãn «Ảnh thật · ngày chụp» hoặc «Ảnh mẫu»; ảnh tin rao của người khác không vào ngăn gửi được.
28. Ảnh sổ, giấy tờ lưu ở ngăn nội bộ, chỉ đầu chủ giữ căn và trưởng nhóm xem — Đã chốt 28/10.
29. Che một vùng trước khi gửi; gửi bản nhẹ, giữ bản gốc.

**Nhanh và ngoại tuyến** — Đã chốt 28/10

30. Nhanh tức thì từ bản đầu: dữ liệu giữ sẵn trên máy, ghi trên máy trước, gửi lên sau.
31. Ngoại tuyến thật chỉ ở điện thoại, đo trước khi làm; luôn nói rõ đang ở đâu; đụng nhau thì hỏi.
32. Mang theo ít: điện thoại giữ căn của mình, Hôm nay và góc nhìn đã ghim; số chủ chỉ của căn mình giữ; đăng xuất hay báo mất máy thì xoá sạch.

## 9. Điều hướng

Vỏ và cách xếp nhà chọn từ kho ReUI — Đã chốt 30/10 (ADR-0002); khối của từng màn ở `docs/design/vo-va-ia.md`.

- **Một địa chỉ cho một thứ; màn tự đổi theo thiết bị và vai.** Bảng hàng trên máy tính là bảng kiểu Sheet, trên điện thoại là thẻ; Hôm nay của đầu chủ là hàng đợi, của đầu khách là dòng phản ứng của khách. Link mở trên máy nào cũng đúng chỗ. Một người nhiều vai thấy hợp các nhà của mọi vai.
- **Máy tính** — ba tầng:
  - Thanh trên: chọn sàn (chỉ hiện khi người thuộc hơn một sàn) / chọn khu · ô «Gõ mã căn» ở giữa · menu Tạo · chuông báo · tài khoản. **Menu Tạo** (hàng 91): việc tạo đầu của vai là nút chính một chạm, các việc còn lại (Lead · Nhập Excel · Phát hàng theo vai) trong menu; vai không có việc tạo không thấy nút; màn không đặt nút tạo riêng. Điện thoại: nút «+» trên thanh trên chỉ mở «+ Lead» (không Nhập Excel, Phát hàng); telesales nhận lead bằng tab Lead nên không có nút «+».
  - Cột nhà bằng biểu tượng: Hôm nay · Bảng hàng · Đã gửi · Đội (trưởng nhóm) · Cài đặt sàn (quản trị, ở đáy).
  - **Cột thứ hai luôn có và mặc định mở** ở mọi nhà (hàng 91, chủ kho 02/11); ai gập thì máy nhớ theo người, sàn, nhà. Góc nhìn đã lưu vẫn một chạm ở nút «Góc nhìn» đầu thanh công cụ của bảng.
  - Cột thứ hai theo nhà: Bảng hàng → góc nhìn của đội, góc nhìn của tôi, «+ Lưu góc nhìn», chân cột là độ tươi của bảng · Đã gửi → Link đã gửi · Lịch xem · Cài đặt sàn → các mục cài đặt · Hôm nay → các hàng đợi của bộ nhóm · Đội → Tổng quan.
  - **Mọi màn có đường dẫn** (nhà › màn) ở đầu màn; điện thoại chỉ hiện mục cha làm lối về «‹ cha» (hàng 91). Điều khiển cấp màn (chọn kỳ, khoảng ngày) và nút nằm bên phải đầu màn; cạnh tiêu đề chỉ có nhãn.
  - Hồ sơ căn trượt ra trong ngăn bên phải đè lên bảng, bảng vẫn bấm được — bấm dòng khác thì ngăn đổi hồ sơ (hàng 91, theo `sheet-9`); mở toàn màn khi cần, toàn màn là một cột căn giữa.
- **Điện thoại**: thanh trên mảnh (tên nhà · gõ mã căn · chuông); bốn tab dưới — Hôm nay · Bảng hàng · Gửi · Tôi. Gửi gồm Đã gửi và nút gửi mới. Không có Đội, Cài đặt sàn, Nhập Excel, Phát hàng.
- **Telesales**: không cột nhà, không ô gõ mã căn. Máy tính: thanh trên chỉ có Hôm nay và «+ Lead». Điện thoại: Hôm nay · Lead · Tôi.
- **Mở app vào Hôm nay**; người chỉ giữ vai quản trị vào Cài đặt sàn.
- **Người chỉ giữ vai Quản trị sàn trên điện thoại** có hai tab Cài đặt sàn · Tôi — ngoại lệ của dòng điện thoại, vì
  không có nhà nào khác (chốt ở Cổng Phạm vi vỏ ứng dụng, 31/10).
- **Ô «Gõ mã căn» chỉ ở vai có Bảng hàng** (Đầu chủ, Đầu khách, Trưởng nhóm); Telesales và người chỉ quản trị sàn không
  có (chốt 31/10). Cột thứ hai mở hay gập được nhớ theo người, sàn đang làm và nhà.
- **Trang khách và đăng nhập không có vỏ.** Trang khách là một link công khai, không đăng nhập, mang tên sàn và người gửi.

| Nhà và nút | Telesales | Đầu chủ | Đầu khách | Trưởng nhóm | Quản trị sàn |
| --- | --- | --- | --- | --- | --- |
| Hôm nay | Có | Có | Có | Có | — |
| Bảng hàng | — | Có | Có | Có | — |
| Đã gửi (điện thoại: Gửi) | — | — | Có | Có, cả nhóm | — |
| Đội | — | — | — | Có | — |
| Cài đặt sàn | — | — | — | — | Có |
| + Lead | Có | Có | — | Có | — |
| Nhập Excel | — | Có | — | Có | — |
| Phát hàng | — | Có | — | Có | — |

Mỗi nhà trả lời một câu: Hôm nay — giờ làm gì? · Bảng hàng — có hàng gì, ở đâu? · Đã gửi — khách đang phản ứng ra sao? · Đội — đội đang chạy thế nào? · Cài đặt sàn — sàn gọi tên và chạy theo luật nào?

| Đường dẫn | Màn |
| --- | --- |
| /today | Hôm nay |
| /inventory · ?view=list · ?view=position · ?unit=\<mã> | Bảng hàng: danh sách, vị trí, kèm hồ sơ căn đang mở |
| /inventory/views/\<id> | Góc nhìn đã lưu |
| /units/\<mã> · /units/\<mã>/call | Hồ sơ căn toàn màn · chế độ cuộc gọi |
| /leads/new | Ô nhận lead |
| /imports/new · /imports/\<id> | Nhập Excel |
| /shares · /shares/new | Đã gửi · luồng Gửi |
| /viewings | Lịch xem |
| /exports/new | Phát hàng |
| /team | Đội |
| /settings/labels · /fields · /statuses · /lead-routing · /fees · /templates | Cài đặt sàn |
| /settings · /settings/users | Cài đặt sàn (mở vào Người dùng) · Người dùng |
| /me | Tôi (tab điện thoại; menu tài khoản trên máy tính) |
| /s/\<mã link> | Trang khách |

## 10. Danh mục màn và ưu tiên

**P0** dựng trước, đủ để chạy hai tuần thử · **P1** cùng bản đầu, dựng sau · **P2** sau hoặc dự phòng. Mã phác thảo theo tên bảng trên canvas; phương án ban đầu A, B, C giữ để lưu vết.

| Nhà | Màn | Vai · thiết bị | Phác thảo | Giai đoạn | Ưu tiên |
| --- | --- | --- | --- | --- | --- |
| Hôm nay | Hàng đợi của đầu chủ | Đầu chủ · máy tính | 1 | Bản đầu | P0 |
| Hôm nay | Hôm nay của đầu khách: căn mới lên bảng, căn đã gửi vừa đổi, khách vừa mở hay quan tâm, lịch xem | Đầu khách · điện thoại | M6 | Bản đầu | P0 |
| Hôm nay | Lead đã nhập và bốn nấc — có từ hàng 27 (ADR-0020) | Telesales · cả hai | L1 (cột phải), L5 | Bản đầu | P0 |
| Hôm nay | Hàng đợi của đầu chủ, bản mang theo | Đầu chủ · điện thoại | M1 | Bản đầu | P1 |
| Hôm nay | Lead quá hạn, hàng cũ theo người, ngoại lệ | Trưởng nhóm · máy tính | TN1 | Bản đầu | P1 |
| Bảng hàng | Bảng kiểu Sheet, sửa trên ô | Đầu chủ · máy tính | 2, 2b | Bản đầu | P0 |
| Bảng hàng | Bảng hàng dạng thẻ, lọc theo nhu cầu khách | Đầu khách · điện thoại | M4 | Bản đầu | P0 |
| Bảng hàng | Vị trí: lưới toà | Máy tính | 3 | Sau | P2 |
| Bảng hàng | Vị trí: bản đồ lô thấp tầng | Máy tính | chưa phác | Sau | P2 |
| Hồ sơ căn | Cột hồ sơ, ảnh | Đầu chủ · máy tính | 2, M5 | Bản đầu | P0 |
| Hồ sơ căn | Màn hồ sơ; với đầu khách phần chủ nhà thay bằng «Xin dẫn xem» | Đầu khách · điện thoại | M3 (vẽ cho đầu chủ) | Bản đầu | P0 |
| Hồ sơ căn | Chế độ cuộc gọi: khai thác, ép giá | Đầu chủ · máy tính | KD1, KD2 | Bản đầu | P0 |
| Hồ sơ căn | Đổi giá / trạng thái nhanh | Đầu chủ · điện thoại | M2 | Bản đầu | P1 |
| Hồ sơ căn | Chế độ cuộc gọi trên điện thoại | Đầu chủ · điện thoại | K1–K4 | Dự phòng | P2 |
| Cửa vào | Ô nhận lead | Telesales · máy tính | L1–L3 | Bản đầu | P0 |
| Cửa vào | Ô nhận lead | Telesales · điện thoại | L4, L5 | Bản đầu | P1 |
| Cửa vào | Nhập Excel: ghép cột, xem trước | Đầu chủ, trưởng nhóm · máy tính (quản trị chỉ quản mẫu file, ADR-0011) | N1, N2 | Bản đầu | P0 |
| Cửa ra | Gửi: chọn → xem trước → chia sẻ → theo dõi | Đầu khách · điện thoại | G1–G4 | Bản đầu | P0 |
| Cửa ra | Trang khách: khách riêng | Khách · điện thoại | T1–T3 | Bản đầu | P0 |
| Cửa ra | Trang khách: nhóm môi giới | Môi giới sàn khác · máy tính | T4 | Bản đầu | P1 |
| Cửa ra | Phát hàng | Đầu chủ, trưởng nhóm · máy tính | D | Bản đầu | P1 |
| Đã gửi | Link đã gửi, lượt mở, quan tâm | Đầu khách · điện thoại | G4 | Bản đầu | P0 |
| Đã gửi | Xin dẫn xem, lịch xem | Đầu khách ↔ đầu chủ | chưa phác, chờ phỏng vấn | Bản đầu | P1 |
| Đã gửi | Bản máy tính | Máy tính | chưa phác | Bản đầu | P2 |
| Đội | Phễu, hàng theo người, bàn giao | Trưởng nhóm · máy tính | chưa phác | Sau | P2 |
| Cài đặt sàn | Cách gọi riêng, trạng thái, trường riêng, luật chia lead, thuế phí | Quản trị · máy tính | S1–S5 | Bản đầu | P1 — bản đầu chạy bằng mặc định dựng sẵn |
| Cài đặt sàn | Mẫu file nhập, mẫu bảng hàng và bài, người dùng | Quản trị · máy tính | S6 | Bản đầu | P1 |
| Bộ gõ | Chèn bài + link khi đang chat | Đầu khách · điện thoại | — | Sau | — |

## 11. Bản đầu

**Có**, xếp theo một vòng việc trong ngày:

- **Vào**: ô nhận lead năm mục, kiểm trùng, chia lead theo toà kèm thông báo; nhập file bảng hàng cũ; gõ mã căn là tự điền.
- **Khai thác**: thẻ lead mức nhẹ (giá so toà, chủ còn căn nào), màn cuộc gọi có danh sách hỏi, máy tính giá bao phí ↔ giá về tay, ảnh căn ba ngăn, «Sẵn sàng bán» một chạm.
- **Giữ tươi**: hàng đợi gọi lại và điều chỉnh giá, kết quả gọi một chạm, lịch sử trả giá, sửa hàng loạt, trạng thái có tên và lịch sử, mức đủ tự tính.
- **Tìm**: bảng kiểu Sheet, lọc mọi cột, góc nhìn đã lưu, nhóm theo toà rồi loại căn, cột hồ sơ; bảng hàng dạng thẻ trên điện thoại.
- **Phát**: luồng Gửi, trang khách hai cách hiện, link sống, phát bảng hàng, chép bài theo mẫu kênh.
- **Sàn và đội**: tách sàn, vai và quyền theo khu, lớp trường, lịch sử ai sửa gì; cách gọi riêng, trạng thái riêng, trường riêng tối thiểu, luật chia lead, thuế phí.

**Cố ý không làm ở bản đầu**: tự đăng hay tự trả lời Zalo · quản lý khách mua đầy đủ · bản vị trí (lưới, bản đồ lô) · máy đọc chữ (bóc tin rao, tách nhãn ghi chú) · đồng bộ lên Platform · hoa hồng, hợp đồng, thanh toán · ngoại tuyến thật (đo trước) · bộ gõ.

**Đo trong hai tuần thử** (ngưỡng đặt trước khi bắt đầu):

| Số đo | Trả lời |
| --- | --- |
| Số ngày Sheet cũ không được sửa | Đội đã chuyển hẳn chưa? |
| Tỉ lệ căn xác nhận trong N ngày; tỉ lệ căn ở mức đủ cao nhất | Hàng có tươi và đầy hơn không? |
| Tỉ lệ mã căn tự điền được | Danh mục đủ phủ khu chưa? |
| Thời gian khách hỏi → gửi được căn | Việc thật có nhanh hơn không? |
| Thời gian lead → cuộc gọi đầu; số ngày lead → Sẵn sàng bán; số lead trùng bị chặn | Dòng vào có chạy không? |
| Số căn gọi điều chỉnh giá đợt hai | Hàng ngộp có được chăm không? |
| Số lần phát bảng hàng; số link khách mở, số lượt quan tâm | Hàng có được phát ra từ đây không? |
| Tỉ lệ thao tác trên máy tính / điện thoại theo vai | Ghi nhận thiết bị theo vai có đúng không? |
| Số lần mất mạng và thao tác lúc mất mạng trên điện thoại | Có cần ngoại tuyến thật không? |

## 12. Sổ quyết định

| Ngày | Quyết định | Chi tiết ở |
| --- | --- | --- |
| 23/10 | Gom vào, không phát ra: hệ thống không đăng hộ lên kênh khác; người luôn bấm gửi | Ghi nhớ |
| 28/10 | Mở app vào Hôm nay; làm việc ở bảng kiểu Sheet; lưới là một cách xem trong bảng | Desktop app |
| 28/10 | Sửa giá hay trạng thái mặc định là vừa xác nhận với chủ nhà | Desktop app |
| 28/10 | Gửi khách riêng ẩn mã căn; gửi nhóm môi giới hiện mã | Desktop app |
| 28/10 | Cho lưu ảnh sổ và giấy tờ ở ngăn nội bộ | Desktop app |
| 28/10 | Ba lớp dữ liệu; tách sàn từ bản đầu | Desktop app |
| 28/10 | Hai mức: nhanh tức thì từ bản đầu; ngoại tuyến thật chỉ điện thoại, đo trước | Desktop app |
| 28/10 | Tài khoản các sàn và quỹ hàng chạy trên máy chủ; dữ liệu đi kèm hợp đồng và điều khoản | Desktop app |
| 29/10 | Quỹ hàng là ứng dụng riêng phía cung Platform, đọc Invest một chiều | Kiến trúc thông tin §2 |
| 29/10 | Trường riêng mức tối thiểu vào bản đầu | Kiến trúc thông tin §13 |
| 29/10 | Ghi nhận: đầu chủ làm trên máy tính, đầu khách xem trên điện thoại — căn cứ ưu tiên | Mục 2 tab này |
| 29/10 | Quỹ hàng là SaaS: cơ chế ở kiến trúc, mỗi kết nối là một thoả thuận bật / tắt trong trần của lớp dữ liệu; kho riêng tư, cơ sở dữ liệu riêng; một API cho mọi bề mặt; Invest cấp dữ liệu một chiều — ADR-0017 | Kiến trúc repo và stack §0, §2–§4 |
| 29/10 | Mười chỗ mở về lead, cuộc gọi, giá, trang khách theo phác thảo, làm **mặc định dựng sẵn của sàn**, sàn chỉnh được; dựng bằng dữ liệu mẫu, chỉnh khi có người dùng thật (Mạnh: «sự linh hoạt là quan trọng… khi có người dùng thật sẽ tinh chỉnh dần») | Mục 7, mục 13 |
| 29/10 | Phác ba màn còn thiếu của bản đầu trước khi cắt: M6 Hôm nay của đầu khách, TN1 Hôm nay của trưởng nhóm, S6 Mẫu và người dùng | Mục 10 · canvas bản 23 |
| 29/10 | Bật lộ trình trong kho; bản đầu cắt thành hàng ở `docs/plan/lo-trinh.json`. Để sau: ngưỡng số đo (đặt ở Cổng Đáng của từng hàng, trước hai tuần thử), câu hỏi phỏng vấn (ngoài kho), xin dẫn xem (chờ phỏng vấn), hoa hồng và ghi công Platform (ngoài bản đầu), bốn điểm nền (hỏi ở vòng làm nền) | Mục 13 · lộ trình |
| 30/10 | Lưới bảng hàng là lưới dữ liệu ReUI: bài thử 5.000 dòng × 20 cột trên máy văn phòng mô phỏng đạt cả ba thước (cuộn p95 33,3 ms — sát ngưỡng 33,4, gõ 16,8 ms, dán 500 ô 54 ms) — không đổi sang lưới canvas; bảng hàng đo lại trên màn thật | ADR-0004 · `_acceptance/bai-thu-luoi-5000-dong/` |
| 30/10 | Bộ đồng bộ tự làm mỏng: kéo qua API dưới luật theo dòng, hàng đợi ghi trong IndexedDB gắn người dùng trên một tên miền cố định, «có mạng lại» kiểm khi quay lại trang và thử đẩy định kỳ; bài thử đo được cách ly sàn và số chủ bằng máy, vế mất mạng năm phút đo lại trên thiết bị ở hàng dựng phần đồng bộ — giám sát đợt nen-dau chốt theo ủy quyền của chủ kho | ADR-0006 · `_acceptance/bai-thu-dong-bo-mat-mang/` |
| 30/10 | Bộ chuẩn giao diện có trước màn đầu tiên: thành phần ReUI base-nova, skill `quy-hang-ui`, lint giao diện mức nợ 0 mà CI chặn tăng (nợ = vi phạm bị cho qua hàng loạt; ngoại lệ ghi tay kèm lý do đếm riêng, không chặn), sàn thiết kế M1 — hồ sơ `tang-5-giao-dien` | `.agents/skills/quy-hang-ui/` · `packages/ui-lint` |
| 30/10 | Vỏ và IA chọn trên kho ReUI, không tự thiết kế: máy tính `app-shell-8` (cột nhà + cột góc nhìn + thanh trên có gõ mã căn), điện thoại bốn tab dưới ghép từ thành phần; một địa chỉ một thứ, màn đổi theo thiết bị và vai; nguyên tắc «chọn trên kho trước, tự viết sau cùng» cho mọi màn — ADR-0002 | Mục 9 · `docs/design/vo-va-ia.md` |
| 30/10 | Đăng nhập theo sàn: email + mã 6 số qua email; chỉ tài khoản đã được mở hay mời mới nhận mã; thành viên sàn là bảng của Quỹ hàng, không dùng phần tổ chức của better-auth; người nhiều sàn chọn sàn, chưa gắn sàn thì không thấy gì — ADR-0005 | Mục 6 · Kiến trúc §5, §10 |
| 30/10 | Quản trị sàn mời người vào sàn ngay (tạo tài khoản khi chưa có, không lộ ai đã có), đặt một hay nhiều trong năm vai, giao khu do sàn tự đặt tên; chỉ quản trị xem và sửa người; sàn luôn còn một quản trị — ADR-0006 | Mục 2, 6 · Cài đặt sàn S6 |
| 31/10 | Đường API, mã lỗi và đường màn đăng nhập sang tiếng Anh (`/company`, `no-company`, `/login`…), cùng hành vi và chữ trên màn; đường cũ trả 404; giữ cookie sàn, tên tệp mã (dọn riêng) và thẻ nhật ký mã dev — ADR-0007 | `docs/adr/0007-api-tieng-anh.md` |
| 31/10 | Lõi hàng: mọi thay đổi của hàng đi qua một lệnh API thành sự kiện chỉ thêm; bảng hàng là bản tính lại được từ sự kiện; sáu trạng thái chuẩn với bảng chuyển 12 lối, Đã bán và Ngừng hẳn là nấc cuối; vào Đang bán cần giá kèm điều kiện phí, pháp lý, tình trạng sử dụng (ảnh thật thêm khi có kho ảnh); mức đủ năm mục ngang nhau; mọi thành viên sàn gửi được lệnh ở bản này — ADR-0008 | Mục 4, 5 · `docs/adr/0008-loi-hang-va-su-kien.md` |
| 31/10 | Kit nghiệm thu 2.36.0, CI chấm cùng bản với máy dev. Bật: gộp nhánh không dừng ở bản đồ sản phẩm và trang lộ trình; phản biện context sạch bắt buộc cho việc T2/T3; việc mới phải thuộc một hàng lộ trình (mở bằng câu mô tả thì máy tự thêm hàng); máy tự ghi «giới hạn đã biết» cho mục ngoài hợp đồng ở việc T2 sạch, việc T3 và mục cần hợp đồng mới vẫn hỏi chủ kho; đổi cấu hình gộp tính là rào (T3), đổi cấu hình nghiệm thu thì chỉ người duyệt PR canh. Chưa bật: cửa nhận ý người dùng thử (chưa có người gửi), lộ trình tự dời hàng trễ (chưa có mốc phát hành), sàn thiết kế đo độ phủ màu chuẩn (cần bảng màu và danh mục thành phần), bỏ bài kiểm nặng cho PR chỉ đổi hồ sơ (chưa thiếu phút chạy) | `AGENTS.md` «Rào của kho» · `_acceptance/nang-kit-2-36-0/` |
| 31/10 | Vỏ ứng dụng: khối `app-shell-8` chuyển thể cho máy tính, tab dưới ghép cho điện thoại (chủ kho gật trên bản bấm được); nhà và nút theo vai đọc một bảng ở `packages/core`; người chỉ quản trị có tab Cài đặt sàn trên điện thoại; ô Gõ mã căn chỉ vai có Bảng hàng; cột thứ hai nhớ theo người, sàn, nhà | Mục 9 · `docs/design/vo-va-ia.md` |
| 02/11 | Hệ bố cục (hàng 91): mọi nhà có cột thứ hai, mặc định mở, nhớ theo người; mọi màn có đường dẫn ở đầu màn — thay luật «cột thứ hai gập ở Bảng hàng, Hôm nay không có cột» của 31/10 | Mục 9 · ADR-0024 |
| 02/11 | Hệ bố cục, chủ kho chốt ở Cổng Phạm vi hàng 91: Hồ sơ một cột theo hồ sơ căn đang chạy; Danh sách – chi tiết giữ bảng toàn bề rộng, hồ sơ trượt ra ngăn bên phải; mọi nhà có cột thứ hai, mặc định mở; mọi màn có đường dẫn; điều khiển cấp màn bên phải đầu màn; Cài đặt sàn vào vỏ, bố cục Đọc, Người dùng theo `solution-users-8`; màn của hàng đang chạy mang ngoại lệ có hạn tới hàng chuyển nó | ADR-0024 · hàng 91 |
| 31/10 | Môi trường chạy thật: Supabase dự án riêng vùng Singapore (vai chủ riêng, Data API công khai không thấy bảng nào), Vercel ở Singapore trên tên miền cố định `quyhang.onehub.center`, mã đăng nhập gửi qua Resend; gộp main thì áp migration và chạy bộ kiểm cách ly trên cơ sở dữ liệu thật rồi mới deploy; bí mật chỉ ở Vercel và secret GitHub, khoá mã hoá số chủ nhà sinh ở hàng dựng bảng chủ nhà; chỉ dữ liệu mẫu tới khi pháp lý rà; còn mở: Resend chưa gửi được tới khi xác minh tên miền gửi, bản xem trước chung cơ sở dữ liệu và chưa đăng nhập được, gói Vercel, ghim chứng chỉ — ADR-0009 | Kiến trúc §10 · `docs/adr/0009-moi-truong-that.md` |
| 31/10 | Lớp trường nguồn: chủ nhà, số, giá đáy ở bảng riêng; chỉ đầu chủ giữ căn (còn vai Đầu chủ) và trưởng nhóm thấy — trưởng nhóm thấy cả sàn tới khi có nhóm, và nguồn chỉ thấy trên hàng mình đọc được (hàng «Chỉ tôi» của người khác coi như không có, hàng 12); quản trị sàn không thấy; đầu chủ ghi chủ nhà đầu tiên giữ căn, trưởng nhóm bàn giao, mỗi lần gán một dòng chỉ thêm; số chỉ ra qua «Mở số», mỗi lần mở ghi người, vai, lúc; mã hoá số chủ là hàng sau, phải xong trước dữ liệu thật — ADR-0010 | Mục 2, 6 · `docs/adr/0010-lop-truong-nguon.md` |
| 31/10 | Gõ mã căn: mã viết kiểu nào cũng được (chữ thường, dấu cách, gạch hay chấm khác, viết liền) ra thuộc tính căn theo cách đọc mã của dự án; mã đọc được mà danh mục chưa có thì báo «chưa có trong danh mục», không điền đoán; không đọc được thì báo kèm mẫu mã; trùng ở hai dự án thì liệt cả hai. Cách đọc mã là dữ liệu theo dự án. Mọi vai trong sàn tra được, chỉ nhận thông tin danh mục. Dự án thử và danh mục ở vòng này là dự án mẫu có nhãn — bản thật cũng dùng danh mục mẫu tới khi nạp danh mục thật (hàng 10), nên hai tuần thử đứng sau hàng 10 | Mục 4 · `_acceptance/danh-muc-go-ma-can/` |
| 31/10 | Bộ đồng bộ trên máy (nhanh tức thì): bảng hàng và hồ sơ đọc từ kho trên máy (IndexedDB, mỗi người một kho, mỗi sàn một ngăn) — kéo qua API theo luật ai thấy hàng, không chở thông tin chủ nhà; sửa ghi trên máy trước, hàng đợi qua mất mạng và tải lại trang, gửi lại không trùng; hai người cùng sửa hay máy chủ từ chối thì căn thành «Cần xem» để người chọn, «Đã cọc» và «Đã bán» thắng; chỉ báo trên thanh trên nói đang ở đâu; đăng xuất hỏi khi còn thay đổi chờ và luôn xoá kho trên máy. Kéo định kỳ 30 giây, kênh thời gian thực để sau; số chủ trên máy để sau; trang thử ẩn `/proto/nhanh-tuc-thi` đo trên thiết bị tới khi có Bảng hàng | Mục 8 luật 10, 30–32 · `docs/superpowers/specs/2026-10-31-nhanh-tuc-thi-design.md` |
| 31/10 | Đồng bộ tự lành: máy chủ trục trặc (5xx) hay hết phiên (401) thì thay đổi ở lại hàng đợi và tự gửi lại đúng thứ tự khi máy chủ trả lời được — chỉ lỗi khác mới thành «Cần xem»; chỉ báo nói đúng nguyên nhân (mất mạng · hết phiên, bấm để đăng nhập lại · máy chủ trục trặc · bản tải về bị từ chối · lỗi kho trên máy); sửa tiếp căn đang «Cần xem» thì thay đổi mới được giữ tới khi chọn lối và giá cuối luôn là lần sửa sau cùng | `docs/superpowers/specs/2026-10-31-dong-bo-tu-lanh-design.md` · hàng 61 |
| 31/10 | Trục ai thấy hàng, hai nấc: lead và hàng chưa từng Đang bán ở «Chỉ tôi» — chỉ người tạo đọc và sửa được, người khác (cả quản trị sàn, trưởng nhóm) nhận «không có hàng này»; lần đầu «Sẵn sàng bán» thì lên «Toàn sàn» và giữ nấc ấy cả khi tạm ngừng hay rời Đang bán; hàng «Toàn sàn» mọi thành viên sàn sửa được như hàng 8. Nấc tính từ sự kiện, chặn ở lõi và API (chưa ở cơ sở dữ liệu); «Nhóm» và đổi nấc bằng tay để sau | Mục 6 · `_acceptance/truc-ai-thay-hang/` |
| 31/10 | Phiên đăng nhập 30 ngày, trượt theo ngày dùng: dùng lại sau hơn một ngày thì hạn dời ra đủ 30 ngày (tối đa mỗi ngày một lần), cả cookie trình duyệt khi mở trang; bỏ không 30 ngày thì xin mã lại; chưa có trần tuyệt đối | ADR-0005 «Bổ sung 31/10» · `_acceptance/phien-dang-nhap-30-ngay/` |
| 31/10 | Mã đăng nhập chỉ phát qua một đường: xin mã kiểu khác đăng nhập bị từ chối (400), giới hạn 5 lần / 15 phút gác mọi đường gửi mã còn mở cho mỗi email; đường quên, đặt lại mật khẩu và đổi email của thư viện đăng nhập trả 404, không gửi thư, không đốt lượt | ADR-0005 «Bổ sung 31/10 — đường gửi mã» · `_acceptance/dong-duong-gui-ma-thua/` |
| 31/10 | Mở sàn trùng tên: công ty mới trùng tên một sàn đang chạy được sàn riêng, không bao giờ bị gắn vào sàn cũ; chạy lại công cụ chỉ khi email đã là quản trị một sàn cùng tên, công cụ báo «sàn mới» hay «chạy lại». Người chỉ vào được sàn mình là thành viên nhờ lớp API; cơ sở dữ liệu tự kiểm thành viên khi đặt sàn là hàng sau | `_acceptance/mo-san-trung-ten/` |
| 31/10 | Chuẩn hoá là một lớp của lõi cho mọi cửa vào (nhập file, ô nhận lead, sửa trên ô, API), không riêng lần nhập: thuộc tính căn tự điền từ mã, không gõ; trường danh sách cố định chọn hoặc so với giá trị chuẩn và từ điển của sàn; lựa chọn của người thành đề xuất từ điển, quản trị sàn duyệt; AI chỉ dọn từ điển định kỳ, không soát từng lần gõ; dữ liệu đã lưu chỉ đổi qua sự kiện có người. | ADR-0011 quyết định 12 · `docs/architecture/nhap-du-lieu.md` §12 |
| 31/10 | Nhập dữ liệu: tác tử Claude Opus 5.5 lập kế hoạch nhập từ hồ sơ cột (tiêu đề + giá trị của cột danh mục, giá, trạng thái), mã ở lõi áp lên mọi dòng, người xem trước từng ô rồi mới ghi qua lệnh; chủ nhà, số, giá đáy, tên người, ghi chú không bao giờ tới nhà cung cấp AI (che ở trình duyệt, máy chủ quét lại, kiểm bắt buộc); cửa ra AI là thoả thuận «Xử lý bằng AI» sàn bật / tắt, trần 10 USD/tháng/sàn; không AI vẫn nhập được và đo chế độ không AI trước — nền đạt ngưỡng thì gác hàng tác tử; Google Sheets bản đầu nhận file tải về; hoàn tác cả lần nhập bằng sự kiện bù; người nhập là đầu chủ và trưởng nhóm. Hàng 20, 21 thay bằng hàng 64–71 | ADR-0011 · `docs/architecture/nhap-du-lieu.md` |
| 31/10 | Mã hoá số chủ nhà: số chỉ nằm trong cơ sở dữ liệu ở dạng bản mã (AES-256-GCM, khoá `OWNER_PHONE_KEY` chỉ ở Vercel Production và bản cất của chủ kho, bản xem trước không nhận khoá); «Mở số» giải ra số và vẫn ghi một sự kiện; bản thật thiếu khoá thì API không dựng; số chủ của lead cũng chỉ ở dạng bản mã; cơ sở dữ liệu từ chối số dạng chữ ở bảng chủ nhà và bảng lead, bộ kiểm cách ly chặn mọi bảng mới lưu số dạng chữ; kiểm trùng lúc nhập lead so dấu vết có khoá theo sàn, không so số; lệnh mã hoá lại chuyển số cũ; xoá cột số cũ là hàng sau; mất khoá là mất mọi số chủ — ADR-0013 | Mục 6 · `docs/adr/0013-ma-hoa-so-chu.md` |
| 31/10 | Ô nhận lead: lead là bản ghi riêng tới khi đầu chủ nhận (telesales không thấy hàng); năm mục — số chủ, toà và căn tuỳ chọn, nhu cầu Bán · Cho thuê · Cả hai, giá kèm điều kiện phí, thời gian Ngay · Trong 1 tháng · 1–3 tháng · Chưa định; kiểm trùng lúc nhập trong sàn: căn đã có hàng mở (kể cả hàng «Chỉ tôi» của người khác) thắng chủ nhà đã có đầu chủ, còn lại «không trùng» chờ chia (hàng 25); telesales thấy kết quả và tên đầu chủ nhận, không thấy lại số; «Bỏ lead này» chỉ ở lead căn trùng, có ghi lại. Chỉ nhận căn hộ (RESO Residential · Condominium) thuộc khu có danh mục — loại hình khác là nợ chặn triển khai, vào lộ trình bổ sung | ADR-0012 · `_acceptance/o-nhan-lead/` |
| 31/10 | Gõ mã căn trùng ở hai toà cùng dự án: không tự điền căn nào, liệt «nhiều căn» kèm tên từng toà để người chọn — như trùng ở hai dự án; chọn toà (theo tên hay ký hiệu toà) thì ra đúng một căn; toà không có trong dự án báo riêng. Trong tỉ lệ mã căn tự điền được, mã ra «nhiều căn» tính là hụt, không là điền đoán | Mục 4, 11 · `_acceptance/can-trung-ma-hai-toa/` |
| 31/10 | Mọi loại hình bất động sản là nợ phải giải trước khi triển khai (chủ kho, Cổng Phạm vi hàng 24: «nếu không giải thì sẽ không thể triển khai được»); bỏ chữ «dự án», gọi theo RESO DD 2.1 — khu chứa căn `SubdivisionName`, toà `BuildingName`, căn `UnitNumber`, loại hình `PropertyType` / `PropertySubType`. Thiết kế đề xuất (loại hình ở căn, nhãn của sàn neo vào giá trị RESO; khu → toà → căn hay khu → dãy → lô; nhà ngoài khu định danh bằng địa chỉ chuẩn, là bản ghi của sàn; kiểm trùng theo khoá địa chỉ) chờ duyệt ở Cổng Phạm vi hàng 72; Hỏi-4 đã quyết: hai tuần thử giữ một khu căn hộ (chủ kho «Duyệt theo khuyến nghị»); hàng 72 build, dãy D làm trước hàng 10 | ADR-0016 (đề xuất) · `docs/plan/pham-vi-moi-loai-hinh.md` · hàng 72–80 |
| 31/10 | Bảng hàng trên máy tính (hàng 14): bảng kiểu Sheet chỉ đọc trên kho trên máy — lọc mọi cột (chữ, chọn, luật số; giá gõ theo tỷ), nhóm sẵn Toà → Loại căn (đổi được sang Toà hay Không nhóm), loại căn «1PN… · Studio · Chưa rõ» ghép từ danh mục; góc nhìn (bộ lọc, cột hiện, sắp xếp, cách nhóm) lưu **trên máy theo người và sàn**, góc nhìn của đội và theo người qua nhiều máy để hàng sau; sửa trên ô là hàng 15; điện thoại vẫn chờ bảng thẻ (hàng 32) | Mục 9 · `docs/design/vo-va-ia.md` · `design/patterns/bang-hang.md` |
| 31/10 | Khu và loại hình: bỏ chữ «dự án» — khu chứa căn là «Khu» (RESO `SubdivisionName`, code `subdivisionKey` / `subdivisionName`, đường tra `?subdivision=`, tên cũ bị từ chối); khu chia việc của sàn đổi nhãn thành «Vùng», «Vùng phụ trách» (code `zone` giữ); mỗi căn mang loại hình RESO (`propertyType` / `propertySubType`), bốn loại: căn hộ, nhà phố, biệt thự, đất; loại hình nào dùng trường nào đọc từ một bảng của lõi, danh mục có căn mang trường sai loại hình không lên được. Đất có bốn mục ở mức đủ (bỏ «nội thất», hàng 76); khách riêng thấy tên đường và xã của nhà ngoài khu, không số nhà, hẻm, toạ độ (hàng 80) | Mục 4 · ADR-0016 · `_acceptance/khu-va-loai-hinh/` |
| 01/11 | Sửa trên ô (hàng 15): Bảng hàng trên máy tính sửa được ba cột Giá, Phí, Trạng thái ngay trên ô — giá gõ theo cách nói của nghề («4,65 tỷ», «4ty65», «950tr»), máy đọc lại «Hiểu là: …, bao phí / không bao phí» rồi Enter là ghi, chữ chưa hiểu thì báo ngay và không ghi; giá luôn đi cùng điều kiện phí; giá đổi quá 20% hay đổi điều kiện phí thì hỏi lại kèm giá cũ → mới và phần trăm (ngưỡng 20 là mặc định của sàn, khai một chỗ ở lõi; chủ kho duyệt Hỏi-1 «luôn hỏi khi đổi phí»); trạng thái chỉ đưa nấc hợp lệ theo ADR-0008, Đã bán hỏi giá chốt và ngày, Ngừng hẳn hỏi lý do; mỗi lần sửa tính là vừa xác nhận với chủ nhà; hoàn tác trên thông báo hay Ctrl/Cmd+Z là một sự kiện bù, lần sửa không hoàn tác được thì nói trước khi ghi; hoàn tác tính như mọi lần sửa — gỡ lần xác nhận của lần sửa nhầm là hàng sau (Hỏi-2); mười sáu cột còn lại và khổ điện thoại không sửa; dán, kéo điền, sửa hàng loạt là hàng 16 | Mục 9 · `docs/design/vo-va-ia.md` · `_acceptance/sua-tren-o/` |
| 01/11 | Vá sửa trên ô (hàng phát sinh của hàng 15): trình sửa viết giá đúng từng đồng ở mọi chỗ — «Hiểu là», giá chốt, hộp hỏi lại, chữ điền sẵn («4,655 tỷ», không làm tròn «4,66 tỷ»), nên mở ô Giá rồi Enter không bao giờ đổi giá; mỗi thông báo «Đã đổi …» hoàn tác đúng lần sửa của chính nó, mỗi lần sửa hoàn tác được một lần dù bấm nút hay Ctrl/Cmd+Z trước; căn đã có lần sửa sau (của mình hay người khác kéo về) thì nút Hoàn tác trên thông báo cũ không ghi gì, báo «Không hoàn tác được: căn đã có lần sửa sau» (chủ kho duyệt Hỏi-1); cột Giá của Bảng hàng vẫn viết gọn hai số lẻ; Ctrl+Z khi đang gõ ô lọc cột tách thành việc riêng | Mục 9 · `_acceptance/va-sua-tren-o/` |
| 1/11 | Nhận danh mục Invest: gói danh mục theo khuôn v1 (đúng hình danh mục của lõi, mang luật loại hình) vào vùng danh mục dùng chung qua cửa nhận của quản trị sàn; chỉ công ty nền tin ghi danh mục và có thoả thuận «nguồn danh mục» chiều vào đang hiệu lực mới ghi được, chặn ở cơ sở dữ liệu; gói sai hay thoả thuận tắt thì không một căn nào vào; gửi lại không nhân đôi. Ô Gõ mã căn vẫn đọc danh mục mẫu tới hàng kế | Mục 4 · ADR-0015 · `_acceptance/nhan-danh-muc-invest/` |
| 01/11 | Cấu hình theo sàn, khai báo có rào (chủ kho: «sự thiếu linh hoạt thường mang lại thất bại») — Đã chốt 01/11 (chủ kho duyệt Hỏi-1, Hỏi-3 theo khuyến nghị): một sổ điểm biến thiên ở lõi (28 điểm mở hay đề xuất, 5 ứng viên, 19 điều khoá, kèm nguồn); giá trị của sàn ở bảng khoá–giá trị có sự kiện, sàn chưa đổi thì nhận mặc định; mỗi điểm khai áp cho mới hay tính lại; luật theo ba bậc — tham số, chọn một trong thực đơn chiến lược dựng sẵn, bảng quyết định chỉ khi có số đo; chia lead là ca mẫu số một: năm chiến lược (theo vùng phụ trách + lần lượt · vòng toàn sàn · theo tải · kho chung tự nhận · trưởng nhóm chia tay), hạn nhận, hạn gọi, cách báo quá hạn sàn chọn được (chủ kho 1/11: «cứng là không triển khai được»); không đối tượng tự tạo, công thức, luồng tự vẽ, kịch bản tới khi có số đo từ hai sàn thật. Hàng 81–82 đứng trước Cài đặt sàn 45–50 | ADR-0018 · `docs/architecture/so-diem-bien-thien.md` · `docs/plan/pham-vi-cau-hinh-theo-san.md` · hàng 81–82 |
| 01/11 | Bật hẳn ràng buộc chặn số chủ để rõ khi deploy: migration `packages/db/migrations/013_bat_rang_buoc_ban_ma.sql` bật ràng buộc của bảng chủ nhà và bảng lead khi bảng không còn số rõ; còn số rõ thì bỏ qua và in lời nhắc chạy lệnh mã hoá lại ở log job deploy; bộ kiểm cách ly của job deploy dừng deploy khi bảng sạch mà ràng buộc chưa bật; ca tạm gỡ ràng buộc chỉ chạy ở Postgres thử, không chạy trên bản thật (Hỏi-1); bản thật còn số rõ vẫn deploy được (Hỏi-2) — chủ kho 01/11 | Mục 6 · `docs/adr/0013-ma-hoa-so-chu.md` |
| 01/11 | Chia lead: cách chia, hạn nhận, hạn gọi và người đọc lời báo là cấu hình của sàn, chọn từ thực đơn cố định — theo vùng phụ trách lần lượt (mặc định), lần lượt toàn sàn, theo vùng ai ít lead đang mở, kho chung đầu chủ tự nhận (chỉ đầu chủ phụ trách toà thấy), trưởng nhóm chia tay; mặc định 15 và 30 phút, lời báo cho trưởng nhóm; đổi chỉ áp cho lead mới. Lead cùng số về đầu chủ đang giữ chủ nhà dưới mọi cách chia; trưởng nhóm luôn giao lại được. Chia trong nhịp mỗi phút; toà không ai nhận thì lead chờ và báo «chưa chia được» một lần; lead chủ trùng tính hạn. Lời báo ở trong app; đẩy lên máy trưởng nhóm đề nghị nới hàng 26 | ADR-0017 |
| 01/11 | Hồ sơ căn trên máy tính mở thành cột phải cạnh Bảng hàng: bấm dòng mở cột, bảng vẫn dùng được; link `?unit=<mã>&toa=<toà>&lan=<lần rao>` luôn kèm toà và lần rao, `/units/<mã>` toàn màn, mã có ở hai toà thì «Nhiều căn» để chọn. Cột: giá + mức đủ, thuộc tính căn tự điền (khoá), lần rao đang xem và mọi lần rao của căn, lịch sử ai đổi gì khi nào — người khác mình hiện tên vai, không tên người; lịch sử đã tải xem được khi mất mạng. «Báo sai thông tin căn» soạn lời báo rồi mở bảng chia sẻ của thiết bị — chưa lưu trong ứng dụng (Cổng Phạm vi hàng 17: Hỏi-1, Hỏi-2 lối ReUI, Hỏi-3) | Mục 9 · `_acceptance/cot-ho-so-can/` · ADR-0019 |
| 01/11 | Ảnh căn ba ngăn: ảnh thuộc căn của sàn (toà + mã), không thuộc lần rao (Hỏi-2); đầu chủ kéo thả hay dán ⌘V ảnh từ Zalo vào mục Ảnh của hồ sơ căn, vào ngăn của thẻ đang mở — Gửi được (bìa, thứ tự, «Ảnh mẫu», nhãn «Ảnh thật · ngày» lấy ngày chụp trong tệp, vắng thì ngày thêm — Hỏi-3), Tự có từ mã (danh mục chưa mang ảnh), Nội bộ; thêm, sửa ở mọi ngăn chỉ đầu chủ giữ căn và trưởng nhóm, mọi thành viên xem ngăn Gửi được (Hỏi-4); ngăn Nội bộ chặn ở cơ sở dữ liệu, không ra ngoài sàn, không lưu trên máy; thêm ảnh cần mạng (Hỏi-5); xoá là xoá hẳn byte (Hỏi-6); byte ở Supabase Storage riêng tư, link ký 60 giây, khoá S3 một mô-đun (Hỏi-1) — chủ kho 01/11 | Mục 5 · ADR-0014 · `_acceptance/anh-can-ba-ngan/` |
| 01/11 | Sửa hàng loạt (hàng 16): Bảng hàng trên máy tính có ô tích đầu dòng và «Chọn hết» (tích các căn đang hiện); căn đã tích giữ khi đổi lọc, nhóm, góc nhìn, thanh nói số căn bị lọc ẩn và thao tác ghi cho cả căn ẩn; «Đổi trạng thái» cả lô theo bảng chuyển ADR-0008, không có Đã bán (giá chốt từng căn), Ngừng hẳn một lý do cho cả lô; «Đánh dấu đã gọi» ghi «Còn / giữ giá» cho căn còn mở, căn đã đóng không nhận; mọi thao tác lô hỏi lại một lần, kể trước căn không đổi được (chủ kho duyệt Hỏi-2); mỗi căn một sự kiện, thông báo đếm số căn ghi được thật; hoàn tác lô đổi trạng thái bằng nút trên thông báo, căn đã có lần sửa sau thì bỏ qua; đánh dấu đã gọi không hoàn tác được; Ctrl/Cmd+Z khi đang gõ trong ô lọc cột không hoàn tác lần sửa căn; «đổi đầu chủ hàng loạt» tách thành hàng sau (Hỏi-1 — cần API và bộ đồng bộ mới); dán, kéo điền, «Không nghe máy» hàng loạt chưa làm | Mục 8, 9 · `_acceptance/sua-hang-loat/` |
| 01/11 | Lead bốn nấc: telesales mở Hôm nay thấy lead mình nhập, mới nhất trước, qua Đã gửi (chưa có người là «Chờ chia») → Đã nhận → Đã gọi → Lên bảng; lên bảng suy từ hàng của chính đầu chủ ấy có chủ nhà cùng dấu vết số chuyển Sẵn sàng bán sau lúc nhập lead (Hỏi-1); đầu chủ trả lại lead «Số không liên lạc được» tới khi lead lên bảng, kể cả đã ghi gọi (Hỏi-4) — lead trả lại thôi là lead đang mở, thôi bị báo quá hạn, không neo số ấy cho đầu chủ đã trả; «Sửa số và gửi lại» tạo lead mới đi như mọi lead mới (Hỏi-2); không thấy số chủ, mã hàng; số đo «Số ngày lead → Sẵn sàng bán» tính từ lúc nhập lead đầu chuỗi; màn theo khối `list-11` (Hỏi-3). Nút «Trả lại» trên màn của đầu chủ là hàng 22 | ADR-0020 · `_acceptance/lead-bon-nac/` |
| 01/11 | Hôm nay của đầu chủ: hàng đợi là dữ liệu của sàn — bộ máy điều kiện đóng (nấc, quá N ngày từ mốc giá / xác nhận / lên Đang bán, thiếu thông tin, người khác đổi từ hôm qua, loại hình, nấc lead), năm nhóm làm bộ mặc định (Lead mới · Nên gọi điều chỉnh giá · Cần gọi lại · Thiếu thông tin · Mới đổi), mỗi căn đúng một nhóm theo thứ tự; sàn thay trọn bộ nhóm (tên, thứ tự, bật/tắt, ngưỡng, nhóm theo loại hình) — màn sửa ở hàng 48, bộ hỏng thì về mặc định. Mốc điều chỉnh giá là lần muộn hơn giữa đổi giá và xác nhận (Hỏi-1); khoảng ngày giữ 7–14 / 7–30, nhóm tự tạo 1–90 (Hỏi-4); nhãn «ép giá» đổi thành «điều chỉnh giá», sàn đổi lại được (Hỏi-5); mở số lead cho đầu chủ là hàng riêng (Hỏi-3). «Còn · giữ giá» một chạm, Nhận · Đã gọi · Trả lại trên lead | Mục 8 luật 18 · `_acceptance/hom-nay-dau-chu/` · ADR-0019, ADR-0022 |
| 01/11 | Liên hệ: mỗi người làm việc với sàn là một liên hệ theo RESO Contacts — một người, nhiều số (nhãn, một số chính), một hay nhiều loại Chủ bán · Chủ cho thuê · Người mua · Người thuê, một đầu chủ giữ; lead và chủ nhà của hàng gắn liên hệ, kiểm trùng đi qua liên hệ; «Sửa số và gửi lại» thêm số vào cùng người; đầu chủ tạo hàng thẳng từ lead và «Lên bảng» là dữ kiện, không đoán theo số (Hỏi-2); dữ liệu cũ gộp theo số, người giữ là đầu chủ có lần gán mới nhất, danh sách gộp cho trưởng nhóm (Hỏi-1); giao lại hàng không tự đổi người giữ (Hỏi-3); telesales không đọc lại liên hệ (Hỏi-4); «Lead» là trạng thái của người chưa nói chuyện hai chiều theo KW (Hỏi-5); chỗ trường riêng giữ rỗng tới hàng 47 | ADR-0021 · `_acceptance/lien-he/` · §15 |
| 01/11 | Định vị và chuẩn đối chiếu (chủ kho duyệt hướng 01/11): Quỹ hàng là phần mềm phía cung cho sàn môi giới, ba khối (quỹ hàng nội bộ, khai thác và CRM phía chủ nhà, phát hàng bằng link sống); nhóm tương đồng theo năng lực (Follow Up Boss, KW Command, Lofty, BoldTrail, REDX, BoomTown, MLS theo RESO); một bảng luật thiết kế (4 bất biến, 9 luật kiến trúc, 5 luật thiết kế mới: câu giao là điểm sàn, danh sách cố định mặc định là dữ liệu của sàn, một người là một liên hệ, so với ít nhất hai sản phẩm, nghĩa do lõi giữ và tên gọi là dữ liệu của sàn — sổ từ vựng là ADR-0023 và hàng nền 90); chín chỗ cứng đã gộp xem lại ở Cổng Phạm vi của hàng sắp chạm | ADR-0022 · `docs/product/doi-chieu-nganh.md` · `.claude/rules/thiet-ke-doi-chieu.md` |
| 02/11 | Che vùng ảnh (hàng 19): ảnh ngăn Gửi được có «Che vùng…» cho đầu chủ giữ căn và trưởng nhóm — kéo khung trên ảnh đã xoay đúng chiều, vùng che tô kín màu đặc (giữ cứng vì làm mờ đọc ngược được chữ số, chủ kho duyệt Hỏi-3); lưu thành ảnh mới ở ngăn Gửi được, cạnh dài tối đa 1600 điểm ảnh (mặc định của sàn khai ở lõi, Hỏi-2), cùng ngày chụp, không mang thông tin ẩn của ảnh gốc; bản gốc giữ nguyên byte và tự sang ngăn Nội bộ (Hỏi-1); ảnh Nội bộ không che được để ảnh sổ không lọt ra qua bản che; tải lỗi thì không ghi gì; tự nhận diện mặt, biển số và bản nhẹ cho mọi ảnh gửi đi chưa làm (hàng gửi) | Mục 8 luật 29 · `_acceptance/che-vung-anh/` |
| 01/11 | «Sẵn sàng bán» một chạm (luật 17): nút ở mục «Lần rao đang mở» của hồ sơ căn khi lần rao Chưa đủ để rao hay Tạm ngừng; máy kiểm mã căn, giá về tay (tạm là giá kèm điều kiện phí tới hàng 28), ảnh thật, pháp lý, tình trạng sử dụng, thiếu thì liệt đúng điều và chỉ chỗ; ảnh thật là luật lõi cho mọi lối vào Đang bán, máy chủ đếm (ngăn Gửi được, không ảnh mẫu, chưa xoá), số tối thiểu sàn nâng được `listing.ready_min_real_photos` mặc định 1 (Hỏi-1); Bảng hàng không kiểm ảnh trước, máy chủ chặn và lỗi về Cần xem (Hỏi-2); hàng chưa có mã căn không lên Đang bán tới hàng điền mã căn | ADR-0008 · `_acceptance/san-sang-ban/` · Sổ điểm biến thiên #33 |
| 02/11 | Hệ bố cục (chủ kho duyệt hướng 02/11): mọi màn sau đăng nhập chọn một trong bảy bố cục có tên — Tràn, Danh sách – chi tiết, Đọc, Hồ sơ, Bảng điều khiển, Luồng nhiều bước, Dòng tin — với sáu vùng chuẩn và chờ tải theo hình của bố cục; một menu Tạo trên vỏ; trang mẫu sống không cần cơ sở dữ liệu là ảnh chuẩn để đối chiếu; giữ hồ sơ cạnh bảng, thanh tab dưới điện thoại và lưới dày | ADR-0024 · hàng nền 91 |
| 30/10 | Chọn chữ (ghi vào kho 02/11): nhãn trong lõi dùng chữ chuẩn ngành, xét theo thứ tự luật Việt Nam → từ vựng chung OneHub (onehub-invest) → chữ thị trường công khai; chữ nghề của môi giới (đầu chủ, giá đáy, bao phí, ép giá…) là tên gọi riêng của sàn, không làm nhãn chuẩn mới. Thay luật 5 ở mục 8; nhãn đang có giữ tới lượt dọn bảng sau khi đóng đợt; chữ đã chốt sau 30/10 (như «Khu», 31/10) giữ nguyên | `CONTEXT.md` mục «Chọn chữ» · ADR-0022 D5 |
| 02/11 | Thông báo lead (hàng 26): đầu chủ bật thông báo trên từng thiết bị ở dải đầu Hôm nay (iPhone chưa cài lên màn hình chính thấy hướng dẫn cài); lead về mình bằng nhịp chia, trưởng nhóm giao hay lúc nhập khớp chủ nhà / căn thì nhận Web Push «Lead mới · <Toà> · <nhu cầu>», chạm mở đúng lead ở Hôm nay — không số, không tên chủ, không giá, không mã căn; tự nhận từ kho chung không báo; trưởng nhóm nhận đẩy cho lời báo mới; lỗi tạm gửi lại tối đa ba lần trong 15 phút; khoá VAPID máy chủ tự sinh, không ai cầm khoá | `docs/adr/0025-thong-bao-lead.md` · `_acceptance/thong-bao-lead/` |
| 02/11 | Mở số của lead: đầu chủ đang được giao lead bấm «Mở số» trên dòng lead ở Hôm nay, thấy số chủ nhà theo nhóm chữ số và bấm «Gọi» (mở ứng dụng gọi của máy); mở được ở mọi nấc lead còn việc (Đã gửi · Đã nhận · Đã gọi), mỗi lần mở để lại một vết (người, vai, lúc) chỉ thêm — người mở và trưởng nhóm đọc; trưởng nhóm, telesales, đầu chủ khác không mở; lead đã trả lại, đã gửi lại hay lead căn trùng không mở; mở số không tự ghi «Đã nhận»; số không lưu trên máy, tải lại trang là ẩn | `_acceptance/mo-so-lead/` · migration `017_mo_so_lead.sql` |
| 02/11 | Điền mã căn cho hàng chỉ biết toà: hồ sơ căn mở theo hàng (`?hang=`) khi chưa có mã, ô «Mã căn» gắn mã một lần qua hàng đợi trên máy; mã ngoài danh mục vẫn lưu; căn đã có hàng đang mở khác của sàn thì máy chủ chặn, lỗi tại ô nêu trạng thái hàng kia kèm «Mở hàng kia»; lối vào từ Bảng hàng, dòng «Chưa có mã căn» ở Hôm nay, «Mã căn» trong «Còn thiếu»; có mã thì xét ảnh thật như mọi hàng. Không sửa mã đã gắn | `docs/adr/0026-gan-ma-can.md` · `_acceptance/dien-ma-can-cho-hang/` |
| 02/11 | Vá thông báo lead (hàng phát sinh của hàng 26): máy chủ chỉ nhận và chỉ gửi tới địa chỉ của bốn dịch vụ đẩy — Google, Mozilla, Apple, Microsoft (danh sách cố định ở lõi, sàn không thêm được); đăng ký cũ địa chỉ lạ bị gỡ ở lượt gửi kế; mỗi lần gửi tối đa 5 giây, lối giao lead gửi tối đa 8 giây rồi để phần còn lại cho nhịp chia, nhịp chia tối đa 40 giây — dưới giữ chỗ một phút nên không gửi trùng; đăng xuất mang địa chỉ lạ vẫn đăng xuất; thiết bị đã bật mà máy chủ chưa lưu được thì dải bật vẫn hiện lời «Chưa bật được thông báo — thử lại» (chủ kho duyệt Hỏi-1) | `_acceptance/va-thong-bao-lead/` |

## 13. Chỗ cần chốt

**Lead và cuộc gọi**

Rà 29/10 trước khi cắt bản đầu vào lộ trình. Mười chỗ đã chốt làm **mặc định dựng sẵn của sàn** (mục 7, sổ 29/10); chỗ «để sau» ghi rõ nơi sẽ hỏi lại.

- [x] Hạn nhận lead 15 phút — chốt 29/10, kèm hạn gọi lần đầu 30 phút như phác thảo (1, K1); sàn chỉnh ở S3.
- [x] Telesales còn thấy số chủ nhà sau khi gửi không — chốt 29/10: không, theo lớp trường.
- [x] Khi trùng căn — chốt 29/10: mặc định gửi tin bổ sung, vẫn cho «Bỏ lead này» và ghi lại (L3).
- [x] Máy tính biết đang có cuộc gọi bằng cách nào — chốt 29/10 mức tối thiểu: bấm Gọi trên máy tính mở chế độ cuộc gọi và điện thoại quay số; nối tổng đài là một loại kết nối, để sau.

**Giá và phí**

- [x] «Bao phí» mặc định gồm cả ba khoản (thuế thu nhập cá nhân, lệ phí trước bạ, phí môi giới) — chốt 29/10; sàn đổi ở S4.
- [x] Phí môi giới 1% — chốt 29/10: mặc định của sàn, đầu chủ sửa từng căn.

**Trang khách**

- [x] Hiện «giá xác nhận X ngày trước» cho khách — chốt 29/10: hiện.
- [x] Mức chia trên trang nhóm môi giới — chốt 29/10: mặc định của sàn, sửa theo bộ, sàn ẩn được.
- [x] Người gửi tắt được link — chốt 29/10: tắt được; link không tự hết hạn ở bản đầu.
- [x] Giữ «Quan tâm» — chốt 29/10: giữ.

**Dữ liệu và phạm vi**

- [ ] Khu dùng thử đầu tiên — để sau, hỏi ở vòng nạp danh mục; tới đó dựng bằng dữ liệu mẫu có nhãn. Đề xuất: khu đội đang giữ nhiều hàng nhất.
- [ ] Danh mục căn dùng ra ngoài lấy từ đâu — để sau, hỏi ở vòng nạp danh mục. Đề xuất: bảng hàng sàn thử nhập cộng phần danh mục Invest không đến từ S08; mua quyền khi có sàn ngoài.
- [ ] Ngưỡng của các cổng làm tiếp / đổi hướng và ngưỡng số đo ở mục 11 — để sau: đặt ở Cổng Đáng của hàng mà số đo đo, trước hai tuần thử.
- [ ] Luật chia hoa hồng, ghi công của Platform — để sau, ngoài bản đầu; bản đầu chỉ bảo đảm mỗi sự kiện ghi người và vai.
- [x] Tên tiếng Anh của sáu trạng thái theo RESO — máy điền 29/10 (mục 5), chốt khi viết lõi.

**Hỏi ở buổi phỏng vấn sau** — để sau, việc của người, ngoài kho; màn dùng mặc định đã ghi tới khi có câu trả lời.

- [ ] Đầu khách xin dẫn xem thế nào hôm nay, mất bao lâu, ai cầm chìa khoá. Xin dẫn xem và lịch xem chờ câu này.
- [ ] Telesales đang dùng công cụ gì, có chịu nhập thẳng vào Quỹ hàng không; lead marketing đến từ đâu.
- [ ] Đầu khách có lúc nào cần số chủ nhà; khi đó ai mở hộ. Tới khi có câu trả lời: không, đầu khách bấm «Liên hệ đầu chủ».
- [ ] Ngưỡng ngày điều chỉnh giá có khác theo loại căn, mức giá không. Tới khi có câu trả lời: 10 ngày, sàn chỉnh trong 7–14.
- [ ] Hai chỗ bị gạch trong ghi chép (trùng chủ nhà; telesales ghi sơ sài) đã hết đau, hay gạch vì lý do khác.

## 14. Thuật ngữ

| Chữ trên màn | Nghĩa | Không dùng |
| --- | --- | --- |
| Quỹ hàng | Tên ứng dụng | Tên nhà trong app |
| Sàn | Công ty dùng Quỹ hàng; mỗi sàn một vùng dữ liệu riêng | — |
| Bảng hàng | Tập hàng của sàn; tên nhà trên máy tính và tab trên điện thoại | «Quỹ hàng» cho nhà này |
| Hàng | Một lần chào bán của sàn trên một căn | «Tin» (tin là của Invest) |
| Lead | Hàng ở nấc đầu, từ telesales hoặc đầu chủ tự nhập | — |
| Đầu chủ | Người giữ nguồn chủ nhà của căn | «Người giữ» |
| Đầu khách | Người đem căn đi bán cho khách | — |
| Bao phí / Không bao phí | Giá đã / chưa gồm thuế thu nhập cá nhân, lệ phí trước bạ và phí môi giới, theo định nghĩa của sàn | Trên trang khách: «đã / chưa gồm phí chuyển nhượng» |
| Giá về tay | Số chủ nhà nhận sau thuế phí | — |
| Giá chào | Giá đưa cho khách | — |
| Giá đáy | Mức thấp nhất chủ từng nói; nội bộ | — |
| Sẵn sàng bán | Nút đưa hàng lên bảng sau khi máy kiểm đủ điều kiện | «Duyệt» |
| Độ tươi | Tuổi của lần xác nhận gần nhất với chủ nhà | — |
| Mức đủ thông tin | Phần đã có trong danh sách hỏi | — |
| Hàng đợi | Lead mới · Cần gọi lại · Nên gọi điều chỉnh giá · Xin dẫn xem · Thiếu thông tin · Mới đổi | — |
| Góc nhìn | Bộ lọc + cột + cách xem đã lưu | «Tab» |
| Lần gửi · Đã gửi | Một link đã gửi · nhà theo dõi các link | — |
| Trang khách · Link sống | Trang công khai từ link; giá và trạng thái theo bảng hàng | — |
| Phát hàng | Xuất bảng hàng ra ảnh, PDF, Excel | — |
| Cách gọi riêng · Trường riêng | Tên của sàn trên trường chuẩn · trường mới của sàn | — |

## 15. Tri thức ngành và RESO

Đối tượng của Quỹ hàng đặt cạnh chuẩn dữ liệu RESO Data Dictionary 2.0 (dd.reso.org) và khái niệm của ngành môi giới
(Keller Williams Command). Hàng chạm đối tượng nghiệp vụ đối chiếu bảng này ở bước thiết kế; chỗ lệch thành câu hỏi Cổng
Phạm vi. Cách làm việc (hàng đợi, đường ống, chia lead, kịch bản, phát hàng) — phần RESO không định nghĩa — đối chiếu với sản
phẩm cùng loại ở [Đối chiếu ngành](doi-chieu-nganh.md) (ADR-0022).

| Quỹ hàng | RESO | Ngành môi giới (KW Command) | Ghi chú |
| --- | --- | --- | --- |
| Liên hệ | `Contacts` (`ContactKey`, `FullName`) | Contact — người đã nói chuyện hai chiều | Một người của sàn (ADR-0021) |
| Loại liên hệ | `ContactType` (Multi): `Seller`, `Landlord`, `Buyer`, `Tenant` | — | Chủ bán · Chủ cho thuê · Người mua · Người thuê; nhiều loại trên một người |
| Người giữ | `OwnerMemberKey` | Assignee (tài khoản nhóm: Owner là nhóm) | Sàn giữ bản ghi; đầu chủ là người giữ |
| Số của liên hệ | `OtherPhone`, `PreferredPhone` | Primary / Additional Phone: Home · Mobile · Work · Other | Bản mã + dấu vết (ADR-0013) |
| Lead | `ContactType = Lead` («may be a potential buyer or seller») | Lead — ô «Mark as Lead»: ít thông tin, trao đổi một chiều | Trạng thái của liên hệ; bản ghi lead của Quỹ hàng là cơ hội phía bán pha đầu |
| Cơ hội | — | Opportunity: Cultivate → Appointment → Active → Under Contract → Closed | Bốn nấc của lead (ADR-0020) ứng với Cultivate → Active |
| Chủ nhà của hàng | `ContactListings` (`ContactKey` ↔ `ListingKey`) | Opportunity đường ống Listings gắn contact | `listing_owners.contact_id`; hàng tạo từ lead nối qua `lead_listings` |
| Hàng | `Property` (`StandardStatus`) | Listing | Trạng thái chuẩn RESO |
| Kho chung · chia lead | — | Lead Pool · Lead Routing | ADR-0017 |
| Nguồn lead | `LeadSource` | Lead Source (nguồn ngoài hay liên hệ giới thiệu) | Chưa có — hàng sau |

