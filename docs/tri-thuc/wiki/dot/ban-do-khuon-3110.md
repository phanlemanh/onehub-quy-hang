---
loai: dot
ma: [QK1, QK2, QK3, QK4]
nguon: [raw/2026-10-31-ban-do-khuon-thu-nghiem/phien-31-10.md, raw/2026-10-31-ban-do-khuon-thu-nghiem/kit-finding-ui-dong-nhat-giua-cac-man.md, raw/2026-10-31-ban-do-khuon-thu-nghiem/kit-tri-thuc-ban-do-khuon.md, raw/2026-10-31-ban-do-khuon-thu-nghiem/kit-pham-vi-ban-do-khuon-kit-3110.md, raw/2026-10-31-ban-do-khuon-thu-nghiem/kit-kien-truc-ban-do-khuon.html]
cap_nhat: 2026-10-31
---
# Đợt ban-do-khuon-3110 — Quỹ hàng thử bản đồ khuôn

Quỹ hàng là kho thử nghiệm thứ hai của bản đồ khuôn, chạy song song kho thứ nhất. Kho thứ nhất thử dạng sửa lệch đã có;
Quỹ hàng thử dạng **khai trước khi lệch**: các màn dày (bảng hàng, hồ sơ căn, Hôm nay, ô nhận lead, cuộc gọi) chưa dựng,
nên đo được việc màn mới sinh ra đã đi qua khuôn, và răng chặn được lúc tác tử định đi ra ngoài khuôn. Chủ sản phẩm đồng
ý 31/10.

## Điều rút ra

- Bất định ở giao diện là các điểm chọn không ai giữ — màn này loại gì, khung nào, trạng thái vẽ ra sao. Lời dặn không
  giữ được; phải đẩy điểm chọn lên vật máy giữ: khe bắt buộc qua kiểu → lint cấm nhập theo vùng → bài quét → ảnh đối chiếu.
- Kho giữ giá trị, kit giữ cơ chế: mỗi nhóm màn một tệp `design/patterns/<nhóm>.md`, xếp theo ĐỐI TƯỢNG màn trình bày,
  khai khuôn, màn mẫu, khe bắt buộc, khối cấm ngoài khuôn, ngoại lệ có lý do. Hình dạng frontmatter theo finding kit
  §11.3 — giữ đúng vì kit sẽ rút lược đồ từ tệp của hai kho thử.
- Quỹ hàng đã có bản đồ khuôn bằng lời: `docs/design/vo-va-ia.md` §2 (màn → archetype → khối ReUI đích → phủ), §3 (chỗ
  hở phải ghép), §4 (khối tránh). Thử nghiệm biến bảng ấy thành tệp bản đồ kèm răng; `vo-va-ia.md` giữ lời giải thích.
- Khuôn của một nhóm sinh ra cùng màn ĐẦU TIÊN của nhóm (không dựng khuôn trước màn); vòng đầu chỉ khai bản đồ và khuôn
  cho nhóm đã có màn thật.
- Răng có hai chiều: đỏ khi tiêm một màn của nhóm dựng ngoài khuôn (gọi đúng tên tệp và khối cấm); im khi chỉ sửa
  `docs/`, `_acceptance/` hay tệp ngoài mọi nhóm; đối chứng dương: mọi màn hiện có xanh.
- Kết quả về kit: năm dòng số của luật kit cho mỗi vòng chạm giao diện, cộng số lần răng khuôn bắt và số lệch lọt qua lưới.
  Kit đếm các con số ấy cho điều kiện mở các mục chờ KH-C1…KH-C5 (đợt `ban-do-khuon-kit-3110` của kit).

## Mã

- QK1 — bản đồ khuôn và khuôn có khe cho các nhóm đã có màn
- QK2 — răng giữ khuôn: lint cấm nhập theo vùng và bài quét hai chiều
- QK3 — màn mẫu cho mỗi nhóm và ảnh màn mới cạnh màn mẫu ở bước thiết kế
- QK4 — màn đầu của nhóm mới tạo mục bản đồ cùng vòng; số đo mỗi vòng giao diện gửi về kit
