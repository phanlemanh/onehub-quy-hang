# Khảo sát ReUI và Verve CRM cho hệ bố cục (hàng 91)

02/11/2026 · nguồn: MCP `reui` (skill `layout`, `compose`; 79 danh mục khối; `get_block`/`search`/`get_thumbnail`) và bản
chạy https://verve-crm.reui.io (15 màn ở 1440, 8 màn ở 375, đo DOM bằng playwright). Ảnh chụp Verve giữ ngoài kho.

## 1. ReUI nói gì về bố cục

- **Một archetype mỗi màn**, mười archetype. Archetype gần nhất với từng bố cục của ADR-0024:

  | Bố cục | Archetype gần nhất |
  | --- | --- |
  | Tràn | Table-backed management: một Frame gồm đầu khung, thanh lọc, data-grid và phân trang |
  | Đọc | Frame stack, hoặc Vertical rail settings |
  | Hồ sơ hai cột | Record detail: cột chính, cột dữ kiện xếp xuống dưới khi hẹp hơn `lg` |
  | Bảng điều khiển | Dashboard grid: hàng KPI, rồi bảng |
  | Luồng nhiều bước | Wizard dialog (stepper trong Dialog) |
  | Danh sách – chi tiết, Dòng tin | không archetype nào ứng |

- **Đầu màn**: tiêu đề 1–3 chữ cộng mô tả một mệnh đề ở bên trái; hành động ở bên phải, gồm một nút chính, các nút khác
  để `outline`. Không có khối «page header» riêng: tra cụm này chỉ ra `navbar-*`. Điều này khớp dòng «Chỗ hở» của ADR §3.
- **Mọi hành động với tới được ở mọi khổ.** Nút bị ẩn dưới một điểm gãy phải chuyển vào menu.
- **Nhãn trạng thái** dùng `<tone>-light`, không dùng `secondary`; nhãn trung tính dùng `outline`.
- **Mật độ khung**: `spacing="default"` ghi rõ; `sm` cho lưới dày. Không đặt lề trên các khe của khung.
- **Trạng thái**: rỗng có thông điệp và một hành động chính; chờ tải là `Skeleton` đúng hình bố cục, không spinner giữa
  trang; lỗi nằm tại chỗ, có nút thử lại.
- **375**: không cuộn ngang trang; bảng cuộn ngang bên trong khung của nó.

## 2. Verve dựng thế nào (đo trên bản chạy)

Verve ghép từ chính các khối solution của ReUI. Ví dụ màn Contacts trùng ảnh của `solution-crm-3`.

- **Vỏ**
  - Thanh trên: bộ chọn «tổ chức / ứng dụng» dạng đường dẫn; ô tìm có phạm vi («All Records · Recent · Archived»);
    nút **«+ Create»**, kiểu viền.
  - Cột biểu tượng với sáu nhà, cộng cột thứ hai chia nhóm có đầu mục.
  - Mục trong cột thứ hai có **số đếm và thanh nhỏ** (Lead 5, MQL 10…); chân cột có thẻ số đo sống.
- **Menu Create** là **một nút mở menu mọi việc tạo**: New Deal · New Contact · New Company · Import Data · Generate
  Report. Không phải nút chia.
  - Ở 375, nút ấy còn lại là «+» trên thanh trên.
  - Màn vẫn giữ nút chính cho đối tượng của chính nó («Add Contact», «New deal», «New meeting»), tức là việc tạo có ở
    hai chỗ.
- **Đầu màn có ba dạng, theo loại màn** (`h1` luôn có, đôi khi ẩn):
  1. *Dải đường dẫn*: «Home › CRM › X» bên trái, hành động bên phải, nằm ngoài Frame. Dùng ở Dashboard, Today, Settings,
     Products, Forecast. Ở 375, đường dẫn chỉ còn mục cuối.
  2. *Đầu khung danh sách*: tiêu đề, dòng đếm («40 contacts · 18 accounts») và nút chính nằm trong `FrameHeader`. Dưới
     đó là chip lọc «Name contains …» và «Clear». Dùng ở Contacts, Quotes, Approvals.
  3. *Lối về cộng tiêu đề*: «← Back to contacts», rồi ảnh, tên, nhãn trạng thái và dòng phụ, hành động bên phải, nằm
     ngoài Frame. Dùng ở hồ sơ và màn tạo mới. Ở 375, nút xuống ngay dưới tên, không dính đáy.
- **Số đo**
  - Lề trang 16px ở mọi khổ.
  - Frame không giới hạn bề rộng, kể cả Settings (hai nửa nhãn | ô).
  - Mọi Frame dùng `spacing="sm"`.
  - Hồ sơ: cột dữ kiện **trái, cố định 320px**; cột hoạt động phải lấp phần còn lại; hai cột cách nhau 20px.
  - Ở 375, cột dữ kiện xếp lên trước.
- **Màn tạo mới** (Create quote) là một Frame dài chia mục bằng đường kẻ, không có stepper.
- **Bảng điều khiển ở 375** chuyển thành một cột thẻ KPI.

