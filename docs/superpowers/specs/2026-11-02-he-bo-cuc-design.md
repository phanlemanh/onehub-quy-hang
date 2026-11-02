# Hệ bố cục — thiết kế (hàng 91)

Ngày 02/11/2026 · dãy G · nguồn: ADR-0024 (chủ kho duyệt hướng 02/11), ô cơ hội `_acceptance/he-bo-cuc/opportunity.md`.
Bản này chỉ ghi cách làm; điều đã quyết về sản phẩm nằm ở ADR-0024, không chép lại.

## Mục tiêu

Mọi màn sau đăng nhập chọn một trong bảy bố cục có tên. Bố cục giữ lề, bề rộng, khoảng cách, chờ tải và bản điện
thoại; màn chỉ điền vùng. Có một trang mẫu sống bày mọi bố cục × trạng thái × khổ màn mà không cần cơ sở dữ liệu hay
đăng nhập, và ảnh chụp từ trang ấy là ảnh chuẩn để đối chiếu màn mới. Răng lint giữ luật về sau.

## Kiến trúc

### Ba tầng

- **Nền** (`apps/web/src/app/globals.css`): token của ReUI giữ nguyên. Thêm bốn token bố cục trong `@theme`:
  - `--spacing-trang`: lề trang, 16px ở điện thoại và 24px từ `md`;
  - `--spacing-khung`: khoảng giữa các khung, 16px;
  - `--container-doc`: bề rộng đọc, 48rem;
  - `--breakpoint-vua`: 1024px.

  Đây là mọi số bố cục được dùng. Màn không viết số.

  Thêm 02/11 khi soát token (không đổi hình): `--spacing-ngan-le` 1rem và `--container-ngan` 32rem (ngăn inset
  `sheet-9`), `--spacing-ho-so-nhan` 8rem (cột nhãn hồ sơ), `--ease-vao` (đường cong «vào» của ReUI), và ba số khung vỏ
  `--vo-thanh-tren` 50px, `--vo-cot-bieu-tuong` 63px, `--vo-cot-hai` 200px. Màu sáng/tối là token của ReUI, giữ nguyên;
  ảnh chuẩn có thêm bản tối ở 1440.
- **Khung ứng dụng** (`components/shell/`): vỏ `app-shell-8` giữ nguyên, có hai đổi.
  - Bỏ `p-4` ở cột nội dung: lề nay thuộc bố cục, nhờ đó Tràn đi được sát mép.
  - Các nút tạo rời rạc nhập thành **menu Tạo**: một nút chính theo vai, cộng menu các việc tạo khác (lối chọn ở Hỏi-2).
- **Bố cục trang** (`components/bo-cuc/`): mỗi tệp một bố cục, cộng một tệp vùng. Tham chiếu §9 và tệp sản phẩm không
  đổi nghĩa; chỉ đổi chỗ nút tạo.

### Thành phần

```
components/bo-cuc/
  index.ts            xuất BoCuc, vùng, BO_CUC (danh sách bảy kiểu + ma trận vùng)
  bo-cuc.tsx          <BoCuc kieu="…">: dựng khung theo kiểu, giữ lề/bề rộng/cuộn, đặt vùng đúng chỗ
  vung.tsx            DauMan · ThanhCongCu · Than · CotPhu · Chan
  dau-man.tsx         đường dẫn (khi sâu > 1 tầng) · tiêu đề + một dòng · 1 nút chính, ≤ 2 phụ, còn lại «…»
  ngan-noi.tsx        NganNoi: Sheet phải ở máy tính, Drawer đáy ở điện thoại — chỗ duy nhất gọi Sheet/Drawer
  cho-tai.tsx         ChoTai theo kiểu: lưới theo c-data-grid-21, đọc, hồ sơ một cột, bảng điều khiển, luồng, dòng tin
  dai-ngoai-tuyen.tsx dải báo đầu màn khi đang xem bản đã tải mà mất mạng (đọc trạng thái mạng của bộ đồng bộ)
  ma-tran.ts          bố cục × vùng (bảng ADR §3) — máy đọc, test và trang mẫu dùng chung
```

`BO_CUC` và ma trận vùng là dữ liệu thuần, nên test của gói web và bài quét khuôn cùng đọc một nguồn. Mỗi bố cục khai
ba thứ: mật độ (dày · thường), khối nguồn, và bản điện thoại theo ADR §5.

### Chờ tải, lỗi, «không thấy» cấp tuyến

- `app/(app)/loading.tsx` dựng `ChoTai` chung; màn nào cần hình riêng thì đặt `loading.tsx` của tuyến nó, gọi
  `ChoTai kieu=…`.
