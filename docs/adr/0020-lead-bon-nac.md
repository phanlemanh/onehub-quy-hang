# ADR-0020: Lead bốn nấc — nấc suy từ dữ kiện, trả lại tới khi lên bảng, gửi lại là lead mới

Ngày: 2026-11-01 · Trạng thái: **accepted** (Manh Phan duyệt Cổng Phạm vi hồ sơ `lead-bon-nac` 01/11, Hỏi-1..4 theo
khuyến nghị; duyệt kế hoạch 01/11) · Liên quan: Tham chiếu §8 luật 20–21, §10, §11; ADR-0012 (ô nhận lead), ADR-0013 (mã
hoá số chủ), ADR-0017 (chia lead và hạn), ADR-0019 (cổng chọn khối); hàng 27 của lộ trình; hàng 17, 22 (hồ sơ căn, Hôm
nay của đầu chủ)

## Bối cảnh

Telesales gửi lead rồi không biết lead đi tới đâu. Tham chiếu §10 đặt «Lead đã nhập và bốn nấc» ở Hôm nay của telesales
(P0); §11 đo «Số ngày lead → Sẵn sàng bán». Đầu chủ gọi số sai không có lối nào báo lại; telesales không thấy lại số
(chốt 29/10) nên chỉ sửa được bằng cách nhập số mới. Chưa có lối nào gắn lead với hàng bằng mã.

## Quyết định

1. **Bốn nấc suy từ dữ kiện, không ghi cột nấc**: Đã gửi (nhập xong; chưa có người là «Chờ chia») → Đã nhận
   (`accepted_at`) → Đã gọi (`first_called_at`) → Lên bảng; trạng thái phụ Trả lại, Đã gửi lại, Tin bổ sung (lead căn
   trùng), Đã bỏ. Thứ tự quyết và nhãn ở một chỗ: `packages/core/src/dedupe/lead-stage.ts` (`leadStage`,
   `LEAD_STAGE_LABELS`). Bản trả cho telesales dựng ở lõi (`myLeadView`): không số chủ, không mã hàng.
2. **Lên bảng suy theo dấu vết số** (Hỏi-1): lead lên bảng lúc lần đầu một hàng mà chủ nhà mang cùng dấu vết số
   (`owner_phone_hash`) và đầu chủ hiện tại là đầu chủ của lead chuyển sang Sẵn sàng bán kể từ lúc nhập lead. Một định
   nghĩa ở `app.lead_board_at_all(sàn)` (không cấp cho vai API); telesales đọc mốc của lead mình qua
   `app.lead_board_dates`, chỉ mã lead và mốc giờ.
3. **Trả lại tới khi lên bảng** (Hỏi-4): đầu chủ của lead báo «Số không liên lạc được» qua `app.return_lead` /
   `POST /api/v1/leads/{id}/return`, kể cả sau khi đã ghi gọi lần đầu. Lead trả lại rời việc của đầu chủ: không là lead
   đang mở, không bị báo quá hạn, không neo chủ nhà cho đầu chủ ấy ở kiểm trùng và ở nhịp chia (năm hàm của hàng 24, 25,
   62 thêm điều kiện «chưa trả lại», migration 015).
4. **Gửi lại là lead mới** (Hỏi-2): «Sửa số và gửi lại» (`POST /api/v1/leads/{id}/resubmit`, thân chỉ `ownerPhone`) tạo
   lead mới chép năm mục của lead cũ với số mới qua đường ghi của hàng 24 — kiểm trùng, rồi chia theo cách chia của sàn,
   hạn tính lại. Lead cũ mang `resubmitted_lead_id` trỏ lead mới, cùng giao dịch; hai lần gửi lại cùng lúc chỉ một lần
   thành.
5. **Số đo «Số ngày lead → Sẵn sàng bán»** chạy bằng kết nối chủ, không qua API:
   `select * from app.lead_board_metric('<mã sàn>', '<từ>', '<đến>')` — mỗi lead lên bảng trong khoảng một dòng: mã lead,
   lúc nhập lead đầu chuỗi (đi ngược các lần gửi lại), lúc lên bảng, số ngày một chữ số lẻ.
6. **Màn**: Hôm nay của telesales là vùng «Lead đã nhập» theo khối `list-11` (lối ReUI chọn ở trang ba lối, ADR-0019);
   `/leads/mine` mở cùng vùng cho ai đã nhập lead. Nút «Trả lại» ở màn của đầu chủ là hàng 22.

## Hệ quả

- «Lên bảng» là suy luận: đầu chủ khác đưa cùng chủ nhà lên bảng, hay số chủ đổi trên hàng, thì lead không lên bảng. Sẽ
  chính xác hơn khi hàng 17/22 gắn lead với hàng bằng mã — đổi định nghĩa ở `app.lead_board_at_all` mà không đổi lối.
- Lead đã trả lại không lên bảng nữa kể cả khi đầu chủ có hàng cùng số; lần gửi lại mới tính.
- Trưởng nhóm giao lại hay đầu chủ ghi nhận trên lead đã trả lại vẫn không bị chặn ở cơ sở dữ liệu — nấc vẫn là «Trả lại».
