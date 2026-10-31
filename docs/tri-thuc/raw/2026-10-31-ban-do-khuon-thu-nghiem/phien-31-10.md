# Phiên 31/10/2026 — Quỹ hàng làm kho thử nghiệm bản đồ khuôn

Phiên điều phối kit trên MacBook Pro (Claude Code), 31/10/2026.

## Lời chủ sản phẩm (nguyên văn)

- «Tôi muốn thực hiện điều tương tự của crm vào rep onehub-quy-hang. Như một Repo thử nghiệm để báo cáo kết quả cho kit về
  kiến trúc bản đồ khuôn cùng các hạng mục dự kiến sẽ thực hiện, bạn thấy thế nào?»
- Sau khi đọc đề xuất: «Đồng ý, làm».

## Đề xuất đã được đồng ý

Bản đồ khuôn (kho giữ giá trị, kit giữ cơ chế) đã được giải ở kit (finding 30/10, chép ở tệp
`kit-finding-ui-dong-nhat-giua-cac-man.md` cùng thư mục). Kho thứ nhất (crm) thử dạng **sửa lệch đã có**: ngăn KR dựng lệch
khỏi ngăn deal. Quỹ hàng thử dạng **khai trước khi lệch**: màn dày chưa dựng, nên chứng được «luật đi trước mã» — màn mới
sinh ra đã đi qua khuôn, và răng chặn được lúc tác tử định đi ra ngoài khuôn.

Đo 31/10 trên nhánh chính Quỹ hàng (`baea73e`):

- `docs/design/vo-va-ia.md` §2 «Bản đồ màn → khối đích» đã là một bản đồ khuôn bằng lời: mỗi màn → archetype → khối ReUI
  đích → phủ trọn hay vùng → đổi khi chuyển thể. §3 liệt chỗ hở phải ghép, §4 liệt khối tránh.
- Khoảng 15 `page.tsx`, phần lớn là trang tạm; vỏ ứng dụng (hàng 53 `vo-ung-dung`) đã ký. Màn dày còn trên lộ trình:
  bảng hàng kiểu sheet (14), cột hồ sơ căn (17), Hôm nay đầu chủ (22), ô nhận lead (24), cuộc gọi khai thác (28).
- Sàn thiết kế bậc M1, lint giao diện có mức nợ, skill giao diện của kho `quy-hang-ui` (hàng 4 `tang-5-giao-dien`).

Rủi ro đã khai và cách chặn:

- Khuôn dựng trước màn dễ sai (trừu tượng hoá sớm) → khuôn của mỗi nhóm sinh ra cùng màn ĐẦU TIÊN của nhóm ấy; vòng đầu
  chỉ khai bản đồ và khuôn cho nhóm đã có màn thật.
- Chen ngang đợt đang chạy → bản phạm vi xếp sau đợt `nen-2` (hàng 9–13) và trước hàng 14; việc xếp do giám sát của kho.
- Đổi thứ tự đã chốt ở kit (crm → kho thứ hai → kit rút): nay crm và Quỹ hàng chạy song song; kit nhận bằng chứng từ
  một trong hai kho cho các mục chờ KH-C1…KH-C5.

Kết quả báo về kit: năm dòng số của luật kit cho mỗi vòng chạm giao diện (giờ máy làm-xong → ký → gộp, lượt gọi người,
token, phút máy), cộng số lần răng khuôn bắt và số lệch lọt qua lưới.
