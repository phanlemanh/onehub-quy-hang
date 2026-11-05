---
nhom: xac-thuc
doi_tuong: [dang-nhap, dat-mat-khau, chon-san, chua-gan-san]
khuon: { ten: Khung, nhap: "@/app/(auth)/khung" }
nhan_dien: ["apps/web/src/app/(auth)/*/page.tsx"]
mau_dang_chay: { tep: "apps/web/src/app/(auth)/login/page.tsx", duong: "/login", trang_thai: [mac-dinh, loi] }
khe_bat_buoc: [title, children]
cam_ngoai_khuon: [Frame, FrameHeader, FramePanel, Card]
ngoai_le: []
luat: [KH-xt-khong-vo, KH-xt-loi-gan-o]
---
# Xác thực

Màn đưa người vào được một sàn: đăng nhập (bằng mã 6 số hay mật khẩu), «Đặt mật khẩu mới» sau khi đăng nhập bằng mật
khẩu tạm (hàng dang-nhap-mat-khau), chọn sàn khi thuộc nhiều sàn, báo chưa gắn sàn. Mỗi màn là một `page.tsx`
dưới `apps/web/src/app/(auth)/` và trả `<Khung title="…">…</Khung>` ở gốc.

**Dùng khi** màn đứng trước lúc người có sàn đang làm — người chưa đăng nhập, hay đã đăng nhập mà chưa chọn được sàn.
**Không dùng** cho màn nào nằm trong vỏ (đã có sàn): trang «Tôi», đổi sàn trong ứng dụng, hồ sơ cá nhân đi khuôn của nhóm
mình. Trang khách `/s/<mã>` không có vỏ nhưng cũng không thuộc nhóm này — nó đi họ thẻ (card).

Khuôn là khối `@reui/auth-15` chuyển thể vào chính `Khung` (hàng 93): dấu hiệu Quỹ hàng trên đầu, một cột hẹp giữa trang
với tiêu đề lớn, chân điều khoản ở đáy; không nút đăng nhập bằng dịch vụ khác (ADR-0005). Màn của nhóm chỉ điền `title`,
`description` và phần thân.

## Luật

- **KH-xt-khong-vo** — Màn xác thực không có vỏ: không cột nhà, không thanh trên; chỉ một cột hẹp giữa trang do `Khung`
  dựng, nên không dựng `Frame` hay `Card` trực tiếp trong trang.
- **KH-xt-loi-gan-o** — Lỗi do người gõ (mã sai, email sai dạng) gắn dưới đúng ô bằng `FieldError`; lỗi không gắn ô nào
  đi khuôn `trang-thai`.
