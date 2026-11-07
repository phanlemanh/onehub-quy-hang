# Thiết kế — Ô lạ còn lại có đề xuất của máy (hàng 69, ND6)

Ngày: 2026-11-06 · Hạng: T2 · Dựng trên: hàng 68 (tác tử lập kế hoạch nhập, `_acceptance/nhap-tac-tu-ke-hoach/`), hàng
65–67 (màn Nhập Excel, nhớ mẫu) · Gốc quyết định: ADR-0011 qđ 1, 2, 3, 10; Kiến trúc «Nhập dữ liệu» §5 mục «Ô lạ còn lại».

## Vấn đề

Sau khi áp kế hoạch (tất định, nhớ mẫu, hay đề xuất cột của hàng 68), màn Xem trước còn những ô bộ chuẩn hoá không đọc
được và để dấu «Cần người»: giá dải «4.6–4.8 tỷ», giá về tay «thu về 4.2», điều kiện phí «thu về», trạng thái lạ «đang đàm
phán», «giữ chỗ». Hôm nay đầu chủ phải tự gõ lại từng ô. Kiến trúc §5 định: ô không đọc được của cột thuộc lớp được mở
(≤ 300 ô) gửi một lần, mỗi ô kèm lý do mã từ chối; tác tử trả đề xuất từng ô, hiện là «máy đề xuất», người chọn.

## Hướng chọn

**Tác tử đề xuất chữ thay thế cho ô; mã kiểm và áp bằng đúng đường sửa tay.**

1. **Gói ô lạ** (lõi, `packages/core/src/import/ai/o-la/`): dựng từ kết quả áp kế hoạch trên trình duyệt. Chỉ ô có dấu
   `needs_person` do bộ chuẩn hoá quyết (`by: "normalize"`), ở cột lớp `catalog`/`shareable_listing` đã ghép vào một trường
   chuẩn cùng lớp. Gộp theo (cột, chữ nguyên văn) — mười dòng cùng ghi «đang đàm phán» là một ô của gói. Trần 300 ô. Mỗi ô:
   `{id, cot, tieuDe, truong, giaTri, lyDoMa}` — `lyDoMa` là lý do mã từ chối (đã có trên màn). Ô có giá trị trúng bộ dò dữ
   liệu cá nhân (`detectPersonal`, dáng họ tên) không vào gói. Cột nguồn, tên người, ghi chú, chưa rõ không bao giờ vào gói
   (cùng luật lớp `LOP_COT` của hàng 68).
2. **Máy chủ** (`packages/api/src/imports/ai/cells/`): POST `/api/v1/imports/ai/cells`, đi cùng các cửa của
   `/api/v1/imports/ai/plan` theo đúng thứ tự — phiên, khuôn chặt của gói (khoá lạ, ô của trường lớp nguồn bị từ chối), vai
   nhập, thoả thuận `ai_processing` đang hiệu lực và mở lớp của mọi ô, khoá, trần chi phí tháng chung với đề xuất cột, quét
   lại (trúng → không gửi, ghi `blocked_pii`), gọi Claude dưới 240 giây, kiểm đầu ra. Mọi lối hỏng trả 200
   `{cheDo: "tat-dinh", lyDo}`; mỗi lần gọi một dòng `ai_usage` (không đổi khuôn bảng — cùng năm giá trị `result`).
3. **Đầu ra của tác tử**: `{de_xuat: [{id, gia_tri, ly_do}]}` — `gia_tri` là chữ thay thế mà đầu chủ lẽ ra gõ («4,8 tỷ»,
   «4,2 tỷ KBP», «Đang giao dịch»). Ô tác tử không chắc thì bỏ, không bịa (ô «thương lượng» không có số → không đề xuất).
4. **Kiểm nghĩa ở lõi** (`kiemDeXuatOLa`), mỗi đề xuất sai chỉ bỏ đề xuất ấy:
   - `id` có trong gói, không lặp; `ly_do` không rỗng;
   - `gia_tri` qua `normalizeValue` của đúng trường và phép biến đổi của cột ra «giữ nguyên» hay «máy sửa» — không ra «cần
     người», «chặn»;
   - **giá dải**: giá đọc được nằm trong [cận dưới, cận trên] của dải (đọc cận bằng cùng bộ đọc giá, cận thiếu đơn vị mượn
     đơn vị của cận kia);
   - **giá về tay** («thu về X»): hoặc đúng X kèm «chưa gồm phí» (luật 12: giá không bao phí là giá về tay), hoặc đúng
     `giaBaoPhiTuVeTay(X)` kèm «bao phí» theo tỉ lệ mặc định của sàn (`pricing/ve-tay.ts`) — số khác là sai;
   - trạng thái, điều kiện phí: ra đúng một giá trị chuẩn (bộ chuẩn hoá bảo đảm).
