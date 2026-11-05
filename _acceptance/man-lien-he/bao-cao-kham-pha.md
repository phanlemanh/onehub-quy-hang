# 103 · Màn Liên hệ — báo cáo khám phá

Ngày 05/11. Dãy L lập theo lời chủ kho chuyển qua giám sát. Lời chủ kho, nguyên văn: «Báo màn liên hệ dựa vào bối cảnh quỹ hàng, bối cảnh ngành, và
cách các sản phẩm tương tự giải quyết nỗi đau và tạo ra giá trị, điều tra khảo sát sau đó phân tích và đề xuất năng lực và các màn
xung quanh Liên hệ».

Đây là phần khám phá của hàng 103, viết **trước Cổng Đáng**. Báo cáo chỉ khuyến nghị, không chốt điều gì. Quyết định có làm hay không,
ngưỡng nghiệm thu và việc chọn hàng tiếp theo là của chủ kho.

## Tóm tắt

- **Dữ liệu đã có, màn thì chưa.** Hàng 85 và 86 đã dựng phần dữ liệu và luật: một người là một liên hệ, có nhiều số, nhiều loại,
  một người giữ. Nhưng chưa có trang nào để nhìn một người. Đầu chủ không xem được một chủ nhà đang có mấy căn, mấy lead. Trưởng nhóm
  không có chỗ soát người trùng hay xem ai đang giữ ai.
- **Các sản phẩm cùng ngành giải nỗi đau bằng bốn thứ:**
  - một hồ sơ cho mỗi người, kèm dòng thời gian;
  - danh sách lọc theo loại và giai đoạn;
  - báo trùng mà không làm lộ thông tin;
  - quyền theo người giữ, trong đó sàn sở hữu dữ liệu.
- **Từ 01/01/2026 có thêm điều kiện pháp lý.** Luật Bảo vệ dữ liệu cá nhân 2025 có hiệu lực, và số chủ nhà, số khách thuộc phạm vi luật
  này. Hồ sơ một người sớm muộn phải trả lời ba câu: dựa vào căn cứ nào để giữ số, ai đã mở số, và người ấy yêu cầu xoá thì xử lý ra sao.
- **Khuyến nghị cho 103:** một màn Liên hệ đọc là chính, gồm danh sách và hồ sơ một người. Màn dành cho đầu chủ và trưởng nhóm, dùng lại
  dữ liệu và quyền đã có. Bản đầu không gộp tay, không xuất, không mở cho vai mới. Các năng lực còn lại tách thành sáu hàng đề xuất ở
  cuối báo cáo để chủ kho chọn.

## 1. Bối cảnh Quỹ hàng

### 1.1 Liên hệ đang sống ở đâu

| Phần | Đã có | Nguồn |
|---|---|---|
| Một người là một liên hệ (RESO `Contacts`) | Một liên hệ có tên, loại (Chủ bán · Chủ cho thuê · Người mua · Người thuê, chọn được nhiều loại), một người giữ và nhiều số. Mỗi số lưu ở dạng mã hoá kèm dấu vết, có nhãn và một số chính | ADR-0021 · migration 016 |
| Lead, chủ nhà của hàng gắn vào liên hệ | Kiểm trùng đi qua liên hệ. «Lên bảng» là dữ kiện, không còn đoán theo số. «Sửa số và gửi lại» thêm số vào đúng người cũ | ADR-0021 · hàng 85 (đã ký) |
| Khách là liên hệ Người mua · Người thuê | Việc của đầu khách với một khách là một **nhu cầu khách**. Lần gửi gắn vào nhu cầu ấy. Đầu khách không đọc được liên hệ | ADR-0021 sửa đổi 03/11 · hàng 86 (đã ký) |
| Quyền | Liên hệ chủ nhà trọn lớp nguồn: chỉ người giữ còn vai Đầu chủ và trưởng nhóm đọc được. Telesales tạo được nhưng không đọc lại. Quản trị không tự thấy chủ nhà. Mỗi lần mở số là một sự kiện | Tham chiếu §4, lớp trường · migration 016 |
| Phần đọc | Đọc được một liên hệ (tên, loại, người giữ, số lượng số, trạng thái Lead / Liên hệ, **không trả số**). Sửa được loại. Có các đường của nhu cầu khách | `packages/api/src/contacts/routes.ts` |
| **Chưa có** | Không có lệnh liệt kê liên hệ, không có lệnh đọc số của liên hệ, không có lệnh gộp. Không có màn danh sách, không có màn hồ sơ. Năm nhà điều hướng không có «Liên hệ» | `routes.ts` · Tham chiếu §9, §10 · `vo-va-ia.md` |

