# Bóc tách hệ bố cục — mỗi ô một nhãn nguồn (hàng 91, 02/11)

## Khung việc

Mỗi trang được bóc theo ba tầng:

| Tầng | Ai giữ | Gồm |
| --- | --- | --- |
| Khung trang | bố cục (`BoCuc`) | lề, dải đầu màn, cách xếp thân và cột phụ, bản điện thoại |
| Vùng | một **khối** ReUI nguyên vẹn, mang Frame của nó | đầu khung, thanh công cụ, thân, chân |
| Thành phần | khối dùng sẵn | `data-grid`, `filters`, `timeline`, `field`… |

Mỗi ô nhận đúng **một nhãn nguồn** theo thang dùng lại của kho (`.claude/rules/giao-dien.md`):

- **khối** — khối ReUI đã cài, chuyển thể chỉ đổi dữ liệu, chữ, prop, và gỡ `min-h`/`max-w` ở gốc.
- **c-\*** — ví dụ miễn phí của ReUI, chuyển thể.
- **thành phần** — thành phần ReUI hay shadcn đúng tên.
- **ghép** — ghép từ thành phần. Phải nói rõ khối nào lẽ ra đứng ở đây và vì sao chưa dùng được.
- **vẽ tay** — không được dùng. Không ô nào mang nhãn này.

Lỗi gốc của bản trước: `BoCuc` tự dựng một Frame rồi nhét vùng vào, nên khối ReUI (vốn mang Frame) không đặt vào được.
Hệ quả là bảng, chip lọc, ô số và dòng tin đều bị vẽ lại bằng tay. Bản này bỏ Frame khỏi bố cục.

## Bảng bóc tách

| Bố cục | Ô | Nhãn | Nguồn | Tệp |
| --- | --- | --- | --- | --- |
| (vỏ) | menu Tạo | c-\* | `c-button-group-51` | `components/shell/menu-tao.tsx` |
| (vỏ) | cột thứ hai | khối | `app-shell-8` (đã có) | `components/shell/second-column.tsx` |
| (mọi bố cục) | dải đầu màn | ghép | ReUI không có khối đầu trang; ghép `breadcrumb` + `button` + `dropdown-menu` như Verve («Chỗ hở») | `components/bo-cuc/dau-man.tsx` |
| (mọi bố cục) | rỗng, lỗi | khối | `empty-state-1`, `-2`: bỏ hình minh hoạ theo vo-va-ia §2; thêm khe hành động | `components/trang-thai.tsx` |
| (mọi bố cục) | chờ tải | thành phần | `skeleton` theo hình bố cục (luật ReUI «Skeleton in the real layout») | `components/bo-cuc/cho-tai.tsx` |
| (mọi bố cục) | ngăn nổi | thành phần | `sheet` / `drawer` | `components/bo-cuc/ngan-noi.tsx` |
| Tràn | lưới + lọc + chân | **ghép, chờ** | `solution-crm-3` (chính là màn Contacts của Verve). Cần thành phần `filters`, mà `filters` lỗi kiểu dưới `noUncheckedIndexedAccess` | trang mẫu `KhungLuoiCan` |
| Danh sách – chi tiết | ngăn chi tiết trượt phải | khối | `sheet-9` — ngăn inset: cách mép 1rem, bo góc, đầu ngăn tên + nút, thân cuộn, chân dính đáy; đè lên bảng mà bảng vẫn bấm được (chủ kho 02/11) | `components/bo-cuc/ngan-noi.tsx` |
| Danh sách – chi tiết | hồ sơ trong ngăn | khối | `solution-crm-4` — `ThanHoSo` (thân hồ sơ không khung) cùng các mảnh dùng chung | `components/khoi/solution-crm-4/ho-so.tsx` |
| Đọc | dòng cài đặt + khung | khối | `settings-3`: giữ `SettingField` và khung gốc; bỏ ô màu, tuỳ chọn trình soạn | `components/khoi/settings-3/` |
| Hồ sơ | khung, đầu hồ sơ, khối số chính, mục, cặp nhãn–giá trị | khối | `solution-crm-4` đã chuyển thể ở hồ sơ căn (hàng 17) — rút thành thành phần dùng chung, giữ nguyên lớp (chủ kho 02/11 chọn bố cục này) | `components/khoi/solution-crm-4/ho-so.tsx` |
| Hồ sơ | dải đường dẫn | ghép | `dau-man.tsx`, không tiêu đề (tên ở đầu hồ sơ) | `dau-man.tsx` |
| Bảng điều khiển | ô số | khối | `stats-7` (ô số thành prop) | `components/khoi/stats-7/` |
| Bảng điều khiển | bảng nhóm theo người | **ghép, chờ** | `data-grid-grouping-2`: khối có 5 lỗi kiểu (sửa được khi chuyển thể), chưa làm ở đợt này | trang mẫu |
| Luồng nhiều bước | stepper + ghép cột | **ghép, chờ** | `solution-crm-6`: cần hook `use-file-upload`, hook này lỗi kiểu | trang mẫu |
| Luồng nhiều bước | xem trước | ghép | Frame đầu khung | trang mẫu |
| Dòng tin | dòng hoạt động theo ngày, lọc theo loại | khối | `solution-crm-5` | `components/khoi/solution-crm-5/` |

