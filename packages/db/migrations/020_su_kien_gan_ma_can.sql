-- 020_su_kien_gan_ma_can.sql · Loại sự kiện «gắn mã căn» của hàng (ADR-0026, hàng dien-ma-can-cho-hang): hàng tạo khi mới
-- biết toà được gắn mã căn đúng một lần. Chỉ nới ràng buộc loại của listing_events (004) — giữ tên ràng buộc, loại lạ vẫn
-- bị chặn; không bảng mới, không cột mới (listings.unit_number đã có), luật cách ly không đổi.
alter table listing_events drop constraint listing_events_type_check;
alter table listing_events add constraint listing_events_type_check
  check (type in ('created', 'details_changed', 'price_changed', 'status_changed', 'owner_confirmed', 'unit_number_assigned'));
