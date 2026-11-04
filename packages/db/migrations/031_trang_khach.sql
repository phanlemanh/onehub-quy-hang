-- Trang khách `/s/<mã>` (hàng 35): sự kiện của Lần gửi (khách mở link, khách quan tâm) và hai hàm theo mã link — đọc
-- công khai không phiên. Bất biến 1: bảng mới bật luật theo dòng; hàm theo mã lọc đúng một Lần gửi, không liệt kê, chỉ
-- trả sàn, người gửi, người nhận, cờ còn mở — không cột căn, không cột lớp `source`. Đọc căn sau đó chạy trong phiên của
-- chính người gửi (API), nên luật theo dòng của mọi bảng căn vẫn áp.

-- ---- Sự kiện của Lần gửi ----
create table share_events (
  company_id uuid not null references companies (id) on delete cascade,
  id         uuid not null default gen_random_uuid(),
  share_id   uuid not null,
  -- Tên sự kiện là hằng `SU_KIEN_LAN_GUI` của lõi (`packages/core/src/sharing/trang-khach.ts`) — số đo hàng 52 đọc theo.
  type       text not null check (type in ('link_opened', 'interest')),
  listing_id uuid,
  -- Mã máy ngẫu nhiên trang lưu ở máy khách: chặn trùng, không định danh người.
  visitor    text not null check (visitor ~ '^[A-Za-z0-9_-]{8,64}$'),
  day        date not null default (now() at time zone 'UTC')::date,
  created_at timestamptz not null default now(),
  primary key (company_id, id),
  constraint share_events_share_fkey foreign key (company_id, share_id) references shares (company_id, id) on delete cascade,
  constraint share_events_listing_fkey foreign key (company_id, share_id, listing_id)
    references share_listings (company_id, share_id, listing_id),
  -- Lượt mở thuộc cả Lần gửi; lượt quan tâm thuộc một căn của Lần gửi.
  constraint share_events_listing_by_type check ((type = 'interest') = (listing_id is not null))
);
-- Một máy một lượt mở mỗi ngày; một máy một lượt quan tâm mỗi căn.
create unique index share_events_open_once on share_events (company_id, share_id, visitor, day) where type = 'link_opened';
create unique index share_events_interest_once on share_events (company_id, share_id, listing_id, visitor) where type = 'interest';
create index share_events_share_idx on share_events (company_id, share_id, created_at);
alter table share_events enable row level security;
alter table share_events force row level security;
-- Ai đọc được Lần gửi thì đọc được sự kiện của nó (luật đọc của shares áp trong câu con).
create policy share_events_read on share_events for select using (
  company_id = app.current_company_id()
  and exists (select 1 from shares s where s.company_id = share_events.company_id and s.id = share_events.share_id)
);
grant select on share_events to quy_hang_app;

-- ---- Tìm Lần gửi theo mã ----
-- Không phiên: trả đúng một dòng hay không dòng nào. `active` sai khi link đã tắt hay người gửi không còn là thành viên
-- của sàn (Hỏi-6: coi như đã tắt).
create or replace function app.share_by_code(p_code text)
  returns table (company_id uuid, share_id uuid, sender_user_id text, audience text, active boolean)
  language sql stable security definer set search_path = ''
  as $$
    select s.company_id, s.id, s.sender_user_id, s.audience,
           s.disabled_at is null
             and exists (select 1 from public.company_members m where m.company_id = s.company_id and m.user_id = s.sender_user_id)
      from public.shares s
     where p_code ~ '^[A-Za-z0-9_-]{12}$' and s.code = p_code
  $$;
revoke all on function app.share_by_code(text) from public;
grant execute on function app.share_by_code(text) to quy_hang_app;

-- ---- Ghi một sự kiện theo mã ----
-- Trả true khi thêm, false khi trùng. Từ chối: Lần gửi không có hay không còn mở (P0002), type lạ hay thiếu căn (22023),
-- căn không thuộc Lần gửi hay không còn Đang bán (23514).
create or replace function app.record_share_event(p_code text, p_type text, p_listing uuid, p_visitor text) returns boolean
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    s record;
    n int;
  begin
    select * into s from app.share_by_code(p_code);
    if not found or not s.active then
      raise exception 'không có Lần gửi này' using errcode = 'P0002';
    end if;
    if p_type = 'link_opened' then
      if p_listing is not null then raise exception 'lượt mở không gắn căn' using errcode = '22023'; end if;
      insert into public.share_events (company_id, share_id, type, visitor)
        values (s.company_id, s.share_id, p_type, p_visitor)
        on conflict (company_id, share_id, visitor, day) where type = 'link_opened' do nothing;
    elsif p_type = 'interest' then
      if p_listing is null then raise exception 'quan tâm cần căn' using errcode = '22023'; end if;
      if not exists (
        select 1 from public.share_listings sl join public.listings l on l.company_id = sl.company_id and l.id = sl.listing_id
         where sl.company_id = s.company_id and sl.share_id = s.share_id and sl.listing_id = p_listing and l.standard_status = 'Active'
      ) then
        raise exception 'căn không quan tâm được' using errcode = '23514';
      end if;
      insert into public.share_events (company_id, share_id, type, listing_id, visitor)
        values (s.company_id, s.share_id, p_type, p_listing, p_visitor)
        on conflict (company_id, share_id, listing_id, visitor) where type = 'interest' do nothing;
    else
      raise exception 'loại sự kiện lạ' using errcode = '22023';
    end if;
    get diagnostics n = row_count;
    return n > 0;
  end
  $$;
revoke all on function app.record_share_event(text, text, uuid, text) from public;
grant execute on function app.record_share_event(text, text, uuid, text) to quy_hang_app;
