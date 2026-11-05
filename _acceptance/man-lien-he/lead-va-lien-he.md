# Lead nằm ở đâu: Liên hệ hay Bảng hàng — đối chiếu Keller Williams và ngành

Ngày 05/11. Đây là phần khám phá của hàng 103, viết theo câu hỏi của chủ kho: «Xem cách sắp xếp Leads trong Contact của Keller Williams,
Follow Up Boss, Boomtownroi… phân tích kỹ lưỡng nguyên lý gốc và đề xuất lại». Chủ kho nghiêng về định nghĩa của Keller Williams.

**Quyết định:** chủ kho chọn «Áp ba lớp» ngày 05/11. Đã ghi ở ADR-0021 (sửa đổi 05/11), CONTEXT.md và Tham chiếu §12, §14.

## Trả lời ngắn

- **Lead không thuộc Bảng hàng, cũng không phải một thứ riêng nằm cạnh Liên hệ.** Theo Keller Williams, lead là một **dấu trên người**:
  người ấy đã có trong danh bạ nhưng chưa có tương tác. Việc làm với người ấy, như bán một căn hay mua một căn, là một đối tượng khác:
  **Cơ hội** (Opportunity).
- **Quỹ hàng mới theo Keller Williams được một nửa.**
  - Đã theo: liên hệ là người, «Lead» là trạng thái của người. Hàng 85 làm phần này.
  - Chưa theo: bản ghi mà telesales nhập vẫn mang tên «lead». Thực chất bản ghi ấy là **cơ hội phía chủ ở pha đầu**: chủ này muốn bán
    căn kia, giá chừng này. Vì vậy cùng một chữ «Lead» đang mang hai nghĩa. Mục Thuật ngữ của Tham chiếu còn ghi lead là «hàng ở nấc
    đầu», là nghĩa thứ ba.
- **Đề xuất:** theo Keller Williams trọn vẹn, gồm ba lớp:
  - **Liên hệ** là người, có dấu **Lead / Liên hệ**.
  - **Cơ hội** là việc với người, có bốn loại: Bán · Cho thuê · Mua · Thuê.
  - **Hàng** là căn trên Bảng hàng. Cơ hội bán đi tới «Lên bảng» thì sinh ra hàng.

## 1. Năm sản phẩm và một chuẩn xếp lead ra sao

| Sản phẩm | Lead là bản ghi riêng hay dấu trên người | Bản ghi người | Nấc của người | Đối tượng việc | Phía chủ, căn rao |
|---|---|---|---|---|---|
| **Keller Williams Command** | Dấu: ô «Mark as Lead» trên Contact; bỏ dấu là thành contact | Contact | Captured / Connected; cách vận hành MREA chia Met / Haven't Met | **Opportunity**, pha cố định Cultivate → Appointment → Active → Under Contract → Closed | Loại Opportunity **Listing** (cạnh Buyer, Tenant, Landlord); Client + Co-Seller |
| Follow Up Boss | Dấu: stage «Lead» (hệ thống giữ) trên Person | Person | Lead, Nurture, Closed, Past Client, Sphere, Trash… | Deal (pipeline, nhiều người) | Pipeline do đội tự đặt |
| BoomTown | Một bản ghi «lead» duy nhất, không có contact riêng | Lead | New, Qualify, Hot, Nurture, Watch + Archive, Trash | Transaction trên hồ sơ | Transaction phía Seller: Pre-Listing → Active-Listing → Under Contract → Closed |
| kvCORE / BoldTrail | Dấu: status trên Contact | Contact | Sphere → Prospect → New Lead → Active Lead → Client → Contract → Closed | Giao dịch từ hệ thống giao dịch nối vào | Lead type Seller |
| Lofty | Dấu: stage trên Lead | Lead | Do đội đặt, từ New Leads tới Closed | Transaction gắn lead | chưa kiểm được |
| RESO DD 2.0 | `ContactType = Lead` trên Contacts, chọn được nhiều giá trị | Contacts | ContactStatus chỉ có Active / Inactive / … | Không thuộc Contacts | `ContactType` Seller / Landlord |
| *Đối chứng:* Salesforce | **Bản ghi riêng**, «Convert» một chiều sang Contact + Opportunity | Lead → Contact | Lead Status | Opportunity | Không có sẵn cho ngành |

Salesforce là ngoại lệ duy nhất. Chính Salesforce phải thêm «Person Account» cho khách cá nhân, và tài liệu của họ lấy môi giới bất động
sản làm ví dụ.