- `app/(app)/error.tsx` và `not-found.tsx` cùng `app/error.tsx`, `not-found.tsx`, `global-error.tsx` đều đi qua
  `TrangThai`. Trang gốc không có vỏ, nên dùng bố cục Đọc trên nền trống.
- `TrangThai` thêm kiểu `loading` và chuyển thể `empty-state-1` (rỗng lần đầu, có hành động) và `empty-state-2` (lọc
  không ra gì). Khuôn `trang-thai` đóng luật `KH-ts-chua-co-kieu`.

### Trang mẫu sống

- Địa chỉ `/mau/he-bo-cuc`, ở `app/mau/he-bo-cuc/`, nằm **ngoài** nhóm `(app)`. Bản chính thức nhận diện bằng
  `VERCEL_ENV=production`: trang trả «không thấy» và proxy không mở địa chỉ này khi không có phiên (Hỏi-1, khuyến nghị).
  - Vì sao ở ngoài: layout của `(app)` đọc phiên và đưa về `/login`, mà layout lồng thì không bỏ qua được.
  - `proxy.ts` cho địa chỉ này qua khi không có cookie phiên.
- Trang dựng vỏ thật (`AppShell`) với người mẫu và vai mẫu, cùng dữ liệu mẫu trong tệp `du-lieu-mau.ts`. Không nhập
  `lib/api`, không gọi mạng; bài test chặn nếu có một dòng nhập như vậy.
- Thanh chọn trên trang: bố cục (7) × trạng thái (mặc định · chờ tải · rỗng · lỗi · ngoại tuyến) × khổ (1440 · 1024 ·
  375). Khổ dựng bằng iframe đúng bề rộng nên media query chạy như trên thiết bị. Mỗi tổ hợp có địa chỉ riêng
  (`/mau/he-bo-cuc/xem?bo-cuc=&trang-thai=`) để máy chụp ở đúng khổ.
- Trên bản chính thức: theo Hỏi-1.

### Ảnh chuẩn và đối chiếu

- Ảnh chuẩn: `design/anh-chuan/<bố cục>-<khổ>.png`, gồm 7 × 3 = 21 ảnh ở trạng thái mặc định, chụp từ trang mẫu sống.
  Bốn trạng thái kia xem trên trang, không chụp, để kho không phình (bốn trạng thái có chung khung). Bước chụp ghi
  `design/anh-chuan/ke.json`: mỗi ảnh một dòng gồm địa chỉ, khổ, commit. Ảnh chuẩn ghi ở danh mục khối.
- Mục bản đồ khuôn thêm khoá `bo_cuc: <kiểu>`.
- `doi-chieu.mjs` lập cặp ảnh «màn mới · ảnh chuẩn của bố cục nó dùng» thay cho màn mẫu khi nhóm chưa có màn mẫu đang
  chạy, nên màn đầu của nhóm mới cũng có vật để so.
- Eval `ui-check` của vòng giao diện đặt ảnh mới cạnh ảnh chuẩn, không chỉ đọc chữ và số.

### Răng

Mỗi luật nói chỗ dùng thay.

| Răng | Chỗ | Đỏ khi |
| --- | --- | --- |
| bố cục có khai | bài quét khuôn | nhóm màn dưới `(app)` thiếu `bo_cuc`, hay khuôn của nhóm không dựng `<BoCuc kieu=…>` đúng kiểu đã khai |
| `quy-hang-ui/no-layout-arbitrary` | ESLint, tệp dưới `app/` | `max-w-*`, `h-[…]`, `w-[…]`, `min-h-[…]`; `p-*`/`px-*`/`py-*` trên phần tử gốc của trang |
| `quy-hang-ui/no-raw-skeleton` | ESLint, `app/**` và `components/**` trừ `bo-cuc/`, `trang-thai.tsx`, tệp cài | nhập `Skeleton` |
| `quy-hang-ui/no-direct-sheet` | ESLint, cùng phạm vi | nhập `Sheet`/`Drawer`; dùng `NganNoi` |

- Màn của các hàng đang chạy (Bảng hàng, hồ sơ căn, Hôm nay, lead) mang **ngoại lệ có hạn**: dòng `ngoai_le` có khoá
  `han: <mã hàng>`. Bài quét in số ngoại lệ có hạn kèm hàng nhận; hạn mà trỏ một hàng đã gộp thì đỏ.
- Mức nợ giữ trần 0.

### Bản đồ hệ thiết kế

- Skill `quy-hang-ui` có bảng «Bản đồ hệ thiết kế», mỗi tệp một dòng: lớp, việc, đường dẫn. Lớp là một trong: chỉ dẫn ·
  nền · nhãn · chọn khối · khuôn · bố cục · kiểm · cổng · sổ · đối chiếu.
