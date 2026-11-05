---
nhom: trang-tam
doi_tuong: [nha-chua-co-man, muc-chua-co-man]
khuon: { ten: Placeholder, nhap: "@/components/shell/placeholder" }
nhan_dien: ["apps/web/src/app/(app)/**/page.tsx"]
mau_dang_chay: { tep: "apps/web/src/app/(app)/team/page.tsx", duong: "/team", trang_thai: [mac-dinh] }
khe_bat_buoc: [path]
cam_ngoai_khuon: [Frame, Empty, EmptyHeader, Card]
ngoai_le: [{ tep: "apps/web/src/app/(app)/contacts/page.tsx", ly_do: "Màn thật Liên hệ (hàng 103) — thuộc nhóm lien-he." }, { tep: "apps/web/src/app/(app)/settings/page.tsx", ly_do: "Cài đặt sàn vào vỏ (hàng 91) — thuộc nhóm cai-dat-san, chỉ chuyển hướng sang Người dùng." }, { tep: "apps/web/src/app/(app)/settings/users/page.tsx", ly_do: "Màn thật Người dùng (hàng 7, hàng 91) — thuộc nhóm cai-dat-san." }, { tep: "apps/web/src/app/(app)/settings/[section]/page.tsx", ly_do: "Trang mục của khu Cài đặt (hàng cai-dat-hop-nhat): đoạn «personal» dựng CaNhan (nhóm toi), mục sàn chưa dựng dựng Placeholder — trả hai gốc theo đoạn đường; thuộc nhóm cai-dat-san." }, { tep: "apps/web/src/app/(app)/proto/hom-nay-dau-chu/page.tsx", ly_do: "Trang ba lối của Hôm nay của đầu chủ (hàng 22, ADR-0019) — thuộc nhóm hom-nay-dau-chu, gỡ khi màn thật qua Cổng Bằng chứng." }, { tep: "apps/web/src/app/(app)/leads/mine/page.tsx", ly_do: "Màn thật Lead đã nhập (hàng 27) — thuộc nhóm lead-cua-toi." }, { tep: "apps/web/src/app/(app)/today/page.tsx", ly_do: "Màn thật Hôm nay theo vai (hàng 22, 42) — thuộc nhóm hom-nay-dau-chu; vai không Trưởng nhóm, không Đầu chủ, không telesales thấy Placeholder trong KhungHomNay." }, { tep: "apps/web/src/app/(app)/proto/nhanh-tuc-thi/page.tsx", ly_do: "Trang thử ẩn của bộ đồng bộ (hàng 13, Hỏi-3): không có lối vào trong điều hướng, đo vế mất mạng trên thiết bị; gỡ khi Bảng hàng thật ra (hàng 14)." }, { tep: "apps/web/src/app/(app)/inventory/page.tsx", ly_do: "Màn thật của nhóm bang-hang (hàng 14) — rời trang tạm theo KH-tt-roi-nhom." }, { tep: "apps/web/src/app/(app)/inventory/views/[id]/page.tsx", ly_do: "Góc nhìn đã lưu, nhóm bang-hang (hàng 14)." }, { tep: "apps/web/src/app/(app)/leads/new/page.tsx", ly_do: "Màn thật Ô nhận lead (hàng 24) — thuộc nhóm o-nhan-lead." }, { tep: "apps/web/src/app/(app)/proto/cot-ho-so-can/page.tsx", ly_do: "Trang ba lối của Hồ sơ căn (hàng 17, ADR-0019) — thuộc nhóm ho-so-can." }, { tep: "apps/web/src/app/(app)/units/[code]/page.tsx", ly_do: "Màn thật Hồ sơ căn toàn màn (hàng 17) — thuộc nhóm ho-so-can." }, { tep: "apps/web/src/app/(app)/proto/anh-can-ba-ngan/page.tsx", ly_do: "Trang bấm được của mục Ảnh (hàng 18) — thuộc nhóm ho-so-can." }, { tep: "apps/web/src/app/(app)/units/call/page.tsx", ly_do: "Màn thật Chế độ cuộc gọi khai thác (hàng 28) — thuộc nhóm cuoc-goi." }, { tep: "apps/web/src/app/(app)/units/call/dial/page.tsx", ly_do: "Trang quay số trên điện thoại (hàng 30) — thuộc nhóm cuoc-goi." }, { tep: "apps/web/src/app/(app)/me/page.tsx", ly_do: "Màn thật tab Tôi (hàng 38) — thuộc nhóm toi." }, { tep: "apps/web/src/app/(app)/shares/new/page.tsx", ly_do: "Màn thật Gửi (hàng 34) — thuộc nhóm gui, rời trang tạm theo KH-tt-roi-nhom." }, { tep: "apps/web/src/app/(app)/imports/new/page.tsx", ly_do: "Màn thật Nhập Excel (hàng man-nhap-excel) — thuộc nhóm nhap-excel." }, { tep: "apps/web/src/app/(app)/shares/page.tsx", ly_do: "Màn thật Đã gửi (hàng 36) — thuộc nhóm da-gui, rời trang tạm theo KH-tt-roi-nhom." }]
luat: [KH-tt-noi-muc, KH-tt-roi-nhom]
bo_cuc: doc
---
# Trang tạm

Nhà hay mục đã có địa chỉ trong vỏ mà chưa có màn: trang trả `<Placeholder path="…" />` ở gốc. Chữ của từng địa chỉ
(tên, câu hỏi của màn, mục lộ trình dựng nó) nằm trong bảng `PLACEHOLDER` của khuôn, không viết ở trang.

**Dùng khi** địa chỉ phải tồn tại để vỏ và điều hướng chạy được, còn màn thật xếp ở một mục lộ trình sau.
**Không dùng** để che một màn dựng dở: màn đã có dữ liệu thật thì rời nhóm này.

`nhan_dien` cố ý phủ mọi `page.tsx` dưới `(app)`: màn thật đầu tiên dựng ở đó làm bộ kiểm đỏ cho tới khi nó rời nhóm.

## Luật

- **KH-tt-noi-muc** — Trang tạm nói màn dựng ở mục nào của lộ trình (`docs/plan/lo-trinh.json`, trường `ma`); địa chỉ
  chưa xếp mục thì nói «Chưa xếp mục nào trong lộ trình».
- **KH-tt-roi-nhom** — Dựng màn thật ở một địa chỉ của nhóm thì cùng PR đó đưa tệp ra khỏi `nhan_dien`, thêm mục bản đồ
  của nhóm màn ấy (màn đầu của nhóm mới tạo mục và khuôn — `docs/design/vo-va-ia.md` §2 «Nhóm mới»; tệp rời nhóm mà
  chưa có mục thì bài quét báo «màn ngoài bản đồ»), và bỏ dòng của nó trong bảng `PLACEHOLDER`.