**Keller Williams định nghĩa** (trang tổng quan Contacts của Command):

- Lead là người mình có rất ít thông tin, giao tiếp một chiều.
- Contact là người đã cho phép, ngầm hay rõ, để giữ liên lạc lâu dài.
- Có tương tác thì lead chuyển thành contact. Trong Command đây là một thao tác tay: bỏ ô Mark as Lead.

**Nguồn chính:**

- Keller Williams:
  - documentation.kw.com — overview-contacts, contacts-info-fields, overview-opportunities, opportunity-fields, lead-routing-contacts,
    claim-lead-pool.
  - ideas.kw.com: Command không có loại cơ hội «giới thiệu».
- Follow Up Boss: docs.followupboss.com (people-post, events-post, stages-get, deals-post, ponds-get).
- BoomTown: intercom.help/boomtown (lead-profile-overview, transactions-overview, my-deals); intercom.help/bthelpcenter (lead-central);
  help.boomtownroi.com/?p=323.
- kvCORE: help.insiderealestate.com/285957; intercom.help/kvcore/9380473.
- Lofty: help.lofty.com/115002890651; developer.lofty.com/concepts/leads.
- RESO: dd.reso.org/DD2.0/Contacts/ContactType.
- Salesforce: help.salesforce.com leads_convert; developer.salesforce.com, mục personaccounts.

**Chưa kiểm được** (trang trợ giúp sau đăng nhập trả lỗi 403, tài liệu đào tạo PDF chưa tách được chữ):

- Keller Williams có viết thành luật «trao đổi hai chiều» không.
- SmartPlans, Collaborators của Keller Williams.
- Bộ nấc mặc định đầy đủ của Follow Up Boss và BoomTown.

## 2. Nguyên lý gốc

Tám nguyên lý dưới đây lặp lại ở hầu hết các sản phẩm. Ghi kèm sản phẩm nào có.

1. **Một người là một bản ghi.** «Lead» là nhãn trên người, không phải thực thể riêng. Có ở Keller Williams, Follow Up Boss, BoomTown,
   kvCORE, Lofty, RESO.
   - *Vì sao:* nghề môi giới sống bằng quan hệ lâu dài. Một người hôm nay hỏi bán, năm sau hỏi mua, rồi giới thiệu người quen. Tách lead
     ra thì mỗi lần như vậy sinh một bản ghi mới, và lịch sử quan hệ vỡ ra.
2. **Lead thành liên hệ khi có tương tác hai phía, không phải khi có giao dịch.**
   - Keller Williams: «once engagement occurs».
   - kvCORE: phản hồi đầu tiên thì tự lên Active Lead.
3. **Việc là đối tượng riêng, trỏ về người.** Opportunity, Deal, Transaction đều tách khỏi người, và một việc có thể gắn nhiều người
   (Client + Co-Seller của Keller Williams).
   - *Vì sao:* một người có nhiều việc, mỗi việc có pha, giá trị và người làm riêng.
4. **Phía chủ là một loại việc, không phải một loại người.** Keller Williams để Listing ngang hàng Buyer, Tenant, Landlord. Một người
   vừa bán vừa mua vẫn là một người.
5. **Nấc của người khác pha của việc.**
   - Người có nấc của quan hệ: Captured / Connected, Met / Haven't Met.
   - Việc có pha của giao dịch: Cultivate → Closed.
   - Hai trục này không trộn vào nhau.
6. **Nguồn ghi một lần, mỗi lần hỏi mới là một sự kiện trên người đã có.** Follow Up Boss nhận lead qua «Events» và tự gộp theo số hay
   email. BoomTown giữ nguyên nguồn gốc của lead.
7. **Người giữ khác người làm việc.**
   - Keller Williams: Owner của liên hệ khác Assignees của cơ hội. Lead chưa ai nhận rơi vào lead pool để «Claim».
   - Follow Up Boss: assignedUser, collaborators, Pond.
   - BoomTown: ba vai riêng là Buyer Agent, Listing Agent, Lender.
8. **Danh bạ là tài sản nuôi dài hạn, không chỉ là phễu.** Keller Williams có Met / Haven't Met, 8x8, 33 Touch. Follow Up Boss và kvCORE
   có Sphere, Past Client.
   - Không xoá người, chỉ lưu trữ hay bỏ vào thùng rác, và khôi phục được.

## 3. Quỹ hàng đang đứng ở đâu