Hiện người chỉ lộ ra từng mảnh: dòng lead ở Hôm nay (nút «Mở số»), chế độ cuộc gọi («Chủ nhà muốn»), «Khách mới» trong luồng Gửi, và
Lead của tôi. Không chỗ nào gom lại thành một người.

### 1.2 Ai cần gì về một người

| Vai | Cần | Được phép (đã chốt) |
|---|---|---|
| Đầu chủ | Biết chủ nhà mình giữ có những căn nào, lead nào đang mở, đã gọi lúc nào, số nào là số chính. Gọi được ngay trên điện thoại | Đọc liên hệ mình giữ, mở số (ghi sự kiện) |
| Trưởng nhóm | Soát người trùng, xem ai giữ ai, chuyển người giữ khi nhân sự nghỉ, xem hai đầu khách có cùng phục vụ một khách không | Đọc mọi liên hệ của nhóm; có danh sách gộp từ dữ liệu cũ (Hỏi-1, 01/11) |
| Đầu khách | Thấy khách của mình và những gì đã gửi cho họ | **Không đọc liên hệ**, chỉ đọc nhu cầu khách của mình (Hỏi-5, 03/11) |
| Telesales | Nhập lead, gọi | Tạo được, **không đọc lại** (Hỏi-4, 01/11) |
| Quản trị sàn | Cài đặt sàn | Không tự thấy chủ nhà |

### 1.3 Nỗi đau đã đo hay đã ghi

- Chủ trùng phải so dấu vết số trên hai bảng. Chủ có hai số bị tách thành hai người. Gửi lại thành người khác. «Lên bảng» phải đoán.
  Cả bốn lỗi đã đo ở hàng 24, 25, 27. Phần dữ liệu đã sửa xong ở hàng 85, nhưng **chưa có chỗ để người dùng nhìn thấy cái đúng**
  (ADR-0021 §Bối cảnh; ADR-0020).
- Khách có hai số thành hai người, và đầu khách đổi người thì mất lịch sử. Phần dữ liệu đã sửa ở hàng 86.
- Tham chiếu §13 còn mở câu «đau "trùng chủ nhà" đã hết chưa». Màn Liên hệ là chỗ trả lời câu này bằng mắt: một chủ, một hồ sơ, đủ các căn.

## 2. Bối cảnh ngành

### 2.1 RESO Data Dictionary 2.0

- **`Contacts`** có 91 trường. `ContactType` chọn được nhiều giá trị, trong 22 giá trị có Buyer, Seller, Landlord, Tenant, Lead,
  Prospect. Số điện thoại có các trường sẵn, số thêm nằm ở bảng con `OtherPhone`. Người giữ là `OwnerMemberKey`. Ngoài ra có
  `ContactStatus` (Active · Inactive · Deleted · OnVacation), `LeadSource`, `ReferredBy`. RESO **không có** trường đồng ý hay từ chối
  liên lạc. Nguồn: dd.reso.org/DD2.0/Contacts, /OtherPhone, /lookups/ContactType, /lookups/ContactStatus.
- **`ContactListings`** nối một người với các căn đã gửi: gửi lúc nào, đã xem chưa, thích, cân nhắc hay loại. Đây chính là Lần gửi
  của Quỹ hàng. Nguồn: dd.reso.org/DD2.0/ContactListings.
