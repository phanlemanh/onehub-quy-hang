# Vết chọn khối — thiết kế

Hàng 83 `vet-chon-khoi` (dãy G, CK2 + CK3 của bản phạm vi cổng chọn khối). Căn cứ: ADR-0019 quyết định 3 và 4; ô cơ hội
`_acceptance/vet-chon-khoi/opportunity.md` (Cổng Đáng: build, Manh Phan).

## 1. Vấn đề

- Bảng «Khối đã chuyển thể» của `.agents/skills/quy-hang-ui/catalog.md` có hai dòng (`app-shell-8`, `data-grid-editing-6`)
  nhưng không có archetype, nhóm đang dùng, ảnh chuẩn, phiên bản ReUI, ngày và người duyệt. Kiểm chuẩn
  (`packages/ui-lint/kiem-chuan.mjs`) chỉ đếm thành phần đã cài, không đếm khối — khối chuyển thể mà quên ghi thì không ai
  hay. Bậc 2 của thang dùng lại («khối đã chuyển thể trong kho») vì thế không tra được theo khối.
- Bảng «Chỗ hở» (`docs/design/vo-va-ia.md` §3, 13 dòng) chỉ có «Chỗ | Ghép». Rơi xuống ghép không để vết: không ghi đã
  tra gì trên ReUI, vì sao không đứng, khi nào xem lại. Bốn chỗ tạm chờ khối Pro vẫn chờ dù khoá đã có từ 30/10.

## 2. Cách làm

### 2.1 Danh mục khối (CK3)

Bảng «Khối đã chuyển thể» đổi thành chín cột, mỗi ô bắt buộc:

`Khối gốc | Archetype | Nhóm đang dùng | Tệp đang dùng | Màn | Ảnh chuẩn | Phiên bản ReUI | Duyệt | Đã đổi gì`

- **Archetype**: một tên archetype của `vo-va-ia.md` (cột Archetype §2, hay tên vỏ §1 cho khối vỏ).
- **Nhóm đang dùng**: tên nhóm của bản đồ khuôn `design/patterns/*.md` (khoá `nhom:`), cách nhau bằng dấu phẩy; khối vỏ
  ghi `vỏ` (khuôn của mọi nhóm).
- **Ảnh chuẩn**: đường một ảnh PNG có trong kho, chụp khối đã chuyển thể ở màn đang chạy.
- **Phiên bản ReUI**: phiên bản skill ReUI lúc chuyển thể (`reui skill <mã>`, dòng «ReUI skill version» của
  `.agents/skills/reui/SKILL.md`) — registry `@reui` không mang số phiên bản.
- **Duyệt**: `YYYY-MM-DD · <tên> · <hồ sơ>` — người ký Cổng Phạm vi của vòng đã chọn khối (ADR-0019 quyết định 5);
  `<hồ sơ>` là slug của vòng ấy, và `approved_by` trong `_acceptance/<hồ sơ>/contract.md` phải bằng `<tên>`. Hai khối
  hiện có: `app-shell-8` ← `vo-ung-dung`, `data-grid-editing-6` ← `bang-hang-kieu-sheet` (cả hai `approved_by: Manh Phan`).

Kiểm chuẩn thêm `kiemKhoi`:

- mọi dòng đủ chín ô; `Ảnh chuẩn` và mọi đường trong `Tệp đang dùng` có trên đĩa; `Nhóm đang dùng` là `vỏ` hay tên
  nhóm có trong bản đồ khuôn; `Duyệt` đúng khuôn ngày · tên. Lỗi gọi `catalog.md khối <tên>: <cột> — <điều sai>`;
- **khối đã chuyển thể mà không có dòng**: quét chú thích trong `apps/web/src` — dòng chứa «chuyển thể» mà SAU chữ ấy có
  một tên khối ReUI (`chữ-thường-có-gạch-nối-số`, không dính chữ cái liền trước) — mỗi tên phải có dòng trong bảng. Lỗi
  `catalog.md thiếu khối: <tên> (chuyển thể ở <tệp>:<dòng>)`. Tên khối đứng TRƯỚC «chuyển thể» (vd «khối đích `auth-15`
  chuyển thể ở việc riêng») không tính — đó là việc sắp làm, không phải đã làm.

