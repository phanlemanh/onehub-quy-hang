---
nhom: toi
doi_tuong: [tai-khoan, may-dang-nhap]
khuon: { ten: KhungToi, nhap: "@/app/(app)/me/khung" }
nhan_dien: ["apps/web/src/app/(app)/me/page.tsx", "apps/web/src/app/(app)/settings/personal/ca-nhan.tsx"]
mau_dang_chay: { tep: "apps/web/src/app/(app)/settings/personal/ca-nhan.tsx", duong: "/settings/personal", trang_thai: [mac-dinh, mot-may, dang-doc, loi, da-bao] }
khe_bat_buoc: [children]
cam_ngoai_khuon: [Card]
ngoai_le: [{ tep: "apps/web/src/app/(app)/me/page.tsx", ly_do: "Địa chỉ cũ của tab Tôi chỉ chuyển về /settings/personal (hàng cai-dat-hop-nhat), không dựng màn nào." }]
luat: [KH-toi-sau-nhom, KH-toi-bao-mat-hoi]
bo_cuc: doc
---
# Tôi

Mục «Cá nhân» của khu Cài đặt (hàng 38, hàng cai-dat-hop-nhat): tab «Tôi» trên điện thoại, «Cá nhân» trong menu tài
khoản và trong cột mục lục Cài đặt trên máy tính cùng mở `/settings/personal`: trang `settings/[section]/page.tsx` dựng `CaNhan`
(`settings/personal/ca-nhan.tsx`), thành phần trả `<KhungToi>…</KhungToi>` ở gốc (đường dẫn «Cài đặt › Cá nhân», câu phạm vi «Áp cho tài khoản của bạn ở mọi sàn»), thân
là các nhóm dòng dựng bởi `ManToi`. Địa chỉ cũ `/me` chỉ chuyển về đây.

**Dùng khi** màn trình tài khoản của chính người đang đăng nhập: hồ sơ, sàn đang làm, cài lên màn hình chính, thông báo
trên máy này, máy đang đăng nhập, đăng xuất.
**Không dùng** cho cấu hình của sàn (nhóm `cai-dat-san`) hay màn vận hành.

## Luật

- **KH-toi-sau-nhom** — Sáu nhóm dòng, cùng thứ tự cho mọi vai và mọi thiết bị (`nhomDong` ở `me/toi.ts`): hồ sơ · sàn ·
  cài · thông báo · máy · đăng xuất. Thêm nhóm là sửa hàm ấy và bài kiểm của nó, không chèn ở trang.
- **KH-toi-bao-mat-hoi** — «Báo mất máy» luôn qua hộp hỏi `AlertDialog` kiểu nguy hiểm, nói rõ đăng xuất mọi máy khác và
  xoá dữ liệu trên các máy ấy; chỉ hiện khi có từ hai máy.
