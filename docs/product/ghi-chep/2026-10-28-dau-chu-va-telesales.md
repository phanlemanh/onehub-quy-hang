# Đầu chủ và telesales: dòng vào của quỹ hàng

> **Lưu vết, không sửa.** Bản chép ngày 29/10/2026 từ tab «Đầu chủ và telesales» của [tài liệu thiết kế](https://claude.ai/artifact/B12d9FDirVB9vEA8gSChLe). Điều đang đúng nằm ở [Tham chiếu](../tham-chieu.md); khi hai nơi nói khác nhau, Tham chiếu thắng.

Từ ghi chép phỏng vấn 28/10 về các bước làm việc của sales đầu chủ. *Đề xuất, chưa chốt.*

## Bức tranh mới

Phỏng vấn cho thấy sàn chạy như một dây chuyền, không phải một người giữ sổ:

**Marketing / telesales** tìm chủ nhà → **đầu chủ** biến cuộc gọi thành một căn sẵn sàng bán → **bảng hàng chung** của sàn → **đầu khách** đem căn đi bán.

Thiết kế đến nay phủ phần giữa và phần cuối: giữ tươi, bảng hàng, gửi khách. Phần còn thiếu là **dòng vào** — từ lúc có số điện thoại chủ nhà đến lúc căn lên bảng hàng. «Người giữ» trong các mục trước chính là đầu chủ.

Việc của đầu chủ, một câu: **biến một cuộc gọi chủ nhà thành một căn sẵn sàng bán, nhanh hơn sàn đối thủ, mà không để lộ nguồn.**

Hai lực kéo nhau suốt năm bước: *tốc độ* (nhận lead tức thì, lên bảng một chạm, ép giá trước đối thủ) và *giữ nguồn* (số chủ nhà là tài sản của đầu chủ, kể cả với đồng nghiệp cùng sàn). Cách gỡ: **thay các bước người duyệt bằng điều kiện máy kiểm** — vừa nhanh vừa chặt.

## Vai

| Vai | Làm gì | Thấy gì |
| --- | --- | --- |
| **Marketing / telesales** | Gọi lọc chủ nhà, nhập lead | Lead mình nhập và kết quả của nó; không thấy bảng hàng |
| **Đầu chủ** | Khai thác, định giá, lấy ảnh, đưa lên bảng hàng, chăm sóc và ép giá | Toàn bộ căn mình giữ, kể cả chủ nhà, số điện thoại, giá đáy, ảnh sổ |
| **Trưởng nhóm** | Chia lead, xem phễu, xử lý ngoại lệ | Như đầu chủ, cho cả nhóm |
| **Đầu khách** | Tìm căn, gửi khách, dẫn xem | Bảng hàng chung và ảnh gửi được; không thấy chủ nhà — bấm «Liên hệ đầu chủ» |

## Năm bước: chỗ đau và tính năng

### 1. Nhận lead từ marketing / telesales

*Đau:* lead đến chậm; ghi chú sơ sài, số sai; một chủ nhiều căn thì hai đầu chủ cùng gọi, mất uy tín; chia theo toà bằng tay trên file.

- **Ô nhận lead cho telesales** — vài trường bắt buộc: số chủ nhà (sai định dạng thì chặn ngay), toà hoặc mã căn, nhu cầu, giá mong muốn kèm điều kiện phí, thời gian muốn ra hàng. Thiếu thì không gửi được.
- **Kiểm trùng lúc nhập** — theo số chủ nhà và theo căn. Chủ nhà đã có đầu chủ giữ thì lead về đúng người đó; telesales được báo «đã có người giữ».
- **Chia lead theo luật của sàn** — theo toà như hiện nay; đầu chủ nhận thông báo ngay trên điện thoại; quá N phút chưa ai nhận thì báo trưởng nhóm.
- **Thẻ lead đọc trong năm giây** — giá mong muốn so với giá đang rao trong toà, căn này từng rao ở ngoài chưa và giá bao nhiêu, chủ nhà còn căn nào khác; nút Gọi nằm ngay trên thẻ.

### 2. Gọi khai thác

*Đau:* vừa nói vừa ghi nên quên một trong khoảng mười tiêu chí (đang cho thuê không, tất toán thế nào); gõ chữ tự do; cuối cùng phải kết bạn Zalo hỏi lại.

- **Màn cuộc gọi có danh sách hỏi** — các nhóm: tình trạng sử dụng, nội thất, pháp lý, vay và tất toán, giá và phí, thời gian ra hàng, lịch xem nhà. Chạm chọn thay gõ (Trống / Chủ ở / Đang cho thuê đến…; Có sổ / Đang làm sổ / Hợp đồng mua bán). Mục chưa hỏi sáng lên trước khi gác máy.
- **Máy tính giá bao phí ↔ giá về tay** — nhập giá chủ báo, điều kiện phí, phí môi giới → ra giá chủ nhận và giá chào khách, lưu cả hai vào lần rao. Tỉ lệ thuế phí đặt sẵn, sửa được.
- **«Còn thiếu gì» thành tin nhắn** — sau cuộc gọi, máy soạn sẵn tin Zalo hỏi chủ đúng những mục còn trống; người bấm gửi.

### 3. Tư vấn giá và lấy ảnh

*Đau:* thiếu số liệu để ép giá đợt đầu; ảnh, video chủ gửi qua Zalo cá nhân bị trôi, Zalo tự xoá, đầy máy; đầu khách phải lục nhóm Zalo tìm ảnh.

- **Thẻ giá để ép giá** — giá đang rao của căn cùng loại trong toà, giá đã bán gần đây trong quỹ hàng của sàn, khoảng giá gợi ý theo thời gian chủ muốn ra hàng (nhanh / bình thường / không vội). Số lấy từ tin rao công khai và dữ liệu của chính sàn, chỉ đầu chủ xem.
- **Nhận ảnh thẳng từ Zalo** — trong Zalo chọn ảnh, video → Chia sẻ → Quỹ hàng → chọn căn (gợi ý căn vừa gọi) → vào ngăn ảnh, tải lên ở nền. Không cần lưu về máy trước. Hệ thống không đọc Zalo; người tự chia sẻ.
- **Ảnh căn thay nhóm Zalo** — đầu khách tìm ảnh trong hồ sơ căn, không phải vào nhóm.

### 4. Đưa lên bảng hàng

*Đau:* sợ lộ số chủ nhà ra ngoài khi chưa khoá được nguồn; nhiều bước duyệt làm căn giá tốt chậm nhịp.

- **Nút «Sẵn sàng bán» một chạm, máy tự kiểm** — đủ điều kiện (giá về tay đã chốt, có ảnh thật, pháp lý và tình trạng sử dụng đã hỏi) thì căn lên bảng hàng ngay; thiếu thì chỉ đúng chỗ thiếu. Không qua người duyệt; trưởng nhóm chỉ xem ngoại lệ.
- **Giữ nguồn trong sàn** — tên, số chủ nhà, giá đáy, ảnh sổ chỉ đầu chủ giữ căn và trưởng nhóm thấy. Đầu khách thấy căn và nút «Liên hệ đầu chủ». Mỗi lần mở số chủ được ghi lại.
- **Mức hiển thị bốn nấc** — Chỉ tôi → Nhóm đầu chủ → Toàn sàn → Ra ngoài (nhóm môi giới, khách, Platform). Lead và căn chưa khoá nguồn mặc định «Chỉ tôi».

### 5. Chăm sóc và ép giá đợt hai

*Đau:* giữ hàng trăm căn, không nhớ căn nào gọi ngày nào, chủ từng chịu giảm bao nhiêu; quên «hàng ngộp» để sàn khác ép mất.

- **Hàng đợi «Nên gọi ép giá» trong Hôm nay** — căn lên bảng quá N ngày (mặc định 10, sàn chỉnh trong khoảng 7–14) chưa có cọc và chưa hạ giá gần đây. Khác hàng đợi «Cần gọi lại» (lâu chưa xác nhận).
- **Lịch sử trả giá ngay trên màn cuộc gọi** — các lần hạ giá và mức chủ từng nói có thể giảm đến (giá đáy, nội bộ).
- **Báo khi căn của mình rao ở ngoài rẻ hơn** — nhắc gọi trước khi sàn khác ép. Cần khớp tin rao bên ngoài với căn, làm sau.

## Màn cuộc gọi trên mobile

Bốn màn, theo thứ tự một đầu chủ gặp trong ngày. Phác thảo: hàng «Mobile · cuộc gọi khai thác» trên cùng của [Phác thảo UX quỹ hàng](https://claude.ai/artifact/VESE23ChnX6oSC3X73Bzwf).

1. **Thẻ lead.** Giá chủ muốn, điều kiện phí, thời gian ra hàng và ghi chú của telesales; dải giá của toà với vị trí căn này; tin rao ngoài và kết quả kiểm trùng; hạn gọi trước khi trưởng nhóm được báo. Giá luôn **quy về giá chủ nhận về tay rồi mới so toà**, không so giá bao phí với giá không bao phí.
2. **Đang gọi.** Thanh cuộc gọi luôn nằm trên cùng. Mười mục hỏi xếp thành sáu nhóm, chạm chọn; nhóm chưa đủ viền cam, đếm «Đã hỏi 7 / 10», cuối màn ghi rõ mục còn thiếu. «Ghi xong» vẫn bấm được khi còn thiếu: căn ở lại «Đang khai thác» và mục thiếu vào «Thiếu thông tin».
3. **Tính giá.** Tính hai chiều: từ giá chủ báo ra giá về tay, hoặc ngược lại. Tách từng dòng thuế, lệ phí, phí môi giới; tỉ lệ đặt sẵn theo cài đặt của sàn, sửa được. Lưu cả giá về tay lẫn giá chào khách vào căn, kèm dòng so với giữa toà.
4. **Gọi ép giá đợt hai.** Lý do căn vào hàng đợi; lịch sử trả giá từ lúc còn là lead; giá đáy chủ từng nói (nội bộ); thị trường lúc này và căn cùng loại vừa cọc; bốn nút kết quả. Máy đưa sự thật, **không đề xuất mức giá nên ép** — mức ép là việc của đầu chủ.

**Chỗ chưa giải:** gọi bằng chính điện thoại thì máy áp tai, không chạm được danh sách hỏi — phải bật loa ngoài hay đeo tai nghe, hoặc mở cùng màn trên desktop khi ngồi văn phòng. Cần hỏi đầu chủ thường gọi bằng máy nào trước khi chốt màn này cho mobile hay desktop.

## Màn cuộc gọi trên desktop

**Nói trên điện thoại, ghi trên máy tính.** Đây là cách gỡ chỗ chưa giải ở mobile khi đầu chủ ngồi văn phòng. Mọi thứ nằm trên một màn, không có bảng trượt đè lên nhau. Phác thảo: hàng «Desktop · cuộc gọi khai thác» trên cùng của [Phác thảo UX quỹ hàng](https://claude.ai/artifact/VESE23ChnX6oSC3X73Bzwf).

- **Thanh cuộc gọi** nằm trên cùng: thời gian gọi, căn, số chủ che bớt, nút «Mở trên điện thoại» để đứng dậy đi vẫn ghi tiếp.
- **Cột trái — căn và chủ nhà**: thẻ lead (giá chủ muốn, ghi chú telesales, tin rao ngoài, kiểm trùng) và lịch sử trả giá; khi gọi ép giá thì thêm giá đáy nội bộ.
- **Cột giữa — danh sách hỏi**: bảy nhóm trên hai cột, nhóm đang hỏi viền xanh, nhóm chưa đủ viền cam. **Chạm không cần chuột**: phím 1–3 chọn, Tab sang nhóm kế, Ctrl+Enter ghi xong — tay gõ trong lúc tai nghe. Có ô ghi chú tự do cho điều không nằm trong danh sách.
- **Cột phải — giá và toà**: máy tính giá luôn mở sẵn; bảng căn cùng loại trong toà (giá, điều kiện phí, trạng thái, ngày xác nhận) kèm dải giá — thứ mà mobile phải rút gọn thành một dòng.
- **Gọi ép giá đợt hai**: ô kết quả lên đầu cột giữa (phím H / G / B / K). Chọn «Hạ giá» thì mở ô sửa giá theo đúng luật sửa trên ô: kèm điều kiện phí, nói lại «Hiểu là…», tick sẵn «Vừa xác nhận với chủ nhà», thêm ô «Ghi giá đáy mới». Danh sách hỏi lùi xuống dưới để cập nhật chỗ đã đổi (ví dụ thời gian ra hàng chuyển từ «Không vội» sang «1–3 tháng»).

**Chỗ cần quyết sau:** máy tính biết «đang gọi» bằng cách nào. Mức tối thiểu là bấm Gọi trên máy tính để điện thoại tự quay số; nếu sàn dùng tổng đài thì nối thẳng vào tổng đài. Câu này đi cùng câu hỏi «đầu chủ gọi bằng máy nào» ở cuối trang.

## Ảnh hưởng tới thiết kế đã chốt

- **Trạng thái thêm hai nấc trước «Còn hàng»**: Lead mới → Đang khai thác → Sẵn sàng bán (tức Còn hàng). RESO có sẵn trạng thái chuẩn cho tin chưa đủ để rao, nên hai nấc này neo vào chuẩn. Không mở một phần mềm khách hàng riêng: lead là một dòng trong cùng quỹ hàng, xem bằng góc nhìn «Lead mới».
- **Quyền theo trường trong cùng sàn**: luật trước chỉ tách trong / ngoài sàn. Nay số chủ nhà, giá đáy, ảnh sổ còn ẩn cả với đầu khách cùng sàn.
- **Thẻ thị trường lên bản đầu**: trước để «Sau»; nay là công cụ chính ở bước 1 và 3. Bản đầu làm mức nhẹ: giá đang rao của căn cùng loại trong toà.
- **Mức đủ thông tin chính là danh sách hỏi**: các tiêu chí của màn cuộc gọi là các mục tính mức đủ, không phải hai danh sách.
- **«Cố ý không làm quản lý khách đầy đủ» giữ nguyên**: phễu chủ nhà là dòng vào của quỹ hàng nên nằm trong phạm vi; phễu khách mua vẫn ở ngoài.

## Xếp giai đoạn

| Tính năng | Bước | Giai đoạn |
| --- | --- | --- |
| Ô nhận lead cho telesales | 1 | Bản đầu |
| Kiểm trùng theo số chủ nhà và theo căn | 1 | Bản đầu |
| Chia lead theo toà, thông báo tức thì | 1 | Bản đầu |
| Thẻ lead (mức nhẹ: giá so toà, chủ còn căn nào) | 1 | Bản đầu |
| Màn cuộc gọi có danh sách hỏi | 2 | Bản đầu |
| Máy tính giá bao phí ↔ giá về tay | 2 | Bản đầu |
| Nhận ảnh thẳng từ Zalo | 3 | Bản đầu |
| «Sẵn sàng bán» một chạm, máy tự kiểm | 4 | Bản đầu |
| Giữ nguồn trong sàn + mức hiển thị bốn nấc | 4 | Bản đầu |
| Hàng đợi «Nên gọi ép giá» + lịch sử trả giá | 5 | Bản đầu |
| «Còn thiếu gì» thành tin nhắn | 2 | Sau |
| Thẻ giá có khoảng gợi ý theo thời gian ra hàng | 3 | Sau — cần đủ dữ liệu đã bán |
| Báo căn của mình rao ở ngoài rẻ hơn | 5 | Sau — cần khớp tin với căn |
| Phễu đầu chủ cho trưởng nhóm, ghi công telesales | Đội | Sau |
| Nhận lead tự động từ form quảng cáo | 1 | Sau |

Số đo thêm cho hai tuần thử: thời gian từ lúc có lead đến cuộc gọi đầu; số lead trùng bị chặn; số ngày từ lead đến Sẵn sàng bán; số căn được gọi ép giá đợt hai.

## Cần hỏi lại ở buổi phỏng vấn sau

- [ ] Hai chỗ bị gạch trong ghi chép (trùng chủ nhà; telesales ghi sai, sơ sài) — đã hết đau, hay gạch vì lý do khác?
- [ ] Telesales đang dùng công cụ gì, có chịu nhập thẳng vào quỹ hàng không? Lead marketing đến từ đâu?
- [ ] Đầu khách có lúc nào cần số chủ nhà (dẫn khách xem)? Khi đó ai mở hộ?
- [ ] Ngưỡng ngày ép giá có khác theo loại căn, mức giá không?
- [ ] «Bao phí thì xin 1%» là luật của sàn hay thoả thuận từng căn?

* [ ] Đầu chủ gọi chủ nhà bằng điện thoại cầm tay, tai nghe, hay ngồi máy tính? (quyết màn cuộc gọi nằm ở mobile hay desktop)