## Rào chắn khi dùng khối nguyên vẹn (đo 02/11)

- **Kiểu chặt.** Kho bật `noUncheckedIndexedAccess`; mã ReUI không viết theo cờ này.
  - Cài 8 khối và 3 ví dụ sinh ra 62 lỗi kiểu.
  - Lỗi trong *khối* (`crm-5`, `crm-6`, `grouping-2`, `settings-3`) sửa được khi chuyển thể, bằng chốt `if (!x) return`, không đổi cấu trúc hay lớp. Đã làm cho `crm-5`.
  - Lỗi trong *thành phần nguyên bản* (`reui/filters`, `reui/cascader`, hook `use-file-upload`) thì kho cấm sửa tay. Đây chính là chỗ chặn Tràn (`solution-crm-3`) và Luồng (`solution-crm-6`).
- **Lint giao diện.** 24 chỗ trên mã khối, mỗi chỗ đổi theo cách kho cho phép:
  - màu thô → token `success`, `info`;
  - cỡ chữ 10–11px → `text-xs`;
  - `transition-all` → nêu rõ thuộc tính.
- **Card trong ví dụ.** `c-data-grid-21` dựng bằng Card. Màn vận hành phải dùng Frame, nên chỉ lấy cách khai `skeleton` theo cột; không dùng khung của ví dụ.
- **Dữ liệu demo tiếng Anh.** `solution-crm-5` vẫn mang dữ liệu demo của khối. Mỗi màn thật thay dữ liệu khi chuyển sang bố cục.

## Còn mở

- Đăng ký khối vào danh mục.
  - Kiểm chuẩn đòi mỗi khối chuyển thể một dòng ở `catalog.md` «Khối đã chuyển thể», ô «Duyệt» khớp người ký Cổng Phạm vi.
  - Các dòng đã ghi «2026-11-02 · Manh Phan · he-bo-cuc». Chúng chỉ hợp lệ sau khi Cổng Phạm vi hàng 91 được duyệt; trước đó kiểm chuẩn đỏ, nên nhánh chưa đẩy được.

## Hồ sơ theo màn đang có (chủ kho 02/11)

Chủ kho chọn bố cục hồ sơ căn đang chạy (hàng 17) thay bản hai cột theo Verve. Đó là bậc 2 của thang dùng lại — khối đã
chuyển thể trong kho thắng khối mới. Giải phẫu của nó (`units/ho-so/cot-ho-so.tsx`) được rút nguyên lớp thành
`components/khoi/solution-crm-4/ho-so.tsx`: `KhungHoSo` (toàn màn là Frame; `cot` là FramePanel trong Frame của Bảng
hàng) · `DauHoSo` · `SoChinh` · `MucHoSo` · `CapGiaTri`. Hồ sơ căn, liên hệ, lead dựng từ các mảnh này. Màn `units/`
thuộc vùng hàng 33 nên chưa đổi; tới bước ấy nó nhập các mảnh dùng chung thay bản riêng (ngoại lệ có hạn đã trỏ hàng 33).
Thay đổi duy nhất so với màn đang chạy: cột cạnh bảng thôi đặt chiều cao viết cứng `h-[calc(100svh-10.5rem)]` — chiều
cao thuộc bố cục (luật no-layout-arbitrary).

## Chi tiết trượt phải (chủ kho 02/11)

Chủ kho chọn cách hiển thị của nhóm khối sheet của ReUI: bảng giữ toàn bề rộng, chi tiết trượt ra bên phải. Khối gốc
`sheet-9` (Ticket details) — kiểu inset mà mọi khối sheet của ReUI dùng chung — chuyển thể vào chính `NganNoi`, chỗ duy
nhất được gọi Sheet. Ngăn `phuBang` không khoá và không phủ mờ: `SheetContent` của bản cài luôn dựng lớp phủ chặn bấm,
nên ngăn đè lên bảng ghép thẳng từ Popup của Base UI với đúng lớp popup bên phải của bản cài. Đã thử trên bản chạy: lớp
phủ không có, bấm dòng B-03.05 thì ngăn đổi sang hồ sơ B-03.05, Esc đóng ngăn. Cột chia đôi `c-resizable-9` bỏ.
