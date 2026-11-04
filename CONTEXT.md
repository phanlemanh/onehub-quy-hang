# Từ vựng Quỹ hàng

Nhãn trên màn bằng tiếng Việt; tên trong code bằng tiếng Anh, theo RESO khi có. Tên code đánh dấu *(đề xuất)* chưa
dùng trong code — chốt khi viết phần đó. Khái niệm mới: thêm dòng ở đây cùng commit với nhãn mới.

| Nhãn trên màn | Code | Nghĩa | Không dùng |
|---|---|---|---|
| Quỹ hàng | — | Tên ứng dụng | Tên một nhà trong app |
| Sàn | `company` | Công ty dùng Quỹ hàng; mỗi sàn một vùng dữ liệu riêng | — |
| Bảng hàng | `inventory` *(đề xuất)* | Tập hàng của sàn; nhà trên máy tính, tab trên điện thoại | «Quỹ hàng» cho nhà này |
| Hàng | `listing` *(RESO `Property`)* | Một lần chào bán của sàn trên một căn | «Tin» (tin là của Invest) |
| Căn | `unit` *(đề xuất)* | Vật thể trong danh mục: khu → toà → trục → căn | — |
| Khu | `subdivisionName`, `subdivisionKey` (RESO `SubdivisionName`) | Khu dân cư, khu đô thị hay khu của chủ đầu tư chứa căn; danh mục dùng chung | «Dự án» |
| Loại hình | `propertyType` / `propertySubType` (RESO) | Loại của căn, giá trị RESO nguyên văn: căn hộ `Residential` / `Condominium`, nhà phố `Residential` / `Townhouse`, biệt thự `Residential` / `Single Family Residence`, đất `Land` / `Unimproved Land`; nhãn riêng của sàn («Shophouse», «Liền kề») neo vào đây; loại hình nào dùng trường nào đọc từ một bảng của lõi | Loại hình ngoài bốn cặp |
| Lead | `lead` · RESO `ContactType = Lead` | Trạng thái của một liên hệ chưa nói chuyện hai chiều (KW «Mark as Lead»); bản ghi lead của Quỹ hàng là cơ hội phía bán ở pha đầu gắn liên hệ ấy, từ telesales hay đầu chủ tự nhập — không phải hàng | «Hàng ở nấc đầu» |
| Liên hệ | `contact` (RESO `Contacts`) | Đối tượng: một người làm việc với sàn — một người, nhiều số, một hay nhiều loại liên hệ, một người giữ (ADR-0021). Nút của hồ sơ đầu khách mang nhãn «Hỏi đầu chủ» để không va chữ (hàng 33, 04/11) | «Danh bạ» |
| Loại liên hệ | `contact_types` (RESO `ContactType`) | Chủ bán `Seller` · Chủ cho thuê `Landlord` · Người mua `Buyer` · Người thuê `Tenant`; một người mang được nhiều loại; mang Chủ bán hay Chủ cho thuê là lớp nguồn | — |
| Người giữ | `owner_member_user_id` (RESO `OwnerMemberKey`) | Đầu chủ giữ một liên hệ chủ nhà; chưa có người giữ thì chỉ trưởng nhóm thấy | «Chủ sở hữu» |
| Đầu chủ | `listing_agent` *(đề xuất, RESO `ListAgent`)* | Người giữ nguồn chủ nhà của căn | «Người giữ» |
| Đầu khách | `buyer_agent` *(đề xuất, RESO `BuyerAgent`)* | Người đem căn đi bán cho khách | — |
| Bao phí / Không bao phí | *(đề xuất)* | Giá đã / chưa gồm thuế TNCN, lệ phí trước bạ, phí môi giới theo định nghĩa của sàn | Trên trang khách: «đã / chưa gồm phí chuyển nhượng» |
| Giá về tay | *(đề xuất)* | Số chủ nhà nhận sau thuế phí | — |
| Giá đáy | *(đề xuất)* | Mức thấp nhất chủ từng nói; thuộc lớp `source` | — |
| Sẵn sàng bán | *(đề xuất)* | Nút đưa hàng lên bảng sau khi máy kiểm đủ điều kiện | «Duyệt» |
| Trang khách · Link sống | *(đề xuất)* | Trang công khai từ link; giá và trạng thái theo bảng hàng | — |
| Thoả thuận | `agreement` | Cho phép một loại kết nối chảy theo một chiều, cho các lớp dữ liệu, trong một thời hạn | «Tích hợp» |
| Kết nối | `connection_kind` | Loại đường nối: nguồn danh mục, kênh đăng, nguồn lead, bảng tính, hợp tác giữa công ty, API của công ty | — |
| Lớp dữ liệu | `data_class` | Nhóm trường cùng một trần; thoả thuận chỉ mở tới trần | — |
| Thành viên sàn | `company_member` | Một người thuộc một sàn; một người thuộc được nhiều sàn | — |
| Sàn đang làm | `active company` (cookie `qh_san`) | Sàn mà mọi lời gọi của người đang chạy trong đó; người nhiều sàn chọn ở màn Chọn sàn | — |
| Mã đăng nhập | `otp` | Mã 6 số gửi qua email để đăng nhập | «Mật khẩu» |
| Vai | `role` | Một trong năm: Telesales `telesales`, Đầu chủ `listing_agent`, Đầu khách `buyer_agent`, Trưởng nhóm `team_lead`, Quản trị sàn `company_admin`; một người giữ được nhiều vai | — |
| Quản trị sàn | `company_admin` | Vai cấu hình sàn và quản người; không tự thấy chủ nhà | — |
| Vùng | `zone` | Toà hay phân khu do sàn tự đặt tên để chia việc; gắn danh mục sau | «Khu» (khu là khu chứa căn) |
| Vùng phụ trách | `member_zone` | Vùng một người trong sàn phụ trách | «Khu phụ trách» |
| Cách chia | `routing_strategy` | Cách sàn chọn người nhận lead không trùng, từ thực đơn: theo vùng lần lượt, lần lượt toàn sàn, theo vùng ít lead đang mở, kho chung, trưởng nhóm chia tay | «Luật chia» |
| Kho chung | `open_pool` | Cách chia để lead chờ, đầu chủ phụ trách toà tự bấm nhận | — |
| Lead đang mở | `open_leads` | Lead đã về một đầu chủ, chưa bỏ, chưa ghi gọi lần đầu — thước đo tải khi chia | — |
| Lead đã nhập | `GET /api/v1/leads` · `myLeadView` | Lead một người đã nhập, mới nhất trước, kèm nấc và tên đầu chủ — không số chủ, không hàng | — |
| Nấc của lead | `LeadStage` | Bốn nấc Đã gửi `sent` → Đã nhận `accepted` → Đã gọi `called` → Lên bảng `on_board`; trạng thái phụ Trả lại `returned`, Đã gửi lại `resubmitted`, Tin bổ sung `supplement`, Đã bỏ `discarded`; «Chờ chia» là Đã gửi chưa có người | — |
| Lên bảng | `board_at` | Lúc hàng của đầu chủ lead, chủ nhà cùng dấu vết số, chuyển Sẵn sàng bán sau lúc nhập lead | «Duyệt» |
| Trả lại | `returned_at` | Đầu chủ báo số không liên lạc được; lead rời việc của đầu chủ | «Huỷ lead» |
| Gửi lại | `resubmitted_lead_id` | «Sửa số và gửi lại»: lead mới với số mới, đi như lead mới; lead cũ trỏ tới nó | — |
| Lời báo | `lead_alert` | Báo cho người đọc báo của sàn: chưa chia được, quá hạn nhận, quá hạn gọi | «Cảnh báo» |
| Cấu hình của sàn | `company_settings` | Lựa chọn và con số sàn chỉnh được, mỗi khoá một dòng; khoá vắng là mặc định | «Cài đặt» cho dữ liệu |
| Sự kiện của hàng | `listing_event` | Một lần thay đổi của hàng: tạo, đổi phần lần rao, đổi giá, đổi trạng thái, xác nhận với chủ nhà; chỉ thêm, ghi người và vai lúc làm (ADR-0008) | — |
| Trạng thái chuẩn | `StandardStatus` (RESO) | Một trong sáu: Chưa đủ để rao `Incomplete`, Đang bán `Active`, Đang giao dịch `Pending`, Đã bán `Closed`, Tạm ngừng `Hold`, Ngừng hẳn `Withdrawn`; nhãn riêng của sàn neo vào đây | Trạng thái thứ bảy |
| Độ tươi | `freshness` | Tuổi của lần xác nhận gần nhất với chủ nhà, tính từ sự kiện | — |
| Mức đủ thông tin | `completeness` | Phần đã có trên năm mục của danh sách hỏi: giá kèm điều kiện phí, nội thất, pháp lý, tài chính, tình trạng sử dụng | — |
| Giá chốt · Ngày bán | `ClosePrice` · `CloseDate` (RESO) | Giá và ngày sàn mình bán; bắt buộc khi vào Đã bán, giữ lại sau đó | — |
| Lý do ngừng | `withdrawn_reason` | Chủ đã bán nơi khác · chủ đổi ý · không liên lạc được; bắt buộc khi vào Ngừng hẳn | — |
| Phiên bản (của hàng) | `version` | Số sự kiện đã ghi của hàng; lệnh mang phiên bản cũ bị báo «đã có người sửa trước» | — |
| Nhà | `Home` (`packages/core` navigation) | Một chỗ làm việc trả lời một câu (Tham chiếu §9); cột biểu tượng trên máy tính, tab dưới trên điện thoại | — |
| Hôm nay | `today` | Nhà mở đầu: giờ làm gì | — |
| Đã gửi · Gửi | `shares` | Link đã gửi và lịch xem; trên điện thoại là tab Gửi, gồm cả nút gửi mới | — |
| Đội | `team` | Nhà của trưởng nhóm: đội đang chạy thế nào | — |
| Cài đặt sàn | `settings` | Nhà của quản trị sàn: sàn gọi tên và chạy theo luật nào | — |
| Tôi | `me` | Tab tài khoản trên điện thoại | — |
| Gõ mã căn | `unitJump` | Ô mở thẳng hồ sơ căn hoặc nhảy tới nhà bằng bàn phím; chỉ vai có Bảng hàng | — |
| Hồ sơ căn | `/units/<mã>` | Toàn bộ thông tin của một căn; trên máy tính mở thành cột phải cạnh Bảng hàng | — |
| Ảnh căn | `unit_photo` *(RESO `Media`)* | Ảnh thuộc căn của sàn (toà + mã), không thuộc lần rao; lần rao chọn ảnh hiện (luật 27, ADR-0014) | «Ảnh tin» |
| Ngăn ảnh: Gửi được · Tự có từ mã · Nội bộ | `compartment`: `shareable` · danh mục · `internal` *(RESO `Permission`, `MediaCategory`)* | Ba chỗ xếp ảnh của căn; Nội bộ (sổ, hợp đồng, giấy tờ) là lớp `source`, chỉ đầu chủ giữ căn và trưởng nhóm xem, không ra ngoài sàn, không lưu trên máy | «Ảnh riêng» |
| Kho trên máy | `LocalStore` | Bản hàng, lịch sử căn đã mở và thay đổi chờ gửi giữ trên thiết bị của một người, theo từng sàn; đăng xuất là xoá | «Bộ nhớ đệm» |
| Thay đổi chờ gửi | `PendingOp` | Một lần sửa đã ghi trên máy, chưa được máy chủ nhận | «Bản nháp» |
| Cần xem | `needsReview` | Căn có thay đổi chờ mà máy chủ không nhận (hai người cùng sửa, căn đã cọc/đã bán, bị từ chối); người chọn lối | «Xung đột» trên màn |
| Chỉ báo đồng bộ | `SyncIndicator` | Chữ trên thanh trên nói đang ở đâu: Đã đồng bộ, Đang gửi, Mất mạng, Cần xem | Chỉ màu không chữ |
| Nhập Excel | `import` | Nút đưa hàng vào từ bảng tính | — |
| Phát hàng | `export` | Nút đưa hàng ra ngoài sàn | — |
| Chủ nhà (của hàng) | `listing_owner` | Tên, số, giá đáy của chủ nhà một hàng; lớp `source`, chỉ đầu chủ giữ căn và trưởng nhóm thấy (ADR-0010) | «Người bán» |
| Mở số chủ | `owner_phone_reveal` | Lần bấm xem số đầy đủ của chủ nhà; mỗi lần là một sự kiện ghi người, vai, lúc | «Xem số» |
| Lần nhập | `imports` (bảng) | Một lần đưa file bảng hàng vào: kế hoạch, kết quả từng dòng, hoàn tác được cả lần (ADR-0011) | — |
| Mẫu file nhập | `import_template` *(đề xuất)* | Cách ghép cột và đọc giá trị sàn đã dùng cho một kiểu file; nhập lại cùng kiểu thì máy ghép sẵn | — |
| Từ điển giá trị | `company_value_aliases` *(đề xuất)* | Cách viết riêng của sàn neo vào giá trị chuẩn («BP» → Bao phí); học từ lựa chọn của người, quản trị sàn duyệt | — |
| Xử lý bằng AI | `ai_processing` *(đề xuất)* | Loại kết nối: gửi hồ sơ cột đã che cho nhà cung cấp AI lập kế hoạch nhập; sàn bật / tắt; không bao giờ mở lớp nguồn | «Tích hợp AI» |
| Cấu hình sàn | `company_settings` *(đề xuất)* | Giá trị sàn đặt cho một điểm sàn chỉnh được; sàn chưa đặt thì nhận mặc định dựng sẵn; mỗi lần đổi là một sự kiện ghi người và vai (ADR-0018) | «Tuỳ biến» |
| Điểm sàn chỉnh được | `DiemSo` (sổ: `SO_DIEM`, `packages/core/src/config/so.ts`) | Một dòng của sổ điểm biến thiên: khoá, kiểu, mặc định, khoảng, ai đổi, hiệu lực, lớp dữ liệu (`docs/architecture/so-diem-bien-thien.md`); sổ ở mã và sổ ở tài liệu khớp nhau bằng bộ kiểm của lõi | — |