- Các bảng liên quan khác: `Prospecting` (nhu cầu khách), `SavedSearch`, `Teams`, `HistoryTransactional` (lịch sử thay đổi).

Quỹ hàng đã theo RESO ở loại liên hệ, người giữ và nhiều số. Phần còn thiếu so với RESO là nguồn lead, người giới thiệu, trạng thái
ngừng liên hệ, và lịch sử thay đổi xem được.

### 2.2 Nghề môi giới Việt Nam

- Dữ liệu chủ nhà và khách là tài sản cạnh tranh. Báo chí ghi nhận các ca lộ dữ liệu qua nhóm chat, và ca môi giới nghỉ việc mang
  dữ liệu đi bán (doanhnghiephoinhap.vn, 2022, bài có phần quảng cáo). Có sàn đang thử mã hoá thông tin khách, chỉ mở khi chủ nhà đồng ý
  (vnbusiness.vn, 02/10/2025).
- Môi giới hay giữ khách trong danh bạ, sổ tay, Excel (vneconomy.vn). Vì vậy một màn Liên hệ phải thắng được danh bạ điện thoại về độ
  nhanh: gọi được trong một chạm.
- Chưa tìm được tài liệu có nguồn tả rõ tục «giữ chủ / giữ khách» giữa đầu chủ và đầu khách. Điều Quỹ hàng biết về tục này đến từ
  phỏng vấn của chính dự án (Tham chiếu §4), chưa có nguồn ngoài.

### 2.3 Luật dữ liệu cá nhân (đã tra lại theo bản hiện hành)

- **Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15** thông qua 26/06/2025, có hiệu lực từ 01/01/2026. Nghị định hướng dẫn là
  356/2025/NĐ-CP. Nguồn: luatvietnam.vn, thuvienphapluat.vn.
- **Các điểm chạm tới Liên hệ:**
  - Thu thập đúng mục đích (Điều 3).
  - Chủ thể có quyền xem, sửa, xoá, hạn chế xử lý (Điều 4).
  - Đồng ý phải theo từng mục đích, im lặng không phải là đồng ý (Điều 9).
  - Xử lý để thực hiện thoả thuận với chủ thể thì không cần đồng ý (Điều 19). Ví dụ là hợp đồng môi giới với chủ nhà.
  - Phải xoá khi được yêu cầu hoặc khi đã xong mục đích (Điều 14).
  - Cấm mua bán và làm lộ dữ liệu cá nhân (Điều 7).
  - Phạt tới 3 tỷ đồng với tổ chức (Điều 8).
- **Chưa kiểm được:**
  - Mốc «xoá trong 72 giờ» của Nghị định 13/2023 còn áp dụng sau 01/01/2026 hay không.
  - Sàn và Quỹ hàng có được miễn trừ cho doanh nghiệp nhỏ ở Điều 38 không.
  - Lead chủ nhà chưa ký thoả thuận có cần đồng ý không.

  Ba điểm này là suy luận của máy, cần người có chuyên môn luật xác nhận.
- **Hệ quả cho Quỹ hàng:** bất biến 2 (thông tin chủ nhà không rời công ty) và mỗi lần mở số là một sự kiện đã đi đúng hướng luật mới.
  Còn thiếu ba thứ:
  - ghi căn cứ giữ số (thoả thuận hay đồng ý, ngày ghi nhận);
  - đường xử lý khi người ấy yêu cầu xoá hay hạn chế;
  - xem được ai đã mở số của một người.

## 3. Các sản phẩm cùng ngành giải nỗi đau ra sao