5. **Màn** (bước Xem trước, `apps/web/src/app/(app)/imports/new/`, khuôn `KhungNhap`): khi sàn bật «Xử lý bằng AI» và bước
   Xem trước có ô lạ trong phạm vi, màn tự gửi gói (không thêm nút); kết quả nhớ theo băm gói, nên qua lại Ghép cột – Xem
   trước không gửi lại gói đã gửi trong lần nhập. Ô có đề xuất qua kiểm hiện dưới ô
   nhập: huy hiệu «Máy đề xuất» (`info-light`, như hàng 68), chữ đề xuất, lý do một dòng, nút «Dùng». Một chạm «Dùng» =
   `suaO(…, gia_tri)` — đúng đường người gõ tay: ô thành «giữ nguyên» hay «máy sửa», luật «ô cùng chữ đổi theo» của hàng 67
   áp như khi gõ (trạng thái, điều kiện phí). Gõ tay khác đề xuất → chữ của người thắng, đề xuất của ô ấy tắt. Không chạm →
   ô vẫn «Cần người», máy chủ nhận chữ gốc như hôm nay. Không có lối «Dùng mọi đề xuất» ở hàng này.
   Sàn tắt AI, hết trần, thiếu khoá, lỗi, quá giờ → không đề xuất, một dòng `TrangThai` «Sửa tay lần này: <lý do>» trên bảng
   xem trước; nhập như không AI.
6. **Mô hình**: theo ADR-0011 qđ 3 — Opus 5.5 như đề xuất cột (Hỏi-1, khuyến nghị); Haiku 5.5 chỉ thay khi bộ thử cho
   thấy giữ được ngưỡng, và vì số của hàng này là mô phỏng, việc hạ chờ số qua API ở phiên nghiệm thu. Bộ đo chạy cả hai: đề xuất ghi sẵn do tác tử context sạch lập trên đúng gói và lời nhắc của mã — một bộ do tác tử
   chạy Opus 5.5, một bộ do tác tử chạy Haiku 5.5 — rồi mã chấm theo đáp án. Số của bộ Haiku in cạnh; hằng mô hình của
   đường ô lạ là Opus 5.5 tới khi phiên nghiệm thu có số qua API.

## Bộ ô lạ có đáp án

`_acceptance/nhap-o-la/thu/bo-o-la.ts`: một bảng sinh tất định, chữ ô do tay viết theo ba nhóm của câu giao cộng một nhóm
đối chứng — giá dải (các kiểu «4.6–4.8 tỷ», «4,6 - 4,8», «4.6 đến 4.8 tỷ», «4600~4800tr»), giá và phí về tay («thu về 4.2»,
«chủ thu về 3,95 tỷ», «về tay 5 tỷ»), trạng thái lạ («đang đàm phán», «giữ chỗ», «hết hàng», «còn trống»…), và ô không có
đáp án đúng nào ngoài «không đề xuất» («thương lượng», «liên hệ»). Mỗi ô một đáp án máy đọc: dải → khoảng chấp nhận; về tay →
hai cặp (giá, phí) chấp nhận; trạng thái → tập giá trị chuẩn chấp nhận; đối chứng → không đề xuất.

Số đo (`thu/do-o-la.ts`), mỗi mô hình một bộ:

| Số | Định nghĩa | Ngưỡng |
| --- | --- | --- |
| Phủ | ô có đáp án mà có đề xuất qua kiểm / ô có đáp án | ≥ 90% |
| Đúng | đề xuất qua kiểm khớp đáp án / đề xuất qua kiểm | ≥ 95% |
| Bịa | đề xuất qua kiểm ở ô đối chứng | 0 |
| Tự ghi | ô đổi giá trị khi người chưa chạm | 0 |
| Rò nguồn | chuỗi cấm của bộ thử trong gói | 0 |

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: bước Xem trước của Nhập Excel → máy tự gửi ô lạ một lần → ô «Cần người» hiện «Máy đề xuất» kèm lý do → đầu chủ
  bấm «Dùng» → ô thành «Giữ nguyên» hay «Máy sửa» (điểm ra: Tiếp sang bước Trùng như hôm nay).
