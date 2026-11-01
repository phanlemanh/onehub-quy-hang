---
paths:
  - "docs/superpowers/specs/**"
---

# Luật bản thiết kế: đối chiếu ngành trước khi viết cứng

ADR-0022 (đề xuất 01/11). Gốc: hai lần dựng cứng theo câu giao trong một ngày — chủ nhà và lead thành hai bản ghi (vá ở
hàng 85, ADR-0021), năm hàng đợi của Hôm nay viết chết trong mã (bắt ở Cổng Phạm vi hàng 22). Phần mềm cùng ngành để sàn
tự định nghĩa cả hai.

- **Câu giao là điểm sàn, không phải trần.** Câu giao và Tham chiếu nói tối thiểu phải có gì. Trước khi chốt, hỏi: sàn
  thứ hai làm khác thì sao?
- **Danh sách cố định trong câu giao mặc định là dữ liệu của sàn**, gồm nhóm, bước, nấc, hàng đợi, câu hỏi, lý do, mẫu
  và luật. Sản phẩm dựng sẵn bộ mặc định, sàn ghi đè theo ba bậc của ADR-0018 (tham số → chọn trong thực đơn → bảng quyết
  định khi có số đo). Danh sách sàn tự đặt được dựng từ tập điều kiện đóng của lõi; không đối tượng tự tạo, không công
  thức, không kịch bản.
- **Giữ cứng phải có một trong bốn lý do**: bất biến; nghĩa chuẩn để so giữa các sàn (khi đó sàn thêm nhãn neo vào giá trị
  chuẩn, như RESO `StandardStatus` ↔ `MlsStatus`); quyền và an toàn; nền tảng. Mỗi chỗ giữ cứng thành một dòng «điều
  khoá» ở [Sổ điểm biến thiên](../../docs/architecture/so-diem-bien-thien.md), có ghi lý do.
- **Nghĩa do lõi giữ; tên gọi và tập con là dữ liệu của sàn.** Mỗi tập đóng mới khai mức sàn được chạm: Khoá · Đổi tên ·
  Thêm nhãn neo · Thêm định nghĩa. Nhãn hiển thị không viết thành bảng trong màn. Đọc từ sổ từ vựng (ADR-0023, hàng 90);
  tới khi có sổ thì đặt nhãn mặc định ở một chỗ có tên trong `packages/core`.
- **Một người là một liên hệ** (RESO `Contacts`, ADR-0021). Chủ nhà, khách, người mua hay người thuê đều là loại của liên
  hệ, không phải bảng riêng.
- **Bản thiết kế có bảng đối chiếu** với các cột: năng lực hoặc đối tượng · RESO · ít nhất **hai** sản phẩm có tên, lấy
  từ [Đối chiếu ngành](../../docs/product/doi-chieu-nganh.md) · ta định làm gì · **«ta viết cứng — họ cho cấu hình»**. Mỗi
  khẳng định về sản phẩm khác kèm đường dẫn nguồn; chỗ chưa tra được thì ghi «chưa kiểm».
- **Mỗi dòng «ta cứng — họ cấu hình» thành một Hỏi ở Cổng Phạm vi**: giữ cứng (nêu lý do nào trong bốn lý do) hay làm dữ
  liệu của sàn. Máy khuyến nghị, người chọn. Không tự chọn giữ cứng.
- Tra được điều mới về sản phẩm khác thì thêm vào trang Đối chiếu ngành trong cùng PR.
