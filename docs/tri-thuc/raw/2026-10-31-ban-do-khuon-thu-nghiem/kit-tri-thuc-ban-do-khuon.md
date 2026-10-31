---
loai: chu-de
ma: [KH1, KH2, KH3, KH4, KH5]
nguon: [raw/2026-10-30-ban-do-khuon-tai-lieu/2026-10-30-ui-dong-nhat-giua-cac-man.md, raw/2026-10-30-ban-do-khuon-tai-lieu/2026-10-30-ui-dong-nhat-giua-cac-man.html, raw/2026-10-30-ban-do-khuon-tai-lieu/2026-10-30-kien-truc-ban-do-khuon.html, raw/2026-10-30-ban-do-khuon-tai-lieu/2026-10-30-kien-truc-ban-do-khuon.archify.json, raw/2026-10-30-ban-do-khuon-ux-kit/ux-kit.zip, raw/2026-10-30-ban-do-khuon-phien/tt-raw-ban-do-khuon-phien.md, raw/2026-10-30-ban-do-khuon-phien/tt-raw-ban-do-khuon-duyet.md]
cap_nhat: 2026-10-31
---
# Bản đồ khuôn — giữ các màn nhất quán ở mọi kho do tác tử viết mã

Ca gốc: ở một kho tiêu thụ, màn chi tiết của đối tượng mới được dựng lệch khỏi màn chi tiết đã có, dù khung chung đã có
từ trước và tác tử đọc luật thiết kế của kho. Kho thứ hai lệch cùng lớp. Lệch nằm ở khung và trạng thái (chờ tải, rỗng,
lỗi), không ở token.

Nguyên lý: bất định ở giao diện là các điểm chọn không ai giữ — màn này loại gì, khung nào, trạng thái vẽ ra sao. Ở đội
người, designer chọn khuôn trước khi kỹ sư viết; tác tử đi thẳng từ yêu cầu sang mã nên bước đó mất. Tất định hoá là
đẩy từng điểm chọn lên bậc cao nhất của thang: không còn lựa chọn (khung có khe) → sinh sẵn → khai rồi kiểm → đối chiếu
bằng ảnh → gu (người quyết một lần rồi thành luật). Lời dặn không nằm trên thang. Mọi kho phải trả lời cùng bảy câu: loại
màn, khung của loại, trạng thái, đầu trang, cách ghi, phản hồi và hoàn tác, giá trị màu chữ khoảng — kho khác nhau ở câu
trả lời, nên cơ chế chung được.

Cơ chế đề xuất cho kit (chưa dựng, chờ hai kho dùng thử): kho giữ giá trị trong `design/patterns/<nhóm>.md`, khoá theo
đối tượng; kit giữ một lệnh bốn chế độ (đề xuất · nạp ở S1 · kiểm ở S4 · gợi ý lint), một tệp kết quả lượt chấm mà thẻ
cổng chỉ đọc, và bước chụp màn mới cạnh màn mẫu trong design-pass. Răng rẻ trước: khe bắt buộc qua kiểu → lint cấm nhập
theo vùng → bài quét. Trục riêng, chạy cả ở bậc M0; không thêm khoá cấu hình; không thêm cổng người — chỉ một chạm khi
vòng mang đối tượng mới. Tiền lệ: luật sản phẩm của kho (ADR 0024). Thư mục `design/patterns/` cũng là chỗ thang dùng lại
của Design OS nhận «mẫu màn».

Design OS chẩn đúng bệnh và có nguyên liệu (thang dùng lại, học quy ước, so ảnh, sổ thành phần) nhưng chỉ kiểm ý định,
chưa kiểm mã đã dựng theo khuôn. Các đội lớn giữ nhất quán bằng bốn chân: một nguồn có khuôn trang, đường lát sẵn, lint
trong CI đo độ phủ, quản trị đóng góp; chân thứ năm ẩn là người chọn khuôn — chỗ máy phải thay khi tác tử viết mã.

Từ một gói skill brainstorm cùng câu hỏi: lấy khoá theo đối tượng, khe bắt buộc qua kiểu, cấm nhập theo vùng, mã cho
từng luật, nguyên tắc có thứ tự, token hành vi, kiểm lúc sửa, luật đi trước mã. Không lấy bộ luật mặc định viết chung
(va quyết định đã ký của kho), dừng-chờ-duyệt giữa vòng, danh sách tự rà làm bằng chứng, hook grep trên mọi tệp, và dựng
lớp thành phần song song khi kho đã có.

Thứ tự đã chốt: kho thứ nhất chạy thử như việc của kho → kho thứ hai khai cùng hình dạng để đo → kit rút cơ chế ở một
vòng meta có tên, sau mốc kho nhận; phần CỘNG chủ kho phê. Hạt giống phía kit chỉ mở khi hồ sơ vòng thử đã ký.

Liên quan: `wiki/chu-de/design-floor.md` — trục token M0–M3 của nền thiết kế. Bản đồ khuôn là trục riêng, chạy cả ở M0;
nó dùng chung nguyên liệu Design OS với hàng chờ DFK-C1 (bộ đọc JSX) và DFK-C3 (sổ thành phần từ mã), và chế độ đề xuất
lúc khởi tạo gắn vào DFK1. Phần riêng của kho thứ nhất (tệp, màn, chữ duyệt) ở kho tri thức riêng của kho ấy, trang
`wiki/chu-de/ban-do-khuon.md`. Mã KH1–KH5 là các mục chờ điều kiện của đợt `ban-do-khuon-kit-3110` trong lộ trình kit.
