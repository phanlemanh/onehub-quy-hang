# ADR-0024: Hệ bố cục — bảy bố cục có tên, vùng chuẩn và trang mẫu sống

Ngày: 2026-11-02 · Trạng thái: **đề xuất** (Manh Phan 02/11 duyệt hướng: «Duyệt hướng chung» — tám bước của phiên Khuôn
chung cộng năm bổ sung của phiên setup thiết kế; accepted khi PR gộp) · Liên quan: ADR-0002 (vỏ, IA, thang dùng lại),
ADR-0019 (cổng chọn khối ba lối), ADR-0022 (luật thiết kế D1–D5); Tham chiếu §9, §10;
[Vỏ, IA và khối đích](../design/vo-va-ia.md); bản đồ khuôn [`design/patterns/`](../../design/patterns/) · hàng nền 91

## Bối cảnh

Chủ kho xem demo Verve CRM (dựng bằng ReUI, cùng họ khối với Quỹ hàng) và thấy Quỹ hàng thiếu thành phần, xếp chưa tốt.
So sánh 01/11 (phiên Khuôn chung) cho thấy Verve nhất quán không nhờ khối hay hơn mà nhờ **một nguồn**: một vỏ, một họ
khung, token để nguyên, và mọi màn chọn một bố cục trong một bộ nhỏ có tên.

Kho có hai tầng luật: thang dùng lại cho từng ô (`.claude/rules/giao-dien.md`) và khuôn theo nhóm màn (bản đồ khuôn).
Thiếu tầng giữa — phần lặp lại ở mọi màn — nên màn đầu của mỗi nhóm tự chia vùng. Đếm trên main 01/11:

- Ba chỗ chờ tải dựng `Skeleton` tay (Bảng hàng, hồ sơ căn, lead đã nhập); không màn nào có trang chờ tải hay lỗi cấp
  tuyến; `TrangThai` chưa có kiểu chờ tải dù luật `KH-ts-chua-co-kieu` đã hẹn.
- Hai kiểu căn lề (Lead, Cài đặt bám trái; hồ sơ toàn màn căn giữa); hồ sơ toàn màn không có lối về, không vùng hành động;
  `Breadcrumb` đã cài mà không màn nào dùng.
- Nút tạo ở hai nơi (thanh trên và đầu Frame); cột thứ hai chỉ có «Chưa có»; chiều cao cột hồ sơ viết cứng
  (`h-[calc(100svh-10.5rem)]`), cùng bốn chỗ kích thước tuỳ ý khác trong mã màn.
- Hồ sơ cột phải từng chuyển thể từ ảnh xem trước thay vì mã đã cài; màn chỉ chụp được khi có Postgres, đăng nhập và dữ
  liệu dãy (ảnh hồ sơ từng ra đen) — ảnh đối chiếu đắt và hay hỏng.
- MCP `reui` và `shadcn` chỉ khai ở cấu hình người dùng; đổi tài khoản hay chạy trên đám mây là mất.

Quét theo trục (bố cục trang × vùng × trạng thái × khổ màn, thước đo: danh mục màn §10 và Material 3 canonical layouts,
Shopify Polaris page layouts, Atlassian page layout) cho bảy bố cục; phép thử phủ «mỗi màn vào đúng một bố cục» bắt được
bố cục dòng tin (Hôm nay của đầu khách, Đã gửi) mà đề xuất đầu tiên bỏ sót.

## Quyết định

1. **Ba tầng.** *Nền* — token của ReUI giữ nguyên, kho chỉ thêm token bố cục: lề trang, khoảng giữa các khung, bề rộng
   «đọc», điểm gãy khổ. *Khung ứng dụng* — vỏ `app-shell-8` đã chuyển thể, thêm menu Tạo. *Bố cục trang* — bảy bố cục
   dưới đây. Mẫu bên trong (danh sách, hồ sơ, trạng thái, form) nằm trong một bố cục và giữ ở bản đồ khuôn như hôm nay.

