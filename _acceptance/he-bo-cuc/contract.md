---
schema_version: 1
feature: Mọi màn sau đăng nhập chọn một trong bảy bố cục có tên với sáu vùng chuẩn, chờ tải theo hình bố cục, rỗng · lỗi · ngoại tuyến một luật, ba khổ và một menu Tạo trên vỏ; trang mẫu sống không cần cơ sở dữ liệu hay đăng nhập cho ảnh chuẩn để đối chiếu màn mới; răng lint và bản đồ hệ thiết kế giữ luật
slug: he-bo-cuc
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, web]
status: draft
design_doc: docs/superpowers/specs/2026-11-02-he-bo-cuc-design.md
---

# Acceptance Contract: he-bo-cuc

## Context

Hàng 91 (dãy G), hàng nền của đợt. Gốc: ADR-0024 (chủ kho duyệt hướng 02/11 «Duyệt hướng chung»), ô cơ hội đã quyết
`build` 01/11. Đứng trên hàng 84 (trang ba lối). Ba tầng nền · khung ứng dụng · bố cục trang; bảy bố cục Tràn · Danh sách
– chi tiết · Đọc · Hồ sơ hai cột · Bảng điều khiển · Luồng nhiều bước · Dòng tin; sáu vùng đầu màn · thanh công cụ ·
thân · cột phụ · chân · ngăn nổi; ba khổ 1440 · 1024 · 375.

## Criteria

### AC-1 — MCP của kho
Given kho vừa clone, chưa có cấu hình MCP người dùng
When mở phiên Claude Code ở gốc kho
Then `.mcp.json` khai hai máy chủ `reui` (HTTP, style `base-nova`) và `shadcn`; khoá ReUI chỉ đọc từ biến môi trường
`REUI_LICENSE_KEY`, tệp không mang chuỗi khoá nào; bước kiểm chuẩn đỏ khi tệp mang chuỗi trông như khoá thật hay thiếu
một trong hai máy chủ.

### AC-2 — Bảy bố cục và sáu vùng
Given một màn dưới `(app)` dựng `<BoCuc kieu="…">` với vùng của nó
When màn hiện ở máy tính rộng
Then đúng bảy kiểu được nhận (kiểu lạ là lỗi kiểu TypeScript); bố cục chỉ giữ khung trang — lề, dải đầu màn, xếp thân
và cột phụ theo kiểu — và không tự dựng Frame: mỗi vùng là một khối ReUI nguyên vẹn mang Frame của nó (đầu khung, thanh
công cụ, chân); cột phụ chỉ ở Danh sách – chi tiết, Hồ sơ hai cột (dữ kiện trái 20rem), Luồng nhiều bước; lề, khoảng
cách lấy từ token bố cục, không từ số trong màn; mỗi ô của trang mẫu mang một nhãn nguồn (khối · c-* · thành phần · ghép)
ở bảng bóc tách, không ô nào vẽ tay.

### AC-3 — Đầu màn
Given một màn khai đường dẫn, tiêu đề, một dòng mô tả và danh sách nút
When đầu màn hiện
Then đường dẫn luôn hiện (ít nhất nhà › màn, sâu hơn thì thêm tầng) và mục cha là lối về — điện thoại chỉ hiện mục cha
dạng «‹ cha»; đúng một nút chính, tối đa hai nút phụ, nút còn lại vào menu «…».

### AC-4 — Menu Tạo và cột thứ hai trên vỏ
Given người đăng nhập với vai bất kỳ ở Tham chiếu §9
When thanh trên hiện
Then việc tạo hiện ở đúng một chỗ: một nút chính (việc tạo đầu tiên của vai) cộng menu các việc tạo còn lại theo lối đã
chọn ở Cổng Phạm vi; vai không có việc tạo không thấy nút; không màn nào còn nút tạo trùng ở đầu khung; Tham chiếu §9 ghi
cách mới; mọi nhà (Hôm nay, Bảng hàng, Đã gửi, Đội, Cài đặt sàn) có cột thứ hai, mặc định mở, người gập thì máy nhớ theo
người, sàn, nhà.

### AC-5 — Trạng thái chung
Given một tuyến dưới `(app)` đang tải, lỗi, không thấy, hay rỗng, hay mất mạng khi đang xem bản đã tải
When người mở tuyến
Then chờ tải theo hình của bố cục (lưới theo `c-data-grid-21` cho Tràn); lỗi và «không thấy» cấp tuyến có ở `(app)` và
gốc (kể cả `global-error`) và đi qua `TrangThai`; `TrangThai` có kiểu chờ tải và chuyển thể `empty-state-1`, `-2`; ngoại
tuyến là dải báo ở đầu màn, nội dung đã tải giữ nguyên.

### AC-6 — Ba khổ
Given mỗi bố cục trên trang mẫu sống
When xem ở 1440, 1024 và 375
Then bản điện thoại theo ADR-0024 §5 — Tràn thành thẻ, Danh sách – chi tiết thành hai màn chồng, Hồ sơ hai cột một cột
có nút dính đáy, Luồng nhiều bước ngăn toàn màn, Đọc và Dòng tin giữ, Bảng điều khiển không có trên điện thoại; ngăn nổi
là ngăn bên ở máy tính và ngăn từ đáy ở điện thoại; không cuộn ngang ở 375.

### AC-7 — Trang mẫu sống
Given máy chủ web chạy không có cơ sở dữ liệu và trình duyệt không có cookie phiên
When mở `/mau/he-bo-cuc`
Then trang hiện đủ bảy bố cục × năm trạng thái (mặc định · chờ tải · rỗng · lỗi · ngoại tuyến) × ba khổ bằng dữ liệu mẫu,
mỗi tổ hợp có địa chỉ riêng; trang không nhập lớp gọi API; ở bản chính thức trang theo lối đã chọn ở Cổng Phạm vi (Hỏi-1).

