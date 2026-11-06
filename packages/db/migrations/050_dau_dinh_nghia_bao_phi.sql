-- 050_dau_dinh_nghia_bao_phi.sql · Dấu định nghĩa bao phí trên mỗi giá (hàng 49 thue-phi; Tham chiếu §8 luật 13 «Mỗi giá
-- bao phí mang kèm định nghĩa bao phí của sàn lúc tính; đổi tỉ lệ chỉ áp cho lần tính mới»; sổ điểm #8–#11).
-- Mỗi sự kiện price_changed có feeInclusion = included nhận đúng một dòng dấu: khoản nào tính vào bao phí và tỉ lệ ba
-- khoản (phần vạn) theo cấu hình của chính sàn lúc giá vào máy chủ, computed_at = occurred_at của sự kiện (giờ máy chủ, kể
-- cả sự kiện làm lúc mất mạng đẩy lên sau). Đóng ở cơ sở dữ liệu nên mọi lối ghi giá — sửa trên ô, cuộc gọi, nhập file,
-- hoàn tác lần nhập, đồng bộ — đều mang dấu. Dấu chỉ thêm: vai API chỉ đọc; chỉ hàm trigger (security definer, vai chủ
-- bỏ qua luật theo dòng — xem 013) ghi.
--
-- Mặc định ở hàm dưới là bản sao có canh của sổ điểm ở lõi (packages/core/src/config/so.ts #8–#11): bài
-- «thuế phí: mặc định SQL bằng sổ điểm» (packages/core/src/fees/dinh-nghia.test.ts) đỏ khi hai bên lệch. Lõi vẫn là
-- nơi kiểm giá trị khi ghi cấu hình; hàm chỉ rơi về mặc định từng khoá khi dòng của sàn vắng hay sai khuôn, để một ô cấu
-- hình hỏng không làm hỏng lần ghi giá.

create table listing_price_fee_basis (
  company_id     uuid not null references companies (id) on delete cascade,
  listing_id     uuid not null,
  seq            integer not null,
  included_items text[] not null
    check (included_items <@ array['personalIncomeTax', 'registrationFee', 'brokerageFee']::text[]),
  rates          jsonb not null check (jsonb_typeof(rates) = 'object'),
  computed_at    timestamptz not null,
  -- Không khoá ngoại sang listing_events: khoá ngoại đổi lỗi «không truncate» của bảng sự kiện thành lỗi khoá ngoại
  -- (bài «sự kiện: không sửa, không xoá được»). Dấu chỉ do trigger dưới ghi, cùng khoá với sự kiện của nó.
  primary key (company_id, listing_id, seq)
);
alter table listing_price_fee_basis enable row level security;
alter table listing_price_fee_basis force row level security;
-- Đọc được dấu khi đọc được sự kiện giá của nó: luật đọc listing_events (vai Bảng hàng, migration 046) áp qua câu con.
create policy listing_price_fee_basis_read on listing_price_fee_basis for select using (
  company_id = app.current_company_id()
  and exists (
    select 1 from listing_events e
    where e.company_id = listing_price_fee_basis.company_id
      and e.listing_id = listing_price_fee_basis.listing_id
      and e.seq = listing_price_fee_basis.seq
  )
);
grant select on listing_price_fee_basis to quy_hang_app;

-- Định nghĩa bao phí đang áp của một sàn: {"included": [...], "rates": {"personalIncomeTax": 200, ...}}.
create or replace function app.dinh_nghia_phi_cua_san(p_company uuid) returns jsonb
  language plpgsql stable security definer set search_path = ''
  as $$
  declare
    v_inc   jsonb;
    v_pct   jsonb;
    v_items text[] := array['personalIncomeTax', 'registrationFee', 'brokerageFee'];
    v_rates jsonb := jsonb_build_object('personalIncomeTax', 200, 'registrationFee', 50, 'brokerageFee', 100);
    v_khoa  text;
    v_ma    text;
  begin
    select s.value into v_inc from public.company_settings s where s.company_id = p_company and s.key = 'fee.inclusion';
    if v_inc is not null and jsonb_typeof(v_inc) = 'array' and jsonb_array_length(v_inc) > 0
       and not exists (
         select 1 from jsonb_array_elements(v_inc) x
         where jsonb_typeof(x) <> 'string' or x #>> '{}' not in ('personalIncomeTax', 'registrationFee', 'brokerageFee')
       ) then
      select array_agg(m order by o) into v_items
      from unnest(array['personalIncomeTax', 'registrationFee', 'brokerageFee']) with ordinality as t(m, o)
      where v_inc ? m;
    end if;
    foreach v_khoa in array array['fee.personal_income_tax_pct', 'fee.registration_fee_pct', 'fee.brokerage_pct'] loop
      v_ma := case v_khoa
        when 'fee.personal_income_tax_pct' then 'personalIncomeTax'
        when 'fee.registration_fee_pct' then 'registrationFee'
        else 'brokerageFee'
      end;
      v_pct := null;
      select s.value into v_pct from public.company_settings s where s.company_id = p_company and s.key = v_khoa;
      if v_pct is not null and jsonb_typeof(v_pct) = 'number' and (v_pct #>> '{}')::numeric between 0 and 100 then
        v_rates := v_rates || jsonb_build_object(v_ma, round((v_pct #>> '{}')::numeric * 100)::int);
      end if;
    end loop;
    return jsonb_build_object('included', to_jsonb(v_items), 'rates', v_rates);
  end
  $$;
revoke all on function app.dinh_nghia_phi_cua_san(uuid) from public;

create or replace function app.dong_dau_phi() returns trigger
  language plpgsql security definer set search_path = ''
  as $$
  declare
    v jsonb;
  begin
    if new.type = 'price_changed' and new.payload ->> 'feeInclusion' = 'included' then
      v := app.dinh_nghia_phi_cua_san(new.company_id);
      insert into public.listing_price_fee_basis (company_id, listing_id, seq, included_items, rates, computed_at)
      values (
        new.company_id, new.listing_id, new.seq,
        array(select jsonb_array_elements_text(v -> 'included')), v -> 'rates', new.occurred_at
      );
    end if;
    return null;
  end
  $$;
revoke all on function app.dong_dau_phi() from public;

create trigger dong_dau_phi after insert on listing_events
  for each row execute function app.dong_dau_phi();

-- Giá bao phí ghi trước hàng 49: chưa sàn nào đặt được định nghĩa qua màn, mọi lần tính dùng mặc định sản phẩm (Hỏi-3,
-- Cổng Phạm vi 06/11) — điền mặc định với ngày tính là lúc ghi sự kiện. Chạy lại không thêm dòng.
create or replace function app.dien_dau_phi_cu() returns integer
  language plpgsql volatile security definer set search_path = ''
  as $$
  declare
    n integer;
  begin
    insert into public.listing_price_fee_basis (company_id, listing_id, seq, included_items, rates, computed_at)
    select e.company_id, e.listing_id, e.seq,
           array['personalIncomeTax', 'registrationFee', 'brokerageFee'],
           jsonb_build_object('personalIncomeTax', 200, 'registrationFee', 50, 'brokerageFee', 100),
           e.occurred_at
    from public.listing_events e
    where e.type = 'price_changed' and e.payload ->> 'feeInclusion' = 'included'
    on conflict (company_id, listing_id, seq) do nothing;
    get diagnostics n = row_count;
    return n;
  end
  $$;
revoke all on function app.dien_dau_phi_cu() from public;

select app.dien_dau_phi_cu();