| Nguyên lý | Quỹ hàng hôm nay | Khớp? |
|---|---|---|
| 1. Một người một bản ghi, Lead là nhãn | Liên hệ là người; «Lead / Liên hệ» suy từ dữ kiện (`contactStatus`, ADR-0021 qđ 7) | **Khớp** |
| 2. Lead thành liên hệ khi có tương tác | Thành «Liên hệ» khi một lead của họ có cuộc gọi đầu hoặc họ đã có hàng | Khớp, và làm bằng máy chứ không bấm tay như Keller Williams |
| 3. Việc là đối tượng riêng trỏ về người | Phía khách: **nhu cầu khách** là việc riêng (hàng 86), khớp. Phía chủ: việc vẫn mang tên **«lead»** (bảng `leads`, bốn nấc ADR-0020) | **Lệch tên** |
| 4. Phía chủ là loại việc | `need` của lead (bán · cho thuê) suy ra loại liên hệ Chủ bán · Chủ cho thuê | Khớp về dữ liệu, lệch về tên |
| 5. Nấc người ≠ pha việc | Bốn nấc lead (Đã gửi → Đã nhận → Đã gọi → Lên bảng) là pha của việc, nhưng cùng mang chữ «Lead» với nấc của người | **Trộn chữ** |
| 6. Hỏi mới là sự kiện trên người | «Sửa số và gửi lại» thêm số vào cùng người (hàng 85), nhưng **tạo một bản ghi lead mới** (ADR-0020 qđ 4) | Một nửa |
| 7. Người giữ khác người làm | Người giữ liên hệ (đầu chủ) ≠ đầu chủ của từng lead; giao lại hàng không tự đổi người giữ (Hỏi-3 01/11). Chia lead + «Nhận» ≈ lead pool + Claim | **Khớp** |
| 8. Danh bạ là tài sản nuôi | Chưa có: không có nấc nuôi, không có người cũ | Chưa làm |

Tham chiếu §15 đã ghi phần ánh xạ: bốn nấc lead ứng với Cultivate → Active của Keller Williams, và nhu cầu khách ứng với đường ống
Buyers. Như vậy về dữ liệu, Quỹ hàng **đã là mô hình Keller Williams**. Chỗ lệch nằm ở **tên gọi**: «lead» vừa là dấu trên người, vừa
là việc phía chủ. Chữ ấy còn lệch thêm ở mục Thuật ngữ §14 («Lead = hàng ở nấc đầu»).

**Thiệt hại cụ thể nếu giữ nguyên:**

- Màn Liên hệ 103 phải hiện hai thứ cùng tên «Lead»: dấu cạnh tên người, và danh sách «lead» của người ấy. Hai thứ ấy khác nghĩa.
- Số đo «số ngày lead → Sẵn sàng bán» đang đếm theo việc. Nhưng câu «người này còn là lead không» lại hỏi về người. Hỏi «có bao nhiêu
  lead» sẽ ra hai con số khác nhau.
- Phía khách đã gọi là «nhu cầu khách». Phía chủ vẫn gọi là «lead». Hai việc cùng loại mà hai kiểu tên, nên trưởng nhóm khó đọc hai
  phía như một.

## 4. Đề xuất: ba lớp theo Keller Williams

```
Liên hệ (người)            dấu: Lead · Liên hệ           loại: Chủ bán · Chủ cho thuê · Người mua · Người thuê
   │ người giữ: một đầu chủ (Owner)
   ├── Cơ hội bán / cho thuê  (Opportunity Listing · Landlord)      người làm: đầu chủ được chia (Assignee)
   │      Cultivate ── Appointment ── Active ── Under Contract ── Closed
   │      Đã gửi·Đã nhận   Đã gọi       Lên bảng   Đang giao dịch    Đã bán / Đã thuê
   │                                      │
   │                                      └── Hàng trên Bảng hàng (từ Lên bảng trở đi, pha đọc từ trạng thái hàng)
   └── Cơ hội mua / thuê  (Opportunity Buyer · Tenant) = nhu cầu khách     người làm: đầu khách
          Cultivate ── Appointment ── Active ── Under Contract ── Closed
          Khách hỏi     Lịch xem        Lần gửi   …                 …
```

**Cụ thể:**

1. **Lead = dấu trên người, không gì khác.**
   - «Lead» trên màn chỉ còn một nghĩa: người chưa nói chuyện hai chiều. Giữ cách suy bằng máy đã có, vì nó tốt hơn ô bấm tay của Keller
     Williams.
   - Nút «+ Lead» của telesales giữ nguyên chữ. Theo đúng Keller Williams, nhập lead là thêm một **người mang dấu Lead**, kèm một **cơ hội
     bán** chứa căn và giá chủ muốn.