## Chọn chữ

Chốt 30/10 (chủ kho), ghi vào kho 02/11. Nhãn trong lõi dùng chữ chuẩn của ngành. Chữ nghề của môi giới là tên gọi
riêng của sàn, đặt qua sổ từ vựng (ADR-0022 D5). Khi chọn nhãn cho một khái niệm mới, xét theo thứ tự sau; nguồn đứng
trên thắng:

1. **Chữ của luật Việt Nam**, cho mọi thứ có nghĩa pháp lý: Luật Kinh doanh bất động sản 2023, Luật Nhà ở 2023, Luật
   Đất đai 2024, Luật Thuế thu nhập cá nhân 2025, Bộ luật Dân sự (đặt cọc).
2. **Từ vựng chung của OneHub**, tức `CONTEXT.md` của onehub-invest, cho thứ hai sản phẩm dùng chung: địa lý, vật thể,
   giá, loại hình, trạng thái chào. Danh mục căn đến từ Invest nên tên phải trùng.
3. **Chữ thị trường công khai**: cách các cổng tin rao lớn và hợp đồng mẫu gọi thuộc tính căn.
4. **Chữ nghề** (đầu chủ, đầu khách, giá đáy, giá về tay, bao phí, ép giá, còn hàng…) không làm nhãn chuẩn mới.

