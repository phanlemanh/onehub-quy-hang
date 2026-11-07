-- 039_cach_goi_rieng.sql · Cách gọi riêng (hàng 45, Tham chiếu §7 «sàn thêm nhãn, không thêm nghĩa»): sàn đặt tên hiện cho
-- trường chuẩn (sổ #18 `labels.field.<trường chuẩn>`) và cho giá trị chuẩn của tập đóng (sổ #37
-- `labels.value.<trường chuẩn>`). Check khoá của `company_settings` (011) chỉ nhận khoá hai đoạn chữ thường, nên hai họ khoá
-- ba đoạn mang tên trường RESO camelCase chưa lưu được. Nới check đúng hai họ ấy — mọi khoá khác vẫn hai đoạn như cũ. Dòng
-- nhãn đi chung luật theo dòng, quyền ghi chỉ quản trị sàn (011) và nhật ký chỉ thêm (026). Số 039 do giám sát cấp (B-15).
alter table company_settings drop constraint company_settings_key_check;
alter table company_settings
  add constraint company_settings_key_check
    check (key ~ '^[a-z][a-z_]*\.[a-z][a-z_]*$' or key ~ '^labels\.(field|value)\.[a-z][A-Za-z0-9]*$');