- Biên: không ô lạ trong phạm vi → không gọi, không dòng nào; ô lạ vượt 300 → gửi 300 ô đầu theo thứ tự cột, dòng; đề xuất
  bị mã loại → ô ấy không có đề xuất, vẫn sửa tay được.
- Lỗi & quay lại: sàn tắt AI · hết trần · thiếu khoá · lỗi · quá giờ → một dòng «Sửa tay lần này: <lý do>», lưới sửa tay như
  hôm nay; người đổi kế hoạch (quay lại Ghép cột) → đề xuất của cột đổi đích bị bỏ, vào lại Xem trước thì hỏi lại.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Nhập Excel — bước Xem trước | sửa các ô máy chưa đọc được trước khi ghi | từ Ghép cột / tới Trùng |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-xem-truoc-cho-de-xuat | Xem trước | một dòng `TrangThai` nhỏ «Máy đang xem các ô cần người…»; lưới vẫn sửa được | sửa tay hay chờ |
| ST-xem-truoc-co-de-xuat | Xem trước | dưới ô nhập: huy hiệu «Máy đề xuất», chữ đề xuất, lý do một dòng, nút «Dùng» | bấm «Dùng» hay gõ tay |
| ST-xem-truoc-da-dung | Xem trước | ô về dấu «Giữ nguyên»/«Máy sửa», đề xuất tắt; ô cùng chữ đổi theo kèm dòng «Đã đổi theo n ô cùng chữ» | Tiếp |
| ST-xem-truoc-tat-dinh | Xem trước | một dòng «Sửa tay lần này: <lý do>» | sửa tay như hôm nay |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- «Dùng» là một chạm, đúng đường gõ tay (`suaO`); gõ tay khác đề xuất thì chữ người thắng và đề xuất của ô tắt.
- Không ô nào đổi khi người chưa chạm; không có «Dùng mọi đề xuất».
- 375 px: lưới cuộn ngang như hôm nay; đề xuất xuống dòng trong ô; nút «Dùng» đủ vùng chạm 44 px.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `HuyHieuDau`, `Badge` info-light | dùng | cùng huy hiệu «Máy đề xuất» của hàng 68 |
| `Button` size sm | dùng | nút «Dùng» |
| `TrangThai` | dùng | dòng chờ và dòng «Sửa tay lần này» theo khuôn trang-thai |
| ô của `BangXemTruoc` | mở rộng | thêm khối đề xuất dưới ô nhập, không đổi lưới |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: wizard
Căn cứ: màn là «Luồng nhiều bước» của `KhungNhap` (design/patterns/nhap-excel.md, luật KH-nx-mot-luong); hàng này chỉ thêm
khối trong ô của bước Xem trước, không đổi khuôn — luồng hiển nhiên, không tra mẫu.
### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Đầu chủ (Trưởng nhóm nhập hộ) |
| Việc chính | sửa các ô máy chưa đọc được của tệp trước khi ghi vào Quỹ hàng |
| Tần suất | mỗi tuần |
| Số bản ghi | vài chục |
| Thiết bị | cả hai |
<!-- UX-SPEC-TEMPLATE>>> -->

## Ngoài phạm vi

- «Dùng mọi đề xuất» một chạm cho cả cột — hàng sau nếu đo thấy đầu chủ bấm «Dùng» hàng loạt.
- Học đề xuất đã dùng vào bộ nhớ mẫu khác luật hàng 67 đang có (trạng thái, phí đã đổi theo như gõ tay).
- Ô «Cần người» do luật cấp dòng (phí lệch giá, lệch danh mục, trùng mã căn) và ô của cột lớp nguồn — không gửi.
- Đổi khuôn bảng `ai_usage` để tách lần gọi ô lạ khỏi lần gọi đề xuất cột (cần migration, T3).
- Gọi thật Claude API trong bộ đo — bộ đo dùng đề xuất ghi sẵn như hàng 68.
</content>
</invoke>