- Danh sách mẫu đường dẫn của hệ thiết kế nằm trong khối máy đọc ngay trên bảng. Bước kiểm chuẩn so cây với bảng: tệp
  khớp mẫu mà thiếu dòng thì đỏ.
- `docs/README.md` trỏ dòng thiết kế sang bảng.

### `.mcp.json`

Hai máy chủ, như cấu hình người dùng đang chạy:
- `reui`: HTTP `https://mcp.reui.io`, tiêu đề `X-Reui-Style: base-nova` (style của kho) và
  `Authorization: Bearer ${REUI_LICENSE_KEY:-}`.
- `shadcn`: `npx shadcn@latest mcp`.

Khoá chỉ đi qua biến môi trường. Bước kiểm chuẩn đỏ khi tệp mang chuỗi trông như khoá thật.

### Chuyển màn trong hàng

- **Cài đặt sàn** rời `app/settings/` vào `app/(app)/settings/`, bỏ layout riêng. Đi bố cục Đọc theo khối
  `settings-3`, gỡ `max-w` ở gốc. Mục Người dùng chuyển thể `solution-users-8`.
- **Trang tạm** dùng bố cục Đọc.
- **`TrangThai`** chuyển thể `empty-state-1` và `-2`.
- Các màn còn lại mang ngoại lệ có hạn, trỏ hàng chưa gộp gần nhất chạm màn ấy (tra `docs/plan/lo-trinh.json` 02/11).
  Đây là danh sách viết trước mà bài chấm so trọn tập:

  | Tệp (dưới `apps/web/src/app/(app)/`) | Hạn — hàng |
  | --- | --- |
  | `inventory/page.tsx`, `inventory/views/[id]/page.tsx`, `proto/nhanh-tuc-thi/page.tsx` | 79 `bang-hang-theo-loai-hinh` |
  | `units/[code]/page.tsx`, `proto/cot-ho-so-can/page.tsx`, `proto/anh-can-ba-ngan/page.tsx` | 33 `ho-so-can-dien-thoai` |
  | `today/page.tsx`, `proto/hom-nay-dau-chu/page.tsx` | 42 `hom-nay-truong-nhom` |
  | `leads/mine/page.tsx`, `leads/new/page.tsx`, `proto/o-nhan-lead/page.tsx` | 51 `lead-dien-thoai` |

- Luật ESLint của hệ bố cục đọc cùng bản đồ khuôn: tệp thuộc nhóm còn ngoại lệ có hạn thì được bỏ qua. Hạn trỏ một mã
  không có trong lộ trình, trỏ chính hàng 91, hay trỏ hàng đã gộp thì đều đỏ.
- `vo-va-ia.md` §2 thêm cột «Bố cục».

## Đối chiếu ngành

| Năng lực | RESO | Sản phẩm khác | Ta làm | Ta viết cứng — họ cho cấu hình |
| --- | --- | --- | --- | --- |
| Bố cục trang, vùng, khổ | không có (tầng giao diện) | Material 3 canonical layouts; Shopify Polaris page layouts; Atlassian page layout — ba hệ đều giữ bộ bố cục cố định, sản phẩm chọn, người dùng cuối không cấu hình | bảy bố cục cố định trong mã | không — cùng cứng như họ; lý do **nền tảng** (hệ giao diện, không phải dữ liệu nghiệp vụ) |
| Nút tạo trên vỏ | không có | Follow Up Boss, Lofty: nút thêm trên thanh trên — chưa kiểm được sàn có đổi thứ tự hay danh sách việc tạo không | việc tạo theo vai từ `navigationFor` của lõi (Tham chiếu §9) | không — danh sách theo vai là luật quyền của §9 (lý do **quyền**) |

Không dòng nào thành Hỏi theo `.claude/rules/thiet-ke-doi-chieu.md`: cả hai chỗ cứng đều có lý do trong bốn lý do, và
sản phẩm cùng ngành không cho sàn cấu hình chỗ ấy (nút tạo: chưa kiểm). Không thêm dòng vào trang Đối chiếu ngành vì
không tra được điều mới về sản phẩm khác.

## Câu hỏi cho người (Cổng Phạm vi)

