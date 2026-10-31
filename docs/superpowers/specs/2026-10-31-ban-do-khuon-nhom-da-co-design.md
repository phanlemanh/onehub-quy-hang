# Bản đồ khuôn cho các nhóm màn đã có — thiết kế (hàng 58)

Hồ sơ `_acceptance/ban-do-khuon-nhom-da-co/` · đợt `ban-do-khuon-3110` (mã QK1) · dãy D, đợt điều phối `nen-2`.

## Vì sao

Quỹ hàng thử bản đồ khuôn dạng «khai trước khi lệch»: các màn dày (bảng hàng, hồ sơ căn, Hôm nay) chưa dựng, nên khuôn
khai bây giờ là thứ màn mới sẽ đi qua. `docs/design/vo-va-ia.md` §2 là bản đồ bằng lời; hàng này biến phần thuộc các
nhóm **đã có màn thật** thành tệp máy đọc được, và đưa mọi màn hiện có của các nhóm ấy về dựng qua khuôn. Răng chặn
lệch theo diff và lint cấm nhập là hàng 59; ảnh màn mới cạnh màn mẫu và luật «nhóm mới tạo mục bản đồ» là hàng 60.

## Bốn nhóm, bốn tệp

Mỗi nhóm một tệp `design/patterns/<nhóm>.md`, frontmatter theo hình dạng finding kit §11.3 (nhom · doi_tuong · khuon ·
nhan_dien · mau_dang_chay · khe_bat_buoc · cam_ngoai_khuon · ngoai_le · luat), thân là chữ cho người và tác tử.

| Nhóm | Đối tượng | Khuôn (đã có / mới) | Màn hiện có | Màn mẫu |
| --- | --- | --- | --- | --- |
| `xac-thuc` | đăng nhập, chọn sàn, chưa gắn sàn | `Khung` — `apps/web/src/app/(auth)/khung.tsx` (đã có) | 3 trang `(auth)/*/page.tsx` | `/login` |
| `cai-dat-san` | các mục Cài đặt sàn | `MucCaiDat` — `apps/web/src/app/settings/khung.tsx` (mới) | `settings/users/page.tsx`; hai ngoại lệ có lý do | `/settings/users` |
| `trang-tam` | nhà, mục chưa có màn | `Placeholder` — `apps/web/src/components/shell/placeholder.tsx` (đã có) | 10 trang `(app)/**/page.tsx` + `settings/[section]` | `/today` |
| `trang-thai` | trống · lỗi · báo | `TrangThai` — `apps/web/src/components/trang-thai.tsx` (mới, ghép `Empty` + `Alert`) | chuông trống, trang tạm, lỗi thao tác và «không quyền» ở Người dùng | chuông trống |

Hai ngoại lệ của `cai-dat-san`: `settings/page.tsx` chỉ chuyển hướng sang Người dùng, không dựng màn;
`settings/[section]/page.tsx` là mục chưa dựng — đi khuôn trang tạm, vào `MucCaiDat` ở mục 45–50.

Không có nhóm cho: chờ tải (chưa màn nào có), toast `sonner` (chưa màn nào gọi) — khuôn sinh cùng màn đầu tiên dùng nó.

## Hai cách kiểm «dựng khuôn ở gốc» — khoá `don_vi`

- `don_vi: man` (mặc định, ba nhóm đầu): mỗi tệp khớp `nhan_dien` (trừ ngoại lệ) có thành phần xuất mặc định mà MỌI
  lệnh `return` trả JSX đều có gốc là `khuon.ten`, nhập đúng từ tệp `khuon.nhap` (không nhận bản cùng tên ở tệp khác),
  và truyền đủ `khe_bat_buoc` (`children` tính khi phần tử có con).
- `don_vi: phan-tu` (nhóm `trang-thai`): đơn vị là CHỖ trình trạng thái trong một màn, không phải cả tệp. Trong tệp khớp
  `nhan_dien` (trừ tệp khuôn và ngoại lệ): phần tử có tên trong `cam_ngoai_khuon`, hay thẻ HTML trần mang
  `role="alert"|"status"`, là lệch; mỗi `TrangThai` phải truyền đủ khe. Lỗi gắn một ô (`FieldError`) thuộc ô nhập, không
  thuộc nhóm — luật `KH-ts-loi-gan-o`.

`don_vi` là khoá thêm ngoài §11.3: nhóm trạng thái không có tệp màn riêng, thiếu khoá thì máy không phân được hai cách
kiểm. Tệp không khai khoá đọc là `man`, nên tệp đúng §11.3 vẫn đọc được. Đây là một điểm báo về kit.

## Bộ đọc và lệnh

- `packages/ui-lint/lib/ban-do.mjs` — đọc frontmatter (tập con YAML một dòng: chuỗi, `[...]`, `{...}`, mảng các
  `{...}`; dòng ngoài tập con là lỗi có tên, không đoán), kiểm lược đồ, rồi kiểm cây bằng trình phân tích TypeScript của
  kho. Không thêm phụ thuộc mới.