| Năng lực | Follow Up Boss | kvCORE / BoldTrail | Lofty | Zoho CRM (che số) | CRM Việt Nam (Meey, Fastwork, MISA AMIS) |
|---|---|---|---|---|---|
| Danh sách lọc động, giai đoạn | Danh sách thông minh, tự cập nhật theo giai đoạn và lần liên lạc cuối | Lọc theo trạng thái, lưu bộ lọc | chưa kiểm được | — | Meey: phân loại nhiều tiêu chí |
| Chống trùng, gộp | Tự chống trùng (email, hay số + tên); gộp tay tới 10 hồ sơ, hồ sơ phụ mất một phần dữ liệu | Có gộp; không gộp được hai lead khác cấp sở hữu | Chống trùng luôn bật; ai thấy cả hai hồ sơ mới gộp được; người khác chỉ thấy tên và người giữ | — | Fastwork chỉ chống trùng theo mã khách, không theo số |
| Quyền xem, che số | Phân quyền theo vai; cộng tác viên theo từng lead | «Liên hệ riêng tư»: quản trị chỉ thấy «Private Lead + mã», không mở, không gọi được | Bật tắt quyền theo môi giới | Che cả số hay chừa vài số; người có quyền bấm mắt để hiện; vẫn gọi được | Nhân viên chỉ thấy khách mình phụ trách |
| Quan hệ giữa người | Vợ / chồng | chưa kiểm được | Gộp thành «thành viên gia đình» | — | chưa kiểm được |
| Sở hữu dữ liệu, người nghỉ việc | Chia vòng, ai nhận trước | **Sở hữu ba cấp: công ty, nhóm, môi giới.** Người rời nhóm không mang lead nhóm đi; lead công ty không xoá được | Luật phân lead theo cá nhân, nhóm, công ty | — | Phân theo phòng ban |
| Nhập, xuất | Nhập có chống trùng | Xuất bị giới hạn theo cấp sở hữu | Nhập CSV có chống trùng | — | MISA: nhập Excel, Facebook, Zalo |

Nguồn: help.followupboss.com (bài 11460704008855, 4402372112791, 4402370636567, 4402121268631); help.insiderealestate.com (bài 3386488,
285957); support.expcloud.com (lead-ownership-in-boldtrail); intercom.help/kvcore (8349271); help.lofty.com (360054872172,
360038978132, 360055177831); help.zoho.com (field-masking); meeycrm.com; help.fastwork.vn; amis.misa.vn. Getfly, CRMVIET, Homenext,
Rever, KW Command: chưa tìm được tài liệu tính năng công khai, nên chưa kiểm được.

### Mỗi cách giải nỗi đau nào, tạo giá trị gì

1. **Một hồ sơ, một dòng thời gian** (Follow Up Boss, Meey): lead đổ về nhiều kênh làm một người thành nhiều hồ sơ. Gom lại thì biết
   lần cuối nói gì với ai. Quỹ hàng đã có dữ liệu cho phần này: sự kiện của lead, của hàng, của nhu cầu khách, của lần mở số.
2. **Thấy có mà không thấy gì** (BoldTrail «Private Lead», Lofty báo trùng chỉ lộ tên và người giữ): người không có quyền biết đã có
   người này và ai đang giữ, nhưng không thấy số. Mẫu này khớp lớp nguồn và luật «số thuộc người khác thì báo không thêm được».
3. **Che số mà vẫn gọi được** (Zoho): người cần gọi gọi được mà không mang số đi. Hợp với telesales về sau. Quỹ hàng làm hơn Zoho
   một bước, vì đã ghi mỗi lần mở số.
4. **Sàn sở hữu, môi giới giữ quan hệ** (BoldTrail ba cấp): môi giới nghỉ việc thì dữ liệu vẫn ở lại sàn. Đây đúng là nỗi lo số một
   của sàn ở Việt Nam.
5. **Danh sách việc hằng ngày tự sinh** (Follow Up Boss): trả lời câu «hôm nay gọi ai». Ở Quỹ hàng, câu này hiện do Hôm nay của đầu
   chủ trả lời theo căn, chưa theo người.
6. **Gộp giữ đủ lịch sử, gộp thành quan hệ** (Lofty): một người hai hồ sơ thì gộp lại; hai người khác nhau có liên quan thì nối với
   nhau. Follow Up Boss làm mất dữ liệu phụ khi gộp, đây là điều cần tránh.