### AC-8 — Ảnh chuẩn và đối chiếu
Given ảnh chuẩn chụp từ trang mẫu sống
When một vòng giao diện chạm màn của một nhóm có khai bố cục
Then kho có 21 ảnh chuẩn (bảy bố cục × ba khổ) ghi ở danh mục khối; mục bản đồ khuôn có khoá `bo_cuc`; bộ đối chiếu lập
cặp «màn mới · ảnh chuẩn của bố cục nó dùng», kể cả màn đầu của nhóm chưa có màn mẫu; trang ba lối nhận nhiều ô
trong một hồ sơ (`ba-loi/<mã ô>/`, lệnh `--o <mã ô>`) và kiểm chuẩn kiểm từng ô, lỗi gọi tên ô.

### AC-9 — Răng lint
Given một màn dưới `(app)` (tệp thử)
When chạy `npm run lint`
Then đỏ với thông điệp gọi tên luật ở mỗi ca: nhóm của màn không khai bố cục hay khuôn không dựng đúng kiểu; màn đặt
`max-w-*`, `h-[…]`, `w-[…]`, `min-h-[…]` hay lề ở gốc; nhập `Skeleton` ngoài khuôn chờ tải; nhập `Sheet`/`Drawer` ngoài
ngăn nổi; màn của hàng đang chạy mang ngoại lệ có hạn (hạn trỏ hàng đã gộp thì đỏ); mức nợ giữ 0.

### AC-10 — Chuyển màn và bản đồ hệ thiết kế
Given kho sau hàng
When đọc mã và tài liệu
Then Cài đặt sàn ở `(app)/settings` đi bố cục Đọc, mục Người dùng chuyển thể `solution-users-8`; trang tạm đi bố cục Đọc;
`vo-va-ia.md` §2 có cột «Bố cục»; skill `quy-hang-ui` có bảng «Bản đồ hệ thiết kế» mỗi tệp một dòng (lớp, việc, đường
dẫn), `docs/README.md` trỏ sang bảng; kiểm chuẩn đỏ khi một tệp thuộc hệ thiết kế thiếu dòng.

## Coverage

Quét Zwicky (preset entity-feature, đối tượng «màn»). Chân sản phẩm: `[SUY-TỪ-REPO: docs/adr/0024-he-bo-cuc.md]`
quyết định 1–13; `[SUY-TỪ-REPO: docs/design/vo-va-ia.md]` §1–§2; `[SUY-TỪ-REPO: design/patterns/]` chín nhóm. Chân
ngành: `[NGÀNH: Material 3 canonical layouts]`, `[NGÀNH: Shopify Polaris page layouts]`, `[NGÀNH: Atlassian page
layout]`, `[NGÀNH: Verve CRM trên ReUI]` (ADR-0024 bối cảnh). Thước CE: ngưỡng `bat_khi` của hàng 91 và phép thử «mỗi màn
vào đúng một bố cục» của ADR.

- Trục A — tầng: nền (AC-2) | khung ứng dụng (AC-4) | bố cục và vùng (AC-2, AC-3).
- Trục B — trạng thái: mặc định · chờ tải · rỗng · lỗi · ngoại tuyến (AC-5, AC-7); không đủ quyền, xung đột khi lưu →
  Later (ADR quyết định 4).
- Trục C — khổ: 1440 · 1024 · 375 (AC-6) `[GIẢ ĐỊNH: 1024 không cần bố cục riêng — Hỏi-5]`.
- Trục D — vật giữ luật: lint (AC-9) | bài quét khuôn (AC-8, AC-9) | kiểm chuẩn (AC-1, AC-10) | ảnh chuẩn (AC-8).
- Trục E — màn: chuyển trong hàng (AC-10) | ngoại lệ có hạn (AC-9) | trang mẫu (AC-7).
- Later: khuôn không đủ quyền `[GIẢ ĐỊNH: Hỏi-6]`; xung đột khi lưu; lệnh dựng màn; đăng nhập `auth-15` và ô nhận lead
  `form-2` (hàng riêng).

## Đường đo

- «Một màn dưới (app) không khai bố cục… → npm run lint đỏ»: AC-9, đo bằng bộ test của `packages/ui-lint` trên tệp thử.
- «Trang mẫu sống mở không Postgres, không đăng nhập, đủ 7 × trạng thái × 3 khổ»: AC-7, đo bằng ui-check trên máy chủ
  không có `DATABASE_URL` và trình duyệt không cookie.
- «Vòng giao diện so màn mới với ảnh chuẩn»: AC-8, đo bằng kế hoạch đối chiếu sinh ra cặp ảnh chuẩn.
- «MCP chạy từ .mcp.json»: AC-1. «Cài đặt sàn, trang tạm, TrangThai đã chuyển; bản đồ hệ thiết kế»: AC-10.

## Out of scope

- Chuyển Bảng hàng, hồ sơ căn, Hôm nay, lead sang bố cục — mỗi màn chuyển ở hàng của nó; hàng này chỉ ghi ngoại lệ có hạn.
- Đăng nhập (`auth-15`) và ô nhận lead (`form-2`) — hàng riêng khi hàng 91 gộp, giám sát cấp mã.
- Khuôn không đủ quyền và xung đột khi lưu (ADR-0024 quyết định 4).
- Lệnh dựng màn sinh khung từ khối (ADR-0024 «Phương án đã cân»).

## Notes

- Vùng của hàng: `ranh_gioi` hàng 91 ở `hang-viec.json`, cộng `apps/web/src/app/mau/**` và `apps/web/src/proxy.ts`
  (trang mẫu sống nằm ngoài `(app)` — layout của `(app)` đòi phiên).
