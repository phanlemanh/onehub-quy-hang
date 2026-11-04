-- 030_lan_xuat.sql · Lần xuất bảng hàng (hàng 43 phat-hang, design §5): mỗi lần người chép bài hay tải file xong, máy chủ
-- ghi một dòng — người xuất, mẫu, người nhận, số căn, lúc xuất — để tính số đo «Số lần xuất bảng hàng» (Tham chiếu §11).
-- Không lưu nội dung đã xuất, không lưu danh sách căn. Không cột nào mang lớp nguồn; vai API chỉ thêm và đọc.

create table exports (
  company_id    uuid not null references companies (id) on delete cascade,
  id            uuid not null default gen_random_uuid(),
  user_id       text not null,
  format        text not null check (format in ('post_zalo', 'post_facebook', 'xlsx', 'png', 'pdf')),
  recipient     text not null check (recipient in ('khach_rieng', 'nhom_moi_gioi')),
  listing_count integer not null check (listing_count > 0),
  created_at    timestamptz not null default now(),
  primary key (company_id, id)
);
-- Số đo đọc theo kỳ trong một sàn.
create index exports_created_idx on exports (company_id, created_at);
alter table exports enable row level security;
alter table exports force row level security;
create policy exports_read on exports for select using (company_id = app.current_company_id());
-- Người ghi lần xuất là người đang làm — không ghi hộ người khác, không ghi vào sàn khác.
create policy exports_insert on exports for insert
  with check (company_id = app.current_company_id() and user_id = app.current_user_id());
-- Không update, không delete: lần xuất chỉ thêm.
grant select, insert on exports to quy_hang_app;