## 4. Quét chặn sót: các năng lực quanh Liên hệ

Quét theo khuôn «tính năng quanh một thực thể». Chân sản phẩm lấy từ Tham chiếu, ADR-0021 và mã đã dựng. Chân ngành lấy từ RESO,
Follow Up Boss, BoldTrail, Lofty, Zoho và CRM Việt Nam ở mục 3.

**Bốn trục:**

- **Vòng đời:** tạo · nhận ra trùng · gộp và tách · sửa (từng người, hàng loạt) · tổ chức (loại, nhãn, danh sách lưu, người giữ) ·
  lưu trữ hay xoá theo yêu cầu · xuất.
  - Thước đủ: khuôn RESO `Contacts` và năng lực của Follow Up Boss, Lofty.
- **Vai × phạm vi:** telesales · đầu chủ (người mình giữ) · đầu khách (khách của mình) · trưởng nhóm (cả nhóm) · quản trị.
  - Thước đủ: Tham chiếu §4 và ADR-0021.
- **Nối sang:** căn (chủ nhà của hàng) · lead · nhu cầu khách · Lần gửi · cuộc gọi và mở số · lịch xem (chưa dựng).
  - Thước đủ: các bảng đã có và RESO `ContactListings`, `Prospecting`.
- **Thời gian:** dòng thời gian · việc kế và nhắc · liên hệ nguội · lịch sử thay đổi.
  - Thước đủ: Follow Up Boss và RESO `HistoryTransactional`.

**Lớp áp lên mọi ô:**

- luật dữ liệu cá nhân (căn cứ, quyền xoá, nhật ký mở số);
- trạng thái tải, trống, lỗi;
- tìm và lọc;
- phân trang;
- điện thoại 375 không cuộn ngang.

### Kết quả quét

| Nhóm năng lực | Ô | Xếp | Lý do |
|---|---|---|---|
| Danh sách | Danh sách liên hệ theo quyền, lọc theo loại, tìm theo tên | **Bản đầu** | Lõi của màn; dữ liệu và quyền đã có |
| | Tìm theo số (gõ số, ra đúng người, không hiện số người không được đọc) | **Bản đầu** | Cách môi giới thật hay tìm; dùng lại dấu vết số đã có |
| | Danh sách lưu, giai đoạn, «nguội» | Sau | Follow Up Boss có; cần thêm việc kế mới có nghĩa |
| | Nhãn do sàn đặt | Sau | Chờ hàng 47 (trường riêng) |
| Hồ sơ | Tên, loại, người giữ, Lead / Liên hệ, các số (che, bấm hiện thì ghi sự kiện, gọi một chạm) | **Bản đầu** | Thay danh bạ; dùng luật mở số đã có |
| | Các căn của người này, các lead | **Bản đầu** | Trả lời câu «một chủ nhiều căn» và «đau trùng chủ đã hết chưa» |
| | Nhu cầu khách và Lần gửi gắn với người này | **Bản đầu, chỉ trưởng nhóm** | Đầu khách không đọc liên hệ; trưởng nhóm thấy cả hai đầu khách |
| | Dòng thời gian gộp từ sự kiện có sẵn | **Bản đầu** | Sự kiện đã ghi, chỉ cần đọc gộp |
| | Ai đã mở số người này | Sau, gộp vào hàng quyền dữ liệu | Luật dữ liệu cá nhân; cần màn riêng cho trưởng nhóm |
| | Quan hệ giữa người (vợ / chồng, người được uỷ quyền) | Sau | Lofty, Follow Up Boss có; RESO chưa có bảng riêng |
| Sửa | Sửa tên, loại, thêm số, đổi số chính | **Bản đầu** (sửa loại đã có; tên và số dùng luật hàng 85) | Hồ sơ chỉ đọc thì người dùng quay lại Excel |
| | Sửa hàng loạt | Sau | Đi cùng hàng đổi người giữ |
| Trùng | Báo trùng khi thêm số (đã có ở hàng 85, 86) | Đã có | Không làm lại |
| | Gộp tay hai liên hệ và tách lại, giữ đủ lịch sử | Sau, **hàng riêng** | Đã cố ý để ngoài 85 và 86; có rủi ro dữ liệu, nên là T3 riêng |
| Người giữ | Đổi người giữ khi nhân sự nghỉ | Sau | Hàng 89 đang làm đổi đầu chủ của hàng; cần thêm phần liên hệ không có hàng |
| Vào | Thêm liên hệ tay (không qua lead hay căn) | Sau | Hiện liên hệ sinh từ lead, căn, khách; thêm tay dễ tạo người không ai giữ |
| | Nhập danh bạ hay Excel | Sau | Nhập Excel hàng 65 đã tạo liên hệ chủ nhà |
| Ra | Xuất danh sách liên hệ | **Không làm** phần số chủ | Bất biến 2. Xuất không số thì để sau |
| Quyền dữ liệu | Căn cứ giữ số, yêu cầu xoá hay hạn chế | Sau, **hàng riêng sớm** | Luật 91/2025 đã có hiệu lực; cần người có chuyên môn luật xác nhận |
| Vai | Màn Liên hệ cho telesales | **Không làm** | Telesales không đọc lại (Hỏi-4) |
| | Màn Liên hệ cho quản trị | **Không làm** | Quản trị không tự thấy chủ nhà |
| | «Khách của tôi» cho đầu khách (nhu cầu khách, không phải liên hệ) | Sau, **hàng riêng** | Đầu khách không đọc liên hệ; màn này đọc nhu cầu khách |
| Thời gian | Việc kế, nhắc gọi lại | Sau | Follow Up Boss có; Hôm nay đang làm phần này theo căn |
| | Lịch xem gắn người | Sau | Chờ phỏng vấn (Tham chiếu §13, H1) |