2. **Bảy bố cục có tên, mỗi bố cục khai mật độ và khối nguồn.** Màn chọn một bố cục; không màn nào tự chia vùng.

   | Bố cục | Mật độ | Khối nguồn (mã đã cài) | Màn |
   | --- | --- | --- | --- |
   | Tràn | dày | `data-grid-editing-6` | Bảng hàng, Hôm nay đầu chủ, trang nhóm môi giới, Lịch xem |
   | Danh sách – chi tiết | dày | bảng + ngăn trượt phải `sheet-9` (chủ kho 02/11) | Bảng hàng có hồ sơ cạnh bên, lead đã nhập |
   | Đọc | thường | `settings-3` (gỡ max-width ở gốc khối) | Ô nhận lead, từng mục Cài đặt sàn, Tôi |
   | Hồ sơ | thường | `solution-crm-4` — một cột theo hồ sơ căn hàng 17 (chủ kho 02/11) | Hồ sơ căn toàn màn, chế độ cuộc gọi, hồ sơ liên hệ |
   | Bảng điều khiển | thường | `stats-7` + `data-grid-grouping-2` | Hôm nay trưởng nhóm, Đội |
   | Luồng nhiều bước | thường | `solution-crm-6` | Nhập Excel, Gửi, Phát hàng |
   | Dòng tin | thường | `solution-crm-5` | Hôm nay đầu khách, Đã gửi trên điện thoại |

   Trang khách và đăng nhập không có vỏ (họ card); chúng ngoài bảy bố cục, như Tham chiếu §9.

3. **Sáu vùng, định nghĩa một lần.** Đầu màn (đường dẫn luôn có — nhà › màn, điện thoại chỉ mục cuối; chủ kho 02/11 ·
   tiêu đề và một dòng · một nút chính, tối
   đa hai nút phụ, còn lại vào «…») · thanh công cụ · thân · cột phụ · chân · ngăn nổi (máy tính mở ngăn bên, điện thoại
   mở ngăn từ đáy, tự đổi theo khổ). Ma trận bố cục × vùng:

   | Bố cục | Đầu màn | Thanh công cụ | Cột phụ | Chân |
   | --- | --- | --- | --- | --- |
   | Tràn | tiêu đề, nút chính | lọc, góc nhìn, nhóm | — | đếm n/N |
   | Danh sách – chi tiết | như Tràn | như Tràn | hồ sơ kéo chia | đếm n/N |
   | Đọc | đường dẫn khi sâu | — | — | lưu/huỷ hay nút gửi |
   | Hồ sơ | đường dẫn (tên, trạng thái, nút ở đầu hồ sơ trong khung) | — | — (toàn màn một cột căn giữa 48rem; cạnh bảng là cột phụ của Danh sách – chi tiết) | — |
   | Bảng điều khiển | chọn kỳ | — | — | — |
   | Luồng nhiều bước | bước đang ở | — | xem trước | lùi/tiếp |
   | Dòng tin | tiêu đề | lọc theo loại | — | — |

   **Đầu màn** (chủ kho 02/11): đường dẫn bên trái; điều khiển cấp màn (chọn kỳ, khoảng ngày) và nút bên phải, như Verve;
   cạnh tiêu đề chỉ có nhãn (trạng thái, bước); tiêu đề trùng mục cuối của đường dẫn.

   **Bố cục không dựng Frame** (bóc tách 02/11, `_acceptance/he-bo-cuc/discovery/boc-tach.md`): bố cục giữ đầu màn, thân,
   cột phụ; thanh công cụ và chân là phần của khối ReUI đặt trong thân, khối mang Frame của nó — bảng trên là vùng theo
   nghĩa, không phải chỗ bố cục tự dựng.

   ReUI không có khối đầu trang riêng (đã tra `page header with breadcrumb title and primary action buttons` →
   `navbar-9`, không đứng): đầu màn ghép từ `FrameHeader` + `breadcrumb` + `button` + `dropdown-menu`, ghi «Chỗ hở».

4. **Trạng thái.** Mỗi bố cục có khuôn chờ tải theo hình của nó (lưới theo `c-data-grid-21`); mọi màn có trang chờ tải,
   lỗi và «không thấy» cấp tuyến; `TrangThai` thêm kiểu chờ tải và chuyển thể `empty-state-1`, `-2`. Rỗng, lỗi, ngoại
   tuyến (dải báo đầu màn khi đang xem bản đã tải) — mỗi thứ một luật chung. Không đủ quyền và xung đột khi lưu để sau.

5. **Ba khổ.** Máy tính rộng (1440), máy tính vừa (1024), điện thoại (375). Bản điện thoại của từng bố cục: Tràn thành
   thẻ; Danh sách – chi tiết thành hai màn chồng; Hồ sơ thành một cột có nút dính đáy; Luồng nhiều bước mở ngăn
   toàn màn; Đọc và Dòng tin giữ; Bảng điều khiển không có trên điện thoại (Đội không có ở §9).

