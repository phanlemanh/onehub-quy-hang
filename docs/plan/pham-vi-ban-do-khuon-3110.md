# Bản phạm vi — bản đồ khuôn: màn mới sinh ra đã đi qua khuôn (31/10)

Nguồn: trang tri thức của đợt (`docs/tri-thuc/wiki/dot/ban-do-khuon-3110.md`, kèm tài liệu thô chép từ kit). Chủ sản phẩm
31/10: «Tôi muốn thực hiện điều tương tự của crm vào rep onehub-quy-hang. Như một Repo thử nghiệm để báo cáo kết quả cho kit
về kiến trúc bản đồ khuôn cùng các hạng mục dự kiến sẽ thực hiện», rồi «Đồng ý, làm». Việc của người không nằm ở đây —
xem «Ra khỏi kho» ở mô tả PR cắt lượt.

Chủ sản phẩm duyệt bản phạm vi này ngày 31/10: «Duyệt, cắt lượt».

Kho thứ nhất của bản đồ khuôn (crm) thử dạng sửa lệch đã có. Quỹ hàng thử dạng **khai trước khi lệch**. Đo 31/10 trên
nhánh chính (`baea73e`): `docs/design/vo-va-ia.md` §2 đã là bản đồ khuôn bằng lời (màn → archetype → khối ReUI đích →
phủ trọn/vùng); khoảng 15 `page.tsx`, phần lớn là trang tạm; vỏ ứng dụng (hàng 53) đã ký; các màn dày còn trên lộ trình
(bảng hàng 14, hồ sơ căn 17, Hôm nay 22, ô nhận lead 24, cuộc gọi 28).

<!-- <<<PHAM-VI-MA -->
```
dot: ban-do-khuon-3110
dang: chuoi
nguon: wiki/dot/ban-do-khuon-3110.md#9aed72b222ef4c2346957149830a3c21cf259723

- `QK1` — bản đồ khuôn và khuôn có khe cho các nhóm đã có màn: Cài đặt sàn, Xác thực, trang tạm, trạng thái trống · lỗi · báo dùng chung
- `QK2` — màn của một nhóm dựng ngoài khuôn làm bài kiểm của kho đỏ và gọi đúng tên tệp; sửa tài liệu thì im
- `QK3` — mỗi nhóm có màn mẫu chạy được, và bước thiết kế chụp màn mới cạnh màn mẫu cùng khổ, cùng trạng thái
- `QK4` — màn đầu tiên của một nhóm mới (bắt đầu từ Bảng hàng) tạo mục bản đồ và khuôn ngay trong vòng ấy; mỗi vòng giao diện ghi số đo gửi kit
```
<!-- PHAM-VI-MA>>> -->

## Chi tiết cho người cắt lượt và vòng mở sau

- **QK1 — bản đồ và khuôn.**
  - Thư mục `design/patterns/`, mỗi nhóm một tệp. Frontmatter theo finding kit §11.3 (bản chép ở tài liệu thô): `nhom`,
    `doi_tuong`, `khuon` (tên thành phần và đường nhập), `nhan_dien` (glob tệp), `mau_dang_chay` (tệp, đường, trạng thái),
    `khe_bat_buoc`, `cam_ngoai_khuon`, `ngoai_le` (mỗi ngoại lệ một `ly_do`), `luat`. Thân tệp là luật cho người và tác tử.
  - Rút giá trị từ `docs/design/vo-va-ia.md` §2–§4 và quyết định đã có của kho; không nhập bộ luật mặc định viết chung.
  - Chỉ nhóm đã có màn thật: Cài đặt sàn (`settings/**`, archetype Vertical rail settings), Xác thực (`(auth)/**`, Auth
    card; khung chung đã có ở `(auth)/khung.tsx`), trang tạm (`components/shell/placeholder.tsx`), trạng thái trống · lỗi ·
    báo dùng chung (`components/ui/empty.tsx`, `components/ui/sonner.tsx`; khối đích `empty-state-1/2` ở `vo-va-ia.md` §2).
    Nhóm chưa có màn KHÔNG khai ở đây (QK4).
  - Khuôn thiếu chỗ cho nhu cầu của màn thì mở khe trong khuôn, không thoát khuôn.
- **QK2 — răng.**
  - Luật lint cấm nhập theo vùng (lint giao diện của kho, hàng 4): trong thư mục của một nhóm, cấm nhập khối dựng trong
    `cam_ngoai_khuon`, trừ tệp khuôn.
  - Bài quét cho phần lint không phủ: mọi tệp khớp `nhan_dien` dựng khuôn ở gốc; đối tượng khai trong bản đồ mà tệp không
    dựng khuôn thì đỏ.
  - Hai chiều bắt buộc, kèm đối chứng dương: tiêm một trang Cài đặt gọi thẳng khối cấm → đỏ, gọi đúng tên tệp và khối;
    chỉ sửa `docs/` hay `_acceptance/` → im; mọi màn hiện có xanh sau QK1.
  - Ngoại lệ thiếu `ly_do` → đỏ ở bước đọc bản đồ.
- **QK3 — màn mẫu.** Mỗi tệp bản đồ có `mau_dang_chay` chạy được trên `proto_route` của kho; skill `design-pass` chụp màn
  mới cạnh màn mẫu ở Cổng Phạm vi. Người phản ứng lúc rảnh; không thêm lượt gọi người.
- **QK4 — nhóm mới và số đo.**
  - Luật trong `docs/design/vo-va-ia.md` và skill giao diện của kho (`quy-hang-ui`): màn đầu tiên của một archetype chưa có
    trong bản đồ (bắt đầu từ Bảng hàng, hàng 14) tạo mục bản đồ và khuôn ngay trong vòng ấy, theo khối đích ở §2; vòng sau
    của nhóm đi qua khuôn.
  - Mỗi vòng chạm giao diện ghi vào hồ sơ: số tệp theo khuôn, số lần răng khuôn bắt (kể cả bắt lúc dựng), lệch lọt qua
    lưới (chủ sản phẩm thấy khi dùng), cùng năm dòng số của luật kit. Báo một dòng lên kênh liên máy kit (issue #308 của
    acceptance-gate-kit) khi QK1 và QK2 ký, và sau mỗi ba vòng giao diện.

**Thứ tự:** sau đợt `nen-2` (hàng 9–13), trước hàng 14 «Bảng hàng kiểu Sheet». QK1 đứng trên hàng 53 (vỏ ứng dụng) và hàng
4 (bộ chuẩn giao diện). Hàng 14 nên đứng thêm trên QK1 và QK2, để màn dày đầu tiên đã có răng. Không chạy song song với
vòng đang sửa `settings/**` hay `(auth)/**`.

**Đọc lại bối cảnh:** trang tri thức của đợt → tài liệu thô (`kit-finding-…` §0, §7, §10.3, §11, §13; `kit-tri-thuc-…`;
`kit-pham-vi-…` mục chờ KH-C1…KH-C5; `kit-kien-truc-….html`) → `docs/design/vo-va-ia.md` §2–§4.
