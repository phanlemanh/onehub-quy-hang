# Đối chiếu ngành: sản phẩm cùng loại làm thế nào, và để sàn cấu hình ở đâu

> Trang sống, theo [ADR-0022](../adr/0022-dinh-vi-va-chuan-doi-chieu.md). Bản thiết kế lấy ít nhất hai sản phẩm có tên từ
> đây (luật ở [`.claude/rules/thiet-ke-doi-chieu.md`](../../.claude/rules/thiet-ke-doi-chieu.md)). Tra được điều mới thì
> thêm vào đây trong cùng PR. Đối tượng ↔ RESO ↔ KW nằm ở [Tham chiếu §15](tham-chieu.md); trang này ghi **cách làm
> việc**, phần RESO không định nghĩa.

Tra ngày 01/11/2026. Nguồn chủ yếu là help center chính chủ, gồm Zendesk của Follow Up Boss, KW và Lofty; Intercom của
BoomTown và Inside Real Estate; dd.reso.org. Không đăng nhập. Nguồn bên thứ ba có ghi «(bên thứ ba)». Chỗ không tìm được
nguồn công khai ghi **chưa kiểm**. Help center của kvCORE nay mang tên **BoldTrail** (cùng hãng Inside Real Estate), nên
trang này dùng tên BoldTrail.

Chú thích cột «Cấu hình ở đâu»: **Cố định** là hãng định nghĩa, người dùng không đổi được. **Sàn** là chủ tài khoản hoặc
admin của công ty đặt cho cả đội. **Người** là mỗi người dùng tự tạo. **Lai** là có một lõi cố định cộng phần tự đặt.

## Tóm một bảng

| Năng lực | Follow Up Boss | KW Command | Lofty | BoldTrail | REDX | BoomTown | MLS / RESO |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1. Khai thác chủ nhà, gọi theo danh sách | Call List: **Người** tạo từ Smart List | Không tự quay số | Call List: **Người** tạo từ Segment | Tab Calls: máy sinh | Nguồn **Cố định** 5 loại; thư mục: **Người** | Trang định giá | — |
| 2. Liên hệ | Nhãn số: **Người**; trường riêng: **Sàn** | Nhãn số **Cố định** 4 loại; trường riêng tự tạo | Vai gán: 3 **Cố định** + 10 **Sàn** | Loại lead **Cố định** 5 | — | Tag cấp đội | `Contacts` |
| 3. Chia lead | **Sàn** | **Sàn**, có trần lead | **Sàn**, ba cấp | **Sàn**; luật mặc định **Cố định** | Chưa kiểm | **Sàn**: luật có thứ tự | — |
| 4. Hàng đợi, danh sách việc | **Lai**: bộ lọc lưu được, có bộ mặc định sửa được | **Người**: SmartView | **Lai**: mặc định khoá + của đội + riêng | **Người**: bộ lọc lưu được | Thư mục: **Người** | **Lai**: mặc định khoá + riêng | `SavedSearch` |
| 5. Đường ống | **Lai**: giữ cứng ba mốc | **Lai**: 5 Phase **Cố định**, Stage tự đặt | **Lai**: giữ cứng ba mốc | **Cố định** 8 bước | — | **Cố định** | Chuẩn cố định + nhãn của MLS neo vào |
| 6. Listing, trạng thái | Không quản kho | Internal Listing | Manual Listing | Manual Listing | — | Lấy từ MLS | `StandardStatus` ↔ `MlsStatus` |
| 7. Ảnh | — | — | — | — | — | — | `Media.Permission` |
| 8. Phát hàng, trang khách | Site bên thứ ba | Saved Search · Collection | Property Alerts | Search Alerts | — | e-Alert, IDX | `Prospecting`, `ContactListings` |
| 9. Cấu hình theo sàn | Dồn về chủ tài khoản | Quyền theo từng ứng dụng | Toggle quyền; My / Office / Company | Company ⊃ Office ⊃ Team | Ghế đội | Người / Admin / hãng | RESO / MLS / thành viên |
| 10. Kịch bản gọi, kết quả, lý do mất | Không có kịch bản; mất là một stage | Lý do mất gõ tự do | Kịch bản: **Người** viết | Một câu nhắc **Cố định** | Kịch bản hãng soạn | Chưa kiểm | — |

## 1. Tìm và khai thác chủ nhà

Quỹ hàng: telesales gọi lọc chủ nhà rồi nhập lead (Tham chiếu §3). Danh sách nguồn chủ nhà chưa có. Gọi từ máy tính là
hàng 30.

