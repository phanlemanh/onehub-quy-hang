-- 047_trang_thai_rieng.sql · Trạng thái riêng (hàng 46, Tham chiếu §7 «sàn thêm nhãn, không thêm nghĩa»): sàn thêm nhãn
-- trạng thái riêng neo vào một trong sáu trạng thái chuẩn; đếm và luật vẫn theo trạng thái chuẩn. Định nghĩa nhãn nằm ở
-- `company_settings` khoá `labels.status.<mã>` (value {label, anchor}); căn mang mã ở cột mới `listings.status_label`, đặt
-- bằng sự kiện `status_changed {to, label}`. Check khoá của 039 chỉ mở `labels.field|value.<trường RESO camelCase>`, nên
-- họ khoá mới chưa lưu được: nới thêm đúng một vế cho `labels.status.<mã>`, giữ nguyên hai vế của 039. Khuôn mã nhãn
-- `^[a-z][a-z0-9_]{0,31}$` chép đúng hằng `MA_NHAN_RE` của lõi. Dòng nhãn đi chung luật theo dòng, quyền ghi chỉ quản trị
-- sàn (011) và nhật ký chỉ thêm (026). Số 047 do giám sát cấp (B-17).
alter table listings
  add column status_label text
    constraint listings_status_label_check check (status_label is null or status_label ~ '^[a-z][a-z0-9_]{0,31}$');
grant update (status_label) on listings to quy_hang_app;

alter table company_settings drop constraint company_settings_key_check;
alter table company_settings
  add constraint company_settings_key_check
    check (
      key ~ '^[a-z][a-z_]*\.[a-z][a-z_]*$'
      or key ~ '^labels\.(field|value)\.[a-z][A-Za-z0-9]*$'
      or key ~ '^labels\.status\.[a-z][a-z0-9_]{0,31}$'
    );