### 2.2 Chỗ hở (CK2)

Bảng §3 đổi thành năm cột: `Chỗ | Ghép | Đã tra trên ReUI | Vì sao không đứng | Hạn xem lại`.

- **Đã tra trên ReUI**: `` `<truy vấn>` → <ứng viên gần nhất> `` (hay «không có»). Điền ngược 13 dòng bằng truy vấn MCP
  `reui` thật lúc thi công; kết quả thô của từng truy vấn lưu ở `_acceptance/vet-chon-khoi/evidence/reui-tra.md` (truy
  vấn · danh sách tên trả về), và bài kiểm đối chiếu mỗi ô với tệp ấy: truy vấn có mặt, ứng viên nằm trong danh sách trả về.
- **Hạn xem lại**: mở đầu bằng ngày `YYYY-MM-DD` hay bằng «khi » (một điều kiện). Ngày đã tới (≤ hôm nay) thì kiểm chuẩn in
  **cảnh báo** có tên dòng, không đỏ — để chỗ ấy thành hàng riêng (mục chờ H16), không chặn lint.
- Bốn chỗ tạm chờ khối Pro (đăng nhập, ô nhận lead, trống · lỗi · báo, người dùng) ghi hạn `2026-10-30 — khi có khoá
  ReUI Pro`: khoá có từ 30/10 (`.claude/rules/giao-dien.md` «Mạnh 30/10: ReUI (tài khoản Pro)…») nên bốn dòng ra cảnh
  báo ngay.

Kiểm chuẩn thêm `kiemChoHo`: mỗi dòng đủ năm ô không rỗng (không chỉ «—»), hạn đúng khuôn. Lỗi
`vo-va-ia.md chỗ hở «<Chỗ>»: <cột> — <điều sai>`; cảnh báo `vo-va-ia.md chỗ hở «<Chỗ>»: hạn xem lại <ngày> đã tới`.
Cảnh báo in ra stdout của `kiem-chuan.mjs` (bước cuối `npm run lint`) trước dòng «chuẩn giao diện: đạt», mã thoát 0.
Ô chỉ chứa «—» coi như rỗng ở cả hai bảng.

Hai bài chỉ đọc đúng hai bảng (tách theo tiêu đề mục), nên sửa phần khác của hai tệp hay docs khác không làm đổi đầu ra.

### 2.3 Luật cho người và tác tử

- `vo-va-ia.md` §3 thêm đoạn dẫn: ba ô bắt buộc; rơi bậc trong một vòng là một dòng `decisions.jsonl` của hồ sơ.
- `quy-hang-ui/SKILL.md`: bậc 2 của thang tra bảng «Khối đã chuyển thể»; chuyển thể khối mới thì thêm dòng đủ chín ô
  trong cùng PR, và tệp chuyển thể mang chú thích «chuyển thể … <khối>» để bộ kiểm nhận ra; ghép hay tự viết thì thêm
  dòng «Chỗ hở» đủ năm ô.

## 3. Ngoài phạm vi

- Trang ba lối và luật «ô chưa có khuôn» (CK1) — hàng 84 `the-ba-loi`.
- Trả bốn chỗ ghép tạm (CK4) — mục chờ H16, mở sau khi hàng này ký.
- Đo dòng «rơi bậc» trong sổ quyết định bằng máy — luật chữ ở §3 và skill; không có thước máy ở hàng này.
- Thêm chú thích nhận diện vào mã `apps/web` — nhận diện đọc nếp chú thích sẵn có.

## Đặc tả UX

Bỏ — hàng không chạm giao diện người dùng (chỉ bảng tài liệu và bộ kiểm).