| Sản phẩm | Cách làm | Cấu hình ở đâu | Nguồn |
| --- | --- | --- | --- |
| REDX | Bán năm loại danh sách chủ nhà: Expired, FSBO, FRBO, Pre-Foreclosure, GeoLeads | **Cố định** do REDX cung cấp; người dùng chọn mua loại nào, lọc theo vị trí, giá, ngày | [redx.com](https://www.redx.com/), [Expired Leads](https://www.redx.com/products/expired-leads/) |
| REDX | GeoLeads: thả ghim hoặc vẽ vùng, tối đa 2.500 lead mỗi tháng | **Người** vẽ vùng | [GeoLeads](https://www.redx.com/products/geoleads/) |
| REDX | Power Dialer có ba chế độ (xem trước, một line, nhiều line), chạy trên engine WAVV, kiểm danh sách cấm gọi (DNC) | Người chọn chế độ theo gói | [Power Dialer](https://www.redx.com/products/power-dialer/), [FAQs](https://www.redx.com/faqs/) |
| REDX | Danh sách gọi là **thư mục** trong Vortex: lọc lead, xếp vào thư mục, cho dialer chạy theo thư mục | **Người** tạo thư mục (suy từ lời kể của agent; cách tạo chưa kiểm) | [Use a power dialer](https://www.redx.com/blog/use-a-power-dialer/), [Vortex case study](https://www.redx.com/case-study/agent-reviews-free-vortex-real-estate-lead-manager/) |
| REDX | Gói Teams giao lead mới mỗi sáng; Pulse Tracker cho trưởng nhóm xem ai đang gọi; Whisper nhắc agent trong cuộc gọi | Lịch giao do REDX cố định; luật chia **chưa kiểm** | [REDX Teams](https://www.redx.com/products/teams/) |
| Follow Up Boss | Call Lists: chọn Smart List hay bộ lọc để thành danh sách gọi, tự gọi người kế, nhớ chỗ khi dừng; chỉ trên máy tính | **Người** | [Call Lists](https://help.followupboss.com/hc/en-us/articles/360014082414-Call-Lists) |
| Lofty | Standard Call List dựng từ Segment hay Saved Filter cộng stage; bỏ qua số cấm gọi; gọi lần lượt mọi số của lead | **Người**; tối đa 10 danh sách | [Standard Call List](https://help.lofty.com/hc/en-us/articles/360000305252-Standard-Call-List) |
| Lofty | Homeowner Agent theo dõi chủ nhà chưa rao, gửi báo cáo giá nhà định kỳ | Bật theo lead, lọc theo nguồn, đường ống, tag | [Homeowner Agent](https://help.lofty.com/hc/en-us/articles/45507362712219-Homeowner-Agent) |
| BoomTown | Trang định giá trên website; mọi lượt định giá vào Seller Dashboard | Broker phải bật; bộ lọc không lưu được | [Seller Leads Suite](https://intercom.help/bthelpcenter/en/articles/8284978-boomtown-seller-leads-suite) |
| KW Command | Không tự quay số; bấm số thì chuyển sang ứng dụng gọi | — | [Call Your Contacts](https://answers.kw.com/hc/en-us/articles/360041340054-Call-Your-Contacts-Using-Command) |

**Bài học:** danh sách gọi luôn là **bộ lọc hoặc thư mục do người dùng dựng**, không phải một danh sách cố định của hãng.
Chỉ **nguồn** chủ nhà (REDX) là cố định, vì đó là sản phẩm dữ liệu REDX bán.

## 2. Liên hệ

Quỹ hàng: một người là một liên hệ (ADR-0021). Có bốn loại RESO, nhãn số Home · Mobile · Work · Other theo KW, một người
giữ.

| Sản phẩm | Cách làm | Cấu hình ở đâu | Nguồn |
| --- | --- | --- | --- |
| RESO | `Prospecting` tách việc gửi căn cho một khách (`ContactKey`, `OwnerMemberKey`, `SavedSearchKey`) khỏi con người `Contacts` — Quỹ hàng dùng nó cho nhu cầu khách của đầu khách (hàng 86) | Thành viên giữ từng bản ghi | [dd.reso.org Prospecting](https://dd.reso.org/DD2.0/Prospecting/) |
| Follow Up Boss | Một người nhiều số; nhãn số có bộ đặt sẵn và cho gõ nhãn mới | Nhãn: **Người**, sửa trên hồ sơ | [Phone Number Labels](https://help.followupboss.com/hc/en-us/articles/4402372233495-Phone-Number-Labels) |
| Follow Up Boss | Trường riêng bốn kiểu (ngày, chữ, số, chọn) | Chỉ **chủ tài khoản**; tạo xong không đổi kiểu được | [Custom Fields](https://help.followupboss.com/hc/en-us/articles/360015273733-Custom-Fields) |
| KW Command | Lead và Contact là cùng một bản ghi, đổi qua lại bằng ô «Mark as Lead»; Owner, Assignee, Collaborators | Nhãn số **Cố định** Home/Mobile/Work/Other | [Contacts Overview](https://documentation.kw.com/html/kellercloud/command/contacts/overview-contacts.html), [Detail Fields](https://answers.kw.com/hc/en-us/articles/360015702354-Contact-and-Lead-Detail-Fields) |
| KW Command | Trường riêng và tag tự tạo; tag hệ thống không sửa được | Command Settings › Contacts | [Custom Fields](https://answers.kw.com/hc/en-us/articles/27377858519059-Create-and-Edit-Custom-Fields-for-Contacts), [Contact Tags](https://answers.kw.com/hc/en-us/articles/360016213174-Create-Edit-Delete-Contact-Tags-in-Command-Settings) |
| Lofty | Vai gán trên lead: ba vai cố định cộng tối đa 10 vai tự đặt; trường riêng sáu kiểu | **Sàn** | [Custom Roles](https://help.lofty.com/hc/en-us/articles/360028073892-Creating-Custom-Roles), [Custom Fields](https://help.lofty.com/hc/en-us/articles/360054872212-Custom-Fields) |
| BoldTrail | Loại lead cố định năm loại (Buyer, Seller, Renter, Vendor, Agent), một người nhiều loại; nhãn tự đặt bằng hashtag | Loại: **Cố định**; hashtag: **Người** và **Sàn** | [Lead Types](https://help.insiderealestate.com/en/articles/4626537-boldtrail-lead-types-overview), [Entity Hashtags](https://help.insiderealestate.com/en/articles/4397331-boldtrail-admin-how-to-create-entity-hashtags) |
| RESO | `Contacts`: `OwnerMemberKey`, `ContactType` nhiều giá trị, `ContactStatus`, `LeadSource` | Lookup do RESO định | [dd.reso.org Contacts](https://dd.reso.org/DD2.0/Contacts/) |

**Bài học:** loại liên hệ thường cố định (BoldTrail, RESO), còn nhãn, tag và trường riêng thì do sàn hoặc người đặt. Quỹ
hàng đã đi đúng hướng này. Riêng nhãn số đang cố định theo KW, trong khi Follow Up Boss cho gõ nhãn mới.

## 3. Chia lead

Quỹ hàng: cách chia là cấu hình của sàn, chọn từ thực đơn năm chiến lược; hạn nhận và hạn gọi do sàn đặt (ADR-0017).

| Sản phẩm | Cách làm | Cấu hình ở đâu | Nguồn |
| --- | --- | --- | --- |
| Follow Up Boss | Luật theo nguồn, tag, giá, vùng; xét từ trên xuống, có luật mặc định; nhóm chia lần lượt hay ai nhận trước (hạn nhận tối đa 30 phút, có người hứng); kho chung (Pond) | **Sàn** (chủ tài khoản, admin) | [Advanced Lead Flow Rules](https://help.followupboss.com/hc/en-us/articles/360014656033-Lead-Flow-Advanced-Lead-Flow-Rules), [First to Claim](https://help.followupboss.com/hc/en-us/articles/360014656193-First-to-Claim), [Lead Ponds](https://help.followupboss.com/hc/en-us/articles/360048829034-Lead-Ponds-Overview) |
| Follow Up Boss | Trả lead về kho khi nguội là một công thức tự động hoá do admin tự dựng | **Sàn** | [Automations with Ponds](https://help.followupboss.com/hc/en-us/articles/360057991893-Using-Automations-with-Ponds) |
| KW Command | Ngẫu nhiên, ngẫu nhiên có trọng số, ai nhận trước, lần lượt, giao thẳng; lịch theo giờ; hạn nhận do đội đặt; kho chung; trần số lead mỗi agent | **Sàn** | [Create a Lead Route](https://answers.kw.com/hc/en-us/articles/360042591674-Create-a-Lead-Route-Must-Have-Lead-Routing-Enabled), [Lead Limit](https://answers.kw.com/hc/en-us/articles/360055317553-Set-an-Agent-s-Lead-Limit-Must-Have-Lead-Routing-Enabled) |
| KW Command | Trả lead về kho chung thì xoá người cộng tác | Agent trả lead của mình | [Send to Lead Pool](https://answers.kw.com/hc/en-us/articles/360047681713-Send-Leads-to-the-Unassigned-Lead-Pool-Teams) |
| Lofty | Luật ở ba cấp (công ty, văn phòng hay đội, cá nhân); lần lượt, Next Up có trọng số, ai nhận trước; kho chung có nhật ký nhận | **Sàn** | [Lead Routing Rules](https://help.lofty.com/hc/en-us/articles/360055177831-Lead-Routing-How-to-set-up-lead-routing-rules), [Lead Pond](https://help.lofty.com/hc/en-us/articles/360038382872-Lead-Pond) |
| BoldTrail | Luật mặc định không xoá được (lần lượt cho mọi agent đang làm); điều kiện nguồn, loại, vùng, giá; bật «nhận lead» thì bắt buộc có người hứng khi hết giờ | **Sàn** theo từng cấp | [Lead Routing Overview](https://help.insiderealestate.com/en/articles/3317750-boldtrail-lead-routing-overview) |
| BoomTown | Luật xét từ trên xuống, dừng ở luật khớp đầu; lần lượt có trọng số; bể ai nhận trước; lịch sử ghi luật nào đã khớp | **Sàn**; agent chỉ được tự tạm dừng | [Lead Matching](https://intercom.help/boomtown/en/articles/8421235-admins-lead-matching), [Lead Rotation](https://intercom.help/boomtown/en/articles/8421169-admins-editing-lead-rotation-settings) |

**Bài học:** năm sản phẩm kiểm được đều để sàn cấu hình cách chia (REDX chưa kiểm), và Quỹ hàng đã theo (ADR-0017). Bốn
sản phẩm cho **luật có
thứ tự theo điều kiện**, tức bậc 3 của ADR-0018 (ứng viên #30 trong sổ). KW có trần lead mỗi người; Quỹ hàng chưa có.

## 4. Hàng đợi và danh sách việc

Quỹ hàng: Hôm nay của đầu chủ (hàng 22) đang ở Cổng Phạm vi. Bản đầu viết năm hàng đợi chết trong mã, mỗi căn nằm ở đúng
một hàng đợi (sổ, điều khoá K8). Góc nhìn của Bảng hàng (hàng 14) thì đã lưu được.

| Sản phẩm | Cách làm | Cấu hình ở đâu | Nguồn |
| --- | --- | --- | --- |
| Follow Up Boss | Smart List là bộ lọc lưu được, gom thành Collection. Tài khoản mới có ba Collection mặc định, vd «Qualify: Needs Contact» (tạo chưa tới 11 ngày, liên lạc cuối hơn 18 giờ) | **Lai**: mặc định sửa được; **Người** tạo và chia sẻ; admin ép bộ danh sách cho cả đội (gói trả thêm) | [Smart Lists](https://help.followupboss.com/hc/en-us/articles/1500008374882-Smart-Lists-Overview), [Default Smart Lists](https://help.followupboss.com/hc/en-us/articles/4420635737239-Default-Smart-Lists), [Manage](https://help.followupboss.com/hc/en-us/articles/360012323974-Manage-Smart-Lists-Collections) |
| Follow Up Boss | Trang Tasks: Hôm nay, Quá hạn, Sắp tới | Cố định | [Tasks](https://help.followupboss.com/hc/en-us/articles/360014274453-Tasks-Overview) |
| KW Command | SmartView là cột cộng bộ lọc lưu được, không giới hạn số lượng; mỗi người đặt một cái làm mặc định | **Người**; bộ mặc định của hệ thống **chưa kiểm** | [SmartViews](https://answers.kw.com/hc/en-us/articles/360016246693-Customize-Columns-Use-Filters-and-Create-SmartViews-in-Contacts), [SmartViews (Teams)](https://answers.kw.com/hc/en-us/articles/1500000361401-Customize-Columns-Use-Filters-and-Create-SmartViews-in-Contacts-Teams) |
| Lofty | Ba lớp bộ lọc: mặc định không sửa được (Today's Opportunities, New Leads, Not Contacted, Need to Touch), của đội (admin tạo), riêng | **Lai** | [Lead Organization with Filters](https://help.lofty.com/hc/en-us/articles/360055290571-Lead-Organization-with-Filters) |
| Lofty | Segment theo bộ lọc, tự vào và ra; **một lead thuộc nhiều segment**; **mỗi segment có hạn liên lạc**, quá hạn thì lead hiện chấm đỏ | **Sàn** | [Segments](https://help.lofty.com/hc/en-us/articles/360038401831-Lead-Organization-with-Segments) |
| Lofty | Smart Call List: việc gọi hôm nay và việc gọi quá hạn, tối đa 150 | Cố định | [Smart Call Lists](https://help.lofty.com/hc/en-us/articles/360000314911-Smart-Call-Lists) |
| BoldTrail | Bộ lọc lưu được, ghim làm lối tắt; Tasks & Calls chia Quá hạn, Hôm nay, Sắp tới; việc máy sinh tự xoá sau 7 ngày quá hạn | **Người**; bộ mặc định **chưa kiểm** | [Contacts Lead Filters](https://help.insiderealestate.com/en/articles/3332415-boldtrail-contacts-lead-filters), [Tasks and Calls](https://help.insiderealestate.com/en/articles/10561800-boldtrail-tasks-and-calls-management) |
| BoomTown | Smart Segment là bộ lọc lưu được, riêng từng người, không chia sẻ được; danh sách mặc định (Today's To-Dos, New Leads, Not Contacted) không sửa được; To-Do chia Quá hạn, Hôm nay, Sắp tới | **Lai** | [Lead Central](https://intercom.help/boomtown/en/articles/8421107-lead-central-overview), [To-Dos](https://intercom.help/boomtown/en/articles/8421409-to-dos-overview) |
| RESO | `SavedSearch`: tiêu chí tìm lưu theo cú pháp OData `$filter`, gắn với thành viên | Thành viên tự tạo | [dd.reso.org SavedSearch](https://dd.reso.org/DD2.0/SavedSearch/) |

**Bài học:** mọi sản phẩm đã tra đều dựng hàng đợi bằng **bộ lọc lưu được** hay thư mục do người dùng tạo. Thứ cố định duy nhất là
**ba ngăn theo ngày** của danh sách việc (Quá hạn, Hôm nay, Sắp tới), có ở Follow Up Boss, Lofty, BoldTrail, BoomTown.
Với danh sách theo **điều kiện nghiệp vụ** (chưa liên lạc, lâu chưa chạm…), không hãng nào chỉ có bộ viết chết. Bộ mặc
định có thể khoá (Lofty, BoomTown) hay sửa được (Follow Up Boss), nhưng sàn hay người luôn được thêm danh sách của mình. Hai lối mặc định: sửa được
(Follow Up Boss) hoặc khoá cứng nhưng được thêm danh sách của đội và của người (Lofty, BoomTown). Không sản phẩm nào ép
mỗi bản ghi chỉ thuộc một danh sách; Lofty nói rõ một lead thuộc nhiều segment. «Hạn liên lạc theo segment» của Lofty
chính là hình của «cần gọi lại sau 14 ngày» trong Quỹ hàng.

## 5. Đường ống

Quỹ hàng: lead bốn nấc Đã gửi → Đã nhận → Đã gọi → Lên bảng, suy từ dữ kiện (ADR-0020). Hàng có sáu trạng thái chuẩn RESO
(§5).

| Sản phẩm | Cách làm | Cấu hình ở đâu | Nguồn |
| --- | --- | --- | --- |
| Follow Up Boss | 14 stage mặc định; «Lead», «Closed», «Trash» là của hệ thống, không đổi tên hay xoá được; phần còn lại thêm, đổi tên, xếp lại, xoá | **Lai**: chủ tài khoản | [Custom Stages](https://help.followupboss.com/hc/en-us/articles/4402370671767-Custom-Stages) |
| Follow Up Boss | Deals: nhiều đường ống (mặc định Buyers, Sellers), stage tự đặt; phải đánh dấu ít nhất một stage là «đã chốt» | **Sàn** | [Pipelines and stages](https://help.followupboss.com/hc/en-us/articles/360015310313-How-can-I-add-edit-or-delete-my-pipelines-and-their-stages) |
| KW Command | Ba đường ống cố định (Listings, Buyers, Leases) × năm Phase cố định (Cultivate, Appointment, Active, Under Contract, Closed). Trong mỗi Phase, stage tự đặt, kèm xác suất thành và checklist việc | **Lai** | [Customize Your Opportunity Pipelines](https://answers.kw.com/hc/en-us/articles/55206011386643-Customize-Your-Opportunity-Pipelines) |
| Lofty | Một đường ống chung cả đội; «All Leads», «New Leads», «Closed» không xoá được, phần giữa tự thêm | **Lai**: **Sàn** theo quyền | [Pipeline Stages](https://help.lofty.com/hc/en-us/articles/115002890651-Lead-Organization-with-Pipeline-Stages) |
| BoldTrail | Trạng thái liên hệ cố định tám bước (Sphere … Closed, Archive); Contract và Closed tự cập nhật từ phần mềm giao dịch | **Cố định** (khả năng sửa **chưa kiểm**) | [Contact Statuses](https://help.insiderealestate.com/en/articles/285957-boldtrail-contact-statuses-overview) |
| BoomTown | Danh mục cố định: New, Qualify, Hot, Nurture, Watch, Pending, Archive, Trash | **Cố định** | [Lead Central](https://intercom.help/boomtown/en/articles/8421107-lead-central-overview), [Lead Profile](https://intercom.help/boomtown/en/articles/8421155-lead-profile-overview) |

**Bài học:** chưa có hãng nào thả đường ống tự do hoàn toàn. Hai hãng giữ cứng tất cả (BoldTrail, BoomTown). Ba hãng dùng
**hai tầng**, với mốc cố định để báo cáo so được và bước giữa do sàn đặt (Follow Up Boss, KW, Lofty). Mẫu của KW (Phase cố
định, Stage tự đặt) khớp nhất với bốn nấc suy từ dữ kiện của Quỹ hàng.

## 6. Quản lý listing và trạng thái

Quỹ hàng: quỹ hàng nội bộ là lõi. Sáu trạng thái chuẩn; sàn thêm nhãn neo vào trạng thái chuẩn (hàng 46); ba lý do Ngừng
hẳn cố định (sổ, điều khoá K12).

Hàng 46 (dựng 06/11) theo đúng mẫu `StandardStatus` ↔ `MlsStatus`: sáu trạng thái chuẩn giữ ở lõi, quản trị sàn thêm tối đa
3 nhãn neo vào mỗi trạng thái; nhãn nhận luật và màu của neo, đếm và lọc theo trạng thái chuẩn, trang khách chỉ thấy trạng
thái chuẩn. Neo cố định sau khi tạo, gỡ nhãn đang dùng thì hỏi nhãn thay cùng neo — giống Follow Up Boss chuyển người sang
stage khác khi xoá stage đang dùng (cách hỏi chưa kiểm). Trần 3 nhãn là của ta; Follow Up Boss, KW Command không nêu trần
(chưa kiểm) — điều khoá K29.

| Sản phẩm | Cách làm | Cấu hình ở đâu | Nguồn |
| --- | --- | --- | --- |
| RESO | `StandardStatus` cố định 11 giá trị; `MlsStatus` do từng MLS tự đặt, mỗi giá trị phải neo vào đúng một `StandardStatus` | **Lai**: RESO giữ chuẩn, MLS đặt nhãn | [StandardStatus](https://dd.reso.org/DD2.0/Property/StandardStatus/), [MlsStatus](https://dd.reso.org/DD2.0/Property/MlsStatus/) |
| RESO | Trường riêng (local field) được thêm; trường trùng nghĩa trường chuẩn thì bắt buộc dùng tên chuẩn | MLS | [Extensibility & Omissibility](https://reso.org/blog/extensibility-omissibility-dd) |
| KW Command | Internal Listing («Keller Exclusives»): listing không ra KW.com hay site; chỉ agent KW thấy, người tạo đặt phạm vi (cả văn phòng hay chỉ đội) | **Người** tạo đặt phạm vi | [Create an Internal Listing](https://answers.kw.com/hc/en-us/articles/4436304396947-Create-an-Internal-Listing-in-Command-Keller-Exclusives) |
| Lofty | Manual Listing: chọn trạng thái, agent đứng tên, chọn hiện trên site nào hay không site nào | **Người**; danh mục trạng thái **chưa kiểm** | [Manual Listings](https://help.lofty.com/hc/en-us/articles/6586244604699-Manual-Listings) |
| BoldTrail | Manual Listing (Exclusive, Coming Soon, Sold) không vào MLS; Seller Report gửi chủ nhà hằng tuần | **Người** | [Manual Listings](https://help.insiderealestate.com/en/articles/3330195-boldtrail-how-to-manually-add-your-own-sold-exclusive-pocket-listings), [Seller Report](https://help.insiderealestate.com/en/articles/3330215-boldtrail-seller-report-overview) |
| Follow Up Boss, BoomTown | Không quản kho listing riêng; đọc trạng thái từ MLS | — | [FUB listing page](https://help.followupboss.com/hc/en-us/articles/40881812045847-How-to-use-the-listing-detail-page), [BoomTown Lead Matching](https://intercom.help/boomtown/en/articles/8421235-admins-lead-matching) |

**Bài học:** với các CRM, kho listing nội bộ chỉ là **tính năng phụ** (KW, Lofty, BoldTrail). Ở Quỹ hàng nó là **lõi**.
Mẫu `StandardStatus` ↔ `MlsStatus` (chuẩn cố định, nhãn neo vào) là chuẩn của ngành cho mọi danh sách có nghĩa chung.

## 7. Ảnh

Quỹ hàng: ba ngăn Gửi được · Tự có từ mã · Nội bộ; ngăn nội bộ không bao giờ ra ngoài (ADR-0014, bất biến 2).

| Sản phẩm | Cách làm | Cấu hình ở đâu | Nguồn |
| --- | --- | --- | --- |
| RESO | `Media`: `Order` (phần tử 0 là ảnh chính), `PreferredPhotoYN`, `Permission` (Public, IDX, VOW, Agent Only), `MediaCategory`, `ImageOf` | Lookup do RESO định | [dd.reso.org Media](https://dd.reso.org/DD2.0/Media/) |
| CRM Mỹ | Lấy ảnh từ MLS; quản lý ảnh riêng **chưa kiểm** | — | — |
| Meey CRM | Quỹ hàng có ảnh và video | Chưa kiểm | [meeycrm.com](https://meeycrm.com/) |
| Autoenhance | Tự nhận diện và làm mờ mặt người, biển số trên ảnh bất động sản | Tài khoản bật «Auto Privacy»; kiểu che chỉnh được không: chưa kiểm | [help.autoenhance.ai](https://help.autoenhance.ai/en/articles/7856090-privacy-blur-license-plates-and-people) |
| Zalo | Không có công cụ che trong khung gửi ảnh; ảnh gửi bị nén còn vài trăm KB trừ khi gửi dạng tệp | Người dùng bật «Ghi nhớ chất lượng ảnh và video» | [cellphones.com.vn](https://cellphones.com.vn/sforum/meo-gui-anh-tren-zalo-chat-luong-cao) (bên thứ ba) |
| MLS Mỹ — ảnh tối thiểu khi lên `Active` | Mỗi MLS một luật: ValleyMLS đòi ít nhất một ảnh mặt trước trước khi hàng Active; CRMLS phạt khi thiếu ảnh ngoài nhà; SmartMLS cho 48 giờ (căn hộ chung cư được dùng ảnh toà); OneKey MLS 24 giờ | Không có số chung | [ValleyMLS Rules](https://www.scribd.com/document/473759807/ValleyMLS-Rules-Regs) · [CRMLS](https://blog.crmls.org/?p=283) · [SmartMLS](https://matrix.smartmls.com/hc/en-us/articles/13118343449371-Photos-required-on-listings) · [OneKey MLS](https://support.onekeymls.com/hc/en-us/articles/43263101370388-Photograph-Required-for-All-Listings) |

**Bài học (hàng 23):** ảnh tối thiểu khi lên bảng là luật riêng của từng MLS, không có số chung — Quỹ hàng để sàn đặt (`listing.ready_min_real_photos`, mặc định 1, Sổ điểm biến thiên #33).

**Bài học:** RESO `Permission` cùng hình với ba ngăn ảnh của Quỹ hàng (quyền hiển thị gắn vào từng ảnh). Ngăn là cố định
vì đứng trên bất biến.

**Che vùng (hàng 19):** công cụ ngành làm mờ (Autoenhance tự động, Canva bằng cọ); Quỹ hàng tô kín màu đặc vì làm mờ chữ
số đọc ngược được — giữ cứng (Hỏi-3, lý do quyền và an toàn). Cỡ ảnh gửi đi là mặc định của sàn (Hỏi-2), như Zalo để người
dùng chọn giữ chất lượng.

## 8. Phát hàng và trang khách

Quỹ hàng: Lần gửi là link sống một căn hoặc bộ căn; người luôn bấm gửi (bất biến 3); Đã gửi đếm lượt mở và lượt quan tâm.

| Sản phẩm | Cách làm | Cấu hình ở đâu | Nguồn |
| --- | --- | --- | --- |
| RESO | `Prospecting` nối khách với một tìm kiếm đã lưu, gửi theo lịch; `ConciergeYN` giữ thư chờ môi giới duyệt; `ClientActivatedYN` là khách đã đồng ý nhận | Thành viên đặt từng chiến dịch | [dd.reso.org Prospecting](https://dd.reso.org/DD2.0/Prospecting/) |
| RESO | `ContactListings`: phản hồi của khách với từng căn (Favorite, Possibility, Discard), đã xem chưa, gửi lúc nào, ghi chú hai chiều | Khách và môi giới cùng ghi | [dd.reso.org ContactListings](https://dd.reso.org/DD2.0/ContactListings/) |
| Flexmls | Subscription theo tìm kiếm đã lưu; khách phải bấm xác nhận nhận thư; chế độ xem trước để môi giới duyệt | Từng subscription | [Flexmls Subscriptions](https://help.flexmls.com/en/subscriptions.html) |
| Matrix | Auto Email; chế độ Concierge: căn khớp bị giữ lại, môi giới duyệt rồi khách mới nhận | Từng auto email (bên thứ ba: hướng dẫn của một MLS địa phương) | [CRMLS KB](https://kb.crmls.org/knowledgebase/how-to-setup-an-auto-email-concierge/) |
| KW Command | Saved Search là bộ tiêu chí động, có thư báo; Collection là danh sách căn tuyển tay | Người | [Saved Search vs Collection](https://answers.kw.com/hc/en-us/articles/360057912834-Saved-Search-vs-Collection) |
| Lofty | Property Alerts tự động theo hỏi đầu và hành vi; theo dõi mở, bấm; hành vi sinh «Opportunity» theo tiêu chí cố định | Tạo tự động hay tay | [Property Alerts](https://help.lofty.com/hc/en-us/articles/46283225611291-Property-Alerts-Automatically-Send-Relevant-Listings-to-Your-Leads), [Opportunity Notifications](https://help.lofty.com/hc/en-us/articles/115003018292-Opportunity-Notifications) |
| BoldTrail | Chọn listing rồi gửi email hay tin nhắn; Search Alerts gán theo hashtag; theo dõi mở bằng pixel | Người, sàn | [Email Listings](https://help.insiderealestate.com/en/articles/3424538-boldtrail-how-to-email-listings-to-your-contacts), [Search Alerts](https://help.insiderealestate.com/en/articles/3332619-boldtrail-search-alerts-overview) |
| BoomTown | e-Alert gửi listing mới, tạo từ hành vi, từ tìm kiếm đã lưu hay tay; website IDX | Đội (chi tiết **chưa kiểm**: bài gốc 404) | [Consumer Website](https://boomtownroi.com/features/consumer-website/) |

**Bài học:** «link sống» của Quỹ hàng tương ứng với Collection của KW, cộng `ContactListings` (phản hồi theo từng căn).
Ngành **tự gửi** theo lịch (`Prospecting`, Property Alerts). Quỹ hàng **cố ý không** tự gửi. Gần nhất là chế độ Concierge
và Preview của MLS: máy soạn, người duyệt, người gửi.

## 9. Cấu hình theo sàn

Quỹ hàng: sổ điểm biến thiên, ba bậc (ADR-0018); một cấp sàn, có ghi đè dưới sàn cho từng đối tượng; năm vai cố định.

| Sản phẩm | Cách làm | Cấu hình ở đâu | Nguồn |
| --- | --- | --- | --- |
| Follow Up Boss | Vai cố định (Owner, Admin, Agent, Lender, thêm ISA, Team Lead ở gói cao); chỉ chủ tài khoản đổi stage, trường riêng, kết quả cuộc hẹn | **Sàn**, dồn về một người | [Users, Roles & Permissions](https://help.followupboss.com/hc/en-us/articles/4402370636567-Users-Roles-Permissions) |
| KW Command | Quyền theo từng ứng dụng: Standard, Enhanced, Unlimited; nguồn lead tự đặt của đội | **Sàn** | [Team Permission Levels](https://answers.kw.com/hc/en-us/articles/360052475813-Team-Permission-Level-Details), [Custom Lead Sources](https://answers.kw.com/hc/en-us/articles/360052975034-Create-and-Manage-Team-Custom-Lead-Sources-Enhanced-Unlimited) |
| Lofty | Phạm vi Của tôi / Văn phòng / Công ty cho kế hoạch tự động và chia lead; thư viện kế hoạch; quyền bật tắt từng phần | Ba cấp | [Smart Plan Builder](https://help.lofty.com/hc/en-us/articles/45537578767643-Smart-Plan-Builder) |
| BoldTrail | Admin lồng nhau: Công ty ⊃ Văn phòng ⊃ Đội; chiến dịch của broker agent chỉ nhân bản được, có chiến dịch bắt buộc | Ba cấp | [Defining User Roles](https://help.insiderealestate.com/en/articles/4336931-boldtrail-defining-user-roles), [Smart Campaigns](https://help.insiderealestate.com/en/articles/3330227-boldtrail-a-complete-guide-to-smart-campaigns) |
| BoomTown | Kế hoạch nuôi ba tầng: của agent, của công ty, dựng sẵn của hãng; Success Assurance do admin đặt chi tiết (nguồn, danh mục, giờ làm, lời chào) | Ba tầng | [Smart-Drip](https://intercom.help/boomtown/en/articles/8421705-smart-drip-overview), [Success Assurance](https://intercom.help/boomtown/en/articles/8421573-success-assurance-overview) |

Tên hiển thị neo vào giá trị chuẩn (tra 09/11): RESO Lookup có `LookupValue` là tên địa phương hay từ đồng nghĩa, `StandardLookupValue` giữ mục chuẩn ([Terms](https://dd.reso.org/DD2.1/about/terms/), [đề xuất Transport](https://transport.reso.org/proposals/data-dictionary.html)), nên nhiều tên trỏ một mục chuẩn là hợp lệ. Cận kề: Veeva Vault tách tên máy khỏi nhãn của giá trị ([API](https://general.veevavault.dev/vault-api/api-reference/26.1/picklists/update-picklist-value-label/)). BoldTrail, Lofty, Follow Up Boss đặt tên loại hình thế nào: **chưa kiểm**.

**Bài học:** mẫu chung là **hãng dựng sẵn → sàn đặt → người tự thêm**. Quỹ hàng đã có hãng → sàn, và ở góc nhìn có người.
Cấp văn phòng hay đội nằm giữa sàn và người thì chưa có; Quỹ hàng chưa có khái niệm «Nhóm» (Tham chiếu §6).

## 9a. Mật khẩu và đăng nhập

Tra 04/11 (hàng `dang-nhap-mat-khau`). RESO Data Dictionary không có đối tượng đăng nhập hay mật khẩu.

| Sản phẩm | Cách làm | Cấu hình ở đâu | Nguồn |
| --- | --- | --- | --- |
| Salesforce | Quản trị đặt chính sách mật khẩu: độ dài tối thiểu (mặc định 8), số lần sai trước khi khoá, thời gian khoá (mặc định 15 phút); quản trị đặt lại mật khẩu, người đổi ở lần đăng nhập đầu | **Sàn** (quản trị) | [Set Password Policies](https://developer.salesforce.com/docs/atlas.en-us.232.0.securityImplGuide.meta/securityImplGuide/admin_password.htm) |
| Follow Up Boss | Người tự tạo và đổi mật khẩu, tối thiểu 10 ký tự; quên thì đặt lại qua thư; chỉnh độ dài được không — chưa kiểm | Hãng | [Creating or Changing Your Password](https://help.followupboss.com/hc/en-us/articles/360012325934-Creating-or-Changing-Your-Password) |

**Bài học:** Quỹ hàng giữ cứng ba số (độ dài, giới hạn thử, hạn mật khẩu tạm) vì quyền và an toàn — điều khoá K23–K25 ở
Sổ điểm biến thiên; cho sàn siết thêm để hàng sau khi có sàn đòi.

## 10. Chế độ cuộc gọi: kịch bản, kết quả gọi, lý do mất

Quỹ hàng: bốn kết quả gọi cố định ở mọi màn (§5); danh sách hỏi bằng năm mục mức đủ (luật 16, sổ K6); một lý do trả lead
«Số không liên lạc được» (ADR-0020).

| Sản phẩm | Cách làm | Cấu hình ở đâu | Nguồn |
| --- | --- | --- | --- |
| Lofty | Kịch bản gọi do người dùng tự viết, chọn trước khi chạy danh sách gọi, hiện cạnh dialer khi khách nhấc máy | **Người**; dùng chung cả đội **chưa kiểm** | [Call Scripts](https://help.lofty.com/hc/en-us/articles/360000306052-Call-Scripts) |
| Lofty | Màn kết quả cuộc gọi: chọn kết quả, ghi chú | Danh mục **chưa kiểm** | [Standard Call List](https://help.lofty.com/hc/en-us/articles/360000305252-Standard-Call-List) |
| REDX | Kịch bản và cách xử lý từ chối dựng sẵn trong Vortex | **Cố định**, REDX soạn; tự sửa **chưa kiểm** | [Vortex](https://www.redx.com/products/vortex/) |
| REDX | Dialer phân loại lead theo kết quả gọi (gọi lại, không quan tâm, đã hẹn, sai số) | Tự đặt **chưa kiểm** | [Why agents use power dialers](https://www.redx.com/blog/why-top-producing-real-estate-agents-use-power-dialers/) |
| Follow Up Boss | Không có kịch bản gắn cuộc gọi, chỉ bài mẫu để chép; ghi cuộc gọi bằng ghi chú tự do; mất lead là một stage (Rejected, Trash); danh mục kết quả cuộc hẹn do chủ tài khoản quản | **Sàn** | [Text Template Scripts](https://help.followupboss.com/hc/en-us/articles/4403022689303-Text-Template-Scripts), [Log Calls](https://help.followupboss.com/hc/en-us/articles/360014067054-How-to-Manually-Log-Calls-on-the-Desktop) |
| KW Command | «Mark as Lost» trên Opportunity: **gõ lý do tự do**, vào số liệu để thấy mất ở stage nào; tách với «Archive» (tạo nhầm, không vào số liệu) | **Người** | [Mark as Lost or Archive](https://answers.kw.com/hc/en-us/articles/360022415873-Mark-an-Opportunity-as-Lost-or-Archive-an-Opportunity) |
| KW Command | Stage của đường ống mang checklist việc | **Người, đội** | [Customize Your Opportunity Pipelines](https://answers.kw.com/hc/en-us/articles/55206011386643-Customize-Your-Opportunity-Pipelines) |
| BoldTrail | Khi nhận lead qua cuộc gọi, hệ thống đọc một câu nhắc cố định; kịch bản do sàn soạn **chưa kiểm** | **Cố định** | [Lead Routing Overview](https://help.insiderealestate.com/en/articles/3317750-boldtrail-lead-routing-overview) |

**Bài học:** chỗ này ngành còn mỏng, phần lớn **chưa kiểm**. Không hãng nào dùng **một** lý do mất cố định. Lý do mất
hoặc gõ tự do (KW), hoặc là một stage do sàn đặt (Follow Up Boss). Kịch bản do người dùng viết (Lofty) hoặc hãng soạn sẵn
(REDX). Checklist theo stage của KW gần nhất với «danh sách hỏi».

## 11. Nhập file bảng tính

Quỹ hàng: bộ ghép tất định (từ điển tiêu đề dựng sẵn + từ điển của sàn) ghép cột, người duyệt ở màn xem trước; cột không
khớp giữ làm ghi chú nội bộ hay trường riêng, không bỏ (ADR-0011, hàng 64). Tra ngày 03/11 — cả hai sản phẩm dưới đây
nhập **liên hệ**; nhập **bảng hàng** từ file của sàn **chưa kiểm**.

| Sản phẩm | Cách làm | Cấu hình ở đâu | Nguồn |
| --- | --- | --- | --- |
| Follow Up Boss | CSV, người chọn trường cho từng cột; cột không khớp vào Notes (kèm tiêu đề) hoặc thành Custom Field; một ô một giá trị | **Người** ghép mỗi lần nhập | [Import Contacts](https://help.followupboss.com/hc/en-us/articles/4402323033751) |
| Lofty | CSV/bảng tính, máy tự ghép rồi người soát cả cột đã «matched»; 10.000 dòng một lượt | **Người** soát | [Lead Import](https://help.lofty.com/hc/en-us/articles/360001710831) |

Dòng trùng bản ghi đã có (tra 03/11, hàng 65): Follow Up Boss không đổi người giữ và giai đoạn của liên hệ đã có, báo
Added · Updated · Duplicate, dòng lặp trong tệp được gộp ([nguồn](https://help.followupboss.com/hc/en-us/articles/4402323033751));
Lofty giữ người giữ và giai đoạn của bản ghi đã có, cập nhật trường khác, **chủ tài khoản chỉnh cách đè** ở cài đặt, hoàn
tác lần nhập trong 24 giờ ([nguồn](https://help.lofty.com/hc/en-us/articles/360054872172)). Quỹ hàng: căn có hàng mở của
người khác thành tin bổ sung, không đè (luật 20).

Hoàn tác lần nhập (tra 05/11, hàng 66): Follow Up Boss liệt lần nhập ở Admin › Import, «xoá lần nhập» xoá cả liên hệ và
ghi chú của lần ấy, kể cả ghi chú gắn vào liên hệ đã có ([nguồn](https://help.followupboss.com/hc/en-us/articles/4402323239063));
Lofty hoàn tác trong 24 giờ (nguồn trên). Cả hai không cho cấu hình. Quỹ hàng: sự kiện bù, giữ lịch sử, căn đã sửa sau lần
nhập thì liệt kê, không gỡ (ADR-0011 quyết định 8).

**Bài học:** ngành để người ghép hay soát từng lần; chưa thấy sản phẩm nào nhớ cách ghép theo sàn hay che dữ liệu cá nhân
trước khi xử lý (chưa kiểm). Quỹ hàng nhớ theo sàn (hàng 67) và che trước khi có gì rời trình duyệt (bất biến 2).

## 12. Xác nhận danh mục

Quỹ hàng: lời xác nhận căn của sàn đi sang Invest qua thoả thuận «Xác nhận danh mục» — biểu mẫu đóng, chỉ lớp danh mục,
mã sàn và mã người mờ, máy thu kéo về (ADR-0027, hàng 95). Tra ngày 08/11.

| Sản phẩm | Cách làm | Cấu hình ở đâu | Nguồn |
| --- | --- | --- | --- |
| RESO Web API — EntityEvent (RCP-27) | Nhật ký chỉ thêm; mỗi dòng `EntityEventSequence` (int64 dương, tăng đơn điệu), `ResourceName`, `ResourceRecordKey`; bên nhận kéo bằng `$filter=EntityEventSequence ge n` | **Chuẩn** — bên cung cấp phải có | [RCP-27](https://transport.reso.org/proposals/entity-events.html) |
| Google Maps — «Suggest an edit» | Sửa trên biểu mẫu theo trường; một người chưa đủ, người khác xác nhận rồi mới lên | **Hãng** đổi biểu mẫu theo loại địa điểm | [TechCrunch 2016](https://techcrunch.com/2016/07/21/google-maps-is-turning-its-over-a-billion-users-into-editors/), [Android Police](https://www.androidpolice.com/2016/06/14/google-maps-starts-using-crowd-sourcing-verify-suggested-edits/) |
| Waze Map Editor | Đề xuất sửa bản đồ đi qua người biên tập trước khi lên | **Hãng** | [Waze help](https://support.google.com/waze/answer/14324943) |

Chỗ ta viết cứng mà họ cho cấu hình: ba loại sự kiện và sáu trường báo sai cố định trong khuôn v1 — điều khoá K32 (nghĩa
chuẩn để so giữa các sàn).

## 13. Màn việc mở đầu: một danh sách hay theo vai

Tra 09/11 cho hàng `hom-nay-mot-danh-sach-viec`. Trang help của Follow Up Boss chặn đọc trực tiếp (403) nên các dòng của nó lấy
từ bản tóm công cụ tìm kiếm trên đúng các trang ấy, chưa đọc nguyên văn.

| Sản phẩm | Màn việc | Người quản lý | Báo cáo đội | Nguồn |
| --- | --- | --- | --- | --- |
| Keller Williams Command | Một trang Tasks, hai tab theo đối tượng (Contact, Opportunity); xong bằng tick kèm ghi chú | Chưa kiểm | Chưa kiểm | [Mark task complete](https://documentation.kw.com/html/kellercloud/command/tasks/mark-task-complete.html) |
| Follow Up Boss | Một trang Tasks: hôm nay, quá hạn; việc tự động hiện đúng ngày, không bắn thông báo | Cùng giao diện: agent thấy của mình, team lead thêm của đội, owner thấy hết | Mục Reporting riêng | [Tasks](https://help.followupboss.com/hc/en-us/articles/360014274453-Tasks-Overview), [Roles](https://help.followupboss.com/hc/en-us/articles/4402370636567-Users-Roles-Permissions), [Agent activity](https://help.followupboss.com/hc/en-us/articles/360014693073-Agent-activity-report) |
| HubSpot | CRM › Tasks một chỗ; hàng đợi là nhãn để nhóm, tối đa 20 mỗi người | Hàng đợi chia sẻ cho nhiều người | Dashboard riêng | [Task queues](https://knowledge.hubspot.com/tasks/use-task-queues) |
| Salesforce | Home có hai khung tách: sự kiện và việc hôm nay | Chưa kiểm | Báo cáo hoạt động riêng | [Trailhead](https://trailhead.salesforce.com/sales_admin_maximize_productivity/sales_admin_maximize_productivity_unit_1) |
| RESO DD 2.0 | Không có tài nguyên cho việc; `Queue` là nhật ký sự kiện, `InternetTracking` ghi sự kiện web | — | `Teams`, `TeamMembers` lưu đội | [Resources](https://dd.reso.org/DD2.0/about/resources/) |

Không tìm được nguồn về tin khách phản ứng thành việc hay cách tự hết: khoảng trống ngành, sản phẩm tự đặt.

## 13. Cách máy bên ngoài gọi vào

Quỹ hàng: máy bên kia gọi bằng token tĩnh dạng Bearer gắn đúng một thoả thuận, tối đa hai token còn sống, không có hạn riêng
(hàng 96, ADR-0015 sửa đổi 09/11). Tra ngày 09/11.

| Năng lực | RESO | MLS Grid | Spark (FBS) | Bridge | Bright, Trestle | Quỹ hàng |
| --- | --- | --- | --- | --- | --- | --- |
| Cách gọi máy-máy | Web API Core: OAuth2 Bearer Token hoặc Client Credentials ([RCP-37](https://transport.reso.org/proposals/web-api-core.html)) | Bearer, không endpoint đổi token ([bên thứ ba](https://apis.io/security/mls-grid/mls-grid-authentication/)) | Access token không hết hạn ([chính chủ](https://www.sparkplatform.com/docs/authentication/access_token)) | Server token, Client Credentials là đường phụ ([bên thứ ba](https://glama.ai/mcp/servers/@GumpperGroup/unlock-reso-mcp-remote/blob/fff3ad30ea1e2f1b7073952ea3e42f3b292a7fd7/docs/authentication.md)) | Client Credentials ([Bright](https://developer.brightmls.com/brightreso/default/authentication)) | Bearer tĩnh |
| Đổi token | Chưa kiểm | Cấp lại thì token cũ chết ([bên thứ ba](https://apis.io/security/mls-grid/mls-grid-authentication/)) | Chưa kiểm | Chưa kiểm | Chưa kiểm | Hai token còn sống để đổi không gián đoạn |
| Hạn của token | OAuth2 để bên cấp định | Chưa kiểm | Không hết hạn | Chưa kiểm | Access token ngắn hạn | Theo hạn của thoả thuận |

Chỗ ta viết cứng: số token còn sống tối đa mỗi thoả thuận — điều khoá K34 (quyền và an toàn).

## Sản phẩm Việt Nam

Tra bằng tiếng Việt ngày 01/11. Trang chính thức chỉ liệt kê tính năng ở mức tiếp thị. Không sản phẩm nào công bố gọi theo
danh sách, mã kết quả cuộc gọi, kịch bản, luật chia lead, ẩn số chủ nhà hay link sống cho khách. Có hai nhóm: bảng hàng
dự án sơ cấp, và CRM môi giới thứ cấp.

| Sản phẩm | Họ nói làm gì | Cấu hình | Nguồn |
| --- | --- | --- | --- |
| Meey CRM | Quỹ hàng (lọc nhiều tiêu chí, ảnh, video, trạng thái, lịch sử giao dịch), khách, nhu cầu tự khớp quỹ hàng, chia sẻ trong nhóm, nhắc việc | «Phân quyền dữ liệu chi tiết», chi tiết **chưa kiểm** | [meeycrm.com](https://meeycrm.com/) |
| Rocker (phần mềm nhà phố) | Giỏ hàng nhà phố thời gian thực, giỏ hàng cá nhân, thông tin chủ nhà trên một màn, cơ cấu chi nhánh và phòng ban | Ẩn số chủ: không đề cập | [phanmemnhapho.vn](https://phanmemnhapho.vn/) |
| Landsoft Agency | Giỏ hàng bán và thuê, lịch sử đổi giá, khách chủ nhà, lead, lịch hẹn; phân quyền khai thác khách và sản phẩm | «Đáp ứng quy trình riêng từng doanh nghiệp», không nói cách | [landsoft.com.vn](https://landsoft.com.vn/phan-mem-quan-ly-kinh-doanh-bat-dong-san/moi-gioi-nha-dat/) |
| BEE LAND (Beesky) | Nghiêng sơ cấp: giỏ hàng dạng lưới, giữ chỗ có duyệt, hoa hồng đại lý | **Màu trạng thái tự chọn**; phân quyền theo tính năng | [beesky.vn](https://beesky.vn/phan-mem-quan-ly-bat-dong-san) |
| DIGINET | Giỏ hàng phân cấp lô, tháp, dãy, mã; quyền xem giỏ hàng theo sàn hay cá nhân | **Màu trạng thái do doanh nghiệp chọn** | [diginet.com.vn](https://diginet.com.vn/giai-phap/phan-mem-quan-ly-bat-dong-san-dang-dau-tu-nhat-hien-nay) |
| OneHousing Pro Agent | Chợ hàng, không phải phần mềm cho sàn: đầu chủ đưa căn lên, **được kiểm duyệt trước khi đăng**; đầu khách để lại nhu cầu thì đầu chủ được báo | Ẩn thông tin chủ: không đề cập | [onehousing.vn](https://onehousing.vn/blog/pro-agent-app-giup-moi-gioi-tho-cu-but-pha-thu-nhap) |

OpenLand, Vinno, Reesoft, CloudREAL, Vtranet và Facework chỉ thấy tên trong bài tổng hợp của bên thứ ba
([vsba.edu.vn](https://vsba.edu.vn/phan-mem-quan-ly-san-giao-dich-bat-dong-san/),
[bizfly](https://bizfly.vn/techblog/phan-mem-quan-ly-bat-dong-san.html)). Trang chính thức **chưa kiểm**, nên không ghi
tính năng.

## Chưa kiểm (để tra tiếp khi một hàng cần)

- REDX: kịch bản tự viết được không; kết quả gọi tự đặt được không; luật chia lead của gói Teams; lưu bộ lọc.
- Follow Up Boss: kết quả cuộc gọi tự đặt; trạng thái listing.
- KW Command: công cụ tìm chủ nhà; bộ SmartView mặc định, admin đẩy SmartView cho đội; kịch bản gọi.
- Lofty: kịch bản dùng chung cả đội; danh mục kết quả gọi; lý do mất.
- BoldTrail: trường riêng của liên hệ; power dialer; trạng thái và Deal Stage có sửa được không; lý do mất.
- BoomTown: danh mục kết quả gọi; thiết lập e-Alert (bài gốc 404); Market Reports.
- Nguồn cần dè dặt: các điều về bể «ai nhận trước» của BoomTown (SharkTank) lấy từ ghi chú phát hành 2017–2018; phần
  Matrix lấy từ trang trợ giúp của một MLS địa phương. Help center Zendesk của Follow Up Boss, KW và Lofty chặn tải tự
  động lúc kiểm lại (403); các dòng trên do tác tử tra đọc ngày 01/11.