6. **Bậc mới trên thang dùng lại.** Trước khối đích của màn, ô tra hệ bố cục: bố cục và vùng đã có thì dùng. Vùng đi đúng
   hệ bố cục là đi khuôn sẵn — `divergence: skipped` hợp lệ cho vùng ấy (ADR-0019 quyết định 2).

7. **Chuyển thể từ mã đã cài, không từ ảnh xem trước.** Đo lề, khoảng cách và chiều cao từ tệp khối đã cài; khối tự đặt
   bề rộng ở gốc (như `settings-3`) thì gỡ theo dặn của ReUI, bề rộng thuộc bố cục.

8. **Trang mẫu sống** bày bảy bố cục × trạng thái × ba khổ bằng dữ liệu mẫu, chạy **không cần cơ sở dữ liệu, không đăng
   nhập**. Ảnh chụp từ trang này là **ảnh chuẩn** của bố cục, ghi ở danh mục khối. Bộ đối chiếu so màn mới với ảnh chuẩn
   của bố cục nó dùng — màn đầu của nhóm mới cũng có vật để so; eval `ui-check` của vòng giao diện so với ảnh chuẩn, không
   chỉ kiểm chữ và số.

9. **Răng.** Bài quét khuôn và lint `quy-hang-ui` đỏ khi: màn dưới `(app)` không khai bố cục; màn đặt lề, bề rộng,
   khoảng cách hay kích thước tuỳ ý (`max-w-*`, `p-*` ở gốc màn, `h-[…]`, `w-[…]`); dựng chờ tải ngoài khuôn; gọi thẳng
   `Sheet`/`Drawer` cho ngăn nổi. Màn của hàng đang chạy ghi ngoại lệ có hạn ở bản đồ khuôn tới khi hàng ấy chuyển; mức
   nợ giao diện giữ trần 0.

   Hộp nổi còn tự đặt bề rộng, chờ chuyển sang ngăn nổi (ghi theo dãy B, hàng 27 — chưa sửa trong hàng 91):
   - `apps/web/src/app/(app)/units/photos/redact/trinh-che.tsx` — hộp che vùng ảnh; ngoại lệ có hạn `sm:max-w-5xl`,
     `max-h-[calc(100dvh-13rem)]` do hàng vá `va-che-vung-anh` đặt.
   - `apps/web/src/app/(app)/units/photos/muc-anh.tsx` — hộp xem ảnh lớn; cùng lỗi `sm:max-w-sm` của hộp thắng
     `max-w-4xl`, hàng vá của B sửa tạm.

10. **MCP `reui` và `shadcn` khai trong `.mcp.json` của kho**, khoá đọc từ biến môi trường, không ghi vào tệp.

11. **Bản đồ hệ thiết kế một chỗ** (chủ kho 02/11 «Gửi vào hàng nền»). Skill `quy-hang-ui` giữ bảng «Bản đồ hệ thiết kế»:
    mỗi tệp một dòng — lớp (chỉ dẫn · nền · nhãn · chọn khối · khuôn · bố cục · kiểm · cổng · sổ · đối chiếu), việc nó làm,
    đường dẫn — gồm cả token (`globals.css`), hook kiểm cuối lượt, hiện trạng cổng chọn khối, đối chiếu ngành, canvas phác
    thảo và tệp mới của hệ bố cục (thành phần bố cục, trang mẫu sống, ảnh chuẩn, `.mcp.json`). `docs/README.md` trỏ dòng
    thiết kế sang bảng ấy, không thành tài liệu thứ ba. Kiểm chuẩn đỏ khi một tệp thuộc hệ thiết kế không có dòng — cùng
    cơ chế đang kiểm danh mục thành phần đã cài. Điểm xuất phát: bản nháp 18 dòng của phiên setup thiết kế.

12. **Duyệt một lần, không thêm cổng.** Cổng Phạm vi của hàng nền trình trang mẫu sống và ba trang ba lối — menu Tạo, đầu
    màn, các bố cục chưa có màn nào trong kho dùng. Sau đó máy giữ; đổi hệ bố cục chỉ qua ADR sửa.