> 02/11, chủ kho chọn bố cục Hồ sơ theo hồ sơ căn đang chạy (thay Hỏi-7): một cột giải phẫu `solution-crm-4`, toàn màn
> căn giữa 48rem, cạnh bảng là cột phụ; giải phẫu rút thành `components/khoi/solution-crm-4/ho-so.tsx`. Bố cục đổi tên
> «Hồ sơ hai cột» → «Hồ sơ».
>
> 02/11 (sau lượt chấm 1), chủ kho chốt trên bản vẽ máy tính: giữ cột dữ kiện trái 320px kiểu Verve thành **Cột thuộc
> tính** (`CotThuocTinh`), người dùng mở hay gập — máy tính mặc định mở, nút gập ở đầu cột, gập còn dải mảnh có nút mở
> lại, máy nhớ theo người và sàn (cùng cookie cột thứ hai); điện thoại cột xếp trên thân. Thân hồ sơ giữ giải phẫu
> `solution-crm-4`.

> Khảo sát ReUI và Verve CRM 02/11 (`_acceptance/he-bo-cuc/discovery/khao-sat-reui-verve.md`) đổi khuyến nghị Hỏi-2
> (menu Tạo theo Verve), Hỏi-3 (đầu màn ba dạng theo bố cục) và thêm Hỏi-7 (Hồ sơ ghép theo Verve, `solution-crm-4`
> về vai ngăn bên), Hỏi-8 (Đọc hết bề rộng). Sổ quyết định giữ dòng mới, dòng cũ bị thay. Bản bấm được đã theo số đo Verve
> ở những chỗ không cần người: lề 16px, khung `sm` cho bố cục dày, nhãn trạng thái `-light`, nút «+» Tạo ở 375, rỗng và
> lỗi có một hành động.

- **Hỏi-1** — Trang mẫu sống có mở trên bản chính thức không?
  - Khuyến nghị: chỉ mở ngoài bản chính thức (bản xem trước, máy). Ở bản chính thức trang trả «không thấy».
  - Lối khác: mở mọi nơi. Trang không mang dữ liệu thật, nhưng ai có địa chỉ cũng xem được toàn bộ giao diện.
- **Hỏi-2** — Menu Tạo: lối nào trên trang ba lối?
  - Khuyến nghị: lối ReUI, nút chia (`button-group` + `dropdown-menu`), «+ Lead» một chạm cộng mũi tên mở menu.
  - Lối Trong kho: giữ các nút rời theo vai.
  - Lối Vẽ mới: một nút «Tạo ▾» mở menu, mất cú một chạm cho lead.
- **Hỏi-3** — Đầu màn: lối nào?
  - Khuyến nghị: ghép `FrameHeader` + `breadcrumb` + `button` + `dropdown-menu`, thành dòng «Chỗ hở» như ADR §3.
  - Lối khác: dải đầu màn tách khỏi Frame, nằm trên nền.
- **Hỏi-4** — Ba bố cục chưa có màn nào trong kho dùng (Bảng điều khiển, Luồng nhiều bước, Dòng tin): duyệt theo khối
  nguồn ADR đã chọn, hay mở lối khác? Khuyến nghị: theo khối nguồn ADR.
- **Hỏi-5** (giả định ADR) — Máy tính vừa (1024) có cần bố cục riêng không?
  - Khuyến nghị: không. Cùng bố cục; cột phụ của Danh sách – chi tiết thu thành ngăn nổi dưới `vua`.
- **Hỏi-6** (giả định ADR) — Không đủ quyền có cần khuôn riêng không?
  - Khuyến nghị: không. Dùng `TrangThai kind="notice"` trong thân của bố cục, như luật `KH-cd-khong-quyen`.

## Ngoài phạm vi

- Chuyển các màn của hàng đang chạy (chỉ ghi ngoại lệ có hạn).
- Đăng nhập (`auth-15`) và ô nhận lead (`form-2`): mở hàng riêng khi hàng 91 gộp.
- Khuôn không đủ quyền và xung đột khi lưu.
- Lệnh dựng màn.

## Đặc tả UX

<!-- ux-spec:begin -->
- Người dùng: Đầu chủ · Đầu khách · Trưởng nhóm · Quản trị sàn; ai mở màn nào cũng thấy cùng đầu màn và cùng lề.
- Khuôn IA đã chọn + căn cứ: bảy bố cục của ADR-0024 (Material 3 canonical layouts, Polaris page layouts, Atlassian page
  layout). Không tra thêm mẫu: ADR đã đối chiếu, máy không chọn khuôn IA mới.
- Trạng thái mỗi bố cục: mặc định · chờ tải (hình của bố cục) · rỗng (`TrangThai`, có một hành động) · lỗi (thử lại) ·
  ngoại tuyến (dải đầu màn, giữ nội dung đã tải).
- Khổ: 1440 · 1024 · 375. Bản điện thoại theo ADR §5.
- Đường đi chính: mở vỏ → bấm nút chính của menu Tạo hay mở menu → chọn việc. Màn sâu một tầng trở lên thì đường dẫn
  đưa về.
<!-- ux-spec:end -->