2. **Việc phía chủ gọi là «Cơ hội»**, loại Bán hoặc Cho thuê. Bảng `leads` và bốn nấc giữ nguyên dữ liệu, chỉ đổi tên nghĩa:
   - Đã gửi, Đã nhận thuộc pha **Cultivate**.
   - Đã gọi thuộc pha **Appointment**.
   - Lên bảng thuộc pha **Active**.
   - Sau «Lên bảng», pha của cơ hội đọc từ trạng thái hàng: Đang giao dịch thuộc Under Contract, Đã bán / Đã thuê thuộc Closed.

   Nhờ vậy số đo theo pha chạy được từ lúc nhập tới lúc bán.
3. **Nhu cầu khách là cơ hội loại Mua hoặc Thuê.**
   - Hiện nay đã đúng như vậy về dữ liệu (hàng 86). Chỉ cần ghi rõ nó là cơ hội và gắn pha.
   - Lịch xem về sau nằm ở pha Appointment, đúng chỗ Keller Williams đặt nó.
4. **Hàng vẫn là trung tâm của Quỹ hàng.**
   - Keller Williams Command là sổ của môi giới. Quỹ hàng là sổ hàng của sàn, nên Bảng hàng giữ nguyên.
   - Hàng là **cơ hội bán ở pha Active trở đi, cộng dữ liệu căn**.
   - Lead không bao giờ hiện trên Bảng hàng.
5. **Màn Liên hệ (103) dựng theo ba lớp:**
   - Danh sách lọc theo dấu Lead / Liên hệ và theo loại.
   - Hồ sơ một người có một khối **«Cơ hội»** liệt cả phía chủ lẫn phía khách, mỗi cơ hội mang pha. Hàng hiện khi cơ hội đã Lên bảng.
   - Hai phía đọc như nhau.

**Không đề xuất làm ngay**, vì mỗi điều đổi một quyết định đã niêm và nên đi hàng riêng:

- **Gửi lại số thành sự kiện trên cùng cơ hội**, thay vì tạo lead mới (nguyên lý 6).
  - Đây là đổi ADR-0020 qđ 4.
  - Số đo «số ngày lead → Sẵn sàng bán» đã đi ngược chuỗi gửi lại, nên con số hiện vẫn đúng.
- **Nấc nuôi cho người** (Met / Haven't Met, người cũ, Sphere) và nhịp chạm 8x8 / 33 Touch (nguyên lý 8). Thuộc hàng «Việc kế và danh
  sách lưu» đã đề xuất.
- **Đổi tên bảng và mã nguồn** (`leads` thành tên cơ hội).
  - Tốn nhiều, chạm T3, mà không đổi gì cho người dùng.
  - Đề xuất giữ tên mã, chỉ đổi **nghĩa và chữ trên màn**, ghi trong CONTEXT.md.

## 5. Cái giá và rủi ro

| Đổi gì | Giá | Rủi ro nếu không đổi |
|---|---|---|
| CONTEXT.md, Tham chiếu §14, §15: «Lead» một nghĩa, thêm «Cơ hội» | Một lần sửa tài liệu, trong PR 103 | Ba nghĩa của «Lead» tiếp tục lan sang màn mới |
| Chữ trên màn: «Lead của tôi» → «Lead tôi đã nhập» (người + cơ hội), nấc đọc là pha cơ hội | Sửa chữ ở Hôm nay của telesales và đầu chủ | Telesales đọc «Lên bảng» như trạng thái của người |
| Màn 103 có khối «Cơ hội» chung hai phía | Nằm trong phạm vi 103, không thêm mã đọc ngoài phần đã có | Hồ sơ người phải ghép hai kiểu danh sách khác tên |
| Không đổi tên bảng, không đổi dữ liệu | Không tốn gì | Mã và chữ trên màn lệch tên, phải ghi ở CONTEXT.md |

Người dùng Việt Nam quen nói «lead chủ nhà» theo nghĩa việc phía chủ. Đề xuất này giữ chữ «Lead» ở nút nhập. Chỗ đổi là chữ trên màn hồ
sơ và danh sách: danh sách việc gọi là «Cơ hội», còn dấu cạnh tên người vẫn là «Lead». Phiên nghiệm thu cần kiểm xem telesales và đầu
chủ có đọc được hai chữ này không.