13. **Theo Verve và giữ riêng.** Theo: đầu màn thống nhất, một menu Tạo, cột thứ hai có số, lọc dạng chip đọc thành câu,
    tab có số đếm, nút làm ngay trong dòng, dòng cài đặt nhãn trái ô phải. Giữ: hồ sơ mở cạnh bảng — nay trượt phải trong ngăn inset, bảng vẫn bấm được (chủ kho 02/11); thanh tab dưới điện
    thoại; lưới dày; sửa từng ô lưu ngay và hoàn tác (không lưu cả bảng ở Bảng hàng); không kéo thẻ để đổi trạng thái căn;
    Hôm nay là hàng đợi, không phải lịch; không bảng nhiều biểu đồ ở bản đầu. Cột thứ hai thì theo Verve: mọi nhà có, mặc định mở (chủ kho 02/11 tại Cổng
    Phạm vi hàng 91 — thay «Hôm nay không có cột thứ hai» của §9).

## Hệ quả

- Hàng nền 91 làm tám bước: khai MCP · kiểm kê màn → bố cục, chụp mốc · token nền · menu Tạo · bảy bố cục và sáu vùng ·
  trạng thái · trang mẫu sống và ảnh chuẩn · răng và bản đồ hệ thiết kế. Menu Tạo đổi nút đã chốt ở Tham chiếu §9 — sửa trong PR của hàng.
- Chuyển màn đang có: màn không hàng nào chạm (Cài đặt sàn, trang tạm, vỏ) chuyển trong hàng nền; Bảng hàng, hồ sơ căn,
  Hôm nay, lead chuyển khi hàng của chúng tới bước, mang ngoại lệ có hạn tới lúc đó. Mẫu bên trong theo hướng này đi
  cùng hàng ấy: hàng đợi là bộ lọc lưu được (ADR-0022) ở hàng 22; đầu hồ sơ, tab, hai cột ở vòng hồ sơ kế; cột thứ hai
  có số cùng hàng 52.
- Bốn chỗ ghép tạm «chờ khoá ReUI Pro» (đăng nhập, ô nhận lead, trống · lỗi · báo, người dùng) hết lý do chờ — MCP `reui`
  trả gói Pro. Hàng nền 91 trả hai chỗ nằm trong vùng của nó: trống · lỗi · báo (chuyển thể `empty-state-1`, `-2` vào
  `TrangThai`) và người dùng (`solution-users-8`, cùng lúc chuyển Cài đặt sàn sang bố cục Đọc). Đăng nhập (`auth-15`) và ô
  nhận lead (`form-2`) mở thành hàng riêng theo màn khi hàng 91 gộp — giám sát cấp mã; tới lúc đó hai dòng «Chỗ hở» đổi
  hạn xem lại thành «khi hàng ấy mở».
- `docs/design/vo-va-ia.md` §2 thêm cột «Bố cục»; danh mục khối thêm dòng cho mỗi khối hệ bố cục dùng; skill
  `quy-hang-ui` thêm mục hệ bố cục — trong PR của hàng nền.
- Giả định chờ gạch ở Cổng Phạm vi của hàng nền: máy tính vừa có cần bố cục riêng (chưa xem trên bản chạy); không đủ
  quyền có cần khuôn riêng.

## Phương án đã cân

- **Bảy khuôn chung trộn tầng** (đề xuất đầu, 01/11) — gộp vỏ, bố cục và mẫu bên trong vào một danh sách; không có phép
  thử phủ nên bỏ sót dòng tin.
- **Lệnh dựng màn** sinh khung màn từ khối — tiện nhưng không chặn màn tự chia vùng; hạ thành tiện ích, răng mới là chỗ giữ.
- **Ảnh chuẩn chụp từ màn thật** — khoá vào dữ liệu dãy và đăng nhập, đã từng ra ảnh đen; trang mẫu sống rẻ và tất định.
- **Để từng hàng tự sửa bố cục khi tới lượt** — rẻ trước mắt, nhưng là đúng cách đã sinh ra các chỗ lệch hôm nay.

## Sửa đổi 04/11 — Đọc hẹp

Hồ sơ `_acceptance/cai-dat-hop-nhat/` (chủ kho chọn cách B «Đọc hẹp» ở Cổng Đáng 04/11). Dòng «Đọc … (gỡ max-width ở gốc
khối)» của quyết định 2 giữ nguyên làm sử; điều đang đúng: thân của bố cục Đọc rộng tối đa `--container-doc` (48rem), mép
trái sát vùng nội dung (cạnh cột mục lục), không căn giữa. Áp cho mọi màn Đọc — mục Cài đặt, Cá nhân, Ô nhận lead, trang
tạm; Hồ sơ và Dòng tin giữ 48rem căn giữa. Không thêm bố cục thứ tám. Điện thoại giữ. Bề rộng vẫn thuộc bố cục: màn không
tự đặt.
