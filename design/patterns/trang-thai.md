---
nhom: trang-thai
doi_tuong: [trong, loi, bao]
khuon: { ten: TrangThai, nhap: "@/components/trang-thai" }
nhan_dien: ["apps/web/src/app/**/*.tsx", "apps/web/src/components/shell/*.tsx"]
mau_dang_chay: { tep: "apps/web/src/components/shell/notifications.tsx", duong: "/today (mở chuông)", trang_thai: [trong] }
khe_bat_buoc: [kind, title]
cam_ngoai_khuon: [Empty, EmptyHeader, Alert, AlertTitle]
ngoai_le: []
luat: [KH-ts-mot-khuon, KH-ts-loi-gan-o, KH-ts-chua-co-kieu]
don_vi: phan-tu
---
# Trạng thái trống · lỗi · báo

Không phải một màn mà là một CHỖ trong màn: vùng chưa có gì, thao tác hay lần tải thất bại, điều người cần biết. Mọi chỗ
như vậy trong màn của vỏ và màn xác thực dựng `<TrangThai kind="empty|error|notice" title="…" />`.

- `empty` — vùng chưa có gì; kèm biểu tượng lucide nhỏ và một câu nói khi nào sẽ có.
- `error` — thao tác hay lần tải thất bại; khối báo đỏ, `role="alert"`, chữ nói chuyện gì xảy ra. Lần đọc của một vùng
  thất bại thì dùng `BaoLoiVung` (cùng tệp, dựng trên `TrangThai`): đúng một «Thử lại» cạnh câu, không tự ghép nút.
- `notice` — điều người cần biết mà không phải lỗi (không đủ quyền, đã xong); khối báo thường, `role="status"`.

**Dùng khi** chỗ ấy không gắn với một ô nhập cụ thể. **Không dùng** cho lỗi của một ô (dùng `FieldError` dưới ô đó),
cho hộp xác nhận (`AlertDialog`), hay cho trạng thái của vỏ (chấm chưa đọc trên chuông…).

Khuôn ghép `Empty` và `Alert` đã cài; khối đích `empty-state-*` ở `docs/design/vo-va-ia.md` §2 là khối Pro — có khoá
ReUI thì chuyển thể vào chính `TrangThai`, mọi chỗ đổi theo. Đơn vị kiểm là phần tử (`don_vi: phan-tu`): trong tệp khớp
`nhan_dien`, mỗi `<TrangThai>` phải đủ khe; `Empty`, `Alert` dùng thẳng hay thẻ HTML trần mang `role="alert"` /
`role="status"` là lệch.

## Luật

- **KH-ts-mot-khuon** — Trống, lỗi và báo của mọi màn đi qua `TrangThai`; không vẽ bằng dòng chữ đỏ trần, không gọi
  thẳng `Empty` hay `Alert`.
- **KH-ts-loi-gan-o** — Lỗi gắn một ô nhập thuộc ô ấy (`FieldError` dưới ô), không thuộc nhóm này.
- **KH-ts-chua-co-kieu** — Chờ tải và toast chưa có trong khuôn vì chưa màn nào dùng; màn đầu tiên cần chúng thêm kiểu vào
  `TrangThai` (hay mục bản đồ mới) trong cùng PR, không dựng tay tại chỗ.

Giới hạn đã khai: dòng chữ trần không mang `role` và không dùng khối cấm thì bộ kiểm không thấy.
