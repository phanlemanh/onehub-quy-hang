---
nhom: toi
doi_tuong: [tai-khoan, may-dang-nhap]
khuon: { ten: KhungToi, nhap: "@/app/(app)/me/khung" }
nhan_dien: ["apps/web/src/app/(app)/me/page.tsx"]
mau_dang_chay: { tep: "apps/web/src/app/(app)/me/page.tsx", duong: "/me", trang_thai: [mac-dinh, mot-may, dang-doc, loi, da-bao] }
khe_bat_buoc: [children]
cam_ngoai_khuon: [Card]
ngoai_le: []
luat: [KH-toi-sau-nhom, KH-toi-bao-mat-hoi]
bo_cuc: doc
---
# Tôi

Tab «Tôi» trên điện thoại, «Tôi» trong menu tài khoản trên máy tính (hàng 38): trang `apps/web/src/app/(app)/me/page.tsx`
trả `<KhungToi>…</KhungToi>` ở gốc, thân là các nhóm dòng dựng bởi `ManToi`.

**Dùng khi** màn trình tài khoản của chính người đang đăng nhập: hồ sơ, sàn đang làm, cài lên màn hình chính, thông báo
trên máy này, máy đang đăng nhập, đăng xuất.
**Không dùng** cho cấu hình của sàn (nhóm `cai-dat-san`) hay màn vận hành.

## Luật

- **KH-toi-sau-nhom** — Sáu nhóm dòng, cùng thứ tự cho mọi vai và mọi thiết bị (`nhomDong` ở `me/toi.ts`): hồ sơ · sàn ·
  cài · thông báo · máy · đăng xuất. Thêm nhóm là sửa hàm ấy và bài kiểm của nó, không chèn ở trang.
- **KH-toi-bao-mat-hoi** — «Báo mất máy» luôn qua hộp hỏi `AlertDialog` kiểu nguy hiểm, nói rõ đăng xuất mọi máy khác và
  xoá dữ liệu trên các máy ấy; chỉ hiện khi có từ hai máy.