- Lỗi đọc bản đồ (mỗi lỗi gọi tên tệp và trường): thiếu khoá · `nhom` khác tên tệp · `khuon.nhap` không có tệp hay
  không xuất `khuon.ten` · khe không phải tham số của khuôn · `mau_dang_chay.tep` không có, không khớp `nhan_dien`, hay
  là ngoại lệ · ngoại lệ thiếu `ly_do` hay trỏ tệp không có · khối cấm không được thành phần nào của kho xuất · mã luật
  không có trong thân · một tệp nằm trong `nhan_dien` của hai nhóm `man` mà không là ngoại lệ ở một bên.
- `node packages/ui-lint/ban-do-khuon.mjs [--root <kho>] [--json]`: mỗi nhóm một dòng
  `<nhóm>: N tệp theo khuôn · k ngoại lệ · m lệch`; thoát 0 khi 0 lỗi đọc và 0 lệch, 1 khi có — mỗi lỗi, mỗi lệch một
  dòng `<tệp>: <nhóm> — <điều lệch>`. Hàng 59 dựng răng trên lệnh này.
- Bài kiểm `packages/ui-lint/tests/ban-do-khuon.test.mjs` chạy trong `npm test -w @quy-hang/ui-lint` (đã có trong bộ
  kiểm mỗi lượt và CI): cây thật xanh, mỗi ca đỏ trên bản sao trong thư mục tạm ghim thông điệp.

## Đổi trên màn

- `MucCaiDat`: một `Frame` rộng tối đa `max-w-3xl` trong vỏ, đầu khung tên mục + mô tả. Trang Người dùng bỏ `<main
  min-h-svh>` tự dựng (lệch hiện có: trang nằm trong vỏ mà vẫn tự kéo cao cả màn).
- `TrangThai kind="empty|error|notice"`: `empty` → `Empty` có biểu tượng, tiêu đề, mô tả; `error` → `Alert`
  `destructive` có `role="alert"`; `notice` → `Alert` mặc định có `role="status"`. Lỗi thao tác ở Người dùng (bỏ người,
  đổi vai) và «Chỉ quản trị sàn xem được trang này» đổi từ dòng chữ trần sang khối báo; chuông trống và trang tạm dựng
  `TrangThai kind="empty"`.
- `Khung`, `Placeholder`: không đổi bề ngoài.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
### 1. Luồng

- Suôn sẻ: không luồng mới — người đi đúng các màn đã có; điểm khác duy nhất là cách lỗi và báo hiện ra.
- Biên: người không phải quản trị mở `/settings/users` → khối báo «Chỉ quản trị sàn xem được trang này»; chuông chưa có
  thông báo → trạng thái trống.
- Lỗi & quay lại: thao tác ở Người dùng thất bại (bỏ người cuối là quản trị, mời email sai) → khối báo lỗi nói chuyện gì
  xảy ra ngay dưới chỗ bấm, người sửa và bấm lại.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Đăng nhập · Chọn sàn · Chưa gắn sàn | vào được sàn | địa chỉ gốc / nhà mở đầu theo vai |
| Cài đặt sàn → Người dùng | quản người của sàn | cột thứ hai Cài đặt sàn / ở lại |
| Trang tạm (mười nhà, mục) | nói màn này dựng ở mục nào | cột nhà / ở lại |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-nguoi-dung-khong-quyen | Người dùng | khối báo «Chỉ quản trị sàn xem được trang này.» | đổi sàn hay rời mục |
| ST-nguoi-dung-loi | Người dùng | khối báo lỗi đỏ, chữ lỗi từ API như hiện nay | sửa rồi bấm lại |
| ST-chuong-trong | Chuông | trống: «Chưa có thông báo» + một câu | đóng ngăn |
| ST-trang-tam | Mười nhà, mục | trống: «Màn này đang dựng» + mục lộ trình | sang nhà khác |
| ST-dang-nhap-loi | Đăng nhập | lỗi gắn ô mã (giữ `FieldError`) | gõ lại mã |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Khối báo lỗi mang `role="alert"` (trình đọc màn đọc ngay), khối báo thường `role="status"`. Khổ 375px: khung Cài đặt
  sàn chiếm hết bề ngang trong vỏ điện thoại, không thêm lề ngoài.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Frame` (ReUI) | dùng | họ khung của màn vận hành |
| `Empty` (shadcn), `Alert` (ReUI) | ghép thành `TrangThai` | đã cài; vo-va-ia §2 dòng «Trống · lỗi · báo» |
| `Khung`, `Placeholder` | dùng | khuôn đã có, chỉ khai vào bản đồ |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: hàng không thêm màn hay luồng; mỗi mục Cài đặt sàn là một khung trong cột nội dung của vỏ như vo-va-ia §2
(«Mỗi mục một Frame»), chọn thẳng từ danh sách, không cần tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Ngoài phạm vi

Răng theo diff và lint cấm nhập (hàng 59) · ảnh đối chiếu, luật nhóm mới (hàng 60) · khuôn cho nhóm chưa có màn · chuyển
thể `auth-15`, `solution-users-8` · chờ tải và toast.