## 3. So với bản bấm được và ADR-0024

| Chỗ | Bản bấm được / ADR | ReUI · Verve | Xử lý |
| --- | --- | --- | --- |
| Nhãn trạng thái | `secondary` | `<tone>-light` | **đã sửa** |
| Lề trang | 16 / 24px | 16px mọi khổ | **đã sửa** (token còn một số) |
| Mật độ khung | `default` mọi bố cục | `sm` cho mặt dày | **đã sửa**: Tràn, Danh sách – chi tiết dùng `sm` |
| Rỗng, lỗi | không có hành động | một hành động, «Thử lại» | **đã sửa**: `TrangThai` có khe `hanhDong` |
| Nút tạo ở 375 | vỏ điện thoại không có | «+» trên thanh trên | **đã sửa**: nút «+» mở menu Tạo |
| Menu Tạo | nút chia «+ Lead ▾»; màn không có nút tạo riêng | một nút «+ Tạo ▾» mở mọi việc; màn giữ nút chính của đối tượng màn | **Hỏi-2 đổi khuyến nghị** |
| Đầu màn | một dạng trong `FrameHeader` | ba dạng theo loại màn | **Hỏi-3 đổi khuyến nghị** |
| Khối nguồn Hồ sơ hai cột | `solution-crm-4` | khối ấy là **ngăn bên** của một deal (sheet); trang hồ sơ của Verve tự ghép, cột dữ kiện trái 320px | **Hỏi-7 mới** |
| Bố cục Đọc | giới hạn 48rem, căn giữa | Settings dùng hết bề rộng | **Hỏi-8 mới** |
| Hồ sơ ở 375 | nút dính đáy (ADR §5) | nút ngay dưới tên | gộp vào Hỏi-7 |
| Tràn ở 375 | thành thẻ | bảng cuộn ngang trong khung | giữ: Quỹ hàng đã chọn thẻ (hàng 32), ADR §5 |
| Bảng điều khiển ở 375 | không có | xếp một cột | giữ: Đội không có trên điện thoại (Tham chiếu §9) |
| Danh sách – chi tiết | lưới hai phần một phần | ReUI không có khối; Verve không dùng | giữ; thi công dùng `resizable` (`c-resizable-9`) |
| Cột thứ hai có số + thanh | chưa | Verve có | để hàng 52 (ADR Hệ quả) |
| Ô tìm có phạm vi | chưa | «All ▾» | ngoài phạm vi, ghi Later |

## 4. Khuyến nghị đổi

- **Hỏi-2 (menu Tạo).** Làm như Verve.
  - Thanh trên có một nút viền «+ Tạo» mở menu mọi việc tạo của vai; ở 375 là nút «+».
  - Màn giữ đúng một nút chính cho đối tượng của chính màn ấy. Ví dụ: Bảng hàng «Nhập Excel», Lead «+ Lead».
  - Lý do: đó là cách Verve thật làm. «Nút tạo ở hai nơi» không phải lỗi khi nút trên màn là việc của chính màn.
  - AC-4 phải đổi câu «không màn nào còn nút tạo trùng» thành «màn chỉ có nút tạo cho đối tượng của chính nó».
- **Hỏi-3 (đầu màn).** Ba dạng theo bố cục, cùng một thành phần `DauMan` với `dang`:
  - Tràn, Danh sách – chi tiết: đầu trong khung (tiêu đề, đếm, nút chính).
  - Hồ sơ hai cột, Luồng nhiều bước: lối về cộng tiêu đề, ngoài khung.
  - Đọc, Bảng điều khiển, Dòng tin: dải đường dẫn cộng hành động, ngoài khung.
  - Đường dẫn ở 375 thu còn mục cuối.
- **Hỏi-7 (mới, khối nguồn Hồ sơ hai cột).** Bỏ `solution-crm-4` làm khối nguồn trang.
  - Trang hồ sơ ghép theo Verve: đầu dạng lối về; cột dữ kiện trái 320px; cột chính phải (mục, hoạt động `Timeline`);
    ở 375, dữ kiện lên trước và nút đứng dưới tên.
  - `solution-crm-4` đúng nghĩa là ngăn bên: nó thành khối nguồn của cột phụ / ngăn nổi trong Danh sách – chi tiết.
    Đây cũng là chỗ cột hồ sơ cạnh bảng đã chuyển thể từ nó.
  - Đổi ADR-0024 §2 dòng Hồ sơ hai cột và §5 «nút dính đáy».
- **Hỏi-8 (mới, bề rộng Đọc).** Theo Verve, Đọc dùng hết bề rộng cột nội dung; dòng cài đặt chia hai nửa nhãn | ô.
  - `--container-doc` chỉ còn cho Dòng tin.
  - Lối khác: giữ 48rem căn giữa, dễ đọc hơn trên màn rất rộng nhưng lệch với Verve và với Tràn.
