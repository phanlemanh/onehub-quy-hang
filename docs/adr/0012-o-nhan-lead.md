# ADR-0012: Ô nhận lead — lead là bản ghi riêng, kiểm trùng lúc nhập

Ngày: 2026-10-31 · Trạng thái: **accepted** (Manh Phan duyệt Cổng Phạm vi hồ sơ `o-nhan-lead` 31/10, Hỏi-1..6 theo
khuyến nghị; duyệt kế hoạch 31/10) · Liên quan: Tham chiếu §3, §4, §8 luật 19–21, §13; ADR-0008, ADR-0010; hàng 24 của
lộ trình; hàng 12 (trục ai thấy hàng), 25 (chia lead), 62 (mã hoá số chủ)

## Bối cảnh

Luật 19–21: lead có năm mục bắt buộc; kiểm trùng lúc nhập — chủ nhà đã có đầu chủ thì về người đó, căn đã có hàng mở thì
thành tin bổ sung (vẫn cho «Bỏ lead này», có ghi lại), còn lại chia theo luật của sàn; telesales thấy kết quả của lead,
không thấy hàng. Tham chiếu §4 từng ghi «Lead là hàng ở nấc đầu», nhưng trục ai thấy hàng (hàng 12) cho người tạo hàng
đọc được hàng ấy — telesales tạo hàng thì thấy hàng.

## Quyết định

1. **Lead là một bản ghi riêng** (`leads`, migration 007) tới khi đầu chủ nhận; lead thành hàng khi đầu chủ nhận (hàng
   25), người tạo hàng khi ấy là đầu chủ (Hỏi-4).
2. **Năm mục**: số chủ (chuẩn hoá 10 chữ số), toà (`BuildingName`) bắt buộc và căn (`UnitNumber`) tuỳ chọn, nhu cầu
   Bán · Cho thuê · Cả hai (Hỏi-1), giá kèm điều kiện phí như lõi hàng, thời gian muốn ra hàng bốn nấc Ngay · Trong 1
   tháng · 1–3 tháng · Chưa định (Hỏi-2). Khuôn chặt ở `packages/core/src/dedupe`.
3. **Kiểm trùng hai lớp**: `app.lead_dedupe_facts` (security definer, chỉ trong sàn đang làm) chở hai dữ kiện — hàng mở
   trên căn cùng toà, cùng mã căn sau chuẩn hoá (kể cả hàng «Chỉ tôi» của người khác) và đầu chủ của hàng ấy; đầu chủ của
   chủ nhà mang số ấy (từ `listing_owners` hay lead trước đã về đầu chủ, chưa bỏ). Lõi quyết: căn trùng thắng chủ trùng;
   «hàng mở» là trạng thái còn lối chuyển (không phải Đã bán, Ngừng hẳn) — lõi truyền danh sách vào hàm. Lead trùng số
   với lead đang chờ chia ra «không trùng» tới hàng 25 (Hỏi-5).
4. **Telesales thấy kết quả, không thấy hàng**: bản trả dựng ở lõi (`leadResultView`) — kết quả, tên đầu chủ nhận
   (Hỏi-3), năm mục trừ số chủ. Vai API không có quyền đọc cột `leads.owner_phone`.
5. **«Bỏ lead này»** qua `app.discard_lead`: đúng người nhập, đúng lead căn trùng, một lần; ghi người và lúc vào dòng lead,
   dòng không xoá.
6. **Ai nhập**: vai có nút «+ Lead» ở bảng vai của lõi (telesales, đầu chủ, trưởng nhóm) — API và vỏ đọc cùng bảng.
7. **Phạm vi loại hình** (Hỏi-6): chỉ căn hộ (RESO `PropertyType` Residential · `PropertySubType` Condominium) thuộc một
   khu có danh mục (RESO `SubdivisionName`). Loại hình khác là nợ chặn triển khai — giám sát đưa vào lộ trình (yêu cầu
   L-4 của đợt `dau-chu-dong-vao`).

## Hệ quả

- Hàng 62 mã hoá số chủ thì mã hoá cả `leads.owner_phone` và đổi thân `app.lead_dedupe_facts` (so dấu vết số) — phép so
  số chỉ nằm ở hàm ấy.
- Hàng 25 thêm người nhận cho lead «không trùng» thì mở rộng vế «lead trước cùng số» của hàm dữ kiện.
- Gửi lead cần mạng: lead không vào hàng đợi ghi trên máy của bộ đồng bộ.