Có 7 ô **Bản đầu** trên khoảng 25 ô có nghĩa. Danh sách và hồ sơ chiếm phần lớn, nên tỷ lệ này hơi vượt mức ⅕ mà khuôn khuyên. Nếu
cần cắt thêm thì nên cắt sửa tên và số ở bản đầu, chỉ giữ sửa loại đã có.

## 5. Khuyến nghị phạm vi cho 103

**Một màn Liên hệ đọc là chính, cho đầu chủ và trưởng nhóm.**

- **Danh sách:**
  - Đầu chủ thấy người mình giữ; trưởng nhóm thấy cả nhóm.
  - Lọc theo loại (Chủ bán · Chủ cho thuê · Người mua · Người thuê) và theo Lead / Liên hệ.
  - Tìm theo tên và theo số. Tìm theo số mà ra người mình không được đọc thì chỉ hiện «đã có, [Tên đầu chủ] đang giữ».
  - Trên máy tính dùng bố cục Danh sách – chi tiết (khối đang dùng cho Bảng hàng và hồ sơ căn); trên điện thoại dùng danh sách rồi
    hồ sơ.
- **Hồ sơ một người:**
  - Tên, loại, người giữ, trạng thái.
  - Các số được che. Bấm để hiện, mỗi lần hiện ghi một sự kiện mở số. Gọi được một chạm.
  - Các căn và lead của người này.
  - Với trưởng nhóm: thêm nhu cầu khách và Lần gửi.
  - Dòng thời gian gộp từ các sự kiện đã có.
- **Sửa:** loại (đã có), tên, thêm số và đổi số chính theo luật hàng 85.
- **Không làm ở 103:**
  - gộp tay;
  - xuất;
  - thêm liên hệ tay;
  - nhãn;
  - việc kế;
  - màn cho telesales, quản trị, đầu khách.