Thang này chỉ chọn nhãn tiếng Việt; tên code vẫn theo RESO. Chữ đã chốt riêng sau 30/10 giữ nguyên, ví dụ «Khu» thay
«dự án» (31/10). Nhãn chữ nghề đang có trong bảng trên giữ tới lượt dọn bảng sau khi đóng đợt, vì luật đợt chỉ cho thêm
dòng.

**Đọc khi hai dòng lệch, tới lượt dọn bảng:**

- **Lead**: đọc theo dòng «Lead» của bảng này, tức trạng thái của một liên hệ (RESO `ContactType`). Không đọc theo
  Tham chiếu §14 «hàng ở nấc đầu».
- **«Người giữ»** là thuật ngữ cho người giữ một liên hệ (`OwnerMemberKey`). Cột «Không dùng» ở dòng Đầu chủ và luật 5
  ở Tham chiếu §8 chỉ có nghĩa: không gọi vai Đầu chủ bằng chữ này.
- **«Cấu hình của sàn» và «Cấu hình sàn»** là một khái niệm (`company_settings`, ADR-0018). Không dùng cả «Cài đặt»
  (cho dữ liệu) lẫn «Tuỳ biến». Dòng thừa được gộp ở lượt dọn.
- **«Lần rao»** đang hiện trên màn («Lần rao đang mở», «Tạo lần rao») với cùng nghĩa «Hàng» (`listing`). Chọn một chữ
  ở lượt dọn.
