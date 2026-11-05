-- 036_man_lien_he.sql · Màn Liên hệ (hàng 103, ADR-0021 sửa đổi 05/11): mở số của một liên hệ ghi một sự kiện, và tìm liên hệ
-- theo dấu vết số. Bản mã và dấu vết của `contact_phones` không cấp cho vai API (016), nên hai việc này đi qua hàm. Người đọc
-- được đúng như luật `contacts_read`: người giữ còn vai Đầu chủ, hay trưởng nhóm (ADR-0021 qđ 3); hàm `security definer` bỏ
-- qua luật theo dòng nên tự lọc sàn đang làm và tự kiểm vai.

-- ---- Sự kiện mở số: chỉ thêm ----
create table contact_phone_reveals (
  company_id  uuid not null references companies (id) on delete cascade,
  id          uuid not null default gen_random_uuid(),
  contact_id  uuid not null,
  phone_id    uuid not null,
  revealed_by text not null,
  revealed_at timestamptz not null default now(),
  primary key (company_id, id),
  constraint contact_phone_reveals_contact_fkey foreign key (company_id, contact_id) references contacts (company_id, id) on delete cascade
);
create index contact_phone_reveals_contact_idx on contact_phone_reveals (company_id, contact_id, revealed_at);
alter table contact_phone_reveals enable row level security;
alter table contact_phone_reveals force row level security;
-- Đọc được sự kiện khi đọc được liên hệ (luật `contacts_read` áp qua exists).
create policy contact_phone_reveals_read on contact_phone_reveals for select using (
  company_id = app.current_company_id()
  and exists (select 1 from contacts c where c.company_id = contact_phone_reveals.company_id and c.id = contact_phone_reveals.contact_id)
);
grant select on contact_phone_reveals to quy_hang_app;

-- Người đang làm đọc được liên hệ này không — cùng biểu thức với `contacts_read`.
create or replace function app.contact_readable(p_company uuid, p_contact uuid) returns boolean
  language sql stable security definer set search_path = ''
  as $$
    select exists (
      select 1 from public.contacts x
      where x.company_id = p_company and x.id = p_contact
        and ('team_lead' = any (app.current_user_roles())
             or (x.owner_member_user_id = app.current_user_id() and 'listing_agent' = any (app.current_user_roles())))
    )
  $$;
revoke all on function app.contact_readable(uuid, uuid) from public;

-- Mở số: trả bản mã và ngữ cảnh để API giải; ghi một sự kiện. Không đọc được, hay số không thuộc liên hệ → rỗng, không ghi.
create or replace function app.contact_phone_for_reveal(p_contact uuid, p_phone uuid)
  returns table (phone_enc bytea, enc_context text)
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    san uuid := app.current_company_id();
    ai text := app.current_user_id();
  begin
    if san is null or ai is null or not app.contact_readable(san, p_contact) then
      return;
    end if;
    return query
      select p.phone_enc, p.enc_context from public.contact_phones p
      where p.company_id = san and p.contact_id = p_contact and p.id = p_phone;
    if found then
      insert into public.contact_phone_reveals (company_id, contact_id, phone_id, revealed_by) values (san, p_contact, p_phone, ai);
    end if;
  end
  $$;
revoke all on function app.contact_phone_for_reveal(uuid, uuid) from public;
grant execute on function app.contact_phone_for_reveal(uuid, uuid) to quy_hang_app;

-- Tìm theo dấu vết số trong sàn đang làm: liên hệ, người xem đọc được không, người giữ (mã người — tên do API đọc). Sàn khác
-- không bao giờ khớp vì dấu vết gồm mã sàn và hàm lọc sàn.
create or replace function app.contact_lookup_by_phone_hash(p_hash bytea)
  returns table (contact_id uuid, readable boolean, holder_user_id text)
  language sql stable security definer set search_path = ''
  as $$
    select c.id, app.contact_readable(c.company_id, c.id), c.owner_member_user_id
    from public.contact_phones p
    join public.contacts c on c.company_id = p.company_id and c.id = p.contact_id
    where p.company_id = app.current_company_id() and app.current_user_id() is not null and p.phone_hash = p_hash
  $$;
revoke all on function app.contact_lookup_by_phone_hash(bytea) from public;
grant execute on function app.contact_lookup_by_phone_hash(bytea) to quy_hang_app;

-- Số che của hồ sơ: bản mã từng số để API chỉ trả ba số cuối. Không phải mở số nên không ghi sự kiện; người không đọc được
-- liên hệ nhận rỗng.
create or replace function app.contact_phones_for_mask(p_contact uuid)
  returns table (phone_id uuid, label text, is_primary boolean, phone_enc bytea, enc_context text)
  language sql stable security definer set search_path = ''
  as $$
    select p.id, p.label, p.is_primary, p.phone_enc, p.enc_context
    from public.contact_phones p
    where p.company_id = app.current_company_id() and p.contact_id = p_contact
      and app.contact_readable(p.company_id, p_contact)
    order by p.is_primary desc, p.added_at
  $$;
revoke all on function app.contact_phones_for_mask(uuid) from public;
grant execute on function app.contact_phones_for_mask(uuid) to quy_hang_app;