- **Kỹ thuật:**
  - Đường đọc mới đặt ở `contacts/read/**`, không sửa tệp hàng 89 đang sửa.
  - Không đổi quyền: dùng đúng luật cách ly và lớp nguồn đã có.
  - Hạng dự kiến **T2**. Lên T3 nếu cần migration, ví dụ thêm một chỉ mục tìm theo tên.

**Chỗ cần chủ kho quyết ở Cổng Phạm vi:** Liên hệ đứng ở đâu trong điều hướng.

- **Máy khuyên:** thêm một nhà thứ sáu «Liên hệ», chỉ hiện cho vai đọc được, tức đầu chủ và trưởng nhóm.
- **Cách khác:** đặt ở cột thứ hai dưới «Đội». Cách này rẻ hơn nhưng khó tìm hơn.

**Đường đo gợi ý** (chủ kho đặt ngưỡng ở Cổng Đáng): đo được bằng sự kiện đã có, không cần cột mới.

- Số lần mở hồ sơ liên hệ mỗi tuần theo vai.
- Tỷ lệ lần mở số đi từ hồ sơ so với từ dòng lead.
- Số chủ nhà có từ hai căn trở lên hiện đúng một hồ sơ.

## 6. Hàng tiếp theo đề xuất (chưa mở — chủ kho chọn)

| # | Hàng đề xuất | Một dòng | Vì sao | Hạng dự kiến |
|---|---|---|---|---|
| 1 | Quyền chủ thể dữ liệu | Ghi căn cứ giữ số (thoả thuận hay đồng ý, ngày); nhận yêu cầu xoá hay hạn chế xử lý; trưởng nhóm xem ai đã mở số | Luật 91/2025 có hiệu lực từ 01/01/2026; phạt tới 3 tỷ; cần người có chuyên môn luật xác nhận ba điểm chưa kiểm được | T3 |
| 2 | Gộp tay và tách liên hệ | Trưởng nhóm gộp hai hồ sơ cùng một người, giữ đủ lịch sử, tách lại được | Hàng 85, 86 cố ý để ngoài; Follow Up Boss, Lofty đều có; Follow Up Boss mất dữ liệu khi gộp là điều cần tránh | T3 |
| 3 | Khách của tôi (đầu khách) | Danh sách nhu cầu khách trên điện thoại: khách, tiêu chí, Lần gửi, khách phản ứng | Đầu khách không đọc liên hệ nhưng cần một chỗ xem khách; dữ liệu và đường đọc đã có ở hàng 86 | T2 |
| 4 | Người giữ khi nhân sự nghỉ | Trưởng nhóm chuyển mọi liên hệ của một người sang người khác, kể cả liên hệ không có hàng | Nỗi lo số một của sàn Việt Nam; BoldTrail giải bằng sở hữu ba cấp; hàng 89 chỉ phủ liên hệ có hàng | T3 |
| 5 | Việc kế và danh sách lưu theo người | Nhắc gọi lại, liên hệ nguội, danh sách lưu theo loại và trạng thái | Follow Up Boss, kvCORE dùng làm màn việc hằng ngày; cần thấy số dùng 103 trước khi làm | T2 |
| 6 | Quan hệ giữa liên hệ | Nối vợ / chồng, người được uỷ quyền, người giới thiệu (`ReferredBy`) | Lofty, Follow Up Boss có; chủ nhà Việt Nam hay nhờ người nhà bán | T2 |

Liên quan đã có trong lộ trình: hàng 47 (trường riêng theo loại liên hệ), hàng 89 (đổi đầu chủ hàng loạt), H1 (lịch xem).

## Giới hạn của báo cáo

- Khảo sát dựa trên tài liệu công khai của từng sản phẩm, chưa dùng thử. Một số trang Follow Up Boss bị chặn, nội dung lấy qua kết quả
  tìm kiếm.
- Chưa có tài liệu công khai cho CRM bất động sản Việt Nam chuyên sâu (Getfly, Homenext, Rever). Meey CRM chỉ có trang giới thiệu.
- Phần luật là đọc của máy, không phải ý kiến pháp lý.
